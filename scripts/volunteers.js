import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

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

// Listen for new volunteer incidents
const listenForSOSAlerts = () => {
  const sosCollection = collection(db, "volunteers");
  const sosQuery = query(
    sosCollection,
    where("volunteer", "==", true),
    orderBy("date", "desc")
  );

  onSnapshot(sosQuery, (snapshot) => {
    const loadingRow = document.querySelector("#loading-row");
    const noDataRow = document.querySelector("#no-data-row");

    if (loadingRow) loadingRow.remove();

    if (snapshot.empty) {
      if (noDataRow) noDataRow.classList.remove("hidden");
      return;
    }

    // Use Map to avoid duplicate entries per volunteerId
    const volunteersMap = new Map();

    snapshot.forEach((doc) => {
      const report = doc.data();
      const volunteerId = report.volunteerId;
      const volName = report.volunteerName || "Unknown Volunteer";

      if (!volunteerId) return; // skip if missing ID

      if (!volunteersMap.has(volunteerId)) {
        volunteersMap.set(volunteerId, {
          volunteerName: volName,
          address: report.address,
          contactInfo: report.contactInfo,
          incidents: [report.assignedIncident || "N/A"],
          dates: [report.date],
          statuses: [report.status || "unread"],
        });
      } else {
        const vol = volunteersMap.get(volunteerId);
        vol.incidents.push(report.assignedIncident || "N/A");
        vol.dates.push(report.date);
        vol.statuses.push(report.status || "unread");
      }
    });

    const tableBody = document.querySelector("table tbody");
    tableBody.innerHTML = ""; // clear existing rows

    volunteersMap.forEach((volunteer, volunteerId) => {
      appendVolunteerRow(volunteer, volunteerId);
    });

    if (noDataRow) {
      if (volunteersMap.size > 0) {
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

const appendVolunteerRow = (volunteer, volunteerId) => {
  const tableBody = document.querySelector("table tbody");
  if (!tableBody) return;

  // Get latest incident info (last element)
  const lastIndex = volunteer.incidents.length - 1;
  const latestIncident = volunteer.incidents[lastIndex] || "N/A";
  const latestDate = volunteer.dates[lastIndex]
    ? new Date(volunteer.dates[lastIndex].toDate()).toLocaleString()
    : "N/A";
  const lastStatus = volunteer.statuses[lastIndex] || "unread";

  let statusColor;
  switch (lastStatus) {
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

  // Count how many other incidents besides latest
  const otherIncidentsCount = volunteer.incidents.length - 1;

  // Main row
  const row = document.createElement("tr");
  row.classList.add("volunteer-main-row");
  row.dataset.volunteerId = volunteerId;
  row.innerHTML = `
    <td class="p-3 text-center border-b cursor-pointer">${volunteer.volunteerName}</td>
    <td class="p-3 text-center border-b">${volunteer.address || "N/A"}</td>
    <td class="p-3 text-center border-b">${volunteer.contactInfo || "N/A"}</td>
    <td class="p-3 text-center border-b">${latestIncident}</td>
    <td class="p-3 text-center border-b">${latestDate}</td>
    <td class="p-3 text-center border-b status-cell">
      <span class="rounded inline-block text-center px-3 py-1 text-white ${statusColor}">
        ${lastStatus.charAt(0).toUpperCase() + lastStatus.slice(1)}
      </span>
    </td>
<td class="p-3 text-center border-b">
  ${
    otherIncidentsCount > 0
      ? `<button class="expand-btn rounded px-3 py-1 bg-yellow-600 text-white hover:bg--700 transition-colors cursor-pointer select-none text-sm">
           +${otherIncidentsCount} more
         </button>`
      : ""
  }
</td>



  `;
  tableBody.appendChild(row);

  // If has other incidents, add hidden rows for details
  if (otherIncidentsCount > 0) {
    for (let i = 0; i < otherIncidentsCount; i++) {
      const incidentIndex = i; // earlier incidents
      const incident = volunteer.incidents[incidentIndex];
      const date = volunteer.dates[incidentIndex]
        ? new Date(volunteer.dates[incidentIndex].toDate()).toLocaleString()
        : "N/A";
      const status = volunteer.statuses[incidentIndex] || "unread";

      let statusColorSmall;
      switch (status) {
        case "validated":
          statusColorSmall = "bg-blue-400";
          break;
        case "ongoing":
        case "on the way":
        case "arrived":
        case "completed":
          statusColorSmall = "bg-orange-400";
          break;
        case "resolved":
          statusColorSmall = "bg-green-400";
          break;
        case "canceled":
          statusColorSmall = "bg-red-400";
          break;
        default:
          statusColorSmall = "bg-gray-300";
          break;
      }

      const detailRow = document.createElement("tr");
      detailRow.classList.add("volunteer-detail-row", "hidden");
      detailRow.dataset.parentId = volunteerId;
      detailRow.innerHTML = `
        <td class="p-3 border-b" colspan="3" style="text-align: right; font-style: italic; color: #555;">
          Other Incident:
        </td>
        <td class="p-3 border-b">${incident}</td>
        <td class="p-3 border-b">${date}</td>
        <td class="p-3 border-b">
          <span class="rounded inline-block text-center px-3 py-1 text-white ${statusColorSmall}">
            ${status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </td>
        <td class="border-b"></td>
      `;
      tableBody.appendChild(detailRow);
    }
  }
};

// Toggle other incidents rows on expand button click
document.querySelector("table tbody").addEventListener("click", (e) => {
  if (e.target.classList.contains("expand-btn")) {
    const mainRow = e.target.closest("tr");
    const volunteerId = mainRow.dataset.volunteerId;

    // Toggle all detail rows with matching parentId
    const detailRows = document.querySelectorAll(
      `tr.volunteer-detail-row[data-parent-id="${volunteerId}"]`
    );
    detailRows.forEach((row) => {
      row.classList.toggle("hidden");
    });

    // Toggle button text
    if (e.target.textContent.startsWith("+")) {
      e.target.textContent = e.target.textContent.replace("+", "−") + " less";
    } else {
      e.target.textContent = e.target.textContent.replace("−", "+").replace(" less", "");
    }
  }
});

// Start listening when the user is authenticated
onAuthStateChanged(auth, (user) => {
  if (user) {
    listenForSOSAlerts();
  }
});
