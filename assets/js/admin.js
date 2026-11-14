document.addEventListener('DOMContentLoaded', async () => {
  'use strict';
  const data = window.LibraryData;
  const $ = id => document.getElementById(id);
  let session = null, authorized = false, tracks = [], editing = null;
  let previewed = false, previewUrl = '', busy = false, previewVersion = 0;
  const storedSession = 'teung.admin.session';
  const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'flac'];
  function message(text, error = false) {
    $('admin-message').textContent = text;
    $('admin-message').hidden = !text;
    $('admin-message').classList.toggle('error', error);
  }
  function rememberSession(value) {
    session = value;
    try { if (value) sessionStorage.setItem(storedSession, JSON.stringify(value)); else sessionStorage.removeItem(storedSession); } catch { /* Session can remain in memory. */ }
  }
  async function token() {
    if (!session) throw new Error('Sign in to save changes.');
    if (session.expires_at * 1000 < Date.now() + 60000) {
      try {
        const renewed = await data.request('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: session.refresh_token } });
        rememberSession({ ...renewed, expires_at: Math.floor(Date.now() / 1000) + renewed.expires_in });
      } catch {
        authorized = false; rememberSession(null); updateAccess();
        throw new Error('Your session expired. Sign in again; your editor inputs are still here.');
      }
    }
    return session.access_token;
  }
  function updateAccess() {
    $('track-form').querySelectorAll('input,select').forEach(input => { input.disabled = busy; });
    $('setup-panel').hidden = data.configured;
    $('login-panel').hidden = authorized || !data.configured;
    $('login-button').disabled = !data.configured || busy;
    $('logout-button').hidden = !authorized;
    $('save-button').disabled = !authorized || busy;
    $('publish-button').disabled = !authorized || !previewed || busy;
    $('preview-button').disabled = busy;
    $('new-track').disabled = busy;
    $('refresh-tracks').disabled = busy;
    $('editor-hint').textContent = !data.configured ? 'Preview works here. Connect Supabase to save and publish your tracks.' : !authorized ? 'Sign in to save drafts and publish. You can preview a local file before signing in.' : previewed ? 'Preview is ready. Save changes or publish to your public library.' : 'Preview before publishing. Drafts stay out of the public library.';
  }
  function stopPreview() {
    previewVersion++;
    $('preview-content').querySelector('audio')?.pause();
    $('preview-content').replaceChildren();
    if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = ''; }
    $('admin-preview').hidden = true;
  }
  function invalidatePreview() { previewed = false; stopPreview(); updateAccess(); }
  function sourceFields() {
    const isFile = $('track-source').value === 'file';
    $('file-fields').hidden = !isFile;
    $('soundcloud-fields').hidden = isFile;
  }
  function reset() {
    editing = null; previewed = false; stopPreview(); $('track-form').reset();
    $('existing-audio').hidden = true;
    $('editor-heading').textContent = 'Add a little music.';
    $('editor-context').textContent = 'Choose a file or bring a SoundCloud link.';
    $('save-button').textContent = 'Save draft';
    sourceFields(); updateAccess();
  }
  function edit(track) {
    reset(); editing = track;
    $('track-source').value = track.source;
    $('track-title').value = track.title;
    $('track-artist').value = track.artist || '';
    $('soundcloud-url').value = track.soundcloud_url || '';
    document.querySelectorAll('[name=mood]').forEach(input => { input.checked = (track.moods || []).includes(input.value); });
    $('editor-heading').textContent = 'Make it yours.';
    $('editor-context').textContent = authorized ? track.published ? 'Editing a published track.' : 'Editing a draft.' : 'Previewing a bundled track. Sign in after setup to save changes.';
    $('save-button').textContent = track.published ? 'Save changes' : 'Save draft';
    if (track.source === 'file') {
      $('existing-audio').hidden = false;
      $('existing-audio').textContent = 'An audio file is already attached. Choose a new file only to replace it.';
    }
    sourceFields(); updateAccess(); $('track-title').focus({ preventScroll: true });
  }
  function iconButton(label, symbol, action, id) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'icon-button';
    button.setAttribute('aria-label', label); button.title = label; button.dataset.action = action; button.dataset.id = id;
    const icon = document.createElement('i'); icon.className = symbol; icon.setAttribute('aria-hidden', 'true'); button.append(icon); return button;
  }
  function renderTracks() {
    const list = $('admin-tracks'); list.replaceChildren();
    $('admin-list-context').textContent = authorized ? `${tracks.length} tracks · drafts and published` : `${tracks.length} bundled tracks · preview only`;
    if (!tracks.length) { const empty = document.createElement('p'); empty.className = 'empty-state'; empty.textContent = 'Your collection starts with the first track.'; list.append(empty); }
    tracks.forEach((track, index) => {
      const row = document.createElement('article'); row.className = 'managed-track';
      const title = document.createElement('h3'); title.className = 'managed-track-title'; title.textContent = track.title;
      const meta = document.createElement('p'); meta.className = 'managed-track-meta'; meta.textContent = `${track.source === 'file' ? 'Audio file' : 'SoundCloud'}${track.artist ? ` · ${track.artist}` : ''}`;
      const actions = document.createElement('div'); actions.className = 'managed-track-actions';
      const status = document.createElement('span'); status.className = `track-status${track.published ? '' : ' draft'}`; status.textContent = track.published ? 'Published' : 'Draft';
      const editButton = document.createElement('button'); editButton.type = 'button'; editButton.className = 'text-button'; editButton.dataset.action = 'edit'; editButton.dataset.id = track.id; editButton.textContent = authorized ? 'Edit / preview' : 'Preview';
      actions.append(status, editButton);
      if (authorized) {
        if (track.published) { const hide = document.createElement('button'); hide.type = 'button'; hide.className = 'text-button'; hide.dataset.action = 'hide'; hide.dataset.id = track.id; hide.textContent = 'Hide'; actions.append(hide); }
        const up = iconButton(`Move ${track.title} up`, 'fa-solid fa-arrow-up', 'up', track.id);
        const down = iconButton(`Move ${track.title} down`, 'fa-solid fa-arrow-down', 'down', track.id);
        up.disabled = index === 0 || busy; down.disabled = index === tracks.length - 1 || busy;
        actions.append(up, down);
      }
      row.append(title, meta, actions); list.append(row);
    });
  }
  async function refresh() {
    if (authorized) tracks = await data.request('/rest/v1/music_tracks?select=*&order=position.asc,created_at.asc', { token: await token() });
    else tracks = await data.bundledTracks();
    renderTracks();
  }
  function validateFile(file, cover = false) {
    if (!file) return;
    const extension = file.name.split('.').pop().toLowerCase();
    if (cover ? !['jpg', 'jpeg', 'png', 'webp'].includes(extension) || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) : !audioExtensions.includes(extension)) throw new Error(cover ? 'Choose a JPG, PNG or WebP cover image.' : 'Choose an MP3, WAV, OGG, M4A or FLAC audio file.');
    if (file.size > (cover ? 5 : 50) * 1024 * 1024) throw new Error(cover ? 'Cover images must be 5 MB or smaller.' : 'Audio files must be 50 MB or smaller.');
  }
  function validate() {
    if (!$('track-form').reportValidity()) return false;
    if ($('track-source').value === 'soundcloud') {
      if (!data.safeUrl($('soundcloud-url').value.trim(), { soundcloud: true })) throw new Error('Enter a full https://soundcloud.com/ track or playlist link.');
    } else {
      const file = $('audio-file').files[0]; validateFile(file);
      if (!file && !(editing?.source === 'file' && (editing.audio_path || editing.audio_url))) throw new Error('Choose an audio file first.');
    }
    validateFile($('cover-file').files[0], true);
    return true;
  }
  async function preview() {
    let version;
    try {
      if (!validate()) return;
      stopPreview(); previewed = false; updateAccess(); message('');
      version = previewVersion;
      if ($('track-source').value === 'soundcloud') {
        const frame = document.createElement('iframe'); frame.title = 'SoundCloud preview'; frame.allow = 'autoplay; encrypted-media';
        frame.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent($('soundcloud-url').value.trim())}&auto_play=false&show_artwork=true`;
        $('preview-content').append(frame);
      } else {
        const file = $('audio-file').files[0];
        const url = file ? (previewUrl = URL.createObjectURL(file)) : await data.audioUrl(editing, authorized ? await token() : undefined);
        if (version !== previewVersion) return;
        const audio = document.createElement('audio'); audio.controls = true; audio.preload = 'metadata'; audio.volume = 0.5; audio.src = url;
        audio.addEventListener('error', () => { if (version === previewVersion) { previewed = false; updateAccess(); message('This file could not play in your browser. Check the file before publishing.', true); } });
        $('preview-content').append(audio);
      }
      $('admin-preview').hidden = false; previewed = true; updateAccess();
      $('admin-preview').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (error) { if (version === undefined || version === previewVersion) message(error.message, true); }
  }
  async function upload(bucket, path, file, accessToken) {
    $('upload-status').hidden = false;
    $('upload-progress').value = 0;
    $('upload-detail').textContent = `Uploading ${file.name}`;
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open('POST', `${data.base}/storage/v1/object/${bucket}/${path}`);
      request.timeout = 180000;
      request.setRequestHeader('apikey', window.TEUNG_CONFIG.supabasePublishableKey);
      request.setRequestHeader('Authorization', `Bearer ${accessToken}`);
      const types = { mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav', ogg: 'audio/ogg', flac: 'audio/flac' };
      request.setRequestHeader('Content-Type', file.type || types[file.name.split('.').pop().toLowerCase()] || 'application/octet-stream');
      request.setRequestHeader('x-upsert', 'false');
      request.upload.onprogress = event => { if (event.lengthComputable) { $('upload-progress').value = event.loaded / event.total * 100; $('upload-detail').textContent = `${file.name} · ${Math.round(event.loaded / event.total * 100)}%`; } };
      request.onload = () => request.status >= 200 && request.status < 300 ? resolve() : reject(new Error(`Upload failed (${request.status}). Check your storage policies and retry.`));
      request.onerror = () => reject(new Error('Upload interrupted. Check your connection and retry.'));
      request.ontimeout = () => reject(new Error('Upload timed out. Retry on a faster connection or use a smaller file.'));
      request.send(file);
    });
  }
  async function save(intent) {
    if (busy) return;
    const uploaded = [];
    let committed = false;
    try {
      if (!authorized) throw new Error('Connect Supabase and sign in before saving.');
      if (!validate()) return;
      if (intent === 'publish' && !previewed) throw new Error('Preview this track before publishing.');
      busy = true; updateAccess(); message('');
      const accessToken = await token();
      const id = editing?.id || crypto.randomUUID();
      const source = $('track-source').value;
      const record = {
        id, title: $('track-title').value.trim(), artist: $('track-artist').value.trim(), source,
        moods: [...document.querySelectorAll('[name=mood]:checked')].map(input => input.value),
        cover_url: editing?.cover_url || '',
        audio_url: source === 'file' && editing?.source === 'file' ? editing.audio_url || null : null,
        audio_path: source === 'file' && editing?.source === 'file' ? editing.audio_path || null : null,
        soundcloud_url: source === 'soundcloud' ? $('soundcloud-url').value.trim() : null,
        position: editing?.position ?? Math.max(-1, ...tracks.map(track => track.position)) + 1,
        published: intent === 'publish' || Boolean(editing?.published)
      };
      if (!record.title) throw new Error('Enter a track title.');
      const file = source === 'file' ? $('audio-file').files[0] : null;
      if (file) {
        const path = `${id}/${crypto.randomUUID()}.${file.name.split('.').pop().toLowerCase()}`;
        await upload('music-audio', path, file, accessToken); uploaded.push(['music-audio', path]);
        record.audio_path = path; record.audio_url = null; record.duration = null;
      }
      const cover = $('cover-file').files[0];
      if (cover) {
        const path = `${id}/${crypto.randomUUID()}.${cover.name.split('.').pop().toLowerCase()}`;
        await upload('music-covers', path, cover, accessToken); uploaded.push(['music-covers', path]);
        record.cover_url = `${data.base}/storage/v1/object/public/music-covers/${path}`;
      }
      const result = await data.request(editing ? `/rest/v1/music_tracks?id=eq.${encodeURIComponent(id)}` : '/rest/v1/music_tracks', {
        method: editing ? 'PATCH' : 'POST', token: accessToken, body: record, headers: { Prefer: 'return=representation' }
      });
      if (!result?.length) throw new Error('No track was saved. Check your administrator access.');
      committed = true;
      await refresh(); edit(result[0]);
      message(record.published ? 'Published. The public library will load this update on refresh.' : 'Draft saved. It is visible only to administrators.');
    } catch (error) {
      message(error.message, true);
      if (!committed && uploaded.length && session) {
        for (const [bucket, path] of uploaded) {
          await data.request(`/storage/v1/object/${bucket}`, { method: 'DELETE', token: session.access_token, body: { prefixes: [path] } }).catch(() => {});
        }
      }
    } finally { busy = false; $('upload-status').hidden = true; updateAccess(); renderTracks(); }
  }
  async function signIn(event) {
    event.preventDefault(); if (busy) return;
    try {
      busy = true; updateAccess(); message('Signing in…');
      const result = await data.request('/auth/v1/token?grant_type=password', { method: 'POST', body: { email: $('admin-email').value.trim(), password: $('admin-password').value } });
      rememberSession({ ...result, expires_at: Math.floor(Date.now() / 1000) + result.expires_in });
      const allowed = await data.request('/rest/v1/rpc/is_music_admin', { method: 'POST', token: result.access_token, body: {} });
      if (!allowed) { rememberSession(null); throw new Error('This account is not a library administrator. Add its user ID in music_admins.'); }
      authorized = true; $('admin-password').value = ''; await refresh(); reset(); message('Welcome back. Your collection is ready.');
    } catch (error) { message(error.message, true); }
    finally { busy = false; updateAccess(); }
  }
  $('login-form').addEventListener('submit', signIn);
  $('logout-button').addEventListener('click', async () => {
    if (busy) return;
    if (session) await data.request('/auth/v1/logout', { method: 'POST', token: session.access_token }).catch(() => {});
    authorized = false; rememberSession(null); reset(); await refresh(); updateAccess(); message('Signed out.');
  });
  $('track-source').addEventListener('change', () => { invalidatePreview(); sourceFields(); });
  $('track-form').addEventListener('input', invalidatePreview);
  $('audio-file').addEventListener('change', () => { if (!$('track-title').value && $('audio-file').files[0]) $('track-title').value = $('audio-file').files[0].name.replace(/\.[^.]+$/, ''); });
  $('preview-button').addEventListener('click', preview);
  $('new-track').addEventListener('click', reset);
  $('track-form').addEventListener('submit', event => { event.preventDefault(); save(event.submitter?.dataset.intent || 'save'); });
  $('refresh-tracks').addEventListener('click', () => refresh().catch(error => message(error.message, true)));
  $('admin-tracks').addEventListener('click', async event => {
    const button = event.target.closest('button[data-action]'); if (!button || busy) return;
    const track = tracks.find(item => item.id === button.dataset.id); if (!track) return;
    if (button.dataset.action === 'edit') { edit(track); return; }
    if (!authorized) return;
    try {
      busy = true; updateAccess();
      if (button.dataset.action === 'hide') {
        await data.request(`/rest/v1/music_tracks?id=eq.${track.id}`, { method: 'PATCH', token: await token(), body: { published: false } });
        if (editing?.id === track.id) editing.published = false;
        message('Track hidden. It remains in your drafts.');
      } else {
        const ids = tracks.map(item => item.id), index = ids.indexOf(track.id);
        const next = index + (button.dataset.action === 'up' ? -1 : 1);
        if (next < 0 || next >= ids.length) return;
        [ids[index], ids[next]] = [ids[next], ids[index]];
        await data.request('/rest/v1/rpc/set_music_order', { method: 'POST', token: await token(), body: { track_ids: ids } });
        message('Library order updated.');
      }
      await refresh();
    } catch (error) { message(error.message, true); }
    finally { busy = false; updateAccess(); renderTracks(); }
  });
  window.addEventListener('pagehide', stopPreview);
  updateAccess(); sourceFields();
  if (data.configured) {
    try {
      const stored = sessionStorage.getItem(storedSession); if (stored) session = JSON.parse(stored);
      if (session) {
        const allowed = await data.request('/rest/v1/rpc/is_music_admin', { method: 'POST', token: await token(), body: {} });
        if (!allowed) throw new Error('Administrator access is not configured for this account.');
        authorized = true;
      }
    } catch (error) { rememberSession(null); message(error.message, true); }
  }
  updateAccess();
  try { await refresh(); } catch (error) { message(error.message, true); }
});
