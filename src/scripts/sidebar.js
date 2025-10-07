// sidebar.js
fetch("/SuperAdmin/src/components/sidebar.html")
  .then((res) => res.text())
  .then((data) => {
    document.getElementById("sidebar-container").innerHTML = data;

    // Mark active link
    const links = document.querySelectorAll("#sidebar-container a");
    links.forEach((link) => {
      if (link.href === window.location.href) {
        link.classList.add(
          "bg-white",
          "text-red-700",
          "dark:bg-gray-700",
          "dark:text-red-500",
          "font-semibold"
        );
      } else {
        link.classList.add(
          "flex",
          "items-center",
          "gap-4",
          "p-3",
          "rounded-lg",
          "hover:bg-white",
          "hover:text-red-700",
          "dark:hover:bg-gray-700",
          "dark:hover:text-red-500",
          "transition"
        );
      }
    });
  });
