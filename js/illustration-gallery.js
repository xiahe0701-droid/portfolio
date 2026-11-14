(function () {
  'use strict';
  var gallery = document.querySelector('.illustration-gallery');
  if (!gallery) return;
  var slides = Array.from(gallery.querySelectorAll('.gallery-slide'));
  var current = 0;
  var controls = document.createElement('div');
  controls.className = 'gallery-controls';
  controls.innerHTML = '<button class="gallery-prev" type="button" aria-label="Previous artwork">‹</button><button class="gallery-next" type="button" aria-label="Next artwork">›</button><nav class="gallery-picker" aria-label="Choose an artwork"></nav><p class="gallery-live" role="status" aria-live="polite"></p>';
  gallery.appendChild(controls);
  var picker = controls.querySelector('.gallery-picker');
  var live = controls.querySelector('.gallery-live');
  var buttons = slides.map(function (slide, index) {
    var image = slide.querySelector('img');
    var video = slide.querySelector('video');
    if (image) {
      var fitPortrait = function () {
        slide.classList.toggle('is-portrait', image.naturalHeight > image.naturalWidth);
      };
      if (image.complete && image.naturalWidth) fitPortrait();
      else image.addEventListener('load', fitPortrait, { once: true });
    }
    var caption = slide.querySelector('.gallery-caption').textContent.replace(/\s+/g, ' ').trim();
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'gallery-thumbnail';
    button.setAttribute('aria-label', caption);
    var thumbnail = document.createElement('img');
    thumbnail.src = image ? image.src : video.poster;
    thumbnail.alt = '';
    thumbnail.loading = 'lazy';
    button.appendChild(thumbnail);
    button.addEventListener('click', function () { show(index); });
    picker.appendChild(button);
    return button;
  });
  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      var active = i === current;
      slide.hidden = !active;
      slide.setAttribute('aria-hidden', String(!active));
      if (!active) slide.querySelectorAll('video').forEach(function (video) { video.pause(); });
      buttons[i].setAttribute('aria-current', active ? 'true' : 'false');
    });
    live.textContent = 'Artwork ' + (current + 1) + ' of ' + slides.length;
    buttons[current].scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  controls.querySelector('.gallery-prev').addEventListener('click', function () { show(current - 1); });
  controls.querySelector('.gallery-next').addEventListener('click', function () { show(current + 1); });
  document.addEventListener('keydown', function (event) {
    if (document.querySelector('dialog[open]') || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      gallery.classList.add('controls-visible');
      show(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  gallery.addEventListener('pointermove', function (event) {
    var rect = gallery.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    gallery.classList.toggle('controls-visible', x < 120 || x > rect.width - 120 || y > rect.height - 140);
  });
  gallery.addEventListener('pointerleave', function () { gallery.classList.remove('controls-visible'); });
  var startX;
  gallery.addEventListener('touchstart', function (event) { startX = event.touches[0].clientX; }, { passive: true });
  gallery.addEventListener('touchend', function (event) {
    if (event.target.closest('.gallery-controls')) return;
    var delta = event.changedTouches[0].clientX - startX;
    if (Math.abs(delta) > 60) show(current + (delta < 0 ? 1 : -1));
  }, { passive: true });
  var requested = Number(location.hash.replace('#artwork-', ''));
  show(requested >= 1 && requested <= slides.length ? requested - 1 : 0);
})();
