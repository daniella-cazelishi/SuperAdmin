// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPtb60dthvTPLmaRlL_E7YOsBDIAK-vKw",
  authDomain: "sample-79b30.firebaseapp.com",
  projectId: "sample-79b30",
  storageBucket: "sample-79b30.appspot.com",
  messagingSenderId: "12884863424",
  appId: "1:12884863424:web:277b044f4005f7d80fc025",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ Allowed Admin Credentials
const ADMIN_EMAIL = "bantayteam72.admin@gmail.com";
const ADMIN_PASSWORD = "Sb72!Secure#2025";

// DOM elements
const loginForm = document.getElementById("login-form");
const forgotPasswordLink = document.getElementById("forgot-password-link");
const forgotPasswordModal = document.getElementById("forgot-password-modal");
const cancelResetBtn = document.getElementById("cancel-reset");
const submitResetBtn = document.getElementById("submit-reset");
const resetEmailInput = document.getElementById("reset-email");

// Handle login form submission
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  try {
    // ✅ First check if email matches your admin account
    if (email !== ADMIN_EMAIL) {
      alert("Access denied: Only Admin is allowed.");
      return;
    }

    // ✅ Use Firebase Auth to validate login
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // ✅ Double check the password
    if (password !== ADMIN_PASSWORD) {
      alert("Access denied: Incorrect password for Admin.");
      await auth.signOut();
      return;
    }

    // ✅ Redirect to Admin Dashboard
    window.location.href = "/src/admin.html";
  } catch (error) {
    console.error("Login error:", error);
    alert("Login failed: " + error.message);
  }
});

// Handle forgot password link click
forgotPasswordLink.addEventListener("click", (e) => {
  e.preventDefault();
  resetEmailInput.value = "";
  forgotPasswordModal.classList.remove("hidden");
  resetEmailInput.focus();
});

// Cancel password reset modal
cancelResetBtn.addEventListener("click", () => {
  forgotPasswordModal.classList.add("hidden");
});

// Submit password reset request
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

// Close modal when clicking outside the box
forgotPasswordModal.addEventListener("click", (e) => {
  if (e.target === forgotPasswordModal) {
    forgotPasswordModal.classList.add("hidden");
  }
});
