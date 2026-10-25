(() => {
  "use strict";

  const TAU = Math.PI * 2;
  const scenes = [
    { key: "fireworks", kicker: "烟火为序", title: "这一场烟火，只为你盛放。", description: "金色与柔粉色的粒子烟花，拖着光尾升起，在夜空绽放", hint: "轻点夜空，添一束烟花" },
    { key: "heart", kicker: "万千星尘，向你而来", title: "所有心动，都在慢慢汇向你。", description: "数千粒子从底部多股螺旋升空，逐渐汇成有透视和光影的立体爱心，缓缓旋转后化为星尘", hint: "移动指尖转动视角 · 轻点画布，重放聚心", duration: 22 },
    { key: "meteors", kicker: "星落倾心 · 流星序章", title: "让整片星空，为你而来。", description: "蓝金粒子流星雨坠落镜面地面，泛起涟漪与心形星尘，旋成梵高式星空笔触，最后汇成五彩长发少女卡通轮廓", hint: "轻点夜空，落下一颗属于你的流星", duration: 40 },
    { key: "rose", kicker: "一束偏爱", title: "把没说完的喜欢，藏进一朵玫瑰。", description: "柔粉粒子组成层叠玫瑰，金色花茎与叶片缓缓摇曳", hint: "不止今天，也想在普通日子送你花" },
    { key: "sakura", kicker: "花开等你", title: "等风，也想等你一起看花开。", description: "粉金色粒子樱花树伸展枝桠，花瓣随风飘落", hint: "落花很慢，答案也可以慢慢来" },
    { key: "butterflies", kicker: "向你飞去", title: "所有轻盈的心事，都想飞向你。", description: "金色与柔粉粒子蝴蝶振动翅膀，沿着弧线飞舞", hint: "翅膀的每一次轻颤，都是一句喜欢" }
  ];

  function randomGenerator(seed) {
    let state = seed >>> 0;
    return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
  }

  const smoothStep = value => { const progress = Math.max(0, Math.min(1, value)); return progress * progress * (3 - 2 * progress); };

  function heartField(positionX, height, depth) {
    const shell = positionX * positionX + 2.25 * depth * depth + height * height - 1;
    return shell * shell * shell - positionX * positionX * height * height * height - .1125 * depth * depth * height * height * height;
  }

  function heartParticleState(particle, elapsed, reduced = false) {
    if (reduced) return { x: particle.x, y: particle.y, z: particle.z, alpha: 1, flying: false };
    const age = elapsed - particle.delay;
    const progress = Math.max(0, Math.min(1, age / particle.flight));
    const angle = particle.spiralPhase - progress * TAU * 2.15;
    const radius = (.27 + .38 * Math.sin(progress * Math.PI)) * (1 - progress * .25);
    const merge = smoothStep((progress - .48) / .52);
    const spiralX = Math.cos(angle) * radius;
    const spiralZ = Math.sin(angle) * radius;
    const spiralY = 1.85 - progress * 2.7;
    const scatter = smoothStep((elapsed - 16.2 - particle.delay * .25) / 3.8);
    const scatterAngle = particle.phase + scatter * TAU * .7;
    return {
      x: spiralX + (particle.x - spiralX) * merge + Math.cos(scatterAngle) * scatter * 1.1,
      y: spiralY + (particle.y - spiralY) * merge + scatter * 2.1,
      z: spiralZ + (particle.z - spiralZ) * merge + Math.sin(scatterAngle) * scatter * .9,
      alpha: (age < 0 ? .09 : .9 + Math.sin(progress * Math.PI) * .1) * (1 - scatter * .94),
      flying: age > 0 && progress < .98
    };
  }

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

  function makeShape(kind, compact = false) {
    if (kind === "meteors") return makeGirlParticles(compact);
    const random = randomGenerator(921);
    const points = [];
    const add = (positionX, positionY, depth = 0, tone = "gold", size = 1) => {
      points.push({ x: positionX, y: positionY, z: depth, tone, size, phase: random() * TAU, alpha: .45 + random() * .55 });
    };
    const density = compact ? .62 : 1;
    if (kind === "heart") {
      const count = compact ? 3400 : 6200;
      for (let index = 0; index < count; index++) {
        const directionY = 1 - 2 * (index + .5) / count;
        const azimuth = index * 2.399963229728653;
        const horizontal = Math.sqrt(1 - directionY * directionY);
        const directionX = Math.cos(azimuth) * horizontal;
        const directionZ = Math.sin(azimuth) * horizontal;
        let near = 0;
        let far = 2;
        for (let iteration = 0; iteration < 19; iteration++) {
          const radius = (near + far) / 2;
          if (heartField(directionX * radius, directionY * radius, directionZ * radius) < 0) near = radius;
          else far = radius;
        }
        const radius = (near + far) / 2;
        const positionX = directionX * radius;
        const height = directionY * radius;
        const depth = directionZ * radius;
        const shell = positionX * positionX + 2.25 * depth * depth + height * height - 1;
        const normalX = 6 * positionX * shell * shell - 2 * positionX * height * height * height;
        const normalY = -(6 * height * shell * shell - 3 * positionX * positionX * height * height - .3375 * depth * depth * height * height);
        const normalZ = 13.5 * depth * shell * shell - .225 * depth * height * height * height;
        const normalLength = Math.hypot(normalX, normalY, normalZ) || 1;
        const layer = random() > .16 ? 1 : .6 + random() * .37;
        add(positionX * .83 * layer, -height * .83 * layer + .1, depth * .83 * layer, random() > .12 ? "pink" : "gold", .55 + random() * .65);
        Object.assign(points[points.length - 1], {
          normalX: normalX / normalLength, normalY: normalY / normalLength, normalZ: normalZ / normalLength,
          spiralPhase: index % 4 * TAU / 4 + (random() - .5) * .16,
          delay: random() * 3 + (.95 - points[points.length - 1].y) * .25,
          flight: 3.5 + random() * .8
        });
      }
    }
    if (kind === "rose") {
      for (let layer = 0; layer < 5; layer++) {
        const petalCount = 3 + layer * 2;
        for (let petal = 0; petal < petalCount; petal++) {
          const angle = petal / petalCount * TAU + layer * 1.1;
          const count = Math.round((45 + layer * 9) * density);
          for (let index = 0; index < count; index++) {
            const along = index / (count - 1);
            const edge = index % 3 !== 0;
            const sweep = (along - .5) * TAU / petalCount * 1.7;
            const radius = .025 + layer * .105 + Math.sin(along * Math.PI) * (.1 + layer * .025) * (edge ? 1 : random());
            const positionX = Math.cos(angle + sweep) * radius;
            const depth = Math.sin(angle + sweep) * radius;
            add(positionX, -.55 + depth * .84 + Math.sin(along * Math.PI) * .03, depth * .25, edge && index % 7 === 0 ? "gold" : "pink", edge ? 1.1 : .65);
          }
        }
      }
      for (let index = 0; index < 210 * density; index++) {
        const height = index / (210 * density);
        add(Math.sin(height * 3) * .09, -.2 + height * 1.34, 0, "stem", .9);
      }
      for (const [direction, base] of [[-1, .57], [1, .32]]) {
        for (let index = 0; index < 200 * density; index++) {
          const along = random();
          const breadth = (random() - .5) * Math.sin(along * Math.PI) * .32;
          add(direction * along * .64 + .04, base - along * .42 + breadth, breadth * .15, random() > .6 ? "gold" : "stem", .85);
        }
      }
    }
    if (kind === "sakura") {
      function branch(startX, startY, length, angle, depth) {
        const endX = startX + Math.cos(angle) * length;
        const endY = startY + Math.sin(angle) * length;
        for (let index = 0; index < length * 100 * density; index++) {
          const along = random();
          add(startX + (endX - startX) * along + (random() - .5) * depth * .008, startY + (endY - startY) * along, 0, "branch", .65 + depth * .12);
        }
        if (depth <= 3) {
          const flowerCount = Math.round((depth === 0 ? 32 : 13) * density);
          for (let bloom = 0; bloom < flowerCount; bloom++) {
            const angle = random() * TAU;
            const radius = Math.sqrt(random()) * .14;
            add(endX + Math.cos(angle) * radius, endY + Math.sin(angle) * radius * .7, (random() - .5) * .18, random() > .16 ? "pink" : "gold", 1 + random() * 1.3);
          }
        }
        if (depth === 0) return;
        branch(endX, endY, length * (.66 + random() * .07), angle - .35 - random() * .3, depth - 1);
        branch(endX, endY, length * (.66 + random() * .07), angle + .35 + random() * .3, depth - 1);
      }
      branch(.03, 1.13, .63, -Math.PI / 2 - .08, 6);
      for (let index = 0; index < 180 * density; index++) {
        const angle = random() * TAU;
        add(Math.cos(angle) * random() * .9, 1.15 + Math.sin(angle) * .065, 0, "pink", .7);
      }
    }
    if (kind === "butterflies") {
      for (let index = 0; index < 270 * density; index++) {
        const along = random();
        const spread = random();
        const upperWing = random() > .33;
        const positionX = upperWing ? .07 + Math.sin(along * Math.PI * .83) * .53 * spread : .06 + Math.sin(along * Math.PI) * .36 * spread;
        const positionY = upperWing ? -.5 + along * .65 : .05 + along * .43;
        add(positionX, positionY, 0, random() > .23 ? "gold" : "pink", .8 + random() * .6);
        add(-positionX, positionY, 0, random() > .23 ? "gold" : "pink", .8 + random() * .6);
      }
      for (let index = 0; index < 130 * density; index++) {
        const along = index / (130 * density);
        for (const direction of [-1, 1]) {
          add(direction * (.07 + Math.sin(along * Math.PI * .83) * .53), -.5 + along * .65, 0, "gold", 1);
          add(direction * (.06 + Math.sin(along * Math.PI) * .36), .05 + along * .43, 0, "pink", .9);
        }
      }
    }
    return points;
  }

  class Theatre {
    constructor(canvas, onChange, onChapter = () => {}) {
      this.canvas = canvas;
      this.context = canvas.getContext("2d");
      this.onChange = onChange;
      this.onChapter = onChapter;
      this.chapter = -1;
      this.index = 0;
      this.elapsed = 0;
      this.total = 0;
      this.lastTime = 0;
      this.frame = 0;
      this.width = 0;
      this.height = 0;
      this.active = false;
      this.visible = false;
      this.playing = true;
      this.reduced = false;
      this.pointer = { x: 0, y: 0 };
      this.extraBursts = [];
      this.meteorShots = [];
      this.tick = this.tick.bind(this);
      this.resize();
      this.setEffect("fireworks");
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
      this.points = makeShape(scenes[this.index].key, this.width < 600);
      this.meteorEvents = makeMeteorEvents(this.width < 600);
      this.render();
    }

    setEffect(key) {
      const nextIndex = scenes.findIndex(scene => scene.key === key);
      if (nextIndex < 0) return;
      this.index = nextIndex;
      this.elapsed = 0;
      this.chapter = -1;
      this.extraBursts = [];
      this.meteorShots = [];
      this.points = makeShape(key, this.width < 600);
      this.canvas.setAttribute("aria-label", scenes[this.index].description);
      this.onChange(scenes[this.index], this.index);
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
        if (this.elapsed >= (scenes[this.index].duration || 12)) this.setEffect(scenes[(this.index + 1) % scenes.length].key);
        this.render();
      }
      this.frame = requestAnimationFrame(this.tick);
    }

    point(positionX, positionY, size, tone = "gold", alpha = 1) {
      const palette = { gold: "235,203,147", pink: "246,170,192", stem: "159,187,143", branch: "172,141,103", white: "249,235,211" };
      const context = this.context;
      context.fillStyle = `rgba(${palette[tone] || (tone.includes(",") ? tone : palette.gold)},${Math.max(0, Math.min(alpha, 1))})`;
      context.beginPath();
      context.arc(positionX, positionY, Math.max(.2, size), 0, TAU);
      context.fill();
    }

    trail(startX, startY, endX, endY, alpha, pink = false) {
      const context = this.context;
      const gradient = context.createLinearGradient(startX, startY, endX, endY);
      gradient.addColorStop(0, "rgba(230,185,140,0)");
      gradient.addColorStop(1, pink ? `rgba(246,170,192,${alpha})` : `rgba(245,219,170,${alpha})`);
      context.strokeStyle = gradient;
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
      context.stroke();
    }

    burst(centerX, centerY, age, seed, heart = false) {
      if (age < -.75 || age > 3.6) return;
      const scale = Math.min(this.width, this.height);
      if (age < 0) {
        const progress = 1 + age / .75;
        const positionY = this.height - (this.height - centerY) * progress;
        this.trail(centerX - 4, positionY + 65, centerX, positionY, .9);
        this.point(centerX, positionY, 2, "white", .9);
        return;
      }
      const random = randomGenerator(seed);
      const count = this.width < 600 ? 88 : 135;
      const spread = (1 - Math.exp(-age * 1.8)) * scale * .24;
      const fade = Math.max(0, 1 - age / 3.6);
      for (let index = 0; index < count; index++) {
        const angle = random() * TAU;
        const radius = .4 + random() * .6;
        const directionX = heart ? Math.pow(Math.sin(angle), 3) : Math.cos(angle);
        const directionY = heart ? -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle)) / 16 : Math.sin(angle);
        const positionX = centerX + directionX * spread * radius;
        const positionY = centerY + directionY * spread * radius + age * age * 13;
        this.trail(positionX - directionX * 15 * fade, positionY - directionY * 15 * fade - age * 3, positionX, positionY, fade * .7, seed % 2 === 0);
        this.point(positionX, positionY, .6 + random() * 1.2, seed % 2 === 0 ? "pink" : "gold", fade * (.5 + random() * .5));
      }
    }

    fireworks(time) {
      if (this.reduced) {
        this.burst(this.width * .32, this.height * .3, .65, 17);
        this.burst(this.width * .7, this.height * .4, .8, 28, true);
        return;
      }
      for (let index = 0; index < 5; index++) {
        const random = randomGenerator(index * 33 + 9);
        const age = ((time + index * 1.17) % 6) - .8;
        this.burst(this.width * (.18 + random() * .64), this.height * (.2 + random() * .25), age, 31 + index, index % 3 === 1);
      }
      this.extraBursts = this.extraBursts.filter(burst => this.total - burst.start < 3.7);
      this.extraBursts.forEach(burst => this.burst(burst.x, burst.y, this.total - burst.start, burst.seed, true));
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

    heart() {
      const context = this.context;
      const elapsed = this.reduced ? 10 : this.elapsed;
      const scale = Math.min(this.width * .335, this.height * .245);
      const centerX = this.width / 2;
      const centerY = this.height * .32;
      const yaw = -.38 + Math.sin(elapsed * .27) * .58 + this.pointer.x * .85;
      const pitch = -.12 + Math.sin(elapsed * .19) * .055;
      const yawCosine = Math.cos(yaw);
      const yawSine = Math.sin(yaw);
      const pitchCosine = Math.cos(pitch);
      const pitchSine = Math.sin(pitch);
      const rotate = (positionX, positionY, depth) => {
        const horizontal = positionX * yawCosine + depth * yawSine;
        const rotatedDepth = depth * yawCosine - positionX * yawSine;
        return { x: horizontal, y: positionY * pitchCosine - rotatedDepth * pitchSine, z: rotatedDepth * pitchCosine + positionY * pitchSine };
      };
      const project = position => {
        const rotated = rotate(position.x, position.y, position.z);
        const perspective = 4.5 / (4.5 - rotated.z);
        return { x: centerX + rotated.x * scale * perspective, y: centerY + rotated.y * scale * perspective, z: rotated.z, perspective };
      };
      const sprites = this.points.map((particle, index) => {
        const position = heartParticleState(particle, elapsed, this.reduced);
        const projected = project(position);
        const normal = rotate(particle.normalX, particle.normalY, particle.normalZ);
        const diffuse = Math.max(0, normal.x * -.35 + normal.y * -.45 + normal.z * .82);
        const front = .28 + smoothStep((normal.z + .55) / 1.2) * .72;
        const depthLight = .5 + (projected.z + 1) * .22;
        return { particle, index, position, projected, light: (.3 + diffuse * .7) * front * depthLight };
      });
      if (!this.reduced) {
        context.save();
        context.globalCompositeOperation = "lighter";
        for (let index = 0; index < 260; index++) {
          const phase = index / 260 * TAU;
          const ring = project({ x: Math.cos(phase) * .56, y: 1.85, z: Math.sin(phase) * .56 });
          this.point(ring.x, ring.y, index % 5 === 0 ? 1 : .5, "gold", .12 + Math.sin(phase + elapsed) * .04);
        }
        const streamCount = this.width < 600 ? 220 : 420;
        for (let index = 0; index < streamCount; index++) {
          const target = this.points[(index * 17) % this.points.length];
          const age = (Math.max(0, elapsed - 4) + index / streamCount * 4.1) % 4.1;
          if (elapsed < 4 || elapsed > 19) break;
          const position = heartParticleState({ ...target, delay: 0, flight: 4.1 }, age);
          const projected = project(position);
          this.point(projected.x, projected.y, .65 * projected.perspective, index % 5 === 0 ? "gold" : "pink", .28 * Math.sin(age / 4.1 * Math.PI));
        }
        context.restore();
      }
      sprites.sort((first, second) => first.projected.z - second.projected.z);
      context.save();
      context.globalCompositeOperation = "lighter";
      sprites.forEach(({ particle, index, position, projected, light }) => {
        const brightness = position.flying ? .65 : .34 + light * .8;
        const alpha = particle.alpha * position.alpha * brightness;
        const size = particle.size * projected.perspective * (this.width < 600 ? .78 : 1);
        if (position.flying && index % 9 === 0) {
          const previous = project(heartParticleState(particle, Math.max(0, elapsed - .09)));
          this.trail(previous.x, previous.y, projected.x, projected.y, alpha * .45, true);
        }
        if (index % 11 === 0) this.point(projected.x, projected.y, size * 3, particle.tone, alpha * .075);
        this.point(projected.x, projected.y, size, particle.tone, alpha);
        if (!position.flying && light > .65 && index % 3 === 0) this.point(projected.x, projected.y, size * .55, "white", alpha * .75);
      });
      context.restore();
    }

    shape(time, kind) {
      const scale = Math.min(this.width * .34, this.height * .32);
      const centerX = this.width / 2;
      const centerY = this.height * .44;
      const turn = this.reduced ? 0 : Math.sin(time * .3) * .13 + this.pointer.x * .2;
      const reveal = this.reduced ? 1 : Math.min(1, this.elapsed / 1.5);
      this.points.forEach((particle, index) => {
        const drift = this.reduced ? 0 : Math.sin(time * .8 + particle.phase) * .004;
        const positionX = particle.x * Math.cos(turn) + particle.z * Math.sin(turn);
        const positionY = particle.y + drift;
        const alpha = particle.alpha * (.75 + Math.sin(time * 1.2 + particle.phase) * .2) * Math.min(1, reveal * 2 - index / this.points.length * .65);
        this.point(centerX + positionX * scale, centerY + positionY * scale, particle.size * (this.width < 600 ? .83 : 1), particle.tone, alpha);
      });
      if (kind === "sakura") {
        for (let index = 0; index < 28; index++) {
          const cycle = (time * .035 + index / 28) % 1;
          const positionX = centerX + Math.sin(index * 13.8) * scale * .9 + Math.sin(time * .5 + index) * scale * .13 + cycle * scale * .25;
          const positionY = centerY - scale * .7 + cycle * scale * 2;
          const alpha = Math.sin(cycle * Math.PI) * .7;
          const context = this.context;
          context.save();
          context.translate(positionX, positionY);
          context.rotate(time * .7 + index);
          context.fillStyle = `rgba(243,169,190,${alpha})`;
          context.beginPath();
          context.ellipse(0, 0, 1.8, 3, 0, 0, TAU);
          context.fill();
          context.restore();
        }
      }
    }

    butterflies(time) {
      const scale = Math.min(this.width * .22, this.height * .21);
      const count = this.width < 600 ? 4 : 6;
      for (let index = 0; index < count; index++) {
        const cycle = time * .16 + index * 1.9;
        const centerX = this.width * (.5 + Math.sin(cycle) * (index === 0 ? .12 : .3));
        const centerY = this.height * (.39 + Math.cos(cycle * .7 + index) * (index === 0 ? .08 : .2));
        const size = index === 0 ? 1 : .3 + index * .07;
        const flap = this.reduced ? .85 : .28 + Math.abs(Math.sin(time * 4.8 + index)) * .72;
        const tilt = Math.sin(cycle * 1.3) * .35;
        this.points.forEach(particle => {
          const positionX = particle.x * flap;
          const positionY = particle.y;
          this.point(centerX + (positionX * Math.cos(tilt) - positionY * Math.sin(tilt)) * scale * size, centerY + (positionX * Math.sin(tilt) + positionY * Math.cos(tilt)) * scale * size, particle.size * Math.max(.6, size), particle.tone, particle.alpha * .85);
        });
        for (let segment = 0; segment < 22; segment++) this.point(centerX, centerY + (segment / 22 - .5) * scale * size * .65, .9, "white", .8);
        this.trail(centerX, centerY - scale * size * .3, centerX - scale * size * .09, centerY - scale * size * .48, .6);
        this.trail(centerX, centerY - scale * size * .3, centerX + scale * size * .09, centerY - scale * size * .48, .6);
      }
      for (let index = 0; index < 45; index++) {
        const phase = time * .17 + index * .16;
        this.point(this.width * (.5 + Math.sin(phase) * .38), this.height * (.45 + Math.cos(phase * 1.3) * .17), .6, "gold", .2);
      }
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
      const kind = scenes[this.index].key;
      if (kind === "fireworks") this.fireworks(time);
      else if (kind === "heart") this.heart();
      else if (kind === "meteors") this.meteors();
      else if (kind === "butterflies") this.butterflies(time);
      else this.shape(time, kind);
    }
  }

  window.RomanceParticles = Object.freeze({ Theatre, makeShape, heartParticleState, makeMeteorEvents, meteorEventState, meteorParticleState, meteorChapters, scenes });
})();
