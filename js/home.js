(function () {
  "use strict";
  var body = document.body;
  var header = document.querySelector(".site-header");
  var menu = document.querySelector(".nav-toggle");
  var nav = document.getElementById("home-nav");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (menu && nav) {
    var closeMenu = function () {
      header.classList.remove("menu-open");
      menu.setAttribute("aria-expanded", "false");
    };
    menu.addEventListener("click", function () {
      var open = menu.getAttribute("aria-expanded") !== "true";
      menu.setAttribute("aria-expanded", String(open));
      header.classList.toggle("menu-open", open);
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
        closeMenu();
        menu.focus();
      }
    });
    window.matchMedia("(min-width: 761px)").addEventListener("change", closeMenu);
  }

  var sections = Array.prototype.slice.call(document.querySelectorAll(".project-spread"));
  var chapterLinks = Array.prototype.slice.call(document.querySelectorAll("[data-project-link]"));
  if ("IntersectionObserver" in window) {
    var updateChapter = function () {
      var center = window.innerHeight * .5;
      var current = sections.filter(function (section) {
        var rect = section.getBoundingClientRect();
        return rect.top <= center && rect.bottom >= center;
      })[0];
      body.classList.toggle("in-projects", !!current);
      chapterLinks.forEach(function (link) {
        if (current && link.getAttribute("href") === "#" + current.id) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    };
    var chapterObserver;
    var watchChapters = function () {
      if (chapterObserver) chapterObserver.disconnect();
      var inset = Math.round(window.innerHeight * .45);
      chapterObserver = new IntersectionObserver(updateChapter, { rootMargin: "-" + inset + "px 0px -" + inset + "px 0px", threshold: 0 });
      sections.forEach(function (section) { chapterObserver.observe(section); });
      updateChapter();
    };
    watchChapters();
    window.addEventListener("resize", watchChapters);
  }

  var previewVideos = Array.prototype.slice.call(document.querySelectorAll("video[data-preview-video]"));
  var stopOtherPlayers = function (except) {
    previewVideos.forEach(function (video) { if (video !== except) video.pause(); });
  };
  previewVideos.forEach(function (video) {
    var screen = video.closest(".film-screen");
    var button = screen.querySelector(".film-play");
    video.controls = false;
    button.hidden = false;
    button.addEventListener("click", function () {
      stopOtherPlayers(video);
      video.controls = true;
      screen.classList.add("has-started");
      var promise = video.play();
      if (promise) promise.catch(function () { button.hidden = false; });
    });
    video.addEventListener("play", function () {
      stopOtherPlayers(video);
      button.hidden = true;
      screen.classList.add("is-playing");
    });
    ["pause", "ended"].forEach(function (eventName) {
      video.addEventListener(eventName, function () {
        button.hidden = false;
        screen.classList.remove("is-playing");
      });
    });
  });

  if ("IntersectionObserver" in window) {
    var mediaObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          var video = entry.target.querySelector("video");
          if (video) video.pause();
        }
      });
    }, { threshold: .1 });
    document.querySelectorAll(".film-screen").forEach(function (screen) { mediaObserver.observe(screen); });
  }
  document.addEventListener("visibilitychange", function () { if (document.hidden) stopOtherPlayers(null); });

  var cover = document.querySelector(".forest-cover");
  if (cover && !reducedMotion.matches) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking || window.scrollY > cover.offsetHeight + 100) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        cover.style.setProperty("--cover-drift", Math.min(window.scrollY * .12, 95) + "px");
        ticking = false;
      });
    }, { passive: true });
  }
})();
