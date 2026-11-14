// The intro is visual only: it never loads, selects, starts or stops audio.
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('vinyl-intro');
  const skip = document.getElementById('skip-intro');
  const replay = document.getElementById('replay-intro');
  const aperture = document.getElementById('portal-aperture');
  const record = document.getElementById('portal-record');
  const position = document.getElementById('portal-record-position');
  let running = false, pending = false, revision = 0;
  let sequence = [];
  const home = () => document.body.classList.contains('home-view');
  function stop() {
    const restoreFocus = document.activeElement === skip;
    ++revision; pending = false; running = false;
    sequence.forEach(animation => animation.cancel()); sequence = [];
    overlay.hidden = true; skip.hidden = true;
    document.body.classList.remove('intro-running');
    if (restoreFocus) replay.focus({ preventScroll: true });
  }
  function play() {
    stop();
    if (!home() || !window.SiteMotion?.enabled()) return;
    if (document.hidden) { pending = true; return; }
    const turn = revision;
    running = true; overlay.hidden = false; skip.hidden = false;
    document.body.classList.add('intro-running');
    const width = window.innerWidth, height = window.innerHeight;
    const radius = Math.hypot(width, height) / 2 + 8;
    const size = Math.min(width * .36, height * .27, 180) / 180;
    const expanded = radius / 150;
    position.setAttribute('transform', `translate(${width / 2} ${height / 2})`);
    aperture.setAttribute('cx', width / 2); aperture.setAttribute('cy', height / 2);
    function cue(target, frames, options) {
      const animation = window.SiteMotion.animate(target, frames, options);
      if (animation) sequence.push(animation);
      return animation;
    }
    // The centre hole opens through both the curtain and the record material.
    const opening = cue(aperture, [
      { r: '0px', offset: 0 }, { r: '0px', offset: .38, easing: 'cubic-bezier(.65,0,.2,1)' },
      { r: `${radius}px`, offset: 1 }
    ], { duration: 2200, easing: 'linear', fill: 'forwards' });
    cue(record, [
      { transform: `scale(${size * .64}) rotate(-70deg)`, opacity: 0, easing: 'cubic-bezier(.16,1,.3,1)' },
      { transform: `scale(${size}) rotate(0deg)`, opacity: 1, offset: .23 },
      { transform: `scale(${size}) rotate(105deg)`, opacity: 1, offset: .38, easing: 'cubic-bezier(.65,0,.2,1)' },
      { transform: `scale(${expanded}) rotate(255deg)`, opacity: 1 }
    ], { duration: 2200, easing: 'linear', fill: 'forwards' });
    cue(document.getElementById('portal-label'), [
      { opacity: 1 }, { opacity: 1, offset: .75 }, { opacity: 0 }
    ], { duration: 900, easing: 'linear', fill: 'forwards' });
    cue(overlay.querySelector('.portal-caption'), [
      { opacity: 0 }, { opacity: 1, offset: .25 }, { opacity: 1, offset: .7 }, { opacity: 0 }
    ], { duration: 1050, easing: 'linear', fill: 'forwards' });
    cue(document.querySelector('.home-backdrop'), [
      { transform: 'scale(1.12)', filter: 'brightness(.65)' },
      { transform: 'scale(1)', filter: 'brightness(1)' }
    ], { duration: 1900, delay: 500, fill: 'backwards' });
    cue(document.getElementById('home-title'), [
      { clipPath: 'inset(0 0 100% 0)', transform: 'translateY(24px)' },
      { clipPath: 'inset(0 0 0% 0)', transform: 'translateY(0)' }
    ], { duration: 850, delay: 1150, fill: 'backwards' });
    cue(document.getElementById('profile-picture'), [
      { transform: 'scale(.75) rotate(-18deg)', opacity: 0 },
      { transform: 'scale(1) rotate(0deg)', opacity: 1 }
    ], { duration: 850, delay: 1050, fill: 'backwards' });
    ['.profile-study', '.profile-details', '.links', '.discord-widget', '.ai-section'].forEach((selector, index) => {
      cue(document.querySelector(selector), [
        { opacity: 0, transform: 'translateY(14px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 650, delay: 1200 + Math.min(index, 4) * 90, fill: 'backwards' });
    });
    cue(document.getElementById('music-controls'), [
      { opacity: 0, translate: '0 24px' }, { opacity: 1, translate: '0 0' }
    ], { duration: 700, delay: 1550, fill: 'backwards' });
    // Wait for the last scene movement too; canceling always restores live CSS.
    if (!opening) { stop(); return; }
    Promise.all(sequence.map(animation => animation.finished)).then(
      () => { if (turn === revision) stop(); },
      () => { if (turn === revision) stop(); }
    );
  }
  replay.addEventListener('click', () => {
    window.SiteMotion?.enable();
    play();
  });
  skip.addEventListener('click', stop);
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && running) stop(); });
  document.addEventListener('pointerdown', event => {
    if (running && event.target.closest('a,button,input') && !event.target.closest('#replay-intro,#skip-intro')) stop();
  }, { passive: true });
  window.addEventListener('resize', () => { if (running) stop(); });
  window.addEventListener('pagehide', stop);
  window.addEventListener('site:motion', event => {
    replay.title = event.detail.enabled ? 'Replay intro' : 'Play intro (enables motion for this site)';
    replay.setAttribute('aria-label', replay.title);
    if (!event.detail.enabled) {
      if (running) stop();
    } else if (pending && home()) play();
  });
  window.VinylIntro = { play, stop };
});
