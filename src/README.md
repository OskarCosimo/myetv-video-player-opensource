# MYETV Video Player - Modular Source Documentation

**Modular build system for MYETV video player**

Created by [MYETV](https://www.myetv.tv) - [Oskar Cosimo](https://oskarcosimo.com)

## 📁 Project Structure

```
myetv-player/
├── src/                    # JavaScript source modules
│   ├── core.js            # Main module and initialization
│   ├── events.js          # Event management system
│   ├── controls.js        # UI controls and auto-hide
│   ├── quality.js         # Video quality management
│   ├── subtitles.js       # Custom subtitle system
│   ├── chapters.js        # Timeline chapter markers
│   ├── fullscreen.js      # Fullscreen and Picture-in-Picture
│   ├── playlist.js        # Video playlist management
│   ├── watermark.js       # Watermark/logo overlay
│   ├── streaming.js       # DASH/HLS adaptive support
│   ├── plugins.js         # Extensible plugin system
│   ├── i18n.js            # Internationalization
│   └── utils.js           # Utility functions
├── build.js               # Node.js build script
└── package.json           # npm configuration
```

## 🚀 Build System

### Installing Dependencies

```bash
npm install
```

### Available Commands

The project uses npm scripts defined in `package.json`:

**Build JavaScript:**
```bash
npm run build        # Full build (JS + SCSS)
npm run build:js     # JavaScript only
```

**Build SCSS:**
```bash
npm run build:scss           # CSS expanded + minified
npm run build:scss:expanded  # CSS expanded only
npm run build:scss:min       # CSS minified only
```

**Watch Mode (Development):**
```bash
npm run watch:scss       # Watch SCSS without source maps
npm run watch:scss:dev   # Watch SCSS with source maps
npm run dev              # Alias for watch:scss:dev
```

### Build Process

The `build.js` script performs the following operations:

1. **JavaScript Build:**
   - Reads modules from `/src/` folder in specified order
   - Extracts global code from `i18n.js` and `plugins.js`
   - Removes module headers and footers
   - Concatenates all modules into single `MYETVvideoplayer` class
   - Adds CommonJS and AMD exports
   - Generates `dist/myetv-player.js`

2. **JavaScript Minification:**
   - Removes comments and whitespace
   - Generates `dist/myetv-player.min.js`

3. **SCSS Build:**
   - Compiles SCSS to expanded CSS (`css/myetv-player.css`)
   - Compiles SCSS to minified CSS (`css/myetv-player.min.css`)
   - Reports file size statistics

### Module Concatenation Order

Modules are processed in the order defined in `build.js`:

```javascript
const moduleOrder = [
  'core.js',        // 1. Constructor and base initialization
  'events.js',      // 2. Custom event system
  'controls.js',    // 3. UI controls and auto-hide
  'quality.js',     // 4. Video quality selection
  'subtitles.js',   // 5. Custom subtitle system
  'chapters.js',    // 6. Timeline markers
  'fullscreen.js',  // 7. Fullscreen/PiP
  'playlist.js',    // 8. Playlist navigation
  'watermark.js',   // 9. Logo overlay
  'streaming.js',   // 10. Adaptive streaming
  'plugins.js',     // 11. Plugin system
  'utils.js'        // 12. Utility functions
];
```

## 📦 JavaScript Modules

### 1. **core.js** - Main Module
**Responsibility:** Player initialization, constructor, options configuration

**Main features:**
- Constructor `constructor(videoElement, options)`
- DOM elements initialization
- Default options configuration
- HTML5 video events setup
- Poster and autoplay management

**Supported options:**
- `showQualitySelector`, `showSpeedControl`, `showFullscreen`
- `showPictureInPicture`, `showSubtitles`, `autoHide`
- `poster`, `showPosterOnEnd`, `keyboardControls`
- `showSeekTooltip`, `showTitleOverlay`, `debug`
- `autoplay`, `defaultQuality`, `language`

### 2. **events.js** - Event System
**Responsibility:** Player custom event management

**Public API:**
- `addEventListener(eventType, callback)` - Register listener
- `removeEventListener(eventType, callback)` - Remove listener
- `triggerEvent(eventType, data)` - Emit custom event

**Available events:**
- `play`, `pause`, `ended`, `timeupdate`
- `volumechange`, `qualitychange`, `subtitlechange`
- `fullscreenchange`, `pipchange`, `playlistchange`

### 3. **controls.js** - UI Controls
**Responsibility:** Video controls creation and management, auto-hide system

**Main features:**
- HTML controls generation (play/pause, volume, timeline)
- Intelligent auto-hide system
- Hover and touch events management
- Interactive progress bar with seek
- Volume controls with vertical mobile slider
- Seek tooltip with time preview

**Key methods:**
- `createControls()` - Generate HTML controls structure
- `initAutoHide()` - Configure auto-hide system
- `showControlsNow()` / `hideControlsNow()` - Visibility control

### 4. **quality.js** - Quality Management
**Responsibility:** Video quality selection, resolution monitoring, adaptive quality

**Main features:**
- Current video quality detection
- Quality switching with position preservation
- Automatic selection based on connection
- Real-time quality monitoring
- Quality selection UI menu

**Public API:**
- `initializeQualityMonitoring()` - Start monitoring
- `getCurrentPlayingQuality()` - Get current quality
- `changeQuality(newQuality)` - Change video quality
- `setDefaultQuality(quality)` - Set default quality
- `getAvailableQualities()` - List available qualities

### 5. **subtitles.js** - Subtitles
**Responsibility:** Custom subtitle system with SRT rendering

**Main features:**
- Native SRT parser
- Custom subtitle overlay
- Multi-track support
- Responsive rendering with configurable styles
- Accurate time synchronization

**Public API:**
- `initializeSubtitles()` - Initialize subtitle system
- `enableSubtitleTrack(trackIndex)` - Enable subtitle track
- `disableSubtitles()` - Disable subtitles
- `getAvailableSubtitles()` - List available tracks
- `isSubtitlesEnabled()` - Subtitle status

**SRT Parsing:**
- `parseCustomSRT(srtText)` - Convert SRT to object array
- `customTimeToSeconds(timeString)` - Timestamp conversion

### 6. **chapters.js** - Chapter Markers
**Responsibility:** Timeline chapter marker system with tooltips

**Main features:**
- Chapter parsing from JSON or string format
- Visual timeline markers
- Tooltip with title and thumbnail
- Click for quick navigation
- Supported format: `"00:00:00|Title|image.jpg"`

**Public API:**
- `initializeChapters()` - Initialize chapter system
- `parseChapters(chaptersData)` - Parse chapter format
- `renderChapterMarkers()` - Create DOM markers
- `jumpToChapter(index)` - Jump to specific chapter

**Options format:**
```javascript
chapters: [
  {time: 0, title: "Intro", image: "intro.jpg"},
  {time: 150, title: "Chapter 2", image: "ch2.jpg"}
]
// Or string format
chapters: "0:00:00|Intro|intro.jpg,0:02:30|Chapter 2|ch2.jpg"
```

### 7. **fullscreen.js** - Fullscreen/PiP
**Responsibility:** Fullscreen and Picture-in-Picture management

**Public API:**
- `isFullscreenActive()` - Check fullscreen status
- `checkPiPSupport()` - Check browser PiP support
- `enterFullscreen()` - Enter fullscreen mode
- `exitFullscreen()` - Exit fullscreen
- `enterPictureInPicture()` - Activate PiP
- `exitPictureInPicture()` - Deactivate PiP
- `toggleFullscreen()` - Toggle fullscreen
- `togglePictureInPicture()` - Toggle PiP

**Cross-browser compatibility:**
- Vendor prefix support (webkit, moz)
- Fallback for unsupported browsers

### 8. **playlist.js** - Playlist Management
**Responsibility:** Multi-element video playlist navigation

**Main features:**
- Automatic playlist detection via data attributes
- Next/previous navigation
- Playlist UI buttons
- Video change events

**Data Attributes:**
```html
<video data-playlist-id="myPlaylist" data-playlist-index="0"></video>
<video data-playlist-id="myPlaylist" data-playlist-index="1"></video>
```

**Public API:**
- `detectPlaylist()` - Detect playlist from DOM
- `playNextVideo()` - Play next video
- `playPreviousVideo()` - Play previous video
- `loadPlaylistData()` - Load playlist data

### 9. **watermark.js** - Logo Overlay
**Responsibility:** Customizable logo/watermark overlay

**Main features:**
- Logo overlay with clickable link
- 4 supported positions (topleft, topright, bottomleft, bottomright)
- Optional auto-hide with controls
- Customizable tooltip

**Public API:**
- `initializeWatermark()` - Create watermark overlay
- `setWatermark(url, link, position, title)` - Configure watermark
- `removeWatermark()` - Remove watermark
- `setWatermarkPosition(position)` - Change position
- `setWatermarkAutoHide(hide)` - Configure auto-hide
- `getWatermarkSettings()` - Get current configuration

**Initialization options:**
```javascript
{
  watermarkUrl: 'logo.png',
  watermarkLink: 'https://example.com',
  watermarkPosition: 'bottomright',
  watermarkTitle: 'Brand Name',
  hideWatermark: true  // Auto-hide with controls
}
```

### 10. **streaming.js** - Adaptive Streaming
**Responsibility:** DASH/HLS adaptive streaming support

**Main features:**
- Dynamic loading of dash.js and hls.js libraries
- Automatic stream type detection (DASH/HLS)
- DASH and HLS player management
- Fallback to standard HTML5 video

**Public API:**
- `loadAdaptiveLibraries()` - Load streaming libraries
- `detectStreamType(src)` - Detect stream type from URL
- `initializeDashPlayer(src)` - Initialize DASH player
- `initializeHlsPlayer(src)` - Initialize HLS player

**Configuration options:**
```javascript
{
  adaptiveStreaming: true,
  dashLibUrl: 'https://cdn.dashjs.org/latest/dash.all.min.js',
  hlsLibUrl: 'https://cdn.jsdelivr.net/npm/hls.js@latest'
}
```

**Supported formats:**
- DASH: `.mpd`
- HLS: `.m3u8`
- MP4, WebM, OGG (native fallback)

### 11. **plugins.js** - Plugin System
**Responsibility:** Extensible plugin architecture

**Main features:**
- Global plugin registry
- Automatic plugin initialization
- Plugin API with player access
- Plugin lifecycle management

**Global API:**
```javascript
// Global plugin registration
registerPlugin('myPlugin', function(player, options) {
  // Plugin code
  return {
    name: 'myPlugin',
    init: function() { /* ... */ },
    destroy: function() { /* ... */ }
  };
});
```

**Player API:**
- `initializePlugins()` - Load all registered plugins
- `registerPlugin(name, plugin)` - Register plugin (instance method)
- `getPlugin(name)` - Get plugin reference
- `unregisterPlugin(name)` - Remove plugin

**Plugin structure:**
```javascript
window.registerPlugin('example', function(player, options) {
  return {
    name: 'example',
    version: '1.0.0',
    init: function() {
      console.log('Plugin initialized');
    },
    destroy: function() {
      console.log('Plugin destroyed');
    }
  };
});
```

### 12. **utils.js** - Utility Functions
**Responsibility:** Generic helper functions

**Utility methods:**
- `getBufferedTime()` - Get video buffering time
- `clearTitleTimeout()` - Clear title timeout
- `skipTime(seconds)` - Skip forward/backward N seconds
- `updateTimeDisplay()` - Update current time display
- `formatTime(seconds)` - Format seconds to HH:MM:SS

**Time format:**
- Duration < 1 hour: `M:SS`
- Duration >= 1 hour: `H:MM:SS`

### 13. **i18n.js** - Internationalization
**Responsibility:** Multi-language translation system

**Supported languages:**
- Italian (`it`)
- English (`en`)
- Spanish (`es`)
- French (`fr`)
- German (`de`)
- Portuguese (`pt`)
- Russian (`ru`)
- Chinese (`zh`)
- Japanese (`ja`)
- Arabic (`ar`)

**VideoPlayerI18n Class:**
```javascript
class VideoPlayerI18n {
  constructor()
  setLanguage(lang)
  getCurrentLanguage()
  t(key)  // Translate key
  getAvailableLanguages()
}
```

**Translation keys:**
- UI Controls: `play_pause`, `mute_unmute`, `volume`, `fullscreen`
- Subtitles: `subtitles`, `subtitlesenable`, `subtitlesdisable`
- Quality: `video_quality`, `auto`
- Playlist: `next_video`, `prev_video`, `playlist_next`, `playlist_prev`

## 🔧 Basic Usage

### Player Initialization

```javascript
// HTML
<video id="myVideo" width="800" height="450">
  <source src="video-1080p.mp4" data-quality="1080p" type="video/mp4">
  <source src="video-720p.mp4" data-quality="720p" type="video/mp4">
  <track kind="subtitles" src="subs-en.srt" srclang="en" label="English">
</video>

// JavaScript
const player = new MYETVvideoplayer('myVideo', {
  showQualitySelector: true,
  showSubtitles: true,
  autoHide: true,
  autoHideDelay: 3000,
  language: 'en',
  defaultQuality: 'auto',
  watermarkUrl: 'logo.png',
  watermarkPosition: 'bottomright',
  chapters: [
    {time: 0, title: "Intro"},
    {time: 120, title: "Main Content"}
  ],
  debug: true
});
```

### Custom Events

```javascript
player.addEventListener('qualitychange', function(data) {
  console.log('Quality changed to:', data.quality);
});

player.addEventListener('subtitlechange', function(data) {
  console.log('Subtitles:', data.enabled ? 'enabled' : 'disabled');
});

player.addEventListener('ended', function() {
  console.log('Video ended');
});
```

### Programmatic API

```javascript
// Playback control
player.play();
player.pause();
player.skipTime(10);  // Forward 10 seconds

// Quality management
player.changeQuality('720p');
const qualities = player.getAvailableQualities();

// Subtitles
player.enableSubtitleTrack(0);
player.disableSubtitles();

// Fullscreen/PiP
player.toggleFullscreen();
player.enterPictureInPicture();

// Playlist
player.playNextVideo();
player.playPreviousVideo();

// Watermark
player.setWatermark('new-logo.png', 'https://link.com', 'topright');
player.removeWatermark();
```

## 🛠️ Development and Modification

### Adding a New Module

1. Create module file in `/src/newmodule.js`
2. Use standard format:

```javascript
// NewModule Module for MYETV Video Player
// Conservative modularization - original code preserved exactly
// Created by https://www.myetv.tv https://oskarcosimo.com

initializeNewFeature() {
  // Initialization code
}

newMethod() {
  // Public method
}

// Private helper methods (if needed)
```

3. Add module to `build.js` in `moduleOrder` array:

```javascript
const moduleOrder = [
  'core.js',
  'events.js',
  // ... other modules
  'newmodule.js',  // ← New module
  'utils.js'
];
```

4. Run build:

```bash
npm run build
```

### Modifying an Existing Module

1. Edit source file in `/src/`
2. Maintain existing method structure
3. Test locally
4. Rebuild:

```bash
npm run build
```

### Debug and Testing

Enable **debug mode** for detailed logs:

```javascript
const player = new MYETVvideoplayer('video', {
  debug: true
});
```

Console output will provide:
- Module initialization
- Event triggers
- Loading errors
- Component status

## 📄 License and Credits

- **Author:** MYETV - Oskar Cosimo
- **License:** MIT
- **Repository:** [github.com/OskarCosimo/myetv-video-player-opensource](https://github.com/OskarCosimo/myetv-video-player-opensource)
- **Website:** [myetv.tv](https://www.myetv.tv) | [oskarcosimo.com](https://oskarcosimo.com)

## 🔗 Useful Links

- **Dash.js Documentation:** [dashjs.org](https://dashjs.org)
- **HLS.js Documentation:** [github.com/video-dev/hls.js](https://github.com/video-dev/hls.js)
- **Sass Documentation:** [sass-lang.com](https://sass-lang.com)
- **HTML5 Video API:** [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement)

---

**Version for this document:** 1.0.0  
**Last updated of this document:** October 2025
