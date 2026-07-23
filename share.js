// share: wires every <button class="share-btn"> on the page. Uses the Web
// Share API where available (mobile share sheet); otherwise copies the page
// URL (canonical link if present) and flips the label to "link copied".
// Placement is authorial — nothing is auto-inserted. sharify(container) for
// dynamic content.
function sharify(scope) {
  (scope || document).querySelectorAll('.share-btn').forEach(function (btn) {
    if (btn.dataset.share) return;
    btn.dataset.share = '1';
    if (!btn.textContent.trim()) btn.textContent = 'share';
    btn.addEventListener('click', function () {
      var canonical = document.querySelector('link[rel="canonical"]');
      var data = { title: document.title, url: canonical ? canonical.href : location.href };
      if (navigator.share) {
        navigator.share(data).catch(function () {});
        return;
      }
      navigator.clipboard.writeText(data.url).then(function () {
        var was = btn.textContent;
        btn.textContent = 'link copied';
        setTimeout(function () { btn.textContent = was; }, 1200);
      });
    });
  });
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { sharify(); });
  } else {
    sharify();
  }
}
if (typeof module !== 'undefined') module.exports = sharify;
