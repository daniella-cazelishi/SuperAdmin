// ✅ Firebase & Firestore Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// 🔑 Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPtb60dthvTPLmaRlL_E7YOsBDIAK-vKw",
  authDomain: "sample-79b30.firebaseapp.com",
  projectId: "sample-79b30",
  storageBucket: "sample-79b30.appspot.com",
  messagingSenderId: "12884863424",
  appId: "1:12884863424:web:277b044f4005f7d80fc025",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ DOM Elements
const notificationList = document.getElementById("notification-list");
const loadingText = document.getElementById("loading-notifications");
const enableSoundBtn = document.getElementById("enable-sound");

// 🔊 Notification Audio
const notificationAudio = new Audio("/src/sounds/relax-message-tone.mp3");
notificationAudio.preload = "auto";
notificationAudio.load();

// 🔓 Enable audio on user interaction
enableSoundBtn?.addEventListener("click", () => {
  notificationAudio
    .play()
    .then(() => {
      notificationAudio.pause();
      notificationAudio.currentTime = 0;
      enableSoundBtn.style.display = "none";
      console.log("✅ Notification sound enabled.");
    })
    .catch((err) => {
      console.warn("⚠️ User blocked audio autoplay:", err);
    });
});

// 🔁 Avoid duplicates
const recentMessages = new Set();

// 🛠 Create styled notification box
function createNotification(message, time) {
  const div = document.createElement("div");
  div.className =
    "bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative shadow-md mb-2";
  div.innerHTML = `
    <strong class="block font-semibold">Alert</strong>
    <span class="block text-sm">${message}</span>
    <span class="block text-xs text-gray-500 mt-1">${new Date(time).toLocaleString()}</span>
  `;
  return div;
}

// 🔔 Show notification & play sound
function notify(message, timestamp = new Date()) {
  if (!notificationList || recentMessages.has(message)) return;

  recentMessages.add(message);

  const notif = createNotification(message, timestamp);
  notificationList.appendChild(notif);
  playSound();

  setTimeout(() => {
    notif.remove();
    recentMessages.delete(message);
  }, 5000);
}

// 🔉 Play sound only if tab is visible
function playSound() {
  if (document.visibilityState === "visible") {
    const audio = new Audio("/src/sounds/poppop.ai - amber alert sound effect.mp3");
    audio.play().catch((error) => {
      console.warn("🔇 Audio play blocked:", error);
    });
  }
}

// 📣 SOS Reports
const sosQuery = query(
  collection(db, "sos_reports"),
  orderBy("timestamp", "desc"),
  limit(10)
);
onSnapshot(sosQuery, (snapshot) => {
  if (loadingText) loadingText.style.display = "none";

  snapshot.docChanges().forEach((change) => {
    if (change.type === "added" || change.type === "modified") {
      const data = change.doc.data();
      const incidentType = data.incidentType?.trim() || "Unspecified incident";
      const location = data.location || "Unknown location";
      const status = data.status || "unknown";
      const user = data.user || "Unknown reporter";
      const timestamp = data.timestamp?.toDate?.() || new Date();

      const message = `📣 Emergency Alert: ${incidentType} reported at ${location}. Status: ${status}. Reported by: ${user}.`;
      notify(message, timestamp);
    }
  });
});

// 👤 Resident Validations
const residentsQuery = query(
  collection(db, "residents"),
  orderBy("createdAt", "desc")
);
onSnapshot(residentsQuery, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    const data = change.doc.data();
    const name = data.name || "Unnamed resident";
    const status = data.status?.toLowerCase() || "";
    const timestamp = data.createdAt?.toDate?.() || new Date();

    let message = "";
    if (change.type === "added" && status === "pending") {
      message = `New pending resident validation: ${name}`;
    } else if (change.type === "modified" && status === "approved") {
      message = `Resident approved: ${name}`;
    } else if (change.type === "modified" && status === "declined") {
      message = `Resident declined: ${name}`;
    }

    if (message) notify(message, timestamp);
  });
});

// 👥 User Registrations
const usersQuery = query(
  collection(db, "users"),
  orderBy("createdAt", "desc")
);
onSnapshot(usersQuery, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === "added") {
      const data = change.doc.data();
      const email = data.email || "Unknown";
      const timestamp = data.createdAt?.toDate?.() || new Date();

      const message = `New user registered: ${email}`;
      notify(message, timestamp);
    }
  });
});

// ⏳ Pending User Approvals
const pendingUsersQuery = query(
  collection(db, "pending_users"),
  orderBy("timestamp", "desc")
);
onSnapshot(pendingUsersQuery, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    const data = change.doc.data();
    const fullname = data.fullname || "Unnamed user";
    const status = data.status?.trim().toLowerCase() || "";
    const timestamp = data.timestamp?.toDate?.() || new Date();

    let message = "";
    if (change.type === "added" && status === "pending") {
      message = `New pending user registration: ${fullname}`;
    } else if (change.type === "modified" && status === "approved") {
      message = `User approved: ${fullname}`;
    } else if (change.type === "modified" && status === "declined") {
      message = `User declined: ${fullname}`;
    }

    if (message) notify(message, timestamp);
  });
});
