# MYETV Player - Image & Gallery Plugin

Official plugin for **MYETV Video Player** (`MYETVvideoplayer`) that allows playing **single images** or **image galleries** just like a video, seamlessly integrating with the timeline, playback controls, auto-hide, fullscreen, player events, and a complete **Zoom & Mouse Scrolling/Panning** system.

---

## Key Features

- **Single Image or Gallery**: Supports both a single image (with a configurable duration before ending) and multi-image galleries with a global duration or custom per-slide duration.
- **Video-like Playback Experience**:
  - Play / Pause (control bar button, click on stage, Spacebar).
  - Continuous progress bar with **seeking** (click & drag) and time tooltip.
  - Visual markers on the progress bar showing slide boundaries.
  - Supports **Restart** button (`playFromStartButton`), **`autoplay`**, **`loop`**, **`autoHide`**, **`fullscreen`**, and playback speed (**`playbackRate`** from the settings menu).
  - Dynamic Top Bar title and subtitle updates per slide.
  - Full compatibility with native player events (`played`, `playing`, `paused`, `timeupdate`, `seeking`, `seeked`, `ended`, `restarted`).
- **Zoom, Mouse Scrolling/Panning & Reset**:
  - Dedicated control bar buttons: **Zoom Out (-)**, **Reset to initial size (`100%`)**, and **Zoom In (+)**.
  - **Mouse Scrolling / Panning when zoomed**:
    - Click-and-drag panning across the zoomed image (automatically clamped to image bounds).
    - **Mouse wheel scrolling** when zoomed to scroll vertically/horizontally (`Shift + Wheel` or wide panoramas for horizontal scrolling; `Ctrl + Wheel` to zoom toward the cursor).
  - Full **touch support** on mobile devices: 1-finger pan when zoomed and 2-finger **pinch-to-zoom**.

---

## Installation

Include the plugin script after the `MYETVvideoplayer` core script:

```html
<link rel="stylesheet" href="myetv-player.css">

<div class="video-container">
    <video id="myPlayer" playsinline></video>
</div>

<script src="myetv-player.js"></script>
<script src="myetv-image-gallery-plugin.js"></script>
```

The plugin automatically registers itself as **`imagegallery`** via `window.registerMYETVPlugin`.

---

## Quick Start

### 1. Image Gallery

```javascript
const player = new MYETVvideoplayer('myPlayer', {
    autoplay: true,
    loop: false,
    playFromStartButton: true,
    showTitleOverlay: true,
    videoTitle: 'My Photo Gallery',
    plugins: {
        imagegallery: {
            images: [
                {
                    src: 'https://example.com/photo1.jpg',
                    title: 'Ocean Sunset',
                    subtitle: 'Day 1',
                    duration: 5000 // custom duration for this slide (ms)
                },
                {
                    src: 'https://example.com/photo2.jpg',
                    title: 'Mountains',
                    duration: 7000
                },
                'https://example.com/photo3.jpg' // uses default slideDuration
            ],
            slideDuration: 4000,          // default time per slide (ms)
            transition: 'fade',           // 'fade' | 'slide' | 'none'
            transitionDuration: 350,
            enableZoom: true,
            minZoom: 1,
            maxZoom: 5,
            zoomStep: 0.5,
            wheelPan: true,               // mouse wheel scrolls image when zoomed
            wheelZoom: false,             // true = wheel always zooms; false = Ctrl+Wheel zooms
            resetZoomOnSlideChange: true
        }
    }
});
```

### 2. Single Image (Timed Playback)

```javascript
const player = new MYETVvideoplayer('myPlayer', {
    autoplay: true,
    loop: false,
    plugins: {
        imagegallery: {
            image: 'https://example.com/single-photo.jpg', // or images: ['...']
            duration: 8000,            // triggers the 'ended' event after 8 seconds
            enableZoom: true,
            maxZoom: 4,
            pauseOnZoom: false         // optional: pauses the countdown timer when zoomed in
        }
    }
});

player.addEventListener('ended', () => {
    console.log('Image playback ended!');
});
```

---

## Configuration Options

### Media & Timing
| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `images` | `string \| object \| Array` | `[]` | Single image URL, slide object, or array of slides (`{ src, url, title, subtitle, alt, duration }`). |
| `image` / `imageUrl` | `string \| object` | `undefined` | Convenient aliases for passing a single image directly. |
| `slideDuration` | `number` | `5000` | Time in milliseconds before advancing to the next slide (or ending for a single image). |
| `duration` | `number` | `5000` | Alias for `slideDuration`. |
| `singleImageDuration` | `number` | `slideDuration` | Specific duration in milliseconds when only a single image is provided. |
| `autoplay` | `boolean` | `player.options.autoplay` | Automatically starts playback on load. |
| `loop` | `boolean` | `player.options.loop` | Loops back to the beginning when the content ends. |
| `pauseOnZoom` | `boolean` | `false` | If `true`, pauses the playback timer while the image is zoomed in. |
| `hideVideoOnlyControls` | `boolean` | `true` | Hides audio/video-specific controls (Mute, Volume, Quality, PiP). |

### Appearance, Transitions & Navigation
| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `aspectRatio` | `string` | `'16 / 9'` | CSS aspect ratio of the stage (e.g., `'16 / 9'`, `'4 / 3'`, `'auto'`). |
| `backgroundColor` | `string` | `'#000'` | Stage background color. |
| `transition` | `string` | `'fade'` | Slide transition effect: `'fade'`, `'slide'`, or `'none'`. |
| `transitionDuration` | `number` | `350` | Transition duration in milliseconds. |
| `showNavArrows` | `boolean` | `true` | Shows floating Previous/Next arrows on galleries. |
| `showCounter` | `boolean` | `true` | Displays the slide counter (e.g., `1 / 5`) in the control bar. |
| `showSlideMarkers` | `boolean` | `true` | Displays slide divider markers on the progress bar. |
| `updateTitleOnSlide` | `boolean` | `true` | Dynamically updates the Top Bar title and subtitle when defined on a slide. |

### Zoom & Mouse Scrolling
| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `enableZoom` | `boolean` | `true` | Enables all zoom and pan features. |
| `showZoomControls` | `boolean` | `true` | Shows `-`, `Reset (100%)`, and `+` buttons in the control bar. |
| `minZoom` | `number` | `1` | Minimum zoom scale (`1` = initial fit-to-player size). |
| `maxZoom` | `number` | `5` | Maximum allowed zoom scale. |
| `zoomStep` | `number` | `0.5` | Zoom step for `+` and `-` button clicks. |
| `wheelZoomStep` | `number` | `0.2` | Zoom step when zooming with the mouse wheel. |
| `wheelPan` | `boolean` | `true` | When `true` and zoomed (`zoom > 1`), the mouse wheel scrolls/pans the image. |
| `wheelZoom` | `boolean` | `false` | When `true`, the mouse wheel zooms at the cursor (when `false`, `Ctrl + Wheel` still zooms). |
| `doubleClickZoom` | `boolean` | `false` | When `true`, double-clicking the image toggles zoom in/reset. |
| `resetZoomOnSlideChange` | `boolean` | `true` | Automatically resets zoom back to `100%` when switching slides. |
| `keyboardControls` | `boolean` | `true` | Enables plugin keyboard shortcuts (`+`, `-`, `0`, `Shift + Arrows`). |

---

## Keyboard Shortcuts

In addition to standard `MYETVvideoplayer` shortcuts (`Space` for Play/Pause, `F` for Fullscreen, `ArrowLeft`/`ArrowRight` to seek ±10s):

- **`+` / `=`**: Zoom In
- **`-`**: Zoom Out
- **`0`**: Reset zoom to initial size (`100%`)
- **`Shift + ArrowRight`**: Next slide (in gallery mode)
- **`Shift + ArrowLeft`**: Previous slide (in gallery mode)

---

## Programmatic API

You can control the plugin programmatically via `player.getPlugin('imagegallery')`:

```javascript
const gallery = player.getPlugin('imagegallery');

// Playback controls
gallery.play();
gallery.pause();
gallery.togglePlayPause();
gallery.restart();

// Gallery navigation
gallery.nextSlide();
gallery.prevSlide();
gallery.goToSlide(2); // jump to the 3rd slide (0-based index)
gallery.getCurrentSlideIndex();
gallery.getTotalSlides();
gallery.getSlides();

// Dynamically replace images or gallery
gallery.setImages([
    'new-photo-1.jpg',
    'new-photo-2.jpg'
]);

// Zoom controls
gallery.zoomIn();
gallery.zoomOut();
gallery.setZoom(2.5);
gallery.resetZoom();
gallery.getZoom();
```

---

## Events

The plugin dispatches all standard player events (`played`, `playing`, `paused`, `timeupdate`, `seeking`, `seeked`, `ended`, `restarted`) plus the following gallery-specific events:

```javascript
player.addEventListener('slidechange', (e) => {
    console.log(`Slide ${e.slideIndex + 1} of ${e.totalSlides}`, e.slide);
});

player.addEventListener('zoomchange', (e) => {
    console.log(`Current zoom: ${e.zoom}x`, e.panX, e.panY);
});
```

---

## Using with `videoloader` (Pre-roll Loader)

If you also use `myetv-video-loading-plugin.js`, assign a lower `order` to the loader so that `imagegallery` initializes right after the pre-roll finishes:

```javascript
const player = new MYETVvideoplayer('myPlayer', {
    autoplay: true,
    plugins: {
        videoloader: {
            order: 1,
            videoUrl: 'loading-intro.mp4',
            timeout: 3000
        },
        imagegallery: {
            order: 2,
            images: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
            slideDuration: 5000
        }
    }
});
```
