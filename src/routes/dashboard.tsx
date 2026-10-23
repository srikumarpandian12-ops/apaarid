import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileQuestion,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  LogIn,
  LogOut,
  RefreshCw,
  Building2,
  GraduationCap,
  History,
  Database,
  ArrowLeft,
  Copy,
  Check,
  Sparkles,
  MapPin,
  CheckCheck,
  Info,
} from "lucide-react";

import { useAuth } from "@/lib/firebase-context";
import {
  createStudent,
  updateStudent,
  updateStudentStatus,
  deleteStudent,
  subscribeToStudents,
  subscribeToInstitutions,
  subscribeToAuditLogs,
  seedInitialDataIfEmpty,
  syncMaduraiCollegesToFirestore,
  createCollege,
  maskApaarId,
  MADURAI_ENGINEERING_COLLEGES,
  type StudentRecord,
  type InstitutionRecord,
  type AuditLogRecord,
  type CollegeDirectorySection,
} from "@/lib/student-service";
import type { ValidationStatus } from "@/lib/demo-data";
import { statusMeta } from "@/lib/demo-data";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

const DEFAULT_PROGRAMS = [
  "B.Tech Computer Science",
  "B.Sc Data Science",
  "MBA Finance",
  "M.Tech Electronics",
  "B.Com Honours",
  "BA Economics",
];

const DEFAULT_INSTITUTIONS = MADURAI_ENGINEERING_COLLEGES.map((c) => c.name);

export function DashboardPage() {
  const {
    user,
    userProfile,
    loading: authLoading,
    isAdmin,
    role,
    signIn,
    signOut,
    updateRole,
  } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("records");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filtering & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [institutionFilter, setInstitutionFilter] = useState<string>("all");

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<StudentRecord | null>(null);
  const [flagModalStudent, setFlagModalStudent] = useState<StudentRecord | null>(null);
  const [flagReasonText, setFlagReasonText] = useState("");
  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState<StudentRecord | null>(null);

  // Form state for creating student
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    apaarId: "",
    program: DEFAULT_PROGRAMS[0]!,
    institution: DEFAULT_INSTITUTIONS[0]!,
    intakeYear: 2026,
    status: "pending" as ValidationStatus,
  });
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  // College Directory search, filter, and management state
  const [collegeSearchQuery, setCollegeSearchQuery] = useState("");
  const [collegeCategoryFilter, setCollegeCategoryFilter] = useState<string>("all");
  const [collegeDistrictFilter, setCollegeDistrictFilter] = useState<string>("all");
  const [syncingColleges, setSyncingColleges] = useState(false);
  const [syncReport, setSyncReport] = useState<{
    successCount: number;
    totalCount: number;
    colleges: string[];
  } | null>(null);
  const [addCollegeModalOpen, setAddCollegeModalOpen] = useState(false);
  const [collegeFormData, setCollegeFormData] = useState({
    name: "",
    location: "",
    category: "Other Private Engineering Colleges" as CollegeDirectorySection,
    collegeType: "Private / Self-Financing",
    district: "Madurai",
    approvedIntake: 300,
    verificationStatus: "Verified" as "Verified" | "Requires Verification",
    verificationDetails: "",
  });
  const [submittingCollege, setSubmittingCollege] = useState(false);

  // Real-time Firestore subscriptions
  useEffect(() => {
    if (!user) {
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    const unsubStudents = subscribeToStudents(
      (data) => {
        setStudents(data);
        setDataLoading(false);
      },
      () => setDataLoading(false),
    );

    const unsubInstitutions = subscribeToInstitutions((data) => {
      setInstitutions(data);
    });

    const unsubLogs = subscribeToAuditLogs((data) => {
      setAuditLogs(data);
    });

    return () => {
      unsubStudents();
      unsubInstitutions();
      unsubLogs();
    };
  }, [user]);

  // Copy APAAR ID
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("APAAR ID copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Seed sample data to Firestore
  const handleSeed = async () => {
    if (!user) {
      toast.error("Please sign in first to populate records in Firestore.");
      return;
    }
    setSeeding(true);
    try {
      const seeded = await seedInitialDataIfEmpty();
      if (seeded) {
        toast.success("Successfully seeded sample institutions and students to Cloud Firestore!");
      } else {
        toast.info("Database already contains student records.");
      }
    } catch (err) {
      toast.error(
        "Failed to seed sample data: " + (err instanceof Error ? err.message : String(err)),
      );
    } finally {
      setSeeding(false);
    }
  };

  // Synchronize all 14 Madurai engineering colleges to Cloud Firestore
  const handleSyncColleges = async () => {
    if (!user) {
      toast.error("Please sign in to synchronize colleges with Cloud Firestore.");
      return;
    }
    setSyncingColleges(true);
    try {
      const res = await syncMaduraiCollegesToFirestore();
      setSyncReport(res);
      toast.success(
        `Successfully saved ${res.successCount} of ${res.totalCount} colleges to Cloud Firestore!`,
      );
    } catch (err) {
      toast.error("Failed to sync colleges: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSyncingColleges(false);
    }
  };

  // Create new college record in Cloud Firestore
  const handleCreateCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Authentication required to add a college.");
      return;
    }
    if (!collegeFormData.name.trim() || !collegeFormData.location.trim()) {
      toast.error("College name and location are required.");
      return;
    }

    // Check for duplicate college name in existing institutions
    const isDuplicate = institutions.some(
      (inst) => inst.name.toLowerCase().trim() === collegeFormData.name.toLowerCase().trim(),
    );
    if (isDuplicate) {
      toast.error("A college record with this name already exists in the database.");
      return;
    }

    setSubmittingCollege(true);
    try {
      await createCollege({
        name: collegeFormData.name.trim(),
        location: collegeFormData.location.trim(),
        category: collegeFormData.category,
        collegeType: collegeFormData.collegeType.trim(),
        district: collegeFormData.district.trim(),
        approvedIntake: Number(collegeFormData.approvedIntake),
        verificationStatus: collegeFormData.verificationStatus,
        verificationDetails: collegeFormData.verificationDetails.trim() || undefined,
      });
      toast.success(`College record for ${collegeFormData.name} added to Cloud Firestore!`);
      setAddCollegeModalOpen(false);
      setCollegeFormData({
        name: "",
        location: "",
        category: "Other Private Engineering Colleges",
        collegeType: "Private / Self-Financing",
        district: "Madurai",
        approvedIntake: 300,
        verificationStatus: "Verified",
        verificationDetails: "",
      });
    } catch (err) {
      toast.error("Failed to add college: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmittingCollege(false);
    }
  };

  // Submit new student record to Firestore
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be authenticated to create a record.");
      return;
    }

    const cleanApaar = formData.apaarId.replace(/\D/g, "");
    if (cleanApaar.length !== 12) {
      toast.error("APAAR ID must contain exactly 12 numeric digits.");
      return;
    }

    // Intelligent check: detect if duplicate APAAR or same name in program exists
    const duplicateApaar = students.some((s) => s.apaarId === cleanApaar);
    if (duplicateApaar) {
      toast.error("A student record with this APAAR ID already exists in the registry!");
      return;
    }

    const duplicateCandidate = students.some(
      (s) =>
        s.name.toLowerCase() === formData.name.trim().toLowerCase() &&
        s.program === formData.program,
    );

    setSubmitting(true);
    try {
      await createStudent({
        apaarId: cleanApaar,
        apaarMasked: maskApaarId(cleanApaar),
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        program: formData.program,
        institution: formData.institution,
        intakeYear: Number(formData.intakeYear),
        status: duplicateCandidate ? "flagged" : formData.status,
        completeness: formData.status === "verified" ? 100 : 80,
        submittedBy: user.uid,
        isDuplicateCandidate: duplicateCandidate,
        flagReason: duplicateCandidate
          ? "Potential duplicate intake: similar name and program detected in registry."
          : undefined,
      });

      toast.success(`Student record for ${formData.name} saved to Cloud Firestore!`);
      setAddModalOpen(false);
      setFormData({
        name: "",
        email: "",
        apaarId: "",
        program: DEFAULT_PROGRAMS[0]!,
        institution: DEFAULT_INSTITUTIONS[0]!,
        intakeYear: 2026,
        status: "pending",
      });
    } catch (err) {
      toast.error("Failed to save record: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  // Update record details
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudent) return;
    setSubmitting(true);
    try {
      await updateStudent(editStudent.id, {
        name: editStudent.name,
        email: editStudent.email,
        program: editStudent.program,
        institution: editStudent.institution,
        intakeYear: Number(editStudent.intakeYear),
      });
      toast.success("Student details updated in Cloud Firestore!");
      setEditStudent(null);
    } catch (err) {
      toast.error("Update failed: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  // Verification status transition
  const handleStatusChange = async (
    studentId: string,
    newStatus: ValidationStatus,
    reason?: string,
  ) => {
    try {
      await updateStudentStatus(studentId, newStatus, reason);
      toast.success(`Status updated to ${newStatus.toUpperCase()} in Firestore!`);
    } catch (err) {
      toast.error("Failed to update status: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Delete record
  const handleDeleteStudent = async () => {
    if (!deleteConfirmStudent) return;
    try {
      await deleteStudent(deleteConfirmStudent.id, deleteConfirmStudent.name);
      toast.success("Student record permanently deleted from Firestore.");
      setDeleteConfirmStudent(null);
    } catch (err) {
      toast.error("Deletion failed: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.apaarId.includes(searchQuery) ||
        student.apaarMasked.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.program.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || student.status === statusFilter;

      const matchesInstitution =
        institutionFilter === "all" || student.institution === institutionFilter;

      return matchesSearch && matchesStatus && matchesInstitution;
    });
  }, [students, searchQuery, statusFilter, institutionFilter]);

  // Aggregate stats from real Firestore data
  const stats = useMemo(() => {
    const total = students.length;
    const verified = students.filter((s) => s.status === "verified").length;
    const pending = students.filter((s) => s.status === "pending").length;
    const flagged = students.filter((s) => s.status === "flagged").length;
    const incomplete = students.filter((s) => s.status === "incomplete").length;
    return { total, verified, pending, flagged, incomplete };
  }, [students]);

  // Merge loaded institutions with MADURAI_ENGINEERING_COLLEGES metadata to guarantee consistent fields
  const enrichedInstitutions = useMemo(() => {
    if (institutions.length > 0) {
      return institutions.map((inst) => {
        const canonical = MADURAI_ENGINEERING_COLLEGES.find(
          (c) => c.id === inst.id || c.name.toLowerCase() === inst.name.toLowerCase(),
        );
        return {
          ...inst,
          location: inst.location || canonical?.location || "Madurai",
          category: (inst.category ||
            canonical?.category ||
            "Other Private Engineering Colleges") as CollegeDirectorySection,
          collegeType: inst.collegeType || canonical?.collegeType || "Private / Self-Financing",
          district: inst.district || canonical?.district || "Madurai",
          verificationStatus:
            inst.verificationStatus || canonical?.verificationStatus || "Verified",
          verificationDetails: inst.verificationDetails || canonical?.verificationDetails,
        };
      });
    }
    return MADURAI_ENGINEERING_COLLEGES.map((col) => ({
      ...col,
      enrolledCount: 0,
      verifiedCount: 0,
      updatedAt: new Date().toISOString(),
    }));
  }, [institutions]);

  const filteredColleges = useMemo(() => {
    return enrichedInstitutions.filter((col) => {
      const q = collegeSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        col.name.toLowerCase().includes(q) ||
        col.location.toLowerCase().includes(q) ||
        (col.district && col.district.toLowerCase().includes(q));

      const matchesCategory =
        collegeCategoryFilter === "all" || col.category === collegeCategoryFilter;

      const matchesDistrict =
        collegeDistrictFilter === "all" || col.district === collegeDistrictFilter;

      return matchesSearch && matchesCategory && matchesDistrict;
    });
  }, [enrichedInstitutions, collegeSearchQuery, collegeCategoryFilter, collegeDistrictFilter]);

  const mainColleges = useMemo(
    () => filteredColleges.filter((c) => c.category === "Main Colleges"),
    [filteredColleges],
  );

  const otherPrivateColleges = useMemo(
    () => filteredColleges.filter((c) => c.category === "Other Private Engineering Colleges"),
    [filteredColleges],
  );

  const nearbyBorderColleges = useMemo(
    () => filteredColleges.filter((c) => c.category === "Nearby Border-Area Colleges"),
    [filteredColleges],
  );

  const renderCollegeCard = (col: InstitutionRecord) => {
    const intake = col.approvedIntake || 300;
    const enrolled = col.enrolledCount || 0;
    const fillPercent = Math.min(100, Math.round((enrolled / intake) * 100));

    return (
      <div
        key={col.id || col.code || col.name}
        className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-e1 hover:border-primary/40 transition"
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] uppercase font-semibold text-muted-foreground"
                >
                  {col.code || "COLLEGE"}
                </Badge>
                {col.district && (
                  <Badge variant="secondary" className="text-[10px]">
                    {col.district}
                  </Badge>
                )}
                {col.verificationStatus === "Verified" ? (
                  <Badge className="bg-emerald/10 text-emerald border-emerald/20 text-[10px] font-semibold">
                    Verified
                  </Badge>
                ) : (
                  <Badge className="bg-gold/15 text-gold border-gold/40 text-[10px] font-semibold">
                    {col.verificationStatus || "Pending"}
                  </Badge>
                )}
              </div>
              <h4 className="font-display text-sm font-bold text-foreground mt-1.5 leading-snug">
                {col.name}
              </h4>
            </div>
          </div>

          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0 text-primary mt-0.5" />
            <span className="leading-tight">{col.location}</span>
          </div>

          <div className="rounded-xl border border-border/80 bg-secondary/40 p-2.5 text-[11px] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Category:</span>
              <span className="font-medium text-foreground">
                {col.collegeType || "Engineering"}
              </span>
            </div>
            {col.verificationDetails && (
              <div className="pt-1 border-t border-border/60 text-muted-foreground">
                <span className="font-semibold text-foreground">Note: </span>
                {col.verificationDetails}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Enrolled Intake:</span>
            <span className="font-mono font-semibold text-foreground">
              {enrolled} / {intake} ({fillPercent}%)
            </span>
          </div>
          <Progress value={fillPercent} className="h-1.5" />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Back to Home
            </Link>
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm">
                A
              </span>
              <div>
                <h1 className="font-display text-base font-semibold leading-tight">
                  APAAR SmartVerify AI
                </h1>
                <p className="text-[11px] text-muted-foreground">
                  Cloud Firestore Operational Registry
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!mounted || authLoading ? (
              <span className="text-xs text-muted-foreground">Connecting...</span>
            ) : user ? (
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-semibold leading-tight">
                    {user.displayName || user.email}
                  </p>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold uppercase tracking-wider py-0 px-1.5 ${
                        role === "admin"
                          ? "bg-gold/15 text-gold border-gold/40"
                          : "bg-primary/10 text-primary border-primary/30"
                      }`}
                    >
                      {role === "admin" ? "National Admin" : "Institution Staff"}
                    </Badge>
                  </div>
                </div>

                {/* Role Switcher for previewing RBAC */}
                <Select
                  value={role}
                  onValueChange={(val) => updateRole(val as "admin" | "institution" | "student")}
                >
                  <SelectTrigger className="h-8 text-xs border-border bg-background w-32 hidden md:flex">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin View</SelectItem>
                    <SelectItem value="institution">Institution View</SelectItem>
                    <SelectItem value="student">Student View</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="h-8 gap-1.5 text-xs font-semibold"
                >
                  <LogOut className="size-3.5" />
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={signIn}
                className="gap-2 bg-primary text-primary-foreground text-xs font-semibold"
              >
                <LogIn className="size-4" />
                Sign in with Google
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {!mounted || authLoading ? (
          <div className="my-12 mx-auto max-w-xl rounded-3xl border border-border bg-card p-12 text-center shadow-e2">
            <RefreshCw className="size-6 animate-spin mx-auto text-primary mb-3" />
            <p className="text-sm font-semibold">Connecting to APAAR Registry...</p>
            <p className="text-xs text-muted-foreground mt-1">
              Synchronizing Firestore credentials
            </p>
          </div>
        ) : !user ? (
          /* Unauthenticated Prompt */
          <div className="my-12 mx-auto max-w-xl rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-e2 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary mb-4">
              <Shield className="size-7" />
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Sign In to Access Student Registry
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Connect via Google Authentication to interact with real Cloud Firestore student
              records, validate APAAR identifiers, and inspect compliance audit logs.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <Button
                size="lg"
                onClick={signIn}
                className="font-semibold gap-2 shadow-e2 bg-primary text-primary-foreground"
              >
                <LogIn className="size-4" />
                Sign in with Google
              </Button>
            </div>
            <div className="mt-6 rounded-2xl border border-border bg-secondary/60 p-4 text-left text-xs text-muted-foreground">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Database className="size-3.5 text-primary" />
                Configured with Google Cloud Firestore & Firebase Auth
              </p>
              <p className="mt-1">
                Connected project:{" "}
                <span className="font-mono text-foreground">just-strand-t98sv</span>
              </p>
            </div>
          </div>
        ) : (
          <div>
            {/* Top Control Bar & Live Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-e1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Records</span>
                  <Database className="size-4 text-primary" />
                </div>
                <p className="mt-2 font-display text-2xl font-bold">{stats.total}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Live Firestore documents</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-e1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald">
                    Verified
                  </span>
                  <CheckCircle2 className="size-4 text-emerald" />
                </div>
                <p className="mt-2 font-display text-2xl font-bold text-foreground">
                  {stats.verified}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}%
                  compliance
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-e1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider text-gold">
                    Pending Review
                  </span>
                  <Clock className="size-4 text-gold" />
                </div>
                <p className="mt-2 font-display text-2xl font-bold">{stats.pending}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Awaiting verification</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-e1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider text-destructive">
                    Flagged
                  </span>
                  <AlertTriangle className="size-4 text-destructive" />
                </div>
                <p className="mt-2 font-display text-2xl font-bold text-destructive">
                  {stats.flagged}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Duplicate / Anomalies</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-e1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider">Incomplete</span>
                  <FileQuestion className="size-4 text-muted-foreground" />
                </div>
                <p className="mt-2 font-display text-2xl font-bold">{stats.incomplete}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Missing prerequisites</p>
              </div>
            </div>

            {/* Quick Actions & Seed Helper */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setAddModalOpen(true)}
                  className="gap-2 font-semibold bg-primary text-primary-foreground shadow-e2"
                >
                  <Plus className="size-4" />
                  New Student Intake
                </Button>
                {students.length === 0 && (
                  <Button
                    variant="outline"
                    onClick={handleSeed}
                    disabled={seeding}
                    className="gap-2 font-semibold border-gold/40 text-foreground bg-gold/10 hover:bg-gold/20"
                  >
                    <Sparkles className="size-4 text-gold" />
                    {seeding ? "Seeding to Firestore..." : "Seed Initial Sample Records"}
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-block size-2 rounded-full bg-emerald animate-pulse" />
                <span>Live Real-Time Syncing (onSnapshot)</span>
              </div>
            </div>

            {/* Tabs for Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="bg-secondary p-1 rounded-xl">
                <TabsTrigger value="records" className="gap-2 font-semibold rounded-lg text-xs">
                  <GraduationCap className="size-3.5" />
                  Student Records ({students.length})
                </TabsTrigger>
                <TabsTrigger
                  value="institutions"
                  className="gap-2 font-semibold rounded-lg text-xs"
                >
                  <Building2 className="size-3.5" />
                  Institutions ({institutions.length})
                </TabsTrigger>
                <TabsTrigger value="audit" className="gap-2 font-semibold rounded-lg text-xs">
                  <History className="size-3.5" />
                  Compliance Audit Trail ({auditLogs.length})
                </TabsTrigger>
              </TabsList>

              {/* Records Tab */}
              <TabsContent value="records" className="mt-4 space-y-4">
                {/* Search & Filter Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between rounded-2xl border border-border bg-card p-3 shadow-e1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by student name, APAAR ID, program..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-xs"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-9 text-xs w-36">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="flagged">Flagged</SelectItem>
                        <SelectItem value="incomplete">Incomplete</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                      <SelectTrigger className="h-9 text-xs w-48">
                        <SelectValue placeholder="All Institutions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Institutions</SelectItem>
                        {DEFAULT_INSTITUTIONS.map((inst) => (
                          <SelectItem key={inst} value={inst}>
                            {inst}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {(searchQuery || statusFilter !== "all" || institutionFilter !== "all") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchQuery("");
                          setStatusFilter("all");
                          setInstitutionFilter("all");
                        }}
                        className="h-9 text-xs"
                      >
                        Reset filters
                      </Button>
                    )}
                  </div>
                </div>

                {/* Students Table */}
                <div className="rounded-2xl border border-border bg-card shadow-e2 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-secondary/60 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="py-3 px-4">Student & APAAR ID</th>
                          <th className="py-3 px-4">Program</th>
                          <th className="py-3 px-4">Institution</th>
                          <th className="py-3 px-4">Intake & Completeness</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {dataLoading ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="py-12 text-center text-muted-foreground text-xs"
                            >
                              <RefreshCw className="size-5 animate-spin mx-auto mb-2 text-primary" />
                              Loading records from Cloud Firestore...
                            </td>
                          </tr>
                        ) : filteredStudents.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="py-12 text-center text-muted-foreground text-xs"
                            >
                              No matching student records found.
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map((student) => {
                            const meta = statusMeta[student.status];
                            return (
                              <tr
                                key={student.id}
                                className="hover:bg-secondary/30 transition-colors"
                              >
                                <td className="py-3 px-4">
                                  <div className="font-semibold text-foreground">
                                    {student.name}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground font-mono">
                                    <span>
                                      {student.apaarMasked || maskApaarId(student.apaarId)}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(student.id, student.apaarId)}
                                      className="text-muted-foreground hover:text-foreground"
                                      title="Copy full APAAR ID"
                                    >
                                      {copiedId === student.id ? (
                                        <Check className="size-3 text-emerald" />
                                      ) : (
                                        <Copy className="size-3" />
                                      )}
                                    </button>
                                  </div>
                                  {student.flagReason && (
                                    <p className="text-[11px] text-destructive mt-1 max-w-xs leading-tight">
                                      ⚠ {student.flagReason}
                                    </p>
                                  )}
                                </td>
                                <td className="py-3 px-4 font-medium text-foreground">
                                  {student.program}
                                </td>
                                <td className="py-3 px-4 text-xs text-muted-foreground">
                                  {student.institution}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="font-semibold">{student.intakeYear}</span>
                                    <span className="text-muted-foreground">
                                      {student.completeness || 80}%
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-emerald to-gold"
                                      style={{ width: `${student.completeness || 80}%` }}
                                    />
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${meta.badge}`}
                                  >
                                    {meta.label}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {student.status !== "verified" && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleStatusChange(student.id, "verified")}
                                        className="h-7 px-2 text-xs text-emerald border-emerald/30 hover:bg-emerald/10"
                                        title="Verify Academic Identity"
                                      >
                                        Verify
                                      </Button>
                                    )}

                                    {student.status !== "flagged" && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setFlagModalStudent(student);
                                          setFlagReasonText(student.flagReason || "");
                                        }}
                                        className="h-7 px-2 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                                        title="Flag Anomaly"
                                      >
                                        Flag
                                      </Button>
                                    )}

                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setEditStudent(student)}
                                      className="h-7 w-7 p-0"
                                      title="Edit details"
                                    >
                                      <Edit3 className="size-3.5" />
                                    </Button>

                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setDeleteConfirmStudent(student)}
                                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                      title="Delete record"
                                    >
                                      <Trash2 className="size-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              {/* Institutions Directory Tab */}
              <TabsContent value="institutions" className="mt-4 space-y-6">
                {/* Directory Header & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-e1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Building2 className="size-4" />
                      </span>
                      <h2 className="font-display text-lg font-semibold tracking-tight">
                        Madurai District & Border-Area Engineering Colleges Directory
                      </h2>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground max-w-2xl">
                      Persistent institutional directory in Cloud Firestore. Organized into Main
                      Colleges, Other Private Engineering Colleges, and Nearby Border-Area Colleges.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSyncColleges}
                      disabled={syncingColleges}
                      className="gap-2 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <RefreshCw className={`size-3.5 ${syncingColleges ? "animate-spin" : ""}`} />
                      {syncingColleges ? "Syncing to Firestore..." : "Sync 14 Colleges to Database"}
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => setAddCollegeModalOpen(true)}
                      className="gap-1.5 text-xs font-semibold bg-primary text-primary-foreground"
                    >
                      <Plus className="size-3.5" />
                      Add College
                    </Button>
                  </div>
                </div>

                {/* Database Verification Status Banner */}
                <div className="rounded-2xl border border-emerald/30 bg-emerald/10 p-4 text-xs text-foreground">
                  <div className="flex items-start gap-3">
                    <CheckCheck className="size-4 shrink-0 text-emerald mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-emerald">
                        Database Registry Status:{" "}
                        <span className="text-foreground">
                          {institutions.length} Colleges Stored in Cloud Firestore
                        </span>
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">
                          Verified Location for Kamaraj College of Engineering & Technology (KCET):
                        </strong>{" "}
                        S.P.G. Chidambara Nadar - C. Nagammal Campus, S.P.G.C. Nagar, K. Vellakulam,
                        Madurai-Virudhunagar Main Road (near Virudhunagar border). Categorized under
                        Nearby Border-Area Colleges.
                      </p>
                      {syncReport && (
                        <p className="font-medium text-emerald">
                          ✓ Successfully updated {syncReport.successCount} of{" "}
                          {syncReport.totalCount} college documents in Firestore without duplicates.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between rounded-2xl border border-border bg-card p-3 shadow-e1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by college name, location, or town..."
                      value={collegeSearchQuery}
                      onChange={(e) => setCollegeSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-xs"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Select value={collegeCategoryFilter} onValueChange={setCollegeCategoryFilter}>
                      <SelectTrigger className="h-9 text-xs w-52">
                        <SelectValue placeholder="All Directory Sections" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Directory Sections</SelectItem>
                        <SelectItem value="Main Colleges">Main Colleges</SelectItem>
                        <SelectItem value="Other Private Engineering Colleges">
                          Other Private Colleges
                        </SelectItem>
                        <SelectItem value="Nearby Border-Area Colleges">
                          Nearby Border-Area Colleges
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={collegeDistrictFilter} onValueChange={setCollegeDistrictFilter}>
                      <SelectTrigger className="h-9 text-xs w-44">
                        <SelectValue placeholder="All Districts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Districts / Areas</SelectItem>
                        <SelectItem value="Madurai">Madurai District</SelectItem>
                        <SelectItem value="Sivagangai Border">Sivagangai Border</SelectItem>
                        <SelectItem value="Virudhunagar Border">Virudhunagar Border</SelectItem>
                      </SelectContent>
                    </Select>

                    {(collegeSearchQuery ||
                      collegeCategoryFilter !== "all" ||
                      collegeDistrictFilter !== "all") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCollegeSearchQuery("");
                          setCollegeCategoryFilter("all");
                          setCollegeDistrictFilter("all");
                        }}
                        className="h-9 text-xs"
                      >
                        Reset filters
                      </Button>
                    )}
                  </div>
                </div>

                {/* Section 1: Main Colleges */}
                {(collegeCategoryFilter === "all" || collegeCategoryFilter === "Main Colleges") &&
                  mainColleges.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-base font-semibold text-foreground">
                            1. Main Colleges
                          </h3>
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                            {mainColleges.length} Institutions
                          </Badge>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          Prominent autonomous & government-aided institutions in Madurai
                        </span>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                        {mainColleges.map((col) => renderCollegeCard(col))}
                      </div>
                    </div>
                  )}

                {/* Section 2: Other Private Engineering Colleges */}
                {(collegeCategoryFilter === "all" ||
                  collegeCategoryFilter === "Other Private Engineering Colleges") &&
                  otherPrivateColleges.length > 0 && (
                    <div className="space-y-3 pt-4">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-base font-semibold text-foreground">
                            2. Other Private Engineering Colleges
                          </h3>
                          <Badge variant="outline" className="text-[10px]">
                            {otherPrivateColleges.length} Institutions
                          </Badge>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          Private engineering institutions situated across Madurai district
                        </span>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {otherPrivateColleges.map((col) => renderCollegeCard(col))}
                      </div>
                    </div>
                  )}

                {/* Section 3: Nearby Border-Area Colleges */}
                {(collegeCategoryFilter === "all" ||
                  collegeCategoryFilter === "Nearby Border-Area Colleges") &&
                  nearbyBorderColleges.length > 0 && (
                    <div className="space-y-3 pt-4">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-base font-semibold text-foreground">
                            3. Nearby Border-Area Colleges
                          </h3>
                          <Badge className="bg-gold/15 text-gold border-gold/40 text-[10px]">
                            {nearbyBorderColleges.length} Institutions
                          </Badge>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          Institutions serving the Madurai region situated along Sivagangai and
                          Virudhunagar borders
                        </span>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {nearbyBorderColleges.map((col) => renderCollegeCard(col))}
                      </div>
                    </div>
                  )}

                {/* Empty State */}
                {filteredColleges.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card/50">
                    <Building2 className="size-8 text-muted-foreground mx-auto mb-3" />
                    <h4 className="font-display font-semibold text-sm">
                      No engineering colleges match your filter
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try clearing the search query or changing the directory section filter.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCollegeSearchQuery("");
                        setCollegeCategoryFilter("all");
                        setCollegeDistrictFilter("all");
                      }}
                      className="mt-4 text-xs"
                    >
                      Reset All Filters
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Compliance Audit Trail Tab */}
              <TabsContent value="audit" className="mt-4">
                <div className="rounded-2xl border border-border bg-card shadow-e2 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-display text-base font-semibold">
                        Immutable Compliance Audit Log
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Append-only trail storing state transitions and verification actions in
                        Cloud Firestore.
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono">
                      {auditLogs.length} events recorded
                    </Badge>
                  </div>

                  <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                    {auditLogs.length === 0 ? (
                      <div className="p-8 text-center text-xs text-muted-foreground">
                        No audit events recorded yet. Perform a verification or create a student to
                        record actions.
                      </div>
                    ) : (
                      auditLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3.5 hover:bg-secondary/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold font-mono uppercase text-primary">
                                [{log.action}]
                              </span>
                              <span className="text-foreground">{log.details}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Actor: {log.performerEmail} (ID: {log.performedBy.substring(0, 8)}...)
                            </p>
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono shrink-0">
                            {new Date(log.timestamp).toLocaleString("en-IN")}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      {/* MODAL: Add New Student Intake */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              New Student Intake Registration
            </DialogTitle>
            <DialogDescription className="text-xs">
              Directly provisions an academic identity record in Cloud Firestore with real-time
              format and duplicate validation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateStudent} className="space-y-4 py-2">
            <div>
              <Label className="text-xs">Student Legal Full Name *</Label>
              <Input
                required
                placeholder="e.g. Priyadarshini Sundaram"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">12-Digit APAAR ID *</Label>
                <Input
                  required
                  placeholder="123456789012"
                  maxLength={12}
                  value={formData.apaarId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      apaarId: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  className="mt-1 h-9 font-mono text-xs"
                />
              </div>

              <div>
                <Label className="text-xs">Intake Year *</Label>
                <Input
                  type="number"
                  required
                  value={formData.intakeYear}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      intakeYear: Number(e.target.value),
                    })
                  }
                  className="mt-1 h-9 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Student Email (optional)</Label>
              <Input
                type="email"
                placeholder="student@institution.ac.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs">Enrolling Institution *</Label>
              <Select
                value={formData.institution}
                onValueChange={(val) => setFormData({ ...formData, institution: val })}
              >
                <SelectTrigger className="mt-1 h-9 text-xs">
                  <SelectValue placeholder="Select institution" />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_INSTITUTIONS.map((inst) => (
                    <SelectItem key={inst} value={inst}>
                      {inst}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Academic Program *</Label>
              <Select
                value={formData.program}
                onValueChange={(val) => setFormData({ ...formData, program: val })}
              >
                <SelectTrigger className="mt-1 h-9 text-xs">
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_PROGRAMS.map((prog) => (
                    <SelectItem key={prog} value={prog}>
                      {prog}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Initial Validation Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) =>
                  setFormData({ ...formData, status: val as ValidationStatus })
                }
              >
                <SelectTrigger className="mt-1 h-9 text-xs">
                  <SelectValue placeholder="Initial status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending review</SelectItem>
                  <SelectItem value="verified">Verified directly</SelectItem>
                  <SelectItem value="incomplete">Incomplete record</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="bg-primary text-primary-foreground font-semibold"
              >
                {submitting ? "Saving to Firestore..." : "Register Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: Edit Student */}
      <Dialog open={!!editStudent} onOpenChange={(open) => !open && setEditStudent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Edit Student Record</DialogTitle>
            <DialogDescription className="text-xs">
              Modify student details in Cloud Firestore.
            </DialogDescription>
          </DialogHeader>

          {editStudent && (
            <form onSubmit={handleUpdateStudent} className="space-y-4 py-2">
              <div>
                <Label className="text-xs">Student Full Name</Label>
                <Input
                  required
                  value={editStudent.name}
                  onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })}
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs">Email</Label>
                <Input
                  value={editStudent.email || ""}
                  onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })}
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs">Program</Label>
                <Select
                  value={editStudent.program}
                  onValueChange={(val) => setEditStudent({ ...editStudent, program: val })}
                >
                  <SelectTrigger className="mt-1 h-9 text-xs">
                    <SelectValue placeholder="Program" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_PROGRAMS.map((prog) => (
                      <SelectItem key={prog} value={prog}>
                        {prog}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Institution</Label>
                <Select
                  value={editStudent.institution}
                  onValueChange={(val) => setEditStudent({ ...editStudent, institution: val })}
                >
                  <SelectTrigger className="mt-1 h-9 text-xs">
                    <SelectValue placeholder="Institution" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_INSTITUTIONS.map((inst) => (
                      <SelectItem key={inst} value={inst}>
                        {inst}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditStudent(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting ? "Updating..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL: Flag Anomaly */}
      <Dialog open={!!flagModalStudent} onOpenChange={(open) => !open && setFlagModalStudent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-destructive flex items-center gap-2">
              <AlertTriangle className="size-5" />
              Flag Record for Review
            </DialogTitle>
            <DialogDescription className="text-xs">
              Provide an anomaly or review note for {flagModalStudent?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-3">
            <Label className="text-xs">Flag Explanation / Anomaly Reason</Label>
            <Input
              placeholder="e.g. Similar candidate found in another institution intake."
              value={flagReasonText}
              onChange={(e) => setFlagReasonText(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setFlagModalStudent(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (flagModalStudent) {
                  handleStatusChange(flagModalStudent.id, "flagged", flagReasonText);
                  setFlagModalStudent(null);
                }
              }}
            >
              Flag Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: Confirm Deletion */}
      <Dialog
        open={!!deleteConfirmStudent}
        onOpenChange={(open) => !open && setDeleteConfirmStudent(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-destructive">
              Delete Record from Firestore?
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete the record for {deleteConfirmStudent?.name}? This
              operation will permanently remove the document from Cloud Firestore and append an
              event to the audit trail.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmStudent(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteStudent}>
              Delete Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: Add College */}
      <Dialog open={addCollegeModalOpen} onOpenChange={setAddCollegeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              Add Engineering College
            </DialogTitle>
            <DialogDescription className="text-xs">
              Add a new college record to Cloud Firestore. Record will be stored in the institutions
              database collection.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCollege} className="space-y-3.5 py-1">
            <div>
              <Label className="text-xs">College Name *</Label>
              <Input
                placeholder="e.g. Madurai Institute of Engineering"
                value={collegeFormData.name}
                onChange={(e) => setCollegeFormData({ ...collegeFormData, name: e.target.value })}
                className="mt-1 h-9 text-xs"
                required
              />
            </div>

            <div>
              <Label className="text-xs">Exact Location / Campus *</Label>
              <Input
                placeholder="e.g. Thiruparankundram, Madurai"
                value={collegeFormData.location}
                onChange={(e) =>
                  setCollegeFormData({ ...collegeFormData, location: e.target.value })
                }
                className="mt-1 h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Directory Section</Label>
                <Select
                  value={collegeFormData.category}
                  onValueChange={(val) =>
                    setCollegeFormData({
                      ...collegeFormData,
                      category: val as CollegeDirectorySection,
                    })
                  }
                >
                  <SelectTrigger className="mt-1 h-9 text-xs">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Colleges">Main Colleges</SelectItem>
                    <SelectItem value="Other Private Engineering Colleges">
                      Other Private Colleges
                    </SelectItem>
                    <SelectItem value="Nearby Border-Area Colleges">Nearby Border-Area</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">District / Area</Label>
                <Input
                  placeholder="e.g. Madurai"
                  value={collegeFormData.district}
                  onChange={(e) =>
                    setCollegeFormData({ ...collegeFormData, district: e.target.value })
                  }
                  className="mt-1 h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">College Type / Category</Label>
                <Input
                  placeholder="e.g. Autonomous / Private"
                  value={collegeFormData.collegeType}
                  onChange={(e) =>
                    setCollegeFormData({ ...collegeFormData, collegeType: e.target.value })
                  }
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs">Approved Annual Intake</Label>
                <Input
                  type="number"
                  min="50"
                  max="5000"
                  value={collegeFormData.approvedIntake}
                  onChange={(e) =>
                    setCollegeFormData({
                      ...collegeFormData,
                      approvedIntake: Number(e.target.value) || 300,
                    })
                  }
                  className="mt-1 h-9 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Verification Details / Location Note</Label>
              <Input
                placeholder="e.g. Verified via official campus registry"
                value={collegeFormData.verificationDetails}
                onChange={(e) =>
                  setCollegeFormData({
                    ...collegeFormData,
                    verificationDetails: e.target.value,
                  })
                }
                className="mt-1 h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddCollegeModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submittingCollege}>
                {submittingCollege ? "Saving to Database..." : "Save College"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
