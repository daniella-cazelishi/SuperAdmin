import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
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

// Track the reports already seen
const shownAlerts = new Set(
  JSON.parse(sessionStorage.getItem("shownAlerts") || "[]")
);

// Badge counters
const badgeCounts = { active: 0, validated: 0, canceled: 0, resolved: 0 };

const updateBadgeUI = () => {
  document.getElementById("active-badge").textContent = badgeCounts.active;
  document.getElementById("validated-badge").textContent =
    badgeCounts.validated;
  document.getElementById("canceled-badge").textContent = badgeCounts.canceled;
  document.getElementById("resolved-badge").textContent = badgeCounts.resolved;
};

// Show SOS alert
const showSOSAlert = (report) => {
  alert(
    `🚨 ${report.incidentType}\n\n` +
      `User: ${report.user}\n` +
      `Address: ${report.location}\n` +
      `Message: ${report.message}\n` +
      `Time: ${new Date(report.timestamp.toDate()).toLocaleString()}\n` +
      `Volunteer?: ${report.volunteer == true ? 'Yes' : 'No'}`
  );
};

// Listen for SOS alerts
const listenForSOSAlerts = () => {
  const sosQuery = query(
    collection(db, "sos_reports"),
    orderBy("timestamp", "desc")
  );

  onSnapshot(sosQuery, (snapshot) => {
    const loadingRow = document.querySelector("#loading-row");
    const noDataRow = document.querySelector("#no-data-row");

    if (loadingRow) loadingRow.remove();

    if (snapshot.empty) {
      if (noDataRow) {
        noDataRow.classList.remove("hidden");
        noDataRow.classList.add(
          "absolute",
          "top-52",
          "flex",
          "justify-center",
          "items-center",
          "w-full",
          "h-full"
        );
      }
      return;
    }

    badgeCounts.active =
      badgeCounts.validated =
      badgeCounts.resolved =
      badgeCounts.canceled =
        0;
    document.querySelector("table tbody").innerHTML = "";

    snapshot.forEach((docSnap) => {
      const report = docSnap.data();
      const reportId = docSnap.id;
      appendToTable(report, reportId);
      if (!shownAlerts.has(reportId)) {
        showSOSAlert(report);
        shownAlerts.add(reportId);
        sessionStorage.setItem("shownAlerts", JSON.stringify([...shownAlerts]));
      }
    });

    updateBadgeUI();
  });
};

// Append report to table
const appendToTable = (report, id) => {
  const tableBody = document.querySelector("table tbody");
  const row = document.createElement("tr");

  let status = report.status || "unread";
  const activeStatuses = [
    "unread",
    "active",
    "validated",
    "ongoing",
    "on the way",
    "arrived",
    "completed",
  ];

  if (activeStatuses.includes(status)) {
    badgeCounts.active++;
  }
  if (status === "validated") {
    badgeCounts.validated++;
  }
  if (status === "resolved") {
    badgeCounts.resolved++;
  }
  if (status === "canceled") {
    badgeCounts.canceled++;
  }

  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
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

  const timestamp = new Date(report.timestamp.toDate()).toLocaleString();
  row.innerHTML = `
    <td id = 'national-park' class="p-3 text-center border-b">${
      report.incidentType || "N/A"
    }</td>
    <td id = 'national-park' class="p-3 text-center border-b">${
      report.user || "N/A"
    }</td>
    <td id = 'national-park' class="p-3 text-center border-b">${
      report.phone || "N/A"
    }</td>
    <td id = 'national-park' class="p-3 text-center border-b">${
      report.message || "N/A"
    }</td>
    <td id = 'national-park' class="p-3 text-left text-sm border-b">${
      report.location || "N/A"
    }</td>
    <td id = 'national-park' class="p-3 text-center border-b">${timestamp}</td>
    <td id = 'national-park' class="p-3 text-center border-b status-cell">
      <span class="rounded inline-block text-center px-3 py-1 text-white ${statusColor}">
  ${displayStatus}
</span>

    </td>
    <td class="p-3 text-center action-cell border-b">
      <button class="bg-[#9F2424] text-white px-2 py-1 rounded inline-block dropdown-toggle">Actions</button>
      <div id = 'national-park' class="dropdown-menu hidden absolute right-3 mt-2 bg-white shadow-lg rounded-md z-10 w-fit">
        <button class="block w-full px-4 py-2 text-left hover:bg-gray-100 mark-validated">Validate</button>
        <button class="block w-full px-4 py-2 text-left hover:bg-gray-100 mark-resolved">Resolved</button>
        <button class="block w-full px-4 py-2 text-left hover:bg-gray-100 mark-canceled">Cancel</button>
      </div>
    </td>
  `;

  tableBody.appendChild(row);

  // Let's use 'let' here instead of const since we'll reassign it
  let toggleBtn = row.querySelector(".dropdown-toggle");
  const dropdownMenu = row.querySelector(".dropdown-menu");
  const statusCell = row.querySelector(".status-cell");
  // Set up the initial state based on existing status
  const disabledStatuses = [
    "completed",
    "canceled",
    "ongoing",
    "on the way",
    "arrived",
    "resolved",
  ];

  if (status === "completed") {
    toggleBtn.textContent = "Resolved?";
    setupResolveButton();
  } else if (disabledStatuses.includes(status)) {
    toggleBtn.disabled = true;
    toggleBtn.classList.add("opacity-50", "cursor-not-allowed");
  } else {
    setupDropdownButton();
  }

  // Function to set up dropdown behavior
  function setupDropdownButton() {
    // Remove any existing listeners
    const newToggleBtn = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
    toggleBtn = newToggleBtn;

    // Add dropdown toggle listener
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".dropdown-menu").forEach((menu) => {
        if (menu !== dropdownMenu) menu.classList.add("hidden");
      });
      dropdownMenu.classList.toggle("hidden");
    });

    if (!dropdownMenu.classList.contains("hidden")) {
      dropdownMenu.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }

  // Function to set up direct resolve button behavior
  function setupResolveButton() {
    // Remove any existing listeners
    const newToggleBtn = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
    toggleBtn = newToggleBtn;

    // Add direct resolve listener
    toggleBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      await changeStatus("resolved");
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", () => {
    dropdownMenu.classList.add("hidden");
  });

  // Status change handler
  const changeStatus = async (newStatus) => {
    const oldStatus = report.status || "unread";

    // Update status color and text
    const newColor = newStatus === "resolved" ? "bg-green-600" : "bg-blue-600";
    statusCell.innerHTML = `<span class="px-2 py-1 rounded text-white ${newColor}">
      ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
    </span>`;

    // Update badge counts
    const normalize = (s) => (s === "unread" ? "active" : s);
    const oldKey = normalize(oldStatus);
    const newKey = normalize(newStatus);

    if (oldKey !== newKey) {
      badgeCounts[oldKey]--;
      badgeCounts[newKey]++;
      updateBadgeUI();
    }

    // Update database
    await updateDoc(doc(db, "sos_reports", id), { status: newStatus });
    report.status = newStatus; // Update local report object

    // Update UI based on new status
    if (newStatus === "completed") {
      // Change button to "Resolve?"
      toggleBtn.textContent = "Resolved?";
      dropdownMenu.classList.add("hidden");
      setupResolveButton();
    } else if (
      newStatus === "resolved" ||
      newStatus === "canceled" ||
      newStatus === "ongoing" ||
      newStatus === "on the way" ||
      newStatus === "arrived"
    ) {
      // Disable buttonm
      toggleBtn.disabled = true;
      toggleBtn.classList.add("opacity-50", "cursor-not-allowed");
      dropdownMenu.classList.add("hidden");
    }
  };

  // Set up dropdown menu buttons
  const validateBtn = dropdownMenu.querySelector(".mark-validated");
  const resolveBtn = dropdownMenu.querySelector(".mark-resolved");
  const cancelBtn = dropdownMenu.querySelector(".mark-canceled");

  if (report.status === "validated") {
    validateBtn.style.display = "none";
  }

  validateBtn.addEventListener("click", () => changeStatus("validated"));
  resolveBtn.addEventListener("click", () => changeStatus("resolved"));
  cancelBtn.addEventListener("click", () => changeStatus("canceled"));
};

// Auth State Change
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Admin is authenticated:", user.email);
    listenForSOSAlerts();
  } else {
    console.warn("No admin is logged in. Firestore access restricted.");
  }
});

// // Function to move resolved, validated, or canceled reports after 5 minutes
// const moveOldReportsToHistory = async () => {
//   const now = Date.now();
//   const cutoff = 10 * 1000; // 1 minute

//   const snapshot = await getDocs(collection(db, "sos_reports"));
//   snapshot.forEach(async (docSnap) => {
//     const report = docSnap.data();
//     const reportId = docSnap.id;

//     const reportTime = report.timestamp?.toDate?.().getTime?.();
//     if (!reportTime) return;

//     if (now - reportTime >= cutoff) {
//       const hasVolunteer = Boolean(
//         report.volunteer?.volunteerName &&
//           report.volunteer.volunteerName !== "N/A" &&
//           report.volunteer.volunteerName.trim() !== ""
//       );

//       const anonymized = {
//         ...report,
//         contactInfo: "N/A",
//         address: "N/A",
//         volunteer: hasVolunteer ? 'Yes' : 'No',
//         movedAt: new Date(),
//       };

//       try {
//         await addDoc(collection(db, "sos_history"), anonymized); // Not polished
//         // await deleteDoc(doc(db, "sos_reports", reportId));
//         console.log(`✅ Moved report ${reportId} to history`);
//       } catch (err) {
//         console.error("❌ Failed to move report:", err);
//       }
//     }
//   });
// };

// // Run every 10 seconds for faster response
// setInterval(moveOldReportsToHistory, 10000);
