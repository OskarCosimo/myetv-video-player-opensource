/**
 * MYETV Player - Cloudflare Stream Plugin
 * File: myetv-player-cloudflare-stream-plugin.js
 * Integrates Cloudflare Stream videos with full API control
 * Created by https://www.myetv.tv https://oskarcosimo.com
 */

(function () {
    'use strict';

    class CloudflareStreamPlugin {
        constructor(player, options = {}) {
            this.player = player;
            this.options = {
                // Video source
                videoId: options.videoId || null,          // Cloudflare Stream video ID
                videoUrl: options.videoUrl || null,        // Full video URL
                signedUrl: options.signedUrl || null,      // Signed URL for private videos

                // Account/Domain
                customerCode: options.customerCode || null, // Your Cloudflare account subdomain

                // Playback options
                autoplay: options.autoplay || false,
                muted: options.muted || false,
                loop: options.loop || false,
                preload: options.preload || 'metadata',    // 'none', 'metadata', 'auto'
                controls: options.controls !== false,
                defaultTextTrack: options.defaultTextTrack || null,

                // Player customization
                poster: options.poster || null,            // Custom poster image
                primaryColor: options.primaryColor || null, // Custom player color
                letterboxColor: options.letterboxColor || 'black',

                // Advanced options
                startTime: options.startTime || 0,         // Start position in seconds
                adUrl: options.adUrl || null,              // VAST ad tag URL

                // Plugin options
                debug: options.debug || false,
                replaceNativePlayer: options.replaceNativePlayer !== false,
                autoLoadFromData: options.autoLoadFromData !== false,
                responsive: options.responsive !== false,

                ...options
            };

            this.streamPlayer = null;
            this.streamIframe = null;
            this.streamContainer = null;
            this.isPlayerReady = false;

            // Get plugin API
            this.api = player.getPluginAPI ? player.getPluginAPI() : {
                player: player,
                video: player.video,
                container: player.container,
                controls: player.controls,
                debug: (msg) => {
                    if (this.options.debug) console.log('☁️ Cloudflare Stream:', msg);
                },
                triggerEvent: (event, data) => player.triggerEvent(event, data)
            };
        }

        /**
         * Setup plugin
         */
        setup() {
            this.api.debug('Setup started');

            // Auto-detect from data attributes
            if (this.options.autoLoadFromData) {
                this.autoDetectSource();
            }

            // Create player if we have a source
            if (this.options.videoId || this.options.videoUrl || this.options.signedUrl) {
                this.createStreamPlayer();
            }

            // Add custom methods
            this.addCustomMethods();

            this.api.debug('Setup completed');
        }

        /**
         * Auto-detect source from data attributes
         */
        autoDetectSource() {
            // Check data attributes
            const dataVideoId = this.api.video.getAttribute('data-cloudflare-video-id');
            const dataCustomerCode = this.api.video.getAttribute('data-cloudflare-customer');
            const dataVideoType = this.api.video.getAttribute('data-video-type');

            if (dataVideoId && dataVideoType === 'cloudflare') {
                this.options.videoId = dataVideoId;
                if (dataCustomerCode) {
                    this.options.customerCode = dataCustomerCode;
                }
                this.api.debug('Video ID detected: ' + dataVideoId);
                return;
            }

            // Check video src
            const src = this.api.video.src || this.api.video.currentSrc;
            if (src && this.isCloudflareUrl(src)) {
                this.extractFromUrl(src);
                return;
            }

            // Check source elements
            const sources = this.api.video.querySelectorAll('source');
            for (const source of sources) {
                const sourceSrc = source.getAttribute('src');
                const sourceType = source.getAttribute('type');

                if ((sourceType === 'video/cloudflare' || this.isCloudflareUrl(sourceSrc)) && sourceSrc) {
                    this.extractFromUrl(sourceSrc);
                    return;
                }
            }
        }

        /**
         * Check if URL is a Cloudflare Stream URL
         */
        isCloudflareUrl(url) {
            if (!url) return false;
            return /cloudflarestream\.com|videodelivery\.net/.test(url);
        }

        /**
         * Extract video ID and customer code from URL
         */
        extractFromUrl(url) {
            // Extract video ID from various URL formats
            // https://customer-code.cloudflarestream.com/video-id/manifest/video.m3u8
            // https://videodelivery.net/video-id

            const match1 = url.match(/cloudflarestream\.com\/([a-f0-9]+)/);
            const match2 = url.match(/videodelivery\.net\/([a-f0-9]+)/);
            const match3 = url.match(/([a-z0-9-]+)\.cloudflarestream\.com/);

            if (match1) {
                this.options.videoId = match1[1];
            } else if (match2) {
                this.options.videoId = match2[1];
            }

            if (match3) {
                this.options.customerCode = match3[1];
            }

            this.api.debug('Extracted - Video ID: ' + this.options.videoId + ', Customer: ' + this.options.customerCode);
        }

        /**
         * Create Cloudflare Stream player
         */
        createStreamPlayer() {
            if (!this.options.videoId && !this.options.videoUrl && !this.options.signedUrl) {
                this.api.debug('No video source provided');
                return;
            }

            // Hide native player
            if (this.options.replaceNativePlayer) {
                this.api.video.style.display = 'none';
            }

            // Create container
            this.streamContainer = document.createElement('div');
            this.streamContainer.className = 'cloudflare-stream-container';
            this.streamContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 100;
            `;

            // Build iframe URL
            const iframeSrc = this.buildIframeUrl();

            // Create iframe
            this.streamIframe = document.createElement('iframe');
            this.streamIframe.src = iframeSrc;
            this.streamIframe.style.cssText = `
                border: none;
                width: 100%;
                height: 100%;
            `;
            this.streamIframe.allow = 'accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;';
            this.streamIframe.allowFullscreen = true;

            this.streamContainer.appendChild(this.streamIframe);
            this.api.container.appendChild(this.streamContainer);

            // Setup Stream object for API access
            this.setupStreamAPI();

            this.api.debug('Cloudflare Stream player created');
            this.api.triggerEvent('cloudflare:playerready', {
                videoId: this.options.videoId
            });
        }

        /**
         * Build iframe URL with all options
         */
        buildIframeUrl() {
            let baseUrl;

            // Priority 1: Signed URL (for private videos)
            if (this.options.signedUrl) {
                return this.options.signedUrl;
            }

            // Priority 2: Full video URL
            if (this.options.videoUrl) {
                baseUrl = this.options.videoUrl;
            }
            // Priority 3: Build from video ID
            else if (this.options.videoId) {
                if (this.options.customerCode) {
                    baseUrl = `https://customer-${this.options.customerCode}.cloudflarestream.com/${this.options.videoId}/iframe`;
                } else {
                    baseUrl = `https://iframe.videodelivery.net/${this.options.videoId}`;
                }
            }

            // Add query parameters
            const params = new URLSearchParams();

            if (this.options.autoplay) params.append('autoplay', 'true');
            if (this.options.muted) params.append('muted', 'true');
            if (this.options.loop) params.append('loop', 'true');
            if (this.options.controls === false) params.append('controls', 'false');
            if (this.options.preload) params.append('preload', this.options.preload);
            if (this.options.poster) params.append('poster', encodeURIComponent(this.options.poster));
            if (this.options.primaryColor) params.append('primaryColor', this.options.primaryColor.replace('#', ''));
            if (this.options.startTime) params.append('startTime', this.options.startTime);
            if (this.options.adUrl) params.append('ad-url', encodeURIComponent(this.options.adUrl));
            if (this.options.defaultTextTrack) params.append('defaultTextTrack', this.options.defaultTextTrack);

            const queryString = params.toString();
            return queryString ? `${baseUrl}?${queryString}` : baseUrl;
        }

        /**
         * Setup Stream API for iframe communication
         */
        setupStreamAPI() {
            // Create Stream object wrapper
            this.streamPlayer = {
                iframe: this.streamIframe,

                // Playback control
                play: () => this.sendCommand('play'),
                pause: () => this.sendCommand('pause'),

                // Volume
                mute: () => this.sendCommand('mute'),
                unmute: () => this.sendCommand('unmute'),

                // Seeking
                seek: (time) => this.sendCommand('seek', time),

                // Properties (these require message passing)
                getCurrentTime: () => this.getProperty('currentTime'),
                getDuration: () => this.getProperty('duration'),
                getVolume: () => this.getProperty('volume'),
                getPaused: () => this.getProperty('paused'),
                getMuted: () => this.getProperty('muted'),

                // Setters
                setVolume: (volume) => this.sendCommand('volume', volume),
                setPlaybackRate: (rate) => this.sendCommand('playbackRate', rate)
            };

            // Listen for messages from iframe
            this.setupMessageListener();

            this.isPlayerReady = true;
        }

        /**
         * Send command to iframe
         */
        sendCommand(command, value) {
            if (!this.streamIframe || !this.streamIframe.contentWindow) {
                return Promise.reject('Player not ready');
            }

            const message = value !== undefined
                ? { event: command, value: value }
                : { event: command };

            this.streamIframe.contentWindow.postMessage(message, '*');
            return Promise.resolve();
        }

        /**
         * Get property from iframe
         */
        getProperty(property) {
            return new Promise((resolve) => {
                // Note: Cloudflare Stream uses standard video events
                // Property getters work via event listeners
                const handler = (e) => {
                    if (e.data && e.data.event === property) {
                        window.removeEventListener('message', handler);
                        resolve(e.data.value);
                    }
                };
                window.addEventListener('message', handler);
                this.sendCommand('get' + property.charAt(0).toUpperCase() + property.slice(1));
            });
        }

        /**
         * Setup message listener for iframe events
         */
        setupMessageListener() {
            window.addEventListener('message', (event) => {
                if (!event.data || !event.data.event) return;

                const data = event.data;

                // Map Cloudflare Stream events to standard events
                switch (data.event) {
                    case 'play':
                        this.api.triggerEvent('play', {});
                        this.api.triggerEvent('playing', {});
                        break;
                    case 'pause':
                        this.api.triggerEvent('pause', {});
                        break;
                    case 'ended':
                        this.api.triggerEvent('ended', {});
                        break;
                    case 'timeupdate':
                        this.api.triggerEvent('timeupdate', {
                            currentTime: data.currentTime,
                            duration: data.duration
                        });
                        break;
                    case 'volumechange':
                        this.api.triggerEvent('volumechange', {
                            volume: data.volume,
                            muted: data.muted
                        });
                        break;
                    case 'loadedmetadata':
                        this.api.triggerEvent('loadedmetadata', data);
                        this.api.triggerEvent('cloudflare:ready', {});
                        break;
                    case 'error':
                        this.api.triggerEvent('error', data);
                        this.api.triggerEvent('cloudflare:error', data);
                        break;
                }
            });
        }

        /**
         * Add custom methods to player
         */
        addCustomMethods() {
            // Load video
            this.api.player.loadCloudflareVideo = (videoId, customerCode) => {
                return this.loadVideo(videoId, customerCode);
            };

            // Get Stream player
            this.api.player.getCloudflarePlayer = () => {
                return this.streamPlayer;
            };
        }

        /**
         * Play
         */
        play() {
            if (!this.streamPlayer) {
                return Promise.reject('Player not initialized');
            }
            return this.streamPlayer.play();
        }

        /**
         * Pause
         */
        pause() {
            if (!this.streamPlayer) {
                return Promise.reject('Player not initialized');
            }
            return this.streamPlayer.pause();
        }

        /**
         * Seek
         */
        seek(seconds) {
            if (!this.streamPlayer) {
                return Promise.reject('Player not initialized');
            }
            return this.streamPlayer.seek(seconds);
        }

        /**
         * Get current time
         */
        getCurrentTime() {
            if (!this.streamPlayer) {
                return Promise.reject('Player not initialized');
            }
            return this.streamPlayer.getCurrentTime();
        }

        /**
         * Get duration
         */
        getDuration() {
            if (!this.streamPlayer) {
                return Promise.reject('Player not initialized');
            }
            return this.streamPlayer.getDuration();
        }

        /**
         * Set volume
         */
        setVolume(volume) {
            if (!this.streamPlayer) {
                return Promise.reject('Player not initialized');
            }
            return this.streamPlayer.setVolume(volume);
        }

        /**
         * Get volume
         */
        getVolume() {
            if (!this.streamPlayer) {
                return Promise.reject('Player not initialized');
            }
            return this.streamPlayer.getVolume();
        }

        /**
         * Mute
         */
        mute() {
            if (!this.streamPlayer) {
                return Promise.reject('Player not initialized');
            }
            return this.streamPlayer.mute();
        }

        /**
         * Unmute
         */
        unmute() {
            if (!this.streamPlayer) {
                return Promise.reject('Player not initialized');
            }
            return this.streamPlayer.unmute();
        }

        /**
         * Get muted state
         */
        getMuted() {
            if (!this.streamPlayer) {
                return Promise.reject('Player not initialized');
            }
            return this.streamPlayer.getMuted();
        }

        /**
         * Get paused state
         */
        getPaused() {
            if (!this.streamPlayer) {
                return Promise.reject('Player not initialized');
            }
            return this.streamPlayer.getPaused();
        }

        /**
         * Set playback rate
         */
        setPlaybackRate(rate) {
            if (!this.streamPlayer) {
                return Promise.reject('Player not initialized');
            }
            return this.streamPlayer.setPlaybackRate(rate);
        }

        /**
         * Load new video
         */
        loadVideo(videoId, customerCode) {
            this.options.videoId = videoId;
            if (customerCode) {
                this.options.customerCode = customerCode;
            }

            // Remove existing player
            if (this.streamContainer) {
                this.streamContainer.remove();
            }

            // Create new player
            this.createStreamPlayer();

            this.api.triggerEvent('cloudflare:videoloaded', { videoId, customerCode });
            return Promise.resolve(videoId);
        }

        /**
         * Dispose plugin
         */
        dispose() {
            this.api.debug('Disposing plugin');

            if (this.streamContainer) {
                this.streamContainer.remove();
                this.streamContainer = null;
            }

            this.streamPlayer = null;
            this.streamIframe = null;

            // Restore native player
            if (this.api.video && this.options.replaceNativePlayer) {
                this.api.video.style.display = '';
            }

            this.api.debug('Plugin disposed');
        }
    }

    // Register plugin globally
    if (typeof window.registerMYETVPlugin === 'function') {
        window.registerMYETVPlugin('cloudflare', CloudflareStreamPlugin);
    } else {
        console.error('☁️ MYETV Player plugin system not found');
    }

})();