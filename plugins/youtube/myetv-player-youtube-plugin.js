/**
 * MYETV Player - YouTube Plugin
 * File: myetv-player-youtube-plugin.js
 */
(function () {
    'use strict';

    class YouTubePlugin {
        constructor(player, options = {}) {
            this.player = player;
            this.options = {
                videoId: options.videoId || null,
                apiKey: options.apiKey || null,
                autoplay: options.autoplay !== undefined ? options.autoplay : false,
                showYouTubeUI: options.showYouTubeUI !== undefined ? options.showYouTubeUI : false,
                autoLoadFromData: options.autoLoadFromData !== undefined ? options.autoLoadFromData : true,
                quality: options.quality || 'default',
                enableQualityControl: options.enableQualityControl !== undefined ? options.enableQualityControl : true,
                enableCaptions: options.enableCaptions !== undefined ? options.enableCaptions : true,

                // Channel watermark option (default false - requires API key)
                enableChannelWatermark: options.enableChannelWatermark !== undefined ? options.enableChannelWatermark : false,

                // Auto caption language option
                autoCaptionLanguage: options.autoCaptionLanguage || null, // e.g., 'it', 'en', 'es', 'de', 'fr'

                debug: true,
                ...options
            };

            this.ytPlayer = null;
            this.isYouTubeReady = false;
            this.videoId = this.options.videoId;
            this.availableQualities = [];
            this.currentQuality = 'default';
            this.currentPlayingQuality = null;
            this.availableCaptions = [];
            this.currentCaption = null;
            this.currentTranslation = null;
            this.captionsEnabled = false;
            this.subtitlesMenuCreated = false;
            this.timeUpdateInterval = null;
            this.mouseMoveOverlay = null;
            this.qualityCheckAttempts = 0;
            this.captionCheckAttempts = 0;
            this.captionStateCheckInterval = null;
            this.qualityMonitorInterval = null;
            this.resizeListenerAdded = false;
            // Channel data cache
            this.channelData = null;

            this.api = player.getPluginAPI();
            if (this.api.player.options.debug) console.log('[YT Plugin] Constructor initialized', this.options);
        }

        // Top 10 most spoken languages for auto-translation
        getTopTranslationLanguages() {
            return [
                { code: 'en', name: 'English' },
                { code: 'es', name: 'Spanish' },
                { code: 'hi', name: 'Hindi' },
                { code: 'ar', name: 'Arabic' },
                { code: 'pt', name: 'Portuguese' },
                { code: 'ru', name: 'Russian' },
                { code: 'ja', name: 'Japanese' },
                { code: 'de', name: 'German' },
                { code: 'fr', name: 'French' },
                { code: 'it', name: 'Italian' }
            ];
        }

        setup() {
            if (this.api.player.options.debug) console.log('[YT Plugin] Setup started');
            this.loadYouTubeAPI();
            this.addPlayerMethods();
            this.registerHooks();

            if (this.options.autoLoadFromData) {
                this.autoDetectVideoId();
            }

            if (this.videoId) {
                this.waitForAPIThenLoad();
            }

            if (this.api.player.options.debug) console.log('[YT Plugin] Setup completed');
        }

        /**
     * Fetch YouTube channel information using YouTube Data API v3
     */
        async fetchChannelInfo(videoId) {
            if (!this.options.apiKey) {
                if (this.api.player.options.debug) {
                    console.warn('[YT Plugin] API Key required to fetch channel information');
                }
                return null;
            }

            try {
                const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${this.options.apiKey}`;
                const videoResponse = await fetch(videoUrl);
                const videoData = await videoResponse.json();

                if (!videoData.items || videoData.items.length === 0) {
                    if (this.api.player.options.debug) {
                        console.warn('[YT Plugin] Video not found');
                    }
                    return null;
                }

                const channelId = videoData.items[0].snippet.channelId;
                const channelTitle = videoData.items[0].snippet.channelTitle;

                const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${this.options.apiKey}`;
                const channelResponse = await fetch(channelUrl);
                const channelData = await channelResponse.json();

                if (!channelData.items || channelData.items.length === 0) {
                    if (this.api.player.options.debug) {
                        console.warn('[YT Plugin] Channel not found');
                    }
                    return null;
                }

                const channel = channelData.items[0].snippet;

                const channelInfo = {
                    channelId: channelId,
                    channelTitle: channelTitle,
                    channelUrl: `https://www.youtube.com/channel/${channelId}`,
                    thumbnailUrl: channel.thumbnails.high?.url || channel.thumbnails.default?.url || null
                };

                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] Channel info fetched', channelInfo);
                }

                return channelInfo;

            } catch (error) {
                if (this.api.player.options.debug) {
                    console.error('[YT Plugin] Error fetching channel info', error);
                }
                return null;
            }
        }

        /**
         * Update main player watermark options with channel data
         */
        async updatePlayerWatermark() {
            if (!this.options.enableChannelWatermark || !this.videoId) {
                return;
            }

            this.channelData = await this.fetchChannelInfo(this.videoId);

            if (!this.channelData) {
                return;
            }

            if (this.api.player.options) {
                this.api.player.options.watermarkUrl = this.channelData.thumbnailUrl;
                this.api.player.options.watermarkLink = this.channelData.channelUrl;
                this.api.player.options.watermarkTitle = this.channelData.channelTitle;

                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] Player watermark options updated', {
                        watermarkUrl: this.api.player.options.watermarkUrl,
                        watermarkLink: this.api.player.options.watermarkLink,
                        watermarkTitle: this.api.player.options.watermarkTitle
                    });
                }

                if (this.api.player.initializeWatermark) {
                    this.api.player.initializeWatermark();
                }
            }
        }

        /**
         * Set auto caption language on player initialization
         */
        setAutoCaptionLanguage() {
            if (!this.options.autoCaptionLanguage || !this.ytPlayer) {
                return;
            }

            try {
                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] Setting auto caption language to', this.options.autoCaptionLanguage);
                }

                this.ytPlayer.setOption('captions', 'reload', true);
                this.ytPlayer.loadModule('captions');

                this.ytPlayer.setOption('captions', 'track', {
                    'translationLanguage': this.options.autoCaptionLanguage
                });

                this.captionsEnabled = true;

                const subtitlesBtn = this.api.container.querySelector('.subtitles-btn');
                if (subtitlesBtn) {
                    subtitlesBtn.classList.add('active');
                }

                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] Auto caption language set successfully');
                }

            } catch (error) {
                if (this.api.player.options.debug) {
                    console.error('[YT Plugin] Error setting auto caption language', error);
                }
            }
        }

        handleResponsiveLayout() {

            const containerWidth = this.api.container.offsetWidth;
            const pipBtn = this.api.container.querySelector('.pip-btn');
            const subtitlesBtn = this.api.container.querySelector('.subtitles-btn');
            const settingsMenu = this.api.container.querySelector('.settings-menu');

            // ALWAYS hide PiP for YouTube
            if (pipBtn) {
                pipBtn.style.display = 'none';
            }

            // Breakpoint at 600px
            if (containerWidth < 600) {
                // Hide subtitles button
                if (subtitlesBtn) {
                    subtitlesBtn.style.display = 'none';
                }

                // Add subtitles option to settings menu
                if (settingsMenu) {
                    let subtitlesWrapper = settingsMenu.querySelector('.yt-subtitles-wrapper');

                    if (!subtitlesWrapper) {
                        // Get i18n text
                        let subtitlesText = 'Subtitles';
                        if (this.api.player && this.api.player.t) {
                            subtitlesText = this.api.player.t('subtitles');
                        } else if (this.player && this.player.t) {
                            subtitlesText = this.player.t('subtitles');
                        }

                        // Create wrapper
                        subtitlesWrapper = document.createElement('div');
                        subtitlesWrapper.className = 'yt-subtitles-wrapper';
                        subtitlesWrapper.style.cssText = 'position: relative; display: block;';

                        // Create trigger
                        const trigger = document.createElement('div');
                        trigger.className = 'quality-option';
                        trigger.textContent = subtitlesText;

                        // Create submenu
                        const submenu = document.createElement('div');
                        submenu.className = 'yt-subtitles-submenu';
                        submenu.style.cssText = `
                    display: none;
                    position: absolute;
                    right: 100%;
                    top: 0;
                    margin-right: 5px;
                    background: #1c1c1c;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 4px;
                    padding: 8px 0;
                    z-index: 999999;
                    color: white;
width: fit-content;
                    max-width: 180px;
                    max-height: 250px;
                    overflow-y: auto;
                    overflow-x: hidden;`;

                        // Hover state tracking
                        let isHoveringTrigger = false;
                        let isHoveringSubmenu = false;
                        let hideTimeout = null;

                        const checkAndHide = () => {
                            if (hideTimeout) clearTimeout(hideTimeout);
                            hideTimeout = setTimeout(() => {
                                if (!isHoveringTrigger && !isHoveringSubmenu) {
                                    submenu.style.display = 'none';
                                }
                            }, 200);
                        };

                        // Add OFF option
                        const offOption = document.createElement('div');
                        offOption.className = 'quality-option';
                        offOption.textContent = 'Off';
                        offOption.style.cssText = 'padding: 8px 16px; cursor: pointer; color: white;';
                        offOption.addEventListener('click', () => {
                            if (this.disableCaptions) this.disableCaptions();
                            submenu.style.display = 'none';
                            settingsMenu.classList.remove('show');
                        });
                        submenu.appendChild(offOption);

                        // Add caption options
                        if (this.availableCaptions && this.availableCaptions.length > 0) {
                            this.availableCaptions.forEach((caption, index) => {
                                const option = document.createElement('div');
                                option.className = 'quality-option';
                                option.textContent = caption.label || caption.languageName;
                                option.style.cssText = 'padding: 8px 16px; cursor: pointer; color: white;';
                                option.addEventListener('click', () => {
                                    if (this.setCaptions) this.setCaptions(index);
                                    submenu.style.display = 'none';
                                    settingsMenu.classList.remove('show');
                                });
                                submenu.appendChild(option);
                            });
                        } else {
                            // Add Auto option
                            const autoOption = document.createElement('div');
                            autoOption.className = 'quality-option';
                            autoOption.textContent = 'On (Auto)';
                            autoOption.style.cssText = 'padding: 8px 16px; cursor: pointer; color: white;';
                            autoOption.addEventListener('click', () => {
                                if (this.enableAutoCaptions) this.enableAutoCaptions();
                                submenu.style.display = 'none';
                                settingsMenu.classList.remove('show');
                            });
                            submenu.appendChild(autoOption);
                        }

                        // Trigger events
                        trigger.addEventListener('mouseenter', () => {
                            isHoveringTrigger = true;
                            if (hideTimeout) clearTimeout(hideTimeout);
                            submenu.style.display = 'block';
                        });

                        trigger.addEventListener('mouseleave', () => {
                            isHoveringTrigger = false;
                            checkAndHide();
                        });

                        // Submenu events
                        submenu.addEventListener('mouseenter', () => {
                            isHoveringSubmenu = true;
                            if (hideTimeout) clearTimeout(hideTimeout);
                            submenu.style.display = 'block';
                        });

                        submenu.addEventListener('mouseleave', () => {
                            isHoveringSubmenu = false;
                            checkAndHide();
                        });

                        // Click alternative
                        trigger.addEventListener('click', (e) => {
                            e.stopPropagation();
                            if (submenu.style.display === 'none' || !submenu.style.display) {
                                submenu.style.display = 'block';
                            } else {
                                submenu.style.display = 'none';
                            }
                        });

                        // Assemble
                        subtitlesWrapper.appendChild(trigger);
                        subtitlesWrapper.appendChild(submenu);
                        settingsMenu.insertBefore(subtitlesWrapper, settingsMenu.firstChild);
                    }
                }
            } else {
                // Wide screen
                if (subtitlesBtn) {
                    subtitlesBtn.style.display = '';
                }

                // Remove from settings
                if (settingsMenu) {
                    const subtitlesWrapper = settingsMenu.querySelector('.yt-subtitles-wrapper');
                    if (subtitlesWrapper) {
                        subtitlesWrapper.remove();
                    }
                }
            }
        }

        hidePipFromSettingsMenuOnly() {
            const settingsMenu = this.api.container.querySelector('.settings-menu');
            if (!settingsMenu) return;

            // Use MutationObserver to watch when options are added to settings menu
            if (!this.pipObserver) {
                this.pipObserver = new MutationObserver(() => {
                    const allOptions = settingsMenu.children;

                    for (let i = 0; i < allOptions.length; i++) {
                        const option = allOptions[i];

                        // Skip our subtitles wrapper
                        if (option.classList.contains('yt-subtitles-wrapper')) continue;

                        const text = option.textContent.trim().toLowerCase();

                        // Check if it's the PiP option
                        if (text.includes('picture') || text === 'pip' || text.includes('in picture')) {
                            option.style.display = 'none';
                        }
                    }
                });

                // Start observing
                this.pipObserver.observe(settingsMenu, {
                    childList: true,
                    subtree: true
                });
            }
        }

        addPlayerMethods() {
            this.player.loadYouTubeVideo = (videoId, options = {}) => this.loadVideo(videoId, options);
            this.player.getYouTubeVideoId = () => this.videoId;
            this.player.isYouTubeActive = () => this.ytPlayer !== null;
            this.player.getYouTubeQualities = () => this.getAvailableQualities();
            this.player.setYouTubeQuality = (quality) => this.setQuality(quality);
            this.player.getYouTubeCurrentQuality = () => this.getCurrentQuality();
            this.player.getYouTubeCaptions = () => this.getAvailableCaptions();
            this.player.setYouTubeCaptions = (trackIndex) => this.setCaptions(trackIndex);
            this.player.toggleYouTubeCaptions = () => this.toggleCaptions();
        }

        registerHooks() {
            this.api.registerHook('beforePlay', (data) => {
                this.checkForYouTubeUrl();
            });
        }

        autoDetectVideoId() {
            const dataVideoId = this.api.video.getAttribute('data-video-id');
            const dataVideoType = this.api.video.getAttribute('data-video-type');

            if (dataVideoId && dataVideoType === 'youtube') {
                this.videoId = dataVideoId;
                if (this.api.player.options.debug) console.log('[YT Plugin] Video ID from data-video-id:', this.videoId);
                return;
            }

            const src = this.api.video.src || this.api.video.currentSrc;
            if (src) {
                const extractedId = this.extractYouTubeVideoId(src);
                if (extractedId) {
                    this.videoId = extractedId;
                    if (this.api.player.options.debug) console.log('[YT Plugin] Video ID from src:', this.videoId);
                    return;
                }
            }

            const sources = this.api.video.querySelectorAll('source');
            for (const source of sources) {
                const sourceSrc = source.getAttribute('src');
                const sourceType = source.getAttribute('type');
                if (sourceType === 'video/youtube' || sourceType === 'video/x-youtube') {
                    const extractedId = this.extractYouTubeVideoId(sourceSrc);
                    if (extractedId) {
                        this.videoId = extractedId;
                        if (this.api.player.options.debug) console.log('[YT Plugin] Video ID from source:', this.videoId);
                        return;
                    }
                }
            }
        }

        waitForAPIThenLoad() {
            if (this.api.player.options.debug) console.log('[YT Plugin] Waiting for API...');

            const checkAndLoad = () => {
                if (window.YT && window.YT.Player && typeof window.YT.Player === 'function') {
                    // API is ready
                    this.isYouTubeReady = true;
                    if (this.api.player.options.debug) console.log('[YT Plugin] API confirmed ready, loading video');
                    this.loadVideo(this.videoId);
                } else {
                    // API not ready yet, check again
                    if (this.api.player.options.debug) console.log('[YT Plugin] API not ready, retrying in 100ms...');
                    setTimeout(checkAndLoad, 100);
                }
            };

            checkAndLoad();
        }

        loadYouTubeAPI() {
            if (window.YT && window.YT.Player) {
                this.isYouTubeReady = true;
                if (this.api.player.options.debug) console.log('[YT Plugin] YouTube API already loaded');
                return;
            }

            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                this.isYouTubeReady = true;
                if (this.api.player.options.debug) console.log('[YT Plugin] YouTube API loaded and ready');
                this.api.triggerEvent('youtubeplugin:ready', {});
            };
        }

        checkForYouTubeUrl() {
            const src = this.api.video.src || this.api.video.currentSrc;
            const videoId = this.extractYouTubeVideoId(src);

            if (videoId && videoId !== this.videoId) {
                this.loadVideo(videoId);
                return true;
            }
            return false;
        }

        extractYouTubeVideoId(url) {
            if (!url) return null;
            url = url.trim();

            const patterns = [
                /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
                /(?:youtu\.be\/)([^&\n?#]+)/,
                /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
                /^([a-zA-Z0-9_-]{11})$/
            ];

            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match && match[1]) return match[1];
            }
            return null;
        }

        loadVideo(videoId, options = {}) {
            if (!videoId) {
                if (this.api.player.options.debug) console.error('[YT Plugin] No video ID provided');
                return;
            }

            if (!this.isYouTubeReady) {
                if (this.api.player.options.debug) console.log('[YT Plugin] Waiting for API...');
                setTimeout(() => this.loadVideo(videoId, options), 100);
                return;
            }

            if (this.api.player.options.debug) console.log('[YT Plugin] Loading video:', videoId);
            this.videoId = videoId;
            this.qualityCheckAttempts = 0;
            this.captionCheckAttempts = 0;
            this.subtitlesMenuCreated = false;

            this.api.video.style.pointerEvents = 'none';

            this.hidePosterOverlay();
            this.hideInitialLoading();
            this.hideLoadingOverlay();

            if (!this.ytPlayerContainer) {
                this.ytPlayerContainer = document.createElement('div');
                this.ytPlayerContainer.id = 'yt-player-' + Date.now();
                this.ytPlayerContainer.className = 'yt-player-container';
                this.ytPlayerContainer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:2;';
                // Ensure controls are above YouTube player
                if (this.api.controls) {
                    this.api.controls.style.zIndex = '10';
                    this.api.controls.style.pointerEvents = 'auto';
                }

                // Ensure YouTube iframe is visible
                const ytIframe = this.ytPlayerContainer.querySelector('iframe');
                if (ytIframe) {
                    ytIframe.style.pointerEvents = 'auto';
                }

                this.api.container.insertBefore(this.ytPlayerContainer, this.api.controls);
            } else {
                this.ytPlayerContainer.style.visibility = 'visible';
                this.ytPlayerContainer.style.opacity = '1';
            }

            this.createMouseMoveOverlay();

            if (this.ytPlayer) {
                this.ytPlayer.destroy();
            }

            const playerVars = {
                autoplay: this.options.autoplay ? 1 : 0,
                controls: this.options.showYouTubeUI ? 1 : 0,
                fs: this.options.showYouTubeUI ? 1 : 0,
                disablekb: 1,
                modestbranding: 1,
                rel: 0,
                cc_load_policy: 1,
                cc_lang_pref: this.options.autoCaptionLanguage || 'en',
                hl: this.options.autoCaptionLanguage || 'en',
                cc_lang_pref: 'en',
                iv_load_policy: 3,
                ...options.playerVars
            };

            if (this.api.player.options.debug) console.log('[YT Plugin] Player vars:', playerVars);

            this.ytPlayer = new YT.Player(this.ytPlayerContainer.id, {
                videoId: videoId,
                playerVars: playerVars,
                events: {
                    'onReady': (e) => this.onPlayerReady(e),
                    'onStateChange': (e) => this.onPlayerStateChange(e),
                    'onPlaybackQualityChange': (e) => this.onPlaybackQualityChange(e),
                    'onError': (e) => this.onPlayerError(e),
                    'onApiChange': (e) => this.onApiChange(e)
                }
            });

            // Force iframe to fill container properly
            setTimeout(() => {
                const iframe = this.ytPlayerContainer.querySelector('iframe');
                if (iframe) {
                    iframe.style.cssText = 'position:absolute!important;top:0!important;left:0!important;width:100%!important;height:100%!important;';
                    if (this.api.player.options.debug) console.log('[YT Plugin] Iframe forced to absolute positioning');
                }
            }, 500);


            if (this.api.player.options.debug) console.log('[YT Plugin] YouTube player created');
            this.api.triggerEvent('youtubeplugin:videoloaded', { videoId });
        }

        createMouseMoveOverlay() {
            if (this.mouseMoveOverlay) return;

            this.mouseMoveOverlay = document.createElement('div');
            this.mouseMoveOverlay.className = 'yt-mousemove-overlay';
            this.mouseMoveOverlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:2;background:transparent;pointer-events:auto;cursor:default;';

            this.api.container.insertBefore(this.mouseMoveOverlay, this.api.controls);

            // Pass mousemove to core player WITHOUT constantly resetting timer
            this.mouseMoveOverlay.addEventListener('mousemove', (e) => {
                // Let the core handle mousemove - it has its own autoHide logic
                if (this.api.player.onMouseMove) {
                    this.api.player.onMouseMove(e);
                }
            });

            this.mouseMoveOverlay.addEventListener('click', (e) => {
                const doubleTap = this.api.player.options.doubleTapPause;
                const pauseClick = this.api.player.options.pauseClick;

                if (doubleTap) {
                    let controlsHidden = false;

                    if (this.api.controls) {
                        controlsHidden = this.api.controls.classList.contains('hide');
                    }

                    if (!controlsHidden) {
                        const controls = this.player.container.querySelector('.controls');
                        if (controls) {
                            controlsHidden = controls.classList.contains('hide');
                        }
                    }

                    if (!controlsHidden && this.api.controls) {
                        const style = window.getComputedStyle(this.api.controls);
                        controlsHidden = style.opacity === '0' || style.visibility === 'hidden';
                    }

                    if (controlsHidden) {
                        if (this.api.player.showControlsNow) {
                            this.api.player.showControlsNow();
                        }
                        if (this.api.player.resetAutoHideTimer) {
                            this.api.player.resetAutoHideTimer();
                        }
                        return;
                    }

                    // Controls visible: toggle play/pause
                    this.togglePlayPauseYT();
                } else if (pauseClick) {
                    // Always toggle on click when pauseClick is enabled
                    this.togglePlayPauseYT();
                }
            });
        }

        togglePlayPauseYT() {
            if (!this.ytPlayer) return;

            try {
                const state = this.ytPlayer.getPlayerState();

                if (state === YT.PlayerState.PLAYING) {
                    this.ytPlayer.pauseVideo();
                } else if (state === YT.PlayerState.PAUSED ||
                    state === YT.PlayerState.CUED ||
                    state === YT.PlayerState.UNSTARTED ||
                    state === -1) {
                    // Handle all non-playing states including initial/unstarted
                    this.ytPlayer.playVideo();
                }
            } catch (error) {
                if (this.api.player.options.debug) console.error('[YT Plugin] Error toggling play/pause:', error);
            }
        }

        removeMouseMoveOverlay() {
            if (this.mouseMoveOverlay) {
                this.mouseMoveOverlay.remove();
                this.mouseMoveOverlay = null;
            }
        }

        hidePosterOverlay() {
            const posterOverlay = this.api.container.querySelector('.video-poster-overlay');
            if (posterOverlay) {
                posterOverlay.classList.add('hidden');
                posterOverlay.classList.remove('visible');
            }
        }

        showPosterOverlay() {
            const posterOverlay = this.api.container.querySelector('.video-poster-overlay');
            if (posterOverlay && this.api.player.options.poster) {
                posterOverlay.classList.remove('hidden');
                posterOverlay.classList.add('visible');
            }
        }

        hideInitialLoading() {
            const initialLoading = this.api.container.querySelector('.initial-loading');
            if (initialLoading) initialLoading.style.display = 'none';
        }

        hideLoadingOverlay() {
            const loadingOverlay = this.api.container.querySelector('.loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.classList.remove('show');
                loadingOverlay.style.display = 'none';
            }
        }

        onPlayerReady(event) {
            if (this.api.player.options.debug) console.log('[YT Plugin] Player ready event fired');
            // Force visibility
            this.api.video.style.removeProperty('display');
            this.ytPlayerContainer.style.display = 'block';
            this.ytPlayerContainer.style.visibility = 'visible';
            this.ytPlayerContainer.style.opacity = '1';
            this.ytPlayerContainer.style.zIndex = '2';
            if (this.api.player.options.debug) console.log('[YT Plugin] ✅ Forced container visibility');
            // Force visibility with !important via CSS injection
            const forceVisibilityCSS = document.createElement('style');
            forceVisibilityCSS.id = 'yt-force-visibility-' + this.player.video.id;
            forceVisibilityCSS.textContent = `
    #yt-player-container-${this.player.video.id} {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        z-index: 2 !important;
    }
`;
            document.head.appendChild(forceVisibilityCSS);
            if (this.api.player.options.debug) console.log('[YT Plugin] 🎨 CSS force visibility injected');

            this.hideLoadingOverlay();
            this.hideInitialLoading();
            this.injectYouTubeCSSOverride();

            this.syncControls();

            // Handle responsive layout for PiP and subtitles buttons
            this.handleResponsiveLayout();

            // Hide PiP from settings menu (separate function, called after responsive layout)
            setTimeout(() => this.hidePipFromSettingsMenuOnly(), 500);
            setTimeout(() => this.hidePipFromSettingsMenuOnly(), 1500);
            setTimeout(() => this.hidePipFromSettingsMenuOnly(), 3000);

            // Listen for window resize
            if (!this.resizeListenerAdded) {
                window.addEventListener('resize', () => this.handleResponsiveLayout());
                this.resizeListenerAdded = true;
            }


            // Load qualities with multiple attempts
            setTimeout(() => this.loadAvailableQualities(), 500);
            setTimeout(() => this.loadAvailableQualities(), 1000);
            setTimeout(() => this.loadAvailableQualities(), 2000);

            // Load captions with multiple attempts
            setTimeout(() => this.loadAvailableCaptions(), 500);
            setTimeout(() => this.loadAvailableCaptions(), 1000);
            setTimeout(() => this.loadAvailableCaptions(), 2000);

            if (this.options.quality && this.options.quality !== 'default') {
                setTimeout(() => this.setQuality(this.options.quality), 1000);
            }

            // NEW: Update player watermark with channel data
            if (this.options.enableChannelWatermark) {
                this.updatePlayerWatermark();
            }

            // NEW: Set auto caption language
            if (this.options.autoCaptionLanguage) {
                setTimeout(() => this.setAutoCaptionLanguage(), 1500);
            }

            this.api.triggerEvent('youtubeplugin:playerready', {});

        }

        onApiChange(event) {
            if (this.api.player.options.debug) console.log('[YT Plugin] API changed event - loading captions');
            setTimeout(() => this.loadAvailableCaptions(), 500);
        }

        injectYouTubeCSSOverride() {
            if (document.getElementById('youtube-controls-override')) return;

            const style = document.createElement('style');
            style.id = 'youtube-controls-override';
            style.textContent = `
                .video-wrapper.youtube-active .quality-control,
                .video-wrapper.youtube-active .subtitles-control {
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                }
            `;
            document.head.appendChild(style);
            this.api.container.classList.add('youtube-active');
            if (this.api.player.options.debug) console.log('[YT Plugin] CSS override injected');
        }

        // ===== QUALITY CONTROL METHODS =====

        loadAvailableQualities() {
            if (!this.ytPlayer || !this.ytPlayer.getAvailableQualityLevels) {
                if (this.api.player.options.debug) console.log('[YT Plugin] Player not ready for quality check');
                return;
            }

            const rawQualities = this.ytPlayer.getAvailableQualityLevels();
            if (this.api.player.options.debug) console.log('[YT Plugin] Raw qualities from YouTube:', rawQualities);

            if (rawQualities && rawQualities.length > 0) {
                const uniqueQualities = rawQualities.filter((q, index, self) => {
                    return q !== 'auto' && self.indexOf(q) === index;
                });

                this.availableQualities = uniqueQualities.map(quality => ({
                    id: quality,
                    label: this.getQualityLabel(quality),
                    value: quality
                }));

                if (this.api.player.options.debug) console.log('[YT Plugin] ✅ Qualities loaded:', this.availableQualities);
                this.api.triggerEvent('youtubeplugin:qualitiesloaded', { qualities: this.availableQualities });
                this.injectFakeQualities();
                this.createQualityControl();
                this.startQualityMonitoring();
            } else if (this.qualityCheckAttempts < 10) {
                this.qualityCheckAttempts++;
                if (this.api.player.options.debug) console.log(`[YT Plugin] Retry quality load (${this.qualityCheckAttempts}/10)`);
                setTimeout(() => this.loadAvailableQualities(), 1000);
            }
        }

        startQualityMonitoring() {
            if (this.qualityMonitorInterval) {
                clearInterval(this.qualityMonitorInterval);
            }

            this.qualityMonitorInterval = setInterval(() => {
                if (!this.ytPlayer || !this.ytPlayer.getPlaybackQuality) return;

                const actualQuality = this.ytPlayer.getPlaybackQuality();

                // Only update UI if in AUTO mode, otherwise respect manual selection
                if (this.currentQuality === 'default' || this.currentQuality === 'auto') {
                    if (actualQuality !== this.currentPlayingQuality) {
                        this.currentPlayingQuality = actualQuality;
                        if (this.api.player.options.debug) {
                            console.log('[YT Plugin] Playing quality changed to:', actualQuality);
                        }
                        this.updateQualityMenuPlayingState(actualQuality);
                    }

                    const qualityLabel = this.getQualityLabel(actualQuality);
                    this.updateQualityButtonDisplay('Auto', qualityLabel);
                }
                // If manual quality selected, keep showing what user chose
                else {
                    // Still monitor actual quality but don't change UI
                    if (actualQuality !== this.currentPlayingQuality) {
                        this.currentPlayingQuality = actualQuality;
                        if (this.api.player.options.debug) {
                            console.log('[YT Plugin] Actual playing quality:', actualQuality, '(requested:', this.currentQuality + ')');
                        }
                    }
                }
            }, 2000);
        }

        createQualityControl() {
            let qualityControl = this.api.container.querySelector('.quality-control');
            if (qualityControl) {
                if (this.api.player.options.debug) console.log('[YT Plugin] Quality control already exists');
                this.updatePlayerQualityMenu();
                return;
            }

            const controlsRight = this.api.container.querySelector('.controls-right');
            if (!controlsRight) {
                if (this.api.player.options.debug) console.error('[YT Plugin] controls-right not found!');
                return;
            }

            const qualityHTML = `
                <div class="quality-control">
                    <button class="control-btn quality-btn" data-tooltip="Video Quality">
                        <div class="quality-btn-text">
                            <div class="selected-quality">Auto</div>
                            <div class="current-quality"></div>
                        </div>
                    </button>
                    <div class="quality-menu"></div>
                </div>
            `;

            const fullscreenBtn = controlsRight.querySelector('.fullscreen-btn');
            if (fullscreenBtn) {
                fullscreenBtn.insertAdjacentHTML('beforebegin', qualityHTML);
            } else {
                controlsRight.insertAdjacentHTML('beforeend', qualityHTML);
            }

            if (this.api.player.options.debug) console.log('[YT Plugin] Quality control created in DOM');
            this.updatePlayerQualityMenu();
        }

        injectFakeQualities() {
            if (!this.player.qualities) this.player.qualities = [];
            if (this.player.qualities.length === 0) {
                this.availableQualities.forEach(quality => {
                    this.player.qualities.push({
                        quality: quality.label,
                        src: `youtube:${this.videoId}:${quality.value}`,
                        label: quality.label,
                        type: 'video/youtube'
                    });
                });
                if (this.api.player.options.debug) console.log('[YT Plugin] Fake qualities injected:', this.player.qualities.length);
            }
        }

        updatePlayerQualityMenu() {
            const qualityMenu = this.api.container.querySelector('.quality-menu');
            if (!qualityMenu) {
                if (this.api.player.options.debug) console.error('[YT Plugin] Quality menu not found');
                return;
            }

            if (this.api.player.options.debug) console.log('[YT Plugin] Updating quality menu...');
            qualityMenu.innerHTML = '';

            // Add "Auto" option
            const autoItem = document.createElement('div');
            autoItem.className = 'quality-option selected';
            autoItem.textContent = 'Auto';
            autoItem.dataset.quality = 'auto';
            autoItem.addEventListener('click', () => {
                this.setQuality('default');
                this.updateQualityMenuActiveState('auto');
                this.updateQualityButtonDisplay('Auto', '');
            });
            qualityMenu.appendChild(autoItem);

            // Add quality options
            this.availableQualities.forEach(quality => {
                const menuItem = document.createElement('div');
                menuItem.className = 'quality-option';
                menuItem.textContent = quality.label;
                menuItem.dataset.quality = quality.value;
                menuItem.addEventListener('click', () => {
                    this.setQuality(quality.value);
                    this.updateQualityMenuActiveState(quality.value);
                    this.updateQualityButtonDisplay(quality.label, '');
                });
                qualityMenu.appendChild(menuItem);
            });

            if (this.api.player.options.debug) console.log('[YT Plugin] Quality menu updated');
        }

        updateQualityMenuActiveState(qualityValue) {
            const qualityMenu = this.api.container.querySelector('.quality-menu');
            if (!qualityMenu) return;

            qualityMenu.querySelectorAll('.quality-option').forEach(item => {
                if (item.dataset.quality === qualityValue) {
                    item.classList.add('selected');
                } else {
                    item.classList.remove('selected');
                }
            });
        }

        updateQualityMenuPlayingState(actualQuality) {
            const qualityMenu = this.api.container.querySelector('.quality-menu');
            if (!qualityMenu) return;

            qualityMenu.querySelectorAll('.quality-option').forEach(item => {
                if (item.dataset.quality === actualQuality) {
                    item.classList.add('playing');
                } else {
                    item.classList.remove('playing');
                }
            });
        }

        updateQualityButtonDisplay(topText, bottomText) {
            const selectedQualityEl = this.api.container.querySelector('.selected-quality');
            const currentQualityEl = this.api.container.querySelector('.current-quality');

            if (selectedQualityEl) selectedQualityEl.textContent = topText;
            if (currentQualityEl) currentQualityEl.textContent = bottomText;
        }

        getQualityLabel(quality) {
            const qualityLabels = {
                'highres': '4K',
                'hd2160': '4K',
                'hd1440': '2K',
                'hd1080': '1080p',
                'hd720': '720p',
                'large': '480p',
                'medium': '360p',
                'small': '240p',
                'tiny': '144p',
                'auto': 'Auto'
            };
            return qualityLabels[quality] || quality.toUpperCase();
        }

        getAvailableQualities() {
            return this.availableQualities;
        }

        getCurrentQuality() {
            if (!this.ytPlayer || !this.ytPlayer.getPlaybackQuality) return this.currentQuality;
            this.currentQuality = this.ytPlayer.getPlaybackQuality();
            return this.currentQuality;
        }

        setQuality(quality) {
            if (!this.ytPlayer || !this.ytPlayer.setPlaybackQuality) return false;

            try {
                // Try multiple methods to force quality change
                this.ytPlayer.setPlaybackQuality(quality);

                // Also try setPlaybackQualityRange if available
                if (this.ytPlayer.setPlaybackQualityRange) {
                    this.ytPlayer.setPlaybackQualityRange(quality, quality);
                }

                // Update state
                this.currentQuality = quality;
                this.currentPlayingQuality = quality; // Force UI update

                // Force UI update immediately
                this.updateQualityMenuPlayingState(quality);

                // Update button display
                const qualityLabel = this.getQualityLabel(quality);
                this.updateQualityButtonDisplay(qualityLabel, '');

                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] Quality set to:', quality);
                }

                this.api.triggerEvent('youtubeplugin:qualitychanged', { quality });
                return true;
            } catch (error) {
                if (this.api.player.options.debug) {
                    console.error('[YT Plugin] Error setting quality:', error);
                }
                return false;
            }
        }

        // ===== SUBTITLES CONTROL METHODS =====

        /**
         * Load available captions and create menu
         */
        loadAvailableCaptions() {
            if (!this.ytPlayer || !this.options.enableCaptions) return;

            // Prevent creating menu multiple times
            if (this.subtitlesMenuCreated) {
                if (this.api.player.options.debug) console.log('[YT Plugin] Subtitles menu already created, skipping');
                return;
            }

            try {
                let captionModule = null;
                try {
                    captionModule = this.ytPlayer.getOption('captions', 'tracklist');
                    if (this.api.player.options.debug) console.log('[YT Plugin] Captions tracklist:', captionModule);
                } catch (e) {
                    if (this.api.player.options.debug) console.log('[YT Plugin] Captions module error:', e.message);
                }

                // FIXED: If tracklist is available and populated, use it
                if (captionModule && Array.isArray(captionModule) && captionModule.length > 0) {
                    this.availableCaptions = captionModule.map((track, index) => {
                        const isAutomatic = track.kind === 'asr' || track.isautomatic || track.kind === 'auto';
                        const languageName = track.languageName || track.displayName || track.name?.simpleText || track.languageCode || 'Unknown';
                        return {
                            index: index,
                            languageCode: track.languageCode || track.vssid || track.id,
                            languageName: isAutomatic ? `${languageName} (Auto)` : languageName,
                            label: isAutomatic ? `${languageName} (Auto)` : languageName,
                            isAutomatic: isAutomatic
                        };
                    });

                    if (this.api.player.options.debug) console.log('[YT Plugin] ✅ Captions loaded:', this.availableCaptions);
                    this.createSubtitlesControl(true); // true = has tracklist
                    this.subtitlesMenuCreated = true;

                } else if (this.captionCheckAttempts < 5) {
                    // Retry if tracklist not yet available
                    this.captionCheckAttempts++;
                    if (this.api.player.options.debug) console.log(`[YT Plugin] Retry caption load (${this.captionCheckAttempts}/5)`);
                    setTimeout(() => this.loadAvailableCaptions(), 1000);

                } else {
                    // FIXED: After 5 attempts without tracklist, use Off/On (Auto) buttons
                    if (this.api.player.options.debug) console.log('[YT Plugin] No tracklist found - using Off/On (Auto)');
                    this.availableCaptions = []; // Empty tracklist
                    this.createSubtitlesControl(false); // false = no tracklist, use On/Off buttons
                    this.subtitlesMenuCreated = true;
                }

            } catch (error) {
                if (this.api.player.options.debug) console.error('[YT Plugin] Error loading captions:', error);
                this.createSubtitlesControl(false); // Fallback to On/Off buttons
                this.subtitlesMenuCreated = true;
            }
        }

        /**
         * Create subtitles control button and menu
         * @param {boolean} hasTracklist - true if YouTube provides caption tracks, false for auto captions only
         */
        createSubtitlesControl(hasTracklist) {
            let subtitlesControl = this.api.container.querySelector('.subtitles-control');
            if (subtitlesControl) {
                if (this.api.player.options.debug) console.log('[YT Plugin] Subtitles control exists - updating menu');
                this.populateSubtitlesMenu(hasTracklist);
                return;
            }

            const controlsRight = this.api.container.querySelector('.controls-right');
            if (!controlsRight) return;

            const subtitlesHTML = `
                <div class="subtitles-control">
                    <button class="control-btn subtitles-btn" data-tooltip="Subtitles">
                        <span class="icon">CC</span>
                    </button>
                    <div class="subtitles-menu"></div>
                </div>
            `;

            const qualityControl = controlsRight.querySelector('.quality-control');
            if (qualityControl) {
                qualityControl.insertAdjacentHTML('beforebegin', subtitlesHTML);
            } else {
                const fullscreenBtn = controlsRight.querySelector('.fullscreen-btn');
                if (fullscreenBtn) {
                    fullscreenBtn.insertAdjacentHTML('beforebegin', subtitlesHTML);
                } else {
                    controlsRight.insertAdjacentHTML('beforeend', subtitlesHTML);
                }
            }

            if (this.api.player.options.debug) console.log('[YT Plugin] Subtitles control created');
            this.populateSubtitlesMenu(hasTracklist);
            this.bindSubtitlesButton();
            this.checkInitialCaptionState();
            this.startCaptionStateMonitoring();
        }

        /**
         * Populate subtitles menu with tracks or On/Off buttons
         * FIXED: Correctly handles both scenarios
         * @param {boolean} hasTracklist - true if tracks available, false for auto captions only
         */
        populateSubtitlesMenu(hasTracklist) {
            const subtitlesMenu = this.api.container.querySelector('.subtitles-menu');
            if (!subtitlesMenu) return;
            subtitlesMenu.innerHTML = '';

            // OFF option
            const offItem = document.createElement('div');
            offItem.className = 'subtitles-option';
            offItem.textContent = 'Off';
            offItem.dataset.track = 'off';
            offItem.addEventListener('click', (e) => {
                e.stopPropagation();
                this.disableCaptions();
            });
            subtitlesMenu.appendChild(offItem);

            // Show available caption tracks if any
            if (this.availableCaptions.length > 0) {
                this.availableCaptions.forEach(caption => {
                    const menuItem = document.createElement('div');
                    menuItem.className = 'subtitles-option';
                    menuItem.textContent = caption.label;
                    menuItem.addEventListener('click', () => this.setCaptions(caption.index));
                    menuItem.dataset.track = caption.index;
                    menuItem.dataset.languageCode = caption.languageCode;
                    // Display only - no click handler
                    subtitlesMenu.appendChild(menuItem);
                });
            } else {
                // No tracklist - show ON (Auto) option
                const onItem = document.createElement('div');
                onItem.className = 'subtitles-option';
                onItem.textContent = 'On (Auto)';
                onItem.dataset.track = 'auto';
                onItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.enableAutoCaptions();
                });
                subtitlesMenu.appendChild(onItem);
            }
        }

        bindSubtitlesButton() {
            const subtitlesBtn = this.api.container.querySelector('.subtitles-btn');
            if (!subtitlesBtn) return;

            // Remove existing event listeners by cloning
            const newBtn = subtitlesBtn.cloneNode(true);
            subtitlesBtn.parentNode.replaceChild(newBtn, subtitlesBtn);

            newBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleCaptions();
            });
        }

        checkInitialCaptionState() {
            setTimeout(() => {
                try {
                    const currentTrack = this.ytPlayer.getOption('captions', 'track');
                    if (currentTrack && currentTrack.languageCode) {
                        this.captionsEnabled = true;
                        const subtitlesBtn = this.api.container.querySelector('.subtitles-btn');
                        if (subtitlesBtn) subtitlesBtn.classList.add('active');
                        this.updateSubtitlesMenuActiveState();
                    }
                } catch (e) {
                    // Ignore errors
                }
            }, 1500);
        }

        startCaptionStateMonitoring() {
            if (this.captionStateCheckInterval) {
                clearInterval(this.captionStateCheckInterval);
            }

            this.captionStateCheckInterval = setInterval(() => {
                try {
                    const currentTrack = this.ytPlayer.getOption('captions', 'track');
                    const wasEnabled = this.captionsEnabled;

                    this.captionsEnabled = !!(currentTrack && currentTrack.languageCode);

                    if (wasEnabled !== this.captionsEnabled) {
                        const subtitlesBtn = this.api.container.querySelector('.subtitles-btn');
                        if (subtitlesBtn) {
                            if (this.captionsEnabled) {
                                subtitlesBtn.classList.add('active');
                            } else {
                                subtitlesBtn.classList.remove('active');
                            }
                        }
                        this.updateSubtitlesMenuActiveState();
                    }
                } catch (e) {
                    // Ignore errors
                }
            }, 1000);
        }

        updateSubtitlesMenuActiveState() {
            const subtitlesMenu = this.api.container.querySelector('.subtitles-menu');
            if (!subtitlesMenu) return;

            // Use 'selected' class (NOT 'active' - that causes repopulation)
            subtitlesMenu.querySelectorAll('.subtitles-option').forEach(item => {
                item.classList.remove('selected');
            });

            subtitlesMenu.querySelectorAll('.subtitles-option').forEach(item => {
                const itemTrack = item.dataset.track;

                if (!this.captionsEnabled && itemTrack === 'off') {
                    item.classList.add('selected');
                } else if (this.captionsEnabled && itemTrack === String(this.currentCaption)) {
                    item.classList.add('selected');
                } else if (this.captionsEnabled && itemTrack === 'auto' && this.currentCaption === null) {
                    item.classList.add('selected');
                }
            });
        }

        /**
         * Enable specific caption track
         * @param {number} trackIndex - Index of the caption track
         */
        setCaptions(trackIndex) {
            if (!this.ytPlayer) return false;

            try {
                const track = this.availableCaptions[trackIndex];
                if (!track) return false;

                this.ytPlayer.setOption('captions', 'track', { languageCode: track.languageCode });
                this.captionsEnabled = true;

                const subtitlesBtn = this.api.container.querySelector('.subtitles-btn');
                if (subtitlesBtn) subtitlesBtn.classList.add('active');
                this.updateSubtitlesMenuActiveState();

                if (this.api.player.options.debug) console.log('[YT Plugin] Captions enabled:', track.label);
                return true;
            } catch (error) {
                if (this.api.player.options.debug) console.error('[YT Plugin] Error enabling captions:', error);
                return false;
            }
        }

        setTranslatedCaptions(translationLanguageCode) {
            if (!this.ytPlayer) return false;

            try {
                // First, disable current captions if any
                if (this.captionsEnabled) {
                    this.ytPlayer.unloadModule('captions');
                }

                // If no caption tracks exist, try to enable auto-generated captions
                if (this.availableCaptions.length === 0) {
                    if (this.api.player.options.debug) {
                        console.log('[YT Plugin] Enabling auto-generated captions with translation to:', translationLanguageCode);
                    }

                    // Enable auto-generated captions with translation
                    this.ytPlayer.setOption('captions', 'track', {
                        translationLanguage: translationLanguageCode
                    });
                    this.ytPlayer.loadModule('captions');
                    this.currentCaption = null;
                } else {
                    // Use the first available caption track as base for translation
                    const baseCaption = this.availableCaptions[0];

                    if (this.api.player.options.debug) {
                        console.log('[YT Plugin] Translating from', baseCaption.languageCode, 'to', translationLanguageCode);
                    }

                    // Set caption with translation
                    this.ytPlayer.setOption('captions', 'track', {
                        languageCode: baseCaption.languageCode,
                        translationLanguage: translationLanguageCode
                    });
                    this.ytPlayer.loadModule('captions');
                    this.currentCaption = baseCaption.index;
                }

                // Update state
                this.captionsEnabled = true;
                this.currentTranslation = translationLanguageCode;

                // Update UI
                const subtitlesBtn = this.api.container.querySelector('.subtitles-btn');
                if (subtitlesBtn) subtitlesBtn.classList.add('active');

                // Update menu state
                this.updateSubtitlesMenuActiveState();

                // Close the menu
                const subtitlesMenu = this.api.container.querySelector('.subtitles-menu');
                if (subtitlesMenu) {
                    subtitlesMenu.classList.remove('show');
                }

                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] ✅ Auto-translation enabled:', translationLanguageCode);
                }

                this.api.triggerEvent('youtubeplugin:captionchanged', {
                    translationLanguage: translationLanguageCode
                });

                return true;
            } catch (error) {
                if (this.api.player.options.debug) {
                    console.error('[YT Plugin] Error setting translated captions:', error);
                }
                return false;
            }
        }

        /**
         * Enable automatic captions (when no tracklist available)
         */
        enableAutoCaptions() {
            if (!this.ytPlayer) return false;

            try {
                this.ytPlayer.setOption('captions', 'reload', true);
                this.ytPlayer.loadModule('captions');
                this.captionsEnabled = true;

                const subtitlesBtn = this.api.container.querySelector('.subtitles-btn');
                if (subtitlesBtn) subtitlesBtn.classList.add('active');
                this.updateSubtitlesMenuActiveState();

                if (this.api.player.options.debug) console.log('[YT Plugin] Auto captions enabled');
                return true;
            } catch (error) {
                if (this.api.player.options.debug) console.error('[YT Plugin] Error enabling auto captions:', error);
                return false;
            }
        }

        /**
         * Disable captions
         */
        disableCaptions() {
            if (!this.ytPlayer) return false;

            try {
                this.ytPlayer.unloadModule('captions');
                this.captionsEnabled = false;
                this.currentCaption = null;

                const subtitlesBtn = this.api.container.querySelector('.subtitles-btn');
                if (subtitlesBtn) subtitlesBtn.classList.remove('active');

                this.updateSubtitlesMenuActiveState();

                return true;
            } catch (error) {
                if (this.options.debug) console.error('[YT Plugin] Error:', error);
                return false;
            }
        }

        /**
         * Toggle captions on/off
         */
        toggleCaptions() {
            if (this.captionsEnabled) {
                return this.disableCaptions();
            } else {
                // If there are tracks, enable the first one, otherwise enable auto captions
                if (this.availableCaptions.length > 0) {
                    return this.setCaptions(0);
                } else {
                    return this.enableAutoCaptions();
                }
            }
        }

        getAvailableCaptions() {
            return this.availableCaptions;
        }

        // ===== PLAYER EVENT HANDLERS =====

        onPlayerStateChange(event) {
            const states = {
                '-1': 'UNSTARTED',
                '0': 'ENDED',
                '1': 'PLAYING',
                '2': 'PAUSED',
                '3': 'BUFFERING',
                '5': 'CUED'
            };
            if (this.api.player.options.debug) console.log('[YT Plugin] State:', states[event.data], event.data);

            // Get play/pause icons
            const playIcon = this.api.container.querySelector('.play-icon');
            const pauseIcon = this.api.container.querySelector('.pause-icon');

            switch (event.data) {
                case YT.PlayerState.PLAYING:
                    this.api.triggerEvent('played', {});
                    this.hideLoadingOverlay();

                    // Show pause icon, hide play icon
                    if (playIcon && pauseIcon) {
                        playIcon.classList.add('hidden');
                        pauseIcon.classList.remove('hidden');
                    }

                    if (this.availableQualities.length === 0) {
                        this.loadAvailableQualities();
                    }
                    break;

                case YT.PlayerState.PAUSED:
                case YT.PlayerState.CUED:
                case YT.PlayerState.UNSTARTED:
                    this.api.triggerEvent('paused', {});

                    // Show play icon, hide pause icon
                    if (playIcon && pauseIcon) {
                        playIcon.classList.remove('hidden');
                        pauseIcon.classList.add('hidden');
                    }
                    break;

                case YT.PlayerState.ENDED:
                    this.api.triggerEvent('ended', {});

                    // Show play icon (for replay)
                    if (playIcon && pauseIcon) {
                        playIcon.classList.remove('hidden');
                        pauseIcon.classList.add('hidden');
                    }
                    break;
            }
        }

        onPlaybackQualityChange(event) {
            this.currentQuality = event.data;
            if (this.api.player.options.debug) console.log('[YT Plugin] Quality changed to:', event.data);
            this.api.triggerEvent('youtubeplugin:qualitychanged', {
                quality: event.data,
                label: this.getQualityLabel(event.data)
            });
        }

        onPlayerError(event) {
            const errorMessages = {
                2: 'Invalid video ID',
                5: 'HTML5 player error',
                100: 'Video not found or private',
                101: 'Video not allowed in embedded players',
                150: 'Video not allowed in embedded players'
            };
            const errorMsg = errorMessages[event.data] || 'Unknown error';
            if (this.api.player.options.debug) console.error('[YT Plugin] Error:', errorMsg);
            this.api.triggerEvent('youtubeplugin:error', {
                errorCode: event.data,
                errorMessage: errorMsg
            });
        }

        // ===== PLAYER CONTROL SYNC =====

        syncControls() {
            if (this.api.player.options.debug) console.log('[YT Plugin] Syncing controls');

            // Override play method
            const originalPlay = this.player.play;
            this.player.play = () => {
                if (this.ytPlayer && this.ytPlayer.playVideo) {
                    this.ytPlayer.playVideo();
                } else {
                    originalPlay.call(this.player);
                }
            };

            // Override pause method  
            const originalPause = this.player.pause;
            this.player.pause = () => {
                if (this.ytPlayer && this.ytPlayer.pauseVideo) {
                    this.ytPlayer.pauseVideo();
                } else {
                    originalPause.call(this.player);
                }
            };

            // Override seek method
            const originalSetCurrentTime = this.player.setCurrentTime;
            this.player.seek = (time) => {
                if (this.ytPlayer && this.ytPlayer.seekTo) {
                    this.ytPlayer.seekTo(time, true);
                } else if (originalSetCurrentTime) {
                    originalSetCurrentTime.call(this.player, time);
                }
            };

            const originalSeek = this.player.seek;
            this.player.seek = (time) => {
                if (this.ytPlayer && this.ytPlayer.seekTo) {
                    this.ytPlayer.seekTo(time, true);
                } else if (originalSeek) {
                    originalSeek.call(this.player, time);
                }
            };

            // Ensure setCurrentTime also works
            this.player.setCurrentTime = (time) => {
                if (this.ytPlayer && this.ytPlayer.seekTo) {
                    this.ytPlayer.seekTo(time, true);
                } else if (originalSetCurrentTime) {
                    originalSetCurrentTime.call(this.player, time);
                }
            };

            // Override volume control
            const originalUpdateVolume = this.player.updateVolume;
            this.player.updateVolume = (value) => {
                if (this.ytPlayer && this.ytPlayer.setVolume) {
                    const volume = Math.max(0, Math.min(100, value));
                    this.ytPlayer.setVolume(volume);

                    if (this.api.player.volumeSlider) {
                        this.api.player.volumeSlider.value = volume;
                    }

                    this.api.container.style.setProperty('--player-volume-fill', `${volume}%`);

                    if (volume > 0 && this.ytPlayer.isMuted && this.ytPlayer.isMuted()) {
                        this.ytPlayer.unMute();
                        this.updateMuteButtonState(false);
                    } else if (volume === 0 && this.ytPlayer.isMuted && !this.ytPlayer.isMuted()) {
                        this.ytPlayer.mute();
                        this.updateMuteButtonState(true);
                    } else {
                        this.updateMuteButtonState(volume === 0);
                    }

                    if (this.api.player.updateVolumeTooltip) {
                        this.api.player.updateVolumeTooltip();
                    }
                } else {
                    originalUpdateVolume.call(this.player, value);
                }
            };

            // Override mute toggle
            const originalToggleMute = this.player.toggleMute;
            this.player.toggleMute = () => {
                if (this.ytPlayer && this.ytPlayer.isMuted && this.ytPlayer.mute && this.ytPlayer.unMute) {
                    const isMuted = this.ytPlayer.isMuted();

                    if (isMuted) {
                        this.ytPlayer.unMute();
                    } else {
                        this.ytPlayer.mute();
                    }

                    this.updateMuteButtonState(!isMuted);

                    if (!isMuted) {
                        this.api.container.style.setProperty('--player-volume-fill', '0%');
                    } else {
                        const volume = this.ytPlayer.getVolume();
                        this.api.container.style.setProperty('--player-volume-fill', `${volume}%`);
                    }
                } else {
                    originalToggleMute.call(this.player);
                }
            };

            // Volume tooltip events for YouTube
            if (this.api.player.volumeSlider) {
                const volumeSlider = this.api.player.volumeSlider;
                const volumeContainer = this.api.container.querySelector('.volume-container');

                // Remove existing listeners to avoid duplicates
                const newVolumeSlider = volumeSlider.cloneNode(true);
                volumeSlider.parentNode.replaceChild(newVolumeSlider, volumeSlider);
                this.api.player.volumeSlider = newVolumeSlider;

                // Update tooltip on input (slider drag)
                newVolumeSlider.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    this.player.updateVolume(value);

                    // Update tooltip position and text during drag
                    if (this.api.player.updateVolumeTooltipPosition) {
                        this.api.player.updateVolumeTooltipPosition(value / 100);
                    }
                    if (this.api.player.updateVolumeTooltip) {
                        this.api.player.updateVolumeTooltip();
                    }
                });

                // Update tooltip position on mousemove over slider
                newVolumeSlider.addEventListener('mousemove', (e) => {
                    const rect = newVolumeSlider.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const percentage = Math.max(0, Math.min(1, mouseX / rect.width));

                    // Update tooltip position as mouse moves
                    if (this.api.player.updateVolumeTooltipPosition) {
                        this.api.player.updateVolumeTooltipPosition(percentage);
                    }

                    // Update tooltip text to show value under mouse
                    const volumeTooltip = this.api.container.querySelector('.volume-tooltip');
                    if (volumeTooltip) {
                        volumeTooltip.textContent = Math.round(percentage * 100) + '%';
                    }
                });

                // Show/hide tooltip on hover
                if (volumeContainer) {
                    volumeContainer.addEventListener('mouseenter', () => {
                        const volumeTooltip = this.api.container.querySelector('.volume-tooltip');
                        if (volumeTooltip) {
                            volumeTooltip.classList.add('visible');
                        }
                    });

                    volumeContainer.addEventListener('mouseleave', () => {
                        const volumeTooltip = this.api.container.querySelector('.volume-tooltip');
                        if (volumeTooltip) {
                            volumeTooltip.classList.remove('visible');
                        }
                    });
                }

                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] Volume tooltip events bound');
                }
            }

            // Override playback speed
            const originalChangeSpeed = this.player.changeSpeed;
            if (originalChangeSpeed) {
                this.player.changeSpeed = (e) => {
                    if (!e.target.classList.contains('speed-option')) return;

                    const speed = parseFloat(e.target.getAttribute('data-speed'));

                    if (this.ytPlayer && this.ytPlayer.setPlaybackRate && speed > 0) {
                        this.ytPlayer.setPlaybackRate(speed);

                        const speedBtn = this.api.container.querySelector('.speed-btn');
                        if (speedBtn) speedBtn.textContent = `${speed}x`;

                        const speedMenu = this.api.container.querySelector('.speed-menu');
                        if (speedMenu) {
                            speedMenu.querySelectorAll('.speed-option').forEach(option => {
                                option.classList.remove('active');
                            });
                            e.target.classList.add('active');
                        }
                    } else {
                        originalChangeSpeed.call(this.player, e);
                    }
                };
            }

            // Override progress bar seeking
            if (this.api.player.progressContainer) {
                const progressContainer = this.api.player.progressContainer;
                const newProgressContainer = progressContainer.cloneNode(true);
                progressContainer.parentNode.replaceChild(newProgressContainer, progressContainer);

                this.api.player.progressContainer = newProgressContainer;
                this.api.player.progressFilled = newProgressContainer.querySelector('.progress-filled');
                this.api.player.progressHandle = newProgressContainer.querySelector('.progress-handle');
                this.api.player.progressBuffer = newProgressContainer.querySelector('.progress-buffer');

                // Create tooltip for seek preview
                const seekTooltip = document.createElement('div');
                seekTooltip.className = 'yt-seek-tooltip';
                seekTooltip.style.cssText = 'position:absolute;bottom:calc(100% + 10px);left:0;background:rgba(28,28,28,0.95);color:#fff;padding:6px 10px;border-radius:3px;font-size:13px;font-weight:500;white-space:nowrap;pointer-events:none;visibility:hidden;z-index:99999;box-shadow:0 2px 8px rgba(0,0,0,0.3);';
                newProgressContainer.appendChild(seekTooltip);

                // Format time function for tooltip
                const formatTimeForTooltip = (seconds) => {
                    if (!seconds || isNaN(seconds)) return '0:00';
                    const hrs = Math.floor(seconds / 3600);
                    const mins = Math.floor((seconds % 3600) / 60);
                    const secs = Math.floor(seconds % 60);
                    if (hrs > 0) {
                        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                    }
                    return `${mins}:${secs.toString().padStart(2, '0')}`;
                };

                let isSeeking = false;

                const handleSeek = (e) => {
                    if (!this.ytPlayer || !this.ytPlayer.getDuration) return;

                    const rect = newProgressContainer.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
                    const duration = this.ytPlayer.getDuration();
                    const targetTime = percentage * duration;

                    this.ytPlayer.seekTo(targetTime, true);

                    const progress = percentage * 100 + '%';
                    if (this.api.player.progressFilled) {
                        this.api.player.progressFilled.style.width = progress;
                    }
                    if (this.api.player.progressHandle) {
                        this.api.player.progressHandle.style.left = progress;
                    }
                };

                newProgressContainer.addEventListener('mousedown', (e) => {
                    isSeeking = true;
                    handleSeek(e);
                });

                newProgressContainer.addEventListener('mousemove', (e) => {
                    if (isSeeking) {
                        handleSeek(e);
                    }

                    // Show tooltip with timestamp
                    if (!isSeeking && this.ytPlayer && this.ytPlayer.getDuration) {
                        const rect = newProgressContainer.getBoundingClientRect();
                        const mouseX = e.clientX - rect.left;
                        const percentage = Math.max(0, Math.min(1, mouseX / rect.width));
                        const duration = this.ytPlayer.getDuration();
                        const time = percentage * duration;

                        seekTooltip.textContent = formatTimeForTooltip(time);
                        seekTooltip.style.left = mouseX + 'px';
                        seekTooltip.style.visibility = 'visible';
                    }
                });

                newProgressContainer.addEventListener('mouseleave', () => {
                    seekTooltip.style.visibility = 'hidden';
                });

                document.addEventListener('mouseup', () => {
                    isSeeking = false;
                });

                newProgressContainer.addEventListener('click', handleSeek);
            }

            this.bindVolumeSlider();

            // Time update interval
            if (this.timeUpdateInterval) {
                clearInterval(this.timeUpdateInterval);
            }

            this.timeUpdateInterval = setInterval(() => {
                if (this.ytPlayer && this.ytPlayer.getCurrentTime && this.ytPlayer.getDuration) {
                    const currentTime = this.ytPlayer.getCurrentTime();
                    const duration = this.ytPlayer.getDuration();

                    if (this.api.player.progressFilled && duration) {
                        const progress = (currentTime / duration) * 100;
                        this.api.player.progressFilled.style.width = `${progress}%`;
                        if (this.api.player.progressHandle) {
                            this.api.player.progressHandle.style.left = `${progress}%`;
                        }
                    }

                    const currentTimeEl = this.api.container.querySelector('.current-time');
                    const durationEl = this.api.container.querySelector('.duration');

                    if (currentTimeEl) currentTimeEl.textContent = this.formatTime(currentTime);
                    if (durationEl && duration) durationEl.textContent = this.formatTime(duration);
                }
            }, 250);
        }

        bindVolumeSlider() {
            const volumeSlider = this.api.container.querySelector('.volume-slider');
            if (!volumeSlider) return;

            const newVolumeSlider = volumeSlider.cloneNode(true);
            volumeSlider.parentNode.replaceChild(newVolumeSlider, volumeSlider);
            this.api.player.volumeSlider = newVolumeSlider;

            if (this.ytPlayer && this.ytPlayer.getVolume) {
                const initialVolume = this.ytPlayer.getVolume();
                newVolumeSlider.value = initialVolume;
                this.api.container.style.setProperty('--player-volume-fill', `${initialVolume}%`);
            }

            // Handle volume changes with proper unmute logic
            newVolumeSlider.addEventListener('input', (e) => {
                const volume = parseFloat(e.target.value);

                if (this.ytPlayer && this.ytPlayer.setVolume) {
                    this.ytPlayer.setVolume(volume);
                    this.api.container.style.setProperty('--player-volume-fill', `${volume}%`);

                    // Always update mute button state correctly
                    if (volume > 0 && this.ytPlayer.isMuted && this.ytPlayer.isMuted()) {
                        this.ytPlayer.unMute();
                        this.updateMuteButtonState(false);
                    } else if (volume === 0 && this.ytPlayer.isMuted && !this.ytPlayer.isMuted()) {
                        this.ytPlayer.mute();
                        this.updateMuteButtonState(true);
                    } else {
                        // Update button state even when not changing mute status
                        this.updateMuteButtonState(volume === 0 || (this.ytPlayer.isMuted && this.ytPlayer.isMuted()));
                    }

                    // Update tooltip position during drag
                    if (this.api.player.updateVolumeTooltipPosition) {
                        this.api.player.updateVolumeTooltipPosition(volume / 100);
                    }

                    // Update tooltip position during drag
                    if (this.api.player.updateVolumeTooltipPosition) {
                        this.api.player.updateVolumeTooltipPosition(volume / 100);
                    }

                    // Update tooltip text manually instead of using updateVolumeTooltip
                    const volumeTooltip = this.api.container.querySelector('.volume-tooltip');
                    if (volumeTooltip) {
                        volumeTooltip.textContent = Math.round(volume) + '%';
                    }

                }
            });

            // Update tooltip position on mousemove
            newVolumeSlider.addEventListener('mousemove', (e) => {
                const rect = newVolumeSlider.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const percentage = Math.max(0, Math.min(1, mouseX / rect.width));

                // Update tooltip position
                if (this.api.player.updateVolumeTooltipPosition) {
                    this.api.player.updateVolumeTooltipPosition(percentage);
                }

                // Update tooltip text to show value under mouse
                const volumeTooltip = this.api.container.querySelector('.volume-tooltip');
                if (volumeTooltip) {
                    volumeTooltip.textContent = Math.round(percentage * 100) + '%';
                }
            });

            // Show/hide tooltip on hover
            const volumeContainer = this.api.container.querySelector('.volume-container');
            if (volumeContainer) {
                volumeContainer.addEventListener('mouseenter', () => {
                    const volumeTooltip = this.api.container.querySelector('.volume-tooltip');
                    if (volumeTooltip) {
                        volumeTooltip.classList.add('visible');
                    }
                });

                volumeContainer.addEventListener('mouseleave', () => {
                    const volumeTooltip = this.api.container.querySelector('.volume-tooltip');
                    if (volumeTooltip) {
                        volumeTooltip.classList.remove('visible');
                    }
                });
            }

            if (this.api.player.options.debug) {
                console.log('[YT Plugin] Volume slider bound with tooltip events');
            }
        }

        updateMuteButtonState(isMuted) {
            const volumeIcon = this.api.container.querySelector('.volume-icon');
            const muteIcon = this.api.container.querySelector('.mute-icon');

            if (volumeIcon && muteIcon) {
                if (isMuted) {
                    volumeIcon.classList.add('hidden');
                    muteIcon.classList.remove('hidden');
                } else {
                    volumeIcon.classList.remove('hidden');
                    muteIcon.classList.add('hidden');
                }
            }
        }

        formatTime(seconds) {
            if (!seconds || isNaN(seconds)) return '0:00';

            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);

            if (hours > 0) {
                return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            } else {
                return `${minutes}:${secs.toString().padStart(2, '0')}`;
            }
        }

        // ===== CLEANUP =====

        dispose() {
            if (this.api.player.options.debug) console.log('[YT Plugin] Disposing');

            if (this.timeUpdateInterval) {
                clearInterval(this.timeUpdateInterval);
                this.timeUpdateInterval = null;
            }

            if (this.captionStateCheckInterval) {
                clearInterval(this.captionStateCheckInterval);
                this.captionStateCheckInterval = null;
            }

            if (this.qualityMonitorInterval) {
                clearInterval(this.qualityMonitorInterval);
                this.qualityMonitorInterval = null;
            }

            if (this.ytPlayer && this.ytPlayer.destroy) {
                this.ytPlayer.destroy();
                this.ytPlayer = null;
            }

            if (this.ytPlayerContainer) {
                this.ytPlayerContainer.remove();
                this.ytPlayerContainer = null;
            }

            this.removeMouseMoveOverlay();

            this.api.container.classList.remove('youtube-active');
            const styleEl = document.getElementById('youtube-controls-override');
            if (styleEl) styleEl.remove();

            if (this.player.qualities && this.player.qualities.length > 0) {
                // Remove YouTube fake qualities
            }

            if (this.api.video) {
                this.api.video.style.display = '';
            }

            this.showPosterOverlay();
        }
    }

    // Register plugin
    window.registerMYETVPlugin('youtube', YouTubePlugin);

})();