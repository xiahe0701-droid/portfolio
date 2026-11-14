(function () {
  "use strict";
  var header = document.querySelector(".unified-header");
  if (!header) return;
  var button = header.querySelector(".site-menu-toggle");
  var nav = header.querySelector(".site-nav");
  function closeMenu() {
    header.classList.remove("menu-open");
    button.setAttribute("aria-expanded", "false");
  }
  button.addEventListener("click", function () {
    var open = button.getAttribute("aria-expanded") !== "true";
    header.classList.toggle("menu-open", open);
    button.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("click", function (event) {
    if (!header.contains(event.target)) closeMenu();
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
      closeMenu();
      button.focus();
    }
  });
  window.matchMedia("(min-width: 1001px)").addEventListener("change", closeMenu);
})();
