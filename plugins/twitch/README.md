# MYETV Player - Twitch Plugin
Official Twitch integration plugin for MYETV Video Player. Embed live streams and VODs with full API control and interactive features.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration Options](#configuration-options)
- [Parent Domains (Important!)](#parent-domains-important)
- [Usage Methods](#usage-methods)
- [API Methods](#api-methods)
- [Events](#events)
- [Live Streams vs VODs](#live-streams-vs-vods)
- [Examples](#examples)
- [FAQ](#faq)
- [Troubleshooting](#troubleshooting)

---

## Features

- **Full Twitch Integration**: Embed live streams, VODs, and collections
- **Live Streaming**: Real-time live stream playback with chat support
- **Video on Demand**: Play Twitch VODs with full playback control
- **Smart Detection**: Auto-detects Twitch URLs from multiple sources
- **Quality Control**: Manage video quality with available stream qualities
- **Complete API**: Full control over playback, volume, seeking, and more
- **Playback Stats**: Access detailed playback statistics
- **Stream Status**: Detect when streams go online/offline
- **Easy Integration**: Seamless integration with MYETV Player
- **Responsive**: Works on desktop and mobile devices

---

## Installation

### Method 1: Direct Script Include

```html
<!-- Load MYETV Player Core -->
<script src="dist/myetv-player.js"></script>

<!-- Load Twitch Plugin -->
<script src="plugins/myetv-player-twitch-plugin.js"></script>
```

### Method 2: Module Import

```javascript
import MYETVPlayer from './myetv-player.js';
import './plugins/myetv-player-twitch-plugin.js';
```

---

## Quick Start

### Live Stream Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>MYETV Player - Twitch Live Stream</title>
    <link rel="stylesheet" href="dist/myetv-player.css">
</head>
<body>
    <!-- Video Element -->
    <video id="myVideo" class="video-player"></video>

    <script src="dist/myetv-player.js"></script>
    <script src="plugins/myetv-player-twitch-plugin.js"></script>

    <script>
        // Initialize player with Twitch live stream
        const player = new MYETVPlayer('myVideo', {
            debug: true,
            plugins: {
                twitch: {
                    channel: 'shroud', // Twitch channel name
                    parent: ['yourdomain.com'], // REQUIRED!
                    autoplay: true
                }
            }
        });
    </script>
</body>
</html>
```

### VOD (Video on Demand) Example

```html
<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            twitch: {
                video: '1234567890', // Twitch VOD ID
                parent: ['yourdomain.com'],
                time: '1h30m0s' // Start at 1 hour 30 minutes
            }
        }
    });
</script>
```

---

## Configuration Options

```javascript
const player = new MYETVPlayer('myVideo', {
    plugins: {
        twitch: {
            // ========== Video Source (choose one) ==========
            // For live streams
            channel: 'shroud',

            // OR for VODs (Video on Demand)
            video: '1234567890',

            // OR for collections
            collection: 'abc123xyz',

            // ========== Parent Domains (REQUIRED!) ==========
            parent: ['yourdomain.com', 'www.yourdomain.com'],

            // ========== Player Dimensions ==========
            width: '100%',     // Width (pixels or percentage)
            height: '100%',    // Height (pixels or percentage)

            // ========== Playback Options ==========
            autoplay: true,    // Auto-play on load
            muted: false,      // Start muted
            time: '0h0m0s',    // Start time for VODs (e.g., '1h30m45s')

            // ========== UI Options ==========
            allowfullscreen: true,  // Enable fullscreen button

            // ========== Plugin Options ==========
            debug: false,                  // Enable debug logging
            replaceNativePlayer: true,     // Replace native video element
            autoLoadFromData: true         // Auto-detect from data attributes
        }
    }
});
```

### Time Format
For VODs, use format: `'1h30m45s'` where:
- `h` = hours
- `m` = minutes
- `s` = seconds

Examples:
- `'0h0m0s'` - Start from beginning
- `'1h0m0s'` - Start at 1 hour
- `'0h30m0s'` - Start at 30 minutes
- `'2h15m30s'` - Start at 2 hours, 15 minutes, 30 seconds

---

## Parent Domains (Important!)

**CRITICAL**: Twitch requires you to specify parent domains where the player will be embedded. This is a security feature.

### What are parent domains?
The `parent` parameter must include all domains where your page will be loaded.

### Examples:

```javascript
// Single domain
parent: ['mysite.com']

// Multiple domains (with and without www)
parent: ['mysite.com', 'www.mysite.com']

// For development
parent: ['localhost']

// For embedded sites
parent: ['mysite.com', 'embed.mysite.com', 'cdn.mysite.com']
```

### Important Notes:
- **Do NOT include protocol** (http://, https://)
- **Do NOT include port** (localhost:3000)
- **Do NOT include paths** (/page/video)
- **Just the hostname**: `example.com`

### What happens if parent is wrong?
The player will show an error: "This video is not available on this domain"

---

## Usage Methods

### Method 1: Live Stream by Channel Name

```html
<video id="myVideo" class="video-player"></video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            twitch: {
                channel: 'shroud',
                parent: ['yourdomain.com']
            }
        }
    });
</script>
```

---

### Method 2: VOD by Video ID

```html
<video id="myVideo" class="video-player"></video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            twitch: {
                video: '1234567890',
                parent: ['yourdomain.com'],
                time: '0h30m0s' // Start at 30 minutes
            }
        }
    });
</script>
```

---

### Method 3: Using Data Attributes

```html
<video id="myVideo" class="video-player"
       data-twitch-channel="shroud"
       data-video-type="twitch">
</video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            twitch: {
                parent: ['yourdomain.com'],
                autoLoadFromData: true
            }
        }
    });
</script>
```

---

### Method 4: Using Twitch URLs

```html
<video id="myVideo" class="video-player"
       src="https://www.twitch.tv/shroud">
</video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            twitch: {
                parent: ['yourdomain.com']
            }
        }
    });
</script>
```

**Supported URL Formats:**
- `https://www.twitch.tv/channelname` (live stream)
- `https://www.twitch.tv/videos/1234567890` (VOD)

---

### Method 5: Load Dynamically

```html
<video id="myVideo" class="video-player"></video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            twitch: {
                parent: ['yourdomain.com']
            }
        }
    });

    const twitchPlugin = player.getPlugin('twitch');

    // Load channel
    twitchPlugin.loadChannel('shroud');

    // Or load VOD
    twitchPlugin.loadVideo('1234567890', '1h0m0s');
</script>
```

---

## API Methods

Get the plugin instance:
```javascript
const twitchPlugin = player.getPlugin('twitch');
```

### Playback Control

#### `play()`
Play the stream/video.

```javascript
twitchPlugin.play().then(() => {
    console.log('Playing');
});
```

**Returns:** Promise

---

#### `pause()`
Pause the stream/video.

```javascript
twitchPlugin.pause().then(() => {
    console.log('Paused');
});
```

**Returns:** Promise

---

#### `seek(seconds)`
Seek to position (VODs only).

```javascript
twitchPlugin.seek(120).then(() => {
    console.log('Seeked to 2 minutes');
});
```

**Parameters:**
- `seconds` (Number): Position in seconds

**Returns:** Promise

**Note:** Seeking only works for VODs, not live streams.

---

#### `getCurrentTime()`
Get current playback position.

```javascript
twitchPlugin.getCurrentTime().then(time => {
    console.log('Current time:', time, 'seconds');
});
```

**Returns:** Promise<Number>

---

#### `getDuration()`
Get video duration (VODs only).

```javascript
twitchPlugin.getDuration().then(duration => {
    console.log('Duration:', duration, 'seconds');
});
```

**Returns:** Promise<Number>

**Note:** Returns 0 for live streams.

---

#### `isPaused()`
Check if player is paused.

```javascript
twitchPlugin.isPaused().then(paused => {
    console.log('Is paused:', paused);
});
```

**Returns:** Promise<Boolean>

---

### Volume Control

#### `setVolume(volume)`
Set volume level.

```javascript
twitchPlugin.setVolume(0.5).then(() => {
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
twitchPlugin.getVolume().then(volume => {
    console.log('Current volume:', volume);
});
```

**Returns:** Promise<Number>

---

#### `setMuted(muted)`
Mute or unmute.

```javascript
twitchPlugin.setMuted(true).then(() => {
    console.log('Muted');
});
```

**Parameters:**
- `muted` (Boolean): Mute state

**Returns:** Promise

---

#### `getMuted()`
Get muted state.

```javascript
twitchPlugin.getMuted().then(muted => {
    console.log('Is muted:', muted);
});
```

**Returns:** Promise<Boolean>

---

### Quality Control

#### `getQuality()`
Get current quality.

```javascript
twitchPlugin.getQuality().then(quality => {
    console.log('Current quality:', quality);
});
```

**Returns:** Promise<String>

---

#### `setQuality(quality)`
Set video quality.

```javascript
twitchPlugin.setQuality('720p60').then(() => {
    console.log('Quality set to 720p60');
});
```

**Parameters:**
- `quality` (String): Quality identifier

**Returns:** Promise

---

#### `getQualities()`
Get available qualities.

```javascript
twitchPlugin.getQualities().then(qualities => {
    console.log('Available qualities:', qualities);
});
```

**Returns:** Promise<Array>

---

### Video/Channel Management

#### `loadChannel(channel)`
Load a Twitch channel (live stream).

```javascript
twitchPlugin.loadChannel('shroud').then(() => {
    console.log('Channel loaded');
});
```

**Parameters:**
- `channel` (String): Twitch channel name

**Returns:** Promise

---

#### `loadVideo(videoId, timestamp)`
Load a VOD.

```javascript
twitchPlugin.loadVideo('1234567890', '1h30m0s').then(() => {
    console.log('VOD loaded');
});
```

**Parameters:**
- `videoId` (String): Twitch video ID
- `timestamp` (String): Start time (optional, default: '0h0m0s')

**Returns:** Promise

---

#### `loadCollection(collectionId, videoId)`
Load a collection.

```javascript
twitchPlugin.loadCollection('abc123', '1234567890').then(() => {
    console.log('Collection loaded');
});
```

**Parameters:**
- `collectionId` (String): Collection ID
- `videoId` (String): Video ID to start from (optional)

**Returns:** Promise

---

#### `getChannel()`
Get current channel name.

```javascript
twitchPlugin.getChannel().then(channel => {
    console.log('Current channel:', channel);
});
```

**Returns:** Promise<String>

---

#### `getVideo()`
Get current video ID.

```javascript
twitchPlugin.getVideo().then(video => {
    console.log('Current video:', video);
});
```

**Returns:** Promise<String>

---

### Playback Stats

#### `getPlaybackStats()`
Get detailed playback statistics.

```javascript
twitchPlugin.getPlaybackStats().then(stats => {
    console.log('Playback stats:', stats);
    console.log('Backend version:', stats.backendVersion);
    console.log('Buffer size:', stats.bufferSize);
    console.log('Codecs:', stats.codecs);
    console.log('Display resolution:', stats.displayResolution);
    console.log('FPS:', stats.fps);
    console.log('HLS latency:', stats.hlsLatencyBroadcaster);
    console.log('Playback rate:', stats.playbackRate);
    console.log('Skipped frames:', stats.skippedFrames);
    console.log('Video resolution:', stats.videoResolution);
});
```

**Returns:** Promise<Object>

---

## 📡 Events

### Playback Events

#### `play`
Video started playing.

```javascript
player.addEventListener('play', () => {
    console.log('Playing');
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
Video ended (VODs only).

```javascript
player.addEventListener('ended', () => {
    console.log('Video ended');
});
```

---

### Plugin-Specific Events

#### `twitchplugin:ready`
Player is ready.

```javascript
player.addEventListener('twitchplugin:ready', () => {
    console.log('Twitch player ready');
});
```

---

#### `twitchplugin:playerready`
Player created and initialized.

```javascript
player.addEventListener('twitchplugin:playerready', (data) => {
    console.log('Channel:', data.channel);
    console.log('Video:', data.video);
    console.log('Is live:', data.isLive);
});
```

---

#### `twitchplugin:online`
Stream went online (for channels).

```javascript
player.addEventListener('twitchplugin:online', () => {
    console.log('Stream is now live!');
});
```

---

#### `twitchplugin:offline`
Stream went offline.

```javascript
player.addEventListener('twitchplugin:offline', () => {
    console.log('Stream went offline');
});
```

---

#### `twitchplugin:playbackblocked`
Playback blocked by browser (autoplay restrictions).

```javascript
player.addEventListener('twitchplugin:playbackblocked', () => {
    console.log('Playback blocked - user interaction required');
    // Show play button or prompt user
});
```

---

#### `twitchplugin:channelloaded`
New channel loaded.

```javascript
player.addEventListener('twitchplugin:channelloaded', (data) => {
    console.log('Channel loaded:', data.channel);
});
```

---

#### `twitchplugin:videoloaded`
New VOD loaded.

```javascript
player.addEventListener('twitchplugin:videoloaded', (data) => {
    console.log('Video loaded:', data.video);
    console.log('Timestamp:', data.timestamp);
});
```

---

## Live Streams vs VODs

### Live Streams

**Characteristics:**
- Real-time playback
- No seeking (always "live")
- Duration is 0
- Can detect online/offline status
- May have latency

**Example:**
```javascript
plugins: {
    twitch: {
        channel: 'shroud',
        parent: ['yourdomain.com']
    }
}
```

---

### VODs (Video on Demand)

**Characteristics:**
- Full playback control
- Seeking available
- Has defined duration
- Start from specific timestamp
- No online/offline events

**Example:**
```javascript
plugins: {
    twitch: {
        video: '1234567890',
        time: '1h30m0s', // Start at 1h30m
        parent: ['yourdomain.com']
    }
}
```

---

### Check Stream Type

```javascript
const twitchPlugin = player.getPlugin('twitch');

if (player.isTwitchLive()) {
    console.log('Watching a live stream');
} else {
    console.log('Watching a VOD');
}
```

---

## Examples

### Example 1: Channel Switcher

```html
<video id="myVideo" class="video-player"></video>

<div id="channel-switcher">
    <button onclick="switchChannel('shroud')">Shroud</button>
    <button onclick="switchChannel('ninja')">Ninja</button>
    <button onclick="switchChannel('pokimane')">Pokimane</button>
</div>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            twitch: {
                parent: ['yourdomain.com']
            }
        }
    });

    const twitchPlugin = player.getPlugin('twitch');

    function switchChannel(channel) {
        twitchPlugin.loadChannel(channel).then(() => {
            console.log('Switched to:', channel);
        });
    }
</script>
```

---

### Example 2: VOD Player with Controls

```html
<video id="myVideo" class="video-player"></video>

<div id="custom-controls">
    <button id="playBtn">Play</button>
    <button id="pauseBtn">Pause</button>
    <input type="range" id="seekBar" min="0" max="100" value="0">
    <span id="timeDisplay">0:00 / 0:00</span>
</div>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            twitch: {
                video: '1234567890',
                parent: ['yourdomain.com']
            }
        }
    });

    const twitchPlugin = player.getPlugin('twitch');

    // Play button
    document.getElementById('playBtn').onclick = () => {
        twitchPlugin.play();
    };

    // Pause button
    document.getElementById('pauseBtn').onclick = () => {
        twitchPlugin.pause();
    };

    // Seek bar
    document.getElementById('seekBar').oninput = (e) => {
        twitchPlugin.getDuration().then(duration => {
            const seekTo = (e.target.value / 100) * duration;
            twitchPlugin.seek(seekTo);
        });
    };

    // Update time display
    setInterval(() => {
        Promise.all([
            twitchPlugin.getCurrentTime(),
            twitchPlugin.getDuration()
        ]).then(([current, duration]) => {
            const seekBar = document.getElementById('seekBar');
            seekBar.value = (current / duration) * 100;

            document.getElementById('timeDisplay').textContent = 
                `${formatTime(current)} / ${formatTime(duration)}`;
        });
    }, 1000);

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
</script>
```

---

### Example 3: Stream Status Indicator

```html
<video id="myVideo" class="video-player"></video>

<div id="status">
    <span id="indicator" style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: gray;"></span>
    <span id="status-text">Checking...</span>
</div>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            twitch: {
                channel: 'shroud',
                parent: ['yourdomain.com']
            }
        }
    });

    const indicator = document.getElementById('indicator');
    const statusText = document.getElementById('status-text');

    // Stream went online
    player.addEventListener('twitchplugin:online', () => {
        indicator.style.background = '#00ff00';
        statusText.textContent = 'LIVE';
    });

    // Stream went offline
    player.addEventListener('twitchplugin:offline', () => {
        indicator.style.background = '#ff0000';
        statusText.textContent = 'OFFLINE';
    });

    // Player ready
    player.addEventListener('twitchplugin:ready', () => {
        indicator.style.background = '#00ff00';
        statusText.textContent = 'LIVE';
    });
</script>
```

---

### Example 4: Quality Selector

```html
<video id="myVideo" class="video-player"></video>

<div id="quality-selector"></div>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            twitch: {
                channel: 'shroud',
                parent: ['yourdomain.com']
            }
        }
    });

    const twitchPlugin = player.getPlugin('twitch');

    // Wait for player ready
    player.addEventListener('twitchplugin:ready', () => {
        // Get available qualities
        twitchPlugin.getQualities().then(qualities => {
            const selector = document.getElementById('quality-selector');

            qualities.forEach(quality => {
                const btn = document.createElement('button');
                btn.textContent = quality;
                btn.onclick = () => {
                    twitchPlugin.setQuality(quality).then(() => {
                        console.log('Quality set to:', quality);
                    });
                };
                selector.appendChild(btn);
            });
        });
    });
</script>
```

---

### Example 5: Playback Stats Display

```html
<video id="myVideo" class="video-player"></video>

<div id="stats" style="font-family: monospace; font-size: 12px;"></div>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            twitch: {
                channel: 'shroud',
                parent: ['yourdomain.com']
            }
        }
    });

    const twitchPlugin = player.getPlugin('twitch');

    // Update stats every second
    setInterval(() => {
        twitchPlugin.getPlaybackStats().then(stats => {
            const statsDiv = document.getElementById('stats');
            statsDiv.innerHTML = `
                Resolution: ${stats.videoResolution}<br>
                FPS: ${stats.fps}<br>
                Codecs: ${stats.codecs}<br>
                Bitrate: ${(stats.bitrate / 1000).toFixed(2)} Mbps<br>
                Buffer: ${stats.bufferSize}s<br>
                Skipped Frames: ${stats.skippedFrames}
            `;
        });
    }, 1000);
</script>
```

---

## FAQ

### Q: What's the difference between channel and video?

**A:**
- `channel`: Live stream from a Twitch channel (e.g., 'shroud')
- `video`: VOD (Video on Demand) with a specific ID (e.g., '1234567890')

---

### Q: Why do I see "This video is not available on this domain"?

**A:** Your `parent` domains are incorrect. Make sure to include the exact hostname where your page is hosted.

```javascript
// Correct
parent: ['mysite.com']

// Wrong
parent: ['https://mysite.com']  // No protocol!
parent: ['mysite.com/page']     // No path!
```

---

### Q: Can I seek in live streams?

**A:** No, seeking only works for VODs. Live streams are always "live" at the current moment.

---

### Q: How do I get a video ID from a Twitch URL?

**A:** The video ID is in the URL:
- URL: `https://www.twitch.tv/videos/1234567890`
- ID: `1234567890`

---

### Q: Can I hide Twitch branding?

**A:** No, Twitch requires their branding to remain visible as per their Terms of Service.

---

### Q: Does this work with Twitch clips?

**A:** The current version supports channels (live) and videos (VODs). Clips support may be added in a future update.

---

### Q: How do I handle autoplay restrictions?

**A:** Modern browsers block autoplay. Listen for the `playbackblocked` event:

```javascript
player.addEventListener('twitchplugin:playbackblocked', () => {
    // Show a play button or prompt user
    alert('Click to play');
});
```

---

## Troubleshooting

### Issue: Player not loading

**Solution:**
1. Check `parent` domains are correct
2. Verify channel name or video ID is valid
3. Check browser console for errors
4. Ensure Twitch isn't blocked by firewall/adblocker

---

### Issue: "This video is not available"

**Solution:**
- Add correct parent domains
- Include both `example.com` and `www.example.com` if needed
- Don't include protocol or paths

---

### Issue: Seeking not working

**Solution:**
- Seeking only works for VODs, not live streams
- Check if `player.isTwitchLive()` returns `false`

---

### Issue: Autoplay not working

**Solution:**
- Browsers block autoplay
- Set `muted: true` for autoplay to work
- Handle `playbackblocked` event

```javascript
plugins: {
    twitch: {
        channel: 'shroud',
        parent: ['yourdomain.com'],
        autoplay: true,
        muted: true  // Required for autoplay
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
        twitch: {
            channel: 'shroud',
            parent: ['yourdomain.com'],
            debug: true
        }
    }
});
```

Debug messages appear with `Twitch Plugin:` prefix.

---

## Resources

- **MYETV Player**: [https://www.myetv.tv](https://www.myetv.tv)
- **Twitch Developers**: [https://dev.twitch.tv/docs/embed/](https://dev.twitch.tv/docs/embed/)
- **Twitch Player SDK**: [Twitch Embed Documentation](https://dev.twitch.tv/docs/embed/video-and-clips/)
- **GitHub**: [MYETV Video Player Open Source](https://github.com/OskarCosimo/myetv-video-player-opensource)
- **Author**: [https://oskarcosimo.com](https://oskarcosimo.com)

---

## License

MIT License - See main project for details.

---

## Contributing

Contributions are welcome! Please submit pull requests or open issues on GitHub.

---

**Happy streaming!**
