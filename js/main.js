// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle Functionality
  const themeToggle = document.getElementById('themeToggle');
  const mobileThemeToggle = document.getElementById('mobileThemeToggle');
  const body = document.body;
  const sunIcon = themeToggle?.querySelector('.sun-icon');
  const moonIcon = themeToggle?.querySelector('.moon-icon');
  const mobileSunIcon = mobileThemeToggle?.querySelector('.sun-icon');
  const mobileMoonIcon = mobileThemeToggle?.querySelector('.moon-icon');
  const logoDark = document.querySelector('.logo-dark');
  const logoLight = document.querySelector('.logo-light');
  const mobileLogoDark = document.querySelector('.mobile-logo .logo-dark');
  const mobileLogoLight = document.querySelector('.mobile-logo .logo-light');

  // Ensure logo-light is visible by default (dark theme shows light logo)
  if (logoLight) {
    logoLight.style.display = 'block';
  }
  if (logoDark) {
    logoDark.style.display = 'none';
  }

  // Define tooltip update function
  const updateTooltips = () => {
    if (body.classList.contains('light-mode')) {
      // In light mode, show tooltip for switching to dark
      if (themeToggle) themeToggle.setAttribute('data-tooltip', 'Embrace the Dark Side');
      if (mobileThemeToggle) mobileThemeToggle.setAttribute('data-tooltip', 'Embrace the Dark Side');
    } else {
      // In dark mode, show tooltip for switching to light
      if (themeToggle) themeToggle.setAttribute('data-tooltip', 'And he said "Let there be Light !"');
      if (mobileThemeToggle) mobileThemeToggle.setAttribute('data-tooltip', 'And he said "Let there be Light !"');
    }
  };

  // Check for saved theme preference or default to dark mode
  const currentTheme = localStorage.getItem('theme') || 'dark';
  if (currentTheme === 'light') {
    body.classList.add('light-mode');
    if (sunIcon) sunIcon.style.display = 'none';
    if (moonIcon) moonIcon.style.display = 'block';
    if (mobileSunIcon) mobileSunIcon.style.display = 'none';
    if (mobileMoonIcon) mobileMoonIcon.style.display = 'block';
    // Light theme shows dark logo
    if (logoDark) logoDark.style.display = 'block';
    if (logoLight) logoLight.style.display = 'none';
    if (mobileLogoDark) mobileLogoDark.style.display = 'block';
    if (mobileLogoLight) mobileLogoLight.style.display = 'none';
  }
  
  // Initialize tooltips based on current theme
  updateTooltips();

  const toggleTheme = () => {
    body.classList.toggle('light-mode');
    
    if (body.classList.contains('light-mode')) {
      localStorage.setItem('theme', 'light');
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
      if (mobileSunIcon) mobileSunIcon.style.display = 'none';
      if (mobileMoonIcon) mobileMoonIcon.style.display = 'block';
      // Light theme shows dark logo
      if (logoDark) logoDark.style.display = 'block';
      if (logoLight) logoLight.style.display = 'none';
      if (mobileLogoDark) mobileLogoDark.style.display = 'block';
      if (mobileLogoLight) mobileLogoLight.style.display = 'none';
    } else {
      localStorage.setItem('theme', 'dark');
      if (sunIcon) sunIcon.style.display = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
      if (mobileSunIcon) mobileSunIcon.style.display = 'block';
      if (mobileMoonIcon) mobileMoonIcon.style.display = 'none';
      // Dark theme shows light logo
      if (logoLight) logoLight.style.display = 'block';
      if (logoDark) logoDark.style.display = 'none';
      if (mobileLogoLight) mobileLogoLight.style.display = 'block';
      if (mobileLogoDark) mobileLogoDark.style.display = 'none';
    }
    
    updateTooltips();
  };
  
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  if (mobileThemeToggle) {
    mobileThemeToggle.addEventListener('click', toggleTheme);
  }


  // Set current date in footer
  const dateLink = document.querySelector('.sidebar-footer .date-link');
  if (dateLink) {
    const now = new Date();
    const day = now.getDate();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();
    
    // Get ordinal suffix for day
    const getOrdinalSuffix = (day) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    const ordinalSuffix = getOrdinalSuffix(day);
    dateLink.textContent = `${day}${ordinalSuffix} ${month} ${year}`;
  }

  // Set active state for mobile navigation
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop() || '';
  const currentHref = window.location.href.toLowerCase();
  
  // First, sync with sidebar navigation if it exists
  const sidebarNavItems = document.querySelectorAll('.navigation a');
  const currentSidebarActive = document.querySelector('.navigation a.active');
  
  if (currentSidebarActive) {
    const sidebarText = currentSidebarActive.querySelector('span')?.textContent || currentSidebarActive.textContent.trim();
    mobileNavItems.forEach(item => {
      item.classList.remove('active');
      if (item.textContent.trim() === sidebarText) {
        item.classList.add('active');
      }
    });
  } else {
    // Fallback: match by URL
    mobileNavItems.forEach(item => {
      item.classList.remove('active');
      const href = item.getAttribute('href');
      
      // Handle home page
      if (href === '#' || href === '' || href === 'index.html' || href === '/') {
        if (currentPage === '' || currentPage === 'index.html' || currentHref.endsWith('/') || currentHref.endsWith('/index.html')) {
          item.classList.add('active');
        }
      } else {
        // Other pages - check if current URL matches the href
        const cleanHref = href.replace(/^\.\//, '').toLowerCase();
        const cleanCurrentPage = currentPage.toLowerCase();
        const cleanHrefPage = cleanHref.replace(/\.html$/, '');
        const cleanCurrentPageNoExt = cleanCurrentPage.replace(/\.html$/, '');
        
        if (cleanHrefPage === cleanCurrentPageNoExt || 
            currentHref.includes(cleanHref) ||
            (cleanHref === 'project.html' && cleanCurrentPageNoExt === 'project')) {
          item.classList.add('active');
        }
      }
    });
  }

  // Mobile only: center the active page in the pill menu
  const mobileNav = document.querySelector('.mobile-nav');
  const activeNavItem = document.querySelector('.mobile-nav-item.active');
  if (mobileNav && activeNavItem && window.matchMedia('(max-width: 48rem)').matches) {
    const centerActive = () => {
      activeNavItem.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'instant' });
    };
    centerActive();
    window.addEventListener('resize', () => {
      if (window.matchMedia('(max-width: 48rem)').matches) centerActive();
    });
  }

  // Current Issues tooltip: show on button hover/focus (use fixed position so it isn't clipped by sidebar)
  const issuesBtn = document.querySelector('.sidebar-footer__issues-btn');
  const issuesTooltip = document.getElementById('sidebar-issues-tooltip');
  const issuesWrap = document.querySelector('.sidebar-footer__issues-wrap');
  if (issuesBtn && issuesTooltip && issuesWrap) {
    const showTooltip = () => {
      const rect = issuesBtn.getBoundingClientRect();
      const gap = 8;
      issuesTooltip.style.setProperty('--tooltip-top', (rect.top - gap) + 'px');
      issuesTooltip.style.setProperty('--tooltip-left', rect.left + 'px');
      issuesTooltip.classList.add('is-visible');
    };
    const hideTooltip = () => issuesTooltip.classList.remove('is-visible');
    issuesBtn.addEventListener('mouseenter', showTooltip);
    issuesBtn.addEventListener('focus', showTooltip);
    issuesWrap.addEventListener('mouseleave', hideTooltip);
    issuesBtn.addEventListener('blur', hideTooltip);
  }

  // Brisbane location: show current time (Brisbane) in tooltip on hover
  const locationWrap = document.querySelector('.home-hero__location-wrap');
  const brisbaneTimeTooltip = document.getElementById('brisbaneTimeTooltip');
  if (locationWrap && brisbaneTimeTooltip) {
    const formatBrisbaneTime = () => {
      return new Date().toLocaleString('en-AU', {
        timeZone: 'Australia/Brisbane',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    };
    let ticker = null;
    const updateTooltip = () => {
      brisbaneTimeTooltip.textContent = formatBrisbaneTime();
    };
    const startTicker = () => {
      updateTooltip();
      ticker = setInterval(updateTooltip, 1000);
    };
    const stopTicker = () => {
      if (ticker) {
        clearInterval(ticker);
        ticker = null;
      }
    };
    locationWrap.addEventListener('mouseenter', startTicker);
    locationWrap.addEventListener('focusin', startTicker);
    locationWrap.addEventListener('mouseleave', stopTicker);
    locationWrap.addEventListener('focusout', stopTicker);
  }

  // Connect with me: load links from about_me table; email/phone are click-to-copy with tooltip
  const linkLinkedIn = document.getElementById('home-link-linkedin');
  const linkBehance = document.getElementById('home-link-behance');
  const linkYouTube = document.getElementById('home-link-youtube');
  const copyEmailBtn = document.getElementById('home-copy-email');
  const copyPhoneBtn = document.getElementById('home-copy-phone');
  const emailTooltip = document.getElementById('home-email-tooltip');
  const phoneTooltip = document.getElementById('home-phone-tooltip');
  const hasConnectRow = linkLinkedIn && linkBehance && linkYouTube && copyEmailBtn && copyPhoneBtn && emailTooltip && phoneTooltip;

  function getText(row, keys) {
    if (!row || typeof row !== 'object') return '';
    for (let i = 0; i < keys.length; i++) {
      const val = row[keys[i]];
      if (val != null && String(val).trim() !== '') return String(val).trim();
    }
    return '';
  }

  function setupCopyButton(button, tooltipEl, value) {
    if (!button || !tooltipEl || !value) return;
    button.setAttribute('data-copy-value', value);
    button.addEventListener('click', () => {
      const v = button.getAttribute('data-copy-value');
      if (!v) return;
      navigator.clipboard.writeText(v).then(() => {
        tooltipEl.textContent = 'Copied';
        setTimeout(() => { tooltipEl.textContent = 'Click to copy'; }, 2000);
      }).catch(() => {});
    });
  }

  const reportIssueLinks = document.querySelectorAll('.report-issue-link');
  const needsAboutMe = hasConnectRow || reportIssueLinks.length > 0;

  if (needsAboutMe && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
    const table = window.SUPABASE_ABOUT_ME_TABLE || 'about_me';
    const endpoint = window.SUPABASE_URL + '/rest/v1/' + encodeURIComponent(table) + '?select=*&limit=1';
    fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: window.SUPABASE_ANON_KEY,
        Authorization: 'Bearer ' + window.SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })
      .then(res => res.ok ? res.json() : Promise.reject(new Error(res.status)))
      .then(data => {
        const row = Array.isArray(data) && data.length ? data[0] : data;
        if (!row) return;
        const linkedin = getText(row, ['linkedin_url', 'linkedin', 'LinkedIn']);
        const behance = getText(row, ['behance_url', 'behance', 'Behance']);
        const youtube = getText(row, ['youtube_url', 'youtube', 'YouTube']);
        const email = getText(row, ['email', 'Email']);
        const mobile = getText(row, ['mobile', 'phone', 'Phone', 'mobile_number']);
        if (hasConnectRow) {
          if (linkedin) linkLinkedIn.href = linkedin;
          if (behance) linkBehance.href = behance;
          if (youtube) linkYouTube.href = youtube;
          setupCopyButton(copyEmailBtn, emailTooltip, email);
          setupCopyButton(copyPhoneBtn, phoneTooltip, mobile);
        }
        if (email && reportIssueLinks.length) {
          reportIssueLinks.forEach(el => { el.href = 'mailto:' + email; });
        }
      })
      .catch(() => {});
  }
});
