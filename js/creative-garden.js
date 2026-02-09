// Creative Library: load categories from Supabase and render as folders.
// Requires js/supabase-config.js.

(function () {
  const url = window.SUPABASE_URL;
  const key = window.SUPABASE_ANON_KEY;
  const table = window.SUPABASE_CATEGORIES_TABLE || 'categories';

  const foldersGrid = document.getElementById('foldersGrid');
  const libraryLoading = document.getElementById('libraryLoading');
  const libraryEmpty = document.getElementById('libraryEmpty');

  function setLoading(show) {
    if (libraryLoading) libraryLoading.style.display = show ? '' : 'none';
    if (libraryEmpty) libraryEmpty.style.display = 'none';
  }

  function setEmpty(msg) {
    if (libraryLoading) libraryLoading.style.display = 'none';
    if (libraryEmpty) {
      libraryEmpty.style.display = '';
      libraryEmpty.textContent = msg || 'No categories yet.';
    }
    if (foldersGrid) foldersGrid.innerHTML = '';
  }

  if (!url || !key) {
    console.warn('Creative Garden: Supabase URL or anon key missing. Set SUPABASE_URL and SUPABASE_ANON_KEY in supabase-config.js');
    setEmpty('Missing Supabase config.');
    return;
  }

  function escapeHtml(s) {
    return String(s ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function displayCategoryName(s) {
    if (!s) return s;
    const str = String(s);
    if (str.toLowerCase() === 'writings') return 'Writings';
    return str;
  }

  function getCategoryLabel(cat) {
    const raw = cat.name || cat.title || cat.category_name || 'Category';
    return displayCategoryName(raw) || raw;
  }

  async function fetchCategories() {
    // categories table: category_id, name, slug, cover_color, writings_count, tool-tip, description_1, description_2
    const select = encodeURIComponent('category_id,name,slug,cover_color,description_1,"tool-tip text"');
    const endpoint =
      `${url}/rest/v1/${table}` +
      `?select=${select}` +
      `&order=category_id.asc`;
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    const body = await res.text();
    if (!res.ok) {
      let errDetail = body;
      try {
        const j = JSON.parse(body);
        if (j.message) errDetail = j.message;
        if (j.details) errDetail += ' ' + j.details;
      } catch (_) {}
      console.error('Creative Garden: categories fetch failed', res.status, errDetail);
      throw new Error(res.status + ': ' + errDetail);
    }

    if (!body || body.trim() === '') return [];
    try {
      return JSON.parse(body);
    } catch (e) {
      console.error('Creative Garden: invalid JSON response', body);
      throw new Error('Invalid response from server');
    }
  }

  function renderFolders(rows) {
    if (!foldersGrid) return;
    setLoading(false);
    if (!rows || rows.length === 0) {
      setEmpty('No categories yet. Add rows to the categories table or check RLS allows read.');
      return;
    }
    if (libraryEmpty) libraryEmpty.style.display = 'none';
    foldersGrid.innerHTML = rows
      .map(function (cat) {
        const label = escapeHtml(getCategoryLabel(cat));
        const id = escapeHtml(String(cat.category_id != null ? cat.category_id : ''));
        const slugRaw = (cat.slug && String(cat.slug).trim()) ? String(cat.slug).trim() : '';
        const href = slugRaw ? 'category.html?slug=' + encodeURIComponent(slugRaw) : '#';
        const tooltipText = cat['tool-tip text'] ? String(cat['tool-tip text']).trim() : '';
        const coverColor = cat.cover_color && /^#[0-9A-Fa-f]{6}$/.test(String(cat.cover_color).trim()) ? String(cat.cover_color).trim() : '';
        const colorStyle = coverColor ? ' style="--folder-color:' + escapeHtml(coverColor) + '"' : '';
        const dataTooltip = tooltipText ? ' data-tooltip="' + escapeHtml(tooltipText) + '"' : '';
        return (
          '<a class="folder" href="' + href + '" data-category-id="' + id + '" data-slug="' + escapeHtml(slugRaw) + '"' + dataTooltip + colorStyle + '>' +
          '<span class="folder__icon" aria-hidden="true">' +
            '<span class="folder__icon-back"></span>' +
            '<span class="folder__icon-contents">' +
              '<span class="folder__icon-line"></span><span class="folder__icon-line"></span><span class="folder__icon-line"></span>' +
            '</span>' +
            '<span class="folder__icon-flap">' +
              '<span class="folder__icon-tab"></span>' +
            '</span>' +
          '</span>' +
          '<span class="folder__label">' + label + '</span>' +
          '</a>'
        );
      })
      .join('');

    attachTooltipListeners();
    attachFolderAnimations();
  }

  var tooltipOffsetX = 10;
  var tooltipOffsetY = 10;

  function getCursorTooltip() {
    var id = 'cursor-tooltip';
    var el = document.getElementById(id);
    if (el) return el;
    el = document.createElement('div');
    el.id = id;
    el.className = 'folder__tooltip folder__tooltip--cursor';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    return el;
  }

  function attachTooltipListeners() {
    if (!foldersGrid) return;
    if (!window.matchMedia('(hover: hover)').matches) return;
    var cursorTooltip = getCursorTooltip();
    var folders = foldersGrid.querySelectorAll('.folder[data-tooltip]');
    folders.forEach(function (folder) {
      var text = folder.getAttribute('data-tooltip') || '';
      if (!text) return;
      folder.addEventListener('mouseenter', function (e) {
        cursorTooltip.textContent = text;
        cursorTooltip.style.left = (e.clientX + tooltipOffsetX) + 'px';
        cursorTooltip.style.top = (e.clientY + tooltipOffsetY) + 'px';
        cursorTooltip.classList.add('folder__tooltip--visible');
      });
      folder.addEventListener('mousemove', function (e) {
        cursorTooltip.style.left = (e.clientX + tooltipOffsetX) + 'px';
        cursorTooltip.style.top = (e.clientY + tooltipOffsetY) + 'px';
      });
      folder.addEventListener('mouseleave', function () {
        cursorTooltip.classList.remove('folder__tooltip--visible');
      });
    });
  }

  function attachFolderAnimations() {
    if (!foldersGrid || typeof gsap === 'undefined') return;
    var folders = foldersGrid.querySelectorAll('.folder');
    folders.forEach(function (folder) {
      var icon = folder.querySelector('.folder__icon');
      var flap = folder.querySelector('.folder__icon-flap');
      if (!icon || !flap) return;

      folder.addEventListener('mouseenter', function () {
        gsap.killTweensOf([icon, flap]);
        gsap.to(icon, { scale: 1.06, duration: 0.4, ease: 'power2.out' });
        gsap.to(flap, {
          rotationX: -52,
          transformOrigin: 'bottom center',
          duration: 0.4,
          ease: 'power2.inOut',
        });
      });

      folder.addEventListener('mouseleave', function () {
        gsap.killTweensOf([icon, flap]);
        gsap.to(icon, { scale: 1, duration: 0.35, ease: 'power2.out' });
        gsap.to(flap, {
          rotationX: 0,
          transformOrigin: 'bottom center',
          duration: 0.35,
          ease: 'power2.inOut',
        });
      });
    });
  }

  setLoading(true);
  fetchCategories()
    .then(renderFolders)
    .catch(function (err) {
      console.error('Creative Garden: failed to load categories', err);
      var msg = 'Unable to load categories.';
      if (err && err.message) {
        if (err.message.indexOf('403') !== -1) msg = 'Access denied (403). Enable read access for the categories table (RLS policy).';
        else if (err.message.indexOf('404') !== -1) msg = 'Table not found (404). Check that the categories table exists.';
        else if (err.message.indexOf('401') !== -1) msg = 'Unauthorized (401). Check Supabase anon key.';
        else msg = 'Unable to load categories. Check console (F12) for details.';
      }
      setEmpty(msg);
    });
})();
