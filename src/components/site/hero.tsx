import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight, PlayCircle, BadgeCheck, Users, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { heroStats } from "@/lib/demo-data";
import heroCampus from "@/assets/hero-campus.jpg";

const easeOut = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 46]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-background pt-32 pb-20 sm:pt-36 lg:pt-40 lg:pb-28"
    >
      {/* Atmosphere */}
      <div
        className="ambient-glow pointer-events-none absolute inset-0 animate-glow-drift"
        aria-hidden
      />
      <motion.div
        style={mounted ? { y: glowY } : undefined}
        suppressHydrationWarning
        className="pointer-events-none absolute -top-24 right-[-10%] size-[34rem] rounded-full bg-mint/50 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background/0"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        {/* Copy */}
        <div>
          <motion.div
            suppressHydrationWarning
            initial={mounted && !reduce ? { opacity: 0, y: 18 } : false}
            animate={mounted ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.6, ease: easeOut }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold-soft/60 px-3.5 py-1.5 text-xs font-semibold text-foreground">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-gold" />
              </span>
              A smarter future for academic identity
            </span>
          </motion.div>

          <motion.h1
            suppressHydrationWarning
            initial={mounted && !reduce ? { opacity: 0, y: 26 } : false}
            animate={mounted ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.75, delay: 0.12, ease: easeOut }}
            className="mt-6 font-display text-[2.7rem] font-semibold leading-[1.06] tracking-tight text-foreground sm:text-5xl lg:text-[3.6rem]"
          >
            Every Student.
            <br />
            One Trusted{" "}
            <span className="relative inline-block text-primary">
              Academic Identity
              <svg
                viewBox="0 0 300 12"
                className="absolute -bottom-1 left-0 w-full text-gold"
                fill="none"
                aria-hidden
              >
                <path
                  d="M3 8.5C60 3.5 150 2.5 297 7"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity="0.55"
                />
              </svg>
            </span>
            .
          </motion.h1>

          <motion.p
            suppressHydrationWarning
            initial={mounted && !reduce ? { opacity: 0, y: 22 } : false}
            animate={mounted ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.7, delay: 0.26, ease: easeOut }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            APAAR SmartVerify AI helps institutions organise student records, validate identifiers
            and enrolment data, and surface inconsistencies early — giving officials a clear,
            trustworthy view of every academic identity.
          </motion.p>

          <motion.div
            suppressHydrationWarning
            initial={mounted && !reduce ? { opacity: 0, y: 20 } : false}
            animate={mounted ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.7, delay: 0.4, ease: easeOut }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Button
              asChild
              size="lg"
              className="cta-sheen h-12 rounded-xl px-7 text-[15px] font-bold shadow-e3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-e4 active:translate-y-0 active:scale-[0.99]"
            >
              <Link to="/dashboard">
                Explore the platform
                <ArrowRight className="size-4.5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-xl border-border bg-card/70 px-6 text-[15px] font-semibold text-foreground shadow-e1 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-card hover:shadow-e2"
            >
              <a href="#how-it-works">
                <PlayCircle className="size-5 text-primary" />
                How it works
              </a>
            </Button>
          </motion.div>

          <motion.dl
            suppressHydrationWarning
            initial={mounted && !reduce ? { opacity: 0, y: 18 } : false}
            animate={mounted ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.7, delay: 0.55, ease: easeOut }}
            className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-6"
          >
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <dt className="order-2 mt-1 text-xs font-medium leading-snug text-muted-foreground">
                  {stat.label}
                </dt>
                <dd className="order-1 font-display text-2xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </dd>
              </div>
            ))}
          </motion.dl>
          <motion.p
            suppressHydrationWarning
            initial={mounted && !reduce ? { opacity: 0 } : false}
            animate={mounted ? { opacity: 1 } : undefined}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-3 text-xs text-muted-foreground/80"
          >
            Figures shown are illustrative sample data, not live government statistics.
          </motion.p>
        </div>

        {/* Visual composition */}
        <motion.div
          style={mounted ? { y: imageY } : undefined}
          suppressHydrationWarning
          initial={mounted && !reduce ? { opacity: 0, scale: 0.96, y: 30 } : false}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: easeOut }}
          className="relative mx-auto w-full max-w-xl lg:max-w-none"
        >
          <div className="relative">
            <div
              className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-mint/40 via-transparent to-gold/25 blur-2xl"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-[2rem] shadow-e4">
              <img
                src={heroCampus}
                alt="Students walking across an Indian university campus at golden hour"
                width={1600}
                height={1200}
                className="aspect-[4/3.4] w-full object-cover"
                fetchPriority="high"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-forest/45 via-transparent to-transparent"
                aria-hidden
              />
            </div>

            {/* Floating panel — verification status */}
            <motion.div
              suppressHydrationWarning
              className="glass absolute -right-3 top-8 w-52 rounded-2xl p-4 shadow-e3 sm:-right-6"
              animate={mounted && !reduce ? { y: [0, -9, 0] } : undefined}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-full bg-gold-soft text-foreground">
                  <BadgeCheck className="size-4.5 text-gold" />
                </span>
                <div>
                  <p className="text-[13px] font-bold text-foreground">Identity verified</p>
                  <p className="text-[11px] text-muted-foreground">APAAR ID 1••• •••• 4821</p>
                </div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-emerald to-gold" />
              </div>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Record completeness 92%
              </p>
            </motion.div>

            {/* Floating panel — enrolment stats */}
            <motion.div
              suppressHydrationWarning
              className="glass absolute -left-3 top-1/3 w-48 rounded-2xl p-4 shadow-e3 sm:-left-8"
              animate={mounted && !reduce ? { y: [0, 10, 0] } : undefined}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Enrolment
                </p>
                <Users className="size-4 text-primary" />
              </div>
              <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-foreground">
                12,418
              </p>
              <div className="mt-2 flex items-end gap-1" aria-hidden>
                {[34, 42, 38, 50, 46, 58, 64, 60, 72].map((h, i) => (
                  <span
                    key={i}
                    className="w-2 rounded-sm bg-emerald/70"
                    style={{ height: `${h * 0.42}px`, opacity: 0.45 + i * 0.06 }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Floating panel — mini analytics */}
            <motion.div
              suppressHydrationWarning
              className="glass absolute -bottom-6 right-8 w-56 rounded-2xl p-4 shadow-e3"
              animate={mounted && !reduce ? { y: [0, -7, 0] } : undefined}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Validation this week
                </p>
                <Activity className="size-4 text-primary" />
              </div>
              <svg viewBox="0 0 200 56" className="mt-2 h-14 w-full" aria-hidden>
                <defs>
                  <linearGradient id="heroSpark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-emerald)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--color-emerald)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 44 C 24 40, 36 30, 58 32 S 96 18, 118 22 156 8, 200 12 L200 56 L0 56 Z"
                  fill="url(#heroSpark)"
                />
                <path
                  d="M0 44 C 24 40, 36 30, 58 32 S 96 18, 118 22 156 8, 200 12"
                  fill="none"
                  stroke="var(--color-emerald)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="200" cy="12" r="3.5" fill="var(--color-gold)" />
              </svg>
              <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                <span className="text-foreground">1,712 approved</span> · illustrative
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
