import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot, limit } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Firebase config
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
const db = getFirestore(app);
const auth = getAuth(app);

// DOM
const notificationList = document.getElementById("notification-list");
const clearButton = document.getElementById("clear-notifications");
const audio = document.getElementById("notification-sound");

let canPlayAudio = false;

// Attempt to unlock audio silently on load
window.addEventListener("load", () => {
  audio.volume = 0; // mute for silent unlock
  audio.play()
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 1;
      canPlayAudio = true;
      console.log("Audio unlocked silently");
    })
    .catch(() => {
      console.log("Silent autoplay failed, waiting for first interaction");
    });
});

// Fallback: unlock on first click/tap
document.body.addEventListener("click", unlockAudio, { once: true });
document.body.addEventListener("touchstart", unlockAudio, { once: true });

function unlockAudio() {
  if (canPlayAudio) return;
  canPlayAudio = true;
  console.log("Audio unlocked via interaction");
}

// Play notification sound
function playNotificationSound() {
  if (!canPlayAudio) return;
  audio.currentTime = 0;
  audio.play().catch(err => console.log("Failed to play audio:", err));
}

// Show notification
function showNotification(data) {
  const message = `${data.category || "N/A"} | ${data.user || "N/A"} | ${data.phone || "N/A"} | ${data.emergency || "N/A"} | ${data.location || "N/A"}`;

  // Add to sidebar
  const div = document.createElement("div");
  div.className = "bg-red-100 border border-red-400 text-red-700 p-3 rounded shadow-md";
  div.textContent = message;
  notificationList.prepend(div);

  // Play sound
  playNotificationSound();

  // Show system notification
  if (Notification.permission === "granted") {
    new Notification("New Incident", { body: message });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") new Notification("New Incident", { body: message });
    });
  }
}

// Clear notifications
clearButton.addEventListener("click", () => {
  notificationList.innerHTML = "";
});

// Listen for authenticated user and Firestore updates
onAuthStateChanged(auth, (user) => {
  if (!user) return;

  const q = query(collection(db, "sos_reports"), orderBy("timestamp", "desc"), limit(10));

  onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach(change => {
      if (change.type === "added") {
        const data = change.doc.data();
        showNotification(data);
      }
    });
  });
});
