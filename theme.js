// theme: light/dark toggle. Include the script and a small toggle appears at
// the top right (or it wires up an existing element with class="theme-toggle").
// The choice persists in localStorage and overrides prefers-color-scheme; the
// button always names the mode it will switch TO.
(function () {
  var KEY = 'fw-theme';
  var root = document.documentElement;

  // apply a saved preference as early as possible to avoid a theme flash
  try {
    var saved = localStorage.getItem(KEY);
    if (saved === 'dark' || saved === 'light') root.dataset.theme = saved;
  } catch (e) {}

  function current() {
    if (root.dataset.theme) return root.dataset.theme;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  var btn;
  function update() {
    var next = current() === 'dark' ? 'light' : 'dark';
    btn.textContent = next;
    btn.setAttribute('aria-label', 'switch to ' + next + ' theme');
  }

  function init() {
    btn = document.querySelector('.theme-toggle');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'theme-toggle';
      document.body.appendChild(btn);
    }
    btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem(KEY, next); } catch (e) {}
      update();
    });
    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
