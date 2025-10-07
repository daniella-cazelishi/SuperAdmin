// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// --------------------
// Firebase Config
// --------------------
const firebaseConfig = {
  apiKey: "AIzaSyBPtb60dthvTPLmaRlL_E7YOsBDIAK-vKw",
  authDomain: "sample-79b30.firebaseapp.com",
  projectId: "sample-79b30",
  storageBucket: "sample-79b30.appspot.com",
  messagingSenderId: "12884863424",
  appId: "1:12884863424:web:277b044f4005f7d80fc025"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --------------------
// DOM Elements
// --------------------
const userTableBody = document.getElementById("userTableBody");
const loadingRow = document.getElementById("loading-row");
const noDataRow = document.getElementById("no-data-row");
const searchInput = document.getElementById("searchInput");

// --------------------
// Real-time listener for verifications
// --------------------
const usersQuery = query(collection(db, "verifications"), orderBy("timestamp", "desc"));

onSnapshot(usersQuery, (snapshot) => {
  // Clear previous rows
  userTableBody.innerHTML = "";

  if (snapshot.empty) {
    noDataRow.classList.remove("hidden");
    userTableBody.appendChild(noDataRow);
    return;
  }

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    // Status color
    const statusColor =
      data.status === "Verified"
        ? "text-green-600 dark:text-green-400"
        : data.status === "Rejected"
        ? "text-red-600 dark:text-red-400"
        : "text-gray-700 dark:text-gray-400";

    // Format timestamp
    const dateRegistered = data.timestamp
      ? new Date(data.timestamp.seconds * 1000).toLocaleString()
      : "";

    // Create row
    const row = document.createElement("tr");
    row.className = "hover:bg-gray-100 dark:hover:bg-gray-800";

    row.innerHTML = `
      <td class="px-6 py-4">${data.fullname || ""}</td>
      <td class="px-6 py-4">${data.address || ""}</td>
      <td class="px-6 py-4">${data.phone || ""}</td>
      <td class="px-6 py-4">${data.email || ""}</td>
      <td class="px-6 py-4">${dateRegistered}</td>
      <td class="px-6 py-4 font-semibold ${statusColor}">${data.status || ""}</td>
    `;

    userTableBody.appendChild(row);
  });
});

// --------------------
// Search Filter
// --------------------
searchInput.addEventListener("input", () => {
  const filter = searchInput.value.toLowerCase();
  const rows = userTableBody.querySelectorAll("tr");

  let visibleCount = 0;
  rows.forEach(row => {
    if (row.id === "no-data-row") return; // skip the no-data-row
    const text = row.textContent.toLowerCase();
    const isMatch = text.includes(filter);
    row.style.display = isMatch ? "" : "none";
    if (isMatch) visibleCount++;
  });

  // Show no-data-row if nothing matches filter
  if (visibleCount === 0) {
    noDataRow.classList.remove("hidden");
  } else {
    noDataRow.classList.add("hidden");
  }
});
