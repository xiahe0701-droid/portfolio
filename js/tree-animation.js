(function () {
  document.querySelectorAll("[data-tree-animation]").forEach(function (button) {
    var image = button.querySelector("img");
    var still = image.getAttribute("src");
    var animation = button.getAttribute("data-tree-animation");
    var timer;
    var playCount = 0;

    button.addEventListener("click", function () {
      clearTimeout(timer);
      image.src = still;
      playCount += 1;
      // A new URL starts the animated WebP at its first frame on every click.
      image.src = animation + "?play=" + playCount;
      // The 42 source frames run for about 2 seconds; hold the final frame
      // for another 2 seconds before returning to the still image.
      timer = setTimeout(function () { image.src = still; }, 4000);
    });
  });
}());
