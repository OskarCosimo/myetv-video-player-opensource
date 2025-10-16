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
                channel: options.channel || null,
                video: options.video || null,
                collection: options.collection || null,
                parent: options.parent || [window.location.hostname],
                width: options.width || '100%',
                height: options.height || '100%',
                autoplay: options.autoplay !== false,
                muted: options.muted || false,
                time: options.time || '0h0m0s',
                allowfullscreen: options.allowfullscreen !== false,
                debug: options.debug || false,
                replaceNativePlayer: options.replaceNativePlayer !== false,
                autoLoadFromData: options.autoLoadFromData !== false,
                ...options
            };

            this.twitchPlayer = null;
            this.twitchContainer = null;
            this.twitchIframe = null;
            this.isPlayerReady = false;
            this.isLive = false;
            this.isPausedState = true; // Track state manually
            this.extractedBrandLogo = null; // Store reference to extracted brand logo
            this.brandLogoHideTimer = null; // Timer for auto-hide

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

        setup() {
            if (this.api.player.options.debug) console.log('🎮 Twitch Plugin: Setup started');
            if (this.options.autoLoadFromData) {
                this.autoDetectSource();
            }

            this.loadTwitchSDK().then(() => {
                if (this.options.channel || this.options.video || this.options.collection) {
                    this.createTwitchPlayer();
                }
            }).catch(error => {
                console.error('🎮 Twitch Plugin: Failed to load SDK', error);
            });

            this.addCustomMethods();
            this.syncControls();
            if (this.api.player.options.debug) console.log('🎮 Twitch Plugin: Setup completed');
        }

        syncControls() {
            if (this.api.player.options.debug) console.log('🎮 Twitch Plugin: Syncing controls');

            // Override play method
            const originalPlay = this.player.play;
            this.player.play = () => {
                if (this.twitchPlayer && this.isPlayerReady) {
                    if (this.api.player.options.debug) console.log('🎮 Twitch Plugin: Play called');
                    try {
                        this.twitchPlayer.play();
                    } catch (error) {
                        if (this.api.player.options.debug) console.error('🎮 Twitch Plugin: Play error:', error);
                    }
                } else {
                    if (originalPlay) originalPlay.call(this.player);
                }
            };

            // Override pause method
            const originalPause = this.player.pause;
            this.player.pause = () => {
                if (this.twitchPlayer && this.isPlayerReady) {
                    if (this.api.player.options.debug) console.log('🎮 Twitch Plugin: Pause called');
                    try {
                        this.twitchPlayer.pause();
                    } catch (error) {
                        if (this.api.player.options.debug) console.error('🎮 Twitch Plugin: Pause error:', error);
                    }
                } else {
                    if (originalPause) originalPause.call(this.player);
                }
            };

            // DON'T override paused getter - let the UI handle it via icon changes

            // Hide PiP and Speed buttons
            const pipButton = this.api.container.querySelector('.pip-btn');
            if (pipButton) pipButton.style.display = 'none';

            const speedButton = this.api.container.querySelector('.speed-btn');
            if (speedButton) speedButton.style.display = 'none';
        }

        autoDetectSource() {
            const dataChannel = this.api.video.getAttribute('data-twitch-channel');
            const dataVideo = this.api.video.getAttribute('data-twitch-video');
            const dataVideoType = this.api.video.getAttribute('data-video-type');

            if (dataChannel && dataVideoType === 'twitch') {
                this.options.channel = dataChannel;
                if (this.api.player.options.debug) console.log('🎮 Twitch Plugin: Channel detected:', dataChannel);
                return;
            }

            if (dataVideo && dataVideoType === 'twitch') {
                this.options.video = dataVideo;
                if (this.api.player.options.debug) console.log('🎮 Twitch Plugin: Video detected:', dataVideo);
                return;
            }

            const src = this.api.video.src || this.api.video.currentSrc;
            if (src && this.isTwitchUrl(src)) {
                this.extractFromUrl(src);
                return;
            }

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

        isTwitchUrl(url) {
            if (!url) return false;
            return /twitch\.tv\/(videos\/|[^/]+\/?$)/.test(url);
        }

        extractFromUrl(url) {
            const videoMatch = url.match(/twitch\.tv\/videos\/(\d+)/);
            if (videoMatch) {
                this.options.video = videoMatch[1];
                if (this.api.player.options.debug) console.log('🎮 Twitch Plugin: Video ID extracted:', this.options.video);
                return;
            }

            const channelMatch = url.match(/twitch\.tv\/([^/]+)\/?$/);
            if (channelMatch) {
                this.options.channel = channelMatch[1];
                if (this.api.player.options.debug) console.log('🎮 Twitch Plugin: Channel extracted:', this.options.channel);
                return;
            }
        }

        loadTwitchSDK() {
            return new Promise((resolve, reject) => {
                if (window.Twitch && window.Twitch.Player) {
                    if (this.api.player.options.debug) console.log('🎮 Twitch Plugin: SDK already loaded');
                    resolve();
                    return;
                }

                const script = document.createElement('script');
                script.src = 'https://player.twitch.tv/js/embed/v1.js';
                script.async = true;
                script.onload = () => {
                    if (this.api.player.options.debug) console.log('🎮 Twitch Plugin: SDK loaded');
                    resolve();
                };
                script.onerror = () => reject(new Error('Failed to load Twitch SDK'));
                document.head.appendChild(script);
            });
        }

        createTwitchPlayer() {
            if (!this.options.channel && !this.options.video && !this.options.collection) {
                if (this.api.player.options.debug) console.log('🎮 Twitch Plugin: No channel, video, or collection specified');
                return;
            }

            if (this.options.replaceNativePlayer) {
                this.api.video.style.display = 'none';
            }

            this.twitchContainer = document.createElement('div');
            this.twitchContainer.id = 'twitch-player-' + Date.now();
            this.twitchContainer.style.cssText = `
position: fixed;
top: 0;
left: 0;
width: 100vw;
height: 100vh;
z-index: 1;
`;

            this.api.container.appendChild(this.twitchContainer);

            const playerOptions = {
                width: '100%',
                height: '100%',
                parent: this.options.parent,
                autoplay: false,
                muted: this.options.muted,
                allowfullscreen: this.options.allowfullscreen
            };

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

            this.twitchPlayer = new Twitch.Player(this.twitchContainer.id, playerOptions);
            this.setupEventListeners();

            if (this.api.player.options.debug) console.log('🎮 Twitch Plugin: Player created');

            this.api.triggerEvent('twitchplugin:playerready', {
                channel: this.options.channel,
                video: this.options.video,
                isLive: this.isLive
            });
        }

        setupEventListeners() {
            if (!this.twitchPlayer) return;

            this.twitchPlayer.addEventListener(Twitch.Player.READY, () => {
                this.isPlayerReady = true;
                this.isPausedState = true; // Start paused

                if (this.api.player.options.debug) console.log('🎮 Twitch Plugin: Player ready - paused state:', this.isPausedState);

                this.twitchIframe = this.twitchContainer.querySelector('iframe');
                if (this.twitchIframe) {
                    if (this.api.player.options.debug) console.log('🎮 Twitch Plugin: Iframe ready');
                }

                const loadingOverlay = this.api.container.querySelector('.loading-overlay');
                if (loadingOverlay) loadingOverlay.style.display = 'none';

                const posterOverlay = this.api.container.querySelector('.video-poster-overlay');
                if (posterOverlay) posterOverlay.style.display = 'none';

                if (this.api.video) {
                    this.api.video.style.display = 'none';
                }

                this.api.container.style.height = '100%';

                // **CRITICAL: Extract brand logo BEFORE hiding controlbar**
                this.extractAndRepositionBrandLogo();

                // **Hide controlbar completely AFTER extracting brand logo**
                if (this.api.controls) {
                    this.api.controls.style.display = 'none';
                    if (this.api.player.options.debug) console.log('🎮 Twitch Plugin: Controlbar hidden');
                }

                // **Hide title overlay (Twitch already has it)**
                const titleOverlay = this.api.container.querySelector('.title-overlay');
                if (titleOverlay) {
                    titleOverlay.style.display = 'none';
                    if (this.api.player.options.debug) console.log('🎮 Twitch Plugin: Title overlay hidden');
                }

                this.setupResizeAndFullscreenListeners();
                this.api.triggerEvent('twitchplugin:ready', {});
            });

            this.twitchPlayer.addEventListener(Twitch.Player.PLAYING, () => {
                if (this.api.player.options.debug) {
                    console.log('🟢 Twitch Plugin: PLAYING event');
                }

                this.isPausedState = false;

                // Update UI icons
                const loadingOverlay = this.api.container.querySelector('.loading-overlay');
                if (loadingOverlay) loadingOverlay.style.display = 'none';

                const playIcon = this.api.container.querySelector('.play-icon');
                const pauseIcon = this.api.container.querySelector('.pause-icon');
                if (playIcon && pauseIcon) {
                    playIcon.classList.add('hidden');
                    pauseIcon.classList.remove('hidden');
                }

                // Dispatch native video events
                const playEvent = new Event('play');
                const playingEvent = new Event('playing');
                this.api.video.dispatchEvent(playEvent);
                this.api.video.dispatchEvent(playingEvent);

                // **Manually trigger the 'played' callbacks**
                const targetPlayer = this.api.player || this.player;
                if (targetPlayer.eventCallbacks && targetPlayer.eventCallbacks['played']) {
                    const eventData = {
                        type: 'played',
                        timestamp: Date.now(),
                        player: targetPlayer,
                        currentTime: this.getCurrentTime(),
                        duration: this.getDuration()
                    };

                    targetPlayer.eventCallbacks['played'].forEach((callback, index) => {
                        try {
                            callback(eventData);
                            if (this.api.player.options.debug) console.log(`✅ Played callback #${index} executed`);
                        } catch (error) {
                            console.error(`❌ Error in played callback #${index}:`, error);
                        }
                    });
                }
            });

            this.twitchPlayer.addEventListener(Twitch.Player.PAUSE, () => {
                if (this.api.player.options.debug) {
                    console.log('🔴 Twitch Plugin: PAUSE event');
                }

                this.isPausedState = true;

                const playIcon = this.api.container.querySelector('.play-icon');
                const pauseIcon = this.api.container.querySelector('.pause-icon');
                if (playIcon && pauseIcon) {
                    playIcon.classList.remove('hidden');
                    pauseIcon.classList.add('hidden');
                }

                // Dispatch native pause event
                const pauseEvent = new Event('pause');
                this.api.video.dispatchEvent(pauseEvent);

                // **Manually trigger the 'paused' callbacks**
                const targetPlayer = this.api.player || this.player;
                if (targetPlayer.eventCallbacks && targetPlayer.eventCallbacks['paused']) {
                    const eventData = {
                        type: 'paused',
                        timestamp: Date.now(),
                        player: targetPlayer,
                        currentTime: this.getCurrentTime(),
                        duration: this.getDuration()
                    };

                    targetPlayer.eventCallbacks['paused'].forEach((callback, index) => {
                        try {
                            callback(eventData);
                            if (this.api.player.options.debug) console.log(`✅ Paused callback #${index} executed`);
                        } catch (error) {
                            console.error(`❌ Error in paused callback #${index}:`, error);
                        }
                    });
                }
            });

            this.twitchPlayer.addEventListener(Twitch.Player.ENDED, () => {
                if (this.api.player.options.debug) console.log('🎮 Twitch Plugin: Ended');
                this.isPausedState = true;

                const playIcon = this.api.container.querySelector('.play-icon');
                const pauseIcon = this.api.container.querySelector('.pause-icon');
                if (playIcon && pauseIcon) {
                    playIcon.classList.remove('hidden');
                    pauseIcon.classList.add('hidden');
                }

                this.api.triggerEvent('ended', {});
            });

            this.twitchPlayer.addEventListener(Twitch.Player.ONLINE, () => {
                if (this.api.player.options.debug) console.log('🎮 Twitch Plugin: Stream online');
                this.api.triggerEvent('twitchplugin:online', {});
            });

            this.twitchPlayer.addEventListener(Twitch.Player.OFFLINE, () => {
                if (this.api.player.options.debug) console.log('🎮 Twitch Plugin: Stream offline');
                this.isPausedState = true;
                this.api.triggerEvent('twitchplugin:offline', {});
            });

            this.twitchPlayer.addEventListener(Twitch.Player.PLAYBACK_BLOCKED, () => {
                if (this.api.player.options.debug) console.log('🎮 Twitch Plugin: Playback blocked');
                this.isPausedState = true;
                this.api.triggerEvent('twitchplugin:playbackblocked', {});
                console.warn('🎮 Twitch: Click on the video to start playback');
            });
        }

        /**
        * Extract brandlogo from controlbar and reposition it in BOTTOM-RIGHT corner
        * With auto-hide behavior like the controlbar
        * MUST be called BEFORE hiding the controlbar
        */
        extractAndRepositionBrandLogo() {
            // Find brandlogo inside controlbar (correct selector: .brand-logo with hyphen)
            const brandLogo = this.api.container.querySelector('.brand-logo');

            if (brandLogo) {
                // Store reference
                this.extractedBrandLogo = brandLogo;

                // Store original parent for restoration
                if (!brandLogo._originalParent) {
                    brandLogo._originalParent = brandLogo.parentElement;
                }

                // Extract from controlbar and append directly to container
                // This way it won't be hidden when controlbar is hidden
                this.api.container.appendChild(brandLogo);

                // Apply new positioning styles - BOTTOM-RIGHT corner, closer to Twitch controls
                brandLogo.style.cssText = `
position: absolute !important;
bottom: 35px !important;
right: 20px !important;
z-index: 2000 !important;
pointer-events: auto !important;
display: block !important;
opacity: 0 !important;
transition: opacity 0.3s ease !important;
`;

                // Setup auto-hide behavior (like controlbar)
                this.setupBrandLogoAutoHide(brandLogo);

                if (this.api.player.options.debug) {
                    console.log('🎮 Twitch Plugin: Brand logo extracted with auto-hide behavior');
                }
            } else {
                if (this.api.player.options.debug) {
                    console.log('🎮 Twitch Plugin: No brand logo found (.brand-logo)');
                }
            }
        }

        /**
        * Setup auto-hide behavior for brand logo (shows on mousemove, hides after 3 seconds)
        */
        setupBrandLogoAutoHide(brandLogo) {
            // Show logo initially for 3 seconds, then hide
            this.showBrandLogo();
            this.scheduleBrandLogoHide();

            // Mouse move handler - show logo when mouse moves
            const mouseMoveHandler = () => {
                this.showBrandLogo();
                this.scheduleBrandLogoHide();
            };

            // Add mouse move listener to container
            this.api.container.addEventListener('mousemove', mouseMoveHandler);
            this.api.container.addEventListener('mouseenter', mouseMoveHandler);

            // Store handler for cleanup
            if (!this.api.container._brandLogoMouseHandler) {
                this.api.container._brandLogoMouseHandler = mouseMoveHandler;
            }

            // Mouse leave handler - hide immediately when mouse leaves
            const mouseLeaveHandler = () => {
                this.hideBrandLogo();
            };

            this.api.container.addEventListener('mouseleave', mouseLeaveHandler);

            // Store handler for cleanup
            if (!this.api.container._brandLogoLeaveHandler) {
                this.api.container._brandLogoLeaveHandler = mouseLeaveHandler;
            }
        }

        /**
        * Show brand logo (fade in)
        */
        showBrandLogo() {
            if (this.extractedBrandLogo) {
                this.extractedBrandLogo.style.opacity = '0.8';
            }
        }

        /**
        * Hide brand logo (fade out)
        */
        hideBrandLogo() {
            if (this.extractedBrandLogo) {
                this.extractedBrandLogo.style.opacity = '0';
            }
        }

        /**
        * Schedule brand logo to hide after 3 seconds of inactivity
        */
        scheduleBrandLogoHide() {
            // Clear existing timer
            if (this.brandLogoHideTimer) {
                clearTimeout(this.brandLogoHideTimer);
            }

            // Set new timer to hide after 3 seconds
            this.brandLogoHideTimer = setTimeout(() => {
                this.hideBrandLogo();
            }, 3000);
        }

        setupResizeAndFullscreenListeners() {
            this.resizeHandler = () => {
                this.api.container.style.height = '100%';
                // Logo is already positioned with fixed coordinates, no need to reposition
            };

            window.addEventListener('resize', this.resizeHandler);

            this.fullscreenChangeHandler = () => {
                setTimeout(() => {
                    this.api.container.style.height = '100%';
                }, 100);
            };

            document.addEventListener('fullscreenchange', this.fullscreenChangeHandler);
            document.addEventListener('webkitfullscreenchange', this.fullscreenChangeHandler);
            document.addEventListener('mozfullscreenchange', this.fullscreenChangeHandler);
            document.addEventListener('MSFullscreenChange', this.fullscreenChangeHandler);
        }

        addCustomMethods() {
            this.api.player.loadTwitchChannel = (channel) => {
                return this.loadChannel(channel);
            };

            this.api.player.loadTwitchVideo = (videoId, timestamp) => {
                return this.loadVideo(videoId, timestamp);
            };

            this.api.player.getTwitchPlayer = () => {
                return this.twitchPlayer;
            };

            this.api.player.isTwitchLive = () => {
                return this.isLive;
            };
        }

        play() {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }

            this.twitchPlayer.play();
            return Promise.resolve();
        }

        pause() {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }

            this.twitchPlayer.pause();
            return Promise.resolve();
        }

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

        getCurrentTime() {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }

            return Promise.resolve(this.twitchPlayer.getCurrentTime());
        }

        getDuration() {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }

            if (this.isLive) {
                return Promise.resolve(0);
            }

            return Promise.resolve(this.twitchPlayer.getDuration());
        }

        setVolume(volume) {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }

            this.twitchPlayer.setVolume(volume);
            return Promise.resolve(volume);
        }

        getVolume() {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }

            return Promise.resolve(this.twitchPlayer.getVolume());
        }

        setMuted(muted) {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }

            this.twitchPlayer.setMuted(muted);
            return Promise.resolve(muted);
        }

        getMuted() {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }

            return Promise.resolve(this.twitchPlayer.getMuted());
        }

        getQuality() {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }

            return Promise.resolve(this.twitchPlayer.getQuality());
        }

        setQuality(quality) {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }

            this.twitchPlayer.setQuality(quality);
            return Promise.resolve(quality);
        }

        getQualities() {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }

            return Promise.resolve(this.twitchPlayer.getPlaybackStats().qualitiesAvailable);
        }

        getChannel() {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }

            return Promise.resolve(this.twitchPlayer.getChannel());
        }

        getVideo() {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }

            return Promise.resolve(this.twitchPlayer.getVideo());
        }

        getPlaybackStats() {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }

            return Promise.resolve(this.twitchPlayer.getPlaybackStats());
        }

        isPaused() {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }

            return Promise.resolve(this.isPausedState);
        }

        loadChannel(channel) {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }

            this.options.channel = channel;
            this.options.video = null;
            this.isLive = true;
            this.isPausedState = true;

            this.twitchPlayer.setChannel(channel);
            this.api.triggerEvent('twitchplugin:channelloaded', { channel });

            return Promise.resolve(channel);
        }

        loadVideo(videoId, timestamp = '0h0m0s') {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }

            this.options.video = videoId;
            this.options.channel = null;
            this.isLive = false;
            this.isPausedState = true;

            this.twitchPlayer.setVideo(videoId, timestamp);
            this.api.triggerEvent('twitchplugin:videoloaded', { video: videoId, timestamp });

            return Promise.resolve(videoId);
        }

        loadCollection(collectionId, videoId) {
            if (!this.twitchPlayer) {
                return Promise.reject('Player not initialized');
            }

            this.options.collection = collectionId;
            this.isLive = false;
            this.isPausedState = true;

            this.twitchPlayer.setCollection(collectionId, videoId);
            this.api.triggerEvent('twitchplugin:collectionloaded', { collection: collectionId, video: videoId });

            return Promise.resolve(collectionId);
        }

        dispose() {
            if (this.api.player.options.debug) console.log('🎮 Twitch Plugin: Disposing');

            // Clear brand logo hide timer
            if (this.brandLogoHideTimer) {
                clearTimeout(this.brandLogoHideTimer);
                this.brandLogoHideTimer = null;
            }

            // Remove mouse event listeners for brand logo auto-hide
            if (this.api.container._brandLogoMouseHandler) {
                this.api.container.removeEventListener('mousemove', this.api.container._brandLogoMouseHandler);
                this.api.container.removeEventListener('mouseenter', this.api.container._brandLogoMouseHandler);
                delete this.api.container._brandLogoMouseHandler;
            }

            if (this.api.container._brandLogoLeaveHandler) {
                this.api.container.removeEventListener('mouseleave', this.api.container._brandLogoLeaveHandler);
                delete this.api.container._brandLogoLeaveHandler;
            }

            // Restore brand logo to original position in controlbar
            if (this.extractedBrandLogo) {
                // Remove inline styles
                this.extractedBrandLogo.removeAttribute('style');

                // Restore to original parent
                if (this.extractedBrandLogo._originalParent) {
                    this.extractedBrandLogo._originalParent.appendChild(this.extractedBrandLogo);
                }

                this.extractedBrandLogo = null;

                if (this.api.player.options.debug) console.log('🎮 Twitch Plugin: Brand logo restored');
            }

            if (this.twitchContainer) {
                this.twitchContainer.remove();
                this.twitchContainer = null;
            }

            if (this.resizeHandler) {
                window.removeEventListener('resize', this.resizeHandler);
                this.resizeHandler = null;
            }

            if (this.fullscreenChangeHandler) {
                document.removeEventListener('fullscreenchange', this.fullscreenChangeHandler);
                document.removeEventListener('webkitfullscreenchange', this.fullscreenChangeHandler);
                document.removeEventListener('mozfullscreenchange', this.fullscreenChangeHandler);
                document.removeEventListener('MSFullscreenChange', this.fullscreenChangeHandler);
                this.fullscreenChangeHandler = null;
            }

            this.twitchPlayer = null;
            this.twitchIframe = null;

            // Show controls again
            if (this.api.controls) {
                this.api.controls.style.display = '';
            }

            if (this.api.video && this.options.replaceNativePlayer) {
                this.api.video.style.display = '';
            }

            if (this.api.player.options.debug) console.log('🎮 Twitch Plugin: Disposed');
        }
    }

    if (typeof window.registerMYETVPlugin === 'function') {
        window.registerMYETVPlugin('twitch', TwitchPlugin);
    } else {
        console.error('🎮 MYETV Player plugin system not found');
    }

})();