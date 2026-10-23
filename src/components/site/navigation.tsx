import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Platform", href: "/#platform" },
  { label: "Analytics", href: "/#monitoring" },
  { label: "Trust & security", href: "/#trust" },
];

export function Logo({ onDark = false }: { onDark?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="APAAR SmartVerify AI home">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-e2 transition-transform duration-300 group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
          <path
            d="M12 3l7 2.8v5.1c0 4.4-2.9 8.2-7 9.6-4.1-1.4-7-5.2-7-9.6V5.8L12 3z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M9 11.8l2.1 2.1L15.2 9.8"
            stroke="var(--color-gold)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="leading-tight">
        <span
          className={cn(
            "block font-display text-[17px] font-semibold tracking-tight",
            onDark ? "text-canopy-foreground" : "text-foreground",
          )}
        >
          APAAR
        </span>
        <span
          className={cn(
            "block text-[10px] font-bold uppercase tracking-[0.22em]",
            onDark ? "text-mint/80" : "text-muted-foreground",
          )}
        >
          SmartVerify AI
        </span>
      </span>
    </Link>
  );
}

export function SiteNavigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 sm:top-5 sm:px-6" suppressHydrationWarning>
      <nav
        aria-label="Primary"
        suppressHydrationWarning
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl px-4 py-3 transition-all duration-500 sm:px-5",
          scrolled ? "glass shadow-e3" : "glass shadow-e1",
        )}
      >
        <Logo />

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex font-semibold">
            <Link to="/dashboard">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex font-semibold">
            <Link to="/dashboard">
              Explore the platform
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle navigation menu"
            className="grid size-9 place-items-center rounded-lg border border-border bg-background/60 lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="glass mx-auto mt-2 max-w-6xl rounded-2xl p-3 shadow-e3 lg:hidden"
          >
            <ul className="flex flex-col">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground/85 transition-colors hover:bg-secondary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="mt-2 flex gap-2 border-t border-border pt-3">
                <Button asChild variant="outline" className="flex-1 font-semibold">
                  <Link to="/dashboard" onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                <Button asChild className="flex-1 font-semibold">
                  <Link to="/dashboard" onClick={() => setOpen(false)}>
                    Explore
                  </Link>
                </Button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
