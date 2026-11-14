(function () {
  "use strict";

  var docEl = document.documentElement;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  var langLink = document.querySelector(".lang-switch");
  if (langLink) {
    langLink.addEventListener("click", function () {
      if (location.hash) {
        this.href = this.getAttribute("href").split("#")[0] + location.hash;
      }
    });
  }

  var sideToc = document.querySelector(".side-toc");
  if (sideToc && "IntersectionObserver" in window) {
    var tocLinks = Array.prototype.slice.call(sideToc.querySelectorAll("a"));
    var sections = tocLinks
      .map(function (a) {
        var el = document.querySelector(a.getAttribute("href"));
        return el ? { el: el, link: a } : null;
      })
      .filter(Boolean);

    var setCurrent = function (link) {
      tocLinks.forEach(function (a) {
        if (a === link) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    };

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var hit = sections.filter(function (s) { return s.el === entry.target; })[0];
          if (hit) setCurrent(hit.link);
        }
      });
    }, { rootMargin: "-50% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (s) { spy.observe(s.el); });
    if (sections.length) setCurrent(sections[0].link);
  }

  var toggle = document.querySelector(".theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = docEl.getAttribute("data-theme") === "dark" ? "light" : "dark";
      docEl.setAttribute("data-theme", next);
      try { localStorage.setItem("xh-theme", next); } catch (e) {}
    });
  }

  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window && !reducedMotion.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  var lightbox = document.getElementById("lightbox");
  if (lightbox && typeof lightbox.showModal === "function") {
    var lbImg = document.getElementById("lightbox-img");
    var lbCaption = document.getElementById("lightbox-caption");
    var shots = Array.prototype.slice.call(document.querySelectorAll(".shot"));
    var current = -1;

    var show = function (index) {
      current = (index + shots.length) % shots.length;
      var btn = shots[current];
      lbImg.src = btn.getAttribute("data-full");
      var innerImg = btn.querySelector("img");
      lbImg.alt = innerImg ? innerImg.alt : "";
      lbCaption.textContent = btn.getAttribute("data-caption") || "";
      lightbox.setAttribute("data-shot-index", String(current));
    };

    shots.forEach(function (btn, index) {
      btn.addEventListener("click", function () {
        show(index);
        lightbox.showModal();
      });
    });

    document.getElementById("lightbox-close").addEventListener("click", function () {
      lightbox.close();
    });
    document.getElementById("lightbox-prev").addEventListener("click", function () { show(current - 1); });
    document.getElementById("lightbox-next").addEventListener("click", function () { show(current + 1); });

    lightbox.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); show(current - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); show(current + 1); }
    });

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener("close", function () { lbImg.src = ""; });
  }

  var album = document.getElementById("album");
  if (album) {
    var slides = Array.prototype.slice.call(album.querySelectorAll(".album-slide"));
    var thumbs = Array.prototype.slice.call(album.querySelectorAll(".strip-thumb"));
    var prevBtn = album.querySelector(".album-arrow.prev");
    var nextBtn = album.querySelector(".album-arrow.next");
    var curLabel = album.querySelector(".album-cur");
    var index = 0;

    var preloadSlide = function (i) {
      var s = slides[i];
      if (!s) return;
      var img = s.querySelector("img");
      if (img && img.loading === "lazy") img.loading = "eager";
    };

    var show = function (next, dir) {
      if (next < 0) next = slides.length - 1;
      if (next >= slides.length) next = 0;
      slides.forEach(function (s) {
        s.classList.remove("current", "from-left");
        var v = s.querySelector("video");
        if (v && !v.paused) v.pause();
      });
      var slide = slides[next];
      slide.classList.add("current");
      if (dir === -1) slide.classList.add("from-left");
      thumbs.forEach(function (t, i) { t.classList.toggle("current", i === next); });
      if (curLabel) curLabel.textContent = String(next + 1);
      index = next;
      preloadSlide(next + 1);
      preloadSlide(next - 1);
    };

    prevBtn.addEventListener("click", function () { stopAuto(true); show(index - 1, -1); });
    nextBtn.addEventListener("click", function () { stopAuto(true); show(index + 1, 1); });
    thumbs.forEach(function (t) {
      t.addEventListener("click", function () {
        stopAuto(true);
        var target = parseInt(t.getAttribute("data-index"), 10) || 0;
        show(target, target > index ? 1 : -1);
      });
    });

    var albumInView = false;

    var autoTimer = null, autoStopped = false;
    var startAuto = function () {
      if (autoStopped || autoTimer || reducedMotion.matches) return;
      autoTimer = window.setInterval(function () {
        if (document.querySelector("dialog[open]")) return;
        show(index + 1, 1);
      }, 4600);
    };
    var stopAuto = function (permanent) {
      if (permanent) autoStopped = true;
      if (autoTimer) { window.clearInterval(autoTimer); autoTimer = null; }
    };
    album.addEventListener("mouseenter", function () { stopAuto(false); });
    album.addEventListener("mouseleave", function () { if (albumInView) startAuto(); });
    album.addEventListener("focusin", function () { stopAuto(false); });
    album.addEventListener("play", function () { stopAuto(true); }, true);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopAuto(false);
      else if (albumInView) startAuto();
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          albumInView = e.isIntersecting;
          if (albumInView) startAuto(); else stopAuto(false);
        });
      }, { threshold: 0.2 }).observe(album);
    }
    document.addEventListener("keydown", function (e) {
      if (!albumInView) return;
      if (document.querySelector("dialog[open]")) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); stopAuto(true); show(index - 1, -1); }
      if (e.key === "ArrowRight") { e.preventDefault(); stopAuto(true); show(index + 1, 1); }
    });

    var lb = document.getElementById("lightbox");
    if (lb) {
      lb.addEventListener("close", function () {
        var all = Array.prototype.slice.call(document.querySelectorAll(".shot"));
        var openedIdx = lb.getAttribute("data-shot-index");
        if (openedIdx === null) return;
        var shot = all[parseInt(openedIdx, 10)];
        if (!shot) return;
        var slide = shot.closest(".album-slide");
        if (slide) {
          var i = slides.indexOf(slide);
          if (i >= 0 && i !== index) show(i, i > index ? 1 : -1);
        }
      });
    }

    preloadSlide(1);
  }

  var gnome = document.getElementById("gnome-sprite");
  if (gnome && !reducedMotion.matches) {
    var frames = [
      "2547_idle_0001", "2507_idle_0003", "2516_idle_0006", "2885_idle_0007",
      "2518_idle_0009", "2868_idle_0012", "2880_idle_0015", "2887_idle_0017",
      "2574_idle_0018", "2485_idle_0019", "2893_idle_0021"
    ].map(function (name) { return gnome.getAttribute("src").replace(/[^/]+$/, "") + name + ".png"; });
    var frameIndex = 0;
    var timer = null;
    var loaded = false;

    var preload = function (done) {
      var remaining = frames.length;
      frames.forEach(function (src) {
        var img = new Image();
        img.onload = img.onerror = function () {
          remaining -= 1;
          if (remaining === 0) done();
        };
        img.src = src;
      });
    };

    var start = function () {
      if (timer) return;
      timer = window.setInterval(function () {
        frameIndex = (frameIndex + 1) % frames.length;
        gnome.src = frames[frameIndex];
      }, 120);
    };
    var stop = function () {
      if (timer) { window.clearInterval(timer); timer = null; }
    };

    if ("IntersectionObserver" in window) {
      var gnomeIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (!loaded) {
              loaded = true;
              preload(function () {
                gnome.classList.add("walking");
                start();
              });
            } else {
              start();
            }
          } else {
            stop();
          }
        });
      }, { threshold: 0.1 });
      gnomeIO.observe(gnome);
    }
  }

  var facades = Array.prototype.slice.call(document.querySelectorAll(".yt-facade"));
  facades.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var iframe = document.createElement("iframe");
      iframe.src = btn.getAttribute("data-embed");
      iframe.title = btn.getAttribute("data-title") || "YouTube video";
      iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      btn.replaceWith(iframe);
    });
  });

  var videos = Array.prototype.slice.call(document.querySelectorAll("video"));
  videos.forEach(function (video) {
    video.addEventListener("play", function () {
      videos.forEach(function (other) {
        if (other !== video && !other.paused) other.pause();
      });
    });
  });
})();
