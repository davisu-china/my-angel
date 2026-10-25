(() => {
  "use strict";

  const select = (selector, root = document) => root.querySelector(selector);
  const selectAll = (selector, root = document) => [...root.querySelectorAll(selector)];
  const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = motionPreference.matches;
  const scrollToElement = (target) => select(`#${target}`)?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "start" });
  let revealObserver;
  if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .08 });
    selectAll(".reveal").forEach((node) => { node.classList.add("observed"); revealObserver.observe(node); });
  }

  const filmScenes = [
    { kicker: "关于心动", lines: ["有些喜欢，", "在开口之前，", "已经认真了很久。"], description: "于是，想用一份小小的勇气，让你看见。" },
    { kicker: "关于靠近", lines: ["想陪你看晚霞，", "也想听你聊聊，", "今天过得怎么样。"], description: "比起轰轰烈烈，更期待每一次真实的相处。" },
    { kicker: "关于以后", lines: ["故事没有剧本，", "但下一幕，", "我想邀请你。"], description: "王梓烨，如果你也愿意，我们就慢慢开始。" }
  ];
  let filmIndex = 0;
  let filmTimer = null;

  function showFilmScene(index) {
    filmIndex = index;
    const scene = filmScenes[index];
    select("#film-current").textContent = String(index + 1).padStart(2, "0");
    select("#film-kicker").textContent = scene.kicker;
    const heading = select("#film-line");
    heading.replaceChildren();
    scene.lines.forEach((line, lineIndex) => {
      const text = lineIndex === 2 ? document.createElement("em") : document.createTextNode(line);
      if (lineIndex === 2) text.textContent = line;
      heading.append(text);
      if (lineIndex !== 2) heading.append(document.createElement("br"));
    });
    select("#film-description").textContent = scene.description;
    selectAll("[data-film-scene]").forEach((button) => button.setAttribute("aria-pressed", String(Number(button.dataset.filmScene) === index)));
    const lines = select(".film-lines");
    lines.classList.remove("changing");
    requestAnimationFrame(() => lines.classList.add("changing"));
  }

  function stopFilm() {
    clearInterval(filmTimer);
    filmTimer = null;
    select(".film-pause").setAttribute("aria-pressed", "false");
    select(".film-pause").textContent = "▷ 自动放映";
  }

  function startFilm() {
    stopFilm();
    select(".film-pause").setAttribute("aria-pressed", "true");
    select(".film-pause").textContent = "Ⅱ 暂停放映";
    filmTimer = setInterval(() => {
      if (filmIndex >= filmScenes.length - 1) { stopFilm(); return; }
      showFilmScene(filmIndex + 1);
    }, 7000);
  }

  selectAll("[data-film-scene]").forEach((button) => button.addEventListener("click", () => { stopFilm(); showFilmScene(Number(button.dataset.filmScene)); }));
  select(".film-pause").addEventListener("click", () => {
    if (filmTimer) stopFilm();
    else { if (filmIndex === filmScenes.length - 1) showFilmScene(0); startFilm(); }
  });
  select("[data-film-start]").addEventListener("click", () => { showFilmScene(0); startFilm(); scrollToElement("film-screen"); });

  const theatreCanvas = select("#romance-particles");
  const theatre = new window.RomanceParticles.Theatre(theatreCanvas, (chapter, index) => {
    select("#effect-counter").textContent = `CHAPTER ${String(index + 1).padStart(2, "0")} / 03`;
    select("#effect-kicker").textContent = chapter.kicker;
    select("#effect-title").textContent = chapter.title;
    select(".particle-stage-hint").textContent = chapter.hint;
    selectAll("[data-meteor-chapter]").forEach(button => button.setAttribute("aria-pressed", String(Number(button.dataset.meteorChapter) === index)));
  }, reducedMotion);
  const effectToggle = select(".effects-toggle");
  function updateEffectsButton() {
    effectToggle.setAttribute("aria-pressed", String(theatre.playing && !reducedMotion));
    effectToggle.textContent = reducedMotion ? "静态赏映 · 减少动态" : theatre.playing ? "Ⅱ 暂停放映" : "▷ 继续放映";
    effectToggle.disabled = reducedMotion;
  }
  updateEffectsButton();
  selectAll("[data-meteor-chapter]").forEach(button => button.addEventListener("click", () => {
    theatre.seekChapter(Number(button.dataset.meteorChapter));
  }));
  select(".meteor-replay").addEventListener("click", () => theatre.restart());
  effectToggle.addEventListener("click", () => { theatre.playing = !theatre.playing; updateEffectsButton(); theatre.sync(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(entries => { theatre.visible = entries[0].isIntersecting; theatre.sync(); }, { threshold: .08 }).observe(theatreCanvas);
  } else { theatre.visible = true; }
  theatreCanvas.addEventListener("pointermove", event => {
    const bounds = theatreCanvas.getBoundingClientRect();
    theatre.pointer.x = (event.clientX - bounds.left) / bounds.width - .5;
  }, { passive: true });
  theatreCanvas.addEventListener("pointerleave", () => { theatre.pointer.x = 0; });
  theatreCanvas.addEventListener("click", event => {
    if (!theatre.playing || reducedMotion) return;
    const bounds = theatreCanvas.getBoundingClientRect();
    theatre.meteorShots.push({ start: theatre.elapsed, flight: .95, groundX: Math.max(-1.2, Math.min(1.2, (event.clientX - bounds.left - bounds.width / 2) / (bounds.width * .3))), depth: .6, power: 1.4, seed: Date.now() % 1000, color: "247,172,231" });
    if (theatre.meteorShots.length > 5) theatre.meteorShots.shift();
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
  function showPhoto(index) {
    photoIndex = (index + portraitImages.length) % portraitImages.length;
    const image = portraitImages[photoIndex];
    select("#photo-large").src = image.src;
    select("#photo-large").alt = image.alt;
    select("#photo-count").textContent = `${String(photoIndex + 1).padStart(2, "0")} / 03`;
  }
  selectAll("[data-photo]").forEach(button => button.addEventListener("click", () => { showPhoto(Number(button.dataset.photo)); photoDialog.showModal(); theatre.sync(); }));
  selectAll("[data-photo-step]").forEach(button => button.addEventListener("click", () => showPhoto(photoIndex + Number(button.dataset.photoStep))));
  select(".photo-close").addEventListener("click", () => photoDialog.close());
  photoDialog.addEventListener("click", event => { if (event.target === photoDialog) photoDialog.close(); });
  photoDialog.addEventListener("keydown", event => {
    if (event.key === "ArrowRight") { event.preventDefault(); showPhoto(photoIndex + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); showPhoto(photoIndex - 1); }
  });

  selectAll("[data-scroll]").forEach((button)=>button.addEventListener("click",()=>scrollToElement(button.dataset.scroll)));
  selectAll("[data-top]").forEach((button)=>button.addEventListener("click",()=>window.scrollTo({top:0,behavior:reducedMotion?"instant":"smooth"})));
  const music = select("#background-music");
  const musicFile = select("#music-file");
  const musicStatus = select("#music-status");
  const soundToggle = select(".sound-toggle");
  let musicLoading = false;
  let musicRequest = 0;
  let musicObjectURL;
  music.volume = .45;
  if (music.dataset.src) music.src = music.dataset.src;

  function updateSoundButton() {
    const hasSource = Boolean(music.getAttribute("src"));
    const playing = !music.paused;
    soundToggle.setAttribute("aria-pressed", String(playing));
    soundToggle.setAttribute("aria-busy", String(musicLoading));
    soundToggle.setAttribute("aria-label", musicLoading ? "取消歌曲加载" : playing ? "暂停歌曲" : hasSource ? "播放歌曲" : "选择歌曲音源");
    select(".sound-label").textContent = musicLoading ? "加载中" : playing ? "音乐开启" : hasSource ? "播放音乐" : "选择音乐";
  }

  function pauseMusic() {
    musicRequest++;
    musicLoading = false;
    music.pause();
    updateSoundButton();
    if (music.getAttribute("src")) musicStatus.textContent = "音乐已暂停；点击右上角继续播放。";
  }

  function musicFailed() {
    pauseMusic();
    musicStatus.textContent = "音源无法播放，请检查文件或重新选择 MP3 / M4A。";
    toast("歌曲暂时无法播放，可以换一个有权使用的音源。");
  }

  async function playMusic() {
    if (document.hidden) return;
    if (!music.getAttribute("src")) { musicFile.click(); return; }
    const request = ++musicRequest;
    musicLoading = true;
    musicStatus.textContent = "正在加载歌曲…";
    updateSoundButton();
    try {
      await music.play();
      if (request !== musicRequest) return;
      musicLoading = false;
      musicStatus.textContent = `正在播放 · ${music.dataset.title || "所选歌曲"}`;
      updateSoundButton();
    } catch (error) {
      if (request !== musicRequest) return;
      if (error.name === "NotAllowedError") {
        pauseMusic();
        musicStatus.textContent = "浏览器需要手动确认，请点击右上角播放音乐。";
      } else musicFailed();
    }
  }

  soundToggle.addEventListener("click", () => {
    if (musicLoading || !music.paused) pauseMusic();
    else playMusic();
  });
  select(".music-import").addEventListener("click", () => musicFile.click());
  musicFile.addEventListener("change", () => {
    const file = musicFile.files?.[0];
    if (!file) return;
    if (!(file.type.startsWith("audio/") || /\.(mp3|m4a|ogg|wav)$/i.test(file.name))) {
      toast("请选择 MP3、M4A、OGG 或 WAV 音频文件。");
      musicFile.value = "";
      return;
    }
    pauseMusic();
    if (musicObjectURL) URL.revokeObjectURL(musicObjectURL);
    musicObjectURL = URL.createObjectURL(file);
    music.src = musicObjectURL;
    music.dataset.title = file.name.replace(/\.[^.]+$/, "");
    musicStatus.textContent = "歌曲已就绪，仅在本机使用；点击右上角播放。";
    musicFile.value = "";
    updateSoundButton();
  });
  music.addEventListener("play", updateSoundButton);
  music.addEventListener("pause", updateSoundButton);
  music.addEventListener("error", musicFailed);
  window.addEventListener("pagehide", pauseMusic);
  updateSoundButton();

  let toastTimer;
  function toast(message){const node=select(".toast");node.textContent=message;node.classList.add("visible");clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove("visible"),3500);}

  let resizeTimer;
  window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (theatre.active) theatre.resize(); }, 150); });
  window.addEventListener("scroll", () => { const maxScroll = document.documentElement.scrollHeight - innerHeight; select(".reading-progress span").style.transform = `scaleX(${maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0})`; }, { passive: true });
  document.addEventListener("visibilitychange", () => {
    theatre.sync();
    if (document.hidden) { stopFilm(); pauseMusic(); }
  });
  motionPreference.addEventListener("change", () => {
    reducedMotion = motionPreference.matches;
    theatre.reduced = reducedMotion;
    if (reducedMotion) { theatre.seekChapter(2); stopFilm(); }
    theatre.sync();
    updateEffectsButton();
  });
  theatre.active = true;
  theatre.sync();
})();
