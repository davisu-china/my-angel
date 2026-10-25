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
    { part: "hair", curves: [ [[-.13,-.92],[-.26,-1.19],[-.06,-1.32],[.12,-1.23]], [[.12,-1.23],[.33,-1.13],[.22,-.84],[.25,-.62]], [[.25,-.62],[.23,-.38],[.4,-.16],[.3,.12]], [[.3,.12],[.22,.29],[.12,.23],[.08,.12]], [[.08,.12],[.22,-.06],[-.12,-.29],[-.08,-.55]], [[-.08,-.55],[-.18,-.72],[-.12,-.8],[-.13,-.92]] ] },
    { part: "skin", curves: [ [[-.015,-.85],[-.022,-.77],[-.05,-.755],[-.19,-.71]], [[-.19,-.71],[-.24,-.66],[-.19,-.56],[-.1,-.55]], [[-.1,-.55],[.01,-.51],[.14,-.54],[.2,-.64]], [[.2,-.64],[.17,-.71],[.07,-.73],[.07,-.84]], [[.07,-.84],[.04,-.87],[.01,-.87],[-.015,-.85]] ] },
    { part: "shoe", curves: [ [[-.13,1.01],[-.16,1.04],[-.23,1.09],[-.13,1.1]], [[-.13,1.1],[-.03,1.11],[-.02,1.08],[-.06,1.02]], [[-.06,1.02],[-.08,1],[-.11,1],[-.13,1.01]] ] },
    { part: "dress", curves: [ [[-.18,-.63],[-.1,-.59],[-.04,-.57],[.01,-.59]], [[.01,-.59],[.08,-.57],[.14,-.61],[.19,-.64]], [[.19,-.64],[.18,-.44],[.085,-.21],[.115,-.09]], [[.115,-.09],[.13,.24],[.28,.68],[.42,.94]], [[.42,.94],[.49,1.01],[.6,1.035],[.69,1.04]], [[.69,1.04],[.46,1.16],[.17,1.09],[.035,1.07]], [[.035,1.07],[-.18,1.13],[-.39,1.08],[-.43,1.025]], [[-.43,1.025],[-.33,.74],[-.17,.29],[-.12,-.08]], [[-.12,-.08],[-.09,-.26],[-.21,-.46],[-.18,-.63]] ] },
    { part: "face", curves: [ [[-.13,-1.13],[-.163,-1.08],[-.14,-1.025],[-.168,-.994]], [[-.168,-.994],[-.197,-.965],[-.181,-.951],[-.162,-.949]], [[-.162,-.949],[-.167,-.931],[-.181,-.924],[-.164,-.916]], [[-.164,-.916],[-.165,-.877],[-.126,-.842],[-.083,-.844]], [[-.083,-.844],[.015,-.861],[.086,-.984],[.069,-1.09]], [[.069,-1.09],[.035,-1.165],[-.059,-1.177],[-.13,-1.13]] ] },
    { part: "fringe", curves: [ [[-.167,-1.105],[-.18,-1.24],[.009,-1.29],[.132,-1.161]], [[.132,-1.161],[.22,-1.08],[.154,-.907],[.083,-.882]], [[.083,-.882],[.09,-1.014],[.007,-1.032],[-.025,-1.137]], [[-.025,-1.137],[-.085,-1.083],[-.12,-1.078],[-.167,-1.105]] ] }
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
      reveal: smoothStep((time - 23.5) / 4.5),
      arrival: smoothStep((time - 26) / 3),
      kneel: smoothStep((time - 29.5) / 3),
      offer: smoothStep((time - 32) / 2.8),
      reach: smoothStep((time - 34) / 2.5),
      farewell: 1 - smoothStep((time - 38.8) / 1.2)
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
    const clusters = [];
    const scaffold = [
      { anchors:[[0,.025],[-.055,-.2],[.135,-.43],[.02,-.71]], width:.105 },
      { parent:0, along:.69, controls:[[-.13,-.62],[-.45,-.64],[-.7,-.91]], width:.053 },
      { parent:1, along:.59, controls:[[-.59,-.76],[-.77,-.77],[-.97,-.91]], width:.027 },
      { parent:1, along:.85, controls:[[-.62,-1.02],[-.69,-1.09],[-.86,-1.1]], width:.021 },
      { parent:0, along:.86, controls:[[-.13,-.84],[-.23,-1.07],[-.4,-1.19]], width:.042 },
      { parent:4, along:.66, controls:[[-.3,-1.13],[-.43,-1.24],[-.61,-1.2]], width:.021 },
      { parent:0, along:1, controls:[[-.04,-.87],[.015,-1.1],[.19,-1.26]], width:.047 },
      { parent:6, along:.52, controls:[[.32,-.96],[.49,-.93],[.68,-1.05]], width:.032 },
      { parent:6, along:.8, controls:[[.28,-1.17],[.39,-1.27],[.57,-1.23]], width:.024 },
      { parent:7, along:.53, controls:[[.6,-.97],[.78,-.82],[.98,-.86]], width:.021 },
      { parent:7, along:.88, controls:[[.73,-1.17],[.9,-1.13],[1.04,-1.02]], width:.016 },
      { parent:0, along:.63, controls:[[.23,-.57],[.39,-.7],[.63,-.69]], width:.033 },
      { parent:11, along:.78, controls:[[.67,-.66],[.78,-.58],[.9,-.64]], width:.014 }
    ];
    const addBranch = (anchors, width, birth, depth) => {
      const samples = sampleCurve(anchors, 24);
      const bark = Array.from({length: Math.ceil(width * 600)}, () => ({along:random(),across:(random()-.5)*.85,light:random()>.55}));
      branches.push({anchors,width,birth,depth,samples,bark,taper:branches.length===0?.3:.43});
      return samples;
    };
    scaffold.forEach((limb, limbIndex) => {
      if (limb.parent !== undefined) {
        const parent = branches[scaffold[limb.parent].branchIndex];
        const parentSamples = sampleCurve(parent.anchors, 100);
        const jointIndex = Math.round(limb.along * 100);
        const joint = parentSamples[jointIndex];
        const previous = parentSamples[Math.max(0,jointIndex-2)];
        const next = parentSamples[Math.min(100,jointIndex+2)];
        const tangent = Math.atan2(next.y-previous.y,next.x-previous.x);
        const control = limb.controls[0];
        const distance = Math.min(.14,Math.hypot(control[0]-joint.x,control[1]-joint.y)*.65);
        limb.anchors = [[joint.x, joint.y], [joint.x+Math.cos(tangent)*distance,joint.y+Math.sin(tangent)*distance], ...limb.controls.slice(1)];
      }
      limb.branchIndex = branches.length;
      const birth = limbIndex === 0 ? 0 : .06 + limbIndex*.018;
      const depth = random();
      const samples = addBranch(limb.anchors,limb.width,birth,depth);
      if(limbIndex === 0) return;
      const count = limbIndex < 7 ? 6 : 7;
      for(let index=0;index<count;index++) {
        const along = .42 + index/count*.57;
        const sampleIndex = Math.min(22,Math.floor(along*24));
        const start = samples[sampleIndex];
        const next = samples[sampleIndex+1];
        const angle = Math.atan2(next.y-start.y,next.x-start.x) + (random()-.62)*1.65;
        const length = .065 + random()*.13;
        const end = {x:start.x+Math.cos(angle)*length,y:start.y+Math.sin(angle)*length};
        const droop = .016 + random()*.035;
        addBranch([[start.x,start.y],[start.x+Math.cos(angle)*length*.4,start.y+Math.sin(angle)*length*.3],[end.x,end.y-droop],[end.x,end.y]],limb.width*(1-along)*.45+.0012,birth+.13,depth);
        clusters.push({x:end.x,y:end.y,radius:.065+random()*.075,depth,birth:.3+random()*.2});
      }
      clusters.push({x:limb.anchors[3][0],y:limb.anchors[3][1],radius:.12,depth,birth:.4});
    });
    clusters.sort((first,second)=>first.depth-second.depth);
    clusters.forEach(cluster=>{
      const count=compact?78:118;
      for(let index=0;index<count;index++) {
        const phase=random()*TAU;
        const radius=Math.sqrt(random())*cluster.radius;
        const vertical = Math.sin(phase) * radius * .78;
        const tone = vertical > cluster.radius * .12 ? 3 : random() > .48 ? 2 : random() > .4 ? 0 : 1;
        blossoms.push({x:cluster.x+Math.cos(phase)*radius*1.32,y:cluster.y+vertical,size:.005+random()*.01,phase,depth:cluster.depth,tone,birth:cluster.birth+random()*.16});
      }
      if (cluster.depth > .6) {
        const length = .045 + random() * .1;
        for (let index = 0; index < 8; index++) {
          const along = index / 7;
          blossoms.push({x:cluster.x+Math.sin(along*2.2)*.02,y:cluster.y+cluster.radius*.4+along*length,size:.006+random()*.004,phase:random()*TAU,depth:cluster.depth,tone:index%3?0:3,birth:cluster.birth+along*.1});
        }
      }
    });
    const petals = Array.from({ length: compact ? 25 : 44 }, () => {
      const flower = blossoms[Math.floor(random() * blossoms.length)];
      return { x: flower.x, y: flower.y, phase: random() * TAU, offset: random(), speed: .7 + random() * .6, size: .008 + random() * .008, tone: Math.floor(random() * 4) };
    });
    return { branches, blossoms, petals, clusters };
  }

  function butterflyState(index, elapsed, reduced = false) {
    const time = reduced ? 37 : elapsed;
    const phase = index*1.83;
    const angle = time*.32+phase;
    return { x:.49+Math.cos(angle)*(.24+index*.012),y:.4+Math.sin(angle*1.21+phase)*.13+Math.sin(time*.9+phase)*.015,depth:Math.sin(angle),flap:.2+Math.abs(Math.sin(time*7+phase))*.8,rotation:Math.sin(angle+phase)*.35,opacity:smoothStep((time-26-index*.65)/2.5)*(1-smoothStep((time-38.8)/1.2)) };
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
      this.canvas.setAttribute("aria-label", "星落倾心：流星落水、自然樱花树与蓝金星夜，星尘汇成修长礼服恋人，男生单膝献戒，几只蝴蝶环绕飞舞");
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
      this.girlRevealSurface = null;
      this.suitorSurface = null;
      this.suitorPose = null;
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
        const colors = ["#e9b4c9", "#cb8fae", "#fff1ea", "#916f96"];
        for (let index = 0; index < 5; index++) {
          const angle = index / 5 * TAU;
          context.save();
          context.translate(16,16);
          context.rotate(angle);
          const gradient=context.createLinearGradient(0,0,11,0);
          gradient.addColorStop(0,tone===3?"#6c577a":"#be809c");gradient.addColorStop(.45,colors[tone]);gradient.addColorStop(1,tone===3?"#b792b4":"#ffe9e9");
          context.fillStyle=gradient;
          context.beginPath();
          context.moveTo(0,0);
          context.bezierCurveTo(4,-6,12,-5,11,-1);
          context.lineTo(9,0);
          context.lineTo(11,1);
          context.bezierCurveTo(12,5,4,6,0,0);
          context.fill();
          context.strokeStyle="rgba(255,236,228,.28)";context.lineWidth=.5;context.stroke();
          context.restore();
        }
        context.fillStyle = "#ffe8b0";
        context.beginPath();
        context.arc(16, 16, 1, 0, TAU);
        context.fill();
        for(let index=0;index<7;index++) {
          const angle=index/7*TAU;
          context.strokeStyle="#e3b99a";context.lineWidth=.45;
          context.beginPath();context.moveTo(16,16);context.lineTo(16+Math.cos(angle)*3,16+Math.sin(angle)*3);context.stroke();
        }
      }
      this.flowerSprites[tone] = sprite;
      return sprite;
    }

    drawSakura(context, size, growth) {
      context.save();
      context.translate(size * 1.05, size * 1.45);
      context.scale(size * .88, size * .88);
      context.lineCap = "round";
      this.sakura.clusters.forEach(cluster => {
        const bloom = smoothStep((growth - cluster.birth) / .24);
        if (!bloom) return;
        const radius = cluster.radius * 1.35;
        const volume = context.createRadialGradient(cluster.x - radius * .2, cluster.y - radius * .25, radius * .1, cluster.x, cluster.y, radius);
        volume.addColorStop(0, "rgba(176,114,149,.18)");
        volume.addColorStop(.62, "rgba(107,79,118,.1)");
        volume.addColorStop(1, "rgba(89,63,99,0)");
        context.globalAlpha = bloom * (.65 + cluster.depth * .25);
        context.fillStyle = volume;
        context.beginPath();
        context.ellipse(cluster.x, cluster.y, radius * 1.2, radius * .8, -.12, 0, TAU);
        context.fill();
      });
      context.globalAlpha = 1;
      [...this.sakura.branches].sort((first,second)=>first.width-second.width).forEach(branch => {
        const reveal = smoothStep((growth - branch.birth) / .22);
        if (!reveal) return;
        const anchors = branch.anchors;
        context.save();
        context.globalAlpha = reveal;
        const samples=branch.samples;
        const edges=samples.map((point,index)=>{
          const previous=samples[Math.max(0,index-1)];const next=samples[Math.min(samples.length-1,index+1)];
          const angle=Math.atan2(next.y-previous.y,next.x-previous.x)+Math.PI/2;
          const radius=branch.width*(.53-index/(samples.length-1)*branch.taper)*(1+Math.sin(index*1.7+branch.birth*20)*.035);
          return {left:[point.x+Math.cos(angle)*radius,point.y+Math.sin(angle)*radius],right:[point.x-Math.cos(angle)*radius,point.y-Math.sin(angle)*radius]};
        });
        const material=context.createLinearGradient(...edges[0].left,...edges[0].right);
        material.addColorStop(0,"#7b6066");material.addColorStop(.26,"#5e4a55");material.addColorStop(.62,"#3d3445");material.addColorStop(1,"#252a3a");
        context.beginPath();context.moveTo(...edges[0].left);edges.slice(1).forEach(edge=>context.lineTo(...edge.left));[...edges].reverse().forEach(edge=>context.lineTo(...edge.right));context.closePath();context.fillStyle=material;context.fill();
        context.save();context.clip();
        if (branch.width > .018) {
          for (let index = 0; index < edges.length - 1; index++) {
            const first = edges[index];
            const next = edges[index + 1];
            const shading = context.createLinearGradient(...first.left, ...first.right);
            shading.addColorStop(0, "#796169");
            shading.addColorStop(.28, "#65505c");
            shading.addColorStop(.65, "#42394b");
            shading.addColorStop(1, "#292e40");
            context.fillStyle = shading;
            context.beginPath();
            context.moveTo(...first.left);context.lineTo(...next.left);context.lineTo(...next.right);context.lineTo(...first.right);context.closePath();
            context.fill();
          }
        }
        branch.bark.forEach(mark=>{
          const sampleIndex=Math.min(samples.length-2,Math.floor(mark.along*(samples.length-1)));
          const point=samples[sampleIndex];const next=samples[sampleIndex+1];
          const angle=Math.atan2(next.y-point.y,next.x-point.x);const radius=branch.width*(.53-mark.along*branch.taper);
          const positionX=point.x+Math.cos(angle+Math.PI/2)*radius*mark.across;
          const positionY=point.y+Math.sin(angle+Math.PI/2)*radius*mark.across;
          context.strokeStyle=mark.light?"rgba(202,163,140,.32)":"rgba(16,20,29,.48)";context.lineWidth=.0013;
          context.beginPath();context.moveTo(positionX-Math.cos(angle+Math.PI/2)*radius*.6,positionY-Math.sin(angle+Math.PI/2)*radius*.6);context.lineTo(positionX+Math.cos(angle+Math.PI/2)*radius*.5,positionY+Math.sin(angle+Math.PI/2)*radius*.5);context.stroke();
        });
        if (branch.width > .024) {
          for (let seam = 0; seam < 3; seam++) {
            context.beginPath();
            samples.forEach((point, index) => {
              const edge = edges[index];
              const offset = .2 + seam * .27 + Math.sin(index * .63 + seam * 2.1) * .04;
              const positionX = edge.left[0] + (edge.right[0] - edge.left[0]) * offset;
              const positionY = edge.left[1] + (edge.right[1] - edge.left[1]) * offset;
              if (index === 0) context.moveTo(positionX, positionY);
              else context.lineTo(positionX, positionY);
            });
            context.strokeStyle = seam % 2 ? "rgba(220,178,155,.17)" : "rgba(19,23,32,.28)";
            context.lineWidth = branch.width * .017;
            context.stroke();
          }
          const knot = samples[10];
          const direction = Math.atan2(samples[11].y - knot.y, samples[11].x - knot.x);
          context.strokeStyle = "rgba(35,28,35,.46)";
          context.lineWidth = .0014;
          context.beginPath();
          context.ellipse(knot.x, knot.y, branch.width * .23, branch.width * .095, direction, 0, TAU);
          context.stroke();
        }
        context.restore();
        context.strokeStyle="rgba(210,170,154,.14)";context.lineWidth=branch.width*.035;
        context.beginPath();context.moveTo(...edges[0].left);edges.slice(1).forEach(edge=>context.lineTo(...edge.left));context.stroke();
        context.restore();
      });
      for(const direction of [-1,1]) {
        context.globalAlpha = smoothStep(growth / .22);
        context.fillStyle="#4f4249";context.beginPath();context.moveTo(-.025,0);context.bezierCurveTo(direction*.07,.015,direction*.1,.02,direction*.13,.022);context.bezierCurveTo(direction*.06,.014,direction*.035,-.04,.025,-.1);context.closePath();context.fill();
      }
      this.sakura.blossoms.forEach(flower => {
        const bloom = smoothStep((growth - flower.birth) / .18);
        if (!bloom) return;
        const sprite = this.flowerSprite(flower.tone);
        const radius = flower.size * ( .35 + bloom * .65);
        context.globalAlpha = bloom * (.66+flower.depth*.3);
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
      const size = Math.min(this.width * (compact ? .6 : .3), this.height * .48);
      const shoreY = this.height * .66;
      const originX = this.width * (compact ? .35 : .24);
      const left = originX - size * 1.05;
      const top = shoreY - size * 1.45;
      const opacity = (compact ? .96 - finale * .38 : 1 - finale * .15);
      if (!this.treeSurface) this.treeSurface = this.makeSurface(size * 2.2, size * 1.6);
      const growthFrame = Math.round(growth * 24);
      if (this.treeSurface && this.treeGrowth !== growthFrame) {
        const cachedContext = this.treeSurface.getContext("2d");
        cachedContext.clearRect(0, 0, this.treeSurface.width, this.treeSurface.height);
        this.drawSakura(cachedContext, size, growthFrame / 24);
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

    paintHand(context, positionX, positionY, direction = 1, rotation = 0, supporting = false) {
      context.save();
      context.translate(positionX, positionY);
      context.rotate(rotation);
      context.scale(direction, 1);
      const skin = context.createLinearGradient(0, -.025, 0, .04);
      skin.addColorStop(0, "#fce1d0");
      skin.addColorStop(.5, "#efc3ae");
      skin.addColorStop(1, "#c58f8d");
      context.fillStyle = skin;
      context.beginPath();
      context.moveTo(-.02, -.017);
      context.bezierCurveTo(.005, -.022, .023, -.03, .047, -.025);
      context.bezierCurveTo(.055, -.01, .05, .014, .032, .021);
      context.quadraticCurveTo(.007, .024, -.02, .012);
      context.closePath();
      context.fill();
      const lengths = [.061, .075, .069, .052];
      lengths.forEach((length, index) => {
        const baseY = -.02 + index * .011;
        const bend = supporting ? -.016 : .008 + index * .003;
        context.beginPath();
        context.moveTo(.034, baseY - .0035);
        context.bezierCurveTo(.061, baseY - .008, .045 + length, baseY + bend - .012, .046 + length, baseY + bend);
        context.quadraticCurveTo(.046 + length, baseY + bend + .004, .039 + length, baseY + bend + .004);
        context.bezierCurveTo(.069, baseY + .009, .051, baseY + .008, .03, baseY + .004);
        context.closePath();
        context.fill();
        context.strokeStyle = "rgba(123,76,84,.24)";
        context.lineWidth = .0018;
        context.stroke();
        context.strokeStyle = "rgba(255,239,227,.75)";
        context.lineWidth = .0024;
        context.beginPath();
        context.moveTo(.036 + length, baseY + bend - .001);
        context.lineTo(.042 + length, baseY + bend - .001);
        context.stroke();
      });
      context.fillStyle = skin;
      context.beginPath();
      context.moveTo(.004, .012);
      context.bezierCurveTo(.017, .024, .036, .043, .054, .039);
      context.quadraticCurveTo(.062, .031, .05, .027);
      context.quadraticCurveTo(.03, .027, .026, .006);
      context.closePath();
      context.fill();
      context.restore();
    }

    paintGirl(context) {
      const gradient=(startX,startY,endX,endY,stops)=>{
        const fill=context.createLinearGradient(startX,startY,endX,endY);
        stops.forEach(([offset,color])=>fill.addColorStop(offset,color));return fill;
      };
      const skin=gradient(-.22,-1.06,.2,-.55,[[0,"#c5969e"],[.28,"#f5d7c8"],[.49,"#ffe8d7"],[.77,"#deb6b0"],[1,"#a47b8e"]]);
      const materials={
        hair:gradient(-.2,-1.2,.34,.15,[[0,"#171d2c"],[.32,"#483444"],[.49,"#79606c"],[.62,"#322d40"],[.9,"#473247"],[1,"#957084"]]),
        fringe:gradient(-.18,-1.24,.2,-.85,[[0,"#51404b"],[.35,"#76606a"],[.62,"#3a2f40"],[1,"#212534"]]),
        skin,face:skin,shoe:"#b8a6a6",
        dress:gradient(-.43,-.1,.61,.5,[[0,"#748697"],[.19,"#c0c6cf"],[.34,"#f4e7df"],[.46,"#fff1e2"],[.6,"#b9c5d4"],[.77,"#d1b9cd"],[1,"#8196af"]])
      };
      const curve=(anchors,color,width)=>{
        context.beginPath();context.moveTo(...anchors[0]);context.bezierCurveTo(...anchors[1],...anchors[2],...anchors[3]);
        context.strokeStyle=color;context.lineWidth=width;context.lineCap="round";context.stroke();
      };
      const ellipse=(positionX,positionY,radiusX,radiusY,color,rotation=0)=>{
        context.fillStyle=color;context.beginPath();context.ellipse(positionX,positionY,radiusX,radiusY,rotation,0,TAU);context.fill();
      };
      curve([[.17,-.67],[.24,-.48],[.21,-.27],[.18,-.13]],skin,.038);
      this.paintHand(context,.18,-.12,1,1.34);
      girlShapes.forEach(shape=>{
        traceShape(context,shape);context.fillStyle=materials[shape.part];context.fill();
        context.strokeStyle=shape.part==="dress"?"rgba(255,234,217,.6)":"rgba(225,184,187,.18)";context.lineWidth=.003;context.stroke();
      });
      traceShape(context,girlShapes.find(shape=>shape.part==="dress"));
      context.save();context.clip();
      for(let index=0;index<10;index++){
        const offset=(index-4.5)*.073;
        curve([[offset*.25,-.18],[offset*.5,.14],[offset*1.2,.72],[offset*1.6+.06,1.1]],index%2?"rgba(255,246,229,.44)":"rgba(67,87,123,.2)",index%2?.009:.018);
      }
      for(let index=0;index<6;index++){
        const offset=index*.018;
        curve([[-.17,-.6+offset],[-.04,-.54+offset],[.09,-.61+offset],[.17,-.62+offset]],"rgba(255,242,222,.4)",.003);
      }
      const random=randomGenerator(9371);
      for(let index=0;index<105;index++){
        const positionY=-.45+random()*1.54;const positionX=(random()-.5)*1.1;
        ellipse(positionX,positionY,.0018+random()*.0018,.002,index%3?"rgba(255,244,222,.37)":"rgba(185,209,228,.33)");
      }
      context.restore();
      curve([[-.12,-.09],[-.03,-.06],[.04,-.06],[.115,-.09]],"#d8c1b0",.008);
      ellipse(.002,-.077,.01,.009,"#fff1cf");
      traceShape(context,girlShapes.find(shape=>shape.part==="face"));
      context.save();context.clip();
      const cheek=context.createRadialGradient(-.102,-.947,.002,-.102,-.947,.067);
      cheek.addColorStop(0,"rgba(226,137,149,.28)");cheek.addColorStop(1,"rgba(223,145,157,0)");
      ellipse(-.102,-.947,.067,.067,cheek);
      ellipse(-.114,-1.013,.037,.017,"#fff0e1",-.14);
      ellipse(-.133,-1.013,.009,.011,"#6a5865");
      ellipse(-.135,-1.014,.004,.007,"#292d43");
      ellipse(-.137,-1.017,.0025,.0025,"#fff6e8");
      curve([[-.151,-1.014],[-.13,-1.032],[-.103,-1.025],[-.079,-1.023]],"#49353e",.005);
      curve([[-.151,-1.014],[-.159,-1.016],[-.158,-1.023],[-.159,-1.026]],"#49353e",.003);
      context.restore();
      curve([[-.146,-1.044],[-.122,-1.055],[-.101,-1.054],[-.082,-1.049]],"rgba(85,58,67,.76)",.004);
      ellipse(-.122,-.942,.023,.009,"rgba(202,122,138,.16)",-.2);
      curve([[-.168,-.928],[-.157,-.931],[-.15,-.924],[-.143,-.927]],"#b87585",.004);
      curve([[-.162,-.919],[-.155,-.916],[-.148,-.919],[-.143,-.921]],"rgba(255,230,224,.7)",.003);
      ellipse(.077,-.945,.012,.019,"#ddb9a8");
      ellipse(.079,-.918,.006,.02,"#fce1b3");
      curve([[-.105,-.748],[-.035,-.694],[.03,-.693],[.11,-.725]],"rgba(242,214,184,.6)",.003);
      ellipse(.002,-.705,.005,.009,"#fff0d1");
      for(let index=0;index<7;index++){
        const offset=index*.016;
        curve([[.09+offset,-1.19],[.24+offset,-.92],[.1+offset,-.43],[.26+offset,.12]],"rgba(194,159,169,.22)",.0025);
      }
      for(let index=0;index<5;index++){
        const angle=index/5*TAU;
        ellipse(.14+Math.cos(angle)*.018,-1.04+Math.sin(angle)*.018,.017,.008,"#f1c2cb",angle);
      }
      ellipse(.14,-1.04,.006,.006,"#ffe6bc");
    }

    featherPortrait(surface, reveal) {
      if (reveal >= 1) return;
      const context = surface.getContext("2d");
      const feather = surface.height * .16;
      const boundary = surface.height * (1 - reveal) * 1.2 - feather;
      const mask = context.createLinearGradient(0, boundary, 0, boundary + feather);
      mask.addColorStop(0, "rgba(255,255,255,0)");
      mask.addColorStop(1, "rgba(255,255,255,1)");
      context.save();
      context.globalCompositeOperation = "destination-in";
      context.fillStyle = mask;
      context.fillRect(0, 0, surface.width, surface.height);
      context.restore();
    }

    girlPortrait(context, positionX, positionY, scale, opacity, reveal = 1) {
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
      if (this.girlSurface) {
        let portrait=this.girlSurface;
        if(reveal<1) {
          if(!this.girlRevealSurface)this.girlRevealSurface=this.makeSurface(portrait.width,portrait.height);
          if(this.girlRevealSurface) {
            const target=this.girlRevealSurface.getContext("2d");
            target.clearRect(0,0,portrait.width,portrait.height);target.drawImage(portrait,0,0);
            this.featherPortrait(this.girlRevealSurface, reveal);
            portrait=this.girlRevealSurface;
          }
        }
        context.drawImage(portrait, positionX - this.girlSurface.width / density / 2, positionY - scale * 1.32, this.girlSurface.width / density, this.girlSurface.height / density);
      }
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
      const hip = { x: -1.15, y: .02 + kneel * .43 };
      const shoulder = { x: -1.19 + kneel * .1, y: -.72 + kneel * .47 };
      const neck = { x: shoulder.x + .022, y: shoulder.y - .095 };
      const head = { x: neck.x + .025, y: neck.y - .135 };
      const kneeFront = { x: -.95 + kneel * .26, y: .57 + kneel * .055 };
      const footFront = { x: -.9 + kneel * .3, y: 1.05 };
      const kneeBack = { x: -1.37 - kneel * .14, y: .6 + kneel * .45 };
      const footBack = { x: -1.43 - kneel * .32, y: 1.05 };
      const hand = { x: shoulder.x + .22 + offer * .5, y: shoulder.y + .49 - offer * .44 };
      const elbow = { x: shoulder.x + .1 + offer * .17, y: shoulder.y + .4 - offer * .07 };
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
      const limb = (start, middle, end, upperWidth, lowerWidth, material) => {
        const upperAngle = Math.atan2(middle.y - start.y, middle.x - start.x) + Math.PI / 2;
        const lowerAngle = Math.atan2(end.y - middle.y, end.x - middle.x) + Math.PI / 2;
        const upper = { x: Math.cos(upperAngle) * upperWidth, y: Math.sin(upperAngle) * upperWidth };
        const lower = { x: Math.cos(lowerAngle) * lowerWidth, y: Math.sin(lowerAngle) * lowerWidth };
        context.beginPath();
        context.moveTo(start.x + upper.x, start.y + upper.y);
        context.lineTo(middle.x + upper.x * .7, middle.y + upper.y * .7);
        context.quadraticCurveTo(middle.x + upper.x, middle.y + upper.y, middle.x + lower.x, middle.y + lower.y);
        context.lineTo(end.x + lower.x, end.y + lower.y);
        context.lineTo(end.x - lower.x, end.y - lower.y);
        context.lineTo(middle.x - lower.x, middle.y - lower.y);
        context.quadraticCurveTo(middle.x - upper.x, middle.y - upper.y, middle.x - upper.x * .7, middle.y - upper.y * .7);
        context.lineTo(start.x - upper.x, start.y - upper.y);
        context.closePath();
        context.fillStyle = material;
        context.fill();
      };
      const face = context.createLinearGradient(head.x - .13, head.y, head.x + .21, head.y + .15);
      face.addColorStop(0,"#9f7a8d");
      face.addColorStop(.52,"#edc7b7");
      face.addColorStop(1,"#f9decb");
      const jacket = context.createLinearGradient(shoulder.x - .2, shoulder.y, shoulder.x + .2, shoulder.y + .1);
      jacket.addColorStop(0,"#141e39");
      jacket.addColorStop(.4,"#394e72");
      jacket.addColorStop(.7,"#203451");
      jacket.addColorStop(1,"#6d7291");
      limb(hip,kneeBack,footBack,.083,.052,"#17243a");
      limb(hip,kneeFront,footFront,.087,.05,"#2c3c53");
      line([{x:hip.x+.045,y:hip.y+.03},kneeFront,{x:footFront.x-.02,y:1}],"rgba(166,183,214,.26)",.007);
      line([{x:footFront.x-.075,y:1.075},{x:footFront.x+.12,y:1.075}],"#111a2c",.055);
      line([{x:footBack.x-.1,y:1.075},{x:footBack.x+.07,y:1.075}],"#131d32",.053);
      const restingHand = { x: kneeFront.x - .045, y: kneeFront.y - .09 };
      limb({x:shoulder.x-.08,y:shoulder.y+.02},{x:shoulder.x-.13,y:shoulder.y+.41},restingHand,.062,.028,"#24334e");
      this.paintHand(context, restingHand.x, restingHand.y, 1, .38);
      context.beginPath();context.moveTo(shoulder.x-.15,shoulder.y+.025);context.quadraticCurveTo(shoulder.x-.07,shoulder.y-.035,shoulder.x+.115,shoulder.y+.005);context.bezierCurveTo(shoulder.x+.14,shoulder.y+.16,hip.x+.085,hip.y-.09,hip.x+.13,hip.y+.115);context.quadraticCurveTo(hip.x-.04,hip.y+.14,hip.x-.145,hip.y+.095);context.closePath();context.fillStyle=jacket;context.fill();
      polygon([[neck.x-.06,shoulder.y-.025],[neck.x+.095,shoulder.y-.025],[shoulder.x+.035,shoulder.y+.42]],"#e7e2df");
      polygon([[neck.x+.015,shoulder.y+.04],[neck.x+.045,shoulder.y+.09],[shoulder.x+.05,shoulder.y+.32],[shoulder.x+.02,shoulder.y+.35],[shoulder.x+.005,shoulder.y+.3]],"#a78098");
      polygon([[shoulder.x-.115,shoulder.y+.015],[shoulder.x-.044,shoulder.y+.035],[shoulder.x+.025,shoulder.y+.35],[shoulder.x-.09,shoulder.y+.18],[shoulder.x-.05,shoulder.y+.14]],"#57617d");
      polygon([[shoulder.x+.095,shoulder.y+.01],[shoulder.x+.14,shoulder.y+.15],[shoulder.x+.098,shoulder.y+.21],[shoulder.x+.025,shoulder.y+.35]],"#485674");
      line([{x:shoulder.x-.044,y:shoulder.y+.035},{x:shoulder.x+.025,y:shoulder.y+.35}],"rgba(182,188,211,.46)",.005);
      context.fillStyle = "#a4a6b5";
      for (let button = 0; button < 2; button++) { context.beginPath();context.arc(shoulder.x+.04,shoulder.y+.43+button*.11,.005,0,TAU);context.fill(); }
      line([{x:neck.x,y:neck.y-.02},{x:neck.x,y:shoulder.y+.02}],face,.085);
      context.save();
      context.translate(head.x,head.y);
      context.rotate(-.05-kneel*.18);
      context.beginPath();context.moveTo(-.087,-.11);context.bezierCurveTo(-.06,-.18,.067,-.16,.092,-.087);context.quadraticCurveTo(.09,-.047,.106,-.013);context.quadraticCurveTo(.117,.008,.132,.023);context.quadraticCurveTo(.131,.037,.102,.04);context.lineTo(.104,.065);context.quadraticCurveTo(.118,.075,.1,.083);context.lineTo(.103,.099);context.quadraticCurveTo(.075,.13,.037,.135);context.lineTo(-.042,.082);context.lineTo(-.075,.04);context.closePath();context.fillStyle=face;context.fill();
      context.strokeStyle="rgba(116,77,94,.3)";context.lineWidth=.003;context.beginPath();context.moveTo(.1,.099);context.quadraticCurveTo(.068,.116,.037,.135);context.lineTo(-.042,.082);context.stroke();
      const hair=context.createLinearGradient(-.1,-.18,.1,.03);hair.addColorStop(0,"#151e32");hair.addColorStop(.45,"#3d3544");hair.addColorStop(1,"#242c40");
      context.beginPath();context.moveTo(-.092,.04);context.bezierCurveTo(-.13,-.024,-.116,-.16,-.055,-.18);context.bezierCurveTo(-.024,-.196,.016,-.219,.041,-.191);context.quadraticCurveTo(.112,-.186,.12,-.118);context.quadraticCurveTo(.07,-.079,.014,-.103);context.quadraticCurveTo(-.027,-.112,-.034,-.018);context.lineTo(-.054,.042);context.closePath();context.fillStyle=hair;context.fill();
      for(let strand=0;strand<4;strand++){context.strokeStyle="rgba(160,146,164,.3)";context.lineWidth=.002;context.beginPath();context.moveTo(-.096+strand*.012,-.08);context.bezierCurveTo(-.07,-.16,.01,-.18,.087,-.134+strand*.008);context.stroke();}
      line([{x:.038,y:-.035},{x:.079,y:-.04}],"#493442",.006);
      context.fillStyle="#fce7d7";context.beginPath();context.ellipse(.061,-.017,.022,.009,-.12,0,TAU);context.fill();
      context.fillStyle="#35354b";context.beginPath();context.ellipse(.074,-.018,.005,.007,0,0,TAU);context.fill();
      line([{x:.04,y:-.022},{x:.067,y:-.03},{x:.083,y:-.023}],"#3c3442",.0035);
      line([{x:.101,y:.073},{x:.088,y:.077}],"#9d687c",.003);
      context.fillStyle="#d5a398";context.beginPath();context.ellipse(-.063,.031,.016,.026,-.12,0,TAU);context.fill();
      context.restore();
      limb(shoulder,elbow,{x:hand.x-.03,y:hand.y},.067,.028,jacket);
      line([{x:elbow.x,y:elbow.y-.045},{x:hand.x-.055,y:hand.y-.027}],"rgba(192,197,219,.35)",.005);
      line([{x:hand.x-.065,y:hand.y},{x:hand.x-.018,y:hand.y}],"#eee4de",.052);
      this.paintHand(context,hand.x,hand.y,1,-.12,true);
      return hand;
    }

    suitorPortrait(context, state, scale) {
      const density = Math.min(this.ratio || 1, 1.5);
      const resolution = scale * density;
      if (!this.suitorSurface) this.suitorSurface = this.makeSurface(resolution * 2.3, resolution * 2.6);
      if (!this.suitorSurface) return this.drawSuitor(context, state);
      if (this.suitorPose !== state) {
        const portrait = this.suitorSurface.getContext("2d");
        portrait.clearRect(0, 0, this.suitorSurface.width, this.suitorSurface.height);
        portrait.save();
        portrait.translate(resolution * 2, resolution * 1.32);
        portrait.scale(resolution, resolution);
        this.suitorHand = this.drawSuitor(portrait, state);
        portrait.restore();
        this.featherPortrait(this.suitorSurface, this.reduced ? 1 : state.arrival);
        this.suitorPose = state;
      }
      context.drawImage(this.suitorSurface, -2, -1.32, this.suitorSurface.width / resolution, this.suitorSurface.height / resolution);
      return this.suitorHand;
    }

    entranceStardust(elapsed) {
      if(this.reduced || elapsed<21 || elapsed>30) return;
      const context=this.context;
      const layout=proposalLayout(this.width,this.height);
      const progress=smoothStep((elapsed-21)/7);
      const fade=smoothStep((elapsed-21)/1.5)*(1-smoothStep((elapsed-27)/3));
      const count=this.width<600?90:150;
      context.save();context.globalCompositeOperation="lighter";
      for(let index=0;index<count;index++) {
        const along=index/(count-1);
        const angle=along*TAU*2.2+elapsed*.55;
        const radius=layout.scale*(.8-along*.4)*(1-progress*.35);
        const positionX=layout.centerX+layout.scale*.1+Math.cos(angle)*radius;
        const positionY=layout.groundY-along*layout.scale*2.6+Math.sin(angle)*layout.scale*.1;
        this.point(positionX,positionY,index%9===0?1.2:.55,index%3?"255,217,176":"236,177,206",fade*(.12+along*.22));
      }
      context.restore();
    }

    flutteringButterflies(elapsed,foreground) {
      const context=this.context;
      const count=this.width<600?3:5;
      for(let index=0;index<count;index++) {
        const state=butterflyState(index,elapsed,this.reduced);
        if(state.opacity<.005 || (state.depth>0)!==foreground) continue;
        const size=Math.min(this.width,this.height)*(.012+index*.001)*(1+state.depth*.17);
        const positionX=state.x*this.width;const positionY=state.y*this.height;
        context.save();context.translate(positionX,positionY);context.rotate(state.rotation);
        context.globalAlpha=state.opacity*(.7+state.depth*.15);
        for(const side of [-1,1]) {
          context.save();context.scale(side*(.22+state.flap*.78),1);
          const wing=context.createLinearGradient(0,0,size*1.25,-size*.6);
          wing.addColorStop(0,index%2?"#a98cbd":"#ba8c99");wing.addColorStop(.56,index%2?"#c6c8ef":"#f3c5d0");wing.addColorStop(1,"#fff0d7");
          context.fillStyle=wing;context.strokeStyle="rgba(252,227,205,.68)";context.lineWidth=.55;
          context.beginPath();context.moveTo(0,0);context.bezierCurveTo(size*.25,-size*.92,size*1.46,-size*1.24,size*1.2,-size*.14);context.bezierCurveTo(size*1.05,size*.15,size*.45,size*.1,0,0);context.fill();context.stroke();
          context.beginPath();context.moveTo(0,0);context.bezierCurveTo(size*.96,-size*.04,size*1.11,size*.69,size*.49,size*.7);context.bezierCurveTo(size*.16,size*.64,size*.08,size*.2,0,0);context.fill();context.stroke();
          context.strokeStyle="rgba(100,81,130,.3)";context.lineWidth=.4;
          for(let vein=0;vein<3;vein++){context.beginPath();context.moveTo(0,0);context.quadraticCurveTo(size*.35,-size*.17,size*(.55+vein*.22),-size*(.25+vein*.22));context.stroke();}
          context.restore();
        }
        context.strokeStyle="#ebd2bd";context.lineWidth=.85;context.beginPath();context.moveTo(0,-size*.32);context.lineTo(0,size*.42);context.stroke();
        context.lineWidth=.45;context.beginPath();context.moveTo(0,-size*.3);context.quadraticCurveTo(-size*.14,-size*.58,-size*.22,-size*.57);context.moveTo(0,-size*.3);context.quadraticCurveTo(size*.14,-size*.58,size*.22,-size*.57);context.stroke();
        context.restore();
      }
    }

    proposalScene(elapsed) {
      const context = this.context;
      const state = proposalState(elapsed, this.reduced);
      const opacity = state.reveal * state.farewell;
      if (opacity <= .001) return;
      const { scale, centerX, centerY, groundY } = proposalLayout(this.width, this.height);
      const time = this.reduced ? 38 : elapsed;
      const girlX = centerX + scale * .47;
      const manX = centerX;
      const lift = 0;
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
      this.girlPortrait(context,girlX,centerY+lift,scale,1,state.reveal);
      context.save();
      context.translate(0,groundY*1.22);
      context.scale(1,-.22);
      this.girlPortrait(context,girlX,centerY,scale,.13,state.reveal);
      context.restore();
      context.save();
      context.translate(manX,centerY+lift);
      context.scale(scale,scale);
      context.globalAlpha *= state.arrival;
      const hand = this.suitorPortrait(context, state, scale);
      context.restore();
      context.save();
      context.translate(0,groundY*1.22);
      context.scale(1,-.22);
      context.translate(manX,centerY+lift);
      context.scale(scale,scale);
      context.globalAlpha *= state.arrival*.1;
      this.suitorPortrait(context, state, scale);
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
        context.globalAlpha *= smoothStep((state.reveal - .58) / .3);
        const handX = (girlX-scale*.19)*(1-state.reach) + (ringX+scale*.15)*state.reach;
        const handY = (centerY-scale*.1)*(1-state.reach) + (ringY-scale*.04)*state.reach;
        const shoulderX = girlX-scale*.19;
        const shoulderY = centerY-scale*.7;
        const elbowX = girlX-scale*(.27+.05*state.reach);
        const elbowY = centerY-scale*(.25+.08*state.reach);
        const arm = [
          ...sampleCurve([[shoulderX,shoulderY],[shoulderX-scale*.07,shoulderY+scale*.16],[elbowX+scale*.02,elbowY-scale*.1],[elbowX,elbowY]],18),
          ...sampleCurve([[elbowX,elbowY],[elbowX-scale*.065,elbowY+scale*.045],[handX+scale*.1,handY+scale*.01],[handX,handY]],22).slice(1)
        ];
        const edges = arm.map((point,index) => {
          const previous = arm[Math.max(0,index-1)];
          const next = arm[Math.min(arm.length-1,index+1)];
          const normal = Math.atan2(next.y-previous.y,next.x-previous.x)+Math.PI/2;
          const radius = scale * (.028-index/(arm.length-1)*.017);
          return { left:[point.x+Math.cos(normal)*radius,point.y+Math.sin(normal)*radius],right:[point.x-Math.cos(normal)*radius,point.y-Math.sin(normal)*radius] };
        });
        context.beginPath();context.moveTo(...edges[0].left);edges.slice(1).forEach(edge=>context.lineTo(...edge.left));[...edges].reverse().forEach(edge=>context.lineTo(...edge.right));context.closePath();
        const skin = context.createLinearGradient(shoulderX-scale*.04,shoulderY,shoulderX+scale*.05,shoulderY);
        skin.addColorStop(0,"#cf9ca0");skin.addColorStop(.45,"#f7d6c5");skin.addColorStop(1,"#edbfad");
        context.fillStyle=skin;context.fill();
        context.translate(handX,handY);context.scale(scale,scale);
        this.paintHand(context,0,0,-1,-.8*(1-state.reach));
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
      this.entranceStardust(elapsed);
      this.flutteringButterflies(elapsed,false);
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
        const settledOpacity = ["face", "skin", "shoe", "fringe", "hair"].includes(particle.part) ? .005 : .055;
        const alpha = particleState.alpha * (particleState.gather > .9 ? settledOpacity : .12) * state.farewell * (this.reduced ? 1 : Math.min(1, (elapsed - 6) / 3));
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
      this.flutteringButterflies(elapsed,true);
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
      const fontSize = Math.min(30, (this.width - 24) / (letters.length * 1.2));
      const advance = fontSize * 1.2;
      const family = window.getComputedStyle(this.canvas).getPropertyValue("--serif").trim() || '"Songti SC", "STSong", "Noto Serif CJK SC", "SimSun", serif';
      context.scale(2, 2);
      context.font = `500 ${fontSize}px ${family}`;
      context.textAlign = "center";
      context.textBaseline = "alphabetic";
      context.fillStyle = "#ffffff";
      const metrics = context.measureText(this.name) || {};
      const ascent = metrics.actualBoundingBoxAscent ?? fontSize * .8;
      const descent = metrics.actualBoundingBoxDescent ?? fontSize * .2;
      const baseline = this.height / 2 + (ascent - descent) / 2;
      letters.forEach((letter, index) => context.fillText(letter, this.width / 2 + (index - (letters.length - 1) / 2) * advance, baseline));
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

  window.RomanceParticles = Object.freeze({ Theatre, NameDedication, makeGirlParticles, makeMeteorEvents, makeSakuraTree, meteorEventState, meteorParticleState, proposalState, proposalLayout, butterflyState, meteorChapters, duration });
})();
