// Import Firebase SDK modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  collection,
  doc,
  getFirestore,
  onSnapshot,
  query,
  updateDoc,
  where
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firebase config & init
const firebaseConfig = {
  apiKey: "AIzaSyBPtb60dthvTPLmaRlL_E7YOsBDIAK-vKw",
  authDomain: "sample-79b30.firebaseapp.com",
  projectId: "sample-79b30",
  storageBucket: "sample-79b30.appspot.com",
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

// Default categories
const INCIDENT_CATEGORIES = [
  "Health",
  "Disasters & Hazards",
  "Peace & Order",
  "Community & Environmental Concerns",
  "Other"
];
const RESPONSE_BUCKETS = ["<10min","10-30min","30-60min","1-2hr","2-6hr","6-12hr",">12hr"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ===== Flexible incident type mapping =====
function mapIncidentType(rawType) {
  if (!rawType) return "Other";
  const type = rawType.trim().toLowerCase();

  if (type.includes("health") || type.includes("gamot") || type.includes("first aid")) return "Health";
  if (type.includes("disaster") || type.includes("hazard")) return "Disasters & Hazards";
  if (type.includes("peace") || type.includes("order")) return "Peace & Order";
  if (type.includes("community") || type.includes("environment") || type.includes("env")) return "Community & Environmental Concerns";
  return "Other";
}

// ===== DOM ready =====
document.addEventListener("DOMContentLoaded", () => {
  const filterButton = document.getElementById("filter-button");

  filterButton.addEventListener("click", () => {
    const startInput = document.getElementById("start-date").value;
    const endInput = document.getElementById("end-date").value;
    if (startInput && endInput) {
      const startDate = new Date(`${startInput}T00:00:00`);
      const endDate = new Date(`${endInput}T23:59:59.999`);
      fetchAndRenderAnalytics(startDate, endDate);
    }
  });

  // Default range: last 30 days
  const defaultEnd = new Date();
  const defaultStart = new Date();
  defaultStart.setDate(defaultEnd.getDate() - 30);
  fetchAndRenderAnalytics(defaultStart, defaultEnd);

  // Dark mode
  const page = document.getElementById("page");
  if (localStorage.getItem("theme") === "dark") page.classList.add("dark");
});

// ==================== MAIN ANALYTICS ====================
function fetchAndRenderAnalytics(startDate, endDate) {
  const resolvedRef = collection(db, "resolved_reports");
  const resolvedQuery = query(
    resolvedRef,
    where("timestamp", ">=", startDate),
    where("timestamp", "<=", endDate)
  );

  onSnapshot(resolvedQuery, async (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log("Fetched resolved reports:", data.length);

    document.getElementById("total-incidents").textContent = data.length;
    document.getElementById("total-resolved").textContent = data.length;

    let totalResponseTime = 0;
    let responseCount = 0;
    const monthlyCounts = {};
    const responseBuckets = {};
    const typeCounts = {};
    const updatePromises = [];

    RESPONSE_BUCKETS.forEach(bucket => responseBuckets[bucket] = 0);
    INCIDENT_CATEGORIES.forEach(cat => typeCounts[cat] = 0);
    MONTHS.forEach(month => monthlyCounts[month] = 0);

    for (const report of data) {
      if (!report.timestamp) continue;

      let created = report.timestamp.toDate ? report.timestamp.toDate() : new Date(report.timestamp);
      const resolved = report.resolvedAt?.toDate?.() || report.movedAt?.toDate?.() || created;

      const month = created.toLocaleString("default",{month:"short"});
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;

      // Response time
      let rt = report.responseTimeMinutes;
      if (rt == null && created && resolved) rt = (resolved - created)/(1000*60);

      if (rt != null) {
        totalResponseTime += rt;
        responseCount++;
        if (rt<10) responseBuckets["<10min"]++;
        else if (rt<30) responseBuckets["10-30min"]++;
        else if (rt<60) responseBuckets["30-60min"]++;
        else if (rt<120) responseBuckets["1-2hr"]++;
        else if (rt<360) responseBuckets["2-6hr"]++;
        else if (rt<720) responseBuckets["6-12hr"]++;
        else responseBuckets[">12hr"]++;
      }

      const type = mapIncidentType(report.incidentType || report.category);
      typeCounts[type] = (typeCounts[type] || 0) + 1;

      if (rt != null && !report.responseTimeMinutes) {
        updatePromises.push(updateDoc(doc(db,"resolved_reports",report.id),{responseTimeMinutes:rt}));
      }
    }

    if (updatePromises.length) {
      try { await Promise.all(updatePromises); }
      catch(e){ console.error("Failed to update response times:",e); }
    }

    const avgResponse = responseCount? (totalResponseTime/responseCount).toFixed(2) : "N/A";
    document.getElementById("avg-response-time").textContent = avgResponse+" min";

    renderIncidentChart(monthlyCounts);
    renderResponseTimeChart(responseBuckets, avgResponse);
    renderIncidentTypeChart(typeCounts);
  });
}

// ==================== CHART RENDERERS ====================
function renderIncidentChart(monthlyCounts){
  const canvas = document.getElementById("incidentChart");
  if(!canvas) return;
  if(incidentChartInstance) { incidentChartInstance.destroy(); incidentChartInstance = null; }

  incidentChartInstance = new Chart(canvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: MONTHS,
      datasets: [{ label: "Incidents per Month", data: MONTHS.map(m => monthlyCounts[m] || 0), backgroundColor: "rgba(239,68,68,0.7)" }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'top' },
        title: { display: true, text: "Incidents per Month" }
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: "No. of Incidents" } },
        x: { title: { display: true, text: "Month" } }
      }
    }
  });
}

function renderResponseTimeChart(responseBuckets, avgResponse){
  const canvas = document.getElementById("responseTimeChart");
  if(!canvas) return;
  if(responseChartInstance) { responseChartInstance.destroy(); responseChartInstance = null; }

  responseChartInstance = new Chart(canvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: RESPONSE_BUCKETS,
      datasets: [{ label: "Response Time Distribution", data: RESPONSE_BUCKETS.map(b => responseBuckets[b] || 0), backgroundColor: "rgba(255,99,132,0.6)", borderColor: "rgba(255,99,132,1)", borderWidth: 1 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { title: { display: true, text: avgResponse !== "N/A" ? `Avg Response Time: ${avgResponse} min` : "Avg Response Time" } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: "No. of Incidents" } },
        x: { title: { display: true, text: "Time Buckets" } }
      }
    }
  });
}

function renderIncidentTypeChart(typeCounts){
  const canvas = document.getElementById("incidentTypeChart");
  if(!canvas) return;
  if(typeChartInstance) { typeChartInstance.destroy(); typeChartInstance = null; }

  INCIDENT_CATEGORIES.forEach(cat => typeCounts[cat] = typeCounts[cat] || 0);

  typeChartInstance = new Chart(canvas.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: INCIDENT_CATEGORIES,
      datasets: [{ label: "Incident Types", data: INCIDENT_CATEGORIES.map(cat => typeCounts[cat]), backgroundColor: ["#39FF14","#F16767","#F29F58","#B2CD9C","#A0AEC0"] }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'right' }, title: { display: true, text: "Incident Types" } }
    }
  });
}

// ==================== PDF & EXCEL EXPORT ====================
document.getElementById("pdf-btn").addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  let yOffset = 10;

  const charts = [
    { id: "incidentChart", title: "Incident Trends" },
    { id: "responseTimeChart", title: "Response Time" },
    { id: "incidentTypeChart", title: "Incident Types" }
  ];

  for (const c of charts) {
    const canvas = document.getElementById(c.id);
    if (!canvas) continue;
    const imgData = canvas.toDataURL("image/png");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    if (yOffset + pdfHeight > pdf.internal.pageSize.getHeight() - 20) { pdf.addPage(); yOffset = 10; }
    pdf.text(c.title, 10, yOffset);
    yOffset += 5;
    pdf.addImage(imgData, "PNG", 10, yOffset, pdfWidth, pdfHeight);
    yOffset += pdfHeight + 10;
  }

  pdf.save("analytics_report.pdf");
});

document.getElementById("excel-btn").addEventListener("click", () => {
  const ws_data = [
    ["Metric", "Value"],
    ["Total Incidents", document.getElementById("total-incidents").textContent],
    ["Total Resolved Reports", document.getElementById("total-resolved").textContent],
    ["Avg Response Time (min)", document.getElementById("avg-response-time").textContent]
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb, ws, "Summary");
  XLSX.writeFile(wb, "analytics_report.xlsx");
});
