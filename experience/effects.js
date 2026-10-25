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
    { part: "skin", curves: [ [[-.015,-.85],[-.022,-.73],[-.035,-.68],[-.19,-.61]], [[-.19,-.61],[-.25,-.54],[-.19,-.4],[-.1,-.4]], [[-.1,-.4],[.01,-.36],[.13,-.39],[.2,-.52]], [[.2,-.52],[.2,-.59],[.07,-.64],[.07,-.84]], [[.07,-.84],[.04,-.87],[.01,-.87],[-.015,-.85]] ] },
    { part: "skin", curves: [ [[.16,-.56],[.26,-.53],[.24,-.31],[.27,-.18]], [[.27,-.18],[.25,-.08],[.15,-.02],[.13,-.07]], [[.13,-.07],[.11,-.1],[.18,-.16],[.19,-.2]], [[.19,-.2],[.17,-.32],[.12,-.47],[.16,-.56]] ] },
    { part: "shoe", curves: [ [[-.13,1.01],[-.16,1.04],[-.23,1.09],[-.13,1.1]], [[-.13,1.1],[-.03,1.11],[-.02,1.08],[-.06,1.02]], [[-.06,1.02],[-.08,1],[-.11,1],[-.13,1.01]] ] },
    { part: "dress", curves: [ [[-.18,-.52],[-.12,-.48],[-.05,-.46],[.01,-.48]], [[.01,-.48],[.08,-.47],[.14,-.51],[.19,-.53]], [[.19,-.53],[.18,-.39],[.09,-.2],[.115,-.09]], [[.115,-.09],[.13,.24],[.28,.68],[.42,.94]], [[.42,.94],[.49,1.01],[.6,1.035],[.69,1.04]], [[.69,1.04],[.46,1.16],[.17,1.09],[.035,1.07]], [[.035,1.07],[-.18,1.13],[-.39,1.08],[-.43,1.025]], [[-.43,1.025],[-.33,.74],[-.17,.29],[-.12,-.08]], [[-.12,-.08],[-.09,-.24],[-.21,-.38],[-.18,-.52]] ] },
    { part: "face", curves: [ [[-.13,-1.13],[-.18,-1.09],[-.15,-1.015],[-.19,-.985]], [[-.19,-.985],[-.235,-.95],[-.2,-.936],[-.174,-.933]], [[-.174,-.933],[-.177,-.904],[-.198,-.907],[-.175,-.89]], [[-.175,-.89],[-.173,-.847],[-.119,-.824],[-.08,-.834]], [[-.08,-.834],[.039,-.854],[.109,-.987],[.087,-1.091]], [[.087,-1.091],[.048,-1.18],[-.055,-1.19],[-.13,-1.13]] ] },
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
      { anchors:[[0,.025],[.075,-.22],[-.035,-.48],[.075,-.77]], width:.115 },
      { anchors:[[.018,-.35],[-.16,-.54],[-.39,-.51],[-.64,-.81]], width:.066 },
      { anchors:[[-.22,-.57],[-.47,-.67],[-.74,-.59],[-.91,-.79]], width:.033 },
      { anchors:[[-.43,-.66],[-.58,-.83],[-.62,-.98],[-.81,-1.03]], width:.025 },
      { anchors:[[-.09,-.49],[-.22,-.72],[-.12,-1],[-.35,-1.21]], width:.045 },
      { anchors:[[-.15,-.78],[-.38,-.91],[-.29,-1.08],[-.49,-1.23]], width:.025 },
      { anchors:[[.027,-.59],[.14,-.84],[.07,-1.04],[.17,-1.35]], width:.068 },
      { anchors:[[.082,-.8],[.29,-.87],[.42,-.85],[.62,-1.04]], width:.044 },
      { anchors:[[.1,-.92],[.28,-1.07],[.31,-1.22],[.47,-1.29]], width:.031 },
      { anchors:[[.3,-.93],[.54,-.93],[.67,-.77],[.88,-.88]], width:.028 },
      { anchors:[[.53,-.97],[.65,-1.12],[.85,-1.04],[.99,-1.12]], width:.018 },
      { anchors:[[-.01,-.43],[.19,-.48],[.22,-.63],[.45,-.69]], width:.038 },
      { anchors:[[.24,-.62],[.44,-.65],[.55,-.57],[.71,-.67]], width:.019 }
    ];
    const addBranch = (anchors, width, birth, depth) => {
      const samples = sampleCurve(anchors, 24);
      const bark = Array.from({length: Math.ceil(width * 600)}, () => ({along:random(),across:(random()-.5)*.85,light:random()>.55}));
      branches.push({anchors,width,birth,depth,samples,bark});
      return samples;
    };
    scaffold.forEach((limb, limbIndex) => {
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
        clusters.push({x:end.x,y:end.y,radius:.045+random()*.055,depth,birth:.3+random()*.2});
      }
      clusters.push({x:limb.anchors[3][0],y:limb.anchors[3][1],radius:.08,depth,birth:.4});
    });
    clusters.sort((first,second)=>first.depth-second.depth);
    clusters.forEach(cluster=>{
      const count=compact?32:50;
      for(let index=0;index<count;index++) {
        const phase=random()*TAU;
        const radius=Math.sqrt(random())*cluster.radius;
        blossoms.push({x:cluster.x+Math.cos(phase)*radius*1.4,y:cluster.y+Math.sin(phase)*radius*.72,size:.008+random()*.009,phase,depth:cluster.depth,tone:Math.floor(random()*4),birth:cluster.birth+random()*.16});
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
        const colors = ["#f5c2cf", "#d997b1", "#fff0e8", "#b988a6"];
        for (let index = 0; index < 5; index++) {
          const angle = index / 5 * TAU;
          context.save();
          context.translate(16,16);
          context.rotate(angle);
          const gradient=context.createLinearGradient(0,0,11,0);
          gradient.addColorStop(0,"#c784a0");gradient.addColorStop(.45,colors[tone]);gradient.addColorStop(1,"#ffe9e9");
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
          const radius=branch.width*(.53-index/(samples.length-1)*.43)*(1+Math.sin(index*1.7+branch.birth*20)*.05);
          return {left:[point.x+Math.cos(angle)*radius,point.y+Math.sin(angle)*radius],right:[point.x-Math.cos(angle)*radius,point.y-Math.sin(angle)*radius]};
        });
        const material=context.createLinearGradient(anchors[0][0]-.065,anchors[0][1],anchors[0][0]+.065,anchors[0][1]);
        material.addColorStop(0,"#211f2a");material.addColorStop(.3,"#6f5656");material.addColorStop(.48,"#9a7770");material.addColorStop(.66,"#58474c");material.addColorStop(1,"#292936");
        context.beginPath();context.moveTo(...edges[0].left);edges.slice(1).forEach(edge=>context.lineTo(...edge.left));[...edges].reverse().forEach(edge=>context.lineTo(...edge.right));context.closePath();context.fillStyle=material;context.fill();
        context.save();context.clip();
        branch.bark.forEach(mark=>{
          const sampleIndex=Math.min(samples.length-2,Math.floor(mark.along*(samples.length-1)));
          const point=samples[sampleIndex];const next=samples[sampleIndex+1];
          const angle=Math.atan2(next.y-point.y,next.x-point.x);const radius=branch.width*(.53-mark.along*.43);
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
        context.strokeStyle="rgba(210,170,154,.24)";context.lineWidth=branch.width*.055;
        context.beginPath();context.moveTo(...edges[0].left);edges.slice(1).forEach(edge=>context.lineTo(...edge.left));context.stroke();
        context.restore();
      });
      for(const direction of [-1,1]) {
        context.fillStyle="#4f4249";context.beginPath();context.moveTo(-.025,0);context.bezierCurveTo(direction*.08,.005,direction*.1,.015,direction*.17,.025);context.bezierCurveTo(direction*.07,.013,direction*.035,-.04,.025,-.1);context.closePath();context.fill();
      }
      this.sakura.blossoms.forEach(flower => {
        const bloom = smoothStep((growth - flower.birth) / .18);
        if (!bloom) return;
        const sprite = this.flowerSprite(flower.tone);
        const radius = flower.size * ( .35 + bloom * .65);
        context.globalAlpha = bloom * (.64+flower.depth*.3);
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
      const size = Math.min(this.width * (compact ? .58 : .34), this.height * .51);
      const shoreY = this.height * .66;
      const originX = this.width * (compact ? .19 : .17);
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

    paintGirl(context) {
      const gradient=(startX,startY,endX,endY,stops)=>{
        const fill=context.createLinearGradient(startX,startY,endX,endY);
        stops.forEach(([offset,color])=>fill.addColorStop(offset,color));return fill;
      };
      const skin=gradient(-.22,-1.06,.2,-.55,[[0,"#b27e83"],[.28,"#f5d2bb"],[.49,"#ffe6cd"],[.77,"#ddb3a5"],[1,"#a77c89"]]);
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
        curve([[-.17,-.49+offset],[-.04,-.43+offset],[.09,-.5+offset],[.17,-.51+offset]],"rgba(255,242,222,.4)",.003);
      }
      const random=randomGenerator(9371);
      for(let index=0;index<105;index++){
        const positionY=-.45+random()*1.54;const positionX=(random()-.5)*1.1;
        ellipse(positionX,positionY,.0018+random()*.0018,.002,index%3?"rgba(255,244,222,.37)":"rgba(185,209,228,.33)");
      }
      context.restore();
      curve([[-.12,-.09],[-.03,-.06],[.04,-.06],[.115,-.09]],"#d8c1b0",.008);
      ellipse(.002,-.077,.01,.009,"#fff1cf");
      curve([[-.156,-1.005],[-.13,-.999],[-.101,-1.006],[-.081,-1.021]],"#49353e",.006);
      curve([[-.16,-1.007],[-.15,-1.014],[-.152,-1.02],[-.156,-1.023]],"#49353e",.004);
      curve([[-.146,-1.044],[-.122,-1.055],[-.101,-1.054],[-.082,-1.049]],"rgba(85,58,67,.76)",.004);
      ellipse(-.122,-.942,.023,.009,"rgba(202,122,138,.16)",-.2);
      curve([[-.18,-.912],[-.167,-.908],[-.158,-.911],[-.15,-.914]],"#bc7b87",.004);
      curve([[-.168,-.902],[-.16,-.9],[-.153,-.901],[-.147,-.904]],"rgba(255,230,214,.65)",.003);
      ellipse(.077,-.945,.012,.019,"#ddb9a8");
      ellipse(.079,-.918,.006,.02,"#fce1b3");
      curve([[-.105,-.668],[-.035,-.614],[.03,-.613],[.11,-.645]],"rgba(242,214,184,.6)",.003);
      ellipse(.002,-.625,.005,.009,"#fff0d1");
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
      line([hip,kneeBack,footBack],"#17243a",.145);
      line([hip,kneeFront,footFront],"#2c3c53",.155);
      line([{x:hip.x+.045,y:hip.y+.03},kneeFront,{x:footFront.x-.02,y:1}],"rgba(166,183,214,.32)",.012);
      line([{x:footFront.x-.075,y:1.075},{x:footFront.x+.12,y:1.075}],"#111a2c",.055);
      line([{x:footBack.x-.1,y:1.075},{x:footBack.x+.07,y:1.075}],"#131d32",.053);
      line([{x:shoulder.x-.08,y:shoulder.y+.02},{x:elbow.x-.08,y:elbow.y+.035},{x:hand.x-.07,y:hand.y+.07}],"#283855",.15);
      context.beginPath();context.moveTo(shoulder.x-.15,shoulder.y+.025);context.quadraticCurveTo(shoulder.x-.07,shoulder.y-.035,shoulder.x+.115,shoulder.y+.005);context.bezierCurveTo(shoulder.x+.14,shoulder.y+.16,hip.x+.085,hip.y-.09,hip.x+.13,hip.y+.115);context.quadraticCurveTo(hip.x-.04,hip.y+.14,hip.x-.145,hip.y+.095);context.closePath();context.fillStyle=jacket;context.fill();
      polygon([[neck.x-.06,shoulder.y-.025],[neck.x+.095,shoulder.y-.025],[hip.x+.06,hip.y-.03]],"#e7e2df");
      polygon([[neck.x+.015,shoulder.y+.04],[neck.x+.05,shoulder.y+.1],[hip.x+.065,hip.y-.16],[hip.x+.005,hip.y-.12]],"#aa7493");
      line([{x:shoulder.x-.12,y:shoulder.y+.005},{x:shoulder.x-.05,y:shoulder.y+.21},{x:hip.x+.035,y:hip.y-.05}],"#8d91b0",.016);
      line([{x:shoulder.x+.11,y:shoulder.y+.01},{x:shoulder.x+.17,y:shoulder.y+.18},{x:hip.x+.035,y:hip.y-.05}],"#697d9c",.014);
      line([{x:neck.x,y:neck.y-.02},{x:neck.x,y:shoulder.y+.02}],face,.085);
      context.save();
      context.translate(head.x,head.y);
      context.rotate(-.045-kneel*.12);
      context.beginPath();context.moveTo(-.095,-.106);context.bezierCurveTo(-.07,-.18,.074,-.17,.102,-.089);context.quadraticCurveTo(.094,-.042,.115,-.014);context.lineTo(.146,.026);context.quadraticCurveTo(.139,.04,.108,.044);context.lineTo(.112,.078);context.quadraticCurveTo(.097,.081,.111,.095);context.quadraticCurveTo(.092,.137,.037,.146);context.quadraticCurveTo(-.032,.114,-.072,.061);context.closePath();context.fillStyle=face;context.fill();
      context.beginPath();context.moveTo(-.094,.045);context.bezierCurveTo(-.142,-.025,-.119,-.169,-.032,-.184);context.quadraticCurveTo(.057,-.207,.121,-.125);context.quadraticCurveTo(.092,-.084,.036,-.089);context.quadraticCurveTo(-.02,-.112,-.031,-.019);context.lineTo(-.055,.042);context.closePath();context.fillStyle="#242533";context.fill();
      line([{x:-.093,y:-.108},{x:-.032,y:-.157},{x:.063,y:-.128}],"rgba(160,140,144,.42)",.008);
      line([{x:.046,y:-.03},{x:.089,y:-.026}],"#4a3b43",.005);
      line([{x:.048,y:-.006},{x:.091,y:-.009}],"#443b42",.004);
      line([{x:.102,y:.083},{x:.087,y:.083}],"#a66e77",.004);
      context.fillStyle="#d5a398";context.beginPath();context.ellipse(-.065,.035,.022,.035,0,0,TAU);context.fill();
      context.restore();
      line([shoulder,elbow,{x:hand.x-.06,y:hand.y}],jacket,.115);
      line([{x:elbow.x,y:elbow.y-.065},{x:hand.x-.09,y:hand.y-.055}],"rgba(192,197,219,.4)",.011);
      line([{x:hand.x-.095,y:hand.y},{x:hand.x-.045,y:hand.y}],"#eee4de",.073);
      line([{x:hand.x-.02,y:hand.y},{x:hand.x+.055,y:hand.y-.015}],face,.045);
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
        context.strokeStyle = "#f4c7b3";
        context.lineWidth = scale*.044;
        context.lineCap = "round";
        const handX = (girlX-scale*.17)*(1-state.reach) + (ringX+scale*.125)*state.reach;
        const handY = (centerY-scale*.03)*(1-state.reach) + (ringY-scale*.045)*state.reach;
        context.beginPath();
        context.moveTo(girlX-scale*.19,centerY-scale*.57);
        context.quadraticCurveTo(girlX-scale*.32,centerY-scale*.14,handX,handY);
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

  window.RomanceParticles = Object.freeze({ Theatre, NameDedication, makeGirlParticles, makeMeteorEvents, makeSakuraTree, meteorEventState, meteorParticleState, proposalState, proposalLayout, butterflyState, meteorChapters, duration });
})();
