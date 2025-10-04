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

            // Get plugin API
            this.api = player.getPluginAPI ? player.getPluginAPI() : {
                player: player,
                video: player.video,
                container: player.container,
                controls: player.controls,
                debug: (msg) => {
                    if (this.options.debug) console.log('📘 Facebook Plugin:', msg);
                },
                triggerEvent: (event, data) => player.triggerEvent(event, data)
            };

            if (!this.options.appId) {
                console.warn('📘 Facebook Plugin: appId is recommended for full API features');
            }
        }

        /**
         * Setup plugin
         */
        setup() {
            this.api.debug('Setup started');

            // Auto-detect video URL from data attributes
            if (this.options.autoLoadFromData) {
                this.autoDetectVideoUrl();
            }

            // Load Facebook SDK
            this.loadFacebookSDK().then(() => {
                if (this.options.videoUrl || this.options.videoId) {
                    this.createFacebookPlayer();
                }
            }).catch(error => {
                console.error('📘 Facebook Plugin: Failed to load SDK', error);
            });

            this.api.debug('Setup completed');
        }

        /**
         * Auto-detect video URL from various sources
         */
        autoDetectVideoUrl() {
            // Priority 1: Check data attributes
            const dataVideoUrl = this.api.video.getAttribute('data-video-url');
            const dataVideoType = this.api.video.getAttribute('data-video-type');

            if (dataVideoUrl && dataVideoType === 'facebook') {
                this.options.videoUrl = dataVideoUrl;
                this.api.debug('Video URL detected from data attribute: ' + dataVideoUrl);
                return;
            }

            // Priority 2: Check video src
            const src = this.api.video.src || this.api.video.currentSrc;
            if (src && this.isFacebookUrl(src)) {
                this.options.videoUrl = src;
                this.api.debug('Video URL detected from src: ' + src);
                return;
            }

            // Priority 3: Check source elements
            const sources = this.api.video.querySelectorAll('source');
            for (const source of sources) {
                const sourceSrc = source.getAttribute('src');
                const sourceType = source.getAttribute('type');

                if ((sourceType === 'video/facebook' || this.isFacebookUrl(sourceSrc)) && sourceSrc) {
                    this.options.videoUrl = sourceSrc;
                    this.api.debug('Video URL detected from source: ' + sourceSrc);
                    return;
                }
            }
        }

        /**
         * Check if URL is a Facebook video URL
         */
        isFacebookUrl(url) {
            if (!url) return false;
            return /facebook\.com\/(.*\/)?videos?\//.test(url);
        }

        /**
         * Load Facebook SDK
         */
        loadFacebookSDK() {
            return new Promise((resolve, reject) => {
                // Check if already loaded
                if (window.FB && window.FB.init) {
                    this.isFBSDKLoaded = true;
                    this.initializeFBSDK();
                    resolve();
                    return;
                }

                // Load SDK
                window.fbAsyncInit = () => {
                    this.initializeFBSDK();
                    this.isFBSDKLoaded = true;
                    this.api.debug('Facebook SDK loaded');
                    resolve();
                };

                // Inject script
                const script = document.createElement('script');
                script.src = 'https://connect.facebook.net/en_US/sdk.js';
                script.async = true;
                script.defer = true;
                script.onerror = () => reject(new Error('Failed to load Facebook SDK'));

                if (!document.getElementById('fb-root')) {
                    const fbRoot = document.createElement('div');
                    fbRoot.id = 'fb-root';
                    document.body.insertBefore(fbRoot, document.body.firstChild);
                }

                document.head.appendChild(script);
            });
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
                    this.setupEventListeners();
                    this.api.debug('Facebook player ready');
                    this.api.triggerEvent('facebookplugin:playerready', {});
                }
            });
        }

        /**
         * Create Facebook player
         */
        createFacebookPlayer() {
            if (!this.options.videoUrl && !this.options.videoId) {
                this.api.debug('No video URL or ID provided');
                return;
            }

            // Hide native player
            if (this.options.replaceNativePlayer) {
                this.api.video.style.display = 'none';
            }

            // Create container
            this.fbContainer = document.createElement('div');
            this.fbContainer.className = 'fb-video-container';
            this.fbContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 100;
            `;

            // Create Facebook video element
            const fbVideo = document.createElement('div');
            fbVideo.className = 'fb-video';

            const videoUrl = this.options.videoUrl || `https://www.facebook.com/video.php?v=${this.options.videoId}`;
            fbVideo.setAttribute('data-href', videoUrl);
            fbVideo.setAttribute('data-width', this.options.width);
            fbVideo.setAttribute('data-allowfullscreen', this.options.allowFullscreen);
            fbVideo.setAttribute('data-autoplay', this.options.autoplay);
            fbVideo.setAttribute('data-show-text', this.options.showText);
            fbVideo.setAttribute('data-show-captions', this.options.showCaptions);

            this.fbContainer.appendChild(fbVideo);
            this.api.container.appendChild(this.fbContainer);

            // Parse XFBML
            if (window.FB && window.FB.XFBML) {
                FB.XFBML.parse(this.fbContainer);
            }

            this.api.debug('Facebook player created');
            this.api.triggerEvent('facebookplugin:videoloaded', { videoUrl });
        }

        /**
         * Setup event listeners
         */
        setupEventListeners() {
            if (!this.fbPlayer) return;

            // Started playing
            this.fbPlayer.subscribe('startedPlaying', () => {
                this.api.debug('Video started playing');
                this.api.triggerEvent('play', {});
                this.api.triggerEvent('playing', {});
            });

            // Paused
            this.fbPlayer.subscribe('paused', () => {
                this.api.debug('Video paused');
                this.api.triggerEvent('pause', {});
            });

            // Finished playing
            this.fbPlayer.subscribe('finishedPlaying', () => {
                this.api.debug('Video finished');
                this.api.triggerEvent('ended', {});
            });

            // Started buffering
            this.fbPlayer.subscribe('startedBuffering', () => {
                this.api.debug('Buffering started');
                this.api.triggerEvent('waiting', {});
            });

            // Finished buffering
            this.fbPlayer.subscribe('finishedBuffering', () => {
                this.api.debug('Buffering finished');
                this.api.triggerEvent('canplay', {});
            });

            // Error
            this.fbPlayer.subscribe('error', (error) => {
                console.error('📘 Facebook player error:', error);
                this.api.triggerEvent('error', error);
                this.api.triggerEvent('facebookplugin:error', error);
            });
        }

        /**
         * Play video
         */
        play() {
            if (!this.fbPlayer) {
                return Promise.reject('Player not initialized');
            }
            this.fbPlayer.play();
            return Promise.resolve();
        }

        /**
         * Pause video
         */
        pause() {
            if (!this.fbPlayer) {
                return Promise.reject('Player not initialized');
            }
            this.fbPlayer.pause();
            return Promise.resolve();
        }

        /**
         * Seek to position
         */
        seek(seconds) {
            if (!this.fbPlayer) {
                return Promise.reject('Player not initialized');
            }
            this.fbPlayer.seek(seconds);
            return Promise.resolve(seconds);
        }

        /**
         * Get current time
         */
        getCurrentTime() {
            if (!this.fbPlayer) {
                return Promise.reject('Player not initialized');
            }
            return Promise.resolve(this.fbPlayer.getCurrentPosition());
        }

        /**
         * Get duration
         */
        getDuration() {
            if (!this.fbPlayer) {
                return Promise.reject('Player not initialized');
            }
            return Promise.resolve(this.fbPlayer.getDuration());
        }

        /**
         * Mute video
         */
        mute() {
            if (!this.fbPlayer) {
                return Promise.reject('Player not initialized');
            }
            this.fbPlayer.mute();
            return Promise.resolve();
        }

        /**
         * Unmute video
         */
        unmute() {
            if (!this.fbPlayer) {
                return Promise.reject('Player not initialized');
            }
            this.fbPlayer.unmute();
            return Promise.resolve();
        }

        /**
         * Check if muted
         */
        isMuted() {
            if (!this.fbPlayer) {
                return Promise.reject('Player not initialized');
            }
            return Promise.resolve(this.fbPlayer.isMuted());
        }

        /**
         * Set volume
         */
        setVolume(volume) {
            if (!this.fbPlayer) {
                return Promise.reject('Player not initialized');
            }
            this.fbPlayer.setVolume(volume);
            return Promise.resolve(volume);
        }

        /**
         * Get volume
         */
        getVolume() {
            if (!this.fbPlayer) {
                return Promise.reject('Player not initialized');
            }
            return Promise.resolve(this.fbPlayer.getVolume());
        }

        /**
         * Load new video
         */
        loadVideo(videoUrl) {
            this.options.videoUrl = videoUrl;

            // Remove existing player
            if (this.fbContainer) {
                this.fbContainer.remove();
            }

            // Create new player
            this.createFacebookPlayer();
            return Promise.resolve();
        }

        /**
         * Dispose plugin
         */
        dispose() {
            this.api.debug('Disposing plugin');

            if (this.fbContainer) {
                this.fbContainer.remove();
                this.fbContainer = null;
            }

            this.fbPlayer = null;

            // Restore native player
            if (this.api.video && this.options.replaceNativePlayer) {
                this.api.video.style.display = '';
            }

            this.api.debug('Plugin disposed');
        }
    }

    // Register plugin globally
    if (typeof window.registerMYETVPlugin === 'function') {
        window.registerMYETVPlugin('facebook', FacebookPlugin);
    } else {
        console.error('📘 MYETV Player plugin system not found');
    }

})();