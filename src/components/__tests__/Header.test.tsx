import { render, screen } from '@testing-library/react';
import Header from '../Header';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('Header Component', () => {
  it('renders the logo', () => {
    render(<Header />);
    const logo = screen.getByText('SoftDev Solutions');
    expect(logo).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Header />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders Get Started button', () => {
    render(<Header />);
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('has correct links', () => {
    render(<Header />);
    const homeLink = screen.getByText('Home').closest('a');
    const servicesLink = screen.getByText('Services').closest('a');
    const contactLink = screen.getByText('Contact').closest('a');

    expect(homeLink).toHaveAttribute('href', '/');
    expect(servicesLink).toHaveAttribute('href', '/services');
    expect(contactLink).toHaveAttribute('href', '/contact');
  });
});

