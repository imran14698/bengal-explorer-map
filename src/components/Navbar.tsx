import { Link, useLocation } from "react-router-dom";
import { MapPin, Sun, Moon, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader, SheetClose } from "@/components/ui/sheet";

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile sheet on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Map" },
    { path: "/blog", label: "Blog" },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "bg-card/60 backdrop-blur-2xl border-b border-border/40 shadow-lg shadow-primary/5"
          : "bg-transparent"
      )}
    >
      <div className="container flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30 transition-shadow group-hover:shadow-primary/50"
          >
            <MapPin className="h-4 w-4 text-primary-foreground" />
          </motion.div>
          <span className="font-heading text-base sm:text-lg font-bold tracking-tight text-foreground">
            Bangladesh InfoMap
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                isActive(path)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              {label}
              {isActive(path) && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          ))}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleLang}
            className="ml-2 flex h-9 items-center justify-center rounded-xl px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            aria-label="Toggle language"
            title={lang === "en" ? "Switch to Bangla" : "Switch to English"}
          >
            {lang === "en" ? "বাংলা" : "EN"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/60"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </motion.button>
        </nav>

        {/* Mobile burger */}
        <div className="flex md:hidden items-center gap-1">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/60"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-muted/60"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0">
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40">
                <SheetTitle className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <MapPin className="h-4 w-4 text-primary-foreground" />
                  </span>
                  <span className="font-heading text-base font-bold">Bangladesh InfoMap</span>
                </SheetTitle>
              </SheetHeader>

              <AnimatePresence>
                {mobileOpen && (
                  <>
                    <motion.nav
                      initial="hidden"
                      animate="visible"
                      className="flex flex-col p-4 gap-1"
                      variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
                      }}
                    >
                      {navItems.map(({ path, label }) => (
                        <motion.div
                          key={path}
                          variants={{
                            hidden: { opacity: 0, x: 24 },
                            visible: { opacity: 1, x: 0, transition: { duration: 0.28, ease: "easeOut" } },
                          }}
                        >
                          <SheetClose asChild>
                            <Link
                              to={path}
                              className={cn(
                                "block px-4 py-3 text-base font-medium rounded-lg transition-colors",
                                isActive(path)
                                  ? "bg-primary/10 text-primary"
                                  : "text-foreground hover:bg-muted/60"
                              )}
                            >
                              {label}
                            </Link>
                          </SheetClose>
                        </motion.div>
                      ))}
                    </motion.nav>

                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + navItems.length * 0.06, duration: 0.3 }}
                      className="px-4 mt-2 pt-4 border-t border-border/40"
                    >
                      <button
                        onClick={toggleLang}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
                      >
                        <span>Language</span>
                        <span className="text-xs font-semibold text-primary">
                          {lang === "en" ? "EN → বাংলা" : "বাংলা → EN"}
                        </span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
