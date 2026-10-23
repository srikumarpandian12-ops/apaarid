import { createFileRoute } from "@tanstack/react-router";

import { SiteNavigation } from "@/components/site/navigation";
import { Hero } from "@/components/site/hero";
import { HowItWorks } from "@/components/site/how-it-works";
import {
  AcademicIdentity,
  IntelligentValidation,
  MonitoringSection,
  SecureVerification,
  TrustSecurity,
} from "@/components/site/sections";
import { ClosingCta, SiteFooter } from "@/components/site/footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "APAAR SmartVerify AI — Every student, one trusted academic identity",
      },
      {
        name: "description",
        content:
          "Organise student records, validate identifiers and monitor enrolment across institutions — a clear, trustworthy view of every academic identity.",
      },
      {
        property: "og:title",
        content: "APAAR SmartVerify AI — Every student, one trusted academic identity",
      },
      {
        property: "og:description",
        content:
          "Record intake, intelligent validation and enrolment monitoring for Indian higher education.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans" suppressHydrationWarning>
      <SiteNavigation />
      <main suppressHydrationWarning>
        <Hero />
        <HowItWorks />
        <AcademicIdentity />
        <IntelligentValidation />
        <MonitoringSection />
        <SecureVerification />
        <TrustSecurity />
        <ClosingCta />
      </main>
      <SiteFooter />
    </div>
  );
}
