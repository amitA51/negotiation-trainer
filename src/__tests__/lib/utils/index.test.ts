/**
 * Tests for utility functions (no Next.js dependencies)
 */

import { 
  cn, 
  formatDate, 
  formatRelativeTime, 
  formatDuration, 
  truncate, 
  delay,
  getDifficultyInfo,
  getScoreColor,
  getCategoryInfo,
  getAIModelName 
} from '@/lib/utils';

describe('cn (classnames)', () => {
  it('should merge class names', () => {
    const result = cn('base', 'extra');
    expect(result).toContain('base');
    expect(result).toContain('extra');
  });

  it('should handle conditional classes', () => {
    const result = cn('base', false && 'skip', 'extra');
    expect(result).toContain('base');
    expect(result).toContain('extra');
    expect(result).not.toContain('skip');
  });

  it('should handle tailwind conflicts', () => {
    const result = cn('p-2', 'p-4');
    expect(result).toBe('p-4');
  });
});

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15');
    const result = formatDate(date);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should handle string input', () => {
    const result = formatDate('2024-01-15');
    expect(typeof result).toBe('string');
  });
});

describe('formatRelativeTime', () => {
  it('should return "עכשיו" for very recent times', () => {
    const result = formatRelativeTime(new Date());
    expect(result).toBe('עכשיו');
  });

  it('should return minutes for recent times', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const result = formatRelativeTime(fiveMinutesAgo);
    expect(result).toContain('דקות');
  });
});

describe('formatDuration', () => {
  it('should format duration correctly', () => {
    expect(formatDuration(90)).toBe('1:30');
    expect(formatDuration(60)).toBe('1:00');
    expect(formatDuration(5)).toBe('0:05');
  });
});

describe('truncate', () => {
  it('should truncate long text', () => {
    const text = 'This is a very long text that should be truncated';
    const result = truncate(text, 20);
    expect(result.length).toBeLessThanOrEqual(20);
    expect(result.endsWith('...')).toBe(true);
  });

  it('should not truncate short text', () => {
    const text = 'Short';
    const result = truncate(text, 20);
    expect(result).toBe('Short');
  });
});

describe('delay', () => {
  it('should return a promise', () => {
    const result = delay(1);
    expect(result).toBeInstanceOf(Promise);
  });
});

describe('getDifficultyInfo', () => {
  it('should return info for valid difficulty levels', () => {
    for (let i = 1; i <= 8; i++) {
      const info = getDifficultyInfo(i);
      expect(info.name).toBeTruthy();
      expect(info.color).toBeTruthy();
      expect(info.description).toBeTruthy();
    }
  });

  it('should return default for invalid level', () => {
    const info = getDifficultyInfo(99);
    expect(info.name).toBe('מתחיל');
  });
});

describe('getScoreColor', () => {
  it('should return green for high scores', () => {
    expect(getScoreColor(80)).toContain('green');
    expect(getScoreColor(100)).toContain('green');
  });

  it('should return yellow for medium scores', () => {
    expect(getScoreColor(60)).toContain('yellow');
    expect(getScoreColor(79)).toContain('yellow');
  });

  it('should return orange for low-medium scores', () => {
    expect(getScoreColor(40)).toContain('orange');
  });

  it('should return red for low scores', () => {
    expect(getScoreColor(20)).toContain('red');
  });
});

describe('getCategoryInfo', () => {
  it('should return info for known categories', () => {
    const info = getCategoryInfo('tactical_empathy');
    expect(info.name).toBe('אמפתיה טקטית');
    expect(info.icon).toBe('Heart');
  });

  it('should return default for unknown category', () => {
    const info = getCategoryInfo('unknown_category');
    expect(info.name).toBe('unknown_category');
    expect(info.color).toContain('gray');
  });
});

describe('getAIModelName', () => {
  it('should return display names for models', () => {
    expect(getAIModelName('gemini-1.5-flash')).toBe('Gemini 1.5 Flash');
    expect(getAIModelName('gemini-1.5-pro')).toBe('Gemini 1.5 Pro');
    expect(getAIModelName('gemini-2.5-flash')).toBe('Gemini 2.5 Flash (New)');
  });
});
