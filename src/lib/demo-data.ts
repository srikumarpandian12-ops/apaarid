/**
 * Illustrative sample data for the APAAR SmartVerify AI demo experience.
 * Everything rendered from this module must be visibly labelled as
 * "illustrative" in the UI. No live integrations are represented here.
 */

export type ValidationStatus = "verified" | "pending" | "flagged" | "incomplete";

export interface StudentRecord {
  id: number;
  apaarMasked: string;
  name: string;
  program: string;
  institution: string;
  status: ValidationStatus;
  submittedOn: string;
  intakeYear: number;
}

const FIRST_NAMES = [
  "Aarav",
  "Diya",
  "Ishaan",
  "Meera",
  "Rohan",
  "Ananya",
  "Kabir",
  "Priya",
  "Vivaan",
  "Sara",
  "Aditya",
  "Nisha",
  "Arjun",
  "Tara",
  "Dev",
  "Kiara",
  "Rehan",
  "Anjali",
  "Nikhil",
  "Zoya",
];

const LAST_NAMES = [
  "Sharma",
  "Iyer",
  "Patel",
  "Reddy",
  "Khan",
  "Menon",
  "Gupta",
  "Nair",
  "Joshi",
  "Bose",
];

const PROGRAMS = [
  "B.Tech Computer Science",
  "B.Sc Data Science",
  "MBA Finance",
  "M.Tech Electronics",
  "B.Com Honours",
  "BA Economics",
];

const INSTITUTIONS = [
  "Thiagarajar College of Engineering (TCE)",
  "Velammal College of Engineering & Technology (VCET)",
  "Solamalai College of Engineering",
  "P.T.R. College of Engineering and Technology",
  "SRM Madurai College for Engineering and Technology (formerly Raja College)",
  "Fatima Michael College of Engineering and Technology",
  "Mangayarkarasi College of Engineering",
  "SACS M.A.V.M.M. Engineering College",
  "Ultra College of Engineering and Technology",
  "Vaigai College of Engineering",
  "Latha Mathavan Engineering College",
  "K.L.N. College of Engineering (KLNCE)",
  "Sethu Institute of Technology (SIT)",
  "Kamaraj College of Engineering and Technology (KCET)",
];

const STATUSES: ValidationStatus[] = [
  "verified",
  "verified",
  "verified",
  "pending",
  "pending",
  "flagged",
  "incomplete",
];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

function buildStudents(count: number): StudentRecord[] {
  const rand = seeded(20260226);
  const records: StudentRecord[] = [];
  for (let i = 0; i < count; i++) {
    const first = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    const status = STATUSES[Math.floor(rand() * STATUSES.length)];
    const apaarTail = String(1000 + Math.floor(rand() * 9000));
    const day = 1 + Math.floor(rand() * 27);
    const monthIdx = Math.floor(rand() * 10);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
    records.push({
      id: i + 1,
      apaarMasked: `1••• •••• ${apaarTail}`,
      name: `${first} ${last}`,
      program: PROGRAMS[Math.floor(rand() * PROGRAMS.length)],
      institution: INSTITUTIONS[Math.floor(rand() * INSTITUTIONS.length)],
      status,
      submittedOn: `${months[monthIdx]} ${day}, 2026`,
      intakeYear: rand() > 0.6 ? 2026 : 2025,
    });
  }
  return records;
}

export const demoStudents = buildStudents(48);

export const statusMeta: Record<ValidationStatus, { label: string; badge: string }> = {
  verified: {
    label: "Verified",
    badge: "bg-gold-soft text-foreground border border-gold/50",
  },
  pending: {
    label: "Pending review",
    badge: "bg-secondary text-secondary-foreground border border-border",
  },
  flagged: {
    label: "Flagged",
    badge: "bg-destructive/10 text-destructive border border-destructive/30",
  },
  incomplete: {
    label: "Incomplete record",
    badge: "bg-muted text-muted-foreground border border-border",
  },
};

/** Monthly enrolment trend — illustrative. */
export const enrolmentTrend = [
  { month: "Apr", submitted: 1180, approved: 1090 },
  { month: "May", submitted: 1345, approved: 1260 },
  { month: "Jun", submitted: 1298, approved: 1235 },
  { month: "Jul", submitted: 1520, approved: 1410 },
  { month: "Aug", submitted: 1682, approved: 1560 },
  { month: "Sep", submitted: 1745, approved: 1630 },
  { month: "Oct", submitted: 1810, approved: 1712 },
];

/** Approved vs actual enrolment by institution — illustrative. */
export const institutionComparison = [
  { institution: "TCE Madurai", approved: 960, actual: 948 },
  { institution: "VCET Madurai", approved: 660, actual: 642 },
  { institution: "KLN College", approved: 600, approvedLabel: "600", actual: 585 },
  { institution: "Sethu Inst (SIT)", approved: 600, actual: 572 },
  { institution: "Solamalai Engg", approved: 420, actual: 395 },
];

/** Validation status distribution — illustrative. */
export const statusDistribution = [
  { name: "Verified", value: 6420, key: "verified" },
  { name: "Pending review", value: 1850, key: "pending" },
  { name: "Flagged", value: 420, key: "flagged" },
  { name: "Incomplete", value: 610, key: "incomplete" },
];

export const statusChartColors: Record<string, string> = {
  verified: "var(--color-gold)",
  pending: "var(--color-emerald)",
  flagged: "var(--color-destructive)",
  incomplete: "var(--color-muted-foreground)",
};

/** Intake utilization by programme — illustrative. */
export const intakeUtilization = [
  { program: "B.Tech CS", utilised: 92 },
  { program: "B.Sc Data Sci", utilised: 78 },
  { program: "MBA Finance", utilised: 64 },
  { program: "M.Tech ECE", utilised: 51 },
];

export const heroStats = [
  { label: "Records validated this cycle", value: "12,418" },
  { label: "Duplicate candidates flagged", value: "327" },
  { label: "Institutions onboarded", value: "86" },
];
