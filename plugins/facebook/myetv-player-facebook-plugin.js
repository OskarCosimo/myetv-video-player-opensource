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
                showNativeControlsButton: options.showNativeControlsButton !== undefined ? options.showNativeControlsButton : true,
                controlBarOpacity: options.controlBarOpacity !== undefined
                    ? options.controlBarOpacity
                    : (player.options.controlBarOpacity !== undefined ? player.options.controlBarOpacity : 0.95),
                titleOverlayOpacity: options.titleOverlayOpacity !== undefined
                    ? options.titleOverlayOpacity
                    : (player.options.titleOverlayOpacity !== undefined ? player.options.titleOverlayOpacity : 0.95),
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
            this.styleObserver = null;
            this.isFullscreen = false;


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

                this.fbContainer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:2;overflow:hidden;display:flex;align-items:center;justify-content:center;';

                // Ensure controls are above Facebook player
                if (this.api.controls) {
                    this.api.controls.style.zIndex = '10';
                    this.api.controls.style.pointerEvents = 'auto';
                }

                // Ensure title overlay is above Facebook player
                const titleOverlay = this.api.container.querySelector('.title-overlay');
                if (titleOverlay) {
                    titleOverlay.style.zIndex = '15';
                    titleOverlay.style.pointerEvents = 'none'; // Allow clicks to pass through
                    if (this.api.player.options.debug) {
                        console.log('FB Plugin: Title overlay z-index set to 15');
                    }
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

            if (this.api.player.options.debug) {
                console.log('FB Plugin: Using dimensions: 100%');
            }

            // Create Facebook video element
            const fbVideo = document.createElement('div');
            fbVideo.className = 'fb-video';
            fbVideo.style.cssText = `position:absolute;top:0;left:0;width:100%!important;height:100%!important;`;

            fbVideo.setAttribute('data-href', this.options.videoUrl);
            fbVideo.setAttribute('data-width', 'auto');
            fbVideo.setAttribute('data-height', 'auto');
            fbVideo.setAttribute('data-allowfullscreen', this.options.allowFullscreen);

            // CRITICAL: Always set autoplay=false on embed, we'll handle autoplay via API
            fbVideo.setAttribute('data-autoplay', 'false');

            fbVideo.setAttribute('data-show-text', this.options.showText);
            fbVideo.setAttribute('data-show-captions', this.options.showCaptions);

            fbVideo.setAttribute('data-controls', this.options.replaceNativePlayer);

            this.fbContainer.appendChild(fbVideo);

            // Parse XFBML
            if (window.FB && window.FB.XFBML) {
                FB.XFBML.parse(this.fbContainer);

                // Force styling usando la nuova funzione
                const forceStyles = () => this.forceVideoStyles();

                setTimeout(forceStyles, 500);
                setTimeout(forceStyles, 1500);

                // Setup MutationObserver
                setTimeout(() => {
                    const span = this.fbContainer?.querySelector('span');
                    const iframe = this.fbContainer?.querySelector('iframe');

                    const observer = new MutationObserver(forceStyles);

                    if (span) observer.observe(span, { attributes: true, attributeFilter: ['style'] });
                    if (iframe) observer.observe(iframe, { attributes: true, attributeFilter: ['style'] });

                    this.styleObserver = observer;
                }, 2000);

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

            // Ensure title overlay is visible and above Facebook player
            const titleOverlay = this.api.container.querySelector('.title-overlay');
            if (titleOverlay) {
                titleOverlay.style.zIndex = '15';
                titleOverlay.style.pointerEvents = 'none'; // Allow clicks to pass through
                titleOverlay.style.display = ''; // Remove any display:none
                titleOverlay.style.visibility = ''; // Remove any visibility:hidden
                if (this.api.player.options.debug) {
                    console.log('FB Plugin: Title overlay visibility restored');
                }
            }

            // Create Facebook controls button
            this.createFacebookControlsButton();

            // Setup event listeners
            this.setupEventListeners();

            // inject controlbar gradient styles
            this.injectControlbarGradientStyles();

            // Start time update
            this.startTimeUpdate();

            // Sync controls
            this.syncControls();

            // Setup speed and PiP controls
            this.setupSpeedAndPip();

            // Setup fullscreen listener
            this.setupFullscreenListener();

            // Get initial volume once
            if (this.fbPlayer && this.fbPlayer.getVolume) {
                this.fbPlayer.getVolume().then(vol => {
                    const percent = Math.round(vol * 100);
                    this.updateVolumeUI(percent);

                    // Also check initial mute state
                    if (this.fbPlayer.isMuted) {
                        this.fbPlayer.isMuted().then(isMuted => {
                            this.updateMuteUI(isMuted);
                        }).catch(() => { });
                    }
                }).catch(error => {
                    if (this.api.player.options.debug) {
                        console.warn('FB Plugin: Could not get initial volume', error);
                    }
                });
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
 * Setup fullscreen event listener
 */
        setupFullscreenListener() {
            const fullscreenChangeHandler = () => {
                const isNowFullscreen = !!(
                    document.fullscreenElement ||
                    document.webkitFullscreenElement ||
                    document.mozFullScreenElement ||
                    document.msFullscreenElement
                );

                this.isFullscreen = isNowFullscreen;

                if (this.api.player.options.debug) {
                    console.log('FB Plugin: Fullscreen changed:', isNowFullscreen);
                }

                // Forza stili dopo cambio fullscreen
                setTimeout(() => {
                    this.forceVideoStyles();
                }, 100);
            };

            document.addEventListener('fullscreenchange', fullscreenChangeHandler);
            document.addEventListener('webkitfullscreenchange', fullscreenChangeHandler);
            document.addEventListener('mozfullscreenchange', fullscreenChangeHandler);
            document.addEventListener('MSFullscreenChange', fullscreenChangeHandler);

            // Salva per cleanup
            this.fullscreenChangeHandler = fullscreenChangeHandler;
        }

        /**
         * Force video styles (estratto per riuso)
         */
        forceVideoStyles() {
            const span = this.fbContainer?.querySelector('span');
            const iframe = this.fbContainer?.querySelector('iframe');

            if (span) {
                span.style.setProperty('position', 'absolute', 'important');
                span.style.setProperty('top', '0', 'important');
                span.style.setProperty('left', '0', 'important');
                span.style.setProperty('width', '100%', 'important');
                span.style.setProperty('height', '100%', 'important');
                span.style.setProperty('display', 'flex', 'important');
                span.style.setProperty('align-items', 'center', 'important');
                span.style.setProperty('justify-content', 'center', 'important');
            }

            if (iframe) {
                // IN FULLSCREEN: usa tutto lo schermo
                if (this.isFullscreen) {
                    iframe.style.setProperty('position', 'absolute', 'important');
                    iframe.style.setProperty('top', '0', 'important');
                    iframe.style.setProperty('left', '0', 'important');
                    iframe.style.setProperty('width', '100%', 'important');
                    iframe.style.setProperty('height', '100%', 'important');
                    iframe.style.setProperty('transform', 'none', 'important');
                    iframe.style.setProperty('border', 'none', 'important');

                    if (this.api.player.options.debug) {
                        console.log('FB Plugin: Fullscreen mode - 100% dimensions');
                    }
                } else {
                    // NORMALE: mantieni aspect ratio 16:9
                    const container = this.api.container;
                    const containerWidth = container.clientWidth;
                    const containerHeight = container.clientHeight;
                    const containerRatio = containerWidth / containerHeight;
                    const videoRatio = 16 / 9;

                    let iframeWidth, iframeHeight;

                    if (containerRatio > videoRatio) {
                        iframeHeight = containerHeight;
                        iframeWidth = iframeHeight * videoRatio;
                    } else {
                        iframeWidth = containerWidth;
                        iframeHeight = iframeWidth / videoRatio;
                    }

                    iframe.style.setProperty('position', 'absolute', 'important');
                    iframe.style.setProperty('top', '50%', 'important');
                    iframe.style.setProperty('left', '50%', 'important');
                    iframe.style.setProperty('width', iframeWidth + 'px', 'important');
                    iframe.style.setProperty('height', iframeHeight + 'px', 'important');
                    iframe.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
                    iframe.style.setProperty('border', 'none', 'important');

                    if (this.api.player.options.debug) {
                        console.log('FB Plugin: Normal mode - aspect ratio maintained');
                    }
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
                    console.log('🎬 FB Plugin: Video started playing');
                }

                this.isPlaying = true;
                this.userHasInteracted = true; // Video playing = user clicked FB player
                this.waitingForUserClick = false;

                // Rimuovi classe paused
                if (this.player.container) {
                    this.player.container.classList.remove('video-paused');
                }

                // Riattiva l'auto-hide quando riprende la riproduzione
                if (this.player.options.autoHide && this.player.autoHideInitialized) {
                    if (this.player.resetAutoHideTimer) {
                        this.player.resetAutoHideTimer();
                    }

                    if (this.options.debug) {
                        console.log('🎬 FB Plugin: Video playing - auto-hide reactivated');
                    }
                }

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
                    console.log('🎬 FB Plugin: Video paused');
                }

                this.isPlaying = false;

                // Aggiungi classe per identificare lo stato di pausa
                if (this.player.container) {
                    this.player.container.classList.add('video-paused');
                }

                // Mantieni la controlbar visibile SOLO se autoHide è abilitato
                if (this.player.options.autoHide && this.player.autoHideInitialized) {
                    // Mostra controlli
                    if (this.player.controls) {
                        this.player.controls.classList.add('show');
                    }

                    // Mostra anche il title overlay se è abilitato e non è persistent
                    if (this.player.options.showTitleOverlay &&
                        !this.player.options.persistentTitle &&
                        this.player.titleOverlay) {
                        this.player.titleOverlay.classList.add('show');
                    }

                    // Cancella il timer di auto-hide
                    if (this.player.autoHideTimer) {
                        clearTimeout(this.player.autoHideTimer);
                        this.player.autoHideTimer = null;
                    }

                    // Cancella anche il timer del title overlay
                    if (this.player.titleTimeout) {
                        clearTimeout(this.player.titleTimeout);
                        this.player.titleTimeout = null;
                    }

                    if (this.options.debug) {
                        console.log('🎬 FB Plugin: Video paused - controls and title locked visible');
                    }
                }

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
                    console.log('🎬 FB Plugin: Video finished');
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
                    console.log('🎬 FB Plugin: Video buffering started');
                }
                this.api.triggerEvent('waiting', {});
                this.showLoadingOverlay();
            });

            // Finished buffering
            this.fbPlayer.subscribe('finishedBuffering', () => {
                if (this.api.player.options.debug) {
                    console.log('🎬 FB Plugin: Video buffering finished');
                }
                this.api.triggerEvent('canplay', {});
                this.hideLoadingOverlay();
            });

            // Error
            this.fbPlayer.subscribe('error', (error) => {
                console.error('🎬 FB Plugin: Facebook player error:', error);
                this.api.triggerEvent('error', error);
                this.api.triggerEvent('facebookplugin:error', error);
            });

            if (this.api.player.options.debug) {
                console.log('🎬 FB Plugin: Event listeners setup completed');
            }
        }

        startTimeUpdate() {
            if (this.timeUpdateInterval) {
                clearInterval(this.timeUpdateInterval);
            }

            this.timeUpdateInterval = setInterval(() => {
                if (this.fbPlayer && this.fbPlayer.getCurrentPosition !== undefined && this.fbPlayer.getDuration !== undefined) {
                    try {
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

                            // Update progress bar tooltip with current duration
                            this.updateProgressTooltip(duration);
                        }

                    } catch (error) {
                        // Ignore timing errors
                    }
                }
            }, 250);
        }

        /**
    * Inject CSS styles for controlbar and title overlay gradients
    * Uses Facebook-specific selectors to avoid conflicts with other plugins
        */
        injectControlbarGradientStyles() {
            // Check if styles are already injected
            if (document.getElementById('facebook-controlbar-gradient-styles')) {
                return;
            }

            // Validate opacity values (must be between 0 and 1)
            const controlBarOpacity = Math.max(0, Math.min(1, this.options.controlBarOpacity));
            const titleOverlayOpacity = Math.max(0, Math.min(1, this.options.titleOverlayOpacity));

            // Create style element
            const style = document.createElement('style');
            style.id = 'facebook-controlbar-gradient-styles';

            // CSS with Facebook-specific selectors to avoid conflicts
            style.textContent = `
        /* Controlbar gradient - dark opaque at bottom, semi-transparent at top */
        /* ONLY applied when Facebook plugin is active */
        .video-wrapper.facebook-active .controls {
            background: linear-gradient(
                to top,
                rgba(0, 0, 0, ${controlBarOpacity}) 0%,           /* Maximum opacity at bottom */
                rgba(0, 0, 0, ${controlBarOpacity * 0.89}) 20%,   /* 89% of max opacity */
                rgba(0, 0, 0, ${controlBarOpacity * 0.74}) 40%,   /* 74% */
                rgba(0, 0, 0, ${controlBarOpacity * 0.53}) 60%,   /* 53% */
                rgba(0, 0, 0, ${controlBarOpacity * 0.32}) 80%,   /* 32% */
                rgba(0, 0, 0, ${controlBarOpacity * 0.21}) 100%   /* 21% at top */
            ) !important;
            backdrop-filter: blur(3px);
            min-height: 60px;
            padding-bottom: 10px;
        }
        
        /* Title overlay gradient - dark opaque at top, semi-transparent at bottom */
        /* ONLY applied when Facebook plugin is active */
        .video-wrapper.facebook-active .title-overlay {
            background: linear-gradient(
                to bottom,
                rgba(0, 0, 0, ${titleOverlayOpacity}) 0%,           /* Maximum opacity at top */
                rgba(0, 0, 0, ${titleOverlayOpacity * 0.89}) 20%,   /* 89% of max opacity */
                rgba(0, 0, 0, ${titleOverlayOpacity * 0.74}) 40%,   /* 74% */
                rgba(0, 0, 0, ${titleOverlayOpacity * 0.53}) 60%,   /* 53% */
                rgba(0, 0, 0, ${titleOverlayOpacity * 0.32}) 80%,   /* 32% */
                rgba(0, 0, 0, ${titleOverlayOpacity * 0.21}) 100%   /* 21% at bottom */
            ) !important;
            backdrop-filter: blur(3px);
            min-height: 80px;
            padding-top: 20px;
        }
        
        /* Keep controlbar visible when video is paused */
        .video-wrapper.facebook-active.video-paused .controls.show {
            opacity: 1 !important;
            visibility: visible !important;
        }
        
        /* Keep title overlay visible when video is paused */
        .video-wrapper.facebook-active.video-paused .title-overlay.show {
            opacity: 1 !important;
            visibility: visible !important;
        }
    `;

            // Append style to document head
            document.head.appendChild(style);

            // Debug logging
            if (this.options.debug) {
                console.log('🎬 Facebook Plugin: Controlbar and title overlay gradient styles injected');
                console.log(`🎬 Facebook Plugin: ControlBar opacity: ${controlBarOpacity}, TitleOverlay opacity: ${titleOverlayOpacity}`);
            }
        }

        /**
         * Update progress bar tooltip with correct time
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
            tooltip.textContent = '';
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
            // Hide/show MYETV controls based on replaceNativePlayer option
            if (!this.options.replaceNativePlayer) {
                // Hide MYETV control bar, show only Facebook native controls
                if (this.api.controls) {
                    this.api.controls.style.display = 'none';
                    if (this.api.player.options.debug) {
                        console.log('FB Plugin: MYETV controls hidden (replaceNativePlayer is false)');
                    }
                }
                return; // Don't sync controls, use Facebook's native controls
            } else {
                // Show MYETV control bar, hide Facebook native controls (not possible, they'll coexist)
                if (this.api.controls) {
                    this.api.controls.style.display = '';
                    if (this.api.player.options.debug) {
                        console.log('FB Plugin: MYETV controls visible (replaceNativePlayer is true)');
                    }
                }
            }

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

        // Create button to show Facebook native controls
        createFacebookControlsButton() {
            // Verify option enabled
            if (!this.options.showNativeControlsButton) {
                if (this.options.debug) {
                    console.log('🎬 FB Plugin: Native controls button disabled by option');
                }
                return;
            }

            // Check if button already exists
            if (this.player.container.querySelector('.facebook-controls-btn')) {
                return;
            }

            const controlsRight = this.player.container.querySelector('.controls-right');
            if (!controlsRight) return;

            const buttonHTML = `
        <button class="control-btn facebook-controls-btn" title="Show Facebook Controls">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
        </button>
    `;

            // Insert before quality control
            const qualityControl = controlsRight.querySelector('.quality-control');
            if (qualityControl) {
                qualityControl.insertAdjacentHTML('beforebegin', buttonHTML);
            } else {
                const fullscreenBtn = controlsRight.querySelector('.fullscreen-btn');
                if (fullscreenBtn) {
                    fullscreenBtn.insertAdjacentHTML('beforebegin', buttonHTML);
                } else {
                    controlsRight.insertAdjacentHTML('beforeend', buttonHTML);
                }
            }

            // Add click listener
            const btn = this.player.container.querySelector('.facebook-controls-btn');
            if (btn) {
                btn.addEventListener('click', () => {
                    if (this.options.debug) {
                        console.log('🎬 FB Plugin: Native controls button clicked');
                    }
                    this.showFacebookControls();
                });

                // Add custom styling (Facebook blue color)
                btn.style.color = '#1877f2';

                if (this.options.debug) {
                    console.log('🎬 FB Plugin: Native controls button created');
                }
            }
        }

        // Show Facebook native controls
        showFacebookControls() {
            if (this.options.debug) {
                console.log('🎬 FB Plugin: Showing Facebook native controls');
            }

            const iframe = this.player.container.querySelector('iframe');
            const controlbar = this.player.container.querySelector('.controls');
            const titleOverlay = this.player.container.querySelector('.title-overlay');

            if (iframe) {
                // Bring iframe to front
                iframe.style.pointerEvents = 'auto';
                iframe.style.zIndex = '9999';

                // Hide controlbar and title
                if (controlbar) controlbar.style.display = 'none';
                if (titleOverlay) titleOverlay.style.display = 'none';

                // Auto-restore after 10 seconds
                this.facebookControlsTimeout = setTimeout(() => {
                    if (this.options.debug) {
                        console.log('🎬 FB Plugin: Restoring custom controls after 10 seconds');
                    }
                    this.hideFacebookControls();
                }, 10000);
            }
        }

        // Hide Facebook native controls
        hideFacebookControls() {
            if (this.options.debug) {
                console.log('🎬 FB Plugin: Hiding Facebook native controls');
            }

            // Clear timeout if exists
            if (this.facebookControlsTimeout) {
                clearTimeout(this.facebookControlsTimeout);
                this.facebookControlsTimeout = null;
            }

            const iframe = this.player.container.querySelector('iframe');
            const controlbar = this.player.container.querySelector('.controls');
            const titleOverlay = this.player.container.querySelector('.title-overlay');

            if (iframe) {
                // Disable clicks on Facebook controls
                iframe.style.pointerEvents = 'none';
                iframe.style.zIndex = '1';

                // Restore controlbar and title
                if (controlbar) {
                    controlbar.style.display = '';
                    controlbar.style.zIndex = '10';
                }
                if (titleOverlay) titleOverlay.style.display = '';

                if (this.options.debug) {
                    console.log('🎬 FB Plugin: Custom controls restored');
                }
            }
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
                volumeSlider.removeEventListener('input', this.volumeSliderListener, true);
            }

            // Create new listener
            this.volumeSliderListener = (e) => {
                // CRITICAL: Stop propagation to prevent main player from handling this
                e.stopPropagation();
                e.stopImmediatePropagation();

                const volume = parseFloat(e.target.value);

                if (this.api.player.options.debug) {
                    console.log('FB Plugin: Volume slider changed to', volume);
                }

                this.userHasInteracted = true;

                if (this.fbPlayer && this.fbPlayer.setVolume) {
                    try {
                        // Set volume on Facebook player (0-1 range)
                        this.fbPlayer.setVolume(volume / 100);

                        // CRITICAL FIX: Update UI immediately
                        const fill = this.api.container.querySelector('.volume-filled');
                        if (fill) {
                            fill.style.width = volume + '%';
                        }

                        // Update CSS custom property
                        if (this.api.container) {
                            this.api.container.style.setProperty('--player-volume-fill', volume + '%');
                        }

                        // Auto-unmute when user changes volume
                        if (volume > 0) {
                            this.fbPlayer.isMuted().then(isMuted => {
                                if (isMuted) {
                                    this.fbPlayer.unmute();
                                    this.updateMuteUI(false);
                                }
                            }).catch(() => { });
                        }

                        if (this.api.player.options.debug) {
                            console.log('FB Plugin: Volume set to', volume, '%, Facebook volume:', (volume / 100));
                        }

                    } catch (error) {
                        if (this.api.player.options.debug) {
                            console.error('FB Plugin: Volume slider error', error);
                        }
                    }
                }
            };

            // CRITICAL: Use capture phase to intercept BEFORE main player
            volumeSlider.addEventListener('input', this.volumeSliderListener, true);

            if (this.api.player.options.debug) {
                console.log('FB Plugin: Volume slider listener attached with capture=true');
            }
        }

        /**
         * Update volume UI when volume changes
         */
        updateVolumeUI(volume) {
            // Slider
            const volumeSlider = this.api.container.querySelector('.volume-slider');
            if (volumeSlider && volumeSlider.value != volume) {
                volumeSlider.value = volume;
            }

            // Progress bar fill
            const fill = this.api.container.querySelector('.volume-filled');
            if (fill) {
                fill.style.width = volume + '%';
            }

            // Update volume visual (main player method)
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

            // CRITICAL FIX: Also update tooltip position
            if (this.api.player.updateVolumeTooltipPosition) {
                this.api.player.updateVolumeTooltipPosition(volume / 100);
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
 * EXCEPT the title overlay which should remain visible
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

            // Remove any custom overlays EXCEPT title overlay
            const customOverlays = this.api.container.querySelectorAll('[class*="overlay"]');
            customOverlays.forEach(overlay => {
                // Don't remove mouse move overlay, loading overlay we control, or title overlay
                if (!overlay.classList.contains('fb-mousemove-overlay') &&
                    !overlay.classList.contains('title-overlay')) {
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
         * Hide poster overlays
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

            if (this.styleObserver) {
                this.styleObserver.disconnect();
                this.styleObserver = null;
            }

            // Clear Facebook controls timeout
            if (this.facebookControlsTimeout) {
                clearTimeout(this.facebookControlsTimeout);
                this.facebookControlsTimeout = null;
            }

            if (this.fbPlayer) {
                this.fbPlayer = null;
            }

            if (this.fbContainer) {
                this.fbContainer.remove();
                this.fbContainer = null;
            }

            // Dopo il cleanup di styleObserver
            if (this.fullscreenChangeHandler) {
                document.removeEventListener('fullscreenchange', this.fullscreenChangeHandler);
                document.removeEventListener('webkitfullscreenchange', this.fullscreenChangeHandler);
                document.removeEventListener('mozfullscreenchange', this.fullscreenChangeHandler);
                document.removeEventListener('MSFullscreenChange', this.fullscreenChangeHandler);
                this.fullscreenChangeHandler = null;
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

            // Restore MYETV controls visibility
            if (this.api.controls) {
                this.api.controls.style.display = '';
            }

            // Reset interaction flags
            this.userHasInteracted = false;
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