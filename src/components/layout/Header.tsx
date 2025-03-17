
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on location change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'Dashboard', path: '/dashboard' },
    { title: 'History', path: '/history' },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 ease-out",
        isScrolled 
          ? "bg-white/80 backdrop-blur-md shadow-sm" 
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="h-8 w-8 rounded-full bg-primary transition-transform group-hover:scale-110">
              <div className="h-full w-full flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-primary-foreground transition-all duration-300 group-hover:scale-75" />
              </div>
            </div>
            <span className="font-medium text-xl tracking-tight">NeuraScan</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative py-2",
                  location.pathname === link.path
                    ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full"
                    : "text-foreground/80"
                )}
              >
                {link.title}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button
              asChild
              className="rounded-full px-6 py-1.5 font-medium transition-all hover:shadow-md"
            >
              <Link to="/dashboard">
                Upload Scan
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex flex-col space-y-1 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle Menu"
          >
            <span 
              className={cn(
                "h-0.5 w-6 bg-foreground rounded-full transition-transform duration-300",
                isMobileMenuOpen && "translate-y-1.5 rotate-45"
              )} 
            />
            <span 
              className={cn(
                "h-0.5 w-6 bg-foreground rounded-full transition-opacity duration-300",
                isMobileMenuOpen && "opacity-0"
              )} 
            />
            <span 
              className={cn(
                "h-0.5 w-6 bg-foreground rounded-full transition-transform duration-300",
                isMobileMenuOpen && "-translate-y-1.5 -rotate-45"
              )} 
            />
          </button>
        </div>

        {/* Mobile Navigation */}
        <div 
          className={cn(
            "md:hidden fixed inset-x-0 bg-white/95 backdrop-blur-sm shadow-md transition-all duration-300 ease-in-out",
            isMobileMenuOpen 
              ? "top-16 opacity-100" 
              : "-top-full opacity-0"
          )}
        >
          <div className="container py-6 px-6 flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "py-2 text-sm font-medium",
                  location.pathname === link.path
                    ? "text-primary"
                    : "text-foreground/80"
                )}
              >
                {link.title}
              </Link>
            ))}
            <Button
              asChild
              className="w-full mt-2 rounded-full font-medium"
            >
              <Link to="/dashboard">
                Upload Scan
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
