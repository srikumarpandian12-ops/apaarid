import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import type { ValidationStatus } from "./demo-data";

export interface StudentRecord {
  id: string;
  apaarId: string;
  apaarMasked: string;
  name: string;
  email?: string;
  program: string;
  institution: string;
  institutionId?: string;
  intakeYear: number;
  status: ValidationStatus;
  completeness: number;
  submittedBy: string;
  submittedByName?: string;
  isDuplicateCandidate?: boolean;
  flagReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type CollegeDirectorySection =
  "Main Colleges" | "Other Private Engineering Colleges" | "Nearby Border-Area Colleges";

export interface InstitutionRecord {
  id: string;
  name: string;
  location: string;
  category: CollegeDirectorySection;
  collegeType?: string;
  district?: string;
  verificationStatus?: "Verified" | "Requires Verification";
  verificationDetails?: string;
  approvedIntake: number;
  enrolledCount: number;
  verifiedCount: number;
  updatedAt: string;
}

export interface AuditLogRecord {
  id: string;
  action: string;
  performedBy: string;
  performerEmail?: string;
  targetStudentId?: string;
  details: string;
  timestamp: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: "admin" | "institution" | "student";
  institutionName?: string;
  createdAt: string;
}

const STUDENTS_PATH = "students";
const INSTITUTIONS_PATH = "institutions";
const AUDIT_PATH = "audit_logs";
const USERS_PATH = "users";

export function maskApaarId(rawId: string): string {
  const clean = rawId.replace(/\D/g, "");
  if (clean.length < 4) return "1••• •••• ••••";
  const last4 = clean.slice(-4);
  return `1••• •••• ${last4}`;
}

export async function createAuditLog(
  action: string,
  targetStudentId: string,
  details: string,
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) return;
  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const logData: AuditLogRecord = {
    id: logId,
    action,
    performedBy: currentUser.uid,
    performerEmail: currentUser.email || "unknown",
    targetStudentId,
    details,
    timestamp: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, AUDIT_PATH, logId), logData);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, AUDIT_PATH);
  }
}

export function subscribeToStudents(
  onData: (students: StudentRecord[]) => void,
  onError?: (err: Error) => void,
) {
  const q = query(collection(db, STUDENTS_PATH), orderBy("createdAt", "desc"), limit(100));
  return onSnapshot(
    q,
    (snapshot) => {
      const records: StudentRecord[] = [];
      snapshot.forEach((d) => {
        records.push({ id: d.id, ...d.data() } as StudentRecord);
      });
      onData(records);
    },
    (error) => {
      console.warn("Student subscription status:", error?.message || error);
      if (onError) onError(error as Error);
      if (
        (error as { code?: string })?.code === "permission-denied" ||
        error?.message?.includes("permission")
      ) {
        handleFirestoreError(error, OperationType.LIST, STUDENTS_PATH);
      }
    },
  );
}

export function subscribeToInstitutions(
  onData: (institutions: InstitutionRecord[]) => void,
  onError?: (err: Error) => void,
) {
  return onSnapshot(
    collection(db, INSTITUTIONS_PATH),
    (snapshot) => {
      const records: InstitutionRecord[] = [];
      snapshot.forEach((d) => {
        records.push({ id: d.id, ...d.data() } as InstitutionRecord);
      });
      onData(records);
    },
    (error) => {
      console.warn("Institutions subscription status:", error?.message || error);
      if (onError) onError(error as Error);
      if (
        (error as { code?: string })?.code === "permission-denied" ||
        error?.message?.includes("permission")
      ) {
        handleFirestoreError(error, OperationType.LIST, INSTITUTIONS_PATH);
      }
    },
  );
}

export function subscribeToAuditLogs(
  onData: (logs: AuditLogRecord[]) => void,
  onError?: (err: Error) => void,
) {
  const q = query(collection(db, AUDIT_PATH), orderBy("timestamp", "desc"), limit(50));
  return onSnapshot(
    q,
    (snapshot) => {
      const logs: AuditLogRecord[] = [];
      snapshot.forEach((d) => {
        logs.push({ id: d.id, ...d.data() } as AuditLogRecord);
      });
      onData(logs);
    },
    (error) => {
      console.warn("Audit log subscription status:", error?.message || error);
      if (onError) onError(error as Error);
      if (
        (error as { code?: string })?.code === "permission-denied" ||
        error?.message?.includes("permission")
      ) {
        handleFirestoreError(error, OperationType.LIST, AUDIT_PATH);
      }
    },
  );
}

export async function createStudent(
  data: Omit<StudentRecord, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Authentication required to register student record.");
  }

  const cleanApaar = data.apaarId.replace(/\D/g, "");
  const studentId = `std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const record: StudentRecord = {
    ...data,
    id: studentId,
    apaarId: cleanApaar,
    apaarMasked: data.apaarMasked || maskApaarId(cleanApaar),
    submittedBy: currentUser.uid,
    submittedByName: currentUser.displayName || currentUser.email || "Institution User",
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, STUDENTS_PATH, studentId), record);
    await createAuditLog(
      "create_student",
      studentId,
      `Enrolled ${data.name} in ${data.program} (${data.institution})`,
    );
    return studentId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${STUDENTS_PATH}/${studentId}`);
  }
}

export async function updateStudent(
  studentId: string,
  updates: Partial<StudentRecord>,
): Promise<void> {
  const path = `${STUDENTS_PATH}/${studentId}`;
  try {
    const updatedPayload = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(doc(db, STUDENTS_PATH, studentId), updatedPayload);
    await createAuditLog(
      "update_student",
      studentId,
      `Updated details for student record ${studentId}`,
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateStudentStatus(
  studentId: string,
  newStatus: ValidationStatus,
  reason?: string,
): Promise<void> {
  const path = `${STUDENTS_PATH}/${studentId}`;
  try {
    const payload: Partial<StudentRecord> = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    if (reason !== undefined) {
      payload.flagReason = reason;
    }
    if (newStatus === "verified") {
      payload.isDuplicateCandidate = false;
      payload.completeness = 100;
    }
    await updateDoc(doc(db, STUDENTS_PATH, studentId), payload);
    await createAuditLog(
      "status_transition",
      studentId,
      `Changed validation status to ${newStatus}${reason ? `: ${reason}` : ""}`,
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteStudent(studentId: string, studentName: string): Promise<void> {
  const path = `${STUDENTS_PATH}/${studentId}`;
  try {
    await deleteDoc(doc(db, STUDENTS_PATH, studentId));
    await createAuditLog("delete_student", studentId, `Archived/deleted record for ${studentName}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// The 14 Engineering Colleges for Madurai District & Nearby Border Areas
export const MADURAI_ENGINEERING_COLLEGES: Array<
  Omit<InstitutionRecord, "enrolledCount" | "verifiedCount" | "updatedAt">
> = [
  // 1. Main Colleges
  {
    id: "col_tce_madurai",
    name: "Thiagarajar College of Engineering (TCE)",
    location: "Thiruparankundram, Madurai",
    category: "Main Colleges",
    collegeType: "Government-Aided / Autonomous",
    district: "Madurai",
    verificationStatus: "Verified",
    approvedIntake: 960,
  },
  {
    id: "col_vcet_madurai",
    name: "Velammal College of Engineering & Technology (VCET)",
    location: "Viraganoor, Madurai",
    category: "Main Colleges",
    collegeType: "Autonomous / Self-Financing",
    district: "Madurai",
    verificationStatus: "Verified",
    approvedIntake: 660,
  },

  // 2. Other Private Engineering Colleges
  {
    id: "col_solamalai_madurai",
    name: "Solamalai College of Engineering",
    location: "Veerapanjan, Madurai",
    category: "Other Private Engineering Colleges",
    collegeType: "Private / Self-Financing",
    district: "Madurai",
    verificationStatus: "Verified",
    approvedIntake: 420,
  },
  {
    id: "col_ptr_madurai",
    name: "P.T.R. College of Engineering and Technology",
    location: "Thanakkankulam, Madurai",
    category: "Other Private Engineering Colleges",
    collegeType: "Private / Self-Financing",
    district: "Madurai",
    verificationStatus: "Verified",
    approvedIntake: 300,
  },
  {
    id: "col_srm_madurai",
    name: "SRM Madurai College for Engineering and Technology (formerly Raja College)",
    location: "Sivagangai Road, Madurai",
    category: "Other Private Engineering Colleges",
    collegeType: "Private / Self-Financing",
    district: "Madurai",
    verificationStatus: "Verified",
    approvedIntake: 360,
  },
  {
    id: "col_fatima_michael_madurai",
    name: "Fatima Michael College of Engineering and Technology",
    location: "Madurai - Sivagangai Main Road, Madurai",
    category: "Other Private Engineering Colleges",
    collegeType: "Private / Self-Financing",
    district: "Madurai",
    verificationStatus: "Verified",
    approvedIntake: 300,
  },
  {
    id: "col_mangayarkarasi_paravai",
    name: "Mangayarkarasi College of Engineering",
    location: "Paravai, Madurai",
    category: "Other Private Engineering Colleges",
    collegeType: "Private / Self-Financing",
    district: "Madurai",
    verificationStatus: "Verified",
    approvedIntake: 240,
  },
  {
    id: "col_sacs_mavmm_alagar",
    name: "SACS M.A.V.M.M. Engineering College",
    location: "Alagar Kovil, Madurai",
    category: "Other Private Engineering Colleges",
    collegeType: "Private / Self-Financing",
    district: "Madurai",
    verificationStatus: "Verified",
    approvedIntake: 240,
  },
  {
    id: "col_ultra_madurai",
    name: "Ultra College of Engineering and Technology",
    location: "Madurai - Chennai Highway, Madurai",
    category: "Other Private Engineering Colleges",
    collegeType: "Private / Self-Financing",
    district: "Madurai",
    verificationStatus: "Verified",
    approvedIntake: 240,
  },
  {
    id: "col_vaigai_thoppur",
    name: "Vaigai College of Engineering",
    location: "Thoppur, Madurai",
    category: "Other Private Engineering Colleges",
    collegeType: "Private / Self-Financing",
    district: "Madurai",
    verificationStatus: "Verified",
    approvedIntake: 240,
  },
  {
    id: "col_latha_mathavan_melur",
    name: "Latha Mathavan Engineering College",
    location: "Melur, Madurai",
    category: "Other Private Engineering Colleges",
    collegeType: "Private / Self-Financing",
    district: "Madurai",
    verificationStatus: "Verified",
    approvedIntake: 240,
  },

  // 3. Nearby Border-Area Colleges
  {
    id: "col_klnce_pottapalayam",
    name: "K.L.N. College of Engineering (KLNCE)",
    location: "Pottapalayam (near the Sivagangai border)",
    category: "Nearby Border-Area Colleges",
    collegeType: "Autonomous / Self-Financing",
    district: "Sivagangai Border",
    verificationStatus: "Verified",
    approvedIntake: 600,
  },
  {
    id: "col_sethu_kariapatti",
    name: "Sethu Institute of Technology (SIT)",
    location: "Kariapatti (near the Virudhunagar border)",
    category: "Nearby Border-Area Colleges",
    collegeType: "Autonomous / Self-Financing",
    district: "Virudhunagar Border",
    verificationStatus: "Verified",
    approvedIntake: 600,
  },
  {
    id: "col_kamaraj_vellakulam",
    name: "Kamaraj College of Engineering and Technology (KCET)",
    location: "S.P.G.C. Nagar, K. Vellakulam (near Virudhunagar border)",
    category: "Nearby Border-Area Colleges",
    collegeType: "Autonomous / Self-Financing",
    district: "Virudhunagar Border",
    verificationStatus: "Verified",
    verificationDetails:
      "Location verified: S.P.G. Chidambara Nadar - C. Nagammal Campus, S.P.G.C. Nagar, K. Vellakulam (Madurai - Virudhunagar Highway, Virudhunagar District).",
    approvedIntake: 540,
  },
];

// Synchronize all 14 Madurai engineering colleges to Firestore
export async function syncMaduraiCollegesToFirestore(): Promise<{
  successCount: number;
  totalCount: number;
  colleges: string[];
}> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Authentication required to synchronize colleges to Cloud Firestore.");
  }

  const now = new Date().toISOString();
  let successCount = 0;
  const savedNames: string[] = [];

  for (const col of MADURAI_ENGINEERING_COLLEGES) {
    const docRef = doc(db, INSTITUTIONS_PATH, col.id);
    const docSnap = await getDoc(docRef);

    const record: InstitutionRecord = {
      ...col,
      enrolledCount: docSnap.exists() ? (docSnap.data()["enrolledCount"] ?? 0) : 0,
      verifiedCount: docSnap.exists() ? (docSnap.data()["verifiedCount"] ?? 0) : 0,
      updatedAt: now,
    };

    try {
      await setDoc(docRef, record, { merge: true });
      successCount++;
      savedNames.push(col.name);
    } catch (err) {
      console.error(`Failed to save college ${col.name}:`, err);
      handleFirestoreError(err, OperationType.WRITE, `${INSTITUTIONS_PATH}/${col.id}`);
    }
  }

  await createAuditLog(
    "sync_colleges",
    "all_colleges",
    `Synchronized ${successCount} Madurai engineering colleges into Firestore registry.`,
  );

  return { successCount, totalCount: MADURAI_ENGINEERING_COLLEGES.length, colleges: savedNames };
}

// Add a new college record dynamically
export async function createCollege(
  data: Omit<InstitutionRecord, "id" | "enrolledCount" | "verifiedCount" | "updatedAt">,
): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Authentication required to register a college.");
  }

  const collegeId = `col_${data.name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .slice(0, 24)}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const record: InstitutionRecord = {
    ...data,
    id: collegeId,
    enrolledCount: 0,
    verifiedCount: 0,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, INSTITUTIONS_PATH, collegeId), record);
    await createAuditLog(
      "create_college",
      collegeId,
      `Registered college ${data.name} in ${data.category}`,
    );
    return collegeId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${INSTITUTIONS_PATH}/${collegeId}`);
  }
}

// Initial seed helper to populate realistic institutional data if Firestore is currently empty
export async function seedInitialDataIfEmpty(): Promise<boolean> {
  const currentUser = auth.currentUser;
  if (!currentUser) return false;

  try {
    // Sync all Madurai colleges
    await syncMaduraiCollegesToFirestore();

    const snap = await getDocs(query(collection(db, STUDENTS_PATH), limit(1)));
    if (!snap.empty) {
      return true; // Colleges synced, students already exist
    }

    // Seed initial batch of realistic student records from Madurai institutions
    const initialStudents: Array<Omit<StudentRecord, "id" | "createdAt" | "updatedAt">> = [
      {
        apaarId: "109848214901",
        apaarMasked: "1••• •••• 4901",
        name: "Ananya Menon",
        email: "ananya.menon@student.tce.edu",
        program: "B.Tech Computer Science",
        institution: "Thiagarajar College of Engineering (TCE)",
        institutionId: "col_tce_madurai",
        intakeYear: 2025,
        status: "verified",
        completeness: 100,
        submittedBy: currentUser.uid,
        submittedByName: currentUser.displayName || currentUser.email || "Registrar Office",
        isDuplicateCandidate: false,
      },
      {
        apaarId: "128471928374",
        apaarMasked: "1••• •••• 8374",
        name: "Karthik Sharma",
        email: "karthik.s@vcet.ac.in",
        program: "M.Tech Electronics",
        institution: "Velammal College of Engineering & Technology (VCET)",
        institutionId: "col_vcet_madurai",
        intakeYear: 2026,
        status: "flagged",
        completeness: 88,
        submittedBy: currentUser.uid,
        submittedByName: currentUser.displayName || currentUser.email || "Admissions Cell",
        isDuplicateCandidate: true,
        flagReason: "Duplicate candidate detected: similar name & roll code in regional intake.",
      },
      {
        apaarId: "192837461029",
        apaarMasked: "1••• •••• 1029",
        name: "Aarav Patel",
        email: "aarav.p@klnce.edu",
        program: "B.Sc Data Science",
        institution: "K.L.N. College of Engineering (KLNCE)",
        institutionId: "col_klnce_pottapalayam",
        intakeYear: 2026,
        status: "pending",
        completeness: 75,
        submittedBy: currentUser.uid,
        submittedByName: currentUser.displayName || currentUser.email || "Admissions Cell",
        isDuplicateCandidate: false,
      },
      {
        apaarId: "182930491823",
        apaarMasked: "1••• •••• 1823",
        name: "Diya Iyer",
        email: "diya.iyer@sethu.ac.in",
        program: "B.Tech Computer Science",
        institution: "Sethu Institute of Technology (SIT)",
        institutionId: "col_sethu_kariapatti",
        intakeYear: 2025,
        status: "verified",
        completeness: 100,
        submittedBy: currentUser.uid,
        submittedByName: currentUser.displayName || currentUser.email || "Registrar Office",
        isDuplicateCandidate: false,
      },
      {
        apaarId: "148291039482",
        apaarMasked: "1••• •••• 9482",
        name: "Rohan Bose",
        email: "rohan.b@solamalai.ac.in",
        program: "B.Tech Computer Science",
        institution: "Solamalai College of Engineering",
        institutionId: "col_solamalai_madurai",
        intakeYear: 2026,
        status: "incomplete",
        completeness: 45,
        submittedBy: currentUser.uid,
        submittedByName: currentUser.displayName || currentUser.email || "Admissions Cell",
        isDuplicateCandidate: false,
        flagReason: "Missing high school qualifying marksheet and identity cross-reference.",
      },
      {
        apaarId: "173928194012",
        apaarMasked: "1••• •••• 4012",
        name: "Meera Sundaram",
        email: "m.sundaram@tce.edu",
        program: "B.Tech Computer Science",
        institution: "Thiagarajar College of Engineering (TCE)",
        institutionId: "col_tce_madurai",
        intakeYear: 2026,
        status: "pending",
        completeness: 85,
        submittedBy: currentUser.uid,
        submittedByName: currentUser.displayName || currentUser.email || "Registrar Office",
        isDuplicateCandidate: false,
      },
      {
        apaarId: "163829104928",
        apaarMasked: "1••• •••• 4928",
        name: "Vignesh Kumar",
        email: "vignesh.k@kamarajengg.edu.in",
        program: "M.Tech Electronics",
        institution: "Kamaraj College of Engineering and Technology (KCET)",
        institutionId: "col_kamaraj_vellakulam",
        intakeYear: 2025,
        status: "verified",
        completeness: 100,
        submittedBy: currentUser.uid,
        submittedByName: currentUser.displayName || currentUser.email || "Registrar Office",
        isDuplicateCandidate: false,
      },
    ];

    for (const student of initialStudents) {
      await createStudent(student);
    }

    return true;
  } catch (err) {
    console.error("Error seeding initial data:", err);
    return false;
  }
}
