document.addEventListener("DOMContentLoaded", function () {
    const currentUserId = sessionStorage.getItem("user_id"); // Or however you're storing it
    const ADMIN_ID = "fGR7io5X2YfXcNqKA65HE8zYQfA2";
    const SUPER_ADMIN_ID = "tUQcIT3O8vWtovCRCsDiOcIqY4V2";

    if (currentUserId === ADMIN_ID) {
        const analytics = document.getElementById("sidebar-analytics");
        const userMgmt = document.getElementById("sidebar-user-management");

        if (analytics) analytics.style.display = "none";
        if (userMgmt) userMgmt.style.display = "none";
    }
});
