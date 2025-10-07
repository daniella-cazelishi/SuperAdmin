import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  doc,
  updateDoc,
  orderBy,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {
  getStorage,
  ref,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";



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
const storage = getStorage(app);

// Track shown alerts for the current session to avoid duplicates
const shownAlerts = new Set(
  JSON.parse(sessionStorage.getItem("shownAlerts") || "[]")
);

// Listen for new pending user registration requests
const listenForSOSAlerts = () => {
  const sosQuery = query(
    collection(db, "pending-users"),
    orderBy("timestamp", "desc")
  );

  onSnapshot(sosQuery, (snapshot) => {
    const loadingRow = document.querySelector("#loading-row");
    const noDataRow = document.querySelector("#no-data-row");

    if (loadingRow) loadingRow.remove();

    if (snapshot.empty) {
      if (noDataRow) noDataRow.classList.remove("hidden");
      return;
    }

    // Clear existing rows
    document.querySelector("table tbody").innerHTML = "";

    snapshot.forEach((docSnap) => {
      const report = docSnap.data();
      const reportId = docSnap.id;
      appendToTable(report, reportId);

      // Mark this alert as shown
      if (!shownAlerts.has(reportId)) {
        shownAlerts.add(reportId);
        sessionStorage.setItem("shownAlerts", JSON.stringify([...shownAlerts]));
      }
    });
  });
};

// Check if the user is authenticated
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Admin is authenticated:", user.email);
    listenForSOSAlerts();
  } else {
    console.warn("No admin is logged in. Firestore access restricted.");
  }
});

// Helper to check if a file is an image based on extension
function isImageFile(filename) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
}

// Show uploaded files in a modal dialog
function showFileInModal(files) {
  const modalOverlay = document.createElement("div");
  modalOverlay.className =
    "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

  const imageFiles = files.filter((file) => isImageFile(file.filename));

  modalOverlay.innerHTML = `
    <div class="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded shadow-lg p-6 relative">
      <h2 class="text-xl font-semibold mb-4">Uploaded Images</h2>
      <button class="absolute top-2 right-4 text-gray-500 hover:text-gray-800 text-xl" id="close-modal">&times;</button>
      <div class="grid grid-cols-2 gap-4">
        ${imageFiles
          .map(
            (file, index) => `
          <div class="border p-2 rounded flex flex-col justify-center items-center text-center">
            <img src="${file.url}" alt="${file.filename}" class="max-h-40 mx-auto rounded mb-2" />
            <p class="text-sm break-all mb-2">${file.filename}</p>
            <button data-index="${index}" class="download-btn bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Download</button>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  // Close modal button
  modalOverlay.querySelector("#close-modal").addEventListener("click", () => {
    modalOverlay.remove();
  });

  // Download buttons
  modalOverlay.querySelectorAll(".download-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const file = imageFiles[btn.dataset.index];
      downloadFileFromURL(file.url, file.filename);
    });
  });
}

// Trigger file download from URL
function downloadFileFromURL(url, filename) {
  const link = document.createElement("a");
  link.href = url; // direct download URL from getDownloadURL()
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Add a pending user row to the table
const appendToTable = (report, reportId) => {
  const tableBody = document.querySelector("table tbody");

  if (!tableBody) {
    console.error("Table body not found.");
    return;
  }

  const row = document.createElement("tr");
  let status = report.status || "unchecked";
  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
  const statusColor =
    status === "approved"
      ? "bg-green-600"
      : status === "rejected"
      ? "bg-red-600"
      : "bg-gray-400";

  row.innerHTML = `
    <td class="p-3 text-center border-b">${report.fullname || "N/A"}</td>
    <td class="p-3 text-justify border-b">${report.address || "N/A"}</td>
    <td class="p-3 text-center border-b">${report.phone || "N/A"}</td>
    <td class="p-3 text-center border-b">${report.email || "N/A"}</td>
    <td class="p-3 text-center border-b">${new Date(
      report.timestamp.toDate()
    ).toLocaleString()}</td>
    <td class="p-3 text-center border-b">
      <button class="bg-[#9c2626] view-btn text-white text-sm px-5 py-1.5 rounded" type="button" data-images='${JSON.stringify(
        report.images || []
      )}'>View</button>
    </td>
    <td class="p-3 text-center border-b status-cell">
      <span class="px-2 py-1.5 rounded text-sm text-white ${statusColor}">${displayStatus}</span>
    </td>
    <td class="p-3 text-center action-cell border-b relative">
      <button class="bg-[#9F2424] text-white text-sm px-3 py-2 rounded dropdown-toggle">Actions</button>
      <div class="dropdown-menu hidden absolute mt-2 bg-white shadow-lg rounded-md z-10 w-fit">
        <button class="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 mark-approve">Approve</button>
        <button class="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 mark-rejected">Reject</button>
      </div>
    </td>
  `;

  tableBody.appendChild(row);

  // View uploaded images button logic
  row.querySelector(".view-btn").addEventListener("click", async (e) => {
    const files = JSON.parse(e.target.dataset.images || "[]");

    const fetchedFiles = await Promise.all(
      files.map(async (file) => {
        try {
          const fileRef = ref(storage, file.path);
          const url = await getDownloadURL(fileRef);
          return { filename: file.name, url };
        } catch (err) {
          console.error(`Error getting URL for ${file.name}:`, err);
          return null;
        }
      })
    );

    const validFiles = fetchedFiles.filter((f) => f !== null);
    showFileInModal(validFiles);
  });

  // Dropdown toggle and menu elements
  let toggleBtn = row.querySelector(".dropdown-toggle");
  const dropdownMenu = row.querySelector(".dropdown-menu");
  const statusCell = row.querySelector(".status-cell");

  // Disable dropdown if already approved or rejected
  if (status === "approved" || status === "rejected") {
    toggleBtn.disabled = true;
    toggleBtn.classList.add("opacity-50", "cursor-not-allowed");
  } else {
    setupDropdownButton();
  }

  // Dropdown toggle function
  function setupDropdownButton() {
    // Clone to remove previous listeners
    const newToggleBtn = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
    toggleBtn = newToggleBtn;

    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".dropdown-menu").forEach((menu) => {
        if (menu !== dropdownMenu) menu.classList.add("hidden");
      });
      dropdownMenu.classList.toggle("hidden");
    });
  }

  // Hide dropdown on document click
  document.addEventListener("click", () => {
    dropdownMenu.classList.add("hidden");
  });

  // Function to update status in UI and Firestore
  const changeStatus = async (newStatus) => {
    const newColor = newStatus === "approved" ? "bg-green-600" : "bg-red-600";

    statusCell.innerHTML = `<span class="px-2 py-1.5 rounded text-sm text-white ${newColor}">
      ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
    </span>`;

    // Update Firestore document status
    await updateDoc(doc(db, "pending-users", reportId), { status: newStatus });
    report.status = newStatus;

    // Disable further actions after decision
    toggleBtn.disabled = true;
    toggleBtn.classList.add("opacity-50", "cursor-not-allowed");
    dropdownMenu.classList.add("hidden");

    // Trigger emails and user creation accordingly
    if (newStatus === "approved") {
      sendApprovedEmail();
      createUser();
    } else if (newStatus === "rejected") {
      sendRejectedEmail();
    }

    console.log(`Status updated to ${newStatus} successfully`);
  };

  // Buttons for approval/rejection
  const approveBtn = dropdownMenu.querySelector(".mark-approve");
  const rejectBtn = dropdownMenu.querySelector(".mark-rejected");

  approveBtn.addEventListener("click", () => changeStatus("approved"));
  rejectBtn.addEventListener("click", () => changeStatus("rejected"));

  // Send approved email function
  function sendApprovedEmail() {
    fetch("/send-approved-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: report.email,
        fullname: report.fullname,
        address: report.address,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log("Approved email sent.");
        } else {
          console.error("Failed to send approved email:", data.error);
        }
      })
      .catch((err) => console.error("Approved email error:", err));
  }

  // Send rejected email function
  function sendRejectedEmail() {
    fetch("/send-rejected-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: report.email,
        fullname: report.fullname,
        address: report.address,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log("Rejected email sent.");
        } else {
          console.error("Failed to send rejected email:", data.error);
        }
      })
      .catch((err) => console.error("Rejected email error:", err));
  }

  // Create Firebase Auth user for approved resident
  function createUser() {
    const defaultPassword = "Barangay72"; // or generate securely
    createUserWithEmailAndPassword(auth, report.email, defaultPassword)
      .then(async (userCredential) => {
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
          fullname: report.fullname,
          email: report.email,
          address: report.address,
          phone: report.phone,
          role: "resident",
          createdAt: new Date(),
        });
        console.log(`User created for ${report.email} with uid: ${user.uid}`);
      })
      .catch((error) => {
        if (error.code === "auth/email-already-in-use") {
          console.warn(
            "User with this email already exists in Firebase Authentication."
          );
        } else {
          console.error("Error creating user:", error);
        }
      });
  }
};
