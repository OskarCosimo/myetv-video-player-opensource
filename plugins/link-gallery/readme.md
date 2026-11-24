# MYETV Video Player — Link Gallery Plugin (`myetv-link-gallery-plugin.js`)

A single-file JavaScript plugin for **`MYETVvideoplayer`** that transforms a single URL or a list of links into a playable visual gallery with timeline progression, optional metadata scraping, top-bar title management, end-credits-style scrolling descriptions, link security inspection in the settings menu, and a quick "Open Link" button in the control bar.

---

## Features

- **Single Link & Gallery Playback**: Accepts a single URL string, a link object, or an array of links and plays them sequentially along the player's timeline with slide markers.
- **Metadata Scraping (Optional)**: Automatically fetches missing `title`, `description`, and `image` metadata from OpenGraph (`og:title`, `og:description`, `og:image`), Twitter Card, standard `<meta>`, `<title>`, and `<link rel="icon">` tags.
  - Supports **direct `fetch()`** for same-origin or CORS-enabled URLs.
  - Supports an **optional proxy endpoint** (`scraperProxyUrl`) returning either HTML or JSON (`{ title, description, image }`) to handle cross-origin URLs blocked by browser CORS policies.
  - Gracefully falls back to readable URL/hostname cards if scraping is disabled or blocked.
- **Smart Top-Bar Title Handling**: Updates the player's top bar (`player.setVideoTitle`) automatically from link metadata **only if** `videoTitle` was not already set on `MYETVvideoplayer` initialization.
- **End-Credits Scrolling Description**: Automatically measures the description container height; if the text overflows the player height, it smoothly scrolls upward like movie end credits at a configurable reading speed, pausing on hover or player pause and supporting manual mouse wheel scrolling.
- **Link & Security Info in Settings Menu**: Adds a **"Link Info"** entry inside the player's top-bar settings menu (`.settings-menu`) opening a diagnostic modal with:
  - HTTPS vs. unencrypted HTTP protocol status
  - Domain / host and port details
  - Origin check (same-origin vs. external third-party website)
  - Query parameter detection
  - IDN / Punycode (`xn--`) hostname check
  - Embedded URL credentials check
  - Safe window isolation (`rel="noopener noreferrer"`) and direct launch button
- **Control Bar "Open Link" Button**: Adds an **Open Link** button inside `.controls-right` (before the fullscreen button) to open the currently active URL safely in a new tab.
- **Theme & Controls Integration**: Uses `MYETVvideoplayer` CSS variables (`--player-primary-color`, `--player-primary-hover`, etc.), auto-hide behavior, keyboard controls, and `dispose()` cleanup.

---

## Installation

Include `myetv-link-gallery-plugin.js` **after** the core `MYETVvideoplayer` script so `window.registerMYETVPlugin` is available.

```html
<!-- MYETV Video Player CSS & Core JS -->
<link rel="stylesheet" href="path/to/myetv-player.css" />
<script src="path/to/myetv-player.js"></script>

<!-- Link Gallery Plugin -->
<script src="path/to/myetv-link-gallery-plugin.js"></script>
```

The plugin registers itself globally under the name **`linkgallery`**:

```javascript
window.registerMYETVPlugin('linkgallery', LinkGalleryPlugin);
```

---

## Quick Start

### 1. HTML Setup

```html
<div class="video-container">
    <video id="myPlayer" class="video-player"></video>
</div>
```

### 2. Initialize with a Gallery of Links

```javascript
const player = new MYETVvideoplayer('myPlayer', {
    showTitleOverlay: true,
    showSettingsMenu: true,
    autoHide: true,
    plugins: {
        linkgallery: {
            links: [
                {
                    url: 'https://www.myetv.tv',
                    title: 'MYETV Platform',
                    description: 'Watch videos, live streams, and creative content on MYETV.',
                    image: 'https://example.com/preview-1.jpg',
                    duration: 8000
                },
                'https://example.com/article-with-long-description'
            ],
            slideDuration: 8000,
            autoplay: true,
            loop: true,
            enableScraping: true,
            creditsSpeed: 28
        }
    }
});
```

### 3. Single Link with Global Fallback Options

```javascript
const player = new MYETVvideoplayer('myPlayer', {
    plugins: {
        linkgallery: {
            links: 'https://example.com/page',
            title: 'Custom Link Title',
            description: 'A very long description that will automatically scroll like end credits if it exceeds the player height...',
            image: 'https://example.com/cover.jpg',
            singleLinkDuration: 12000
        }
    }
});
```

---

## Link Item Format

Each entry in `links` can be either a **URL string** or an **object** with the following properties:

| Property | Type | Description |
| :--- | :--- | :--- |
| `url` (or `link`, `href`, `src`) | `string` | **Required.** Destination URL (validated through `player.sanitizeUrl()`). |
| `title` | `string` | Optional link title. Skips scraped title when provided. |
| `description` | `string` | Optional description text. Skips scraped description when provided. |
| `image` | `string` | Optional preview image URL. Skips scraped image when provided. |
| `subtitle` | `string` | Optional subtitle shown in the player's top bar when `videoTitle` was not explicitly set. |
| `duration` | `number` | Optional slide duration in milliseconds for this specific link. |

---

## Configuration Options

### Input & Fallback Metadata

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `links` (aliases: `link`, `url`, `urls`) | `string \| Object \| Array` | `[]` | Single URL, link object, or array of link items. |
| `title` | `string` | `''` | Global fallback title used when an item does not define `title`. |
| `description` | `string` | `''` | Global fallback description used when an item does not define `description`. |
| `image` | `string` | `''` | Global fallback image URL used when an item does not define `image`. |

### Scraping & CORS Proxy

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableScraping` | `boolean` | `true` | Attempts to fetch missing `title`, `description`, and `image` from the target URL. |
| `scraperProxyUrl` | `string` | `''` | Optional server-side proxy URL for cross-origin scraping. Supports `{url}` placeholder (e.g., `'https://yoursite.com/scrape.php?url={url}'`) or appends `?url=...` automatically. Accepts JSON (`{ title, description, image }`) or raw HTML. |
| `scrapeTimeout` | `number` | `6000` | Request timeout in milliseconds (minimum `1000`). |

> **CORS Note:** Browser security prevents client-side `fetch()` from reading HTML on external domains that do not send `Access-Control-Allow-Origin` headers. When `fetch()` is blocked by CORS and no `scraperProxyUrl` is configured, the plugin automatically displays clean fallback metadata derived from the URL.

### Playback & Timeline

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `slideDuration` (alias: `duration`) | `number` | `8000` | Default duration per link slide in milliseconds. |
| `singleLinkDuration` | `number` | `slideDuration` | Duration in milliseconds when only a single link is provided. |
| `autoplay` | `boolean \| undefined` | `undefined` | Starts playback automatically. Falls back to the player's `autoplay` option if `undefined`. |
| `loop` | `boolean \| undefined` | `undefined` | Loops the link gallery on end. Falls back to `player.options.loop` if `undefined`. |
| `hideVideoOnlyControls` | `boolean` | `true` | Hides `.mute-btn`, `.volume-container`, `.quality-control`, and `.pip-btn` while the plugin is active. |

### Stage, Transitions & UI

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `aspectRatio` | `string` | `'16 / 9'` | CSS `aspect-ratio` applied to the link stage (set `'auto'` to disable). |
| `backgroundColor` | `string` | `'#0d1117'` | Background color of the stage behind the blurred preview. |
| `transition` | `'fade' \| 'slide' \| 'none'` | `'fade'` | Visual transition effect when switching between links. |
| `transitionDuration` | `number` | `350` | Transition duration in milliseconds. |
| `showNavArrows` | `boolean` | `true` | Displays floating previous/next arrows when multiple links are present. |
| `showCounter` | `boolean` | `true` | Displays `current / total` counter in `.controls-right`. |
| `showSlideMarkers` | `boolean` | `true` | Displays slide boundary markers on the progress bar. |
| `updateTitleOnSlide` | `boolean` | `true` | Updates the player top bar title on slide change (only when `player.options.videoTitle` was initially empty). |
| `showOpenLinkButton` | `boolean` | `true` | Adds the **Open Link** button inside `.controls-right`. |
| `showSettingsLinkInfo` | `boolean` | `true` | Injects the **Link Info** security inspection item into `.settings-menu`. |
| `openLinkTarget` | `string` | `'_blank'` | Target window used when opening a link (`window.open(..., openLinkTarget, 'noopener,noreferrer')`). |

### End-Credits Description Animation

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `creditsSpeed` | `number` | `28` | Vertical scrolling speed in pixels per second (minimum `8`). Multiplied by the player's playback speed (`playbackRate`). |
| `creditsStartDelay` | `number` | `1500` | Initial pause in milliseconds before scrolling begins. |
| `creditsEndPause` | `number` | `1500` | Pause in milliseconds after scrolling past the text before restarting from the bottom. |
| `pauseCreditsOnHover` | `boolean` | `true` | Pauses credits scrolling when the user hovers over the description area. |

### Keyboard Shortcuts

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `keyboardControls` | `boolean` | `true` | Enables plugin keyboard shortcuts (`O` to open current link, `Shift + ArrowRight` / `Shift + ArrowLeft` to switch slides). |

---

## Using a Proxy Endpoint for Cross-Origin Scraping

Because browser CORS rules block direct client-side HTML scraping on most external websites, you can point `scraperProxyUrl` to a backend endpoint on your server.

### Option A: JSON Proxy Response (Recommended)

```javascript
plugins: {
    linkgallery: {
        links: ['https://external-site.com/article'],
        scraperProxyUrl: '/api/link-preview.php?url={url}'
    }
}
```

Expected JSON response (`Content-Type: application/json`):

```json
{
    "title": "Page Title",
    "description": "Page description extracted from OpenGraph or meta description.",
    "image": "https://external-site.com/cover.jpg"
}
```

### Option B: Raw HTML Proxy Response

If the endpoint returns `text/html`, the plugin parses it safely with `DOMParser` and extracts `og:title`, `twitter:title`, `<title>`, `og:description`, `twitter:description`, `meta[name="description"]`, `og:image`, `twitter:image`, and fallback icons.

---

## Plugin API Methods

Retrieve the plugin instance via `player.getPlugin('linkgallery')`:

```javascript
const linkGallery = player.getPlugin('linkgallery');
```

| Method | Parameters | Return | Description |
| :--- | :--- | :--- | :--- |
| `play()` | — | `void` | Starts or resumes gallery playback and credits scrolling. |
| `pause()` | — | `void` | Pauses gallery playback and credits scrolling. |
| `togglePlayPause()` | — | `void` | Toggles play/pause state. |
| `restart()` | — | `MYETVvideoplayer` | Restarts playback from the first link (`0:00`). |
| `nextSlide()` | — | `boolean` | Advances to the next link in the gallery. |
| `prevSlide()` | — | `boolean` | Goes back to the previous link in the gallery. |
| `goToSlide(index)` | `number` | `boolean` | Jumps directly to the specified zero-based slide index. |
| `openCurrentLink()` | — | `boolean` | Opens the active link safely with `noopener,noreferrer`. |
| `openLinkSecurityModal()` | — | `void` | Opens the Link Information & Security modal for the active link. |
| `setLinks(links)` | `string \| Object \| Array` | `LinkGalleryPlugin` | Replaces the current links list dynamically and resets the timeline. |
| `getCurrentSlideIndex()` | — | `number` | Returns the active zero-based slide index. |
| `getTotalSlides()` | — | `number` | Returns total number of valid links. |
| `getSlides()` | — | `Array` | Returns a shallow copy of the parsed slide objects. |
| `dispose()` | — | `void` | Cleans up DOM nodes, aborts pending scrapes, restores player methods, and unbinds listeners. |

---

## Events

You can listen to events using `player.addEventListener(eventName, callback)`:

| Event | Payload Fields | Triggered When |
| :--- | :--- | :--- |
| `slidechange` | `slideIndex`, `totalSlides`, `slide` | Active link slide changes. |
| `linkopen` | `slideIndex`, `url`, `title` | User clicks the Open Link button or presses `O`. |
| `played` / `playing` | `currentTime`, `duration` | Gallery playback starts or resumes. |
| `paused` | `currentTime`, `duration` | Gallery playback is paused. |
| `restarted` | `previousTime`, `duration`, `autoPlayed` | Gallery restarts from the beginning. |
| `timeupdate` | `currentTime`, `duration`, `progress` | Periodic timeline progress tick. |
| `seeking` / `seeked` | `currentTime`, `targetTime` | User seeks along the progress bar. |
| `ended` | `currentTime`, `duration`, `playlistInfo` | Gallery reaches the end (when `loop` is disabled). |

Example:

```javascript
player.addEventListener('slidechange', (e) => {
    console.log('Active link:', e.slide.url, 'Title:', e.slide.title);
});

player.addEventListener('linkopen', (e) => {
    console.log('User opened link:', e.url);
});
```

---

## Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| `Space` | Play / Pause (via core player controls) |
| `O` | Open the active link in a new tab |
| `Shift + ArrowRight` | Go to next link slide |
| `Shift + ArrowLeft` | Go to previous link slide |

---

## Security Notes

- All link URLs and scraped image URLs are validated with `player.sanitizeUrl()` to block `javascript:` or unsafe `data:` schemes.
- All scraped titles, descriptions, and modal fields are rendered exclusively via `textContent` (no raw HTML injection).
- External links always open with `rel="noopener noreferrer"`.
