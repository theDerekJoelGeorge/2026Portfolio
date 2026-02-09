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
});
