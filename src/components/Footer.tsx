import { Facebook, Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="border-t border-border/60 bg-card/60 backdrop-blur-sm"
    >
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
            {[
              { icon: Facebook, label: "Facebook" },
              { icon: Instagram, label: "Instagram" },
              { icon: Youtube, label: "YouTube" },
            ].map(({ icon: Icon, label }) => (
              <motion.a
                key={label}
                href="#"
                aria-label={label}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-full border border-border/70 p-2 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/70"
              >
                <Icon className="h-4 w-4" />
              </motion.a>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-border/50 pt-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {year} Bangladesh InfoMap. All rights reserved.</p>
          <p>Built for interactive geography, culture, and regional knowledge.</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
