// announcements.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyBPtb60dthvTPLmaRlL_E7YOsBDIAK-vKw",
  authDomain: "sample-79b30.firebaseapp.com",
  projectId: "sample-79b30",
  storageBucket: "sample-79b30.appspot.com",
  messagingSenderId: "12884863424",
  appId: "1:12884863424:web:277b044f4005f7d80fc025",
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// --- DOM References ---
const newAnnouncementBtn = document.getElementById("newMessageBtn");
const cancelAnnouncementBtn = document.getElementById("cancelBtn");
const saveAnnouncementBtn = document.getElementById("saveBtn");

const titleInput = document.getElementById("announcementTitle");
const categoryInput = document.getElementById("announcementCategory");
const messageInput = document.getElementById("announcementMessage");
const imageInput = document.getElementById("fileInput");
const imagePreview = document.getElementById("imagePreview");
const fileNameDisplay = document.getElementById("fileName");

const announcementModal = document.getElementById("announcementModal");
const announcementTableBody = document.getElementById("announcementTableBody");

let editId = null;

// --- Modal Controls ---
newAnnouncementBtn.addEventListener("click", () => {
  announcementModal.classList.remove("hidden");
});

cancelAnnouncementBtn.addEventListener("click", () => {
  announcementModal.classList.add("hidden");
  clearForm();
});

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (file) {
    fileNameDisplay.textContent = file.name;
    imagePreview.src = URL.createObjectURL(file);
    imagePreview.classList.remove("hidden");
  } else {
    fileNameDisplay.textContent = "No file chosen";
    imagePreview.src = "";
    imagePreview.classList.add("hidden");
  }
});

function clearForm() {
  titleInput.value = "";
  categoryInput.value = "";
  messageInput.value = "";
  imageInput.value = "";
  imagePreview.src = "";
  imagePreview.classList.add("hidden");
  fileNameDisplay.textContent = "No file chosen";
  editId = null;
  saveAnnouncementBtn.textContent = "Save";
}

// --- Save or Update Announcement ---
saveAnnouncementBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const category = categoryInput.value;
  const message = messageInput.value.trim();
  const imageFile = imageInput.files[0];

  if (!title || !category || !message) {
    alert("⚠️ Please fill in all required fields.");
    return;
  }

  saveAnnouncementBtn.disabled = true;
  saveAnnouncementBtn.textContent = editId ? "Updating..." : "Saving...";

  try {
    let imageURL = "";
    let storagePath = "";

    if (imageFile) {
      storagePath = `announcements/${Date.now()}_${imageFile.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, imageFile);
      imageURL = await getDownloadURL(storageRef);
    }

    if (editId) {
      // Update existing announcement
      const docRef = doc(db, "announcements", editId);
      const updateData = { title, category, message };
      if (imageURL) updateData.imageURL = imageURL;
      if (storagePath) updateData.storagePath = storagePath;
      await updateDoc(docRef, updateData);
      alert("✅ Announcement updated successfully!");
    } else {
      // Create new announcement
      await addDoc(collection(db, "announcements"), {
        title,
        category,
        message,
        imageURL,
        storagePath,
        createdAt: serverTimestamp(),
      });
      alert("✅ Announcement created successfully!");
    }

    clearForm();
    announcementModal.classList.add("hidden");

  } catch (error) {
    console.error("❌ Error saving announcement:", error);
    alert("❌ Failed to save announcement.\n" + error.message);
  } finally {
    saveAnnouncementBtn.disabled = false;
    saveAnnouncementBtn.textContent = "Save";
  }
});

// --- Realtime Display ---
const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
  announcementTableBody.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const row = document.createElement("tr");

    row.innerHTML = `
      <td class="p-3 font-semibold">${data.title}</td>
      <td class="p-3">${data.category}</td>
      <td class="p-3">${data.message}</td>
      <td class="p-3">
        ${data.imageURL ? `<img src="${data.imageURL}" alt="Announcement Image" class="h-16 w-auto rounded">` : "No Image"}
      </td>
      <td class="p-3 text-gray-500">${data.createdAt?.toDate().toLocaleString() || ""}</td>
      <td class="p-3 flex gap-2">
        <button class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded edit-btn" data-id="${docSnap.id}">Edit</button>
        <button class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded delete-btn" data-id="${docSnap.id}" data-path="${data.storagePath || ""}">Delete</button>
      </td>
    `;
    announcementTableBody.appendChild(row);
  });

  // Attach edit + delete event listeners
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const docRef = doc(db, "announcements", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        titleInput.value = data.title;
        categoryInput.value = data.category;
        messageInput.value = data.message;
        if (data.imageURL) {
          imagePreview.src = data.imageURL;
          imagePreview.classList.remove("hidden");
        }
        editId = id;
        saveAnnouncementBtn.textContent = "Update";
        announcementModal.classList.remove("hidden");
      }
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const path = e.target.dataset.path;
      if (!confirm("⚠️ Are you sure you want to delete this announcement?")) return;

      try {
        await deleteDoc(doc(db, "announcements", id));
        if (path) {
          const storageRef = ref(storage, path);
          await deleteObject(storageRef).catch(() => console.warn("Image already deleted or missing."));
        }
        alert("🗑️ Announcement deleted successfully!");
      } catch (err) {
        console.error("❌ Delete failed:", err);
        alert("❌ Failed to delete announcement.");
      }
    });
  });
});
