// Import Firebase SDK modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firebase config & init
const firebaseConfig = {
  apiKey: "AIzaSyBPtb60dthvTPLmaRlL_E7YOsBDIAK-vKw",
  authDomain: "sample-79b30.firebaseapp.com",
  projectId: "sample-79b30",
  storageBucket: "sample-79b30.firebasestorage.app",
  messagingSenderId: "12884863424",
  appId: "1:12884863424:web:277b044f4005f7d80fc025"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Chart instances
let incidentChartInstance = null;
let responseChartInstance = null;
let typeChartInstance = null;
let sosStatusChartInstance = null;
let sosTypeChartInstance = null;

document.addEventListener("DOMContentLoaded", () => {
  const filterButton = document.getElementById("filter-button");

  filterButton.addEventListener("click", () => {
    const startInput = document.getElementById("start-date").value;
    const endInput = document.getElementById("end-date").value;

    if (startInput && endInput) {
      const startDate = new Date(startInput);
      const endDate = new Date(endInput);
      endDate.setHours(23, 59, 59, 999);
      fetchAndRenderAnalytics(startDate, endDate);
      fetchAndRenderSOSAnalytics(startDate, endDate);
    }
  });

  // Default range: last 30 days
  const defaultEnd = new Date();
  const defaultStart = new Date();
  defaultStart.setDate(defaultEnd.getDate() - 30);
  fetchAndRenderAnalytics(defaultStart, defaultEnd);
  fetchAndRenderSOSAnalytics(defaultStart, defaultEnd);

  // Live count of active volunteers
  const activeQuery = query(collection(db, "volunteers"), where("status", "==", "active"));
  onSnapshot(activeQuery, (snapshot) => {
    document.getElementById("active-volunteers").textContent = snapshot.size;
    document.getElementById("volunteer-info").textContent = "Active in past week";
  });
});

// ==================== ANALYTICS MAIN ====================
function fetchAndRenderAnalytics(startDate, endDate) {
  const sosRef = collection(db, "resolved_reports");
  const sosQuery = query(sosRef, where("timestamp", ">=", startDate), where("timestamp", "<=", endDate));

  onSnapshot(sosQuery, async (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    document.getElementById("total-incidents").textContent = data.length;

    let totalResponseTime = 0;
    let responseCount = 0;
    const monthlyCounts = {};
    const responseBuckets = {
      "<10min": 0, "10-30min": 0, "30-60min": 0,
      "1-2hr": 0, "2-6hr": 0, "6-12hr": 0, ">12hr": 0
    };
    const typeCounts = {};

    for (const sos of data) {
      const created = sos.timestamp?.toDate?.() || new Date();
      const resolved = sos.resolvedAt?.toDate?.() || sos.movedAt?.toDate?.();

      const month = created.toLocaleString("default", { month: "short" });
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;

      let rt = sos.responseTimeMinutes;
      if (rt == null && created && resolved) {
        rt = (resolved - created) / (1000 * 60);
      }

      if (rt != null) {
        totalResponseTime += rt;
        responseCount++;
        if (rt < 10) responseBuckets["<10min"]++;
        else if (rt < 30) responseBuckets["10-30min"]++;
        else if (rt < 60) responseBuckets["30-60min"]++;
        else if (rt < 120) responseBuckets["1-2hr"]++;
        else if (rt < 360) responseBuckets["2-6hr"]++;
        else if (rt < 720) responseBuckets["6-12hr"]++;
        else responseBuckets[">12hr"]++;
      }

      const type = sos.incidentType || "Unknown";
      typeCounts[type] = (typeCounts[type] || 0) + 1;

      // Optional: Update Firestore with computed response time
      if (rt != null && !sos.responseTimeMinutes) {
        try {
          await updateDoc(doc(db, "resolved_reports", sos.id), { responseTimeMinutes: rt });
        } catch (e) {
          console.error("Failed to update response time:", e);
        }
      }
    }

    const avgResponse = responseCount > 0 ? (totalResponseTime / responseCount).toFixed(2) : "N/A";
    document.getElementById("avg-response-time").textContent = avgResponse + " min";
    // document.getElementById("total-incidents-trend").textContent = `${data.length} resolved reports`;
    document.getElementById("response-trend").textContent = `${responseCount} calculated responses`;

    renderIncidentChart(monthlyCounts);
    renderResponseTimeChart(responseBuckets, avgResponse);
    renderIncidentTypeChart(typeCounts);
  });
}

// ==================== CHART RENDERERS ====================
function renderIncidentChart(monthlyCounts) {
  const ctx = document.getElementById("incidentChart").getContext("2d");
  const labels = Object.keys(monthlyCounts).sort();
  const values = labels.map(label => monthlyCounts[label]);

  if (incidentChartInstance) incidentChartInstance.destroy();
  incidentChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{ label: "Incidents per Month", data: values, backgroundColor: "rgba(239,68,68,0.7)" }]
    }
  });
}

function renderResponseTimeChart(responseBuckets, avgResponse) {
  const ctx = document.getElementById("responseTimeChart").getContext("2d");
  const labels = Object.keys(responseBuckets);
  const values = labels.map(label => responseBuckets[label]);

  if (responseChartInstance) responseChartInstance.destroy();
  responseChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Response Time Distribution",
        data: values,
        backgroundColor: "rgba(255,99,132,0.6)",
        borderColor: "rgba(255,99,132,1)",
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: avgResponse !== "N/A" ? `Avg Response Time: ${avgResponse} min` : "Avg Response Time"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "No. of Incidents" }
        },
        x: {
          title: { display: true, text: "Time Buckets" }
        }
      }
    }
  });
}
// ===========
function renderIncidentTypeChart(typeCounts) {
  const ctx = document.getElementById("incidentTypeChart").getContext("2d");
  const labels = Object.keys(typeCounts);
  const values = labels.map(label => typeCounts[label]);

  if (typeChartInstance) typeChartInstance.destroy();
  typeChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        label: "Incident Types",
        data: values,
        backgroundColor: ["#0000FF", "#00FFFF", "#FF00FF", "#FFFF00"]
      }]
    }
  });
}

// ==================== SOS STATUS ANALYTICS ====================
function fetchAndRenderSOSAnalytics(startDate, endDate) {
  const sosRef = collection(db, "resolved_reports");
  const sosQuery = query(
    sosRef,
    where("timestamp", ">=", startDate),
    where("timestamp", "<=", endDate)
  );

  onSnapshot(sosQuery, (snapshot) => {
    const sosData = snapshot.docs.map(doc => doc.data());
    const statusCounts = { resolved: 0, validated: 0, canceled: 0 };
    const typeCounts = {};

    sosData.forEach(sos => {
      const status = (sos.status || "unknown").toLowerCase();
      if (statusCounts[status] != null) statusCounts[status]++;
      
      const type = sos.incidentType || "Other";
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    // Update counts in the page
    document.getElementById("total-resolved").textContent = statusCounts.resolved;
    document.getElementById("total-canceled").textContent = statusCounts.canceled;

    renderSOSStatusChart(statusCounts);
    renderSOSTypeChart(typeCounts);
  });
}


function renderSOSTypeChart(typeCounts) {
  const ctx = document.getElementById("sosTypeChart").getContext("2d");
  const labels = Object.keys(typeCounts);
  const values = labels.map(label => typeCounts[label]);

  if (sosTypeChartInstance) sosTypeChartInstance.destroy();
  sosTypeChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        label: "SOS Types",
        data: values,
        backgroundColor: ["#6B7280", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"]
      }]
    }
  });
}
