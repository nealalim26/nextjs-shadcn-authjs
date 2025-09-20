import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('should render with default props', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('should render with different variants', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);

    let button = screen.getByRole('button', { name: /delete/i });
    expect(button).toHaveClass('bg-destructive', 'text-white');

    rerender(<Button variant="outline">Outline</Button>);
    button = screen.getByRole('button', { name: /outline/i });
    expect(button).toHaveClass('border', 'bg-background');

    rerender(<Button variant="secondary">Secondary</Button>);
    button = screen.getByRole('button', { name: /secondary/i });
    expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');

    rerender(<Button variant="ghost">Ghost</Button>);
    button = screen.getByRole('button', { name: /ghost/i });
    expect(button).toHaveClass('hover:bg-accent');

    rerender(<Button variant="link">Link</Button>);
    button = screen.getByRole('button', { name: /link/i });
    expect(button).toHaveClass('text-primary', 'underline-offset-4');
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);

    let button = screen.getByRole('button', { name: /small/i });
    expect(button).toHaveClass('h-8', 'rounded-md');

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole('button', { name: /large/i });
    expect(button).toHaveClass('h-10', 'rounded-md');

    rerender(<Button size="icon">Icon</Button>);
    button = screen.getByRole('button', { name: /icon/i });
    expect(button).toHaveClass('size-9');
  });

  it('should handle click events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);

    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
  });

  it('should accept custom className', () => {
    render(<Button className="custom-class">Custom</Button>);

    const button = screen.getByRole('button', { name: /custom/i });
    expect(button).toHaveClass('custom-class');
  });

  it('should render as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );

    const link = screen.getByRole('link', { name: /link button/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('should render with custom data attributes', () => {
    render(<Button data-testid="custom-button">Custom Button</Button>);

    const button = screen.getByTestId('custom-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Custom Button');
  });
});
