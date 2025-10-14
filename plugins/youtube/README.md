# MYETV Player - YouTube Plugin
Official YouTube integration plugin for MYETV Video Player. Play YouTube videos directly in your player with full control and quality management.

---

## 📋 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration Options](#configuration-options)
- [Usage Methods](#usage-methods)
- [API Methods](#api-methods)
- [Events](#events)
- [Quality Control](#quality-control)
- [Examples](#examples)
- [FAQ](#faq)
- [Troubleshooting](#troubleshooting)

---

## Features

- **Full YouTube Integration**: Play any YouTube video using video ID or URL
- **Auto-Detection**: Automatically detects YouTube URLs from multiple sources
- **Quality Control**: Manage video quality (144p to 4K) with custom quality menu
- **Smart Loading**: Asynchronous YouTube IFrame API loading
- **Seamless Sync**: Synchronizes player controls with YouTube player
- **Flexible UI**: Show/hide YouTube native controls
- **Event System**: Rich event callbacks for all YouTube player states
- **Easy Integration**: Works with existing MYETV Player installations
- **Responsive**: Works on desktop and mobile devices

---

## Installation

### Method 1: Direct Script Include

```html
<!-- Load MYETV Player Core -->
<script src="dist/myetv-player.js"></script>

<!-- Load YouTube Plugin -->
<script src="plugins/myetv-player-youtube-plugin.js"></script>
```

### Method 2: Module Import

```javascript
import MYETVPlayer from './myetv-player.js';
import './plugins/myetv-player-youtube-plugin.js';
```

---

## Quick Start

### Basic Usage

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>MYETV Player - YouTube Plugin</title>
    <link rel="stylesheet" href="dist/myetv-player.css">
</head>
<body>
    <!-- Video Element -->
    <video id="myVideo" class="video-player"></video>

    <script src="dist/myetv-player.js"></script>
    <script src="plugins/myetv-player-youtube-plugin.js"></script>

    <script>
        // Initialize player with YouTube plugin
        const player = new MYETVPlayer('myVideo', {
            debug: true,
            plugins: {
                youtube: {
                    videoId: 'dQw4w9WgXcQ', // YouTube video ID
                    autoplay: false,
                    quality: 'hd720'
                }
            }
        });
    </script>
</body>
</html>
```

---

## Configuration Options

```javascript
const player = new MYETVPlayer('myVideo', {
    plugins: {
        youtube: {
            // YouTube video ID (required if not using auto-detection)
            videoId: 'dQw4w9WgXcQ',

            // YouTube Data API key (optional, for future features)
            apiKey: null,

            // Auto-play video on load
            autoplay: false,

            // Show YouTube native controls (true) or use player controls (false)
            showYouTubeUI: false,

            // enable or disable the mouse click over the Youtube player also if showYouTubeUI is false
            mouseClick: false,

            // Auto-detect video ID from data attributes and sources
            autoLoadFromData: true,

            // Initial quality ('auto', 'tiny', 'small', 'medium', 'large', 'hd720', 'hd1080', 'hd1440', 'hd2160', 'highres')
            quality: 'auto',

            // Enable quality control in player UI
            enableQualityControl: true,

            // enable channel information retrieval (NEED THE APIKEY TO WORK)
            enableChannelWatermark: false,

            // Set the default language for auto subtitles
            autoCaptionLanguage: 'en'
        }
    }
});
```

### Quality Options

| Quality Value | Resolution | Description |
|---------------|------------|-------------|
| `'highres'` | 2160p (4K) | Ultra HD (if available) |
| `'hd1080'` | 1080p | Full HD |
| `'hd720'` | 720p | HD |
| `'large'` | 480p | Standard |
| `'medium'` | 360p | Low |
| `'small'` | 240p | Very Low |
| `'tiny'` | 144p | Minimal |
| `'default'` or `'auto'` | Auto | YouTube auto-selects |

---

## Usage Methods

### Method 1: Using Data Attributes (Recommended)

```html
<video id="myVideo" class="video-player"
       data-video-id="dQw4w9WgXcQ"
       data-video-type="youtube">
</video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            youtube: {
                autoLoadFromData: true // Enable auto-detection (default)
            }
        }
    });
</script>
```

### Method 2: Using Source Element

```html
<video id="myVideo" class="video-player">
    <source src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
            type="video/youtube">
</video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: { youtube: {} }
    });
</script>
```

### Method 3: Load Video Dynamically

```html
<video id="myVideo" class="video-player"></video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: { youtube: {} }
    });

    // Load YouTube video after initialization
    player.loadYouTubeVideo('dQw4w9WgXcQ');

    // Or with options
    player.loadYouTubeVideo('dQw4w9WgXcQ', {
        playerVars: {
            autoplay: 1,
            start: 30 // Start at 30 seconds
        }
    });
</script>
```

### Method 4: YouTube video id in the initialization option

```html
<video id="myVideo" class="video-player">
</video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: { youtube: {
videoId: 'dQw4w9WgXcQ', // YouTube video ID
autoplay: true
} }
    });
</script>
```

**Supported URL Formats:**
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `VIDEO_ID` (11-character ID directly)

---

## API Methods

The YouTube plugin adds the following methods to your player instance:

### `player.loadYouTubeVideo(videoId, options)`

Load a YouTube video by ID.

```javascript
// Basic usage
player.loadYouTubeVideo('dQw4w9WgXcQ');

// With options
player.loadYouTubeVideo('dQw4w9WgXcQ', {
    playerVars: {
        autoplay: 1,
        start: 60,      // Start at 1 minute
        end: 180,       // End at 3 minutes
        cc_load_policy: 1  // Show captions by default
    }
});
```

**Parameters:**
- `videoId` (String): YouTube video ID
- `options` (Object): Optional configuration
  - `playerVars` (Object): YouTube player parameters

**Returns:** void

---

### `player.getYouTubeVideoId()`

Get the currently loaded YouTube video ID.

```javascript
const videoId = player.getYouTubeVideoId();
console.log('Current video ID:', videoId);
```

**Returns:** String - YouTube video ID or null

---

### `player.isYouTubeActive()`

Check if YouTube player is currently active.

```javascript
if (player.isYouTubeActive()) {
    console.log('YouTube player is active');
} else {
    console.log('Regular video player is active');
}
```

**Returns:** Boolean

---

### `player.getYouTubeQualities()`

Get available quality levels for current YouTube video.

```javascript
const qualities = player.getYouTubeQualities();
console.log('Available qualities:', qualities);

// Output example:
// [
//   { id: 'hd1080', label: 'Full HD (1080p)', value: 'hd1080' },
//   { id: 'hd720', label: 'HD (720p)', value: 'hd720' },
//   { id: 'large', label: '480p', value: 'large' },
//   ...
// ]
```

**Returns:** Array of quality objects

---

### `player.setYouTubeQuality(quality)`

Set YouTube video quality.

```javascript
// Set to 720p
player.setYouTubeQuality('hd720');

// Set to 1080p
player.setYouTubeQuality('hd1080');

// Set to auto
player.setYouTubeQuality('auto');
```

**Parameters:**
- `quality` (String): Quality level identifier

**Returns:** Boolean - Success status

---

### `player.getYouTubeCurrentQuality()`

Get current playback quality.

```javascript
const currentQuality = player.getYouTubeCurrentQuality();
console.log('Current quality:', currentQuality);
// Output: 'hd720'
```

**Returns:** String - Quality identifier

---

## Events

The YouTube plugin triggers the following custom events:

### `youtubeplugin:ready`

Fired when YouTube IFrame API is loaded and ready.

```javascript
player.addEventListener('youtubeplugin:ready', (data) => {
    console.log('YouTube API is ready');
});
```

---

### `youtubeplugin:videoloaded`

Fired when a YouTube video is loaded.

```javascript
player.addEventListener('youtubeplugin:videoloaded', (data) => {
    console.log('YouTube video loaded:', data.videoId);
});
```

**Event Data:**
- `videoId` (String): Loaded video ID

---

### `youtubeplugin:playerready`

Fired when YouTube player is ready and initialized.

```javascript
player.addEventListener('youtubeplugin:playerready', (data) => {
    console.log('YouTube player ready');
});
```

---

### `youtubeplugin:qualitiesloaded`

Fired when available quality levels are loaded.

```javascript
player.addEventListener('youtubeplugin:qualitiesloaded', (data) => {
    console.log('Available qualities:', data.qualities);

    // Create custom quality selector
    data.qualities.forEach(quality => {
        console.log(`${quality.label}: ${quality.value}`);
    });
});
```

**Event Data:**
- `qualities` (Array): Array of quality objects

---

### `youtubeplugin:qualitychanged`

Fired when video quality changes.

```javascript
player.addEventListener('youtubeplugin:qualitychanged', (data) => {
    console.log('Quality changed to:', data.quality);
    console.log('Label:', data.label);
});
```

**Event Data:**
- `quality` (String): New quality value
- `label` (String): Human-readable quality label

---

### `youtubeplugin:error`

Fired when YouTube player encounters an error.

```javascript
player.addEventListener('youtubeplugin:error', (data) => {
    console.error('YouTube error:', data.errorMessage);
    console.error('Error code:', data.errorCode);
});
```

**Event Data:**
- `errorCode` (Number): YouTube error code
- `errorMessage` (String): Error description

**Error Codes:**
- `2`: Invalid video ID
- `5`: HTML5 player error
- `100`: Video not found or private
- `101`: Video not allowed to be embedded
- `150`: Video not allowed to be embedded

---

### Standard Player Events

The plugin also triggers standard player events:

```javascript
// Play event
player.addEventListener('played', (data) => {
    console.log('YouTube video playing');
});

// Pause event
player.addEventListener('paused', (data) => {
    console.log('YouTube video paused');
});

// End event
player.addEventListener('ended', (data) => {
    console.log('YouTube video ended');
});
```

---

## Quality Control

### Automatic Quality Menu Integration

The plugin automatically integrates with MYETV Player's quality selector if available:

```javascript
const player = new MYETVPlayer('myVideo', {
    plugins: {
        youtube: {
            videoId: 'dQw4w9WgXcQ',
            enableQualityControl: true // Enable quality menu integration
        }
    }
});
```

The quality menu will be automatically populated with available YouTube qualities.

---

### Custom Quality Selector

Create a custom quality selector:

```html
<div id="custom-quality-selector"></div>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: { youtube: { videoId: 'dQw4w9WgXcQ' } }
    });

    // Wait for qualities to load
    player.addEventListener('youtubeplugin:qualitiesloaded', (data) => {
        const selector = document.getElementById('custom-quality-selector');

        data.qualities.forEach(quality => {
            const button = document.createElement('button');
            button.textContent = quality.label;
            button.onclick = () => {
                player.setYouTubeQuality(quality.value);
            };
            selector.appendChild(button);
        });
    });

    // Highlight current quality
    player.addEventListener('youtubeplugin:qualitychanged', (data) => {
        console.log('Now playing at:', data.label);
    });
</script>
```

---

## Examples

### Example 1: Video Playlist

```html
<video id="myVideo" class="video-player"></video>

<div id="playlist">
    <button onclick="loadVideo('dQw4w9WgXcQ')">Video 1</button>
    <button onclick="loadVideo('9bZkp7q19f0')">Video 2</button>
    <button onclick="loadVideo('kJQP7kiw5Fk')">Video 3</button>
</div>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: { youtube: {} }
    });

    function loadVideo(videoId) {
        player.loadYouTubeVideo(videoId);
    }
</script>
```

---

### Example 2: Quality Presets

```javascript
const player = new MYETVPlayer('myVideo', {
    plugins: { youtube: { videoId: 'dQw4w9WgXcQ' } }
});

// Create quality preset buttons
const qualityPresets = {
    'High': 'hd1080',
    'Medium': 'hd720',
    'Low': 'large',
    'Auto': 'auto'
};

Object.entries(qualityPresets).forEach(([label, quality]) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.onclick = () => player.setYouTubeQuality(quality);
    document.body.appendChild(btn);
});
```

---

### Example 3: Video Information Display

```javascript
const player = new MYETVPlayer('myVideo', {
    plugins: { youtube: { videoId: 'dQw4w9WgXcQ' } }
});

// Display video info
player.addEventListener('youtubeplugin:videoloaded', (data) => {
    document.getElementById('video-id').textContent = data.videoId;
});

player.addEventListener('youtubeplugin:qualitiesloaded', (data) => {
    const maxQuality = data.qualities[0]?.label || 'Unknown';
    document.getElementById('max-quality').textContent = maxQuality;
});

player.addEventListener('youtubeplugin:qualitychanged', (data) => {
    document.getElementById('current-quality').textContent = data.label;
});
```

---

### Example 4: Error Handling

```javascript
const player = new MYETVPlayer('myVideo', {
    plugins: { youtube: {} }
});

// Handle errors gracefully
player.addEventListener('youtubeplugin:error', (data) => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = `Error: ${data.errorMessage}`;

    document.getElementById('player-container').appendChild(errorDiv);

    // Try fallback video
    if (data.errorCode === 100 || data.errorCode === 101) {
        setTimeout(() => {
            player.loadYouTubeVideo('FALLBACK_VIDEO_ID');
        }, 3000);
    }
});
```

---

### Example 5: Advanced Configuration

```javascript
const player = new MYETVPlayer('myVideo', {
    debug: true,
    plugins: {
        youtube: {
            videoId: 'dQw4w9WgXcQ',
            autoplay: true,
            quality: 'hd720',
            showYouTubeUI: false,
            enableQualityControl: true
        }
    }
});

// Track video state
let watchTime = 0;
setInterval(() => {
    if (player.isYouTubeActive()) {
        watchTime++;
        console.log('Watch time:', watchTime, 'seconds');
    }
}, 1000);

// Log quality changes
player.addEventListener('youtubeplugin:qualitychanged', (data) => {
    console.log(`Quality changed from previous to ${data.quality}`);
});
```

---

### Example 6: Mobile-Optimized Setup

```javascript
// Detect mobile device
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const player = new MYETVPlayer('myVideo', {
    plugins: {
        youtube: {
            videoId: 'dQw4w9WgXcQ',
            autoplay: false, // Don't autoplay on mobile
            quality: isMobile ? 'large' : 'hd1080', // Lower quality for mobile
            showYouTubeUI: isMobile // Use YouTube UI on mobile
        }
    }
});
```

---

## FAQ

### Q: Does this plugin work without an API key?

**A:** Yes! The plugin works perfectly without an API key. The `apiKey` option is reserved for future features that might use the YouTube Data API for fetching video metadata.

---

### Q: Can I play age-restricted videos?

**A:** Age-restricted videos may not work in embedded players due to YouTube's policies. You'll receive error code 101 or 150 in such cases.

---

### Q: How do I extract video ID from a YouTube URL?

**A:** The plugin automatically extracts video IDs from various URL formats:
- `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- `https://youtu.be/dQw4w9WgXcQ`
- `https://www.youtube.com/embed/dQw4w9WgXcQ`

You can also use the video ID directly: `dQw4w9WgXcQ`

---

### Q: Can I use both YouTube and regular videos?

**A:** Yes! The plugin coexists with regular video playback. Load YouTube videos using plugin methods, and regular videos using standard video sources.

```javascript
// Load YouTube video
player.loadYouTubeVideo('dQw4w9WgXcQ');

// Later, load regular video
player.video.src = 'local-video.mp4';
player.play();
```

---

### Q: Does quality switching work immediately?

**A:** Quality switching depends on YouTube's API. The new quality might not apply immediately, especially if the requested quality isn't available or if the video is buffering.

---

### Q: Can I customize the YouTube player appearance?

**A:** You can use the `showYouTubeUI` option:
- `false` (default): Use MYETV Player controls
- `true`: Show YouTube native controls

For advanced customization, YouTube's embedded player has limited styling options due to YouTube's policies.

---

### Q: How do I handle videos that can't be embedded?

**A:** Listen to the error event:

```javascript
player.addEventListener('youtubeplugin:error', (data) => {
    if (data.errorCode === 101 || data.errorCode === 150) {
        // Video cannot be embedded
        // Redirect to YouTube or show message
        window.open(`https://youtube.com/watch?v=${player.getYouTubeVideoId()}`, '_blank');
    }
});
```

---

## Troubleshooting

### Issue: YouTube API not loading

**Solution:**
- Check browser console for errors
- Ensure internet connection is active
- Verify no ad blockers are blocking YouTube scripts
- Check for CSP (Content Security Policy) restrictions

```javascript
// Listen for API ready event
player.addEventListener('youtubeplugin:ready', () => {
    console.log('YouTube API loaded successfully');
});
```

---

### Issue: Video not playing

**Possible causes:**
1. Invalid video ID
2. Video is private or deleted
3. Video is age-restricted
4. Video cannot be embedded

**Solution:**
```javascript
player.addEventListener('youtubeplugin:error', (data) => {
    console.error('Error:', data.errorCode, data.errorMessage);
    // Handle accordingly
});
```

---

### Issue: Quality not changing

**Solution:**
- Ensure `enableQualityControl` is true
- Check if requested quality is available using `getYouTubeQualities()`
- Quality changes may take a few seconds to apply

```javascript
// Check available qualities first
player.addEventListener('youtubeplugin:qualitiesloaded', (data) => {
    console.log('Available:', data.qualities);

    // Set quality only if available
    if (data.qualities.some(q => q.value === 'hd1080')) {
        player.setYouTubeQuality('hd1080');
    }
});
```

---

### Issue: Controls not synchronizing

**Solution:**
- Ensure plugin is loaded after core player
- Check for JavaScript errors in console
- Verify `showYouTubeUI` is set correctly

---

### Debug Mode

Enable debug mode to see detailed logs:

```javascript
const player = new MYETVPlayer('myVideo', {
    debug: true,
    plugins: { youtube: { videoId: 'dQw4w9WgXcQ' } }
});
```

Debug messages will appear in the browser console with the `[YouTube Plugin]` prefix.

---

## Resources

- **MYETV Player**: [https://www.myetv.tv](https://www.myetv.tv)
- **YouTube IFrame API**: [YouTube IFrame Player API Documentation](https://developers.google.com/youtube/iframe_api_reference)
- **GitHub**: [MYETV Video Player Open Source](https://github.com/OskarCosimo/myetv-video-player-opensource/)
- **Author**: [https://oskarcosimo.com](https://oskarcosimo.com)

---

## License

MIT License - See main project for details.

---

## Contributing

Contributions are welcome! Please submit pull requests or open issues on GitHub.

---

**Enjoy seamless YouTube integration!**
