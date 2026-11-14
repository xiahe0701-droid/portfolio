(function () {
  "use strict";

  var frame = document.getElementById("game-frame");
  var loading = document.getElementById("stage-loading");
  if (!frame) return;

  var kind = frame.getAttribute("data-game") || "unity";

  var INJECT = {
    unity: [
      "html, body { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:#161B24 !important; }",
      "#unity-container { position:absolute !important; inset:0 !important; top:0 !important; left:0 !important;",
      "  width:100% !important; height:100% !important; transform:none !important; }",
      "#unity-canvas { width:100% !important; height:100% !important; background:#161B24 !important; }",
      "#unity-warning { top:5%; }"
    ].join("\n"),
    gbc: [
      "html, body { margin:0; padding:0 !important; width:100%; min-height:100%; overflow:hidden; background:#161B24 !important; }",
      "body { display:flex; align-items:center; justify-content:center; gap:0 !important; }",
      "h1, .sub, .keys, footer { display:none !important; }",
      ".screen { border:none !important; box-shadow:none !important; background:transparent !important; padding:0 !important; border-radius:0 !important; }",
      "canvas { width:100vw !important; height:auto !important; max-width:none !important; }",
      ".overlay { inset:0 !important; border-radius:0 !important; }"
    ].join("\n")
  };

  var hideLoading = function () {
    if (loading) loading.classList.add("hidden");
  };

  var onFrameLoad = function () {

    try {
      var doc = frame.contentDocument;
      if (doc) {
        var style = doc.createElement("style");
        style.textContent = INJECT[kind] || "";
        doc.head.appendChild(style);
      }
    } catch (e) {  }

    window.setTimeout(hideLoading, kind === "gbc" ? 300 : 900);

    window.setTimeout(function () {
      try { frame.contentWindow.focus(); } catch (e) { frame.focus(); }
    }, 1000);
  };

  var fired = false;
  var runOnce = function () {
    if (fired) return;
    fired = true;
    onFrameLoad();
  };

  frame.addEventListener("load", runOnce);

  try {
    var d = frame.contentDocument;
    if (d && d.readyState === "complete" && d.URL !== "about:blank") runOnce();
  } catch (e) {  }

  window.setTimeout(hideLoading, 20000);

  frame.parentElement.addEventListener("click", function () {
    try { frame.contentWindow.focus(); } catch (e) {}
  });

  if (kind === "gbc") {
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" || e.altKey || e.ctrlKey || e.metaKey) return;
      var t = e.target;

      if (t && t.closest && t.closest("a, button, input, textarea, select, [contenteditable]")) return;
      try {
        frame.contentWindow.focus();
        var btn = frame.contentDocument && frame.contentDocument.getElementById("startBtn");
        if (btn) btn.click();
      } catch (err) { frame.focus(); }
      e.preventDefault();
    });
  }
})();
