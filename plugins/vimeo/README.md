# MYETV Player - Vimeo Plugin
Official Vimeo integration plugin for MYETV Video Player. Play Vimeo videos directly in your player with full control, quality management, and extensive API support.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration Options](#configuration-options)
- [Usage Methods](#usage-methods)
- [API Methods](#api-methods)
- [Events](#events)
- [Quality Control](#quality-control)
- [Advanced Features](#advanced-features)
- [Examples](#examples)
- [FAQ](#faq)
- [Troubleshooting](#troubleshooting)

---

## Features

- **Full Vimeo Integration**: Play any Vimeo video using video ID or URL
- **Flexible Source**: Support for video ID, URL, or full Vimeo URL
- **Quality Control**: Manage video quality from 360p to 4K with automatic quality detection
- **Smart Loading**: Asynchronous Vimeo Player SDK loading
- **Full API Support**: Complete access to Vimeo Player API methods
- **Extensive Options**: 20+ Vimeo embed options (color, controls, loop, etc.)
- **Rich Events**: Comprehensive event system for all player states
- **Easy Integration**: Seamless integration with MYETV Player
- **Responsive**: Fully responsive design for all devices
- **Picture-in-Picture**: Built-in PiP support
- **Subtitles/CC**: Text track support with multiple languages
- **Metadata API**: Fetch video information via oEmbed API

---

## Installation

### Method 1: Direct Script Include

```html
<!-- Load MYETV Player Core -->
<script src="dist/myetv-player.js"></script>

<!-- Load Vimeo Plugin -->
<script src="plugins/myetv-player-vimeo.js"></script>
```

### Method 2: Module Import

```javascript
import MYETVPlayer from './myetv-player.js';
import './plugins/myetv-player-vimeo.js';
```

---

## Quick Start

### Basic Usage

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>MYETV Player - Vimeo Plugin</title>
    <link rel="stylesheet" href="dist/myetv-player.css">
</head>
<body>
    <!-- Video Element -->
    <video id="myVideo" class="video-player"></video>

    <script src="dist/myetv-player.js"></script>
    <script src="plugins/myetv-player-vimeo.js"></script>

    <script>
        // Initialize player with Vimeo plugin
        const player = new MYETVPlayer('myVideo', {
            debug: true,
            plugins: {
                vimeo: {
                    videoId: '76979871', // Vimeo video ID
                    autoplay: false,
                    quality: '720p',
                    color: 'ff0000' // Custom player color
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
        vimeo: {
            // ========== Video Source ==========
            // Vimeo video ID (number or string)
            videoId: '76979871',

            // OR use full Vimeo URL
            videoUrl: 'https://vimeo.com/76979871',

            // ========== Player Dimensions ==========
            width: null,        // Player width (null = auto)
            height: null,       // Player height (null = auto)

            // ========== Vimeo Embed Options ==========
            autopause: true,    // Pause video when another video plays
            autoplay: false,    // Auto-play on load
            background: false,  // Enable background mode (no controls)
            byline: true,       // Show video author byline
            color: null,        // Player color (hex without #, e.g., 'ff0000')
            controls: true,     // Show player controls
            dnt: false,         // Do Not Track (privacy)
            loop: false,        // Loop video playback
            muted: false,       // Start muted
            pip: true,          // Enable Picture-in-Picture
            playsinline: true,  // Play inline on mobile
            portrait: true,     // Show author portrait
            quality: 'auto',    // Initial quality ('auto', '360p', '540p', '720p', '1080p', '2k', '4k')
            responsive: true,   // Responsive sizing
            speed: false,       // Enable playback speed controls
            texttrack: null,    // Default text track language (e.g., 'en', 'es')
            title: true,        // Show video title
            transparent: true,  // Transparent background

            // ========== Plugin Options ==========
            debug: false,               // Enable debug logging
            replaceNativePlayer: true,  // Replace native video element
            syncControls: false         // Sync with custom controls
        }
    }
});
```

### Quality Options

| Quality Value | Resolution | Description |
|---------------|------------|-------------|
| `'4k'` | 2160p (4K) | Ultra HD (if available) |
| `'2k'` | 1440p | Quad HD |
| `'1080p'` | 1080p | Full HD |
| `'720p'` | 720p | HD |
| `'540p'` | 540p | SD |
| `'360p'` | 360p | Low |
| `'auto'` | Auto | Vimeo auto-selects |

---

## Usage Methods

### Method 1: Using Video ID

```html
<video id="myVideo" class="video-player"></video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            vimeo: {
                videoId: '76979871' // Just the ID
            }
        }
    });
</script>
```

---

### Method 2: Using Full URL

```html
<video id="myVideo" class="video-player"></video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            vimeo: {
                videoUrl: 'https://vimeo.com/76979871'
            }
        }
    });
</script>
```

---

### Method 3: Load Video Dynamically

```html
<video id="myVideo" class="video-player"></video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: { vimeo: {} }
    });

    // Get plugin instance
    const vimeoPlugin = player.getPlugin('vimeo');

    // Load video after initialization
    vimeoPlugin.loadVideo('76979871').then(id => {
        console.log('Video loaded:', id);
    });

    // Or use URL
    vimeoPlugin.loadVideo('https://vimeo.com/76979871');
</script>
```

---

### Method 4: With Custom Styling

```html
<video id="myVideo" class="video-player"></video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            vimeo: {
                videoId: '76979871',
                color: 'ff0000',      // Red controls
                background: false,
                byline: false,
                portrait: false,
                title: true,
                transparent: true
            }
        }
    });
</script>
```

**Supported URL Formats:**
- `https://vimeo.com/VIDEO_ID`
- `https://player.vimeo.com/video/VIDEO_ID`
- `VIDEO_ID` (numeric ID directly)

---

## API Methods

The Vimeo plugin provides extensive API methods through the plugin instance:

```javascript
const vimeoPlugin = player.getPlugin('vimeo');
```

### Playback Control

#### `play()`
Play the video.

```javascript
vimeoPlugin.play().then(() => {
    console.log('Video playing');
});
```

**Returns:** Promise

---

#### `pause()`
Pause the video.

```javascript
vimeoPlugin.pause().then(() => {
    console.log('Video paused');
});
```

**Returns:** Promise

---

#### `getCurrentTime()`
Get current playback position in seconds.

```javascript
vimeoPlugin.getCurrentTime().then(seconds => {
    console.log('Current time:', seconds);
});
```

**Returns:** Promise<Number>

---

#### `setCurrentTime(seconds)`
Set playback position.

```javascript
vimeoPlugin.setCurrentTime(60).then(seconds => {
    console.log('Seeked to:', seconds);
});
```

**Parameters:**
- `seconds` (Number): Time position in seconds

**Returns:** Promise<Number>

---

#### `getDuration()`
Get video duration in seconds.

```javascript
vimeoPlugin.getDuration().then(duration => {
    console.log('Duration:', duration, 'seconds');
});
```

**Returns:** Promise<Number>

---

### Volume Control

#### `getVolume()`
Get current volume (0-1).

```javascript
vimeoPlugin.getVolume().then(volume => {
    console.log('Volume:', volume);
});
```

**Returns:** Promise<Number>

---

#### `setVolume(volume)`
Set volume level.

```javascript
vimeoPlugin.setVolume(0.5).then(volume => {
    console.log('Volume set to:', volume);
});
```

**Parameters:**
- `volume` (Number): Volume level (0-1)

**Returns:** Promise<Number>

---

#### `getMuted()`
Check if video is muted.

```javascript
vimeoPlugin.getMuted().then(muted => {
    console.log('Muted:', muted);
});
```

**Returns:** Promise<Boolean>

---

#### `setMuted(muted)`
Mute or unmute video.

```javascript
vimeoPlugin.setMuted(true).then(muted => {
    console.log('Muted:', muted);
});
```

**Parameters:**
- `muted` (Boolean): Mute state

**Returns:** Promise<Boolean>

---

### Quality Control

#### `getQualities()`
Get available quality levels (synchronous).

```javascript
const qualities = vimeoPlugin.getQualities();
console.log('Available qualities:', qualities);

// Output example:
// ['360p', '540p', '720p', '1080p']
```

**Returns:** Array<String>

---

#### `getCurrentQuality()`
Get current quality level.

```javascript
vimeoPlugin.getCurrentQuality().then(quality => {
    console.log('Current quality:', quality);
});
```

**Returns:** Promise<String>

---

#### `setQuality(quality)`
Set video quality.

```javascript
vimeoPlugin.setQuality('1080p').then(quality => {
    console.log('Quality changed to:', quality);
});
```

**Parameters:**
- `quality` (String): Quality identifier ('360p', '720p', '1080p', etc.)

**Returns:** Promise<String>

---

### Playback Speed

#### `getPlaybackRate()`
Get playback speed.

```javascript
vimeoPlugin.getPlaybackRate().then(rate => {
    console.log('Playback rate:', rate);
});
```

**Returns:** Promise<Number>

---

#### `setPlaybackRate(rate)`
Set playback speed.

```javascript
vimeoPlugin.setPlaybackRate(1.5).then(rate => {
    console.log('Speed set to:', rate);
});
```

**Parameters:**
- `rate` (Number): Playback rate (0.5 - 2.0)

**Returns:** Promise<Number>

---

### Video Management

#### `loadVideo(videoIdOrUrl)`
Load a new video.

```javascript
// By ID
vimeoPlugin.loadVideo('76979871').then(id => {
    console.log('Video loaded:', id);
});

// By URL
vimeoPlugin.loadVideo('https://vimeo.com/76979871');
```

**Parameters:**
- `videoIdOrUrl` (String|Number): Vimeo video ID or URL

**Returns:** Promise<Number>

---

#### `getVideoMetadata(videoIdOrUrl)`
Fetch video metadata via oEmbed API.

```javascript
vimeoPlugin.getVideoMetadata('76979871').then(metadata => {
    console.log('Title:', metadata.title);
    console.log('Author:', metadata.author);
    console.log('Thumbnail:', metadata.thumbnail);
    console.log('Duration:', metadata.duration);
});
```

**Returns:** Promise<Object>

Metadata object:
```javascript
{
    title: String,
    description: String,
    thumbnail: String,
    thumbnailLarge: String,
    duration: Number,
    author: String,
    authorUrl: String,
    width: Number,
    height: Number,
    html: String
}
```

---

### Fullscreen

#### `requestFullscreen()`
Enter fullscreen mode.

```javascript
vimeoPlugin.requestFullscreen().then(() => {
    console.log('Entered fullscreen');
});
```

**Returns:** Promise

---

#### `exitFullscreen()`
Exit fullscreen mode.

```javascript
vimeoPlugin.exitFullscreen().then(() => {
    console.log('Exited fullscreen');
});
```

**Returns:** Promise

---

### Text Tracks (Subtitles/CC)

#### `getTextTracks()`
Get available text tracks.

```javascript
vimeoPlugin.getTextTracks().then(tracks => {
    tracks.forEach(track => {
        console.log(`${track.label} (${track.language})`);
    });
});
```

**Returns:** Promise<Array>

---

#### `enableTextTrack(language, kind)`
Enable a text track.

```javascript
vimeoPlugin.enableTextTrack('en', 'subtitles').then(track => {
    console.log('Enabled track:', track);
});
```

**Parameters:**
- `language` (String): Language code (e.g., 'en', 'es')
- `kind` (String): Track kind ('subtitles', 'captions')

**Returns:** Promise<Object>

---

#### `disableTextTrack()`
Disable current text track.

```javascript
vimeoPlugin.disableTextTrack().then(() => {
    console.log('Text track disabled');
});
```

**Returns:** Promise

---

## Events

The Vimeo plugin triggers comprehensive events:

### Playback Events

#### `play`
Video started playing.

```javascript
player.addEventListener('play', (data) => {
    console.log('Video playing');
});
```

---

#### `playing`
Video is actively playing (after buffering).

```javascript
player.addEventListener('playing', (data) => {
    console.log('Video is now playing');
});
```

---

#### `pause`
Video paused.

```javascript
player.addEventListener('pause', (data) => {
    console.log('Video paused');
});
```

---

#### `ended`
Video playback ended.

```javascript
player.addEventListener('ended', (data) => {
    console.log('Video ended');
});
```

---

#### `timeupdate`
Playback position changed.

```javascript
player.addEventListener('timeupdate', (data) => {
    console.log('Current time:', data.currentTime);
    console.log('Duration:', data.duration);
    console.log('Percent:', data.percent);
});
```

**Event Data:**
- `currentTime` (Number): Current time in seconds
- `duration` (Number): Total duration in seconds
- `percent` (Number): Playback progress (0-1)

---

### Buffering Events

#### `progress`
Download progress.

```javascript
player.addEventListener('progress', (data) => {
    console.log('Buffering progress:', data);
});
```

---

#### `waiting`
Video buffering started.

```javascript
player.addEventListener('waiting', () => {
    console.log('Buffering...');
});
```

---

#### `canplay`
Video buffering ended, ready to play.

```javascript
player.addEventListener('canplay', () => {
    console.log('Ready to play');
});
```

---

### Seeking Events

#### `seeking`
Seek operation started.

```javascript
player.addEventListener('seeking', (data) => {
    console.log('Seeking...');
});
```

---

#### `seeked`
Seek operation completed.

```javascript
player.addEventListener('seeked', (data) => {
    console.log('Seeked to:', data.seconds);
});
```

---

### Quality Events

#### `qualitiesloaded`
Available qualities loaded.

```javascript
player.addEventListener('qualitiesloaded', (data) => {
    console.log('Available qualities:', data.qualities);
});
```

**Event Data:**
- `qualities` (Array): Array of quality strings

---

#### `qualitychange`
Quality changed.

```javascript
player.addEventListener('qualitychange', (data) => {
    console.log('Quality changed to:', data.quality);
});
```

**Event Data:**
- `quality` (String): New quality level

---

### Volume Events

#### `volumechange`
Volume level changed.

```javascript
player.addEventListener('volumechange', (data) => {
    console.log('Volume:', data.volume);
});
```

---

### Speed Events

#### `playbackratechange`
Playback speed changed.

```javascript
player.addEventListener('playbackratechange', (data) => {
    console.log('Playback rate:', data.playbackRate);
});
```

---

### Fullscreen Events

#### `fullscreenchange`
Fullscreen state changed.

```javascript
player.addEventListener('fullscreenchange', (data) => {
    console.log('Fullscreen:', data.fullscreen);
});
```

---

### Picture-in-Picture Events

#### `enterpictureinpicture`
Entered PiP mode.

```javascript
player.addEventListener('enterpictureinpicture', () => {
    console.log('Entered Picture-in-Picture');
});
```

---

#### `leavepictureinpicture`
Left PiP mode.

```javascript
player.addEventListener('leavepictureinpicture', () => {
    console.log('Left Picture-in-Picture');
});
```

---

### Text Track Events

#### `texttrackchange`
Text track changed.

```javascript
player.addEventListener('texttrackchange', (data) => {
    console.log('Text track changed:', data);
});
```

---

#### `chapterchange`
Video chapter changed.

```javascript
player.addEventListener('chapterchange', (data) => {
    console.log('Chapter:', data.title);
});
```

---

### Metadata Events

#### `loadedmetadata`
Video metadata loaded.

```javascript
player.addEventListener('loadedmetadata', (data) => {
    console.log('Video metadata loaded:', data);
});
```

---

### Error Events

#### `error`
Player error occurred.

```javascript
player.addEventListener('error', (data) => {
    console.error('Vimeo error:', data);
});
```

---

## Quality Control

### Automatic Quality Selection

```javascript
const player = new MYETVPlayer('myVideo', {
    plugins: {
        vimeo: {
            videoId: '76979871',
            quality: 'auto' // Vimeo selects best quality
        }
    }
});
```

---

### Manual Quality Selection

```javascript
const vimeoPlugin = player.getPlugin('vimeo');

// Get available qualities
player.addEventListener('qualitiesloaded', (data) => {
    console.log('Available:', data.qualities);

    // Set specific quality
    if (data.qualities.includes('1080p')) {
        vimeoPlugin.setQuality('1080p');
    }
});
```

---

### Custom Quality Selector

```html
<div id="quality-selector"></div>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: { vimeo: { videoId: '76979871' } }
    });

    const vimeoPlugin = player.getPlugin('vimeo');

    // Create quality buttons
    player.addEventListener('qualitiesloaded', (data) => {
        const selector = document.getElementById('quality-selector');

        data.qualities.forEach(quality => {
            const btn = document.createElement('button');
            btn.textContent = quality;
            btn.onclick = () => {
                vimeoPlugin.setQuality(quality).then(selected => {
                    console.log('Quality set to:', selected);
                });
            };
            selector.appendChild(btn);
        });
    });

    // Highlight current quality
    player.addEventListener('qualitychange', (data) => {
        console.log('Now playing at:', data.quality);
    });
</script>
```

---

## Advanced Features

### Background Mode

Use video as background with no controls:

```javascript
const player = new MYETVPlayer('myVideo', {
    plugins: {
        vimeo: {
            videoId: '76979871',
            background: true,  // Background mode
            autoplay: true,
            loop: true,
            muted: true
        }
    }
});
```

---

### Custom Player Color

Match video player to your brand:

```javascript
const player = new MYETVPlayer('myVideo', {
    plugins: {
        vimeo: {
            videoId: '76979871',
            color: 'ff0000' // Red (hex without #)
        }
    }
});
```

---

### Privacy Mode (Do Not Track)

Enable privacy-focused playback:

```javascript
const player = new MYETVPlayer('myVideo', {
    plugins: {
        vimeo: {
            videoId: '76979871',
            dnt: true // Enable Do Not Track
        }
    }
});
```

---

### Fetch Video Metadata

Get video information before/after loading:

```javascript
const vimeoPlugin = player.getPlugin('vimeo');

vimeoPlugin.getVideoMetadata('76979871').then(metadata => {
    // Display video info
    document.getElementById('title').textContent = metadata.title;
    document.getElementById('author').textContent = metadata.author;
    document.getElementById('thumbnail').src = metadata.thumbnail;

    // Use duration
    const minutes = Math.floor(metadata.duration / 60);
    const seconds = metadata.duration % 60;
    document.getElementById('duration').textContent = `${minutes}:${seconds}`;
});
```

---

## Examples

### Example 1: Video Gallery

```html
<video id="myVideo" class="video-player"></video>

<div id="gallery">
    <button onclick="loadVimeoVideo('76979871')">Video 1</button>
    <button onclick="loadVimeoVideo('148751763')">Video 2</button>
    <button onclick="loadVimeoVideo('259411563')">Video 3</button>
</div>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: { vimeo: {} }
    });

    const vimeoPlugin = player.getPlugin('vimeo');

    function loadVimeoVideo(videoId) {
        vimeoPlugin.loadVideo(videoId).then(() => {
            // Optionally fetch and display metadata
            vimeoPlugin.getVideoMetadata(videoId).then(meta => {
                console.log('Loaded:', meta.title);
            });
        });
    }
</script>
```

---

### Example 2: Quality Presets

```javascript
const player = new MYETVPlayer('myVideo', {
    plugins: { vimeo: { videoId: '76979871' } }
});

const vimeoPlugin = player.getPlugin('vimeo');

// Create preset buttons
const presets = {
    'High Quality': '1080p',
    'Medium Quality': '720p',
    'Low Quality': '360p',
    'Auto': 'auto'
};

Object.entries(presets).forEach(([label, quality]) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.onclick = () => {
        vimeoPlugin.setQuality(quality).then(selected => {
            alert(`Quality: ${selected}`);
        });
    };
    document.body.appendChild(btn);
});
```

---

### Example 3: Progress Tracker

```javascript
const player = new MYETVPlayer('myVideo', {
    plugins: { vimeo: { videoId: '76979871' } }
});

const vimeoPlugin = player.getPlugin('vimeo');

// Track viewing progress
let watchedSeconds = 0;
let milestones = [25, 50, 75, 100];

player.addEventListener('timeupdate', (data) => {
    watchedSeconds = data.currentTime;
    const percent = (data.currentTime / data.duration) * 100;

    // Check milestones
    milestones.forEach((milestone, index) => {
        if (percent >= milestone && milestones.includes(milestone)) {
            console.log(`Milestone: ${milestone}% watched!`);
            milestones.splice(index, 1);
        }
    });

    // Update progress bar
    document.getElementById('progress-bar').style.width = percent + '%';
});
```

---

### Example 4: Multi-Language Subtitles

```javascript
const player = new MYETVPlayer('myVideo', {
    plugins: {
        vimeo: {
            videoId: '76979871',
            texttrack: 'en' // Default to English
        }
    }
});

const vimeoPlugin = player.getPlugin('vimeo');

// Load available subtitles
vimeoPlugin.getTextTracks().then(tracks => {
    const selector = document.getElementById('subtitle-selector');

    tracks.forEach(track => {
        const option = document.createElement('option');
        option.value = track.language;
        option.textContent = track.label;
        selector.appendChild(option);
    });

    // Change subtitle on selection
    selector.onchange = (e) => {
        const lang = e.target.value;
        if (lang) {
            vimeoPlugin.enableTextTrack(lang, 'subtitles');
        } else {
            vimeoPlugin.disableTextTrack();
        }
    };
});
```

---

### Example 5: Playback Speed Controller

```javascript
const player = new MYETVPlayer('myVideo', {
    plugins: {
        vimeo: {
            videoId: '76979871',
            speed: true // Enable speed controls
        }
    }
});

const vimeoPlugin = player.getPlugin('vimeo');

// Create speed buttons
[0.5, 0.75, 1, 1.25, 1.5, 2].forEach(speed => {
    const btn = document.createElement('button');
    btn.textContent = `${speed}x`;
    btn.onclick = () => {
        vimeoPlugin.setPlaybackRate(speed).then(rate => {
            console.log('Speed:', rate);
        });
    };
    document.getElementById('speed-controls').appendChild(btn);
});
```

---

### Example 6: Responsive with Custom Controls

```javascript
const player = new MYETVPlayer('myVideo', {
    plugins: {
        vimeo: {
            videoId: '76979871',
            responsive: true,
            controls: false,  // Hide Vimeo controls
            syncControls: true // Use custom controls
        }
    }
});

const vimeoPlugin = player.getPlugin('vimeo');

// Custom play/pause button
document.getElementById('play-btn').onclick = () => {
    vimeoPlugin.vimeoPlayer.getPaused().then(paused => {
        if (paused) {
            vimeoPlugin.play();
        } else {
            vimeoPlugin.pause();
        }
    });
};

// Custom seek bar
const seekBar = document.getElementById('seek-bar');
seekBar.oninput = (e) => {
    vimeoPlugin.getDuration().then(duration => {
        const time = (e.target.value / 100) * duration;
        vimeoPlugin.setCurrentTime(time);
    });
};

// Update seek bar
player.addEventListener('timeupdate', (data) => {
    seekBar.value = data.percent * 100;
});
```

---

## FAQ

### Q: Do I need a Vimeo API key?

**A:** No! The plugin uses the Vimeo Player SDK which doesn't require authentication for public videos.

---

### Q: Can I play private videos?

**A:** Yes, but the video must be set to "Unlisted" or you must be logged into the Vimeo account that owns the video. Completely private videos won't work in embedded players.

---

### Q: What's the difference between `videoId` and `videoUrl`?

**A:** Both work! Use whichever is more convenient:
- `videoId`: Just the numeric ID (e.g., `'76979871'`)
- `videoUrl`: Full URL (e.g., `'https://vimeo.com/76979871'`)

---

### Q: Can I customize the player appearance?

**A:** Yes! Use the `color` option to change the control bar color, and combine options like `byline`, `portrait`, `title` to control what's displayed.

---

### Q: How do I handle videos that can't be embedded?

**A:** Listen to the error event:

```javascript
player.addEventListener('error', (data) => {
    console.error('Vimeo error:', data);
    // Redirect to Vimeo or show message
});
```

---

### Q: Can I use both Vimeo and regular videos?

**A:** Yes! The plugin coexists with standard video playback:

```javascript
const vimeoPlugin = player.getPlugin('vimeo');

// Load Vimeo video
vimeoPlugin.loadVideo('76979871');

// Later, load regular video
player.video.src = 'local-video.mp4';
```

---

### Q: Does the plugin support live streams?

**A:** Yes! Vimeo live streams work the same way as regular videos. Just use the video ID of the live event.

---

### Q: How do I get the video thumbnail?

**A:** Use the metadata API:

```javascript
vimeoPlugin.getVideoMetadata('76979871').then(meta => {
    document.getElementById('thumbnail').src = meta.thumbnail;
    // Or use high-res version
    document.getElementById('thumbnail-hd').src = meta.thumbnailLarge;
});
```

---

## Troubleshooting

### Issue: Vimeo SDK not loading

**Solution:**
- Check browser console for errors
- Verify internet connection
- Check for Content Security Policy restrictions
- Ensure no ad blockers blocking Vimeo scripts

```javascript
// Check if SDK loaded
player.addEventListener('loadedmetadata', () => {
    console.log('Vimeo player ready');
});
```

---

### Issue: Video not playing

**Possible causes:**
1. Invalid video ID
2. Video is private
3. Video doesn't allow embedding
4. Domain restrictions

**Solution:**
```javascript
player.addEventListener('error', (data) => {
    console.error('Error:', data);
    // Show user-friendly message
});
```

---

### Issue: Quality not available

**Solution:**
- Not all videos have all quality levels
- Check available qualities first:

```javascript
player.addEventListener('qualitiesloaded', (data) => {
    console.log('Available:', data.qualities);

    // Only set if available
    if (data.qualities.includes('1080p')) {
        vimeoPlugin.setQuality('1080p');
    }
});
```

---

### Issue: Controls not showing

**Solution:**
- Set `controls: true` in options
- If using custom controls, ensure `syncControls: true`

```javascript
plugins: {
    vimeo: {
        videoId: '76979871',
        controls: true
    }
}
```

---

### Debug Mode

Enable detailed logging:

```javascript
const player = new MYETVPlayer('myVideo', {
    debug: true,
    plugins: {
        vimeo: {
            videoId: '76979871',
            debug: true
        }
    }
});
```

Debug messages appear with the `Vimeo` prefix.

---

## Resources

- **MYETV Player**: [https://www.myetv.tv](https://www.myetv.tv)
- **Vimeo Player SDK**: [Vimeo Player API Documentation](https://developer.vimeo.com/player/sdk)
- **Vimeo oEmbed API**: [Vimeo oEmbed Documentation](https://developer.vimeo.com/api/oembed)
- **GitHub**: [MYETV Video Player Open Source](https://github.com/OskarCosimo/myetv-video-player-opensource)
- **Author**: [https://oskarcosimo.com](https://oskarcosimo.com)

---

## License

MIT License - See main project for details.

---

## Contributing

Contributions are welcome! Please submit pull requests or open issues on GitHub.

---

**Enjoy professional Vimeo integration!**
