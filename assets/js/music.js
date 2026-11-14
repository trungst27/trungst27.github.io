(() => {
  'use strict';
  const audio = new Audio();
  audio.preload = 'metadata';
  audio.crossOrigin = 'anonymous';
  const savedVolume = Number(window.LibraryData.read('teung.volume', 0.5));
  audio.volume = Number.isFinite(savedVolume) ? Math.min(1, Math.max(0, savedVolume)) : 0.5;
  let tracks = [], current = null, queue = [], history = [];
  let playing = false, loading = false, desiredPlaying = false;
  let shuffle = false, repeat = 'off', position = 0, duration = 0;
  let epoch = 0, widget = null, activeFrame = null, widgetReady = false;
  let widgetScript = null, loadingPromise = null, message = '';
  let lastVolume = audio.volume || 0.5;
  let startRequested = false;

  function state() {
    return { tracks, current, queue: [...queue], playing, loading, shuffle, repeat, position, duration, volume: audio.volume, message };
  }
  function emit() { window.dispatchEvent(new CustomEvent('music:state', { detail: state() })); }
  function progress() { window.dispatchEvent(new CustomEvent('music:progress', { detail: { position, duration } })); }
  function fail(text) {
    desiredPlaying = false;
    audio.pause();
    widget?.pause();
    playing = false;
    loading = false;
    message = text;
    emit();
  }
  function stopSources() {
    audio.pause();
    if (widget) { try { widget.pause(); } catch { /* A removed iframe cannot keep playing. */ } }
    widget = null;
    widgetReady = false;
    activeFrame?.remove();
    activeFrame = null;
    const panel = document.getElementById('soundcloud-panel');
    if (panel) panel.hidden = true;
  }

  function loadWidgetScript() {
    if (window.SC?.Widget) return Promise.resolve();
    if (widgetScript) return widgetScript;
    widgetScript = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const timeout = setTimeout(() => { script.remove(); widgetScript = null; reject(new Error('timeout')); }, 15000);
      script.src = 'https://w.soundcloud.com/player/api.js';
      script.onload = () => {
        clearTimeout(timeout);
        if (window.SC?.Widget) resolve();
        else { widgetScript = null; reject(new Error('SoundCloud unavailable')); }
      };
      script.onerror = () => { clearTimeout(timeout); script.remove(); widgetScript = null; reject(new Error('SoundCloud unavailable')); };
      document.head.append(script);
    });
    return widgetScript;
  }

  async function loadSoundCloud(track, version) {
    const url = window.LibraryData.safeUrl(track.soundcloud_url, { soundcloud: true });
    if (!url) throw new Error('Invalid SoundCloud link');
    await loadWidgetScript();
    if (version !== epoch) return;
    const panel = document.getElementById('soundcloud-panel');
    const mount = document.getElementById('soundcloud-mount');
    const frame = document.createElement('iframe');
    frame.title = `SoundCloud: ${track.title}`;
    frame.allow = 'autoplay; encrypted-media';
    frame.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=false&color=%23a9bc83&show_artwork=true&show_user=true&single_active=true`;
    activeFrame = frame;
    panel.hidden = false;
    document.getElementById('soundcloud-link').href = url;
    mount.replaceChildren(frame);
    const player = window.SC.Widget(frame);
    widget = player;
    const active = () => version === epoch && frame === activeFrame;
    const configuredCover = track.cover_url || '';
    let soundIndex = null, soundCount = null, metadataVersion = 0;
    function refreshSound() {
      const revision = ++metadataVersion;
      const fresh = () => active() && revision === metadataVersion;
      player.getCurrentSoundIndex(index => {
        if (!fresh()) return;
        if (soundIndex !== null && soundIndex !== index) position = 0;
        soundIndex = index;
        player.getCurrentSound(sound => {
          if (!fresh() || !sound) return;
          if (sound.title) track.title = sound.title;
          if (sound.user?.username) track.artist = sound.user.username;
          track.cover_url = sound.artwork_url || configuredCover;
          emit();
        });
        player.getDuration(value => {
          if (!fresh()) return;
          duration = value / 1000;
          track.duration = duration;
          progress(); emit();
        });
      });
    }
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('SoundCloud is taking too long')), 20000);
      player.bind(window.SC.Widget.Events.ERROR, () => {
        clearTimeout(timeout);
        if (active()) fail('This SoundCloud track could not play. Try again or open it on SoundCloud.');
        reject(new Error('SoundCloud track unavailable'));
      });
      player.bind(window.SC.Widget.Events.READY, () => {
        clearTimeout(timeout);
        if (!active()) { resolve(); return; }
        widgetReady = true;
        player.setVolume(Math.round(audio.volume * 100));
        player.getSounds(sounds => { if (active()) soundCount = sounds.length; });
        refreshSound();
        resolve();
      });
    });
    if (!active()) return;
    player.bind(window.SC.Widget.Events.PLAY, () => {
      if (!active()) { player.pause(); return; }
      refreshSound();
      audio.pause(); desiredPlaying = true; playing = true; loading = false; message = ''; emit();
    });
    player.bind(window.SC.Widget.Events.PAUSE, () => {
      if (!active()) return;
      if (playing) desiredPlaying = false;
      playing = false; emit();
    });
    player.bind(window.SC.Widget.Events.PLAY_PROGRESS, event => {
      if (!active()) return;
      position = event.currentPosition / 1000;
      progress();
    });
    player.bind(window.SC.Widget.Events.FINISH, () => {
      if (!active()) return;
      // FINISH fires for every sound. Use the index captured during PLAY;
      // querying it here can already return the following playlist sound.
      if (soundCount === 1 || (soundCount > 1 && soundIndex === soundCount - 1)) next(true);
    });
    loading = false; emit();
    if (desiredPlaying) {
      player.play();
      // Autoplay can be refused by the embedded player even after a user gesture.
      setTimeout(() => {
        if (active() && desiredPlaying && !playing) {
          message = 'Press Play in the SoundCloud player to start this track.';
          emit();
        }
      }, 3500);
    }
  }

  async function select(id, autoplay = true, remember = true) {
    const track = tracks.find(item => item.id === id);
    if (!track) return;
    const version = ++epoch;
    if (current && remember && current.id !== id) history.push(current.id);
    stopSources();
    current = track; desiredPlaying = autoplay; playing = false;
    loading = true; message = ''; position = 0; duration = Number(track.duration) || 0;
    emit(); progress();
    window.LibraryData.write('teung.lastTrack', id);
    loadingPromise = (async () => {
      try {
        if (track.source === 'soundcloud') {
          await loadSoundCloud(track, version);
        } else {
          const url = await window.LibraryData.audioUrl(track);
          if (version !== epoch) return;
          if (!url) throw new Error('No audio file');
          audio.src = url;
          audio.load();
          loading = false;
          emit();
          if (desiredPlaying) await audio.play();
        }
      } catch (error) {
        if (version !== epoch) return;
        if (error.name === 'AbortError') return;
        fail(error.name === 'NotAllowedError' ? 'Your browser needs another tap. Press Play to start the music.' : track.source === 'soundcloud' ? 'SoundCloud could not load this track. Try again or use Open on SoundCloud.' : 'This audio file could not play. Try again or choose another track.');
      }
    })();
    await loadingPromise;
  }

  async function play() {
    desiredPlaying = true;
    if (!current && tracks.length) return select(tracks[0].id);
    if (!current) return;
    if (loading) return;
    if (message || (current.source === 'soundcloud' && !widgetReady)) return select(current.id);
    try {
      if (current.source === 'soundcloud') widget?.play();
      else await audio.play();
    } catch (error) {
      if (error.name !== 'AbortError') fail('Press Play again, or choose another track.');
    }
  }
  function pause() {
    desiredPlaying = false; audio.pause(); widget?.pause(); playing = false; emit();
  }
  function toggle() { if (playing || (loading && desiredPlaying)) pause(); else play(); }
  function next(ended = false) {
    if (!tracks.length) return;
    if (ended && repeat === 'one' && current) return select(current.id, true, false);
    while (queue.length) {
      const id = queue.shift();
      if (tracks.some(track => track.id === id)) return select(id);
    }
    const index = tracks.findIndex(track => track.id === current?.id);
    if (shuffle && tracks.length > 1) {
      const choices = tracks.filter(track => track.id !== current?.id);
      return select(choices[Math.floor(Math.random() * choices.length)].id);
    }
    if (ended && index >= tracks.length - 1 && repeat === 'off') { pause(); position = duration; progress(); return; }
    select(tracks[(index + 1) % tracks.length].id);
  }
  function previous() {
    if (position > 3) return seek(0);
    const old = history.pop();
    const index = tracks.findIndex(track => track.id === current?.id);
    select(old || tracks[(index - 1 + tracks.length) % tracks.length]?.id, true, false);
  }
  function playQueued(index) {
    if (!Number.isInteger(index) || index < 0 || index >= queue.length) return;
    const [id] = queue.splice(index, 1);
    select(id);
  }
  function seek(seconds) {
    if (!current || !Number.isFinite(seconds) || !duration) return;
    position = Math.max(0, Math.min(duration, seconds));
    if (current.source === 'soundcloud') { if (widgetReady) widget.seekTo(position * 1000); }
    else audio.currentTime = position;
    progress();
  }
  function volume(value) {
    value = Number(value);
    if (!Number.isFinite(value)) return;
    audio.volume = Math.max(0, Math.min(1, value));
    if (audio.volume > 0) lastVolume = audio.volume;
    if (widgetReady) widget.setVolume(Math.round(audio.volume * 100));
    window.LibraryData.write('teung.volume', audio.volume); emit();
  }
  function init(items) {
    tracks = items.filter(track => track && track.id && track.title && ['file', 'soundcloud'].includes(track.source));
    queue = queue.filter(id => tracks.some(track => track.id === id));
    const last = window.LibraryData.read('teung.lastTrack', null);
    const first = tracks.find(track => track.id === last) || tracks[0];
    if (first && !current) select(first.id, startRequested, false);
    else emit();
  }
  function start() {
    if (startRequested) return;
    startRequested = true;
    if (current) play();
  }
  audio.addEventListener('play', () => {
    if (current?.source !== 'file' || !desiredPlaying) { audio.pause(); return; }
    widget?.pause(); playing = true; loading = false; message = ''; emit();
  });
  audio.addEventListener('pause', () => { if (current?.source === 'file') { playing = false; emit(); } });
  audio.addEventListener('loadedmetadata', () => {
    if (current?.source !== 'file') return;
    duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    current.duration = duration; emit(); progress();
  });
  audio.addEventListener('timeupdate', () => { if (current?.source === 'file') { position = audio.currentTime; progress(); } });
  audio.addEventListener('ended', () => { if (current?.source === 'file') next(true); });
  audio.addEventListener('error', () => { if (current?.source === 'file') fail('The audio file is unavailable. Try again or select another track.'); });
  document.addEventListener('keydown', event => {
    if (event.code !== 'Space' || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target.closest('input,textarea,select,button,a,[contenteditable]') || document.getElementById('site-shell')?.hidden) return;
    event.preventDefault(); toggle();
  });
  window.MusicPlayer = {
    init, start, play, pause, toggle, select, playQueued, next, previous, seek, volume, state,
    getAudio: () => audio,
    mute: () => volume(audio.volume ? 0 : lastVolume),
    toggleShuffle: () => { shuffle = !shuffle; emit(); },
    cycleRepeat: () => { repeat = { off: 'all', all: 'one', one: 'off' }[repeat]; emit(); },
    enqueue: id => { if (tracks.some(track => track.id === id)) { queue.push(id); emit(); } },
    dequeue: index => { queue.splice(index, 1); emit(); },
    clearQueue: () => { queue = []; emit(); },
    retry: () => current && select(current.id),
    dismissMessage: () => { message = ''; emit(); }
  };
})();
