import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'
import { Heart, Trash } from 'lucide-react'

describe('Button', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('Click me')
    })

    it('renders with default props', () => {
      render(<Button>Default</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).not.toBeDisabled()
    })

    it('forwards ref correctly', () => {
      const ref = { current: null as HTMLButtonElement | null }
      render(<Button ref={ref}>Ref Button</Button>)
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })
  })

  describe('variants', () => {
    it('renders primary variant by default', () => {
      render(<Button>Primary</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('from-[var(--accent)]')
    })

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-[var(--bg-elevated)]')
    })

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-transparent')
    })

    it('renders danger variant', () => {
      render(<Button variant="danger">Danger</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-[var(--error)]')
    })
  })

  describe('sizes', () => {
    it('renders small size', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('px-3')
      expect(button.className).toContain('py-1.5')
    })

    it('renders medium size by default', () => {
      render(<Button>Medium</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('px-5')
      expect(button.className).toContain('py-2.5')
    })

    it('renders large size', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('px-7')
      expect(button.className).toContain('py-3.5')
    })
  })

  describe('loading state', () => {
    it('shows loading spinner when loading', () => {
      render(<Button loading>Loading</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-busy', 'true')
    })

    it('disables button when loading', () => {
      render(<Button loading>Loading</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('hides icon when loading', () => {
      render(<Button loading icon={<Heart data-testid="heart-icon" />}>With Icon</Button>)
      expect(screen.queryByTestId('heart-icon')).not.toBeInTheDocument()
    })
  })

  describe('disabled state', () => {
    it('disables button when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-disabled', 'true')
    })

    it('prevents click when disabled', () => {
      const onClick = jest.fn()
      render(<Button disabled onClick={onClick}>Disabled</Button>)
      const button = screen.getByRole('button')
      fireEvent.click(button)
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('icon handling', () => {
    it('renders icon at start position by default', () => {
      render(
        <Button icon={<Heart data-testid="heart-icon" />}>
          With Icon
        </Button>
      )
      expect(screen.getByTestId('heart-icon')).toBeInTheDocument()
    })

    it('renders icon at end position', () => {
      render(
        <Button icon={<Heart data-testid="heart-icon" />} iconPosition="end">
          With Icon End
        </Button>
      )
      expect(screen.getByTestId('heart-icon')).toBeInTheDocument()
    })

    it('provides default aria-label for icon-only buttons', () => {
      render(<Button icon={<Heart />} />)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label')
    })

    it('uses custom aria-label when provided', () => {
      render(<Button icon={<Trash />} aria-label="Delete item" />)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Delete item')
    })
  })

  describe('event handling', () => {
    it('calls onClick when clicked', () => {
      const onClick = jest.fn()
      render(<Button onClick={onClick}>Click</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when loading', () => {
      const onClick = jest.fn()
      render(<Button onClick={onClick} loading>Click</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('has correct focus styles', () => {
      render(<Button>Focus Me</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('focus-visible:ring-2')
    })

    it('sets aria-busy when loading', () => {
      render(<Button loading>Loading</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
    })

    it('sets aria-disabled when disabled', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('custom className', () => {
    it('merges custom className with default classes', () => {
      render(<Button className="custom-class">Custom</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('custom-class')
    })
  })
})
