import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { Logo } from "@/components/site/navigation";
import graduation from "@/assets/graduation.jpg";

export function ClosingCta() {
  return (
    <section className="relative overflow-hidden bg-forest py-20 sm:py-24">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="grid overflow-hidden rounded-[2.5rem] border border-white/10 bg-canopy/40 shadow-e4 backdrop-blur-sm lg:grid-cols-[1.3fr_1fr]">
            <div className="p-8 sm:p-12 lg:p-14">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-mint">
                <span className="size-1.5 rounded-full bg-gold" aria-hidden />
                Ready when you are
              </span>
              <h2 className="mt-6 font-display text-4xl font-semibold tracking-tight text-canopy-foreground sm:text-[2.6rem]">
                Bring every academic identity into one trusted view
              </h2>
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-mint/70">
                Explore the platform with illustrative data, or talk to us about onboarding your
                institution and its records.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="cta-sheen h-12 rounded-xl px-7 text-[15px] font-bold shadow-e3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-e4"
                >
                  <Link to="/dashboard">
                    Open the dashboard
                    <ArrowRight className="size-4.5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-xl border-white/20 bg-transparent px-6 text-[15px] font-semibold text-canopy-foreground hover:bg-white/10"
                >
                  <a href="#how-it-works">How it works</a>
                </Button>
              </div>
            </div>
            <div className="relative min-h-56">
              <img
                src={graduation}
                alt="A graduate receiving their academic record at a convocation ceremony"
                loading="lazy"
                width={1408}
                height={1104}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-r from-forest via-forest/40 to-transparent lg:from-canopy/60"
                aria-hidden
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/10 bg-forest pb-10 pt-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo onDark />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-mint/60">
              APAAR SmartVerify AI helps institutions organise, validate and monitor student records
              — supporting trusted academic identity across Indian higher education.
            </p>
          </div>
          <nav aria-label="Platform links">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-mint/70">Platform</h3>
            <ul className="mt-4 space-y-2.5 text-sm font-medium">
              <li>
                <a
                  href="/#how-it-works"
                  className="text-canopy-foreground/85 transition-colors hover:text-gold"
                >
                  How it works
                </a>
              </li>
              <li>
                <a
                  href="/#platform"
                  className="text-canopy-foreground/85 transition-colors hover:text-gold"
                >
                  Academic identity
                </a>
              </li>
              <li>
                <a
                  href="/#monitoring"
                  className="text-canopy-foreground/85 transition-colors hover:text-gold"
                >
                  Analytics
                </a>
              </li>
              <li>
                <a
                  href="/#trust"
                  className="text-canopy-foreground/85 transition-colors hover:text-gold"
                >
                  Trust & security
                </a>
              </li>
            </ul>
          </nav>
          <nav aria-label="Get started links">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-mint/70">
              Get started
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm font-medium">
              <li>
                <Link
                  to="/dashboard"
                  className="text-canopy-foreground/85 transition-colors hover:text-gold"
                >
                  Explore the dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-canopy-foreground/85 transition-colors hover:text-gold"
                >
                  Sign in
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-xs leading-relaxed text-mint/45">
            Product demonstration. All figures, institutions and students shown are illustrative.
            APAAR and AICTE are referenced descriptively; no live government integration or
            authorization is claimed or implied.
          </p>
          <p className="mt-3 text-xs text-mint/45" suppressHydrationWarning>
            © {year} APAAR SmartVerify AI · Demonstration project
          </p>
        </div>
      </div>
    </footer>
  );
}
