import { Facebook, Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-card/60 backdrop-blur-sm">
      <div className="container py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-heading text-lg font-bold tracking-tight text-foreground">Bangladesh InfoMap</p>
            <p className="mt-1 text-sm text-muted-foreground">Explore divisions, stories, and useful insights from across Bangladesh.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Link to="/" className="text-muted-foreground transition-colors hover:text-foreground">Map</Link>
            <Link to="/blog" className="text-muted-foreground transition-colors hover:text-foreground">Blog</Link>
            <Link to="/login" className="text-muted-foreground transition-colors hover:text-foreground">Admin</Link>
          </div>

          <div className="flex items-center gap-2">
            <a href="#" aria-label="Facebook" className="rounded-full border border-border/70 p-2 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/70">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Instagram" className="rounded-full border border-border/70 p-2 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/70">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label="YouTube" className="rounded-full border border-border/70 p-2 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/70">
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-border/50 pt-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {year} Bangladesh InfoMap. All rights reserved.</p>
          <p>Built for interactive geography, culture, and regional knowledge.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
