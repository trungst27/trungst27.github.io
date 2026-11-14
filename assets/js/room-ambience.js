// Animated material over the authored room plate; no audio or network requests.
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('room-ambience');
  const room = canvas?.parentElement;
  const context = canvas?.getContext('2d', { alpha: true });
  if (!context || !room) return; // The original scene is the static fallback.
  const mobile = matchMedia('(max-width:760px)');
  const source = { width: 1536, height: 1024 };
  // Clear glass areas of the source image. Foreground plants, lamp, timber
  // frames and desk are deliberately outside the moving rain regions.
  const panes = [
    { x: 835, y: -24, width: 275, height: 244 },
    { x: 1110, y: -24, width: 300, height: 169 },
    { x: 970, y: 255, width: 145, height: 215 },
    { x: 1115, y: 330, width: 180, height: 140 }
  ];
  const weightedPanes = [0, 0, 0, 1, 1, 1, 2, 3];
  let drops = [], steam = [], frame = 0, last = 0, time = 0;
  let width = 0, height = 0, ratio = 1, scale = 1, offsetX = 0, offsetY = 0;
  let inView = !('IntersectionObserver' in window);
  const random = (min, max) => min + Math.random() * (max - min);
  function newDrop(initial = false) {
    const pane = panes[weightedPanes[Math.floor(Math.random() * weightedPanes.length)]];
    return { pane, x: random(pane.x + 3, pane.x + pane.width - 3), y: initial ? random(pane.y, pane.y + pane.height) : pane.y,
      speed: random(24, 87), length: random(9, 34), width: random(.7, 1.7), alpha: random(.22, .55), wobble: random(0, 6) };
  }
  function populate() {
    drops = Array.from({ length: mobile.matches ? 65 : 125 }, () => newDrop(true));
    steam = Array.from({ length: mobile.matches ? 14 : 24 }, () => ({ age: random(0, 1), life: random(4, 7), phase: random(0, Math.PI * 2), spread: random(-11, 11) }));
  }
  // Cache one soft vapour sprite to avoid repeated blur filtering.
  const vapour = document.createElement('canvas');
  vapour.width = vapour.height = 64;
  const vapourContext = vapour.getContext('2d');
  if (!vapourContext) return;
  const vapourGradient = vapourContext.createRadialGradient(32, 32, 0, 32, 32, 32);
  vapourGradient.addColorStop(0, 'rgba(255,239,209,.65)');
  vapourGradient.addColorStop(.35, 'rgba(255,239,209,.3)');
  vapourGradient.addColorStop(1, 'rgba(255,239,209,0)');
  vapourContext.fillStyle = vapourGradient; vapourContext.fillRect(0, 0, 64, 64);
  function resize() {
    const nextWidth = room.clientWidth, nextHeight = room.clientHeight;
    if (!nextWidth || !nextHeight) return false;
    width = nextWidth; height = nextHeight;
    ratio = Math.min(window.devicePixelRatio || 1, mobile.matches ? 1.5 : 1.25, 1800 / width);
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    // Match CSS background-size:cover and its 78% mobile/50% desktop crop.
    scale = Math.max(width / source.width, height / source.height);
    offsetX = (width - source.width * scale) * (mobile.matches ? .78 : .5);
    offsetY = (height - source.height * scale) * .5;
    return true;
  }
  function available() {
    return inView && !document.hidden && window.SiteMotion?.enabled() &&
      document.body.classList.contains('home-view') && !document.body.classList.contains('ambient-paused');
  }
  function stop() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    canvas.dataset.motionState = 'paused';
  }
  function draw(now) {
    frame = 0;
    if (!available()) { stop(); return; }
    const interval = 1000 / (mobile.matches ? 24 : 30);
    if (last && now - last < interval - .75) { frame = requestAnimationFrame(draw); return; }
    const delta = last ? Math.min((now - last) / 1000, .08) : 0;
    last = now; time += delta;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.translate(offsetX, offsetY); context.scale(scale, scale);
    context.globalCompositeOperation = 'screen';

    // Warm light only around the existing lamp and the surface below it.
    const light = .045 + Math.sin(time * 1.1) * .018 + Math.sin(time * .43) * .012;
    const glow = context.createRadialGradient(1185, 297, 8, 1185, 297, 210);
    glow.addColorStop(0, `rgba(255,186,91,${light})`); glow.addColorStop(1, 'rgba(255,186,91,0)');
    context.fillStyle = glow; context.fillRect(975, 87, 420, 420);

    context.save();
    context.beginPath();
    panes.forEach(pane => context.rect(pane.x, pane.y, pane.width, pane.height));
    context.clip();
    context.lineCap = 'round';
    for (let index = 0; index < drops.length; index++) {
      const drop = drops[index], pane = drop.pane;
      drop.y += drop.speed * delta;
      if (drop.y > pane.y + pane.height + drop.length) { drops[index] = newDrop(); continue; }
      const edge = Math.min(1, (drop.y - pane.y) / 18, (pane.y + pane.height - drop.y) / 28,
        (drop.x - pane.x) / 15, (pane.x + pane.width - drop.x) / 15);
      if (edge <= 0) continue;
      const x = drop.x + Math.sin(time * .6 + drop.wobble) * .8;
      context.strokeStyle = `rgba(177,208,202,${drop.alpha * edge})`;
      context.lineWidth = drop.width;
      context.beginPath(); context.moveTo(x, drop.y - drop.length); context.lineTo(x + .8, drop.y); context.stroke();
      context.fillStyle = `rgba(218,235,220,${drop.alpha * edge * .8})`;
      context.beginPath(); context.ellipse(x + .8, drop.y, drop.width * .8, drop.width * 1.7, 0, 0, Math.PI * 2); context.fill();
    }
    context.restore();
    // Vapour rises from the actual noodle bowl rim, drifting as it disperses.
    for (const puff of steam) {
      puff.age = (puff.age + delta / puff.life) % 1;
      const age = puff.age, size = 16 + age * 40;
      const x = 1091 + puff.spread + Math.sin(age * 7 + puff.phase + time * .4) * (5 + age * 12);
      const y = 534 - age * 146;
      context.globalAlpha = Math.sin(age * Math.PI) * .18;
      context.drawImage(vapour, x - size / 2, y - size / 2, size, size * 1.5);
    }
    context.globalAlpha = 1; context.globalCompositeOperation = 'source-over';
    frame = requestAnimationFrame(draw);
  }
  function sync() {
    if (!available()) { stop(); return; }
    if (!frame && resize()) {
      canvas.dataset.motionState = 'running';
      frame = requestAnimationFrame(draw);
    }
  }
  populate();
  if ('IntersectionObserver' in window) {
    const visibility = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; sync(); });
    visibility.observe(room);
  }
  if ('ResizeObserver' in window) {
    const sizing = new ResizeObserver(() => { if (available()) { resize(); sync(); } });
    sizing.observe(room);
  } else window.addEventListener('resize', () => { if (available()) { resize(); sync(); } });
  mobile.addEventListener('change', () => { populate(); stop(); sync(); });
  window.addEventListener('site:motion', sync);
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', sync);
  sync();
});
