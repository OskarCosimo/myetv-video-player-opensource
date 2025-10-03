/**
 * MYETV Player - YouTube Plugin (Enhanced)
 * File: myetv-player-youtube-plugin.js
 */

(function () {
    'use strict';

    class YouTubePlugin {
        constructor(player, options = {}) {
            this.player = player;
            this.options = {
                videoId: options.videoId || null,  // Direct video ID
                apiKey: options.apiKey || null,
                autoplay: options.autoplay !== undefined ? options.autoplay : false,
                showYouTubeUI: options.showYouTubeUI !== undefined ? options.showYouTubeUI : false,
                autoLoadFromData: options.autoLoadFromData !== undefined ? options.autoLoadFromData : true,
                quality: options.quality || 'default', // 'default', 'hd720', 'hd1080'
                ...options
            };

            this.ytPlayer = null;
            this.isYouTubeReady = false;
            this.videoId = this.options.videoId;

            // Get plugin API
            this.api = player.getPluginAPI();
        }

        /**
         * Setup plugin (called automatically after instantiation)
         */
        setup() {
            this.api.debug('YouTube plugin setup started');

            // Load YouTube IFrame API
            this.loadYouTubeAPI();

            // Add custom methods to player
            this.addPlayerMethods();

            // Register hooks
            this.registerHooks();

            // Auto-load video ID from various sources
            if (this.options.autoLoadFromData) {
                this.autoDetectVideoId();
            }

            // If video ID is provided in options, load it immediately
            if (this.videoId) {
                this.waitForAPIThenLoad();
            }

            this.api.debug('YouTube plugin setup completed');
        }

        /**
         * Add custom methods to player instance
         */
        addPlayerMethods() {
            // Load YouTube video by ID
            this.player.loadYouTubeVideo = (videoId, options = {}) => {
                return this.loadVideo(videoId, options);
            };

            // Get current YouTube video ID
            this.player.getYouTubeVideoId = () => {
                return this.videoId;
            };

            // Check if YouTube is active
            this.player.isYouTubeActive = () => {
                return this.ytPlayer !== null;
            };
        }

        /**
         * Register plugin hooks
         */
        registerHooks() {
            // Check for YouTube URL before play
            this.api.registerHook('beforePlay', (data) => {
                this.checkForYouTubeUrl();
            });
        }

        /**
         * Auto-detect video ID from various sources
         */
        autoDetectVideoId() {
            // Priority 1: Check data-video-id attribute
            const dataVideoId = this.api.video.getAttribute('data-video-id');
            const dataVideoType = this.api.video.getAttribute('data-video-type');

            if (dataVideoId && dataVideoType === 'youtube') {
                this.videoId = dataVideoId;
                this.api.debug('YouTube video ID detected from data-video-id: ' + this.videoId);
                return;
            }

            // Priority 2: Check video source URL
            const src = this.api.video.src || this.api.video.currentSrc;
            if (src) {
                const extractedId = this.extractYouTubeVideoId(src);
                if (extractedId) {
                    this.videoId = extractedId;
                    this.api.debug('YouTube video ID detected from src: ' + this.videoId);
                    return;
                }
            }

            // Priority 3: Check source elements
            const sources = this.api.video.querySelectorAll('source');
            for (const source of sources) {
                const sourceSrc = source.getAttribute('src');
                const sourceType = source.getAttribute('type');

                if (sourceType === 'video/youtube' || sourceType === 'video/x-youtube') {
                    const extractedId = this.extractYouTubeVideoId(sourceSrc);
                    if (extractedId) {
                        this.videoId = extractedId;
                        this.api.debug('YouTube video ID detected from source element: ' + this.videoId);
                        return;
                    }
                }
            }
        }

        /**
         * Wait for API to be ready then load video
         */
        waitForAPIThenLoad() {
            if (this.isYouTubeReady) {
                this.loadVideo(this.videoId);
            } else {
                // Wait for API to be ready
                const checkInterval = setInterval(() => {
                    if (this.isYouTubeReady) {
                        clearInterval(checkInterval);
                        this.loadVideo(this.videoId);
                    }
                }, 100);
            }
        }

        /**
         * Load YouTube IFrame API
         */
        loadYouTubeAPI() {
            if (window.YT && window.YT.Player) {
                this.isYouTubeReady = true;
                this.api.debug('YouTube API already loaded');
                return;
            }

            // Load YouTube IFrame API script
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            // Set callback for when API is ready
            window.onYouTubeIframeAPIReady = () => {
                this.isYouTubeReady = true;
                this.api.debug('YouTube API loaded and ready');

                // Trigger custom event
                this.api.triggerEvent('youtubeplugin:ready', {});
            };
        }

        /**
         * Check if current video source is a YouTube URL
         */
        checkForYouTubeUrl() {
            const src = this.api.video.src || this.api.video.currentSrc;
            const videoId = this.extractYouTubeVideoId(src);

            if (videoId && videoId !== this.videoId) {
                this.loadVideo(videoId);
                return true;
            }

            return false;
        }

        /**
         * Extract YouTube video ID from URL
         * Supports various YouTube URL formats
         * @param {String} url - YouTube URL or video ID
         * @returns {String|null} Video ID or null
         */
        extractYouTubeVideoId(url) {
            if (!url) return null;

            // Remove whitespace
            url = url.trim();

            const patterns = [
                // Standard watch URL
                /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
                // Shortened youtu.be URL
                /(?:youtu\.be\/)([^&\n?#]+)/,
                // Embed URL
                /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
                // Direct video ID (11 characters)
                /^([a-zA-Z0-9_-]{11})$/
            ];

            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match && match[1]) {
                    return match[1];
                }
            }

            return null;
        }

        /**
         * Load YouTube video by ID
         * @param {String} videoId - YouTube video ID
         * @param {Object} options - Load options
         */
        loadVideo(videoId, options = {}) {
            if (!videoId) {
                this.api.debug('No video ID provided to loadVideo()');
                return;
            }

            if (!this.isYouTubeReady) {
                this.api.debug('YouTube API not ready yet, waiting...');
                setTimeout(() => this.loadVideo(videoId, options), 100);
                return;
            }

            this.videoId = videoId;

            // Hide native video element
            this.api.video.style.display = 'none';

            // Create YouTube player container if not exists
            if (!this.ytPlayerContainer) {
                this.ytPlayerContainer = document.createElement('div');
                this.ytPlayerContainer.id = 'yt-player-' + Date.now();
                this.ytPlayerContainer.className = 'yt-player-container';

                // Style to match video element
                this.ytPlayerContainer.style.position = 'absolute';
                this.ytPlayerContainer.style.top = '0';
                this.ytPlayerContainer.style.left = '0';
                this.ytPlayerContainer.style.width = '100%';
                this.ytPlayerContainer.style.height = '100%';

                this.api.container.insertBefore(this.ytPlayerContainer, this.api.controls);
            }

            // Destroy existing player if present
            if (this.ytPlayer) {
                this.ytPlayer.destroy();
            }

            // Merge options
            const playerVars = {
                autoplay: this.options.autoplay ? 1 : 0,
                controls: this.options.showYouTubeUI ? 1 : 0,
                modestbranding: 1,
                rel: 0,
                ...options.playerVars
            };

            // Initialize YouTube player
            this.ytPlayer = new YT.Player(this.ytPlayerContainer.id, {
                videoId: videoId,
                playerVars: playerVars,
                events: {
                    'onReady': (event) => this.onPlayerReady(event),
                    'onStateChange': (event) => this.onPlayerStateChange(event),
                    'onError': (event) => this.onPlayerError(event)
                }
            });

            this.api.debug('YouTube video loaded: ' + videoId);
            this.api.triggerEvent('youtubeplugin:videoloaded', { videoId });
        }

        /**
         * YouTube player ready callback
         */
        onPlayerReady(event) {
            this.api.debug('YouTube player ready');

            // Sync controls with YouTube player
            this.syncControls();

            // Set quality if specified
            if (this.options.quality && this.options.quality !== 'default') {
                this.ytPlayer.setPlaybackQuality(this.options.quality);
            }

            this.api.triggerEvent('youtubeplugin:playerready', {});
        }

        /**
         * YouTube player state change callback
         */
        onPlayerStateChange(event) {
            switch (event.data) {
                case YT.PlayerState.PLAYING:
                    this.api.triggerEvent('played', {});
                    break;
                case YT.PlayerState.PAUSED:
                    this.api.triggerEvent('paused', {});
                    break;
                case YT.PlayerState.ENDED:
                    this.api.triggerEvent('ended', {});
                    break;
                case YT.PlayerState.BUFFERING:
                    this.api.debug('YouTube player buffering');
                    break;
            }
        }

        /**
         * YouTube player error callback
         */
        onPlayerError(event) {
            const errorMessages = {
                2: 'Invalid video ID',
                5: 'HTML5 player error',
                100: 'Video not found or private',
                101: 'Video not allowed to be played in embedded players',
                150: 'Video not allowed to be played in embedded players'
            };

            const errorMsg = errorMessages[event.data] || 'Unknown error';
            this.api.debug('YouTube player error: ' + errorMsg);

            this.api.triggerEvent('youtubeplugin:error', {
                errorCode: event.data,
                errorMessage: errorMsg
            });
        }

        /**
         * Sync player controls with YouTube player
         */
        syncControls() {
            // Override play/pause methods
            const originalPlay = this.player.play;
            const originalPause = this.player.pause;

            this.player.play = () => {
                if (this.ytPlayer && this.ytPlayer.playVideo) {
                    this.ytPlayer.playVideo();
                } else {
                    originalPlay.call(this.player);
                }
            };

            this.player.pause = () => {
                if (this.ytPlayer && this.ytPlayer.pauseVideo) {
                    this.ytPlayer.pauseVideo();
                } else {
                    originalPause.call(this.player);
                }
            };

            // Sync time updates
            if (this.ytPlayer) {
                setInterval(() => {
                    if (this.ytPlayer && this.ytPlayer.getCurrentTime) {
                        const currentTime = this.ytPlayer.getCurrentTime();
                        const duration = this.ytPlayer.getDuration();

                        // Update progress bar if available
                        if (this.api.player.progressFilled && duration) {
                            const progress = (currentTime / duration) * 100;
                            this.api.player.progressFilled.style.width = progress + '%';
                            if (this.api.player.progressHandle) {
                                this.api.player.progressHandle.style.left = progress + '%';
                            }
                        }
                    }
                }, 250);
            }
        }

        /**
         * Dispose plugin
         */
        dispose() {
            this.api.debug('YouTube plugin disposed');

            // Destroy YouTube player
            if (this.ytPlayer && this.ytPlayer.destroy) {
                this.ytPlayer.destroy();
                this.ytPlayer = null;
            }

            // Remove container
            if (this.ytPlayerContainer) {
                this.ytPlayerContainer.remove();
                this.ytPlayerContainer = null;
            }

            // Show native video element again
            if (this.api.video) {
                this.api.video.style.display = '';
            }
        }
    }

    // Register plugin globally
    window.registerMYETVPlugin('youtube', YouTubePlugin);

})();
