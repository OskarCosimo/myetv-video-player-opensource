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
            this.userHasInteracted = false; // Track if user has clicked directly on FB player
            this.waitingForUserClick = false; // Track if we're waiting for user to click FB player
            this.autoplayAttempted = false; // Track if we tried autoplay
            this.volumeSliderListener = null; // Track volume slider listener
            this.progressTooltipListener = null; // Track progress tooltip listener
            this.currentDuration = 0; // Store current video duration for tooltips

            // Get plugin API
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
         * Setup plugin
         */
        setup() {
            if (this.api.player.options.debug) {
                console.log('FB Plugin: Setup started');
            }

            // Load Facebook SDK
            this.loadFacebookSDK();

            // Add player methods
            this.addPlayerMethods();

            // Register hooks
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
         * Add player methods
         */
        addPlayerMethods() {
            this.player.loadFacebookVideo = (videoUrl, options = {}) => this.loadVideo(videoUrl, options);
            this.player.getFacebookVideoUrl = () => this.options.videoUrl;
            this.player.isFacebookActive = () => this.fbPlayer !== null;
        }

        /**
         * Register hooks
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
         * Check for Facebook URL
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

            // Calculate pixel dimensions
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
            fbVideo.setAttribute('data-width', containerWidth);
            fbVideo.setAttribute('data-height', containerHeight);
            fbVideo.setAttribute('data-allowfullscreen', this.options.allowFullscreen);

            // CRITICAL: Always set autoplay=false on embed, we'll handle autoplay via API
            fbVideo.setAttribute('data-autoplay', 'false');

            fbVideo.setAttribute('data-show-text', this.options.showText);
            fbVideo.setAttribute('data-show-captions', this.options.showCaptions);

            this.fbContainer.appendChild(fbVideo);

            // Parse XFBML
            if (window.FB && window.FB.XFBML) {
                FB.XFBML.parse(this.fbContainer);

                // Force styling after parse
                setTimeout(() => {
                    if (this.api.player.options.debug) {
                        console.log('FB Plugin: Applying final styling...');
                    }

                    FB.XFBML.parse();

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

            // CRITICAL: Remove ALL overlays to expose Facebook player
            this.hideLoadingOverlay();
            this.hideInitialLoading();
            this.hidePosterOverlay();
            this.removeAllPlayerOverlays();

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

            // CRITICAL: If autoplay was requested, try it ONCE via API
            // If browser blocks it, user will need to click on FB player directly
            if (this.options.autoplay && !this.autoplayAttempted) {
                this.autoplayAttempted = true;

                if (this.api.player.options.debug) {
                    console.log('FB Plugin: Attempting autoplay via API (may be blocked by browser)');
                }

                setTimeout(() => {
                    this.tryAutoplay();
                }, 500);
            }

            this.api.triggerEvent('facebookplugin:playerready', {});
        }

        /**
         * CRITICAL: Try autoplay ONCE via API
         * If browser blocks it, user must click directly on Facebook player
         */
        tryAutoplay() {
            if (!this.fbPlayer) return;

            try {
                // Try to play
                this.fbPlayer.play();

                // Facebook auto-mutes on autoplay, try to unmute
                // This will likely fail in browser due to autoplay policy
                this.fbPlayer.unmute();

                if (this.api.player.options.debug) {
                    console.log('FB Plugin: Autoplay attempted (browser may have blocked it)');
                }
            } catch (error) {
                if (this.api.player.options.debug) {
                    console.log('FB Plugin: Autoplay blocked by browser - user must click FB player directly');
                }
            }
        }

        /**
         * Setup speed menu and PiP button based on Facebook capabilities
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
         * Create mouse move overlay
         * CRITICAL: Must be completely transparent and NOT block clicks to FB player
         */
        createMouseMoveOverlay() {
            if (this.mouseMoveOverlay) return;

            this.mouseMoveOverlay = document.createElement('div');
            this.mouseMoveOverlay.className = 'fb-mousemove-overlay';
            // CRITICAL: pointer-events:none to let clicks pass through to Facebook player
            this.mouseMoveOverlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:5;background:transparent;pointer-events:none;';

            this.api.container.insertBefore(this.mouseMoveOverlay, this.api.controls);

            // ONLY capture mousemove for controls auto-hide, DON'T block clicks
            this.mouseMoveOverlay.addEventListener('mousemove', (e) => {
                if (this.api.player.onMouseMove) {
                    this.api.player.onMouseMove(e);
                }
            });

            // Don't handle clicks on this overlay - let them pass through to FB player
            if (this.api.player.options.debug) {
                console.log('FB Plugin: Mouse move overlay created with pointer-events:none');
            }
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
         * Setup event listeners with proper main player state sync
         */
        setupEventListeners() {
            if (!this.fbPlayer) return;

            // Started playing - marks successful user interaction
            this.fbPlayer.subscribe('startedPlaying', () => {
                if (this.api.player.options.debug) {
                    console.log('FB Plugin: Video started playing');
                }
                this.isPlaying = true;
                this.userHasInteracted = true; // Video playing = user clicked FB player
                this.waitingForUserClick = false;

                // Update play/pause icons
                const playIcon = this.api.container.querySelector('.play-icon');
                const pauseIcon = this.api.container.querySelector('.pause-icon');
                if (playIcon) playIcon.classList.add('hidden');
                if (pauseIcon) pauseIcon.classList.remove('hidden');

                this.api.triggerEvent('played', {
                    currentTime: this.getCurrentTime(),
                    duration: this.getDuration()
                });

                this.api.triggerEvent('play', {});
                this.api.triggerEvent('playing', {});
                this.hideLoadingOverlay();
            });

            // Paused
            this.fbPlayer.subscribe('paused', () => {
                if (this.api.player.options.debug) {
                    console.log('FB Plugin: Video paused');
                }
                this.isPlaying = false;

                // Update play/pause icons
                const playIcon = this.api.container.querySelector('.play-icon');
                const pauseIcon = this.api.container.querySelector('.pause-icon');
                if (playIcon) playIcon.classList.remove('hidden');
                if (pauseIcon) pauseIcon.classList.add('hidden');

                this.api.triggerEvent('paused', {
                    currentTime: this.getCurrentTime(),
                    duration: this.getDuration()
                });

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
         * CRITICAL: getCurrentPosition and getDuration are PROPERTIES, not methods!
         */
        startTimeUpdate() {
            if (this.timeUpdateInterval) {
                clearInterval(this.timeUpdateInterval);
            }

            this.timeUpdateInterval = setInterval(() => {
                if (this.fbPlayer && this.fbPlayer.getCurrentPosition !== undefined && this.fbPlayer.getDuration !== undefined) {
                    try {
                        // CRITICAL FIX: These are properties, not methods - no ()
                        const currentTime = this.fbPlayer.getCurrentPosition();
                        const duration = this.fbPlayer.getDuration();

                        if (duration && duration > 0) {
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

                            // Create tooltip if it doesn't exist
                            this.createProgressTooltip();

                            // CRITICAL: Update progress bar tooltip with current duration
                            this.updateProgressTooltip(duration);
                        }
                    } catch (error) {
                        // Ignore timing errors
                    }
                }
            }, 250);
        }

        /**
         * CRITICAL: Update progress bar tooltip with correct time
         */
        updateProgressTooltip() {
            const progContainer = this.api.container.querySelector('.progress-container');
            if (!progContainer) return;

            // Remove old listener if exists
            if (this.progressTooltipListener) {
                progContainer.removeEventListener('mousemove', this.progressTooltipListener);
            }

            // Create new listener that gets duration in real-time
            this.progressTooltipListener = (e) => {
                const tooltip = this.api.container.querySelector('.progress-tooltip');
                if (!tooltip) return;

                // Get duration from Facebook player every time (like control bar does)
                let duration = 0;
                if (this.fbPlayer && this.fbPlayer.getDuration) {
                    try {
                        duration = this.fbPlayer.getDuration();
                    } catch (error) {
                        return;
                    }
                }

                if (!duration || duration <= 0) return;

                const rect = progContainer.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percentage = Math.max(0, Math.min(1, x / rect.width));
                const hoverTime = percentage * duration;

                tooltip.textContent = this.formatTime(hoverTime);
                tooltip.style.left = (percentage * 100) + '%';
            };

            progContainer.addEventListener('mousemove', this.progressTooltipListener);
        }

        /**
 * Create progress tooltip element if it doesn't exist
 */
        createProgressTooltip() {
            const progContainer = this.api.container.querySelector('.progress-container');
            if (!progContainer) return;

            // Check if tooltip already exists
            let tooltip = progContainer.querySelector('.progress-tooltip');
            if (tooltip) return; // Already exists

            // Create tooltip element
            tooltip = document.createElement('div');
            tooltip.className = 'progress-tooltip';
            tooltip.textContent = '0:00';
            tooltip.style.cssText = `
        position: absolute;
        bottom: 100%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 4px 8px;
        border-radius: 3px;
        font-size: 12px;
        pointer-events: none;
        white-space: nowrap;
        display: none;
        margin-bottom: 5px;
    `;

            progContainer.appendChild(tooltip);

            // Show/hide tooltip on hover
            progContainer.addEventListener('mouseenter', () => {
                tooltip.style.display = 'block';
            });
            progContainer.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });
        }

        /**
         * Format time
         */
        formatTime(seconds) {
            if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';

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
         * Sync controls with proper override and volume handling
         * CRITICAL: Don't prevent API calls, just let them fail gracefully if browser blocks them
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

            // CRITICAL: Setup volume slider event listeners
            this.setupVolumeSlider();

            // Override play method
            // Let it try, but if it fails browser will just not play
            this.player.play = () => {
                if (this.fbPlayer) {
                    if (this.api.player.options.debug) {
                        console.log('📘 FB Plugin: Calling fbPlayer.play()');
                    }

                    try {
                        this.fbPlayer.play();
                    } catch (error) {
                        if (this.api.player.options.debug) {
                            console.log('📘 FB Plugin: Play via API failed (expected in browser without user gesture)');
                        }
                        // Mark that we're waiting for user to click FB player
                        this.waitingForUserClick = true;
                    }
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
                            try {
                                this.fbPlayer.play();
                            } catch (error) {
                                this.waitingForUserClick = true;
                            }
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
                    try {
                        this.fbPlayer.pause();
                        this.userHasInteracted = true; // Pause is a user interaction
                    } catch (error) {
                        if (this.api.player.options.debug) {
                            console.error('FB Plugin: Pause error:', error);
                        }
                    }
                } else if (this.originalMethods.pause) {
                    this.originalMethods.pause();
                }
            };

            // Override togglePlayPause method
            this.player.togglePlayPause = () => {
                if (this.fbPlayer) {
                    this.userHasInteracted = true; // Toggle is a user interaction
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

                // Mark user interaction
                this.userHasInteracted = true;

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
                        try {
                            this.fbPlayer.seek(eventOrTime);
                            if (this.api.player.options.debug) {
                                console.log('FB Plugin: Direct seek to', eventOrTime, 's');
                            }
                        } catch (error) {
                            if (this.api.player.options.debug) {
                                console.error('FB Plugin: Seek error', error);
                            }
                        }
                    }
                }
            };

            // Override volume methods
            this.player.setVolume = (volume) => {
                if (this.fbPlayer && this.fbPlayer.setVolume) {
                    this.userHasInteracted = true; // Volume change is user interaction

                    const fbVolume = volume / 100;
                    try {
                        this.fbPlayer.setVolume(fbVolume);

                        // Auto-unmute when user changes volume
                        if (volume > 0) {
                            this.fbPlayer.isMuted().then(isMuted => {
                                if (isMuted) {
                                    this.fbPlayer.unmute();
                                    this.updateMuteUI(false);
                                }
                            }).catch(() => { });
                        }

                        this.updateVolumeUI(volume);
                    } catch (error) {
                        if (this.api.player.options.debug) {
                            console.error('FB Plugin: Volume error:', error);
                        }
                    }
                } else if (this.originalMethods.setVolume) {
                    this.originalMethods.setVolume(volume);
                }
            };

            this.player.updateVolume = (volume) => {
                if (this.fbPlayer && this.fbPlayer.setVolume) {
                    this.userHasInteracted = true;
                    try {
                        this.fbPlayer.setVolume(volume / 100);
                        this.updateVolumeUI(volume);
                    } catch (error) {
                        if (this.api.player.options.debug) {
                            console.error('FB Plugin: Volume update error:', error);
                        }
                    }
                } else if (this.originalMethods.updateVolume) {
                    this.originalMethods.updateVolume(volume);
                }
            };

            this.player.setMuted = (muted) => {
                if (this.fbPlayer) {
                    this.userHasInteracted = true;
                    try {
                        if (muted) {
                            this.fbPlayer.mute();
                        } else {
                            this.fbPlayer.unmute();
                        }
                        this.updateMuteUI(muted);
                    } catch (error) {
                        if (this.api.player.options.debug) {
                            console.error('FB Plugin: Mute error:', error);
                        }
                    }
                } else if (this.originalMethods.setMuted) {
                    this.originalMethods.setMuted(muted);
                }
            };

            this.player.toggleMute = () => {
                if (this.fbPlayer && this.fbPlayer.isMuted) {
                    this.userHasInteracted = true;

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
         * CRITICAL: Setup volume slider event listeners
         */
        setupVolumeSlider() {
            const volumeSlider = this.api.container.querySelector('.volume-slider');
            if (!volumeSlider) {
                if (this.api.player.options.debug) {
                    console.warn('FB Plugin: Volume slider not found');
                }
                return;
            }

            // Remove existing listeners if any
            if (this.volumeSliderListener) {
                volumeSlider.removeEventListener('input', this.volumeSliderListener);
            }

            // Create new listener
            this.volumeSliderListener = (e) => {
                const volume = parseFloat(e.target.value);

                if (this.api.player.options.debug) {
                    console.log('FB Plugin: Volume slider changed to', volume);
                }

                this.userHasInteracted = true;

                if (this.fbPlayer && this.fbPlayer.setVolume) {
                    try {
                        this.fbPlayer.setVolume(volume / 100);

                        // Auto-unmute when user changes volume
                        if (volume > 0) {
                            this.fbPlayer.isMuted().then(isMuted => {
                                if (isMuted) {
                                    this.fbPlayer.unmute();
                                    this.updateMuteUI(false);
                                }
                            }).catch(() => { });
                        }

                        this.updateVolumeUI(volume);
                    } catch (error) {
                        if (this.api.player.options.debug) {
                            console.error('FB Plugin: Volume slider error:', error);
                        }
                    }
                }
            };

            volumeSlider.addEventListener('input', this.volumeSliderListener);

            if (this.api.player.options.debug) {
                console.log('FB Plugin: Volume slider listener attached');
            }
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
         * Update mute UI when mute state changes
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
         * CRITICAL: getCurrentPosition is a METHOD, not a property
         */
        getCurrentTime() {
            if (!this.fbPlayer) return 0;
            try {
                return this.fbPlayer.getCurrentPosition() || 0;
            } catch (error) {
                return 0;
            }
        }

        /**
         * Get duration from Facebook player
         * CRITICAL: getDuration is a METHOD, not a property
         */
        getDuration() {
            if (!this.fbPlayer) return 0;
            try {
                return this.fbPlayer.getDuration() || 0;
            } catch (error) {
                return 0;
            }
        }

        /**
         * CRITICAL: Remove ALL player overlays to expose Facebook player completely
         */
        removeAllPlayerOverlays() {
            if (this.api.player.options.debug) {
                console.log('FB Plugin: Removing all player overlays to expose Facebook player');
            }

            // Remove poster overlay
            const posterOverlay = this.api.container.querySelector('.video-poster-overlay');
            if (posterOverlay) {
                posterOverlay.style.display = 'none';
                posterOverlay.style.visibility = 'hidden';
                posterOverlay.style.opacity = '0';
                posterOverlay.style.pointerEvents = 'none';
            }

            // Remove initial loading
            const initialLoading = this.api.container.querySelector('.initial-loading');
            if (initialLoading) {
                initialLoading.style.display = 'none';
                initialLoading.style.visibility = 'hidden';
                initialLoading.style.pointerEvents = 'none';
            }

            // Remove loading overlay
            const loadingOverlay = this.api.container.querySelector('.loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
                loadingOverlay.style.visibility = 'hidden';
                loadingOverlay.style.opacity = '0';
                loadingOverlay.style.pointerEvents = 'none';
            }

            // Remove big play button if exists
            const bigPlayButton = this.api.container.querySelector('.big-play-button');
            if (bigPlayButton) {
                bigPlayButton.style.display = 'none';
                bigPlayButton.style.visibility = 'hidden';
                bigPlayButton.style.pointerEvents = 'none';
            }

            // Remove any custom overlays
            const customOverlays = this.api.container.querySelectorAll('[class*="overlay"]');
            customOverlays.forEach(overlay => {
                // Don't remove mouse move overlay or loading overlay we control
                if (!overlay.classList.contains('fb-mousemove-overlay')) {
                    if (this.api.player.options.debug) {
                        console.log('FB Plugin: Hiding overlay:', overlay.className);
                    }
                    overlay.style.display = 'none';
                    overlay.style.visibility = 'hidden';
                    overlay.style.opacity = '0';
                    overlay.style.pointerEvents = 'none';
                }
            });
        }

        /**
         * Hide overlays
         */
        hidePosterOverlay() {
            const posterOverlay = this.api.container.querySelector('.video-poster-overlay');
            if (posterOverlay) {
                posterOverlay.classList.add('hidden');
                posterOverlay.classList.remove('visible');
                posterOverlay.style.display = 'none';
                posterOverlay.style.pointerEvents = 'none';
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
         * Dispose plugin with proper cleanup
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

            // Reset interaction flags
            this.userHasInteracted = false;
            this.waitingForUserClick = false;
            this.autoplayAttempted = false;

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