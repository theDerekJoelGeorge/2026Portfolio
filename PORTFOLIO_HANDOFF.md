# Portfolio Handoff Document

Handoff guide for another agent porting or recreating Derek Joel George's portfolio while preserving design patterns, Supabase integration, Creative Library folder icons, and the **Do not Click** easter egg.

---

## Project Stack Overview


| Layer               | Technology                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| Frontend            | Static HTML, vanilla CSS, vanilla JavaScript (no React/Next/Vue)                                 |
| Styling             | Plain CSS with CSS custom properties (no Tailwind, no CSS preprocessor)                          |
| Backend / CMS       | [Supabase](https://supabase.com) — PostgREST API + Storage                                       |
| Animation (folders) | [GSAP 3.12.5](https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js) — Creative Library only |
| Icons               | [Font Awesome 6.4.0](https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css)  |
| Fonts               | [Manrope](https://fonts.google.com/specimen/Manrope) via Google Fonts                            |
| Hosting / Analytics | Vercel (`/_vercel/insights/script.js`)                                                           |
| Game engine         | Native HTML5 Canvas 2D API (Pong easter egg) — no Phaser or game library                         |


There is **no build step**, **no bundler**, and **no `@supabase/supabase-js` client**. All Supabase access uses `fetch()` against the REST API with the anon key.

---

## Architecture Overview

```mermaid
flowchart TB
  subgraph pages [HTML Pages]
    index[index.html - Home]
    project[project.html / case-study.html]
    creative[creative-garden.html]
    category[category.html]
    entry[entry.html]
    about[about-me.html]
    bts[behind-the-scenes.html]
    resume[resume.html]
    experiments[experiments.html]
  end

  subgraph shared [Shared Layer]
  reset[css/reset.css]
  layout[css/layout.css]
  style[css/style.css - tokens]
  loader[js/loader.js]
  config[js/supabase-config.js]
  storage[js/supabase-storage.js]
  main[js/main.js]
  issues[js/website-issues.js]
  end

  subgraph supabase [Supabase]
  db[(Postgres tables)]
  bucket[(Storage bucket: images)]
  end

  index --> main
  index --> break[js/break-website.js]
  creative --> garden[js/creative-garden.js]
  garden --> gsap[GSAP CDN]
  project --> case[js/case-studies.js]
  category --> cat[js/category.js]
  entry --> ent[js/entry.js]
  about --> aboutjs[js/about-me.js]
  bts --> btsjs[js/behind-the-scenes.js]

  config --> db
  storage --> bucket
  garden --> db
  cat --> db
  case --> db
```



### Page → Script → CSS map


| Page                     | Page-specific CSS         | Page-specific JS               |
| ------------------------ | ------------------------- | ------------------------------ |
| `index.html`             | `css/home.css`            | `js/break-website.js`          |
| `project.html`           | `css/case-studies.css`    | `js/case-studies.js`           |
| `case-study.html`        | `css/case-studies.css`    | `js/case-studies.js`           |
| `creative-garden.html`   | `css/creative-garden.css` | `js/creative-garden.js` + GSAP |
| `category.html`          | `css/category.css`        | `js/category.js`               |
| `entry.html`             | `css/entry.css`           | `js/entry.js`                  |
| `about-me.html`          | (shared only)             | `js/about-me.js`               |
| `behind-the-scenes.html` | `css/category.css`        | `js/behind-the-scenes.js`      |
| `resume.html`            | `css/resume.css`          | inline accordion script        |
| `experiments.html`       | `css/experiments.css`     | —                              |


**Every page** loads (in order): `reset.css` → `layout.css` → `style.css` → `loader.css` → page CSS → `loader.js` → `supabase-config.js` → (`supabase-storage.js` where images are used) → `main.js` → `website-issues.js` → page JS.

---

## File / Folder Structure

```
2026Portfolio/
├── index.html                 # Home + Do not Click easter egg overlay
├── project.html               # Case studies list
├── case-study.html            # Case study detail (?slug=)
├── creative-garden.html       # Creative Library folder grid
├── category.html              # Category gallery (?slug=)
├── entry.html                 # Single entry/article (?id=&category=)
├── about-me.html
├── behind-the-scenes.html
├── resume.html
├── experiments.html
├── entry.html
├── css/
│   ├── reset.css              # Modern CSS reset + reduced-motion
│   ├── layout.css             # Sidebar, content, mobile nav breakpoints
│   ├── style.css              # Design tokens, theme, shared components
│   ├── loader.css             # Logo fill/empty loader animation
│   ├── home.css               # Home page + break-website overlay + Pong
│   ├── case-studies.css
│   ├── creative-garden.css    # Folder icon styles
│   ├── category.css           # Gallery, breadcrumbs, image modal
│   ├── entry.css
│   ├── resume.css
│   ├── experiments.css
│   └── notebook-modal.css     # LEGACY — not linked by any HTML page
├── js/
│   ├── supabase-config.js     # URL, anon key, table name constants
│   ├── supabase-storage.js    # resolveSupabaseStorageUrl()
│   ├── main.js                # Theme, nav, home interactions, about_me fetch
│   ├── loader.js              # showLoader / hideLoader API
│   ├── website-issues.js      # Sidebar issues tooltip from Supabase
│   ├── break-website.js       # Do not Click easter egg + Pong game
│   ├── creative-garden.js     # Folder grid from categories table
│   ├── category.js            # Category gallery + lightbox modal
│   ├── entry.js               # Entry detail page
│   ├── case-studies.js        # Projects list + detail renderer
│   ├── about-me.js
│   ├── behind-the-scenes.js
│   └── entry.js
├── images/                    # Static assets (logos, avatar, flag, resume PDF)
├── SUPABASE_SETUP.md          # Legacy notebooks table guide (see note below)
└── PORTFOLIO_HANDOFF.md       # This file
```

> **Note:** `SUPABASE_SETUP.md` documents an older `notebooks` table. The live site uses `categories` + `category_entries`. Treat `SUPABASE_SETUP.md` as historical reference only.

---

## Styles & Typography

### CSS architecture

1. `**css/reset.css`** — box-sizing, margin/padding reset, `prefers-reduced-motion` disables animations.
2. `**css/layout.css**` — structural layout: `.container`, fixed `.sidebar` (16rem), `.content` margins, mobile header/nav.
3. `**css/style.css**` — design tokens (`:root`), theme toggle, sidebar footer, click ripple, shared tooltip patterns.
4. **Page CSS** — scoped to one feature area.

There is **no Tailwind** and **no shared component library**. Patterns are repeated via BEM-ish class names and CSS variables.

### Design tokens (`css/style.css` `:root`)

```css
/* Text */
--color-heading: #ffffff;
--color-heading-light: #1a1a1a;
--color-subheading: #8b8b8b;
--color-subheading-light: #666666;
--color-body: #8b8b8b;
--color-body-light: #666666;
--color-nav-link: #a0a0a0;
--color-nav-link-active: #ffffff;
--color-nav-link-light: #666666;
--color-nav-link-active-light: #1a1a1a;
--color-link: #4a9eff;
--color-link-light: #0066cc;

/* Backgrounds */
--bg-primary: #1E1E1E;
--bg-primary-light: #f5f5f5;
--bg-sidebar: #171717;
--bg-sidebar-light: #ffffff;
--bg-content: #1E1E1E;
--bg-content-light: #f5f5f5;

/* Hero / accents */
--hero-text: #ffffff;
--hero-text-light: #171717;
--hero-role-teal: #2dd4bf;       /* cycling role text, dark mode */
--hero-role-teal-light: #0f766e; /* cycling role text, light mode */
--hero-eye-oval: #ffffff;
--hero-eye-pupil: #000000;
--accent-sun: #ffd700;             /* theme toggle hover */
--accent-moon: #ff0000;
--accent-tooltip: rgba(0, 0, 0, 0.9);
--accent-tooltip-light: rgba(255, 255, 255, 0.9);
```

### Typography


| Element               | Font                   | Size                              | Weight           | Notes                            |
| --------------------- | ---------------------- | --------------------------------- | ---------------- | -------------------------------- |
| `body`                | Manrope + system stack | `16px` / `1rem`                   | 400              | `line-height: 1.5`               |
| `.navigation a`       | inherit                | `1rem`                            | 400 (700 active) | Sidebar nav                      |
| `.sidebar-footer`     | inherit                | `0.75rem`                         | 400              | Last updated, report issue       |
| `.page-title`         | inherit                | `1.5rem` (1.25rem mobile)         | 600              | Case studies, Creative Library   |
| `.page-intro`         | inherit                | `1rem` (0.875rem mobile)          | 400              | Subtitle under page title        |
| `.home-hero__name`    | inherit                | `5rem` desktop / `2.25rem` mobile | 900              | Uppercase, `-0.02em` tracking    |
| `.home-hero__tagline` | inherit                | `0.8125rem`                       | 700              | Uppercase, `0.08em` tracking     |
| `.home-intro`         | inherit                | `1rem`                            | 400              | `#cccccc` dark / `#525252` light |
| `.home-subheading`    | inherit                | `0.875rem`                        | 700              | Uppercase, `0.12em` tracking     |
| Breadcrumbs           | inherit                | `0.875rem`                        | 400              | `#8b8b8b`                        |
| Tooltips              | inherit                | `0.6875rem`–`0.75rem`             | 400–600          | Dark tooltip bg                  |


**Google Fonts load:**

```html
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

Home page uses weight **800/900** for the hero name; other pages typically load `400;500;600;700`.

### Breakpoints


| Breakpoint                                  | Behavior                                                                                                                     |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `min-width: 1281px`                         | Desktop: fixed sidebar, centered content (`max-width: 64rem`), home hero vertically centered, name-eye pupil effects enabled |
| `max-width: 1280px`                         | Mobile: sidebar hidden, `.mobile-header` + pill `.mobile-nav`, larger folder icons, most tooltips hidden                     |
| `min-width: 1281px` and `max-width: 1920px` | Reduced content padding: `6.5rem 2rem 3rem 2rem`                                                                             |


Primary mobile/desktop split is `**1280px` / `1281px`** everywhere.

### Spacing conventions

- Content desktop padding: `6.5rem 15rem 3rem 15rem` (wide) → `6.5rem 2rem` (1281–1920px) → `2rem 0.5rem` (mobile)
- Sidebar: `16rem` wide, `2.5rem 2rem` padding
- Content left margin: `22rem` (sidebar + gap)
- Section gaps: `1.5rem`–`2rem` between blocks
- Tooltip offset: `0.35rem`–`0.5rem` above trigger

### Dark / light mode

- Toggle: `#themeToggle` / `#mobileThemeToggle` in `js/main.js`
- Mechanism: `body.classList.toggle('light-mode')`
- Persistence: `localStorage.setItem('theme', 'light'|'dark')`, default **dark**
- Logo swap: dark theme → `Logo-light.png`; light theme → `Logo-dark.png`
- All token overrides use `body.light-mode` selectors in `style.css` and page CSS

### Shared UI patterns


| Pattern              | Location               | Class / ID                                                       |
| -------------------- | ---------------------- | ---------------------------------------------------------------- |
| Sidebar + mobile nav | All pages              | `.sidebar`, `.mobile-header`, `.mobile-nav`                      |
| Theme toggle         | Sidebar footer         | `#themeToggle`, `#mobileThemeToggle`                             |
| Issues tooltip       | Sidebar footer         | `.sidebar-footer__issues-btn`, `#sidebar-issues-tooltip`         |
| Last updated date    | Sidebar                | `.date-link` — fetched from GitHub API                           |
| Click ripple         | Global                 | `.click-ripple` — created on every click in `main.js`            |
| Back to top          | Long pages             | `#backToTop` — `.is-visible` after 400px scroll                  |
| Loader overlay       | Global                 | `.loader-overlay` — `js/loader.js`                               |
| Breadcrumbs          | Case studies, category | `.breadcrumbs`, `.breadcrumbs__list`                             |
| Tooltips             | Various                | `role="tooltip"`, hover/focus reveal, `var(--accent-tooltip)` bg |


---

## Creative Library / Folder Icons

### Overview

The Creative Library (`creative-garden.html`) displays category folders fetched from Supabase `categories` table. Each folder is a **pure CSS icon** (no image sprites) with a **GSAP flap-open animation** on hover. Click navigates to `category.html?slug={slug}`.

### Data source

**Table:** `categories` (config: `window.SUPABASE_CATEGORIES_TABLE`)

**Columns used** (`js/creative-garden.js`):


| Column          | Purpose                                                    |
| --------------- | ---------------------------------------------------------- |
| `category_id`   | Primary key, sort order                                    |
| `name`          | Display label (fallback: `title`, `category_name`)         |
| `slug`          | URL slug → `category.html?slug=`                           |
| `cover_color`   | Hex `#RRGGBB` → CSS `--folder-color`                       |
| `description_1` | Not shown on grid (used on category page)                  |
| `tool-tip text` | Hover tooltip (column name has a space — quoted in select) |


**REST query:**

```
GET {SUPABASE_URL}/rest/v1/categories
  ?select=category_id,name,slug,cover_color,description_1,"tool-tip text"
  &order=category_id.asc
```

Headers: `apikey`, `Authorization: Bearer {anon key}`, `Accept: application/json`

### Folder icon DOM structure

Rendered by `renderFolders()` in `js/creative-garden.js`:

```html
<a class="folder" href="category.html?slug=photo-logs"
   data-category-id="1" data-slug="photo-logs"
   data-tooltip="optional tooltip" style="--folder-color:#E8B923">
  <span class="folder__icon" aria-hidden="true">
    <span class="folder__icon-back"></span>
    <span class="folder__icon-contents">
      <span class="folder__icon-line"></span>
      <span class="folder__icon-line"></span>
      <span class="folder__icon-line"></span>
    </span>
    <span class="folder__icon-flap">
      <span class="folder__icon-tab"></span>
    </span>
  </span>
  <span class="folder__label">Photo Logs</span>
</a>
```

### Folder icon CSS (`css/creative-garden.css`)


| Part                     | Size                              | Color                                                |
| ------------------------ | --------------------------------- | ---------------------------------------------------- |
| `.folder__icon`          | `5rem × 4rem` (6.5×5.2rem mobile) | —                                                    |
| `.folder__icon-back`     | full inset                        | `var(--folder-color, #E8B923)`                       |
| `.folder__icon-flap`     | full inset, `z-index: 2`          | same as back                                         |
| `.folder__icon-tab`      | `2rem × 0.5rem`, top `-0.5rem`    | `color-mix(in srgb, var(--folder-color) 55%, black)` |
| `.folder__icon-contents` | inset papers                      | `#faf8f0` / `#e8e4d8` dark                           |
| `.folder__icon-line`     | `0.2rem` height                   | simulated text lines                                 |


3D flap uses `transform-style: preserve-3d` and `perspective: 24rem` on `.folder__icon`.

### Hover animation (GSAP)

`attachFolderAnimations()` in `js/creative-garden.js`:

- **mouseenter:** icon `scale: 1.06`; flap `rotationX: -52`, `transformOrigin: 'bottom center'`, `duration: 0.4`, `ease: 'power2.inOut'`
- **mouseleave:** reset scale and `rotationX: 0`, `duration: 0.35`
- Requires GSAP loaded before `creative-garden.js`

### Cursor tooltip

- Single shared `#cursor-tooltip` element appended to `document.body`
- Class: `.folder__tooltip.folder__tooltip--cursor`
- Follows mouse at `+10px` offset; only on `(hover: hover)` devices
- Text from `data-tooltip` attribute

### Navigation flow

```
creative-garden.html
  → click folder
  → category.html?slug={slug}
    → category.js loads category + category_entries
    → writings → entry.html?id={id}&category=writings
    → photos → inline gallery + lightbox modal
    → videos → YouTube embeds
```

### Step-by-step: recreate folder icons

1. Copy `css/creative-garden.css` folder block (`.folder` through `.folder__label`).
2. Load GSAP 3.12.5 on the page.
3. Fetch categories from Supabase REST (or hardcode for static prototype).
4. For each row, emit the DOM structure above; set `style="--folder-color:#hex"` when `cover_color` is valid 6-digit hex.
5. Call GSAP hover listeners on `.folder__icon` and `.folder__icon-flap`.
6. Optionally attach cursor tooltip listeners for `data-tooltip`.
7. Link each folder to your category route.

---

## Supabase Integration

### Configuration (`js/supabase-config.js`)

```javascript
window.SUPABASE_URL = 'https://kftstjcyxaarrsqnbape.supabase.co';
window.SUPABASE_ANON_KEY = '...'; // anon/public key — safe with RLS
window.SUPABASE_PROJECTS_TABLE = 'projects';
window.SUPABASE_CATEGORIES_TABLE = 'categories';
window.SUPABASE_CATEGORY_ENTRIES_TABLE = 'category_entries';
window.SUPABASE_ABOUT_ME_TABLE = 'about_me';
window.SUPABASE_BEHIND_THE_SCENES_TABLE = 'behind_the_scenes';
window.SUPABASE_WEBSITE_ISSUES_TABLE = 'website_issues';
window.SUPABASE_STORAGE_BUCKET = 'images'; // default in storage helper
window.SUPABASE_IMAGE_TRANSFORM = false;   // set true on Pro for resize/quality
```

There is **no `.env` file** — credentials are committed in `supabase-config.js`. For a new project, use environment injection at deploy time or a generated config file.

### Auth

**None.** All reads use the **anon key** with Row Level Security policies allowing public `SELECT`. No user login, no `@supabase/supabase-js` session.

### REST API pattern

Every fetch uses:

```javascript
headers: {
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
  Accept: 'application/json'
}
```

Single-object responses (case study detail): add `Accept: 'application/vnd.pgrst.object+json'`.

### Storage (`js/supabase-storage.js`)

```javascript
window.resolveSupabaseStorageUrl(raw, opts)
```

- Full URLs pass through unchanged.
- Relative paths prefixed with `{bucket}/` (default `images/`).
- Public URL: `{SUPABASE_URL}/storage/v1/object/public/{path}`
- With `SUPABASE_IMAGE_TRANSFORM: true` (Pro): `{SUPABASE_URL}/storage/v1/render/image/public/{path}?width=1200&quality=75`

### Database tables

#### `projects` — Case studies

Used by: `js/case-studies.js` on `project.html`, `case-study.html`

Key columns: `id`, `slug`, `name`, `year`, `role`, `hero_image_url`, `hero_description`, `is_published`, plus many content section columns (`my_role_para1`, `challenge_para1`, `research_cards`, `figma_embed_url`, etc.)

List query: `is_published=eq.true`, `order=year.desc.nullslast,name.asc`

Detail query: `slug=eq.{slug}&is_published=eq.true&limit=1`

#### `categories` — Creative Library folders

See [Creative Library](#creative-library--folder-icons) section.

#### `category_entries` — Gallery items / writings

Used by: `js/category.js`, `js/entry.js`

Linked via `category_id`. Flexible column detection for images (`image_url`, `photo`, etc.), body text, YouTube URLs, types.

Category page: `category_id=eq.{id}&order=id.asc`

Entry page: `id=eq.{id}&limit=1`

#### `about_me` — About page + home social links

Used by: `js/about-me.js`, `js/main.js` (home CONNECT section)

Expected fields (flexible key fallbacks): `description_1`, `paragraph_2`, `Hero Image` / `hero_image`, `img1`–`img10` (carousel), `linkedin_url`, `behance_url`, `youtube_url`, `email`, `mobile`

Home fetches `select=*&limit=1` for social URLs and mailto.

#### `behind_the_scenes` — Behind the Scenes page

Used by: `js/behind-the-scenes.js`

Fields: heading, description, hero image, introduction (HTML), inspirations (videos with lazy load), choices sections with images.

#### `website_issues` — Sidebar "Current Issues" tooltip

Used by: `js/website-issues.js` on every page

Columns: `issue` (or `description`), `expected_fix_date`

Query: `select=*&order=id.asc`

### RLS requirements

For each table, enable RLS and add a policy:

- **Policy name:** `Allow public read access`
- **Operation:** `SELECT`
- **Roles:** `anon`, `authenticated`
- **USING:** `true`

Storage bucket `images` must allow public read on objects you reference.

### Loader integration

`js/loader.js` exposes:

- `window.showLoader()` — short logo animation during Supabase fetch
- `window.hideLoader()` — hide when content ready

Used by `about-me.js`, `entry.js`. Other pages use the initial page-load sequence automatically.

---

## Do Not Click Button / Easter Egg Game

### Where it lives


| Item              | Path                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------- |
| Button markup     | `index.html` — `#breakWebsiteBtn`, class `break-website-btn`, label **"Do not Click"** |
| Button placement  | `.home-divider-caption` footer row, right of "Behind the Scenes | …"                   |
| Overlay markup    | `index.html` — `#breakOverlay` with 3 screens                                          |
| Game logic        | `js/break-website.js` (IIFE, no exports)                                               |
| Styles            | `css/home.css` — `.break-`*, `.pong-*`, `.gravity-*`, `.confetti-*`                    |
| Hover side-effect | `js/main.js` — adds `body.pupils-danger` on button hover (hero name eyes show `?`)     |
| Pupil CSS         | `css/home.css` — `body.pupils-danger .name-eye__pupil::before { content: '?' }`        |


**No Supabase or API integration.** Fully client-side.

### Component tree

```
index.html
├── .home-divider-caption
│   └── .curious-btn-wrap
│       ├── button#breakWebsiteBtn.break-website-btn  "Do not Click"
│       └── span.curious-btn-tooltip
└── #breakOverlay.break-overlay
    ├── #breakScreen1.break-screen--1   (Congratulations / yes-no)
    ├── #breakScreen2.break-screen--2   (easy way / hard way — button swap)
    └── #breakScreen3.break-screen--3   (Pong game)
        └── .pong-container
            ├── #pongInstructions
            ├── #pongCanvas.pong-canvas  (300×400)
            └── #pongGameEnd
                ├── #confettiContainer
                ├── #gameEndTitle / #gameEndSubtitle
                └── #gameEndBtn
```

### State machine

```
[IDLE]
  │ click #breakWebsiteBtn
  ▼
[BREAKING] — isBroken=true, gravity-fall on page elements, button hidden
  │ after staggered fall + 2s delay
  ▼
[SCREEN 1] — "Congratulations! You've successfully broken the website."
  │ yes / no → records choice in #userChoice
  ▼
[SCREEN 2] — "curiosity killed the cat" + easy/hard buttons
  │ "easy" button click → swapButtons() (labels swap, taunts escalate)
  │ click same choice again OR after 13+ swaps → SCREEN 3
  │ "hard" button → SCREEN 3 (or swap if labels swapped)
  ▼
[SCREEN 3] — Pong instructions → Start → [PLAYING]
  │ win (3 points) → confetti + "Rebuild Website" → fixWebsite()
  │ lose (AI 3 points) → "Try Again" → reset to instructions
  ▼
[REBUILDING] — fixWebsite(): overlay hidden, gravity-reset animation, isBroken=false
```

**Screen switching:** `showScreen(1|2|3)` toggles `.active` on `#breakScreen1/2/3`.

**Button swap logic (`swapButtons`):**

- `easyIsLeft` tracks which physical button is "easy" vs "hard"
- Each click on the displayed "easy way" swaps labels, tooltips, and subtitle
- `swapCount` drives taunts at 3, 6, 12, 13 swaps
- At `swapCount >= 13`: both buttons read "the hard way"; next click → Pong

### Break animation (pre-overlay)

`getTargetElements()` selects:

- `.home-hero`, `.home-intro`, `.home-subheading`, `.social-icons-row`, `.home-divider`, `.home-divider-caption`
- `.sidebar .logo`, `.sidebar .navigation`, `.sidebar-footer`
- `.mobile-header`, `.mobile-nav`
- `#sidebarBg`

Each gets `.gravity-fall` with staggered `80ms` delay and random `--fall-rotation`. Classes `site-broken` added to `html`, `body`, `.sidebar` (transparent bg, overflow hidden).

### Pong game mechanics

**Implementation:** Vanilla Canvas 2D in `startPongGame()` — `requestAnimationFrame` loop.


| Property      | Value                                                      |
| ------------- | ---------------------------------------------------------- |
| Canvas size   | 300 × 400 px                                               |
| Win score     | First to **3** points                                      |
| Player paddle | Bottom, green `#2d5a1e`, 60×10 px                          |
| AI paddle     | Top, black `#1a1a1a`, easy AI (60% move chance, 35% speed) |
| Ball          | radius 8px, speeds up after first paddle hit               |
| Serve         | 3-second countdown between points                          |


**Controls:**

- **Mouse:** `document.mousemove` — paddle follows cursor X (works outside canvas)
- **Touch:** `touchstart` / `touchmove` on canvas
- **Keyboard:** Arrow Left / Right (`usingKeyboard` flag)

**Win:** Player scores 3 → `showGameEndScreen(true)` → confetti + "Rebuild Website" button → `fixWebsite()`

**Lose:** AI scores 3 → `showGameEndScreen(false)` → "Try Again" → hides game end, shows instructions again (does not rebuild site)

**Feedback:** Board flashes red `#e74c3c` (AI scores) or green `#27ae60` (player scores). ARIA label on canvas updates scores.

### Assets


| Asset type     | Source                                                                             |
| -------------- | ---------------------------------------------------------------------------------- |
| Sprites        | **None** — paddles/ball drawn with `ctx.fillRect` / `ctx.arc`                      |
| Sounds         | **None**                                                                           |
| CSS animations | `gravityFall`, `gravityFallBg`, `gravityReset`, `confetti-burst` in `css/home.css` |
| Confetti       | 30 DOM `.confetti` divs, random colors, JS-generated in `createConfetti()`         |


### Libraries

- **Canvas:** native `HTMLCanvasElement.getContext('2d')`
- **Not used:** Phaser, Three.js, React, game frameworks

### Entry / exit flow

**Entry:** Home page only → click "Do not Click" (desktop has tooltip + pupil `?` effect on hover).

**Exit paths:**

1. **Win Pong** → "Rebuild Website" → `fixWebsite()` restores all fallen elements with `.gravity-reset` bounce
2. **Lose Pong** → "Try Again" → replay without restoring site
3. **Refresh page** — footnote taunts user; refresh resets everything (no persistence)

**Guard:** `isBroken` flag prevents double-trigger; button `display: none` while broken.

### Migration checklist — Do not Click

- [ ] Copy `index.html` overlay block (`#breakOverlay` and all child screens)
- [ ] Copy `js/break-website.js` unchanged or port logic faithfully
- [ ] Copy `css/home.css` sections: Break Website Button, Break Website Overlay, Pong, Confetti, Gravity animations, `site-broken` scroll lock, `.sidebar-bg`
- [ ] Ensure `#sidebarBg` exists in sidebar markup (home page only has it)
- [ ] Wire `break-website.js` after `main.js` on home page
- [ ] Port `pupils-danger` hover in hero interactions if recreating name-eye easter eggs
- [ ] Test full flow: break → screen 1 → screen 2 (swap ≥13 times) → Pong → win → rebuild
- [ ] Test mobile: touch controls, tooltips hidden per `@media (max-width: 1280px)`
- [ ] Verify `prefers-reduced-motion` does not break game (gravity may instant-complete — acceptable)
- [ ] No Supabase/env vars needed for this feature

---

## Home Page Easter Eggs (related)

These interact with the Do not Click experience but are separate features in `js/main.js` + `css/home.css`:


| Feature                 | Trigger                       | Effect                                            |
| ----------------------- | ----------------------------- | ------------------------------------------------- |
| Name eyes follow cursor | Desktop mousemove             | `.name-eye__pupil` CSS vars `--pupil-x/y`         |
| Click name eye          | Click `.name-eye`             | Red flash, eye closes, "ouch, that hurt!" tooltip |
| Avatar / social hover   | mouseenter                    | `body.pupils-heart` — pupils become ♥             |
| Do not Click hover      | mouseenter `#breakWebsiteBtn` | `body.pupils-danger` — pupils become ?            |
| Role cycling            | interval 2.8s                 | `#hero-role` fades between 7 job titles           |
| Brisbane clock          | interval 1s                   | `#home-divider-time` live AEST/AEDT               |
| Click ripple            | any click                     | `.click-ripple` expanding circle                  |
| Mobile PS               | visible ≤1280px               | "missing out on easter eggs" message              |


---

## Migration Checklist (full portfolio)

### Design system

- [ ] Port `:root` tokens from `css/style.css`
- [ ] Load Manrope (weights per page)
- [ ] Implement `body.light-mode` toggle with `localStorage`
- [ ] Copy layout: 16rem sidebar, 1280px breakpoint, mobile pill nav
- [ ] Copy loader (`loader.js` + `loader.css`)

### Supabase

- [ ] Create Supabase project; copy table schemas (`projects`, `categories`, `category_entries`, `about_me`, `behind_the_scenes`, `website_issues`)
- [ ] Enable RLS public SELECT on all tables
- [ ] Create public `images` storage bucket; migrate media
- [ ] Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in config
- [ ] Port `resolveSupabaseStorageUrl()` helper
- [ ] Verify each page's fetch against live data

### Creative Library

- [ ] Port folder CSS + GSAP animation
- [ ] Port `creative-garden.js` fetch/render
- [ ] Port `category.js` gallery + lightbox
- [ ] Port `entry.js` for writings detail pages

### Case studies

- [ ] Port `case-studies.js` list + detail renderer
- [ ] Map all `projects` columns or simplify schema deliberately

### Global chrome

- [ ] Port `main.js` (theme, nav sync, GitHub last-updated, social copy buttons)
- [ ] Port `website-issues.js` sidebar tooltip

### Easter egg

- [ ] Complete [Do not Click checklist](#migration-checklist--do-not-click)

### Deploy

- [ ] Static hosting on Vercel (or equivalent)
- [ ] Add Vercel Analytics script if desired
- [ ] Confirm `images/Logo-light.png` and `Logo-dark.png` exist (referenced by loader mask)

---

## Critical Code References

### Theme toggle (`js/main.js`)

```javascript
body.classList.toggle('light-mode');
localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
```

### Supabase fetch headers (pattern used everywhere)

```javascript
fetch(`${url}/rest/v1/${table}?select=*`, {
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});
```

### Folder color injection (`js/creative-garden.js`)

```javascript
const colorStyle = coverColor ? ' style="--folder-color:' + escapeHtml(coverColor) + '"' : '';
```

### Pong game loop (`js/break-website.js`)

```javascript
const gameLoop = () => {
  update();
  draw();
  animationId = requestAnimationFrame(gameLoop);
};
```

### Gravity fall trigger (`js/break-website.js`)

```javascript
fallingElements.forEach((el, index) => {
  el.style.setProperty('--fall-rotation', `${rotation}deg`);
  setTimeout(() => el.classList.add('gravity-fall'), index * 80);
});
setTimeout(() => {
  overlay.classList.add('active');
  showScreen(1);
}, fallingElements.length * 80 + 2000);
```

---

## External Dependencies (CDN)

```html
<!-- All pages -->
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<script defer src="/_vercel/insights/script.js"></script>

<!-- creative-garden.html only -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
```

---

## Known Legacy / Unused Files


| File                                   | Status                                                   |
| -------------------------------------- | -------------------------------------------------------- |
| `css/notebook-modal.css`               | Not linked — old notebook detail UI                      |
| `SUPABASE_SETUP.md`                    | Documents `notebooks` table — superseded by `categories` |
| `page-flip.html`, `page-flip_*.js/css` | Separate page-flip experiment                            |


---

*Document generated from codebase analysis. Last reviewed against repo structure as of July 2026.*