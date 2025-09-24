# myetv-video-player-opensource

# MYETV Video Player

A modern and complete JavaScript video player with custom controls, multiple quality support, subtitles, Picture-in-Picture and much more.

## Features

- **Custom controls** with intelligent auto-hide
- **Multiple video qualities** with automatic selection based on connection
- **Subtitles** with multiple track support
- **Picture-in-Picture** (where supported)
- **Complete keyboard controls**
- **Internationalization** (i18n) multilingual
- **Responsive design** for mobile and desktop devices
- **Customizable title overlay**
- **Debug mode** for developers
- **Extensive APIs** for programmatic control

## Installation

### Include Required Files

```<!-- Player CSS --> <link rel="stylesheet" href="myetv-player.css"> <!-- Internationalization file (must be loaded FIRST) --> <script src="myetv-player-i18n.js"></script> <!-- Player JavaScript (must be loaded AFTER i18n) --> <script src="myetv-player.js"></script>```

## Basic Usage

### HTML

```
<video id="my-video" width="800" height="450"> <source src="video-480p.mp4" type="video/mp4" data-quality="480p"> <source src="video-720p.mp4" type="video/mp4" data-quality="720p"> <source src="video-1080p.mp4" type="video/mp4" data-quality="1080p">
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
| `showTitleOverlay` | boolean | `false` | Show video title overlay |
| `autoplay` | boolean | `false` | Start video automatically |
| `autoHide` | boolean | `true` | Auto-hide controls |
| `autoHideDelay` | number | `3000` | Auto-hide delay in milliseconds |
| `keyboardControls` | boolean | `true` | Enable keyboard controls |
| `persistentTitle` | boolean | `false` | Keep title always visible |
| `defaultQuality` | string | `'auto'` | Default video quality |
| `videoTitle` | string | `''` | Title to show in overlay |
| `language` | string | `null` | Interface language code |
| `debug` | boolean | `false` | Enable debug logs |

## API Methods
## Basic Controls
// Playback
player.play();                     // Start playback
player.pause();                    // Pause playback
player.togglePlayPause();          // Toggle play/pause

// Volume
player.setVolume(0.8);            // Set volume (0-1)
player.getVolume();               // Get current volume
player.toggleMute();              // Toggle mute
player.setMuted(true);            // Set mute

## Time Controls

// Position
player.setCurrentTime(120);       // Go to second 120
player.getCurrentTime();          // Current position
player.getDuration();             // Total duration
player.skipTime(10);              // Skip 10 seconds forward
player.skipTime(-10);             // Skip 10 seconds backward

## Quality Controls

// Video quality
player.setDefaultQuality('720p'); // Set default quality
player.setQuality('1080p');       // Change quality
player.getSelectedQuality();      // Selected quality
player.getCurrentPlayingQuality(); // Actual playing quality
player.enableAutoQuality();       // Enable automatic selection

## Subtitle Controls

// Subtitles
player.toggleSubtitles();         // Toggle subtitles
player.enableSubtitleTrack(0);    // Enable subtitle track
player.disableSubtitles();        // Disable subtitles
player.getAvailableSubtitles();   // List available subtitles

## Screen Controls

// Fullscreen and Picture-in-Picture
player.toggleFullscreen();        // Toggle fullscreen
player.enterFullscreen();         // Enter fullscreen
player.exitFullscreen();          // Exit fullscreen
player.togglePictureInPicture();  // Toggle Picture-in-Picture

## Keyboard Controls

Key    Action
Space	Play/Pause
M	Mute/Unmute
F	Fullscreen
P	Picture-in-Picture
S	Toggle subtitles
T	Toggle title overlay
D	Enable/disable debug
←	Backward 10 seconds
→	Forward 10 seconds
↑	Increase volume
↓	Decrease volume

## CSS Customization

.video-wrapper {
    --player-primary-color: #ff6b35;
    --player-secondary-color: #004643;
    --player-text-color: #ffffff;
    --player-bg-color: rgba(0, 0, 0, 0.8);
    --player-accent-color: #f25f4c;
    --player-border-radius: 8px;
    --player-transition: all 0.3s ease;
    --player-volume-fill: 100%;
}

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
