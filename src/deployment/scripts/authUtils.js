import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const auth = getAuth();
const db = getFirestore();

/**
 * Checks the user's role and runs appropriate callbacks.
 * @param {Array} allowedRoles - List of allowed roles (e.g., ['super', 'admin'])
 * @param {Function} onAllowed - Callback when role is allowed, receives role
 * @param {Function} onDenied - Callback when role is denied, receives role or null
 */
export function checkUserRole(allowedRoles = [], onAllowed, onDenied) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // Not logged in
      window.location.href = "/index.html";
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "user", user.uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        if (allowedRoles.includes(role)) {
          onAllowed(role);
        } else {
          onDenied(role);
        }
      } else {
        onDenied(null); // User document doesn't exist
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      onDenied(null);
    }
  });
}
