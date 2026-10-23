import { useEffect, useState } from "react";
import {
  BadgeCheck,
  ShieldCheck,
  KeyRound,
  ScrollText,
  FileCheck2,
  Lock,
  TriangleAlert,
  Gauge,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Eyebrow, Reveal, Stagger, StaggerItem } from "@/components/site/reveal";
import {
  institutionComparison,
  intakeUtilization,
  statusChartColors,
  statusDistribution,
} from "@/lib/demo-data";
import studentsLibrary from "@/assets/students-library.jpg";
import dataNetwork from "@/assets/data-network.jpg";

/* ------------------------------------------------------------------ */
/* Academic identity — split layout                                    */
/* ------------------------------------------------------------------ */

function IdentityRecordCard() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div
        className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-mint/50 to-gold/20 blur-xl"
        aria-hidden
      />
      <div className="relative rounded-3xl border border-border bg-card p-6 shadow-e3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Academic identity record
          </span>
          <span className="rounded-full border border-gold/50 bg-gold-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground">
            Verified
          </span>
        </div>
        <div className="mt-5 flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-2xl bg-secondary font-display text-xl font-semibold text-primary">
            AM
          </span>
          <div>
            <p className="font-display text-lg font-semibold tracking-tight text-foreground">
              Ananya Menon
            </p>
            <p className="text-sm text-muted-foreground">B.Tech Computer Science</p>
          </div>
        </div>
        <dl className="mt-6 space-y-3 text-sm">
          {[
            ["APAAR ID", "1••• •••• 4821"],
            ["Institution", "Aravalli Institute of Technology"],
            ["Enrolment", "2025 intake · regular"],
            ["Record status", "Complete · cross-checked"],
          ].map(([term, value]) => (
            <div
              key={term}
              className="flex items-center justify-between gap-4 border-b border-dashed border-border pb-3 last:border-0 last:pb-0"
            >
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {term}
              </dt>
              <dd className="text-right font-semibold text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex items-center gap-2 rounded-xl bg-secondary px-3.5 py-2.5">
          <BadgeCheck className="size-4 shrink-0 text-gold" />
          <p className="text-xs font-medium text-muted-foreground">
            Validated on the platform · sample record for illustration
          </p>
        </div>
      </div>
    </div>
  );
}

export function AcademicIdentity() {
  return (
    <section id="platform" className="scroll-mt-24 bg-mint/20 py-24 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12">
        <Reveal>
          <div className="relative">
            <div
              className="absolute -inset-3 rounded-[2.2rem] bg-gradient-to-tr from-emerald/20 to-transparent blur-lg"
              aria-hidden
            />
            <img
              src={studentsLibrary}
              alt="Students collaborating over a laptop in a bright campus library"
              loading="lazy"
              width={1408}
              height={1056}
              className="relative aspect-[4/3] w-full rounded-[2rem] object-cover shadow-e3"
            />
          </div>
        </Reveal>
        <div>
          <Reveal>
            <Eyebrow>Academic identity</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-[2.6rem]">
              One record, kept whole and current
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Every student's enrolment details, identifiers and programme context live in a single
              structured record — complete, consistent and ready for validation, review and
              reporting.
            </p>
            <ul className="mt-7 space-y-3.5">
              {[
                "Structured fields that catch gaps at intake, not at audit",
                "Identifiers formatted and cross-matched automatically",
                "A single source of truth shared with institutions and officials",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <FileCheck2 className="size-3.5" />
                  </span>
                  <span className="text-[15px] font-medium leading-relaxed text-foreground/90">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.15} className="mt-10">
            <IdentityRecordCard />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Intelligent validation — dark forest section                        */
/* ------------------------------------------------------------------ */

function FloatingAlertPanel() {
  return (
    <div className="glass-dark w-full max-w-sm rounded-2xl p-5 shadow-e4">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-full bg-destructive/20 text-destructive-foreground">
          <TriangleAlert className="size-4" />
        </span>
        <div>
          <p className="text-[13px] font-bold text-canopy-foreground">
            Duplicate candidate detected
          </p>
          <p className="text-[11px] text-mint/70">2 similar records · intake 2026</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {[
          ["K. Sharma · B.Tech CS", "98% match"],
          ["K. Sharma · B.Sc DS", "94% match"],
        ].map(([name, match]) => (
          <div
            key={name}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs"
          >
            <span className="font-semibold text-canopy-foreground">{name}</span>
            <span className="font-bold text-gold">{match}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-mint/60">
        Sample alert · illustrative data
      </p>
    </div>
  );
}

function IntakeIndicatorPanel() {
  return (
    <div className="glass-dark w-full max-w-sm rounded-2xl p-5 shadow-e4">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 place-items-center rounded-full bg-mint/15 text-mint">
          <Gauge className="size-4" />
        </span>
        <p className="text-[13px] font-bold text-canopy-foreground">Intake utilisation</p>
      </div>
      <div className="mt-4 space-y-3">
        {intakeUtilization.slice(0, 3).map((row) => (
          <div key={row.program}>
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="text-canopy-foreground/90">{row.program}</span>
              <span className="text-mint/80">{row.utilised}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald to-gold"
                style={{ width: `${row.utilised}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-mint/60">
        Illustrative sample data
      </p>
    </div>
  );
}

export function IntelligentValidation() {
  return (
    <section className="relative overflow-hidden bg-forest py-24 sm:py-28">
      <img
        src={dataNetwork}
        alt=""
        aria-hidden
        loading="lazy"
        width={1600}
        height={1008}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30"
      />
      <div className="dot-texture pointer-events-none absolute inset-0 opacity-30" aria-hidden />
      <div
        className="pointer-events-none absolute -left-32 top-1/4 size-[28rem] rounded-full bg-emerald/25 blur-[140px]"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12">
        <div>
          <Reveal>
            <Eyebrow tone="dark">Intelligent validation</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-semibold tracking-tight text-canopy-foreground sm:text-[2.6rem]">
              The platform reads the fine print, before anyone has to
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-mint/75">
              Validation runs continuously across incoming records — flagging duplicate candidates,
              inconsistent fields and intake anomalies as review-ready cases, not silent errors.
            </p>
          </Reveal>
          <Stagger className="mt-9 grid gap-4 sm:grid-cols-2">
            {[
              [
                "Duplicate detection",
                "Similar candidates surface with match confidence for review.",
              ],
              [
                "Inconsistency flags",
                "Mismatched fields and impossible combinations are highlighted.",
              ],
              ["Intake indicators", "Enrolment pressure and utilisation visible per programme."],
              ["Review-first design", "Nothing is auto-rejected — staff decide with full context."],
            ].map(([title, copy]) => (
              <StaggerItem
                key={title}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-colors duration-300 hover:bg-white/10"
              >
                <h3 className="text-sm font-bold text-canopy-foreground">{title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-mint/70">{copy}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <div className="flex flex-col items-center gap-6">
          <Reveal delay={0.1} className="w-full max-w-sm">
            <FloatingAlertPanel />
          </Reveal>
          <Reveal delay={0.25} className="w-full max-w-sm sm:translate-x-10">
            <IntakeIndicatorPanel />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Real-time monitoring — analytics composition                        */
/* ------------------------------------------------------------------ */

function ChartTooltipHint() {
  return null;
}

export function MonitoringSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section id="monitoring" className="scroll-mt-24 bg-background py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Real-time monitoring</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-[2.6rem]">
            Enrolment clarity, institution by institution
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Approved versus actual enrolment, validation status distribution and intake utilisation
            — composed into one calm, readable view.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {/* Approved vs actual */}
          <Reveal className="lg:col-span-2">
            <figure className="h-full rounded-3xl border border-border bg-card p-6 shadow-e2 transition-shadow duration-500 hover:shadow-e3">
              <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                  Approved vs actual enrolment
                </h3>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Current period
                </span>
              </figcaption>
              <div className="mt-5 h-64">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={institutionComparison} barGap={6}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="var(--color-border)"
                      />
                      <XAxis
                        dataKey="institution"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                        width={40}
                      />
                      <Tooltip
                        cursor={{ fill: "var(--color-muted)", opacity: 0.5 }}
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid var(--color-border)",
                          boxShadow: "var(--elevation-3)",
                          fontSize: 13,
                        }}
                      />
                      <Bar
                        dataKey="approved"
                        name="Approved"
                        fill="var(--color-emerald)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={34}
                      />
                      <Bar
                        dataKey="actual"
                        name="Actual"
                        fill="var(--color-gold)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={34}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="size-full rounded-2xl bg-secondary/40 animate-pulse" />
                )}
              </div>
              <p className="mt-3 text-xs text-muted-foreground/80">
                Illustrative sample data · not live government figures
              </p>
            </figure>
          </Reveal>

          {/* Status distribution */}
          <Reveal delay={0.12}>
            <figure className="h-full rounded-3xl border border-border bg-card p-6 shadow-e2 transition-shadow duration-500 hover:shadow-e3">
              <figcaption>
                <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                  Validation status
                </h3>
              </figcaption>
              <div className="mt-2 h-44">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={54}
                        outerRadius={82}
                        paddingAngle={3}
                        strokeWidth={0}
                        isAnimationActive
                      >
                        {statusDistribution.map((entry) => (
                          <Cell key={entry.key} fill={statusChartColors[entry.key]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid var(--color-border)",
                          boxShadow: "var(--elevation-3)",
                          fontSize: 13,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="size-full rounded-2xl bg-secondary/40 animate-pulse" />
                )}
              </div>
              <ul className="mt-3 space-y-2">
                {statusDistribution.map((entry) => (
                  <li key={entry.key} className="flex items-center justify-between text-[13px]">
                    <span className="flex items-center gap-2 font-medium text-foreground/90">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ background: statusChartColors[entry.key] }}
                        aria-hidden
                      />
                      {entry.name}
                    </span>
                    <span className="font-bold text-foreground">
                      {entry.value.toLocaleString("en-IN")}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground/80">Illustrative sample data</p>
            </figure>
          </Reveal>
        </div>

        {/* Intake utilisation strip */}
        <Reveal delay={0.1} className="mt-6">
          <figure className="rounded-3xl border border-border bg-card p-6 shadow-e2">
            <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                Intake utilisation by programme
              </h3>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Approved seats in use
              </span>
            </figcaption>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {intakeUtilization.map((row) => (
                <div key={row.program}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-foreground">{row.program}</span>
                    <span className="font-display text-xl font-semibold text-primary">
                      {row.utilised}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald to-gold transition-[width] duration-1000"
                      style={{ width: `${row.utilised}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground/80">Illustrative sample data</p>
          </figure>
        </Reveal>
      </div>
      <ChartTooltipHint />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Secure verification                                                 */
/* ------------------------------------------------------------------ */

function QRConcept() {
  const cells: boolean[] = [];
  let seed = 7;
  for (let i = 0; i < 100; i++) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    cells.push(seed % 3 !== 0);
  }
  return (
    <svg viewBox="0 0 10 10" className="size-20 text-foreground" aria-hidden>
      {cells.map((on, i) =>
        on ? (
          <rect
            key={i}
            x={i % 10}
            y={Math.floor(i / 10)}
            width="1"
            height="1"
            fill="currentColor"
            opacity={0.85}
          />
        ) : null,
      )}
      <rect x="0" y="0" width="3" height="3" fill="none" stroke="currentColor" strokeWidth="0.4" />
      <rect x="7" y="0" width="3" height="3" fill="none" stroke="currentColor" strokeWidth="0.4" />
      <rect x="0" y="7" width="3" height="3" fill="none" stroke="currentColor" strokeWidth="0.4" />
    </svg>
  );
}

export function SecureVerification() {
  return (
    <section className="bg-mint/20 py-24 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12">
        <div className="order-2 lg:order-1">
          <Reveal>
            <Eyebrow>Secure verification</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-[2.6rem]">
              Verified identity, shared only with the right people
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              A verification card consolidates each student's validated record. Access is scoped by
              role — institutions see their own students, officials see what their mandate covers,
              and every view is recorded.
            </p>
            <ul className="mt-7 space-y-3.5">
              {[
                ["Role-scoped access", "Permissions follow responsibility, not curiosity."],
                ["Shareable proof", "A scoped summary can be shared with a verifiable reference."],
                [
                  "Authorized integration",
                  "Registry-level identity confirmation happens only through authorized channels.",
                ],
              ].map(([title, copy]) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <ShieldCheck className="size-3.5" />
                  </span>
                  <div>
                    <p className="text-[15px] font-bold text-foreground">{title}</p>
                    <p className="text-sm text-muted-foreground">{copy}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="order-1 lg:order-2">
          <div className="relative mx-auto w-full max-w-md">
            <div
              className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-gold/25 to-mint/40 blur-xl"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-3xl border border-border bg-forest p-6 shadow-e4">
              <div
                className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-emerald/30 blur-3xl"
                aria-hidden
              />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mint/70">
                    Verification card
                  </p>
                  <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-canopy-foreground">
                    Ananya Menon
                  </p>
                  <p className="text-sm text-mint/70">B.Tech CS · 2025 intake</p>
                </div>
                <div className="rounded-2xl bg-canopy-foreground p-2.5 shadow-e2">
                  <QRConcept />
                </div>
              </div>
              <div className="relative mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-mint/60">
                    APAAR ID
                  </p>
                  <p className="font-mono text-sm font-bold tracking-wider text-canopy-foreground">
                    1••• •••• 4821
                  </p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-gold-soft px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-foreground">
                  <BadgeCheck className="size-3.5 text-gold" />
                  Verified
                </span>
              </div>
              <p className="relative mt-4 text-[10px] font-semibold uppercase tracking-wider text-mint/50">
                Sample card · identifiers masked for illustration
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Trust & security — editorial grid                                   */
/* ------------------------------------------------------------------ */

const trustPillars = [
  {
    icon: KeyRound,
    title: "Access control",
    copy: "Every account works within an explicit role. Views, actions and exports are scoped before the first query runs.",
  },
  {
    icon: ScrollText,
    title: "Audit trails",
    copy: "Reviews, edits and approvals are recorded as an append-only trail, so decisions can always be retraced.",
  },
  {
    icon: FileCheck2,
    title: "Consent",
    copy: "Student data is handled on the basis of institutional responsibility and applicable consent requirements.",
  },
  {
    icon: Lock,
    title: "Data protection",
    copy: "Identifiers are masked in lists and reports; sensitive fields are exposed only where a role requires them.",
  },
];

export function TrustSecurity() {
  return (
    <section id="trust" className="scroll-mt-24 bg-background py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.4fr] lg:gap-16">
          <Reveal>
            <Eyebrow>Trust & security</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-[2.6rem]">
              Built for responsibility, not just compliance theatre
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Handling academic identity is a duty of care. The platform is designed around clear
              roles, traceable decisions and careful treatment of personal data.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground/80">
              This page describes platform design principles. No specific certification or live
              government integration is claimed; details are confirmed with institutions during
              onboarding.
            </p>
          </Reveal>

          <Stagger className="grid gap-5 sm:grid-cols-2">
            {trustPillars.map((pillar) => (
              <StaggerItem key={pillar.title}>
                <article className="group h-full rounded-3xl border border-border bg-card p-6 shadow-e2 transition-all duration-500 hover:-translate-y-1 hover:shadow-e3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-primary transition-colors duration-500 group-hover:bg-primary group-hover:text-primary-foreground">
                    <pillar.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-foreground">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {pillar.copy}
                  </p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
