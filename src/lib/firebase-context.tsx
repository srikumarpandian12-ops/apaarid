import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, logOut, signInWithGoogle, testConnection } from "./firebase";
import type { UserProfile } from "./student-service";

interface AuthContextValue {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  role: "admin" | "institution" | "student";
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateRole: (
    role: "admin" | "institution" | "student",
    institutionName?: string,
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate connection to Firestore on initial boot
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const profile = userDoc.data() as UserProfile;
            setUserProfile(profile);
            if (typeof window !== "undefined") {
              localStorage.setItem(`apaar_profile_${firebaseUser.uid}`, JSON.stringify(profile));
            }
          } else {
            // Check if user is bootstrapped admin or default to institution role
            const isDefaultAdmin =
              firebaseUser.email === "srikumarpandian12@gmail.com" ||
              firebaseUser.email?.endsWith("@aicte-india.org");

            const initialRole: "admin" | "institution" | "student" = isDefaultAdmin
              ? "admin"
              : "institution";

            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              role: initialRole,
              institutionName: isDefaultAdmin
                ? "National Oversight Directorate"
                : "Aravalli Institute of Technology",
              createdAt: new Date().toISOString(),
            };

            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
            if (typeof window !== "undefined") {
              localStorage.setItem(`apaar_profile_${firebaseUser.uid}`, JSON.stringify(newProfile));
            }

            // Also record in admins collection if admin
            if (initialRole === "admin") {
              await setDoc(doc(db, "admins", firebaseUser.uid), {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                assignedAt: new Date().toISOString(),
              });
            }
          }
        } catch (err) {
          console.warn(
            "Cloud Firestore user profile lookup note (operating in offline/cached mode):",
            err,
          );
          try {
            const cachedStr =
              typeof window !== "undefined"
                ? localStorage.getItem(`apaar_profile_${firebaseUser.uid}`)
                : null;
            if (cachedStr) {
              setUserProfile(JSON.parse(cachedStr));
            } else {
              const isDefaultAdmin =
                firebaseUser.email === "srikumarpandian12@gmail.com" ||
                firebaseUser.email?.endsWith("@aicte-india.org");
              const fallbackProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName || "",
                role: isDefaultAdmin ? "admin" : "institution",
                institutionName: isDefaultAdmin
                  ? "National Oversight Directorate"
                  : "Aravalli Institute of Technology",
                createdAt: new Date().toISOString(),
              };
              setUserProfile(fallbackProfile);
            }
          } catch {
            // Storage access fallback
          }
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Sign-in failed:", err);
      throw err;
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (err) {
      console.error("Sign-out failed:", err);
      throw err;
    }
  };

  const updateRole = async (
    role: "admin" | "institution" | "student",
    institutionName?: string,
  ) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      const updatedProfile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        role,
        institutionName:
          institutionName || userProfile?.institutionName || "Aravalli Institute of Technology",
        createdAt: userProfile?.createdAt || new Date().toISOString(),
      };
      await setDoc(userDocRef, updatedProfile, { merge: true });

      if (role === "admin") {
        await setDoc(doc(db, "admins", user.uid), {
          uid: user.uid,
          email: user.email,
          updatedAt: new Date().toISOString(),
        });
      }

      setUserProfile(updatedProfile);
    } catch (err) {
      console.error("Failed to update user role:", err);
      throw err;
    }
  };

  const isAdmin = userProfile?.role === "admin" || user?.email === "srikumarpandian12@gmail.com";

  const effectiveRole = userProfile?.role || (isAdmin ? "admin" : "institution");

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAdmin,
        role: effectiveRole,
        signIn: handleSignIn,
        signOut: handleSignOut,
        updateRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
