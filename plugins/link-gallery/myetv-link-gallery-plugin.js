// myetv-link-gallery-plugin.js
/**
 * MYETV Player - Link & Gallery Player Plugin
 * File: myetv-link-gallery-plugin.js
 * Turns single links or link galleries into visual cards with optional client-side/proxy scraping,
 * top-bar title fallback, credits-style scrolling description, security info in settings, and a control bar link button.
 */
(function () {
    'use strict';

    class LinkGalleryPlugin {
        constructor(player, options = {}) {
            this.player = player;

            const defaultSlideDuration =
                options.slideDuration !== undefined ? Number(options.slideDuration) :
                    options.duration !== undefined ? Number(options.duration) : 8000;

            this.options = {
                // Input links: string, object, or array of strings/objects
                links: options.links !== undefined
                    ? options.links
                    : (options.link || options.url || options.urls || []),

                // Global fallback metadata (used only if item metadata is missing)
                title: options.title !== undefined ? String(options.title) : '',
                description: options.description !== undefined ? String(options.description) : '',
                image: options.image !== undefined ? String(options.image) : '',

                // Scraping options
                enableScraping: options.enableScraping !== false,
                scraperProxyUrl: options.scraperProxyUrl ? String(options.scraperProxyUrl) : '',
                scrapeTimeout: options.scrapeTimeout !== undefined ? Math.max(1000, Number(options.scrapeTimeout)) : 6000,

                // Timing (in milliseconds)
                slideDuration: defaultSlideDuration > 0 ? defaultSlideDuration : 8000,
                singleLinkDuration: options.singleLinkDuration !== undefined
                    ? Number(options.singleLinkDuration)
                    : defaultSlideDuration,

                // Playback behavior
                autoplay: options.autoplay !== undefined ? options.autoplay : undefined,
                loop: options.loop !== undefined ? options.loop : undefined,
                hideVideoOnlyControls: options.hideVideoOnlyControls !== false,

                // Stage & Transitions
                aspectRatio: options.aspectRatio || '16 / 9',
                backgroundColor: options.backgroundColor || '#0d1117',
                transition: options.transition || 'fade', // 'fade' | 'slide' | 'none'
                transitionDuration: options.transitionDuration !== undefined
                    ? Number(options.transitionDuration)
                    : 350,

                // Gallery navigation & UI
                showNavArrows: options.showNavArrows !== false,
                showCounter: options.showCounter !== false,
                showSlideMarkers: options.showSlideMarkers !== false,
                updateTitleOnSlide: options.updateTitleOnSlide !== false,
                showOpenLinkButton: options.showOpenLinkButton !== false,
                showSettingsLinkInfo: options.showSettingsLinkInfo !== false,
                openLinkTarget: options.openLinkTarget || '_blank',

                // Credits-style scrolling description options
                creditsSpeed: options.creditsSpeed !== undefined ? Math.max(8, Number(options.creditsSpeed)) : 28,
                creditsStartDelay: options.creditsStartDelay !== undefined ? Math.max(0, Number(options.creditsStartDelay)) : 1500,
                creditsEndPause: options.creditsEndPause !== undefined ? Math.max(0, Number(options.creditsEndPause)) : 1500,
                pauseCreditsOnHover: options.pauseCreditsOnHover !== false,

                // Keyboard shortcuts (Shift+Arrows, Enter/O to open link)
                keyboardControls: options.keyboardControls !== false
            };

            // State
            this.slides = [];
            this.currentIndex = 0;
            this.currentTimeMs = 0;
            this.totalDurationMs = 0;
            this.isPlaying = false;
            this.isEnded = false;
            this.isDisposed = false;
            this.rafId = null;
            this.lastTickTime = null;
            this.lastTimeUpdateEvent = 0;

            // Credits animation state
            this.creditsRafId = null;
            this.creditsLastTick = null;
            this.creditsOffsetY = 0;
            this.creditsNeedsScroll = false;
            this.creditsHovered = false;
            this.creditsPauseUntil = 0;

            // Scraping cache & abort controllers
            this.scrapeCache = new Map();
            this.activeAbortControllers = new Set();

            // DOM references
            this.stageElement = null;
            this.cardElement = null;
            this.bgBlurElement = null;
            this.mediaBoxElement = null;
            this.domainBadgeElement = null;
            this.cardTitleElement = null;
            this.descViewportElement = null;
            this.descTrackElement = null;
            this.descTextElement = null;
            this.prevArrowBtn = null;
            this.nextArrowBtn = null;
            this.slideMarkersContainer = null;

            // Controlbar references
            this.controlsGroup = null;
            this.galleryPrevBtn = null;
            this.galleryNextBtn = null;
            this.galleryCounterEl = null;
            this.openLinkBtn = null;

            // Backup for overridden player methods & hidden controls
            this.originalMethods = {};
            this.hiddenControlElements = [];
            this.savedVideoSources = [];
            this.boundListeners = [];

            // Track whether the player already had an explicit videoTitle option
            this.playerInitialTitle = this.player.options.videoTitle ? String(this.player.options.videoTitle).trim() : '';
            this.playerInitialSubtitle = this.player.options.videoSubtitle ? String(this.player.options.videoSubtitle).trim() : '';
            this.playerHasExplicitTitle = Boolean(this.playerInitialTitle);
        }

        /**
         * Validate and sanitize URLs using the player's built-in sanitizer
         */
        getSafeUrl(url) {
            if (!url || typeof url !== 'string') return '';
            if (this.player && typeof this.player.sanitizeUrl === 'function') {
                return this.player.sanitizeUrl(url);
            }
            const trimmed = url.trim();
            if (/^(\/(?!\/)|\.\.?\/|https?:\/\/)/i.test(trimmed)) {
                return trimmed;
            }
            return '';
        }

        /**
         * Decode HTML entities safely as plain text
         */
        formatText(text) {
            if (!text || typeof text !== 'string') return '';
            if (this.player && typeof this.player.decodeHTMLEntities === 'function') {
                return this.player.decodeHTMLEntities(text);
            }
            return text;
        }

        /**
         * Force-clear any native loading overlay
         */
        forceHidePlayerLoading() {
            this.player.hideLoading();
            if (this.player.loadingOverlay) {
                this.player.loadingOverlay.classList.remove('active');
            }
        }

        /**
         * Normalize input links into a standardized slides array
         */
        parseLinks(input) {
            let list = [];
            if (typeof input === 'string' || (input && !Array.isArray(input) && typeof input === 'object')) {
                list = [input];
            } else if (Array.isArray(input)) {
                list = input;
            }

            const isSingle = list.length === 1;
            const parsed = [];
            let accumulatedMs = 0;

            list.forEach((item) => {
                let rawUrl = '';
                let explicitTitle = '';
                let explicitDescription = '';
                let explicitImage = '';
                let explicitSubtitle = '';
                let duration = isSingle ? this.options.singleLinkDuration : this.options.slideDuration;

                if (typeof item === 'string') {
                    rawUrl = item;
                } else if (item && typeof item === 'object') {
                    rawUrl = item.url || item.link || item.href || item.src || '';
                    explicitTitle = item.title !== undefined ? String(item.title) : '';
                    explicitDescription = item.description !== undefined ? String(item.description) : '';
                    explicitImage = item.image !== undefined ? String(item.image) : '';
                    explicitSubtitle = item.subtitle !== undefined ? String(item.subtitle) : '';
                    if (item.duration !== undefined && Number(item.duration) > 0) {
                        duration = Number(item.duration);
                    }
                }

                const safeUrl = this.getSafeUrl(rawUrl);
                if (!safeUrl) return;

                if (!duration || isNaN(duration) || duration <= 0) {
                    duration = 8000;
                }

                // Resolve explicit global plugin options as fallback when per-item fields are empty
                const initialTitle = this.formatText(explicitTitle || this.options.title || '');
                const initialDescription = this.formatText(explicitDescription || this.options.description || '');
                const initialImage = this.getSafeUrl(explicitImage || this.options.image || '');
                const urlMeta = this.extractUrlMetadata(safeUrl);

                parsed.push({
                    index: parsed.length,
                    url: safeUrl,
                    urlMeta: urlMeta,
                    hasExplicitTitle: Boolean(initialTitle.trim()),
                    hasExplicitDescription: Boolean(initialDescription.trim()),
                    hasExplicitImage: Boolean(initialImage),
                    title: initialTitle || urlMeta.fallbackTitle,
                    subtitle: this.formatText(explicitSubtitle),
                    description: initialDescription || urlMeta.fallbackDescription,
                    image: initialImage,
                    scraped: false,
                    scrapeStatus: 'idle', // 'idle' | 'loading' | 'done' | 'fallback'
                    duration: duration,
                    startMs: accumulatedMs,
                    endMs: accumulatedMs + duration
                });

                accumulatedMs += duration;
            });

            return parsed;
        }

        /**
         * Extract safe hostname, protocol, and fallback labels from a URL
         */
        extractUrlMetadata(rawUrl) {
            try {
                const parsed = new URL(rawUrl, window.location.origin);
                const hostname = parsed.hostname || rawUrl;
                const cleanHost = hostname.replace(/^www\./i, '');
                const pathSnippet = parsed.pathname && parsed.pathname !== '/'
                    ? parsed.pathname.replace(/\/$/, '').split('/').filter(Boolean).slice(-1)[0]
                    : '';

                const readablePath = pathSnippet
                    ? decodeURIComponent(pathSnippet).replace(/[-_]+/g, ' ').replace(/\.[a-z0-9]+$/i, '')
                    : '';

                return {
                    href: parsed.href,
                    protocol: parsed.protocol,
                    isHttps: parsed.protocol === 'https:',
                    hostname: hostname,
                    cleanHost: cleanHost,
                    port: parsed.port || '',
                    pathname: parsed.pathname || '/',
                    hasQuery: Boolean(parsed.search),
                    hasCredentials: Boolean(parsed.username || parsed.password),
                    isExternal: parsed.hostname !== window.location.hostname,
                    isPunycode: hostname.toLowerCase().includes('xn--'),
                    origin: parsed.origin,
                    fallbackTitle: readablePath ? `${cleanHost} — ${readablePath}` : cleanHost,
                    fallbackDescription: parsed.href
                };
            } catch (e) {
                return {
                    href: rawUrl,
                    protocol: '',
                    isHttps: false,
                    hostname: rawUrl,
                    cleanHost: rawUrl,
                    port: '',
                    pathname: '/',
                    hasQuery: false,
                    hasCredentials: false,
                    isExternal: true,
                    isPunycode: false,
                    origin: '',
                    fallbackTitle: rawUrl,
                    fallbackDescription: rawUrl
                };
            }
        }

        /**
         * Plugin entry point called by MYETVvideoplayer
         */
        setup() {
            this.slides = this.parseLinks(this.options.links);

            if (this.slides.length === 0) {
                if (this.player.options.debug) {
                    console.warn('🔗 LinkGalleryPlugin: No valid links provided.');
                }
                return;
            }

            this.totalDurationMs = this.slides[this.slides.length - 1].endMs;

            this.injectStyles();
            this.neutralizeNativeVideo();
            this.createStage();
            this.createControlBarUI();
            this.createSlideMarkers();
            this.hookPlayerMethods();
            this.bindStageEvents();
            this.bindKeyboardEvents();

            this.forceHidePlayerLoading();

            // Refresh settings menu so the link security option appears immediately
            if (this.options.showSettingsLinkInfo && typeof this.player.populateSettingsMenu === 'function') {
                this.player.populateSettingsMenu();
            }

            // Render initial slide and trigger scraping if needed
            this.renderSlide(0, { instant: true });
            this.syncTimelineUI();

            const onReady = () => {
                if (this.isDisposed) return;

                this.forceHidePlayerLoading();
                this.syncTimelineUI();
                this.createSlideMarkers();

                if (this.options.showSettingsLinkInfo && typeof this.player.populateSettingsMenu === 'function') {
                    this.player.populateSettingsMenu();
                }

                const shouldAutoplay = this.options.autoplay !== undefined
                    ? this.options.autoplay
                    : (this.player.options.autoplay || this.player.savedAutoplayIntent);

                if (shouldAutoplay && !this.isPlaying) {
                    this.play();
                } else {
                    this.player.showControlsNow();
                }
            };

            if (this.player.isPlayerReady) {
                onReady();
            } else {
                this.player.addEventListener('playerready', onReady);
            }
        }

        /**
         * Inject scoped CSS styles matching MYETV player theme variables
         */
        injectStyles() {
            if (document.getElementById('myetv-link-gallery-styles')) return;

            const style = document.createElement('style');
            style.id = 'myetv-link-gallery-styles';
            style.textContent = `
                .video-wrapper.myetv-link-gallery-active {
                    background: #0d1117;
                    user-select: none;
                    -webkit-user-select: none;
                }

                .video-wrapper.myetv-link-gallery-active .video-player {
                    display: none !important;
                }

                .myetv-link-gallery-stage {
                    position: relative;
                    width: 100%;
                    min-height: 300px;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1;
                }

                .video-container:fullscreen .myetv-link-gallery-stage,
                .video-container:-webkit-full-screen .myetv-link-gallery-stage,
                .video-container:-moz-full-screen .myetv-link-gallery-stage,
                .video-wrapper:fullscreen .myetv-link-gallery-stage,
                .video-wrapper:-webkit-full-screen .myetv-link-gallery-stage {
                    height: 100vh !important;
                    aspect-ratio: auto !important;
                }

                .myetv-link-bg-blur {
                    position: absolute;
                    inset: -20px;
                    background-size: cover;
                    background-position: center;
                    filter: blur(22px) brightness(0.32);
                    transform: scale(1.08);
                    transition: opacity 0.4s ease, background-image 0.4s ease;
                    opacity: 0;
                    z-index: 0;
                    pointer-events: none;
                }

                .myetv-link-bg-blur.visible {
                    opacity: 1;
                }

                .myetv-link-card {
                    position: relative;
                    z-index: 2;
                    width: 88%;
                    max-width: 920px;
                    height: 70%;
                    max-height: 440px;
                    min-height: 190px;
                    display: flex;
                    flex-direction: row;
                    gap: 20px;
                    padding: 20px;
                    border-radius: 14px;
                    background: rgba(16, 20, 28, 0.82);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.48);
                    backdrop-filter: blur(12px);
                    box-sizing: border-box;
                    overflow: hidden;
                    transition: opacity 0.35s ease, transform 0.35s ease;
                }

                .myetv-link-media-box {
                    flex: 0 0 44%;
                    height: 100%;
                    border-radius: 10px;
                    overflow: hidden;
                    position: relative;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .myetv-link-media-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }

                .myetv-link-media-fallback {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 16px;
                    text-align: center;
                    color: rgba(255, 255, 255, 0.85);
                }

                .myetv-link-media-fallback svg {
                    color: var(--player-primary-color, goldenrod);
                    opacity: 0.9;
                }

                .myetv-link-media-fallback-host {
                    font-size: 14px;
                    font-weight: 600;
                    word-break: break-word;
                }

                .myetv-link-content-box {
                    flex: 1;
                    min-width: 0;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    overflow: hidden;
                }

                .myetv-link-meta-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-shrink: 0;
                }

                .myetv-link-domain-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    padding: 4px 10px;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.92);
                    border: 1px solid rgba(255, 255, 255, 0.14);
                    max-width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .myetv-link-security-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    flex-shrink: 0;
                    background: #4caf50;
                }

                .myetv-link-security-dot.insecure {
                    background: #ff9800;
                }

                .myetv-link-card-title {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 700;
                    line-height: 1.3;
                    color: #ffffff;
                    flex-shrink: 0;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                /* Credits-style description viewport */
                .myetv-link-desc-viewport {
                    position: relative;
                    flex: 1;
                    min-height: 48px;
                    overflow: hidden;
                    mask-image: linear-gradient(to bottom, transparent 0%, #000 10%, #000 90%, transparent 100%);
                    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 10%, #000 90%, transparent 100%);
                }

                .myetv-link-desc-viewport.static-text {
                    mask-image: none;
                    -webkit-mask-image: none;
                }

                .myetv-link-desc-track {
                    will-change: transform;
                }

                .myetv-link-desc-text {
                    margin: 0;
                    font-size: 14px;
                    line-height: 1.6;
                    color: rgba(255, 255, 255, 0.84);
                    white-space: pre-line;
                    word-break: break-word;
                    user-select: text;
                }

                /* Floating gallery navigation arrows */
                .myetv-link-nav-arrow {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    background: rgba(0, 0, 0, 0.58);
                    backdrop-filter: blur(6px);
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 6;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.25s ease, visibility 0.25s ease, background 0.2s ease, transform 0.2s ease;
                    padding: 0;
                }

                .myetv-link-nav-arrow.prev { left: 12px; }
                .myetv-link-nav-arrow.next { right: 12px; }

                .video-wrapper.has-controls .myetv-link-nav-arrow,
                .myetv-link-gallery-stage:hover .myetv-link-nav-arrow {
                    opacity: 1;
                    visibility: visible;
                }

                .myetv-link-nav-arrow:hover {
                    background: rgba(0, 0, 0, 0.88);
                    border-color: var(--player-primary-color, goldenrod);
                    color: var(--player-primary-color, goldenrod);
                    transform: translateY(-50%) scale(1.08);
                }

                .myetv-link-nav-arrow:disabled {
                    opacity: 0.25 !important;
                    cursor: not-allowed;
                }

                /* Control bar additions */
                .myetv-link-controls-group {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .myetv-link-counter {
                    color: var(--player-text-secondary, rgba(255, 255, 255, 0.85));
                    font-size: 12px;
                    font-weight: 500;
                    padding: 0 6px;
                    font-variant-numeric: tabular-nums;
                    white-space: nowrap;
                }

                .myetv-open-link-btn {
                    color: var(--player-primary-color, goldenrod) !important;
                    gap: 5px;
                }

                .myetv-open-link-btn .open-link-label {
                    font-size: 12px;
                    font-weight: 600;
                }

                .control-btn.myetv-btn-disabled {
                    opacity: 0.35;
                    cursor: not-allowed;
                    pointer-events: none;
                }

                /* Slide boundary markers on progress bar */
                .myetv-link-slide-markers {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 2;
                }

                .myetv-link-slide-marker {
                    position: absolute;
                    top: 0;
                    height: 100%;
                    width: 2px;
                    background: rgba(0, 0, 0, 0.65);
                    transform: translateX(-50%);
                }

                /* Link security modal layout */
                .myetv-link-security-panel {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .myetv-security-banner {
                    padding: 10px 14px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .myetv-security-banner.secure {
                    background: rgba(76, 175, 80, 0.18);
                    border: 1px solid rgba(76, 175, 80, 0.45);
                    color: #a5d6a7;
                }

                .myetv-security-banner.warning {
                    background: rgba(255, 152, 0, 0.18);
                    border: 1px solid rgba(255, 152, 0, 0.45);
                    color: #ffcc80;
                }

                .myetv-security-table {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 8px;
                    padding: 12px;
                }

                .myetv-security-row {
                    display: flex;
                    justify-content: space-between;
                    gap: 12px;
                    font-size: 13px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                    padding-bottom: 6px;
                }

                .myetv-security-row:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }

                .myetv-security-key {
                    color: rgba(255, 255, 255, 0.65);
                    flex-shrink: 0;
                }

                .myetv-security-val {
                    color: #ffffff;
                    text-align: right;
                    word-break: break-all;
                }

                .myetv-security-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 4px;
                }

                .myetv-security-open-btn {
                    background: var(--player-primary-color, goldenrod);
                    color: #111;
                    border: none;
                    border-radius: 6px;
                    padding: 8px 14px;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }

                .myetv-security-open-btn:hover {
                    background: var(--player-primary-hover, #daa520);
                }

                @media (max-width: 640px) {
                    .myetv-link-card {
                        flex-direction: column;
                        width: 92%;
                        height: 76%;
                        padding: 14px;
                        gap: 12px;
                    }
                    .myetv-link-media-box {
                        flex: 0 0 40%;
                        width: 100%;
                    }
                    .myetv-link-card-title {
                        font-size: 15px;
                    }
                    .myetv-link-desc-text {
                        font-size: 13px;
                    }
                    .myetv-open-link-btn .open-link-label {
                        display: none;
                    }
                    .myetv-link-nav-arrow {
                        width: 34px;
                        height: 34px;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        /**
         * Disable native <video> element loading/playback while link gallery plugin is active
         */
        neutralizeNativeVideo() {
            const video = this.player.video;
            if (!video) return;

            this.player.originalSrc = null;
            this.player.originalSources = [];
            this.savedVideoSources = Array.from(video.querySelectorAll('source'));
            this.savedVideoSources.forEach((srcEl) => srcEl.remove());

            video.pause();
            video.preload = 'none';
            video.removeAttribute('src');
            video.style.display = 'none';

            const preventNativePlay = () => {
                if (!this.isDisposed && video) {
                    video.pause();
                }
            };
            video.addEventListener('play', preventNativePlay);
            this.boundListeners.push({ target: video, type: 'play', handler: preventNativePlay });

            if (this.player.container) {
                this.player.container.classList.add('myetv-link-gallery-active');
            }
        }

        /**
         * Create stage card UI inside .video-wrapper
         */
        createStage() {
            const container = this.player.container;
            if (!container) return;

            this.stageElement = document.createElement('div');
            this.stageElement.className = 'myetv-link-gallery-stage';
            this.stageElement.style.backgroundColor = this.options.backgroundColor;
            if (this.options.aspectRatio && this.options.aspectRatio !== 'auto') {
                this.stageElement.style.aspectRatio = this.options.aspectRatio;
            }

            this.bgBlurElement = document.createElement('div');
            this.bgBlurElement.className = 'myetv-link-bg-blur';
            this.stageElement.appendChild(this.bgBlurElement);

            this.cardElement = document.createElement('div');
            this.cardElement.className = 'myetv-link-card';

            // Left/top media preview box
            this.mediaBoxElement = document.createElement('div');
            this.mediaBoxElement.className = 'myetv-link-media-box';

            // Right/bottom content box
            const contentBox = document.createElement('div');
            contentBox.className = 'myetv-link-content-box';

            const metaRow = document.createElement('div');
            metaRow.className = 'myetv-link-meta-row';

            this.domainBadgeElement = document.createElement('span');
            this.domainBadgeElement.className = 'myetv-link-domain-badge';
            metaRow.appendChild(this.domainBadgeElement);

            this.cardTitleElement = document.createElement('h4');
            this.cardTitleElement.className = 'myetv-link-card-title';

            this.descViewportElement = document.createElement('div');
            this.descViewportElement.className = 'myetv-link-desc-viewport';

            this.descTrackElement = document.createElement('div');
            this.descTrackElement.className = 'myetv-link-desc-track';

            this.descTextElement = document.createElement('p');
            this.descTextElement.className = 'myetv-link-desc-text';

            this.descTrackElement.appendChild(this.descTextElement);
            this.descViewportElement.appendChild(this.descTrackElement);

            contentBox.appendChild(metaRow);
            contentBox.appendChild(this.cardTitleElement);
            contentBox.appendChild(this.descViewportElement);

            this.cardElement.appendChild(this.mediaBoxElement);
            this.cardElement.appendChild(contentBox);
            this.stageElement.appendChild(this.cardElement);

            // Floating arrows for multi-link galleries
            if (this.slides.length > 1 && this.options.showNavArrows) {
                this.prevArrowBtn = document.createElement('button');
                this.prevArrowBtn.type = 'button';
                this.prevArrowBtn.className = 'myetv-link-nav-arrow prev';
                this.prevArrowBtn.setAttribute('aria-label', 'Previous link');
                this.prevArrowBtn.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>`;

                this.nextArrowBtn = document.createElement('button');
                this.nextArrowBtn.type = 'button';
                this.nextArrowBtn.className = 'myetv-link-nav-arrow next';
                this.nextArrowBtn.setAttribute('aria-label', 'Next link');
                this.nextArrowBtn.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>`;

                this.stageElement.appendChild(this.prevArrowBtn);
                this.stageElement.appendChild(this.nextArrowBtn);
            }

            if (this.player.video && this.player.video.nextSibling) {
                container.insertBefore(this.stageElement, this.player.video.nextSibling);
            } else {
                container.appendChild(this.stageElement);
            }
        }

        /**
         * Add gallery navigation and "Open Link" button into .controls-right
         */
        createControlBarUI() {
            const controls = this.player.controls;
            if (!controls) return;

            if (this.options.hideVideoOnlyControls) {
                const selectors = ['.mute-btn', '.volume-container', '.quality-control', '.pip-btn'];
                selectors.forEach((sel) => {
                    const el = controls.querySelector(sel);
                    if (el) {
                        this.hiddenControlElements.push({ el, prevDisplay: el.style.display });
                        el.style.display = 'none';
                    }
                });
            }

            const controlsRight = controls.querySelector('.controls-right');
            if (!controlsRight) return;

            const anchor = controlsRight.querySelector('.fullscreen-btn') || null;
            const group = document.createElement('div');
            group.className = 'myetv-link-controls-group';

            if (this.slides.length > 1) {
                this.galleryPrevBtn = document.createElement('button');
                this.galleryPrevBtn.type = 'button';
                this.galleryPrevBtn.className = 'control-btn link-gallery-prev-btn';
                this.galleryPrevBtn.title = 'Previous link';
                this.galleryPrevBtn.innerHTML = `<span class="icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></span>`;
                group.appendChild(this.galleryPrevBtn);

                if (this.options.showCounter) {
                    this.galleryCounterEl = document.createElement('span');
                    this.galleryCounterEl.className = 'myetv-link-counter';
                    this.galleryCounterEl.textContent = `1 / ${this.slides.length}`;
                    group.appendChild(this.galleryCounterEl);
                }

                this.galleryNextBtn = document.createElement('button');
                this.galleryNextBtn.type = 'button';
                this.galleryNextBtn.className = 'control-btn link-gallery-next-btn';
                this.galleryNextBtn.title = 'Next link';
                this.galleryNextBtn.innerHTML = `<span class="icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></span>`;
                group.appendChild(this.galleryNextBtn);
            }

            if (this.options.showOpenLinkButton) {
                this.openLinkBtn = document.createElement('button');
                this.openLinkBtn.type = 'button';
                this.openLinkBtn.className = 'control-btn myetv-open-link-btn';
                this.openLinkBtn.title = 'Open link';
                this.openLinkBtn.innerHTML = `
                    <span class="icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg></span>
                    <span class="open-link-label">Open Link</span>
                `;
                group.appendChild(this.openLinkBtn);
            }

            if (group.children.length > 0) {
                controlsRight.insertBefore(group, anchor);
            }
            this.controlsGroup = group;
        }

        /**
         * Draw slide divider markers on the player's progress bar
         */
        createSlideMarkers() {
            if (!this.options.showSlideMarkers || this.slides.length <= 1) return;
            const progressBar = this.player.controls?.querySelector('.progress-bar');
            if (!progressBar || this.totalDurationMs <= 0) return;

            if (this.slideMarkersContainer) {
                this.slideMarkersContainer.remove();
            }

            const markers = document.createElement('div');
            markers.className = 'myetv-link-slide-markers';

            for (let i = 1; i < this.slides.length; i++) {
                const pct = (this.slides[i].startMs / this.totalDurationMs) * 100;
                const marker = document.createElement('div');
                marker.className = 'myetv-link-slide-marker';
                marker.style.left = `${pct}%`;
                markers.appendChild(marker);
            }

            progressBar.appendChild(markers);
            this.slideMarkersContainer = markers;
        }

        /**
         * Override player methods and inject the link security option into settings menu
         */
        hookPlayerMethods() {
            const p = this.player;
            const self = this;

            const override = (name, fn) => {
                this.originalMethods[name] = p[name];
                p[name] = fn;
            };

            override('play', () => self.play());
            override('pause', () => self.pause());
            override('togglePlayPause', () => self.togglePlayPause());
            override('isPaused', () => !self.isPlaying);
            override('restartVideo', () => self.restart());

            override('showLoading', () => {
                // Suppress native video loading overlay
            });

            override('getCurrentTime', () => self.currentTimeMs / 1000);
            override('setCurrentTime', (sec) => {
                if (typeof sec === 'number' && !isNaN(sec)) {
                    self.seekToMs(sec * 1000);
                }
            });
            override('getDuration', () => self.totalDurationMs / 1000);
            override('skipTime', (seconds) => {
                self.seekToMs(self.currentTimeMs + seconds * 1000);
            });

            override('seek', (e) => {
                if (e && e.cancelable) e.preventDefault();
                if (!p.progressContainer || self.totalDurationMs <= 0) return;

                const rect = p.progressContainer.getBoundingClientRect();
                const clientX = e.clientX !== undefined
                    ? e.clientX
                    : (e.touches && e.touches[0]
                        ? e.touches[0].clientX
                        : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : 0));

                const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                self.seekToMs(pct * self.totalDurationMs);
            });

            override('updateSeekTooltip', (e) => {
                if (!p.seekTooltip || !p.progressContainer || self.totalDurationMs <= 0) return;

                const rect = p.progressContainer.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const pct = Math.max(0, Math.min(1, clickX / rect.width));
                const targetMs = pct * self.totalDurationMs;
                const timeStr = p.formatTime(targetMs / 1000);

                if (self.slides.length > 1) {
                    const slide = self.getSlideAtTime(targetMs);
                    const slideLabel = slide.title ? slide.title : `${slide.index + 1}/${self.slides.length}`;
                    p.seekTooltip.textContent = `${timeStr} (${slideLabel})`;
                } else {
                    p.seekTooltip.textContent = timeStr;
                }

                const tooltipWidth = p.seekTooltip.getBoundingClientRect().width || 50;
                const leftPos = Math.max(tooltipWidth / 2, Math.min(rect.width - tooltipWidth / 2, clickX));
                p.seekTooltip.style.left = `${leftPos}px`;
            });

            override('updateProgress', () => self.syncTimelineUI());
            override('updateTimeDisplay', () => self.syncTimelineUI());
            override('updateDuration', () => self.syncTimelineUI());

            // Auto-hide overrides based on self.isPlaying
            override('resetAutoHideTimer', () => {
                if (p.autoHideTimer) {
                    clearTimeout(p.autoHideTimer);
                    p.autoHideTimer = null;
                }
                const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
                if (p.mouseOverControls && !isTouch) return;
                if (!self.isPlaying) return;

                p.autoHideTimer = setTimeout(() => {
                    p.hideControlsNow();
                }, p.options.autoHideDelay);
            });

            override('hideControlsNow', () => {
                const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
                if (p.mouseOverControls && !isTouch) return;
                if (!self.isPlaying) return;

                if (p.controls) {
                    p.controls.classList.remove('show');
                    if (p.container) p.container.classList.remove('has-controls');
                    p.updateControlbarHeight();
                    if (p.updateWatermarkPosition) p.updateWatermarkPosition();
                    if (p.options.showTitleOverlay && !p.options.persistentTitle) {
                        p.hideTitleOverlay();
                    }
                    p.hideCursor();
                }
            });

            override('forceHideControls', () => {
                if (!p.mouseOverControls && self.isPlaying) {
                    p.hideControlsNow();
                }
                return p;
            });

            override('getPlayerState', () => {
                const base = self.originalMethods.getPlayerState.call(p);
                return {
                    ...base,
                    isPlaying: self.isPlaying,
                    isPaused: !self.isPlaying,
                    currentTime: self.currentTimeMs / 1000,
                    duration: self.totalDurationMs / 1000,
                    currentSlide: self.currentIndex,
                    totalSlides: self.slides.length,
                    currentLink: self.slides[self.currentIndex]?.url || ''
                };
            });

            // Extend populateSettingsMenu to include "Link & Security Info"
            if (this.options.showSettingsLinkInfo && typeof this.originalMethods.populateSettingsMenu === 'function') {
                override('populateSettingsMenu', () => {
                    self.originalMethods.populateSettingsMenu.call(p);
                    self.injectSettingsLinkOption();
                });
            }

            // Intercept clicks on our custom settings menu option
            const settingsMenu = p.container?.querySelector('.settings-menu');
            if (settingsMenu && this.options.showSettingsLinkInfo) {
                const onSettingsClick = (e) => {
                    const linkOption = e.target.closest('[data-action="link_security_info"]');
                    if (linkOption) {
                        e.stopPropagation();
                        self.openLinkSecurityModal();
                    }
                };
                settingsMenu.addEventListener('click', onSettingsClick);
                this.boundListeners.push({ target: settingsMenu, type: 'click', handler: onSettingsClick });
            }
        }

        /**
         * Inject or update the Link Info & Security option inside .settings-menu
         */
        injectSettingsLinkOption() {
            if (!this.options.showSettingsLinkInfo) return;
            const settingsMenu = this.player.container?.querySelector('.settings-menu');
            if (!settingsMenu) return;

            let option = settingsMenu.querySelector('[data-action="link_security_info"]');
            const currentSlide = this.slides[this.currentIndex];
            const hostLabel = currentSlide?.urlMeta?.cleanHost || '';
            const statusText = currentSlide?.urlMeta?.isHttps ? 'HTTPS' : 'HTTP';

            if (!option) {
                option = document.createElement('div');
                option.className = 'settings-option myetv-link-info-option';
                option.setAttribute('data-action', 'link_security_info');

                const labelSpan = document.createElement('span');
                labelSpan.className = 'settings-option-label';

                const valueSpan = document.createElement('span');
                valueSpan.className = 'settings-option-value';

                option.appendChild(labelSpan);
                option.appendChild(valueSpan);

                const moreInfoOption = settingsMenu.querySelector('[data-action="moreinfo"]');
                if (moreInfoOption && moreInfoOption.nextSibling) {
                    settingsMenu.insertBefore(option, moreInfoOption.nextSibling);
                } else {
                    settingsMenu.insertBefore(option, settingsMenu.firstChild);
                }
            }

            const labelEl = option.querySelector('.settings-option-label');
            const valEl = option.querySelector('.settings-option-value');
            if (labelEl) {
                labelEl.textContent = hostLabel ? `Link Info (${hostLabel})` : 'Link & Security Info';
            }
            if (valEl) {
                valEl.textContent = statusText;
            }
        }

        /**
         * Open the existing player modal with detailed link & security diagnostics
         */
        openLinkSecurityModal() {
            const p = this.player;
            const slide = this.slides[this.currentIndex];
            if (!p.moreinfoModal || !slide) return;

            // Restore settings menu if it is currently mounted inside the modal
            if (p.settingsMenuInModal) {
                const settingsMenu = p.moreinfoModal.querySelector('.settings-menu');
                if (settingsMenu && p.settingsMenuOriginalParent) {
                    p.settingsMenuOriginalParent.appendChild(settingsMenu);
                    settingsMenu.style.position = '';
                    settingsMenu.style.top = '';
                    settingsMenu.style.right = '';
                    settingsMenu.style.opacity = '';
                    settingsMenu.style.visibility = '';
                    settingsMenu.style.transform = '';
                    settingsMenu.style.display = '';
                    settingsMenu.style.maxHeight = '';
                    settingsMenu.classList.remove('active');
                    p.settingsMenuInModal = false;
                }
            }

            const modalTitle = p.moreinfoModal.querySelector('.moreinfo-modal-title');
            const modalBody = p.moreinfoModal.querySelector('.moreinfo-modal-body');
            if (!modalTitle || !modalBody) return;

            modalTitle.textContent = 'Link Information & Security';
            modalBody.className = 'moreinfo-modal-body';
            modalBody.textContent = '';

            const meta = slide.urlMeta;
            const panel = document.createElement('div');
            panel.className = 'myetv-link-security-panel';

            // Security status banner
            const banner = document.createElement('div');
            const hasWarnings = !meta.isHttps || meta.hasCredentials || meta.isPunycode;
            banner.className = `myetv-security-banner ${hasWarnings ? 'warning' : 'secure'}`;
            banner.textContent = hasWarnings
                ? (meta.isHttps
                    ? 'Security Notice: Inspect link details carefully before opening.'
                    : 'Unencrypted Connection (HTTP): Traffic to this link is not encrypted.')
                : 'Verified HTTPS Protocol: Encrypted transport and sanitized URL.';
            panel.appendChild(banner);

            // Key-value metadata table built safely with textContent
            const table = document.createElement('div');
            table.className = 'myetv-security-table';

            const rows = [
                ['Title', slide.title || meta.cleanHost],
                ['Destination URL', slide.url],
                ['Domain / Host', meta.hostname + (meta.port ? `:${meta.port}` : '')],
                ['Protocol', meta.protocol ? meta.protocol.replace(':', '').toUpperCase() : 'Unknown'],
                ['Origin Type', meta.isExternal ? 'External third-party website' : 'Same-origin internal link'],
                ['Query Parameters', meta.hasQuery ? 'Yes (may include tracking or parameters)' : 'None'],
                ['IDN / Punycode Check', meta.isPunycode ? 'Punycode detected (xn--)' : 'Standard ASCII hostname'],
                ['Embedded Credentials', meta.hasCredentials ? 'Detected in URL (caution)' : 'None'],
                ['Window Isolation', 'Opens with rel="noopener noreferrer"']
            ];

            rows.forEach(([key, val]) => {
                const row = document.createElement('div');
                row.className = 'myetv-security-row';

                const kEl = document.createElement('span');
                kEl.className = 'myetv-security-key';
                kEl.textContent = key;

                const vEl = document.createElement('span');
                vEl.className = 'myetv-security-val';
                vEl.textContent = val;

                row.appendChild(kEl);
                row.appendChild(vEl);
                table.appendChild(row);
            });
            panel.appendChild(table);

            // Action button to open the link safely
            const safeHref = this.getSafeUrl(slide.url);
            if (safeHref) {
                const actions = document.createElement('div');
                actions.className = 'myetv-security-actions';

                const openBtn = document.createElement('a');
                openBtn.className = 'myetv-security-open-btn';
                openBtn.href = safeHref;
                openBtn.target = this.options.openLinkTarget;
                openBtn.rel = 'noopener noreferrer';
                openBtn.textContent = 'Visit Link Safely';

                actions.appendChild(openBtn);
                panel.appendChild(actions);
            }

            modalBody.appendChild(panel);
            p.moreinfoModal.style.display = 'flex';
        }

        /**
         * Bind click, hover, wheel, and resize events
         */
        bindStageEvents() {
            const add = (target, type, handler, opts) => {
                if (!target) return;
                target.addEventListener(type, handler, opts);
                this.boundListeners.push({ target, type, handler, opts });
            };

            add(this.prevArrowBtn, 'click', (e) => {
                e.stopPropagation();
                this.prevSlide();
            });
            add(this.nextArrowBtn, 'click', (e) => {
                e.stopPropagation();
                this.nextSlide();
            });
            add(this.galleryPrevBtn, 'click', (e) => {
                e.stopPropagation();
                this.prevSlide();
            });
            add(this.galleryNextBtn, 'click', (e) => {
                e.stopPropagation();
                this.nextSlide();
            });
            add(this.openLinkBtn, 'click', (e) => {
                e.stopPropagation();
                this.openCurrentLink();
            });

            // Click on stage background toggles play/pause unless selecting text inside description
            add(this.stageElement, 'click', (e) => {
                if (e.target.closest('button') || e.target.closest('.myetv-link-desc-viewport')) return;
                if (!this.player.options.pauseClick) return;

                if (this.player.options.doubleTapPause) {
                    const controlsVisible = this.player.controls && this.player.controls.classList.contains('show');
                    if (controlsVisible) {
                        this.togglePlayPause();
                    } else {
                        this.player.showControlsNow();
                        this.player.resetAutoHideTimer();
                    }
                } else {
                    this.togglePlayPause();
                }
            });

            // Pause credits scrolling on hover so the user can read comfortably
            if (this.options.pauseCreditsOnHover) {
                add(this.descViewportElement, 'mouseenter', () => {
                    this.creditsHovered = true;
                });
                add(this.descViewportElement, 'mouseleave', () => {
                    this.creditsHovered = false;
                    this.creditsLastTick = performance.now();
                });
            }

            // Allow manual mouse wheel scrolling inside long descriptions
            add(this.descViewportElement, 'wheel', (e) => {
                if (!this.creditsNeedsScroll || !this.descViewportElement || !this.descTrackElement) return;
                e.preventDefault();
                e.stopPropagation();

                const vpH = this.descViewportElement.clientHeight;
                const trackH = this.descTrackElement.scrollHeight;
                const minOffset = -(trackH);
                const maxOffset = vpH;

                this.creditsOffsetY = Math.max(minOffset, Math.min(maxOffset, this.creditsOffsetY - e.deltaY));
                this.creditsPauseUntil = performance.now() + 1500;
                this.descTrackElement.style.transform = `translate3d(0, ${this.creditsOffsetY}px, 0)`;
            }, { passive: false });

            // Re-evaluate credits overflow on resize / fullscreen
            const onResize = () => {
                this.setupCreditsAnimation(false);
            };
            add(window, 'resize', onResize);
            add(document, 'fullscreenchange', onResize);
        }

        /**
         * Bind optional keyboard shortcuts
         */
        bindKeyboardEvents() {
            if (!this.options.keyboardControls) return;

            const onKeyDown = (e) => {
                if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

                if (this.slides.length > 1 && e.shiftKey) {
                    if (e.code === 'ArrowRight') {
                        e.preventDefault();
                        this.nextSlide();
                    } else if (e.code === 'ArrowLeft') {
                        e.preventDefault();
                        this.prevSlide();
                    }
                } else if (e.code === 'KeyO') {
                    e.preventDefault();
                    this.openCurrentLink();
                }
            };

            document.addEventListener('keydown', onKeyDown);
            this.boundListeners.push({ target: document, type: 'keydown', handler: onKeyDown });
        }

        // ============================================================
        // SCRAPING ENGINE (Client-side direct or optional proxy)
        // ============================================================

        /**
         * Scrape missing title, description, or image from a link URL
         */
        async scrapeSlideMetadata(slide) {
            if (!slide || !this.options.enableScraping || slide.scraped) return;

            // Skip network request if all fields were explicitly filled in options
            if (slide.hasExplicitTitle && slide.hasExplicitDescription && slide.hasExplicitImage) {
                slide.scraped = true;
                slide.scrapeStatus = 'done';
                return;
            }

            const cacheKey = `${slide.url}|${this.options.scraperProxyUrl}`;
            if (this.scrapeCache.has(cacheKey)) {
                this.applyScrapedDataToSlide(slide, this.scrapeCache.get(cacheKey));
                return;
            }

            slide.scrapeStatus = 'loading';
            const controller = new AbortController();
            this.activeAbortControllers.add(controller);
            const timeoutId = setTimeout(() => controller.abort(), this.options.scrapeTimeout);

            try {
                const requestUrl = this.buildScrapeRequestUrl(slide.url);
                const response = await fetch(requestUrl, {
                    method: 'GET',
                    signal: controller.signal,
                    credentials: 'omit'
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const contentType = (response.headers.get('content-type') || '').toLowerCase();
                let extracted = null;

                if (contentType.includes('application/json')) {
                    const json = await response.json();
                    extracted = this.normalizeProxyJsonMetadata(json, slide.url);
                } else {
                    const htmlText = await response.text();
                    extracted = this.parseHtmlMetadata(htmlText, slide.url);
                }

                if (extracted) {
                    this.scrapeCache.set(cacheKey, extracted);
                    this.applyScrapedDataToSlide(slide, extracted);
                } else {
                    slide.scraped = true;
                    slide.scrapeStatus = 'fallback';
                }
            } catch (error) {
                // Likely blocked by CORS on cross-origin domains or timed out; keep clean URL fallback
                slide.scraped = true;
                slide.scrapeStatus = 'fallback';
                if (this.player.options.debug) {
                    console.warn('🔗 LinkGalleryPlugin scrape skipped/fallback for:', slide.url, error.message);
                }
            } finally {
                clearTimeout(timeoutId);
                this.activeAbortControllers.delete(controller);
            }
        }

        /**
         * Build direct or proxied URL for scraping
         */
        buildScrapeRequestUrl(targetUrl) {
            const proxy = this.options.scraperProxyUrl;
            if (!proxy) return targetUrl;

            if (proxy.includes('{url}')) {
                return proxy.replace('{url}', encodeURIComponent(targetUrl));
            }
            const separator = proxy.includes('?') ? (proxy.endsWith('?') || proxy.endsWith('&') ? '' : '&url=') : '?url=';
            return proxy.endsWith('=') ? `${proxy}${encodeURIComponent(targetUrl)}` : `${proxy}${separator}${encodeURIComponent(targetUrl)}`;
        }

        /**
         * Normalize metadata returned by an optional JSON proxy endpoint
         */
        normalizeProxyJsonMetadata(json, baseUrl) {
            if (!json || typeof json !== 'object') return null;
            const rawImage = json.image || json.ogImage || json.thumbnail || '';
            const resolvedImg = rawImage ? this.resolveAndSanitizeUrl(rawImage, baseUrl) : '';

            return {
                title: this.formatText(String(json.title || json.ogTitle || '')).trim(),
                description: this.formatText(String(json.description || json.ogDescription || '')).trim(),
                image: resolvedImg
            };
        }

        /**
         * Parse HTML document via DOMParser to extract OpenGraph, Twitter, and standard meta tags
         */
        parseHtmlMetadata(htmlText, baseUrl) {
            if (!htmlText || typeof htmlText !== 'string') return null;

            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');

            const getMeta = (selectors) => {
                for (const sel of selectors) {
                    const el = doc.querySelector(sel);
                    const content = el ? el.getAttribute('content') : '';
                    if (content && content.trim()) {
                        return this.formatText(content.trim());
                    }
                }
                return '';
            };

            const ogTitle = getMeta([
                'meta[property="og:title"]',
                'meta[name="twitter:title"]'
            ]);
            const docTitle = doc.querySelector('title')?.textContent?.trim() || '';
            const title = ogTitle || this.formatText(docTitle);

            const description = getMeta([
                'meta[property="og:description"]',
                'meta[name="twitter:description"]',
                'meta[name="description"]'
            ]);

            const rawImg = getMeta([
                'meta[property="og:image"]',
                'meta[property="og:image:secure_url"]',
                'meta[name="twitter:image"]',
                'meta[name="twitter:image:src"]'
            ]);

            let image = rawImg ? this.resolveAndSanitizeUrl(rawImg, baseUrl) : '';

            // Fallback to site icon if no social preview image is present
            if (!image) {
                const iconEl = doc.querySelector('link[rel="apple-touch-icon"], link[rel="icon"], link[rel="shortcut icon"]');
                const rawIcon = iconEl ? iconEl.getAttribute('href') : '';
                if (rawIcon) {
                    image = this.resolveAndSanitizeUrl(rawIcon, baseUrl);
                }
            }

            return { title, description, image };
        }

        /**
         * Resolve relative scraped URLs against the page URL and sanitize them
         */
        resolveAndSanitizeUrl(rawUrl, baseUrl) {
            if (!rawUrl || typeof rawUrl !== 'string') return '';
            try {
                const absolute = new URL(rawUrl.trim(), baseUrl).href;
                return this.getSafeUrl(absolute);
            } catch (e) {
                return '';
            }
        }

        /**
         * Merge scraped metadata into a slide only for fields not explicitly provided in options
         */
        applyScrapedDataToSlide(slide, data) {
            if (!slide || !data) return;

            slide.scraped = true;
            slide.scrapeStatus = 'done';

            if (!slide.hasExplicitTitle && data.title) {
                slide.title = data.title;
            }
            if (!slide.hasExplicitDescription && data.description) {
                slide.description = data.description;
            }
            if (!slide.hasExplicitImage && data.image) {
                slide.image = data.image;
            }

            // Re-render current slide UI if this slide is still active
            if (!this.isDisposed && this.slides[this.currentIndex] === slide) {
                this.applySlideToDOM(slide);
                this.injectSettingsLinkOption();
            }
        }

        // ============================================================
        // PLAYBACK ENGINE
        // ============================================================

        play() {
            if (this.isDisposed || this.slides.length === 0) return;

            if (this.isEnded || this.currentTimeMs >= this.totalDurationMs) {
                this.currentTimeMs = 0;
                this.isEnded = false;
                if (this.currentIndex !== 0) {
                    this.renderSlide(0, { instant: true });
                }
            }

            this.forceHidePlayerLoading();

            if (this.isPlaying) return;

            this.isPlaying = true;
            this.lastTickTime = performance.now();
            this.creditsLastTick = performance.now();

            if (typeof this.player.hidePoster === 'function') {
                this.player.hidePoster();
            }

            this.updatePlayPauseIcons();

            if (this.player.options.autoHide && this.player.autoHideInitialized) {
                this.player.resetAutoHideTimer();
            }

            this.startTickLoop();

            this.player.triggerEvent('played', {
                currentTime: this.currentTimeMs / 1000,
                duration: this.totalDurationMs / 1000
            });
            this.player.triggerEvent('playing', {
                currentTime: this.currentTimeMs / 1000,
                duration: this.totalDurationMs / 1000
            });
        }

        pause() {
            if (!this.isPlaying) return;

            this.isPlaying = false;
            this.stopTickLoop();
            this.updatePlayPauseIcons();

            if (this.player.options.autoHide && this.player.autoHideInitialized) {
                this.player.showControlsNow();
                if (this.player.autoHideTimer) {
                    clearTimeout(this.player.autoHideTimer);
                    this.player.autoHideTimer = null;
                }
            }

            this.player.triggerEvent('paused', {
                currentTime: this.currentTimeMs / 1000,
                duration: this.totalDurationMs / 1000
            });
        }

        togglePlayPause() {
            if (this.isPlaying) {
                this.pause();
            } else {
                this.play();
            }
        }

        restart() {
            const previousTime = this.currentTimeMs / 1000;
            const wasPlaying = this.isPlaying;

            this.currentTimeMs = 0;
            this.isEnded = false;
            this.renderSlide(0, { instant: true });
            this.syncTimelineUI();

            if (wasPlaying || this.isPlaying) {
                this.lastTickTime = performance.now();
                this.play();
            }

            this.player.triggerEvent('restarted', {
                previousTime,
                duration: this.totalDurationMs / 1000,
                autoPlayed: wasPlaying
            });

            return this.player;
        }

        startTickLoop() {
            this.stopTickLoop();
            const tick = (now) => {
                if (!this.isPlaying || this.isDisposed) return;

                const delta = Math.max(0, now - (this.lastTickTime || now));
                this.lastTickTime = now;

                if (!this.player.isUserSeeking) {
                    const speed = this.player.video ? (this.player.video.playbackRate || 1) : 1;
                    this.currentTimeMs += delta * speed;

                    if (this.currentTimeMs >= this.totalDurationMs) {
                        this.handlePlaybackEnd();
                        return;
                    }

                    const slideAtTime = this.getSlideAtTime(this.currentTimeMs);
                    if (slideAtTime && slideAtTime.index !== this.currentIndex) {
                        this.renderSlide(slideAtTime.index);
                    }

                    this.syncTimelineUI();

                    if (now - this.lastTimeUpdateEvent > 250) {
                        this.lastTimeUpdateEvent = now;
                        this.player.triggerEvent('timeupdate', {
                            currentTime: this.currentTimeMs / 1000,
                            duration: this.totalDurationMs / 1000,
                            progress: (this.currentTimeMs / this.totalDurationMs) * 100 || 0
                        });
                    }
                }

                this.rafId = requestAnimationFrame(tick);
            };

            this.rafId = requestAnimationFrame(tick);
        }

        stopTickLoop() {
            if (this.rafId !== null) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
        }

        handlePlaybackEnd() {
            const shouldLoop = this.options.loop !== undefined
                ? this.options.loop
                : !!this.player.options.loop;

            if (shouldLoop) {
                this.currentTimeMs = 0;
                this.isEnded = false;
                this.renderSlide(0);
                this.syncTimelineUI();
                this.lastTickTime = performance.now();
                this.rafId = requestAnimationFrame((now) => {
                    this.lastTickTime = now;
                    this.startTickLoop();
                });
                return;
            }

            this.currentTimeMs = this.totalDurationMs;
            this.isPlaying = false;
            this.isEnded = true;
            this.stopTickLoop();
            this.syncTimelineUI();
            this.updatePlayPauseIcons();

            if (this.player.options.showPosterOnEnd && typeof this.player.showPoster === 'function') {
                this.player.showPoster();
            }

            this.player.showControlsNow();

            this.player.triggerEvent('ended', {
                currentTime: this.totalDurationMs / 1000,
                duration: this.totalDurationMs / 1000,
                playlistInfo: this.player.getPlaylistInfo ? this.player.getPlaylistInfo() : null
            });
        }

        seekToMs(targetMs) {
            const clamped = Math.max(0, Math.min(this.totalDurationMs, targetMs));
            this.player.triggerEvent('seeking', {
                currentTime: this.currentTimeMs / 1000,
                targetTime: clamped / 1000
            });

            this.currentTimeMs = clamped;
            this.isEnded = clamped >= this.totalDurationMs;

            const slide = this.getSlideAtTime(clamped);
            if (slide && slide.index !== this.currentIndex) {
                this.renderSlide(slide.index);
            }

            this.syncTimelineUI();

            this.player.triggerEvent('seeked', {
                currentTime: this.currentTimeMs / 1000
            });
        }

        getSlideAtTime(ms) {
            if (this.slides.length === 0) return null;
            for (let i = this.slides.length - 1; i >= 0; i--) {
                if (ms >= this.slides[i].startMs) {
                    return this.slides[i];
                }
            }
            return this.slides[0];
        }

        // ============================================================
        // SLIDE RENDERING & CREDITS-STYLE SCROLLING DESCRIPTION
        // ============================================================

        nextSlide() {
            if (this.slides.length <= 1) return false;
            const shouldLoop = this.options.loop !== undefined ? this.options.loop : !!this.player.options.loop;
            let nextIdx = this.currentIndex + 1;

            if (nextIdx >= this.slides.length) {
                if (shouldLoop) {
                    nextIdx = 0;
                } else {
                    return false;
                }
            }
            return this.goToSlide(nextIdx);
        }

        prevSlide() {
            if (this.slides.length <= 1) return false;
            const shouldLoop = this.options.loop !== undefined ? this.options.loop : !!this.player.options.loop;
            let prevIdx = this.currentIndex - 1;

            if (prevIdx < 0) {
                if (shouldLoop) {
                    prevIdx = this.slides.length - 1;
                } else {
                    return false;
                }
            }
            return this.goToSlide(prevIdx);
        }

        goToSlide(index) {
            if (index < 0 || index >= this.slides.length) return false;

            const slide = this.slides[index];
            this.currentTimeMs = slide.startMs;
            this.isEnded = false;
            this.renderSlide(index);
            this.syncTimelineUI();
            return true;
        }

        renderSlide(index, { instant = false } = {}) {
            const slide = this.slides[index];
            if (!slide || !this.cardElement) return;

            const prevIndex = this.currentIndex;
            this.currentIndex = index;

            const transitionDuration = instant || this.options.transition === 'none'
                ? 0
                : this.options.transitionDuration;

            if (transitionDuration > 0) {
                this.cardElement.style.opacity = '0';
                if (this.options.transition === 'slide') {
                    const dir = index >= prevIndex ? '24px' : '-24px';
                    this.cardElement.style.transform = `translate3d(${dir}, 0, 0)`;
                }
                requestAnimationFrame(() => {
                    this.applySlideToDOM(slide);
                    this.cardElement.style.opacity = '1';
                    this.cardElement.style.transform = 'translate3d(0, 0, 0)';
                });
            } else {
                this.applySlideToDOM(slide);
            }

            this.updateGalleryNavUI();
            this.injectSettingsLinkOption();

            // Trigger async metadata scraping if needed
            if (this.options.enableScraping && !slide.scraped) {
                this.scrapeSlideMetadata(slide);
            }

            this.player.triggerEvent('slidechange', {
                slideIndex: index,
                totalSlides: this.slides.length,
                slide: slide
            });
        }

        /**
         * Update DOM elements for the active link slide
         */
        applySlideToDOM(slide) {
            if (!slide) return;

            // Domain badge + security dot
            if (this.domainBadgeElement) {
                this.domainBadgeElement.textContent = '';
                const dot = document.createElement('span');
                dot.className = `myetv-link-security-dot${slide.urlMeta.isHttps ? '' : ' insecure'}`;
                const label = document.createTextNode(
                    `${slide.urlMeta.cleanHost} (${slide.urlMeta.isHttps ? 'HTTPS' : 'HTTP'})`
                );
                this.domainBadgeElement.appendChild(dot);
                this.domainBadgeElement.appendChild(label);
            }

            // Card title & description
            if (this.cardTitleElement) {
                this.cardTitleElement.textContent = slide.title || slide.urlMeta.cleanHost;
            }
            if (this.descTextElement) {
                this.descTextElement.textContent = slide.description || slide.url;
            }

            // Controlbar Open Link tooltip
            if (this.openLinkBtn) {
                this.openLinkBtn.title = `Open link: ${slide.url}`;
                this.openLinkBtn.classList.toggle('myetv-btn-disabled', !this.getSafeUrl(slide.url));
            }

            // Media image or fallback icon card
            this.renderSlideMedia(slide);

            // Top bar title: only update if player.options.videoTitle was NOT already filled
            if (this.options.updateTitleOnSlide && !this.playerHasExplicitTitle) {
                if (typeof this.player.enableTitleOverlay === 'function') {
                    this.player.enableTitleOverlay();
                }
                if (typeof this.player.setVideoTitle === 'function') {
                    this.player.setVideoTitle(slide.title || slide.urlMeta.cleanHost);
                }
                if (slide.subtitle && typeof this.player.setVideoSubtitle === 'function') {
                    this.player.setVideoSubtitle(slide.subtitle);
                } else if (!this.playerInitialSubtitle && typeof this.player.setVideoSubtitle === 'function') {
                    this.player.setVideoSubtitle(slide.urlMeta.cleanHost);
                }
            }

            // Setup credits-style scrolling if description overflows stage height
            requestAnimationFrame(() => {
                this.setupCreditsAnimation(true);
            });
        }

        /**
         * Render preview image or clean fallback card
         */
        renderSlideMedia(slide) {
            if (!this.mediaBoxElement) return;
            this.mediaBoxElement.textContent = '';

            const showFallback = () => {
                if (this.bgBlurElement) {
                    this.bgBlurElement.classList.remove('visible');
                    this.bgBlurElement.style.backgroundImage = '';
                }
                this.mediaBoxElement.textContent = '';
                const fallback = document.createElement('div');
                fallback.className = 'myetv-link-media-fallback';
                fallback.innerHTML = `<svg viewBox="0 0 24 24" width="44" height="44" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`;

                const hostEl = document.createElement('div');
                hostEl.className = 'myetv-link-media-fallback-host';
                hostEl.textContent = slide.urlMeta.cleanHost;
                fallback.appendChild(hostEl);

                this.mediaBoxElement.appendChild(fallback);
            };

            const safeImage = this.getSafeUrl(slide.image);
            if (!safeImage) {
                showFallback();
                return;
            }

            const img = document.createElement('img');
            img.className = 'myetv-link-media-img';
            img.alt = slide.title || slide.urlMeta.cleanHost;
            img.draggable = false;

            img.onload = () => {
                if (this.isDisposed || this.slides[this.currentIndex] !== slide) return;
                if (this.bgBlurElement) {
                    this.bgBlurElement.style.backgroundImage = `url("${safeImage}")`;
                    this.bgBlurElement.classList.add('visible');
                }
            };

            img.onerror = () => {
                if (this.isDisposed || this.slides[this.currentIndex] !== slide) return;
                showFallback();
            };

            img.src = safeImage;
            this.mediaBoxElement.appendChild(img);
        }

        /**
         * Measure description height and run end-credits scroll animation when overflowing
         */
        setupCreditsAnimation(resetPosition = true) {
            this.stopCreditsAnimation();

            if (!this.descViewportElement || !this.descTrackElement) return;

            const viewportHeight = this.descViewportElement.clientHeight;
            const textHeight = this.descTrackElement.scrollHeight;

            if (viewportHeight <= 0 || textHeight <= viewportHeight + 2) {
                this.creditsNeedsScroll = false;
                this.creditsOffsetY = 0;
                this.descTrackElement.style.transform = 'translate3d(0, 0, 0)';
                this.descViewportElement.classList.add('static-text');
                return;
            }

            this.creditsNeedsScroll = true;
            this.descViewportElement.classList.remove('static-text');

            if (resetPosition) {
                this.creditsOffsetY = 0;
                this.creditsPauseUntil = performance.now() + this.options.creditsStartDelay;
                this.descTrackElement.style.transform = 'translate3d(0, 0, 0)';
            }

            this.creditsLastTick = performance.now();

            const step = (now) => {
                if (this.isDisposed || !this.creditsNeedsScroll) return;

                const dt = Math.max(0, (now - (this.creditsLastTick || now)) / 1000);
                this.creditsLastTick = now;

                // Scroll only while playing and not hovered
                if (this.isPlaying && !this.creditsHovered && now >= this.creditsPauseUntil) {
                    const vpH = this.descViewportElement.clientHeight;
                    const trackH = this.descTrackElement.scrollHeight;
                    const speedMultiplier = this.player.video ? (this.player.video.playbackRate || 1) : 1;

                    this.creditsOffsetY -= this.options.creditsSpeed * speedMultiplier * dt;

                    // Once scrolled past the top edge, pause briefly and restart from bottom like end credits
                    if (this.creditsOffsetY <= -trackH) {
                        this.creditsOffsetY = vpH;
                        this.creditsPauseUntil = now + this.options.creditsEndPause;
                    }

                    this.descTrackElement.style.transform = `translate3d(0, ${this.creditsOffsetY}px, 0)`;
                }

                this.creditsRafId = requestAnimationFrame(step);
            };

            this.creditsRafId = requestAnimationFrame(step);
        }

        stopCreditsAnimation() {
            if (this.creditsRafId !== null) {
                cancelAnimationFrame(this.creditsRafId);
                this.creditsRafId = null;
            }
        }

        /**
         * Open the currently active link safely in a new tab/window
         */
        openCurrentLink() {
            const slide = this.slides[this.currentIndex];
            if (!slide) return false;

            const safeUrl = this.getSafeUrl(slide.url);
            if (!safeUrl) return false;

            window.open(safeUrl, this.options.openLinkTarget, 'noopener,noreferrer');

            this.player.triggerEvent('linkopen', {
                slideIndex: this.currentIndex,
                url: safeUrl,
                title: slide.title
            });

            return true;
        }

        // ============================================================
        // UI SYNC HELPERS
        // ============================================================

        syncTimelineUI() {
            const p = this.player;
            const pct = this.totalDurationMs > 0
                ? Math.max(0, Math.min(100, (this.currentTimeMs / this.totalDurationMs) * 100))
                : 0;

            if (p.progressFilled) p.progressFilled.style.width = `${pct}%`;
            if (p.progressHandle) p.progressHandle.style.left = `${pct}%`;
            if (p.progressBuffer) p.progressBuffer.style.width = '100%';

            if (p.currentTimeEl) {
                p.currentTimeEl.textContent = p.formatTime(this.currentTimeMs / 1000);
            }
            if (p.durationEl) {
                p.durationEl.textContent = p.formatTime(this.totalDurationMs / 1000);
                p.durationEl.classList.remove('encoding-state', 'loading-state');
            }
            if (typeof p.updateLoadingText === 'function') {
                p.updateLoadingText('');
            }
        }

        updatePlayPauseIcons() {
            const p = this.player;
            if (p.playIcon && p.pauseIcon) {
                if (this.isPlaying) {
                    p.playIcon.classList.add('hidden');
                    p.pauseIcon.classList.remove('hidden');
                } else {
                    p.playIcon.classList.remove('hidden');
                    p.pauseIcon.classList.add('hidden');
                }
            }
        }

        updateGalleryNavUI() {
            if (this.galleryCounterEl) {
                this.galleryCounterEl.textContent = `${this.currentIndex + 1} / ${this.slides.length}`;
            }

            const shouldLoop = this.options.loop !== undefined ? this.options.loop : !!this.player.options.loop;
            const canPrev = shouldLoop || this.currentIndex > 0;
            const canNext = shouldLoop || this.currentIndex < this.slides.length - 1;

            if (this.prevArrowBtn) this.prevArrowBtn.disabled = !canPrev;
            if (this.nextArrowBtn) this.nextArrowBtn.disabled = !canNext;
            if (this.galleryPrevBtn) this.galleryPrevBtn.classList.toggle('myetv-btn-disabled', !canPrev);
            if (this.galleryNextBtn) this.galleryNextBtn.classList.toggle('myetv-btn-disabled', !canNext);
        }

        // ============================================================
        // DYNAMIC API & CLEANUP
        // ============================================================

        setLinks(links) {
            this.pause();
            this.options.links = links;
            this.slides = this.parseLinks(links);
            this.currentTimeMs = 0;
            this.isEnded = false;
            this.totalDurationMs = this.slides.length > 0 ? this.slides[this.slides.length - 1].endMs : 0;

            if (this.slides.length > 0) {
                this.renderSlide(0, { instant: true });
                this.createSlideMarkers();
                this.syncTimelineUI();
            }
            return this;
        }

        getCurrentSlideIndex() {
            return this.currentIndex;
        }

        getTotalSlides() {
            return this.slides.length;
        }

        getSlides() {
            return [...this.slides];
        }

        dispose() {
            this.isDisposed = true;
            this.forceHidePlayerLoading();
            this.stopTickLoop();
            this.stopCreditsAnimation();

            // Abort any in-flight scraping requests
            this.activeAbortControllers.forEach((controller) => {
                try {
                    controller.abort();
                } catch (e) {
                    // Ignore abort errors
                }
            });
            this.activeAbortControllers.clear();

            // Remove bound event listeners
            this.boundListeners.forEach(({ target, type, handler, opts }) => {
                target?.removeEventListener(type, handler, opts);
            });
            this.boundListeners = [];

            // Restore overridden player methods
            Object.keys(this.originalMethods).forEach((name) => {
                this.player[name] = this.originalMethods[name];
            });
            this.originalMethods = {};

            // Restore hidden controls
            this.hiddenControlElements.forEach(({ el, prevDisplay }) => {
                if (el) el.style.display = prevDisplay;
            });
            this.hiddenControlElements = [];

            // Remove injected settings menu option if present
            const settingsOption = this.player.container?.querySelector('[data-action="link_security_info"]');
            settingsOption?.remove();

            // Remove injected DOM
            this.stageElement?.remove();
            this.controlsGroup?.remove();
            this.slideMarkersContainer?.remove();

            if (this.player.container) {
                this.player.container.classList.remove('myetv-link-gallery-active');
            }
            if (this.player.video) {
                this.savedVideoSources.forEach((srcEl) => this.player.video.appendChild(srcEl));
                this.savedVideoSources = [];
                this.player.video.style.display = '';
            }
        }
    }

    if (typeof window.registerMYETVPlugin === 'function') {
        window.registerMYETVPlugin('linkgallery', LinkGalleryPlugin);
    }
})();