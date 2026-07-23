// autogrow: WhatsApp-style auto-expanding textarea (from the schemes demo).
// Starts at one line, grows with content up to the CSS max-height, and ignores
// the placeholder (a long wrapping placeholder must not inflate the height —
// that bug is why the value check exists).
//
// Usage: <textarea class="autogrow" rows="1" oninput="autogrow(this)"></textarea>
// or wire automatically: document.querySelectorAll('.autogrow').forEach(autowire)
function autogrow(t) {
  if (!t.value) { t.style.height = ''; return; }   // empty -> natural rows=1 height
  t.style.height = 'auto';
  t.style.height = Math.min(t.scrollHeight, maxPx(t)) + 'px';
}
function maxPx(t) {
  var m = parseFloat(getComputedStyle(t).maxHeight);
  return isNaN(m) ? 128 : m;
}
function autowire(t) {
  t.addEventListener('input', function () { autogrow(t); });
  autogrow(t);
}
if (typeof module !== 'undefined') module.exports = { autogrow: autogrow, autowire: autowire };
