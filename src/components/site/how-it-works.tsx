import { CloudUpload, Fingerprint, ScanSearch, BarChart3, Info } from "lucide-react";
import { Eyebrow, Reveal, Stagger, StaggerItem } from "@/components/site/reveal";
import administration from "@/assets/administration.jpg";
import validationArt from "@/assets/validation-illustration.png";
import verificationArt from "@/assets/verification-illustration.png";
import monitoring from "@/assets/monitoring.jpg";

const steps = [
  {
    number: "01",
    icon: CloudUpload,
    title: "Institution uploads",
    description:
      "Student records enter the platform through a structured intake — enrolment data, identifiers and programme details arrive in one organised pipeline.",
    image: administration,
    alt: "Institution staff reviewing student enrolment records in an administrative office",
    tone: "bg-card",
  },
  {
    number: "02",
    icon: Fingerprint,
    title: "APAAR validation",
    description:
      "Identifiers and record completeness are checked automatically — format checks, field matching and enrolment context are validated before anything moves forward.",
    image: validationArt,
    alt: "Illustration of a student record document being cross-checked against databases",
    tone: "bg-mint/25",
  },
  {
    number: "03",
    icon: ScanSearch,
    title: "Intelligent verification",
    description:
      "The system surfaces duplicate candidates, inconsistencies and intake issues, and issues for review — so staff resolve problems with full context.",
    image: verificationArt,
    alt: "Illustration of duplicate student profile candidates being compared and flagged",
    tone: "bg-card",
  },
  {
    number: "04",
    icon: BarChart3,
    title: "AICTE monitoring",
    description:
      "Officials review institution-wide enrolment and analytics from a single monitoring view — comparisons, distributions and intake utilisation at a glance.",
    image: monitoring,
    alt: "Officials reviewing institution-wide enrolment analytics on a large monitoring screen",
    tone: "bg-mint/25",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative scroll-mt-24 bg-background py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-5 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-[2.6rem]">
            From intake to oversight, in four deliberate steps
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Each stage builds on the last — clean data in, verified identities out, and clear
            visibility for the institutions and officials in between.
          </p>
        </Reveal>

        <div className="relative mt-16">
          {/* Connector line — desktop */}
          <div className="absolute left-0 right-0 top-24 hidden h-px lg:block" aria-hidden>
            <div className="mx-auto h-px w-[86%] bg-gradient-to-r from-transparent via-emerald/40 to-transparent" />
          </div>

          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {steps.map((step, index) => (
              <StaggerItem key={step.number} className="relative">
                {/* Node */}
                <div className="relative z-10 mx-auto mb-5 grid size-11 place-items-center rounded-full border border-emerald/25 bg-background shadow-e2 lg:absolute lg:-top-[4.4rem] lg:left-1/2 lg:mb-0 lg:-translate-x-1/2">
                  <span className="grid size-7 place-items-center rounded-full bg-primary text-primary-foreground">
                    <step.icon className="size-3.5" />
                  </span>
                </div>

                <article
                  className={`group h-full rounded-3xl border border-border ${step.tone} p-2 shadow-e2 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-e3`}
                >
                  <div className="overflow-hidden rounded-2xl">
                    <img
                      src={step.image}
                      alt={step.alt}
                      loading="lazy"
                      width={1408}
                      height={1056}
                      className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-baseline gap-2.5">
                      <span className="font-display text-sm font-semibold text-gold">
                        {step.number}
                      </span>
                      <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <Reveal delay={0.15} className="mt-10">
          <div className="mx-auto flex max-w-3xl items-start gap-3 rounded-2xl border border-border bg-card/80 p-4 shadow-e1">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">What these steps check:</span> format
              checks, record matching and intake analysis are performed on the platform itself.
              Official identity verification against national registries requires authorized
              integration and is handled separately by the relevant authorities.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
