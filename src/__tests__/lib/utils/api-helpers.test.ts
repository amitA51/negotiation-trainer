/**
 * API Helpers Tests
 * Tests for timeout, retry, rate limiting, and error handling utilities
 */

import {
  withTimeout,
  TimeoutError,
  withRetry,
  rateLimit,
  APIError,
  handleAPIError,
  successResponse,
  errorResponse,
  getClientIP,
  getUserAgent,
  logAPICall,
} from '@/lib/utils/api-helpers'
import { NextResponse } from 'next/server'

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      body,
      status: init?.status || 200,
      headers: init?.headers || {},
    })),
  },
}))

describe('api-helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('withTimeout', () => {
    it('resolves when promise completes before timeout', async () => {
      const promise = Promise.resolve('success')
      const result = await withTimeout(promise, 1000)
      expect(result).toBe('success')
    })

    it('rejects with TimeoutError when promise takes too long', async () => {
      const slowPromise = new Promise((resolve) => {
        setTimeout(() => resolve('delayed'), 5000)
      })

      const timeoutPromise = withTimeout(slowPromise, 100, 'Custom timeout')

      // Advance timers to trigger timeout
      jest.advanceTimersByTime(150)

      await expect(timeoutPromise).rejects.toThrow(TimeoutError)
      await expect(timeoutPromise).rejects.toThrow('Custom timeout')
    })

    it('uses default error message', async () => {
      const slowPromise = new Promise((resolve) => {
        setTimeout(() => resolve('delayed'), 5000)
      })

      const timeoutPromise = withTimeout(slowPromise, 100)
      jest.advanceTimersByTime(150)

      await expect(timeoutPromise).rejects.toThrow('Operation timed out')
    })

    it('handles rejected promises correctly', async () => {
      const failingPromise = Promise.reject(new Error('Original error'))
      await expect(withTimeout(failingPromise, 1000)).rejects.toThrow('Original error')
    })
  })

  describe('TimeoutError', () => {
    it('is an instance of Error', () => {
      const error = new TimeoutError('Test timeout')
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(TimeoutError)
    })

    it('has correct name property', () => {
      const error = new TimeoutError('Test')
      expect(error.name).toBe('TimeoutError')
    })

    it('has correct message', () => {
      const error = new TimeoutError('Custom message')
      expect(error.message).toBe('Custom message')
    })
  })

  describe('withRetry', () => {
    it('returns result on first successful attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success')
      const result = await withRetry(fn, { maxAttempts: 3, initialDelay: 10 })
      
      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('retries on failure and eventually succeeds', async () => {
      jest.useRealTimers() // Need real timers for this test
      
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success')

      const result = await withRetry(fn, { 
        maxAttempts: 3, 
        initialDelay: 10,
        backoffMultiplier: 1,
      })

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('throws after exhausting max attempts', async () => {
      jest.useRealTimers()
      
      const fn = jest.fn().mockRejectedValue(new Error('Always fails'))

      await expect(
        withRetry(fn, { maxAttempts: 2, initialDelay: 10 })
      ).rejects.toThrow('Always fails')
      
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('respects shouldRetry predicate', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Non-retryable'))

      await expect(
        withRetry(fn, { 
          maxAttempts: 3, 
          shouldRetry: () => false 
        })
      ).rejects.toThrow('Non-retryable')

      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('uses default options when not provided', async () => {
      const fn = jest.fn().mockResolvedValue('ok')
      const result = await withRetry(fn)
      expect(result).toBe('ok')
    })
  })

  describe('rateLimit', () => {
    beforeEach(() => {
      // Clear rate limit map between tests by using unique identifiers
      jest.useRealTimers()
    })

    it('allows first request', () => {
      const id = `test-${Date.now()}-1`
      const result = rateLimit(id, { uniqueTokenPerInterval: 5, interval: 60000 })
      
      expect(result.success).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('tracks remaining requests', () => {
      const id = `test-${Date.now()}-2`
      const config = { uniqueTokenPerInterval: 3, interval: 60000 }

      const result1 = rateLimit(id, config)
      const result2 = rateLimit(id, config)
      const result3 = rateLimit(id, config)

      expect(result1.remaining).toBe(2)
      expect(result2.remaining).toBe(1)
      expect(result3.remaining).toBe(0)
    })

    it('blocks requests after limit exceeded', () => {
      const id = `test-${Date.now()}-3`
      const config = { uniqueTokenPerInterval: 2, interval: 60000 }

      rateLimit(id, config) // 1
      rateLimit(id, config) // 2
      const result = rateLimit(id, config) // 3 - should fail

      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('provides reset time', () => {
      const id = `test-${Date.now()}-4`
      const result = rateLimit(id, { uniqueTokenPerInterval: 5, interval: 60000 })
      
      expect(result.reset).toBeGreaterThan(Date.now())
    })

    it('uses default config values', () => {
      const id = `test-${Date.now()}-5`
      const result = rateLimit(id)
      
      expect(result.success).toBe(true)
      expect(result.remaining).toBe(9) // default is 10
    })
  })

  describe('APIError', () => {
    it('creates error with message and status code', () => {
      const error = new APIError('Not found', 404)
      
      expect(error.message).toBe('Not found')
      expect(error.statusCode).toBe(404)
      expect(error.name).toBe('APIError')
    })

    it('creates error with code', () => {
      const error = new APIError('Invalid', 400, 'INVALID_INPUT')
      expect(error.code).toBe('INVALID_INPUT')
    })

    it('uses default status code of 500', () => {
      const error = new APIError('Server error')
      expect(error.statusCode).toBe(500)
    })
  })

  describe('handleAPIError', () => {
    it('handles APIError', () => {
      const error = new APIError('Not found', 404, 'NOT_FOUND')
      handleAPIError(error)

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    })

    it('handles TimeoutError', () => {
      const error = new TimeoutError('Request timed out')
      handleAPIError(error)

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Request timeout', message: 'The operation took too long to complete' },
        { status: 504 }
      )
    })

    it('handles validation errors', () => {
      const error = new Error('Validation failed: Invalid email')
      handleAPIError(error)

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Validation error', message: 'Validation failed: Invalid email' },
        { status: 400 }
      )
    })

    it('handles unknown errors as 500', () => {
      handleAPIError(new Error('Unknown error'))

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Internal server error', message: 'An unexpected error occurred' },
        { status: 500 }
      )
    })

    it('handles non-Error objects', () => {
      handleAPIError({ random: 'object' })

      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Internal server error', message: 'An unexpected error occurred' },
        { status: 500 }
      )
    })
  })

  describe('successResponse', () => {
    it('returns success response with data', () => {
      successResponse({ id: 1, name: 'Test' })

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { id: 1, name: 'Test' },
        })
      )
    })

    it('includes optional message', () => {
      successResponse('data', 'Operation completed')

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: 'data',
          message: 'Operation completed',
        })
      )
    })

    it('includes timestamp', () => {
      successResponse({})

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
        })
      )
    })
  })

  describe('errorResponse', () => {
    it('returns error response', () => {
      errorResponse('Bad request', 400)

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Bad request',
        }),
        { status: 400 }
      )
    })

    it('includes optional message', () => {
      errorResponse('Error', 500, 'Something went wrong')

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Error',
          message: 'Something went wrong',
        }),
        { status: 500 }
      )
    })

    it('uses default status code of 400', () => {
      errorResponse('Invalid input')

      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.anything(),
        { status: 400 }
      )
    })
  })

  describe('getClientIP', () => {
    it('returns x-forwarded-for header', () => {
      const request = {
        headers: {
          get: jest.fn((name) => {
            if (name === 'x-forwarded-for') return '192.168.1.1, 10.0.0.1'
            return null
          }),
        },
      } as unknown as Request

      expect(getClientIP(request)).toBe('192.168.1.1')
    })

    it('returns x-real-ip when forwarded-for is not available', () => {
      const request = {
        headers: {
          get: jest.fn((name) => {
            if (name === 'x-real-ip') return '192.168.1.2'
            return null
          }),
        },
      } as unknown as Request

      expect(getClientIP(request)).toBe('192.168.1.2')
    })

    it('returns unknown when no headers available', () => {
      const request = {
        headers: {
          get: jest.fn(() => null),
        },
      } as unknown as Request

      expect(getClientIP(request)).toBe('unknown')
    })
  })

  describe('getUserAgent', () => {
    it('returns user-agent header', () => {
      const request = {
        headers: {
          get: jest.fn((name) => {
            if (name === 'user-agent') return 'Mozilla/5.0'
            return null
          }),
        },
      } as unknown as Request

      expect(getUserAgent(request)).toBe('Mozilla/5.0')
    })

    it('returns unknown when header not available', () => {
      const request = {
        headers: {
          get: jest.fn(() => null),
        },
      } as unknown as Request

      expect(getUserAgent(request)).toBe('unknown')
    })
  })

  describe('logAPICall', () => {
    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation()
      jest.spyOn(console, 'warn').mockImplementation()
      jest.spyOn(console, 'error').mockImplementation()
    })

    it('logs success for 2xx status codes', () => {
      logAPICall('/api/test', 'GET', 100, 200)
      expect(console.log).toHaveBeenCalledWith('[API Success]', expect.any(Object))
    })

    it('logs warning for 4xx status codes', () => {
      logAPICall('/api/test', 'POST', 50, 400)
      expect(console.warn).toHaveBeenCalledWith('[API Warning]', expect.any(Object))
    })

    it('logs error for 5xx status codes', () => {
      logAPICall('/api/test', 'PUT', 200, 500)
      expect(console.error).toHaveBeenCalledWith('[API Error]', expect.any(Object))
    })

    it('includes all log fields', () => {
      logAPICall('/api/users', 'DELETE', 150, 204)
      
      expect(console.log).toHaveBeenCalledWith(
        '[API Success]',
        expect.objectContaining({
          endpoint: '/api/users',
          method: 'DELETE',
          duration: '150ms',
          status: 204,
          timestamp: expect.any(String),
        })
      )
    })
  })
})
