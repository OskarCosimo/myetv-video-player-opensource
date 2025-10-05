/**
 * MYETV Player - Gamepad Plugin
 * File: myetv-player-gamepad-remote-plugin.js
 * Adds gamepad/controller support for video playback control
 * Perfect for Smart TVs, gaming consoles, and accessibility
 * Created by https://www.myetv.tv https://oskarcosimo.com
 */

(function () {
    'use strict';

    class GamepadPlugin {
        constructor(player, options = {}) {
            this.player = player;
            this.options = {
                // Enable/disable plugin
                enabled: options.enabled !== false,

                // Preset mappings ('xbox', 'playstation', 'nintendo', 'tv-remote', 'generic')
                preset: options.preset || 'xbox',

                // Custom mapping (overrides preset if provided)
                customMapping: options.customMapping || null,

                // Analog stick settings
                deadZone: options.deadZone || 0.2,          // Ignore small movements
                seekSensitivity: options.seekSensitivity || 5,    // Seconds to seek per input
                volumeSensitivity: options.volumeSensitivity || 0.05,  // Volume change per input

                // Auto-detect controller type
                autoDetect: options.autoDetect !== false,

                // Polling rate (ms)
                pollingRate: options.pollingRate || 100,

                // Vibration/haptic feedback
                enableVibration: options.enableVibration !== false,
                vibrationIntensity: options.vibrationIntensity || 0.5,

                // UI feedback
                showFeedback: options.showFeedback !== false,
                feedbackDuration: options.feedbackDuration || 1000,

                // Debug mode
                debug: options.debug || false,

                ...options
            };

            this.connectedGamepads = {};
            this.pollingInterval = null;
            this.lastButtonStates = {};
            this.lastAxisValues = {};
            this.feedbackTimeout = null;

            // Preset mappings
            this.presetMappings = this.getPresetMappings();

            // Current mapping
            this.currentMapping = this.options.customMapping ||
                this.presetMappings[this.options.preset] ||
                this.presetMappings.generic;

            // Get plugin API
            this.api = player.getPluginAPI ? player.getPluginAPI() : {
                player: player,
                video: player.video,
                container: player.container,
                controls: player.controls,
                debug: (msg) => {
                    if (this.options.debug) console.log('🎮 Gamepad Plugin:', msg);
                },
                triggerEvent: (event, data) => player.triggerEvent(event, data)
            };
        }

        /**
         * Get preset controller mappings
         */
        getPresetMappings() {
            return {
                // Xbox controller (standard mapping)
                xbox: {
                    playPause: { button: 0 },           // A button
                    stop: { button: 1 },                // B button
                    fullscreen: { button: 2 },          // X button
                    mute: { button: 3 },                // Y button
                    seekBackward: { button: 4 },        // LB
                    seekForward: { button: 5 },         // RB
                    volumeDown: { button: 6 },          // LT
                    volumeUp: { button: 7 },            // RT
                    showInfo: { button: 8 },            // Back/Select
                    settings: { button: 9 },            // Start
                    seekAxis: { axis: 0 },              // Left stick X
                    volumeAxis: { axis: 1 }             // Left stick Y
                },

                // PlayStation controller
                playstation: {
                    playPause: { button: 0 },           // Cross
                    stop: { button: 1 },                // Circle
                    fullscreen: { button: 2 },          // Square
                    mute: { button: 3 },                // Triangle
                    seekBackward: { button: 4 },        // L1
                    seekForward: { button: 5 },         // R1
                    volumeDown: { button: 6 },          // L2
                    volumeUp: { button: 7 },            // R2
                    showInfo: { button: 8 },            // Share
                    settings: { button: 9 },            // Options
                    seekAxis: { axis: 0 },              // Left stick X
                    volumeAxis: { axis: 1 }             // Left stick Y
                },

                // Nintendo Switch controller
                nintendo: {
                    playPause: { button: 1 },           // A (bottom)
                    stop: { button: 0 },                // B (right)
                    fullscreen: { button: 3 },          // X (top)
                    mute: { button: 2 },                // Y (left)
                    seekBackward: { button: 4 },        // L
                    seekForward: { button: 5 },         // R
                    volumeDown: { button: 6 },          // ZL
                    volumeUp: { button: 7 },            // ZR
                    showInfo: { button: 8 },            // -
                    settings: { button: 9 },            // +
                    seekAxis: { axis: 0 },
                    volumeAxis: { axis: 1 }
                },

                // TV Remote / Generic mapping
                'tv-remote': {
                    playPause: { button: 0 },           // OK/Select
                    stop: { button: 1 },                // Back
                    seekBackward: { button: 4 },        // Left
                    seekForward: { button: 5 },         // Right
                    volumeDown: { button: 6 },          // Volume -
                    volumeUp: { button: 7 },            // Volume +
                    mute: { button: 3 },                // Mute
                    fullscreen: { button: 2 },          // Guide/Info
                    settings: { button: 9 }             // Menu
                },

                // Generic fallback
                generic: {
                    playPause: { button: 0 },
                    stop: { button: 1 },
                    fullscreen: { button: 2 },
                    mute: { button: 3 },
                    seekBackward: { button: 4 },
                    seekForward: { button: 5 },
                    volumeDown: { button: 6 },
                    volumeUp: { button: 7 },
                    seekAxis: { axis: 0 },
                    volumeAxis: { axis: 1 }
                }
            };
        }

        /**
         * Setup plugin
         */
        setup() {
            if (!this.options.enabled) {
                this.api.debug('Plugin disabled');
                return;
            }

            // Check Gamepad API support
            if (!navigator.getGamepads) {
                console.warn('🎮 Gamepad API not supported in this browser');
                return;
            }

            this.api.debug('Setup started with preset: ' + this.options.preset);

            // Setup gamepad event listeners
            this.setupGamepadListeners();

            // Create feedback UI if enabled
            if (this.options.showFeedback) {
                this.createFeedbackUI();
            }

            // Add custom methods
            this.addCustomMethods();

            this.api.debug('Setup completed');
        }

        /**
         * Setup gamepad event listeners
         */
        setupGamepadListeners() {
            // Gamepad connected
            window.addEventListener('gamepadconnected', (e) => {
                this.onGamepadConnected(e.gamepad);
            });

            // Gamepad disconnected
            window.addEventListener('gamepaddisconnected', (e) => {
                this.onGamepadDisconnected(e.gamepad);
            });

            // Check for already connected gamepads
            this.checkExistingGamepads();
        }

        /**
         * Check for already connected gamepads
         */
        checkExistingGamepads() {
            const gamepads = navigator.getGamepads();
            for (let i = 0; i < gamepads.length; i++) {
                if (gamepads[i]) {
                    this.onGamepadConnected(gamepads[i]);
                }
            }
        }

        /**
         * Gamepad connected handler
         */
        onGamepadConnected(gamepad) {
            this.api.debug('Gamepad connected: ' + gamepad.id + ' (index: ' + gamepad.index + ')');

            this.connectedGamepads[gamepad.index] = gamepad;
            this.lastButtonStates[gamepad.index] = [];
            this.lastAxisValues[gamepad.index] = [];

            // Auto-detect controller type
            if (this.options.autoDetect) {
                this.detectControllerType(gamepad);
            }

            // Start polling if not already started
            if (!this.pollingInterval) {
                this.startPolling();
            }

            // Show feedback
            this.showFeedback('🎮 Controller Connected: ' + this.getControllerName(gamepad));

            // Trigger event
            this.api.triggerEvent('gamepad:connected', {
                id: gamepad.id,
                index: gamepad.index,
                buttons: gamepad.buttons.length,
                axes: gamepad.axes.length
            });
        }

        /**
         * Gamepad disconnected handler
         */
        onGamepadDisconnected(gamepad) {
            this.api.debug('Gamepad disconnected: ' + gamepad.id);

            delete this.connectedGamepads[gamepad.index];
            delete this.lastButtonStates[gamepad.index];
            delete this.lastAxisValues[gamepad.index];

            // Stop polling if no gamepads left
            if (Object.keys(this.connectedGamepads).length === 0) {
                this.stopPolling();
            }

            // Show feedback
            this.showFeedback('🎮 Controller Disconnected');

            // Trigger event
            this.api.triggerEvent('gamepad:disconnected', {
                id: gamepad.id,
                index: gamepad.index
            });
        }

        /**
         * Detect controller type from ID
         */
        detectControllerType(gamepad) {
            const id = gamepad.id.toLowerCase();

            if (id.includes('xbox') || id.includes('xinput')) {
                this.api.debug('Detected Xbox controller');
                this.currentMapping = this.presetMappings.xbox;
            } else if (id.includes('playstation') || id.includes('dualshock') || id.includes('dualsense')) {
                this.api.debug('Detected PlayStation controller');
                this.currentMapping = this.presetMappings.playstation;
            } else if (id.includes('nintendo') || id.includes('switch')) {
                this.api.debug('Detected Nintendo controller');
                this.currentMapping = this.presetMappings.nintendo;
            }
        }

        /**
         * Get friendly controller name
         */
        getControllerName(gamepad) {
            const id = gamepad.id.toLowerCase();

            if (id.includes('xbox')) return 'Xbox Controller';
            if (id.includes('playstation') || id.includes('dualshock')) return 'PlayStation Controller';
            if (id.includes('dualsense')) return 'DualSense Controller';
            if (id.includes('nintendo') || id.includes('switch')) return 'Nintendo Controller';

            return gamepad.id.substring(0, 30) + (gamepad.id.length > 30 ? '...' : '');
        }

        /**
         * Start polling gamepads
         */
        startPolling() {
            this.api.debug('Started polling gamepads');

            this.pollingInterval = setInterval(() => {
                this.pollGamepads();
            }, this.options.pollingRate);
        }

        /**
         * Stop polling gamepads
         */
        stopPolling() {
            if (this.pollingInterval) {
                clearInterval(this.pollingInterval);
                this.pollingInterval = null;
                this.api.debug('Stopped polling gamepads');
            }
        }

        /**
         * Poll all connected gamepads
         */
        pollGamepads() {
            const gamepads = navigator.getGamepads();

            for (let i = 0; i < gamepads.length; i++) {
                const gamepad = gamepads[i];
                if (!gamepad) continue;

                // Check buttons
                this.checkButtons(gamepad);

                // Check axes
                this.checkAxes(gamepad);
            }
        }

        /**
         * Check gamepad buttons
         */
        checkButtons(gamepad) {
            const index = gamepad.index;

            for (let i = 0; i < gamepad.buttons.length; i++) {
                const button = gamepad.buttons[i];
                const wasPressed = this.lastButtonStates[index][i];
                const isPressed = button.pressed;

                // Button just pressed (edge detection)
                if (isPressed && !wasPressed) {
                    this.handleButtonPress(i, gamepad);
                }

                // Update state
                this.lastButtonStates[index][i] = isPressed;
            }
        }

        /**
         * Check gamepad axes
         */
        checkAxes(gamepad) {
            const index = gamepad.index;

            for (let i = 0; i < gamepad.axes.length; i++) {
                const value = gamepad.axes[i];
                const lastValue = this.lastAxisValues[index][i] || 0;

                // Check if axis moved beyond dead zone
                if (Math.abs(value) > this.options.deadZone) {
                    this.handleAxisMove(i, value, gamepad);
                }

                // Update state
                this.lastAxisValues[index][i] = value;
            }
        }

        /**
         * Handle button press
         */
        handleButtonPress(buttonIndex, gamepad) {
            this.api.debug('Button pressed: ' + buttonIndex);

            // Find action for this button
            for (const [action, mapping] of Object.entries(this.currentMapping)) {
                if (mapping.button === buttonIndex) {
                    this.executeAction(action, gamepad);
                    return;
                }
            }
        }

        /**
         * Handle axis movement
         */
        handleAxisMove(axisIndex, value, gamepad) {
            // Check seek axis
            if (this.currentMapping.seekAxis && this.currentMapping.seekAxis.axis === axisIndex) {
                if (value > this.options.deadZone) {
                    this.executeAction('seekForward', gamepad);
                } else if (value < -this.options.deadZone) {
                    this.executeAction('seekBackward', gamepad);
                }
            }

            // Check volume axis
            if (this.currentMapping.volumeAxis && this.currentMapping.volumeAxis.axis === axisIndex) {
                if (value > this.options.deadZone) {
                    this.executeAction('volumeDown', gamepad);
                } else if (value < -this.options.deadZone) {
                    this.executeAction('volumeUp', gamepad);
                }
            }
        }

        /**
         * Execute action
         */
        executeAction(action, gamepad) {
            this.api.debug('Executing action: ' + action);

            switch (action) {
                case 'playPause':
                    this.api.player.togglePlayPause();
                    this.showFeedback(this.api.video.paused ? '▶️ Play' : '⏸️ Pause');
                    this.vibrate(100);
                    break;

                case 'stop':
                    this.api.player.pause();
                    this.api.video.currentTime = 0;
                    this.showFeedback('⏹️ Stop');
                    this.vibrate(100);
                    break;

                case 'seekForward':
                    this.api.video.currentTime += this.options.seekSensitivity;
                    this.showFeedback('⏩ +' + this.options.seekSensitivity + 's');
                    this.vibrate(50);
                    break;

                case 'seekBackward':
                    this.api.video.currentTime -= this.options.seekSensitivity;
                    this.showFeedback('⏪ -' + this.options.seekSensitivity + 's');
                    this.vibrate(50);
                    break;

                case 'volumeUp':
                    const newVolumeUp = Math.min(1, this.api.video.volume + this.options.volumeSensitivity);
                    this.api.video.volume = newVolumeUp;
                    this.showFeedback('🔊 Volume: ' + Math.round(newVolumeUp * 100) + '%');
                    this.vibrate(30);
                    break;

                case 'volumeDown':
                    const newVolumeDown = Math.max(0, this.api.video.volume - this.options.volumeSensitivity);
                    this.api.video.volume = newVolumeDown;
                    this.showFeedback('🔉 Volume: ' + Math.round(newVolumeDown * 100) + '%');
                    this.vibrate(30);
                    break;

                case 'mute':
                    this.api.video.muted = !this.api.video.muted;
                    this.showFeedback(this.api.video.muted ? '🔇 Muted' : '🔊 Unmuted');
                    this.vibrate(100);
                    break;

                case 'fullscreen':
                    this.api.player.toggleFullscreen();
                    this.showFeedback(document.fullscreenElement ? '⛶ Fullscreen' : '⛶ Exit Fullscreen');
                    this.vibrate(100);
                    break;

                case 'showInfo':
                    this.showVideoInfo();
                    this.vibrate(50);
                    break;

                case 'settings':
                    this.api.triggerEvent('gamepad:settings');
                    this.showFeedback('⚙️ Settings');
                    this.vibrate(50);
                    break;
            }

            // Trigger custom event
            this.api.triggerEvent('gamepad:action', {
                action: action,
                gamepadIndex: gamepad.index
            });
        }

        /**
         * Vibrate gamepad (if supported)
         */
        vibrate(duration = 100) {
            if (!this.options.enableVibration) return;

            const gamepads = navigator.getGamepads();
            for (let i = 0; i < gamepads.length; i++) {
                const gamepad = gamepads[i];
                if (gamepad && gamepad.vibrationActuator) {
                    gamepad.vibrationActuator.playEffect('dual-rumble', {
                        duration: duration,
                        strongMagnitude: this.options.vibrationIntensity,
                        weakMagnitude: this.options.vibrationIntensity * 0.5
                    });
                }
            }
        }

        /**
         * Create feedback UI
         */
        createFeedbackUI() {
            this.feedbackElement = document.createElement('div');
            this.feedbackElement.className = 'gamepad-feedback';
            this.feedbackElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 15px 25px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                z-index: 10000;
                display: none;
                animation: fadeIn 0.2s;
            `;
            document.body.appendChild(this.feedbackElement);
        }

        /**
         * Show feedback message
         */
        showFeedback(message) {
            if (!this.options.showFeedback || !this.feedbackElement) return;

            this.feedbackElement.textContent = message;
            this.feedbackElement.style.display = 'block';

            // Clear existing timeout
            if (this.feedbackTimeout) {
                clearTimeout(this.feedbackTimeout);
            }

            // Hide after duration
            this.feedbackTimeout = setTimeout(() => {
                this.feedbackElement.style.display = 'none';
            }, this.options.feedbackDuration);
        }

        /**
         * Show video info
         */
        showVideoInfo() {
            const currentTime = this.formatTime(this.api.video.currentTime);
            const duration = this.formatTime(this.api.video.duration);
            const volume = Math.round(this.api.video.volume * 100);

            this.showFeedback(
                `⏱️ ${currentTime} / ${duration}\n` +
                `🔊 Volume: ${volume}%`
            );
        }

        /**
         * Format time
         */
        formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }

        /**
         * Add custom methods to player
         */
        addCustomMethods() {
            // Get connected gamepads
            this.api.player.getConnectedGamepads = () => {
                return Object.values(this.connectedGamepads);
            };

            // Change mapping preset
            this.api.player.setGamepadPreset = (preset) => {
                return this.setPreset(preset);
            };

            // Set custom mapping
            this.api.player.setGamepadMapping = (mapping) => {
                return this.setCustomMapping(mapping);
            };

            // Get current mapping
            this.api.player.getGamepadMapping = () => {
                return this.currentMapping;
            };
        }

        /**
         * Set preset
         */
        setPreset(preset) {
            if (!this.presetMappings[preset]) {
                console.warn('Unknown preset:', preset);
                return false;
            }

            this.options.preset = preset;
            this.currentMapping = this.presetMappings[preset];
            this.api.debug('Preset changed to: ' + preset);
            this.showFeedback('🎮 Preset: ' + preset);

            return true;
        }

        /**
         * Set custom mapping
         */
        setCustomMapping(mapping) {
            this.currentMapping = mapping;
            this.api.debug('Custom mapping applied');
            this.showFeedback('🎮 Custom mapping applied');

            return true;
        }

        /**
         * Dispose plugin
         */
        dispose() {
            this.api.debug('Disposing plugin');

            // Stop polling
            this.stopPolling();

            // Remove feedback UI
            if (this.feedbackElement) {
                this.feedbackElement.remove();
                this.feedbackElement = null;
            }

            // Clear timeouts
            if (this.feedbackTimeout) {
                clearTimeout(this.feedbackTimeout);
            }

            // Remove event listeners
            window.removeEventListener('gamepadconnected', this.onGamepadConnected);
            window.removeEventListener('gamepaddisconnected', this.onGamepadDisconnected);

            this.api.debug('Plugin disposed');
        }
    }

    // Register plugin globally
    if (typeof window.registerMYETVPlugin === 'function') {
        window.registerMYETVPlugin('gamepad', GamepadPlugin);
    } else {
        console.error('🎮 MYETV Player plugin system not found');
    }

})();