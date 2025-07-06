document.addEventListener('DOMContentLoaded', () => {
  const avatar = document.getElementById('discord-avatar');
  const username = document.getElementById('discord-username');
  const statusDot = document.getElementById('discord-status-dot');
  const statusText = document.getElementById('discord-status-text');
  const activityInfo = document.getElementById('discord-activity-info');
  const noActivity = document.getElementById('discord-no-activity');

  // --- Yêu st nè ---
  avatar.src = "./assets/pfp/ggs_st.png"; // ggs
  username.textContent = "VietTrung";
  statusDot.className = "status-online";
  statusText.textContent = "Online";

  // Ẩn phần activity (vì không fetch API)
  if (activityInfo) activityInfo.classList.add('hidden');
  if (noActivity) noActivity.classList.remove('hidden');
});
