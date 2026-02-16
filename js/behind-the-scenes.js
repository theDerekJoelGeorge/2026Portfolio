// Behind the Scenes page: fetch heading, description, introduction from Supabase behind_the_scenes table.
(function () {
  var url = window.SUPABASE_URL;
  var key = window.SUPABASE_ANON_KEY;
  var table = window.SUPABASE_BEHIND_THE_SCENES_TABLE || 'behind_the_scenes';

  var headingEl = document.getElementById('btsHeading');
  var descriptionEl = document.getElementById('btsDescription');
  var heroWrapEl = document.getElementById('btsHeroWrap');
  var heroImageEl = document.getElementById('btsHeroImage');
  var introductionEl = document.getElementById('btsIntroduction');
  var inspirationsWrapEl = document.getElementById('btsInspirationsWrap');
  var inspirationsContentEl = document.getElementById('btsInspirationsContent');
  var choicesContentEl = document.getElementById('btsChoicesContent');
  var choicesImgWrapEl = document.getElementById('btsChoicesImgWrap');
  var choicesImageEl = document.getElementById('btsChoicesImage');
  var choicesContent2El = document.getElementById('btsChoicesContent2');
  var choicesImgWrap2El = document.getElementById('btsChoicesImgWrap2');
  var choicesImage2El = document.getElementById('btsChoicesImage2');
  var choicesContent3El = document.getElementById('btsChoicesContent3');
  var choicesImgWrap3El = document.getElementById('btsChoicesImgWrap3');
  var choicesImage3El = document.getElementById('btsChoicesImage3');
  var loadingEl = document.getElementById('btsLoading');
  var errorEl = document.getElementById('btsError');

  function showLoading(show) {
    if (loadingEl) loadingEl.style.display = show ? 'block' : 'none';
    if (errorEl) errorEl.style.display = 'none';
  }

  function showError(message) {
    if (loadingEl) loadingEl.style.display = 'none';
    if (errorEl) {
      errorEl.textContent = message || 'Unable to load Behind the Scenes content.';
      errorEl.style.display = 'block';
    }
  }

  function getText(row, keys) {
    if (!row) return '';
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

  function decodeHtmlEntities(s) {
    if (!s) return s;
    return String(s)
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&');
  }

  function prepareContentHtml(text) {
    if (!text) return text;
    var hasEncodedHtml = /&lt;|&amp;|&gt;|&quot;/.test(text);
    if (hasEncodedHtml) {
      text = decodeHtmlEntities(text);
    }
    text = linkifyAll(text);
    return text;
  }

  function applyContentLinkStyle(el) {
    if (!el) return;
    var links = el.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      links[i].classList.add('bts-content-link');
    }
  }

  function lazyLoadInspirationVideos() {
    if (!inspirationsContentEl) return;
    var videos = inspirationsContentEl.querySelectorAll('.bts-inspiration-video[data-src]');
    if (!videos.length) return;
    var io = window.IntersectionObserver && new IntersectionObserver(function (entries) {
      for (var e = 0; e < entries.length; e++) {
        var entry = entries[e];
        if (!entry.isIntersecting) continue;
        var video = entry.target;
        var src = video.getAttribute('data-src');
        if (src) {
          video.src = src;
          video.removeAttribute('data-src');
        }
        io.unobserve(video);
      }
    }, { rootMargin: '100px', threshold: 0.01 });
    if (io) {
      for (var v = 0; v < videos.length; v++) io.observe(videos[v]);
    } else {
      for (var v = 0; v < videos.length; v++) {
        var vid = videos[v];
        if (vid.getAttribute('data-src')) {
          vid.src = vid.getAttribute('data-src');
          vid.removeAttribute('data-src');
        }
      }
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

  function linkifyPortfolioUrl(text) {
    if (!text) return text;
    var urlText = 'thederekjoelgeorge.github.io/Design-Portfolio';
    var fullUrl = 'https://' + urlText;
    var linkHtml = '<a class="bts-content-link" href="' + fullUrl + '" target="_blank" rel="noopener noreferrer">' + urlText + '</a>';
    return text.replace(new RegExp(urlText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), linkHtml);
  }

  function linkifyJonHowell(text) {
    if (!text) return text;
    var href = 'https://www.jonhowell.com/';
    var displayText = 'jonhowell.com';
    var linkHtml = '<a class="bts-content-link" href="' + href + '" target="_blank" rel="noopener noreferrer">' + displayText + '</a>';
    // Replace exact URL strings (order: with trailing slash first, then without)
    text = text.split('https://www.jonhowell.com/').join(linkHtml);
    text = text.split('https://www.jonhowell.com').join(linkHtml);
    text = text.split('http://www.jonhowell.com/').join(linkHtml);
    text = text.split('http://www.jonhowell.com').join(linkHtml);
    text = text.split('www.jonhowell.com/').join(linkHtml);
    text = text.split('www.jonhowell.com').join(linkHtml);
    return text;
  }

  function linkifyHelloSid(text) {
    if (!text) return text;
    var href = 'https://hellosid.in/';
    var placeholder = '\u200BHELLOSID_LINK\u200B'; // zero-width space so placeholder is unique
    var linkHtml = '<a class="bts-content-link" href="' + href + '" target="_blank" rel="noopener noreferrer">' + placeholder + '</a>';
    text = text.split('https://hellosid.in/').join(linkHtml);
    text = text.split('https://hellosid.in').join(linkHtml);
    text = text.split('http://hellosid.in/').join(linkHtml);
    text = text.split('http://hellosid.in').join(linkHtml);
    text = text.split('www.hellosid.in/').join(linkHtml);
    text = text.split('www.hellosid.in').join(linkHtml);
    text = text.split('hellosid.in').join(linkHtml);
    text = text.split(placeholder).join('hellosid.in');
    return text;
  }

  function linkifyAll(text) {
    return linkifyHelloSid(linkifyJonHowell(linkifyPortfolioUrl(text)));
  }

  function render(row) {
    if (!row) return;

    var heading = getText(row, ['heading', 'title', 'name']);
    var description = getText(row, ['description', 'desc', 'summary']);
    var introduction = getText(row, ['introduction', 'Introduction', 'intro', 'description_1', 'paragraph_1', 'body', 'content']);
    var choiceP1 = getText(row, ['choice_p1']);
    var choiceImg1Raw = row.choice_img1 != null ? String(row.choice_img1).trim() : '';
    var choiceImg1Url = choiceImg1Raw ? resolveImageUrl(choiceImg1Raw) : '';
    var choiceP2 = getText(row, ['choice_p2']);
    var choiceImg2Raw = row.choice_img2 != null ? String(row.choice_img2).trim() : '';
    var choiceImg2Url = choiceImg2Raw ? resolveImageUrl(choiceImg2Raw) : '';
    var choiceP3 = getText(row, ['choice_p3']);
    var choiceImg3Raw = row.choice_img3 != null ? String(row.choice_img3).trim() : '';
    var choiceImg3Url = choiceImg3Raw ? resolveImageUrl(choiceImg3Raw) : '';
    var heroUrl = getHeroImageUrl(row);

    if (headingEl) {
      headingEl.textContent = heading || 'Behind the Scenes';
      headingEl.style.display = 'block';
    }
    if (descriptionEl) {
      if (description) {
        descriptionEl.innerHTML = prepareContentHtml(description);
        applyContentLinkStyle(descriptionEl);
        descriptionEl.style.display = 'block';
      } else {
        descriptionEl.style.display = 'none';
      }
    }
    if (heroWrapEl && heroImageEl) {
      if (heroUrl) {
        heroImageEl.src = heroUrl;
        heroWrapEl.style.display = 'block';
      } else {
        heroWrapEl.style.display = 'none';
      }
    }
    if (introductionEl) {
      if (introduction) {
        introductionEl.innerHTML = prepareContentHtml(introduction);
        applyContentLinkStyle(introductionEl);
        introductionEl.style.display = 'block';
      } else {
        introductionEl.style.display = 'none';
      }
    }

    if (inspirationsWrapEl && inspirationsContentEl) {
      var items = [];
      var order = [2, 1, 3, 4, 5, 6, 7, 8, 9, 10];
      for (var o = 0; o < order.length; o++) {
        var i = order[o];
        var textKey = 'inspiration_text' + i;
        var imgKey = 'inspiration_img' + i;
        var descKey = 'img' + i + '_description';
        var text = getText(row, [textKey]);
        var imgRaw = row[imgKey] != null ? String(row[imgKey]).trim() : '';
        var imgUrl = imgRaw ? resolveImageUrl(imgRaw) : '';
        var caption = getText(row, [descKey]);
        if (text || imgUrl) {
          items.push({ text: text, imgUrl: imgUrl, caption: caption });
        }
      }
      if (items.length) {
        var parts = [];
        for (var j = 0; j < items.length; j++) {
          var it = items[j];
          parts.push('<div class="bts-inspiration-item">');
          if (it.text) {
            var safeText = escapeHtml(it.text);
            parts.push('<p class="bts-inspiration-text">' + linkifyAll(safeText) + '</p>');
          }
          if (it.imgUrl) {
            parts.push('<div class="bts-inspiration-media-wrap">');
            parts.push('<video class="bts-inspiration-video" data-src="' + it.imgUrl.replace(/"/g, '&quot;') + '" loop muted playsinline autoplay preload="none"></video>');
            if (it.caption) {
              parts.push('<p class="bts-inspiration-caption">' + escapeHtml(it.caption) + '</p>');
            }
            parts.push('</div>');
          }
          parts.push('</div>');
        }
        inspirationsContentEl.innerHTML = parts.join('');
        applyContentLinkStyle(inspirationsContentEl);
        lazyLoadInspirationVideos();
        inspirationsWrapEl.style.display = 'block';
      } else {
        inspirationsWrapEl.style.display = 'none';
      }
    }

    if (choicesContentEl) {
      if (choiceP1) {
        choicesContentEl.innerHTML = prepareContentHtml(choiceP1);
        applyContentLinkStyle(choicesContentEl);
        choicesContentEl.style.display = '';
      } else {
        choicesContentEl.innerHTML = '';
        choicesContentEl.style.display = 'none';
      }
    }
    if (choicesImgWrapEl && choicesImageEl) {
      if (choiceImg1Url) {
        choicesImageEl.src = choiceImg1Url;
        choicesImgWrapEl.style.display = 'block';
      } else {
        choicesImgWrapEl.style.display = 'none';
      }
    }
    if (choicesContent2El) {
      if (choiceP2) {
        choicesContent2El.innerHTML = prepareContentHtml(choiceP2);
        applyContentLinkStyle(choicesContent2El);
        choicesContent2El.style.display = '';
      } else {
        choicesContent2El.innerHTML = '';
        choicesContent2El.style.display = 'none';
      }
    }
    if (choicesImgWrap2El && choicesImage2El) {
      if (choiceImg2Url) {
        choicesImage2El.src = choiceImg2Url;
        choicesImgWrap2El.style.display = 'block';
      } else {
        choicesImgWrap2El.style.display = 'none';
      }
    }
    if (choicesContent3El) {
      if (choiceP3) {
        choicesContent3El.innerHTML = prepareContentHtml(choiceP3);
        applyContentLinkStyle(choicesContent3El);
        choicesContent3El.style.display = '';
      } else {
        choicesContent3El.innerHTML = '';
        choicesContent3El.style.display = 'none';
      }
    }
    if (choicesImgWrap3El && choicesImage3El) {
      if (choiceImg3Url) {
        choicesImage3El.src = choiceImg3Url;
        choicesImgWrap3El.style.display = 'block';
      } else {
        choicesImgWrap3El.style.display = 'none';
      }
    }

    showLoading(false);
  }

  function load() {
    if (!url || !key) {
      showError('Supabase is not configured.');
      return;
    }
    showLoading(true);

    var endpoint = url + '/rest/v1/' + encodeURIComponent(table) + '?select=*&limit=1';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', endpoint, true);
    xhr.setRequestHeader('apikey', key);
    xhr.setRequestHeader('Authorization', 'Bearer ' + key);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var data = JSON.parse(xhr.responseText);
          var row = Array.isArray(data) && data.length ? data[0] : data;
          render(row);
        } catch (e) {
          showError('Invalid response from server.');
        }
      } else {
        var msg = 'Unable to load content.';
        if (xhr.status === 403) msg = 'Access denied. Check RLS for the behind_the_scenes table.';
        else if (xhr.status === 404) msg = 'Table not found. Create the behind_the_scenes table in Supabase.';
        showError(msg);
      }
    };
    xhr.onerror = function () {
      showError('Network error. Please try again.');
    };
    xhr.send();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
