document.addEventListener('DOMContentLoaded', () => {
  const entry = document.getElementById('terminal');
  const shell = document.getElementById('site-shell');
  const video = document.getElementById('myVideo');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const backgroundButton = document.getElementById('background-toggle');
  const glassButton = document.getElementById('glass-button');
  const reducedTransparency = matchMedia('(prefers-reduced-transparency: reduce)');
  let glassPreference = window.LibraryData.read('teung.glassPlayer', null);
  function updateGlass() {
    const enabled = typeof glassPreference === 'boolean' ? glassPreference : !reducedTransparency.matches;
    document.body.classList.toggle('glass-player', enabled);
    const label = enabled ? 'Disable glass effect' : 'Enable glass effect';
    glassButton.setAttribute('aria-pressed', String(enabled));
    glassButton.setAttribute('aria-label', label);
    glassButton.title = label;
  }
  glassButton.addEventListener('click', () => {
    glassPreference = !document.body.classList.contains('glass-player');
    window.LibraryData.write('teung.glassPlayer', glassPreference);
    updateGlass();
  });
  reducedTransparency.addEventListener('change', updateGlass);
  updateGlass();
  const skip = document.querySelector('.skip-link');
  const library = document.getElementById('library');
  const libraryToggle = document.getElementById('library-toggle');
  const homeChoose = document.getElementById('home-choose-music');
  let libraryTrigger = libraryToggle;
  function setLibrary(open, { focus = true, trigger = libraryToggle } = {}) {
    if (open) {
      window.VinylIntro?.stop();
      if (document.getElementById('queue-button').getAttribute('aria-expanded') === 'true') document.getElementById('close-queue').click();
    }
    library.hidden = !open;
    libraryToggle.setAttribute('aria-expanded', String(open));
    homeChoose.setAttribute('aria-expanded', String(open));
    if (open) libraryTrigger = trigger;
    if (focus) (open ? document.getElementById('music-search') : libraryTrigger).focus({ preventScroll: true });
  }
  libraryToggle.addEventListener('click', () => setLibrary(library.hidden));
  homeChoose.addEventListener('click', () => setLibrary(library.hidden, { trigger: homeChoose }));
  document.getElementById('close-library').addEventListener('click', () => setLibrary(false));
  document.getElementById('queue-button').addEventListener('click', () => setLibrary(false, { focus: false }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !library.hidden) setLibrary(false);
  });
  document.addEventListener('pointerdown', event => {
    if (!library.hidden && !event.target.closest('.listening-room,#home-choose-music')) setLibrary(false, { focus: false });
  });
  let entered = false;
  let motionPreference = window.LibraryData.read('teung.motion', null);
  const animations = new Map();
  const motionEnabled = () => typeof motionPreference === 'boolean' ? motionPreference : !reduced.matches;
  // One animation per element: a repeated action replaces its previous feedback.
  function animate(element, frames, options = {}) {
    if (!element || !entered || !motionEnabled() || document.hidden || !element.animate) return null;
    animations.get(element)?.cancel();
    const animation = element.animate(frames, { duration: 260, easing: 'cubic-bezier(0.16,1,0.3,1)', ...options });
    animations.set(element, animation);
    const cleanup = () => { if (animations.get(element) === animation) animations.delete(element); };
    animation.finished.then(cleanup, cleanup);
    return animation;
  }
  window.SiteMotion = {
    enabled: motionEnabled, animate,
    enable() {
      motionPreference = true;
      window.LibraryData.write('teung.motion', true);
      updateBackground();
    }
  };
  function updateBackground() {
    const enabled = motionEnabled();
    const paused = !enabled || document.hidden || !entered;
    document.body.classList.toggle('motion-enabled', enabled);
    document.body.classList.toggle('motion-paused', !enabled);
    document.body.classList.toggle('ambient-paused', paused);
    if (paused) {
      animations.forEach(animation => animation.cancel());
      animations.clear();
    }
    video.pause(); // Home always uses the live room scene.
    const label = enabled ? 'Pause motion' : 'Enable motion';
    backgroundButton.setAttribute('aria-pressed', String(enabled));
    backgroundButton.setAttribute('aria-label', label);
    backgroundButton.title = !enabled && reduced.matches ? 'Enable motion for this site (system prefers reduced motion)' : label;
    backgroundButton.firstElementChild.className = enabled ? 'fa-solid fa-pause' : 'fa-solid fa-wand-magic-sparkles';
    window.dispatchEvent(new CustomEvent('site:motion', { detail: { enabled: enabled && !document.hidden } }));
  }
  function followAnchor() {
    // Old Music links still reach the collection, now on the same Home page.
    const id = location.hash === '#music' ? 'library' : location.hash.slice(1);
    const target = ['library', 'music-controls', 'home', 'home-title'].includes(id)
      ? document.getElementById(id === 'home' ? 'home-title' : id) : null;
    if (!target) return false;
    window.VinylIntro?.stop();
    if (id === 'library') { setLibrary(true); return true; }
    if (id !== 'music-controls') target.scrollIntoView({ block: 'start', behavior: 'instant' });
    target.focus({ preventScroll: true });
    return true;
  }
  function enter({ autoplay = true } = {}) {
    if (entered) return;
    entered = true;
    entry.hidden = true; shell.hidden = false;
    if (autoplay) window.MusicPlayer.start();
    updateBackground();
    if (!location.hash || location.hash === '#home') {
      window.VinylIntro?.play();
      document.getElementById('home-title').focus({ preventScroll: true });
    } else followAnchor();
  }
  video.pause();
  document.getElementById('close-button').addEventListener('click', enter);
  document.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !entered && !event.target.closest('button')) enter();
  });
  backgroundButton.addEventListener('click', () => {
    motionPreference = !motionEnabled();
    window.LibraryData.write('teung.motion', motionPreference);
    updateBackground();
    if (motionPreference) window.VinylIntro?.play();
  });
  let previousPlaying = false, previousTrack;
  window.addEventListener('music:state', event => {
    const playing = Boolean(event.detail.playing);
    document.body.classList.toggle('is-playing', playing);
    if (playing !== previousPlaying) animate(document.querySelector('#play-button i'), [
      { transform: 'scale(.72)', opacity: .65 }, { transform: 'scale(1)', opacity: 1 }
    ], { duration: 180 });
    const track = event.detail.current?.id;
    if (previousTrack && track && track !== previousTrack) animate(document.querySelector('.now-playing-text'), [
      { opacity: .45 }, { opacity: 1 }
    ], { duration: 220 });
    previousPlaying = playing; previousTrack = track;
  });
  document.addEventListener('visibilitychange', updateBackground);
  reduced.addEventListener('change', updateBackground);
  window.addEventListener('hashchange', () => { if (entered) followAnchor(); });
  skip.href = '#music-controls'; skip.textContent = 'Skip to player';
  updateBackground();
  // Local visual previews can open the layout without starting another audio
  // source. This flag has no effect on the public domain or administrator auth.
  if (['127.0.0.1', 'localhost'].includes(location.hostname) && new URLSearchParams(location.search).get('preview') === '1') enter({ autoplay: false });
});
