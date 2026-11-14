(() => {
  'use strict';
  const config = window.TEUNG_CONFIG || {};
  const base = String(config.supabaseUrl || '').replace(/\/$/, '');
  const key = String(config.supabasePublishableKey || '');
  let unsafeKey = key.startsWith('sb_secret_');
  if (key.startsWith('eyJ')) {
    try { unsafeKey = JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).role === 'service_role'; } catch { unsafeKey = true; }
  }
  const configured = /^https:\/\/[^/]+$/.test(base) && Boolean(key) && !unsafeKey;

  function safeUrl(value, { soundcloud = false } = {}) {
    if (!value) return '';
    try {
      const url = new URL(value, document.baseURI);
      if (!['https:', 'http:'].includes(url.protocol)) return '';
      if (soundcloud && !(url.protocol === 'https:' && ['soundcloud.com', 'www.soundcloud.com'].includes(url.hostname))) return '';
      return url.href;
    } catch { return ''; }
  }

  async function request(path, { token, method = 'GET', body, headers = {} } = {}) {
    if (!configured) throw new Error('Connect Supabase first. Follow the setup guide.');
    const authHeaders = { apikey: key };
    // Publishable keys are not JWTs. Only sessions and legacy anon JWTs go here.
    if (token || key.startsWith('eyJ')) authHeaders.Authorization = `Bearer ${token || key}`;
    const response = await fetch(`${base}${path}`, {
      method,
      headers: { ...authHeaders, ...(body && !(body instanceof Blob) ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: body instanceof Blob ? body : body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(60000)
    });
    const payload = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.msg || payload?.message || payload?.error_description || payload?.error || `Request failed (${response.status}).`);
    return payload;
  }

  async function bundledTracks() {
    const response = await fetch('./assets/data/tracks.json', { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('The music list could not load. Refresh to try again.');
    return response.json();
  }

  async function loadTracks() {
    if (!configured) return { tracks: await bundledTracks(), origin: 'Personal collection', notice: '' };
    try {
      const tracks = await request('/rest/v1/music_tracks?select=*&published=eq.true&order=position.asc,created_at.asc');
      return { tracks, origin: 'Cloud library', notice: '' };
    } catch {
      return { tracks: await bundledTracks(), origin: 'Bundled collection', notice: 'The cloud library is unavailable. You can still listen to the bundled collection.' };
    }
  }

  async function audioUrl(track, token) {
    if (track.audio_path) {
      const path = track.audio_path.split('/').map(encodeURIComponent).join('/');
      const result = await request(`/storage/v1/object/sign/music-audio/${path}`, { method: 'POST', token, body: { expiresIn: 3600 } });
      return safeUrl(`${base}/storage/v1${result.signedURL}`);
    }
    return safeUrl(track.audio_url);
  }

  function read(keyName, fallback) {
    try { return JSON.parse(localStorage.getItem(keyName)) ?? fallback; } catch { return fallback; }
  }
  function write(keyName, value) {
    try { localStorage.setItem(keyName, JSON.stringify(value)); } catch { /* Playback also works without storage. */ }
  }

  function cover(element, track) {
    element.replaceChildren();
    element.classList.toggle('is-soundcloud', track?.source === 'soundcloud');
    const icon = document.createElement('i');
    icon.className = track?.source === 'soundcloud' ? 'fa-brands fa-soundcloud' : 'fa-solid fa-record-vinyl';
    icon.setAttribute('aria-hidden', 'true');
    element.append(icon);
    const url = safeUrl(track?.cover_url);
    if (url) {
      const image = new Image();
      image.alt = '';
      image.loading = 'lazy';
      image.referrerPolicy = 'no-referrer';
      image.src = url;
      image.addEventListener('error', () => image.remove(), { once: true });
      element.append(image);
    }
  }

  window.LibraryData = { configured, base, request, loadTracks, bundledTracks, audioUrl, safeUrl, read, write, cover };
})();
