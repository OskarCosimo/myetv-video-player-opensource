# MYETV Player - Gamepad Plugin
Add gamepad and controller support to MYETV Video Player. Perfect for Smart TVs, gaming consoles, TV remotes, and accessibility. Control video playback with Xbox, PlayStation, Nintendo controllers, or any gamepad!

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration Options](#configuration-options)
- [Preset Mappings](#preset-mappings)
- [Custom Mapping](#custom-mapping)
- [API Methods](#api-methods)
- [Events](#events)
- [Controller Support](#controller-support)
- [Examples](#examples)
- [FAQ](#faq)
- [Troubleshooting](#troubleshooting)

---

## Features

- **Universal Gamepad Support**: Xbox, PlayStation, Nintendo, TV remotes, generic controllers
- **Perfect for Smart TVs**: 10-foot experience with TV remotes and gamepads
- **Auto-Detection**: Automatically detects controller type and applies preset
- **5 Built-in Presets**: Xbox, PlayStation, Nintendo, TV Remote, Generic
- **100% Customizable**: Create your own button mappings
- **Analog Stick Support**: Use analog sticks for seeking and volume control
- **Haptic Feedback**: Vibration support for supported controllers
- **Visual Feedback**: On-screen notifications for actions
- **Dead Zone Calibration**: Adjustable sensitivity for analog sticks
- **Accessibility**: Alternative input method for users with disabilities
- **Hot-Plug Support**: Connect/disconnect controllers anytime
- **Real-time Switching**: Change presets or mappings on the fly

---

## Installation

### Method 1: Direct Script Include

```html
<!-- Load MYETV Player Core -->
<script src="dist/myetv-player.js"></script>

<!-- Load Gamepad Plugin -->
<script src="plugins/myetv-player-gamepad-plugin.js"></script>
```

### Method 2: Module Import

```javascript
import MYETVPlayer from './myetv-player.js';
import './plugins/myetv-player-gamepad-plugin.js';
```

---

## Quick Start

### Basic Example (Auto-detect)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>MYETV Player - Gamepad Control</title>
    <link rel="stylesheet" href="dist/myetv-player.css">
</head>
<body>
    <video id="myVideo" class="video-player" src="video.mp4"></video>

    <script src="dist/myetv-player.js"></script>
    <script src="plugins/myetv-player-gamepad-plugin.js"></script>

    <script>
        // Initialize with gamepad support (auto-detect enabled)
        const player = new MYETVPlayer('myVideo', {
            debug: true,
            plugins: {
                gamepad: {
                    enabled: true,
                    autoDetect: true  // Auto-detect controller type
                }
            }
        });

        // That's it! Connect your controller and start playing!
    </script>
</body>
</html>
```

---

## Configuration Options

```javascript
const player = new MYETVPlayer('myVideo', {
    plugins: {
        gamepad: {
            // ========== Enable/Disable ==========
            enabled: true,             // Enable gamepad plugin

            // ========== Preset Selection ==========
            // Options: 'xbox', 'playstation', 'nintendo', 'tv-remote', 'generic'
            preset: 'xbox',

            // ========== Auto-Detection ==========
            autoDetect: true,          // Auto-detect controller type

            // ========== Custom Mapping ==========
            // Set custom button/axis mapping (overrides preset)
            customMapping: null,       // See Custom Mapping section

            // ========== Analog Stick Settings ==========
            deadZone: 0.2,            // Ignore small movements (0-1)
            seekSensitivity: 5,       // Seconds to seek per input
            volumeSensitivity: 0.05,  // Volume change per input (0-1)

            // ========== Polling ==========
            pollingRate: 100,         // Check controller state every X ms

            // ========== Haptic Feedback ==========
            enableVibration: true,    // Enable controller vibration
            vibrationIntensity: 0.5,  // Vibration strength (0-1)

            // ========== UI Feedback ==========
            showFeedback: true,       // Show on-screen action feedback
            feedbackDuration: 1000,   // Feedback display time (ms)

            // ========== Debug ==========
            debug: false              // Enable debug logging
        }
    }
});
```

---

## Preset Mappings

The plugin includes 5 built-in presets optimized for different controllers:

### 1. Xbox Controller (Default)

```
A Button (0)      → Play/Pause
B Button (1)      → Stop
X Button (2)      → Fullscreen
Y Button (3)      → Mute
LB (4)            → Seek Backward (-5s)
RB (5)            → Seek Forward (+5s)
LT (6)            → Volume Down
RT (7)            → Volume Up
Back/Select (8)   → Show Info
Start (9)         → Settings
Left Stick X      → Seek
Left Stick Y      → Volume
```

---

### 2. PlayStation Controller

```
Cross (0)         → Play/Pause
Circle (1)        → Stop
Square (2)        → Fullscreen
Triangle (3)      → Mute
L1 (4)            → Seek Backward
R1 (5)            → Seek Forward
L2 (6)            → Volume Down
R2 (7)            → Volume Up
Share (8)         → Show Info
Options (9)       → Settings
Left Stick X/Y    → Seek/Volume
```

---

### 3. Nintendo Switch Controller

```
A (Bottom) (1)    → Play/Pause
B (Right) (0)     → Stop
X (Top) (3)       → Fullscreen
Y (Left) (2)      → Mute
L (4)             → Seek Backward
R (5)             → Seek Forward
ZL (6)            → Volume Down
ZR (7)            → Volume Up
- (8)             → Show Info
+ (9)             → Settings
Left Stick X/Y    → Seek/Volume
```

---

### 4. TV Remote

```
OK/Select (0)     → Play/Pause
Back (1)          → Stop
Info/Guide (2)    → Fullscreen
Mute (3)          → Mute
Left (4)          → Seek Backward
Right (5)         → Seek Forward
Volume Down (6)   → Volume Down
Volume Up (7)     → Volume Up
Menu (9)          → Settings
```

---

### 5. Generic

```
Button 0          → Play/Pause
Button 1          → Stop
Button 2          → Fullscreen
Button 3          → Mute
Button 4          → Seek Backward
Button 5          → Seek Forward
Button 6          → Volume Down
Button 7          → Volume Up
Axis 0            → Seek
Axis 1            → Volume
```

---

## Custom Mapping

Create your own button mapping:

### Example: Custom Mapping

```javascript
const player = new MYETVPlayer('myVideo', {
    plugins: {
        gamepad: {
            customMapping: {
                // Button mappings
                playPause: { button: 0 },        // Button 0 = Play/Pause
                stop: { button: 1 },             // Button 1 = Stop
                seekForward: { button: 5 },      // Button 5 = +5s
                seekBackward: { button: 4 },     // Button 4 = -5s
                volumeUp: { button: 7 },         // Button 7 = Vol+
                volumeDown: { button: 6 },       // Button 6 = Vol-
                mute: { button: 3 },             // Button 3 = Mute
                fullscreen: { button: 2 },       // Button 2 = Fullscreen
                showInfo: { button: 8 },         // Button 8 = Show info
                settings: { button: 9 },         // Button 9 = Settings

                // Analog stick mappings (optional)
                seekAxis: { axis: 0 },           // Left stick X = Seek
                volumeAxis: { axis: 1 }          // Left stick Y = Volume
            }
        }
    }
});
```

### Available Actions

You can map these actions to any button or axis:

- `playPause` - Toggle play/pause
- `stop` - Stop and reset to beginning
- `seekForward` - Skip forward (default: +5s)
- `seekBackward` - Skip backward (default: -5s)
- `volumeUp` - Increase volume
- `volumeDown` - Decrease volume
- `mute` - Toggle mute
- `fullscreen` - Toggle fullscreen
- `showInfo` - Display video info overlay
- `settings` - Trigger settings event

### Button/Axis Indices

Button and axis indices are standardized:

**Standard Gamepad Buttons:**
```
0  = A / Cross / Bottom button
1  = B / Circle / Right button
2  = X / Square / Left button
3  = Y / Triangle / Top button
4  = LB / L1 / L
5  = RB / R1 / R
6  = LT / L2 / ZL
7  = RT / R2 / ZR
8  = Back / Share / Select
9  = Start / Options / Menu
10 = Left stick press
11 = Right stick press
12 = D-pad Up
13 = D-pad Down
14 = D-pad Left
15 = D-pad Right
16 = Home / PS / Guide
```

**Standard Gamepad Axes:**
```
0 = Left stick X (-1 left, +1 right)
1 = Left stick Y (-1 up, +1 down)
2 = Right stick X
3 = Right stick Y
```

---

## API Methods

### Get Connected Gamepads

```javascript
const gamepads = player.getConnectedGamepads();
console.log('Connected:', gamepads.length);

gamepads.forEach(gamepad => {
    console.log('ID:', gamepad.id);
    console.log('Buttons:', gamepad.buttons.length);
    console.log('Axes:', gamepad.axes.length);
});
```

---

### Change Preset

```javascript
// Switch to PlayStation preset
player.setGamepadPreset('playstation');

// Switch to TV remote preset
player.setGamepadPreset('tv-remote');

// Available presets:
// 'xbox', 'playstation', 'nintendo', 'tv-remote', 'generic'
```

---

### Set Custom Mapping

```javascript
const customMapping = {
    playPause: { button: 0 },
    seekForward: { button: 5 },
    seekBackward: { button: 4 }
};

player.setGamepadMapping(customMapping);
```

---

### Get Current Mapping

```javascript
const currentMapping = player.getGamepadMapping();
console.log('Current mapping:', currentMapping);
```

---

## Events

### gamepad:connected

Fired when a controller connects.

```javascript
player.addEventListener('gamepad:connected', (data) => {
    console.log('Controller connected:', data.id);
    console.log('Index:', data.index);
    console.log('Buttons:', data.buttons);
    console.log('Axes:', data.axes);
});
```

---

### gamepad:disconnected

Fired when a controller disconnects.

```javascript
player.addEventListener('gamepad:disconnected', (data) => {
    console.log('Controller disconnected:', data.id);
});
```

---

### gamepad:action

Fired when any gamepad action is executed.

```javascript
player.addEventListener('gamepad:action', (data) => {
    console.log('Action:', data.action);      // 'playPause', 'seekForward', etc.
    console.log('Gamepad:', data.gamepadIndex);
});
```

---

### gamepad:settings

Fired when settings button is pressed.

```javascript
player.addEventListener('gamepad:settings', () => {
    console.log('Settings button pressed');
    // Show your settings menu
});
```

---

## Controller Support

### Fully Tested

- Xbox One Controller
- Xbox Series X|S Controller
- PlayStation 4 DualShock
- PlayStation 5 DualSense
- Nintendo Switch Pro Controller
- Nintendo Switch Joy-Cons
- Generic USB/Bluetooth gamepads

### TV Platforms

- Samsung Smart TV (Tizen)
- LG webOS TV
- Android TV
- Fire TV
- Apple TV (with Siri Remote)

### Browser Support

- Chrome 21+
- Edge 12+
- Firefox 29+
- Safari 10.1+
- Opera 15+

---

## Examples

### Example 1: Xbox Controller Setup

```html
<video id="myVideo" class="video-player" src="video.mp4"></video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            gamepad: {
                preset: 'xbox',
                autoDetect: true,
                showFeedback: true,
                enableVibration: true
            }
        }
    });

    // Notify when controller connects
    player.addEventListener('gamepad:connected', (data) => {
        alert('Controller connected! Ready to play.');
    });
</script>
```

---

### Example 2: TV Remote for Smart TV

```html
<video id="myVideo" class="video-player" src="video.mp4"></video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            gamepad: {
                preset: 'tv-remote',
                showFeedback: true,
                seekSensitivity: 10,     // Skip 10 seconds
                volumeSensitivity: 0.1   // 10% volume change
            }
        }
    });
</script>
```

---

### Example 3: Custom Mapping for Arcade Cabinet

```html
<video id="myVideo" class="video-player" src="video.mp4"></video>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            gamepad: {
                customMapping: {
                    playPause: { button: 0 },    // Player 1 Button 1
                    stop: { button: 1 },         // Player 1 Button 2
                    fullscreen: { button: 2 },   // Player 1 Button 3
                    mute: { button: 3 }          // Player 1 Button 4
                },
                showFeedback: true,
                enableVibration: false  // No vibration in arcade
            }
        }
    });
</script>
```

---

### Example 4: Multi-Controller Support

```html
<video id="myVideo" class="video-player" src="video.mp4"></video>

<div id="controller-list"></div>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            gamepad: {
                autoDetect: true,
                showFeedback: true
            }
        }
    });

    // Show connected controllers
    function updateControllerList() {
        const gamepads = player.getConnectedGamepads();
        const list = document.getElementById('controller-list');

        list.innerHTML = '<h3>Connected Controllers:</h3>';
        gamepads.forEach((gamepad, index) => {
            list.innerHTML += `<p>${index + 1}. ${gamepad.id}</p>`;
        });
    }

    player.addEventListener('gamepad:connected', updateControllerList);
    player.addEventListener('gamepad:disconnected', updateControllerList);
</script>
```

---

### Example 5: Change Preset On-the-Fly

```html
<video id="myVideo" class="video-player" src="video.mp4"></video>

<div>
    <button onclick="setPreset('xbox')">Xbox</button>
    <button onclick="setPreset('playstation')">PlayStation</button>
    <button onclick="setPreset('nintendo')">Nintendo</button>
    <button onclick="setPreset('tv-remote')">TV Remote</button>
</div>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            gamepad: {
                autoDetect: false,  // Manual preset selection
                showFeedback: true
            }
        }
    });

    function setPreset(preset) {
        player.setGamepadPreset(preset);
        console.log('Preset changed to:', preset);
    }
</script>
```

---

### Example 6: Sensitivity Adjustment

```html
<video id="myVideo" class="video-player" src="video.mp4"></video>

<div>
    <label>Seek Sensitivity: <input type="range" id="seekSens" min="1" max="30" value="5"></label>
    <label>Volume Sensitivity: <input type="range" id="volSens" min="1" max="20" value="5"></label>
</div>

<script>
    const player = new MYETVPlayer('myVideo', {
        plugins: {
            gamepad: {
                preset: 'xbox',
                seekSensitivity: 5,
                volumeSensitivity: 0.05
            }
        }
    });

    const gamepadPlugin = player.getPlugin('gamepad');

    // Update seek sensitivity
    document.getElementById('seekSens').oninput = (e) => {
        gamepadPlugin.options.seekSensitivity = parseInt(e.target.value);
    };

    // Update volume sensitivity
    document.getElementById('volSens').oninput = (e) => {
        gamepadPlugin.options.volumeSensitivity = parseInt(e.target.value) / 100;
    };
</script>
```

---

## FAQ

### Q: Which controllers are supported?

**A:** Any controller that works with the Gamepad API! This includes:
- Xbox controllers (wired and wireless)
- PlayStation controllers (DualShock 4, DualSense)
- Nintendo controllers (Pro, Joy-Cons)
- Generic USB/Bluetooth gamepads
- TV remotes on Smart TVs

---

### Q: Do I need drivers or software?

**A:** No! The Gamepad API is built into modern browsers. Just connect your controller and it should work immediately.

---

### Q: Can I use multiple controllers?

**A:** Yes! The plugin supports multiple controllers simultaneously. Any controller can control the player.

---

### Q: How do I know which button is which?

**A:** Enable debug mode to see button/axis indices:
```javascript
plugins: {
    gamepad: {
        debug: true  // Shows button presses in console
    }
}
```

---

### Q: Does vibration work on all controllers?

**A:** Vibration works on controllers with vibration actuators (Xbox, PlayStation). Not all browsers support vibration yet.

---

### Q: Can I disable the on-screen feedback?

**A:** Yes:
```javascript
plugins: {
    gamepad: {
        showFeedback: false
    }
}
```

---

### Q: How do I map D-pad buttons?

**A:** D-pad buttons are indices 12-15:
```javascript
customMapping: {
    seekForward: { button: 15 },   // D-pad Right
    seekBackward: { button: 14 }   // D-pad Left
}
```

---

### Q: Can I use this for accessibility?

**A:** Absolutely! Gamepads are a great accessibility tool for users who can't use keyboard/mouse.

---

## Troubleshooting

### Issue: Controller not detected

**Solution:**
1. Check if controller is connected properly
2. Enable debug mode: `debug: true`
3. Press any button to "wake up" the controller
4. Check browser console for Gamepad API support
5. Try in a different browser

---

### Issue: Wrong buttons mapped

**Solution:**
1. Different controllers have different layouts
2. Enable debug mode to see button indices
3. Use auto-detect or choose correct preset
4. Or create custom mapping with correct indices

---

### Issue: Analog sticks too sensitive/not responsive

**Solution:**
Adjust dead zone:
```javascript
plugins: {
    gamepad: {
        deadZone: 0.3  // Increase for less sensitivity (0-1)
    }
}
```

---

### Issue: Actions triggering too fast

**Solution:**
Increase polling rate (check less frequently):
```javascript
plugins: {
    gamepad: {
        pollingRate: 200  // Check every 200ms instead of 100ms
    }
}
```

---

### Issue: Vibration not working

**Solution:**
- Not all browsers support vibration
- Check if controller has vibration motors
- Try Chrome or Edge (best support)

---

### Debug Mode

Enable comprehensive debugging:

```javascript
const player = new MYETVPlayer('myVideo', {
    debug: true,
    plugins: {
        gamepad: {
            debug: true,
            showFeedback: true
        }
    }
});
```

This will log:
- Controller connections/disconnections
- Button presses with indices
- Axis movements
- Action executions

---

## Resources

- **MYETV Player**: [https://www.myetv.tv](https://www.myetv.tv)
- **Gamepad API MDN**: [https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API)
- **Gamepad Tester**: [https://gamepad-tester.com](https://gamepad-tester.com) (test your controller)
- **GitHub**: [MYETV Video Player Open Source](https://github.com/OskarCosimo/myetv-video-player-opensource)
- **Author**: [https://oskarcosimo.com](https://oskarcosimo.com)

---

## License

MIT License - See main project for details.

---

## Contributing

Contributions are welcome! Please submit pull requests or open issues on GitHub.

---

**Game on!**
