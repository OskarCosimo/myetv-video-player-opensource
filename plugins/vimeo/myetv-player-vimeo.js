/* Vimeo Plugin for MYETV Video Player
 * Integrates Vimeo videos with ID or URL support
 * Supports quality selection and full Vimeo Player API
 * Created by https://www.myetv.tv https://oskarcosimo.com
 */

// ===================================================================
// GLOBAL CODE - Will be placed OUTSIDE the class by build script
// ===================================================================

/* GLOBAL_START */
(function () {
    'use strict';

    /**
     * Vimeo Plugin
     * Embeds and controls Vimeo videos
     */
    class VimeoPlugin {
        constructor(player, options = {}) {
            this.player = player;
            this.options = {
                // Video source (can be ID, URL, or full Vimeo URL)
                videoId: options.videoId || null,
                videoUrl: options.videoUrl || null,

                // Vimeo embed options
                width: options.width || null,
                height: options.height || null,
                autopause: options.autopause !== false,
                autoplay: options.autoplay || false,
                background: options.background || false,
                byline: options.byline !== false,
                color: options.color || null,
                controls: false, // Force controls off to use MYETV controls
                dnt: options.dnt || false,
                loop: options.loop || false,
                muted: options.muted || false,
                playsinline: options.playsinline !== false,
                portrait: options.portrait !== false,
                quality: options.quality || 'auto',
                responsive: options.responsive !== false,
                speed: options.speed || false,
                texttrack: options.texttrack || null,
                title: options.title !== false,
                transparent: options.transparent !== false,

                // Plugin options
                debug: options.debug || false,
                replaceNativePlayer: options.replaceNativePlayer !== false,
                syncControls: options.syncControls !== false,
                ...options
            };

            this.vimeoPlayer = null;
            this.vimeoContainer = null;
            this.isVimeoLoaded = false;
            this.availableQualities = [];

            // Check if video source is provided
            if (!this.options.videoId && !this.options.videoUrl) {
                console.error('🎬 Vimeo Plugin: videoId or videoUrl is required');
                return;
            }
        }

        /**
         * Setup plugin
         */
        setup() {
            // Disable PIP for Vimeo (not supported)
            this.disablePipButton();

            this.loadVimeoSDK().then(() => {
                this.createVimeoPlayer();

                if (this.options.replaceNativePlayer) {
                    this.hideNativePlayer();
                }
            }).catch(error => {
                console.error('🎬 Vimeo Plugin: Failed to load SDK', error);
            });

            if (this.options.debug) {
                console.log('🎬 Vimeo Plugin initialized');
            }
        }

        /**
         * Disable PIP button permanently (Vimeo doesn't support it)
         */
        disablePipButton() {
            // Set option to false
            if (this.player.options) {
                this.player.options.showPictureInPicture = false;
            }

            // Hide PIP button immediately
            this.hidePipFromSettingsMenuOnly();

            // Setup responsive layout handler
            this.handleResponsiveLayout();

            if (this.options.debug) {
                console.log('🎬 Vimeo: PIP disabled (not supported)');
            }
        }

        /**
         * Hide PIP from settings menu using MutationObserver
         * Copied from YouTube plugin
         */
        hidePipFromSettingsMenuOnly() {
            const hidePipOption = () => {
                const settingsMenu = this.player.container.querySelector('.settings-menu');
                if (settingsMenu) {
                    const pipOption = settingsMenu.querySelector('[data-setting="pip"]');
                    if (pipOption) {
                        pipOption.style.display = 'none';
                    }
                }
            };

            // Hide immediately
            hidePipOption();

            // Setup observer for dynamic changes
            const observer = new MutationObserver(() => {
                hidePipOption();
            });

            if (this.player.container) {
                observer.observe(this.player.container, {
                    childList: true,
                    subtree: true
                });
            }

            // Store observer for cleanup
            this.pipObserver = observer;
        }

        /**
         * Handle responsive layout to hide PIP button
         * Copied from YouTube plugin
         */
        handleResponsiveLayout() {
            const hidePipButton = () => {
                const pipBtn = this.player.container.querySelector('.pip-btn, [data-pip-btn]');
                if (pipBtn) {
                    pipBtn.style.display = 'none';
                }

                // Also hide from settings menu
                const settingsMenu = this.player.container.querySelector('.settings-menu');
                if (settingsMenu) {
                    const pipOption = settingsMenu.querySelector('[data-setting="pip"]');
                    if (pipOption) {
                        pipOption.style.display = 'none';
                    }
                }
            };

            // Hide immediately
            hidePipButton();

            // Hide on window resize
            window.addEventListener('resize', hidePipButton);

            // Hide on orientation change
            window.addEventListener('orientationchange', hidePipButton);

            // Store cleanup function
            this.pipCleanup = () => {
                window.removeEventListener('resize', hidePipButton);
                window.removeEventListener('orientationchange', hidePipButton);
            };
        }

        /**
         * Load Vimeo Player SDK
         */
        loadVimeoSDK() {
            return new Promise((resolve, reject) => {
                // Check if already loaded
                if (window.Vimeo && window.Vimeo.Player) {
                    resolve();
                    return;
                }

                // Load SDK
                const script = document.createElement('script');
                script.src = 'https://player.vimeo.com/api/player.js';
                script.async = true;
                script.onload = () => {
                    if (this.options.debug) {
                        console.log('🎬 Vimeo SDK loaded');
                    }
                    resolve();
                };
                script.onerror = () => reject(new Error('Failed to load Vimeo SDK'));
                document.head.appendChild(script);
            });
        }

        /**
         * Create Vimeo player
         */
        createVimeoPlayer() {
            // Create container for Vimeo player
            this.vimeoContainer = document.createElement('div');
            this.vimeoContainer.className = 'vimeo-player-container';

            // Add CSS to ensure iframe fills container properly
            const style = document.createElement('style');
            style.textContent = `
                .vimeo-player-container {
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    z-index: 1 !important;
                }
                .vimeo-player-container iframe {
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    border: none !important;
                }
            `;
            if (!document.querySelector('#vimeo-plugin-styles')) {
                style.id = 'vimeo-plugin-styles';
                document.head.appendChild(style);
            }

            this.player.container.appendChild(this.vimeoContainer);

            // Prevent default Vimeo click behavior and sync with MYETV
            this.vimeoContainer.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Toggle play/pause through MYETV player
                if (this.player.video) {
                    this.vimeoPlayer.getPaused().then(paused => {
                        if (paused) {
                            this.player.video.play();
                        } else {
                            this.player.video.pause();
                        }
                    });
                }
            });

            // Prepare Vimeo options
            const vimeoOptions = this.prepareVimeoOptions();

            // Create Vimeo Player instance
            this.vimeoPlayer = new Vimeo.Player(this.vimeoContainer, vimeoOptions);

            // Setup event listeners
            this.setupEventListeners();

            //create overlay for mouse detection
            this.createMouseMoveOverlay();

            // Load available qualities
            this.loadQualities();

            // Override native methods
            this.overrideNativeMethods();

            // Sync with native controls
            this.syncWithNativeControls();

            this.isVimeoLoaded = true;

            if (this.options.debug) {
                console.log('🎬 Vimeo player created');
            }
        }

        /**
         * Prepare Vimeo options object
         */
        prepareVimeoOptions() {
            const vimeoOptions = {};

            // Set video source
            if (this.options.videoUrl) {
                vimeoOptions.url = this.extractVimeoUrl(this.options.videoUrl);
            } else if (this.options.videoId) {
                vimeoOptions.id = this.extractVimeoId(this.options.videoId);
            }

            // Set dimensions
            if (this.options.width) vimeoOptions.width = this.options.width;
            if (this.options.height) vimeoOptions.height = this.options.height;

            // Set embed options - FORCE controls to false
            if (this.options.autopause !== undefined) vimeoOptions.autopause = this.options.autopause;
            if (this.options.autoplay) vimeoOptions.autoplay = this.options.autoplay;
            if (this.options.background) vimeoOptions.background = this.options.background;
            if (this.options.byline !== undefined) vimeoOptions.byline = this.options.byline;
            if (this.options.color) vimeoOptions.color = this.options.color;

            vimeoOptions.controls = false; // ALWAYS FALSE - use MYETV controls

            if (this.options.dnt) vimeoOptions.dnt = this.options.dnt;
            if (this.options.loop) vimeoOptions.loop = this.options.loop;
            if (this.options.muted) vimeoOptions.muted = this.options.muted;
            if (this.options.playsinline !== undefined) vimeoOptions.playsinline = this.options.playsinline;
            if (this.options.portrait !== undefined) vimeoOptions.portrait = this.options.portrait;
            if (this.options.quality && this.options.quality !== 'auto') vimeoOptions.quality = this.options.quality;
            if (this.options.responsive) vimeoOptions.responsive = this.options.responsive;
            if (this.options.speed) vimeoOptions.speed = this.options.speed;
            if (this.options.texttrack) vimeoOptions.texttrack = this.options.texttrack;
            if (this.options.title !== undefined) vimeoOptions.title = this.options.title;
            if (this.options.transparent) vimeoOptions.transparent = this.options.transparent;

            return vimeoOptions;
        }

        /**
         * Extract Vimeo ID from various formats
         */
        extractVimeoId(input) {
            if (typeof input === 'number') return input;

            const match = input.match(/vimeo\.com\/(\d+)/);
            if (match) return parseInt(match[1]);

            const parsed = parseInt(input);
            if (!isNaN(parsed)) return parsed;

            return input;
        }

        /**
         * Extract full Vimeo URL
         */
        extractVimeoUrl(input) {
            if (input.startsWith('http')) return input;
            return `https://vimeo.com/${input}`;
        }

        /**
         * Setup event listeners
         */
        setupEventListeners() {
            // Play event
            this.vimeoPlayer.on('play', (data) => {
                this.player.triggerEvent('play', data);
                if (this.options.debug) {
                    console.log('🎬 Vimeo: play', data);
                }
            });

            // Pause event
            this.vimeoPlayer.on('pause', (data) => {
                this.player.triggerEvent('pause', data);
                if (this.options.debug) {
                    console.log('🎬 Vimeo: pause', data);
                }
            });

            // Ended event
            this.vimeoPlayer.on('ended', (data) => {
                this.player.triggerEvent('ended', data);
                if (this.options.debug) {
                    console.log('🎬 Vimeo: ended', data);
                }
            });

            // Time update event
            this.vimeoPlayer.on('timeupdate', (data) => {
                this.player.triggerEvent('timeupdate', {
                    currentTime: data.seconds,
                    duration: data.duration,
                    percent: data.percent
                });
            });

            // Volume change event
            this.vimeoPlayer.on('volumechange', (data) => {
                this.player.triggerEvent('volumechange', data);
            });

            // Playback rate change event
            this.vimeoPlayer.on('playbackratechange', (data) => {
                this.player.triggerEvent('playbackratechange', data);
            });

            // Buffer events
            this.vimeoPlayer.on('bufferstart', () => {
                this.player.triggerEvent('waiting');
                if (this.options.debug) {
                    console.log('🎬 Vimeo: bufferstart');
                }
            });

            this.vimeoPlayer.on('bufferend', () => {
                this.player.triggerEvent('canplay');
                if (this.options.debug) {
                    console.log('🎬 Vimeo: bufferend');
                }
            });

            // Quality change event
            this.vimeoPlayer.on('qualitychange', (data) => {
                this.player.triggerEvent('qualitychange', data);
                if (this.options.debug) {
                    console.log('🎬 Vimeo: quality changed to', data.quality);
                }
            });

            // Loaded event
            this.vimeoPlayer.on('loaded', (data) => {
                this.player.triggerEvent('loadedmetadata', data);
                if (this.options.debug) {
                    console.log('🎬 Vimeo: loaded', data);
                }
            });

            // Error event
            this.vimeoPlayer.on('error', (data) => {
                console.error('🎬 Vimeo error:', data);
                this.player.triggerEvent('error', data);
            });
        }

        /**
 * Create transparent overlay for click detection
 */
        createMouseMoveOverlay() {
            if (this.mouseMoveOverlay) return;

            this.mouseMoveOverlay = document.createElement('div');
            this.mouseMoveOverlay.className = 'vimeo-mousemove-overlay';
            this.mouseMoveOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
        background: transparent;
        pointer-events: auto;
        cursor: pointer;
    `;

            // Insert before controls
            this.player.container.insertBefore(this.mouseMoveOverlay, this.player.controls);

            // Setup mouse detection
            this.setupMouseMoveDetection();

            // Click handler for play/pause
            this.mouseMoveOverlay.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const doubleTap = this.player.options.doubleTapPause;
                const pauseClick = this.player.options.pauseClick;

                if (doubleTap) {
                    // Check if controls are hidden
                    let controlsHidden = false;
                    if (this.player.controls) {
                        controlsHidden = this.player.controls.classList.contains('hide');
                    }

                    if (!controlsHidden) {
                        const controls = this.player.container.querySelector('.controls');
                        if (controls) {
                            controlsHidden = controls.classList.contains('hide');
                        }
                    }

                    if (!controlsHidden && this.player.controls) {
                        const style = window.getComputedStyle(this.player.controls);
                        controlsHidden = (style.opacity === '0' || style.visibility === 'hidden');
                    }

                    if (controlsHidden) {
                        // Show controls
                        if (this.player.showControlsNow) {
                            this.player.showControlsNow();
                        }
                        if (this.player.resetAutoHideTimer) {
                            this.player.resetAutoHideTimer();
                        }
                        return;
                    }

                    this.togglePlayPause();
                } else if (pauseClick) {
                    this.togglePlayPause();
                }
            });

            // Mouse move handler
            this.mouseMoveOverlay.addEventListener('mousemove', (e) => {
                if (this.player.onMouseMove) {
                    this.player.onMouseMove(e);
                }
                if (this.player.resetAutoHideTimer) {
                    this.player.resetAutoHideTimer();
                }
            });

            if (this.options.debug) {
                console.log('[Vimeo] Mouse overlay created');
            }
        }

        /**
         * Setup mouse move detection
         */
        setupMouseMoveDetection() {
            // Track last mouse position
            this.lastMouseX = null;
            this.lastMouseY = null;
            this.mouseCheckInterval = null;

            // Mouse enter
            this.player.container.addEventListener('mouseenter', () => {
                if (this.options.debug) {
                    console.log('[Vimeo] Mouse entered - show controls');
                }
                if (this.player.showControlsNow) {
                    this.player.showControlsNow();
                }
                if (this.player.resetAutoHideTimer) {
                    this.player.resetAutoHideTimer();
                }
                this.startMousePositionTracking();
            });

            // Mouse leave
            this.player.container.addEventListener('mouseleave', () => {
                if (this.options.debug) {
                    console.log('[Vimeo] Mouse left');
                }
                this.stopMousePositionTracking();
            });

            // Mouse move
            this.player.container.addEventListener('mousemove', (e) => {
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                if (this.player.onMouseMove) {
                    this.player.onMouseMove(e);
                }
                if (this.player.resetAutoHideTimer) {
                    this.player.resetAutoHideTimer();
                }
            });
        }

        /**
         * Start mouse position tracking
         */
        startMousePositionTracking() {
            if (this.mouseCheckInterval) return;

            this.mouseCheckInterval = setInterval(() => {
                // Track mouse position over iframe
                const handleGlobalMove = (e) => {
                    const newX = e.clientX;
                    const newY = e.clientY;

                    if (this.lastMouseX !== newX || this.lastMouseY !== newY) {
                        this.lastMouseX = newX;
                        this.lastMouseY = newY;

                        const rect = this.player.container.getBoundingClientRect();
                        const isInside = (
                            newX >= rect.left &&
                            newX <= rect.right &&
                            newY >= rect.top &&
                            newY <= rect.bottom
                        );

                        if (isInside) {
                            if (this.player.showControlsNow) {
                                this.player.showControlsNow();
                            }
                            if (this.player.resetAutoHideTimer) {
                                this.player.resetAutoHideTimer();
                            }
                        }
                    }
                };

                document.addEventListener('mousemove', handleGlobalMove, { once: true, passive: true });
            }, 100);
        }

        /**
         * Stop mouse position tracking
         */
        stopMousePositionTracking() {
            if (this.mouseCheckInterval) {
                clearInterval(this.mouseCheckInterval);
                this.mouseCheckInterval = null;
            }
        }

        /**
        * Toggle play/pause
        */
        togglePlayPause() {
            if (!this.vimeoPlayer) return;

            this.vimeoPlayer.getPaused().then(paused => {
                if (paused) {
                    // Use player's play method to trigger UI update
                    if (this.player.play) {
                        this.player.play();
                    } else if (this.player.video && this.player.video.play) {
                        this.player.video.play();
                    }
                } else {
                    // Use player's pause method to trigger UI update
                    if (this.player.pause) {
                        this.player.pause();
                    } else if (this.player.video && this.player.video.pause) {
                        this.player.video.pause();
                    }
                }
            }).catch(err => {
                if (this.options.debug) {
                    console.error('[Vimeo] GetPaused error:', err);
                }
            });
        }

        /**
         * Remove mouse overlay
         */
        removeMouseMoveOverlay() {
            if (this.mouseMoveOverlay) {
                this.mouseMoveOverlay.remove();
                this.mouseMoveOverlay = null;
            }
            this.stopMousePositionTracking();
        }

        /**
         * Load available qualities and sync with MYETV player
         */
        loadQualities() {
            this.vimeoPlayer.getQualities().then(qualities => {
                this.availableQualities = qualities;

                if (this.options.debug) {
                    console.log('🎬 Vimeo: Raw qualities from API:', qualities);
                }

                // Inject fake qualities into player.qualities array
                this.player.qualities = qualities.map(q => ({
                    src: '',
                    quality: q,
                    height: this.parseQualityHeight(q),
                    type: 'video/vimeo'
                }));

                // Add AUTO at the beginning
                this.player.qualities.unshift({
                    src: '',
                    quality: 'auto',
                    height: 9999,
                    type: 'video/vimeo'
                });

                // Set selected quality
                this.player.selectedQuality = 'auto';

                if (this.options.debug) {
                    console.log('🎬 Vimeo: player.qualities set:', this.player.qualities);
                    console.log('🎬 Vimeo: qualities length:', this.player.qualities.length);
                }

                // Force update quality button and menu using native methods
                if (typeof this.player.updateQualityButton === 'function') {
                    this.player.updateQualityButton();
                }

                if (typeof this.player.updateQualityMenu === 'function') {
                    this.player.updateQualityMenu();
                }

                // Wait a bit then populate with Vimeo-specific options
                setTimeout(() => {
                    this.updatePlayerQualityMenu();
                }, 300);

                // Trigger event
                this.player.triggerEvent('qualitiesloaded', { qualities });

                // Set initial quality
                if (this.options.quality && this.options.quality !== 'auto') {
                    this.setQuality(this.options.quality);
                }

            }).catch(error => {
                if (this.options.debug) {
                    console.warn('🎬 Vimeo: Could not load qualities', error);
                }
            });
        }

        /**
 * Update native player quality menu with Vimeo-specific handlers
 */
        updatePlayerQualityMenu() {
            const qualityMenu = this.player.container.querySelector('.quality-menu');
            if (!qualityMenu) {
                if (this.options.debug) {
                    console.warn('🎬 Vimeo: Quality menu not found');
                }
                return;
            }

            // Clear and repopulate with Vimeo click handlers
            qualityMenu.innerHTML = '';

            // Add Auto option
            const autoOption = document.createElement('div');
            autoOption.className = 'quality-option active';
            autoOption.setAttribute('data-quality', 'auto');
            autoOption.textContent = 'Auto';
            autoOption.addEventListener('click', () => {
                this.handleQualityClick('auto');
            });
            qualityMenu.appendChild(autoOption);

            // Add Vimeo qualities
            this.availableQualities.forEach(quality => {
                const option = document.createElement('div');
                option.className = 'quality-option';
                option.setAttribute('data-quality', quality);
                option.textContent = quality;
                option.addEventListener('click', () => {
                    this.handleQualityClick(quality);
                });
                qualityMenu.appendChild(option);
            });

            if (this.options.debug) {
                console.log('🎬 Vimeo: Quality menu updated');
            }
        }

        /**
         * Update native player quality menu with Vimeo qualities
         */
        updatePlayerQualityMenu() {
            setTimeout(() => {
                const qualityMenu = this.player.container.querySelector('.quality-menu');
                if (!qualityMenu) {
                    if (this.options.debug) {
                        console.warn('🎬 Vimeo: Quality menu not found in DOM');
                    }
                    return;
                }

                // Clear existing
                qualityMenu.innerHTML = '';

                // Add Auto option
                const autoOption = document.createElement('div');
                autoOption.className = 'quality-option active';
                autoOption.setAttribute('data-quality', 'auto');
                autoOption.textContent = 'Auto';
                autoOption.addEventListener('click', () => {
                    this.handleQualityClick('auto');
                });
                qualityMenu.appendChild(autoOption);

                // Add Vimeo qualities
                this.availableQualities.forEach(quality => {
                    const option = document.createElement('div');
                    option.className = 'quality-option';
                    option.setAttribute('data-quality', quality);
                    option.textContent = quality;
                    option.addEventListener('click', () => {
                        this.handleQualityClick(quality);
                    });
                    qualityMenu.appendChild(option);
                });

                if (this.options.debug) {
                    console.log('🎬 Vimeo: Quality menu populated');
                }
            }, 300);
        }

        /**
         * Handle quality menu click
         */
        handleQualityClick(quality) {
            // Update active class
            const qualityMenu = this.player.container.querySelector('.quality-menu');
            if (qualityMenu) {
                qualityMenu.querySelectorAll('.quality-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                const selected = qualityMenu.querySelector(`[data-quality="${quality}"]`);
                if (selected) {
                    selected.classList.add('active');
                }
            }

            // Update button label
            const qualityBtn = this.player.container.querySelector('.quality-btn span');
            if (qualityBtn) {
                qualityBtn.textContent = quality === 'auto' ? 'Auto' : quality;
            }

            // Set quality
            this.setQuality(quality).then(() => {
                // Close menu
                if (qualityMenu) {
                    qualityMenu.classList.remove('show');
                }
            });
        }

        /**
         * Parse quality string to height number
         */
        parseQualityHeight(quality) {
            if (!quality) return 0;
            const match = quality.match(/(\d+)p/);
            return match ? parseInt(match[1]) : 0;
        }

        /**
         * Set quality
         */
        setQuality(quality) {
            if (!this.vimeoPlayer) return Promise.reject('Player not initialized');

            return this.vimeoPlayer.setQuality(quality).then(selectedQuality => {
                if (this.options.debug) {
                    console.log('🎬 Vimeo: Quality set to', selectedQuality);
                }
                return selectedQuality;
            }).catch(error => {
                console.error('🎬 Vimeo: Failed to set quality', error);
                throw error;
            });
        }

        /**
         * Get available qualities
         */
        getQualities() {
            return this.availableQualities;
        }

        /**
         * Get current quality
         */
        getCurrentQuality() {
            return this.vimeoPlayer.getQuality();
        }

        /**
         * Hide native player
         */
        hideNativePlayer() {
            if (this.player.video) {
                this.player.video.style.opacity = '0';
                this.player.video.style.pointerEvents = 'none';
            }
        }

        /**
         * Override native video element methods to control Vimeo player
         */
        overrideNativeMethods() {
            if (!this.player.video) return;

            const video = this.player.video;
            const vimeoPlayer = this.vimeoPlayer;
            const self = this;

            // Override play method
            video._originalPlay = video.play;
            video.play = function () {
                vimeoPlayer.play().catch(err => {
                    if (self.options.debug) {
                        console.error('Play error:', err);
                    }
                });
                return Promise.resolve();
            };

            // Override pause method
            video._originalPause = video.pause;
            video.pause = function () {
                vimeoPlayer.pause().catch(err => {
                    if (self.options.debug) {
                        console.error('Pause error:', err);
                    }
                });
            };

            // Initialize cached values
            video._cachedCurrentTime = 0;
            video._cachedVolume = 1;
            video._cachedMuted = false;
            video._cachedPlaybackRate = 1;
            video._cachedDuration = 0;
            video._cachedPaused = true;

            // Override properties
            Object.defineProperties(video, {
                currentTime: {
                    get: function () {
                        return this._cachedCurrentTime || 0;
                    },
                    set: function (time) {
                        vimeoPlayer.setCurrentTime(time).catch(err => {
                            if (self.options.debug) {
                                console.error('Seek error:', err);
                            }
                        });
                    },
                    configurable: true
                },
                volume: {
                    get: function () {
                        return this._cachedVolume || 1;
                    },
                    set: function (volume) {
                        vimeoPlayer.setVolume(volume).catch(err => {
                            if (self.options.debug) {
                                console.error('Volume error:', err);
                            }
                        });
                    },
                    configurable: true
                },
                muted: {
                    get: function () {
                        return this._cachedMuted || false;
                    },
                    set: function (muted) {
                        vimeoPlayer.setMuted(muted).catch(err => {
                            if (self.options.debug) {
                                console.error('Mute error:', err);
                            }
                        });
                    },
                    configurable: true
                },
                playbackRate: {
                    get: function () {
                        return this._cachedPlaybackRate || 1;
                    },
                    set: function (rate) {
                        vimeoPlayer.setPlaybackRate(rate).catch(err => {
                            if (self.options.debug) {
                                console.error('Speed error:', err);
                            }
                        });
                    },
                    configurable: true
                },
                duration: {
                    get: function () {
                        return this._cachedDuration || 0;
                    },
                    configurable: true
                },
                paused: {
                    get: function () {
                        return this._cachedPaused !== false;
                    },
                    configurable: true
                }
            });

            if (this.options.debug) {
                console.log('🎬 Vimeo: Native methods overridden');
            }
        }

        /**
         * Sync with native player controls
         */
        syncWithNativeControls() {
            if (!this.player.video) return;

            const video = this.player.video;

            // Update cached properties from Vimeo events
            this.vimeoPlayer.on('timeupdate', (data) => {
                video._cachedCurrentTime = data.seconds;
                video._cachedDuration = data.duration;

                const event = new Event('timeupdate');
                video.dispatchEvent(event);
            });

            this.vimeoPlayer.on('play', () => {
                video._cachedPaused = false;

                if (this.player.elements && this.player.elements.loading) {
                    this.player.elements.loading.style.display = 'none';
                }

                const event = new Event('play');
                video.dispatchEvent(event);
            });

            this.vimeoPlayer.on('playing', () => {
                video._cachedPaused = false;

                if (this.player.elements && this.player.elements.loading) {
                    this.player.elements.loading.style.display = 'none';
                }

                const event = new Event('playing');
                video.dispatchEvent(event);
            });

            this.vimeoPlayer.on('pause', () => {
                video._cachedPaused = true;

                const event = new Event('pause');
                video.dispatchEvent(event);
            });

            this.vimeoPlayer.on('volumechange', (data) => {
                video._cachedVolume = data.volume;

                const event = new Event('volumechange');
                video.dispatchEvent(event);
            });

            this.vimeoPlayer.on('playbackratechange', (data) => {
                video._cachedPlaybackRate = data.playbackRate;

                const event = new Event('ratechange');
                video.dispatchEvent(event);
            });

            this.vimeoPlayer.on('loaded', (data) => {
                video._cachedDuration = data.duration;

                if (this.player.elements && this.player.elements.loading) {
                    this.player.elements.loading.style.display = 'none';
                }

                const event = new Event('loadedmetadata');
                video.dispatchEvent(event);
            });

            this.vimeoPlayer.on('ended', () => {
                video._cachedPaused = true;

                const event = new Event('ended');
                video.dispatchEvent(event);
            });

            // Get initial values
            this.vimeoPlayer.getDuration().then(duration => {
                video._cachedDuration = duration;
            });

            this.vimeoPlayer.getVolume().then(volume => {
                video._cachedVolume = volume;
            });

            this.vimeoPlayer.getPlaybackRate().then(rate => {
                video._cachedPlaybackRate = rate;
            });

            this.vimeoPlayer.getPaused().then(paused => {
                video._cachedPaused = paused;
            });

            if (this.options.debug) {
                console.log('🎬 Vimeo: Synced with native controls');
            }
        }

        /**
         * Play video
         */
        play() {
            if (!this.vimeoPlayer) return Promise.reject('Player not initialized');
            return this.vimeoPlayer.play();
        }

        /**
         * Pause video
         */
        pause() {
            if (!this.vimeoPlayer) return Promise.reject('Player not initialized');
            return this.vimeoPlayer.pause();
        }

        /**
         * Load new video
         */
        loadVideo(videoIdOrUrl) {
            if (!this.vimeoPlayer) return Promise.reject('Player not initialized');

            const videoId = this.extractVimeoId(videoIdOrUrl);

            return this.vimeoPlayer.loadVideo(videoId).then(id => {
                if (this.options.debug) {
                    console.log('🎬 Vimeo: Video loaded', id);
                }
                this.loadQualities();
                return id;
            }).catch(error => {
                console.error('🎬 Vimeo: Failed to load video', error);
                throw error;
            });
        }

        /**
         * Dispose plugin
         */
        dispose() {
            this.removeMouseMoveOverlay();

            // Cleanup PIP observers and listeners
            if (this.pipObserver) {
                this.pipObserver.disconnect();
            }

            if (this.pipCleanup) {
                this.pipCleanup();
            }

            if (this.vimeoPlayer) {
                this.vimeoPlayer.destroy().then(() => {
                    if (this.options.debug) {
                        console.log('🎬 Vimeo player destroyed');
                    }
                });
            }

            if (this.vimeoContainer) {
                this.vimeoContainer.remove();
            }

            // Restore native player
            if (this.player.video && this.options.replaceNativePlayer) {
                this.player.video.style.opacity = '1';
                this.player.video.style.pointerEvents = 'auto';
            }

            if (this.options.debug) {
                console.log('🎬 Vimeo Plugin disposed');
            }
        }
    }

    // Register plugin globally
    if (typeof window.registerMYETVPlugin === 'function') {
        window.registerMYETVPlugin('vimeo', VimeoPlugin);
    }
})();
/* GLOBAL_END */