document.addEventListener('DOMContentLoaded', function() {
  const usernameElement = document.getElementById('username');
  const cursorElement = document.getElementById('typing-cursor');
  
  const usernameVariants = [
  "𝚅𝚒𝚎𝚝 𝚃𝚛𝚞𝚗𝚐",
  "𝕌𝔼𝔹✦𝔻𝔼𝕊𝕋𝕀ℕ𝕐",
  "𝑆𝑇 — ???",
  "l o v e . . .",
  "泰",
  "𝑭𝒐𝒓 : 泰",
  "??? 泰 ???",
  "S [泰]",
  "🖤 泰 🖤",
  "C o d e : 泰",
  "泰 — ...?",
  "𝑳𝒐𝒔𝒕 𝒊𝒏 泰",
  "𝙁𝙊𝙍 ( 泰 )",
  "𝑳𝒊𝒆𝒖 𝒄𝒐́ 𝒑𝒉𝒂𝒊 泰?",
  "N. A. M. E : 泰",
  "… 泰 …",
  "T . . . a . . . i",
  "𝚃𝚑𝚎 𝚗𝚊𝚖𝚎 𝚒𝚜 泰"
];

  
  let currentText = '';
  let isDeleting = false;
  let textIndex = 0;
  let speed = 120;
  let pauseTime = 1500;
  
  function typeEffect() {
    const fullText = usernameVariants[textIndex];
    
    if (isDeleting) {
      currentText = fullText.substring(0, currentText.length - 1);
    } else {
      currentText = fullText.substring(0, currentText.length + 1);
    }
    
    usernameElement.textContent = currentText;
    
    let typeSpeed = speed;
    
    if (isDeleting) {
      typeSpeed = speed / 2;
    }
    
    if (!isDeleting && currentText === fullText) {
      typeSpeed = pauseTime;
      isDeleting = true;
    } else if (isDeleting && currentText === '') {
      isDeleting = false;
      textIndex = (textIndex + 1) % usernameVariants.length;
      typeSpeed = 500;
    }
    
    setTimeout(typeEffect, typeSpeed);
  }
  
  setTimeout(typeEffect, 1000);
  
  setInterval(() => {
    if (!isDeleting && currentText.length > 0) {
      cursorElement.style.transform = 'translateY(-3px)';
      setTimeout(() => {
        cursorElement.style.transform = 'translateY(0)';
      }, 50);
    }
  }, 500);
});