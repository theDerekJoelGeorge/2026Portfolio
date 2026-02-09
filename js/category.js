// Category page: load category by slug and show gallery of entries from category_entries.
// Requires js/supabase-config.js.
// URL: category.html?slug=photo-logs

(function () {
  var url = window.SUPABASE_URL;
  var key = window.SUPABASE_ANON_KEY;
  var categoriesTable = window.SUPABASE_CATEGORIES_TABLE || 'categories';
  var entriesTable = window.SUPABASE_CATEGORY_ENTRIES_TABLE || 'category_entries';

  function getSlug() {
    var params = new URLSearchParams(window.location.search);
    return params.get('slug') || '';
  }

  var titleEl = document.getElementById('categoryTitle');
  var introEl = document.getElementById('categoryIntro');
  var loadingEl = document.getElementById('categoryLoading');
  var emptyEl = document.getElementById('categoryEmpty');
  var gridEl = document.getElementById('galleryGrid');
  var breadcrumbEl = document.getElementById('breadcrumbCurrent');

  function setTitle(s) {
    if (titleEl) titleEl.textContent = s || '…';
  }

  function setBreadcrumb(s) {
    if (breadcrumbEl) breadcrumbEl.textContent = s || '…';
  }

  function setIntro(s) {
    if (introEl) {
      introEl.textContent = s || '';
      introEl.style.display = s ? '' : 'none';
    }
  }

  function setLoading(show) {
    if (loadingEl) loadingEl.style.display = show ? '' : 'none';
    if (emptyEl) emptyEl.style.display = 'none';
  }

  function setEmpty(msg) {
    if (loadingEl) loadingEl.style.display = 'none';
    if (emptyEl) {
      emptyEl.textContent = msg || 'No entries yet.';
      emptyEl.style.display = '';
    }
    if (gridEl) gridEl.innerHTML = '';
  }

  function escapeHtml(s) {
    return String(s ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function getImageUrl(entry) {
    var raw = entry.image_url || entry.image || entry.thumbnail_url ||
      entry.photo_url || entry.photo || entry.url || entry.src || entry.cover_image ||
      entry.img || entry.photo_url || entry.cover || '';
    raw = String(raw || '').trim();
    if (!raw) {
      for (var k in entry) {
        if (!entry.hasOwnProperty(k)) continue;
        var key = k.toLowerCase();
        if (key === 'category_id' || key === 'id') continue;
        var v = typeof entry[k] === 'string' ? entry[k].trim() : '';
        if (!v) continue;
        if ((key.indexOf('image') !== -1 || key.indexOf('photo') !== -1 || key.indexOf('img') !== -1 || key.indexOf('url') !== -1 || key.indexOf('src') !== -1 || key.indexOf('cover') !== -1) ||
            (v.indexOf('http') === 0 || /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(v) || v.indexOf('/') === 0)) {
          raw = v;
          break;
        }
      }
    }
    if (!raw) return '';
    if (raw.indexOf('http://') === 0 || raw.indexOf('https://') === 0) return raw;
    var base = url + '/storage/v1/object/public/';
    var bucket = window.SUPABASE_STORAGE_BUCKET || 'images';
    var path = raw.charAt(0) === '/' ? raw.slice(1) : raw;
    if (path.indexOf(bucket + '/') === 0) return base + path;
    return base + bucket + '/' + path;
  }

  function fetchCategoryBySlug(slug) {
    var select = encodeURIComponent('category_id,name,slug,"tool-tip text",description_1');
    var endpoint = url + '/rest/v1/' + categoriesTable +
      '?select=' + select +
      '&slug=eq.' + encodeURIComponent(slug) +
      '&limit=1';
    return fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }).then(function (res) {
      if (!res.ok) throw new Error('Category fetch: ' + res.status);
      return res.json();
    }).then(function (arr) {
      return Array.isArray(arr) && arr.length ? arr[0] : null;
    });
  }

  function fetchEntriesByCategoryId(categoryId) {
    // Use select=* so any column names work; filter by category_id
    var select = encodeURIComponent('*');
    var endpoint = url + '/rest/v1/' + entriesTable +
      '?select=' + select +
      '&category_id=eq.' + encodeURIComponent(String(categoryId)) +
      '&order=id.asc';
    return fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }).then(function (res) {
      if (!res.ok) throw new Error('Entries fetch: ' + res.status);
      return res.json();
    }).then(function (data) {
      return Array.isArray(data) ? data : [];
    });
  }

  function renderGallery(entries) {
    if (!gridEl) return;
    setLoading(false);
    if (!entries || entries.length === 0) {
      setEmpty('No entries yet.');
      return;
    }
    if (entries[0] && window.console && window.console.log) {
      window.console.log('Category entry sample (check column names):', entries[0]);
      window.console.log('First image URL resolved:', getImageUrl(entries[0]));
    }
    emptyEl.style.display = 'none';
    gridEl.innerHTML = entries.map(function (entry) {
      var title = escapeHtml(entry.title || entry.name || 'Untitled');
      var year = entry.year || entry.date || entry.created_at;
      if (year && typeof year === 'string' && year.length > 4) year = year.slice(0, 4);
      var yearStr = year ? escapeHtml(String(year)) : '';
      var img = getImageUrl(entry);
      if (img) img = escapeHtml(img);
      var imgTag = img
        ? '<img class="gallery-item__image" src="' + img + '" alt="" loading="lazy" decoding="async" onerror="this.onerror=null;this.style.display=\'none\'">'
        : '<div class="gallery-item__image gallery-item__image--placeholder" aria-hidden="true"></div>';
      var overlay = '<span class="gallery-item__overlay">' +
        '<span class="gallery-item__title">' + title + '</span>' +
        (yearStr ? '<span class="gallery-item__year">' + yearStr + '</span>' : '') +
        '</span>';
      return (
        '<article class="gallery-item gallery-item--landscape">' +
          '<a class="gallery-item__link" href="#">' +
            '<span class="gallery-item__image-wrap">' + imgTag + overlay + '</span>' +
          '</a>' +
          '<p class="gallery-item__caption">' + title + '</p>' +
        '</article>'
      );
    }).join('');

    attachImageOrientationListeners();
  }

  function attachImageOrientationListeners() {
    if (!gridEl) return;
    function runCheck() {
      var items = gridEl.querySelectorAll('.gallery-item');
      items.forEach(function (article) {
        var img = article.querySelector('.gallery-item__image');
        if (!img || !img.src) return;
        var w = img.naturalWidth || img.width;
        var h = img.naturalHeight || img.height;
        if (w && h) {
          article.classList.remove('gallery-item--landscape', 'gallery-item--portrait');
          var isPortrait = w < h;
          article.classList.add(isPortrait ? 'gallery-item--portrait' : 'gallery-item--landscape');
          var link = article.querySelector('.gallery-item__link');
          if (isPortrait && link) link.style.height = '20rem';
          else if (link) link.style.height = '';
        }
      });
    }
    var items = gridEl.querySelectorAll('.gallery-item');
    items.forEach(function (article) {
      var img = article.querySelector('.gallery-item__image');
      if (!img || !img.src) return;
      function checkOrientation() {
        var w = img.naturalWidth || img.width;
        var h = img.naturalHeight || img.height;
        if (w && h) {
          article.classList.remove('gallery-item--landscape', 'gallery-item--portrait');
          var isPortrait = w < h;
          article.classList.add(isPortrait ? 'gallery-item--portrait' : 'gallery-item--landscape');
          var link = article.querySelector('.gallery-item__link');
          if (isPortrait && link) link.style.height = '20rem';
          else if (link) link.style.height = '';
        }
      }
      if (img.complete && img.naturalWidth) checkOrientation();
      else img.addEventListener('load', checkOrientation);
    });
    runCheck();
    setTimeout(runCheck, 400);
    setTimeout(runCheck, 1200);
  }

  function run() {
    var slug = getSlug();
    if (!url || !key) {
      setTitle('Configuration missing');
      setBreadcrumb('Configuration missing');
      setEmpty('Supabase is not configured.');
      return;
    }
    if (!slug) {
      setTitle('Category');
      setBreadcrumb('Category');
      setEmpty('No category specified. Use ?slug=photo-logs');
      return;
    }

    setTitle('…');
    setBreadcrumb('Loading…');
    setLoading(true);

    fetchCategoryBySlug(slug)
      .then(function (category) {
        if (!category) {
          setTitle('Category not found');
          setBreadcrumb('Not found');
          setEmpty('No category found for "' + slug + '". Check the slug in the URL.');
          return null;
        }
        setTitle(category.name || slug);
        setBreadcrumb(category.name || slug);
        setIntro(category['tool-tip text'] || category.description_1 || '');
        document.title = (category.name || slug) + ' – Creative Library';
        return fetchEntriesByCategoryId(category.category_id);
      })
      .then(function (entries) {
        if (entries !== undefined && entries !== null) renderGallery(entries);
      })
      .catch(function (err) {
        console.error('Category page error', err);
        setTitle('Error');
        setBreadcrumb('Error');
        setEmpty('Could not load: ' + (err && err.message ? err.message : 'Unknown error') + '. Check console (F12).');
      })
      .finally(function () {
        setLoading(false);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    function toggleBackToTop() {
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      backToTop.classList.toggle('is-visible', y > 400);
    }
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop();
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
