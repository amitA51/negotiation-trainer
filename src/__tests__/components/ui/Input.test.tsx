import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '@/components/ui/Input'
import { Search, Eye } from 'lucide-react'

describe('Input', () => {
  describe('rendering', () => {
    it('renders input element', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = { current: null as HTMLInputElement | null }
      render(<Input ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })

    it('renders with custom id', () => {
      render(<Input id="my-input" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('id', 'my-input')
    })

    it('generates unique id when not provided', () => {
      render(<Input label="Test Label" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('id')
    })
  })

  describe('label', () => {
    it('renders label when provided', () => {
      render(<Input label="Username" />)
      expect(screen.getByText('Username')).toBeInTheDocument()
    })

    it('associates label with input', () => {
      render(<Input label="Email" />)
      const label = screen.getByText('Email')
      const input = screen.getByRole('textbox')
      expect(label).toHaveAttribute('for', input.id)
    })

    it('does not render label when not provided', () => {
      render(<Input />)
      expect(screen.queryByRole('label')).not.toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('displays error message', () => {
      render(<Input error="This field is required" />)
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('sets aria-invalid when error exists', () => {
      render(<Input error="Error message" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    })

    it('associates error with input via aria-describedby', () => {
      render(<Input id="my-input" error="Error message" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'my-input-error')
    })

    it('error has role="alert" for screen readers', () => {
      render(<Input error="Error message" />)
      expect(screen.getByRole('alert')).toHaveTextContent('Error message')
    })

    it('applies error styling', () => {
      render(<Input error="Error" />)
      const input = screen.getByRole('textbox')
      expect(input.className).toContain('border-[var(--error)]')
    })
  })

  describe('hint', () => {
    it('displays hint when provided', () => {
      render(<Input hint="Enter your email address" />)
      expect(screen.getByText('Enter your email address')).toBeInTheDocument()
    })

    it('hides hint when error is present', () => {
      render(<Input hint="Hint text" error="Error text" />)
      expect(screen.queryByText('Hint text')).not.toBeInTheDocument()
      expect(screen.getByText('Error text')).toBeInTheDocument()
    })

    it('associates hint with input via aria-describedby', () => {
      render(<Input id="my-input" hint="Helpful hint" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'my-input-hint')
    })
  })

  describe('icon handling', () => {
    it('renders icon at start position', () => {
      render(<Input icon={<Search data-testid="search-icon" />} />)
      expect(screen.getByTestId('search-icon')).toBeInTheDocument()
    })

    it('renders icon at end position', () => {
      render(<Input icon={<Eye data-testid="eye-icon" />} iconPosition="end" />)
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument()
    })

    it('applies correct padding for start icon', () => {
      render(<Input icon={<Search />} iconPosition="start" />)
      const input = screen.getByRole('textbox')
      expect(input.className).toContain('pr-12')
    })

    it('applies correct padding for end icon', () => {
      render(<Input icon={<Eye />} iconPosition="end" />)
      const input = screen.getByRole('textbox')
      expect(input.className).toContain('pl-12')
    })

    it('hides icon from accessibility tree', () => {
      render(<Input icon={<Search data-testid="icon" />} />)
      const iconContainer = screen.getByTestId('icon').parentElement
      expect(iconContainer).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('input types', () => {
    it('renders text input by default', () => {
      render(<Input />)
      // When no type is specified, the input defaults to text and role is textbox
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders email input', () => {
      render(<Input type="email" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'email')
      expect(input).toHaveAttribute('spellCheck', 'false')
    })

    it('renders password input', () => {
      render(<Input type="password" />)
      const input = document.querySelector('input[type="password"]')
      expect(input).toBeInTheDocument()
    })
  })

  describe('disabled state', () => {
    it('disables input when disabled prop is true', () => {
      render(<Input disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('applies disabled styling', () => {
      render(<Input disabled />)
      const input = screen.getByRole('textbox')
      expect(input.className).toContain('disabled:opacity-50')
    })
  })

  describe('event handling', () => {
    it('calls onChange when value changes', () => {
      const onChange = jest.fn()
      render(<Input onChange={onChange} />)
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } })
      expect(onChange).toHaveBeenCalled()
    })

    it('calls onFocus when focused', () => {
      const onFocus = jest.fn()
      render(<Input onFocus={onFocus} />)
      fireEvent.focus(screen.getByRole('textbox'))
      expect(onFocus).toHaveBeenCalled()
    })

    it('calls onBlur when blurred', () => {
      const onBlur = jest.fn()
      render(<Input onBlur={onBlur} />)
      fireEvent.blur(screen.getByRole('textbox'))
      expect(onBlur).toHaveBeenCalled()
    })
  })

  describe('autoComplete', () => {
    it('sets autoComplete to off by default', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toHaveAttribute('autoComplete', 'off')
    })

    it('respects custom autoComplete value', () => {
      render(<Input autoComplete="email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('autoComplete', 'email')
    })
  })

  describe('custom className', () => {
    it('merges custom className with default classes', () => {
      render(<Input className="custom-input" />)
      const input = screen.getByRole('textbox')
      expect(input.className).toContain('custom-input')
    })
  })

  describe('placeholder', () => {
    it('renders placeholder text', () => {
      render(<Input placeholder="Enter text..." />)
      expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument()
    })
  })
})
