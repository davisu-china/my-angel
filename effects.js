(() => {
  "use strict";

  const TAU = Math.PI * 2;
  const duration = 40;

  function randomGenerator(seed) {
    let state = seed >>> 0;
    return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  }

  const smoothStep = value => { const progress = Math.max(0, Math.min(1, value)); return progress * progress * (3 - 2 * progress); };

  const meteorChapters = [
    { kicker: "星落倾心 · 01 流星与涟漪", title: "星光奔向大地，我奔向你。", hint: "轻点夜空，添一颗流星 · 也可选择下方章节", time: 2 },
    { kicker: "星落倾心 · 02 画一整个星空", title: "把夜空画成浪漫，把偏爱留给你。", hint: "蓝与金的旋涡里，藏着一份只给你的心意", time: 15 },
    { kicker: "星落倾心 · 03 星光成你", title: "原来，万千星光，最后都像你。", hint: "王梓烨 · 这一整个宇宙，都有了温柔的轮廓", time: 32 }
  ];

  function sampleCurve(anchors, count = 70) {
    const points = [];
    for (let index = 0; index <= count; index++) {
      const progress = index / count;
      const inverse = 1 - progress;
      points.push({
        x: inverse ** 3 * anchors[0][0] + 3 * inverse ** 2 * progress * anchors[1][0] + 3 * inverse * progress ** 2 * anchors[2][0] + progress ** 3 * anchors[3][0],
        y: inverse ** 3 * anchors[0][1] + 3 * inverse ** 2 * progress * anchors[1][1] + 3 * inverse * progress ** 2 * anchors[2][1] + progress ** 3 * anchors[3][1]
      });
    }
    return points;
  }

  function makeGirlParticles(compact) {
    const random = randomGenerator(20261026);
    const points = [];
    const colors = ["112,171,255", "155,127,255", "242,136,214", "255,194,125", "108,233,225", "255,224,154"];
    const paths = [
      { part: "hair", curves: [ [[-.38,-.48],[-.72,-.98],[-.26,-1.4],[.17,-1.21]], [[.17,-1.21],[.55,-1.17],[.53,-.8],[.49,-.47]], [[.49,-.47],[.48,-.02],[.96,.02],[.65,.37]], [[.65,.37],[.42,.53],[.22,.18],[.18,-.14]], [[.18,-.14],[-.05,-.04],[-.22,-.06],[-.29,-.22]], [[-.29,-.22],[-.35,.11],[-.63,.44],[-.74,.16]], [[-.74,.16],[-.39,.21],[-.62,-.25],[-.38,-.48]] ] },
      { part: "dress", curves: [ [[-.17,-.18],[-.24,-.02],[-.32,.08],[-.25,.3]], [[-.25,.3],[-.26,.52],[-.49,.74],[-.62,.88]], [[-.62,.88],[-.43,1.04],[-.17,.99],[0,.96]], [[0,.96],[.21,1.04],[.45,.98],[.6,.86]], [[.6,.86],[.42,.64],[.28,.46],[.25,.27]], [[.25,.27],[.27,.09],[.17,-.03],[.15,-.18]], [[.15,-.18],[.05,-.1],[-.06,-.1],[-.17,-.18]] ] },
      { part: "skin", curves: [ [[-.28,-.89],[-.38,-.55],[-.22,-.28],[.02,-.27]], [[.02,-.27],[.27,-.3],[.37,-.59],[.29,-.91]], [[.29,-.91],[.08,-.87],[.02,-1.13],[-.11,-1.02]], [[-.11,-1.02],[-.16,-.92],[-.19,-.91],[-.28,-.89]] ] },
      { part: "skin", curves: [ [[-.07,-.29],[-.07,-.21],[-.11,-.18],[-.16,-.16]], [[-.16,-.16],[-.05,-.05],[.08,-.06],[.15,-.16]], [[.15,-.16],[.08,-.2],[.09,-.25],[.09,-.3]], [[.09,-.3],[.04,-.28],[-.02,-.28],[-.07,-.29]] ] },
      { part: "skin", curves: [ [[-.19,-.1],[-.35,-.06],[-.37,.13],[-.42,.25]], [[-.42,.25],[-.48,.4],[-.33,.43],[-.28,.27]], [[-.28,.27],[-.2,.13],[-.13,.03],[-.19,-.1]] ] },
      { part: "skin", curves: [ [[.18,-.1],[.34,-.09],[.31,.15],[.42,.18]], [[.42,.18],[.55,.19],[.55,.06],[.59,-.01]], [[.59,-.01],[.67,-.08],[.73,.01],[.66,.09]], [[.66,.09],[.62,.37],[.43,.41],[.3,.28]], [[.3,.28],[.2,.2],[.13,.03],[.18,-.1]] ] },
      { part: "skin", curves: [ [[-.25,.94],[-.24,1.04],[-.2,1.12],[-.19,1.18]], [[-.19,1.18],[-.12,1.22],[-.08,1.21],[-.07,1.16]], [[-.07,1.16],[-.09,1.08],[-.08,1.01],[-.07,.97]], [[-.07,.97],[-.15,.98],[-.21,.97],[-.25,.94]] ] },
      { part: "skin", curves: [ [[.1,.97],[.09,1.05],[.12,1.15],[.1,1.2]], [[.1,1.2],[.19,1.25],[.29,1.21],[.24,1.15]], [[.24,1.15],[.22,1.07],[.26,1.01],[.28,.94]], [[.28,.94],[.2,.97],[.16,.97],[.1,.97]] ] }
    ];
    const add = (positionX, positionY, part, edge = false) => {
      const colorIndex = Math.floor((positionY + 1.4) * 5.8 + positionX * 5.2 + random() * .9 + 24) % colors.length;
      points.push({ x: positionX, y: positionY, color: part === "skin" ? "255,209,184" : colors[colorIndex], size: edge ? 1.05 : .6 + random() * .35, alpha: edge ? .9 : .35 + random() * .35, edge, phase: random() * TAU, orbit: random(), delay: random() * 1.8, part });
    };
    const inside = (positionX, positionY, polygon) => {
      let contained = false;
      for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
        const current = polygon[index];
        const last = polygon[previous];
        if ((current.y > positionY) !== (last.y > positionY) && positionX < (last.x - current.x) * (positionY - current.y) / (last.y - current.y) + current.x) contained = !contained;
      }
      return contained;
    };
    paths.forEach(path => {
      const outline = path.curves.flatMap(curve => sampleCurve(curve, compact ? 23 : 38));
      const bounds = outline.reduce((bounds, point) => ({ left: Math.min(bounds.left, point.x), right: Math.max(bounds.right, point.x), top: Math.min(bounds.top, point.y), bottom: Math.max(bounds.bottom, point.y) }), { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity });
      const step = compact ? .034 : .024;
      for (let positionY = bounds.top; positionY < bounds.bottom; positionY += step) {
        for (let positionX = bounds.left; positionX < bounds.right; positionX += step) {
          const sampleX = positionX + (random() - .5) * step * .7;
          const sampleY = positionY + (random() - .5) * step * .7;
          if (inside(sampleX, sampleY, outline)) add(sampleX, sampleY, path.part);
        }
      }
      outline.forEach(point => add(point.x, point.y, path.part, true));
    });
    const details = [
      [[-.23,-.64],[-.18,-.71],[-.1,-.72],[-.06,-.65]],
      [[.07,-.65],[.12,-.73],[.21,-.7],[.24,-.63]],
      [[-.07,-.43],[-.01,-.38],[.07,-.38],[.12,-.44]],
      [[-.2,.21],[-.06,.25],[.08,.25],[.24,.21]],
      [[-.16,.36],[-.18,.55],[-.28,.74],[-.34,.9]],
      [[.04,.34],[.01,.57],[.03,.78],[.08,.96]],
      [[.18,.35],[.24,.57],[.29,.73],[.36,.91]],
      [[-.4,-.83],[-.55,-.48],[-.34,-.02],[-.55,.21]],
      [[.36,-.96],[.44,-.54],[.33,-.12],[.59,.26]]
    ];
    details.forEach((curve, detailIndex) => sampleCurve(curve, compact ? 38 : 62).forEach(point => {
      add(point.x, point.y, "detail", true);
      points[points.length - 1].color = detailIndex < 3 ? "255,238,214" : "144,227,255";
      points[points.length - 1].size = detailIndex < 3 ? 1.15 : .8;
    }));
    return points;
  }

  function makeMeteorEvents(compact = false) {
    const random = randomGenerator(31007);
    const count = compact ? 38 : 64;
    return Array.from({ length: count }, (_, index) => ({
      start: index === 0 ? -.3 : index / count * 12.5 + random() * .4,
      flight: 1.2 + random() * .7,
      groundX: (random() - .5) * 2.6,
      depth: .15 + random() * 1.8,
      power: index % 7 === 0 ? 1.4 : .6 + random() * .45,
      seed: index * 41 + 77,
      color: index % 3 === 0 ? "255,205,127" : index % 3 === 1 ? "121,202,255" : "209,157,255"
    }));
  }

  function meteorEventState(event, elapsed) {
    const age = elapsed - event.start;
    const impactAge = age - event.flight;
    return { age, impactAge, progress: Math.max(0, Math.min(1, age / event.flight)), flying: age >= 0 && impactAge < 0, impacted: impactAge >= 0 && impactAge < 3.5 };
  }

  function meteorParticleState(particle, elapsed, reduced = false) {
    const vortexAngle = particle.phase + elapsed * .16 * (particle.orbit > .45 ? 1 : -1);
    const radius = .15 + particle.orbit * 1.35;
    const vortexX = Math.cos(vortexAngle) * radius * 1.25;
    const vortexY = Math.sin(vortexAngle) * radius * .65 - .15;
    const rise = smoothStep((elapsed - 7 - particle.delay) / 7);
    const sourceX = Math.cos(particle.phase) * (1 + particle.orbit);
    const sourceY = 1 + Math.sin(particle.phase) * .14;
    const gather = reduced ? 1 : smoothStep((elapsed - 21 - particle.delay) / 7);
    const positionX = sourceX + (vortexX - sourceX) * rise;
    const positionY = sourceY + (vortexY - sourceY) * rise;
    return { x: positionX + (particle.x - positionX) * gather, y: positionY + (particle.y - positionY) * gather, gather, alpha: (.12 + rise * .65) * (1 - gather) + gather * particle.alpha };
  }

  class Theatre {
    constructor(canvas, onChapter = () => {}, reduced = false) {
      this.canvas = canvas;
      this.context = canvas.getContext("2d");
      this.onChapter = onChapter;
      this.chapter = -1;
      this.elapsed = reduced ? 33 : 0;
      this.total = 0;
      this.lastTime = 0;
      this.frame = 0;
      this.width = 0;
      this.height = 0;
      this.active = false;
      this.visible = false;
      this.playing = true;
      this.reduced = reduced;
      this.pointer = { x: 0, y: 0 };
      this.meteorShots = [];
      this.tick = this.tick.bind(this);
      this.resize();
      this.canvas.setAttribute("aria-label", "星落倾心：流星落地涟漪、蓝金油画星空，最后汇成五彩少女轮廓");
    }

    resize() {
      const bounds = this.canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height || !this.context) return;
      this.width = bounds.width;
      this.height = bounds.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.7);
      this.canvas.width = Math.round(this.width * ratio);
      this.canvas.height = Math.round(this.height * ratio);
      this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const random = randomGenerator(19);
      this.stars = Array.from({ length: this.width < 600 ? 65 : 120 }, () => ({ x: random(), y: random(), radius: .3 + random(), phase: random() * TAU }));
      this.points = makeGirlParticles(this.width < 600);
      this.meteorEvents = makeMeteorEvents(this.width < 600);
      this.render();
    }

    restart() {
      this.elapsed = this.reduced ? 33 : 0;
      this.total = 0;
      this.lastTime = 0;
      this.chapter = -1;
      this.meteorShots = [];
      this.render();
    }

    seekChapter(index) {
      const chapter = meteorChapters[index];
      if (!chapter) return;
      this.elapsed = chapter.time;
      this.lastTime = 0;
      this.meteorShots = [];
      this.render();
    }

    sync() {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
      this.lastTime = 0;
      this.render();
      if (this.context && this.active && this.visible && this.playing && !this.reduced && !document.hidden) this.frame = requestAnimationFrame(this.tick);
    }

    tick(time) {
      this.frame = 0;
      if (!this.active || !this.visible || !this.playing || this.reduced || document.hidden) return;
      if (!this.lastTime) this.lastTime = time;
      const delta = time - this.lastTime;
      if (delta >= 32) {
        const advance = Math.min(delta, 80) / 1000;
        this.elapsed += advance;
        this.total += advance;
        this.lastTime = time;
        if (this.elapsed >= duration) this.restart();
        this.render();
      }
      this.frame = requestAnimationFrame(this.tick);
    }

    point(positionX, positionY, size, tone = "gold", alpha = 1) {
      const palette = { gold: "235,203,147", pink: "246,170,192", white: "249,235,211" };
      const context = this.context;
      context.fillStyle = `rgba(${palette[tone] || (tone.includes(",") ? tone : palette.gold)},${Math.max(0, Math.min(alpha, 1))})`;
      context.beginPath();
      context.arc(positionX, positionY, Math.max(.2, size), 0, TAU);
      context.fill();
    }

    trail(startX, startY, endX, endY, alpha) {
      const context = this.context;
      const gradient = context.createLinearGradient(startX, startY, endX, endY);
      gradient.addColorStop(0, "rgba(230,185,140,0)");
      gradient.addColorStop(1, `rgba(245,219,170,${alpha})`);
      context.strokeStyle = gradient;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
      context.stroke();
    }

    starrySky(elapsed, opacity) {
      const context = this.context;
      const random = randomGenerator(8809);
      context.save();
      context.globalAlpha = opacity;
      const sky = context.createLinearGradient(0, 0, 0, this.height * .72);
      sky.addColorStop(0, "#0e1845");
      sky.addColorStop(.55, "#142b59");
      sky.addColorStop(1, "#101222");
      context.fillStyle = sky;
      context.fillRect(0, 0, this.width, this.height * .78);
      const centers = [[.31,.32,.25], [.64,.23,.15], [.86,.16,.065]];
      const count = this.width < 600 ? 730 : 1350;
      for (let index = 0; index < count; index++) {
        const cluster = centers[index % 3];
        const radius = Math.sqrt(random()) * cluster[2];
        const phase = random() * TAU;
        const angle = phase + radius * 26 + elapsed * .055 * (index % 3 === 1 ? -1 : 1);
        const positionX = (cluster[0] + Math.cos(angle) * radius) * this.width;
        const positionY = (cluster[1] + Math.sin(angle) * radius * 1.08) * this.height;
        const tangent = angle + Math.PI / 2;
        const length = 2 + random() * (this.width < 600 ? 4 : 8);
        const colors = ["87,155,225", "73,108,190", "88,185,191", "244,202,113", "151,174,208"];
        context.strokeStyle = `rgba(${colors[index % 5]},${.18 + random() * .43})`;
        context.lineWidth = 1 + random() * 1.6;
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(positionX, positionY);
        context.lineTo(positionX + Math.cos(tangent) * length, positionY + Math.sin(tangent) * length);
        context.stroke();
      }
      for (let ribbon = 0; ribbon < 16; ribbon++) {
        context.strokeStyle = `rgba(${ribbon % 3 === 0 ? "220,193,105" : "88,151,214"},${ribbon % 3 === 0 ? .23 : .18})`;
        context.lineWidth = ribbon % 3 === 0 ? 1.3 : 2;
        context.beginPath();
        for (let step = 0; step <= 95; step++) {
          const along = step / 95;
          const positionX = along * this.width;
          const positionY = this.height * (.4 + Math.sin(along * 7.2 + elapsed * .045) * .055 + Math.cos(along * 12 - .8) * .025 + ribbon * .004);
          if (step === 0) context.moveTo(positionX, positionY);
          else context.lineTo(positionX, positionY);
        }
        context.stroke();
      }
      for (const [centerX, centerY, size] of [[.12,.17,1], [.53,.12,.8], [.77,.37,.6], [.89,.15,1.5], [.44,.43,.55]]) {
        const radius = Math.min(this.width, this.height) * .018 * size;
        for (let ring = 0; ring < 7; ring++) {
          context.strokeStyle = `rgba(246,205,113,${.55 - ring * .065})`;
          context.lineWidth = ring === 0 ? 2 : 1.2;
          context.beginPath();
          context.ellipse(centerX * this.width, centerY * this.height, radius + ring * 2.7, radius + ring * 2.5, elapsed * .04, .1 + ring * .2, TAU - .3 + ring * .2);
          context.stroke();
        }
        this.point(centerX * this.width, centerY * this.height, radius * .55, "255,227,152", .85);
      }
      context.fillStyle = "rgba(7,14,27,.8)";
      context.beginPath();
      context.moveTo(0, this.height * .59);
      for (let step = 0; step <= 80; step++) {
        const along = step / 80;
        context.lineTo(along * this.width, this.height * (.56 + Math.sin(along * 16) * .026 + Math.cos(along * 28) * .009));
      }
      context.lineTo(this.width, this.height * .79);
      context.lineTo(0, this.height * .79);
      context.fill();
      context.beginPath();
      context.moveTo(this.width * .08, this.height * .61);
      context.bezierCurveTo(this.width * .04, this.height * .44, this.width * .09, this.height * .34, this.width * .08, this.height * .25);
      context.bezierCurveTo(this.width * .16, this.height * .42, this.width * .12, this.height * .43, this.width * .17, this.height * .61);
      context.fill();
      context.restore();
    }

    meteorGround(positionX, depth) {
      const perspective = 1 / (1 + depth * .56);
      return { x: this.width / 2 + positionX * this.width * .36 * perspective, y: this.height * (.56 + .21 / (1 + Math.max(-.1, depth) * .95)), perspective };
    }

    meteorImpact(event, age, opacity = 1) {
      const context = this.context;
      const impact = this.meteorGround(event.groundX, event.depth);
      const fade = Math.exp(-age * .8) * opacity;
      const random = randomGenerator(event.seed);
      for (let ring = 0; ring < 4; ring++) {
        const radius = Math.max(0, age - ring * .12) * (.52 + event.power * .35);
        if (!radius) continue;
        context.strokeStyle = `rgba(${event.color},${fade * (.7 - ring * .12)})`;
        context.lineWidth = (ring === 0 ? 1.6 : .8) * impact.perspective;
        context.beginPath();
        for (let index = 0; index <= 64; index++) {
          const angle = index / 64 * TAU;
          const position = this.meteorGround(event.groundX + Math.cos(angle) * radius, event.depth + Math.sin(angle) * radius * .35);
          if (index === 0) context.moveTo(position.x, position.y);
          else context.lineTo(position.x, position.y);
        }
        context.stroke();
      }
      const bloom = context.createRadialGradient(impact.x, impact.y, 0, impact.x, impact.y, 35 * event.power + age * 18);
      bloom.addColorStop(0, `rgba(${event.color},${Math.max(0, .55 - age * .5) * opacity})`);
      bloom.addColorStop(1, `rgba(${event.color},0)`);
      context.fillStyle = bloom;
      context.fillRect(impact.x - 100, impact.y - 100, 200, 200);
      const count = this.width < 600 ? 30 : 55;
      for (let index = 0; index < count; index++) {
        const angle = random() * TAU;
        const speed = (25 + random() * 80) * event.power * impact.perspective;
        const positionX = impact.x + Math.cos(angle) * age * speed;
        const positionY = impact.y - (30 + random() * 80) * age * impact.perspective + age * age * 38;
        this.point(positionX, positionY, .5 + random() * 1.1, event.color, fade * Math.max(0, 1 - age / 2.5));
      }
      if (age < 2.8) {
        const rise = age * this.height * .065;
        const scale = (3 + Math.sin(Math.min(1, age) * Math.PI / 2) * 8) * impact.perspective;
        context.strokeStyle = `rgba(255,171,208,${fade * .8})`;
        context.lineWidth = 1;
        context.beginPath();
        for (let index = 0; index <= 45; index++) {
          const angle = index / 45 * TAU;
          const positionX = impact.x + Math.sin(age * 2) * 5 + Math.sin(angle) ** 3 * scale;
          const positionY = impact.y - rise - (13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle)) / 16 * scale;
          if (index === 0) context.moveTo(positionX, positionY);
          else context.lineTo(positionX, positionY);
        }
        context.stroke();
      }
    }

    fallingMeteor(event, elapsed, opacity) {
      const state = meteorEventState(event, elapsed);
      const impact = this.meteorGround(event.groundX, event.depth);
      if (state.flying) {
        const startX = impact.x + this.width * (.25 + event.power * .12);
        const startY = -this.height * .12;
        const positionAt = progress => ({ x: startX + (impact.x - startX) * progress, y: startY + (impact.y - startY) * progress });
        const head = positionAt(state.progress);
        const tail = positionAt(Math.max(0, state.progress - .23));
        const context = this.context;
        const gradient = context.createLinearGradient(tail.x, tail.y, head.x, head.y);
        gradient.addColorStop(0, `rgba(${event.color},0)`);
        gradient.addColorStop(.75, `rgba(${event.color},${opacity * .55})`);
        gradient.addColorStop(1, `rgba(244,244,255,${opacity})`);
        context.strokeStyle = gradient;
        context.lineWidth = 6 + event.power * 3;
        context.globalAlpha = .12;
        context.beginPath();
        context.moveTo(tail.x, tail.y);
        context.lineTo(head.x, head.y);
        context.stroke();
        context.globalAlpha = 1;
        context.lineWidth = 1.3 + event.power * 1.2;
        context.beginPath();
        context.moveTo(tail.x, tail.y);
        context.lineTo(head.x, head.y);
        context.stroke();
        this.point(head.x, head.y, 6 * event.power, event.color, opacity * .055);
        this.point(head.x, head.y, 2 * event.power, "white", opacity);
        for (let dust = 0; dust < 13; dust++) {
          const behind = positionAt(Math.max(0, state.progress - dust * .012));
          this.point(behind.x + Math.sin(dust * event.seed) * 2, behind.y, .6, event.color, (1 - dust / 13) * opacity * .65);
        }
        const reflection = Math.max(0, (state.progress - .7) / .3);
        this.trail(impact.x, impact.y + reflection * 20, impact.x, impact.y, reflection * opacity * .35);
      }
      if (state.impacted) this.meteorImpact(event, state.impactAge, opacity);
    }

    meteors() {
      const context = this.context;
      const elapsed = this.reduced ? this.elapsed || 33 : this.elapsed;
      const chapter = elapsed < 11 ? 0 : elapsed < 24 ? 1 : 2;
      if (chapter !== this.chapter) { this.chapter = chapter; this.onChapter(meteorChapters[chapter], chapter); }
      const paint = smoothStep((elapsed - 7) / 7);
      const finale = smoothStep((elapsed - 23) / 7);
      this.starrySky(elapsed, (.18 + paint * .82) * (1 - finale * .78));
      const ground = context.createLinearGradient(0, this.height * .55, 0, this.height * .79);
      ground.addColorStop(0, "rgba(27,65,97,.18)");
      ground.addColorStop(1, "rgba(10,15,29,0)");
      context.fillStyle = ground;
      context.fillRect(0, this.height * .55, this.width, this.height * .24);
      context.save();
      context.globalCompositeOperation = "lighter";
      const rainOpacity = 1 - smoothStep((elapsed - 13) / 5);
      this.meteorEvents?.forEach(event => this.fallingMeteor(event, elapsed, rainOpacity));
      if (!this.reduced) {
        this.meteorShots = this.meteorShots.filter(event => elapsed - event.start < event.flight + 3.5);
        this.meteorShots.forEach(event => this.fallingMeteor(event, elapsed, 1));
      }
      const scale = Math.min(this.width * .26, this.height * .225);
      const centerX = this.width / 2;
      const centerY = this.height * .39;
      const yaw = this.reduced ? -.04 : Math.sin(elapsed * .23) * .06 + this.pointer.x * .16;
      this.points.forEach((particle, index) => {
        const state = meteorParticleState(particle, elapsed, this.reduced && elapsed >= 24);
        if (elapsed < 6 && !this.reduced) return;
        const parallax = Math.sin(particle.phase) * .06 * (1 - state.gather);
        const positionX = centerX + (state.x * Math.cos(yaw) + parallax * Math.sin(yaw)) * scale;
        const positionY = centerY + state.y * scale;
        const alpha = state.alpha * (state.gather > .9 ? .95 : .28) * (this.reduced ? 1 : Math.min(1, (elapsed - 6) / 3));
        const color = state.gather < .2 ? index % 4 === 0 ? "255,214,124" : "113,179,251" : particle.color;
        if (index % 17 === 0) this.point(positionX, positionY, particle.size * 3, color, alpha * .065);
        this.point(positionX, positionY, particle.size * (this.width < 600 ? .8 : 1), color, alpha);
      });
      if (finale > .05) {
        for (let index = 0; index < 150; index++) {
          const angle = index / 150 * TAU;
          const radius = scale * (1.1 + Math.sin(angle * 4 + elapsed * .2) * .12);
          this.point(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius * .83, index % 11 === 0 ? 1.3 : .5, index % 2 ? "pink" : "gold", finale * .28);
        }
        for (let index = 0; index < 55; index++) {
          const angle = index / 54 * TAU;
          const size = scale * .17;
          this.point(centerX + scale * .66 + Math.sin(angle) ** 3 * size, centerY - scale * .25 - (13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle)) / 16 * size, 1, "255,154,206", finale * .8);
        }
      }
      context.restore();
    }

    render() {
      if (!this.context || !this.width || !this.height) return;
      const context = this.context;
      const time = this.reduced ? 4.6 : this.total;
      context.clearRect(0, 0, this.width, this.height);
      const glow = context.createRadialGradient(this.width / 2, this.height * .42, 0, this.width / 2, this.height * .42, this.width * .55);
      glow.addColorStop(0, "rgba(126,79,89,.08)");
      glow.addColorStop(1, "rgba(14,14,17,0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, this.width, this.height);
      this.stars?.forEach(star => this.point(star.x * this.width, star.y * this.height * .88, star.radius, "gold", .15 + (Math.sin(time * .45 + star.phase) + 1) * .13));
      this.meteors();
    }
  }

  window.RomanceParticles = Object.freeze({ Theatre, makeGirlParticles, makeMeteorEvents, meteorEventState, meteorParticleState, meteorChapters, duration });
})();
