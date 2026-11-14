// Only local audio can be analysed. SoundCloud owns its cross-origin audio.
document.addEventListener('DOMContentLoaded', () => {
  const audio = window.MusicPlayer?.getAudio();
  const portrait = document.getElementById('profile-picture');
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!audio || !portrait || !AudioContextClass) return;
  const enabled = () => window.SiteMotion?.enabled() && !document.hidden;
  let context, analyser, values, frame;
  function stop() {
    cancelAnimationFrame(frame); frame = null;
    portrait.style.borderColor = '';
  }
  function draw() {
    if (audio.paused || !enabled()) { stop(); return; }
    analyser.getByteFrequencyData(values);
    const energy = values.slice(0, 12).reduce((sum, value) => sum + value, 0) / (12 * 255);
    portrait.style.borderColor = `rgba(195,209,158,${0.4 + energy * 0.6})`;
    frame = requestAnimationFrame(draw);
  }
  async function start() {
    if (!enabled() || audio.paused) { stop(); return; }
    try {
      if (!context) {
        context = new AudioContextClass();
        analyser = context.createAnalyser(); analyser.fftSize = 256;
        values = new Uint8Array(analyser.frequencyBinCount);
        context.createMediaElementSource(audio).connect(analyser);
        analyser.connect(context.destination);
      }
      await context.resume();
      if (enabled() && !audio.paused && !frame) draw();
    } catch { stop(); }
  }
  audio.addEventListener('play', start);
  audio.addEventListener('pause', stop);
  window.addEventListener('site:motion', () => { if (enabled() && !audio.paused) start(); else stop(); });
});
