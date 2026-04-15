import { Link, useLocation } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-card/70 backdrop-blur-xl border-b border-border/50 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/25 transition-transform group-hover:scale-105">
            <MapPin className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-heading text-lg font-bold tracking-tight text-foreground">
            Bangladesh InfoMap
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {[
            { path: "/", label: "Map" },
            { path: "/blog", label: "Blog" },
          ].map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                isActive(path)
                  ? "text-primary bg-primary/8"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              {label}
              {isActive(path) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-primary" />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
