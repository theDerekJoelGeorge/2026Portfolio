/**
 * Loading screen: logo fill → empty animation.
 * - Initial page load: full animation (fill, then empty if taking long).
 * - Supabase/content loading (showLoader/hideLoader): super short animation only.
 */

(function () {
  var overlay = null;
  var contentLoadingCount = 0;
  var fillToEmptyTimeout = null;
  var FILL_DURATION_INITIAL_MS = 500;
  var FILL_DURATION_FIRST_VISIT_MS = 1000;
  var FILL_DURATION_SHORT_MS = 125;

  function getLogoUrls() {
    var isLight = document.body.classList.contains('light-mode');
    return {
      outline: isLight ? 'images/Logo-dark.png' : 'images/Logo-light.png',
    };
  }

  function createLoader() {
    if (overlay) return overlay;
    var urls = getLogoUrls();
    var wrap = document.createElement('div');
    wrap.className = 'loader-overlay';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML =
      '<div class="loader-logo-wrap">' +
      '<img class="loader-logo-outline" src="' + urls.outline + '" alt="" role="presentation">' +
      '<div class="loader-logo-fill" aria-hidden="true"></div>' +
      '</div>';
    overlay = wrap;
    document.body.appendChild(wrap);
    return wrap;
  }

  function setLogoUrls() {
    if (!overlay) return;
    var urls = getLogoUrls();
    var img = overlay.querySelector('.loader-logo-outline');
    if (img) img.src = urls.outline;
  }

  function clearFillToEmptyTimeout() {
    if (fillToEmptyTimeout) {
      clearTimeout(fillToEmptyTimeout);
      fillToEmptyTimeout = null;
    }
  }

  function startFillThenEmptyIfStillShowing(shortMode, firstVisit) {
    var fillEl = overlay && overlay.querySelector('.loader-logo-fill');
    if (!fillEl) return;
    var durationMs = shortMode ? FILL_DURATION_SHORT_MS : (firstVisit ? FILL_DURATION_FIRST_VISIT_MS : FILL_DURATION_INITIAL_MS);
    if (overlay) {
      overlay.classList.toggle('loader-short', shortMode);
      overlay.classList.toggle('loader-first-visit', !!firstVisit);
    }
    fillEl.classList.remove('loader-empty-phase');
    fillEl.classList.add('loader-fill-phase');
    clearFillToEmptyTimeout();
    fillToEmptyTimeout = setTimeout(function () {
      fillToEmptyTimeout = null;
      if (!overlay || overlay.classList.contains('loader-hiding')) return;
      fillEl.classList.remove('loader-fill-phase');
      fillEl.classList.add('loader-empty-phase');
    }, durationMs);
  }

  function hideLoader(removeFromDOM) {
    if (!overlay) return;
    clearFillToEmptyTimeout();
    overlay.classList.add('loader-hiding');
    setTimeout(function () {
      overlay.classList.add('loader-hidden');
      if (removeFromDOM && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 420);
  }

  function showLoader() {
    contentLoadingCount += 1;
    document.body.classList.add('loader-nav-visible');
    var el = createLoader();
    el.classList.remove('loader-hiding', 'loader-hidden');
    el.style.display = '';
    setLogoUrls();
    startFillThenEmptyIfStillShowing(true, false); // short = Supabase/content loading
  }

  function hideLoaderForContent() {
    contentLoadingCount = Math.max(0, contentLoadingCount - 1);
    if (contentLoadingCount > 0) return;
    hideLoader(false);
  }

  var LOADER_SEEN_KEY = 'loaderSeen';

  function runInitialLoadSequence() {
    var firstVisit = !sessionStorage.getItem(LOADER_SEEN_KEY);
    if (!firstVisit) {
      document.body.classList.add('loader-nav-visible');
    }
    createLoader();
    setLogoUrls();
    startFillThenEmptyIfStillShowing(false, firstVisit);
    var hideAfterMs = firstVisit ? 2600 : 1300; // 1s+1s+buffer vs 0.5s+0.5s+buffer
    setTimeout(function () {
      if (!overlay) return;
      sessionStorage.setItem(LOADER_SEEN_KEY, '1');
      overlay.classList.add('loader-hiding');
      setTimeout(function () {
        overlay.classList.add('loader-hidden');
      }, 420);
    }, hideAfterMs);
  }

  // Pages with no content to load: skip initial loader
  function shouldRunInitialLoader() {
    var path = window.location.pathname || '';
    var page = path.split('/').pop() || '';
    var noLoaderPages = ['about-me.html'];
    return noLoaderPages.indexOf(page) === -1;
  }

  // Show overlay on first load only on pages that have content to load
  if (shouldRunInitialLoader()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runInitialLoadSequence);
    } else {
      runInitialLoadSequence();
    }
  }

  // Expose API for content loading
  window.showLoader = showLoader;
  window.hideLoader = hideLoaderForContent;
})();
