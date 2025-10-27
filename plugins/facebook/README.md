# MYETV Player - Facebook Plugin
Official Facebook integration plugin for MYETV Video Player. Embed and control Facebook videos directly in your player with full API support.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration Options](#configuration-options)
- [Privacy & Video Access](#privacy--video-access)
- [Usage Methods](#usage-methods)
- [API Methods](#api-methods)
- [Events](#events)
- [Examples](#examples)
- [FAQ](#faq)
- [Troubleshooting](#troubleshooting)

---

## Features

- **Facebook Video Integration**: Embed any Facebook video using URL or ID
- **App ID Support**: Optional Facebook App ID for enhanced features
- **Public & Private Videos**: Support for public videos and authorized private content
- **Smart Loading**: Asynchronous Facebook SDK loading
- **Full API Control**: Complete playback control (play, pause, seek, volume)
- **Rich Events**: Comprehensive event system for all player states
- **Auto-Detection**: Automatically detects Facebook URLs from multiple sources
- **Easy Integration**: Seamless integration with MYETV Player
- **Responsive**: Works on desktop and mobile devices
- **Live Video Support**: Supports Facebook live streams

---

## Installation

### Method 1: Direct Script Include

```html
<!-- Load MYETV Player Core -->
<script src="dist/myetv-player.js"></script>

<!-- Load Facebook Plugin -->
<script src="plugins/myetv-player-facebook-plugin.js"></script>
```

### Method 2: Module Import

```javascript
import MYETVPlayer from './myetv-player.js';
import './plugins/myetv-player-facebook-plugin.js';
```

---

## Quick Start

### Basic Usage

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>MYETV Player - Facebook Plugin</title>
    <link rel="stylesheet" href="dist/myetv-player.css">
</head>
<body>
    <!-- Video Element -->
    <video id="myVideo" class="video-player"></video>

    <script src="dist/myetv-player.js"></script>
    <script src="plugins/myetv-player-facebook-plugin.js"></script>

    <script>
        // Initialize player with Facebook plugin
        const player = new MYETVPlayer('myVideo', {
            debug: true,
            plugins: {
                facebook: {
                    videoUrl: 'https://www.facebook.com/facebook/videos/10153231379946729/',
                    appId: 'YOUR_FACEBOOK_APP_ID', // Optional but recommended
                    autoplay: false
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
        facebook: {
            // ========== Authentication ==========
            // Facebook App ID (optional but recommended)
            // Required for: private videos, enhanced analytics, custom features
            appId: null,

            // ========== Video Source ==========
            // Facebook video URL (full URL)
            videoUrl: 'https://www.facebook.com/facebook/videos/10153231379946729/',

            // OR use video ID directly
            videoId: '10153231379946729',

            // ========== Embed Options ==========
            width: 500,                    // Player width in pixels
            autoplay: false,               // Auto-play on load
            allowFullscreen: true,         // Enable fullscreen button
            showText: true,                // Show video title/description
            showCaptions: true,            // Show captions if available

            // ========== Plugin Options ==========
            showNativeControlsButton: true, // Show the button on the controlbar to enable the Facebook native controls temporarily
            controlBarOpacity: 0.95,     // The controlbar opacity or semi-transparency or transparency - values: from 0 to 1
            titleOverlayOpacity: 0.95,    // The overlay title opacity or semi-transparency or transparency - values: from 0 to 1
            debug: false,                  // Enable debug logging
            replaceNativePlayer: true,     // Replace native video element
            autoLoadFromData: true         // Auto-detect from data attributes
        }
    }
});
```

---

## Privacy & Video Access

### Understanding Video Privacy on Facebook

Facebook videos have different privacy levels that affect embedding:

#### 1. **Public Videos**
- **Access**: Anyone can view
- **App ID Required**: No (but recommended)
- **Example**: Videos from Facebook Pages, public posts
- **Works**: Always works in embedded player

```javascript
plugins: {
    facebook: {
        videoUrl: 'https://www.facebook.com/facebook/videos/10153231379946729/'
        // No appId needed for public videos
    }
}
```

---

#### 2. **Unlisted Videos** 
- **Access**: Anyone with the link
- **App ID Required**: Recommended
- **Example**: Videos shared with "Anyone with link"
- **Works**: Works with proper configuration

```javascript
plugins: {
    facebook: {
        videoUrl: 'https://www.facebook.com/username/videos/123456789/',
        appId: 'YOUR_APP_ID' // Recommended for better reliability
    }
}
```

---

#### 3. **Private/Friends-Only Videos**
- **Access**: Restricted to specific users/friends
- **App ID Required**: Yes, with proper permissions
- **Example**: Videos visible only to friends
- **Works**: Only if user is logged in and authorized

```javascript
plugins: {
    facebook: {
        videoUrl: 'https://www.facebook.com/username/videos/123456789/',
        appId: 'YOUR_APP_ID', // Required
        // User must be logged in to Facebook and have permission
    }
}
```

---

#### 4. **Your Own Videos**
- **Access**: Videos you uploaded to your account/page
- **App ID Required**: Yes
- **Permissions Needed**: 
  - `user_videos` (for personal videos)
  - `pages_read_engagement` (for page videos)
- **Works**: With proper App ID and permissions

```javascript
plugins: {
    facebook: {
        videoUrl: 'https://www.facebook.com/yourpage/videos/123456789/',
        appId: 'YOUR_APP_ID' // Required with proper permissions
    }
}
```

---

### How to Get a Facebook App ID

To access private videos or your own content, you need a Facebook App ID:

1. **Go to**: [Facebook Developers](https://developers.facebook.com/)
2. **Click**: "My Apps" → "Create App"
3. **Choose**: "Business" or "Consumer" type
4. **Fill in**: App name and contact email
5. **Get**: Your App ID from the dashboard
6. **Add Domain**: Add your website domain in App Settings → Basic → App Domains
7. **Set Permissions**: Configure video access permissions if needed

**App Settings Example:**
```javascript
plugins: {
    facebook: {
        appId: '1234567890123456', // Your 16-digit App ID
        videoUrl: 'YOUR_VIDEO_URL'
    }
}
```

---

### Best Practices for Video Privacy

**Do:**
- Use public videos for maximum compatibility
- Add App ID even for public videos (better analytics)
- Test video accessibility before deploying
- Handle error events for restricted videos

**Don't:**
- Embed private videos without proper permissions
- Share your App ID publicly in client-side code (it's safe, but use App Secret server-side)
- Assume all videos are embeddable

---

## Usage Methods

### Method 1: Using Video URL

```html
<video id="myVideo" class="video-player"></video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            facebook: {
                videoUrl: 'https://www.facebook.com/facebook/videos/10153231379946729/',
                appId: 'YOUR_APP_ID'
            }
        }
    });
</script>
```

---

### Method 2: Using Video ID

```html
<video id="myVideo" class="video-player"></video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            facebook: {
                videoId: '10153231379946729',
                appId: 'YOUR_APP_ID'
            }
        }
    });
</script>
```

---

### Method 3: Using Data Attributes

```html
<video id="myVideo" class="video-player"
       data-video-url="https://www.facebook.com/facebook/videos/10153231379946729/"
       data-video-type="facebook">
</video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            facebook: {
                appId: 'YOUR_APP_ID',
                autoLoadFromData: true
            }
        }
    });
</script>
```

---

### Method 4: Load Video Dynamically

```html
<video id="myVideo" class="video-player"></video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            facebook: {
                appId: 'YOUR_APP_ID'
            }
        }
    });

    const fbPlugin = player.getPlugin('facebook');

    // Load video after initialization
    fbPlugin.loadVideo('https://www.facebook.com/facebook/videos/10153231379946729/');
</script>
```

**Supported URL Formats:**
- `https://www.facebook.com/username/videos/VIDEO_ID/`
- `https://www.facebook.com/video.php?v=VIDEO_ID`
- `https://fb.watch/VIDEO_ID/`

---

## API Methods

The Facebook plugin provides the following methods:

```javascript
const fbPlugin = player.getPlugin('facebook');
```

### Playback Control

#### `play()`
Play the video.

```javascript
fbPlugin.play().then(() => {
    console.log('Video playing');
});
```

**Returns:** Promise

---

#### `pause()`
Pause the video.

```javascript
fbPlugin.pause().then(() => {
    console.log('Video paused');
});
```

**Returns:** Promise

---

#### `seek(seconds)`
Seek to specific time position.

```javascript
fbPlugin.seek(60).then(() => {
    console.log('Seeked to 60 seconds');
});
```

**Parameters:**
- `seconds` (Number): Time position in seconds

**Returns:** Promise

---

#### `getCurrentTime()`
Get current playback position.

```javascript
fbPlugin.getCurrentTime().then(time => {
    console.log('Current time:', time, 'seconds');
});
```

**Returns:** Promise<Number>

---

#### `getDuration()`
Get video duration.

```javascript
fbPlugin.getDuration().then(duration => {
    console.log('Duration:', duration, 'seconds');
});
```

**Returns:** Promise<Number>

---

### Volume Control

#### `mute()`
Mute the video.

```javascript
fbPlugin.mute().then(() => {
    console.log('Video muted');
});
```

**Returns:** Promise

---

#### `unmute()`
Unmute the video.

```javascript
fbPlugin.unmute().then(() => {
    console.log('Video unmuted');
});
```

**Returns:** Promise

---

#### `isMuted()`
Check if video is muted.

```javascript
fbPlugin.isMuted().then(muted => {
    console.log('Is muted:', muted);
});
```

**Returns:** Promise<Boolean>

---

#### `setVolume(volume)`
Set volume level.

```javascript
fbPlugin.setVolume(0.5).then(() => {
    console.log('Volume set to 50%');
});
```

**Parameters:**
- `volume` (Number): Volume level (0-1)

**Returns:** Promise

---

#### `getVolume()`
Get current volume level.

```javascript
fbPlugin.getVolume().then(volume => {
    console.log('Current volume:', volume);
});
```

**Returns:** Promise<Number>

---

### Video Management

#### `loadVideo(videoUrl)`
Load a new video.

```javascript
fbPlugin.loadVideo('https://www.facebook.com/facebook/videos/10153231379946729/')
    .then(() => {
        console.log('New video loaded');
    });
```

**Parameters:**
- `videoUrl` (String): Facebook video URL

**Returns:** Promise

---

## Events

The Facebook plugin triggers the following events:

### Playback Events

#### `play`
Video started playing.

```javascript
player.addEventListener('play', () => {
    console.log('Video started');
});
```

---

#### `playing`
Video is actively playing.

```javascript
player.addEventListener('playing', () => {
    console.log('Video playing');
});
```

---

#### `pause`
Video paused.

```javascript
player.addEventListener('pause', () => {
    console.log('Video paused');
});
```

---

#### `ended`
Video playback ended.

```javascript
player.addEventListener('ended', () => {
    console.log('Video ended');
});
```

---

### Buffering Events

#### `waiting`
Video buffering started.

```javascript
player.addEventListener('waiting', () => {
    console.log('Buffering...');
});
```

---

#### `canplay`
Video buffering completed, ready to play.

```javascript
player.addEventListener('canplay', () => {
    console.log('Ready to play');
});
```

---

### Plugin-Specific Events

#### `facebookplugin:playerready`
Facebook player initialized and ready.

```javascript
player.addEventListener('facebookplugin:playerready', () => {
    console.log('Facebook player ready');
});
```

---

#### `facebookplugin:videoloaded`
Video loaded successfully.

```javascript
player.addEventListener('facebookplugin:videoloaded', (data) => {
    console.log('Video loaded:', data.videoUrl);
});
```

---

#### `facebookplugin:error`
Player error occurred.

```javascript
player.addEventListener('facebookplugin:error', (error) => {
    console.error('Facebook player error:', error);
});
```

---

#### `error`
General error event.

```javascript
player.addEventListener('error', (error) => {
    console.error('Error:', error);
});
```

---

## Examples

### Example 1: Video Playlist

```html
<video id="myVideo" class="video-player"></video>

<div id="playlist">
    <button onclick="loadFBVideo('https://www.facebook.com/facebook/videos/10153231379946729/')">
        Video 1
    </button>
    <button onclick="loadFBVideo('https://www.facebook.com/facebook/videos/10153095973521729/')">
        Video 2
    </button>
    <button onclick="loadFBVideo('https://www.facebook.com/facebook/videos/10152454700553729/')">
        Video 3
    </button>
</div>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            facebook: {
                appId: 'YOUR_APP_ID'
            }
        }
    });

    const fbPlugin = player.getPlugin('facebook');

    function loadFBVideo(url) {
        fbPlugin.loadVideo(url).then(() => {
            console.log('Loaded:', url);
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
    <button id="muteBtn">Mute</button>
    <input type="range" id="volumeSlider" min="0" max="100" value="100">
</div>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            facebook: {
                videoUrl: 'https://www.facebook.com/facebook/videos/10153231379946729/',
                appId: 'YOUR_APP_ID'
            }
        }
    });

    const fbPlugin = player.getPlugin('facebook');

    // Play button
    document.getElementById('playBtn').onclick = () => {
        fbPlugin.play();
    };

    // Pause button
    document.getElementById('pauseBtn').onclick = () => {
        fbPlugin.pause();
    };

    // Mute button
    document.getElementById('muteBtn').onclick = () => {
        fbPlugin.isMuted().then(muted => {
            if (muted) {
                fbPlugin.unmute();
            } else {
                fbPlugin.mute();
            }
        });
    };

    // Volume slider
    document.getElementById('volumeSlider').oninput = (e) => {
        const volume = e.target.value / 100;
        fbPlugin.setVolume(volume);
    };
</script>
```

---

### Example 3: Progress Tracker

```html
<video id="myVideo" class="video-player"></video>

<div id="progress-info">
    <p>Current Time: <span id="currentTime">0:00</span></p>
    <p>Duration: <span id="duration">0:00</span></p>
    <div id="progress-bar" style="width: 100%; height: 5px; background: #ddd;">
        <div id="progress" style="width: 0%; height: 100%; background: #4267B2;"></div>
    </div>
</div>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            facebook: {
                videoUrl: 'https://www.facebook.com/facebook/videos/10153231379946729/',
                appId: 'YOUR_APP_ID'
            }
        }
    });

    const fbPlugin = player.getPlugin('facebook');

    // Update progress
    setInterval(() => {
        fbPlugin.getCurrentTime().then(current => {
            fbPlugin.getDuration().then(duration => {
                const percent = (current / duration) * 100;

                document.getElementById('currentTime').textContent = formatTime(current);
                document.getElementById('duration').textContent = formatTime(duration);
                document.getElementById('progress').style.width = percent + '%';
            });
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

### Example 4: Error Handling

```javascript
const player = new MYETVPlayer('myVideo', {
    plugins: {
        facebook: {
            videoUrl: 'https://www.facebook.com/facebook/videos/10153231379946729/',
            appId: 'YOUR_APP_ID'
        }
    }
});

// Handle errors gracefully
player.addEventListener('facebookplugin:error', (error) => {
    console.error('Facebook error:', error);

    // Show user-friendly message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = 'padding: 20px; background: #ff4444; color: white;';
    errorDiv.textContent = 'Unable to load video. It may be private or unavailable.';

    document.getElementById('player-container').appendChild(errorDiv);
});

// Handle video loaded
player.addEventListener('facebookplugin:videoloaded', (data) => {
    console.log('Video loaded successfully:', data.videoUrl);
});
```

---

### Example 5: Autoplay with Mute (Mobile-Friendly)

```javascript
const player = new MYETVPlayer('myVideo', {
    plugins: {
        facebook: {
            videoUrl: 'https://www.facebook.com/facebook/videos/10153231379946729/',
            appId: 'YOUR_APP_ID',
            autoplay: true // Autoplay enabled
        }
    }
});

const fbPlugin = player.getPlugin('facebook');

// Mute for autoplay (required on mobile)
player.addEventListener('facebookplugin:playerready', () => {
    fbPlugin.mute().then(() => {
        console.log('Muted for autoplay');
    });
});

// Add unmute button
const unmuteBtn = document.createElement('button');
unmuteBtn.textContent = 'Unmute';
unmuteBtn.onclick = () => {
    fbPlugin.unmute();
};
document.body.appendChild(unmuteBtn);
```

---

## FAQ

### Q: Do I need a Facebook App ID?

**A:** Not required for public videos, but **highly recommended** for:
- Better reliability and performance
- Access to analytics
- Private or unlisted videos
- Your own videos
- Enhanced error handling

---

### Q: Can I embed private Facebook videos?

**A:** Yes, but with limitations:
- You need a Facebook App ID
- The viewer must be logged into Facebook
- The viewer must have permission to view the video
- Works best for videos from your own page/profile

---

### Q: Why isn't my video loading?

**Possible reasons:**
1. Video is private and viewer doesn't have access
2. Video has been deleted
3. Domain restrictions on the video
4. Missing or invalid App ID for restricted content
5. CORS or security policy blocking the embed

---

### Q: Can I use Facebook live streams?

**A:** Yes! Facebook live videos work the same way as regular videos. Just use the live video URL.

---

### Q: How do I get video analytics?

**A:** Use a Facebook App ID and track events:

```javascript
player.addEventListener('play', () => {
    // Send to your analytics
    trackEvent('facebook_video_play');
});

player.addEventListener('ended', () => {
    trackEvent('facebook_video_complete');
});
```

---

### Q: Does this work on mobile?

**A:** Yes! The Facebook embedded player is fully responsive and works on iOS and Android.

---

### Q: Can I customize the player appearance?

**A:** Limited customization is available through Facebook's embed options:
- Show/hide text
- Show/hide captions
- Set width
- Enable/disable fullscreen

For more control, consider using custom overlay controls.

---

## Troubleshooting

### Issue: "Video cannot be displayed"

**Possible causes:**
- Video is private
- Domain not whitelisted in Facebook App settings
- Video has been deleted

**Solution:**
1. Verify video is public or you have access
2. Add your domain to Facebook App settings
3. Check Facebook App ID is correct
4. Test video URL directly on Facebook

---

### Issue: Facebook SDK not loading

**Solution:**
- Check browser console for errors
- Verify internet connection
- Ensure no ad blockers blocking Facebook scripts
- Check Content Security Policy allows Facebook domains

```html
<!-- Add to <head> if using CSP -->
<meta http-equiv="Content-Security-Policy" 
      content="script-src 'self' https://connect.facebook.net;">
```

---

### Issue: Video plays but controls don't work

**Solution:**
1. Ensure Facebook SDK loaded successfully
2. Check browser console for API errors
3. Verify App ID is valid
4. Wait for `facebookplugin:playerready` event

```javascript
player.addEventListener('facebookplugin:playerready', () => {
    // Now safe to use API methods
    fbPlugin.play();
});
```

---

### Issue: Autoplay not working

**Solution:**
Browsers require muted videos for autoplay:

```javascript
plugins: {
    facebook: {
        videoUrl: 'YOUR_VIDEO_URL',
        autoplay: true
    }
}

// Mute immediately after player ready
player.addEventListener('facebookplugin:playerready', () => {
    fbPlugin.mute();
});
```

---

### Debug Mode

Enable detailed logging:

```javascript
const player = new MYETVPlayer('myVideo', {
    debug: true,
    plugins: {
        facebook: {
            videoUrl: 'YOUR_VIDEO_URL',
            appId: 'YOUR_APP_ID',
            debug: true
        }
    }
});
```

Debug messages appear with `Facebook Plugin:` prefix.

---

## Resources

- **MYETV Player**: [https://www.myetv.tv](https://www.myetv.tv)
- **Facebook Embedded Video Player**: [Facebook Developers - Embedded Videos](https://developers.facebook.com/docs/plugins/embedded-video-player/)
- **Facebook for Developers**: [https://developers.facebook.com](https://developers.facebook.com)
- **Facebook SDK Documentation**: [JavaScript SDK](https://developers.facebook.com/docs/javascript)
- **GitHub**: [MYETV Video Player Open Source](https://github.com/OskarCosimo/myetv-video-player-opensource)
- **Author**: [https://oskarcosimo.com](https://oskarcosimo.com)

---

## License

MIT License - See main project for details.

---

## Contributing

Contributions are welcome! Please submit pull requests or open issues on GitHub.

---

**Enjoy Facebook video integration!**
