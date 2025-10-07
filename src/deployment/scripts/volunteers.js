import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPtb60dthvTPLmaRlL_E7YOsBDIAK-vKw",
  authDomain: "sample-79b30.firebaseapp.com",
  projectId: "sample-79b30",
  storageBucket: "sample-79b30.firebasestorage.app",
  messagingSenderId: "12884863424",
  appId: "1:12884863424:web:277b044f4005f7d80fc025",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Track shown alerts for the current session
const shownAlerts = new Set(
  JSON.parse(sessionStorage.getItem("shownAlerts") || "[]")
);

// Function to listen for new SOS alerts
const listenForSOSAlerts = () => {
  const sosCollection = collection(db, "sos_reports");
  const sosQuery = query(sosCollection, orderBy("timestamp", "desc"));

  onSnapshot(sosQuery, (snapshot) => {
    const loadingRow = document.querySelector("#loading-row");
    const noDataRow = document.querySelector("#no-data-row");

    if (loadingRow) loadingRow.remove();

    if (snapshot.empty) {
      if (noDataRow) noDataRow.classList.remove("hidden");
      return;
    }

    let hasVolunteer = false;

    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const reportId = change.doc.id;
        const report = change.doc.data();

        const isValidVolunteer =
          report.phone &&
          report.user &&
          report.incidentType && report.timestamp !== "none"

        if (isValidVolunteer) {
          hasVolunteer = true;
          appendToTable(report);
        }

        // Show alert only once per session
        if (!shownAlerts.has(reportId)) {
          shownAlerts.add(reportId);
          sessionStorage.setItem(
            "shownAlerts",
            JSON.stringify([...shownAlerts])
          );
        }
      }
    });

    // Show or hide the "No volunteers available..." row
    if (noDataRow) {
      if (hasVolunteer) {
        noDataRow.classList.add("hidden");
      } else {
        noDataRow.classList.remove("hidden");
        const noDataMessage = noDataRow.querySelector("td");
        if (noDataMessage) {
          noDataMessage.textContent =
            "No volunteers available as of this moment";
        }
      }
    }
  });
};

// Authentication check
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Admin is authenticated:", user.email);
    listenForSOSAlerts();
  } else {
    console.warn("No admin is logged in. Firestore access restricted.");
  }
});

// Add a report to the table
const appendToTable = (report) => {
  const tableBody = document.querySelector("table tbody");

  if (!tableBody) {
    console.error("Table body not found.");
    return;
  }

  const row = document.createElement("tr");
  let status = report.status || 'unread';
  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
  const timestamp = new Date(report.timestamp.toDate()).toLocaleString();
  let statusColor;

  switch (status) {
    case "validated":
      statusColor = "bg-blue-600";
      break;
    case "ongoing":
    case "on the way":
    case "arrived":
    case "completed":
      statusColor = "bg-orange-600";
      break;
    case "resolved":
      statusColor = "bg-green-600";
      break;
    case "canceled":
      statusColor = "bg-red-600";
      break;
    default:
      statusColor = "bg-gray-400";
      break;
  }

  row.innerHTML = `
    <td id = 'national-park' class="p-3 text-center border-b">${
      report.user || "N/A"
    }</td>
    <td id = 'national-park' class="p-3 text-center border-b">${
      report.address || "N/A"
    }</td>
    <td id = 'national-park' class="p-3 text-center border-b">${
      report.phone || "N/A"
    }</td>
    <td id = 'national-park' class="p-3 text-center border-b">${
      report.incidentType || "N/A"
    }</td>
    <td id = 'national-park' class="p-3 text-center border-b">${timestamp}</td>
    <td id = 'national-park' class="p-3 text-center border-b">
      <span class="px-2 py-1 rounded inline-block text-white ${statusColor}">${displayStatus}</span> 
    </td>

  `;

  tableBody.appendChild(row);
};
