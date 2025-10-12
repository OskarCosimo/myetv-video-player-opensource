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
                controls: options.controls !== false,
                dnt: options.dnt || false, // Do Not Track
                loop: options.loop || false,
                muted: options.muted || false,
                pip: options.pip !== false, // Picture-in-Picture
                playsinline: options.playsinline !== false,
                portrait: options.portrait !== false,
                quality: options.quality || 'auto', // auto, 360p, 540p, 720p, 1080p, 2k, 4k
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
            this.vimeoContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
            `;

            this.player.container.appendChild(this.vimeoContainer);

            // Prepare Vimeo options
            const vimeoOptions = this.prepareVimeoOptions();

            // Create Vimeo Player instance
            this.vimeoPlayer = new Vimeo.Player(this.vimeoContainer, vimeoOptions);

            // Setup event listeners
            this.setupEventListeners();

            // Load available qualities
            this.loadQualities();

            // Override native methods FIRST
            this.overrideNativeMethods();

            // sync with native controls
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

            // Set embed options
            if (this.options.autopause !== undefined) vimeoOptions.autopause = this.options.autopause;
            if (this.options.autoplay) vimeoOptions.autoplay = this.options.autoplay;
            if (this.options.background) vimeoOptions.background = this.options.background;
            if (this.options.byline !== undefined) vimeoOptions.byline = this.options.byline;
            if (this.options.color) vimeoOptions.color = this.options.color;
            if (this.options.controls !== undefined) vimeoOptions.controls = this.options.controls;
            if (this.options.dnt) vimeoOptions.dnt = this.options.dnt;
            if (this.options.loop) vimeoOptions.loop = this.options.loop;
            if (this.options.muted) vimeoOptions.muted = this.options.muted;
            if (this.options.pip !== undefined) vimeoOptions.pip = this.options.pip;
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
            // Already a number
            if (typeof input === 'number') return input;

            // Extract from URL
            const match = input.match(/vimeo\.com\/(\d+)/);
            if (match) return parseInt(match[1]);

            // Try parsing as number
            const parsed = parseInt(input);
            if (!isNaN(parsed)) return parsed;

            return input;
        }

        /**
         * Extract full Vimeo URL
         */
        extractVimeoUrl(input) {
            // Already a full URL
            if (input.startsWith('http')) return input;

            // Build URL from ID
            return `https://vimeo.com/${input}`;
        }

        /**
         * Setup event listeners
         */
        setupEventListeners() {
            // Play event
            this.vimeoPlayer.on('play', (data) => {
                this.player.triggerEvent('play', data);
                if (this.options.debug) console.log('🎬 Vimeo: play', data);
            });

            // Playing event
            this.vimeoPlayer.on('playing', (data) => {
                this.player.triggerEvent('playing', data);
            });

            // Pause event
            this.vimeoPlayer.on('pause', (data) => {
                this.player.triggerEvent('pause', data);
                if (this.options.debug) console.log('🎬 Vimeo: pause', data);
            });

            // Ended event
            this.vimeoPlayer.on('ended', (data) => {
                this.player.triggerEvent('ended', data);
                if (this.options.debug) console.log('🎬 Vimeo: ended', data);
            });

            // Time update event
            this.vimeoPlayer.on('timeupdate', (data) => {
                this.player.triggerEvent('timeupdate', {
                    currentTime: data.seconds,
                    duration: data.duration,
                    percent: data.percent
                });
            });

            // Progress event (buffering)
            this.vimeoPlayer.on('progress', (data) => {
                this.player.triggerEvent('progress', data);
            });

            // Seeking event
            this.vimeoPlayer.on('seeking', (data) => {
                this.player.triggerEvent('seeking', data);
            });

            // Seeked event
            this.vimeoPlayer.on('seeked', (data) => {
                this.player.triggerEvent('seeked', data);
            });

            // Volume change event
            this.vimeoPlayer.on('volumechange', (data) => {
                this.player.triggerEvent('volumechange', data);
            });

            // Playback rate change event
            this.vimeoPlayer.on('playbackratechange', (data) => {
                this.player.triggerEvent('playbackratechange', data);
            });

            // Buffer start event
            this.vimeoPlayer.on('bufferstart', () => {
                this.player.triggerEvent('waiting');
                if (this.options.debug) console.log('🎬 Vimeo: bufferstart');
            });

            // Buffer end event
            this.vimeoPlayer.on('bufferend', () => {
                this.player.triggerEvent('canplay');
                if (this.options.debug) console.log('🎬 Vimeo: bufferend');
            });

            // Quality change event
            this.vimeoPlayer.on('qualitychange', (data) => {
                this.player.triggerEvent('qualitychange', data);
                if (this.options.debug) console.log('🎬 Vimeo: quality changed to', data.quality);
            });

            // Fullscreen change event
            this.vimeoPlayer.on('fullscreenchange', (data) => {
                this.player.triggerEvent('fullscreenchange', data);
            });

            // Error event
            this.vimeoPlayer.on('error', (data) => {
                console.error('🎬 Vimeo error:', data);
                this.player.triggerEvent('error', data);
            });

            // Loaded event
            this.vimeoPlayer.on('loaded', (data) => {
                this.player.triggerEvent('loadedmetadata', data);
                if (this.options.debug) console.log('🎬 Vimeo: loaded', data);
            });

            // Text track change
            this.vimeoPlayer.on('texttrackchange', (data) => {
                this.player.triggerEvent('texttrackchange', data);
            });

            // Chapter change
            this.vimeoPlayer.on('chapterchange', (data) => {
                this.player.triggerEvent('chapterchange', data);
            });

            // Picture-in-Picture events
            this.vimeoPlayer.on('enterpictureinpicture', () => {
                this.player.triggerEvent('enterpictureinpicture');
            });

            this.vimeoPlayer.on('leavepictureinpicture', () => {
                this.player.triggerEvent('leavepictureinpicture');
            });
        }

        /**
         * Load available qualities
         */
        loadQualities() {
            this.vimeoPlayer.getQualities().then(qualities => {
                this.availableQualities = qualities;

                // Trigger custom event with qualities
                this.player.triggerEvent('qualitiesloaded', { qualities });

                if (this.options.debug) {
                    console.log('🎬 Vimeo: Available qualities', qualities);
                }

                // Set initial quality if specified
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

            // Override play method
            const originalPlay = video.play.bind(video);
            video.play = () => {
                vimeoPlayer.play().catch(err => console.error('Play error:', err));
                return Promise.resolve();
            };

            // Override pause method
            const originalPause = video.pause.bind(video);
            video.pause = () => {
                vimeoPlayer.pause().catch(err => console.error('Pause error:', err));
            };

            // Override currentTime setter/getter
            Object.defineProperty(video, 'currentTime', {
                get: function () {
                    // Return cached value immediately
                    return video._cachedCurrentTime || 0;
                },
                set: function (time) {
                    vimeoPlayer.setCurrentTime(time).catch(err => console.error('Seek error:', err));
                }
            });

            // Override volume setter/getter
            Object.defineProperty(video, 'volume', {
                get: function () {
                    return video._cachedVolume || 1;
                },
                set: function (volume) {
                    vimeoPlayer.setVolume(volume).catch(err => console.error('Volume error:', err));
                }
            });

            // Override muted setter/getter
            Object.defineProperty(video, 'muted', {
                get: function () {
                    return video._cachedMuted || false;
                },
                set: function (muted) {
                    vimeoPlayer.setMuted(muted).catch(err => console.error('Mute error:', err));
                }
            });

            // Override playbackRate setter/getter
            Object.defineProperty(video, 'playbackRate', {
                get: function () {
                    return video._cachedPlaybackRate || 1;
                },
                set: function (rate) {
                    vimeoPlayer.setPlaybackRate(rate).catch(err => console.error('Speed error:', err));
                }
            });

            // Override duration getter
            Object.defineProperty(video, 'duration', {
                get: function () {
                    return video._cachedDuration || 0;
                }
            });

            // Override paused getter
            Object.defineProperty(video, 'paused', {
                get: function () {
                    return video._cachedPaused !== false;
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

                // Dispatch native timeupdate event
                const event = new Event('timeupdate');
                video.dispatchEvent(event);
            });

            this.vimeoPlayer.on('play', () => {
                video._cachedPaused = false;

                // Hide loading spinner
                if (this.player.elements && this.player.elements.loading) {
                    this.player.elements.loading.style.display = 'none';
                }

                // Dispatch native play event
                const event = new Event('play');
                video.dispatchEvent(event);
            });

            this.vimeoPlayer.on('playing', () => {
                video._cachedPaused = false;

                // Hide loading spinner
                if (this.player.elements && this.player.elements.loading) {
                    this.player.elements.loading.style.display = 'none';
                }

                // Dispatch native playing event
                const event = new Event('playing');
                video.dispatchEvent(event);
            });

            this.vimeoPlayer.on('pause', () => {
                video._cachedPaused = true;

                // Dispatch native pause event
                const event = new Event('pause');
                video.dispatchEvent(event);
            });

            this.vimeoPlayer.on('volumechange', (data) => {
                video._cachedVolume = data.volume;

                // Dispatch native volumechange event
                const event = new Event('volumechange');
                video.dispatchEvent(event);
            });

            this.vimeoPlayer.on('playbackratechange', (data) => {
                video._cachedPlaybackRate = data.playbackRate;

                // Dispatch native ratechange event
                const event = new Event('ratechange');
                video.dispatchEvent(event);
            });

            this.vimeoPlayer.on('loaded', (data) => {
                video._cachedDuration = data.duration;

                // Hide loading spinner
                if (this.player.elements && this.player.elements.loading) {
                    this.player.elements.loading.style.display = 'none';
                }

                // Dispatch native loadedmetadata event
                const event = new Event('loadedmetadata');
                video.dispatchEvent(event);
            });

            this.vimeoPlayer.on('ended', () => {
                video._cachedPaused = true;

                // Dispatch native ended event
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
         * Format time in MM:SS or HH:MM:SS
         */
        formatTime(seconds) {
            if (isNaN(seconds)) return '00:00';

            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);

            if (hours > 0) {
                return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            }

            return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }

        /**
 * Request Picture-in-Picture
 */
        requestPictureInPicture() {
            if (!this.vimeoPlayer) return Promise.reject('Player not initialized');
            return this.vimeoPlayer.requestPictureInPicture();
        }

        /**
         * Exit Picture-in-Picture
         */
        exitPictureInPicture() {
            if (!this.vimeoPlayer) return Promise.reject('Player not initialized');
            return this.vimeoPlayer.exitPictureInPicture();
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
         * Get video metadata via oEmbed API
         */
        async getVideoMetadata(videoIdOrUrl) {
            const videoUrl = this.extractVimeoUrl(videoIdOrUrl);
            const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(videoUrl)}`;

            try {
                const response = await fetch(oembedUrl);
                const data = await response.json();

                if (this.options.debug) {
                    console.log('🎬 Vimeo: Video metadata', data);
                }

                return {
                    title: data.title,
                    description: data.description,
                    thumbnail: data.thumbnail_url,
                    thumbnailLarge: data.thumbnail_url.replace(/_\d+x\d+/, '_1280x720'),
                    duration: data.duration,
                    author: data.author_name,
                    authorUrl: data.author_url,
                    width: data.width,
                    height: data.height,
                    html: data.html
                };
            } catch (error) {
                console.error('🎬 Vimeo: Failed to fetch metadata', error);
                throw error;
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
         * Get current time
         */
        getCurrentTime() {
            if (!this.vimeoPlayer) return Promise.reject('Player not initialized');
            return this.vimeoPlayer.getCurrentTime();
        }

        /**
         * Set current time
         */
        setCurrentTime(seconds) {
            if (!this.vimeoPlayer) return Promise.reject('Player not initialized');
            return this.vimeoPlayer.setCurrentTime(seconds);
        }

        /**
         * Get duration
         */
        getDuration() {
            if (!this.vimeoPlayer) return Promise.reject('Player not initialized');
            return this.vimeoPlayer.getDuration();
        }

        /**
         * Get volume
         */
        getVolume() {
            if (!this.vimeoPlayer) return Promise.reject('Player not initialized');
            return this.vimeoPlayer.getVolume();
        }

        /**
         * Set volume
         */
        setVolume(volume) {
            if (!this.vimeoPlayer) return Promise.reject('Player not initialized');
            return this.vimeoPlayer.setVolume(volume);
        }

        /**
         * Get muted state
         */
        getMuted() {
            if (!this.vimeoPlayer) return Promise.reject('Player not initialized');
            return this.vimeoPlayer.getMuted();
        }

        /**
         * Set muted state
         */
        setMuted(muted) {
            if (!this.vimeoPlayer) return Promise.reject('Player not initialized');
            return this.vimeoPlayer.setMuted(muted);
        }

        /**
         * Get playback rate
         */
        getPlaybackRate() {
            if (!this.vimeoPlayer) return Promise.reject('Player not initialized');
            return this.vimeoPlayer.getPlaybackRate();
        }

        /**
         * Set playback rate
         */
        setPlaybackRate(rate) {
            if (!this.vimeoPlayer) return Promise.reject('Player not initialized');
            return this.vimeoPlayer.setPlaybackRate(rate);
        }

        /**
         * Request fullscreen
         */
        requestFullscreen() {
            if (!this.vimeoPlayer) return Promise.reject('Player not initialized');
            return this.vimeoPlayer.requestFullscreen();
        }

        /**
         * Exit fullscreen
         */
        exitFullscreen() {
            if (!this.vimeoPlayer) return Promise.reject('Player not initialized');
            return this.vimeoPlayer.exitFullscreen();
        }

        /**
         * Get text tracks
         */
        getTextTracks() {
            if (!this.vimeoPlayer) return Promise.reject('Player not initialized');
            return this.vimeoPlayer.getTextTracks();
        }

        /**
         * Enable text track
         */
        enableTextTrack(language, kind) {
            if (!this.vimeoPlayer) return Promise.reject('Player not initialized');
            return this.vimeoPlayer.enableTextTrack(language, kind);
        }

        /**
         * Disable text track
         */
        disableTextTrack() {
            if (!this.vimeoPlayer) return Promise.reject('Player not initialized');
            return this.vimeoPlayer.disableTextTrack();
        }

        /**
         * Dispose plugin
         */
        dispose() {
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