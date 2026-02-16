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

  function getEntryBody(entry) {
    var raw = entry.body || entry.content || entry.entry || entry.text || entry.description || '';
    return String(raw ?? '').trim();
  }

  function getEntryType(entry) {
    var raw = entry.type || entry.Type || entry.entry_type || entry.kind || '';
    return String(raw ?? '').trim();
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
    return window.resolveSupabaseStorageUrl ? window.resolveSupabaseStorageUrl(raw) : (url + '/storage/v1/object/public/' + (raw.charAt(0) === '/' ? raw.slice(1) : raw));
  }

  function getYouTubeEmbedUrl(url) {
    if (!url || typeof url !== 'string') return '';
    var raw = url.trim();
    var videoId = null;
    var youtuBeMatch = raw.match(/(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (youtuBeMatch && youtuBeMatch[1]) videoId = youtuBeMatch[1];
    else {
      var youtubeMatch = raw.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/|v\/)([a-zA-Z0-9_-]{11})/);
      if (youtubeMatch && youtubeMatch[1]) videoId = youtubeMatch[1];
      else {
        var vParamMatch = raw.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        if (vParamMatch && vParamMatch[1]) videoId = vParamMatch[1];
      }
    }
    return videoId ? 'https://www.youtube.com/embed/' + videoId : '';
  }

  function getEntryVideoUrl(entry) {
    var raw = (entry.entry != null && entry.entry !== '') ? String(entry.entry).trim() : '';
    if (!raw) raw = (entry.Entry || entry.video_url || entry.videoUrl || '').trim();
    if (!raw) raw = (entry.body || entry.content || '').trim();
    if (!raw) return '';
    if (/youtube\.com|youtu\.be/i.test(raw)) return raw;
    return '';
  }

  function getEntryDescriptionForDisplay(entry) {
    var d = (entry.description || entry.Description || entry.desc || '').trim();
    if (d) return String(d);
    var b = (entry.body || entry.content || entry.text || entry.entry || entry.Entry || '').trim();
    if (b && !/youtube\.com|youtu\.be/i.test(b)) return String(b);
    return '';
  }

  function isVideoLogsCategory(category) {
    if (!category) return false;
    var slug = (category.slug && String(category.slug).toLowerCase()) || '';
    var name = (category.name && String(category.name).toLowerCase()) || '';
    return slug === 'video-logs' || slug === 'videos' || name.indexOf('video log') !== -1 || name === 'videos';
  }

  function isGraphicDesignCategory(category) {
    if (!category) return false;
    var slug = (category.slug && String(category.slug).toLowerCase()) || '';
    var name = (category.name && String(category.name).toLowerCase()) || '';
    return slug === 'graphic-design' || slug === 'graphic design' || name.indexOf('graphic design') !== -1;
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

  function isWritingsCategory(category) {
    if (!category) return false;
    var slug = (category.slug && String(category.slug).toLowerCase()) || '';
    var name = (category.name && String(category.name).toLowerCase()) || '';
    return slug === 'writings' || name.indexOf('writing') !== -1;
  }

  function displayCategoryName(nameOrSlug) {
    if (!nameOrSlug) return '';
    var s = String(nameOrSlug);
    if (s.toLowerCase() === 'writings') return 'Writings';
    return s;
  }

  function renderGallery(entries, category) {
    if (!gridEl) return;
    setLoading(false);
    if (!entries || entries.length === 0) {
      setEmpty('No entries yet.');
      return;
    }
    emptyEl.style.display = 'none';

    if (isWritingsCategory(category)) {
      var types = [];
      var typeSet = {};
      entries.forEach(function (entry) {
        var t = getEntryType(entry);
        if (t && !typeSet[t]) {
          typeSet[t] = true;
          types.push(t);
        }
      });
      types.sort();

      var existingFilters = gridEl.parentNode.querySelector('.writings-filters');
      if (existingFilters) existingFilters.remove();
      var filtersDiv = document.createElement('div');
      filtersDiv.className = 'writings-filters';
      filtersDiv.setAttribute('role', 'tablist');
      filtersDiv.setAttribute('aria-label', 'Filter by type');
      var allBtn = '<button type="button" class="writings-filters__tab is-active" data-filter="all" role="tab" aria-selected="true">All</button>';
      var typeBtns = types.map(function (t) {
        return '<button type="button" class="writings-filters__tab" data-filter="' + escapeHtml(t) + '" role="tab" aria-selected="false">' + escapeHtml(t) + '</button>';
      }).join('');
      filtersDiv.innerHTML = allBtn + typeBtns;
      gridEl.parentNode.insertBefore(filtersDiv, gridEl);

      var categorySlug = (category.slug && String(category.slug)) || 'writings';
      gridEl.className = 'writings-grid';
      gridEl.setAttribute('aria-label', 'Writings');
      gridEl.innerHTML = entries.map(function (entry) {
        var entryId = entry.id != null ? String(entry.id) : '';
        var entryHref = entryId ? 'entry.html?id=' + encodeURIComponent(entryId) + '&category=' + encodeURIComponent(categorySlug) : '#';
        var title = escapeHtml(entry.title || entry.name || 'Untitled');
        var typeStr = getEntryType(entry);
        var typeEscaped = escapeHtml(typeStr);
        var img = getImageUrl(entry);
        if (img) img = escapeHtml(img);
        var imgTag = img
          ? '<img class="writings-card__cover" src="' + img + '" alt="" loading="lazy" decoding="async" onerror="this.onerror=null;this.parentElement.classList.add(\'writings-card__cover-wrap--placeholder\')">'
          : '';
        var coverClass = 'writings-card__cover-wrap' + (img ? '' : ' writings-card__cover-wrap--placeholder');
        return (
          '<a class="writings-card" href="' + entryHref + '" data-type="' + typeEscaped + '">' +
            '<div class="' + coverClass + '">' + imgTag + '</div>' +
            '<p class="writings-card__name">' + title + '</p>' +
            '<p class="writings-card__type">' + (typeEscaped || '—') + '</p>' +
          '</a>'
        );
      }).join('');

      filtersDiv.querySelectorAll('.writings-filters__tab').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var filter = btn.getAttribute('data-filter');
          filtersDiv.querySelectorAll('.writings-filters__tab').forEach(function (b) {
            b.classList.toggle('is-active', b.getAttribute('data-filter') === filter);
            b.setAttribute('aria-selected', b.getAttribute('data-filter') === filter ? 'true' : 'false');
          });
          gridEl.querySelectorAll('.writings-card').forEach(function (card) {
            var type = card.getAttribute('data-type');
            var show = filter === 'all' || type === filter;
            card.style.display = show ? '' : 'none';
          });
        });
      });
      return;
    }

    if (isVideoLogsCategory(category)) {
      gridEl.className = 'video-logs-list';
      gridEl.setAttribute('aria-label', 'Video logs');
      gridEl.innerHTML = entries.map(function (entry) {
        var title = escapeHtml(entry.title || entry.name || entry.Title || 'Untitled');
        var description = escapeHtml(getEntryDescriptionForDisplay(entry));
        var videoUrl = getEntryVideoUrl(entry);
        var embedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) : '';
        var embedHtml = embedUrl
          ? '<div class="video-log-entry__video">' +
              '<iframe title="YouTube video" src="' + escapeHtml(embedUrl) + '" width="100%" height="400" ' +
              'style="border:0;border-radius:12px;" loading="lazy" ' +
              'allow="fullscreen; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe>' +
              '</div>'
          : '';
        return (
          '<article class="video-log-entry">' +
            embedHtml +
            '<h2 class="video-log-entry__title">' + title + '</h2>' +
            (description ? '<p class="video-log-entry__description">' + description + '</p>' : '') +
          '</article>'
        );
      }).join('');
      return;
    }

    if (isGraphicDesignCategory(category)) {
      var types = [];
      var typeSet = {};
      entries.forEach(function (entry) {
        var t = getEntryType(entry);
        if (t && !typeSet[t]) {
          typeSet[t] = true;
          types.push(t);
        }
      });
      types.sort();

      var existingToolbar = gridEl.parentNode.querySelector('.gallery-toolbar');
      if (existingToolbar) existingToolbar.remove();

      var savedCols = 2;
      try {
        var stored = window.sessionStorage.getItem('graphicDesignColumns');
        if (stored === '2' || stored === '3') savedCols = parseInt(stored, 10);
      } catch (e) {}

      var toolbar = document.createElement('div');
      toolbar.className = 'gallery-toolbar';
      toolbar.innerHTML =
        '<div class="writings-filters" role="tablist" aria-label="Filter by type">' +
          '<button type="button" class="writings-filters__tab is-active" data-filter="all" role="tab" aria-selected="true">All</button>' +
          types.map(function (t) {
            return '<button type="button" class="writings-filters__tab" data-filter="' + escapeHtml(t) + '" role="tab" aria-selected="false">' + escapeHtml(t) + '</button>';
          }).join('') +
        '</div>' +
        '<div class="gallery-column-switcher" aria-label="2 or 3 columns">' +
          '<div class="gallery-column-switcher__buttons">' +
            '<button type="button" class="gallery-column-switcher__btn' + (savedCols === 2 ? ' is-active' : '') + '" data-cols="2" aria-pressed="' + (savedCols === 2 ? 'true' : 'false') + '" title="2 columns">' +
              '<span class="gallery-column-switcher__icon"><svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="4" height="4" x="0" y="0" rx="0.5" fill="currentColor"/><rect width="4" height="4" x="5" y="0" rx="0.5" fill="currentColor"/><rect width="4" height="4" x="0" y="5" rx="0.5" fill="currentColor"/><rect width="4" height="4" x="5" y="5" rx="0.5" fill="currentColor"/></svg></span></button>' +
            '<button type="button" class="gallery-column-switcher__btn' + (savedCols === 3 ? ' is-active' : '') + '" data-cols="3" aria-pressed="' + (savedCols === 3 ? 'true' : 'false') + '" title="3 columns">' +
              '<span class="gallery-column-switcher__icon"><svg width="14" height="9" viewBox="0 0 14 9" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="4" height="4" x="0" y="0" rx="0.5" fill="currentColor"/><rect width="4" height="4" x="5" y="0" rx="0.5" fill="currentColor"/><rect width="4" height="4" x="10" y="0" rx="0.5" fill="currentColor"/><rect width="4" height="4" x="0" y="5" rx="0.5" fill="currentColor"/><rect width="4" height="4" x="5" y="5" rx="0.5" fill="currentColor"/><rect width="4" height="4" x="10" y="5" rx="0.5" fill="currentColor"/></svg></span></button>' +
          '</div>' +
        '</div>';
      gridEl.parentNode.insertBefore(toolbar, gridEl);

      var filtersDiv = toolbar.querySelector('.writings-filters');
      var colSwitcher = toolbar.querySelector('.gallery-column-switcher');

      function setGridColumns(n) {
        gridEl.classList.remove('gallery-grid--cols-2', 'gallery-grid--cols-3');
        gridEl.classList.add('gallery-grid--cols-' + n);
        colSwitcher.querySelectorAll('.gallery-column-switcher__btn').forEach(function (b) {
          var active = b.getAttribute('data-cols') === String(n);
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        try { window.sessionStorage.setItem('graphicDesignColumns', String(n)); } catch (e) {}
      }
      colSwitcher.querySelectorAll('.gallery-column-switcher__btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          setGridColumns(parseInt(btn.getAttribute('data-cols'), 10));
        });
      });

      var categorySlug = (category.slug && String(category.slug)) || 'graphic-design';
      gridEl.className = 'gallery-grid gallery-grid--graphic gallery-grid--cols-' + savedCols;
      gridEl.setAttribute('aria-label', 'Gallery');
      gridEl.innerHTML = entries.map(function (entry) {
        var entryId = entry.id != null ? String(entry.id) : (entry.entry_id != null ? String(entry.entry_id) : '');
        var entryHref = entryId ? 'entry.html?id=' + encodeURIComponent(entryId) + '&category=' + encodeURIComponent(categorySlug) : '#';
        var title = escapeHtml(entry.title || entry.name || 'Untitled');
        var typeStr = getEntryType(entry);
        var typeEscaped = escapeHtml(typeStr);
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
          '<article class="gallery-item gallery-item--landscape" data-type="' + typeEscaped + '">' +
            '<a class="gallery-item__link" href="' + entryHref + '">' +
              '<span class="gallery-item__image-wrap">' + imgTag + overlay + '</span>' +
            '</a>' +
            '<p class="gallery-item__caption">' + title + '</p>' +
          '</article>'
        );
      }).join('');

      filtersDiv.querySelectorAll('.writings-filters__tab').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var filter = btn.getAttribute('data-filter');
          filtersDiv.querySelectorAll('.writings-filters__tab').forEach(function (b) {
            b.classList.toggle('is-active', b.getAttribute('data-filter') === filter);
            b.setAttribute('aria-selected', b.getAttribute('data-filter') === filter ? 'true' : 'false');
          });
          gridEl.querySelectorAll('.gallery-item').forEach(function (article) {
            var type = article.getAttribute('data-type');
            var show = filter === 'all' || type === filter;
            article.style.display = show ? '' : 'none';
          });
        });
      });

      initCategoryImageModal();
      attachImageOrientationListeners();
      attachCategoryGalleryModal();
      return;
    }

    if (entries[0] && window.console && window.console.log) {
      window.console.log('Category entry sample (check column names):', entries[0]);
      window.console.log('First image URL resolved:', getImageUrl(entries[0]));
    }
    gridEl.className = 'gallery-grid';
    gridEl.setAttribute('aria-label', 'Gallery');
    gridEl.innerHTML = entries.map(function (entry) {
      var entryId = entry.id != null ? String(entry.id) : (entry.entry_id != null ? String(entry.entry_id) : '');
      var categorySlug = (category.slug && String(category.slug)) || '';
      var entryHref = entryId ? 'entry.html?id=' + encodeURIComponent(entryId) + '&category=' + encodeURIComponent(categorySlug) : '#';
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
          '<a class="gallery-item__link" href="' + entryHref + '">' +
            '<span class="gallery-item__image-wrap">' + imgTag + overlay + '</span>' +
          '</a>' +
          '<p class="gallery-item__caption">' + title + '</p>' +
        '</article>'
      );
    }).join('');

    initCategoryImageModal();
    attachImageOrientationListeners();
    attachCategoryGalleryModal();
  }

  var openCategoryImageModal;

  function initCategoryImageModal() {
    if (document.getElementById('category-image-modal')) return;
    var modal = document.createElement('div');
    modal.id = 'category-image-modal';
    modal.className = 'category-image-modal';
    modal.innerHTML =
      '<div class="category-image-modal__overlay"></div>' +
      '<div class="category-image-modal__content">' +
        '<img class="category-image-modal__img" src="" alt="">' +
        '<p class="category-image-modal__title" id="categoryImageModalTitle"></p>' +
      '</div>' +
      '<button class="category-image-modal__close" aria-label="Close image">×</button>' +
      '<button class="category-image-modal__prev" aria-label="Previous image">‹</button>' +
      '<button class="category-image-modal__next" aria-label="Next image">›</button>';
    document.body.appendChild(modal);

    var modalImg = modal.querySelector('.category-image-modal__img');
    var modalTitleEl = modal.querySelector('.category-image-modal__title');
    var closeBtn = modal.querySelector('.category-image-modal__close');
    var prevBtn = modal.querySelector('.category-image-modal__prev');
    var nextBtn = modal.querySelector('.category-image-modal__next');
    var overlay = modal.querySelector('.category-image-modal__overlay');

    var currentImages = [];
    var currentIndex = 0;

    function updateButtons() {
      if (currentImages.length <= 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
      } else {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
      }
    }

    function showImage(index) {
      if (index < 0 || index >= currentImages.length) return;
      currentIndex = index;
      var imgData = currentImages[index];
      modalImg.src = imgData.src;
      modalImg.alt = imgData.alt || 'Fullscreen image';
      if (modalTitleEl) {
        modalTitleEl.textContent = imgData.title || '';
        modalTitleEl.style.display = imgData.title ? '' : 'none';
      }
      updateButtons();
    }

    openCategoryImageModal = function (images, startIndex) {
      if (!images || images.length === 0) return;
      currentImages = images;
      currentIndex = startIndex != null ? startIndex : 0;
      showImage(currentIndex);
      modal.classList.add('category-image-modal--active');
      document.body.style.overflow = 'hidden';
    };

    function closeModal() {
      modal.classList.remove('category-image-modal--active');
      document.body.style.overflow = '';
      if (modalTitleEl) modalTitleEl.textContent = '';
      currentImages = [];
      currentIndex = 0;
    }

    if (closeBtn) closeBtn.addEventListener('click', function (e) { e.stopPropagation(); closeModal(); });
    if (prevBtn) prevBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (currentImages.length > 1) showImage((currentIndex - 1 + currentImages.length) % currentImages.length);
    });
    if (nextBtn) nextBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (currentImages.length > 1) showImage((currentIndex + 1) % currentImages.length);
    });
    if (overlay) overlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('category-image-modal--active')) return;
      if (e.key === 'Escape') closeModal();
      else if (e.key === 'ArrowLeft' && currentImages.length > 1) showImage((currentIndex - 1 + currentImages.length) % currentImages.length);
      else if (e.key === 'ArrowRight' && currentImages.length > 1) showImage((currentIndex + 1) % currentImages.length);
    });
  }

  function attachCategoryGalleryModal() {
    if (!gridEl || !openCategoryImageModal) return;
    var items = gridEl.querySelectorAll('.gallery-item');
    var images = [];
    items.forEach(function (article) {
      var img = article.querySelector('.gallery-item__image');
      var caption = article.querySelector('.gallery-item__caption');
      if (img && img.src) {
        images.push({
          src: img.src || img.getAttribute('src'),
          alt: img.alt || '',
          title: caption ? caption.textContent.trim() : ''
        });
      }
    });
    items.forEach(function (article) {
      var link = article.querySelector('.gallery-item__link');
      var img = article.querySelector('.gallery-item__image');
      if (!link || !img || !img.src) return;
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var src = img.src || img.getAttribute('src');
        if (!src) return;
        var idx = 0;
        for (var i = 0; i < images.length; i++) {
          if (images[i].src === src) { idx = i; break; }
        }
        openCategoryImageModal(images, idx);
      });
    });
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

    var currentCategory = null;
    fetchCategoryBySlug(slug)
      .then(function (category) {
        if (!category) {
          setTitle('Category not found');
          setBreadcrumb('Not found');
          setEmpty('No category found for "' + slug + '". Check the slug in the URL.');
          return null;
        }
        currentCategory = category;
        setTitle(displayCategoryName(category.name || slug));
        setBreadcrumb(displayCategoryName(category.name || slug));
        setIntro(category.description_1 || category['tool-tip text'] || '');
        document.title = displayCategoryName(category.name || slug) + ' – Creative Library';
        return fetchEntriesByCategoryId(category.category_id);
      })
      .then(function (entries) {
        if (entries !== undefined && entries !== null) renderGallery(entries, currentCategory);
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
