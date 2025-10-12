/**
 * MYETV Player - Facebook Plugin
 * File: myetv-player-facebook-plugin.js  
 * Integrates Facebook videos with full API control
 * Created by https://www.myetv.tv https://oskarcosimo.com
 */

(function () {
    'use strict';

    class FacebookPlugin {
        constructor(player, options = {}) {
            this.player = player;
            this.options = {
                // Facebook App ID (required for API features)
                appId: options.appId || null,
                // Video source (Facebook video URL or ID)
                videoUrl: options.videoUrl || null,
                videoId: options.videoId || null,
                // Embed options
                width: options.width || 500,
                autoplay: options.autoplay || false,
                allowFullscreen: options.allowFullscreen !== false,
                showText: options.showText !== false,
                showCaptions: options.showCaptions !== false,
                // Plugin options
                debug: options.debug || false,
                replaceNativePlayer: options.replaceNativePlayer !== false,
                autoLoadFromData: options.autoLoadFromData !== false,
                ...options
            };

            this.fbPlayer = null;
            this.fbContainer = null;
            this.isFBSDKLoaded = false;
            this.isPlayerReady = false;
            this.mouseMoveOverlay = null;
            this.timeUpdateInterval = null;
            this.isPlaying = false;

            // Get plugin API (same as YouTube)
            this.api = player.getPluginAPI ? player.getPluginAPI() : {
                player: player,
                video: player.video,
                container: player.container,
                controls: player.controls,
                debug: (msg) => {
                    if (this.options.debug) console.log('📘 Facebook Plugin:', msg);
                },
                triggerEvent: (event, data) => player.triggerEvent(event, data),
                registerHook: (hookName, callback) => {
                    if (player.registerHook) {
                        player.registerHook(hookName, callback);
                    } else if (player.hooks && player.hooks[hookName]) {
                        player.hooks[hookName].push(callback);
                    }
                }
            };

            if (!this.options.appId) {
                console.warn('📘 Facebook Plugin: appId is recommended for full API features');
            }
        }

        /**
         * Setup plugin (EXACTLY like YouTube)
         */
        setup() {
            if (this.api.player.options.debug) {
                console.log('FB Plugin: Setup started');
            }

            // Load Facebook SDK
            this.loadFacebookSDK();

            // Add player methods (like YouTube)
            this.addPlayerMethods();

            // Register hooks (like YouTube)
            this.registerHooks();

            // Auto-detect video URL
            if (this.options.autoLoadFromData) {
                this.autoDetectVideoUrl();
            }

            // If we have a video, wait for SDK then load
            if (this.options.videoUrl || this.options.videoId) {
                this.waitForSDKThenLoad();
            }

            if (this.api.player.options.debug) {
                console.log('FB Plugin: Setup completed');
            }
        }

        /**
         * Add player methods (like YouTube)
         */
        addPlayerMethods() {
            this.player.loadFacebookVideo = (videoUrl, options = {}) => this.loadVideo(videoUrl, options);
            this.player.getFacebookVideoUrl = () => this.options.videoUrl;
            this.player.isFacebookActive = () => this.fbPlayer !== null;
        }

        /**
         * Register hooks (like YouTube)
         */
        registerHooks() {
            this.api.registerHook('beforePlay', (data) => {
                return this.checkForFacebookUrl();
            });
        }

        /**
         * Auto-detect video URL
         */
        autoDetectVideoUrl() {
            // Priority 1: Check data attributes
            const dataVideoUrl = this.api.video.getAttribute('data-video-url');
            const dataVideoType = this.api.video.getAttribute('data-video-type');
            if (dataVideoUrl && dataVideoType === 'facebook') {
                this.options.videoUrl = dataVideoUrl;
                if (this.api.player.options.debug) {
                    console.log('FB Plugin: Video URL from data-video-url:', this.options.videoUrl);
                }
                return;
            }

            // Priority 2: Check video src
            const src = this.api.video.src || this.api.video.currentSrc;
            if (src) {
                const extractedUrl = this.extractFacebookVideoUrl(src);
                if (extractedUrl) {
                    this.options.videoUrl = extractedUrl;
                    if (this.api.player.options.debug) {
                        console.log('FB Plugin: Video URL from src:', this.options.videoUrl);
                    }
                    return;
                }
            }

            // Priority 3: Check source elements
            const sources = this.api.video.querySelectorAll('source');
            for (const source of sources) {
                const sourceSrc = source.getAttribute('src');
                const sourceType = source.getAttribute('type');
                if ((sourceType === 'video/facebook' || this.isFacebookUrl(sourceSrc)) && sourceSrc) {
                    this.options.videoUrl = sourceSrc;
                    if (this.api.player.options.debug) {
                        console.log('FB Plugin: Video URL from source:', this.options.videoUrl);
                    }
                    return;
                }
            }
        }

        /**
         * Wait for SDK then load
         */
        waitForSDKThenLoad() {
            if (this.api.player.options.debug) {
                console.log('FB Plugin: Waiting for Facebook SDK...');
            }

            const checkAndLoad = () => {
                if (window.FB && window.FB.init && this.isFBSDKLoaded) {
                    if (this.api.player.options.debug) {
                        console.log('FB Plugin: SDK confirmed ready, loading video');
                    }
                    this.loadVideo(this.options.videoUrl || this.options.videoId);
                } else {
                    if (this.api.player.options.debug) {
                        console.log('FB Plugin: SDK not ready, retrying in 100ms...');
                    }
                    setTimeout(checkAndLoad, 100);
                }
            };
            checkAndLoad();
        }

        /**
         * Check for Facebook URL (like YouTube)
         */
        checkForFacebookUrl() {
            const src = this.api.video.src || this.api.video.currentSrc;
            const videoUrl = this.extractFacebookVideoUrl(src);
            if (videoUrl && videoUrl !== this.options.videoUrl) {
                this.loadVideo(videoUrl);
                return true;
            }
            return false;
        }

        /**
         * Extract Facebook video URL
         */
        extractFacebookVideoUrl(url) {
            if (!url) return null;
            url = url.trim();

            const patterns = [
                /facebook\.com\/.*\/videos\/(\d+)/,
                /facebook\.com\/watch\/?\?v=(\d+)/,
                /facebook\.com\/video\.php\?v=(\d+)/,
                /fb\.watch\/([a-zA-Z0-9_-]+)/
            ];

            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match && match[1]) {
                    return url;
                }
            }
            return null;
        }

        /**
         * Check if URL is a Facebook video URL
         */
        isFacebookUrl(url) {
            if (!url) return false;
            return /facebook\.com\/(.*\/)?videos?\//.test(url) || /fb\.watch\//.test(url);
        }

        /**
         * Load Facebook SDK
         */
        loadFacebookSDK() {
            if (window.FB && window.FB.init) {
                this.isFBSDKLoaded = true;
                if (this.api.player.options.debug) {
                    console.log('FB Plugin: Facebook SDK already loaded');
                }
                return;
            }

            window.fbAsyncInit = () => {
                this.initializeFBSDK();
                this.isFBSDKLoaded = true;
                if (this.api.player.options.debug) {
                    console.log('FB Plugin: Facebook SDK loaded and ready');
                }
                this.api.triggerEvent('facebookplugin:ready', {});
            };

            const script = document.createElement('script');
            script.src = 'https://connect.facebook.net/en_US/sdk.js';
            script.async = true;
            script.defer = true;

            if (!document.getElementById('fb-root')) {
                const fbRoot = document.createElement('div');
                fbRoot.id = 'fb-root';
                document.body.insertBefore(fbRoot, document.body.firstChild);
            }

            document.head.appendChild(script);
        }

        /**
         * Initialize Facebook SDK
         */
        initializeFBSDK() {
            const config = {
                xfbml: true,
                version: 'v18.0'
            };

            if (this.options.appId) {
                config.appId = this.options.appId;
            }

            FB.init(config);

            // Listen for video player ready
            FB.Event.subscribe('xfbml.ready', (msg) => {
                if (msg.type === 'video') {
                    this.fbPlayer = msg.instance;
                    this.isPlayerReady = true;
                    this.onPlayerReady();
                    if (this.api.player.options.debug) {
                        console.log('FB Plugin: Facebook player ready');
                    }
                    this.api.triggerEvent('facebookplugin:playerready', {});
                }
            });
        }

        /**
         * Load Facebook video
         */
        loadVideo(videoInput, options = {}) {
            if (!videoInput) {
                if (this.api.player.options.debug) {
                    console.error('FB Plugin: No video URL or ID provided');
                }
                return;
            }

            if (!this.isFBSDKLoaded) {
                if (this.api.player.options.debug) {
                    console.log('FB Plugin: Waiting for SDK...');
                }
                setTimeout(() => this.loadVideo(videoInput, options), 100);
                return;
            }

            if (this.api.player.options.debug) {
                console.log('FB Plugin: Loading video:', videoInput);
            }

            // Determine video URL
            this.options.videoUrl = this.isFacebookUrl(videoInput) ?
                videoInput :
                `https://www.facebook.com/video.php?v=${videoInput}`;

            // Hide native video
            this.api.video.style.pointerEvents = 'none';

            // Hide overlays
            this.hidePosterOverlay();
            this.hideInitialLoading();
            this.hideLoadingOverlay();

            // Create Facebook container
            if (!this.fbContainer) {
                this.fbContainer = document.createElement('div');
                this.fbContainer.id = 'fb-player-' + Date.now();
                this.fbContainer.className = 'fb-player-container';
                this.fbContainer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:2;';

                // Ensure controls are above Facebook player
                if (this.api.controls) {
                    this.api.controls.style.zIndex = '10';
                    this.api.controls.style.pointerEvents = 'auto';
                }

                this.api.container.insertBefore(this.fbContainer, this.api.controls);
            } else {
                this.fbContainer.style.visibility = 'visible';
                this.fbContainer.style.opacity = '1';
            }

            // Create mouse overlay
            this.createMouseMoveOverlay();

            // Clear container
            this.fbContainer.innerHTML = '';

            // CRITICAL FIX: Calculate pixel dimensions instead of using percentages
            const containerWidth = this.fbContainer.clientWidth || this.api.container.clientWidth;
            const containerHeight = this.fbContainer.clientHeight || this.api.container.clientHeight;

            if (this.api.player.options.debug) {
                console.log('FB Plugin: Using dimensions:', containerWidth, '×', containerHeight);
            }

            // Create Facebook video element with PIXEL dimensions
            const fbVideo = document.createElement('div');
            fbVideo.className = 'fb-video';
            fbVideo.style.cssText = `position:absolute;top:0;left:0;width:${containerWidth}px;height:${containerHeight}px;`;

            fbVideo.setAttribute('data-href', this.options.videoUrl);
            fbVideo.setAttribute('data-width', containerWidth);  // CRITICAL: Use pixels, not percentage
            fbVideo.setAttribute('data-height', containerHeight); // CRITICAL: Use pixels, not percentage
            fbVideo.setAttribute('data-allowfullscreen', this.options.allowFullscreen);
            fbVideo.setAttribute('data-autoplay', this.options.autoplay);
            fbVideo.setAttribute('data-show-text', this.options.showText);
            fbVideo.setAttribute('data-show-captions', this.options.showCaptions);

            this.fbContainer.appendChild(fbVideo);

            // Parse XFBML with proper timeout and styling
            if (window.FB && window.FB.XFBML) {
                FB.XFBML.parse(this.fbContainer);

                // CRITICAL FIX: Force styling after parse with proper delay
                setTimeout(() => {
                    if (this.api.player.options.debug) {
                        console.log('FB Plugin: Applying final styling...');
                    }

                    // Global parse as backup
                    FB.XFBML.parse();

                    // Force span and iframe dimensions
                    const span = this.fbContainer.querySelector('span');
                    const iframe = this.fbContainer.querySelector('iframe');

                    if (span) {
                        span.style.cssText = `position:absolute;top:0;left:0;width:${containerWidth}px;height:${containerHeight}px;display:block;`;
                    }

                    if (iframe) {
                        iframe.style.cssText = `position:absolute;top:0;left:0;width:${containerWidth}px;height:${containerHeight}px;border:none;visibility:visible;`;
                    }

                    if (this.api.player.options.debug) {
                        console.log('FB Plugin: Styling applied to span:', !!span, 'iframe:', !!iframe);
                    }
                }, 1000);
            }

            if (this.options.autoplay && this.fbPlayer) {
                this.fbPlayer.play();
                // Video starts muted (Facebook autoplay policy)
                this.fbPlayer.mute();
                this.updateMuteUI(true);

                if (this.api.player.options.debug) {
                    console.log('FB Plugin: Autoplay started (muted per Facebook policy)');
                }
            }

            if (this.api.player.options.debug) {
                console.log('FB Plugin: Facebook player created');
            }
            this.api.triggerEvent('facebookplugin:videoloaded', { videoUrl: this.options.videoUrl });
        }

        /**
         * Player ready handler
         */
        onPlayerReady() {
            if (this.api.player.options.debug) {
                console.log('FB Plugin: Player ready event fired');
            }

            // Force visibility
            this.api.video.style.removeProperty('display');
            this.fbContainer.style.display = 'block';
            this.fbContainer.style.visibility = 'visible';
            this.fbContainer.style.opacity = '1';
            this.fbContainer.style.zIndex = '2';

            this.hideLoadingOverlay();
            this.hideInitialLoading();

            // Setup event listeners
            this.setupEventListeners();

            // Start time update
            this.startTimeUpdate();

            // Sync controls
            this.syncControls();

            // Setup speed and PiP controls
            this.setupSpeedAndPip();

            if (this.fbPlayer && this.fbPlayer.getVolume) {
                try {
                    const vol = this.fbPlayer.getVolume() || 1;
                    const percent = Math.round(vol * 100);
                    this.updateVolumeUI(percent);
                    this.updateMuteUI(vol === 0);
                } catch (error) {
                    if (this.api.player.options.debug) {
                        console.warn('FB Plugin: Could not get initial volume', error);
                    }
                }
            }

            this.api.triggerEvent('facebookplugin:playerready', {});
        }

        /**
         * CRITICAL: Setup speed menu and PiP button based on Facebook capabilities
         */
        setupSpeedAndPip() {
            if (this.api.player.options.debug) {
                console.log('FB Plugin: Setting up speed and PiP controls');
            }

            // SPEED MENU: Facebook doesn't support playback rate, so hide it
            const speedButton = this.api.container.querySelector('.speed-btn');
            const speedMenu = this.api.container.querySelector('.speed-menu');
            const speedControl = this.api.container.querySelector('.speed-control');

            if (speedButton) {
                speedButton.style.display = 'none';
                if (this.api.player.options.debug) {
                    console.log('FB Plugin: Speed button hidden (not supported by Facebook)');
                }
            }

            if (speedMenu) {
                speedMenu.style.display = 'none';
            }

            if (speedControl) {
                speedControl.style.display = 'none';
            }

            // PIP BUTTON: Facebook iframe doesn't support PiP, so hide it
            const pipButton = this.api.container.querySelector('.pip-btn');

            if (pipButton) {
                pipButton.style.display = 'none';
                if (this.api.player.options.debug) {
                    console.log('FB Plugin: PiP button hidden (not supported by Facebook iframe)');
                }
            }
        }

        /**
         * Create mouse move overlay (like YouTube)
         */
        createMouseMoveOverlay() {
            if (this.mouseMoveOverlay) return;

            this.mouseMoveOverlay = document.createElement('div');
            this.mouseMoveOverlay.className = 'fb-mousemove-overlay';
            this.mouseMoveOverlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:2;background:transparent;pointer-events:auto;cursor:default;';

            this.api.container.insertBefore(this.mouseMoveOverlay, this.api.controls);

            // Pass mousemove to core player
            this.mouseMoveOverlay.addEventListener('mousemove', (e) => {
                if (this.api.player.onMouseMove) {
                    this.api.player.onMouseMove(e);
                }
            });

            // Handle clicks
            this.mouseMoveOverlay.addEventListener('click', (e) => {
                const doubleTap = this.api.player.options.doubleTapPause;
                const pauseClick = this.api.player.options.pauseClick;

                if (doubleTap) {
                    let controlsHidden = false;
                    if (this.api.controls) {
                        controlsHidden = this.api.controls.classList.contains('hide');
                    }

                    if (!controlsHidden && this.api.controls) {
                        const style = window.getComputedStyle(this.api.controls);
                        controlsHidden = style.opacity === '0' || style.visibility === 'hidden';
                    }

                    if (controlsHidden) {
                        if (this.api.player.showControlsNow) {
                            this.api.player.showControlsNow();
                        }
                        if (this.api.player.resetAutoHideTimer) {
                            this.api.player.resetAutoHideTimer();
                        }
                        return;
                    }

                    this.togglePlayPause();
                } else if (pauseClick) {
                    this.togglePlayPause();
                }
            });
        }

        /**
         * Toggle play/pause
         */
        togglePlayPause() {
            if (!this.fbPlayer) return;

            try {
                if (this.isPlaying) {
                    this.fbPlayer.pause();
                } else {
                    this.fbPlayer.play();
                }
            } catch (error) {
                if (this.api.player.options.debug) {
                    console.error('FB Plugin: Error toggling play/pause:', error);
                }
            }
        }

        /**
         * CRITICAL: Setup event listeners with PROPER main player state sync
         */
        setupEventListeners() {
            if (!this.fbPlayer) return;

            // Started playing
            this.fbPlayer.subscribe('startedPlaying', () => {
                if (this.api.player.options.debug) {
                    console.log('FB Plugin: Video started playing');
                }
                this.isPlaying = true;

                // CRITICAL: Update play/pause icons DIRECTLY (no updatePlayPauseButton method exists)
                const playIcon = this.api.container.querySelector('.play-icon');
                const pauseIcon = this.api.container.querySelector('.pause-icon');
                if (playIcon) playIcon.classList.add('hidden');
                if (pauseIcon) pauseIcon.classList.remove('hidden');

                // CRITICAL: Trigger events using the correct event system
                this.api.triggerEvent('played', {
                    currentTime: this.getCurrentTime(),
                    duration: this.getDuration()
                });

                this.api.triggerEvent('play', {});
                this.api.triggerEvent('playing', {});
                this.hideLoadingOverlay();
            });

            // Paused - CRITICAL FIX for event triggering
            this.fbPlayer.subscribe('paused', () => {
                if (this.api.player.options.debug) {
                    console.log('FB Plugin: Video paused');
                }
                this.isPlaying = false;

                // CRITICAL: Update play/pause icons DIRECTLY
                const playIcon = this.api.container.querySelector('.play-icon');
                const pauseIcon = this.api.container.querySelector('.pause-icon');
                if (playIcon) playIcon.classList.remove('hidden');
                if (pauseIcon) pauseIcon.classList.add('hidden');

                // CRITICAL: Trigger 'paused' event (not 'pause') to match main player
                this.api.triggerEvent('paused', {
                    currentTime: this.getCurrentTime(),
                    duration: this.getDuration()
                });

                // Also trigger 'pause' for compatibility
                this.api.triggerEvent('pause', {});
            });

            // Finished playing
            this.fbPlayer.subscribe('finishedPlaying', () => {
                if (this.api.player.options.debug) {
                    console.log('FB Plugin: Video finished');
                }
                this.isPlaying = false;

                // Update play/pause icons
                const playIcon = this.api.container.querySelector('.play-icon');
                const pauseIcon = this.api.container.querySelector('.pause-icon');
                if (playIcon) playIcon.classList.remove('hidden');
                if (pauseIcon) pauseIcon.classList.add('hidden');

                this.api.triggerEvent('ended', {
                    currentTime: this.getCurrentTime(),
                    duration: this.getDuration()
                });
            });

            // Started buffering
            this.fbPlayer.subscribe('startedBuffering', () => {
                if (this.api.player.options.debug) {
                    console.log('FB Plugin: Video buffering started');
                }
                this.api.triggerEvent('waiting', {});
                this.showLoadingOverlay();
            });

            // Finished buffering
            this.fbPlayer.subscribe('finishedBuffering', () => {
                if (this.api.player.options.debug) {
                    console.log('FB Plugin: Video buffering finished');
                }
                this.api.triggerEvent('canplay', {});
                this.hideLoadingOverlay();
            });

            // Error
            this.fbPlayer.subscribe('error', (error) => {
                console.error('FB Plugin: Facebook player error:', error);
                this.api.triggerEvent('error', error);
                this.api.triggerEvent('facebookplugin:error', error);
            });

            if (this.api.player.options.debug) {
                console.log('FB Plugin: Event listeners setup completed');
            }
        }

        /**
         * Start time update interval
         */
        startTimeUpdate() {
            if (this.timeUpdateInterval) {
                clearInterval(this.timeUpdateInterval);
            }

            this.timeUpdateInterval = setInterval(() => {
                if (this.fbPlayer && this.fbPlayer.getCurrentPosition && this.fbPlayer.getDuration) {
                    try {
                        const currentTime = this.fbPlayer.getCurrentPosition;
                        const duration = this.fbPlayer.getDuration;

                        if (duration) {
                            const progress = (currentTime / duration) * 100;

                            // Update progress bar
                            if (this.api.player.progressFilled) {
                                this.api.player.progressFilled.style.width = progress + '%';
                            }
                            if (this.api.player.progressHandle) {
                                this.api.player.progressHandle.style.left = progress + '%';
                            }

                            // Update time display
                            const currentTimeEl = this.api.container.querySelector('.current-time');
                            const durationEl = this.api.container.querySelector('.duration');
                            if (currentTimeEl) {
                                currentTimeEl.textContent = this.formatTime(currentTime);
                            }
                            if (durationEl) {
                                durationEl.textContent = this.formatTime(duration);
                            }
                        }
                    } catch (error) {
                        // Ignore timing errors
                    }
                }
            }, 250);
        }

        /**
         * Format time
         */
        formatTime(seconds) {
            if (!seconds || isNaN(seconds)) return '0:00';

            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);

            if (hours > 0) {
                return hours + ':' + minutes.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0');
            } else {
                return minutes + ':' + secs.toString().padStart(2, '0');
            }
        }

        /**
         * Sync controls with PROPER override and volume handling
         */
        syncControls() {
            if (this.api.player.options.debug) {
                console.log('FB Plugin: Syncing controls');
            }

            // Store original methods before overriding
            if (!this.originalMethods) {
                this.originalMethods = {
                    play: this.player.play ? this.player.play.bind(this.player) : null,
                    pause: this.player.pause ? this.player.pause.bind(this.player) : null,
                    togglePlayPause: this.player.togglePlayPause ? this.player.togglePlayPause.bind(this.player) : null,
                    seek: this.player.seek ? this.player.seek.bind(this.player) : null,
                    setVolume: this.player.setVolume ? this.player.setVolume.bind(this.player) : null,
                    updateVolume: this.player.updateVolume ? this.player.updateVolume.bind(this.player) : null,
                    setMuted: this.player.setMuted ? this.player.setMuted.bind(this.player) : null,
                    toggleMute: this.player.toggleMute ? this.player.toggleMute.bind(this.player) : null
                };
            }

            // Override play method
            this.player.play = () => {
                if (this.fbPlayer) {
                    if (this.api.player.options.debug) {
                        console.log('📘 FB Plugin: Calling fbPlayer.play()');
                    }
                    this.fbPlayer.play();
                } else {
                    // fbPlayer not ready yet - wait with retry
                    if (this.api.player.options.debug) {
                        console.log('📘 FB Plugin: fbPlayer not ready, waiting...');
                    }

                    let attempts = 0;
                    const waitForPlayer = () => {
                        attempts++;
                        if (this.fbPlayer) {
                            if (this.api.player.options.debug) {
                                console.log('📘 FB Plugin: fbPlayer ready after', attempts, 'attempts');
                            }
                            this.fbPlayer.play();
                        } else if (attempts < 50) {
                            setTimeout(waitForPlayer, 100);
                        } else {
                            console.error('📘 FB Plugin: Timeout waiting for fbPlayer');
                            if (this.originalMethods.play) {
                                this.originalMethods.play();
                            }
                        }
                    };
                    waitForPlayer();
                }
            };

            // Override pause method
            this.player.pause = () => {
                if (this.fbPlayer) {
                    this.fbPlayer.pause();
                } else if (this.originalMethods.pause) {
                    this.originalMethods.pause();
                }
            };

            // Override togglePlayPause method
            this.player.togglePlayPause = () => {
                if (this.fbPlayer) {
                    this.togglePlayPause();
                } else if (this.originalMethods.togglePlayPause) {
                    this.originalMethods.togglePlayPause();
                }
            };

            // Override seek method - handles BOTH event and time
            this.player.seek = (eventOrTime) => {
                if (!this.fbPlayer || !this.fbPlayer.getDuration) {
                    if (this.originalMethods.seek) {
                        this.originalMethods.seek(eventOrTime);
                    }
                    return;
                }

                // Check if it's an event from progress bar (mouse or touch)
                if (eventOrTime && typeof eventOrTime === 'object') {
                    // It's a click/drag/touch event
                    const progContainer = this.api.container.querySelector('.progress-container');
                    if (progContainer) {
                        try {
                            const duration = this.fbPlayer.getDuration();
                            if (!duration || duration <= 0) {
                                if (this.api.player.options.debug) {
                                    console.warn('FB Plugin: Duration not available for seek');
                                }
                                return;
                            }

                            const rect = progContainer.getBoundingClientRect();

                            // Support both mouse and touch events
                            const clientX = eventOrTime.clientX !== undefined
                                ? eventOrTime.clientX
                                : (eventOrTime.touches && eventOrTime.touches[0])
                                    ? eventOrTime.touches[0].clientX
                                    : (eventOrTime.changedTouches && eventOrTime.changedTouches[0])
                                        ? eventOrTime.changedTouches[0].clientX
                                        : 0;

                            const clickX = clientX - rect.left;
                            const percentage = Math.max(0, Math.min(1, clickX / rect.width));
                            const seekTime = percentage * duration;

                            // Update UI immediately
                            const progress = percentage * 100;
                            if (this.api.player.progressFilled) {
                                this.api.player.progressFilled.style.width = progress + '%';
                            }
                            if (this.api.player.progressHandle) {
                                this.api.player.progressHandle.style.left = progress + '%';
                            }

                            // Perform seek
                            this.fbPlayer.seek(seekTime);

                            if (this.api.player.options.debug) {
                                console.log('FB Plugin: Seeked to', seekTime.toFixed(2), 's');
                            }
                        } catch (error) {
                            if (this.api.player.options.debug) {
                                console.error('FB Plugin: Seek error', error);
                            }
                        }
                    }
                } else if (typeof eventOrTime === 'number') {
                    // Direct time value
                    if (eventOrTime >= 0) {
                        this.fbPlayer.seek(eventOrTime);
                        if (this.api.player.options.debug) {
                            console.log('FB Plugin: Direct seek to', eventOrTime, 's');
                        }
                    }
                }

            };

            // Override volume methods
            this.player.setVolume = (volume) => {
                if (this.fbPlayer && this.fbPlayer.setVolume) {
                    const fbVolume = volume / 100;
                    this.fbPlayer.setVolume(fbVolume);

                    // Auto-unmute when user changes volume (this IS a valid user interaction)
                    if (volume > 0) {
                        this.fbPlayer.isMuted().then(isMuted => {
                            if (isMuted) {
                                this.fbPlayer.unmute();
                                this.updateMuteUI(false);
                            }
                        }).catch(() => { });
                    }

                    this.updateVolumeUI(volume);
                } else if (this.originalMethods.setVolume) {
                    this.originalMethods.setVolume(volume);
                }
            };

            this.player.updateVolume = (volume) => {
                if (this.fbPlayer && this.fbPlayer.setVolume) {
                    this.fbPlayer.setVolume(volume / 100);
                    this.updateVolumeUI(volume);
                } else if (this.originalMethods.updateVolume) {
                    this.originalMethods.updateVolume(volume);
                }
            };

            this.player.setMuted = (muted) => {
                if (this.fbPlayer) {
                    if (muted) {
                        this.fbPlayer.mute();
                    } else {
                        this.fbPlayer.unmute();
                    }
                    this.updateMuteUI(muted);
                } else if (this.originalMethods.setMuted) {
                    this.originalMethods.setMuted(muted);
                }
            };

            this.player.toggleMute = () => {
                if (this.fbPlayer && this.fbPlayer.isMuted) {
                    try {
                        const isMuted = this.fbPlayer.isMuted();
                        if (isMuted) {
                            this.fbPlayer.unmute();
                            this.updateMuteUI(false);
                        } else {
                            this.fbPlayer.mute();
                            this.updateMuteUI(true);
                        }

                        if (this.api.player.options.debug) {
                            console.log('FB Plugin: Mute toggled to', !isMuted);
                        }
                    } catch (error) {
                        if (this.api.player.options.debug) {
                            console.error('FB Plugin: Error toggling mute', error);
                        }
                    }
                } else if (this.originalMethods.toggleMute) {
                    this.originalMethods.toggleMute();
                }
            };
        }



        /**
         * Update volume UI when volume changes
         */
        updateVolumeUI(volume) {
            // Slider
            const volumeSlider = this.api.container.querySelector('.volume-slider');
            if (volumeSlider) volumeSlider.value = volume;

            // Progress bar fill
            const fill = this.api.container.querySelector('.volume-filled');
            if (fill) fill.style.width = volume + '%';

            // Update volume visual
            if (this.api.player.updateVolumeSliderVisual) {
                this.api.player.updateVolumeSliderVisual();
            }

            // Update CSS custom property
            if (this.api.container) {
                this.api.container.style.setProperty('--player-volume-fill', volume + '%');
            }

            // Update tooltip
            if (this.api.player.updateVolumeTooltip) {
                this.api.player.updateVolumeTooltip();
            }
        }

        /**
         * CRITICAL: Update mute UI when mute state changes
         */
        updateMuteUI(isMuted) {
            const volumeIcon = this.api.container.querySelector('.volume-icon');
            const muteIcon = this.api.container.querySelector('.mute-icon');

            if (isMuted) {
                if (volumeIcon) volumeIcon.classList.add('hidden');
                if (muteIcon) muteIcon.classList.remove('hidden');
            } else {
                if (volumeIcon) volumeIcon.classList.remove('hidden');
                if (muteIcon) muteIcon.classList.add('hidden');
            }
        }

        /**
         * Get current time from Facebook player
         */
        getCurrentTime() {
            if (!this.fbPlayer) return 0;
            try {
                return this.fbPlayer.getCurrentPosition || 0;
            } catch (error) {
                return 0;
            }
        }

        /**
         * Get duration from Facebook player
         */
        getDuration() {
            if (!this.fbPlayer) return 0;
            try {
                return this.fbPlayer.getDuration || 0;
            } catch (error) {
                return 0;
            }
        }

        /**
         * Hide overlays
         */
        hidePosterOverlay() {
            const posterOverlay = this.api.container.querySelector('.video-poster-overlay');
            if (posterOverlay) {
                posterOverlay.classList.add('hidden');
                posterOverlay.classList.remove('visible');
            }
        }

        hideInitialLoading() {
            const initialLoading = this.api.container.querySelector('.initial-loading');
            if (initialLoading) initialLoading.style.display = 'none';
        }

        hideLoadingOverlay() {
            const loadingOverlay = this.api.container.querySelector('.loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.classList.remove('show');
                loadingOverlay.style.display = 'none';
            }
        }

        showLoadingOverlay() {
            const loadingOverlay = this.api.container.querySelector('.loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.classList.add('show');
                loadingOverlay.style.display = 'block';
            }
        }

        /**
         * Remove mouse move overlay
         */
        removeMouseMoveOverlay() {
            if (this.mouseMoveOverlay) {
                this.mouseMoveOverlay.remove();
                this.mouseMoveOverlay = null;
            }
        }

        /**
         * Dispose plugin with PROPER cleanup
         */
        dispose() {
            if (this.api.player.options.debug) {
                console.log('FB Plugin: Disposing');
            }

            if (this.timeUpdateInterval) {
                clearInterval(this.timeUpdateInterval);
                this.timeUpdateInterval = null;
            }

            if (this.fbPlayer) {
                this.fbPlayer = null;
            }

            if (this.fbContainer) {
                this.fbContainer.remove();
                this.fbContainer = null;
            }

            this.removeMouseMoveOverlay();

            // CRITICAL: Restore original methods
            if (this.originalMethods) {
                if (this.originalMethods.play) this.player.play = this.originalMethods.play;
                if (this.originalMethods.pause) this.player.pause = this.originalMethods.pause;
                if (this.originalMethods.togglePlayPause) this.player.togglePlayPause = this.originalMethods.togglePlayPause;
                if (this.originalMethods.seek) this.player.seek = this.originalMethods.seek;
                if (this.originalMethods.setVolume) this.player.setVolume = this.originalMethods.setVolume;
                if (this.originalMethods.updateVolume) this.player.updateVolume = this.originalMethods.updateVolume;
                if (this.originalMethods.setMuted) this.player.setMuted = this.originalMethods.setMuted;
                if (this.originalMethods.toggleMute) this.player.toggleMute = this.originalMethods.toggleMute;
            }

            // CRITICAL: Restore speed and PiP buttons
            const speedButton = this.api.container.querySelector('.speed-btn');
            const speedMenu = this.api.container.querySelector('.speed-menu');
            const speedControl = this.api.container.querySelector('.speed-control');
            const pipButton = this.api.container.querySelector('.pip-btn');

            if (speedButton) speedButton.style.display = '';
            if (speedMenu) speedMenu.style.display = '';
            if (speedControl) speedControl.style.display = '';
            if (pipButton) pipButton.style.display = '';

            // Restore native player
            if (this.api.video && this.options.replaceNativePlayer) {
                this.api.video.style.display = '';
                this.api.video.style.pointerEvents = '';
            }

            if (this.api.player.options.debug) {
                console.log('FB Plugin: Disposed');
            }
        }
    }

    // Register plugin globally
    if (typeof window.registerMYETVPlugin === 'function') {
        window.registerMYETVPlugin('facebook', FacebookPlugin);
    } else {
        console.error('📘 MYETV Player plugin system not found');
    }

})();