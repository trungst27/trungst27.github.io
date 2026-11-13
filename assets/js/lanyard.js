document.addEventListener('DOMContentLoaded', () => {
  const widget = document.querySelector('.discord-widget');
  const userId = widget?.dataset.discordUserId;
  if (!/^\d{17,20}$/.test(userId || '')) return;

  const username = document.getElementById('discord-username');
  const statusDot = document.getElementById('discord-status-dot');
  const statusText = document.getElementById('discord-status-text');
  const activityInfo = document.getElementById('discord-activity-info');
  const noActivity = document.getElementById('discord-no-activity');
  const activityName = document.getElementById('discord-activity-name');
  const activityDetails = document.getElementById('discord-activity-details');
  const activityState = document.getElementById('discord-activity-state');
  const artwork = document.getElementById('discord-album-art');
  const statusLabels = {
    online: 'Online',
    idle: 'Idle',
    dnd: 'Do Not Disturb',
    offline: 'Offline'
  };

  let socket = null;
  let socketInitialized = false;
  let hasSocketPresence = false;
  let presenceVersion = 0;
  let heartbeatTimer = null;
  let reconnectTimer = null;
  let pollTimer = null;
  let requestController = null;
  let stopped = false;

  function setStatus(status, label) {
    statusDot.className = `status-${status}`;
    statusDot.title = label;
    statusDot.setAttribute('aria-label', label);
    statusText.textContent = label;
  }

  function showNoActivity(message) {
    activityInfo.classList.add('hidden');
    activityInfo.setAttribute('aria-hidden', 'true');
    noActivity.classList.remove('hidden');
    noActivity.setAttribute('aria-hidden', 'false');
    noActivity.textContent = message;
    activityName.textContent = '';
    activityDetails.textContent = '';
    activityState.textContent = '';
    artwork.style.backgroundImage = 'none';
  }

  function showUnavailable() {
    setStatus('unknown', 'Unavailable');
    showNoActivity('Discord status is temporarily unavailable.');
  }

  function showActivity(name, details, state, imageUrl = '') {
    activityName.textContent = name || '';
    activityDetails.textContent = details || '';
    activityState.textContent = state || '';
    // Only load artwork from Discord or Spotify's image hosts.
    let safeImage = '';
    try {
      const url = new URL(imageUrl);
      if (url.protocol === 'https:' && ['cdn.discordapp.com', 'media.discordapp.net', 'i.scdn.co'].includes(url.hostname)) {
        safeImage = url.href;
      }
    } catch {
      // Activities without artwork simply display their text.
    }
    artwork.style.display = safeImage ? 'block' : 'none';
    artwork.style.backgroundImage = safeImage ? `url("${safeImage}")` : 'none';
    activityInfo.classList.remove('hidden');
    activityInfo.setAttribute('aria-hidden', 'false');
    noActivity.classList.add('hidden');
    noActivity.setAttribute('aria-hidden', 'true');
  }

  function renderPresence(presence) {
    if (presence?.discord_user?.id !== userId) return false;
    const user = presence.discord_user;
    username.textContent = user.global_name || user.username || 'Discord';
    const status = presence.discord_status;
    if (!Object.hasOwn(statusLabels, status)) return false;
    setStatus(status, statusLabels[status]);

    if (status === 'offline') {
      showNoActivity('Currently offline.');
    } else if (presence.listening_to_spotify && presence.spotify) {
      const spotify = presence.spotify;
      showActivity(spotify.song, spotify.artist, 'Listening on Spotify', spotify.album_art_url);
    } else {
      const activities = Array.isArray(presence.activities) ? presence.activities : [];
      const activity = activities.find(item => [0, 1, 2, 3, 5].includes(item.type))
        || activities.find(item => item.type === 4 && item.state);
      if (!activity) {
        showNoActivity('No activity shared.');
      } else {
        const image = activity.assets?.large_image;
        const imageUrl = activity.application_id && /^\d+$/.test(image || '')
          ? `https://cdn.discordapp.com/app-assets/${activity.application_id}/${image}.png`
          : '';
        showActivity(
          activity.type === 4 ? 'Custom status' : activity.name,
          activity.type === 4 ? activity.state : activity.details,
          activity.type === 4 ? '' : activity.state,
          imageUrl
        );
      }
    }
    return true;
  }

  async function refreshPresence() {
    if (stopped || requestController || hasSocketPresence) return;
    const controller = new AbortController();
    requestController = controller;
    const version = presenceVersion;
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`, {
        cache: 'no-store',
        signal: controller.signal
      });
      const payload = await response.json();
      if (stopped || version !== presenceVersion) return;
      if (!response.ok || !payload.success || !renderPresence(payload.data)) {
        throw new Error('Presence unavailable');
      }
      // Retry the subscription if this account joined Lanyard after the page opened.
      if (!hasSocketPresence && socketInitialized && socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ op: 2, d: { subscribe_to_id: userId } }));
      }
    } catch {
      if (!stopped && version === presenceVersion && !hasSocketPresence) showUnavailable();
    } finally {
      clearTimeout(timeout);
      if (requestController === controller) requestController = null;
    }
  }

  function scheduleReconnect() {
    if (!stopped && !reconnectTimer) {
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connect();
      }, 5000);
    }
  }

  function connect() {
    if (stopped || socket || !('WebSocket' in window)) return;
    let connection;
    try {
      connection = new WebSocket('wss://api.lanyard.rest/socket');
    } catch {
      scheduleReconnect();
      return;
    }
    socket = connection;
    socketInitialized = false;
    const helloTimeout = setTimeout(() => connection.close(), 10000);

    connection.onmessage = event => {
      if (stopped || socket !== connection) return;
      let message;
      try { message = JSON.parse(event.data); } catch { return; }
      if (message.op === 1) {
        clearTimeout(helloTimeout);
        clearInterval(heartbeatTimer);
        const interval = message.d?.heartbeat_interval;
        heartbeatTimer = setInterval(() => {
          if (connection.readyState === WebSocket.OPEN) connection.send(JSON.stringify({ op: 3 }));
        }, Number.isFinite(interval) && interval > 0 ? interval : 30000);
        connection.send(JSON.stringify({ op: 2, d: { subscribe_to_id: userId } }));
        socketInitialized = true;
      } else if (message.op === 0 && ['INIT_STATE', 'PRESENCE_UPDATE'].includes(message.t)) {
        const presence = message.d?.discord_user ? message.d : message.d?.[userId];
        hasSocketPresence = renderPresence(presence);
        if (hasSocketPresence) presenceVersion++;
        else showUnavailable();
      }
    };
    connection.onerror = () => connection.close();
    connection.onclose = () => {
      clearTimeout(helloTimeout);
      if (socket !== connection) return;
      clearInterval(heartbeatTimer);
      socket = null;
      socketInitialized = false;
      hasSocketPresence = false;
      if (!stopped) {
        showUnavailable();
        refreshPresence();
        scheduleReconnect();
      }
    };
  }

  function start() {
    stopped = false;
    refreshPresence();
    connect();
    pollTimer = setInterval(refreshPresence, 30000);
  }

  window.addEventListener('pagehide', () => {
    stopped = true;
    clearInterval(pollTimer);
    clearInterval(heartbeatTimer);
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
    requestController?.abort();
    hasSocketPresence = false;
    socket?.close();
    socket = null;
    socketInitialized = false;
  });
  window.addEventListener('pageshow', event => { if (event.persisted) start(); });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !stopped) {
      refreshPresence();
      connect();
    }
  });
  start();
});
