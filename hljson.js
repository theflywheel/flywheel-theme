// hljson: tiny dependency-free JSON syntax highlighter (from the schemes demo).
// Usage: el.innerHTML = hljson(obj); el.className = 'json';
function hljson(obj) {
  var s = JSON.stringify(obj, null, 2)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return s.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false)\b|\bnull\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (m) {
      var cls = 'num';
      if (/^"/.test(m)) { cls = /:$/.test(m) ? 'key' : 'str'; }
      else if (/true|false/.test(m)) cls = 'bool';
      else if (/null/.test(m)) cls = 'null';
      return '<span class="' + cls + '">' + m + '</span>';
    });
}
if (typeof module !== 'undefined') module.exports = hljson;
