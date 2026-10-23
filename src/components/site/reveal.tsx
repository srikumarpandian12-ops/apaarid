import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/** Fade-and-rise scroll reveal, fires once, respects reduced motion and SSR hydration. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div
      className={className}
      suppressHydrationWarning
      initial={mounted && !reduce ? { opacity: 0, y } : false}
      whileInView={mounted ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Staggered container + item pair for entrance choreography. */
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div
      className={className}
      suppressHydrationWarning
      variants={mounted && !reduce ? staggerContainer : undefined}
      initial={mounted && !reduce ? "hidden" : false}
      whileInView={mounted && !reduce ? "show" : undefined}
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div
      className={className}
      suppressHydrationWarning
      variants={mounted && !reduce ? staggerItem : undefined}
      initial={mounted && !reduce ? "hidden" : false}
      whileInView={mounted && !reduce ? "show" : undefined}
    >
      {children}
    </motion.div>
  );
}

/** Animated counter that eases to its target when scrolled into view. */
export function Counter({
  to,
  suffix = "",
  duration = 1.6,
  className,
}: {
  to: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [value, setValue] = useState(to);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !inView) return;
    if (reduce) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [mounted, inView, to, duration, reduce]);

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {value.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

/** Small section heading eyebrow used across the site. */
export function Eyebrow({
  children,
  tone = "light",
  className,
}: {
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]",
        tone === "light"
          ? "border-gold/40 bg-gold-soft/60 text-foreground"
          : "border-white/15 bg-white/5 text-mint",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-gold" aria-hidden />
      {children}
    </span>
  );
}
