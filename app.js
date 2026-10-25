(() => {
  "use strict";

  const select = (selector, root = document) => root.querySelector(selector);
  const selectAll = (selector, root = document) => [...root.querySelectorAll(selector)];
  const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = motionPreference.matches;

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .08 });
    selectAll(".reveal").forEach(node => {
      node.classList.add("observed");
      revealObserver.observe(node);
    });
  }

  const theatreCanvas = select("#romance-particles");
  const theatre = new window.RomanceParticles.Theatre(theatreCanvas, chapter => {
    select("#effect-kicker").textContent = chapter.kicker;
    select("#effect-title").textContent = chapter.title;
  }, reducedMotion);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(entries => {
      theatre.visible = entries[0].isIntersecting;
      theatre.sync();
    }, { threshold: .08 }).observe(theatreCanvas);
  } else theatre.visible = true;

  theatreCanvas.addEventListener("pointermove", event => {
    if (event.pointerType === "touch") return;
    const bounds = theatreCanvas.getBoundingClientRect();
    if (bounds.width) theatre.pointer.x = (event.clientX - bounds.left) / bounds.width - .5;
  }, { passive: true });
  theatreCanvas.addEventListener("pointerleave", () => { theatre.pointer.x = 0; });
  theatreCanvas.addEventListener("click", event => {
    if (!theatre.playing || reducedMotion) return;
    const bounds = theatreCanvas.getBoundingClientRect();
    if (!bounds.width) return;
    theatre.meteorShots.push({ start: theatre.elapsed, flight: .95, groundX: Math.max(-1.2, Math.min(1.2, (event.clientX - bounds.left - bounds.width / 2) / (bounds.width * .3))), depth: .6, power: 1.4, seed: Date.now() % 1000, color: "247,172,231" });
    if (theatre.meteorShots.length > 5) theatre.meteorShots.shift();
  });
  theatreCanvas.addEventListener("keydown", event => {
    if (![" ", "Escape"].includes(event.key)) return;
    event.preventDefault();
    if (event.repeat || reducedMotion) return;
    theatre.playing = event.key === "Escape" ? false : !theatre.playing;
    theatre.sync();
  });

  const photoDialog = select("#photo-dialog");
  const portraitImages = selectAll("[data-photo] img");
  selectAll(".film-portrait, [data-photo] img").forEach(image => {
    const showPlaceholder = () => {
      image.src = "assets/starlight-placeholder.svg";
      image.alt = "照片未公开，此处为星光占位图";
    };
    image.addEventListener("error", showPlaceholder, { once: true });
    if (image.complete && !image.naturalWidth) showPlaceholder();
  });
  let photoIndex = 0;
  let photoOpener;
  function showPhoto(index) {
    photoIndex = (index + portraitImages.length) % portraitImages.length;
    const image = portraitImages[photoIndex];
    select("#photo-large").src = image.src;
    select("#photo-large").alt = image.alt;
    select("#photo-count").textContent = `${String(photoIndex + 1).padStart(2, "0")} / 03`;
  }
  function syncPhotoDialog() {
    document.body.classList.toggle("photo-open", photoDialog.open);
    theatre.active = !photoDialog.open;
    theatre.sync();
  }
  selectAll("[data-photo]").forEach(button => button.addEventListener("click", () => {
    photoOpener = button;
    showPhoto(Number(button.dataset.photo));
    photoDialog.showModal();
    syncPhotoDialog();
  }));
  selectAll("[data-photo-step]").forEach(button => button.addEventListener("click", () => showPhoto(photoIndex + Number(button.dataset.photoStep))));
  select(".photo-close").addEventListener("click", () => photoDialog.close());
  photoDialog.addEventListener("close", () => {
    syncPhotoDialog();
    photoOpener?.focus({ preventScroll: true });
  });
  photoDialog.addEventListener("click", event => {
    if (event.target !== photoDialog) return;
    const bounds = photoDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) photoDialog.close();
  });
  photoDialog.addEventListener("keydown", event => {
    if (event.key === "ArrowRight") { event.preventDefault(); showPhoto(photoIndex + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); showPhoto(photoIndex - 1); }
  });
  let swipeStart;
  const photoLarge = select("#photo-large");
  photoLarge.addEventListener("touchstart", event => {
    swipeStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  photoLarge.addEventListener("touchend", event => {
    if (!swipeStart || event.touches.length || event.changedTouches.length !== 1) { swipeStart = null; return; }
    const distanceX = event.changedTouches[0].clientX - swipeStart.x;
    const distanceY = event.changedTouches[0].clientY - swipeStart.y;
    swipeStart = null;
    if (Math.abs(distanceX) > 48 && Math.abs(distanceX) > Math.abs(distanceY) * 1.5) showPhoto(photoIndex + (distanceX < 0 ? 1 : -1));
  }, { passive: true });
  photoLarge.addEventListener("touchcancel", () => { swipeStart = null; }, { passive: true });

  const music = select("#background-music");
  let musicLoading = false;
  let musicRequest = 0;
  let musicUnavailable = false;
  music.volume = .45;

  function pauseMusic() {
    musicRequest++;
    musicLoading = false;
    music.pause();
  }

  async function playMusic() {
    if (document.hidden || musicUnavailable || musicLoading || !music.paused || !music.getAttribute("src")) return;
    const request = ++musicRequest;
    musicLoading = true;
    try {
      await music.play();
    } catch (error) {
      if (request !== musicRequest) return;
      if (error.name !== "NotAllowedError" && error.name !== "AbortError") musicUnavailable = true;
    } finally {
      if (request === musicRequest) musicLoading = false;
    }
  }

  function startBackgroundMusic(event) {
    if (event.type === "keydown" && (event.repeat || event.ctrlKey || event.metaKey || event.altKey || !["Enter", " "].includes(event.key))) return;
    if (music.muted) {
      music.muted = false;
      if (music.paused) playMusic();
      return;
    }
    playMusic();
  }
  ["pointerup", "touchend", "click", "keydown"].forEach(event => {
    document.addEventListener(event, startBackgroundMusic, { capture: true, passive: true });
  });
  music.addEventListener("error", () => { musicUnavailable = true; pauseMusic(); });
  window.addEventListener("pagehide", pauseMusic);
  window.addEventListener("pageshow", event => { if (event.persisted) playMusic(); });
  if (music.dataset.src) {
    music.src = music.dataset.src;
    // 静音预播放：浏览器允许静音自动播放，音频从进入页面就开始缓冲，
    // 首次触摸/点击时只取消静音，声音立刻响起，不用等下载。
    music.muted = true;
    music.play().catch(() => {});
  }

  let resizeTimer;
  function resizeTheatre() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => theatre.resize(), 120);
  }
  window.addEventListener("resize", resizeTheatre);
  if ("ResizeObserver" in window) new ResizeObserver(resizeTheatre).observe(theatreCanvas.parentElement);
  window.addEventListener("scroll", () => {
    const maxScroll = document.documentElement.scrollHeight - innerHeight;
    select(".reading-progress span").style.transform = `scaleX(${maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0})`;
  }, { passive: true });
  document.addEventListener("visibilitychange", () => {
    theatre.sync();
    if (document.hidden) pauseMusic();
    else playMusic();
  });
  motionPreference.addEventListener("change", () => {
    reducedMotion = motionPreference.matches;
    theatre.reduced = reducedMotion;
    if (reducedMotion) theatre.seekChapter(2);
    theatre.sync();
  });
  theatre.active = true;
  theatre.sync();
  playMusic();
})();
