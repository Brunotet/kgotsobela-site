document.addEventListener("DOMContentLoaded", function () {
  var stage = document.querySelector("[data-gallery]");
  if (!stage) return;

  var track = stage.querySelector("[data-gallery-track]");
  var slides = Array.prototype.slice.call(track.querySelectorAll("[data-gallery-slide]"));
  var prevBtn = stage.querySelector("[data-gallery-prev]");
  var nextBtn = stage.querySelector("[data-gallery-next]");
  var countEl = document.querySelector("[data-gallery-count]");
  var total = slides.length;
  var active = 0;

  var lightbox = document.querySelector("[data-gallery-lightbox]");
  var lbImage = lightbox ? lightbox.querySelector("[data-gallery-lb-image]") : null;
  var lbCounter = lightbox ? lightbox.querySelector("[data-gallery-lb-counter]") : null;
  var lbClose = lightbox ? lightbox.querySelector("[data-gallery-close]") : null;
  var lbPrev = lightbox ? lightbox.querySelector("[data-gallery-lb-prev]") : null;
  var lbNext = lightbox ? lightbox.querySelector("[data-gallery-lb-next]") : null;

  function shortestOffset(i) {
    var offset = i - active;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;
    return offset;
  }

  function render() {
    slides.forEach(function (slide, i) {
      var offset = shortestOffset(i);
      var abs = Math.abs(offset);

      var translateX = offset * 46;
      var scale = 1 - Math.min(abs, 3) * 0.16;
      var rotate = offset * -10;
      var opacity = 1;

      if (abs === 0) {
        opacity = 1;
      } else if (abs === 1) {
        opacity = 0.9;
      } else if (abs === 2) {
        opacity = 0.4;
      } else {
        opacity = 0;
      }

      slide.style.transform =
        "translate(-50%, -50%) translateX(" + translateX + "%) scale(" + scale + ") rotateY(" + rotate + "deg)";
      slide.style.zIndex = String(50 - abs);
      slide.style.opacity = String(opacity);
      slide.style.pointerEvents = abs > 2 ? "none" : "auto";

      slide.classList.toggle("is-active", abs === 0);
      slide.setAttribute("aria-hidden", abs === 0 ? "false" : "true");
      slide.tabIndex = abs === 0 ? 0 : -1;
    });

    if (countEl) countEl.textContent = (active + 1) + " / " + total;
  }

  function goTo(i) {
    active = ((i % total) + total) % total;
    render();
  }

  slides.forEach(function (slide, i) {
    slide.addEventListener("click", function () {
      if (shortestOffset(i) === 0) {
        openLightbox(i);
      } else {
        goTo(i);
      }
    });
  });

  if (prevBtn) prevBtn.addEventListener("click", function () { goTo(active - 1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { goTo(active + 1); });

  stage.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") goTo(active - 1);
    if (e.key === "ArrowRight") goTo(active + 1);
    if (e.key === "Enter" || e.key === " ") openLightbox(active);
  });

  var touchStartX = null;
  track.addEventListener("touchstart", function (e) {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener("touchend", function (e) {
    if (touchStartX === null) return;
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      if (dx > 0) { goTo(active - 1); } else { goTo(active + 1); }
    }
    touchStartX = null;
  }, { passive: true });

  function openLightbox(i) {
    if (!lightbox || !lbImage) return;
    active = i;
    render();
    var img = slides[active].querySelector("img");
    lbImage.src = img.src;
    lbImage.alt = img.alt;
    if (lbCounter) lbCounter.textContent = (active + 1) + " / " + total;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (lbClose) lbClose.focus();
  }

  function updateLightboxImage() {
    if (!lbImage) return;
    var img = slides[active].querySelector("img");
    lbImage.src = img.src;
    lbImage.alt = img.alt;
    if (lbCounter) lbCounter.textContent = (active + 1) + " / " + total;
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  if (lbPrev) lbPrev.addEventListener("click", function () { goTo(active - 1); updateLightboxImage(); });
  if (lbNext) lbNext.addEventListener("click", function () { goTo(active + 1); updateLightboxImage(); });

  document.addEventListener("keydown", function (e) {
    if (!lightbox || !lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") { goTo(active - 1); updateLightboxImage(); }
    if (e.key === "ArrowRight") { goTo(active + 1); updateLightboxImage(); }
  });

  render();
});
