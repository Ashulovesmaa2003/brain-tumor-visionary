
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-background/80 backdrop-blur-sm py-12 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-full bg-primary">
                <div className="h-full w-full flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                </div>
              </div>
              <span className="font-medium text-lg">NeuraScan</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Advanced brain tumor classification using cutting-edge AI technology.
              A decision-support tool for doctors and radiologists.
            </p>
            <p className="text-xs text-muted-foreground/80">
              © {new Date().getFullYear()} NeuraScan. All rights reserved.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'Home', href: '/' },
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'History', href: '/history' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Resources</h4>
            <ul className="space-y-2">
              {[
                { label: 'Documentation', href: '#' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'Contact Support', href: '#' },
              ].map((link, idx) => (
                <li key={idx}>
                  <a 
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
