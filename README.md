# MYETV Video Player Open Source

A modern and complete HTML5 + JavaScript + css video player with custom controls, multiple quality support, subtitles, Picture-in-Picture and much more.

## Features

- **Custom controls** with intelligent auto-hide
- Built to work with both .mp4 or .webm or .mp3 (**download streaming**) but also with hls or dash (**adaptive streaming**)
- **Multiple video qualities** with automatic selection based on connection
- **Subtitles** with multiple track support
- **Picture-in-Picture** mode (where supported)
- **Complete keyboard controls**
- **Internationalization** (i18n) multilingual
- **Responsive design** for mobile and desktop devices
- **Customizable** title overlay
- **Customizable** brand logo in the controlbar
- **Debug mode** for developers
- **Extensive APIs** for programmatic control

## Installation

### Include Required Files

```
<!-- Player CSS -->
<link rel="stylesheet" href="myetv-player.css">
<!-- Internationalization file (must be loaded FIRST) -->
<script src="myetv-player-i18n.js"></script>
<!-- Player JavaScript (must be loaded AFTER i18n) -->
<script src="myetv-player.js"></script>
```

## Basic Usage

### HTML

```
<video id="my-video" width="800" height="450">
<source src="video-480p.mp4" type="video/mp4" data-quality="480p">
<source src="video-720p.mp4" type="video/mp4" data-quality="720p">
<source src="video-1080p.mp4" type="video/mp4" data-quality="1080p">
<!-- Optional subtitles -->
<track kind="subtitles" src="subtitles-en.vtt" srclang="en" label="English">
<track kind="subtitles" src="subtitles-it.vtt" srclang="it" label="Italiano">
</video>

// Basic initialization
const player = new MYETVvideoplayer('my-video');

// Initialization with options
const player = new MYETVvideoplayer('my-video', {
    autoplay: true,
    defaultQuality: '720p',
    showTitleOverlay: true,
    videoTitle: 'My Video',
    language: 'en',
    debug: false
});
```

## Initialization Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showQualitySelector` | boolean | `true` | Show video quality selector |
| `showSpeedControl` | boolean | `true` | Show playback speed controls |
| `showFullscreen` | boolean | `true` | Show fullscreen button |
| `showPictureInPicture` | boolean | `true` | Show Picture-in-Picture button |
| `showSubtitles` | boolean | `true` | Show subtitles controls |
| `showSeekTooltip` | boolean | `true` | Show tooltip during seek |
| `autoplay` | boolean | `false` | Start video automatically |
| `autoHide` | boolean | `true` | Auto-hide controls |
| `autoHideDelay` | number | `3000` | Auto-hide delay in milliseconds |
| `keyboardControls` | boolean | `true` | Enable keyboard controls |
| `defaultQuality` | string | `'auto'` | Default video quality |
| `showTitleOverlay` | boolean | `false` | Show video title overlay |
| `videoTitle` | string | `''` | Title to show in overlay |
| `persistentTitle` | boolean | `false` | Keep title always visible |
| `language` | string | `en` | Interface language code |
| `brandLogoEnabled` | boolean | `false` | Show/hide the brand logo in the controlbar |
| `brandLogoUrl` | string | `''` | Brand logo url (png, jpg, gif) - image height 44px - image width 120px |
| `brandLogoLinkUrl` | string | `''` | Optional URL to open in a new page when clicking the logo
| `playlistEnabled` | boolean | `false` | Optional if the playlist of video is enabled (html structured)
| `playlistAutoPlay` | boolean | `false` | Optional if the playlist should autoplay
| `playlistLoop` | boolean | `false` | Optional if the playlist should loop
| `adaptiveStreaming` | boolean | `false` | Enable HLS/DASH adaptive streaming
| `adaptiveQualityControl` | boolean | `false` | Enable the menu quality with adaptive streaming
| `debug` | boolean | `false` | Enable debug logs |


## API Methods
### Basic Controls
```
// Playback
player.play();                     // Start playback
player.pause();                    // Pause playback
player.togglePlayPause();          // Toggle play/pause

// Volume
player.setVolume(0.8);            // Set volume (0-1)
player.getVolume();               // Get current volume
player.toggleMute();              // Toggle mute
player.setMuted(true);            // Set mute
```
### Time Controls
```
// Position
player.setCurrentTime(120);       // Go to second 120
player.getCurrentTime();          // Current position
player.getDuration();             // Total duration
player.skipTime(10);              // Skip 10 seconds forward
player.skipTime(-10);             // Skip 10 seconds backward
```
### Quality Controls
```
// Video quality
player.setDefaultQuality('720p'); // Set default quality
player.setQuality('1080p');       // Change quality
player.getSelectedQuality();      // Selected quality
player.getCurrentPlayingQuality(); // Actual playing quality
player.enableAutoQuality();       // Enable automatic selection
```
### Subtitle Controls
```
// Subtitles
player.toggleSubtitles();         // Toggle subtitles
player.enableSubtitleTrack(0);    // Enable subtitle track
player.disableSubtitles();        // Disable subtitles
player.getAvailableSubtitles();   // List available subtitles
```
### Screen Controls
```
// Fullscreen and Picture-in-Picture
player.toggleFullscreen();        // Toggle fullscreen
player.enterFullscreen();         // Enter fullscreen
player.exitFullscreen();          // Exit fullscreen
player.togglePictureInPicture();  // Toggle Picture-in-Picture
```
### Logo Controls
```
// Fullscreen and Picture-in-Picture
player.setBrandLogo(enabled, url, linkUrl)    //change logo dynamically
player.getBrandLogoSettings()    //get current logo settings
```
### Playlist Controls
```
player.nextVideo();                    // Next Video
player.prevVideo();                    // Previous Video  
player.goToPlaylistIndex(2);          // Go to the specific video
player.getPlaylistInfo();              // Info Playlist
player.setPlaylistOptions({loop:true}); // Playlist Options
```
## API Events
The MYETV Video Player includes a comprehensive custom event system that allows you to monitor all player state changes in real-time.
### on played
Description: Triggered when the video starts playing
When: User presses play or video starts automatically
```
player.addEventListener('played', (event) => {
    console.log('Video started!', {
        currentTime: event.currentTime,
        duration: event.duration
    });
});
```
### on paused
Description: Triggered when the video is pause
When: User presses pause or video stops
```
player.addEventListener('paused', (event) => {
    console.log('Video paused at:', event.currentTime + 's');
});
```
### on ended
Description: Triggered when the video is ended
When: Video is ended
```
player.addEventListener('ended', (e) => {
    console.log('Video terminato!', e.currentTime, e.duration, e.playlistInfo);
});
```
### on subtitle change
Description: Triggered when subtitles are enabled/disabled or track changes
When: User toggles subtitles or switches subtitle tracks
```
player.addEventListener('subtitlechange', (event) => {
    if (event.enabled) {
        console.log('Subtitles enabled:', event.trackLabel);
    } else {
        console.log('Subtitles disabled');
    }
});
```
### on pip change
Description: Triggered when Picture-in-Picture mode changes
When: Video enters or exits PiP mode
```
player.addEventListener('pipchange', (event) => {
    console.log('Picture-in-Picture:', event.active ? 'Activated' : 'Deactivated');
});
```
### on fullscreen change
Description: Triggered when fullscreen mode changes
When: Player enters or exits fullscreen mode
```
player.addEventListener('fullscreenchange', (event) => {
    console.log('Fullscreen:', event.active ? 'Activated' : 'Deactivated');
});
```
### on speed change
Description: Triggered when playback speed changes
When: User modifies playback speed (0.5x, 1x, 1.5x, 2x, etc.)
```
player.addEventListener('speedchange', (event) => {
    console.log('Speed changed to:', event.speed + 'x');
});
```
### on time update
Description: Triggered during playback to update progress
When: Every 250ms during playback (throttled for performance)
```
player.addEventListener('timeupdate', (event) => {
    console.log('Progress:', event.progress.toFixed(1) + '%');
    // Update custom progress bar
    updateProgressBar(event.progress);
});
```
### on volumechange
Description: Triggered when volume or mute state changes
When: User modifies volume or toggles mute
```
player.addEventListener('volumechange', (event) => {
    if (event.muted) {
        console.log('Audio muted');
    } else {
        console.log('Volume:', Math.round(event.volume * 100) + '%');
    }
});
```
### Playlist API
```
player.addEventListener('playlistchange', (e) => {
    console.log(`From "${e.fromTitle}" to "${e.toTitle}"`);
});
```
### Main APIs
getEventData()
Returns all requested state data in a single object:
```
const state = player.getEventData();
console.log(state);
/* Output:
{
    played: true,
    paused: false,
    subtitleEnabled: false,
    pipMode: false,
    fullscreenMode: false,
    speed: 1,
    controlBarLength: 45.23,
    volumeIsMuted: false,
    duration: 3600,
    volume: 0.8,
    quality: "1080p",
    buffered: 120.5
}
*/
```
### Event Listener Management
```
// Add listener
player.addEventListener('played', callback);

// Remove listener  
player.removeEventListener('played', callback);

// Complete example
const onVideoPlay = (event) => {
    console.log('Video started!', event.currentTime);
};

player.addEventListener('played', onVideoPlay);
// ... later
player.removeEventListener('played', onVideoPlay);
```
### Complete Example
```
// Initialize the player
const player = new MYETVvideoplayer('myVideo', {
    debug: true,
    autoplay: false
});

// Monitor all main events
player.addEventListener('played', (e) => {
    updateUI('playing', e.currentTime);
});

player.addEventListener('paused', (e) => {
    updateUI('paused', e.currentTime);
});

player.addEventListener('timeupdate', (e) => {
    document.getElementById('progress').textContent = 
        `${e.currentTime.toFixed(0)}s / ${e.duration.toFixed(0)}s`;
});

player.addEventListener('volumechange', (e) => {
    document.getElementById('volume-indicator').textContent = 
        e.muted ? 'muted' : `volume: ${Math.round(e.volume * 100)}%`;
});

// Helper function to update UI
function updateUI(state, time) {
    document.getElementById('player-status').textContent = 
        `Status: ${state} at ${time.toFixed(1)}s`;
}
```
### Technical Notes
Performance: The timeupdate event is throttled to 250ms to avoid overload

Compatibility: All events maintain compatibility with existing code

Debug: Enable debug: true in options to see event logs

Error Handling: Errors in callbacks don't interrupt the player

### Event Data Reference

| Property | Type | Description |
|:---------|:----:|:------------|
| `played` | `boolean` | Video is currently playing |
| `paused` | `boolean` | Video is currently paused |
| `subtitleEnabled` | `boolean` | Subtitles are enabled |
| `pipMode` | `boolean` | Picture-in-Picture is active |
| `fullscreenMode` | `boolean` | Fullscreen mode is active |
| `speed` | `number` | Current playback speed |
| `controlBarLength` | `number` | Current video time in seconds |
| `volumeIsMuted` | `boolean` | Audio is muted |
| `duration` | `number` | Total video duration |
| `volume` | `number` | Volume level (0-1) |
| `quality` | `string` | Current video quality |
| `buffered` | `number` | Buffered time in seconds |

## Keyboard Controls

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `M` | Mute/Unmute |
| `F` | Fullscreen |
| `P` | Picture-in-Picture |
| `S` | Toggle subtitles |
| `T` | Toggle title overlay |
| `N` | Next video in playlist |
| `P` | Previous video in playlist |
| `D` | Enable/disable debug |
| `←` | Backward 10 seconds |
| `→` | Forward 10 seconds |
| `↑` | Increase volume |
| `↓` | Decrease volume |

## CSS Customization

The MYETV Video Player is fully customizable using CSS variables and themes. The player includes a comprehensive set of CSS custom properties that allow you to modify colors, sizes, spacing, and animations without touching the core stylesheet.

### CSS Variables

The player uses CSS custom properties (variables) for easy theming:
```
.video-wrapper {
/* Primary Colors */
--player-primary-color: goldenrod;
--player-primary-hover: #daa520;
--player-primary-dark: #b8860b;
/* Control Colors */
--player-button-color: white;
--player-button-hover: rgba(255, 255, 255, 0.1);
--player-button-active: rgba(255, 255, 255, 0.2);

/* Text Colors */
--player-text-color: white;
--player-text-secondary: rgba(255, 255, 255, 0.8);

/* Background Colors */
--player-bg-primary: #000;
--player-bg-controls: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.8) 100%);
--player-bg-title-overlay: linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
--player-bg-menu: rgba(20, 20, 20, 0.95);

/* Dimensions */
--player-border-radius: 12px;
--player-progress-height: 6px;
--player-volume-height: 4px;
--player-icon-size: 20px;

/* Transitions */
--player-transition-fast: 0.2s ease;
--player-transition-normal: 0.3s ease;
}
```
### Pre-built Themes

The player includes several pre-built themes that you can apply:

#### Blue Theme
```
.video-wrapper.player-theme-blue {
/* Automatically uses blue color scheme */
}
```
#### Green Theme
```
.video-wrapper.player-theme-green {
/* Automatically uses green color scheme */
}
```
#### Red Theme
```
.video-wrapper.player-theme-red {
/* Automatically uses red color scheme */
}
```
#### Dark Theme
```
.video-wrapper.player-theme-dark {
/* Enhanced dark mode with improved contrast */
}
```
### Control Size Variants

#### Large Controls
```
.video-wrapper.player-large-controls {
/* Bigger buttons and controls for better accessibility */
}
```
#### Compact Controls
```
.video-wrapper.player-compact-controls {
/* Smaller, space-efficient controls */
}
```
### Custom Theme Examples

#### Custom Purple Theme
```
.video-wrapper.my-purple-theme {
--player-primary-color: #9c27b0;
--player-primary-hover: #7b1fa2;
--player-primary-dark: #6a1b9a;
--player-bg-primary: #1a0d1a;
--player-bg-controls: linear-gradient(180deg, transparent 0%, rgba(26, 13, 26, 0.9) 100%);
}
```
#### High Contrast Theme
```
.video-wrapper.high-contrast-theme {
--player-primary-color: #ffff00;
--player-primary-hover: #ffeb3b;
--player-text-color: #ffffff;
--player-bg-primary: #000000;
--player-bg-controls: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.95) 100%);
--player-border-radius: 0; /* Sharp corners for accessibility */
}
```
#### Minimal Theme
```
.video-wrapper.minimal-theme {
--player-bg-controls: rgba(0, 0, 0, 0.3);
--player-bg-title-overlay: rgba(0, 0, 0, 0.3);
--player-border-radius: 0;
--player-progress-height: 3px;
--player-volume-height: 2px;
--player-button-padding: 4px;
}
```
### Responsive Customization

The player automatically adapts to different screen sizes. You can customize the responsive behavior:
```
/* Custom mobile adjustments /
@media (max-width: 768px) {
.video-wrapper {
--player-icon-size: 18px;
--player-progress-height: 8px; / Thicker for touch /
--player-button-padding: 12px; / Larger touch targets */
}
}

@media (max-width: 480px) {
.video-wrapper {
--player-controls-padding: 12px 8px 8px;
--player-border-radius: 0; /* Full width on small screens */
}
}
```
### Custom Subtitle Styling

Customize the appearance of subtitles:
```
.video-player::cue {
background: rgba(0, 0, 0, 0.9);
color: #ffffff;
font-size: 18px;
font-family: 'Your Custom Font', sans-serif;
padding: 10px 15px;
border-radius: 8px;
text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

/* Highlighted subtitle text */
.video-player::cue(.highlight) {
background: var(--player-primary-color);
color: black;
}
```
### Animation Customization

Control the player's animations:
```
.video-wrapper {
/* Faster animations */
--player-transition-fast: 0.1s ease;
--player-transition-normal: 0.15s ease;
}

/* Disable animations (accessibility) */
.video-wrapper.no-animations {
--player-transition-fast: 0s;
--player-transition-normal: 0s;
}

.video-wrapper.no-animations * {
transition: none !important;
animation: none !important;
}
```
### Quality Selector Customization

The dual-quality indicator can be customized:
```
.quality-btn {
min-height: 40px; /* More space for two lines */
}

.selected-quality {
font-size: 16px; /* Larger selected quality text */
font-weight: 600;
}

.current-quality {
font-size: 11px; /* Current playing quality */
opacity: 0.7;
}
```
### Usage Examples

#### Apply Theme via JavaScript
```
// Apply theme when initializing
const player = new MYETVvideoplayer('video', {
// ... other options
});

// Add theme class
document.querySelector('.video-wrapper').classList.add('player-theme-blue');
```
#### Apply Theme via HTML
```<div class="video-wrapper player-theme-dark player-large-controls"> <video id="my-video"> <!-- video sources --> </video> </div> ```

#### Dynamic Theme Switching
```
function switchTheme(themeName) {
    const wrapper = document.querySelector('.video-wrapper');
    
    // Remove existing theme classes
    wrapper.className = wrapper.className.replace(/player-theme-\w+/g, '');
    
    // Add new theme
    if (themeName !== 'default') {
        wrapper.classList.add(`player-theme-${themeName}`);
    }
}

// Usage
switchTheme('blue');    // Switch to blue theme
switchTheme('dark');    // Switch to dark theme
switchTheme('default'); // Switch to default theme
```
## Browser Compatibility
The CSS uses modern features with fallbacks:

CSS Custom Properties: Supported in all modern browsers

CSS Grid/Flexbox: Full support in Chrome 60+, Firefox 55+, Safari 11+

Backdrop Filter: Enhanced blur effects where supported

CSS Variables: Graceful fallback to default values

Performance Tips
Use transform and opacity for animations (GPU accelerated)

CSS variables are cached by the browser for better performance

Minimal DOM manipulation thanks to CSS-based theming

Hardware-accelerated transitions for smooth playback

## Playlist feature
### Playlist Detection System
The playlist detection will work through HTML attributes on your video elements:
```
<!-- Example playlist setup -->
<video id="myVideo" class="video-player" 
       data-playlist-id="my-series" 
       data-playlist-index="0">
    <source src="video1-720p.mp4" type="video/mp4" data-quality="720p">
    <source src="video1-480p.mp4" type="video/mp4" data-quality="480p">
</video>

<!-- Next video in playlist -->
<video id="video2" class="video-player" 
       data-playlist-id="my-series" 
       data-playlist-index="1">
    <source src="video2-720p.mp4" type="video/mp4" data-quality="720p">
    <source src="video2-480p.mp4" type="video/mp4" data-quality="480p">
</video>
```


## Supported Browsers
Chrome 60+
Firefox 55+
Safari 11+
Edge 79+
Mobile browsers with HTML5 support

## License
This project is released under the MIT License.

## Contributing
Fork the repository

Create a feature branch (git checkout -b feature/feature-name)

Commit your changes (git commit -am 'Add feature')

Push to the branch (git push origin feature/feature-name)

Create a Pull Request

## Bug Reports
To report bugs or request features, open an issue in the repository.
