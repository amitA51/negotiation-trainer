import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/Card'

describe('Card', () => {
  describe('rendering', () => {
    it('renders children correctly', () => {
      render(<Card>Card Content</Card>)
      expect(screen.getByText('Card Content')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = { current: null as HTMLDivElement | null }
      render(<Card ref={ref}>Content</Card>)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('variants', () => {
    it('renders default variant', () => {
      render(<Card data-testid="card">Default</Card>)
      const card = screen.getByTestId('card')
      expect(card.className).toContain('bg-[var(--bg-elevated)]')
      expect(card.className).toContain('border-[var(--border-subtle)]')
    })

    it('renders gold variant', () => {
      render(<Card variant="gold">Gold</Card>)
      const card = screen.getByText('Gold')
      expect(card.className).toContain('border-[var(--accent-dark)]')
    })

    it('renders glass variant', () => {
      render(<Card variant="glass">Glass</Card>)
      const card = screen.getByText('Glass')
      expect(card.className).toContain('backdrop-blur-xl')
    })
  })

  describe('hover effect', () => {
    it('includes hover styles by default', () => {
      render(<Card>Hoverable</Card>)
      const card = screen.getByText('Hoverable')
      expect(card.className).toContain('hover:bg-[var(--bg-hover)]')
    })

    it('excludes hover styles when hover is false', () => {
      render(<Card hover={false}>No Hover</Card>)
      const card = screen.getByText('No Hover')
      expect(card.className).not.toContain('hover:bg-[var(--bg-hover)]')
    })
  })

  describe('padding', () => {
    it('applies no padding when padding is none', () => {
      render(<Card padding="none">No Padding</Card>)
      const card = screen.getByText('No Padding')
      expect(card.className).not.toContain('p-')
    })

    it('applies small padding', () => {
      render(<Card padding="sm">Small</Card>)
      const card = screen.getByText('Small')
      expect(card.className).toContain('p-3')
    })

    it('applies medium padding by default', () => {
      render(<Card>Medium</Card>)
      const card = screen.getByText('Medium')
      expect(card.className).toContain('p-5')
    })

    it('applies large padding', () => {
      render(<Card padding="lg">Large</Card>)
      const card = screen.getByText('Large')
      expect(card.className).toContain('p-7')
    })
  })

  describe('custom className', () => {
    it('merges custom className', () => {
      render(<Card className="custom-card">Custom</Card>)
      const card = screen.getByText('Custom')
      expect(card.className).toContain('custom-card')
    })
  })

  describe('custom props', () => {
    it('passes additional props to div', () => {
      render(<Card data-testid="test-card">Props</Card>)
      expect(screen.getByTestId('test-card')).toBeInTheDocument()
    })

    it('handles onClick', () => {
      const onClick = jest.fn()
      render(<Card onClick={onClick}>Clickable</Card>)
      screen.getByText('Clickable').click()
      expect(onClick).toHaveBeenCalled()
    })
  })
})

describe('CardHeader', () => {
  it('renders children', () => {
    render(<CardHeader>Header Content</CardHeader>)
    expect(screen.getByText('Header Content')).toBeInTheDocument()
  })

  it('has margin-bottom styling', () => {
    render(<CardHeader>Header</CardHeader>)
    const header = screen.getByText('Header')
    expect(header.className).toContain('mb-4')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<CardHeader ref={ref}>Header</CardHeader>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('merges custom className', () => {
    render(<CardHeader className="custom-header">Header</CardHeader>)
    expect(screen.getByText('Header').className).toContain('custom-header')
  })
})

describe('CardTitle', () => {
  it('renders as h3', () => {
    render(<CardTitle>Title</CardTitle>)
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Title')
  })

  it('has correct text styling', () => {
    render(<CardTitle>Title</CardTitle>)
    const title = screen.getByText('Title')
    expect(title.className).toContain('text-lg')
    expect(title.className).toContain('font-semibold')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLHeadingElement | null }
    render(<CardTitle ref={ref}>Title</CardTitle>)
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement)
  })
})

describe('CardDescription', () => {
  it('renders as paragraph', () => {
    render(<CardDescription>Description text</CardDescription>)
    const description = screen.getByText('Description text')
    expect(description.tagName).toBe('P')
  })

  it('has correct styling', () => {
    render(<CardDescription>Description</CardDescription>)
    const desc = screen.getByText('Description')
    expect(desc.className).toContain('text-sm')
    expect(desc.className).toContain('text-[var(--text-secondary)]')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLParagraphElement | null }
    render(<CardDescription ref={ref}>Desc</CardDescription>)
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement)
  })
})

describe('CardContent', () => {
  it('renders children', () => {
    render(<CardContent>Main content here</CardContent>)
    expect(screen.getByText('Main content here')).toBeInTheDocument()
  })

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<CardContent ref={ref}>Content</CardContent>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('merges custom className', () => {
    render(<CardContent className="custom-content">Content</CardContent>)
    expect(screen.getByText('Content').className).toContain('custom-content')
  })
})

describe('CardFooter', () => {
  it('renders children', () => {
    render(<CardFooter>Footer actions</CardFooter>)
    expect(screen.getByText('Footer actions')).toBeInTheDocument()
  })

  it('has flex layout with gap', () => {
    render(<CardFooter>Footer</CardFooter>)
    const footer = screen.getByText('Footer')
    expect(footer.className).toContain('flex')
    expect(footer.className).toContain('items-center')
    expect(footer.className).toContain('gap-3')
  })

  it('has margin-top styling', () => {
    render(<CardFooter>Footer</CardFooter>)
    expect(screen.getByText('Footer').className).toContain('mt-4')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<CardFooter ref={ref}>Footer</CardFooter>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

describe('Card composition', () => {
  it('renders complete card with all sub-components', () => {
    render(
      <Card data-testid="full-card">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description goes here</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Main content area</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    )

    expect(screen.getByTestId('full-card')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Card Title' })).toBeInTheDocument()
    expect(screen.getByText('Card description goes here')).toBeInTheDocument()
    expect(screen.getByText('Main content area')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })
})
