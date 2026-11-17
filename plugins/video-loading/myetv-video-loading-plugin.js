/**
 * MYETV Player - Video Loader Plugin
 * File: myetv-video-loading-plugin.js
 */
(function () {
    'use strict';

    class VideoLoaderPlugin {
        constructor(player, options = {}) {
            this.player = player;
            this.options = {
                videoUrl: options.videoUrl || null,
                timeout: options.timeout !== undefined ? options.timeout : 3000,
                backgroundColor: options.backgroundColor || '#000',
                muted: options.muted !== undefined ? options.muted : true,
                // Customizable text for TOS compliance, with a safe default
                loadingText: options.loadingText || 'Loading engine...',
                // Optional loader-specific title and subtitle (disabled if omitted)
                videoTitle: options.videoTitle || null,
                videoSubtitle: options.videoSubtitle || null
            };

            this.loaderContainer = null;
            this.loaderVideo = null;
            this.loaderImage = null;
            this.playTimeout = null;
            this.countdownTimeout = null;
            this.fadeTimeout = null;
            this.pendingResolve = null;
            this.isDisposed = false;
        }

        /**
         * Validate media URL safely using main player's sanitizer when available
         * @param {string} url
         * @returns {string}
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
         * @param {string} text
         * @returns {string}
         */
        formatText(text) {
            if (!text || typeof text !== 'string') return '';
            if (this.player && typeof this.player.decodeHTMLEntities === 'function') {
                return this.player.decodeHTMLEntities(text);
            }
            return text;
        }

        /**
         * Blocks the main player queue until resolved
         * @returns {Promise}
         */
        waitForCompletion() {
            return new Promise((resolve) => {
                const safeVideoUrl = this.getSafeUrl(this.options.videoUrl);
                if (!safeVideoUrl || this.isDisposed) {
                    resolve();
                    return;
                }
                this.pendingResolve = resolve;
                this.initUI(resolve, safeVideoUrl);
            });
        }

        /**
         * Create optional top bar with loader-specific title and subtitle
         * Uses the same CSS classes as the main player for identical positioning and styling
         */
        createLoaderTopBar() {
            const titleText = this.options.videoTitle ? String(this.options.videoTitle).trim() : '';
            const subtitleText = this.options.videoSubtitle ? String(this.options.videoSubtitle).trim() : '';

            // Do not activate top bar if neither option is specified
            if (!titleText && !subtitleText) {
                return;
            }

            const topBar = document.createElement('div');
            topBar.className = 'player-top-bar persistent';

            const titleSection = document.createElement('div');
            titleSection.className = 'top-bar-title';

            if (titleText) {
                const titleElement = document.createElement('h3');
                titleElement.className = 'video-title';
                titleElement.textContent = this.formatText(titleText);
                titleSection.appendChild(titleElement);
            }

            if (subtitleText) {
                const subtitleElement = document.createElement('span');
                subtitleElement.className = 'video-subtitle';
                subtitleElement.textContent = this.formatText(subtitleText);
                titleSection.appendChild(subtitleElement);
            }

            topBar.appendChild(titleSection);
            this.loaderContainer.appendChild(topBar);
        }

        /**
         * Initialize the loader UI and start the countdown
         */
        initUI(resolvePromise, safeVideoUrl) {
            if (!this.player.container) {
                this.resolveQueue(resolvePromise);
                return;
            }

            // Regex check to determine if the URL is an animated image or a video
            const isImage = /\.(gif|webp|png|jpg|jpeg)(\?.*)?$/i.test(safeVideoUrl);

            this.loaderContainer = document.createElement('div');
            this.loaderContainer.className = 'myetv-video-loader-overlay';

            // Added display flex to ensure images are centered properly
            this.loaderContainer.style.cssText = `
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                z-index: 999999;
                display: flex; align-items: center; justify-content: center;
                transition: opacity 0.5s ease;
            `;
            this.loaderContainer.style.backgroundColor = this.options.backgroundColor;

            if (isImage) {
                // --- IMAGE BEHAVIOR ---
                this.loaderImage = document.createElement('img');
                this.loaderImage.src = safeVideoUrl;
                this.loaderImage.style.cssText = 'width: 100%; height: 100%; object-fit: cover; pointer-events: none; border: none;';
                this.loaderContainer.appendChild(this.loaderImage);
            } else {
                // --- ORIGINAL VIDEO BEHAVIOR ---
                this.loaderVideo = document.createElement('video');

                this.loaderVideo.poster = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

                this.loaderVideo.autoplay = true;
                this.loaderVideo.loop = true;
                this.loaderVideo.muted = this.options.muted;
                this.loaderVideo.playsInline = true;
                this.loaderVideo.disablePictureInPicture = true;

                if (this.options.muted) this.loaderVideo.setAttribute('muted', '');
                this.loaderVideo.setAttribute('autoplay', '');
                this.loaderVideo.setAttribute('playsinline', '');

                this.loaderVideo.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; border: none; pointer-events: none; background: transparent; transform: translateZ(0); -webkit-transform: translateZ(0);';

                this.loaderContainer.appendChild(this.loaderVideo);

                this.playTimeout = setTimeout(() => {
                    if (this.loaderVideo && !this.isDisposed) {
                        this.loaderVideo.src = safeVideoUrl;
                        this.loaderVideo.load();

                        const playPromise = this.loaderVideo.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(() => {
                                if (this.loaderVideo && !this.options.muted) {
                                    this.loaderVideo.muted = true;
                                    this.loaderVideo.setAttribute('muted', '');
                                    this.loaderVideo.play().catch(e => console.log('Loader play failed on TV:', e));
                                }
                            });
                        }
                    }
                }, 50);
            }

            // Render optional loader-specific title and subtitle at the top
            this.createLoaderTopBar();

            const loadingLabel = document.createElement('div');
            loadingLabel.textContent = this.options.loadingText;
            loadingLabel.style.cssText = `
                position: absolute; bottom: 20px; right: 20px; 
                background: rgba(0, 0, 0, 0.6); color: rgba(255, 255, 255, 0.8);
                font-family: sans-serif; font-size: 11px; padding: 4px 8px; 
                border-radius: 4px; z-index: 2; pointer-events: none;
            `;

            this.loaderContainer.appendChild(loadingLabel);
            this.player.container.appendChild(this.loaderContainer);

            this.countdownTimeout = setTimeout(() => {
                this.finishAndUnlock(resolvePromise);
            }, this.options.timeout);
        }

        /**
         * Resolve the blocking promise once safely
         */
        resolveQueue(resolvePromise) {
            if (typeof resolvePromise === 'function') {
                this.pendingResolve = null;
                resolvePromise();
            }
        }

        /**
         * Fades out and resolves the queue
         */
        finishAndUnlock(resolvePromise) {
            // SIGNAL: Unlock the pipeline FIRST.
            // This allows YouTube to silently instantiate underneath while the black screen fades.
            this.resolveQueue(resolvePromise);

            if (this.loaderContainer) {
                this.loaderContainer.style.opacity = '0';
            }

            this.fadeTimeout = setTimeout(() => {
                this.cleanupElements();
            }, 500);
        }

        /**
         * Remove loader DOM nodes and release media memory
         */
        cleanupElements() {
            if (this.loaderContainer && this.loaderContainer.parentNode) {
                this.loaderContainer.parentNode.removeChild(this.loaderContainer);
            }
            this.loaderContainer = null;

            if (this.loaderVideo) {
                this.loaderVideo.pause();
                this.loaderVideo.removeAttribute('src');
                this.loaderVideo.load();
                this.loaderVideo = null;
            }
            if (this.loaderImage) {
                this.loaderImage.removeAttribute('src');
                this.loaderImage = null;
            }
        }

        /**
         * Clean up timers and DOM elements when player is disposed early
         */
        dispose() {
            this.isDisposed = true;

            if (this.playTimeout) {
                clearTimeout(this.playTimeout);
                this.playTimeout = null;
            }
            if (this.countdownTimeout) {
                clearTimeout(this.countdownTimeout);
                this.countdownTimeout = null;
            }
            if (this.fadeTimeout) {
                clearTimeout(this.fadeTimeout);
                this.fadeTimeout = null;
            }

            if (this.pendingResolve) {
                this.resolveQueue(this.pendingResolve);
            }

            this.cleanupElements();
        }
    }

    if (typeof window.registerMYETVPlugin === 'function') {
        window.registerMYETVPlugin('videoloader', VideoLoaderPlugin);
    }
})();
