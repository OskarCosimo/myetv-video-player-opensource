/**
 * MYETV Player - Image & Gallery Player Plugin
 * File: myetv-image-gallery-plugin.js
 * Plays single images or image galleries like a video with timeline, zoom, mouse scrolling/panning, and reset.
 */
(function () {
    'use strict';

    class ImageGalleryPlugin {
        constructor(player, options = {}) {
            this.player = player;

            const defaultSlideDuration =
                options.slideDuration !== undefined ? Number(options.slideDuration) :
                options.duration !== undefined ? Number(options.duration) : 5000;

            this.options = {
                // Media input: string, object, or array of strings/objects
                images: options.images !== undefined
                    ? options.images
                    : (options.image || options.imageUrl || []),

                // Timing (in milliseconds)
                slideDuration: defaultSlideDuration > 0 ? defaultSlideDuration : 5000,
                singleImageDuration: options.singleImageDuration !== undefined
                    ? Number(options.singleImageDuration)
                    : defaultSlideDuration,

                // Playback behavior
                autoplay: options.autoplay !== undefined
                    ? options.autoplay
                    : undefined, // Falls back to player autoplay intent if undefined
                loop: options.loop !== undefined
                    ? options.loop
                    : undefined, // Falls back to player.options.loop if undefined
                pauseOnZoom: options.pauseOnZoom === true,
                hideVideoOnlyControls: options.hideVideoOnlyControls !== false,

                // Stage & Transitions
                aspectRatio: options.aspectRatio || '16 / 9',
                backgroundColor: options.backgroundColor || '#000',
                transition: options.transition || 'fade', // 'fade' | 'slide' | 'none'
                transitionDuration: options.transitionDuration !== undefined
                    ? Number(options.transitionDuration)
                    : 350,

                // Gallery navigation UI
                showNavArrows: options.showNavArrows !== false,
                showCounter: options.showCounter !== false,
                showSlideMarkers: options.showSlideMarkers !== false,
                updateTitleOnSlide: options.updateTitleOnSlide !== false,

                // Zoom & Mouse scroll/pan options
                enableZoom: options.enableZoom !== false,
                showZoomControls: options.showZoomControls !== false,
                minZoom: options.minZoom !== undefined ? Math.max(1, Number(options.minZoom)) : 1,
                maxZoom: options.maxZoom !== undefined ? Math.max(1, Number(options.maxZoom)) : 5,
                zoomStep: options.zoomStep !== undefined ? Math.max(0.1, Number(options.zoomStep)) : 0.5,
                wheelZoomStep: options.wheelZoomStep !== undefined ? Math.max(0.05, Number(options.wheelZoomStep)) : 0.2,
                wheelPan: options.wheelPan !== false,        // Mouse wheel scrolls image when zoomed
                wheelZoom: options.wheelZoom === true,       // True: wheel always zooms; False: wheel scrolls when zoomed (Ctrl+Wheel still zooms)
                doubleClickZoom: options.doubleClickZoom === true,
                resetZoomOnSlideChange: options.resetZoomOnSlideChange !== false,

                // Keyboard shortcuts (+, -, 0, Shift+Arrows)
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
            this.currentImageLoaded = false;
            this._allowLoadingOverlay = false;
            this.loadingDelayTimer = null;

            // Zoom & Pan state
            this.zoom = 1;
            this.panX = 0;
            this.panY = 0;
            this.isDragging = false;
            this.dragMoved = false;
            this.dragStartX = 0;
            this.dragStartY = 0;
            this.panStartX = 0;
            this.panStartY = 0;
            this.pinchStartDist = 0;
            this.pinchStartZoom = 1;

            // DOM references
            this.stageElement = null;
            this.viewportElement = null;
            this.activeImg = null;
            this.prevArrowBtn = null;
            this.nextArrowBtn = null;
            this.zoomBadge = null;
            this.slideMarkersContainer = null;

            // Controlbar buttons
            this.galleryPrevBtn = null;
            this.galleryNextBtn = null;
            this.galleryCounterEl = null;
            this.zoomOutBtn = null;
            this.zoomResetBtn = null;
            this.zoomInBtn = null;

            // Backup for overridden player methods & hidden controls
            this.originalMethods = {};
            this.hiddenControlElements = [];
            this.savedVideoSources = [];
            this.boundListeners = [];
            this.initialTitle = this.player.options.videoTitle || '';
            this.initialSubtitle = this.player.options.videoSubtitle || '';
        }

        /**
         * Sanitize URL using main player's sanitizer when available
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
         * Force-clear the player loading overlay safely
         */
        forceHidePlayerLoading() {
            if (this.loadingDelayTimer) {
                clearTimeout(this.loadingDelayTimer);
                this.loadingDelayTimer = null;
            }
            this._allowLoadingOverlay = false;
            this.player.hideLoading();
            if (this.player.loadingOverlay) {
                this.player.loadingOverlay.classList.remove('active');
            }
        }

        /**
         * Normalize input images into a standardized slides array with timeline offsets
         */
        parseSlides(input) {
            let list = [];
            if (typeof input === 'string' || (input && !Array.isArray(input) && typeof input === 'object')) {
                list = [input];
            } else if (Array.isArray(input)) {
                list = input;
            }

            const isSingle = list.length === 1;
            const parsed = [];
            let accumulatedMs = 0;

            list.forEach((item, idx) => {
                let rawSrc = '';
                let title = '';
                let subtitle = '';
                let alt = '';
                let duration = isSingle ? this.options.singleImageDuration : this.options.slideDuration;

                if (typeof item === 'string') {
                    rawSrc = item;
                } else if (item && typeof item === 'object') {
                    rawSrc = item.src || item.url || '';
                    title = item.title || '';
                    subtitle = item.subtitle || '';
                    alt = item.alt || title || `Slide ${idx + 1}`;
                    if (item.duration !== undefined && Number(item.duration) > 0) {
                        duration = Number(item.duration);
                    }
                }

                const safeSrc = this.getSafeUrl(rawSrc);
                if (!safeSrc) return;

                if (!duration || isNaN(duration) || duration <= 0) {
                    duration = 5000;
                }

                parsed.push({
                    index: parsed.length,
                    src: safeSrc,
                    title: this.formatText(title),
                    subtitle: this.formatText(subtitle),
                    alt: this.formatText(alt) || `Image ${parsed.length + 1}`,
                    duration: duration,
                    startMs: accumulatedMs,
                    endMs: accumulatedMs + duration
                });

                accumulatedMs += duration;
            });

            return parsed;
        }

        /**
         * Plugin entry point called by MYETVvideoplayer
         */
        setup() {
            this.slides = this.parseSlides(this.options.images);

            if (this.slides.length === 0) {
                if (this.player.options.debug) {
                    console.warn('🖼️ ImageGalleryPlugin: No valid images provided.');
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

            // Clear any loading overlay triggered by native video initialization
            this.forceHidePlayerLoading();

            // Load initial slide
            this.renderSlide(0, { instant: true });
            this.syncTimelineUI();
            this.updateZoomUI();

            // Handle autoplay when player finishes ready setup
            const onReady = () => {
                if (this.isDisposed) return;

                if (this.currentImageLoaded) {
                    this.forceHidePlayerLoading();
                }
                this.syncTimelineUI();
                this.createSlideMarkers();

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
         * Inject scoped CSS using the player's existing theme variables
         */
        injectStyles() {
            if (document.getElementById('myetv-image-gallery-styles')) return;

            const style = document.createElement('style');
            style.id = 'myetv-image-gallery-styles';
            style.textContent = `
                .video-wrapper.myetv-image-gallery-active {
                    background: #000;
                    user-select: none;
                    -webkit-user-select: none;
                }

                .video-wrapper.myetv-image-gallery-active .video-player {
                    display: none !important;
                }

                .myetv-image-gallery-stage {
                    position: relative;
                    width: 100%;
                    min-height: 300px;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1;
                    touch-action: pan-y;
                }

                .myetv-image-gallery-stage.is-zoomed {
                    touch-action: none;
                }

                .video-container:fullscreen .myetv-image-gallery-stage,
                .video-container:-webkit-full-screen .myetv-image-gallery-stage,
                .video-container:-moz-full-screen .myetv-image-gallery-stage,
                .video-wrapper:fullscreen .myetv-image-gallery-stage,
                .video-wrapper:-webkit-full-screen .myetv-image-gallery-stage {
                    height: 100vh !important;
                    aspect-ratio: auto !important;
                }

                .myetv-image-gallery-viewport {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }

                .myetv-image-gallery-img {
                    max-width: 100%;
                    max-height: 100%;
                    width: auto;
                    height: auto;
                    object-fit: contain;
                    display: block;
                    transform-origin: center center;
                    will-change: transform, opacity;
                    pointer-events: none;
                    user-select: none;
                    -webkit-user-drag: none;
                }

                .myetv-image-gallery-img.with-zoom-transition {
                    transition: transform 0.2s ease-out, opacity 0.35s ease;
                }

                .myetv-image-gallery-stage.is-zoomed {
                    cursor: grab;
                }

                .myetv-image-gallery-stage.is-zoomed.is-dragging {
                    cursor: grabbing;
                }

                /* Floating gallery navigation arrows */
                .myetv-gallery-nav-arrow {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    background: rgba(0, 0, 0, 0.55);
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

                .myetv-gallery-nav-arrow.prev {
                    left: 14px;
                }

                .myetv-gallery-nav-arrow.next {
                    right: 14px;
                }

                .video-wrapper.has-controls .myetv-gallery-nav-arrow,
                .myetv-image-gallery-stage:hover .myetv-gallery-nav-arrow {
                    opacity: 1;
                    visibility: visible;
                }

                .myetv-gallery-nav-arrow:hover {
                    background: rgba(0, 0, 0, 0.85);
                    border-color: var(--player-primary-color, goldenrod);
                    color: var(--player-primary-color, goldenrod);
                    transform: translateY(-50%) scale(1.08);
                }

                .myetv-gallery-nav-arrow:disabled {
                    opacity: 0.25 !important;
                    cursor: not-allowed;
                }

                /* Zoom indicator badge */
                .myetv-gallery-zoom-badge {
                    position: absolute;
                    top: 65px;
                    left: 16px;
                    background: rgba(0, 0, 0, 0.72);
                    color: #fff;
                    font-size: 12px;
                    font-weight: 600;
                    padding: 4px 10px;
                    border-radius: 14px;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    z-index: 6;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.25s ease;
                    font-variant-numeric: tabular-nums;
                }

                .myetv-gallery-zoom-badge.visible {
                    opacity: 1;
                }

                /* Control bar additions */
                .myetv-gallery-controls-group {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .myetv-gallery-counter {
                    color: var(--player-text-secondary, rgba(255, 255, 255, 0.85));
                    font-size: 12px;
                    font-weight: 500;
                    padding: 0 6px;
                    font-variant-numeric: tabular-nums;
                    white-space: nowrap;
                }

                .myetv-zoom-reset-btn {
                    font-size: 12px !important;
                    font-variant-numeric: tabular-nums;
                    padding: 6px 8px !important;
                    gap: 4px !important;
                }

                .myetv-zoom-reset-btn.zoom-active {
                    color: var(--player-primary-color, goldenrod) !important;
                }

                .control-btn.myetv-btn-disabled {
                    opacity: 0.35;
                    cursor: not-allowed;
                    pointer-events: none;
                }

                /* Slide boundary markers on progress bar */
                .myetv-slide-markers {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 2;
                }

                .myetv-slide-marker {
                    position: absolute;
                    top: 0;
                    height: 100%;
                    width: 2px;
                    background: rgba(0, 0, 0, 0.65);
                    transform: translateX(-50%);
                }

                .myetv-gallery-error-msg {
                    position: absolute;
                    color: rgba(255, 255, 255, 0.75);
                    font-size: 14px;
                    text-align: center;
                    padding: 16px;
                    pointer-events: none;
                }

                @media (max-width: 550px) {
                    .myetv-gallery-nav-arrow {
                        width: 34px;
                        height: 34px;
                    }
                    .myetv-gallery-counter {
                        font-size: 11px;
                        padding: 0 3px;
                    }
                    .myetv-zoom-reset-btn .zoom-percent-text {
                        display: none;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        /**
         * Disable native <video> element loading/playback while gallery plugin is active
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
                this.player.container.classList.add('myetv-image-gallery-active');
            }
        }

        /**
         * Create the image stage inside the player's .video-wrapper
         */
        createStage() {
            const container = this.player.container;
            if (!container) return;

            this.stageElement = document.createElement('div');
            this.stageElement.className = 'myetv-image-gallery-stage';
            this.stageElement.style.backgroundColor = this.options.backgroundColor;
            if (this.options.aspectRatio && this.options.aspectRatio !== 'auto') {
                this.stageElement.style.aspectRatio = this.options.aspectRatio;
            }

            this.viewportElement = document.createElement('div');
            this.viewportElement.className = 'myetv-image-gallery-viewport';
            this.stageElement.appendChild(this.viewportElement);

            this.zoomBadge = document.createElement('div');
            this.zoomBadge.className = 'myetv-gallery-zoom-badge';
            this.zoomBadge.textContent = '100%';
            this.stageElement.appendChild(this.zoomBadge);

            // Floating arrows for multi-image galleries
            if (this.slides.length > 1 && this.options.showNavArrows) {
                this.prevArrowBtn = document.createElement('button');
                this.prevArrowBtn.type = 'button';
                this.prevArrowBtn.className = 'myetv-gallery-nav-arrow prev';
                this.prevArrowBtn.setAttribute('aria-label', 'Previous image');
                this.prevArrowBtn.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>`;

                this.nextArrowBtn = document.createElement('button');
                this.nextArrowBtn.type = 'button';
                this.nextArrowBtn.className = 'myetv-gallery-nav-arrow next';
                this.nextArrowBtn.setAttribute('aria-label', 'Next image');
                this.nextArrowBtn.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>`;

                this.stageElement.appendChild(this.prevArrowBtn);
                this.stageElement.appendChild(this.nextArrowBtn);
            }

            // Insert stage right after <video> (before controls and top bar)
            if (this.player.video && this.player.video.nextSibling) {
                container.insertBefore(this.stageElement, this.player.video.nextSibling);
            } else {
                container.appendChild(this.stageElement);
            }
        }

        /**
         * Add gallery and zoom controls to the player's bottom control bar
         */
        createControlBarUI() {
            const controls = this.player.controls;
            if (!controls) return;

            // Hide audio/video-only controls if configured
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
            group.className = 'myetv-gallery-controls-group';

            // Gallery Prev / Counter / Next (only if more than 1 image)
            if (this.slides.length > 1) {
                this.galleryPrevBtn = document.createElement('button');
                this.galleryPrevBtn.type = 'button';
                this.galleryPrevBtn.className = 'control-btn gallery-prev-btn';
                this.galleryPrevBtn.title = 'Previous image';
                this.galleryPrevBtn.innerHTML = `<span class="icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></span>`;
                group.appendChild(this.galleryPrevBtn);

                if (this.options.showCounter) {
                    this.galleryCounterEl = document.createElement('span');
                    this.galleryCounterEl.className = 'myetv-gallery-counter';
                    this.galleryCounterEl.textContent = `1 / ${this.slides.length}`;
                    group.appendChild(this.galleryCounterEl);
                }

                this.galleryNextBtn = document.createElement('button');
                this.galleryNextBtn.type = 'button';
                this.galleryNextBtn.className = 'control-btn gallery-next-btn';
                this.galleryNextBtn.title = 'Next image';
                this.galleryNextBtn.innerHTML = `<span class="icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></span>`;
                group.appendChild(this.galleryNextBtn);
            }

            // Zoom Controls: Zoom Out (-), Reset (100%), Zoom In (+)
            if (this.options.enableZoom && this.options.showZoomControls) {
                this.zoomOutBtn = document.createElement('button');
                this.zoomOutBtn.type = 'button';
                this.zoomOutBtn.className = 'control-btn myetv-zoom-out-btn';
                this.zoomOutBtn.title = 'Zoom Out (-)';
                this.zoomOutBtn.innerHTML = `<span class="icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z"/></svg></span>`;
                group.appendChild(this.zoomOutBtn);

                this.zoomResetBtn = document.createElement('button');
                this.zoomResetBtn.type = 'button';
                this.zoomResetBtn.className = 'control-btn myetv-zoom-reset-btn';
                this.zoomResetBtn.title = 'Reset Zoom (0)';
                this.zoomResetBtn.innerHTML = `
                    <span class="icon"><svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg></span>
                    <span class="zoom-percent-text">100%</span>
                `;
                group.appendChild(this.zoomResetBtn);

                this.zoomInBtn = document.createElement('button');
                this.zoomInBtn.type = 'button';
                this.zoomInBtn.className = 'control-btn myetv-zoom-in-btn';
                this.zoomInBtn.title = 'Zoom In (+)';
                this.zoomInBtn.innerHTML = `<span class="icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm.5-7H9v2H7v1h2v2h1v-2h2V9h-2z"/></svg></span>`;
                group.appendChild(this.zoomInBtn);
            }

            if (group.children.length > 0) {
                controlsRight.insertBefore(group, anchor);
            }
            this.controlsGroup = group;
        }

        /**
         * Draw subtle slide divider markers on the player's progress bar
         */
        createSlideMarkers() {
            if (!this.options.showSlideMarkers || this.slides.length <= 1) return;
            const progressBar = this.player.controls?.querySelector('.progress-bar');
            if (!progressBar || this.totalDurationMs <= 0) return;

            if (this.slideMarkersContainer) {
                this.slideMarkersContainer.remove();
            }

            const markers = document.createElement('div');
            markers.className = 'myetv-slide-markers';

            for (let i = 1; i < this.slides.length; i++) {
                const pct = (this.slides[i].startMs / this.totalDurationMs) * 100;
                const marker = document.createElement('div');
                marker.className = 'myetv-slide-marker';
                marker.style.left = `${pct}%`;
                markers.appendChild(marker);
            }

            progressBar.appendChild(markers);
            this.slideMarkersContainer = markers;
        }

        /**
         * Override player methods so the player controls, auto-hide, and timeline drive the gallery
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

            // Prevent native <video> loadstart/waiting events from showing the loading overlay
            override('showLoading', () => {
                if (self._allowLoadingOverlay && !self.currentImageLoaded && self.originalMethods.showLoading) {
                    self.originalMethods.showLoading.call(p);
                }
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
                    const slideLabel = slide.title ? `${slide.title}` : `${slide.index + 1}/${self.slides.length}`;
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

            // Auto-hide overrides: base visibility on self.isPlaying instead of video.paused
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
                    zoom: self.zoom
                };
            });
        }

        /**
         * Bind click, drag/pan, wheel, touch, and UI button events
         */
        bindStageEvents() {
            const add = (target, type, handler, opts) => {
                if (!target) return;
                target.addEventListener(type, handler, opts);
                this.boundListeners.push({ target, type, handler, opts });
            };

            // Gallery navigation buttons
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

            // Zoom buttons
            add(this.zoomInBtn, 'click', (e) => {
                e.stopPropagation();
                this.zoomIn();
            });
            add(this.zoomOutBtn, 'click', (e) => {
                e.stopPropagation();
                this.zoomOut();
            });
            add(this.zoomResetBtn, 'click', (e) => {
                e.stopPropagation();
                this.resetZoom();
            });

            // Mouse drag to pan when zoomed
            add(this.stageElement, 'mousedown', (e) => {
                if (e.button !== 0 || e.target.closest('button')) return;

                this.dragMoved = false;
                if (this.zoom > 1) {
                    this.isDragging = true;
                    this.dragStartX = e.clientX;
                    this.dragStartY = e.clientY;
                    this.panStartX = this.panX;
                    this.panStartY = this.panY;
                    this.stageElement.classList.add('is-dragging');
                    if (this.activeImg) {
                        this.activeImg.classList.remove('with-zoom-transition');
                    }
                    e.preventDefault();
                }
            });

            add(document, 'mousemove', (e) => {
                if (!this.isDragging) return;
                const dx = e.clientX - this.dragStartX;
                const dy = e.clientY - this.dragStartY;

                if (Math.hypot(dx, dy) > 4) {
                    this.dragMoved = true;
                }

                this.panX = this.panStartX + dx;
                this.panY = this.panStartY + dy;
                this.clampPan();
                this.applyZoomTransform();
            });

            add(document, 'mouseup', () => {
                if (!this.isDragging) return;
                this.isDragging = false;
                this.stageElement?.classList.remove('is-dragging');
            });

            // Click on stage to toggle play/pause (ignored if user just dragged)
            add(this.stageElement, 'click', (e) => {
                if (e.target.closest('button')) return;
                if (this.dragMoved) {
                    this.dragMoved = false;
                    return;
                }
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

            // Optional double click zoom
            if (this.options.enableZoom && this.options.doubleClickZoom) {
                add(this.stageElement, 'dblclick', (e) => {
                    if (e.target.closest('button')) return;
                    if (this.zoom > 1) {
                        this.resetZoom();
                    } else {
                        this.setZoom(Math.min(this.options.maxZoom, 2), e.clientX, e.clientY);
                    }
                });
            }

            // Mouse wheel: scroll/pan when zoomed, or zoom if wheelZoom / Ctrl+Wheel
            add(this.stageElement, 'wheel', (e) => {
                if (!this.options.enableZoom) return;

                const shouldZoomWithWheel = this.options.wheelZoom || e.ctrlKey || e.metaKey;

                if (shouldZoomWithWheel) {
                    e.preventDefault();
                    const delta = e.deltaY < 0 ? this.options.wheelZoomStep : -this.options.wheelZoomStep;
                    this.setZoom(this.zoom + delta, e.clientX, e.clientY);
                    return;
                }

                if (this.zoom > 1 && this.options.wheelPan) {
                    e.preventDefault();
                    const bounds = this.getPanBounds();
                    let dx = e.deltaX;
                    let dy = e.deltaY;

                    // Allow vertical mouse wheel to scroll horizontally on wide panoramas or with Shift
                    if ((e.shiftKey || (bounds.maxY === 0 && bounds.maxX > 0)) && dx === 0) {
                        dx = dy;
                        dy = 0;
                    }

                    if (this.activeImg) {
                        this.activeImg.classList.remove('with-zoom-transition');
                    }

                    this.panX -= dx;
                    this.panY -= dy;
                    this.clampPan();
                    this.applyZoomTransform();
                }
            }, { passive: false });

            // Touch: 1-finger pan when zoomed, 2-finger pinch-to-zoom, tap to toggle controls/play
            add(this.stageElement, 'touchstart', (e) => {
                if (e.target.closest('button')) return;
                this.dragMoved = false;

                if (e.touches.length === 2 && this.options.enableZoom) {
                    this.isDragging = false;
                    this.pinchStartDist = this.getTouchDistance(e.touches[0], e.touches[1]);
                    this.pinchStartZoom = this.zoom;
                    if (this.activeImg) {
                        this.activeImg.classList.remove('with-zoom-transition');
                    }
                } else if (e.touches.length === 1 && this.zoom > 1) {
                    this.isDragging = true;
                    this.dragStartX = e.touches[0].clientX;
                    this.dragStartY = e.touches[0].clientY;
                    this.panStartX = this.panX;
                    this.panStartY = this.panY;
                    if (this.activeImg) {
                        this.activeImg.classList.remove('with-zoom-transition');
                    }
                }
            }, { passive: true });

            add(this.stageElement, 'touchmove', (e) => {
                if (e.touches.length === 2 && this.options.enableZoom && this.pinchStartDist > 0) {
                    if (e.cancelable) e.preventDefault();
                    this.dragMoved = true;
                    const dist = this.getTouchDistance(e.touches[0], e.touches[1]);
                    const center = {
                        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
                    };
                    this.setZoom(this.pinchStartZoom * (dist / this.pinchStartDist), center.x, center.y, false);
                } else if (e.touches.length === 1 && this.isDragging && this.zoom > 1) {
                    if (e.cancelable) e.preventDefault();
                    const dx = e.touches[0].clientX - this.dragStartX;
                    const dy = e.touches[0].clientY - this.dragStartY;
                    if (Math.hypot(dx, dy) > 5) {
                        this.dragMoved = true;
                    }
                    this.panX = this.panStartX + dx;
                    this.panY = this.panStartY + dy;
                    this.clampPan();
                    this.applyZoomTransform();
                }
            }, { passive: false });

            add(this.stageElement, 'touchend', (e) => {
                if (e.touches.length === 0) {
                    this.isDragging = false;
                    this.pinchStartDist = 0;
                }
            }, { passive: true });

            // Re-clamp pan on window resize / fullscreen change
            const onResize = () => {
                this.clampPan();
                this.applyZoomTransform();
            };
            add(window, 'resize', onResize);
            add(document, 'fullscreenchange', onResize);
        }

        /**
         * Bind optional keyboard shortcuts for zoom (+, -, 0) and slide navigation
         */
        bindKeyboardEvents() {
            if (!this.options.keyboardControls) return;

            const onKeyDown = (e) => {
                if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

                if (this.options.enableZoom) {
                    if (e.key === '+' || e.key === '=' || e.code === 'NumpadAdd') {
                        e.preventDefault();
                        this.zoomIn();
                        return;
                    }
                    if (e.key === '-' || e.code === 'NumpadSubtract') {
                        e.preventDefault();
                        this.zoomOut();
                        return;
                    }
                    if (e.key === '0' || e.code === 'Numpad0') {
                        e.preventDefault();
                        this.resetZoom();
                        return;
                    }
                }

                if (this.slides.length > 1 && e.shiftKey) {
                    if (e.code === 'ArrowRight') {
                        e.preventDefault();
                        this.nextSlide();
                    } else if (e.code === 'ArrowLeft') {
                        e.preventDefault();
                        this.prevSlide();
                    }
                }
            };

            document.addEventListener('keydown', onKeyDown);
            this.boundListeners.push({ target: document, type: 'keydown', handler: onKeyDown });
        }

        getTouchDistance(t1, t2) {
            return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        }

        // ============================================================
        // PLAYBACK ENGINE (behaves like HTML5 video)
        // ============================================================

        play() {
            if (this.isDisposed || this.slides.length === 0) return;

            // If at the end, restart from beginning just like HTML5 <video>
            if (this.isEnded || this.currentTimeMs >= this.totalDurationMs) {
                this.currentTimeMs = 0;
                this.isEnded = false;
                if (this.currentIndex !== 0) {
                    this.renderSlide(0, { instant: true });
                }
            }

            if (this.currentImageLoaded) {
                this.forceHidePlayerLoading();
            }

            if (this.isPlaying) return;

            this.isPlaying = true;
            this.lastTickTime = performance.now();

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

                // Hold countdown while current slide image is still downloading
                if (this.currentImageLoaded && !this.player.isUserSeeking) {
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
        // GALLERY SLIDE NAVIGATION & RENDERING
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
            if (!slide || !this.viewportElement) return;

            const prevIndex = this.currentIndex;
            this.currentIndex = index;

            if (this.loadingDelayTimer) {
                clearTimeout(this.loadingDelayTimer);
                this.loadingDelayTimer = null;
            }

            if (this.options.resetZoomOnSlideChange) {
                this.resetZoom(false);
            }

            // Clear previous error notice if any
            const oldErr = this.viewportElement.querySelector('.myetv-gallery-error-msg');
            if (oldErr) oldErr.remove();

            const newImg = document.createElement('img');
            newImg.className = 'myetv-image-gallery-img';
            newImg.alt = slide.alt;
            newImg.draggable = false;

            const transitionDuration = instant || this.options.transition === 'none'
                ? 0
                : this.options.transitionDuration;

            if (transitionDuration > 0) {
                newImg.style.opacity = '0';
                newImg.style.transition = `opacity ${transitionDuration}ms ease, transform 0.2s ease-out`;
                if (this.options.transition === 'slide') {
                    const dir = index >= prevIndex ? '30px' : '-30px';
                    newImg.style.transform = `translate3d(${dir}, 0, 0)`;
                    newImg.style.transition = `opacity ${transitionDuration}ms ease, transform ${transitionDuration}ms ease`;
                }
            }

            this.currentImageLoaded = false;
            const previousImg = this.activeImg;
            this.activeImg = newImg;
            this.viewportElement.appendChild(newImg);

            let finalized = false;

            const finalizeImageLoad = () => {
                if (finalized || this.isDisposed || this.activeImg !== newImg) return;
                finalized = true;

                this.currentImageLoaded = true;
                this.forceHidePlayerLoading();

                requestAnimationFrame(() => {
                    newImg.style.opacity = '1';
                    this.applyZoomTransform();
                });

                if (previousImg && previousImg !== newImg) {
                    if (transitionDuration > 0) {
                        previousImg.style.position = 'absolute';
                        previousImg.style.opacity = '0';
                        setTimeout(() => {
                            if (previousImg.parentNode) previousImg.remove();
                        }, transitionDuration);
                    } else {
                        previousImg.remove();
                    }
                }

                // Preload next slide for smooth playback
                const nextSlide = this.slides[index + 1];
                if (nextSlide) {
                    const preloader = new Image();
                    preloader.src = nextSlide.src;
                }
            };

            newImg.onload = finalizeImageLoad;

            newImg.onerror = () => {
                if (finalized || this.isDisposed || this.activeImg !== newImg) return;
                finalized = true;

                this.currentImageLoaded = true;
                this.forceHidePlayerLoading();
                if (previousImg && previousImg.parentNode) previousImg.remove();

                const errDiv = document.createElement('div');
                errDiv.className = 'myetv-gallery-error-msg';
                errDiv.textContent = 'Image failed to load';
                this.viewportElement.appendChild(errDiv);
            };

            newImg.src = slide.src;
            if (newImg.complete && newImg.naturalWidth > 0) {
                finalizeImageLoad();
            } else {
                // Delay spinner by 100ms so cached images never trigger a stuck loading overlay
                this.loadingDelayTimer = setTimeout(() => {
                    this.loadingDelayTimer = null;
                    if (!this.isDisposed && !this.currentImageLoaded && this.activeImg === newImg) {
                        this._allowLoadingOverlay = true;
                        this.player.showLoading();
                    }
                }, 100);
            }

            // Update counter & arrow states
            this.updateGalleryNavUI();

            // Update Top Bar title/subtitle if slide has custom metadata
            if (this.options.updateTitleOnSlide) {
                if (slide.title) {
                    this.player.setVideoTitle(slide.title);
                } else if (this.initialTitle) {
                    this.player.setVideoTitle(this.initialTitle);
                }

                if (slide.subtitle) {
                    this.player.setVideoSubtitle(slide.subtitle);
                } else if (this.initialSubtitle) {
                    this.player.setVideoSubtitle(this.initialSubtitle);
                }
            }

            this.player.triggerEvent('slidechange', {
                slideIndex: index,
                totalSlides: this.slides.length,
                slide: slide
            });
        }

        // ============================================================
        // ZOOM & MOUSE SCROLL / PAN ENGINE
        // ============================================================

        zoomIn() {
            if (!this.options.enableZoom) return this.zoom;
            return this.setZoom(this.zoom + this.options.zoomStep);
        }

        zoomOut() {
            if (!this.options.enableZoom) return this.zoom;
            return this.setZoom(this.zoom - this.options.zoomStep);
        }

        resetZoom(animate = true) {
            this.zoom = this.options.minZoom;
            this.panX = 0;
            this.panY = 0;

            if (this.activeImg) {
                if (animate) {
                    this.activeImg.classList.add('with-zoom-transition');
                } else {
                    this.activeImg.classList.remove('with-zoom-transition');
                }
            }

            this.applyZoomTransform();
            this.updateZoomUI();

            this.player.triggerEvent('zoomchange', { zoom: this.zoom, panX: 0, panY: 0 });
            return this.zoom;
        }

        setZoom(targetZoom, clientX = null, clientY = null, animate = true) {
            if (!this.options.enableZoom) return this.zoom;

            const oldZoom = this.zoom;
            const clampedZoom = Math.max(
                this.options.minZoom,
                Math.min(this.options.maxZoom, Math.round(targetZoom * 100) / 100)
            );

            if (clampedZoom === oldZoom) {
                this.clampPan();
                this.applyZoomTransform();
                return this.zoom;
            }

            // Pause playback on zoom if configured
            if (this.options.pauseOnZoom && clampedZoom > 1 && this.isPlaying) {
                this.pause();
            }

            // Zoom toward cursor/pinch origin if coordinates provided
            if (clientX !== null && clientY !== null && this.stageElement) {
                const rect = this.stageElement.getBoundingClientRect();
                const offsetX = clientX - (rect.left + rect.width / 2);
                const offsetY = clientY - (rect.top + rect.height / 2);
                const ratio = clampedZoom / oldZoom;

                this.panX = offsetX - (offsetX - this.panX) * ratio;
                this.panY = offsetY - (offsetY - this.panY) * ratio;
            } else {
                const ratio = clampedZoom / oldZoom;
                this.panX *= ratio;
                this.panY *= ratio;
            }

            this.zoom = clampedZoom;
            if (this.zoom <= 1) {
                this.panX = 0;
                this.panY = 0;
            } else {
                this.clampPan();
            }

            if (this.activeImg) {
                if (animate) {
                    this.activeImg.classList.add('with-zoom-transition');
                } else {
                    this.activeImg.classList.remove('with-zoom-transition');
                }
            }

            this.applyZoomTransform();
            this.updateZoomUI();

            this.player.triggerEvent('zoomchange', {
                zoom: this.zoom,
                panX: this.panX,
                panY: this.panY
            });

            return this.zoom;
        }

        getZoom() {
            return this.zoom;
        }

        /**
         * Calculate max allowable pan in X and Y so the image never scrolls out of bounds
         */
        getPanBounds() {
            if (!this.viewportElement || !this.activeImg || this.zoom <= 1) {
                return { maxX: 0, maxY: 0 };
            }

            const vpRect = this.viewportElement.getBoundingClientRect();
            const baseW = this.activeImg.offsetWidth || vpRect.width;
            const baseH = this.activeImg.offsetHeight || vpRect.height;

            const scaledW = baseW * this.zoom;
            const scaledH = baseH * this.zoom;

            return {
                maxX: Math.max(0, (scaledW - vpRect.width) / 2),
                maxY: Math.max(0, (scaledH - vpRect.height) / 2)
            };
        }

        clampPan() {
            const { maxX, maxY } = this.getPanBounds();
            this.panX = Math.max(-maxX, Math.min(maxX, this.panX));
            this.panY = Math.max(-maxY, Math.min(maxY, this.panY));
        }

        applyZoomTransform() {
            if (this.activeImg) {
                this.activeImg.style.transform = `translate3d(${this.panX}px, ${this.panY}px, 0) scale(${this.zoom})`;
            }
            if (this.stageElement) {
                this.stageElement.classList.toggle('is-zoomed', this.zoom > 1);
            }
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

        updateZoomUI() {
            const pctText = `${Math.round(this.zoom * 100)}%`;

            if (this.zoomBadge) {
                this.zoomBadge.textContent = pctText;
                this.zoomBadge.classList.toggle('visible', this.zoom > 1);
            }

            if (this.zoomResetBtn) {
                const label = this.zoomResetBtn.querySelector('.zoom-percent-text');
                if (label) label.textContent = pctText;
                this.zoomResetBtn.classList.toggle('zoom-active', this.zoom > 1);
                this.zoomResetBtn.classList.toggle('myetv-btn-disabled', this.zoom <= this.options.minZoom);
            }

            if (this.zoomOutBtn) {
                this.zoomOutBtn.classList.toggle('myetv-btn-disabled', this.zoom <= this.options.minZoom);
            }
            if (this.zoomInBtn) {
                this.zoomInBtn.classList.toggle('myetv-btn-disabled', this.zoom >= this.options.maxZoom);
            }
        }

        // ============================================================
        // DYNAMIC API & CLEANUP
        // ============================================================

        setImages(images) {
            this.pause();
            this.options.images = images;
            this.slides = this.parseSlides(images);
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

            // Remove all bound event listeners
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

            // Remove injected DOM
            this.stageElement?.remove();
            this.controlsGroup?.remove();
            this.slideMarkersContainer?.remove();

            if (this.player.container) {
                this.player.container.classList.remove('myetv-image-gallery-active');
            }
            if (this.player.video) {
                this.savedVideoSources.forEach((srcEl) => this.player.video.appendChild(srcEl));
                this.savedVideoSources = [];
                this.player.video.style.display = '';
            }
        }
    }

    if (typeof window.registerMYETVPlugin === 'function') {
        window.registerMYETVPlugin('imagegallery', ImageGalleryPlugin);
    }
})();
