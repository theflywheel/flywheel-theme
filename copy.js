// copy: adds a copy button to code blocks. Regular blocks copy the full code;
// terminal blocks (pre.term) copy ONLY the command lines — what you would
// paste into your own shell, without prompts or output. Idempotent; auto-runs
// on load; call copify(container) after inserting blocks dynamically.
function copify(scope) {
  (scope || document).querySelectorAll('pre').forEach(function (pre) {
    if (pre.dataset.copy || pre.classList.contains('mermaid')) return;
    pre.dataset.copy = '1';
    pre.classList.add('has-copy');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = 'copy';
    btn.setAttribute('aria-label', 'copy to clipboard');
    btn.addEventListener('click', function () {
      var text;
      var cmds = pre.querySelectorAll('.cmd');
      if (pre.classList.contains('term') && cmds.length) {
        text = Array.prototype.map.call(cmds, function (c) { return c.textContent; }).join('\n');
      } else {
        var code = pre.querySelector('code');
        text = (code || pre).textContent;
      }
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = 'copied';
        setTimeout(function () { btn.textContent = 'copy'; }, 1200);
      }, function () {
        btn.textContent = 'failed';
        setTimeout(function () { btn.textContent = 'copy'; }, 1200);
      });
    });
    pre.appendChild(btn);
  });
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { copify(); });
  } else {
    copify();
  }
}
if (typeof module !== 'undefined') module.exports = copify;
