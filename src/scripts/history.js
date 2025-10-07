// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {
  collection,
  getDocs,
  getFirestore,
  orderBy,
  query,
  where,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Firebase config
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
const auth = getAuth(app);

// Render resolved reports into table
const renderResolvedReports = async (filter = null) => {
  const table = document.getElementById("historyTable");
  if (!table) return console.error("History table not found!");
  const tableBody = table.querySelector("tbody");

  const loadingRow = document.querySelector("#loading-row");
  const noDataRow = document.querySelector("#no-data-row");

  tableBody.innerHTML = ""; // Clear previous rows

  const reportsRef = collection(db, "resolved_reports");
  let q = query(reportsRef, orderBy("timestamp", "desc"));

  if (filter === "weekly" || filter === "monthly") {
    const now = new Date();
    let pastDate = new Date();
    if (filter === "weekly") pastDate.setDate(now.getDate() - 7);
    else if (filter === "monthly") pastDate.setMonth(now.getMonth() - 1);

    q = query(
      reportsRef,
      where("timestamp", ">=", pastDate),
      orderBy("timestamp", "desc")
    );
  }

  let snapshot;
  try {
    snapshot = await getDocs(q);
    console.log("Resolved reports fetched:", snapshot.size);
  } catch (err) {
    console.error("Firestore query failed:", err);
    if (loadingRow) loadingRow.remove();
    return;
  }

  if (loadingRow) loadingRow.remove();

  if (snapshot.empty) {
    console.warn("No resolved reports found");
    if (noDataRow) noDataRow.classList.remove("hidden");
    return;
  } else {
    if (noDataRow) noDataRow.classList.add("hidden");
  }

  snapshot.forEach((docSnap) => {
    const report = docSnap.data();
    const timestamp = report.timestamp?.toDate?.().toLocaleString() || "N/A";
    const status = report.status || "resolved";
    const statusColor = "bg-green-600";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="p-3 text-center border-b">${report.category || "N/A"}</td>
      <td class="p-3 text-center border-b">${report.user || "N/A"}</td>
      <td class="p-3 text-center border-b">${report.message || "N/A"}</td>
      <td class="p-3 text-center border-b">${timestamp}</td>
      <td class="p-3 text-center border-b">
        <span class="px-2 py-1 rounded text-white ${statusColor}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </td>
      <td class="p-3 text-center border-b">
        <button
          class="viewBtn bg-red-600 hover:bg-red-800 text-white px-3 py-1 rounded"
          data-id='${docSnap.id}'
        >
          View
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // View button click
  document.querySelectorAll(".viewBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const reportId = btn.getAttribute("data-id");
      if (!reportId) return alert("Missing report ID!");

      const docRef = doc(db, "resolved_reports", reportId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const report = docSnap.data();
        const timestamp = report.timestamp?.toDate?.().toLocaleString() || "N/A";

        const modal = document.getElementById("detailsModal");
        const modalContent = document.getElementById("modalContent");

        modalContent.innerHTML = `
          <h2 class="text-xl font-bold mb-4">Report Details</h2>
          <p><strong>Type of Incident:</strong> ${report.category || "N/A"}</p>
          <p><strong>Reported By:</strong> ${report.user || "N/A"}</p>
          <p><strong>Message:</strong> ${report.message || "N/A"}</p>
          <p><strong>Status:</strong> ${report.status || "resolved"}</p>
          <p><strong>Date & Time:</strong> ${timestamp}</p>
        `;

        modal.classList.remove("hidden");
      } else {
        alert("Report not found!");
      }
    });
  });
};

// On Auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Viewing resolved reports as:", user.email);
    renderResolvedReports(); // Default load

    const sortSelect = document.getElementById("sortFilter");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        renderResolvedReports(e.target.value);
      });
    }
  } else {
    console.warn("Not logged in. Cannot access resolved reports.");
  }
});

// PDF Export
document.addEventListener("DOMContentLoaded", () => {
  const exportBtn = document.getElementById("exportPdfBtn");
  if (!exportBtn) return;

  exportBtn.addEventListener("click", async () => {
    const table = document.getElementById("historyTable");
    if (!table) {
      alert("Report table not found!");
      return;
    }

    const canvas = await html2canvas(table, { scale: 2, scrollY: -window.scrollY });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jspdf.jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("report-history.pdf");
  });
});

// Close modal
document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("detailsModal").classList.add("hidden");
});

 

// // Function to open modal with animation
// function openModal() {
//   const modal = document.getElementById("detailsModal");
//   modal.classList.remove("hidden");
//   setTimeout(() => {
//     modal.classList.remove("opacity-0");
//     modal.querySelector("div").classList.remove("scale-95");
//   }, 20);
// }

// // Function to close modal with animation
// function closeModal() {
//   const modal = document.getElementById("detailsModal");
//   modal.classList.add("opacity-0");
//   modal.querySelector("div").classList.add("scale-95");

//   setTimeout(() => {
//     modal.classList.add("hidden");
//   }, 300);
// }

// // Event listener for close button
// document.getElementById("closeModal").addEventListener("click", closeModal);

// // Close modal if clicking outside the modal content
// document.getElementById("detailsModal").addEventListener("click", (e) => {
//   if (e.target.id === "detailsModal") {
//     closeModal();
//   }
// });

// // Attach event listeners to view buttons dynamically (after reports rendered)
// document.querySelectorAll(".viewBtn").forEach((btn) => {
//   btn.addEventListener("click", async () => {
//     const reportId = btn.getAttribute("data-id");
//     if (!reportId) return alert("Missing report ID!");

//     const docRef = doc(db, "resolved_reports", reportId);
//     const docSnap = await getDoc(docRef);

//     if (docSnap.exists()) {
//       const report = docSnap.data();
//       const timestamp = report.timestamp?.toDate?.().toLocaleString() || "N/A";

//       const modalContent = document.getElementById("modalContent");
//       modalContent.innerHTML = `
//         <p><strong>Type of Incident:</strong> ${report.incidentType || "N/A"}</p>
//         <p><strong>Reported By:</strong> ${report.user || "N/A"}</p>
//         <p><strong>Message:</strong> ${report.message || "N/A"}</p>
//         <p><strong>With Volunteer:</strong> ${report.volunteer ? "Yes" : "No"}</p>
//         <p><strong>Status:</strong> ${report.status || "N/A"}</p>
//         <p><strong>Date & Time:</strong> ${timestamp}</p>
//       `;

//       openModal();
//     } else {
//       alert("Report not found!");
//     }
//   });
// });