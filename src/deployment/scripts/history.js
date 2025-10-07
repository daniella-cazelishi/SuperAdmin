import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  where,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBPtb60dthvTPLmaRlL_E7YOsBDIAK-vKw",
  authDomain: "sample-79b30.firebaseapp.com",
  projectId: "sample-79b30",
  storageBucket: "sample-79b30.firebasestorage.app",
  messagingSenderId: "12884863424",
  appId: "1:12884863424:web:277b044f4005f7d80fc025",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Render function with optional filter
const renderHistory = async (filter = null) => {
  const tableBody = document.querySelector("table tbody");
  const loadingRow = document.querySelector("#loading-row");
  const noDataRow = document.querySelector("#no-data-row");

  // Clear previous rows
  tableBody.innerHTML = "";

  let q;
  const reportsRef = collection(db, "resolved_reports");

  if (filter === "weekly" || filter === "monthly") {
    const now = new Date();
    let pastDate = new Date();

    if (filter === "weekly") {
      pastDate.setDate(now.getDate() - 7);
    } else if (filter === "monthly") {
      pastDate.setMonth(now.getMonth() - 1);
    }

    q = query(
      reportsRef,
      where("timestamp", ">=", pastDate),
      orderBy("timestamp", "desc")
    );
  } else {
    q = query(reportsRef, orderBy("timestamp", "desc"));
  }

  const snapshot = await getDocs(q);

  if (loadingRow) loadingRow.remove();
  if (snapshot.empty) {
    if (noDataRow) noDataRow.classList.remove("hidden");
    return;
  } else {
    if (noDataRow) noDataRow.classList.add("hidden");
  }

  snapshot.forEach((docSnap) => {
    const report = docSnap.data();
    const timestamp = report.timestamp?.toDate?.().toLocaleString() || "N/A";
    const status = report.status || "unknown";
    const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
    const statusColor =
      status === "validated"
        ? "bg-blue-600"
        : status === "resolved"
        ? "bg-green-600"
        : status === "canceled"
        ? "bg-red-600"
        : "bg-gray-400";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="p-3 text-center border-b">${report.incidentType || "N/A"}</td>
      <td class="p-3 text-center border-b">${report.username || "N/A"}</td>
      <td class="p-3 text-center border-b">${report.volunteer || "N/A"}</td>
      <td class="p-3 text-center border-b">${report.message || "N/A"}</td>
      <td class="p-3 text-center border-b">${timestamp}</td>
      <td class="p-3 text-center border-b">
        <span class="px-2 py-1 rounded text-white ${statusColor}">${displayStatus}</span>
      </td>
    `;
    tableBody.appendChild(row);
  });
};

// Auth check
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Viewing history as:", user.email);
    renderHistory(); // Load all by default

    // Handle sort filter change
    const sortSelect = document.getElementById("sortFilter");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        const selectedFilter = e.target.value;
        renderHistory(selectedFilter); // Reload based on selection
      });
    }
  } else {
    console.warn("Not logged in. Cannot access history.");
  }
});

// PDF Export Button
document.addEventListener("DOMContentLoaded", () => {
  const exportBtn = document.getElementById("exportPdfBtn");

  if (exportBtn) {
    exportBtn.addEventListener("click", async () => {
      const table = document.getElementById("reportTable");

      if (!table) {
        alert("Report table not found!");
        return;
      }

      const canvas = await html2canvas(table, {
        scale: 2,
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jspdf.jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("report-history.pdf");
    });
  }
});
