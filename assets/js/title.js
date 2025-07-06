var titles = [
  "V",
  "Vi",
  "Vie",
  "Viet",
  "VietT",
  "VietTr",
  "VietTru",
  "VietTrun",
  "VietTrung",
  "VietTrun",
  "VietTru",
  "VietTr",
  "VietT",
  "Viet",
  "Vie",
  "Vi",
  "V"
];

function changeTitle() {
  var index = 0;

  setInterval(function() {
      document.title = titles[index];
      index = (index + 1) % titles.length;
  }, 1000);
}

changeTitle();
