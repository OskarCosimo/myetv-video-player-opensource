// Core Module for MYETV Video Player
// Conservative modularization - original code preserved exactly
// Created by https://www.myetv.tv https://oskarcosimo.com

constructor(videoElement, options = {}) {
    this.video = typeof videoElement === 'string'
        ? document.getElementById(videoElement)
        : videoElement;

    if (!this.video) {
        throw new Error('Video element not found: ' + videoElement);
    }

    this.options = {
        showQualitySelector: true,   // Enable quality selector button
        showSpeedControl: true,      // Enable speed control button
        showFullscreen: true,        // Enable fullscreen button
        showPictureInPicture: true,  // Enable PiP button
        showSubtitles: true,         // Enable subtitles button
        subtitlesEnabled: false,     // Enable subtitles by default if available
        autoHide: true,              // auto-hide controls when idle
        autoHideDelay: 3000,         // hide controls after ... seconds of inactivity (specificed in milliseconds)
        hideCursor: true,            // hide mouse cursor when idle
        poster: null,                // URL of poster image
        showPosterOnEnd: false,      // Show poster again when video ends
        keyboardControls: true,      // Enable keyboard controls
        showSeekTooltip: true,       // Show tooltip on seek bar at mouse hover
        showTitleOverlay: false,     // Show video title overlay
        videoTitle: '',              // Title text to show in overlay
        videoSubtitle: '',           // Subtitle text to show in overlay
        persistentTitle: false,   // If true, title overlay stays visible
        controlBarOpacity: options.controlBarOpacity !== undefined ? options.controlBarOpacity : 0.95, // Opacity of control bar (0.0 to 1.0)
        titleOverlayOpacity: options.titleOverlayOpacity !== undefined ? options.titleOverlayOpacity : 0.95, // Opacity of title overlay (0.0 to 1.0)
        debug: false,             // Enable/disable debug logging
        autoplay: false,          // if video should autoplay at start
        defaultQuality: 'auto',   // 'auto', '1080p', '720p', '480p', etc.
        language: null,           // language of the player (default english)
        pauseClick: true,         // the player should be paused when click over the video area
        doubleTapPause: true,     // first tap (or click) show the controlbar, second tap (or click) pause
        brandLogoEnabled: false,  // Enable/disable brand logo
        brandLogoUrl: '',         // URL for brand logo image
        brandLogoLinkUrl: '',     // Optional URL to open when clicking the logo
        brandLogoTooltipText: '', // Tooltip text for brand logo
        playlistEnabled: true,    // Enable/disable playlist detection
        playlistAutoPlay: true,   // Auto-play next video when current ends
        playlistLoop: false,      // Loop playlist when reaching the end
        loop: false,              // Loop video when it ends (restart from beginning)
        volumeSlider: 'show',     // Mobile volume slider: 'show' (horizontal popup) or 'hide' (no slider on mobile)
        // WATERMARK OVERLAY
        watermarkUrl: '',           // URL of watermark image
        watermarkLink: '',          // Optional URL to open when clicking watermark
        watermarkPosition: 'bottomright', // Position: topleft, topright, bottomleft, bottomright
        watermarkTitle: '',         // Optional tooltip title
        hideWatermark: true,        // Hide watermark with controls (default: true)
        // ADAPTIVE STREAMING SUPPORT
        adaptiveStreaming: false, // Enable DASH/HLS adaptive streaming
        dashLibUrl: 'https://cdn.dashjs.org/latest/dash.all.min.js', // Dash.js library URL
        hlsLibUrl: 'https://cdn.jsdelivr.net/npm/hls.js@latest', // HLS.js library URL
        adaptiveQualityControl: true, // Show quality control for adaptive streams
        //seek shape
        seekHandleShape: 'circle', // Available shape: none, circle, square, diamond, arrow, triangle, heart, star
        // AUDIO PLAYER
        audiofile: false,       // if true, adapt player to audio file (hide video element)
        audiowave: false,       // if true, show audio wave visualization (Web Audio API)
        // RESOLUTION CONTROL
        resolution: "normal", // "normal", "4:3", "16:9", "stretched", "fit-to-screen", "scale-to-fit"
        ...options
    };

    this.isUserSeeking = false;
    this.controlsTimeout = null;
    this.titleTimeout = null;
    this.currentQualityIndex = 0;
    this.qualities = [];
    this.originalSources = [];
    this.isPiPSupported = this.checkPiPSupport();
    this.seekTooltip = null;
    this.titleOverlay = null;
    this.isPlayerReady = false;

    // Subtitle management
    this.textTracks = [];
    this.currentSubtitleTrack = null;
    this.subtitlesEnabled = false;
    this.customSubtitleRenderer = null;

    // Chapter management
    this.chapters = [];
    this.chapterMarkersContainer = null;
    this.chapterTooltip = null;

    // Dual quality indicator management
    this.selectedQuality = this.options.defaultQuality || 'auto';
    this.currentPlayingQuality = null;
    this.qualityMonitorInterval = null;

    // Quality change management
    this.qualityChangeTimeout = null;
    this.isChangingQuality = false;

    // Quality debug
    this.debugQuality = false;

    // Auto-hide system
    this.autoHideTimer = null;
    this.mouseOverControls = false;
    this.autoHideDebug = false;
    this.autoHideInitialized = false;

    // Poster management
    this.posterOverlay = null;

    // Watermark overlay
    this.watermarkElement = null;

    // Custom event system
    this.eventCallbacks = {
        // Core lifecycle events
        'playerready': [],     // Fired when player is fully initialized and ready
        'played': [],          // Fired when video starts playing
        'paused': [],          // Fired when video is paused
        'ended': [],           // Fired when video playback ends

        // Playback state events
        'playing': [],         // Fired when video is actually playing (after buffering)
        'waiting': [],         // Fired when video is waiting for data (buffering)
        'seeking': [],         // Fired when seek operation starts
        'seeked': [],          // Fired when seek operation completes

        // Loading events
        'loadstart': [],       // Fired when browser starts looking for media
        'loadedmetadata': [],  // Fired when metadata (duration, dimensions) is loaded
        'loadeddata': [],      // Fired when data for current frame is loaded
        'canplay': [],         // Fired when browser can start playing video
        'progress': [],        // Fired periodically while downloading media
        'durationchange': [],  // Fired when duration attribute changes

        // Error events
        'error': [],           // Fired when media loading or playback error occurs
        'stalled': [],         // Fired when browser is trying to get data but it's not available

        // Control events
        'timeupdate': [],      // Fired when current playback position changes
        'volumechange': [],    // Fired when volume or muted state changes
        'speedchange': [],     // Fired when playback speed changes
        'qualitychange': [],   // Fired when video quality changes

        // Feature events
        'subtitlechange': [],  // Fired when subtitle track changes
        'chapterchange': [],   // Fired when video chapter changes
        'pipchange': [],       // Fired when picture-in-picture mode changes
        'fullscreenchange': [], // Fired when fullscreen mode changes
        'playlistchange': []   // Fired when playlist item changes
    };

    // Playlist management
    this.playlist = [];
    this.currentPlaylistIndex = -1;
    this.playlistId = null;
    this.isPlaylistActive = false;

    // Adaptive streaming management
    this.dashPlayer = null;
    this.hlsPlayer = null;
    this.adaptiveStreamingType = null; // 'dash', 'hls', or null
    this.isAdaptiveStream = false;
    this.adaptiveQualities = [];
    this.librariesLoaded = {
        dash: false,
        hls: false
    };

    this.lastTimeUpdate = 0; // For throttling timeupdate events
    // Inject default styles
    this.injectDefaultControlbarStyles();
    // Set language if specified
    if (this.options.language && this.isI18nAvailable()) {
        VideoPlayerTranslations.setLanguage(this.options.language);
    }
    // Apply autoplay if enabled
    if (options.autoplay) {
        this.video.autoplay = true;
    }

    try {
        this.interceptAutoLoading();
        this.createPlayerStructure();
        this.initializeElements();
        this.setupMenuToggles(); // Initialize menu toggle system
        // audio player adaptation
        this.adaptToAudioFile = function () {
            if (this.options.audiofile) {
                // Nascondere video
                if (this.video) {
                    this.video.style.display = 'none';
                }
                if (this.container) {
                    this.container.classList.add('audio-player');
                }
                if (this.options.audiowave) {
                    this.initAudioWave();
                }
            }
        };
        // Audio wave with Web Audio API
        this.initAudioWave = function () {
            if (!this.video) return;

            this.audioWaveCanvas = document.createElement('canvas');
            this.audioWaveCanvas.className = 'audio-wave-canvas';
            this.container.appendChild(this.audioWaveCanvas);

            const canvasCtx = this.audioWaveCanvas.getContext('2d');
            const WIDTH = this.audioWaveCanvas.width = this.container.clientWidth;
            const HEIGHT = this.audioWaveCanvas.height = 60; // altezza onda audio

            // Setup Web Audio API
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
            this.analyser = this.audioCtx.createAnalyser();
            this.source = this.audioCtx.createMediaElementSource(this.video);
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioCtx.destination);

            this.analyser.fftSize = 2048;
            const bufferLength = this.analyser.fftSize;
            const dataArray = new Uint8Array(bufferLength);

            // canvas
            const draw = () => {
                requestAnimationFrame(draw);
                this.analyser.getByteTimeDomainData(dataArray);

                canvasCtx.fillStyle = '#222';
                canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

                canvasCtx.lineWidth = 2;
                canvasCtx.strokeStyle = '#33ccff';
                canvasCtx.beginPath();

                const sliceWidth = WIDTH / bufferLength;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    const v = dataArray[i] / 128.0;
                    const y = v * HEIGHT / 2;

                    if (i === 0) {
                        canvasCtx.moveTo(x, y);
                    } else {
                        canvasCtx.lineTo(x, y);
                    }

                    x += sliceWidth;
                }
                canvasCtx.lineTo(WIDTH, HEIGHT / 2);
                canvasCtx.stroke();
            };

            draw();
        };
        this.adaptToAudioFile();
        this.bindEvents();

        if (this.options.keyboardControls) {
            this.setupKeyboardControls();
        }

        this.updateVolumeSliderVisual();
        this.initVolumeTooltip();
        this.updateTooltips();
        this.markPlayerReady();
        this.initializePluginSystem();
        this.restoreSourcesAsync();

        this.initializeSubtitles();
        this.initializeQualityMonitoring();

        this.initializeResolution();
        this.initializeChapters();
        this.initializePoster();
        this.initializeWatermark();

    } catch (error) {
        if (this.options.debug) console.error('Video player initialization error:', error);
    }
}

getPlayerState() {
    return {
        isPlaying: !this.isPaused(),
        isPaused: this.isPaused(),
        currentTime: this.getCurrentTime(),
        duration: this.getDuration(),
        volume: this.getVolume(),
        isMuted: this.isMuted(),
        playbackRate: this.getPlaybackRate(),
        isFullscreen: this.isFullscreenActive(),
        isPictureInPicture: this.isPictureInPictureActive(),
        subtitlesEnabled: this.isSubtitlesEnabled(),
        currentSubtitle: this.getCurrentSubtitleTrack(),
        selectedQuality: this.getSelectedQuality(),
        currentQuality: this.getCurrentPlayingQuality(),
        isAutoQuality: this.isAutoQualityActive()
    };
}

isI18nAvailable() {
    return typeof VideoPlayerTranslations !== 'undefined' &&
        VideoPlayerTranslations !== null &&
        typeof VideoPlayerTranslations.t === 'function';
}

t(key) {
    if (this.isI18nAvailable()) {
        try {
            return VideoPlayerTranslations.t(key);
        } catch (error) {
            if (this.options.debug) console.warn('Translation error:', error);
        }
    }

    const fallback = {
        'play_pause': 'Play/Pause (Space)',
        'mute_unmute': 'Mute/Unmute (M)',
        'volume': 'Volume',
        'playback_speed': 'Playback speed',
        'video_quality': 'Video quality',
        'picture_in_picture': 'Picture-in-Picture (P)',
        'fullscreen': 'Fullscreen (F)',
        'subtitles': 'Subtitles (S)',
        'subtitles_enable': 'Enable subtitles',
        'subtitles_disable': 'Disable subtitles',
        'subtitles_off': 'Off',
        'auto': 'Auto',
        'brand_logo': 'Brand logo',
        'next_video': 'Next video (N)',
        'prev_video': 'Previous video (P)',
        'playlist_next': 'Next',
        'playlist_prev': 'Previous'
    };

    return fallback[key] || key;
}

interceptAutoLoading() {
    this.saveOriginalSources();
    this.disableSources();

    this.video.preload = 'none';
    this.video.controls = false;
    this.video.autoplay = false;

    if (this.video.src && this.video.src !== window.location.href) {
        this.originalSrc = this.video.src;
        this.video.removeAttribute('src');
        this.video.src = '';
    }

    this.hideNativePlayer();

    if (this.options.debug) console.log('📁 Sources temporarily disabled to prevent blocking');
}

saveOriginalSources() {
    const sources = this.video.querySelectorAll('source');
    this.originalSources = [];

    sources.forEach((source, index) => {
        if (source.src) {
            this.originalSources.push({
                element: source,
                src: source.src,
                type: source.type || 'video/mp4',
                quality: source.getAttribute('data-quality') || `quality-${index}`,
                index: index
            });
        }
    });

    if (this.options.debug) console.log(`📁 Saved ${this.originalSources.length} sources originali:`, this.originalSources);
}

disableSources() {
    const sources = this.video.querySelectorAll('source');
    sources.forEach(source => {
        if (source.src) {
            source.removeAttribute('src');
        }
    });
}

restoreSourcesAsync() {
    setTimeout(() => {
        this.restoreSources();
    }, 200);
}

    async restoreSources() {
    try {
        // Check for adaptive streaming first
        let adaptiveSource = null;

        if (this.originalSrc) {
            adaptiveSource = this.originalSrc;
        } else if (this.originalSources.length > 0) {
            // Check if any source is adaptive
            const firstSource = this.originalSources[0];
            if (firstSource.src && this.detectStreamType(firstSource.src)) {
                adaptiveSource = firstSource.src;
            }
        }

        // Initialize adaptive streaming if detected
        if (adaptiveSource && this.options.adaptiveStreaming) {
            const adaptiveInitialized = await this.initializeAdaptiveStreaming(adaptiveSource);
            if (adaptiveInitialized) {
                if (this.options.debug) console.log('📡 Adaptive streaming initialized');
                return;
            }
        }

        // Fallback to traditional sources
        if (this.originalSrc) {
            this.video.src = this.originalSrc;
        }

        this.originalSources.forEach(sourceData => {
            if (sourceData.element && sourceData.src) {
                sourceData.element.src = sourceData.src;
            }
        });

        this.qualities = this.originalSources.map(s => ({
            src: s.src,
            quality: s.quality,
            type: s.type
        }));

        if (this.originalSrc && this.qualities.length === 0) {
            this.qualities.push({
                src: this.originalSrc,
                quality: 'default',
                type: 'video/mp4'
            });
        }

        if (this.qualities.length > 0) {
            this.video.load();

            // CRITICAL: Re-initialize subtitles AFTER video.load() completes
            this.video.addEventListener('loadedmetadata', () => {
                setTimeout(() => {
                    this.reinitializeSubtitles();
                    if (this.options.debug) console.log('🔄 Subtitles re-initialized after video load');
                }, 300);
            }, { once: true });
        }

        if (this.options.debug) console.log('✅ Sources ripristinate:', this.qualities);

    } catch (error) {
        if (this.options.debug) console.error('❌ Errore ripristino sources:', error);
    }
}

reinitializeSubtitles() {
    if (this.options.debug) console.log('🔄 Re-initializing subtitles...');

    // Clear existing subtitle data
    this.textTracks = [];
    this.currentSubtitleTrack = null;
    this.subtitlesEnabled = false;

    // Re-detect and initialize subtitles
    this.detectTextTracks();
    this.updateSubtitlesUI();
    this.bindSubtitleEvents();

    if (this.options.debug) console.log(`📝 Re-detected ${this.textTracks.length} subtitle tracks`);

    // Auto-enable first subtitle track if available and default is set
    const defaultTrack = this.getDefaultSubtitleTrack();
    if (defaultTrack !== -1 && this.options.subtitlesEnabled === true) {  // <-- AGGIUNTO!
        setTimeout(() => {
            this.enableSubtitleTrack(defaultTrack);
            if (this.options.debug) console.log(`🎯 Auto-enabled default subtitle track: ${defaultTrack}`);
        }, 100);
    } else {
        if (this.options.debug) {
            console.log(`📝 Default subtitle track NOT auto-enabled:`, {
                defaultTrack: defaultTrack,
                subtitlesEnabled: this.options.subtitlesEnabled
            });
        }
    }
}

getDefaultSubtitleTrack() {
    if (!this.video.textTracks) return -1;

    for (let i = 0; i < this.video.textTracks.length; i++) {
        const track = this.video.textTracks[i];
        if (track.mode === 'showing' || track.default) {
            return i;
        }
    }
    return -1;
}

markPlayerReady() {
    setTimeout(() => {
        this.isPlayerReady = true;
        if (this.container) {
            this.container.classList.add('player-initialized');
        }

        this.triggerEvent('playerready', {
            playerState: this.getPlayerState(),
            qualities: this.qualities,
            subtitles: this.textTracks,
            chapters: this.chapters,
            playlist: this.getPlaylistInfo()
        });

        if (this.video) {
            this.video.style.visibility = '';
            this.video.style.opacity = '';
            this.video.style.pointerEvents = '';
        }

        // UPDATE SETTINGS MENU VISIBILITY IF APPLICABLE
        if (typeof this.updateSettingsMenuVisibility === 'function') {
            this.updateSettingsMenuVisibility();
        }

        // INITIALIZE AUTO-HIDE AFTER EVERYTHING IS READY
        setTimeout(() => {
            if (this.options.autoHide && !this.autoHideInitialized) {
                this.initAutoHide();
            }

            // Fix: Apply default quality (auto or specific)
            if (this.selectedQuality && this.qualities && this.qualities.length > 0) {
                if (this.options.debug) console.log(`🎯 Applying defaultQuality: "${this.selectedQuality}"`);

                if (this.selectedQuality === 'auto') {
                    this.enableAutoQuality();
                } else {
                    // Check if requested quality is available
                    const requestedQuality = this.qualities.find(q => q.quality === this.selectedQuality);
                    if (requestedQuality) {
                        if (this.options.debug) console.log(`✅ Quality "${this.selectedQuality}" available`);
                        this.setQuality(this.selectedQuality);
                    } else {
                        if (this.options.debug) console.warn(`⚠️ Quality "${this.selectedQuality}" not available - fallback to auto`);
                        if (this.options.debug) console.log('📋 Available qualities:', this.qualities.map(q => q.quality));
                        this.enableAutoQuality();
                    }
                }
            }

            // Autoplay
            if (this.options.autoplay) {
                if (this.options.debug) console.log('🎬 Autoplay enabled');
                setTimeout(() => {
                    this.video.play().catch(error => {
                        if (this.options.debug) console.warn('⚠️ Autoplay blocked:', error);
                    });
                }, 100);
            }
        }, 200);

    }, 100);
}

createPlayerStructure() {
    let wrapper = this.video.closest('.video-wrapper');
    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'video-wrapper';
        this.video.parentNode.insertBefore(wrapper, this.video);
        wrapper.appendChild(this.video);
    }

    this.container = wrapper;

    this.createInitialLoading();
    this.createLoadingOverlay();
    this.collectVideoQualities();
    this.createControls();
    this.createBrandLogo();
    this.detectPlaylist();

    if (this.options.showTitleOverlay) {
        this.createTitleOverlay();
    }
}

createInitialLoading() {
    const initialLoader = document.createElement('div');
    initialLoader.className = 'initial-loading';
    initialLoader.innerHTML = '<div class="loading-spinner"></div>';
    this.container.appendChild(initialLoader);
    this.initialLoading = initialLoader;
}

collectVideoQualities() {
    if (this.options.debug) console.log('📁 Video qualities will be loaded with restored sources');
}

createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loadingOverlay-' + this.getUniqueId();
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    this.container.appendChild(overlay);
    this.loadingOverlay = overlay;
}

createTitleOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'title-overlay';
    overlay.id = 'titleOverlay-' + this.getUniqueId();

    const titleText = document.createElement('h2');
    titleText.className = 'title-text';
    titleText.textContent = this.options.videoTitle || '';
    overlay.appendChild(titleText);

    // add subtitles
    if (this.options.videoSubtitle) {
        const subtitleText = document.createElement('p');
        subtitleText.className = 'subtitle-text';
        subtitleText.textContent = this.options.videoSubtitle;
        overlay.appendChild(subtitleText);
    }

    if (this.controls) {
        this.container.insertBefore(overlay, this.controls);
    } else {
        this.container.appendChild(overlay);
    }

    this.titleOverlay = overlay;

    if (this.options.persistentTitle && this.options.videoTitle) {
        this.showTitleOverlay();
    }
}

updateTooltips() {
    if (!this.controls) return;

    try {
        this.controls.querySelectorAll('[data-tooltip]').forEach(element => {
            const key = element.getAttribute('data-tooltip');
            element.title = this.t(key);
        });

        const autoOption = this.controls.querySelector('.quality-option[data-quality="auto"]');
        if (autoOption) {
            autoOption.textContent = this.t('auto');
        }
    } catch (error) {
        if (this.options.debug) console.warn('Errore aggiornamento tooltip:', error);
    }
}

setLanguage(lang) {
    if (this.isI18nAvailable()) {
        try {
            if (VideoPlayerTranslations.setLanguage(lang)) {
                this.updateTooltips();
                return true;
            }
        } catch (error) {
            if (this.options.debug) console.warn('Errore cambio lingua:', error);
        }
    }
    return false;
}

setVideoTitle(title) {
    this.options.videoTitle = title || '';

    if (this.titleOverlay) {
        const titleElement = this.titleOverlay.querySelector('.title-text');
        if (titleElement) {
            titleElement.textContent = this.options.videoTitle;
        }

        if (title) {
            this.showTitleOverlay();

            if (!this.options.persistentTitle) {
                this.clearTitleTimeout();
                this.titleTimeout = setTimeout(() => {
                    this.hideTitleOverlay();
                }, 3000);
            }
        }
    }

    return this;
}

getVideoTitle() {
    return this.options.videoTitle;
}

setVideoSubtitle(subtitle) {
    this.options.videoSubtitle = subtitle || '';

    if (this.titleOverlay) {
        let subtitleElement = this.titleOverlay.querySelector('.subtitle-text');

        if (subtitle) {
            if (!subtitleElement) {
                subtitleElement = document.createElement('p');
                subtitleElement.className = 'subtitle-text';
                this.titleOverlay.appendChild(subtitleElement);
            }
            subtitleElement.textContent = subtitle;
        } else if (subtitleElement) {
            subtitleElement.remove();
        }
    }

    return this;
}

getVideoSubtitle() {
    return this.options.videoSubtitle;
}

setPersistentTitle(persistent) {
    this.options.persistentTitle = persistent;

    if (this.titleOverlay && this.options.videoTitle) {
        if (persistent) {
            this.showTitleOverlay();
            this.clearTitleTimeout();
        } else {
            this.titleOverlay.classList.remove('persistent');
            if (this.titleOverlay.classList.contains('show')) {
                this.clearTitleTimeout();
                this.titleTimeout = setTimeout(() => {
                    this.hideTitleOverlay();
                }, 3000);
            }
        }
    }

    return this;
}

enableTitleOverlay() {
    if (!this.titleOverlay && !this.options.showTitleOverlay) {
        this.options.showTitleOverlay = true;
        this.createTitleOverlay();
    }
    return this;
}

disableTitleOverlay() {
    if (this.titleOverlay) {
        this.titleOverlay.remove();
        this.titleOverlay = null;
    }
    this.options.showTitleOverlay = false;
    return this;
}

getUniqueId() {
    return Math.random().toString(36).substr(2, 9);
}

initializeElements() {
    this.progressContainer = this.controls?.querySelector('.progress-container');
    this.progressFilled = this.controls?.querySelector('.progress-filled');
    this.progressBuffer = this.controls?.querySelector('.progress-buffer');
    this.progressHandle = this.controls?.querySelector('.progress-handle');
    this.seekTooltip = this.controls?.querySelector('.seek-tooltip');

    this.playPauseBtn = this.controls?.querySelector('.play-pause-btn');
    this.muteBtn = this.controls?.querySelector('.mute-btn');
    this.fullscreenBtn = this.controls?.querySelector('.fullscreen-btn');
    this.speedBtn = this.controls?.querySelector('.speed-btn');
    this.qualityBtn = this.controls?.querySelector('.quality-btn');
    this.pipBtn = this.controls?.querySelector('.pip-btn');
    this.subtitlesBtn = this.controls?.querySelector('.subtitles-btn');
    this.playlistPrevBtn = this.controls?.querySelector('.playlist-prev-btn');
    this.playlistNextBtn = this.controls?.querySelector('.playlist-next-btn');

    this.playIcon = this.controls?.querySelector('.play-icon');
    this.pauseIcon = this.controls?.querySelector('.pause-icon');
    this.volumeIcon = this.controls?.querySelector('.volume-icon');
    this.muteIcon = this.controls?.querySelector('.mute-icon');
    this.fullscreenIcon = this.controls?.querySelector('.fullscreen-icon');
    this.exitFullscreenIcon = this.controls?.querySelector('.exit-fullscreen-icon');
    this.pipIcon = this.controls?.querySelector('.pip-icon');
    this.pipExitIcon = this.controls?.querySelector('.pip-exit-icon');

    this.volumeSlider = this.controls?.querySelector('.volume-slider');
    this.currentTimeEl = this.controls?.querySelector('.current-time');
    this.durationEl = this.controls?.querySelector('.duration');
    this.speedMenu = this.controls?.querySelector('.speed-menu');
    this.qualityMenu = this.controls?.querySelector('.quality-menu');
    this.subtitlesMenu = this.controls?.querySelector('.subtitles-menu');
    // Apply seek handle shape from options
    if (this.progressHandle && this.options.seekHandleShape) {
        this.setSeekHandleShape(this.options.seekHandleShape);
    }
}

// Generic method to close all active menus (works with plugins too)
closeAllMenus() {
    if (!this.controls) return;

    const menus = this.controls.querySelectorAll('.speed-menu, .quality-menu, .subtitles-menu, .settings-menu');
    const buttons = this.controls.querySelectorAll('.control-btn');

    menus.forEach(menu => menu.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));

    this.currentOpenMenu = null;

    if (this.options.debug) {
        console.log('All menus closed');
    }
}

// Generic menu toggle setup (works with core menus and plugin menus)
setupMenuToggles() {
    if (!this.controls) return;

    this.currentOpenMenu = null;

    this.controls.addEventListener('click', (e) => {
        const button = e.target.closest('.control-btn');
        if (!button) return;

        const buttonClasses = Array.from(button.classList);
        let menuElement = null;

        for (const cls of buttonClasses) {
            if (cls.endsWith('-btn')) {
                const menuClass = cls.replace('-btn', '-menu');
                menuElement = this.controls.querySelector(`.${menuClass}`);
                if (menuElement) break;
            }
        }

        if (!menuElement) return;

        e.stopPropagation();
        e.preventDefault();

        const isOpen = menuElement.classList.contains('active');

        this.closeAllMenus();

        if (!isOpen) {
            menuElement.classList.add('active');
            button.classList.add('active');
            this.currentOpenMenu = menuElement;
            if (this.options.debug) {
                console.log('Menu opened:', menuElement.className);
            }
        } else {
            this.currentOpenMenu = null;
            if (this.options.debug) {
                console.log('Menu closed:', menuElement.className);
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (!this.controls) return;
        if (!this.controls.contains(e.target)) {
            this.closeAllMenus();
        }
    });

    if (this.options.debug) {
        console.log('✅ Menu toggle system initialized (click-based, auto-close)');
    }
}

updateVolumeSliderVisual() {
    if (!this.video || !this.container) return;

    const volume = this.video.muted ? 0 : this.video.volume;
    const percentage = Math.round(volume * 100);

    this.container.style.setProperty('--player-volume-fill', percentage + '%');

    if (this.volumeSlider) {
        this.volumeSlider.value = percentage;
    }
}

createVolumeTooltip() {
    const volumeContainer = this.controls?.querySelector('.volume-container');
    if (!volumeContainer || volumeContainer.querySelector('.volume-tooltip')) {
        return; // Tooltip already present
    }

    const tooltip = document.createElement('div');
    tooltip.className = 'volume-tooltip';
    tooltip.textContent = '50%';
    volumeContainer.appendChild(tooltip);

    this.volumeTooltip = tooltip;

    if (this.options.debug) {
        console.log('Dynamic volume tooltip created');
    }
}

updateVolumeTooltip() {
    if (!this.volumeTooltip || !this.video) return;

    const volume = Math.round(this.video.volume * 100);
    this.volumeTooltip.textContent = volume + '%';

    // Aggiorna la posizione del tooltip
    this.updateVolumeTooltipPosition(this.video.volume);

    if (this.options.debug) {
        console.log('Volume tooltip updated:', volume + '%');
    }
}

updateVolumeTooltipPosition(volumeValue = null) {
    if (!this.volumeTooltip || !this.video) return;

    const volumeSlider = this.controls?.querySelector('.volume-slider');
    if (!volumeSlider) return;

    // If no volume provided, use current volume
    if (volumeValue === null) {
        volumeValue = this.video.volume;
    }

    // Calcola la posizione esatta del thumb
    const sliderRect = volumeSlider.getBoundingClientRect();
    const sliderWidth = sliderRect.width;

    // Thumb size is typically 14px (as defined in CSS)
    const thumbSize = 14; // var(--player-volume-handle-size)

    // Calcola la posizione del centro del thumb
    // Il thumb si muove da thumbSize/2 a (sliderWidth - thumbSize/2)
    const availableWidth = sliderWidth - thumbSize;
    const thumbCenterPosition = (thumbSize / 2) + (availableWidth * volumeValue);

    // Converti in percentuale relativa al container dello slider
    const percentage = (thumbCenterPosition / sliderWidth) * 100;

    // Posiziona il tooltip
    this.volumeTooltip.style.left = percentage + '%';

    if (this.options.debug) {
        console.log('Volume tooltip position updated:', {
            volumeValue: volumeValue,
            percentage: percentage + '%',
            thumbCenter: thumbCenterPosition,
            sliderWidth: sliderWidth
        });
    }
}

initVolumeTooltip() {
    this.createVolumeTooltip();

    // Set initial position immediately
    setTimeout(() => {
        if (this.volumeTooltip && this.video) {
            this.updateVolumeTooltipPosition(this.video.volume);
            this.updateVolumeTooltip();
        }
    }, 50); // Shorter delay for faster initialization
}

updateVolumeSliderVisualWithTooltip() {
    const volumeSlider = this.controls?.querySelector('.volume-slider');
    if (!volumeSlider || !this.video) return;

    const volume = this.video.volume || 0;
    const percentage = Math.round(volume * 100);

    volumeSlider.value = volume;

    // Update CSS custom property per il riempimento visuale
    const volumeFillPercentage = percentage + '%';
    volumeSlider.style.setProperty('--player-volume-fill', volumeFillPercentage);

    // Aggiorna anche il tooltip se presente (testo e posizione)
    this.updateVolumeTooltip();

    if (this.options.debug) {
        console.log('Volume slider aggiornato:', {
            volume: volume,
            percentage: percentage,
            fillPercentage: volumeFillPercentage
        });
    }
}

/**
 * Set mobile volume slider visibility
 * @param {String} mode - 'show' (horizontal popup) or 'hide' (no slider on mobile)
 * @returns {Object} this
 */
setMobileVolumeSlider(mode) {
    if (!['show', 'hide'].includes(mode)) {
        if (this.options.debug) console.warn('Invalid mobile volume slider mode:', mode);
        return this;
    }

    this.options.mobileVolumeSlider = mode;
    const volumeContainer = this.controls?.querySelector('.volume-container');
    if (volumeContainer) {
        // Set data attribute for CSS to use
        volumeContainer.setAttribute('data-mobile-slider', mode);
        if (this.options.debug) console.log('Mobile volume slider set to:', mode);
    }
    return this;
}

/**
 * Get mobile volume slider mode
 * @returns {String} Current mobile volume slider mode
 */
getMobileVolumeSlider() {
    return this.options.mobileVolumeSlider;
}

initVolumeTooltip() {

    this.createVolumeTooltip();

    setTimeout(() => {
        this.updateVolumeTooltip();
    }, 200);

    if (this.options.debug) {
        console.log('Dynamic volume tooltip inizializzation');
    }
}

setupSeekTooltip() {
    if (!this.options.showSeekTooltip || !this.progressContainer || !this.seekTooltip) return;

    this.progressContainer.addEventListener('mouseenter', () => {
        if (this.seekTooltip) {
            this.seekTooltip.classList.add('visible');
        }
    });

    this.progressContainer.addEventListener('mouseleave', () => {
        if (this.seekTooltip) {
            this.seekTooltip.classList.remove('visible');
        }
    });

    this.progressContainer.addEventListener('mousemove', (e) => {
        this.updateSeekTooltip(e);
    });
}

updateSeekTooltip(e) {
    if (!this.seekTooltip || !this.progressContainer || !this.video || !this.video.duration) return;

    const rect = this.progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = percentage * this.video.duration;

    this.seekTooltip.textContent = this.formatTime(targetTime);

    const tooltipRect = this.seekTooltip.getBoundingClientRect();
    let leftPosition = clickX;

    const tooltipWidth = tooltipRect.width || 50;
    const containerWidth = rect.width;

    leftPosition = Math.max(tooltipWidth / 2, Math.min(containerWidth - tooltipWidth / 2, clickX));

    this.seekTooltip.style.left = leftPosition + 'px';
}

play() {
    if (!this.video || this.isChangingQuality) return;

    this.video.play().catch(err => {
        if (this.options.debug) console.log('Play failed:', err);
    });

    if (this.playIcon) this.playIcon.classList.add('hidden');
    if (this.pauseIcon) this.pauseIcon.classList.remove('hidden');

    // Trigger event played
    this.triggerEvent('played', {
        currentTime: this.getCurrentTime(),
        duration: this.getDuration()
    });
}

pause() {
    if (!this.video) return;

    this.video.pause();
    if (this.playIcon) this.playIcon.classList.remove('hidden');
    if (this.pauseIcon) this.pauseIcon.classList.add('hidden');

    // Trigger paused event
    this.triggerEvent('paused', {
        currentTime: this.getCurrentTime(),
        duration: this.getDuration()
    });
}

updateVolume(value) {
    if (!this.video) return;

    const previousVolume = this.video.volume;
    const previousMuted = this.video.muted;

    this.video.volume = Math.max(0, Math.min(1, value / 100));

    if (this.video.volume > 0 && this.video.muted) {
        this.video.muted = false;
    }

    if (this.volumeSlider) this.volumeSlider.value = value;
    this.updateMuteButton();
    this.updateVolumeSliderVisual();
    this.initVolumeTooltip();

    // Triggers volumechange event if there is a significant change
    if (Math.abs(previousVolume - this.video.volume) > 0.01 || previousMuted !== this.video.muted) {
        this.triggerEvent('volumechange', {
            volume: this.getVolume(),
            muted: this.isMuted(),
            previousVolume: previousVolume,
            previousMuted: previousMuted
        });
    }
}

changeVolume(delta) {
    if (!this.video) return;

    const newVolume = Math.max(0, Math.min(1, this.video.volume + delta));
    this.updateVolume(newVolume * 100);
    this.updateVolumeSliderVisual();
    this.initVolumeTooltip();
}

updateProgress() {
    if (!this.video || !this.progressFilled || !this.progressHandle || this.isUserSeeking) return;

    if (this.video.duration && !isNaN(this.video.duration)) {
        const progress = (this.video.currentTime / this.video.duration) * 100;
        this.progressFilled.style.width = progress + '%';
        this.progressHandle.style.left = progress + '%';
    }

    this.updateTimeDisplay();

    // Trigger timeupdate event (with throttling to avoid too many events)
    if (!this.lastTimeUpdate || Date.now() - this.lastTimeUpdate > 250) {
        this.triggerEvent('timeupdate', {
            currentTime: this.getCurrentTime(),
            duration: this.getDuration(),
            progress: (this.getCurrentTime() / this.getDuration()) * 100 || 0
        });
        this.lastTimeUpdate = Date.now();
    }
}

updateBuffer() {
    if (!this.video || !this.progressBuffer) return;

    try {
        if (this.video.buffered && this.video.buffered.length > 0 && this.video.duration) {
            const buffered = (this.video.buffered.end(0) / this.video.duration) * 100;
            this.progressBuffer.style.width = buffered + '%';
        }
    } catch (error) {
        if (this.options.debug) console.log('Buffer update error (non-critical):', error);
    }
}

startSeeking(e) {
    if (e.cancelable) e.preventDefault();
    if (this.isChangingQuality) return;

    this.isUserSeeking = true;
    this.progressContainer.classList.add('seeking');
    this.seek(e);
    e.preventDefault();

    // Show controls during seeking
    if (this.options.autoHide && this.autoHideInitialized) {
        this.showControlsNow();
        this.resetAutoHideTimer();
    }
}

continueSeeking(e) {
    if (e.cancelable) e.preventDefault();
    if (this.isUserSeeking && !this.isChangingQuality) {
        this.seek(e);
    }
}

endSeeking() {
    this.isUserSeeking = false;
    this.progressContainer.classList.remove('seeking');
}

seek(e) {
    if (e.cancelable) {
        e.preventDefault();
    }
    if (!this.video || !this.progressContainer || !this.progressFilled || !this.progressHandle || this.isChangingQuality) return;

    const rect = this.progressContainer.getBoundingClientRect();

    // Support both mouse and touch events
    const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : 0));

    const clickX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));

    if (this.video.duration && !isNaN(this.video.duration)) {
        this.video.currentTime = percentage * this.video.duration;

        const progress = `${percentage * 100}%`;
        this.progressFilled.style.width = progress;
        this.progressHandle.style.left = progress;
    }
}

updateDuration() {
    if (this.durationEl && this.video && this.video.duration && !isNaN(this.video.duration)) {
        this.durationEl.textContent = this.formatTime(this.video.duration);
    }
}

changeSpeed(e) {
    if (!this.video || !e.target.classList.contains('speed-option') || this.isChangingQuality) return;

    const speed = parseFloat(e.target.getAttribute('data-speed'));
    if (speed && speed > 0) {
        this.video.playbackRate = speed;
        if (this.speedBtn) this.speedBtn.textContent = speed + 'x';

        if (this.speedMenu) {
            this.speedMenu.querySelectorAll('.speed-option').forEach(option => {
                option.classList.remove('active');
            });
            e.target.classList.add('active');
        }

        // Trigger speedchange event
        const previousSpeed = this.video.playbackRate;
        this.triggerEvent('speedchange', {
            speed: speed,
            previousSpeed: previousSpeed
        });
    }
}

onVideoEnded() {
    if (this.playIcon) this.playIcon.classList.remove('hidden');
    if (this.pauseIcon) this.pauseIcon.classList.add('hidden');

    // Handle loop option
    if (this.options.loop) {
        if (this.options.debug) console.log('🔄 Video loop enabled - restarting from beginning');
        this.video.currentTime = 0;
        this.video.play().catch(error => {
            if (this.options.debug) console.warn('Loop play failed:', error);
        });
        return; // Don't show controls or trigger ended event when looping
    }

    this.showControlsNow();

    // Trigger ended event
    this.triggerEvent('ended', {
        currentTime: this.getCurrentTime(),
        duration: this.getDuration(),
        playlistInfo: this.getPlaylistInfo()
    });
}

/**
 * Handle video loading errors (404, 503, network errors, etc.)
 * Triggers 'ended' event to allow proper cleanup and playlist continuation
 */
onVideoError(error) {
    if (this.options.debug) {
        console.error('Video loading error detected:', {
            error: error,
            code: this.video?.error?.code,
            message: this.video?.error?.message,
            src: this.video?.currentSrc || this.video?.src
        });
    }

    // Hide loading overlay
    this.hideLoading();
    if (this.initialLoading) {
        this.initialLoading.style.display = 'none';
    }

    // Remove quality-changing class if present
    if (this.video?.classList) {
        this.video.classList.remove('quality-changing');
    }

    // Reset changing quality flag
    this.isChangingQuality = false;

    // Show controls to allow user interaction
    this.showControlsNow();

    // Optional: Show poster if available
    if (this.options.showPosterOnEnd && this.posterOverlay) {
        this.showPoster();
    }

    // Trigger 'ended' event to allow proper cleanup
    // This allows playlist to continue or other error handling
    this.triggerEvent('ended', {
        currentTime: this.getCurrentTime(),
        duration: this.getDuration(),
        error: true,
        errorCode: this.video?.error?.code,
        errorMessage: this.video?.error?.message,
        playlistInfo: this.getPlaylistInfo()
    });

    if (this.options.debug) {
        console.log('Video error handled - triggered ended event');
    }
}


getCurrentTime() { return this.video ? this.video.currentTime || 0 : 0; }

setCurrentTime(time) { if (this.video && typeof time === 'number' && time >= 0 && !this.isChangingQuality) { this.video.currentTime = time; } }

getDuration() { return this.video && this.video.duration ? this.video.duration : 0; }

getVolume() { return this.video ? this.video.volume || 0 : 0; }

setVolume(volume) {
    if (typeof volume === 'number' && volume >= 0 && volume <= 1) {
        this.updateVolume(volume * 100);
    }
}

isPaused() { return this.video ? this.video.paused : true; }

isMuted() { return this.video ? this.video.muted : false; }

setMuted(muted) {
    if (this.video && typeof muted === 'boolean') {
        this.video.muted = muted;
        this.updateMuteButton();
        this.updateVolumeSliderVisual();
        this.initVolumeTooltip();
    }
}

getPlaybackRate() { return this.video ? this.video.playbackRate || 1 : 1; }

setPlaybackRate(rate) { if (this.video && typeof rate === 'number' && rate > 0 && !this.isChangingQuality) { this.video.playbackRate = rate; if (this.speedBtn) this.speedBtn.textContent = rate + 'x'; } }

isPictureInPictureActive() { return document.pictureInPictureElement === this.video; }

getCurrentLanguage() {
    return this.isI18nAvailable() ?
        VideoPlayerTranslations.getCurrentLanguage() : 'en';
}

getSupportedLanguages() {
    return this.isI18nAvailable() ?
        VideoPlayerTranslations.getSupportedLanguages() : ['en'];
}

createBrandLogo() {
    if (!this.options.brandLogoEnabled || !this.options.brandLogoUrl) return;

    const controlsRight = this.controls?.querySelector('.controls-right');
    if (!controlsRight) return;

    // Create brand logo image
    const logo = document.createElement('img');
    logo.className = 'brand-logo';
    logo.src = this.options.brandLogoUrl;
    logo.alt = 'Brand logo';

    // Add tooltip ONLY if link URL is present
    if (this.options.brandLogoLinkUrl) {
        // Use custom tooltip text if provided, otherwise fallback to URL
        logo.title = this.options.brandLogoTooltipText || this.options.brandLogoLinkUrl;
        // NON usare data-tooltip per evitare che venga sovrascritto da updateTooltips()
    }

    // Handle loading error
    logo.onerror = () => {
        if (this.options.debug) console.warn('Brand logo failed to load:', this.options.brandLogoUrl);
        logo.style.display = 'none';
    };

    logo.onload = () => {
        if (this.options.debug) console.log('Brand logo loaded successfully');
    };

    // Add click functionality if link URL is provided
    if (this.options.brandLogoLinkUrl) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', (e) => {
            e.stopPropagation();
            window.open(this.options.brandLogoLinkUrl, '_blank', 'noopener,noreferrer');
            if (this.options.debug) console.log('Brand logo clicked, opening:', this.options.brandLogoLinkUrl);
        });
    } else {
        logo.style.cursor = 'default';
    }

    controlsRight.insertBefore(logo, controlsRight.firstChild);

    if (this.options.debug) {
        console.log('Brand logo created with tooltip:', logo.title || 'no tooltip');
    }
}

setBrandLogo(enabled, url = '', linkUrl = '') {
    this.options.brandLogoEnabled = enabled;
    if (url) {
        this.options.brandLogoUrl = url;
    }
    if (linkUrl !== '') {
        this.options.brandLogoLinkUrl = linkUrl;
    }

    // Remove existing brand logo
    const existingLogo = this.controls?.querySelector('.brand-logo');
    if (existingLogo) {
        existingLogo.remove();
    }

    // Recreate the logo if enabled
    if (enabled && this.options.brandLogoUrl) {
        this.createBrandLogo();
    }

    return this;
}

getBrandLogoSettings() {
    return {
        enabled: this.options.brandLogoEnabled,
        url: this.options.brandLogoUrl,
        linkUrl: this.options.brandLogoLinkUrl
    };
}

switchToVideo(newVideoElement, shouldPlay = false) {
    if (!newVideoElement) {
        if (this.options.debug) console.error('🎵 New video element not found');
        return false;
    }

    // Pause current video
    this.video.pause();

    // Get new video sources and qualities
    const newSources = Array.from(newVideoElement.querySelectorAll('source')).map(source => ({
        src: source.src,
        quality: source.getAttribute('data-quality') || 'auto',
        type: source.type || 'video/mp4'
    }));

    if (newSources.length === 0) {
        if (this.options.debug) console.error('🎵 New video has no sources');
        return false;
    }

    // Check if new video is adaptive stream
    if (this.options.adaptiveStreaming && newSources.length > 0) {
        const firstSource = newSources[0];
        if (this.detectStreamType(firstSource.src)) {
            // Initialize adaptive streaming for new video
            this.initializeAdaptiveStreaming(firstSource.src).then((initialized) => {
                if (initialized && shouldPlay) {
                    const playPromise = this.video.play();
                    if (playPromise) {
                        playPromise.catch(error => {
                            if (this.options.debug) console.log('Autoplay prevented:', error);
                        });
                    }
                }
            });
            return true;
        }
    }

    // Update traditional video sources
    this.video.innerHTML = '';
    newSources.forEach(source => {
        const sourceEl = document.createElement('source');
        sourceEl.src = source.src;
        sourceEl.type = source.type;
        sourceEl.setAttribute('data-quality', source.quality);
        this.video.appendChild(sourceEl);
    });

    // Update subtitles if present
    const newTracks = Array.from(newVideoElement.querySelectorAll('track'));
    newTracks.forEach(track => {
        const trackEl = document.createElement('track');
        trackEl.kind = track.kind;
        trackEl.src = track.src;
        trackEl.srclang = track.srclang;
        trackEl.label = track.label;
        if (track.default) trackEl.default = true;
        this.video.appendChild(trackEl);
    });

    // Update video title
    const newTitle = newVideoElement.getAttribute('data-video-title');
    if (newTitle && this.options.showTitleOverlay) {
        this.options.videoTitle = newTitle;
        if (this.titleText) {
            this.titleText.textContent = newTitle;
        }
    }

    // Reload video
    this.video.load();

    // Update qualities and quality selector
    this.collectVideoQualities();
    this.updateQualityMenu();

    // Play if needed
    if (shouldPlay) {
        const playPromise = this.video.play();
        if (playPromise) {
            playPromise.catch(error => {
                if (this.options.debug) console.log('🎵 Autoplay prevented:', error);
            });
        }
    }

    return true;
}

/**
* POSTER IMAGE MANAGEMENT
* Initialize and manage video poster image
*/
initializePoster() {
    if (!this.video) {
        return;
    }

    // Set poster from options if provided
    if (this.options.poster) {
        this.video.setAttribute('poster', this.options.poster);
        if (this.options.debug) console.log('🖼️ Poster set from options:', this.options.poster);
    }

    // Create custom poster overlay to prevent disappearing
    this.createPosterOverlay();

    // Bind poster events
    this.bindPosterEvents();

    if (this.options.debug) console.log('🖼️ Poster management initialized');
}

/**
 * Create custom poster overlay element
 * This prevents the poster from disappearing after video loads
 */
createPosterOverlay() {
    if (!this.container || !this.video) {
        return;
    }

    // Check if poster exists (either from attribute or options)
    const posterUrl = this.video.getAttribute('poster') || this.options.poster;

    if (!posterUrl) {
        if (this.options.debug) console.log('🖼️ No poster URL found');
        return;
    }

    // Create poster overlay element
    const posterOverlay = document.createElement('div');
    posterOverlay.className = 'video-poster-overlay';
    posterOverlay.style.backgroundImage = `url(${posterUrl})`;

    // Insert poster overlay before controls
    if (this.controls) {
        this.container.insertBefore(posterOverlay, this.controls);
    } else {
        this.container.appendChild(posterOverlay);
    }

    this.posterOverlay = posterOverlay;

    if (this.options.debug) console.log('🖼️ Custom poster overlay created');
}

/**
 * Bind poster-related events
 */
bindPosterEvents() {
    if (!this.video || !this.posterOverlay) {
        return;
    }

    // Hide poster when video starts playing
    this.video.addEventListener('play', () => {
        this.hidePoster();
    });

    // Show poster when video ends (optional)
    this.video.addEventListener('ended', () => {
        if (this.options.showPosterOnEnd) {
            this.showPoster();
        }
    });

    // Hide poster when video is loading/playing
    this.video.addEventListener('playing', () => {
        this.hidePoster();
        });

    // Show poster on load if not autoplay
    if (!this.options.autoplay) {
        this.showPoster();
    }

    // Click on poster to play video
    if (this.posterOverlay) {
        this.posterOverlay.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.video.paused) {
                this.play();
            }
        });
    }

    if (this.options.debug) console.log('🖼️ Poster events bound');
}

/**
 * Show poster overlay
 */
showPoster() {
    if (this.posterOverlay) {
        this.posterOverlay.classList.add('visible');
        this.posterOverlay.classList.remove('hidden');
        if (this.options.debug) console.log('🖼️ Poster shown');
    }
}

/**
 * Hide poster overlay
 */
hidePoster() {
    if (this.posterOverlay) {
        this.posterOverlay.classList.remove('visible');
        this.posterOverlay.classList.add('hidden');
        if (this.options.debug) console.log('🖼️ Poster hidden');
    }
}

/**
 * Set poster image dynamically
 * @param {String} posterUrl - URL of the poster image
 */
setPoster(posterUrl) {
    if (!posterUrl) {
        if (this.options.debug) console.warn('🖼️ Invalid poster URL');
        return this;
    }

    this.options.poster = posterUrl;

    // Update video poster attribute
    if (this.video) {
        this.video.setAttribute('poster', posterUrl);
    }

    // Update or create poster overlay
    if (this.posterOverlay) {
        this.posterOverlay.style.backgroundImage = `url(${posterUrl})`;
    } else {
        this.createPosterOverlay();
        this.bindPosterEvents();
    }

    if (this.options.debug) console.log('🖼️ Poster updated:', posterUrl);

    return this;
}

/**
 * Get current poster URL
 * @returns {String|null} Poster URL or null
 */
getPoster() {
    return this.options.poster || this.video?.getAttribute('poster') || null;
}

/**
 * Remove poster
 */
removePoster() {
    if (this.posterOverlay) {
        this.posterOverlay.remove();
        this.posterOverlay = null;
    }

    if (this.video) {
        this.video.removeAttribute('poster');
    }

    this.options.poster = null;

    if (this.options.debug) console.log('🖼️ Poster removed');

    return this;
}

/**
 * Toggle poster visibility
 * @param {Boolean|null} show - True to show, false to hide, null to toggle
 * @returns {Object} this
 */
togglePoster(show = null) {
    if (!this.posterOverlay) {
        return this;
    }

    if (show === null) {
        // Toggle
        if (this.posterOverlay.classList.contains('visible')) {
            this.hidePoster();
        } else {
            this.showPoster();
        }
    } else if (show) {
        this.showPoster();
    } else {
        this.hidePoster();
    }

    return this;
}

/**
 * Check if poster is visible
 * @returns {Boolean} True if poster is visible
 */
isPosterVisible() {
    return this.posterOverlay ? this.posterOverlay.classList.contains('visible') : false;
}


loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Set seek handle shape dynamically
 * @param {string} shape - Shape type: none, circle, square, diamond, arrow, triangle, heart, star
 * @returns {Object} this
 */
setSeekHandleShape(shape) {
    const validShapes = ['none', 'circle', 'square', 'diamond', 'arrow', 'triangle', 'heart', 'star'];

    if (!validShapes.includes(shape)) {
        if (this.options.debug) console.warn('Invalid seek handle shape:', shape);
        return this;
    }

    this.options.seekHandleShape = shape;

    // Update handle class
    if (this.progressHandle) {
        // Remove all shape classes
        validShapes.forEach(s => {
            this.progressHandle.classList.remove(`progress-handle-${s}`);
        });
        // Add new shape class
        this.progressHandle.classList.add(`progress-handle-${shape}`);
    }

    if (this.options.debug) console.log('Seek handle shape changed to:', shape);
    return this;
}

/**
 * Get current seek handle shape
 * @returns {string} Current shape
 */
getSeekHandleShape() {
    return this.options.seekHandleShape;
}

/**
 * Get available seek handle shapes
 * @returns {Array} Array of available shapes
 */
getAvailableSeekHandleShapes() {
    return ['none', 'circle', 'square', 'diamond', 'arrow', 'triangle', 'heart', 'star'];
}

dispose() {
    if (this.qualityMonitorInterval) {
        clearInterval(this.qualityMonitorInterval);
        this.qualityMonitorInterval = null;
    }

    if (this.autoHideTimer) {
        clearTimeout(this.autoHideTimer);
        this.autoHideTimer = null;
    }

    this.cleanupQualityChange();
    this.clearControlsTimeout();
    this.clearTitleTimeout();

    // Destroy adaptive streaming players
    this.destroyAdaptivePlayer();

    if (this.controls) {
        this.controls.remove();
    }
    if (this.loadingOverlay) {
        this.loadingOverlay.remove();
    }
    if (this.titleOverlay) {
        this.titleOverlay.remove();
    }
    if (this.initialLoading) {
        this.initialLoading.remove();
    }

    if (this.video) {
        this.video.classList.remove('video-player');
        this.video.controls = true;
        this.video.style.visibility = '';
        this.video.style.opacity = '';
        this.video.style.pointerEvents = '';
    }
    if (this.chapterMarkersContainer) {
        this.chapterMarkersContainer.remove();
    }
    if (this.chapterTooltip) {
        this.chapterTooltip.remove();
    }
    if (this.posterOverlay) {
        this.posterOverlay.remove();
    }
    this.disposeAllPlugins();

}

/**

 * Apply specified resolution mode to video

 * @param {string} resolution - The resolution mode to apply

 */

/**

 * Get currently set resolution

 * @returns {string} Current resolution

 */

/**

 * Initialize resolution from options value

 */

/**

 * Restore resolution after quality change - internal method

 * @private

 */

// Core methods for main class
// All original functionality preserved exactly