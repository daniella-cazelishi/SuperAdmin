const translations = {
  en: {
    settings: "Settings",
    darkMode: "Dark Mode",
    language: "Language",
    notificationPreferences: "Notification Preferences",
    emailAlerts: "Email Alerts",
    logout: "Log Out",
    emergencyReports: "Emergency Reports",
    history: "History",
    analyticsReports: "Analytics & Reports",
    announcements: "Announcements",
    userManagement: "User Management",
    admin: "Admin",

    // Dashboard
    dashboardTitle: "Emergency Reports",
    active: "Active Incidents",
    resolved: "Resolved Incidents",
    incidentType: "Type of Incident",
    user: "User",
    phone: "Phone",
    description: "Description",
    location: "Location",
    date: "Occurrence Date",
    status: "Status",
    notifications: "Notifications",
    markAll: "Mark all as read",

    // History
    historyTitle: "Report History",
    sortBy: "Sort by",
    type: "Type of Incident",
    userCol: "User",
    descriptionCol: "Description",
    dateCol: "Occurrence Date",
    statusCol: "Status",
    detailsCol: "Details",
    loading: "Loading reports...",
    noData: "No report history available as of the moment",

    // Analytics
    startDate: "Start Date",
    endDate: "End Date",
    applyFilter: "Apply Filter",
    incidentTrendsChart: "Incident Trends",
    responseTimeChart: "Response Time",
    incidentTypesChart: "Incident Types",
    totalIncidents: "Total Incidents",
    totalResolvedReports: "Total Resolved Reports",
    avgResponseTime: "Avg Response Time",
    includesAllIncidentTypes: "Includes all incident types",
    markedAsResolved: "Marked as Resolved",
    loadingMetrics: "Loading...",

    // Announcements
    announcementsTitle: "Announcements",
    announcementsSubtitle: "0 Messages",
    newAnnouncement: "New Announcement",
    createAnnouncement: "Create Announcement",
    announcementTable: {
      title: "Title",
      category: "Category",
      message: "Message",
      image: "Image",
      date: "Date",
    },
    announcementForm: {
      title: "Title",
      category: "Category",
      message: "Message",
      uploadImage: "Upload Image (optional)",
      chooseFile: "Choose File",
      noFile: "No file chosen",
      cancel: "Cancel",
      save: "Save",
    },

    // User Management
    userManagementTitle: "User Management",
    fullname: "Fullname",
    address: "Address",
    phone: "Phone",
    email: "Email",
    dateRegistered: "Date Registered",
    files: "Files",
    status: "Status",
    loadingUsers: "Loading reports...",
    noUsers: "No pending users available as of the moment",
  },

  fil: {
    settings: "Mga Setting",
    darkMode: "Madilim na Tema",
    language: "Wika",
    notificationPreferences: "Mga Abiso",
    emailAlerts: "Alerto sa Email",
    logout: "Log Out",
    emergencyReports: "Mga Report",
    history: "Talaan ng mga Report",
    analyticsReports: "Analitika at Ulat",
    announcements: "Mga Anunsyo",
    userManagement: "Residente",
    admin: "Admin",

    // Dashboard
    dashboardTitle: "Mga Emergency Report",
    active: "Aktibong Insidente",
    resolved: "Naresolbang Insidente",
    incidentType: "Uri ng Insidente",
    user: "Residente",
    phone: "Telepono",
    description: "Paglalarawan",
    location: "Lokasyon",
    date: "Petsa ng Pagkaganap",
    status: "Kalagayan",
    notifications: "Mga Notipikasyon",
    markAll: "Markahan lahat na nabasa",

    // History
    historyTitle: "Kasaysayan ng Ulat",
    sortBy: "Ayusin ayon sa",
    type: "Uri ng Insidente",
    userCol: "Residente",
    descriptionCol: "Paglalarawan",
    dateCol: "Petsa ng Pangyayari",
    statusCol: "Kalagayan",
    detailsCol: "Detalye",
    loading: "Naglo-load ng mga ulat...",
    noData: "Walang tala ng ulat sa ngayon",

    // Analytics
    startDate: "Petsa Simula",
    endDate: "Petsa Wakas",
    applyFilter: "I-apply ang Filter",
    incidentTrendsChart: "Mga Usong Insidente",
    responseTimeChart: "Oras ng Pagtugon",
    incidentTypesChart: "Uri ng Insidente",
    totalIncidents: "Kabuuang Insidente",
    totalResolvedReports: "Kabuuang Naresolbang Report",
    avgResponseTime: "Karaniwang Oras ng Pagtugon",
    includesAllIncidentTypes: "Kasama ang lahat ng uri ng insidente",
    markedAsResolved: "Naitakda bilang Naresolba",
    loadingMetrics: "Naglo-load...",

    // Announcements
    announcementsTitle: "Mga Anunsyo",
    announcementsSubtitle: "0 Mensahe",
    newAnnouncement: "Bagong Pabatid",
    createAnnouncement: "Gumawa ng Pabatid",
    announcementTable: {
      title: "Pamagat",
      category: "Kategorya",
      message: "Mensahe",
      image: "Larawan",
      date: "Petsa",
    },
    announcementForm: {
      title: "Pamagat",
      category: "Kategorya",
      message: "Mensahe",
      uploadImage: "Mag-upload ng Larawan (opsyonal)",
      chooseFile: "Pumili ng File",
      noFile: "Walang napiling file",
      cancel: "Kanselahin",
      save: "I-save",
    },

    // User Management
    userManagementTitle: "Pamamahala ng Residente",
    fullname: "Buong Pangalan",
    address: "Tirahan",
    phone: "Telepono",
    email: "Email",
    dateRegistered: "Petsa ng Pagkarehistro",
    files: "Mga File",
    status: "Kalagayan",
    loadingUsers: "Naglo-load ng mga ulat...",
    noUsers: "Walang nakabinbing residente sa ngayon",
  },
};

const languageSelect = document.getElementById("languageSelect");

function setLanguage(lang) {
  const t = translations[lang]; // shortcut for easier access

  // Settings Page
  if (document.getElementById("main-title"))
    document.getElementById("main-title").innerText = t.settings;
  if (document.getElementById("label-darkmode"))
    document.getElementById("label-darkmode").innerText = t.darkMode;
  if (document.getElementById("label-language"))
    document.getElementById("label-language").innerText = t.language;
  if (document.getElementById("label-notification-preferences"))
    document.getElementById("label-notification-preferences").innerText =
      t.notificationPreferences;
  if (document.getElementById("label-notifications"))
    document.getElementById("label-notifications").innerText = t.notifications;
  if (document.getElementById("label-email"))
    document.getElementById("label-email").innerText = t.emailAlerts;
  if (document.getElementById("logout-button"))
    document.getElementById("logout-button").innerText = t.logout;

  // Sidebar
  if (document.getElementById("sidebar-emergency"))
    document.getElementById("sidebar-emergency").innerText = t.emergencyReports;
  if (document.getElementById("sidebar-history"))
    document.getElementById("sidebar-history").innerText = t.history;
  if (document.getElementById("sidebar-analytics"))
    document.getElementById("sidebar-analytics").innerText = t.analyticsReports;
  if (document.getElementById("sidebar-users"))
    document.getElementById("sidebar-users").innerText = t.userManagement;
  if (document.getElementById("sidebar-admin"))
    document.getElementById("sidebar-admin").innerText = t.admin;
  if (document.getElementById("sidebar-settings"))
    document.getElementById("sidebar-settings").innerText = t.settings;

  // Dashboard
  if (document.getElementById("dashboard-title"))
    document.getElementById("dashboard-title").innerText = t.dashboardTitle;
  if (document.getElementById("label-active"))
    document.getElementById("label-active").innerText = t.active;
  if (document.getElementById("label-resolved"))
    document.getElementById("label-resolved").innerText = t.resolved;
  if (document.getElementById("th-type"))
    document.getElementById("th-type").innerText = t.incidentType;
  if (document.getElementById("th-user"))
    document.getElementById("th-user").innerText = t.user;
  if (document.getElementById("th-phone"))
    document.getElementById("th-phone").innerText = t.phone;
  if (document.getElementById("th-description"))
    document.getElementById("th-description").innerText = t.description;
  if (document.getElementById("th-location"))
    document.getElementById("th-location").innerText = t.location;
  if (document.getElementById("th-date"))
    document.getElementById("th-date").innerText = t.date;
  if (document.getElementById("th-status"))
    document.getElementById("th-status").innerText = t.status;
  if (document.getElementById("clear-notifications"))
    document.getElementById("clear-notifications").innerText = t.markAll;

  // History Page
  if (document.getElementById("page-title"))
    document.getElementById("page-title").innerText = t.historyTitle;
  if (document.getElementById("sortFilter"))
    document.getElementById("sortFilter").options[0].innerText = t.sortBy;
  if (document.getElementById("th-history-type"))
    document.getElementById("th-history-type").innerText = t.type;
  if (document.getElementById("th-history-user"))
    document.getElementById("th-history-user").innerText = t.userCol;
  if (document.getElementById("th-history-description"))
    document.getElementById("th-history-description").innerText =
      t.descriptionCol;
  if (document.getElementById("th-history-date"))
    document.getElementById("th-history-date").innerText = t.dateCol;
  if (document.getElementById("th-history-status"))
    document.getElementById("th-history-status").innerText = t.statusCol;
  if (document.getElementById("th-history-details"))
    document.getElementById("th-history-details").innerText = t.detailsCol;
  if (document.getElementById("loading-row"))
    document.getElementById("loading-row").innerText = t.loading;
  if (document.getElementById("no-data-row"))
    document.getElementById("no-data-row").innerText = t.noData;

  // Announcements Page
  if (document.getElementById("announcements-title"))
    document.getElementById("announcements-title").innerText =
      t.announcementsTitle;
  if (document.getElementById("announcements-subtitle"))
    document.getElementById("announcements-subtitle").innerText =
      t.announcementsSubtitle;
  if (document.getElementById("new-announcement-btn"))
    document.getElementById("new-announcement-btn").innerText =
      t.newAnnouncement;

  if (document.getElementById("create-announcement-title"))
    document.getElementById("create-announcement-title").innerText =
      t.createAnnouncement;
  if (document.getElementById("label-announcement-title"))
    document.getElementById("label-announcement-title").innerText =
      t.announcementForm.title;
  if (document.getElementById("label-announcement-category"))
    document.getElementById("label-announcement-category").innerText =
      t.announcementForm.category;
  if (document.getElementById("label-announcement-message"))
    document.getElementById("label-announcement-message").innerText =
      t.announcementForm.message;
  if (document.getElementById("label-announcement-upload"))
    document.getElementById("label-announcement-upload").innerText =
      t.announcementForm.uploadImage;
  if (document.getElementById("label-choose-file"))
    document.getElementById("label-choose-file").innerText =
      t.announcementForm.chooseFile;
  if (document.getElementById("fileName"))
    document.getElementById("fileName").innerText = t.announcementForm.noFile;
  if (document.getElementById("cancelBtn"))
    document.getElementById("cancelBtn").innerText = t.announcementForm.cancel;
  if (document.getElementById("saveBtn"))
    document.getElementById("saveBtn").innerText = t.announcementForm.save;

  // Announcement Table
  if (document.getElementById("th-announcement-title"))
    document.getElementById("th-announcement-title").innerText =
      t.announcementTable.title;
  if (document.getElementById("th-announcement-category"))
    document.getElementById("th-announcement-category").innerText =
      t.announcementTable.category;
  if (document.getElementById("th-announcement-message"))
    document.getElementById("th-announcement-message").innerText =
      t.announcementTable.message;
  if (document.getElementById("th-announcement-image"))
    document.getElementById("th-announcement-image").innerText =
      t.announcementTable.image;
  if (document.getElementById("th-announcement-date"))
    document.getElementById("th-announcement-date").innerText =
      t.announcementTable.date;

  // User Management Page
  if (document.getElementById("user-management-title"))
    document.getElementById("user-management-title").innerText =
      t.userManagementTitle;
  if (document.getElementById("th-fullname"))
    document.getElementById("th-fullname").innerText = t.fullname;
  if (document.getElementById("th-address"))
    document.getElementById("th-address").innerText = t.address;
  if (document.getElementById("th-phone"))
    document.getElementById("th-phone").innerText = t.phone;
  if (document.getElementById("th-email"))
    document.getElementById("th-email").innerText = t.email;
  if (document.getElementById("th-date-registered"))
    document.getElementById("th-date-registered").innerText = t.dateRegistered;
  if (document.getElementById("th-files"))
    document.getElementById("th-files").innerText = t.files;
  if (document.getElementById("th-status"))
    document.getElementById("th-status").innerText = t.status;
  if (document.getElementById("loading-users"))
    document.getElementById("loading-users").innerText = t.loadingUsers;
  if (document.getElementById("no-users"))
    document.getElementById("no-users").innerText = t.noUsers;

  // Filters
  if (document.querySelector('label[for="start-date"]'))
    document.querySelector('label[for="start-date"]').innerText = t.startDate;
  if (document.querySelector('label[for="end-date"]'))
    document.querySelector('label[for="end-date"]').innerText = t.endDate;
  if (document.getElementById("filter-button"))
    document.getElementById("filter-button").innerText = t.applyFilter;

  // Charts Titles
  const chartTitles = [
    { id: "incidentChart", key: "incidentTrendsChart" },
    { id: "responseTimeChart", key: "responseTimeChart" },
    { id: "incidentTypeChart", key: "incidentTypesChart" },
  ];

  chartTitles.forEach((chart) => {
    const parent = document.getElementById(chart.id)?.parentElement;
    if (parent) {
      const h3 = parent.querySelector("h3");
      if (h3) h3.innerText = t[chart.key];
    }
  });

  // Metrics Cards
  if (document.getElementById("metric-total-incidents"))
    document.getElementById("metric-total-incidents").innerText =
      t.totalIncidents;
  if (document.getElementById("metric-total-resolved"))
    document.getElementById("metric-total-resolved").innerText =
      t.totalResolvedReports;
  if (document.getElementById("metric-avg-response"))
    document.getElementById("metric-avg-response").innerText =
      t.avgResponseTime;
  if (document.querySelector("#total-incidents-trend"))
    document.querySelector("#total-incidents-trend").innerText =
      t.includesAllIncidentTypes;
  if (document.querySelector("#total-resolved + p"))
    document.querySelector("#total-resolved + p").innerText =
      t.markedAsResolved;
  if (document.querySelector("#volunteer-info"))
    document.querySelector("#volunteer-info").innerText = t.loadingMetrics;
}

// Auto-load saved language
window.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("lang") || "en";
  if (languageSelect) languageSelect.value = savedLang;
  setLanguage(savedLang);
});

// Change language
languageSelect.addEventListener("change", (e) => {
  const selectedLang = e.target.value;
  localStorage.setItem("lang", selectedLang);
  setLanguage(selectedLang);
});
