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
                quality: options.quality || 'auto',
                enableQualityControl: options.enableQualityControl !== undefined ? options.enableQualityControl : true,
                enableCaptions: options.enableCaptions !== undefined ? options.enableCaptions : true,

                // Channel watermark option (default false - requires API key)
                enableChannelWatermark: options.enableChannelWatermark !== undefined ? options.enableChannelWatermark : false,

                // Auto caption language option
                autoCaptionLanguage: options.autoCaptionLanguage || null, // e.g., 'it', 'en', 'es', 'de', 'fr'

                // Enable or disable click over youtube player
                mouseClick: options.mouseClick !== undefined ? options.mouseClick : false,

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
            //live streaming
            this.isLiveStream = false;
            this.liveCheckInterval = null;
            this.isAtLiveEdge = true; // Track if viewer is at live edge

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
            // Don't create watermark when YouTube native UI is active
            if (this.options.showYouTubeUI) {
                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] Skipping watermark - YouTube UI active');
                }
                return;
            }

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

                    // Wait for watermark to be in DOM and apply circular style
                    this.applyCircularWatermark();
                }
            }
        }

        applyCircularWatermark() {
            let attempts = 0;
            const maxAttempts = 20;

            const checkAndApply = () => {
                attempts++;

                // Try all possible selectors for watermark elements
                const watermarkSelectors = [
                    '.watermark',
                    '.watermark-image',
                    '.watermark img',
                    '.watermark a',
                    '.watermark-link',
                    '[class*="watermark"]',
                    'img[src*="' + (this.channelData?.thumbnailUrl || '') + '"]'
                ];

                let found = false;

                watermarkSelectors.forEach(selector => {
                    try {
                        const elements = this.api.container.querySelectorAll(selector);
                        if (elements.length > 0) {
                            elements.forEach(el => {
                                el.style.borderRadius = '50%';
                                el.style.overflow = 'hidden';
                                found = true;

                                if (this.api.player.options.debug) {
                                    console.log('[YT Plugin] Applied circular style to:', selector, el);
                                }
                            });
                        }
                    } catch (e) {
                        // Selector might not be valid, skip it
                    }
                });

                if (!found && attempts < maxAttempts) {
                    if (this.api.player.options.debug) {
                        console.log('[YT Plugin] Watermark not found yet, retry', attempts + '/' + maxAttempts);
                    }
                    setTimeout(checkAndApply, 200);
                } else if (found) {
                    if (this.api.player.options.debug) {
                        console.log('[YT Plugin] ✅ Watermark made circular successfully');
                    }
                } else {
                    if (this.api.player.options.debug) {
                        console.warn('[YT Plugin] Could not find watermark element after', maxAttempts, 'attempts');
                    }
                }
            };

            // Start checking
            setTimeout(checkAndApply, 100);
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
                iv_load_policy: 3,
                showinfo: 0,
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

            // Do NOT create overlay if YouTube native UI is enabled (ToS compliant)
            if (this.options.showYouTubeUI) {
                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] Skipping overlay - YouTube native UI enabled (ToS compliant)');
                }

                // Enable clicks on YouTube player
                if (this.options.mouseClick !== false) {
                    this.enableYouTubeClicks();
                }

                // Setup mouse detection for custom controls visibility
                this.setupMouseMoveDetection();
                return;
            }

            this.mouseMoveOverlay = document.createElement('div');
            this.mouseMoveOverlay.className = 'yt-mousemove-overlay';

            // Apply pointer-events based on mouseClick option
            const pointerEvents = this.options.mouseClick ? 'none' : 'auto';

            this.mouseMoveOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
        background: transparent;
        pointer-events: ${pointerEvents};
        cursor: default;
    `;

            this.api.container.insertBefore(this.mouseMoveOverlay, this.api.controls);

            // Setup mouse detection
            this.setupMouseMoveDetection();

            // Only add event listeners if mouseClick is disabled
            if (!this.options.mouseClick) {
                this.mouseMoveOverlay.addEventListener('mousemove', (e) => {
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

                        this.togglePlayPauseYT();
                    } else if (pauseClick) {
                        this.togglePlayPauseYT();
                    }
                });
            }
        }

        // monitor mouse movement over container
        setupMouseMoveDetection() {
            // track last mouse position
            this.lastMouseX = null;
            this.lastMouseY = null;
            this.mouseCheckInterval = null;

            // Listener on container
            this.api.container.addEventListener('mouseenter', () => {
                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] Mouse entered player container');
                }

                //  show controls immediately
                if (this.api.player.showControlsNow) {
                    this.api.player.showControlsNow();
                }
                if (this.api.player.resetAutoHideTimer) {
                    this.api.player.resetAutoHideTimer();
                }

                // start monitoring
                this.startMousePositionTracking();
            });

            this.api.container.addEventListener('mouseleave', () => {
                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] Mouse left player container');
                }

                // stop monitoring
                this.stopMousePositionTracking();
            });

            // capture mouse move on container
            this.api.container.addEventListener('mousemove', (e) => {
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;

                if (this.api.player.onMouseMove) {
                    this.api.player.onMouseMove(e);
                }

                if (this.api.player.resetAutoHideTimer) {
                    this.api.player.resetAutoHideTimer();
                }
            });
        }

        // check mouse position on iframe
        startMousePositionTracking() {
            if (this.mouseCheckInterval) return;

            this.mouseCheckInterval = setInterval(() => {
                // Listener to capture mouse position on iframe
                const handleGlobalMove = (e) => {
                    const newX = e.clientX;
                    const newY = e.clientY;

                    // if mouse is moving
                    if (this.lastMouseX !== newX || this.lastMouseY !== newY) {
                        this.lastMouseX = newX;
                        this.lastMouseY = newY;

                        // verify if mouse is enter the container
                        const rect = this.api.container.getBoundingClientRect();
                        const isInside = (
                            newX >= rect.left &&
                            newX <= rect.right &&
                            newY >= rect.top &&
                            newY <= rect.bottom
                        );

                        if (isInside) {
                            if (this.api.player.showControlsNow) {
                                this.api.player.showControlsNow();
                            }
                            if (this.api.player.resetAutoHideTimer) {
                                this.api.player.resetAutoHideTimer();
                            }
                        }
                    }
                };

                // Listener temp
                document.addEventListener('mousemove', handleGlobalMove, { once: true, passive: true });
            }, 100); // Check ogni 100ms
        }

        stopMousePositionTracking() {
            if (this.mouseCheckInterval) {
                clearInterval(this.mouseCheckInterval);
                this.mouseCheckInterval = null;
            }
        }


        // enable or disable clicks over youtube player
        enableYouTubeClicks() {
            if (this.ytPlayerContainer) {
                this.ytPlayerContainer.style.pointerEvents = 'auto';

                const iframe = this.ytPlayerContainer.querySelector('iframe');
                if (iframe) {
                    iframe.style.pointerEvents = 'auto';
                }

                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] YouTube clicks enabled - overlay transparent');
                }
            }
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

            // stop tracking mouse
            this.stopMousePositionTracking();
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

            // Enable YouTube clicks if option is set
            if (this.options.mouseClick) {
                this.enableYouTubeClicks();
            }
            this.hideLoadingOverlay();
            this.hideInitialLoading();
            this.injectYouTubeCSSOverride();

            this.syncControls();

            // Hide custom controls when YouTube native UI is enabled
            if (this.options.showYouTubeUI) {
                // Hide controls
                if (this.api.controls) {
                    this.api.controls.style.display = 'none';
                    this.api.controls.style.opacity = '0';
                    this.api.controls.style.visibility = 'hidden';
                    this.api.controls.style.pointerEvents = 'none';
                }

                // Hide overlay title
                const overlayTitle = this.api.container.querySelector('.title-overlay');
                if (overlayTitle) {
                    overlayTitle.style.display = 'none';
                    overlayTitle.style.opacity = '0';
                    overlayTitle.style.visibility = 'hidden';
                }

                // Hide watermark
                const watermark = this.api.container.querySelector('.watermark');
                if (watermark) {
                    watermark.style.display = 'none';
                    watermark.style.opacity = '0';
                    watermark.style.visibility = 'hidden';
                }

                // Force hide via CSS
                this.forceHideCustomControls();
            }

            // Handle responsive layout for PiP and subtitles buttons
            this.handleResponsiveLayout();

            // Hide PiP from settings menu (separate function, called after responsive layout)
            setTimeout(() => this.hidePipFromSettingsMenuOnly(), 500);
            setTimeout(() => this.hidePipFromSettingsMenuOnly(), 1500);
            setTimeout(() => this.hidePipFromSettingsMenuOnly(), 3000);
            // Check if this is a live stream
            setTimeout(() => this.checkIfLiveStream(), 2000);
            setTimeout(() => this.checkIfLiveStream(), 5000);


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

        forceHideCustomControls() {
            const existingStyle = document.getElementById('yt-force-hide-controls');
            if (existingStyle) {
                return;
            }

            const style = document.createElement('style');
            style.id = 'yt-force-hide-controls';
            style.textContent = `
        .video-wrapper.youtube-native-ui .controls,
        .video-wrapper.youtube-native-ui .title-overlay,
        .video-wrapper.youtube-native-ui .watermark {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
        }
    `;
            document.head.appendChild(style);

            this.api.container.classList.add('youtube-native-ui');

            if (this.api.player.options.debug) {
                console.log('[YT Plugin] CSS injected - custom elements hidden (simple method)');
            }
        }

        checkIfLiveStream() {
            if (this.api.player.options.debug) {
                console.log('[YT Plugin] 🔍 Starting live stream check...');
            }

            if (!this.ytPlayer) {
                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] ❌ ytPlayer not available');
                }
                return false;
            }

            try {
                // Method 1: Check video data for isLive property
                if (this.ytPlayer.getVideoData) {
                    const videoData = this.ytPlayer.getVideoData();
                    if (this.api.player.options.debug) {
                        console.log('[YT Plugin] 📹 Video Data:', videoData);
                    }

                    // Check if video data indicates it's live
                    if (videoData.isLive || videoData.isLiveBroadcast) {
                        if (this.api.player.options.debug) {
                            console.log('[YT Plugin] ✅ LIVE detected via videoData.isLive');
                        }
                        this.isLiveStream = true;
                        this.handleLiveStreamUI();
                        return true;
                    }
                }

                // Method 2: Check duration (live streams have special duration values)
                if (this.ytPlayer.getDuration) {
                    const duration = this.ytPlayer.getDuration();
                    if (this.api.player.options.debug) {
                        console.log('[YT Plugin] ⏱️ Initial duration:', duration);
                    }

                    // For live streams, duration changes over time
                    // Wait 3 seconds and check again
                    setTimeout(() => {
                        if (!this.ytPlayer || !this.ytPlayer.getDuration) {
                            if (this.api.player.options.debug) {
                                console.log('[YT Plugin] ❌ ytPlayer lost during duration check');
                            }
                            return;
                        }

                        const newDuration = this.ytPlayer.getDuration();
                        const difference = Math.abs(newDuration - duration);

                        if (this.api.player.options.debug) {
                            console.log('[YT Plugin] ⏱️ Duration after 3s:', newDuration);
                            console.log('[YT Plugin] 📊 Duration difference:', difference);
                        }

                        // If duration increased by more than 0.5 seconds, it's live
                        if (difference > 0.5) {
                            if (this.api.player.options.debug) {
                                console.log('[YT Plugin] ✅ LIVE STREAM DETECTED (duration changing)');
                            }
                            this.isLiveStream = true;
                            this.handleLiveStreamUI();
                        } else {
                            if (this.api.player.options.debug) {
                                console.log('[YT Plugin] ℹ️ Regular video (duration stable)');
                            }
                            this.isLiveStream = false;
                        }
                    }, 3000);
                }

                // Method 3: Check player state
                if (this.ytPlayer.getPlayerState) {
                    const state = this.ytPlayer.getPlayerState();
                    if (this.api.player.options.debug) {
                        console.log('[YT Plugin] 🎮 Player state:', state);
                    }
                }

            } catch (error) {
                if (this.api.player.options.debug) {
                    console.error('[YT Plugin] ❌ Error checking live stream:', error);
                }
            }

            return this.isLiveStream;
        }

        handleLiveStreamUI() {
            if (this.api.player.options.debug) {
                console.log('[YT Plugin] 🎬 Applying live stream UI changes');
                console.log('[YT Plugin] 📦 Container:', this.api.container);
            }

            // Stop time update for live streams
            if (this.timeUpdateInterval) {
                clearInterval(this.timeUpdateInterval);
                this.timeUpdateInterval = null;
                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] ✅ Time update interval stopped');
                }
            }

            // Apply UI changes
            this.hideTimeDisplay();
            this.createLiveBadge();

            // Check if DVR is available before disabling progress bar
            this.checkDVRAvailability();

            this.startLiveMonitoring();

            // Force progress bar to 100% for live streams
            this.liveProgressInterval = setInterval(() => {
                if (this.isLiveStream && this.api.player.progressFilled) {
                    this.api.player.progressFilled.style.width = '100%';

                    if (this.api.player.progressHandle) {
                        this.api.player.progressHandle.style.left = '100%';
                    }
                }
            }, 100); // Every 100ms to override any other updates

            if (this.api.player.options.debug) {
                console.log('[YT Plugin] ✅ Live UI setup complete');
            }
        }

        checkDVRAvailability() {
            const progressContainer = this.api.container.querySelector('.progress-container');
            const progressFill = this.api.container.querySelector('.progress-fill');

            if (progressContainer) {
                progressContainer.style.opacity = '0.3';
                progressContainer.style.pointerEvents = 'none';
            }

            // Set darkgoldenrod during test
            if (progressFill) {
                progressFill.style.backgroundColor = 'darkgoldenrod';
            }

            setTimeout(() => {
                if (!this.ytPlayer) return;

                try {
                    const currentTime = this.ytPlayer.getCurrentTime();
                    const duration = this.ytPlayer.getDuration();
                    const testSeekPosition = Math.max(0, currentTime - 5);

                    if (this.api.player.options.debug) {
                        console.log('[YT Plugin] 🔍 Testing DVR availability...');
                    }

                    this.ytPlayer.seekTo(testSeekPosition, true);

                    setTimeout(() => {
                        if (!this.ytPlayer) return;

                        const newCurrentTime = this.ytPlayer.getCurrentTime();
                        const seekDifference = Math.abs(newCurrentTime - testSeekPosition);

                        const progressContainer = this.api.container.querySelector('.progress-container');
                        const progressFill = this.api.container.querySelector('.progress-fill');

                        if (seekDifference < 2) {
                            // DVR enabled - restore with theme color
                            if (progressContainer) {
                                progressContainer.style.opacity = '';
                                progressContainer.style.pointerEvents = '';
                            }

                            // Remove inline style to use theme color
                            if (progressFill) {
                                progressFill.style.backgroundColor = ''; // Let theme CSS handle color
                            }

                            if (this.api.player.options.debug) {
                                console.log('[YT Plugin] ✅ DVR ENABLED - progress bar active with theme color');
                            }

                            this.ytPlayer.seekTo(duration, true);
                        } else {
                            // No DVR - keep darkgoldenrod
                            this.modifyProgressBarForLive();

                            if (this.api.player.options.debug) {
                                console.log('[YT Plugin] ❌ DVR DISABLED - progress bar locked with darkgoldenrod');
                            }
                        }
                    }, 500);

                } catch (error) {
                    if (this.api.player.options.debug) {
                        console.error('[YT Plugin] Error checking DVR:', error);
                    }
                    this.modifyProgressBarForLive();
                }
            }, 1000);
        }

        createLiveBadge() {
            // Remove existing badge if present
            let existingBadge = this.api.container.querySelector('.live-badge');
            if (existingBadge) {
                existingBadge.remove();
            }

            // Create LIVE badge
            const liveBadge = document.createElement('div');
            liveBadge.className = 'live-badge';
            liveBadge.innerHTML = 'LIVE';
            liveBadge.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #ff0000;
        color: white;
        padding: 2px 8px;
        border-radius: 3px;
        font-size: 12px;
        font-weight: bold;
        cursor: pointer;
        user-select: none;
        margin-left: 8px;
    `;

            // Add pulsing indicator style
            if (!document.getElementById('live-badge-style')) {
                const style = document.createElement('style');
                style.id = 'live-badge-style';
                style.textContent = `
            .live-indicator {
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
                animation: live-pulse 1.5s ease-in-out infinite;
            }
            @keyframes live-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.3; }
            }
        `;
                document.head.appendChild(style);
            }

            // Click to return to live
            liveBadge.addEventListener('click', (e) => {
                e.stopPropagation();
                this.seekToLive();
            });

            // Insert badge in control bar, next to time display area
            const controlsLeft = this.api.container.querySelector('.controls-left');
            if (controlsLeft) {
                controlsLeft.appendChild(liveBadge);
                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] Live badge added to controls-left');
                }
            } else {
                // Fallback: add to container
                this.api.container.appendChild(liveBadge);
                liveBadge.style.position = 'absolute';
                liveBadge.style.left = '10px';
                liveBadge.style.bottom = '50px';
                liveBadge.style.zIndex = '11';
            }
        }

        seekToLive() {
            if (!this.ytPlayer || !this.isLiveStream) return;

            try {
                // For live streams, seek to the current live position
                const duration = this.ytPlayer.getDuration();
                this.ytPlayer.seekTo(duration, true);

                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] ⏩ Seeking to live edge:', duration);
                }

                // Immediately update badge to red (will be confirmed by monitoring)
                const badge = this.api.container.querySelector('.live-badge');
                if (badge) {
                    badge.style.background = '#ff0000';
                    badge.textContent = 'LIVE';
                    badge.title = '';
                }

                this.isAtLiveEdge = true;

            } catch (error) {
                if (this.api.player.options.debug) {
                    console.error('[YT Plugin] Error seeking to live:', error);
                }
            }
        }

        hideTimeDisplay() {
            // Hide both current time and duration elements
            const currentTimeEl = this.api.container.querySelector('.current-time');
            const durationEl = this.api.container.querySelector('.duration');

            if (currentTimeEl) {
                currentTimeEl.style.display = 'none';
                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] Current time hidden');
                }
            }

            if (durationEl) {
                durationEl.style.display = 'none';
                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] Duration hidden');
                }
            }
        }

        showTimeDisplay() {
            const currentTimeEl = this.api.container.querySelector('.current-time');
            const durationEl = this.api.container.querySelector('.duration');

            if (currentTimeEl) {
                currentTimeEl.style.display = '';
            }

            if (durationEl) {
                durationEl.style.display = '';
            }
        }

        modifyProgressBarForLive() {
            const progressContainer = this.api.container.querySelector('.progress-container');
            const progressHandle = this.api.container.querySelector('.progress-handle');
            const progressFill = this.api.container.querySelector('.progress-fill');

            if (progressContainer) {
                // Disable all pointer events on progress bar
                progressContainer.style.pointerEvents = 'none';
                progressContainer.style.cursor = 'default';
                progressContainer.style.opacity = '0.6';

                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] Progress bar disabled for live stream');
                }
            }

            if (progressHandle) {
                progressHandle.style.display = 'none';
            }

            // Change color to darkgoldenrod when disabled
            if (progressFill) {
                progressFill.style.backgroundColor = 'darkgoldenrod';

                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] Progress fill color changed to darkgoldenrod');
                }
            }
        }

        restoreProgressBarNormal() {
            const progressContainer = this.api.container.querySelector('.progress-container');
            const progressHandle = this.api.container.querySelector('.progress-handle');
            const progressFill = this.api.container.querySelector('.progress-fill');

            if (progressContainer) {
                progressContainer.style.pointerEvents = '';
                progressContainer.style.cursor = '';
                progressContainer.style.opacity = '';
            }

            if (progressHandle) {
                progressHandle.style.display = '';
            }

            // Remove inline backgroundColor to let CSS theme take over
            if (progressFill) {
                progressFill.style.backgroundColor = ''; // Reset to theme color

                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] Progress fill color restored to theme default');
                }
            }
        }

        startLiveMonitoring() {
            if (this.liveCheckInterval) {
                clearInterval(this.liveCheckInterval);
            }

            this.liveCheckInterval = setInterval(() => {
                if (!this.ytPlayer || !this.isLiveStream) return;

                try {
                    const currentTime = this.ytPlayer.getCurrentTime();
                    const duration = this.ytPlayer.getDuration();
                    const latency = duration - currentTime;
                    const playerState = this.ytPlayer.getPlayerState();

                    const badge = this.api.container.querySelector('.live-badge');
                    if (badge) {
                        // Check player state first
                        if (playerState === YT.PlayerState.PAUSED) {
                            // Keep orange when paused - don't override
                            badge.style.background = '#ff8800';
                            badge.textContent = '⏸ LIVE';
                            badge.title = 'Livestreaming in Pause';

                            if (this.api.player.options.debug) {
                                console.log('[YT Plugin] 🟠 Live paused (monitoring)');
                            }
                        } else if (playerState === YT.PlayerState.PLAYING) {
                            // Only update color if playing
                            // Check latency only if duration is reasonable
                            if (latency > 60 && duration < 7200) {
                                // DE-SYNCED - Black background
                                badge.style.background = '#1a1a1a';
                                badge.textContent = 'LIVE';
                                badge.title = `${Math.floor(latency)} seconds back from the live`;
                                this.isAtLiveEdge = false;

                                if (this.api.player.options.debug) {
                                    console.log('[YT Plugin] ⚫ De-synced, latency:', latency.toFixed(1), 's');
                                }
                            } else {
                                // AT LIVE EDGE - Red background
                                badge.style.background = '#ff0000';
                                badge.textContent = 'LIVE';
                                badge.title = 'Livestreaming';
                                this.isAtLiveEdge = true;

                                if (this.api.player.options.debug) {
                                    console.log('[YT Plugin] 🔴 At live edge');
                                }
                            }
                        }
                    }

                } catch (error) {
                    if (this.api.player.options.debug) {
                        console.error('[YT Plugin] Error monitoring live:', error);
                    }
                }
            }, 2000); // Check every 2 seconds
        }

        handleLiveStreamEnded() {
            if (this.api.player.options.debug) {
                console.log('[YT Plugin] 📹 Handling live stream end transition');
            }

            // Stop live monitoring
            if (this.liveCheckInterval) {
                clearInterval(this.liveCheckInterval);
                this.liveCheckInterval = null;
            }

            // Update badge to show "REPLAY" or remove it
            const badge = this.api.container.querySelector('.live-badge');
            if (badge) {
                // Option 1: Change to REPLAY badge
                badge.textContent = 'REPLAY';
                badge.style.background = '#555555';
                badge.style.cursor = 'default';
                badge.title = 'Registrazione del live stream';

                // Remove click handler since there's no live to seek to
                const newBadge = badge.cloneNode(true);
                badge.parentNode.replaceChild(newBadge, badge);

                // Option 2: Remove badge entirely after 5 seconds
                setTimeout(() => {
                    if (newBadge && newBadge.parentNode) {
                        newBadge.remove();
                    }
                }, 5000);

                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] ✅ Badge updated to REPLAY mode');
                }
            }

            // Restore normal player behavior
            this.isLiveStream = false;
            this.isAtLiveEdge = false;

            // Re-enable progress bar
            this.restoreProgressBarNormal();

            // Show time display again
            this.showTimeDisplay();

            if (this.liveProgressInterval) {
                clearInterval(this.liveProgressInterval);
                this.liveProgressInterval = null;
            }

            if (this.api.player.options.debug) {
                console.log('[YT Plugin] ✅ Transitioned from LIVE to REPLAY mode');
            }
        }

        onApiChange(event) {
            if (this.api.player.options.debug) console.log('[YT Plugin] API changed event - loading captions');
            setTimeout(() => this.loadAvailableCaptions(), 500);
        }

        injectYouTubeCSSOverride() {
            if (document.getElementById('youtube-controls-override')) {
                return;
            }

            const style = document.createElement('style');
            style.id = 'youtube-controls-override';
            style.textContent = `
        .video-wrapper.youtube-active .quality-control,
        .video-wrapper.youtube-active .subtitles-control {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
        
        /* Make watermark circular */
        .video-wrapper .watermark,
        .video-wrapper .watermark-image,
        .video-wrapper .watermark img {
            border-radius: 50% !important;
            overflow: hidden !important;
        }
    `;
            document.head.appendChild(style);
            this.api.container.classList.add('youtube-active');

            if (this.api.player.options.debug) {
                console.log('[YT Plugin] CSS override injected (ToS compliant)');
            }
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
                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] Setting quality to:', quality);
                    console.log('[YT Plugin] Current quality:', this.ytPlayer.getPlaybackQuality());
                    console.log('[YT Plugin] Available qualities:', this.ytPlayer.getAvailableQualityLevels());
                }

                // Check if requested quality is actually available
                const availableLevels = this.ytPlayer.getAvailableQualityLevels();
                if (quality !== 'default' && quality !== 'auto' && !availableLevels.includes(quality)) {
                    if (this.api.player.options.debug) {
                        console.warn('[YT Plugin] Requested quality not available:', quality);
                    }
                }

                // Update state
                this.currentQuality = quality;

                // Set the quality
                this.ytPlayer.setPlaybackQuality(quality);

                // Also try setPlaybackQualityRange for better enforcement
                if (this.ytPlayer.setPlaybackQualityRange) {
                    this.ytPlayer.setPlaybackQualityRange(quality, quality);
                }

                // Force UI update immediately
                this.updateQualityMenuPlayingState(quality);
                const qualityLabel = this.getQualityLabel(quality);

                // For manual quality selection, show only the selected quality
                if (quality !== 'default' && quality !== 'auto') {
                    this.updateQualityButtonDisplay(qualityLabel, '');
                } else {
                    // For auto mode, show "Auto" and let monitoring update the actual quality
                    this.updateQualityButtonDisplay('Auto', '');
                }

                if (this.api.player.options.debug) {
                    // Check actual quality after a moment
                    setTimeout(() => {
                        if (this.ytPlayer && this.ytPlayer.getPlaybackQuality) {
                            const actualQuality = this.ytPlayer.getPlaybackQuality();
                            console.log('[YT Plugin] Actual quality after 1s:', actualQuality);
                            if (actualQuality !== quality && quality !== 'default' && quality !== 'auto') {
                                console.warn('[YT Plugin] YouTube did not apply requested quality. This may mean:');
                                console.warn('  - The quality is not available for this video');
                                console.warn('  - Embedding restrictions apply');
                                console.warn('  - Network/bandwidth limitations');
                            }
                        }
                    }, 1000); // Check every 1 second for faster updates
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

        // ===== SUBTITLE METHODS =====

        /**
         * Load available captions and create subtitle control
         */
        loadAvailableCaptions() {
            if (!this.ytPlayer || !this.options.enableCaptions) return;

            if (this.subtitlesMenuCreated) {
                if (this.api.player.options.debug) console.log('[YT Plugin] Subtitles menu already created');
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
                    this.createSubtitlesControl();
                    this.subtitlesMenuCreated = true;

                } else if (this.captionCheckAttempts < 5) {
                    this.captionCheckAttempts++;
                    if (this.api.player.options.debug) console.log(`[YT Plugin] Retry caption load (${this.captionCheckAttempts}/5)`);
                    setTimeout(() => this.loadAvailableCaptions(), 1000);

                } else {
                    if (this.api.player.options.debug) console.log('[YT Plugin] No tracklist - creating basic control');
                    this.availableCaptions = [];
                    this.createSubtitlesControl();
                    this.subtitlesMenuCreated = true;
                }

            } catch (error) {
                if (this.api.player.options.debug) console.error('[YT Plugin] Error loading captions:', error);
                this.createSubtitlesControl();
                this.subtitlesMenuCreated = true;
            }
        }

        /**
         * Create subtitle control in the control bar
         */
        createSubtitlesControl() {
            let subtitlesControl = this.api.container.querySelector('.subtitles-control');
            if (subtitlesControl) {
                if (this.api.player.options.debug) console.log('[YT Plugin] Subtitles control exists - updating menu');
                this.buildSubtitlesMenu();
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
            this.buildSubtitlesMenu();
            this.bindSubtitlesButton();
            this.checkInitialCaptionState();
            this.startCaptionStateMonitoring();
        }

        /**
         * Build the subtitles menu
         */
        buildSubtitlesMenu() {
            const subtitlesMenu = this.api.container.querySelector('.subtitles-menu');
            if (!subtitlesMenu) return;

            subtitlesMenu.innerHTML = '';

            // Off option
            const offOption = document.createElement('div');
            offOption.className = 'subtitles-option';
            offOption.textContent = 'Off';
            offOption.dataset.id = 'off';
            offOption.addEventListener('click', (e) => {
                e.stopPropagation();
                this.disableCaptions();
                this.updateMenuSelection('off');
                subtitlesMenu.classList.remove('show');
            });
            subtitlesMenu.appendChild(offOption);

            // If captions are available
            if (this.availableCaptions.length > 0) {
                // Add original languages
                this.availableCaptions.forEach((caption, index) => {
                    const option = document.createElement('div');
                    option.className = 'subtitles-option';
                    option.textContent = caption.label;
                    option.dataset.id = `caption-${index}`;
                    option.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.setCaptionTrack(caption.languageCode);
                        this.updateMenuSelection(`caption-${index}`);
                        subtitlesMenu.classList.remove('show');
                    });
                    subtitlesMenu.appendChild(option);
                });
            } else {
                // Auto-caption only (without tracklist)
                const autoOption = document.createElement('div');
                autoOption.className = 'subtitles-option';
                autoOption.textContent = 'Auto-generated';
                autoOption.dataset.id = 'auto';
                autoOption.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.enableAutoCaptions();
                    this.updateMenuSelection('auto');
                    subtitlesMenu.classList.remove('show');
                });
                subtitlesMenu.appendChild(autoOption);
            }

            // Always add "Auto-translate" (both with and without tracklist)
            const translateOption = document.createElement('div');
            translateOption.className = 'subtitles-option translate-option';
            translateOption.textContent = 'Auto-translate';
            translateOption.dataset.id = 'translate';
            translateOption.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showTranslationMenu();
            });
            subtitlesMenu.appendChild(translateOption);
        }

        /**
         * Show translation menu (submenu)
         */
        showTranslationMenu() {
            if (this.api.player.options.debug) console.log('[YT Plugin] showTranslationMenu called');

            const subtitlesMenu = this.api.container.querySelector('.subtitles-menu');
            if (!subtitlesMenu) return;

            // Clear and rebuild with translation languages
            subtitlesMenu.innerHTML = '';

            // Back option
            const backOption = document.createElement('div');
            backOption.className = 'subtitles-option back-option';
            backOption.innerHTML = '← Back';
            backOption.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.api.player.options.debug) console.log('[YT Plugin] Back clicked');
                this.buildSubtitlesMenu();
            });
            subtitlesMenu.appendChild(backOption);

            // Add translation languages
            const translationLanguages = this.getTopTranslationLanguages();
            translationLanguages.forEach(lang => {
                const option = document.createElement('div');
                option.className = 'subtitles-option';
                option.textContent = lang.name;
                option.dataset.id = `translate-${lang.code}`;
                option.dataset.langcode = lang.code;

                if (this.api.player.options.debug) console.log('[YT Plugin] Creating option for:', lang.name, lang.code);

                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (this.api.player.options.debug) console.log('[YT Plugin] Language clicked:', lang.code, lang.name);
                    if (this.api.player.options.debug) console.log('[YT Plugin] this:', this);
                    if (this.api.player.options.debug) console.log('[YT Plugin] About to call setTranslatedCaptions with:', lang.code);

                    const result = this.setTranslatedCaptions(lang.code);

                    if (this.api.player.options.debug) console.log('[YT Plugin] setTranslatedCaptions returned:', result);

                    this.updateMenuSelection(`translate-${lang.code}`);
                    subtitlesMenu.classList.remove('show');

                    // Return to main menu
                    setTimeout(() => this.buildSubtitlesMenu(), 300);
                });

                subtitlesMenu.appendChild(option);
            });

            if (this.api.player.options.debug) console.log('[YT Plugin] Translation menu built with', translationLanguages.length, 'languages');
        }

        /**
         * Update selection in the menu
         */
        updateMenuSelection(selectedId) {
            const subtitlesMenu = this.api.container.querySelector('.subtitles-menu');
            if (!subtitlesMenu) return;

            // Remove all selections
            subtitlesMenu.querySelectorAll('.subtitles-option').forEach(option => {
                option.classList.remove('selected');
            });

            // Add selection to current option
            const selectedOption = subtitlesMenu.querySelector(`[data-id="${selectedId}"]`);
            if (selectedOption) {
                selectedOption.classList.add('selected');
            }

            // Update button state
            const subtitlesBtn = this.api.container.querySelector('.subtitles-btn');
            if (subtitlesBtn) {
                if (selectedId === 'off') {
                    subtitlesBtn.classList.remove('active');
                } else {
                    subtitlesBtn.classList.add('active');
                }
            }
        }

        /**
         * Bind subtitle button (toggle)
         */
        bindSubtitlesButton() {
            const subtitlesBtn = this.api.container.querySelector('.subtitles-btn');
            if (!subtitlesBtn) return;

            const newBtn = subtitlesBtn.cloneNode(true);
            subtitlesBtn.parentNode.replaceChild(newBtn, subtitlesBtn);

            newBtn.addEventListener('click', (e) => {
                e.stopPropagation();

                // Toggle: if active disable, otherwise enable first available
                if (this.captionsEnabled) {
                    this.disableCaptions();
                    this.updateMenuSelection('off');
                } else {
                    if (this.availableCaptions.length > 0) {
                        const firstCaption = this.availableCaptions[0];
                        this.setCaptionTrack(firstCaption.languageCode);
                        this.updateMenuSelection('caption-0');
                    } else {
                        this.enableAutoCaptions();
                        this.updateMenuSelection('auto');
                    }
                }
            });
        }

        /**
         * Set a specific caption track
         */
        setCaptionTrack(languageCode) {
            if (!this.ytPlayer) return false;

            try {
                this.ytPlayer.setOption('captions', 'track', { languageCode: languageCode });
                this.ytPlayer.loadModule('captions');

                this.captionsEnabled = true;
                this.currentCaption = languageCode;
                this.currentTranslation = null;

                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] Caption track set:', languageCode);
                }

                return true;
            } catch (error) {
                if (this.api.player.options.debug) {
                    console.error('[YT Plugin] Error setting caption track:', error);
                }
                return false;
            }
        }

        /**
         * Set automatic translation
         */
        setTranslatedCaptions(translationLanguageCode) {
            if (this.api.player.options.debug) console.log('[YT Plugin] setTranslatedCaptions called with:', translationLanguageCode);

            if (!this.ytPlayer) {
                if (this.api.player.options.debug) console.error('[YT Plugin] ytPlayer not available');
                return false;
            }

            try {
                if (this.api.player.options.debug) console.log('[YT Plugin] Available captions:', this.availableCaptions);

                if (this.availableCaptions.length > 0) {
                    // WITH TRACKLIST: Use first available caption as base
                    const baseLanguageCode = this.availableCaptions[0].languageCode;
                    if (this.api.player.options.debug) console.log('[YT Plugin] Using base language:', baseLanguageCode);

                    this.ytPlayer.setOption('captions', 'track', {
                        'languageCode': baseLanguageCode,
                        'translationLanguage': {
                            'languageCode': translationLanguageCode
                        }
                    });
                } else {
                    // WITHOUT TRACKLIST: Get current auto-generated track
                    if (this.api.player.options.debug) console.log('[YT Plugin] No tracklist - getting auto-generated track');

                    let currentTrack = null;
                    try {
                        currentTrack = this.ytPlayer.getOption('captions', 'track');
                        if (this.api.player.options.debug) console.log('[YT Plugin] Current track:', currentTrack);
                    } catch (e) {
                        if (this.api.player.options.debug) console.log('[YT Plugin] Could not get current track:', e.message);
                    }

                    if (currentTrack && currentTrack.languageCode) {
                        // Use auto-generated language as base
                        if (this.api.player.options.debug) console.log('[YT Plugin] Using auto-generated language:', currentTrack.languageCode);

                        this.ytPlayer.setOption('captions', 'track', {
                            'languageCode': currentTrack.languageCode,
                            'translationLanguage': {
                                'languageCode': translationLanguageCode
                            }
                        });
                    } else {
                        // Fallback: try with 'en' as base
                        if (this.api.player.options.debug) console.log('[YT Plugin] Fallback: using English as base');

                        this.ytPlayer.setOption('captions', 'track', {
                            'languageCode': 'en',
                            'translationLanguage': {
                                'languageCode': translationLanguageCode
                            }
                        });
                    }
                }

                this.captionsEnabled = true;
                this.currentTranslation = translationLanguageCode;

                if (this.api.player.options.debug) console.log('[YT Plugin] ✅ Translation applied');

                return true;
            } catch (error) {
                if (this.api.player.options.debug) console.error('[YT Plugin] Error setting translation:', error);
                return false;
            }
        }

        /**
         * Get language name from code
         */
        getLanguageName(languageCode) {
            const languages = this.getTopTranslationLanguages();
            const lang = languages.find(l => l.code === languageCode);
            return lang ? lang.name : languageCode;
        }

        /**
         * Enable automatic captions
         */
        enableAutoCaptions() {
            if (!this.ytPlayer) return false;

            try {
                this.ytPlayer.setOption('captions', 'reload', true);
                this.ytPlayer.loadModule('captions');

                this.captionsEnabled = true;
                this.currentCaption = null;
                this.currentTranslation = null;

                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] Auto captions enabled');
                }

                return true;
            } catch (error) {
                if (this.api.player.options.debug) {
                    console.error('[YT Plugin] Error enabling auto captions:', error);
                }
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
                this.currentTranslation = null;

                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] Captions disabled');
                }

                return true;
            } catch (error) {
                if (this.api.player.options.debug) {
                    console.error('[YT Plugin] Error disabling captions:', error);
                }
                return false;
            }
        }

        /**
         * Check initial caption state
         */
        checkInitialCaptionState() {
            setTimeout(() => {
                try {
                    const currentTrack = this.ytPlayer.getOption('captions', 'track');
                    if (currentTrack && currentTrack.languageCode) {
                        this.captionsEnabled = true;
                        this.updateMenuSelection('caption-0');
                    } else {
                        this.updateMenuSelection('off');
                    }
                } catch (e) {
                    this.updateMenuSelection('off');
                }
            }, 1500);
        }

        /**
         * Monitor caption state
         */
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

            // Get live badge
            const badge = this.api.container.querySelector('.live-badge');

            // Handle live stream ended
            if (this.isLiveStream && event.data === YT.PlayerState.ENDED) {
                if (this.api.player.options.debug) {
                    console.log('[YT Plugin] 🔴➡️📹 Live stream ended (player state: ENDED)');
                }
                this.handleLiveStreamEnded();
                return;
            }

            // Update live badge based on state
            if (this.isLiveStream && badge) {
                if (event.data === YT.PlayerState.PAUSED) {
                    // Orange when paused during live
                    badge.style.background = '#ff8800';
                    badge.textContent = '⏸ LIVE';
                    badge.title = 'Livestreaming in Pause';

                    if (this.api.player.options.debug) {
                        console.log('[YT Plugin] 🟠 Live paused');
                    }
                } else if (event.data === YT.PlayerState.PLAYING) {
                    // Red when playing (will be checked for de-sync below)
                    badge.style.background = '#ff0000';
                    badge.textContent = 'LIVE';
                    badge.title = 'Livestreaming';

                    if (this.api.player.options.debug) {
                        console.log('[YT Plugin] 🔴 Live playing');
                    }
                }
            }

            // Check for de-sync when user seeks during live
            if (this.isLiveStream && event.data === YT.PlayerState.PLAYING) {
                setTimeout(() => {
                    if (!this.ytPlayer) return;

                    const currentTime = this.ytPlayer.getCurrentTime();
                    const duration = this.ytPlayer.getDuration();
                    const latency = duration - currentTime;

                    // If latency > 60s and duration is reasonable, user has seeked back
                    if (latency > 60 && duration < 7200) {
                        const badge = this.api.container.querySelector('.live-badge');
                        if (badge) {
                            badge.style.background = '#1a1a1a';
                            badge.title = `${Math.floor(latency)} seconds back from the live`;
                            this.isAtLiveEdge = false;

                            if (this.api.player.options.debug) {
                                console.log('[YT Plugin] ⚫ User seeked back, de-synced from live');
                            }
                        }
                    }
                }, 500);
            }

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
                        let progress;

                        // For live streams, always show progress at 100%
                        if (this.isLiveStream) {
                            progress = 100;
                        } else {
                            // For regular videos, calculate normally
                            progress = (currentTime / duration) * 100;
                        }

                        // Check if live badge exists = it's a live stream
                        const liveBadge = this.api.container.querySelector('.live-badge');

                        if (liveBadge) {
                            // Force 100% for live streams
                            progress = 100;
                        }

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

            if (this.liveCheckInterval) {
                clearInterval(this.liveCheckInterval);
                this.liveCheckInterval = null;
            }

            // Restore normal UI when destroying
            if (this.isLiveStream) {
                this.showTimeDisplay();
                this.restoreProgressBarNormal();

                const liveBadge = this.api.container.querySelector('.live-badge');
                if (liveBadge) {
                    liveBadge.remove();
                }
            }

            // Clear live stream intervals
            if (this.liveCheckInterval) {
                clearInterval(this.liveCheckInterval);
                this.liveCheckInterval = null;
            }

            // Restore normal UI
            if (this.isLiveStream) {
                this.showTimeDisplay();
                this.restoreProgressBarNormal();

                const liveBadge = this.api.container.querySelector('.live-badge');
                if (liveBadge) {
                    liveBadge.remove();
                }
            }

            // Reset live stream tracking
            this.isLiveStream = false;
            this.isAtLiveEdge = false;

            if (this.liveProgressInterval) {
                clearInterval(this.liveProgressInterval);
                this.liveProgressInterval = null;
            }
        }
    }

    // Register plugin
    window.registerMYETVPlugin('youtube', YouTubePlugin);

})();