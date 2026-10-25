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
    { kicker: "流星与涟漪", title: "星光奔向大地，我奔向你。", time: 2 },
    { kicker: "樱花与星夜", title: "等一树花开，也等你看向我。", time: 15 },
    { kicker: "星光成你", title: "星光为证，往后的温柔都给你。", time: 35 }
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

  const girlShapes = [
    { part: "hair", curves: [ [[-.25,-.6],[-.49,-.94],[-.29,-1.28],[.05,-1.23]], [[.05,-1.23],[.46,-1.24],[.43,-.83],[.37,-.59]], [[.37,-.59],[.3,-.27],[.58,-.12],[.42,.23]], [[.42,.23],[.24,.43],[.11,.21],[.04,.11]], [[.04,.11],[-.05,.3],[-.39,.31],[-.39,.04]], [[-.39,.04],[-.22,-.11],[-.48,-.36],[-.25,-.6]] ] },
    { part: "skin", curves: [ [[-.065,-.61],[-.07,-.49],[-.08,-.43],[-.23,-.39]], [[-.23,-.39],[-.34,-.31],[-.25,-.15],[-.13,-.17]], [[-.13,-.17],[.01,-.11],[.19,-.17],[.26,-.31]], [[.26,-.31],[.21,-.39],[.08,-.42],[.085,-.6]], [[.085,-.6],[.04,-.65],[-.01,-.65],[-.065,-.61]] ] },
    { part: "skin", curves: [ [[.17,-.35],[.32,-.39],[.31,-.12],[.35,.02]], [[.35,.02],[.36,.09],[.23,.21],[.14,.19]], [[.14,.19],[.07,.2],[.07,.11],[.14,.1]], [[.14,.1],[.21,.07],[.24,.04],[.23,-.02]], [[.23,-.02],[.18,-.13],[.11,-.25],[.17,-.35]] ] },
    { part: "shoe", curves: [ [[-.17,.94],[-.21,1.04],[-.26,1.1],[-.12,1.1]], [[-.12,1.1],[-.04,1.12],[.01,1.06],[-.07,1.02]], [[-.07,1.02],[-.07,.99],[-.06,.97],[-.06,.94]], [[-.06,.94],[-.1,.92],[-.14,.92],[-.17,.94]] ] },
    { part: "shoe", curves: [ [[.12,.94],[.13,1.04],[.12,1.1],[.23,1.1]], [[.23,1.1],[.37,1.11],[.35,1.03],[.23,1.02]], [[.23,1.02],[.22,.98],[.24,.96],[.23,.94]], [[.23,.94],[.19,.93],[.16,.93],[.12,.94]] ] },
    { part: "dress", curves: [ [[-.18,-.26],[-.11,-.29],[-.05,-.24],[0,-.24]], [[0,-.24],[.07,-.3],[.14,-.3],[.21,-.26]], [[.21,-.26],[.15,-.11],[.13,.06],[.17,.18]], [[.17,.18],[.21,.48],[.42,.82],[.53,.98]], [[.53,.98],[.34,1.09],[.08,1.1],[-.03,1.04]], [[-.03,1.04],[-.25,1.09],[-.45,1.05],[-.53,.96]], [[-.53,.96],[-.34,.64],[-.19,.36],[-.17,.17]], [[-.17,.17],[-.14,.02],[-.15,-.1],[-.18,-.26]] ] },
    { part: "face", curves: [ [[-.23,-.98],[-.29,-.82],[-.21,-.61],[-.03,-.56]], [[-.03,-.56],[.13,-.51],[.28,-.7],[.25,-.94]], [[.25,-.94],[.16,-1.1],[-.05,-1.11],[-.23,-.98]] ] },
    { part: "fringe", curves: [ [[-.27,-.91],[-.27,-1.2],[.14,-1.26],[.29,-1.02]], [[.29,-1.02],[.38,-.92],[.25,-.74],[.19,-.73]], [[.19,-.73],[.21,-.93],[.09,-.96],[.015,-1.04]], [[.015,-1.04],[-.08,-.91],[-.18,-.85],[-.27,-.91]] ] }
  ];

  function traceShape(context, shape) {
    context.beginPath();
    context.moveTo(...shape.curves[0][0]);
    shape.curves.forEach(curve => context.bezierCurveTo(...curve[1], ...curve[2], ...curve[3]));
    context.closePath();
  }

  function makeGirlParticles(compact) {
    const random = randomGenerator(20261026);
    const points = [];
    const colors = ["132,189,247", "169,150,241", "237,165,212", "245,205,159", "135,222,215"];
    const inside = (positionX, positionY, polygon) => {
      let contained = false;
      for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
        const current = polygon[index];
        const last = polygon[previous];
        if ((current.y > positionY) !== (last.y > positionY) && positionX < (last.x - current.x) * (positionY - current.y) / (last.y - current.y) + current.x) contained = !contained;
      }
      return contained;
    };
    girlShapes.forEach(path => {
      const outline = path.curves.flatMap(curve => sampleCurve(curve, compact ? 23 : 38));
      const bounds = outline.reduce((bounds, point) => ({ left: Math.min(bounds.left, point.x), right: Math.max(bounds.right, point.x), top: Math.min(bounds.top, point.y), bottom: Math.max(bounds.bottom, point.y) }), { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity });
      const add = (positionX, positionY, edge) => {
        const skin = path.part === "skin" || path.part === "face";
        const colorIndex = Math.abs(Math.floor(positionY * 6 + positionX * 3 + 30)) % colors.length;
        const depth = Math.sqrt(Math.max(0, 1 - (positionX / .58) ** 2)) * (skin ? .18 : .1);
        points.push({ x: positionX, y: positionY, z: depth, color: skin ? "255,218,197" : colors[colorIndex], size: edge ? .75 : .4 + random() * .3, alpha: edge ? .68 : .18 + depth, edge, phase: random() * TAU, orbit: random(), delay: random() * 1.8, part: path.part });
      };
      const step = compact ? .029 : .023;
      for (let positionY = bounds.top; positionY < bounds.bottom; positionY += step) {
        for (let positionX = bounds.left; positionX < bounds.right; positionX += step) {
          const sampleX = positionX + (random() - .5) * step * .7;
          const sampleY = positionY + (random() - .5) * step * .7;
          if (inside(sampleX, sampleY, outline)) add(sampleX, sampleY, false);
        }
      }
      outline.forEach(point => add(point.x, point.y, true));
    });
    return points;
  }

  function proposalState(elapsed, reduced = false) {
    const time = reduced ? 38 : elapsed;
    return {
      reveal: smoothStep((time - 25) / 4),
      arrival: smoothStep((time - 27) / 2.5),
      kneel: smoothStep((time - 29.5) / 3),
      offer: smoothStep((time - 32) / 2.8),
      reach: smoothStep((time - 34) / 2.5),
      farewell: 1 - smoothStep((time - 39) / 1)
    };
  }

  function proposalLayout(width, height) {
    const scale = Math.min(width * .29, height * .255);
    return { scale, centerX: width * (width < 600 ? .6 : .53), centerY: height * .74 - scale * 1.1, groundY: height * .74 };
  }

  function makeMeteorEvents(compact = false) {
    const random = randomGenerator(31007);
    const count = compact ? 26 : 44;
    return Array.from({ length: count }, (_, index) => ({
      start: index === 0 ? -.8 : index / count * 12.5 + random() * .4,
      flight: 1.65 + random() * .9,
      groundX: (random() - .5) * 2.6,
      depth: .12 + random() * 2.2,
      power: index % 8 === 0 ? 1.5 : .55 + random() * .5,
      slant: .25 + random() * .32,
      curve: (random() - .5) * .08,
      seed: index * 41 + 77,
      color: index % 5 === 0 ? "255,210,153" : index % 5 === 1 ? "218,183,244" : "146,210,255"
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

  function makeSakuraTree(compact = false) {
    const random = randomGenerator(80225);
    const branches = [];
    const blossoms = [];
    function branch(startX, startY, length, angle, width, level) {
      const endX = startX + Math.cos(angle) * length;
      const endY = startY + Math.sin(angle) * length;
      const bend = (random() - .5) * length * .6;
      const birth = (6 - level) * .095;
      branches.push({ anchors: [[startX, startY], [startX + Math.cos(angle + .25) * length * .35 + bend, startY + Math.sin(angle) * length * .3], [endX - Math.cos(angle - .2) * length * .25, endY - Math.sin(angle) * length * .25], [endX, endY]], width, birth });
      if (level < 3) {
        const count = compact ? 10 : 17;
        for (let index = 0; index < count; index++) {
          const phase = random() * TAU;
          const radius = Math.sqrt(random()) * (.075 + length * .25);
          blossoms.push({ x: endX + Math.cos(phase) * radius * 1.3, y: endY + Math.sin(phase) * radius * .7, size: .009 + random() * .012, tone: Math.floor(random() * 4), birth: .44 + random() * .35, phase: random() * TAU });
        }
      }
      if (!level) return;
      const spread = level > 3 ? .53 : .45;
      for (const direction of [-1, 1]) branch(endX, endY, length * (.65 + random() * .12), angle + direction * (spread + random() * .2), width * .65, level - 1);
    }
    branch(0, 0, .36, -Math.PI / 2 + .14, .045, 6);
    const petals = Array.from({ length: compact ? 32 : 64 }, () => {
      const flower = blossoms[Math.floor(random() * blossoms.length)];
      return { x: flower.x, y: flower.y, phase: random() * TAU, offset: random(), speed: .7 + random() * .6, size: .012 + random() * .014, tone: Math.floor(random() * 4) };
    });
    return { branches, blossoms, petals };
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
      this.canvas.setAttribute("aria-label", "星落倾心：流星落水、樱花星夜，星光汇成珠光长裙少女，西装男生单膝跪地递出闪耀钻戒");
    }

    resize() {
      const bounds = this.canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height || !this.context) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.7);
      if (this.width === bounds.width && this.height === bounds.height && this.ratio === ratio) return;
      this.width = bounds.width;
      this.height = bounds.height;
      this.ratio = ratio;
      this.canvas.width = Math.round(this.width * ratio);
      this.canvas.height = Math.round(this.height * ratio);
      this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const random = randomGenerator(19);
      this.stars = Array.from({ length: this.width < 600 ? 65 : 120 }, () => ({ x: random(), y: random(), radius: .3 + random(), phase: random() * TAU }));
      this.points = makeGirlParticles(this.width < 600);
      this.meteorEvents = makeMeteorEvents(this.width < 600);
      this.sakura = makeSakuraTree(this.width < 600);
      this.treeSurface = null;
      this.treeGrowth = -1;
      this.skySurface = null;
      this.skyTime = -1;
      this.glowSprites = new Map();
      this.flowerSprites = [];
      this.girlSurface = null;
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

    makeSurface(width, height) {
      const surface = this.canvas.ownerDocument?.createElement("canvas");
      if (!surface) return null;
      surface.width = Math.max(1, Math.round(width));
      surface.height = Math.max(1, Math.round(height));
      return surface.getContext("2d") ? surface : null;
    }

    glow(positionX, positionY, radius, color, opacity) {
      if (opacity <= .001 || radius < 1) return;
      let sprite = this.glowSprites.get(color);
      if (sprite === undefined) {
        sprite = this.makeSurface(64, 64);
        if (sprite) {
          const context = sprite.getContext("2d");
          const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
          gradient.addColorStop(0, `rgba(${color},.75)`);
          gradient.addColorStop(.15, `rgba(${color},.35)`);
          gradient.addColorStop(.45, `rgba(${color},.09)`);
          gradient.addColorStop(1, `rgba(${color},0)`);
          context.fillStyle = gradient;
          context.fillRect(0, 0, 64, 64);
        }
        this.glowSprites.set(color, sprite);
      }
      const context = this.context;
      context.save();
      context.globalAlpha *= opacity;
      if (sprite) context.drawImage(sprite, positionX - radius, positionY - radius, radius * 2, radius * 2);
      else {
        const gradient = context.createRadialGradient(positionX, positionY, 0, positionX, positionY, radius);
        gradient.addColorStop(0, `rgba(${color},.5)`);
        gradient.addColorStop(1, `rgba(${color},0)`);
        context.fillStyle = gradient;
        context.fillRect(positionX - radius, positionY - radius, radius * 2, radius * 2);
      }
      context.restore();
    }

    flowerSprite(tone) {
      if (this.flowerSprites[tone] !== undefined) return this.flowerSprites[tone];
      const sprite = this.makeSurface(32, 32);
      if (sprite) {
        const context = sprite.getContext("2d");
        const colors = ["#f8b9ce", "#e88aaf", "#ffe0df", "#cf85b0"];
        context.fillStyle = colors[tone];
        for (let index = 0; index < 5; index++) {
          const angle = index / 5 * TAU;
          context.beginPath();
          context.ellipse(16 + Math.cos(angle) * 5, 16 + Math.sin(angle) * 5, 5.2, 3.2, angle, 0, TAU);
          context.fill();
        }
        context.fillStyle = "#ffe8b0";
        context.beginPath();
        context.arc(16, 16, 1.7, 0, TAU);
        context.fill();
      }
      this.flowerSprites[tone] = sprite;
      return sprite;
    }

    drawSakura(context, size, growth) {
      context.save();
      context.translate(size * .9, size * 1.45);
      context.scale(size * .88, size * .88);
      context.lineCap = "round";
      this.sakura.branches.forEach(branch => {
        const reveal = smoothStep((growth - branch.birth) / .22);
        if (!reveal) return;
        const anchors = branch.anchors;
        context.save();
        context.globalAlpha = reveal;
        context.strokeStyle = "#573441";
        context.lineWidth = branch.width;
        context.beginPath();
        context.moveTo(...anchors[0]);
        context.bezierCurveTo(...anchors[1], ...anchors[2], ...anchors[3]);
        context.stroke();
        context.strokeStyle = "rgba(242,163,185,.45)";
        context.lineWidth = branch.width * .23;
        context.stroke();
        context.restore();
      });
      this.sakura.blossoms.forEach(flower => {
        const bloom = smoothStep((growth - flower.birth) / .18);
        if (!bloom) return;
        const sprite = this.flowerSprite(flower.tone);
        const radius = flower.size * ( .35 + bloom * .65);
        context.globalAlpha = bloom * .85;
        if (sprite) context.drawImage(sprite, flower.x - radius, flower.y - radius, radius * 2, radius * 2);
        else {
          context.fillStyle = ["#f8b9ce", "#e88aaf", "#ffe0df", "#cf85b0"][flower.tone];
          context.beginPath();
          context.ellipse(flower.x, flower.y, radius, radius * .6, flower.phase, 0, TAU);
          context.fill();
        }
      });
      context.restore();
    }

    sakuraTree(elapsed, finale) {
      const context = this.context;
      const compact = this.width < 600;
      const growth = this.reduced ? 1 : smoothStep((elapsed - .6) / 9);
      if (!growth) return;
      const size = Math.min(this.width * (compact ? .56 : .32), this.height * .6);
      const shoreY = this.height * .66;
      const originX = this.width * (compact ? .19 : .17);
      const left = originX - size * .9;
      const top = shoreY - size * 1.45;
      const opacity = (compact ? .84 - finale * .43 : .98 - finale * .2);
      if (!this.treeSurface) this.treeSurface = this.makeSurface(size * 2, size * 1.6);
      const growthFrame = Math.round(growth * 36);
      if (this.treeSurface && this.treeGrowth !== growthFrame) {
        const cachedContext = this.treeSurface.getContext("2d");
        cachedContext.clearRect(0, 0, this.treeSurface.width, this.treeSurface.height);
        this.drawSakura(cachedContext, size, growthFrame / 36);
        this.treeGrowth = growthFrame;
      }
      const sway = this.reduced ? 0 : Math.sin(elapsed * .38) * .006;
      context.save();
      context.globalAlpha = opacity;
      context.translate(originX, shoreY);
      context.rotate(sway);
      if (this.treeSurface) context.drawImage(this.treeSurface, left - originX, top - shoreY);
      else {
        context.translate(left - originX, top - shoreY);
        this.drawSakura(context, size, growth);
      }
      context.restore();
      if (this.treeSurface) {
        context.save();
        context.globalAlpha = opacity * .14;
        context.translate(0, shoreY * 1.34);
        context.scale(1, -.34);
        context.drawImage(this.treeSurface, left, top);
        context.restore();
      }
      this.glow(originX, shoreY, size * .42, "231,143,189", opacity * .14);
      if (growth < .55) return;
      const time = this.reduced ? 12 : elapsed;
      this.sakura.petals.forEach(petal => {
        const progress = (time * .065 * petal.speed + petal.offset) % 1;
        const positionX = originX + petal.x * size * .88 + progress * size * .8 + Math.sin(progress * 9 + petal.phase) * size * .06;
        const positionY = shoreY + petal.y * size * .88 + progress * size * .65;
        const alpha = Math.sin(progress * Math.PI) * opacity * .75 * smoothStep((growth - .55) / .3);
        context.save();
        context.globalAlpha = alpha;
        context.translate(positionX, positionY);
        context.rotate(petal.phase + time * .6);
        context.fillStyle = petal.tone % 2 ? "#ffc7de" : "#ec9dbd";
        context.beginPath();
        context.ellipse(0, 0, petal.size * size * .6, petal.size * size * (.18 + Math.abs(Math.sin(time * .7 + petal.phase)) * .2), 0, 0, TAU);
        context.fill();
        context.restore();
      });
    }

    waterSurface(elapsed, finale) {
      const context = this.context;
      const horizon = this.height * .59;
      const gradient = context.createLinearGradient(0, horizon, 0, this.height);
      gradient.addColorStop(0, "rgba(21,43,69,.7)");
      gradient.addColorStop(.18, "rgba(9,24,42,.85)");
      gradient.addColorStop(1, "rgba(5,10,21,0)");
      context.fillStyle = gradient;
      context.fillRect(0, horizon, this.width, this.height - horizon);
      context.save();
      context.globalCompositeOperation = "lighter";
      const random = randomGenerator(4301);
      const time = this.reduced ? 12 : elapsed;
      const count = this.width < 600 ? 36 : 70;
      for (let index = 0; index < count; index++) {
        const depth = random();
        const positionX = random() * this.width;
        const positionY = horizon + depth ** 1.5 * this.height * .24;
        const shimmer = .025 + (Math.sin(time * .65 + index * 2) + 1) * .02;
        context.strokeStyle = `rgba(140,191,225,${shimmer * (1 - finale * .45)})`;
        context.lineWidth = .5;
        context.beginPath();
        context.moveTo(positionX, positionY);
        context.lineTo(positionX + 4 + depth * this.width * .03, positionY);
        context.stroke();
      }
      context.restore();
    }

    starrySky(elapsed, opacity) {
      if (!this.skySurface) this.skySurface = this.makeSurface(this.width, this.height);
      if (!this.skySurface) { this.paintStarrySky(elapsed, opacity); return; }
      const time = Math.floor(elapsed * 4) / 4;
      const context = this.context;
      if (time !== this.skyTime) {
        const cachedContext = this.skySurface.getContext("2d");
        cachedContext.clearRect(0, 0, this.width, this.height);
        this.context = cachedContext;
        try { this.paintStarrySky(time, 1); }
        finally { this.context = context; }
        this.skyTime = time;
      }
      context.save();
      context.globalAlpha = opacity;
      context.drawImage(this.skySurface, 0, 0);
      context.restore();
    }

    paintStarrySky(elapsed, opacity) {
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
      const safeDepth = Math.max(-.15, depth);
      const perspective = 1 / (1 + safeDepth * .56);
      return { x: this.width / 2 + positionX * this.width * .36 * perspective, y: this.height * (.59 + .19 / (1 + safeDepth * .95)), perspective };
    }

    ripple(impact, age, power, color, opacity) {
      const context = this.context;
      const radius = (1 - Math.exp(-age * .9)) * Math.min(this.width * .3, 240) * power * impact.perspective;
      const flatten = .2 + impact.perspective * .09;
      for (let ring = 0; ring < 5; ring++) {
        const delayed = age - ring * .13;
        if (delayed <= 0) continue;
        const ringRadius = radius * Math.max(.1, 1 - ring * .13);
        const fade = Math.exp(-delayed * .9) * (1 - ring * .15) * opacity;
        context.strokeStyle = `rgba(${color},${fade * .7})`;
        context.lineWidth = ring === 0 ? 1.5 * impact.perspective : .65;
        context.beginPath();
        const segments = this.width < 600 ? 48 : 72;
        for (let index = 0; index <= segments; index++) {
          const angle = index / segments * TAU;
          const distortion = Math.sin(angle * 7 + age * 4) * 1.3 * Math.exp(-age);
          const positionX = impact.x + Math.cos(angle) * (ringRadius + distortion);
          const positionY = impact.y + Math.sin(angle) * ringRadius * flatten;
          if (index === 0) context.moveTo(positionX, positionY);
          else context.lineTo(positionX, positionY);
        }
        context.stroke();
        if (ring < 2) {
          context.strokeStyle = `rgba(226,239,255,${fade * .65})`;
          context.lineWidth = .75;
          context.beginPath();
          context.ellipse(impact.x, impact.y, ringRadius, ringRadius * flatten, 0, .15 + ring, 2.1 + ring);
          context.stroke();
        }
      }
      const beads = this.width < 600 ? 14 : 24;
      for (let index = 0; index < beads; index++) {
        const angle = index / beads * TAU + age * .12;
        this.point(impact.x + Math.cos(angle) * radius, impact.y + Math.sin(angle) * radius * flatten, .65, color, Math.exp(-age * 1.5) * opacity * .6);
      }
    }

    meteorImpact(event, age, opacity = 1) {
      if (opacity < .005 || age < 0) return;
      const context = this.context;
      const impact = this.meteorGround(event.groundX, event.depth);
      const fade = Math.exp(-age * 1.15) * opacity;
      this.ripple(impact, age, .55 + event.power * .5, event.color, opacity);
      this.glow(impact.x, impact.y, (24 + event.power * 20 + age * 12) * impact.perspective, event.color, Math.exp(-age * 3) * opacity * .7);
      const count = this.width < 600 ? 22 : 38;
      const random = randomGenerator(event.seed);
      for (let index = 0; index < count; index++) {
        const angle = random() * TAU;
        const speed = (20 + random() * 70) * event.power * impact.perspective;
        const lift = (30 + random() * 70) * impact.perspective;
        const gravity = 66;
        const positionX = impact.x + Math.cos(angle) * age * speed;
        const positionY = impact.y + Math.sin(angle) * age * speed * .19 - lift * age + gravity * age * age;
        if (positionY > impact.y + 8) continue;
        const previous = Math.max(0, age - .055);
        context.strokeStyle = `rgba(${event.color},${fade * .65})`;
        context.lineWidth = .7;
        context.beginPath();
        context.moveTo(impact.x + Math.cos(angle) * previous * speed, impact.y + Math.sin(angle) * previous * speed * .19 - lift * previous + gravity * previous * previous);
        context.lineTo(positionX, positionY);
        context.stroke();
        this.point(positionX, positionY, .5 + random() * .9, "white", fade);
      }
      if (age < .65) {
        const crown = Math.sin(Math.min(1, age / .65) * Math.PI);
        context.strokeStyle = `rgba(${event.color},${crown * opacity * .6})`;
        context.lineWidth = .8;
        context.beginPath();
        for (let index = 0; index <= 48; index++) {
          const angle = index / 48 * TAU;
          const radius = (6 + age * 35) * event.power * impact.perspective;
          const height = (9 + Math.sin(angle * 12) * 5) * crown * impact.perspective;
          const positionX = impact.x + Math.cos(angle) * radius;
          const positionY = impact.y + Math.sin(angle) * radius * .25 - height;
          if (index === 0) context.moveTo(positionX, positionY);
          else context.lineTo(positionX, positionY);
        }
        context.stroke();
      }
      if (event.power > 1.2 && age < 2.5) {
        const scale = (3 + smoothStep(age / .5) * 6) * impact.perspective;
        context.strokeStyle = `rgba(255,184,211,${fade * .65})`;
        context.lineWidth = .8;
        context.beginPath();
        for (let index = 0; index <= 40; index++) {
          const angle = index / 40 * TAU;
          const positionX = impact.x + Math.sin(angle) ** 3 * scale;
          const positionY = impact.y - age * 22 - (13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle)) / 16 * scale;
          if (index === 0) context.moveTo(positionX, positionY);
          else context.lineTo(positionX, positionY);
        }
        context.stroke();
      }
    }

    fallingMeteor(event, elapsed, opacity) {
      if (opacity < .005) return;
      const state = meteorEventState(event, elapsed);
      if (!state.flying && !state.impacted) return;
      const impact = this.meteorGround(event.groundX, event.depth);
      if (state.flying) {
        const context = this.context;
        const startX = impact.x + this.width * (event.slant ?? .4);
        const startY = -this.height * .14;
        const positionAt = progress => {
          const accelerated = progress ** 1.18;
          return { x: startX + (impact.x - startX) * accelerated + Math.sin(progress * Math.PI) * this.width * (event.curve ?? .025), y: startY + (impact.y - startY) * accelerated };
        };
        const head = positionAt(state.progress);
        const tail = positionAt(Math.max(0, state.progress - .27));
        const gradient = context.createLinearGradient(tail.x, tail.y, head.x, head.y);
        gradient.addColorStop(0, `rgba(${event.color},0)`);
        gradient.addColorStop(.55, `rgba(${event.color},.16)`);
        gradient.addColorStop(.9, `rgba(${event.color},.8)`);
        gradient.addColorStop(1, "rgba(244,249,255,1)");
        context.save();
        context.strokeStyle = gradient;
        context.lineCap = "round";
        for (const [width, alpha] of [[15,.045],[6,.16],[1.5,.9]]) {
          context.globalAlpha = opacity * alpha;
          context.lineWidth = width * event.power * impact.perspective;
          context.beginPath();
          context.moveTo(tail.x, tail.y);
          const middle = positionAt(Math.max(0, state.progress - .135));
          context.quadraticCurveTo(middle.x, middle.y, head.x, head.y);
          context.stroke();
        }
        context.restore();
        this.glow(head.x, head.y, 22 * event.power * impact.perspective, event.color, opacity * .7);
        this.point(head.x, head.y, 1.8 * event.power * impact.perspective, "white", opacity);
        const dustCount = this.width < 600 ? 14 : 22;
        for (let dust = 0; dust < dustCount; dust++) {
          const progress = Math.max(0, state.progress - dust * .012);
          const behind = positionAt(progress);
          const spread = dust * .2;
          this.point(behind.x + Math.sin(event.seed + dust * 13) * spread, behind.y + Math.cos(dust * 9) * spread, .35 + dust % 3 * .15, event.color, (1 - dust / dustCount) * opacity * .65);
        }
        const approach = smoothStep((state.progress - .5) / .5);
        context.save();
        context.globalAlpha = approach * opacity * .16;
        context.strokeStyle = gradient;
        context.lineWidth = 2 * impact.perspective;
        context.beginPath();
        context.moveTo(head.x, impact.y + (impact.y - head.y) * .2);
        context.lineTo(tail.x, impact.y + (impact.y - tail.y) * .2);
        context.stroke();
        context.restore();
      }
      if (state.impacted) this.meteorImpact(event, state.impactAge, opacity);
    }

    paintGirl(context) {
      const gradient = (startX, startY, endX, endY, stops) => {
        const fill = context.createLinearGradient(startX, startY, endX, endY);
        stops.forEach(([offset, color]) => fill.addColorStop(offset, color));
        return fill;
      };
      const skin = gradient(-.3, -.9, .29, -.55, [[0,"#a26977"],[.3,"#e4aca4"],[.52,"#ffe2c7"],[.76,"#edb3a2"],[1,"#b37586"]]);
      const materials = {
        hair: gradient(-.4, -.9, .45, .2, [[0,"#13172e"],[.2,"#3b2944"],[.42,"#72516a"],[.6,"#28233d"],[.82,"#4d354e"],[1,"#bb7f9f"]]),
        fringe: gradient(-.25, -1.2, .26, -.75, [[0,"#262039"],[.42,"#795368"],[.66,"#3e2b41"],[1,"#201e35"]]),
        skin, face: skin,
        shoe: gradient(-.2, 1, .3, 1.1, [[0,"#946c93"],[.5,"#e0bce1"],[1,"#685a93"]]),
        dress: gradient(-.53, .15, .52, .7, [[0,"#465e99"],[.14,"#a5a7da"],[.3,"#e3d7e9"],[.45,"#fff0e7"],[.58,"#c0c7e9"],[.72,"#bc9dce"],[.87,"#d5b2d1"],[1,"#647dac"]])
      };
      girlShapes.forEach(shape => {
        traceShape(context, shape);
        context.fillStyle = materials[shape.part];
        context.fill();
        context.strokeStyle = shape.part === "dress" ? "rgba(243,223,244,.7)" : "rgba(225,184,205,.35)";
        context.lineWidth = .006;
        context.stroke();
      });
      const curve = (anchors, color, width) => {
        context.beginPath();
        context.moveTo(...anchors[0]);
        context.bezierCurveTo(...anchors[1], ...anchors[2], ...anchors[3]);
        context.strokeStyle = color;
        context.lineWidth = width;
        context.lineCap = "round";
        context.stroke();
      };
      const ellipse = (positionX, positionY, radiusX, radiusY, color, rotation = 0) => {
        context.fillStyle = color;
        context.beginPath();
        context.ellipse(positionX, positionY, radiusX, radiusY, rotation, 0, TAU);
        context.fill();
      };
      traceShape(context, girlShapes.find(shape => shape.part === "dress"));
      context.save();
      context.clip();
      for (let index = 0; index < 9; index++) {
        const offset = (index - 4) * .09;
        curve([[offset * .22,.07],[offset * .5,.34],[offset * 1.1,.76],[offset * 1.45,1.07]], index % 2 ? "rgba(255,246,241,.46)" : "rgba(76,99,156,.24)", index % 2 ? .009 : .019);
      }
      const random = randomGenerator(9371);
      for (let index = 0; index < 165; index++) {
        const positionY = -.22 + random() * 1.29;
        const positionX = (random() - .5) * 1.08;
        ellipse(positionX, positionY, .002 + random() * .003, .003, index % 3 ? "rgba(255,247,237,.52)" : "rgba(172,214,255,.55)");
      }
      context.restore();
      curve([[-.17,.13],[-.05,.17],[.06,.17],[.17,.13]], "#edc9d1", .012);
      ellipse(.015,.15,.021,.014,"#fff0d1");
      for (const offset of [-.14, .105]) {
        ellipse(offset,-.81,.059,.025,"#f9e1d8",-.08);
        ellipse(offset - .014,-.808,.025,.03,"#4f3b52");
        ellipse(offset - .02,-.817,.009,.01,"#fff9ef");
        curve([[offset-.064,-.82],[offset-.03,-.853],[offset+.029,-.85],[offset+.058,-.823]],"#413044",.011);
        curve([[offset-.06,-.892],[offset-.025,-.91],[offset+.018,-.905],[offset+.047,-.888]],"#684552",.008);
      }
      ellipse(-.17,-.74,.052,.025,"rgba(223,117,142,.22)");
      ellipse(.14,-.74,.046,.025,"rgba(223,117,142,.22)");
      curve([[.006,-.816],[-.018,-.77],[-.027,-.746],[.008,-.744]],"rgba(169,107,107,.55)",.006);
      curve([[-.065,-.683],[-.026,-.657],[.011,-.659],[.05,-.692]],"#b46a81",.009);
      curve([[-.04,-.678],[-.014,-.671],[.006,-.674],[.027,-.679]],"#ffe7da",.004);
      curve([[-.14,-.4],[-.06,-.32],[.02,-.31],[.14,-.4]],"rgba(255,230,204,.7)",.006);
      ellipse(0,-.331,.01,.016,"#fff0cb");
      ellipse(-.238,-.72,.014,.025,"#ffe5b7");
      ellipse(.251,-.72,.012,.024,"#ffe5b7");
      for (let index = 0; index < 5; index++) {
        const offset = index * .024;
        curve([[-.22-offset*.3,-1.08],[-.37-offset,-.75],[-.18-offset,-.28],[-.29-offset,.12]],"rgba(221,161,188,.22)",.005);
        curve([[.15+offset,-1.08],[.39+offset,-.79],[.17+offset,-.19],[.35+offset,.17]],"rgba(190,157,214,.22)",.004);
      }
      for (let index = 0; index < 5; index++) {
        const angle = index / 5 * TAU;
        ellipse(.23 + Math.cos(angle)*.023,-.99 + Math.sin(angle)*.023,.025,.012,"#efbad7",angle);
      }
      ellipse(.23,-.99,.01,.01,"#fff0c8");
    }

    girlPortrait(context, positionX, positionY, scale, opacity) {
      if (opacity <= .001) return;
      const density = Math.min(this.ratio || 1, 1.5);
      if (!this.girlSurface) {
        const surface = this.makeSurface(scale * 1.4 * density, scale * 2.55 * density);
        if (surface) {
          const cached = surface.getContext("2d");
          cached.translate(surface.width / 2, scale * density * 1.32);
          cached.scale(scale * density, scale * density);
          this.paintGirl(cached);
        }
        this.girlSurface = surface;
      }
      context.save();
      context.globalAlpha *= opacity;
      if (this.girlSurface) context.drawImage(this.girlSurface, positionX - this.girlSurface.width / density / 2, positionY - scale * 1.32, this.girlSurface.width / density, this.girlSurface.height / density);
      else {
        context.translate(positionX, positionY);
        context.scale(scale, scale);
        this.paintGirl(context);
      }
      context.restore();
    }

    drawSuitor(context, state) {
      const kneel = state.kneel;
      const offer = state.offer;
      const hip = { x: -1.19, y: .1 + kneel * .46 };
      const shoulder = { x: -1.22 + kneel * .075, y: -.57 + kneel * .46 };
      const neck = { x: shoulder.x + .035, y: shoulder.y - .12 };
      const head = { x: neck.x + .04, y: neck.y - .19 };
      const kneeFront = { x: -.95 + kneel * .26, y: .57 + kneel * .055 };
      const footFront = { x: -.9 + kneel * .3, y: 1.05 };
      const kneeBack = { x: -1.37 - kneel * .14, y: .6 + kneel * .45 };
      const footBack = { x: -1.43 - kneel * .32, y: 1.05 };
      const hand = { x: shoulder.x + .22 + offer * .5, y: shoulder.y + .49 - offer * .44 };
      const elbow = { x: shoulder.x + .09 + offer * .15, y: shoulder.y + .45 - offer * .1 };
      const line = (points, color, width) => {
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        points.slice(1).forEach(point => context.lineTo(point.x, point.y));
        context.strokeStyle = color;
        context.lineWidth = width;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.stroke();
      };
      const polygon = (points, color) => {
        context.beginPath();
        context.moveTo(...points[0]);
        points.slice(1).forEach(point => context.lineTo(...point));
        context.closePath();
        context.fillStyle = color;
        context.fill();
      };
      const face = context.createLinearGradient(head.x - .13, head.y, head.x + .21, head.y + .15);
      face.addColorStop(0,"#aa7e8e");
      face.addColorStop(.52,"#f2c7ae");
      face.addColorStop(1,"#ffdfbf");
      const jacket = context.createLinearGradient(shoulder.x - .2, shoulder.y, shoulder.x + .2, shoulder.y + .1);
      jacket.addColorStop(0,"#141e39");
      jacket.addColorStop(.4,"#394e72");
      jacket.addColorStop(.7,"#203451");
      jacket.addColorStop(1,"#6d7291");
      line([hip,kneeBack,footBack],"#172640",.19);
      line([hip,kneeFront,footFront],"#2d4263",.2);
      line([{x:hip.x+.045,y:hip.y+.03},kneeFront,{x:footFront.x-.02,y:1}],"rgba(166,183,214,.32)",.012);
      line([{x:footFront.x-.09,y:1.075},{x:footFront.x+.14,y:1.075}],"#111a2c",.09);
      line([{x:footBack.x-.12,y:1.075},{x:footBack.x+.08,y:1.075}],"#131d32",.085);
      line([{x:shoulder.x-.08,y:shoulder.y+.02},{x:elbow.x-.08,y:elbow.y+.035},{x:hand.x-.07,y:hand.y+.07}],"#283855",.15);
      polygon([[shoulder.x-.18,shoulder.y],[shoulder.x+.12,shoulder.y-.015],[hip.x+.16,hip.y+.14],[hip.x-.19,hip.y+.12]],jacket);
      polygon([[neck.x-.06,shoulder.y-.025],[neck.x+.095,shoulder.y-.025],[hip.x+.06,hip.y-.03]],"#e7e2df");
      polygon([[neck.x+.015,shoulder.y+.04],[neck.x+.05,shoulder.y+.1],[hip.x+.065,hip.y-.16],[hip.x+.005,hip.y-.12]],"#aa7493");
      line([{x:shoulder.x-.12,y:shoulder.y+.005},{x:shoulder.x-.05,y:shoulder.y+.21},{x:hip.x+.035,y:hip.y-.05}],"#8d91b0",.016);
      line([{x:shoulder.x+.11,y:shoulder.y+.01},{x:shoulder.x+.17,y:shoulder.y+.18},{x:hip.x+.035,y:hip.y-.05}],"#697d9c",.014);
      line([{x:neck.x,y:neck.y-.02},{x:neck.x,y:shoulder.y+.02}],face,.13);
      context.save();
      context.translate(head.x,head.y);
      context.rotate(-.08-kneel*.2);
      polygon([[-.12,-.17],[.06,-.18],[.13,-.095],[.15,.005],[.205,.045],[.153,.075],[.14,.17],[.065,.205],[-.065,.15],[-.14,.015]],face);
      polygon([[-.14,.045],[-.18,-.075],[-.155,-.205],[-.11,-.23],[-.11,-.27],[-.015,-.24],[.07,-.265],[.17,-.175],[.1,-.105],[-.005,-.13],[-.055,-.03]],"#202039");
      line([{x:-.125,y:-.16},{x:-.015,y:-.21},{x:.09,y:-.17}],"#665269",.02);
      context.fillStyle = "#f6e8d9";
      context.beginPath();
      context.ellipse(.086,-.019,.034,.016,-.08,0,TAU);
      context.fill();
      context.fillStyle = "#493c51";
      context.beginPath();
      context.ellipse(.099,-.02,.012,.016,0,0,TAU);
      context.fill();
      line([{x:.05,y:-.044},{x:.118,y:-.035}],"#453449",.012);
      line([{x:.105,y:.123},{x:.15,y:.111}],"#ab7582",.009);
      context.fillStyle = "#e4ac9e";
      context.beginPath();
      context.ellipse(-.095,.045,.04,.058,0,0,TAU);
      context.fill();
      context.restore();
      line([shoulder,elbow,{x:hand.x-.06,y:hand.y}],jacket,.16);
      line([{x:elbow.x,y:elbow.y-.065},{x:hand.x-.09,y:hand.y-.055}],"rgba(192,197,219,.4)",.011);
      line([{x:hand.x-.095,y:hand.y},{x:hand.x-.045,y:hand.y}],"#eee4de",.105);
      line([{x:hand.x-.02,y:hand.y},{x:hand.x+.055,y:hand.y-.015}],face,.075);
      return hand;
    }

    proposalScene(elapsed) {
      const context = this.context;
      const state = proposalState(elapsed, this.reduced);
      const opacity = state.reveal * state.farewell;
      if (opacity <= .001) return;
      const { scale, centerX, centerY, groundY } = proposalLayout(this.width, this.height);
      const time = this.reduced ? 38 : elapsed;
      const girlX = centerX + scale * .47;
      const manX = centerX - scale * (1 - state.arrival) * .42;
      const lift = (1-state.reveal)*scale*.05;
      context.save();
      context.globalAlpha *= opacity;
      this.glow(girlX,centerY-scale*.4,scale*1.25,"215,161,205",.16);
      context.fillStyle = "rgba(6,10,24,.5)";
      context.beginPath();
      context.ellipse(centerX-scale*.38,groundY+scale*.04,scale*1.36,scale*.11,0,0,TAU);
      context.fill();
      context.strokeStyle = "rgba(235,195,173,.15)";
      context.lineWidth = .7;
      context.beginPath();
      context.ellipse(centerX-scale*.4,groundY+scale*.03,scale*1.45,scale*.14,0,0,TAU);
      context.stroke();
      this.girlPortrait(context,girlX,centerY+lift,scale,state.reveal);
      context.save();
      context.translate(0,groundY*1.22);
      context.scale(1,-.22);
      this.girlPortrait(context,girlX,centerY,scale,.13);
      context.restore();
      context.save();
      context.translate(manX,centerY+lift);
      context.scale(scale,scale);
      context.globalAlpha *= state.arrival;
      const hand = this.drawSuitor(context,state);
      context.restore();
      context.save();
      context.translate(0,groundY*1.22);
      context.scale(1,-.22);
      context.translate(manX,centerY+lift);
      context.scale(scale,scale);
      context.globalAlpha *= state.arrival*.1;
      this.drawSuitor(context,state);
      context.restore();
      const ringX = manX + (hand.x+.02)*scale;
      const ringY = centerY + (hand.y-.14)*scale + lift;
      if (state.arrival > .01) {
        context.save();
        context.globalAlpha *= state.arrival;
        context.translate(ringX,ringY+scale*.09);
        context.rotate(-.08-state.offer*.09);
        context.fillStyle = "#704564";
        context.strokeStyle = "#e3b5c3";
        context.lineWidth = .7;
        context.fillRect(-scale*.085,-scale*.035,scale*.17,scale*.075);
        context.strokeRect(-scale*.085,-scale*.035,scale*.17,scale*.075);
        context.rotate(-state.offer*1.08);
        context.fillStyle = "#392c50";
        context.fillRect(-scale*.085,-scale*.115,scale*.17,scale*.083);
        context.strokeRect(-scale*.085,-scale*.115,scale*.17,scale*.083);
        context.restore();
      }
      if (state.offer > .01) {
        context.save();
        context.globalAlpha *= state.offer;
        this.glow(ringX,ringY-scale*.035,scale*.38,"255,225,177",.3);
        context.strokeStyle = "#f7dbab";
        context.lineWidth = Math.max(1,scale*.012);
        context.beginPath();
        context.ellipse(ringX,ringY,scale*.043,scale*.054,-.2,0,TAU);
        context.stroke();
        context.fillStyle = "#e4f7ff";
        context.beginPath();
        context.moveTo(ringX-scale*.044,ringY-scale*.059);
        context.lineTo(ringX-scale*.024,ringY-scale*.091);
        context.lineTo(ringX+scale*.026,ringY-scale*.091);
        context.lineTo(ringX+scale*.047,ringY-scale*.059);
        context.lineTo(ringX,ringY-scale*.018);
        context.closePath();
        context.fill();
        context.strokeStyle = "#93c8e3";
        context.lineWidth = .6;
        context.stroke();
        context.beginPath();
        context.moveTo(ringX-scale*.044,ringY-scale*.059);
        context.lineTo(ringX+scale*.047,ringY-scale*.059);
        context.moveTo(ringX-scale*.024,ringY-scale*.091);
        context.lineTo(ringX,ringY-scale*.018);
        context.lineTo(ringX+scale*.026,ringY-scale*.091);
        context.stroke();
        const shimmer = .65 + Math.sin(time*1.8)*.16;
        context.globalAlpha *= shimmer;
        context.strokeStyle = "#fff6d8";
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(ringX-scale*.09,ringY-scale*.062);
        context.lineTo(ringX+scale*.09,ringY-scale*.062);
        context.moveTo(ringX,ringY-scale*.15);
        context.lineTo(ringX,ringY+scale*.025);
        context.stroke();
        context.restore();
      }
      if (state.reveal > .001) {
        context.save();
        context.strokeStyle = "#f4c7b3";
        context.lineWidth = scale*.064;
        context.lineCap = "round";
        const handX = (girlX-scale*.17)*(1-state.reach) + (ringX+scale*.125)*state.reach;
        const handY = (centerY+scale*.15)*(1-state.reach) + (ringY-scale*.045)*state.reach;
        context.beginPath();
        context.moveTo(girlX-scale*.235,centerY-scale*.23);
        context.quadraticCurveTo(girlX-scale*.35,centerY+scale*.1,handX,handY);
        context.stroke();
        context.lineWidth = scale*.03;
        context.beginPath();
        context.moveTo(handX,handY);
        context.lineTo(handX-scale*(.01+.05*state.reach),handY+scale*.02);
        context.stroke();
        context.restore();
      }
      context.save();
      context.globalCompositeOperation = "lighter";
      const count = this.width < 600 ? 48 : 78;
      for (let index = 0; index < count; index++) {
        const progress = (index/count + time*.025)%1;
        const angle = progress*TAU;
        const radius = scale*(1.22 + Math.sin(index*13)*.1);
        const positionX = centerX-scale*.4+Math.cos(angle)*radius;
        const positionY = centerY+Math.sin(angle)*radius*.82;
        this.point(positionX,positionY,index%11===0?1.3:.6,index%3?"gold":"pink",opacity*(.12+state.offer*.18));
      }
      if (state.offer > .05) {
        for (let index = 0; index < 70; index++) {
          const angle = index/70*TAU;
          const size = scale*.17;
          const positionX = ringX+Math.sin(angle)**3*size;
          const positionY = ringY-scale*.43-(13*Math.cos(angle)-5*Math.cos(2*angle)-2*Math.cos(3*angle)-Math.cos(4*angle))/16*size;
          this.point(positionX,positionY,.7,index%4?"255,190,212":"255,225,175",state.offer*.63);
        }
      }
      context.restore();
      context.restore();
    }

    meteors() {
      const context = this.context;
      const elapsed = this.reduced ? this.elapsed || 33 : this.elapsed;
      const chapter = elapsed < 11 ? 0 : elapsed < 24 ? 1 : 2;
      if (chapter !== this.chapter) { this.chapter = chapter; this.onChapter(meteorChapters[chapter], chapter); }
      const paint = smoothStep((elapsed - 7) / 7);
      const finale = smoothStep((elapsed - 23) / 7);
      this.starrySky(elapsed, (.1 + paint * .64) * (1 - finale * .45));
      this.waterSurface(elapsed, finale);
      this.sakuraTree(elapsed, finale);
      this.proposalScene(elapsed);
      context.save();
      context.globalCompositeOperation = "lighter";
      const rainOpacity = 1 - smoothStep((elapsed - 13) / 5);
      this.meteorEvents?.forEach(event => this.fallingMeteor(event, elapsed, rainOpacity));
      if (!this.reduced) {
        this.meteorShots = this.meteorShots.filter(event => elapsed - event.start < event.flight + 3.5);
        this.meteorShots.forEach(event => this.fallingMeteor(event, elapsed, 1));
      }
      const layout = proposalLayout(this.width, this.height);
      const scale = layout.scale;
      const centerX = layout.centerX + scale * .47;
      const centerY = layout.centerY;
      const state = proposalState(elapsed, this.reduced);
      const yaw = this.reduced ? -.025 : Math.sin(elapsed * .23) * .035 + this.pointer.x * .07;
      const particleBatches = new Map();
      this.points.forEach((particle, index) => {
        const particleState = meteorParticleState(particle, elapsed, this.reduced && elapsed >= 24);
        if (elapsed < 6 && !this.reduced) return;
        const parallax = Math.sin(particle.phase) * .06 * (1 - particleState.gather) + particle.z * particleState.gather;
        const positionX = centerX + (particleState.x * Math.cos(yaw) + parallax * Math.sin(yaw)) * scale;
        const positionY = centerY + particleState.y * scale;
        const settledOpacity = ["face", "skin", "shoe"].includes(particle.part) ? .025 : .23;
        const alpha = particleState.alpha * (particleState.gather > .9 ? settledOpacity : .23) * state.farewell * (this.reduced ? 1 : Math.min(1, (elapsed - 6) / 3));
        const color = particleState.gather < .2 ? index % 4 === 0 ? "255,214,124" : "113,179,251" : particle.color;
        if (index % 17 === 0) this.point(positionX, positionY, particle.size * 3, color, alpha * .065);
        if (alpha <= .005) return;
        const opacity = Math.max(.025, Math.round(alpha * 12) / 12);
        const key = `${color},${opacity}`;
        if (!particleBatches.has(key)) particleBatches.set(key, []);
        particleBatches.get(key).push({ x: positionX, y: positionY, radius: Math.max(.2, particle.size * (this.width < 600 ? .8 : 1)) });
      });
      particleBatches.forEach((particles, color) => {
        context.fillStyle = `rgba(${color})`;
        particles.forEach(particle => {
          context.fillRect(particle.x - particle.radius, particle.y - particle.radius, particle.radius * 2, particle.radius * 2);
        });
      });
      context.restore();
    }

    render() {
      if (!this.context || !this.width || !this.height) return;
      const context = this.context;
      const time = this.reduced ? 4.6 : this.total;
      context.clearRect(0, 0, this.width, this.height);
      const background = context.createLinearGradient(0, 0, 0, this.height);
      background.addColorStop(0, "#060c1c");
      background.addColorStop(.55, "#101b30");
      background.addColorStop(1, "#060b15");
      context.fillStyle = background;
      context.fillRect(0, 0, this.width, this.height);
      this.glow(this.width * .58, this.height * .28, this.width * .5, "77,108,180", .12);
      this.stars?.forEach(star => this.point(star.x * this.width, star.y * this.height * .88, star.radius, "gold", .15 + (Math.sin(time * .45 + star.phase) + 1) * .13));
      this.meteors();
    }
  }

  class NameDedication {
    constructor(canvas, reduced = false) {
      this.canvas = canvas;
      this.context = canvas.getContext("2d");
      this.name = canvas.parentElement.querySelector(".dedication-fallback").textContent.trim();
      this.reduced = reduced;
      this.elapsed = reduced ? 4.8 : 0;
      this.visible = false;
      this.active = true;
      this.frame = 0;
      this.lastTime = 0;
      this.points = [];
      this.tick = this.tick.bind(this);
      this.resize();
    }

    resize(refreshFont = false) {
      if (!this.context) return;
      const bounds = this.canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      if (!bounds.width || !bounds.height) return;
      if (!refreshFont && this.width === bounds.width && this.height === bounds.height && this.ratio === ratio) return;
      this.width = bounds.width;
      this.height = bounds.height;
      this.ratio = ratio;
      this.canvas.width = Math.round(this.width * ratio);
      this.canvas.height = Math.round(this.height * ratio);
      this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const mask = this.canvas.ownerDocument.createElement("canvas");
      mask.width = Math.round(this.width * 2);
      mask.height = Math.round(this.height * 2);
      const context = mask.getContext("2d", { willReadFrequently: true });
      if (!context) { this.points = []; this.canvas.parentElement.classList.remove("is-particle-ready"); return; }
      const letters = Array.from(this.name);
      const fontSize = Math.min(33, (this.width - 30) / (letters.length * 1.16));
      const advance = fontSize * 1.16;
      const family = window.getComputedStyle(this.canvas).getPropertyValue("--serif").trim() || '"Songti SC", "STSong", "Noto Serif CJK SC", "SimSun", serif';
      context.scale(2, 2);
      context.font = `500 ${fontSize}px ${family}`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "#ffffff";
      letters.forEach((letter, index) => context.fillText(letter, this.width / 2 + (index - (letters.length - 1) / 2) * advance, this.height / 2 + 1));
      let pixels;
      try { pixels = context.getImageData(0, 0, mask.width, mask.height)?.data; }
      catch { pixels = null; }
      const random = randomGenerator(90816);
      const points = [];
      if (pixels) {
        for (let positionY = 4; positionY < mask.height - 4; positionY += 2) {
          for (let positionX = 4; positionX < mask.width - 4; positionX += 2) {
            const opacity = pixels[(positionY * mask.width + positionX) * 4 + 3] / 255;
            if (opacity < .2) continue;
            const targetX = positionX / 2;
            const letter = Math.max(0, Math.min(letters.length - 1, Math.floor((targetX - this.width / 2) / advance + letters.length / 2)));
            points.push({ x: targetX, y: positionY / 2, sourceX: random() * this.width, sourceY: this.height + random() * 20, orbit: 6 + random() * 17, phase: random() * TAU, delay: letter * .34 + random() * .5, size: .38 + random() * .25, opacity: opacity * (.65 + random() * .35), tone: Math.floor(random() * 3) });
          }
        }
      }
      this.points = points;
      this.canvas.parentElement.classList.toggle("is-particle-ready", points.length > 0);
      this.sync();
    }

    sync() {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
      this.lastTime = 0;
      if (this.reduced) this.elapsed = 4.8;
      this.render();
      if (this.context && this.points.length && this.visible && this.active && !this.reduced && !document.hidden && this.elapsed < 4.8) this.frame = requestAnimationFrame(this.tick);
    }

    tick(time) {
      this.frame = 0;
      if (!this.visible || !this.active || this.reduced || document.hidden) return;
      if (!this.lastTime) this.lastTime = time;
      const delta = time - this.lastTime;
      if (delta >= 40) {
        this.elapsed = Math.min(4.8, this.elapsed + Math.min(delta, 80) / 1000);
        this.lastTime = time;
        this.render();
      }
      if (this.elapsed < 4.8) this.frame = requestAnimationFrame(this.tick);
    }

    render() {
      if (!this.context || !this.width) return;
      const context = this.context;
      context.clearRect(0, 0, this.width, this.height);
      const time = this.reduced ? 4.8 : this.elapsed;
      const tones = ["236,207,158", "255,232,188", "195,161,112"];
      const batches = new Map();
      this.points.forEach((particle, index) => {
        const progress = smoothStep((time - particle.delay) / 3.1);
        const orbit = Math.sin(progress * Math.PI) * (1 - progress) * particle.orbit;
        const angle = particle.phase + progress * TAU * 1.2;
        const positionX = particle.sourceX + (particle.x - particle.sourceX) * progress + Math.cos(angle) * orbit;
        const positionY = particle.sourceY + (particle.y - particle.sourceY) * progress + Math.sin(angle) * orbit * .5;
        const reveal = smoothStep((time - particle.delay) / .8);
        const alpha = Math.round(particle.opacity * reveal * (.4 + progress * .6) * 10) / 10;
        if (alpha <= 0) return;
        const key = `${tones[particle.tone]},${alpha}`;
        if (!batches.has(key)) batches.set(key, []);
        batches.get(key).push({ x: positionX, y: positionY, size: particle.size });
        if (index % 61 === 0) {
          context.fillStyle = `rgba(250,214,164,${alpha * .055})`;
          context.beginPath();
          context.arc(positionX, positionY, 2.4, 0, TAU);
          context.fill();
        }
      });
      batches.forEach((particles, tone) => {
        context.fillStyle = `rgba(${tone})`;
        particles.forEach(particle => context.fillRect(particle.x - particle.size, particle.y - particle.size, particle.size * 2, particle.size * 2));
      });
    }
  }

  window.RomanceParticles = Object.freeze({ Theatre, NameDedication, makeGirlParticles, makeMeteorEvents, makeSakuraTree, meteorEventState, meteorParticleState, proposalState, proposalLayout, meteorChapters, duration });
})();
