// Entry (article) detail page: load single category_entries row by id and render.
// URL: entry.html?id=123&category=writings
// Requires js/supabase-config.js.

(function () {
  var url = window.SUPABASE_URL;
  var key = window.SUPABASE_ANON_KEY;
  var entriesTable = window.SUPABASE_CATEGORY_ENTRIES_TABLE || 'category_entries';

  function getParams() {
    var params = new URLSearchParams(window.location.search);
    return {
      id: params.get('id') || '',
      category: params.get('category') || 'writings',
    };
  }

  var loadingEl = document.getElementById('entryLoading');
  var errorEl = document.getElementById('entryError');
  var contentEl = document.getElementById('entryContent');
  var titleEl = document.getElementById('entryTitle');
  var metaEl = document.getElementById('entryMeta');
  var coverWrapEl = document.getElementById('entryCoverWrap');
  var coverEl = document.getElementById('entryCover');
  var bodyEl = document.getElementById('entryBody');
  var breadcrumbCategoryEl = document.getElementById('breadcrumbCategory');
  var breadcrumbCurrentEl = document.getElementById('breadcrumbCurrent');
  var coverCaptionEl = document.getElementById('entryCoverCaption');
  var coverDimensionsEl = document.getElementById('entryCoverDimensions');

  function setLoading(show) {
    if (loadingEl) loadingEl.style.display = show ? '' : 'none';
  }

  function setError(msg) {
    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'none';
    if (errorEl) {
      errorEl.textContent = msg || 'Failed to load entry.';
      errorEl.style.display = '';
    }
  }

  function getImageUrl(entry) {
    var raw = entry.image_url || entry.image || entry.thumbnail_url ||
      entry.photo_url || entry.photo || entry.url || entry.src || entry.cover_image ||
      entry.img || entry.cover || '';
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
    return window.resolveSupabaseStorageUrl ? window.resolveSupabaseStorageUrl(raw) : (url + '/storage/v1/object/public/' + (raw.charAt(0) === '/' ? raw.slice(1) : raw));
  }

  function getEntryType(entry) {
    var raw = entry.type || entry.entry_type || entry.kind || '';
    return String(raw ?? '').trim();
  }

  function getEntryBody(entry) {
    var raw = entry.body || entry.content || entry.entry || entry.text || entry.description || '';
    return String(raw ?? '').trim();
  }

  function getCoverImageDescription(entry) {
    var raw = entry['Cover Image Description'] || entry.cover_image_description || '';
    return String(raw ?? '').trim();
  }

  function displayCategoryName(slug) {
    if (!slug) return 'Writings';
    if (String(slug).toLowerCase() === 'writings') return 'Writings';
    return slug;
  }

  function formatDate(value) {
    if (!value) return '';
    var d = null;
    if (typeof value === 'string') {
      d = new Date(value);
    } else if (value && typeof value.getMonth === 'function') {
      d = value;
    }
    if (!d || isNaN(d.getTime())) return '';
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  function escapeHtml(s) {
    return String(s ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function fetchEntryById(entryId) {
    var select = encodeURIComponent('*');
    var endpoint = url + '/rest/v1/' + entriesTable +
      '?select=' + select +
      '&id=eq.' + encodeURIComponent(String(entryId)) +
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
      if (!res.ok) throw new Error('Entry fetch: ' + res.status);
      return res.json();
    }).then(function (data) {
      return Array.isArray(data) && data.length ? data[0] : null;
    });
  }

  function renderEntry(entry) {
    var title = entry.title || entry.name || 'Untitled';
    var typeStr = getEntryType(entry);
    var dateRaw = entry.date || entry.created_at || entry.published_at;
    var dateStr = formatDate(dateRaw);
    var metaParts = [];
    if (typeStr) metaParts.push(typeStr);
    if (dateStr) metaParts.push(dateStr);
    var metaText = metaParts.join(' • ');

    if (titleEl) titleEl.textContent = title;
    if (metaEl) {
      metaEl.textContent = metaText;
      metaEl.style.display = metaText ? '' : 'none';
    }
    if (breadcrumbCurrentEl) breadcrumbCurrentEl.textContent = title;
    document.title = title + ' – Creative Library';

    var categorySlug = getParams().category;
    if (breadcrumbCategoryEl) {
      breadcrumbCategoryEl.textContent = displayCategoryName(categorySlug);
      breadcrumbCategoryEl.href = 'category.html?slug=' + encodeURIComponent(categorySlug);
    }

    var coverDescription = getCoverImageDescription(entry);
    if (coverEl) coverEl.alt = coverDescription || '';
    if (coverCaptionEl) {
      coverCaptionEl.textContent = coverDescription || '';
      coverCaptionEl.style.display = coverDescription ? '' : 'none';
    }
    if (coverDimensionsEl) coverDimensionsEl.style.display = 'none';

    var imgUrl = getImageUrl(entry);
    if (imgUrl && coverEl && coverWrapEl) {
      coverEl.loading = 'lazy';
      coverEl.decoding = 'async';
      coverEl.src = imgUrl;
      coverEl.style.display = '';
      coverWrapEl.classList.remove('entry-cover-wrap--placeholder');
      coverEl.onerror = function () {
        coverEl.style.display = 'none';
        coverWrapEl.classList.add('entry-cover-wrap--placeholder');
      };
      coverEl.onload = function () {
        if (coverDimensionsEl && coverEl.naturalWidth && coverEl.naturalHeight) {
          coverDimensionsEl.textContent = 'Dimensions: ' + coverEl.naturalWidth + ' × ' + coverEl.naturalHeight + ' px';
          coverDimensionsEl.style.display = '';
        }
      };
      if (coverEl.complete && coverEl.naturalWidth) coverEl.onload();
    } else if (coverWrapEl) {
      if (coverEl) coverEl.style.display = 'none';
      coverWrapEl.classList.add('entry-cover-wrap--placeholder');
    }

    var body = getEntryBody(entry);
    if (bodyEl) {
      bodyEl.innerHTML = escapeHtml(body).replace(/\n/g, '<br>');
      bodyEl.style.display = body ? '' : 'none';
    }

    if (contentEl) contentEl.style.display = '';
  }

  function run() {
    var params = getParams();
    if (!url || !key) {
      setError('Supabase is not configured.');
      return;
    }
    if (!params.id) {
      setError('No entry specified. Use ?id=123');
      return;
    }

    setLoading(true);
    if (errorEl) errorEl.style.display = 'none';
    if (typeof window.showLoader === 'function') window.showLoader();

    fetchEntryById(params.id)
      .then(function (entry) {
        if (!entry) {
          setError('Entry not found.');
          return;
        }
        renderEntry(entry);
      })
      .catch(function (err) {
        console.error('Entry page error', err);
        setError(err && err.message ? err.message : 'Could not load entry.');
      })
      .finally(function () {
        setLoading(false);
        if (typeof window.hideLoader === 'function') window.hideLoader();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
