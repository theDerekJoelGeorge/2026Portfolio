// About Me page: fetch content from Supabase about_me table.
// Order: description_1 → hero image → paragraph_2
(function () {
  var url = window.SUPABASE_URL;
  var key = window.SUPABASE_ANON_KEY;
  var table = window.SUPABASE_ABOUT_ME_TABLE || 'about_me';

  var loadingEl = document.getElementById('aboutMeLoading');
  var contentEl = document.getElementById('aboutMeContent');
  var errorEl = document.getElementById('aboutMeError');

  function showLoading(show) {
    if (loadingEl) loadingEl.style.display = show ? 'block' : 'none';
    if (contentEl) contentEl.style.display = show ? 'none' : 'block';
    if (errorEl) errorEl.style.display = 'none';
  }

  function showError(message) {
    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'none';
    if (errorEl) {
      errorEl.textContent = message || 'Unable to load About Me content.';
      errorEl.style.display = 'block';
    }
  }

  function resolveImageUrl(raw) {
    if (!raw || typeof raw !== 'string') return '';
    var s = raw.trim();
    if (!s) return '';
    return window.resolveSupabaseStorageUrl ? window.resolveSupabaseStorageUrl(s) : (s.indexOf('http://') === 0 || s.indexOf('https://') === 0 ? s : url + '/storage/v1/object/public/' + (s.charAt(0) === '/' ? s.slice(1) : (window.SUPABASE_STORAGE_BUCKET || 'images') + '/' + s));
  }

  function getHeroImageUrl(row) {
    var raw = row['Hero Image'] || row['hero image'] || row.hero_image || row.hero_image_url ||
      row.image || row.image_url || row.photo || row.photo_url || row.url || row.cover_image || '';
    return resolveImageUrl(String(raw || '').trim());
  }

  function getSlideImageUrls(row) {
    var urls = [];
    for (var i = 1; i <= 6; i++) {
      var raw = row['img' + i] || row['img ' + i] || row['image' + i] || '';
      var resolved = resolveImageUrl(String(raw || '').trim());
      if (resolved) urls.push(resolved);
    }
    return urls;
  }

  function getSlideImageUrlsSecond(row) {
    var urls = [];
    for (var i = 7; i <= 10; i++) {
      var raw = row['img' + i] || row['img ' + i] || row['image' + i] || '';
      var resolved = resolveImageUrl(String(raw || '').trim());
      if (resolved) urls.push(resolved);
    }
    return urls;
  }

  function getText(row, keys) {
    for (var i = 0; i < keys.length; i++) {
      var val = row[keys[i]];
      if (val != null && String(val).trim() !== '') return String(val).trim();
    }
    return '';
  }

  function escapeHtml(s) {
    if (!s) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function render(data) {
    if (!contentEl) return;
    var row = Array.isArray(data) && data.length ? data[0] : data;
    if (!row) {
      contentEl.innerHTML = '';
      return;
    }

    var desc1 = getText(row, ['description 1', 'description_1', 'description1']);
    var paragraph2 = getText(row, ['paragraph 2', 'paragraph_2', 'paragraph2', 'description_2', 'description2']);
    var paragraph3 = getText(row, ['paragraph 3', 'paragraph_3', 'paragraph3', 'description_3', 'description3']);
    var paragraph4 = getText(row, ['paragraph 4', 'paragraph_4', 'paragraph4', 'description_4', 'description4']);
    var paragraph5 = getText(row, ['paragraph 5', 'paragraph_5', 'paragraph5', 'description_5', 'description5']);
    var tldr1 = getText(row, ['tldr-1', 'tldr_1', 'tldr1']);
    var tldr2 = getText(row, ['tldr-2', 'tldr_2', 'tldr2']);
    var heroUrl = getHeroImageUrl(row);
    var slideUrls = getSlideImageUrls(row);
    var slideUrlsSecond = getSlideImageUrlsSecond(row);

    var parts = [];

    // 1. Description 1 first
    if (desc1) {
      parts.push('<div class="about-me__section about-me__description1 category-intro">' + escapeHtml(desc1) + '</div>');
    }

    // 2. Hero image
    if (heroUrl) {
      parts.push(
        '<div class="about-me__section about-me__hero">' +
          '<img class="about-me__hero-image" src="' + heroUrl.replace(/"/g, '&quot;') + '" alt="" loading="lazy" decoding="async">' +
        '</div>'
      );
    }

    // 3. Subheading then Paragraph 2
    if (paragraph2) {
      parts.push('<div class="about-me__section"><h2 class="about-me__subheading">What made me switch to HCI?</h2></div>');
      parts.push('<div class="about-me__section about-me__paragraph2 category-intro">' + escapeHtml(paragraph2) + '</div>');
    }

    // 4. Paragraph 3
    if (paragraph3) {
      parts.push('<div class="about-me__section about-me__paragraph3 category-intro">' + escapeHtml(paragraph3) + '</div>');
    }
    if (tldr1) {
      parts.push('<div class="about-me__section"><div class="about-me__tldr">' + escapeHtml(tldr1) + '</div></div>');
    }

    // 5. Auto-scrolling slideshow (img1–img6), track duplicated for infinite loop
    if (slideUrls.length > 0) {
      var slideHtml = slideUrls.map(function (src) {
        return '<div class="about-me__slide"><img class="about-me__slide-image" src="' + src.replace(/"/g, '&quot;') + '" alt="" loading="lazy" decoding="async"></div>';
      }).join('');
      parts.push(
        '<div class="about-me__section about-me__slideshow-wrap">' +
          '<p class="about-me__slideshow-caption">My Time at The University of Queensland.</p>' +
          '<div class="about-me__slideshow about-me__slideshow--auto" aria-label="Image gallery">' +
            '<div class="about-me__slideshow-track">' + slideHtml + slideHtml + '</div>' +
          '</div>' +
        '</div>'
      );
    }

    // 6. Paragraph 4
    if (paragraph4) {
      parts.push('<div class="about-me__section about-me__paragraph4 category-intro">' + escapeHtml(paragraph4) + '</div>');
    }

    // 7. Paragraph 5
    if (paragraph5) {
      parts.push('<div class="about-me__section about-me__paragraph5 category-intro">' + escapeHtml(paragraph5) + '</div>');
    }
    if (tldr2) {
      parts.push('<div class="about-me__section"><div class="about-me__tldr">' + escapeHtml(tldr2) + '</div></div>');
    }

    // 8. Second auto-scrolling slideshow (img7–img10)
    if (slideUrlsSecond.length > 0) {
      var slideHtmlSecond = slideUrlsSecond.map(function (src) {
        return '<div class="about-me__slide"><img class="about-me__slide-image" src="' + src.replace(/"/g, '&quot;') + '" alt="" loading="lazy" decoding="async"></div>';
      }).join('');
      parts.push(
        '<div class="about-me__section about-me__slideshow-wrap">' +
          '<div class="about-me__slideshow about-me__slideshow--auto" aria-label="Image gallery">' +
            '<div class="about-me__slideshow-track">' + slideHtmlSecond + slideHtmlSecond + '</div>' +
          '</div>' +
        '</div>'
      );
    }

    contentEl.innerHTML = parts.length ? parts.join('') : '';
  }

  function run() {
    if (!url || !key) {
      showError('Supabase is not configured.');
      return;
    }

    showLoading(true);
    if (typeof window.showLoader === 'function') window.showLoader();

    var endpoint = url + '/rest/v1/' + encodeURIComponent(table) + '?select=*&limit=1';
    fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then(function (res) {
        if (!res.ok) throw new Error('About Me fetch: ' + res.status);
        return res.json();
      })
      .then(function (data) {
        showLoading(false);
        render(data);
      })
      .catch(function (err) {
        showLoading(false);
        showError(err && err.message ? err.message : 'Failed to load About Me.');
      })
      .finally(function () {
        if (typeof window.hideLoader === 'function') window.hideLoader();
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
