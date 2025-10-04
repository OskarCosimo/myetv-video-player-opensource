# MYETV Video Player - Plugin Development Guide
Complete guide for developing custom plugins for MYETV Video Player.

---

## Table of Contents

- [Introduction](#introduction)
- [Plugin Architecture](#plugin-architecture)
- [Creating a Plugin from Scratch](#creating-a-plugin-from-scratch)
- [API Reference](#api-reference)
- [HTML Integration](#html-integration)
- [Advanced Examples](#advanced-examples)
- [Best Practices](#best-practices)
- [Debugging](#debugging)
- [FAQ](#faq)

---

## Introduction

MYETV Video Player features a powerful and extensible plugin system that allows developers to add custom functionality without modifying the core player code.

### Why Use Plugins?

- **Modularity**: Keep your code organized and maintainable
- **Reusability**: Share plugins across multiple projects
- **Non-invasive**: No need to modify core player files
- **Event-driven**: React to player events and lifecycle hooks

---

## Plugin Architecture

### How Plugins Work

1. **Registration**: Plugins are registered globally using `window.registerMYETVPlugin()`
2. **Initialization**: The player initializes plugins when created or via `usePlugin()`
3. **Lifecycle**: Plugins can hook into player events and lifecycle stages
4. **Disposal**: Plugins are properly cleaned up when removed or player is disposed

### Plugin Structure

A plugin can be:
- A **Constructor Function** (class)
- A **Factory Function**
- An **Object with a `create()` method**

---

## Creating a Plugin from Scratch

### Step 1: Basic Template

Create a new JavaScript file (e.g., `myetv-plugin-example.js`):

```javascript
/**
 * MYETV Video Player - Example Plugin
 * Description: This plugin demonstrates basic plugin functionality
 * Author: Your Name
 * Version: 1.0.0
 */

(function(window) {
    'use strict';

    // Plugin Constructor
    class ExamplePlugin {
        constructor(player, options) {
            // Store player instance and options
            this.player = player;
            this.options = Object.assign({
                // Default options
                enabled: true,
                customMessage: 'Hello from Example Plugin!'
            }, options);

            // Plugin state
            this.isActive = false;

            // Log initialization
            if (this.player.options.debug) {
                console.log('🔌 Example Plugin initialized with options:', this.options);
            }
        }

        /**
         * Setup method - called automatically after plugin initialization
         * Use this to bind events, create UI elements, etc.
         */
        setup() {
            if (!this.options.enabled) {
                return;
            }

            // Bind player events
            this.bindEvents();

            // Create custom UI elements
            this.createUI();

            // Mark plugin as active
            this.isActive = true;

            if (this.player.options.debug) {
                console.log('🔌 Example Plugin setup completed');
            }
        }

        /**
         * Bind player events
         */
        bindEvents() {
            // Listen to play event
            this.player.addEventListener('played', (data) => {
                console.log('Video started playing', data);
            });

            // Listen to pause event
            this.player.addEventListener('paused', (data) => {
                console.log('Video paused', data);
            });

            // Listen to timeupdate event
            this.player.addEventListener('timeupdate', (data) => {
                // This event fires frequently - use with caution
                // console.log('Time update', data);
            });
        }

        /**
         * Create custom UI elements
         */
        createUI() {
            // Add a custom button to the player controls
            const button = this.player.addPluginControlButton({
                id: 'example-plugin-btn',
                icon: '🎯',
                tooltip: 'Example Plugin Action',
                position: 'right', // 'left' or 'right'
                onClick: (e, player) => {
                    alert(this.options.customMessage);
                    console.log('Example plugin button clicked!');
                },
                className: 'example-plugin-button'
            });

            if (button && this.player.options.debug) {
                console.log('🔌 Example Plugin: Custom button created');
            }
        }

        /**
         * Public method - can be called from outside
         */
        doSomething() {
            console.log('Example Plugin: doSomething() called');
            alert(this.options.customMessage);
        }

        /**
         * Get plugin status
         */
        getStatus() {
            return {
                isActive: this.isActive,
                options: this.options
            };
        }

        /**
         * Dispose method - cleanup when plugin is removed
         */
        dispose() {
            // Remove custom UI elements
            this.player.removePluginControlButton('example-plugin-btn');

            // Cleanup any timers, event listeners, etc.
            this.isActive = false;

            if (this.player.options.debug) {
                console.log('🔌 Example Plugin disposed');
            }
        }
    }

    // Register the plugin globally
    if (typeof window.registerMYETVPlugin === 'function') {
        window.registerMYETVPlugin('examplePlugin', ExamplePlugin);
    } else {
        console.error('🔌 MYETV Player plugin system not found. Make sure to load the player first.');
    }

})(window);
```

---

## API Reference

### Player Instance Methods

The `player` instance passed to your plugin provides access to:

#### Playback Control

```javascript
player.play()                      // Play video
player.pause()                     // Pause video
player.togglePlayPause()           // Toggle play/pause
player.getCurrentTime()            // Get current time in seconds
player.setCurrentTime(time)        // Set current time
player.getDuration()               // Get video duration
```

#### Volume Control

```javascript
player.getVolume()                 // Get volume (0-1)
player.setVolume(volume)           // Set volume (0-1)
player.isMuted()                   // Check if muted
player.setMuted(muted)             // Mute/unmute
```

#### Quality Control

```javascript
player.getQualities()              // Get available qualities
player.setQuality(quality)         // Set quality
player.getSelectedQuality()        // Get selected quality
player.getCurrentPlayingQuality()  // Get actual playing quality
```

#### Event System

```javascript
player.addEventListener(eventType, callback)
player.removeEventListener(eventType, callback)
player.triggerEvent(eventType, data)
```

#### UI Control

```javascript
player.addPluginControlButton(config)
player.removePluginControlButton(buttonId)
```

### Available Events

| Event | Description | Data |
|-------|-------------|------|
| `played` | Video started playing | `{currentTime, duration}` |
| `paused` | Video paused | `{currentTime, duration}` |
| `timeupdate` | Time position updated | `{currentTime, duration, progress}` |
| `volumechange` | Volume changed | `{volume, muted}` |
| `qualitychange` | Quality changed | `{quality, previousQuality}` |
| `speedchange` | Playback speed changed | `{speed, previousSpeed}` |
| `ended` | Video ended | `{currentTime, duration}` |
| `fullscreenchange` | Fullscreen toggled | `{isFullscreen}` |
| `pipchange` | Picture-in-Picture toggled | `{isPiP}` |
| `subtitlechange` | Subtitle changed | `{track, enabled}` |

---

## HTML Integration

### Method 1: Load Plugin Before Player Initialization

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MYETV Player with Plugin</title>

    <!-- Player CSS -->
    <link rel="stylesheet" href="dist/myetv-player.css">
</head>
<body>
    <!-- Video Element -->
    <video id="myVideo" class="video-player">
        <source src="video-720p.mp4" data-quality="720p" type="video/mp4">
        <source src="video-480p.mp4" data-quality="480p" type="video/mp4">
    </video>

    <!-- Load Player Core -->
    <script src="dist/myetv-player.js"></script>

    <!-- Load Your Plugin -->
    <script src="plugins/myetv-plugin-example.js"></script>

    <!-- Initialize Player with Plugin -->
    <script>
        const player = new MYETVPlayer('myVideo', {
            debug: true,
            // Load plugin during initialization
            plugins: {
                examplePlugin: {
                    enabled: true,
                    customMessage: 'Hello from my custom plugin!'
                }
            }
        });
    </script>
</body>
</html>
```

---

### Method 2: Load Plugin After Player Initialization

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>MYETV Player - Dynamic Plugin Loading</title>
    <link rel="stylesheet" href="dist/myetv-player.css">
</head>
<body>
    <video id="myVideo" class="video-player">
        <source src="video.mp4" type="video/mp4">
    </video>

    <script src="dist/myetv-player.js"></script>
    <script src="plugins/myetv-plugin-example.js"></script>

    <script>
        // Initialize player first
        const player = new MYETVPlayer('myVideo', {
            debug: true
        });

        // Load plugin dynamically later
        player.usePlugin('examplePlugin', {
            enabled: true,
            customMessage: 'Dynamically loaded plugin!'
        });

        // Access plugin instance
        const pluginInstance = player.getPlugin('examplePlugin');

        // Call plugin methods
        if (pluginInstance) {
            pluginInstance.doSomething();
        }
    </script>
</body>
</html>
```

---

### Method 3: Multiple Plugins

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>MYETV Player - Multiple Plugins</title>
    <link rel="stylesheet" href="dist/myetv-player.css">
</head>
<body>
    <video id="myVideo" class="video-player">
        <source src="video.mp4" type="video/mp4">
    </video>

    <script src="dist/myetv-player.js"></script>

    <!-- Load multiple plugins -->
    <script src="plugins/myetv-plugin-example.js"></script>
    <script src="plugins/myetv-plugin-analytics.js"></script>
    <script src="plugins/myetv-plugin-watermark.js"></script>

    <script>
        const player = new MYETVPlayer('myVideo', {
            debug: true,
            plugins: {
                // Load multiple plugins at once
                examplePlugin: {
                    enabled: true,
                    customMessage: 'Plugin 1 loaded!'
                },
                analyticsPlugin: {
                    trackingId: 'UA-XXXXX-Y',
                    sendEvents: true
                },
                watermarkPlugin: {
                    imageUrl: 'logo.png',
                    position: 'top-right'
                }
            }
        });

        // Check which plugins are loaded
        console.log('Active plugins:', player.getActivePlugins());
    </script>
</body>
</html>
```

---

### Method 4: Conditional Plugin Loading

```html
<script>
    const player = new MYETVPlayer('myVideo', {
        debug: true
    });

    // Load plugin based on condition
    if (window.innerWidth < 768) {
        // Load mobile-specific plugin
        player.usePlugin('mobilePlugin', {
            enableTouchGestures: true
        });
    } else {
        // Load desktop-specific plugin
        player.usePlugin('desktopPlugin', {
            enableKeyboardShortcuts: true
        });
    }

    // Load plugin asynchronously
    async function loadPluginAsync() {
        try {
            // Dynamically import plugin
            await import('./plugins/myetv-plugin-async.js');

            // Use plugin after loading
            player.usePlugin('asyncPlugin', {
                option1: 'value1'
            });

            console.log('Async plugin loaded successfully');
        } catch (error) {
            console.error('Failed to load async plugin:', error);
        }
    }

    loadPluginAsync();
</script>
```

---

## Advanced Examples

### Example 1: Analytics Plugin

```javascript
/**
 * Analytics Plugin - Track video viewing analytics
 */
(function(window) {
    'use strict';

    class AnalyticsPlugin {
        constructor(player, options) {
            this.player = player;
            this.options = Object.assign({
                trackingId: '',
                sendEvents: true,
                trackMilestones: true
            }, options);

            this.analytics = {
                sessionId: this.generateSessionId(),
                startTime: null,
                endTime: null,
                totalWatchTime: 0,
                pauseCount: 0,
                seekCount: 0,
                qualityChanges: 0,
                milestones: []
            };
        }

        setup() {
            this.analytics.startTime = new Date();
            this.bindAnalyticsEvents();
            console.log('Analytics Plugin: Tracking started', this.analytics.sessionId);
        }

        bindAnalyticsEvents() {
            // Track play
            this.player.addEventListener('played', () => {
                this.sendEvent('video_play');
            });

            // Track pause
            this.player.addEventListener('paused', () => {
                this.analytics.pauseCount++;
                this.sendEvent('video_pause', { pauseCount: this.analytics.pauseCount });
            });

            // Track completion
            this.player.addEventListener('ended', () => {
                this.analytics.endTime = new Date();
                this.sendEvent('video_complete', this.getAnalyticsSummary());
            });

            // Track quality changes
            this.player.addEventListener('qualitychange', (data) => {
                this.analytics.qualityChanges++;
                this.sendEvent('quality_change', data);
            });

            // Track watch time
            this.player.addEventListener('timeupdate', (data) => {
                this.analytics.totalWatchTime = data.currentTime;

                // Track milestones
                if (this.options.trackMilestones) {
                    this.checkMilestones(data.progress);
                }
            });
        }

        checkMilestones(progress) {
            const milestones = [25, 50, 75, 90];

            milestones.forEach(milestone => {
                if (progress >= milestone && !this.analytics.milestones.includes(milestone)) {
                    this.analytics.milestones.push(milestone);
                    this.sendEvent('milestone_reached', { milestone: milestone });
                }
            });
        }

        sendEvent(eventName, data = {}) {
            if (!this.options.sendEvents) return;

            const eventData = {
                sessionId: this.analytics.sessionId,
                trackingId: this.options.trackingId,
                event: eventName,
                timestamp: new Date().toISOString(),
                videoTitle: this.player.getVideoTitle(),
                ...data
            };

            // Send to your analytics backend
            console.log('Analytics Event:', eventData);

            // Example: Send to Google Analytics
            if (window.gtag) {
                window.gtag('event', eventName, eventData);
            }
        }

        getAnalyticsSummary() {
            return {
                ...this.analytics,
                duration: this.analytics.endTime - this.analytics.startTime
            };
        }

        generateSessionId() {
            return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        dispose() {
            console.log('Analytics Plugin: Final summary', this.getAnalyticsSummary());
        }
    }

    window.registerMYETVPlugin('analyticsPlugin', AnalyticsPlugin);

})(window);
```

---

### Example 2: Watermark Plugin

```javascript
/**
 * Custom Watermark Plugin
 */
(function(window) {
    'use strict';

    class WatermarkPlugin {
        constructor(player, options) {
            this.player = player;
            this.options = Object.assign({
                imageUrl: '',
                position: 'top-right', // top-left, top-right, bottom-left, bottom-right
                opacity: 0.7,
                size: '80px',
                link: '',
                fadeOnControls: true
            }, options);

            this.watermarkElement = null;
        }

        setup() {
            if (!this.options.imageUrl) {
                console.warn('🔌 Watermark Plugin: No image URL provided');
                return;
            }

            this.createWatermark();

            if (this.options.fadeOnControls) {
                this.bindControlsEvents();
            }
        }

        createWatermark() {
            const watermark = document.createElement('div');
            watermark.className = 'custom-watermark';
            watermark.style.cssText = `
                position: absolute;
                z-index: 10;
                opacity: ${this.options.opacity};
                transition: opacity 0.3s;
                pointer-events: ${this.options.link ? 'auto' : 'none'};
            `;

            // Position
            const positions = {
                'top-left': 'top: 10px; left: 10px;',
                'top-right': 'top: 10px; right: 10px;',
                'bottom-left': 'bottom: 60px; left: 10px;',
                'bottom-right': 'bottom: 60px; right: 10px;'
            };
            watermark.style.cssText += positions[this.options.position] || positions['top-right'];

            // Create image
            const img = document.createElement('img');
            img.src = this.options.imageUrl;
            img.style.cssText = `
                width: ${this.options.size};
                height: auto;
                display: block;
            `;

            // Add link if provided
            if (this.options.link) {
                const link = document.createElement('a');
                link.href = this.options.link;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.appendChild(img);
                watermark.appendChild(link);
            } else {
                watermark.appendChild(img);
            }

            // Add to player container
            this.player.container.appendChild(watermark);
            this.watermarkElement = watermark;

            console.log('🔌 Watermark Plugin: Watermark created');
        }

        bindControlsEvents() {
            // Fade watermark when controls are shown
            this.player.addEventListener('controlsshown', () => {
                if (this.watermarkElement) {
                    this.watermarkElement.style.opacity = '0.3';
                }
            });

            this.player.addEventListener('controlshidden', () => {
                if (this.watermarkElement) {
                    this.watermarkElement.style.opacity = this.options.opacity;
                }
            });
        }

        dispose() {
            if (this.watermarkElement) {
                this.watermarkElement.remove();
                this.watermarkElement = null;
            }
            console.log('🔌 Watermark Plugin disposed');
        }
    }

    window.registerMYETVPlugin('watermarkPlugin', WatermarkPlugin);

})(window);
```

---

### Example 3: Keyboard Shortcuts Plugin

```javascript
/**
 * Enhanced Keyboard Shortcuts Plugin
 */
(function(window) {
    'use strict';

    class KeyboardShortcutsPlugin {
        constructor(player, options) {
            this.player = player;
            this.options = Object.assign({
                enabled: true,
                shortcuts: {
                    'Space': 'togglePlayPause',
                    'ArrowLeft': 'seekBackward',
                    'ArrowRight': 'seekForward',
                    'ArrowUp': 'volumeUp',
                    'ArrowDown': 'volumeDown',
                    'KeyM': 'toggleMute',
                    'KeyF': 'toggleFullscreen',
                    'KeyP': 'togglePiP',
                    'KeyS': 'toggleSubtitles',
                    'Digit0': 'seekToStart',
                    'Digit1': 'seekToPercent10',
                    'Digit2': 'seekToPercent20',
                    'Digit3': 'seekToPercent30',
                    'Digit4': 'seekToPercent40',
                    'Digit5': 'seekToPercent50',
                    'Digit6': 'seekToPercent60',
                    'Digit7': 'seekToPercent70',
                    'Digit8': 'seekToPercent80',
                    'Digit9': 'seekToPercent90'
                },
                seekStep: 10, // seconds
                volumeStep: 0.1 // 0-1
            }, options);

            this.boundKeyHandler = null;
        }

        setup() {
            if (!this.options.enabled) return;

            this.boundKeyHandler = this.handleKeyPress.bind(this);
            document.addEventListener('keydown', this.boundKeyHandler);

            console.log('Keyboard Shortcuts Plugin: Enabled');
        }

        handleKeyPress(e) {
            // Ignore if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            const action = this.options.shortcuts[e.code];
            if (!action) return;

            e.preventDefault();

            // Execute action
            this.executeAction(action);
        }

        executeAction(action) {
            const actions = {
                togglePlayPause: () => this.player.togglePlayPause(),
                seekBackward: () => this.player.setCurrentTime(this.player.getCurrentTime() - this.options.seekStep),
                seekForward: () => this.player.setCurrentTime(this.player.getCurrentTime() + this.options.seekStep),
                volumeUp: () => this.player.setVolume(Math.min(1, this.player.getVolume() + this.options.volumeStep)),
                volumeDown: () => this.player.setVolume(Math.max(0, this.player.getVolume() - this.options.volumeStep)),
                toggleMute: () => this.player.setMuted(!this.player.isMuted()),
                toggleFullscreen: () => this.player.toggleFullscreen(),
                togglePiP: () => this.player.togglePictureInPicture(),
                toggleSubtitles: () => this.player.toggleSubtitles(),
                seekToStart: () => this.player.setCurrentTime(0),
                seekToPercent10: () => this.seekToPercent(10),
                seekToPercent20: () => this.seekToPercent(20),
                seekToPercent30: () => this.seekToPercent(30),
                seekToPercent40: () => this.seekToPercent(40),
                seekToPercent50: () => this.seekToPercent(50),
                seekToPercent60: () => this.seekToPercent(60),
                seekToPercent70: () => this.seekToPercent(70),
                seekToPercent80: () => this.seekToPercent(80),
                seekToPercent90: () => this.seekToPercent(90)
            };

            if (actions[action]) {
                actions[action]();
            }
        }

        seekToPercent(percent) {
            const duration = this.player.getDuration();
            if (duration > 0) {
                this.player.setCurrentTime((duration * percent) / 100);
            }
        }

        dispose() {
            if (this.boundKeyHandler) {
                document.removeEventListener('keydown', this.boundKeyHandler);
                this.boundKeyHandler = null;
            }
            console.log('Keyboard Shortcuts Plugin disposed');
        }
    }

    window.registerMYETVPlugin('keyboardShortcutsPlugin', KeyboardShortcutsPlugin);

})(window);
```

---

## Best Practices

### 1. Always Check Debug Mode

```javascript
if (this.player.options.debug) {
    console.log('Plugin debug message');
}
```

### 2. Handle Errors Gracefully

```javascript
setup() {
    try {
        this.createUI();
    } catch (error) {
        console.error('Plugin setup failed:', error);
    }
}
```

### 3. Clean Up Resources

```javascript
dispose() {
    // Remove event listeners
    // Clear timers
    // Remove DOM elements
    // Reset state
}
```

### 4. Provide Default Options

```javascript
this.options = Object.assign({
    enabled: true,
    option1: 'default1',
    option2: 'default2'
}, options);
```

### 5. Use Namespaced CSS Classes

```javascript
button.className = 'myplugin-button'; // Not just 'button'
```

### 6. Document Your Plugin

```javascript
/**
 * MyPlugin - Description
 * @param {Object} player - Player instance
 * @param {Object} options - Plugin options
 * @param {Boolean} options.enabled - Enable/disable plugin
 * @param {String} options.customOption - Custom option description
 */
```

---

## Debugging

### Enable Debug Mode

```javascript
const player = new MYETVPlayer('myVideo', {
    debug: true // Enable debug logging
});
```

### Check Plugin Status

```javascript
// Check if plugin is loaded
if (player.hasPlugin('myPlugin')) {
    console.log('Plugin is loaded');
}

// Get plugin instance
const plugin = player.getPlugin('myPlugin');
console.log('Plugin instance:', plugin);

// Get all active plugins
console.log('Active plugins:', player.getActivePlugins());
```

### Console Debugging

```javascript
// In your plugin
setup() {
    console.log('[MyPlugin] Setup started');
    console.log('[MyPlugin] Options:', this.options);
    console.log('[MyPlugin] Player state:', this.player.getPlayerState());
}
```

### Testing Plugin Events

```javascript
const player = new MYETVPlayer('myVideo', { debug: true });

// Listen to plugin setup events
player.addEventListener('pluginsetup', (data) => {
    console.log('Plugin setup:', data);
});

player.addEventListener('pluginsetup:myPlugin', (data) => {
    console.log('My specific plugin setup:', data);
});
```

---

## FAQ

### Q: Can I create a plugin without modifying core files?

**A:** Yes! That's the whole point. Plugins are completely separate from the core player.

### Q: How do I pass data between plugins?

**A:** Use the player's event system or store data in `player.data` object.

```javascript
// Plugin A
this.player.data = this.player.data || {};
this.player.data.sharedValue = 'some data';

// Plugin B
const sharedValue = this.player.data?.sharedValue;
```

### Q: Can I override core player methods?

**A:** Not recommended, but technically possible. Use hooks and events instead.

### Q: How do I distribute my plugin?

**A:** Publish it as a standalone JavaScript file. Users can include it via `<script>` tag or module import.

### Q: Can plugins work with multiple player instances?

**A:** Yes! Each player instance gets its own plugin instance.

```javascript
const player1 = new MYETVPlayer('video1');
const player2 = new MYETVPlayer('video2');

player1.usePlugin('myPlugin', { option: 'value1' });
player2.usePlugin('myPlugin', { option: 'value2' });
```

### Q: How do I make my plugin configurable?

**A:** Accept options in the constructor and provide defaults.

```javascript
constructor(player, options) {
    this.options = Object.assign({
        // Defaults
        setting1: 'default',
        setting2: true
    }, options);
}
```

### Q: Can I use async/await in plugins?

**A:** Yes! Plugins fully support modern JavaScript features.

```javascript
async setup() {
    const data = await fetch('/api/plugin-data');
    this.data = await data.json();
}
```

---

## 📝 License

MIT License - See main project for details.

---

## Contributing

Contributions are welcome! Please submit pull requests or open issues on GitHub.

---

## Support

- **GitHub**: [MYETV Video Player Open Source]([https://github.com/yourusername/myetv-player](https://github.com/OskarCosimo/myetv-video-player-opensource/))
- **Website**: [https://www.myetv.tv](https://www.myetv.tv)
- **Author**: [https://oskarcosimo.com](https://oskarcosimo.com)

---

**Happy Plugin Development!**
