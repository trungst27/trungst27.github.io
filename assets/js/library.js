document.addEventListener('DOMContentLoaded', async () => {
  'use strict';
  const player = window.MusicPlayer;
  const data = window.LibraryData;
  const list = document.getElementById('track-list');
  const search = document.getElementById('music-search');
  let filter = 'all', items = [], renderedCover = '', renderedQueue = '';
  let metadataSignature = '';
  const saved = data.read('teung.favorites', []);
  const favorites = new Set(Array.isArray(saved) ? saved.filter(id => typeof id === 'string') : []);
  const $ = id => document.getElementById(id);
  const icon = name => { const node = document.createElement('i'); node.className = name; node.setAttribute('aria-hidden', 'true'); return node; };
  const normalize = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  const time = seconds => !Number.isFinite(seconds) || seconds < 0 ? '—' : `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  const announce = text => { $('announcement').textContent = text; };
  function button(action, label, symbol, id, className = 'icon-button') {
    const node = document.createElement('button');
    node.type = 'button'; node.className = className;
    node.dataset.action = action; node.dataset.id = id;
    node.setAttribute('aria-label', label); node.title = label;
    if (symbol) node.append(icon(symbol));
    return node;
  }
  function visibleTracks() {
    const query = normalize(search.value.trim());
    return items.filter(track =>
      (!query || normalize(`${track.title} ${track.artist || ''}`).includes(query)) &&
      (filter === 'all' || (filter === 'favorites' ? favorites.has(track.id) : (track.moods || []).includes(filter)))
    );
  }
  function renderTracks() {
    const state = player.state();
    const focus = list.contains(document.activeElement) ? { id: document.activeElement.dataset.id, action: document.activeElement.dataset.action } : null;
    const shown = visibleTracks();
    $('track-count').textContent = `${shown.length} ${shown.length === 1 ? 'track' : 'tracks'}${shown.length !== items.length ? ` of ${items.length}` : ''}`;
    list.replaceChildren();
    list.setAttribute('aria-busy', 'false');
    if (!shown.length) {
      const empty = document.createElement('div'); empty.className = 'empty-state';
      const heading = document.createElement('h3');
      heading.textContent = search.value ? 'Nothing here just yet.' : filter === 'favorites' ? 'Keep your favorites close.' : filter === 'all' ? 'A quiet beginning.' : 'This mood is waiting for its music.';
      const explanation = document.createElement('p');
      explanation.textContent = search.value ? 'Try a different song or artist.' : filter === 'favorites' ? 'Tap the heart beside a track to save it on this browser.' : filter === 'all' ? 'Published tracks will appear here.' : 'Tracks appear here after Teung adds this mood in the library manager.';
      const reset = button('reset', 'Show all tracks', '', ''); reset.className = 'text-button'; reset.textContent = 'Show all tracks';
      empty.append(heading, explanation, reset); list.append(empty); return;
    }
    const fragment = document.createDocumentFragment();
    shown.forEach(track => {
      const current = state.current?.id === track.id;
      const row = document.createElement('article'); row.className = `track-row${current ? ' is-current' : ''}`; row.dataset.track = track.id;
      const play = button('play', `${current && state.playing ? 'Pause' : 'Play'} ${track.title}`, '', track.id, 'track-play');
      const artwork = document.createElement('span'); artwork.className = 'cover'; data.cover(artwork, track);
      const overlay = document.createElement('span'); overlay.className = 'track-play-overlay'; overlay.append(icon(current && state.playing ? 'fa-solid fa-pause' : 'fa-solid fa-play')); play.append(artwork, overlay);
      const copy = document.createElement('div'); copy.className = 'track-copy';
      const title = button('play', `Play ${track.title}`, '', track.id, 'track-title'); title.textContent = track.title;
      const artist = document.createElement('p'); artist.className = 'track-artist'; artist.textContent = track.artist || (track.source === 'soundcloud' ? 'SoundCloud' : 'Local audio');
      copy.append(title, artist);
      const actions = document.createElement('div'); actions.className = 'track-actions';
      const source = document.createElement('span'); source.className = `source-label ${track.source}`; source.textContent = track.source === 'soundcloud' ? 'SC' : 'FILE'; source.title = track.source === 'soundcloud' ? 'SoundCloud' : 'Audio file';
      const favorite = button('favorite', `${favorites.has(track.id) ? 'Remove' : 'Save'} ${track.title} ${favorites.has(track.id) ? 'from' : 'to'} favorites`, favorites.has(track.id) ? 'fa-solid fa-heart' : 'fa-regular fa-heart', track.id);
      favorite.setAttribute('aria-pressed', String(favorites.has(track.id)));
      const queue = button('queue', `Add ${track.title} to queue`, 'fa-solid fa-plus', track.id, 'icon-button queue-add');
      const length = document.createElement('span'); length.className = 'track-time'; length.textContent = time(track.duration); length.setAttribute('aria-label', track.duration ? `Duration ${time(track.duration)}` : 'Duration loads when played');
      actions.append(source, favorite, queue, length); row.append(play, copy, actions); fragment.append(row);
    });
    list.append(fragment);
    if (focus) [...list.querySelectorAll('button')].find(node => node.dataset.id === focus.id && node.dataset.action === focus.action)?.focus({ preventScroll: true });
  }
  function favorite(id, fromPlayer = false) {
    if (!id) return;
    if (favorites.has(id)) favorites.delete(id); else favorites.add(id);
    data.write('teung.favorites', [...favorites]);
    renderTracks(); syncPlayer(player.state());
    if (favorites.has(id)) {
      const rowHeart = [...list.querySelectorAll('[data-action="favorite"]')].find(button => button.dataset.id === id);
      const heart = fromPlayer ? $('player-favorite') : rowHeart;
      window.SiteMotion?.animate(heart?.firstElementChild, [
        { transform: 'scale(1)' }, { transform: 'scale(1.2)', offset: .35 }, { transform: 'scale(1)' }
      ], { duration: 280 });
    }
  }
  function syncProgress({ position, duration }) {
    $('elapsed-time').textContent = time(position);
    $('duration-time').textContent = time(duration);
    $('seek-slider').disabled = !duration;
    $('seek-slider').value = duration ? String(Math.min(1000, position / duration * 1000)) : '0';
    $('seek-slider').setAttribute('aria-valuetext', `${time(position)} of ${time(duration)}`);
  }
  function renderQueue(state) {
    const signature = JSON.stringify(state.queue.map(id => [id, items.find(track => track.id === id)?.title]));
    if (renderedQueue === signature) return;
    renderedQueue = signature;
    const queueList = $('queue-list'); queueList.replaceChildren();
    state.queue.forEach((id, index) => {
      const track = items.find(item => item.id === id); if (!track) return;
      const row = document.createElement('li'); row.className = 'queue-item';
      const play = button('play', `Play ${track.title}`, '', String(index)); play.textContent = track.title;
      const remove = button('remove', `Remove ${track.title} from queue`, 'fa-solid fa-xmark', String(index));
      row.append(play, remove); queueList.append(row);
    });
    if (!state.queue.length) { const empty = document.createElement('li'); empty.className = 'queue-empty'; empty.textContent = 'Add a track with the + button. Make this moment yours.'; queueList.append(empty); }
    $('clear-queue').disabled = !state.queue.length;
    $('queue-count').textContent = state.queue.length;
    $('queue-count').hidden = !state.queue.length;
  }
  function syncPlayer(state) {
    $('player-title').textContent = state.current?.title || 'Choose something to listen to';
    $('player-artist').textContent = state.loading ? 'Loading your track…' : state.current?.artist || (state.current?.source === 'soundcloud' ? 'SoundCloud' : 'Local audio');
    const key = `${state.current?.id}:${state.current?.cover_url}`;
    if (renderedCover !== key) { data.cover($('player-art'), state.current); renderedCover = key; }
    $('play-button').firstElementChild.className = state.loading ? 'fa-solid fa-circle-notch fa-spin' : state.playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    $('play-button').setAttribute('aria-label', state.playing ? 'Pause' : 'Play');
    $('play-button').disabled = !state.current;
    $('previous-button').disabled = !$('play-button') || !state.current;
    $('next-button').disabled = !state.current;
    $('player-favorite').disabled = !state.current;
    const liked = favorites.has(state.current?.id);
    $('player-favorite').setAttribute('aria-pressed', String(liked));
    $('player-favorite').setAttribute('aria-label', liked ? 'Remove current track from favorites' : 'Add current track to favorites');
    $('player-favorite').firstElementChild.className = liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    $('shuffle-button').setAttribute('aria-pressed', String(state.shuffle));
    $('repeat-button').setAttribute('aria-pressed', String(state.repeat !== 'off'));
    $('repeat-button').setAttribute('aria-label', `Repeat ${state.repeat}`);
    $('repeat-button').title = `Repeat ${state.repeat}`;
    $('repeat-one').hidden = state.repeat !== 'one';
    $('queue-shuffle').textContent = `Shuffle ${state.shuffle ? 'on' : 'off'}`;
    $('queue-shuffle').setAttribute('aria-pressed', String(state.shuffle));
    $('queue-repeat').textContent = `Repeat ${state.repeat}`;
    $('queue-repeat').setAttribute('aria-pressed', String(state.repeat !== 'off'));
    $('volume-slider').value = Math.round(state.volume * 100);
    $('volume-value').textContent = `${Math.round(state.volume * 100)}%`;
    $('mute-button').setAttribute('aria-label', state.volume ? 'Mute' : 'Unmute');
    $('mute-button').firstElementChild.className = state.volume ? state.volume > 0.5 ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-low' : 'fa-solid fa-volume-xmark';
    $('player-feedback').hidden = !state.message;
    $('player-message').textContent = state.message;
    document.title = state.playing && state.current ? `${state.current.title} · Teung’s Space` : 'Teung’s Space — stay for a while';
    renderQueue(state);
    syncProgress(state);
  }
  list.addEventListener('click', event => {
    const target = event.target.closest('button[data-action]'); if (!target) return;
    const { action, id } = target.dataset;
    if (action === 'play') { if (player.state().current?.id === id) player.toggle(); else player.select(id); }
    if (action === 'favorite') favorite(id);
    if (action === 'queue') { player.enqueue(id); announce('Added to your queue.'); }
    if (action === 'reset') { filter = 'all'; search.value = ''; updateFilters(); renderTracks(); }
  });
  function updateFilters() {
    document.querySelectorAll('[data-filter]').forEach(button => { const active = button.dataset.filter === filter; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)); });
  }
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { filter = button.dataset.filter; updateFilters(); renderTracks(); }));
  search.addEventListener('input', renderTracks);
  $('play-button').addEventListener('click', player.toggle);
  $('previous-button').addEventListener('click', player.previous);
  $('next-button').addEventListener('click', () => player.next());
  $('shuffle-button').addEventListener('click', player.toggleShuffle);
  $('repeat-button').addEventListener('click', player.cycleRepeat);
  $('queue-shuffle').addEventListener('click', player.toggleShuffle);
  $('queue-repeat').addEventListener('click', player.cycleRepeat);
  $('mute-button').addEventListener('click', player.mute);
  $('volume-slider').addEventListener('input', event => player.volume(event.target.value / 100));
  $('seek-slider').addEventListener('input', event => player.seek(event.target.value / 1000 * player.state().duration));
  $('player-favorite').addEventListener('click', () => favorite(player.state().current?.id, true));
  $('retry-button').addEventListener('click', player.retry);
  $('dismiss-player-message').addEventListener('click', player.dismissMessage);
  let queueOpen = false, queueRevision = 0;
  function queueVisibility(open) {
    const panel = $('queue-panel'), revision = ++queueRevision;
    queueOpen = open;
    $('queue-button').setAttribute('aria-expanded', String(open));
    panel.inert = !open;
    if (open) panel.hidden = false;
    (open ? $('close-queue') : $('queue-button')).focus({ preventScroll: true });
    const animation = window.SiteMotion?.animate(panel, open ? [
      { opacity: 0, transform: 'translateY(12px) scale(.98)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' }
    ] : [
      { opacity: 1, transform: 'translateY(0) scale(1)' },
      { opacity: 0, transform: 'translateY(6px) scale(.99)' }
    ], { duration: open ? 280 : 140 });
    const settle = () => { if (revision === queueRevision) panel.hidden = !open; };
    if (animation) animation.finished.then(settle, settle); else settle();
  }
  $('queue-button').addEventListener('click', () => queueVisibility(!queueOpen));
  $('close-queue').addEventListener('click', () => queueVisibility(false));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && queueOpen) queueVisibility(false); });
  $('clear-queue').addEventListener('click', player.clearQueue);
  $('queue-list').addEventListener('click', event => {
    const target = event.target.closest('button[data-action]'); if (!target) return;
    if (target.dataset.action === 'remove') player.dequeue(Number(target.dataset.id));
    else player.playQueued(Number(target.dataset.id));
  });
  window.addEventListener('music:state', event => {
    const state = event.detail;
    const signature = JSON.stringify(items.map(track => [track.id, track.title, track.artist, track.cover_url, track.duration]));
    if (metadataSignature !== signature) { metadataSignature = signature; renderTracks(); }
    // Keep the row DOM stable during transport/volume updates so pointer and
    // keyboard focus cannot jump to a different track while clicking.
    list.querySelectorAll('.track-row').forEach(row => {
      const active = row.dataset.track === state.current?.id;
      row.classList.toggle('is-current', active);
      const track = items.find(item => item.id === row.dataset.track);
      const play = row.querySelector('.track-play');
      play.setAttribute('aria-label', `${active && state.playing ? 'Pause' : 'Play'} ${track.title}`);
      play.querySelector('.track-play-overlay i').className = active && state.playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    });
    syncPlayer(state);
  });
  window.addEventListener('music:progress', event => syncProgress(event.detail));
  try {
    const result = await data.loadTracks(); items = result.tracks;
    $('library-origin').textContent = result.origin;
    if (result.notice) { $('library-notice').hidden = false; $('library-notice').textContent = result.notice; }
    player.init(items); renderTracks(); syncPlayer(player.state());
  } catch (error) {
    list.setAttribute('aria-busy', 'false'); list.replaceChildren();
    const notice = document.createElement('p'); notice.className = 'empty-state'; notice.textContent = error.message; list.append(notice);
    $('track-count').textContent = 'Music is temporarily unavailable';
  }
});
