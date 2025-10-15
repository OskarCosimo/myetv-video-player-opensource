# MYETV Player - Cloudflare Stream Plugin
Official Cloudflare Stream integration plugin for MYETV Video Player. Embed videos from Cloudflare Stream with full API control, live streaming, and enterprise features.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration Options](#configuration-options)
- [Public vs Private Videos](#public-vs-private-videos)
- [Usage Methods](#usage-methods)
- [API Methods](#api-methods)
- [Events](#events)
- [Player Customization](#player-customization)
- [Examples](#examples)
- [FAQ](#faq)
- [Troubleshooting](#troubleshooting)

---

## Features

- **Cloudflare Stream Integration**: Full support for Cloudflare Stream videos
- **DASH/HLS** adaptive streaming ready with full support and libraries hosted on cdnjs.com
- **Private Videos**: Support for signed URLs and private video access
- **Live Streaming**: Real-time live stream playback
- **Player Customization**: Custom colors, poster images, and branding
- **Auto-Detection**: Automatically detects Cloudflare Stream URLs
- **Auto-Quality**: Automatically detect video quality (also for hls/dash)
- **Complete API**: Full control over playback, volume, seeking
- **Analytics Ready**: Works with Cloudflare Analytics
- **Ad Support**: VAST ad tag integration
- **Easy Integration**: Seamless MYETV Player integration
- **Responsive**: Works perfectly on all devices
- **Global CDN**: Powered by Cloudflare's global network

---

## Installation

### Method 1: Direct Script Include

```html
<!-- Load MYETV Player Core -->
<script src="dist/myetv-player.js"></script>

<!-- Load Cloudflare Stream Plugin -->
<script src="plugins/myetv-player-cloudflare-plugin.js"></script>
```

### Method 2: Module Import

```javascript
import MYETVPlayer from './myetv-player.js';
import './plugins/myetv-player-cloudflare-plugin.js';
```

---

## Quick Start

### Basic Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>MYETV Player - Cloudflare Stream</title>
    <link rel="stylesheet" href="dist/myetv-player.css">
</head>
<body>
    <!-- Video Element -->
    <video id="myVideo" class="video-player"></video>

    <script src="dist/myetv-player.js"></script>
    <script src="plugins/myetv-player-cloudflare-plugin.js"></script>

    <script>
        // Initialize player with Cloudflare Stream
        const player = new MYETVPlayer('myVideo', {
            debug: true,
            plugins: {
                cloudflare: {
                    videoId: '5d5bc37ffcf54c9b82e996823bffbb81', // Your video ID
                    autoplay: false,
                    controls: true
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
        cloudflare: {
            // ========== Video Source (choose one) ==========
            // Option 1: Video ID (most common)
            videoId: '5d5bc37ffcf54c9b82e996823bffbb81',

            // Option 2: Full video URL
            videoUrl: 'https://iframe.videodelivery.net/5d5bc37ffcf54c9b82e996823bffbb81',

            // Option 3: Signed URL (for private videos)
            signedUrl: 'https://iframe.videodelivery.net/5d5bc37f...?token=xyz',

            // ========== Account Settings ==========
            // Your Cloudflare customer code (optional for most cases)
            customerCode: 'abc123def',

            // ========== Playback Options ==========
            autoplay: false,           // Auto-play on load
            muted: false,              // Start muted
            loop: false,               // Loop playback
            preload: 'metadata',       // 'none', 'metadata', 'auto'
            controls: true,            // Show player controls
            startTime: 0,              // Start position in seconds
            defaultQuality: 'auto',    // the default quality of the video (auto, 720p, 480p, 360p ecc.)

            // ========== Player Customization ==========
            poster: 'https://example.com/poster.jpg',  // Custom poster image
            primaryColor: '#ff6600',                    // Player accent color
            letterboxColor: 'black',                    // Letterbox background

            // ========== Subtitles/Captions ==========
            defaultTextTrack: 'en',    // Default subtitle language

            // ========== Advanced Features ==========
            adUrl: 'https://example.com/vast.xml',     // VAST ad tag URL

            // ========== Plugin Options ==========
            debug: false,                  // Enable debug logging
            replaceNativePlayer: true,     // Replace native video element
            autoLoadFromData: true,        // Auto-detect from data attributes
            responsive: true               // Responsive sizing
        }
    }
});
```

---

## Public vs Private Videos

### Public Videos

Public videos can be embedded anywhere without restrictions.

```javascript
plugins: {
    cloudflare: {
        videoId: '5d5bc37ffcf54c9b82e996823bffbb81'
        // That's it! No authentication needed
    }
}
```

---

### Private Videos

Private videos require a **signed URL** with a time-limited token.

#### How to Generate Signed URLs:

1. **In Cloudflare Dashboard:**
   - Go to Stream → Your Video
   - Set "Require signed URLs" to ON
   - Generate a signing key

2. **Generate Token (Server-Side):**

```javascript
// Node.js example
const crypto = require('crypto');

function generateSignedUrl(videoId, signingKey, expiresIn = 3600) {
    const expires = Math.floor(Date.now() / 1000) + expiresIn;
    const toSign = `${videoId}${expires}`;
    const signature = crypto
        .createHmac('sha256', signingKey)
        .update(toSign)
        .digest('hex');

    return `https://iframe.videodelivery.net/${videoId}?token=${signature}&expires=${expires}`;
}

const signedUrl = generateSignedUrl(
    '5d5bc37ffcf54c9b82e996823bffbb81',
    'YOUR_SIGNING_KEY',
    3600 // 1 hour
);
```

3. **Use in Plugin:**

```javascript
plugins: {
    cloudflare: {
        signedUrl: signedUrl  // Pass the signed URL
    }
}
```

**Important Notes:**
- Generate signed URLs **server-side** only
- Never expose your signing key in client code
- Set appropriate expiration times
- Tokens expire automatically for security

---

## Usage Methods

### Method 1: Using Video ID

```html
<video id="myVideo" class="video-player"></video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            cloudflare: {
                videoId: '5d5bc37ffcf54c9b82e996823bffbb81'
            }
        }
    });
</script>
```

---

### Method 2: Using Data Attributes

```html
<video id="myVideo" class="video-player"
       data-cloudflare-video-id="5d5bc37ffcf54c9b82e996823bffbb81"
       data-video-type="cloudflare">
</video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            cloudflare: {
                autoLoadFromData: true
            }
        }
    });
</script>
```

---

### Method 3: Using Cloudflare URL

```html
<video id="myVideo" class="video-player"
       src="https://iframe.videodelivery.net/5d5bc37ffcf54c9b82e996823bffbb81">
</video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            cloudflare: {}
        }
    });
</script>
```
**Supported URL Formats:**
- `https://iframe.videodelivery.net/VIDEO_ID` (iframe)
- `https://customer-[code].cloudflarestream.com/VIDEO_ID/iframe` (iframe)
- `https://videodelivery.net/VIDEO_ID`

### Method 4: HLS / DASH Adaptive Streaming

```html
<video id="myVideo" class="video-player"></video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            cloudflare: {
                manifestUrl: 'https://customer-[code].cloudflarestream.com/VIDEO_ID/manifest/video.m3u8'
            }
        }
    });
</script>
```

**Supported URL Formats:**
- `https://customer-[code].cloudflarestream.com/VIDEO_ID/manifest/video.m3u8` (hls)
- `https://customer-[code].cloudflarestream.com/VIDEO_ID/manifest/video.mpd` (dash)

---

### Method 5: Load Dynamically

```html
<video id="myVideo" class="video-player"></video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: { cloudflare: {} }
    });

    const cfPlugin = player.getPlugin('cloudflare');

    // Load video after initialization
    cfPlugin.loadVideo('5d5bc37ffcf54c9b82e996823bffbb81');
</script>
```

---

## API Methods

Get the plugin instance:
```javascript
const cfPlugin = player.getPlugin('cloudflare');
```

### Playback Control

#### `play()`
Play the video.

```javascript
cfPlugin.play().then(() => {
    console.log('Playing');
});
```

**Returns:** Promise

---

#### `pause()`
Pause the video.

```javascript
cfPlugin.pause().then(() => {
    console.log('Paused');
});
```

**Returns:** Promise

---

#### `seek(seconds)`
Seek to position.

```javascript
cfPlugin.seek(60).then(() => {
    console.log('Seeked to 1 minute');
});
```

**Parameters:**
- `seconds` (Number): Position in seconds

**Returns:** Promise

---

#### `getCurrentTime()`
Get current playback position.

```javascript
cfPlugin.getCurrentTime().then(time => {
    console.log('Current time:', time);
});
```

**Returns:** Promise<Number>

---

#### `getDuration()`
Get video duration.

```javascript
cfPlugin.getDuration().then(duration => {
    console.log('Duration:', duration);
});
```

**Returns:** Promise<Number>

---

#### `getPaused()`
Check if video is paused.

```javascript
cfPlugin.getPaused().then(paused => {
    console.log('Is paused:', paused);
});
```

**Returns:** Promise<Boolean>

---

### Volume Control

#### `setVolume(volume)`
Set volume level.

```javascript
cfPlugin.setVolume(0.5).then(() => {
    console.log('Volume set to 50%');
});
```

**Parameters:**
- `volume` (Number): Volume level (0-1)

**Returns:** Promise

---

#### `getVolume()`
Get current volume.

```javascript
cfPlugin.getVolume().then(volume => {
    console.log('Current volume:', volume);
});
```

**Returns:** Promise<Number>

---

#### `mute()`
Mute the video.

```javascript
cfPlugin.mute().then(() => {
    console.log('Muted');
});
```

**Returns:** Promise

---

#### `unmute()`
Unmute the video.

```javascript
cfPlugin.unmute().then(() => {
    console.log('Unmuted');
});
```

**Returns:** Promise

---

#### `getMuted()`
Get muted state.

```javascript
cfPlugin.getMuted().then(muted => {
    console.log('Is muted:', muted);
});
```

**Returns:** Promise<Boolean>

---

### Playback Speed

#### `setPlaybackRate(rate)`
Set playback speed.

```javascript
cfPlugin.setPlaybackRate(1.5).then(() => {
    console.log('Speed set to 1.5x');
});
```

**Parameters:**
- `rate` (Number): Playback rate (0.25 - 2.0)

**Returns:** Promise

---

### Video Management

#### `loadVideo(videoId, customerCode)`
Load a new video.

```javascript
cfPlugin.loadVideo('5d5bc37ffcf54c9b82e996823bffbb81').then(() => {
    console.log('New video loaded');
});

// With customer code
cfPlugin.loadVideo('5d5bc37f...', 'abc123').then(() => {
    console.log('Custom domain video loaded');
});
```

**Parameters:**
- `videoId` (String): Cloudflare Stream video ID
- `customerCode` (String): Optional customer code

**Returns:** Promise

---

## 📡 Events

### Playback Events

#### `play`
Video started playing.

```javascript
player.addEventListener('play', () => {
    console.log('Video playing');
});
```

---

#### `playing`
Video is actively playing.

```javascript
player.addEventListener('playing', () => {
    console.log('Playing');
});
```

---

#### `pause`
Video paused.

```javascript
player.addEventListener('pause', () => {
    console.log('Paused');
});
```

---

#### `ended`
Video ended.

```javascript
player.addEventListener('ended', () => {
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
});
```

---

### Volume Events

#### `volumechange`
Volume changed.

```javascript
player.addEventListener('volumechange', (data) => {
    console.log('Volume:', data.volume);
    console.log('Muted:', data.muted);
});
```

---

### Plugin Events

#### `cloudflare:playerready`
Player created and ready.

```javascript
player.addEventListener('cloudflare:playerready', (data) => {
    console.log('Player ready for video:', data.videoId);
});
```

---

#### `cloudflare:ready`
Video loaded and ready to play.

```javascript
player.addEventListener('cloudflare:ready', () => {
    console.log('Video ready');
});
```

---

#### `cloudflare:videoloaded`
New video loaded.

```javascript
player.addEventListener('cloudflare:videoloaded', (data) => {
    console.log('Video loaded:', data.videoId);
});
```

---

#### `cloudflare:error`
Player error occurred.

```javascript
player.addEventListener('cloudflare:error', (error) => {
    console.error('Cloudflare error:', error);
});
```

---

#### `loadedmetadata`
Video metadata loaded.

```javascript
player.addEventListener('loadedmetadata', (data) => {
    console.log('Metadata loaded:', data);
});
```

---

## Player Customization

### Custom Colors

Match the player to your brand:

```javascript
plugins: {
    cloudflare: {
        videoId: '5d5bc37ffcf54c9b82e996823bffbb81',
        primaryColor: '#ff6600',      // Accent color (controls, progress)
        letterboxColor: '#000000'     // Letterbox background
    }
}
```

---

### Custom Poster Image

Set a custom thumbnail:

```javascript
plugins: {
    cloudflare: {
        videoId: '5d5bc37ffcf54c9b82e996823bffbb81',
        poster: 'https://example.com/custom-poster.jpg'
    }
}
```

---

### Hide Controls

Create a custom UI:

```javascript
plugins: {
    cloudflare: {
        videoId: '5d5bc37ffcf54c9b82e996823bffbb81',
        controls: false  // Hide default controls
    }
}
```

---

### Autoplay with Mute

For autoplay on mobile:

```javascript
plugins: {
    cloudflare: {
        videoId: '5d5bc37ffcf54c9b82e996823bffbb81',
        autoplay: true,
        muted: true  // Required for autoplay
    }
}
```

---

## Examples

### Example 1: Video Gallery

```html
<video id="myVideo" class="video-player"></video>

<div id="video-gallery">
    <button onclick="loadCFVideo('video-id-1')">Video 1</button>
    <button onclick="loadCFVideo('video-id-2')">Video 2</button>
    <button onclick="loadCFVideo('video-id-3')">Video 3</button>
</div>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: { cloudflare: {} }
    });

    const cfPlugin = player.getPlugin('cloudflare');

    function loadCFVideo(videoId) {
        cfPlugin.loadVideo(videoId).then(() => {
            console.log('Loaded:', videoId);
        });
    }
</script>
```

---

### Example 2: Custom Controls

```html
<video id="myVideo" class="video-player"></video>

<div id="custom-controls">
    <button id="playBtn">Play</button>
    <button id="pauseBtn">Pause</button>
    <input type="range" id="seekBar" min="0" max="100" value="0">
    <input type="range" id="volumeSlider" min="0" max="100" value="100">
    <span id="time">0:00 / 0:00</span>
</div>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            cloudflare: {
                videoId: '5d5bc37ffcf54c9b82e996823bffbb81',
                controls: false  // Use custom controls
            }
        }
    });

    const cfPlugin = player.getPlugin('cloudflare');

    // Play button
    document.getElementById('playBtn').onclick = () => {
        cfPlugin.play();
    };

    // Pause button
    document.getElementById('pauseBtn').onclick = () => {
        cfPlugin.pause();
    };

    // Seek bar
    document.getElementById('seekBar').oninput = (e) => {
        cfPlugin.getDuration().then(duration => {
            const seekTo = (e.target.value / 100) * duration;
            cfPlugin.seek(seekTo);
        });
    };

    // Volume slider
    document.getElementById('volumeSlider').oninput = (e) => {
        const volume = e.target.value / 100;
        cfPlugin.setVolume(volume);
    };

    // Update time display
    player.addEventListener('timeupdate', (data) => {
        const seekBar = document.getElementById('seekBar');
        seekBar.value = (data.currentTime / data.duration) * 100;

        document.getElementById('time').textContent = 
            `${formatTime(data.currentTime)} / ${formatTime(data.duration)}`;
    });

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
</script>
```

---

### Example 3: Private Video with Signed URL

```html
<video id="myVideo" class="video-player"></video>

<script>
    // Fetch signed URL from your server
    fetch('/api/get-signed-url?videoId=5d5bc37f...')
        .then(res => res.json())
        .then(data => {
            const player = new MYETVPlayer('myVideo', {
                plugins: {
                    cloudflare: {
                        signedUrl: data.signedUrl  // Use signed URL
                    }
                }
            });
        });
</script>
```

**Server-side (Node.js):**
```javascript
app.get('/api/get-signed-url', (req, res) => {
    const videoId = req.query.videoId;
    const signedUrl = generateSignedUrl(videoId, process.env.CF_SIGNING_KEY);
    res.json({ signedUrl });
});
```

---

### Example 4: Branded Player

```html
<video id="myVideo" class="video-player"></video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            cloudflare: {
                videoId: '5d5bc37ffcf54c9b82e996823bffbb81',
                primaryColor: '#ff6600',
                poster: 'https://mybrand.com/poster.jpg',
                autoplay: false,
                loop: false
            }
        }
    });
</script>
```

---

### Example 5: Video with Ads (VAST)

```html
<video id="myVideo" class="video-player"></video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            cloudflare: {
                videoId: '5d5bc37ffcf54c9b82e996823bffbb81',
                adUrl: 'https://example.com/vast-ad-tag.xml'  // VAST ad URL
            }
        }
    });
</script>
```

---

### Example 6: Live Stream

```html
<video id="myVideo" class="video-player"></video>

<div id="live-indicator" style="display: none;">
    🔴 LIVE
</div>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            cloudflare: {
                videoId: 'live-stream-id-abc123',
                autoplay: true,
                muted: true
            }
        }
    });

    // Show live indicator when streaming
    player.addEventListener('cloudflare:ready', () => {
        document.getElementById('live-indicator').style.display = 'block';
    });
</script>
```

---

## FAQ

### Q: Do I need a Cloudflare account?

**A:** Yes, you need a Cloudflare Stream account to upload and host videos. Videos are stored in your Cloudflare Stream account.

---

### Q: How do I get a video ID?

**A:**
1. Upload video to Cloudflare Stream
2. In your dashboard, go to Stream
3. Click on your video
4. Copy the Video ID (shown in the URL or video details)

---

### Q: Can I embed videos on any domain?

**A:** Yes! Unlike some platforms, Cloudflare Stream works on any domain without domain restrictions.

---

### Q: What's the difference between videoId and signedUrl?

**A:**
- `videoId`: For public videos, just use the video ID
- `signedUrl`: For private videos, use a time-limited signed URL with a token

---

### Q: How do I make a video private?

**A:**
1. In Cloudflare dashboard, go to your video
2. Enable "Require signed URLs"
3. Generate a signing key
4. Use that key to create signed URLs server-side

---

### Q: Does this support live streaming?

**A:** Yes! Cloudflare Stream supports both VODs and live streaming. Just use your live stream ID as the `videoId`.

---

### Q: Can I customize the player appearance?

**A:** Yes! You can customize:
- Primary color (controls, progress bar)
- Letterbox color (background)
- Poster image
- Show/hide controls

---

### Q: How do I track analytics?

**A:** Cloudflare Stream provides built-in analytics in your dashboard. No additional setup needed in the player.

---

## Troubleshooting

### Issue: Video not loading

**Possible causes:**
1. Invalid video ID
2. Video not uploaded/ready in Cloudflare
3. Video requires signed URL but none provided
4. Network/firewall blocking Cloudflare

**Solution:**
- Verify video ID in Cloudflare dashboard
- Check if video processing is complete
- For private videos, use signed URLs
- Check browser console for errors

---

### Issue: "This video requires a valid token"

**Solution:**
Your video requires a signed URL:
```javascript
plugins: {
    cloudflare: {
        signedUrl: 'YOUR_SIGNED_URL'  // Not just videoId
    }
}
```

---

### Issue: Player not responsive

**Solution:**
Ensure container has proper sizing:
```css
.video-player {
    width: 100%;
    height: 100%;
    max-width: 100%;
}
```

---

### Issue: Autoplay not working

**Solution:**
Browsers require muted videos for autoplay:
```javascript
plugins: {
    cloudflare: {
        videoId: 'YOUR_VIDEO_ID',
        autoplay: true,
        muted: true  // Required!
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
        cloudflare: {
            videoId: 'YOUR_VIDEO_ID',
            debug: true
        }
    }
});
```

Debug messages appear with `Cloudflare Stream:` prefix.

---

## Resources

- **MYETV Player**: [https://www.myetv.tv](https://www.myetv.tv)
- **Cloudflare Stream**: [https://cloudflare.com/products/cloudflare-stream/](https://cloudflare.com/products/cloudflare-stream/)
- **Cloudflare Stream Docs**: [https://developers.cloudflare.com/stream/](https://developers.cloudflare.com/stream/)
- **Stream Player API**: [https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/using-the-player-api/](https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/using-the-player-api/)
- **GitHub**: [MYETV Video Player Open Source](https://github.com/OskarCosimo/myetv-video-player-opensource)
- **Author**: [https://oskarcosimo.com](https://oskarcosimo.com)

---

## License

MIT License - See main project for details.

---

## Contributing

Contributions are welcome! Please submit pull requests or open issues on GitHub.

---

**Enjoy enterprise-grade video delivery!**
