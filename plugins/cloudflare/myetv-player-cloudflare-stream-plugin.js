/**
 * MYETV Player - Cloudflare Stream Plugin
 * File: myetv-player-cloudflare-stream-plugin.js
 * Integrates Cloudflare Stream videos with full API control
 * Supports iframe player and direct HLS/DASH manifest URLs
 * Auto-loads required libraries from cdnjs (hls.js and dash.js) on demand
 * Created by https://www.myetv.tv https://oskarcosimo.com
 */

(function () {
    'use strict';

    // CDN URLs for libraries (using Cloudflare CDN)
    const LIBRARIES = {
        hlsjs: 'https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.18/hls.min.js',
        dashjs: 'https://cdnjs.cloudflare.com/ajax/libs/dashjs/5.0.3/modern/umd/dash.all.min.js'
    };

    // Track loaded libraries
    const loadedLibraries = {
        hlsjs: false,
        dashjs: false
    };

    // Library loading promises
    const loadingPromises = {};

    /**
     * Dynamically load a JavaScript library
     */
    function loadLibrary(name, url) {
        if (loadingPromises[name]) {
            return loadingPromises[name];
        }

        if (loadedLibraries[name]) {
            return Promise.resolve();
        }

        if (name === 'hlsjs' && typeof Hls !== 'undefined') {
            loadedLibraries[name] = true;
            return Promise.resolve();
        }
        if (name === 'dashjs' && typeof dashjs !== 'undefined') {
            loadedLibraries[name] = true;
            return Promise.resolve();
        }

        loadingPromises[name] = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;

            script.onload = () => {
                loadedLibraries[name] = true;
                console.log('☁️ Cloudflare Stream: ' + name + ' loaded successfully');
                resolve();
            };

            script.onerror = () => {
                const error = new Error('Failed to load ' + name + ' from ' + url);
                console.error('☁️ Cloudflare Stream:', error);
                reject(error);
            };

            document.head.appendChild(script);
        });

        return loadingPromises[name];
    }

    class CloudflareStreamPlugin {
        constructor(player, options = {}) {
            this.player = player;
            this.options = {
                videoId: options.videoId || null,
                videoUrl: options.videoUrl || null,
                signedUrl: options.signedUrl || null,
                manifestUrl: options.manifestUrl || null,
                customerCode: options.customerCode || null,
                useNativePlayer: options.useNativePlayer !== false,
                preferIframe: options.preferIframe || false,
                autoLoadLibraries: options.autoLoadLibraries !== false,
                hlsLibraryUrl: options.hlsLibraryUrl || LIBRARIES.hlsjs,
                dashLibraryUrl: options.dashLibraryUrl || LIBRARIES.dashjs,
                autoplay: options.autoplay || false,
                muted: options.muted || false,
                loop: options.loop || false,
                preload: options.preload || 'auto',
                controls: options.controls !== false,
                defaultTextTrack: options.defaultTextTrack || null,
                poster: options.poster || null,
                primaryColor: options.primaryColor || null,
                letterboxColor: options.letterboxColor || 'black',
                startTime: options.startTime || 0,
                adUrl: options.adUrl || null,
                hlsConfig: options.hlsConfig || {},
                defaultQuality: options.defaultQuality || 'auto',
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
            this.isUsingIframe = false;
            this.isUsingManifest = false;
            this.hlsInstance = null;
            this.manifestType = null;
            this.loadingCheckInterval = null;
            this.availableQualities = [];
            this.currentQuality = null;
            this.qualityMonitorInterval = null;

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

            if (this.options.autoLoadFromData) {
                this.autoDetectSource();
            }

            if (this.options.videoId || this.options.videoUrl || this.options.signedUrl || this.options.manifestUrl) {
                this.createStreamPlayer();
            }

            this.addCustomMethods();
            this.api.debug('Setup completed');
        }

        /**
         * Auto-detect source from data attributes
         */
        autoDetectSource() {
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

            const src = this.api.video.src || this.api.video.currentSrc;
            if (src && this.isCloudflareUrl(src)) {
                this.extractFromUrl(src);
                return;
            }

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

        isCloudflareUrl(url) {
            if (!url) return false;
            return /cloudflarestream\.com|videodelivery\.net/.test(url);
        }

        isHLSManifest(url) {
            if (!url) return false;
            return /\.m3u8(\?.*)?$/.test(url) || /\/manifest\/video\.m3u8/.test(url);
        }

        isDASHManifest(url) {
            if (!url) return false;
            return /\.mpd(\?.*)?$/.test(url) || /\/manifest\/video\.mpd/.test(url);
        }

        extractFromUrl(url) {
            if (this.isHLSManifest(url)) {
                this.manifestType = 'hls';
                this.options.manifestUrl = url;
                this.api.debug('HLS manifest detected: ' + url);
            } else if (this.isDASHManifest(url)) {
                this.manifestType = 'dash';
                this.options.manifestUrl = url;
                this.api.debug('DASH manifest detected: ' + url);
            }

            const match1 = url.match(/cloudflarestream\.com\/([a-f0-9]+)/);
            const match2 = url.match(/videodelivery\.net\/([a-f0-9]+)/);
            const match3 = url.match(/customer-([a-z0-9-]+)\.cloudflarestream\.com/);

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

        createStreamPlayer() {
            if (!this.options.videoId && !this.options.videoUrl && !this.options.signedUrl && !this.options.manifestUrl) {
                this.api.debug('No video source provided');
                return;
            }

            const shouldUseManifest = (this.options.manifestUrl || this.manifestType) &&
                this.options.useNativePlayer &&
                !this.options.preferIframe;

            if (shouldUseManifest) {
                this.api.debug('Using native player with manifest');
                this.createManifestPlayer();
            } else {
                this.api.debug('Using iframe player');
                this.createIframePlayer();
            }
        }

        async createManifestPlayer() {
            this.isUsingManifest = true;

            let manifestUrl = this.options.manifestUrl;
            if (!manifestUrl && this.options.videoId) {
                manifestUrl = this.buildManifestUrl();
            }

            if (!manifestUrl) {
                this.api.debug('No manifest URL available');
                return;
            }

            if (!this.manifestType) {
                if (this.isHLSManifest(manifestUrl)) {
                    this.manifestType = 'hls';
                } else if (this.isDASHManifest(manifestUrl)) {
                    this.manifestType = 'dash';
                }
            }

            this.api.debug('Loading manifest: ' + manifestUrl + ' (type: ' + this.manifestType + ')');

            const videoElement = this.api.video;
            this.setupManifestEvents(videoElement);

            if (this.options.muted) videoElement.muted = true;
            if (this.options.loop) videoElement.loop = true;
            if (this.options.poster) videoElement.poster = this.options.poster;
            videoElement.preload = this.options.preload;

            try {
                if (this.manifestType === 'hls') {
                    await this.loadHLS(videoElement, manifestUrl);
                } else if (this.manifestType === 'dash') {
                    await this.loadDASH(videoElement, manifestUrl);
                } else {
                    videoElement.src = manifestUrl;
                }

                this.isPlayerReady = true;
                this.forceReadyState();

                if (this.options.autoplay) {
                    setTimeout(() => {
                        videoElement.play().catch(err => {
                            this.api.debug('Autoplay failed: ' + err.message);
                        });
                    }, 100);
                }

                this.api.triggerEvent('cloudflare:playerready', {
                    videoId: this.options.videoId,
                    mode: 'manifest',
                    type: this.manifestType
                });

            } catch (error) {
                this.api.debug('Error loading manifest: ' + error.message);
                this.api.triggerEvent('cloudflare:error', { error });
            }
        }

        forceReadyState() {
            const videoElement = this.api.video;

            if (this.loadingCheckInterval) {
                clearInterval(this.loadingCheckInterval);
            }

            let attempts = 0;
            const maxAttempts = 50;

            this.loadingCheckInterval = setInterval(() => {
                attempts++;
                const state = videoElement.readyState;

                this.api.debug('ReadyState check #' + attempts + ': ' + state);

                if (state >= 2) {
                    this.api.debug('Video ready! Triggering events...');

                    this.api.triggerEvent('loadstart', {});
                    this.api.triggerEvent('loadedmetadata', {});
                    this.api.triggerEvent('loadeddata', {});
                    this.api.triggerEvent('canplay', {});

                    if (state >= 3) {
                        this.api.triggerEvent('canplaythrough', {});
                    }

                    clearInterval(this.loadingCheckInterval);
                    this.loadingCheckInterval = null;
                    return;
                }

                if (attempts >= maxAttempts) {
                    this.api.debug('⚠️ Max attempts reached, forcing ready state anyway');

                    this.api.triggerEvent('loadedmetadata', {});
                    this.api.triggerEvent('canplay', {});

                    clearInterval(this.loadingCheckInterval);
                    this.loadingCheckInterval = null;
                }
            }, 100);
        }

        buildManifestUrl() {
            if (!this.options.videoId) return null;

            const baseUrl = this.options.customerCode
                ? 'https://customer-' + this.options.customerCode + '.cloudflarestream.com/' + this.options.videoId
                : 'https://videodelivery.net/' + this.options.videoId;

            const manifestType = this.manifestType || 'hls';
            const extension = manifestType === 'dash' ? 'video.mpd' : 'video.m3u8';

            return baseUrl + '/manifest/' + extension;
        }

        async loadHLS(videoElement, url) {
            // Native HLS support (Safari)
            if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
                this.api.debug('Using native HLS support');
                videoElement.src = url;
                videoElement.load();

                // For native playback, qualities aren't accessible
                this.availableQualities = [{
                    label: 'Auto',
                    value: 'auto',
                    active: true
                }];
                this.updateQualitySelector();
                return;
            }

            if (this.options.autoLoadLibraries && typeof Hls === 'undefined') {
                this.api.debug('Loading hls.js library...');
                await loadLibrary('hlsjs', this.options.hlsLibraryUrl);
            }

            if (typeof Hls === 'undefined' || !Hls.isSupported()) {
                this.api.debug('⚠️ hls.js not available/supported, using native playback');
                videoElement.src = url;
                videoElement.load();
                return;
            }

            this.api.debug('Using hls.js for HLS playback');
            const hlsConfig = {
                debug: this.options.debug,
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90,
                autoStartLoad: true,
                startLevel: -1,
                capLevelToPlayerSize: false,
                ...this.options.hlsConfig
            };

            this.hlsInstance = new Hls(hlsConfig);

            this.hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                this.api.debug('✓ HLS manifest parsed - ' + this.hlsInstance.levels.length + ' levels');

                // Extract quality levels from HLS
                this.extractHLSQualities();

                this.api.triggerEvent('cloudflare:manifestloaded', {
                    levels: this.hlsInstance.levels,
                    qualities: this.availableQualities
                });
            });

            this.hlsInstance.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
                this.api.debug('HLS level switched to: ' + data.level);
                this.updateCurrentQuality(data.level);
            });

            this.hlsInstance.on(Hls.Events.ERROR, (event, data) => {
                this.api.debug('HLS error: ' + data.type + ' - ' + data.details);

                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            this.api.debug('Network error, trying to recover...');
                            this.hlsInstance.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            this.api.debug('Media error, trying to recover...');
                            this.hlsInstance.recoverMediaError();
                            break;
                        default:
                            this.api.triggerEvent('cloudflare:error', data);
                            break;
                    }
                }
            });

            this.hlsInstance.loadSource(url);
            this.hlsInstance.attachMedia(videoElement);
        }

        /**
         * Extract qualities from HLS levels
         */
        extractHLSQualities() {
            if (!this.hlsInstance) {
                this.api.debug('No hlsInstance');
                return;
            }

            const self = this;

            setTimeout(() => {
                try {
                    let levels = [];

                    if (self.hlsInstance.levels && self.hlsInstance.levels.length > 0) {
                        levels = self.hlsInstance.levels;
                        self.api.debug('HLS levels found: ' + levels.length);
                    }

                    if (levels.length === 0) {
                        self.api.debug('ERROR: No HLS levels found');
                        return;
                    }

                    levels.sort((a, b) => (a.height || 0) - (b.height || 0));

                    self.availableQualities = [];

                    self.availableQualities.push({
                        label: 'Auto',
                        value: -1,
                        height: null,
                        bitrate: null,
                        active: true
                    });

                    levels.forEach((level, index) => {
                        const h = level.height || 'Unknown';
                        const b = level.bitrate ? Math.round(level.bitrate / 1000) : null;

                        self.availableQualities.push({
                            label: h + 'p' + (b ? ' (' + b + 'k)' : ''),
                            value: index,
                            height: level.height,
                            width: level.width,
                            bitrate: level.bitrate,
                            active: false
                        });
                    });

                    self.api.debug('HLS Qualities extracted: ' + self.availableQualities.length);

                    if (self.api.player) {
                        self.api.player.qualities = self.availableQualities
                            .filter(q => q.value !== -1)
                            .map(q => ({
                                src: self.options.manifestUrl || self.buildManifestUrl(),
                                quality: q.label,
                                type: 'application/x-mpegURL',
                                height: q.height,
                                width: q.width,
                                bitrate: q.bitrate,
                                index: q.value
                            }));
                    }

                    self.updateQualitySelector();
                    self.createQualityControlButton();
                    self.startQualityMonitoring();

                    // Set initial quality based on defaultQuality
                    if (levels.length > 0) {
                        self.api.debug('🎯 Default quality option: ' + self.options.defaultQuality);

                        let targetIdx = -1;

                        if (self.options.defaultQuality === 'auto') {
                            targetIdx = -1;
                            self.api.debug('Starting with AUTO quality');
                        } else {
                            const targetQuality = self.availableQualities.find(q =>
                                q.label.toLowerCase().includes(self.options.defaultQuality.toLowerCase())
                            );

                            if (targetQuality && targetQuality.value !== -1) {
                                targetIdx = targetQuality.value;
                                self.api.debug('Starting with quality: ' + targetQuality.label);
                            } else {
                                targetIdx = levels.length - 1;
                                self.api.debug('Quality not found, using MAX: ' + levels[targetIdx].height + 'p');
                            }
                        }

                        try {
                            self.hlsInstance.currentLevel = targetIdx;
                            self.api.debug('✅ HLS quality set to: ' + (targetIdx === -1 ? 'auto' : levels[targetIdx].height + 'p'));
                        } catch (e) {
                            self.api.debug('❌ Error: ' + e.message);
                        }
                    }

                } catch (error) {
                    self.api.debug('Extract error: ' + error.message);
                }
            }, 500);
        }

        async loadDASH(videoElement, url) {
            if (this.options.autoLoadLibraries && typeof dashjs === 'undefined') {
                this.api.debug('Loading dash.js library...');
                await loadLibrary('dashjs', this.options.dashLibraryUrl);
            }

            if (typeof dashjs === 'undefined') {
                this.api.debug('⚠️ dash.js not available, using native playback');
                videoElement.src = url;
                videoElement.load();
                return;
            }

            this.api.debug('Using dash.js for DASH playback');

            // Create dash.js player with initial configuration for high quality
            const player = dashjs.MediaPlayer().create();

            // CONFIGURE IMMEDIATELY to start with high quality
            player.updateSettings({
                streaming: {
                    abr: {
                        autoSwitchBitrate: {
                            video: false  // Disable ABR initially
                        },
                        initialBitrate: {
                            video: 10000000  // 10 Mbps - force high quality at start
                        },
                        maxBitrate: {
                            video: 10000000
                        }
                    }
                }
            });

            player.initialize(videoElement, url, this.options.autoplay);
            this.streamPlayer = player;

            player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
                this.api.debug('✓ DASH stream initialized');
                this.extractDASHQualities();
            });

            player.on(dashjs.MediaPlayer.events.MANIFEST_LOADED, () => {
                this.api.debug('✓ DASH manifest loaded');
                this.api.triggerEvent('cloudflare:manifestloaded', {
                    qualities: this.availableQualities
                });
            });

            player.on(dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED, (e) => {
                this.api.debug('DASH quality changed to: ' + e.newQuality);
                this.updateCurrentQuality(e.newQuality);
            });

            player.on(dashjs.MediaPlayer.events.ERROR, (error) => {
                this.api.debug('DASH error: ' + error.error);
                this.api.triggerEvent('cloudflare:error', error);
            });
        }

        /**
         * Extract qualities from DASH bitrates
         */
        extractDASHQualities() {
            if (!this.streamPlayer) {
                this.api.debug('No streamPlayer');
                return;
            }

            const self = this;

            setTimeout(() => {
                try {
                    let bitrates = [];

                    if (typeof self.streamPlayer.getTracksFor === 'function') {
                        const tracks = self.streamPlayer.getTracksFor('video');
                        self.api.debug('Tracks found: ' + tracks.length);

                        if (tracks && tracks.length > 0) {
                            const track = tracks[0];
                            if (track.bitrateList && track.bitrateList.length > 0) {
                                bitrates = track.bitrateList;
                                self.api.debug('Real qualities from bitrateList: ' + bitrates.length);
                            }
                        }
                    }

                    if (bitrates.length === 0) {
                        self.api.debug('ERROR: No qualities found in manifest');
                        return;
                    }

                    bitrates.sort((a, b) => (a.height || 0) - (b.height || 0));

                    self.availableQualities = [];

                    self.availableQualities.push({
                        label: 'Auto',
                        value: -1,
                        height: null,
                        bitrate: null,
                        active: true
                    });

                    bitrates.forEach((info, index) => {
                        const h = info.height;
                        const b = Math.round((info.bitrate || info.bandwidth || 0) / 1000);

                        self.availableQualities.push({
                            label: h + 'p (' + b + 'k)',
                            value: index,
                            height: info.height,
                            width: info.width,
                            bitrate: info.bitrate || info.bandwidth,
                            active: false
                        });
                    });

                    self.api.debug('Qualities extracted: ' + self.availableQualities.length);

                    if (self.api.player) {
                        self.api.player.qualities = self.availableQualities
                            .filter(q => q.value !== -1)
                            .map(q => ({
                                src: self.options.manifestUrl || self.buildManifestUrl(),
                                quality: q.label,
                                type: 'application/dash+xml',
                                height: q.height,
                                width: q.width,
                                bitrate: q.bitrate,
                                index: q.value
                            }));
                    }

                    self.updateQualitySelector();
                    self.createQualityControlButton();
                    self.startQualityMonitoring();

                    // Set initial quality based on defaultQuality
                    if (bitrates.length > 0) {
                        self.api.debug('🎯 Default quality option: ' + self.options.defaultQuality);

                        let targetIdx = -1;

                        if (self.options.defaultQuality === 'auto') {
                            targetIdx = -1;
                            self.api.debug('Starting with AUTO quality (ABR enabled)');
                        } else {
                            const targetQuality = self.availableQualities.find(q =>
                                q.label.toLowerCase().includes(self.options.defaultQuality.toLowerCase())
                            );

                            if (targetQuality && targetQuality.value !== -1) {
                                targetIdx = targetQuality.value;
                                self.api.debug('Starting with quality: ' + targetQuality.label);
                            } else {
                                targetIdx = bitrates.length - 1;
                                self.api.debug('Quality not found, using MAX: ' + bitrates[targetIdx].height + 'p');
                            }
                        }

                        try {
                            if (targetIdx === -1) {
                                self.streamPlayer.updateSettings({
                                    streaming: {
                                        abr: {
                                            autoSwitchBitrate: { video: true }
                                        }
                                    }
                                });
                                self.api.debug('✅ ABR enabled for auto quality');
                            } else {
                                const targetBitrate = bitrates[targetIdx].bitrate || bitrates[targetIdx].bandwidth;

                                self.streamPlayer.updateSettings({
                                    streaming: {
                                        abr: {
                                            autoSwitchBitrate: { video: false },
                                            maxBitrate: { video: targetBitrate + 1000 },
                                            minBitrate: { video: targetBitrate - 1000 },
                                            initialBitrate: { video: targetBitrate }
                                        }
                                    }
                                });

                                self.api.debug('✅ Quality set to: ' + bitrates[targetIdx].height + 'p');
                            }

                        } catch (e) {
                            self.api.debug('❌ Error: ' + e.message);
                        }
                    }

                } catch (error) {
                    self.api.debug('Extract error: ' + error.message);
                }
            }, 500);
        }

        /**
         * Update current quality marker
         */
        updateCurrentQuality(qualityIndex) {
            this.availableQualities.forEach(q => {
                q.active = (q.value === qualityIndex);
            });

            this.currentQuality = qualityIndex;
            this.updateQualitySelector();
        }

        /**
         * Update quality selector in MYETV player
         */
        updateQualitySelector() {
            if (this.availableQualities.length === 0) return;

            // Trigger event for MYETV player to update quality selector
            this.api.triggerEvent('qualitiesavailable', {
                qualities: this.availableQualities,
                current: this.currentQuality
            });

            this.api.debug('Quality selector updated with ' + this.availableQualities.length + ' qualities');
        }

        /**
         * Change quality (called by MYETV player)
         */

        /**
         * Force create quality button with multiple attempts
         */
        forceCreateQualityButton() {
            this.api.debug('🔧 Forcing quality button creation');

            this.createQualityButton();

            setTimeout(() => {
                this.api.debug('🔧 Retry #1');
                this.createQualityButton();
            }, 100);

            setTimeout(() => {
                this.api.debug('🔧 Retry #2');
                this.createQualityButton();
            }, 500);

            setTimeout(() => {
                this.api.debug('🔧 Final retry');
                this.createQualityButton();
                this.populateQualityMenu();
            }, 1000);
        }

        /**
         * Create quality button in controlbar
         */
        createQualityButton() {
            this.api.debug('🎯 createQualityButton called');

            if (!this.api.controls) {
                this.api.debug('❌ Controls not found');
                return false;
            }

            this.api.debug('✓ Controls found');

            const existingBtn = this.api.controls.querySelector('.quality-btn');
            if (existingBtn) {
                this.api.debug('✓ Quality button exists');
                const qualityControl = existingBtn.closest('.quality-control');
                if (qualityControl) {
                    qualityControl.style.display = 'block';
                }
                return true;
            }

            this.api.debug('⚠️ Creating quality button');

            const controlsRight = this.api.controls.querySelector('.controls-right');
            if (!controlsRight) {
                this.api.debug('❌ Controls-right not found');
                return false;
            }

            const qualityControl = document.createElement('div');
            qualityControl.className = 'quality-control';
            qualityControl.style.display = 'block';

            const qualityBtn = document.createElement('button');
            qualityBtn.className = 'control-btn quality-btn';
            qualityBtn.setAttribute('data-tooltip', 'videoquality');

            const btnText = document.createElement('div');
            btnText.className = 'quality-btn-text';

            const selectedQuality = document.createElement('div');
            selectedQuality.className = 'selected-quality';
            selectedQuality.textContent = 'Auto';

            const currentQuality = document.createElement('div');
            currentQuality.className = 'current-quality';

            btnText.appendChild(selectedQuality);
            btnText.appendChild(currentQuality);
            qualityBtn.appendChild(btnText);

            const qualityMenu = document.createElement('div');
            qualityMenu.className = 'quality-menu';
            qualityMenu.style.display = 'none';

            const autoOption = document.createElement('div');
            autoOption.className = 'quality-option selected';
            autoOption.setAttribute('data-quality', 'auto');
            autoOption.textContent = 'Auto';
            qualityMenu.appendChild(autoOption);

            qualityControl.appendChild(qualityBtn);
            qualityControl.appendChild(qualityMenu);

            const fullscreenBtn = controlsRight.querySelector('.fullscreen-btn');
            if (fullscreenBtn) {
                controlsRight.insertBefore(qualityControl, fullscreenBtn);
            } else {
                controlsRight.appendChild(qualityControl);
            }

            this.api.debug('✅ Quality button created');

            const self = this;

            qualityBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                const menu = this.nextElementSibling;
                if (menu) {
                    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                }
            });

            qualityMenu.addEventListener('click', function (e) {
                if (e.target.classList.contains('quality-option')) {
                    e.stopPropagation();
                    const quality = e.target.getAttribute('data-quality');

                    qualityMenu.querySelectorAll('.quality-option').forEach(function (opt) {
                        opt.classList.remove('selected');
                    });
                    e.target.classList.add('selected');

                    selectedQuality.textContent = e.target.textContent;
                    self.changeQuality(quality);
                    qualityMenu.style.display = 'none';
                }
            });

            return true;
        }

        /**
         * Populate quality menu
         */
        populateQualityMenu() {
            const qualityMenu = this.api.controls?.querySelector('.quality-menu');
            if (!qualityMenu) {
                this.api.debug('❌ Menu not found');
                return;
            }

            this.api.debug('📋 Populating: ' + this.availableQualities.length);

            const existing = qualityMenu.querySelectorAll('.quality-option:not([data-quality="auto"])');
            existing.forEach(function (opt) {
                opt.remove();
            });

            this.availableQualities.forEach((quality) => {
                if (quality.value === -1) return;

                const option = document.createElement('div');
                option.className = 'quality-option';
                option.setAttribute('data-quality', quality.value.toString());
                option.textContent = quality.label;

                qualityMenu.appendChild(option);
            });

            this.api.debug('✅ Menu populated');
        }

        createQualityControlButton() {
            const self = this;
            let qualityControl = this.api.container.querySelector('.quality-control');

            if (qualityControl) {
                this.api.debug('Quality button exists');
                return;
            }

            const controlsRight = this.api.container.querySelector('.controls-right');
            if (!controlsRight) {
                this.api.debug('No controls-right');
                return;
            }

            const qualityHTML = `
        <div class="quality-control">
            <button class="control-btn quality-btn" data-tooltip="videoquality">
                <div class="quality-btn-text">
                    <div class="selected-quality">Auto</div>
                    <div class="current-quality"></div>
                </div>
            </button>
            <div class="quality-menu">
                <div class="quality-option selected" data-quality="auto">Auto</div>
            </div>
        </div>
    `;

            const fullscreenBtn = controlsRight.querySelector('.fullscreen-btn');
            if (fullscreenBtn) {
                fullscreenBtn.insertAdjacentHTML('beforebegin', qualityHTML);
            } else {
                controlsRight.insertAdjacentHTML('beforeend', qualityHTML);
            }

            this.api.debug('✅ Quality button created');

            // Popola il menu
            setTimeout(() => {
                const menu = this.api.container.querySelector('.quality-menu');
                if (menu && this.availableQualities) {
                    this.availableQualities.forEach(q => {
                        if (q.value === -1) return;
                        const opt = document.createElement('div');
                        opt.className = 'quality-option';
                        opt.setAttribute('data-quality', q.value.toString());
                        opt.textContent = q.label;
                        menu.appendChild(opt);
                    });
                }

                // Event listeners
                const btn = this.api.container.querySelector('.quality-btn');
                const qualityMenu = this.api.container.querySelector('.quality-menu');

                if (btn) {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        qualityMenu.classList.toggle('show');
                    });
                }

                if (qualityMenu) {
                    qualityMenu.addEventListener('click', (e) => {
                        if (e.target.classList.contains('quality-option')) {
                            const quality = e.target.getAttribute('data-quality');
                            self.changeQuality(quality);

                            qualityMenu.querySelectorAll('.quality-option').forEach(opt => {
                                opt.classList.remove('selected');
                            });
                            e.target.classList.add('selected');

                            const selectedQuality = self.api.container.querySelector('.selected-quality');
                            if (selectedQuality) {
                                selectedQuality.textContent = e.target.textContent;
                            }

                            qualityMenu.classList.remove('show');
                        }
                    });
                }
            }, 100);
        }

        startQualityMonitoring() {
            if (this.qualityMonitorInterval) {
                clearInterval(this.qualityMonitorInterval);
            }

            const self = this;

            this.qualityMonitorInterval = setInterval(() => {
                let currentQualityIndex = -1;
                let currentQualityLabel = '';

                // HLS
                if (self.hlsInstance) {
                    currentQualityIndex = self.hlsInstance.currentLevel;

                    // Se è auto (-1), leggi quale livello sta effettivamente usando
                    if (currentQualityIndex === -1 && self.hlsInstance.loadLevel !== -1) {
                        currentQualityIndex = self.hlsInstance.loadLevel;
                    }

                    if (currentQualityIndex >= 0 && self.hlsInstance.levels[currentQualityIndex]) {
                        const level = self.hlsInstance.levels[currentQualityIndex];
                        currentQualityLabel = level.height + 'p';
                    }
                }

                // DASH
                else if (self.streamPlayer) {
                    try {
                        // Try multiple methods to get current quality

                        // Metodo 1: getQualityFor
                        if (typeof self.streamPlayer.getQualityFor === 'function') {
                            currentQualityIndex = self.streamPlayer.getQualityFor('video');
                            self.api.debug('DASH currentQuality index: ' + currentQualityIndex);
                        }

                        // Metodo 2: Usa getBitrateInfoListFor per trovare quale bitrate è in uso
                        if (currentQualityIndex === -1 || currentQualityIndex === undefined) {
                            const settings = self.streamPlayer.getSettings();
                            if (settings && settings.streaming && settings.streaming.abr) {
                                // ABR è attivo, prova a leggere dal video stesso
                                const videoEl = self.api.video;
                                if (videoEl && videoEl.videoHeight) {
                                    // Find the quality closest to the current video height
                                    const tracks = self.streamPlayer.getTracksFor('video');
                                    if (tracks && tracks.length > 0 && tracks[0].bitrateList) {
                                        const bitrateList = tracks[0].bitrateList;
                                        for (let i = 0; i < bitrateList.length; i++) {
                                            if (bitrateList[i].height === videoEl.videoHeight) {
                                                currentQualityIndex = i;
                                                self.api.debug('Found quality by video height: ' + i);
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // Converti l'indice in label
                        if (currentQualityIndex >= 0) {
                            const tracks = self.streamPlayer.getTracksFor('video');
                            if (tracks && tracks.length > 0 && tracks[0].bitrateList) {
                                const bitrateList = tracks[0].bitrateList;
                                if (bitrateList[currentQualityIndex]) {
                                    currentQualityLabel = bitrateList[currentQualityIndex].height + 'p';
                                    self.api.debug('DASH quality label: ' + currentQualityLabel);
                                }
                            }
                        }
                    } catch (e) {
                        self.api.debug('Error getting DASH quality: ' + e.message);
                    }
                }

                // Aggiorna il display solo se siamo in modalità Auto
                const selectedQualityDiv = self.api.container?.querySelector('.selected-quality');
                const currentQualityDiv = self.api.container?.querySelector('.current-quality');

                if (selectedQualityDiv && currentQualityDiv) {
                    const isAuto = selectedQualityDiv.textContent.trim() === 'Auto';

                    if (isAuto && currentQualityLabel) {
                        currentQualityDiv.textContent = currentQualityLabel;
                        currentQualityDiv.style.display = 'block';
                    } else {
                        currentQualityDiv.textContent = '';
                        currentQualityDiv.style.display = 'none';
                    }
                }

            }, 1000);

            this.api.debug('✅ Quality monitoring started');
        }

        stopQualityMonitoring() {
            if (this.qualityMonitorInterval) {
                clearInterval(this.qualityMonitorInterval);
                this.qualityMonitorInterval = null;
                this.api.debug('⚠️ Quality monitoring stopped');
            }
        }

        changeQuality(qualityValue) {
            this.api.debug('🔄 Change quality to: ' + qualityValue);

            // Se è HLS, usa l'API di hls.js
            if (this.hlsInstance) {
                this.api.debug('🔄 HLS quality change');

                // Auto
                if (qualityValue === 'auto' || qualityValue === '-1' || qualityValue === -1) {
                    this.api.debug('🔄 HLS Auto quality');
                    this.hlsInstance.currentLevel = -1; // -1 = auto in hls.js
                    return;
                }

                // Qualità specifica
                const qualityIndex = parseInt(qualityValue);
                this.api.debug('🎯 HLS quality index: ' + qualityIndex);
                this.hlsInstance.currentLevel = qualityIndex;
                this.api.debug('✅ HLS quality set');
                return;
            }


            if (!this.streamPlayer) {
                this.api.debug('❌ No streamPlayer');
                return;
            }

            // Auto quality
            if (qualityValue === 'auto' || qualityValue === '-1' || qualityValue === -1) {
                this.api.debug('🔄 Enabling ABR (auto)');
                try {
                    this.streamPlayer.updateSettings({
                        streaming: {
                            abr: {
                                autoSwitchBitrate: {
                                    video: true
                                },
                                maxBitrate: {
                                    video: -1  // Rimuovi il limite
                                },
                                minBitrate: {
                                    video: -1
                                }
                            }
                        }
                    });

                    // Forza un piccolo seek per ricaricare
                    const currentTime = this.api.video.currentTime;
                    this.api.video.currentTime = currentTime + 0.1;

                    this.api.debug('✅ ABR enabled');
                } catch (e) {
                    this.api.debug('❌ ABR error: ' + e.message);
                }
                return;
            }

            // Qualità specifica
            const qualityIndex = parseInt(qualityValue);
            this.api.debug('🎯 Setting quality index: ' + qualityIndex);

            try {
                const tracks = this.streamPlayer.getTracksFor('video');
                if (tracks && tracks.length > 0) {
                    const bitrateList = tracks[0].bitrateList;
                    if (bitrateList && bitrateList[qualityIndex]) {
                        const targetBitrate = bitrateList[qualityIndex].bitrate || bitrateList[qualityIndex].bandwidth;

                        this.api.debug('🎯 Target bitrate: ' + Math.round(targetBitrate / 1000) + 'k');

                        // 1. Salva il tempo corrente
                        const currentTime = this.api.video.currentTime;
                        const wasPlaying = !this.api.video.paused;

                        // 2. Pausa il video
                        this.api.video.pause();

                        // 3. Configura i limiti di bitrate
                        this.streamPlayer.updateSettings({
                            streaming: {
                                abr: {
                                    autoSwitchBitrate: {
                                        video: false
                                    },
                                    maxBitrate: {
                                        video: targetBitrate + 1000  // Aggiungi 1k di margine
                                    },
                                    minBitrate: {
                                        video: targetBitrate - 1000  // Sottrai 1k di margine
                                    }
                                }
                            }
                        });

                        // 4. Forza il reload facendo un seek
                        setTimeout(() => {
                            // Skip forward 0.1 seconds to force segment reload
                            this.api.video.currentTime = currentTime + 0.1;

                            // Riprendi la riproduzione
                            if (wasPlaying) {
                                setTimeout(() => {
                                    this.api.video.play();
                                }, 100);
                            }

                            this.api.debug('✅ Quality changed with seek');
                        }, 100);
                    }
                }

            } catch (e) {
                this.api.debug('❌ Error: ' + e.message);
            }
        }

        setupManifestEvents(videoElement) {
            const events = ['loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough',
                'play', 'pause', 'playing', 'ended', 'timeupdate', 'volumechange',
                'waiting', 'seeking', 'seeked', 'error', 'progress'];

            events.forEach(eventName => {
                videoElement.addEventListener(eventName, (e) => {
                    this.api.debug('📺 Event: ' + eventName + ' (readyState: ' + videoElement.readyState + ')');
                    this.api.triggerEvent(eventName, e);
                });
            });
        }

        createIframePlayer() {
            this.isUsingIframe = true;

            if (!this.options.videoId && !this.options.videoUrl && !this.options.signedUrl) {
                this.api.debug('No video source for iframe player');
                return;
            }

            if (this.options.replaceNativePlayer) {
                this.api.video.style.display = 'none';
            }

            this.streamContainer = document.createElement('div');
            this.streamContainer.className = 'cloudflare-stream-container';
            this.streamContainer.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 100;';

            const iframeSrc = this.buildIframeUrl();

            this.streamIframe = document.createElement('iframe');
            this.streamIframe.src = iframeSrc;
            this.streamIframe.style.cssText = 'border: none; width: 100%; height: 100%;';
            this.streamIframe.allow = 'accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;';
            this.streamIframe.allowFullscreen = true;

            this.streamContainer.appendChild(this.streamIframe);
            this.api.container.appendChild(this.streamContainer);

            this.setupStreamAPI();

            // Iframe player has built-in quality selector
            this.availableQualities = [{
                label: 'Auto (Cloudflare)',
                value: 'auto',
                active: true
            }];

            this.api.debug('Cloudflare Stream iframe player created');
            this.api.triggerEvent('cloudflare:playerready', {
                videoId: this.options.videoId,
                mode: 'iframe'
            });
        }

        buildIframeUrl() {
            let baseUrl;

            if (this.options.signedUrl) {
                return this.options.signedUrl;
            }

            if (this.options.videoUrl) {
                baseUrl = this.options.videoUrl;
            } else if (this.options.videoId) {
                if (this.options.customerCode) {
                    baseUrl = 'https://customer-' + this.options.customerCode + '.cloudflarestream.com/' + this.options.videoId + '/iframe';
                } else {
                    baseUrl = 'https://iframe.videodelivery.net/' + this.options.videoId;
                }
            }

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
            return queryString ? baseUrl + '?' + queryString : baseUrl;
        }

        setupStreamAPI() {
            this.streamPlayer = {
                iframe: this.streamIframe,
                play: () => this.sendCommand('play'),
                pause: () => this.sendCommand('pause'),
                mute: () => this.sendCommand('mute'),
                unmute: () => this.sendCommand('unmute'),
                seek: (time) => this.sendCommand('seek', time),
                getCurrentTime: () => this.getProperty('currentTime'),
                getDuration: () => this.getProperty('duration'),
                getVolume: () => this.getProperty('volume'),
                getPaused: () => this.getProperty('paused'),
                getMuted: () => this.getProperty('muted'),
                setVolume: (volume) => this.sendCommand('volume', volume),
                setPlaybackRate: (rate) => this.sendCommand('playbackRate', rate)
            };

            this.setupMessageListener();
            this.isPlayerReady = true;
        }

        sendCommand(command, value) {
            if (!this.streamIframe || !this.streamIframe.contentWindow) {
                return Promise.reject('Player not ready');
            }

            const message = value !== undefined ? { event: command, value: value } : { event: command };
            this.streamIframe.contentWindow.postMessage(message, '*');
            return Promise.resolve();
        }

        getProperty(property) {
            return new Promise((resolve) => {
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

        setupMessageListener() {
            window.addEventListener('message', (event) => {
                if (!event.data || !event.data.event) return;

                const data = event.data;

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
                        this.api.triggerEvent('timeupdate', { currentTime: data.currentTime, duration: data.duration });
                        break;
                    case 'volumechange':
                        this.api.triggerEvent('volumechange', { volume: data.volume, muted: data.muted });
                        break;
                    case 'loadedmetadata':
                        this.api.triggerEvent('loadedmetadata', data);
                        break;
                    case 'error':
                        this.api.triggerEvent('error', data);
                        break;
                }
            });
        }

        /**
         * Add custom methods to player API
         */
        addCustomMethods() {
            this.api.player.loadCloudflareVideo = (videoId, customerCode, useManifest) => {
                return this.loadVideo(videoId, customerCode, useManifest);
            };

            this.api.player.loadCloudflareManifest = (manifestUrl) => {
                return this.loadManifest(manifestUrl);
            };

            this.api.player.getCloudflarePlayer = () => this.streamPlayer;
            this.api.player.getHLSInstance = () => this.hlsInstance;
            this.api.player.isCloudflareUsingIframe = () => this.isUsingIframe;
            this.api.player.isCloudflareUsingManifest = () => this.isUsingManifest;
            this.api.player.getCloudflareQualities = () => this.availableQualities;
            this.api.player.setCloudflareQuality = (quality) => this.changeQuality(quality);
        }

        // Playback control methods
        play() {
            if (this.isUsingManifest) return this.api.video.play();
            if (!this.streamPlayer) return Promise.reject('Player not initialized');
            return this.streamPlayer.play();
        }

        pause() {
            if (this.isUsingManifest) {
                this.api.video.pause();
                return Promise.resolve();
            }
            if (!this.streamPlayer) return Promise.reject('Player not initialized');
            return this.streamPlayer.pause();
        }

        seek(seconds) {
            if (this.isUsingManifest) {
                this.api.video.currentTime = seconds;
                return Promise.resolve();
            }
            if (!this.streamPlayer) return Promise.reject('Player not initialized');
            return this.streamPlayer.seek(seconds);
        }

        getCurrentTime() {
            if (this.isUsingManifest) return Promise.resolve(this.api.video.currentTime);
            if (!this.streamPlayer) return Promise.reject('Player not initialized');
            return this.streamPlayer.getCurrentTime();
        }

        getDuration() {
            if (this.isUsingManifest) return Promise.resolve(this.api.video.duration);
            if (!this.streamPlayer) return Promise.reject('Player not initialized');
            return this.streamPlayer.getDuration();
        }

        setVolume(volume) {
            if (this.isUsingManifest) {
                this.api.video.volume = volume;
                return Promise.resolve();
            }
            if (!this.streamPlayer) return Promise.reject('Player not initialized');
            return this.streamPlayer.setVolume(volume);
        }

        getVolume() {
            if (this.isUsingManifest) return Promise.resolve(this.api.video.volume);
            if (!this.streamPlayer) return Promise.reject('Player not initialized');
            return this.streamPlayer.getVolume();
        }

        mute() {
            if (this.isUsingManifest) {
                this.api.video.muted = true;
                return Promise.resolve();
            }
            if (!this.streamPlayer) return Promise.reject('Player not initialized');
            return this.streamPlayer.mute();
        }

        unmute() {
            if (this.isUsingManifest) {
                this.api.video.muted = false;
                return Promise.resolve();
            }
            if (!this.streamPlayer) return Promise.reject('Player not initialized');
            return this.streamPlayer.unmute();
        }

        getMuted() {
            if (this.isUsingManifest) return Promise.resolve(this.api.video.muted);
            if (!this.streamPlayer) return Promise.reject('Player not initialized');
            return this.streamPlayer.getMuted();
        }

        getPaused() {
            if (this.isUsingManifest) return Promise.resolve(this.api.video.paused);
            if (!this.streamPlayer) return Promise.reject('Player not initialized');
            return this.streamPlayer.getPaused();
        }

        setPlaybackRate(rate) {
            if (this.isUsingManifest) {
                this.api.video.playbackRate = rate;
                return Promise.resolve();
            }
            if (!this.streamPlayer) return Promise.reject('Player not initialized');
            return this.streamPlayer.setPlaybackRate(rate);
        }

        loadVideo(videoId, customerCode, useManifest) {
            this.options.videoId = videoId;
            if (customerCode) this.options.customerCode = customerCode;
            if (useManifest !== undefined) this.options.useNativePlayer = useManifest;

            this.disposePlayer();
            this.createStreamPlayer();
            this.api.triggerEvent('cloudflare:videoloaded', { videoId, customerCode });
            return Promise.resolve(videoId);
        }

        loadManifest(manifestUrl) {
            this.options.manifestUrl = manifestUrl;
            this.options.useNativePlayer = true;
            this.extractFromUrl(manifestUrl);

            this.disposePlayer();
            this.createManifestPlayer();
            this.api.triggerEvent('cloudflare:manifestloaded', { manifestUrl });
            return Promise.resolve(manifestUrl);
        }

        disposePlayer() {
            if (this.loadingCheckInterval) {
                clearInterval(this.loadingCheckInterval);
                this.loadingCheckInterval = null;
            }

            if (this.hlsInstance) {
                this.hlsInstance.destroy();
                this.hlsInstance = null;
            }

            if (this.streamContainer) {
                this.streamContainer.remove();
                this.streamContainer = null;
            }

            if (this.streamPlayer && this.streamPlayer.destroy) {
                this.streamPlayer.destroy();
            }

            this.streamPlayer = null;
            this.streamIframe = null;
            this.isUsingIframe = false;
            this.isUsingManifest = false;
            this.availableQualities = [];
            this.currentQuality = null;
        }

        dispose() {
            this.api.debug('Disposing plugin');

            this.stopQualityMonitoring(); // AGGIUNGI QUESTA RIGA

            if (this.hlsInstance) {
                this.hlsInstance.destroy();
                this.hlsInstance = null;
            }

            if (this.streamPlayer) {
                this.streamPlayer.reset();
                this.streamPlayer = null;
            }
        }

    }

    // Register plugin
    if (typeof window.registerMYETVPlugin === 'function') {
        window.registerMYETVPlugin('cloudflare', CloudflareStreamPlugin);
    } else {
        console.error('☁️ MYETV Player plugin system not found');
    }

})();