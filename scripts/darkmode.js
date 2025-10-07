// darkmode.js

(function () {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
})();

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
  // Support both IDs: darkToggle (Settings) and dark-toggle (other pages if any)
  const toggle =
    document.getElementById("darkToggle") ||
    document.getElementById("dark-toggle");

  if (toggle) {
    // Sync toggle state with current theme
    toggle.checked = document.documentElement.classList.contains("dark");

    // Handle toggle change
    toggle.addEventListener("change", () => {
      if (toggle.checked) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    });
  }
});
