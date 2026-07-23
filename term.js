// term: post-processor that turns plain shell code blocks (e.g. markdown
// ```sh fences) into terminal blocks — no hand-written spans needed.
//
// Targets pre[data-lang="sh|bash|shell|console"] and fences whose <code> has a
// language-sh/bash/shell/console class (what markdown renderers emit). Lines
// starting with "$ " become prompt + command; other lines are output; a
// trailing " # comment" on any line is dimmed. Idempotent; auto-runs on load.
// After inserting blocks dynamically, call termify(container).
function termify(scope) {
  var sel = [
    'pre[data-lang="sh"]', 'pre[data-lang="bash"]', 'pre[data-lang="shell"]', 'pre[data-lang="console"]',
    'pre > code[class*="language-sh"]', 'pre > code[class*="language-bash"]',
    'pre > code[class*="language-shell"]', 'pre > code[class*="language-console"]'
  ].join(',');
  var pres = [];
  (scope || document).querySelectorAll(sel).forEach(function (el) {
    var pre = el.tagName === 'PRE' ? el : el.parentElement;
    if (pres.indexOf(pre) < 0) pres.push(pre);
  });
  pres.forEach(function (pre) {
    if (pre.dataset.term) return;
    var code = pre.querySelector('code') || pre;
    var esc = function (s) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };
    var mark = function (s) { // dim a trailing " # comment"
      return esc(s).replace(/(\s)(#\s.*)$/, '$1<span class="hljs-comment">$2</span>');
    };
    code.innerHTML = code.textContent.replace(/\n$/, '').split('\n').map(function (l) {
      if (l.slice(0, 2) === '$ ') {
        return '<span class="p">$</span> <span class="cmd">' + mark(l.slice(2)) + '</span>';
      }
      return mark(l);
    }).join('\n');
    pre.classList.add('term');
    if (!pre.dataset.lang) pre.dataset.lang = 'sh';
    pre.dataset.term = '1';
  });
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { termify(); });
  } else {
    termify();
  }
}
if (typeof module !== 'undefined') module.exports = termify;
