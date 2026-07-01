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
                loadingText: options.loadingText || 'Loading engine...'
            };

            this.loaderContainer = null;
            this.loaderVideo = null;
            // ADDED: Reference for the image element
            this.loaderImage = null;
        }

        /**
         * Blocks the main player queue until resolved
         * @returns {Promise}
         */
        waitForCompletion() {
            return new Promise((resolve) => {
                if (!this.options.videoUrl) {
                    resolve();
                    return;
                }
                this.initUI(resolve);
            });
        }

        /**
         * Initialize the loader UI and start the countdown
         */
        initUI(resolvePromise) {
            if (!this.player.container) {
                resolvePromise();
                return;
            }

            // Regex check to determine if the URL is an animated image or a video
            const isImage = /\.(gif|webp|png|jpg|jpeg)(\?.*)?$/i.test(this.options.videoUrl);

            this.loaderContainer = document.createElement('div');
            this.loaderContainer.className = 'myetv-video-loader-overlay';

            // Added display flex to ensure images are centered properly
            this.loaderContainer.style.cssText = `
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                z-index: 999999; background-color: ${this.options.backgroundColor};
                display: flex; align-items: center; justify-content: center;
                transition: opacity 0.5s ease;
            `;

            if (isImage) {
                // --- IMAGE BEHAVIOR ---
                this.loaderImage = document.createElement('img');
                this.loaderImage.src = this.options.videoUrl;
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

                setTimeout(() => {
                    if (this.loaderVideo) {
                        this.loaderVideo.src = this.options.videoUrl;
                        this.loaderVideo.load();

                        const playPromise = this.loaderVideo.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(() => {
                                if (!this.options.muted) {
                                    this.loaderVideo.muted = true;
                                    this.loaderVideo.setAttribute('muted', '');
                                    this.loaderVideo.play().catch(e => console.log('Loader play failed on TV:', e));
                                }
                            });
                        }
                    }
                }, 50);
            }

            const loadingLabel = document.createElement('div');
            loadingLabel.innerText = this.options.loadingText;
            loadingLabel.style.cssText = `
                position: absolute; bottom: 20px; right: 20px; 
                background: rgba(0, 0, 0, 0.6); color: rgba(255, 255, 255, 0.8);
                font-family: sans-serif; font-size: 11px; padding: 4px 8px; 
                border-radius: 4px; z-index: 2; pointer-events: none;
            `;

            this.loaderContainer.appendChild(loadingLabel);
            this.player.container.appendChild(this.loaderContainer);

            setTimeout(() => {
                this.finishAndUnlock(resolvePromise);
            }, this.options.timeout);
        }

        /**
         * Fades out and resolves the queue
         */
        finishAndUnlock(resolvePromise) {
            // SIGNAL: Unlock the pipeline FIRST.
            // This allows YouTube to silently instantiate underneath while the black screen fades.
            resolvePromise();

            if (this.loaderContainer) {
                this.loaderContainer.style.opacity = '0';
            }

            setTimeout(() => {
                if (this.loaderContainer && this.loaderContainer.parentNode) {
                    this.loaderContainer.parentNode.removeChild(this.loaderContainer);
                }
                if (this.loaderVideo) {
                    this.loaderVideo.pause();
                    this.loaderVideo.removeAttribute('src');
                    this.loaderVideo.load();
                }
                if (this.loaderImage) {
                    // Clear RAM
                    this.loaderImage.removeAttribute('src');
                }
            }, 500);
        }
    }

    if (typeof window.registerMYETVPlugin === 'function') {
        window.registerMYETVPlugin('videoloader', VideoLoaderPlugin);
    }
})();