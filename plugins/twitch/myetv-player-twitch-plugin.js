/**
 * MYETV Player - Twitch Plugin
 * File: myetv-player-twitch-plugin.js
 * Integrates Twitch live streams and VODs with full API control
 * Created by https://www.myetv.tv https://oskarcosimo.com
 */

(function () {
    'use strict';

    class TwitchPlugin {
        constructor(player, options = {}) {
            this.player = player;
            this.options = {
                // Video source (channel for live, video for VOD, collection for collections)
                channel: options.channel || null,
                video: options.video || null,
                collection: options.collection || null,

                // Parent domains (REQUIRED for embedding)
                parent: options.parent || [window.location.hostname],

                // Player dimensions
                width: options.width || '100%',
                height: options.height || '100%',

                // Playback options
                autoplay: options.autoplay !== false,
                muted: options.muted || false,
                time: options.time || '0h0m0s', // Start time for VODs (e.g., '1h30m45s')

                // UI options
                allowfullscreen: options.allowfullscreen !== false,

                // Plugin options
                debug: options.debug || false,
                replaceNativePlayer: options.replaceNativePlayer !== false,
                autoLoadFromData: options.autoLoadFromData !== false,

                ...options
            };

            this.twitchPlayer = null;
            this.twitchContainer = null;
            this.isPlayerReady = false;
            this.isLive = false;

            // Get plugin API
            this.api = player.getPluginAPI ? player.getPluginAPI() : {
                player: player,
                video: player.video,
                container: player.container,
                controls: player.controls,
                debug: (msg) => {
                    if (this.options.debug) console.log('🎮 Twitch Plugin:', msg);
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

            // Load Twitch Player SDK
            this.loadTwitchSDK().then(() => {
                if (this.options.channel || this.options.video || this.options.collection) {
                    this.createTwitchPlayer();
                }
            }).catch(error => {
                console.error('🎮 Twitch Plugin: Failed to load SDK', error);
            });

            // Add custom methods to player
            this.addCustomMethods();

            this.api.debug('Setup completed');
        }

        /**
         * Auto-detect source from data attributes
         */
        autoDetectSource() {
            // Check data attributes
            const dataChannel = this.api.video.getAttribute('data-twitch-channel');
            const dataVideo = this.api.video.getAttribute('data-twitch-video');
            const dataVideoType = this.api.video.getAttribute('data-video-type');

            if (dataChannel && dataVideoType === 'twitch') {
                this.options.channel = dataChannel;
                this.api.debug('Channel detected: ' + dataChannel);
                return;
            }

            if (dataVideo && dataVideoType === 'twitch') {
                this.options.video = dataVideo;
                this.api.debug('Video detected: ' + dataVideo);
                return;
            }

            // Check video src
            const src = this.api.video.src || this.api.video.currentSrc;
            if (src && this.isTwitchUrl(src)) {
                this.extractFromUrl(src);
                return;
            }

            // Check source elements
            const sources = this.api.video.querySelectorAll('source');
            for (const source of sources) {
                const sourceSrc = source.getAttribute('src');
                const sourceType = source.getAttribute('type');

                if ((sourceType === 'video/twitch' || this.isTwitchUrl(sourceSrc)) && sourceSrc) {
                    this.extractFromUrl(sourceSrc);
                    return;
                }
            }
        }

        /**
         * Check if URL is a Twitch URL
         */
        isTwitchUrl(url) {
            if (!url) return false;
            return /twitch\.tv\/(videos\/|[^/]+\/?$)/.test(url);
        }

        /**
         * Extract channel or video from URL
         */
        extractFromUrl(url) {
            // Extract video ID: https://www.twitch.tv/videos/123456789
            const videoMatch = url.match(/twitch\.tv\/videos\/(\d+)/);
            if (videoMatch) {
                this.options.video = videoMatch[1];
                this.api.debug('Video ID extracted: ' + this.options.video);
                return;
            }

            // Extract channel: https://www.twitch.tv/channelname
            const channelMatch = url.match(/twitch\.tv\/([^/]+)\/?$/);
            if (channelMatch) {
                this.options.channel = channelMatch[1];
                this.api.debug('Channel extracted: ' + this.options.channel);
                return;
            }
        }

        /**
         * Load Twitch Player SDK
         */
        loadTwitchSDK() {
            return new Promise((resolve, reject) => {
                // Check if already loaded
                if (window.Twitch && window.Twitch.Player) {
                    this.api.debug('Twitch SDK already loaded');
                    resolve();
                    return;
                }

                // Inject script
                const script = document.createElement('script');
                script.src = 'https://player.twitch.tv/js/embed/v1.js';
                script.async = true;
                script.onload = () => {
                    this.api.debug('Twitch SDK loaded');
                    resolve();
                };
                script.onerror = () => reject(new Error('Failed to load Twitch SDK'));
                document.head.appendChild(script);
            });
        }

        /**
         * Create Twitch player
         */
        createTwitchPlayer() {
            if (!this.options.channel && !this.options.video && !this.options.collection) {
                this.api.debug('No channel, video, or collection specified');
                return;
            }

            // Hide native player
            if (this.options.replaceNativePlayer) {
                this.api.video.style.display = 'none';
            }

            // Create container
            this.twitchContainer = document.createElement('div');
            this.twitchContainer.id = 'twitch-player-' + Date.now();

            // Fixed a schermo intero con z-index basso
            this.twitchContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 1;
    `;

            this.api.container.appendChild(this.twitchContainer);

            // Configure options
            const playerOptions = {
                width: '100%',
                height: '100%',
                parent: this.options.parent,
                autoplay: this.options.autoplay,
                muted: this.options.muted,
                allowfullscreen: this.options.allowfullscreen
            };

            // Add source
            if (this.options.channel) {
                playerOptions.channel = this.options.channel;
                this.isLive = true;
            } else if (this.options.video) {
                playerOptions.video = this.options.video;
                playerOptions.time = this.options.time;
                this.isLive = false;
            } else if (this.options.collection) {
                playerOptions.collection = this.options.collection;
                this.isLive = false;
            }

            // Create player
            this.twitchPlayer = new Twitch.Player(this.twitchContainer.id, playerOptions);

            // Setup event listeners
            this.setupEventListeners();

            this.api.debug('Twitch player created');
            this.api.triggerEvent('twitchplugin:playerready', {
                channel: this.options.channel,
                video: this.options.video,
                isLive: this.isLive
            });
        }

        /**
         * Setup event listeners
         */
        setupEventListeners() {
            if (!this.twitchPlayer) return;

            // Player ready
            this.twitchPlayer.addEventListener(Twitch.Player.READY, () => {
                this.isPlayerReady = true;
                this.api.debug('Player ready');

                // Nascondi il loading overlay
                const loadingOverlay = this.api.container.querySelector('.loading-overlay');
                if (loadingOverlay) {
                    loadingOverlay.style.display = 'none';
                    this.api.debug('Loading overlay hidden');
                }

                // Nascondi il poster
                const posterOverlay = this.api.container.querySelector('.video-poster-overlay');
                if (posterOverlay) {
                    posterOverlay.style.display = 'none';
                    this.api.debug('Poster hidden');
                }

                // FIX CONTROLBAR: Rendi la controlbar fixed e posizionala in basso
                if (this.api.controls) {
                    this.api.controls.style.position = 'fixed';
                    this.api.controls.style.bottom = '0';
                    this.api.controls.style.left = '0';
                    this.api.controls.style.right = '0';
                    this.api.controls.style.width = '100%';
                    this.api.controls.style.zIndex = '1000';
                    this.api.controls.classList.add('show');
                    this.api.debug('Controls positioned and shown');
                }

                // FIX TITLE OVERLAY: Posiziona anche il title overlay se esiste
                const titleOverlay = this.api.container.querySelector('.title-overlay');
                if (titleOverlay) {
                    titleOverlay.style.position = 'fixed';
                    titleOverlay.style.top = '0';
                    titleOverlay.style.left = '0';
                    titleOverlay.style.right = '0';
                    titleOverlay.style.width = '100%';
                    titleOverlay.style.zIndex = '1000';
                    this.api.debug('Title overlay positioned');
                }

                // Trigghera gli eventi
                this.api.triggerEvent('loadeddata', {});
                this.api.triggerEvent('loadedmetadata', {});
                this.api.triggerEvent('canplay', {});
                this.api.triggerEvent('canplaythrough', {});

                this.api.triggerEvent('twitchplugin:ready', {});
            });

            // Playing
            this.twitchPlayer.addEventListener(Twitch.Player.PLAYING, () => {
                this.api.debug('Playing');

                // Nascondi loading se ancora visibile
                const loadingOverlay = this.api.container.querySelector('.loading-overlay');
                if (loadingOverlay) loadingOverlay.style.display = 'none';

                this.api.triggerEvent('play', {});
                this.api.triggerEvent('playing', {});
            });

            // Pause
            this.twitchPlayer.addEventListener(Twitch.Player.PAUSE, () => {
                this.api.debug('Paused');
                this.api.triggerEvent('pause', {});
            });

            // Ended
            this.twitchPlayer.addEventListener(Twitch.Player.ENDED, () => {
                this.api.debug('Ended');
                this.api.triggerEvent('ended', {});
            });

            // Online (stream went live)
            this.twitchPlayer.addEventListener(Twitch.Player.ONLINE, () => {
                this.api.debug('Stream online');
                this.api.triggerEvent('twitchplugin:online', {});
            });

            // Offline (stream went offline)
            this.twitchPlayer.addEventListener(Twitch.Player.OFFLINE, () => {
                this.api.debug('Stream offline');
                this.api.triggerEvent('twitchplugin:offline', {});
            });

            // Playback blocked (autoplay restrictions)
            this.twitchPlayer.addEventListener(Twitch.Player.PLAYBACK_BLOCKED, () => {
                this.api.debug('Playback blocked - user interaction required');
                this.api.triggerEvent('twitchplugin:playbackblocked', {});
            });
        }

        /**
         * Add custom methods to player instance
         */
        addCustomMethods() {
            // Load channel
            this.api.player.loadTwitchChannel = (channel) => {
                return this.loadChannel(channel);
            };

            // Load video
            this.api.player.loadTwitchVideo = (videoId, timestamp) => {
                return this.loadVideo(videoId, timestamp);
            };

            // Get Twitch player instance
            this.api.player.getTwitchPlayer = () => {
                return this.twitchPlayer;
            };

            // Check if live
            this.api.player.isTwitchLive = () => {
                return this.isLive;
            };
        }

        /**
         * Play
         */
        play() {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }
            this.twitchPlayer.play();
            return Promise.resolve();
        }

        /**
         * Pause
         */
        pause() {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }
            this.twitchPlayer.pause();
            return Promise.resolve();
        }

        /**
         * Seek (VODs only)
         */
        seek(seconds) {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }
            if (this.isLive) {
                console.warn('🎮 Twitch Plugin: Cannot seek in live streams');
                return Promise.reject('Cannot seek in live streams');
            }
            this.twitchPlayer.seek(seconds);
            return Promise.resolve(seconds);
        }

        /**
         * Get current time
         */
        getCurrentTime() {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }
            return Promise.resolve(this.twitchPlayer.getCurrentTime());
        }

        /**
         * Get duration (VODs only)
         */
        getDuration() {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }
            if (this.isLive) {
                return Promise.resolve(0);
            }
            return Promise.resolve(this.twitchPlayer.getDuration());
        }

        /**
         * Set volume
         */
        setVolume(volume) {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }
            this.twitchPlayer.setVolume(volume);
            return Promise.resolve(volume);
        }

        /**
         * Get volume
         */
        getVolume() {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }
            return Promise.resolve(this.twitchPlayer.getVolume());
        }

        /**
         * Mute
         */
        setMuted(muted) {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }
            this.twitchPlayer.setMuted(muted);
            return Promise.resolve(muted);
        }

        /**
         * Get muted state
         */
        getMuted() {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }
            return Promise.resolve(this.twitchPlayer.getMuted());
        }

        /**
         * Get quality
         */
        getQuality() {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }
            return Promise.resolve(this.twitchPlayer.getQuality());
        }

        /**
         * Set quality
         */
        setQuality(quality) {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }
            this.twitchPlayer.setQuality(quality);
            return Promise.resolve(quality);
        }

        /**
         * Get available qualities
         */
        getQualities() {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }
            return Promise.resolve(this.twitchPlayer.getPlaybackStats().qualitiesAvailable);
        }

        /**
         * Get channel name
         */
        getChannel() {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }
            return Promise.resolve(this.twitchPlayer.getChannel());
        }

        /**
         * Get video ID
         */
        getVideo() {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }
            return Promise.resolve(this.twitchPlayer.getVideo());
        }

        /**
         * Get playback stats
         */
        getPlaybackStats() {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }
            return Promise.resolve(this.twitchPlayer.getPlaybackStats());
        }

        /**
         * Check if paused
         */
        isPaused() {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }
            return Promise.resolve(this.twitchPlayer.isPaused());
        }

        /**
         * Load channel (live stream)
         */
        loadChannel(channel) {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }
            this.options.channel = channel;
            this.options.video = null;
            this.isLive = true;
            this.twitchPlayer.setChannel(channel);
            this.api.triggerEvent('twitchplugin:channelloaded', { channel });
            return Promise.resolve(channel);
        }

        /**
         * Load video (VOD)
         */
        loadVideo(videoId, timestamp = '0h0m0s') {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }
            this.options.video = videoId;
            this.options.channel = null;
            this.isLive = false;
            this.twitchPlayer.setVideo(videoId, timestamp);
            this.api.triggerEvent('twitchplugin:videoloaded', { video: videoId, timestamp });
            return Promise.resolve(videoId);
        }

        /**
         * Load collection
         */
        loadCollection(collectionId, videoId) {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }
            this.options.collection = collectionId;
            this.isLive = false;
            this.twitchPlayer.setCollection(collectionId, videoId);
            this.api.triggerEvent('twitchplugin:collectionloaded', { collection: collectionId, video: videoId });
            return Promise.resolve(collectionId);
        }

        /**
         * Dispose plugin
         */
        dispose() {
            this.api.debug('Disposing plugin');

            if (this.twitchContainer) {
                this.twitchContainer.remove();
                this.twitchContainer = null;
            }

            this.twitchPlayer = null;

            // Restore native player
            if (this.api.video && this.options.replaceNativePlayer) {
                this.api.video.style.display = '';
            }

            this.api.debug('Plugin disposed');
        }
    }

    // Register plugin globally
    if (typeof window.registerMYETVPlugin === 'function') {
        window.registerMYETVPlugin('twitch', TwitchPlugin);
    } else {
        console.error('🎮 MYETV Player plugin system not found');
    }

})();