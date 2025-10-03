// Streaming Module for MYETV Video Player
// Conservative modularization - original code preserved exactly
// Created by https://www.myetv.tv https://oskarcosimo.com

    async loadAdaptiveLibraries() {
        if (!this.options.adaptiveStreaming) return false;

        try {
            // Load DASH library if not already loaded
            if (!this.librariesLoaded.dash && !window.dashjs) {
                await this.loadScript(this.options.dashLibUrl);
                this.librariesLoaded.dash = true;
                if (this.options.debug) console.log('📡 Dash.js library loaded');
            }

            // Load HLS library if not already loaded
            if (!this.librariesLoaded.hls && !window.Hls) {
                await this.loadScript(this.options.hlsLibUrl);
                this.librariesLoaded.hls = true;
                if (this.options.debug) console.log('📡 HLS.js library loaded');
            }

            return true;
        } catch (error) {
            if (this.options.debug) console.error('Failed to load adaptive streaming libraries:', error);
            return false;
        }
    }

    detectStreamType(src) {
        if (!src) return null;

        const url = src.toLowerCase();
        if (url.includes('.mpd') || url.includes('dash')) {
            return 'dash';
        } else if (url.includes('.m3u8') || url.includes('hls')) {
            return 'hls';
        }
        return null;
    }

    async initializeAdaptiveStreaming(src) {
        if (!this.options.adaptiveStreaming) return false;

        this.adaptiveStreamingType = this.detectStreamType(src);

        if (!this.adaptiveStreamingType) {
            if (this.options.debug) console.log('📡 No adaptive streaming detected');
            return false;
        }

        // Load libraries first
        const librariesLoaded = await this.loadAdaptiveLibraries();
        if (!librariesLoaded) {
            if (this.options.debug) console.error('📡 Failed to load adaptive libraries');
            return false;
        }

        try {
            if (this.adaptiveStreamingType === 'dash') {
                return await this.initializeDash(src);
            } else if (this.adaptiveStreamingType === 'hls') {
                return await this.initializeHls(src);
            }
        } catch (error) {
            if (this.options.debug) console.error('📡 Adaptive streaming initialization failed:', error);
            return false;
        }

        return false;
    }

    async initializeDash(src) {
    if (!window.dashjs) {
        if (this.options.debug) console.error('📡 Dash.js not available');
        return false;
    }

    try {
        // Destroy existing DASH player
        if (this.dashPlayer) {
            this.dashPlayer.destroy();
        }

        // Create new DASH player
        this.dashPlayer = window.dashjs.MediaPlayer().create();

        // Configure DASH settings
        this.dashPlayer.updateSettings({
            streaming: {
                abr: {
                    autoSwitchBitrate: {
                        video: this.selectedQuality === 'auto'
                    }
                },
                text: {
                    defaultEnabled: false  // Always disable by default
                }
            },
            debug: {
                logLevel: this.options.debug ? window.dashjs.Debug.LOG_LEVEL_DEBUG : window.dashjs.Debug.LOG_LEVEL_ERROR
            }
        });

        // Set up event listeners
        this.dashPlayer.on(window.dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
            if (this.options.debug) console.log('📡 DASH stream initialized');

            // Disable text tracks unconditionally unless debug is enabled
            this.disableDashTextTracks();

            this.updateAdaptiveQualities();
            this.isAdaptiveStream = true;
            this.hideLoading();
        });

        this.dashPlayer.on(window.dashjs.MediaPlayer.events.TEXT_TRACKS_ADDED, (e) => {
            if (this.options.debug) {
                console.log('📡 DASH text tracks added:', e);
                // Enable text tracks only in debug mode
                if (e.tracks && e.tracks.length > 0) {
                    this.dashPlayer.setTextTrack(0);
                }
            } else {
                // Disable all text tracks if not in debug mode
                this.disableDashTextTracks();
            }
        });

        this.dashPlayer.on(window.dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED, (e) => {
            if (this.options.debug) console.log('📡 DASH quality changed:', e.newQuality);
            this.updateAdaptiveQualityDisplay();
        });

        // Initialize player
        this.dashPlayer.initialize(this.video, src, this.options.autoplay);

        // Ensure text tracks remain disabled after initialization
        setTimeout(() => {
            this.disableDashTextTracks();
        }, 500);

        if (this.options.debug) console.log('📡 DASH player initialized with:', src);
        return true;

    } catch (error) {
        if (this.options.debug) console.error('📡 DASH initialization error:', error);
        return false;
    }
}

// Helper method to disable DASH text tracks
disableDashTextTracks() {
    if (!this.dashPlayer) return;

    try {
        // Disable text rendering completely unless debug is enabled
        if (!this.options.debug) {
            this.dashPlayer.enableText(false);
            this.dashPlayer.setTextTrack(-1);

            // Also disable native video text tracks
            if (this.video && this.video.textTracks) {
                for (let i = 0; i < this.video.textTracks.length; i++) {
                    this.video.textTracks[i].mode = 'disabled';
                }
            }
        } else {
            // Enable text tracks only in debug mode
            this.dashPlayer.enableText(true);
        }
    } catch (error) {
        if (this.options.debug) console.error('📡 Error disabling text tracks:', error);
    }
}

    async initializeHls(src) {
        if (!window.Hls) {
            if (this.options.debug) console.error('📡 HLS.js not available');
            return false;
        }

        // Check if HLS is supported
        if (!window.Hls.isSupported()) {
            // Fallback to native HLS (Safari)
            if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
                this.video.src = src;
                this.isAdaptiveStream = true;
                if (this.options.debug) console.log('📡 Using native HLS support');
                return true;
            } else {
                if (this.options.debug) console.error('📡 HLS not supported');
                return false;
            }
        }

        try {
            // Destroy existing HLS player
            if (this.hlsPlayer) {
                this.hlsPlayer.destroy();
            }

            // Create new HLS player
            this.hlsPlayer = new window.Hls({
                debug: this.options.debug,
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            // Set up event listeners
            this.hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, () => {
                if (this.options.debug) console.log('📡 HLS manifest parsed');
                this.updateAdaptiveQualities();
                this.isAdaptiveStream = true;
                this.hideLoading();
            });

            this.hlsPlayer.on(window.Hls.Events.LEVEL_SWITCHED, (event, data) => {
                if (this.options.debug) console.log('📡 HLS level switched:', data.level);
                this.updateAdaptiveQualityDisplay();
            });

            this.hlsPlayer.on(window.Hls.Events.ERROR, (event, data) => {
                if (this.options.debug) console.error('📡 HLS error:', data);
                if (data.fatal) {
                    this.handleAdaptiveError(data);
                }
            });

            // Load source
            this.hlsPlayer.loadSource(src);
            this.hlsPlayer.attachMedia(this.video);

            if (this.options.debug) console.log('📡 HLS player initialized with:', src);
            return true;

        } catch (error) {
            if (this.options.debug) console.error('📡 HLS initialization error:', error);
            return false;
        }
    }

    updateAdaptiveQualities() {
        this.adaptiveQualities = [];

        if (this.adaptiveStreamingType === 'dash' && this.dashPlayer) {
            const bitrates = this.dashPlayer.getBitrateInfoListFor('video');
            this.adaptiveQualities = bitrates.map((bitrate, index) => ({
                index: index,
                label: this.getQualityLabel(bitrate.height, bitrate.width),
                height: bitrate.height,
                bandwidth: bitrate.bandwidth
            }));
        } else if (this.adaptiveStreamingType === 'hls' && this.hlsPlayer) {
            const levels = this.hlsPlayer.levels;
            this.adaptiveQualities = levels.map((level, index) => ({
                index: index,
                label: this.getQualityLabel(level.height, level.width),
                height: level.height,
                bandwidth: level.bitrate
            }));
        }

        if (this.options.adaptiveQualityControl) {
            this.updateAdaptiveQualityMenu();
        }

        if (this.options.debug) {
            console.log('📡 Adaptive qualities available:', this.adaptiveQualities);
        }
    }

    handleAdaptiveError(data) {
        if (this.options.debug) console.error('📡 Fatal adaptive streaming error:', data);

        // Try to recover
        if (this.adaptiveStreamingType === 'hls' && this.hlsPlayer) {
            try {
                this.hlsPlayer.startLoad();
            } catch (error) {
                if (this.options.debug) console.error('📡 Failed to recover from HLS error:', error);
            }
        }
    }

    destroyAdaptivePlayer() {
        try {
            if (this.dashPlayer) {
                this.dashPlayer.destroy();
                this.dashPlayer = null;
            }

            if (this.hlsPlayer) {
                this.hlsPlayer.destroy();
                this.hlsPlayer = null;
            }

            this.isAdaptiveStream = false;
            this.adaptiveStreamingType = null;
            this.adaptiveQualities = [];

            if (this.options.debug) console.log('📡 Adaptive player destroyed');

        } catch (error) {
            if (this.options.debug) console.error('📡 Error destroying adaptive player:', error);
        }
    }

    getAdaptiveStreamingInfo() {
        return {
            isActive: this.isAdaptiveStream,
            type: this.adaptiveStreamingType,
            currentQuality: this.getCurrentAdaptiveQuality(),
            currentQualityLabel: this.getCurrentAdaptiveQualityLabel(),
            availableQualities: this.adaptiveQualities,
            isAuto: this.isAutoQuality()
        };
    }

    setAdaptiveStreamingOptions(options = {}) {
        if (options.enabled !== undefined) {
            this.options.adaptiveStreaming = options.enabled;
        }
        if (options.qualityControl !== undefined) {
            this.options.adaptiveQualityControl = options.qualityControl;
        }
        if (options.dashLibUrl) {
            this.options.dashLibUrl = options.dashLibUrl;
        }
        if (options.hlsLibUrl) {
            this.options.hlsLibUrl = options.hlsLibUrl;
        }

        if (this.options.debug) {
            console.log('📡 Adaptive streaming options updated:', {
                enabled: this.options.adaptiveStreaming,
                qualityControl: this.options.adaptiveQualityControl
            });
        }

        return this;
    }

// Streaming methods for main class
// All original functionality preserved exactly
