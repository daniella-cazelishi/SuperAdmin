// sidebar-active.js
document.addEventListener('DOMContentLoaded', () => {
  // mga class na ilalagay kapag active (Tailwind classes)
  const ACTIVE_CLASSES = ['bg-white','text-red-700','dark:bg-gray-700','dark:text-red-500','font-semibold'];

  // query lahat ng sidebar links (adjust selector kung iba ang structure)
  const sidebarLinks = document.querySelectorAll('aside nav a');

  // current filename (e.g., "announcement.html" or "" for index)
  const currentFile = window.location.pathname.split('/').pop().toLowerCase() || 'dashboard.html';

  sidebarLinks.forEach(link => {
    // get filename part ng link.href
    let hrefFile = '';
    try {
      hrefFile = new URL(link.href).pathname.split('/').pop().toLowerCase();
    } catch (e) {
      // fallback: use attribute
      hrefFile = (link.getAttribute('href') || '').split('/').pop().toLowerCase();
    }

    // normalize: treat index.html or empty as dashboard/home if needed
    if (!hrefFile) hrefFile = 'dashboard.html';

    if (hrefFile === currentFile) {
      // add active classes
      ACTIVE_CLASSES.forEach(c => link.classList.add(c));
    } else {
      // ensure not active
      ACTIVE_CLASSES.forEach(c => link.classList.remove(c));
    }
  });
});
