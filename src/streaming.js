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
        // Initialize quality selection to Auto BEFORE creating player

        // FORCE Auto mode - always reset at initialization
        this.selectedQuality = 'auto';
        this.qualityEventsInitialized = false;

        if (this.options.debug) {
            console.log('🔍 initializeDash - FORCED selectedQuality to:', this.selectedQuality);
        }

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
        try {
            // dash.js 5.x - Get ALL video tracks
            const videoTracks = this.dashPlayer.getTracksFor('video');

            if (this.options.debug) {
                console.log('✅ DASH getTracksFor result:', videoTracks);
            }

            if (videoTracks && videoTracks.length > 0) {
                // Collect qualities from ALL video tracks
                const allQualities = [];

                videoTracks.forEach((track, trackIndex) => {
                    const bitrateList = track.bitrateList || [];

                    if (this.options.debug) {
                        console.log(`✅ Track ${trackIndex} (${track.codec}):`, bitrateList);
                    }

                    bitrateList.forEach((bitrate, index) => {
                        allQualities.push({
                            trackIndex: trackIndex,
                            bitrateIndex: index,
                            label: `${bitrate.height}p`,
                            height: bitrate.height,
                            width: bitrate.width,
                            bandwidth: bitrate.bandwidth,
                            codec: track.codec
                        });
                    });
                });

                // Sort by height (descending) and remove duplicates
                const uniqueHeights = [...new Set(allQualities.map(q => q.height))];
                uniqueHeights.sort((a, b) => b - a);

                this.adaptiveQualities = uniqueHeights.map((height, index) => {
                    const quality = allQualities.find(q => q.height === height);
                    return {
                        index: index,
                        label: `${height}p`,
                        height: height,
                        trackIndex: quality.trackIndex,
                        bitrateIndex: quality.bitrateIndex,
                        bandwidth: quality.bandwidth,
                        codec: quality.codec
                    };
                });

                if (this.options.debug) {
                    console.log('✅ All DASH qualities merged:', this.adaptiveQualities);
                }
            }
        } catch (error) {
            if (this.options.debug) {
                console.error('❌ Error getting DASH qualities:', error);
            }
        }
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
        console.log('📡 Selected quality mode:', this.selectedQuality);
    }
}

updateAdaptiveQualityMenu() {
    const qualityMenu = this.controls?.querySelector('.quality-menu');
    if (!qualityMenu) {
        if (this.options.debug) console.log('❌ Quality menu not found in DOM');
        return;
    }

    if (this.adaptiveQualities.length === 0) {
        if (this.options.debug) console.log('❌ No adaptive qualities to display');
        return;
    }

    // Generate menu HTML with "Auto" option
    const isAutoActive = this.selectedQuality === 'auto';
    let menuHTML = `<div class="quality-option ${isAutoActive ? 'active' : ''}" data-quality="auto">Auto</div>`;

    // Add all quality options
    this.adaptiveQualities.forEach((quality) => {
        const isActive = this.selectedQuality === quality.height;

        if (this.options.debug) {
            console.log('🔍 Quality item:', quality.label, 'height:', quality.height, 'active:', isActive);
        }

        menuHTML += `<div class="quality-option ${isActive ? 'active' : ''}" data-quality="${quality.height}">
            ${quality.label}
            <span class="quality-playing" style="display: none; color: #4CAF50; margin-left: 8px; font-size: 0.85em;">● Playing</span>
        </div>`;
    });

    qualityMenu.innerHTML = menuHTML;

    if (this.options.debug) {
        console.log('✅ Quality menu populated with', this.adaptiveQualities.length, 'options');
    }

    // Bind events ONCE
    if (!this.qualityEventsInitialized) {
        this.bindAdaptiveQualityEvents();
        this.qualityEventsInitialized = true;
    }

    // Update display
    this.updateAdaptiveQualityDisplay();
}

updateAdaptiveQualityDisplay() {
    if (!this.dashPlayer && !this.hlsPlayer) return;

    let currentHeight = null;

    try {
        if (this.adaptiveStreamingType === 'dash' && this.dashPlayer) {
            // Get video element to check actual resolution
            if (this.video && this.video.videoHeight) {
                currentHeight = this.video.videoHeight;
            }

            if (this.options.debug) {
                console.log('📊 Current video height:', currentHeight, 'Selected mode:', this.selectedQuality);
            }
        } else if (this.adaptiveStreamingType === 'hls' && this.hlsPlayer) {
            const currentLevel = this.hlsPlayer.currentLevel;
            if (currentLevel >= 0 && this.hlsPlayer.levels[currentLevel]) {
                currentHeight = this.hlsPlayer.levels[currentLevel].height;
            }
        }

        // Update button text (top text)
        const qualityBtnText = this.controls?.querySelector('.quality-btn .selected-quality');
        if (qualityBtnText) {
            if (this.selectedQuality === 'auto') {
                qualityBtnText.textContent = 'Auto';
            } else {
                qualityBtnText.textContent = `${this.selectedQuality}p`;
            }
        }

        // Update current quality display (bottom text) - ONLY in Auto mode
        const currentQualityText = this.controls?.querySelector('.quality-btn .current-quality');
        if (currentQualityText) {
            if (this.selectedQuality === 'auto' && currentHeight) {
                currentQualityText.textContent = `${currentHeight}p`;
                currentQualityText.style.display = 'block';
            } else {
                currentQualityText.textContent = '';
                currentQualityText.style.display = 'none';
            }
        }

        // Update menu active states
        const qualityMenu = this.controls?.querySelector('.quality-menu');
        if (qualityMenu) {
            // Remove all active states
            qualityMenu.querySelectorAll('.quality-option').forEach(opt => {
                opt.classList.remove('active');
            });

            // Set active based on selection
            if (this.selectedQuality === 'auto') {
                const autoOption = qualityMenu.querySelector('[data-quality="auto"]');
                if (autoOption) autoOption.classList.add('active');
            } else {
                const selectedOption = qualityMenu.querySelector(`[data-quality="${this.selectedQuality}"]`);
                if (selectedOption) selectedOption.classList.add('active');
            }

            // Hide all playing indicators
            qualityMenu.querySelectorAll('.quality-playing').forEach(el => {
                el.style.display = 'none';
            });

            // Show playing indicator only in Auto mode
            if (this.selectedQuality === 'auto' && currentHeight) {
                const playingOption = qualityMenu.querySelector(`[data-quality="${currentHeight}"] .quality-playing`);
                if (playingOption) {
                    playingOption.style.display = 'inline';
                }
            }
        }

    } catch (error) {
        if (this.options.debug) console.error('❌ Error updating quality display:', error);
    }
}

updateQualityButtonText() {
    const qualityBtn = this.controls?.querySelector('.quality-btn .selected-quality');
    if (!qualityBtn) return;

    if (this.selectedQuality === 'auto' || !this.selectedQuality) {
        qualityBtn.textContent = this.t('auto');
    } else {
        const quality = this.adaptiveQualities.find(q => q.index === parseInt(this.selectedQuality));
        qualityBtn.textContent = quality ? quality.label : 'Auto';
    }
}

bindAdaptiveQualityEvents() {
    const qualityMenu = this.controls?.querySelector('.quality-menu');
    const qualityBtn = this.controls?.querySelector('.quality-btn');

    if (!qualityMenu || !qualityBtn) return;

    // Toggle menu
    qualityBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        qualityMenu.classList.toggle('active');

        // Update display when opening
        if (qualityMenu.classList.contains('active')) {
            this.updateAdaptiveQualityDisplay();
        }
    });

    // Close menu on outside click
    const closeMenuHandler = (e) => {
        if (!qualityBtn.contains(e.target) && !qualityMenu.contains(e.target)) {
            qualityMenu.classList.remove('active');
        }
    };
    document.addEventListener('click', closeMenuHandler);

    // Handle quality selection
    qualityMenu.addEventListener('click', (e) => {
        const option = e.target.closest('.quality-option');
        if (!option) return;

        e.stopPropagation();

        const qualityData = option.getAttribute('data-quality');

        if (this.options.debug) {
            console.log('🎬 Quality clicked - raw data:', qualityData, 'type:', typeof qualityData);
        }

        if (qualityData === 'auto') {
            // Enable auto mode
            this.selectedQuality = 'auto';

            if (this.adaptiveStreamingType === 'dash' && this.dashPlayer) {
                this.dashPlayer.updateSettings({
                    streaming: {
                        abr: {
                            autoSwitchBitrate: { video: true }
                        }
                    }
                });
                if (this.options.debug) console.log('✅ Auto quality enabled');
            } else if (this.adaptiveStreamingType === 'hls' && this.hlsPlayer) {
                this.hlsPlayer.currentLevel = -1;
            }

        } else {
            // Manual quality selection
            const selectedHeight = parseInt(qualityData, 10);

            if (isNaN(selectedHeight)) {
                if (this.options.debug) console.error('❌ Invalid quality data:', qualityData);
                return;
            }

            if (this.options.debug) {
                console.log('🎬 Setting manual quality to height:', selectedHeight);
            }

            this.selectedQuality = selectedHeight;

            if (this.adaptiveStreamingType === 'dash') {
                this.setDashQualityByHeight(selectedHeight);
            } else if (this.adaptiveStreamingType === 'hls') {
                const levelIndex = this.hlsPlayer.levels.findIndex(l => l.height === selectedHeight);
                if (levelIndex >= 0) {
                    this.hlsPlayer.currentLevel = levelIndex;
                }
            }
        }

        // Update display immediately
        this.updateAdaptiveQualityDisplay();

        // Close menu
        qualityMenu.classList.remove('active');
    });

    if (this.options.debug) {
        console.log('✅ Quality events bound');
    }
}

setDashQualityByHeight(targetHeight) {
    if (!this.dashPlayer) return;

    try {
        const targetQuality = this.adaptiveQualities.find(q => q.height === targetHeight);
        if (!targetQuality) {
            if (this.options.debug) console.error('❌ Quality not found for height:', targetHeight);
            return;
        }

        if (this.options.debug) {
            console.log('🎬 Setting quality:', targetQuality);
        }

        // Disable auto quality
        this.dashPlayer.updateSettings({
            streaming: {
                abr: {
                    autoSwitchBitrate: { video: false }
                }
            }
        });

        // Get current video track
        const currentTrack = this.dashPlayer.getCurrentTrackFor('video');

        if (!currentTrack) {
            if (this.options.debug) console.error('❌ No current video track');
            return;
        }

        // Find the correct track for this quality
        const allTracks = this.dashPlayer.getTracksFor('video');
        let targetTrack = null;

        for (const track of allTracks) {
            if (track.bitrateList && track.bitrateList[targetQuality.bitrateIndex]) {
                const bitrate = track.bitrateList[targetQuality.bitrateIndex];
                if (bitrate.height === targetHeight) {
                    targetTrack = track;
                    break;
                }
            }
        }

        if (!targetTrack) {
            if (this.options.debug) console.error('❌ Target track not found');
            return;
        }

        // Switch track if different
        if (currentTrack.index !== targetTrack.index) {
            this.dashPlayer.setCurrentTrack(targetTrack);
            if (this.options.debug) {
                console.log('✅ Switched to track:', targetTrack.index);
            }
        }

        // Force quality on current track
        setTimeout(() => {
            try {
                // Use the MediaPlayer API to set quality
                this.dashPlayer.updateSettings({
                    streaming: {
                        abr: {
                            initialBitrate: { video: targetQuality.bandwidth / 1000 },
                            maxBitrate: { video: targetQuality.bandwidth / 1000 },
                            minBitrate: { video: targetQuality.bandwidth / 1000 }
                        }
                    }
                });

                if (this.options.debug) {
                    console.log('✅ Quality locked to:', targetHeight + 'p', 'bandwidth:', targetQuality.bandwidth);
                }

                // Update button text immediately
                const qualityBtnText = this.controls?.querySelector('.quality-btn .selected-quality');
                if (qualityBtnText) {
                    qualityBtnText.textContent = `${targetHeight}p`;
                }

                // Force reload of segments at new quality
                const currentTime = this.video.currentTime;
                this.dashPlayer.seek(currentTime + 0.1);
                setTimeout(() => {
                    this.dashPlayer.seek(currentTime);
                }, 100);

            } catch (innerError) {
                if (this.options.debug) console.error('❌ Error setting quality:', innerError);
            }
        }, 100);

    } catch (error) {
        if (this.options.debug) console.error('❌ Error in setDashQualityByHeight:', error);
    }
}

setDashQuality(qualityIndex) {
    if (!this.dashPlayer) return;

    try {
        const selectedQuality = this.adaptiveQualities[qualityIndex];
        if (!selectedQuality) {
            if (this.options.debug) console.error('❌ Quality not found at index:', qualityIndex);
            return;
        }

        if (this.options.debug) {
            console.log('🎬 Setting DASH quality:', selectedQuality);
        }

        // Disable auto quality
        this.dashPlayer.updateSettings({
            streaming: {
                abr: {
                    autoSwitchBitrate: { video: false }
                }
            }
        });

        // Set the specific quality using bitrateIndex
        setTimeout(() => {
            try {
                this.dashPlayer.setQualityFor('video', selectedQuality.bitrateIndex);

                if (this.options.debug) {
                    console.log('✅ DASH quality set to bitrateIndex:', selectedQuality.bitrateIndex, 'height:', selectedQuality.height);
                }

                // Update button text immediately
                const qualityBtnText = this.controls?.querySelector('.quality-btn .selected-quality');
                if (qualityBtnText) {
                    qualityBtnText.textContent = selectedQuality.label;
                }

            } catch (innerError) {
                if (this.options.debug) console.error('❌ Error setting quality:', innerError);
            }
        }, 100);

    } catch (error) {
        if (this.options.debug) console.error('❌ Error in setDashQuality:', error);
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
