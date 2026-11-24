// myetv-text-gallery-plugin.js
/**
 * MYETV Player - Text & Gallery Player Plugin
 * File: myetv-text-gallery-plugin.js
 * Turns single text blocks or text galleries into readable cards with safe HTML formatting,
 * automatic URL linking, duration-aware credits-style vertical scrolling, interactive scrollbar,
 * and text zoom/reset controls.
 */
(function () {
    'use strict';

    class TextGalleryPlugin {
        constructor(player, options = {}) {
            this.player = player;

            const defaultSlideDuration =
                options.slideDuration !== undefined ? Number(options.slideDuration) :
                    options.duration !== undefined ? Number(options.duration) : 8000;

            const rawItems = options.texts !== undefined ? options.texts :
                (options.items !== undefined ? options.items :
                    (options.slides !== undefined ? options.slides :
                        (options.text !== undefined ? options.text :
                            (options.content !== undefined ? options.content : null))));

            this.options = {
                // Input links/texts: string, object, or array of strings/objects
                texts: rawItems,

                // Global fallback metadata (also supports single-text config via title + description)
                title: options.title !== undefined ? String(options.title) : '',
                subtitle: options.subtitle !== undefined ? String(options.subtitle) : '',
                description: options.description !== undefined ? String(options.description) : '',

                // Text rendering & formatting
                allowHtml: options.allowHtml !== false,
                autoLink: options.autoLink !== false,
                openLinkTarget: options.openLinkTarget || '_blank',

                // Font size & zoom controls
                baseFontSize: options.baseFontSize !== undefined ? Math.max(11, Number(options.baseFontSize)) : 16,
                fontScale: options.fontScale !== undefined ? Number(options.fontScale) : 1,
                minFontScale: options.minFontScale !== undefined ? Number(options.minFontScale) : 0.7,
                maxFontScale: options.maxFontScale !== undefined ? Number(options.maxFontScale) : 2.0,
                fontScaleStep: options.fontScaleStep !== undefined ? Number(options.fontScaleStep) : 0.1,
                showZoomControls: options.showZoomControls !== false,
                showSettingsTextControls: options.showSettingsTextControls !== false,

                // Timing (in milliseconds)
                slideDuration: defaultSlideDuration > 0 ? defaultSlideDuration : 8000,
                singleTextDuration: options.singleTextDuration !== undefined
                    ? Number(options.singleTextDuration)
                    : defaultSlideDuration,

                // Playback behavior
                autoplay: options.autoplay !== undefined ? options.autoplay : undefined,
                loop: options.loop !== undefined ? options.loop : undefined,
                hideVideoOnlyControls: options.hideVideoOnlyControls !== false,

                // Stage & Transitions
                aspectRatio: options.aspectRatio || '16 / 9',
                backgroundColor: options.backgroundColor || '#0d1117',
                textAlign: options.textAlign || 'left', // 'left' | 'center' | 'justify'
                transition: options.transition || 'fade', // 'fade' | 'slide' | 'none'
                transitionDuration: options.transitionDuration !== undefined
                    ? Number(options.transitionDuration)
                    : 350,

                // Gallery navigation & UI
                showNavArrows: options.showNavArrows !== false,
                showCounter: options.showCounter !== false,
                showSlideMarkers: options.showSlideMarkers !== false,
                updateTitleOnSlide: options.updateTitleOnSlide !== false,

                // Credits-style scrolling & interactive scrollbar options
                creditsSpeed: options.creditsSpeed !== undefined ? Math.max(8, Number(options.creditsSpeed)) : 28,
                fitScrollToDuration: options.fitScrollToDuration !== false,
                creditsLoop: options.creditsLoop === true,
                creditsStartDelay: options.creditsStartDelay !== undefined ? Math.max(0, Number(options.creditsStartDelay)) : 1500,
                creditsEndPause: options.creditsEndPause !== undefined ? Math.max(0, Number(options.creditsEndPause)) : 1500,
                pauseCreditsOnHover: options.pauseCreditsOnHover !== false,
                showScrollbar: options.showScrollbar !== false,

                // Keyboard shortcuts (Shift+Arrows, +/-/0 for zoom)
                keyboardControls: options.keyboardControls !== false
            };

            // Normalize initial font scale within bounds
            this.fontScale = this.clampFontScale(this.options.fontScale);

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

            // Credits & scrollbar state
            this.creditsRafId = null;
            this.creditsLastTick = null;
            this.creditsOffsetY = 0;
            this.maxScrollDistance = 0;
            this.effectiveCreditsSpeed = this.options.creditsSpeed;
            this.creditsNeedsScroll = false;
            this.creditsHovered = false;
            this.creditsPauseUntil = 0;
            this.creditsAtEndSince = null;
            this.isDraggingScrollbar = false;
            this.dragStartY = 0;
            this.dragStartThumbTop = 0;
            this.isTouchSwipingText = false;
            this.touchSwipeStartY = 0;
            this.touchSwipeStartOffset = 0;

            // DOM references
            this.stageElement = null;
            this.cardElement = null;
            this.cardHeaderElement = null;
            this.subtitleBadgeElement = null;
            this.cardTitleElement = null;
            this.scrollAreaElement = null;
            this.descViewportElement = null;
            this.descTrackElement = null;
            this.descTextElement = null;
            this.scrollbarElement = null;
            this.scrollbarThumbElement = null;
            this.prevArrowBtn = null;
            this.nextArrowBtn = null;
            this.slideMarkersContainer = null;

            // Controlbar references
            this.controlsGroup = null;
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
         * Escape plain text for safe HTML wrapping
         */
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        /**
         * Sanitize HTML using player.sanitizeHTML or local allowlist fallback
         */
        sanitizeHtmlContent(html) {
            if (!html || typeof html !== 'string') return '';
            if (this.player && typeof this.player.sanitizeHTML === 'function') {
                return this.player.sanitizeHTML(html);
            }

            const allowedTags = new Set(['P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'SPAN', 'DIV', 'A']);
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const cleanNode = (node) => {
                const children = Array.from(node.childNodes);
                for (const child of children) {
                    if (child.nodeType === Node.TEXT_NODE) continue;
                    if (child.nodeType !== Node.ELEMENT_NODE) {
                        child.remove();
                        continue;
                    }
                    if (!allowedTags.has(child.tagName)) {
                        child.replaceWith(document.createTextNode(child.textContent || ''));
                        continue;
                    }
                    const safeHref = child.tagName === 'A' ? this.getSafeUrl(child.getAttribute('href') || '') : '';
                    for (const attr of Array.from(child.attributes)) {
                        child.removeAttribute(attr.name);
                    }
                    if (child.tagName === 'A' && safeHref) {
                        child.setAttribute('href', safeHref);
                        child.setAttribute('target', this.options.openLinkTarget);
                        child.setAttribute('rel', 'noopener noreferrer');
                    }
                    cleanNode(child);
                }
            };

            cleanNode(doc.body);
            return doc.body.innerHTML;
        }

        /**
         * Build a safe DOM DocumentFragment from text/HTML and auto-link raw URLs in text nodes
         */
        buildRichTextFragment(rawInput) {
            const fragment = document.createDocumentFragment();
            if (!rawInput || typeof rawInput !== 'string') return fragment;

            const preparedHtml = this.options.allowHtml
                ? this.sanitizeHtmlContent(rawInput)
                : this.escapeHtml(rawInput);

            const parser = new DOMParser();
            const doc = parser.parseFromString(preparedHtml, 'text/html');
            const body = doc.body;

            // Ensure existing anchors enforce safe target/rel attributes
            body.querySelectorAll('a').forEach((anchor) => {
                const safeHref = this.getSafeUrl(anchor.getAttribute('href') || '');
                if (safeHref) {
                    anchor.setAttribute('href', safeHref);
                    anchor.setAttribute('target', this.options.openLinkTarget);
                    anchor.setAttribute('rel', 'noopener noreferrer');
                } else {
                    anchor.replaceWith(document.createTextNode(anchor.textContent || ''));
                }
            });

            if (this.options.autoLink) {
                this.autoLinkElement(body);
            }

            while (body.firstChild) {
                fragment.appendChild(body.firstChild);
            }

            return fragment;
        }

        /**
         * Convert plain URLs inside text nodes into clickable <a> elements without touching existing links
         */
        autoLinkElement(rootElement) {
            const walker = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT, null);
            const textNodes = [];
            let currentNode;

            while ((currentNode = walker.nextNode())) {
                if (!currentNode.nodeValue || !/https?:\/\//i.test(currentNode.nodeValue)) {
                    continue;
                }
                // Skip text nodes that are already inside an anchor tag
                if (currentNode.parentElement && currentNode.parentElement.closest('a')) {
                    continue;
                }
                textNodes.push(currentNode);
            }

            const urlRegex = /https?:\/\/[^\s<>"'`]+/gi;

            textNodes.forEach((textNode) => {
                const text = textNode.nodeValue;
                const frag = document.createDocumentFragment();
                let lastIndex = 0;
                let match;

                urlRegex.lastIndex = 0;
                while ((match = urlRegex.exec(text)) !== null) {
                    const matchStart = match.index;
                    let rawUrl = match[0];

                    // Trim common trailing sentence punctuation not belonging to the URL
                    let trailing = '';
                    while (/[.,;:!?)]$/.test(rawUrl)) {
                        const lastChar = rawUrl.slice(-1);
                        if (lastChar === ')') {
                            const openParens = (rawUrl.match(/\(/g) || []).length;
                            const closeParens = (rawUrl.match(/\)/g) || []).length;
                            if (closeParens <= openParens) break;
                        }
                        trailing = lastChar + trailing;
                        rawUrl = rawUrl.slice(0, -1);
                    }

                    if (matchStart > lastIndex) {
                        frag.appendChild(document.createTextNode(text.slice(lastIndex, matchStart)));
                    }

                    const safeUrl = this.getSafeUrl(rawUrl);
                    if (safeUrl) {
                        const a = document.createElement('a');
                        a.href = safeUrl;
                        a.target = this.options.openLinkTarget;
                        a.rel = 'noopener noreferrer';
                        a.className = 'myetv-text-autolink';
                        a.textContent = rawUrl;
                        frag.appendChild(a);
                    } else {
                        frag.appendChild(document.createTextNode(rawUrl));
                    }

                    if (trailing) {
                        frag.appendChild(document.createTextNode(trailing));
                    }

                    lastIndex = matchStart + match[0].length;
                }

                if (lastIndex < text.length) {
                    frag.appendChild(document.createTextNode(text.slice(lastIndex)));
                }

                if (lastIndex > 0 && textNode.parentNode) {
                    textNode.parentNode.replaceChild(frag, textNode);
                }
            });
        }

        /**
         * Clamp font scale within configured min/max bounds
         */
        clampFontScale(scale) {
            const min = Math.min(this.options.minFontScale, this.options.maxFontScale);
            const max = Math.max(this.options.minFontScale, this.options.maxFontScale);
            const num = Number(scale);
            if (isNaN(num)) return 1;
            return Math.round(Math.max(min, Math.min(max, num)) * 100) / 100;
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
         * Normalize input texts into a standardized slides array
         */
        parseTexts(input) {
            let list = [];

            if (Array.isArray(input)) {
                list = input;
            } else if (typeof input === 'string' && input.trim()) {
                list = [{ description: input }];
            } else if (input && typeof input === 'object') {
                list = [input];
            } else if (this.options.title.trim() || this.options.description.trim()) {
                list = [{
                    title: this.options.title,
                    subtitle: this.options.subtitle,
                    description: this.options.description
                }];
            }

            const isSingle = list.length === 1;
            const parsed = [];
            let accumulatedMs = 0;

            list.forEach((item) => {
                let rawTitle = '';
                let rawSubtitle = '';
                let rawBody = '';
                let duration = isSingle ? this.options.singleTextDuration : this.options.slideDuration;

                if (typeof item === 'string') {
                    rawBody = item;
                } else if (item && typeof item === 'object') {
                    rawTitle = item.title !== undefined ? String(item.title) : '';
                    rawSubtitle = item.subtitle !== undefined ? String(item.subtitle) : '';
                    const bodyField = item.description !== undefined ? item.description :
                        (item.text !== undefined ? item.text :
                            (item.content !== undefined ? item.content :
                                (item.body !== undefined ? item.body : '')));
                    rawBody = bodyField !== undefined ? String(bodyField) : '';

                    if (item.duration !== undefined && Number(item.duration) > 0) {
                        duration = Number(item.duration);
                    }
                }

                const resolvedTitle = this.formatText(rawTitle || this.options.title || '');
                const resolvedSubtitle = this.formatText(rawSubtitle || this.options.subtitle || '');
                const resolvedBody = rawBody || this.options.description || '';

                if (!resolvedTitle.trim() && !resolvedBody.trim()) {
                    return;
                }

                if (!duration || isNaN(duration) || duration <= 0) {
                    duration = 8000;
                }

                parsed.push({
                    index: parsed.length,
                    title: resolvedTitle,
                    subtitle: resolvedSubtitle,
                    body: resolvedBody,
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
            this.slides = this.parseTexts(this.options.texts);

            if (this.slides.length === 0) {
                if (this.player.options.debug) {
                    console.warn('📝 TextGalleryPlugin: No valid text content provided.');
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

            if (this.options.showSettingsTextControls && typeof this.player.populateSettingsMenu === 'function') {
                this.player.populateSettingsMenu();
            }

            this.renderSlide(0, { instant: true });
            this.applyFontScaleUI();
            this.syncTimelineUI();

            const onReady = () => {
                if (this.isDisposed) return;

                this.forceHidePlayerLoading();
                this.syncTimelineUI();
                this.createSlideMarkers();

                if (this.options.showSettingsTextControls && typeof this.player.populateSettingsMenu === 'function') {
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
            if (document.getElementById('myetv-text-gallery-styles')) return;

            const style = document.createElement('style');
            style.id = 'myetv-text-gallery-styles';
            style.textContent = `
                .video-wrapper.myetv-text-gallery-active {
                    background: #0d1117;
                    user-select: none;
                    -webkit-user-select: none;
                }

                .video-wrapper.myetv-text-gallery-active .video-player {
                    display: none !important;
                }

                .myetv-text-gallery-stage {
                    position: relative;
                    width: 100%;
                    min-height: 300px;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1;
                    background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.05), transparent 55%);
                }

                .video-container:fullscreen .myetv-text-gallery-stage,
                .video-container:-webkit-full-screen .myetv-text-gallery-stage,
                .video-container:-moz-full-screen .myetv-text-gallery-stage,
                .video-wrapper:fullscreen .myetv-text-gallery-stage,
                .video-wrapper:-webkit-full-screen .myetv-text-gallery-stage {
                    height: 100vh !important;
                    aspect-ratio: auto !important;
                }

                .myetv-text-card {
                    position: relative;
                    z-index: 2;
                    width: 86%;
                    max-width: 900px;
                    height: 72%;
                    max-height: 480px;
                    min-height: 200px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    padding: 24px 28px;
                    border-radius: 14px;
                    background: rgba(16, 20, 28, 0.86);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.48);
                    backdrop-filter: blur(12px);
                    box-sizing: border-box;
                    overflow: hidden;
                    transition: opacity 0.35s ease, transform 0.35s ease;
                }

                .myetv-text-card-header {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    flex-shrink: 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    padding-bottom: 10px;
                }

                .myetv-text-card-header.empty {
                    display: none;
                }

                .myetv-text-subtitle-badge {
                    display: inline-flex;
                    align-self: flex-start;
                    align-items: center;
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 0.4px;
                    text-transform: uppercase;
                    padding: 3px 10px;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.08);
                    color: var(--player-primary-color, goldenrod);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    max-width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .myetv-text-card-title {
                    margin: 0;
                    font-size: calc(var(--myetv-text-base-size, 16px) * 1.25 * var(--myetv-text-scale, 1));
                    font-weight: 700;
                    line-height: 1.3;
                    color: #ffffff;
                }

                /* Scrollable text area + custom interactive scrollbar */
                .myetv-text-scroll-area {
                    position: relative;
                    flex: 1;
                    min-height: 60px;
                    display: flex;
                    flex-direction: row;
                    gap: 12px;
                    overflow: hidden;
                }

                .myetv-text-desc-viewport {
                    position: relative;
                    flex: 1;
                    min-width: 0;
                    height: 100%;
                    overflow: hidden;
                    touch-action: none;
                    mask-image: linear-gradient(to bottom, transparent 0%, #000 6%, #000 94%, transparent 100%);
                    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 6%, #000 94%, transparent 100%);
                }

                .myetv-text-desc-viewport.static-text {
                    mask-image: none;
                    -webkit-mask-image: none;
                    touch-action: auto;
                }

                .myetv-text-desc-track {
                    will-change: transform;
                }

                .myetv-text-body {
                    margin: 0;
                    font-size: calc(var(--myetv-text-base-size, 16px) * var(--myetv-text-scale, 1));
                    line-height: 1.65;
                    color: rgba(255, 255, 255, 0.88);
                    white-space: pre-line;
                    word-break: break-word;
                    user-select: text;
                    -webkit-user-select: text;
                }

                .myetv-text-body p {
                    margin: 0 0 0.75em 0;
                }

                .myetv-text-body p:last-child {
                    margin-bottom: 0;
                }

                .myetv-text-body ul,
                .myetv-text-body ol {
                    margin: 0.4em 0 0.8em 0;
                    padding-left: 1.4em;
                }

                .myetv-text-body a,
                .myetv-text-autolink {
                    color: var(--player-primary-color, goldenrod);
                    text-decoration: underline;
                    text-underline-offset: 2px;
                    cursor: pointer;
                }

                .myetv-text-body a:hover,
                .myetv-text-autolink:hover {
                    color: var(--player-primary-hover, #daa520);
                }

                /* Interactive custom vertical scrollbar */
                .myetv-text-scrollbar {
                    position: relative;
                    flex: 0 0 12px;
                    height: 100%;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.08);
                    cursor: pointer;
                    display: none;
                    touch-action: none;
                    transition: background 0.2s ease;
                }

                .myetv-text-scrollbar.visible {
                    display: block;
                }

                .myetv-text-scrollbar:hover,
                .myetv-text-scrollbar.dragging {
                    background: rgba(255, 255, 255, 0.16);
                }

                .myetv-text-scrollbar-thumb {
                    position: absolute;
                    top: 0;
                    left: 2px;
                    right: 2px;
                    height: 36px;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.42);
                    cursor: grab;
                    transition: background 0.15s ease;
                }

                .myetv-text-scrollbar:hover .myetv-text-scrollbar-thumb,
                .myetv-text-scrollbar.dragging .myetv-text-scrollbar-thumb {
                    background: var(--player-primary-color, goldenrod);
                }

                .myetv-text-scrollbar.dragging .myetv-text-scrollbar-thumb {
                    cursor: grabbing;
                }

                /* Floating gallery navigation arrows */
                .myetv-text-nav-arrow {
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

                .myetv-text-nav-arrow.prev { left: 12px; }
                .myetv-text-nav-arrow.next { right: 12px; }

                .video-wrapper.has-controls .myetv-text-nav-arrow,
                .myetv-text-gallery-stage:hover .myetv-text-nav-arrow {
                    opacity: 1;
                    visibility: visible;
                }

                .myetv-text-nav-arrow:hover {
                    background: rgba(0, 0, 0, 0.88);
                    border-color: var(--player-primary-color, goldenrod);
                    color: var(--player-primary-color, goldenrod);
                    transform: translateY(-50%) scale(1.08);
                }

                .myetv-text-nav-arrow:disabled {
                    opacity: 0.25 !important;
                    cursor: not-allowed;
                }

                /* Control bar additions */
                .myetv-text-controls-group {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .myetv-text-counter {
                    color: var(--player-text-secondary, rgba(255, 255, 255, 0.85));
                    font-size: 12px;
                    font-weight: 500;
                    padding: 0 6px;
                    font-variant-numeric: tabular-nums;
                    white-space: nowrap;
                }

                .myetv-text-zoom-group {
                    display: inline-flex;
                    align-items: center;
                    gap: 2px;
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    padding: 0 2px;
                }

                .myetv-text-zoom-btn {
                    padding: 5px 7px !important;
                    font-size: 12px !important;
                    font-weight: 600 !important;
                }

                .myetv-text-zoom-reset-btn {
                    padding: 5px 6px !important;
                    font-size: 11px !important;
                    font-weight: 600 !important;
                    font-variant-numeric: tabular-nums;
                    color: var(--player-primary-color, goldenrod) !important;
                }

                .myetv-text-zoom-reset-btn.is-default {
                    color: var(--player-text-secondary, rgba(255, 255, 255, 0.75)) !important;
                }

                .control-btn.myetv-btn-disabled {
                    opacity: 0.35;
                    cursor: not-allowed;
                    pointer-events: none;
                }

                /* Slide boundary markers on progress bar */
                .myetv-text-slide-markers {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 2;
                }

                .myetv-text-slide-marker {
                    position: absolute;
                    top: 0;
                    height: 100%;
                    width: 2px;
                    background: rgba(0, 0, 0, 0.65);
                    transform: translateX(-50%);
                }

                @media (max-width: 640px) {
                    .myetv-text-card {
                        width: 92%;
                        height: 76%;
                        padding: 16px 18px;
                        gap: 10px;
                    }
                    .myetv-text-nav-arrow {
                        width: 34px;
                        height: 34px;
                    }
                    .myetv-text-scrollbar {
                        flex: 0 0 14px;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        /**
         * Disable native <video> element loading/playback while text gallery plugin is active
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
                this.player.container.classList.add('myetv-text-gallery-active');
            }
        }

        /**
         * Create stage card UI inside .video-wrapper
         */
        createStage() {
            const container = this.player.container;
            if (!container) return;

            this.stageElement = document.createElement('div');
            this.stageElement.className = 'myetv-text-gallery-stage';
            this.stageElement.style.backgroundColor = this.options.backgroundColor;
            this.stageElement.style.setProperty('--myetv-text-base-size', `${this.options.baseFontSize}px`);
            this.stageElement.style.setProperty('--myetv-text-scale', String(this.fontScale));

            if (this.options.aspectRatio && this.options.aspectRatio !== 'auto') {
                this.stageElement.style.aspectRatio = this.options.aspectRatio;
            }

            this.cardElement = document.createElement('div');
            this.cardElement.className = 'myetv-text-card';

            // Header (subtitle badge + title)
            this.cardHeaderElement = document.createElement('div');
            this.cardHeaderElement.className = 'myetv-text-card-header';

            this.subtitleBadgeElement = document.createElement('span');
            this.subtitleBadgeElement.className = 'myetv-text-subtitle-badge';

            this.cardTitleElement = document.createElement('h4');
            this.cardTitleElement.className = 'myetv-text-card-title';

            this.cardHeaderElement.appendChild(this.subtitleBadgeElement);
            this.cardHeaderElement.appendChild(this.cardTitleElement);

            // Scrollable text area (viewport + draggable scrollbar)
            this.scrollAreaElement = document.createElement('div');
            this.scrollAreaElement.className = 'myetv-text-scroll-area';

            this.descViewportElement = document.createElement('div');
            this.descViewportElement.className = 'myetv-text-desc-viewport';

            this.descTrackElement = document.createElement('div');
            this.descTrackElement.className = 'myetv-text-desc-track';

            this.descTextElement = document.createElement('div');
            this.descTextElement.className = 'myetv-text-body';
            this.descTextElement.style.textAlign = this.options.textAlign;

            this.descTrackElement.appendChild(this.descTextElement);
            this.descViewportElement.appendChild(this.descTrackElement);

            this.scrollbarElement = document.createElement('div');
            this.scrollbarElement.className = 'myetv-text-scrollbar';
            this.scrollbarElement.setAttribute('role', 'scrollbar');
            this.scrollbarElement.setAttribute('aria-orientation', 'vertical');

            this.scrollbarThumbElement = document.createElement('div');
            this.scrollbarThumbElement.className = 'myetv-text-scrollbar-thumb';
            this.scrollbarElement.appendChild(this.scrollbarThumbElement);

            this.scrollAreaElement.appendChild(this.descViewportElement);
            this.scrollAreaElement.appendChild(this.scrollbarElement);

            this.cardElement.appendChild(this.cardHeaderElement);
            this.cardElement.appendChild(this.scrollAreaElement);
            this.stageElement.appendChild(this.cardElement);

            // Floating arrows for multi-text galleries
            if (this.slides.length > 1 && this.options.showNavArrows) {
                this.prevArrowBtn = document.createElement('button');
                this.prevArrowBtn.type = 'button';
                this.prevArrowBtn.className = 'myetv-text-nav-arrow prev';
                this.prevArrowBtn.setAttribute('aria-label', 'Previous text');
                this.prevArrowBtn.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>`;

                this.nextArrowBtn = document.createElement('button');
                this.nextArrowBtn.type = 'button';
                this.nextArrowBtn.className = 'myetv-text-nav-arrow next';
                this.nextArrowBtn.setAttribute('aria-label', 'Next text');
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
         * Add gallery navigation and text zoom/reset controls into .controls-right
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
            group.className = 'myetv-text-controls-group';

            if (this.slides.length > 1) {
                this.galleryPrevBtn = document.createElement('button');
                this.galleryPrevBtn.type = 'button';
                this.galleryPrevBtn.className = 'control-btn text-gallery-prev-btn';
                this.galleryPrevBtn.title = 'Previous text';
                this.galleryPrevBtn.innerHTML = `<span class="icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></span>`;
                group.appendChild(this.galleryPrevBtn);

                if (this.options.showCounter) {
                    this.galleryCounterEl = document.createElement('span');
                    this.galleryCounterEl.className = 'myetv-text-counter';
                    this.galleryCounterEl.textContent = `1 / ${this.slides.length}`;
                    group.appendChild(this.galleryCounterEl);
                }

                this.galleryNextBtn = document.createElement('button');
                this.galleryNextBtn.type = 'button';
                this.galleryNextBtn.className = 'control-btn text-gallery-next-btn';
                this.galleryNextBtn.title = 'Next text';
                this.galleryNextBtn.innerHTML = `<span class="icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></span>`;
                group.appendChild(this.galleryNextBtn);
            }

            if (this.options.showZoomControls) {
                const zoomGroup = document.createElement('div');
                zoomGroup.className = 'myetv-text-zoom-group';

                this.zoomOutBtn = document.createElement('button');
                this.zoomOutBtn.type = 'button';
                this.zoomOutBtn.className = 'control-btn myetv-text-zoom-btn';
                this.zoomOutBtn.title = 'Decrease text size (-)';
                this.zoomOutBtn.setAttribute('aria-label', 'Decrease text size');
                this.zoomOutBtn.textContent = 'A-';

                this.zoomResetBtn = document.createElement('button');
                this.zoomResetBtn.type = 'button';
                this.zoomResetBtn.className = 'control-btn myetv-text-zoom-reset-btn';
                this.zoomResetBtn.title = 'Reset text size (0)';
                this.zoomResetBtn.setAttribute('aria-label', 'Reset text size');
                this.zoomResetBtn.textContent = '100%';

                this.zoomInBtn = document.createElement('button');
                this.zoomInBtn.type = 'button';
                this.zoomInBtn.className = 'control-btn myetv-text-zoom-btn';
                this.zoomInBtn.title = 'Increase text size (+)';
                this.zoomInBtn.setAttribute('aria-label', 'Increase text size');
                this.zoomInBtn.textContent = 'A+';

                zoomGroup.appendChild(this.zoomOutBtn);
                zoomGroup.appendChild(this.zoomResetBtn);
                zoomGroup.appendChild(this.zoomInBtn);
                group.appendChild(zoomGroup);
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
            markers.className = 'myetv-text-slide-markers';

            for (let i = 1; i < this.slides.length; i++) {
                const pct = (this.slides[i].startMs / this.totalDurationMs) * 100;
                const marker = document.createElement('div');
                marker.className = 'myetv-text-slide-marker';
                marker.style.left = `${pct}%`;
                markers.appendChild(marker);
            }

            progressBar.appendChild(markers);
            this.slideMarkersContainer = markers;
        }

        /**
         * Override player methods and inject text zoom controls into settings menu
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
                    fontScale: self.fontScale
                };
            });

            // Extend populateSettingsMenu to include text zoom options
            if (this.options.showSettingsTextControls && typeof this.originalMethods.populateSettingsMenu === 'function') {
                override('populateSettingsMenu', () => {
                    self.originalMethods.populateSettingsMenu.call(p);
                    self.injectSettingsTextZoomOption();
                });
            }

            const settingsMenu = p.container?.querySelector('.settings-menu');
            if (settingsMenu && this.options.showSettingsTextControls) {
                const onSettingsClick = (e) => {
                    const zoomOption = e.target.closest('[data-action="text_zoom_step"]');
                    if (zoomOption) {
                        e.stopPropagation();
                        const delta = parseFloat(zoomOption.getAttribute('data-zoom-delta') || '0');
                        if (delta === 0) {
                            self.resetZoom();
                        } else {
                            self.setFontScale(self.fontScale + delta);
                        }
                        self.updateSettingsTextZoomUI();
                    }
                };
                settingsMenu.addEventListener('click', onSettingsClick);
                this.boundListeners.push({ target: settingsMenu, type: 'click', handler: onSettingsClick });
            }
        }

        /**
         * Inject text zoom controls inside .settings-menu for mobile / modal accessibility
         */
        injectSettingsTextZoomOption() {
            if (!this.options.showSettingsTextControls) return;
            const settingsMenu = this.player.container?.querySelector('.settings-menu');
            if (!settingsMenu || settingsMenu.querySelector('.myetv-text-zoom-settings-wrapper')) return;

            const wrapper = document.createElement('div');
            wrapper.className = 'settings-expandable-wrapper myetv-text-zoom-settings-wrapper';

            const trigger = document.createElement('div');
            trigger.className = 'settings-option expandable-trigger';
            trigger.setAttribute('data-action', 'text_zoom_expand');

            const label = document.createElement('span');
            label.className = 'settings-option-label';
            label.innerHTML = `Text Size <strong>${Math.round(this.fontScale * 100)}%</strong>`;

            const arrow = document.createElement('span');
            arrow.className = 'expand-arrow';
            arrow.textContent = '▼';

            trigger.appendChild(label);
            trigger.appendChild(arrow);

            const content = document.createElement('div');
            content.className = 'settings-expandable-content';
            content.style.display = 'none';

            const actions = [
                { text: 'Increase Text Size (+)', delta: String(this.options.fontScaleStep) },
                { text: 'Decrease Text Size (-)', delta: String(-this.options.fontScaleStep) },
                { text: 'Reset to Normal (100%)', delta: '0' }
            ];

            actions.forEach((act) => {
                const item = document.createElement('div');
                item.className = 'settings-suboption';
                item.setAttribute('data-action', 'text_zoom_step');
                item.setAttribute('data-zoom-delta', act.delta);
                item.textContent = act.text;
                content.appendChild(item);
            });

            wrapper.appendChild(trigger);
            wrapper.appendChild(content);

            const moreInfoOption = settingsMenu.querySelector('[data-action="moreinfo"]');
            if (moreInfoOption && moreInfoOption.nextSibling) {
                settingsMenu.insertBefore(wrapper, moreInfoOption.nextSibling);
            } else {
                settingsMenu.insertBefore(wrapper, settingsMenu.firstChild);
            }
        }

        /**
         * Sync the Text Size label inside the settings menu after scale changes
         */
        updateSettingsTextZoomUI() {
            const label = this.player.container?.querySelector('.myetv-text-zoom-settings-wrapper .settings-option-label strong');
            if (label) {
                label.textContent = `${Math.round(this.fontScale * 100)}%`;
            }
        }

        /**
         * Bind click, hover, wheel, touch swipe, and scrollbar drag events
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

            add(this.zoomOutBtn, 'click', (e) => {
                e.stopPropagation();
                this.zoomOut();
            });
            add(this.zoomResetBtn, 'click', (e) => {
                e.stopPropagation();
                this.resetZoom();
            });
            add(this.zoomInBtn, 'click', (e) => {
                e.stopPropagation();
                this.zoomIn();
            });

            // Click on stage toggles play/pause unless clicking an anchor link, button, or scrollbar
            add(this.stageElement, 'click', (e) => {
                if (e.target.closest('a') || e.target.closest('button') || e.target.closest('.myetv-text-scrollbar')) {
                    return;
                }

                // Do not toggle playback if user just highlighted text
                const selection = window.getSelection ? window.getSelection().toString() : '';
                if (selection && selection.length > 0) return;

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

            // Pause credits scrolling on hover so the user can read or click links comfortably
            if (this.options.pauseCreditsOnHover) {
                add(this.descViewportElement, 'mouseenter', () => {
                    this.creditsHovered = true;
                });
                add(this.descViewportElement, 'mouseleave', () => {
                    this.creditsHovered = false;
                    this.creditsLastTick = performance.now();
                });
            }

            // Allow manual mouse wheel scrolling inside long text
            add(this.descViewportElement, 'wheel', (e) => {
                if (!this.creditsNeedsScroll || this.maxScrollDistance <= 0) return;
                e.preventDefault();
                e.stopPropagation();

                this.setTextScrollOffset(this.creditsOffsetY - e.deltaY);
                this.creditsPauseUntil = performance.now() + 1500;
            }, { passive: false });

            // Allow touch swipe vertical scrolling on the text viewport for mobile devices
            add(this.descViewportElement, 'touchstart', (e) => {
                if (!this.creditsNeedsScroll || this.maxScrollDistance <= 0 || !e.touches || !e.touches[0]) return;
                this.isTouchSwipingText = true;
                this.touchSwipeStartY = e.touches[0].clientY;
                this.touchSwipeStartOffset = this.creditsOffsetY;
            }, { passive: true });

            add(this.descViewportElement, 'touchmove', (e) => {
                if (!this.isTouchSwipingText || !e.touches || !e.touches[0]) return;
                const deltaY = e.touches[0].clientY - this.touchSwipeStartY;
                if (Math.abs(deltaY) > 4 && e.cancelable) {
                    e.preventDefault();
                }
                this.setTextScrollOffset(this.touchSwipeStartOffset + deltaY);
                this.creditsPauseUntil = performance.now() + 1500;
            }, { passive: false });

            add(this.descViewportElement, 'touchend', () => {
                this.isTouchSwipingText = false;
            }, { passive: true });

            // Interactive custom scrollbar dragging & track jumping (Mouse + Touch)
            this.bindScrollbarEvents(add);

            // Re-evaluate credits overflow on resize / fullscreen
            const onResize = () => {
                this.setupCreditsAnimation(false);
            };
            add(window, 'resize', onResize);
            add(document, 'fullscreenchange', onResize);
        }

        /**
         * Bind mouse and touch drag/click handlers for the custom vertical scrollbar
         */
        bindScrollbarEvents(add) {
            if (!this.scrollbarElement || !this.scrollbarThumbElement) return;

            const getClientY = (e) => {
                if (e.clientY !== undefined) return e.clientY;
                if (e.touches && e.touches[0]) return e.touches[0].clientY;
                if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0].clientY;
                return 0;
            };

            const startThumbDrag = (e) => {
                if (!this.creditsNeedsScroll || this.maxScrollDistance <= 0) return;
                if (e.cancelable) e.preventDefault();
                e.stopPropagation();

                this.isDraggingScrollbar = true;
                this.dragStartY = getClientY(e);
                this.dragStartThumbTop = parseFloat(this.scrollbarThumbElement.style.top || '0') || 0;
                this.scrollbarElement.classList.add('dragging');
            };

            const moveThumbDrag = (e) => {
                if (!this.isDraggingScrollbar || !this.scrollbarElement || !this.scrollbarThumbElement) return;
                if (e.cancelable) e.preventDefault();

                const trackH = this.scrollbarElement.clientHeight;
                const thumbH = this.scrollbarThumbElement.offsetHeight;
                const maxThumbTop = Math.max(1, trackH - thumbH);
                const deltaY = getClientY(e) - this.dragStartY;
                const nextThumbTop = Math.max(0, Math.min(maxThumbTop, this.dragStartThumbTop + deltaY));
                const progress = nextThumbTop / maxThumbTop;

                this.setTextScrollOffset(-(progress * this.maxScrollDistance));
                this.creditsPauseUntil = performance.now() + 1500;
            };

            const endThumbDrag = () => {
                if (!this.isDraggingScrollbar) return;
                this.isDraggingScrollbar = false;
                this.scrollbarElement?.classList.remove('dragging');
                this.creditsLastTick = performance.now();
                this.creditsPauseUntil = performance.now() + 1500;
            };

            // Thumb drag start
            add(this.scrollbarThumbElement, 'mousedown', startThumbDrag);
            add(this.scrollbarThumbElement, 'touchstart', startThumbDrag, { passive: false });

            // Track click / jump to position
            const jumpOnTrack = (e) => {
                if (e.target === this.scrollbarThumbElement) return;
                if (!this.creditsNeedsScroll || this.maxScrollDistance <= 0) return;
                e.stopPropagation();

                const rect = this.scrollbarElement.getBoundingClientRect();
                const thumbH = this.scrollbarThumbElement.offsetHeight;
                const maxThumbTop = Math.max(1, rect.height - thumbH);
                const clickY = getClientY(e) - rect.top - (thumbH / 2);
                const nextThumbTop = Math.max(0, Math.min(maxThumbTop, clickY));
                const progress = nextThumbTop / maxThumbTop;

                this.setTextScrollOffset(-(progress * this.maxScrollDistance));
                this.creditsPauseUntil = performance.now() + 1500;
            };

            add(this.scrollbarElement, 'mousedown', jumpOnTrack);
            add(this.scrollbarElement, 'click', (e) => e.stopPropagation());

            // Global move/end listeners for dragging outside the track
            add(document, 'mousemove', moveThumbDrag);
            add(document, 'mouseup', endThumbDrag);
            add(document, 'touchmove', moveThumbDrag, { passive: false });
            add(document, 'touchend', endThumbDrag, { passive: true });
            add(document, 'touchcancel', endThumbDrag, { passive: true });
        }

        /**
         * Bind optional keyboard shortcuts
         */
        bindKeyboardEvents() {
            if (!this.options.keyboardControls) return;

            const onKeyDown = (e) => {
                if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
                    return;
                }

                if (this.slides.length > 1 && e.shiftKey) {
                    if (e.code === 'ArrowRight') {
                        e.preventDefault();
                        this.nextSlide();
                        return;
                    }
                    if (e.code === 'ArrowLeft') {
                        e.preventDefault();
                        this.prevSlide();
                        return;
                    }
                }

                if (e.key === '+' || e.key === '=') {
                    e.preventDefault();
                    this.zoomIn();
                } else if (e.key === '-') {
                    e.preventDefault();
                    this.zoomOut();
                } else if (e.key === '0') {
                    e.preventDefault();
                    this.resetZoom();
                }
            };

            document.addEventListener('keydown', onKeyDown);
            this.boundListeners.push({ target: document, type: 'keydown', handler: onKeyDown });
        }

        // ============================================================
        // TEXT ZOOM & RESET API
        // ============================================================

        zoomIn() {
            return this.setFontScale(this.fontScale + this.options.fontScaleStep);
        }

        zoomOut() {
            return this.setFontScale(this.fontScale - this.options.fontScaleStep);
        }

        resetZoom() {
            return this.setFontScale(1);
        }

        setFontScale(scale) {
            const nextScale = this.clampFontScale(scale);
            if (nextScale === this.fontScale) {
                this.applyFontScaleUI();
                return this;
            }

            const prevScale = this.fontScale;
            this.fontScale = nextScale;
            this.applyFontScaleUI();

            // Re-measure scrolling and scrollbar proportions immediately after font size update
            requestAnimationFrame(() => {
                this.setupCreditsAnimation(false);
            });

            this.player.triggerEvent('textzoomchange', {
                scale: this.fontScale,
                previousScale: prevScale,
                percentage: Math.round(this.fontScale * 100)
            });

            return this;
        }

        getFontScale() {
            return this.fontScale;
        }

        applyFontScaleUI() {
            if (this.stageElement) {
                this.stageElement.style.setProperty('--myetv-text-scale', String(this.fontScale));
            }

            const pct = Math.round(this.fontScale * 100);
            if (this.zoomResetBtn) {
                this.zoomResetBtn.textContent = `${pct}%`;
                this.zoomResetBtn.classList.toggle('is-default', Math.abs(this.fontScale - 1) < 0.01);
            }

            if (this.zoomOutBtn) {
                const atMin = this.fontScale <= this.options.minFontScale + 0.001;
                this.zoomOutBtn.classList.toggle('myetv-btn-disabled', atMin);
            }

            if (this.zoomInBtn) {
                const atMax = this.fontScale >= this.options.maxFontScale - 0.001;
                this.zoomInBtn.classList.toggle('myetv-btn-disabled', atMax);
            }

            this.updateSettingsTextZoomUI();
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
                } else {
                    this.setupCreditsAnimation(true);
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
        // SLIDE RENDERING & DURATION-AWARE SCROLLING + SCROLLBAR
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

            this.player.triggerEvent('slidechange', {
                slideIndex: index,
                totalSlides: this.slides.length,
                slide: slide
            });
        }

        /**
         * Update DOM elements for the active text slide
         */
        applySlideToDOM(slide) {
            if (!slide) return;

            const hasSubtitle = Boolean(slide.subtitle && slide.subtitle.trim());
            const hasTitle = Boolean(slide.title && slide.title.trim());

            if (this.subtitleBadgeElement) {
                this.subtitleBadgeElement.textContent = slide.subtitle || '';
                this.subtitleBadgeElement.style.display = hasSubtitle ? 'inline-flex' : 'none';
            }

            if (this.cardTitleElement) {
                this.cardTitleElement.textContent = slide.title || '';
                this.cardTitleElement.style.display = hasTitle ? 'block' : 'none';
            }

            if (this.cardHeaderElement) {
                this.cardHeaderElement.classList.toggle('empty', !hasSubtitle && !hasTitle);
            }

            // Render sanitized HTML + auto-linked URLs safely via DocumentFragment
            if (this.descTextElement) {
                this.descTextElement.textContent = '';
                this.descTextElement.appendChild(this.buildRichTextFragment(slide.body));
            }

            // Top bar title fallback if player.options.videoTitle was NOT already filled
            if (this.options.updateTitleOnSlide && !this.playerHasExplicitTitle) {
                const topTitle = slide.title || (this.slides.length > 1 ? `Text ${slide.index + 1} / ${this.slides.length}` : '');
                if (topTitle) {
                    if (typeof this.player.enableTitleOverlay === 'function') {
                        this.player.enableTitleOverlay();
                    }
                    if (typeof this.player.setVideoTitle === 'function') {
                        this.player.setVideoTitle(topTitle);
                    }
                }
                if (hasSubtitle && typeof this.player.setVideoSubtitle === 'function') {
                    this.player.setVideoSubtitle(slide.subtitle);
                } else if (!this.playerInitialSubtitle && this.slides.length > 1 && typeof this.player.setVideoSubtitle === 'function') {
                    this.player.setVideoSubtitle(`${slide.index + 1} / ${this.slides.length}`);
                }
            }

            // Setup credits-style vertical scrolling if text overflows viewport
            requestAnimationFrame(() => {
                this.setupCreditsAnimation(true);
            });
        }

        /**
         * Clamp and apply vertical scroll offset, keeping custom scrollbar synced
         */
        setTextScrollOffset(offsetY) {
            const clamped = Math.max(-this.maxScrollDistance, Math.min(0, offsetY));
            this.creditsOffsetY = clamped;
            if (this.descTrackElement) {
                this.descTrackElement.style.transform = `translate3d(0, ${clamped}px, 0)`;
            }
            if (clamped > -this.maxScrollDistance + 0.5) {
                this.creditsAtEndSince = null;
            }
            this.updateScrollbarUI();
        }

        /**
         * Update custom scrollbar thumb size and position from current scroll offset
         */
        updateScrollbarUI() {
            if (!this.scrollbarElement || !this.scrollbarThumbElement || !this.descViewportElement || !this.descTrackElement) {
                return;
            }

            if (!this.options.showScrollbar || !this.creditsNeedsScroll || this.maxScrollDistance <= 0) {
                this.scrollbarElement.classList.remove('visible');
                return;
            }

            this.scrollbarElement.classList.add('visible');

            const trackH = this.scrollbarElement.clientHeight;
            const vpH = this.descViewportElement.clientHeight;
            const contentH = this.descTrackElement.scrollHeight;

            if (trackH <= 0 || contentH <= 0) return;

            const thumbH = Math.max(28, Math.min(trackH, (vpH / contentH) * trackH));
            const maxThumbTop = Math.max(0, trackH - thumbH);
            const progress = Math.max(0, Math.min(1, (-this.creditsOffsetY) / this.maxScrollDistance));
            const thumbTop = progress * maxThumbTop;

            this.scrollbarThumbElement.style.height = `${thumbH}px`;
            this.scrollbarThumbElement.style.top = `${thumbTop}px`;
            this.scrollbarElement.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
        }

        /**
         * Compute effective scroll speed so long texts finish scrolling before slide duration ends
         */
        computeScrollTiming(maxScrollDistance) {
            const slide = this.slides[this.currentIndex];
            const slideDurationMs = slide ? slide.duration : this.options.slideDuration;

            let startDelay = this.options.creditsStartDelay;
            let endPause = this.options.creditsEndPause;

            if (slideDurationMs <= startDelay + endPause + 500) {
                startDelay = Math.round(slideDurationMs * 0.15);
                endPause = Math.round(slideDurationMs * 0.15);
            }

            const availableScrollSec = Math.max(0.5, (slideDurationMs - startDelay - endPause) / 1000);
            const requiredSpeed = maxScrollDistance / availableScrollSec;
            const speed = this.options.fitScrollToDuration
                ? Math.max(this.options.creditsSpeed, requiredSpeed)
                : this.options.creditsSpeed;

            return { startDelay, endPause, speed };
        }

        /**
         * Measure text height and run duration-aware scroll animation when overflowing
         */
        setupCreditsAnimation(resetPosition = true) {
            this.stopCreditsAnimation();

            if (!this.descViewportElement || !this.descTrackElement) return;

            const viewportHeight = this.descViewportElement.clientHeight;
            const textHeight = this.descTrackElement.scrollHeight;
            this.maxScrollDistance = Math.max(0, textHeight - viewportHeight);

            if (viewportHeight <= 0 || this.maxScrollDistance <= 2) {
                this.creditsNeedsScroll = false;
                this.maxScrollDistance = 0;
                this.creditsOffsetY = 0;
                this.creditsAtEndSince = null;
                this.descTrackElement.style.transform = 'translate3d(0, 0, 0)';
                this.descViewportElement.classList.add('static-text');
                this.updateScrollbarUI();
                return;
            }

            this.creditsNeedsScroll = true;
            this.descViewportElement.classList.remove('static-text');

            const timing = this.computeScrollTiming(this.maxScrollDistance);
            this.effectiveCreditsSpeed = timing.speed;

            if (resetPosition) {
                this.creditsAtEndSince = null;
                this.creditsPauseUntil = performance.now() + timing.startDelay;
                this.setTextScrollOffset(0);
            } else {
                this.setTextScrollOffset(this.creditsOffsetY);
            }

            this.creditsLastTick = performance.now();

            const step = (now) => {
                if (this.isDisposed || !this.creditsNeedsScroll) return;

                const dt = Math.max(0, (now - (this.creditsLastTick || now)) / 1000);
                this.creditsLastTick = now;

                // Scroll only while playing, not hovered, and not manually dragging scrollbar or swiping
                if (this.isPlaying && !this.creditsHovered && !this.isDraggingScrollbar && !this.isTouchSwipingText && now >= this.creditsPauseUntil) {
                    const speedMultiplier = this.player.video ? (this.player.video.playbackRate || 1) : 1;
                    const nextOffset = this.creditsOffsetY - (this.effectiveCreditsSpeed * speedMultiplier * dt);

                    if (nextOffset <= -this.maxScrollDistance) {
                        if (this.creditsOffsetY > -this.maxScrollDistance) {
                            this.setTextScrollOffset(-this.maxScrollDistance);
                        }

                        if (this.options.creditsLoop) {
                            if (this.creditsAtEndSince === null) {
                                this.creditsAtEndSince = now;
                            } else if (now - this.creditsAtEndSince >= timing.endPause) {
                                this.creditsAtEndSince = null;
                                this.creditsPauseUntil = now + timing.startDelay;
                                this.setTextScrollOffset(0);
                            }
                        }
                    } else {
                        this.setTextScrollOffset(nextOffset);
                    }
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

        setTexts(texts) {
            this.pause();
            this.options.texts = texts;
            this.slides = this.parseTexts(texts);
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
            const settingsOption = this.player.container?.querySelector('.myetv-text-zoom-settings-wrapper');
            settingsOption?.remove();

            // Remove injected DOM
            this.stageElement?.remove();
            this.controlsGroup?.remove();
            this.slideMarkersContainer?.remove();

            if (this.player.container) {
                this.player.container.classList.remove('myetv-text-gallery-active');
            }
            if (this.player.video) {
                this.savedVideoSources.forEach((srcEl) => this.player.video.appendChild(srcEl));
                this.savedVideoSources = [];
                this.player.video.style.display = '';
            }
        }
    }

    if (typeof window.registerMYETVPlugin === 'function') {
        window.registerMYETVPlugin('textgallery', TextGalleryPlugin);
    }
})();