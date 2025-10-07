document.addEventListener("DOMContentLoaded", function () {
  const currentUserId = sessionStorage.getItem("user_id");
  const ADMIN_ID = "fGR7io5X2YfXcNqKA65HE8zYQfA2";

  if (currentUserId === ADMIN_ID) {
    const analytics = document.getElementById("sidebar-analytics");
    const userMgmt = document.getElementById("sidebar-user-management");

    if (analytics) analytics.style.display = "none";
    if (userMgmt) userMgmt.style.display = "none";
  }
});
