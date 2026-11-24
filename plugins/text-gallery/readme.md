
# MYETV Video Player - Text & Gallery Plugin

A plugin for **MYETV Video Player** (`MYETVvideoplayer`) that turns a single text block or a multi-slide text gallery into a clean, readable, interactive player experience—with **no images or video required**.

It supports **safe HTML formatting**, **automatic URL linking**, **credits-style vertical auto-scrolling** for long texts, **text zoom/reset controls**, timeline synchronization, and gallery navigation.

---

## Features

- **Text-Only Card Stage:** Sleek card UI styled with the player's CSS theme variables (`--player-primary-color`, `--player-primary-hover`, etc.).
- **Safe HTML Formatting:** Renders sanitized HTML tags (`<p>`, `<br>`, `<b>`, `<strong>`, `<i>`, `<em>`, `<u>`, `<ul>`, `<ol>`, `<li>`, `<span>`, `<div>`, `<a>`) using `player.sanitizeHTML()` (with a built-in allowlist fallback).
- **Automatic URL Linking:** Detects plain `http://` and `https://` URLs inside text nodes and turns them into clickable links (`target="_blank" rel="noopener noreferrer"`) without breaking existing `<a>` tags.
- **Credits-Style Vertical Scrolling:** Automatically scrolls overflowing text upward like end credits, synced with playback state and `playbackRate`, pauses on hover, and supports manual mouse wheel scrolling.
- **Multi-Text Gallery:** Supports multiple slides with floating stage arrows, control bar prev/next buttons, slide counter, and progress bar boundary markers.
- **Text Zoom & Reset:** Control bar buttons (`A-`, clickable `%` reset badge, `A+`), Settings menu integration for mobile/small screens, and keyboard shortcuts (`+`, `-`, `0`).
- **Full Player Integration:** Integrates with Play/Pause, Restart, Timeline Seek, Seek Tooltip, Playback Speed, Loop, Autoplay, Auto-Hide Controls, Top-Bar Title fallback, and Fullscreen.

---

## Installation

Include the **MYETV Video Player** core script and stylesheet first, followed by `myetv-text-gallery-plugin.js`:

```html
<link rel="stylesheet" href="path/to/myetv-video-player.css" />
<script src="path/to/myetv-video-player.js"></script>
<script src="path/to/myetv-text-gallery-plugin.js"></script>
```

The plugin automatically registers itself globally as `'textgallery'` via `window.registerMYETVPlugin`.

---

## Quick Start

### 1. Single Text Slide

```html
<div class="video-container">
    <video id="myPlayer"></video>
</div>

<script>
const player = new MYETVvideoplayer('myPlayer', {
    plugins: {
        textgallery: {
            title: 'Official Announcement',
            subtitle: 'Notice',
            description: '<p>Welcome to <strong>MYETV</strong>!</p><p>Visit https://www.myetv.tv for more information.</p>',
            duration: 10000
        }
    }
});
</script>
```

### 2. Multi-Slide Text Gallery

```javascript
const player = new MYETVvideoplayer('myPlayer', {
    autoplay: true,
    loop: true,
    plugins: {
        textgallery: {
            transition: 'slide',
            creditsSpeed: 30,
            texts: [
                {
                    title: 'Chapter 1: Introduction',
                    subtitle: 'Overview',
                    description: '<p>This is the first slide with <em>formatted HTML</em> and an auto-linked URL: https://www.myetv.tv</p>',
                    duration: 8000
                },
                {
                    title: 'Chapter 2: Long Scrolling Text',
                    subtitle: 'Credits Mode',
                    text: 'Line 1\nLine 2\nLine 3\n\nWhen the text exceeds the card height, it automatically scrolls vertically like movie credits.',
                    duration: 12000
                },
                'A simple plain-text slide using the global slideDuration.'
            ]
        }
    }
});
```

---

## Slide Item Format

Each entry in `texts` (or `items` / `slides`) can be either a **string** or an **object**:

| Property | Aliases | Type | Description |
| :--- | :--- | :--- | :--- |
| `title` | — | `string` | Slide heading. Falls back to plugin `title` option if omitted. |
| `subtitle` | — | `string` | Badge displayed above the slide title. Falls back to plugin `subtitle` option if omitted. |
| `description` | `text`, `content`, `body` | `string` | Main text or HTML content for the slide. Falls back to plugin `description` option if omitted. |
| `duration` | — | `number` | Duration of this specific slide in milliseconds. Falls back to `slideDuration` (or `singleTextDuration` for a single slide). |

---

## Configuration Options

### Input & Fallback Content

| Option | Aliases | Type | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `texts` | `items`, `slides`, `text`, `content` | `string \| object \| Array` | `null` | Single text item or array of slides. If omitted, a single slide is built from `title` and `description`. |
| `title` | — | `string` | `''` | Default/fallback title for slides without their own `title`. |
| `subtitle` | — | `string` | `''` | Default/fallback subtitle badge for slides without their own `subtitle`. |
| `description` | — | `string` | `''` | Default/fallback body content when a slide omits `description`/`text`/`content`. |

### Text Formatting & Links

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `allowHtml` | `boolean` | `true` | Allows safe HTML tags (`p`, `br`, `b`, `strong`, `i`, `em`, `u`, `ul`, `ol`, `li`, `span`, `div`, `a`). Set to `false` to render everything as escaped plain text. |
| `autoLink` | `boolean` | `true` | Automatically converts raw `http://` and `https://` URLs inside text nodes into clickable `<a>` elements. |
| `openLinkTarget` | `string` | `'_blank'` | Target attribute applied to all links (`<a>` tags and auto-generated links). |

### Font Size & Zoom Controls

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `baseFontSize` | `number` | `16` | Base body font size in pixels (minimum clamped to `11`). |
| `fontScale` | `number` | `1` | Initial font scale multiplier (e.g. `1` = `100%`). |
| `minFontScale` | `number` | `0.7` | Minimum allowed scale multiplier (`70%`). |
| `maxFontScale` | `number` | `2.0` | Maximum allowed scale multiplier (`200%`). |
| `fontScaleStep` | `number` | `0.1` | Increment/decrement step per zoom click (`10%`). |
| `showZoomControls` | `boolean` | `true` | Shows `A-`, `%` (reset), and `A+` buttons in the control bar. |
| `showSettingsTextControls` | `boolean` | `true` | Injects a **Text Size** expandable submenu into the player's Settings modal. |

### Timing & Playback

| Option | Aliases | Type | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `slideDuration` | `duration` | `number` | `8000` | Default duration per slide in milliseconds (used in multi-slide galleries). |
| `singleTextDuration` | — | `number` | `slideDuration` | Default duration in milliseconds when only a single text slide is provided. |
| `autoplay` | — | `boolean \| undefined` | `undefined` | Overrides player `autoplay`. If `undefined`, inherits `player.options.autoplay`. |
| `loop` | — | `boolean \| undefined` | `undefined` | Loops the gallery/text when playback ends. If `undefined`, inherits `player.options.loop`. |
| `hideVideoOnlyControls` | — | `boolean` | `true` | Hides video-only controls (mute, volume slider, quality selector, Picture-in-Picture). |

### Stage & Transitions

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `aspectRatio` | `string` | `'16 / 9'` | CSS `aspect-ratio` for the text stage (set `'auto'` to disable fixed ratio). |
| `backgroundColor` | `string` | `'#0d1117'` | Background color of the stage behind the text card. |
| `textAlign` | `string` | `'left'` | CSS `text-align` for the body text (`'left'`, `'center'`, `'justify'`). |
| `transition` | `string` | `'fade'` | Slide transition style: `'fade'`, `'slide'`, or `'none'`. |
| `transitionDuration` | `number` | `350` | Transition duration in milliseconds. |

### Gallery UI & Navigation

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `showNavArrows` | `boolean` | `true` | Shows floating left/right arrows on the stage when multiple slides exist. |
| `showCounter` | `boolean` | `true` | Displays the `current / total` slide counter in the control bar. |
| `showSlideMarkers` | `boolean` | `true` | Renders slide boundary markers along the progress bar. |
| `updateTitleOnSlide` | `boolean` | `true` | Updates the player's top bar title/subtitle on slide change (skipped if `player.options.videoTitle` is already set). |

### Credits-Style Vertical Scrolling

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `creditsSpeed` | `number` | `28` | Vertical scroll speed in pixels per second (minimum `8`, scaled by `playbackRate`). |
| `creditsStartDelay` | `number` | `1500` | Delay in milliseconds before scrolling begins on a slide. |
| `creditsEndPause` | `number` | `1500` | Pause in milliseconds after text scrolls past the top before looping from the bottom. |
| `pauseCreditsOnHover` | `boolean` | `true` | Pauses vertical scrolling while the mouse pointer is over the text viewport. |

### Keyboard Controls

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `keyboardControls` | `boolean` | `true` | Enables plugin keyboard shortcuts (`Shift+ArrowLeft/Right`, `+`, `-`, `0`). |

---

## Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| `Shift + ArrowRight` | Go to next text slide (multi-slide galleries) |
| `Shift + ArrowLeft` | Go to previous text slide (multi-slide galleries) |
| `+` or `=` | Increase text size (`zoomIn`) |
| `-` | Decrease text size (`zoomOut`) |
| `0` | Reset text size to `100%` (`resetZoom`) |

*(Standard player shortcuts such as `Space` for Play/Pause, `F` for Fullscreen, `ArrowLeft`/`ArrowRight` for seeking remain active via `MYETVvideoplayer`.)*

---

## JavaScript API

Access the plugin instance via `player.getPlugin('textgallery')`:

```javascript
const textPlugin = player.getPlugin('textgallery');
```

### Playback & Navigation Methods

- `play()` — Starts or resumes playback and vertical scrolling.
- `pause()` — Pauses playback and vertical scrolling.
- `togglePlayPause()` — Toggles between play and pause.
- `restart()` — Resets timeline to `0:00` and slide `0`.
- `nextSlide()` — Jumps to the next slide (respecting `loop`). Returns `boolean`.
- `prevSlide()` — Jumps to the previous slide (respecting `loop`). Returns `boolean`.
- `goToSlide(index)` — Jumps directly to slide at `index`. Returns `boolean`.

### Content & State Methods

- `setTexts(texts)` — Replaces gallery slides dynamically at runtime and resets playback to slide `0`.
- `getCurrentSlideIndex()` — Returns the current zero-based slide index.
- `getTotalSlides()` — Returns total number of slides.
- `getSlides()` — Returns a shallow copy of the parsed slides array.
- `dispose()` — Cleans up DOM elements, timers, listeners, and restores overridden player methods.

### Zoom Methods

- `zoomIn()` — Increases `fontScale` by `fontScaleStep`.
- `zoomOut()` — Decreases `fontScale` by `fontScaleStep`.
- `resetZoom()` — Resets `fontScale` back to `1` (`100%`).
- `setFontScale(scale)` — Sets a custom scale multiplier clamped between `minFontScale` and `maxFontScale`.
- `getFontScale()` — Returns the current scale multiplier.

---

## Events

Listen to plugin and player events using `player.addEventListener(...)`:

```javascript
player.addEventListener('slidechange', (e) => {
    console.log('Active slide:', e.slideIndex, e.slide.title);
});

player.addEventListener('textzoomchange', (e) => {
    console.log('Zoom changed to:', e.percentage + '%');
});
```

| Event | Payload Fields | Description |
| :--- | :--- | :--- |
| `slidechange` | `slideIndex`, `totalSlides`, `slide` | Fired whenever the active text slide changes. |
| `textzoomchange` | `scale`, `previousScale`, `percentage` | Fired whenever text zoom level is updated or reset. |
| `played` / `playing` / `paused` / `ended` / `restarted` / `timeupdate` / `seeking` / `seeked` | Standard player event payloads | Synchronized automatically with the text gallery timeline. |

---

## License

Part of the **MYETV Video Player** ecosystem ([https://www.myetv.tv](https://www.myetv.tv)).
