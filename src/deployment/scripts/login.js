import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBPtb60dthvTPLmaRlL_E7YOsBDIAK-vKw",
  authDomain: "sample-79b30.firebaseapp.com",
  projectId: "sample-79b30",
  storageBucket: "sample-79b30.appspot.com",
  messagingSenderId: "12884863424",
  appId: "1:12884863424:web:277b044f4005f7d80fc025",
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Allowed UIDs
const allowedUIDs = {
  super: "tUQcIT3O8vWtovCRCsDiOcIqY4V2",
  admin: "fGR7io5X2YfXcNqKA65HE8zYQfA2",
};

// Elements
const loginForm = document.getElementById("login-form");
const forgotPasswordLink = document.getElementById("forgot-password-link");
const forgotPasswordModal = document.getElementById("forgot-password-modal");
const cancelResetBtn = document.getElementById("cancel-reset");
const submitResetBtn = document.getElementById("submit-reset");
const resetEmailInput = document.getElementById("reset-email");

// LOGIN
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, username, password);
    const user = userCredential.user;

    console.log("User UID:", user.uid);

    // Only allow if user UID is super or admin
    if (user.uid !== allowedUIDs.super && user.uid !== allowedUIDs.admin) {
      alert("Access denied: Only Super Admin and Admin are allowed.");
      await auth.signOut();
      return;
    }

    // Get role from Firestore
    const userDoc = await getDoc(doc(db, "user", user.uid));
    if (!userDoc.exists()) {
      alert("User not found in Firestore.");
      await auth.signOut();
      return;
    }

    const role = userDoc.data()?.role;
    console.log("User Role from Firestore:", role);

if (role === "super") {
  console.log("Redirecting to Super Admin Dashboard...");
  window.location.href = "/src/admin.html";
} else if (role === "admin") {
  console.log("Redirecting to Admin Dashboard...");
  window.location.href = "/src/admin/admin_admin.html";
}


else {
      alert("Access denied: Invalid role.");
      await auth.signOut();
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Login failed: " + error.message);
  }
});

// FORGOT PASSWORD
forgotPasswordLink.addEventListener("click", (e) => {
  e.preventDefault();
  resetEmailInput.value = "";
  forgotPasswordModal.classList.remove("hidden");
  resetEmailInput.focus();
});

cancelResetBtn.addEventListener("click", () => {
  forgotPasswordModal.classList.add("hidden");
});

submitResetBtn.addEventListener("click", async () => {
  const email = resetEmailInput.value.trim();
  if (!email) {
    alert("Please enter your email.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent. Please check your inbox.");
    forgotPasswordModal.classList.add("hidden");
  } catch (error) {
    console.error("Reset password error:", error);
    alert("Error sending reset email: " + error.message);
  }
});

// Close modal if click outside content
forgotPasswordModal.addEventListener("click", (e) => {
  if (e.target === forgotPasswordModal) {
    forgotPasswordModal.classList.add("hidden");
  }
});
