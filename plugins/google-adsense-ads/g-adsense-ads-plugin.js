/* Google AdSense Plugin for MYETV Video Player
 * Integrates Google AdSense for Video
 * Created by https://www.myetv.tv https://oskarcosimo.com
 */

/* GLOBAL_START */
(function () {
    'use strict';

    /**
     * Google AdSense Video Plugin
     */
    class AdSenseVideoPlugin {
        constructor(player, options = {}) {
            this.player = player;
            this.options = {
                publisherId: options.publisherId || '',
                adSlot: options.adSlot || '',
                adFormat: options.adFormat || 'auto',
                fullWidth: options.fullWidth !== false,
                debug: options.debug || false,
                ...options
            };

            this.adContainer = null;
            this.isAdLoaded = false;
        }

        /**
         * Setup plugin
         */
        setup() {
            if (!this.options.publisherId) {
                console.error('🎬 AdSense Publisher ID is required');
                return;
            }

            this.createAdContainer();
            this.loadAdSenseScript();
            this.attachVideoEvents();

            if (this.options.debug) {
                console.log('🎬 AdSense Video Plugin initialized');
            }
        }

        /**
         * Create ad container
         */
        createAdContainer() {
            this.adContainer = document.createElement('div');
            this.adContainer.className = 'adsense-video-container';
            this.adContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 999;
                display: none;
            `;

            // Create AdSense ins element
            const ins = document.createElement('ins');
            ins.className = 'adsbygoogle';
            ins.style.cssText = 'display:block;';
            ins.setAttribute('data-ad-client', this.options.publisherId);

            if (this.options.adSlot) {
                ins.setAttribute('data-ad-slot', this.options.adSlot);
            }

            ins.setAttribute('data-ad-format', this.options.adFormat);
            if (this.options.fullWidth) {
                ins.setAttribute('data-full-width-responsive', 'true');
            }

            // Create Close button
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '✕ Close Ad';
            closeBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                padding: 8px 16px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                z-index: 1000;
                font-size: 14px;
                font-family: Arial, sans-serif;
            `;

            closeBtn.addEventListener('click', () => {
                this.hideAd();
                // Resume video only if not ended
                if (!this.player.video.ended) {
                    this.player.video.play();
                }
            });

            this.adContainer.appendChild(ins);
            this.adContainer.appendChild(closeBtn);
            this.player.container.appendChild(this.adContainer);
        }

        /**
         * Load AdSense script
         */
        loadAdSenseScript() {
            if (document.querySelector('script[src*="adsbygoogle.js"]')) {
                this.initializeAd();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
            script.async = true;
            script.crossOrigin = 'anonymous';
            script.onload = () => this.initializeAd();
            script.onerror = () => {
                console.error('🎬 Failed to load AdSense script');
            };
            document.head.appendChild(script);
        }

        /**
         * Initialize ad
         */
        initializeAd() {
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                this.isAdLoaded = true;

                if (this.options.debug) {
                    console.log('🎬 AdSense ad initialized');
                }

                // Show ad immediately if video is paused or not started
                if (this.player.video.paused) {
                    this.showAd();
                }
            } catch (error) {
                console.error('🎬 AdSense initialization error:', error);
            }
        }

        /**
         * Attach video events
         */
        attachVideoEvents() {
            // Show ad when video is paused
            this.player.video.addEventListener('pause', () => {
                this.showAd();
            });

            // Show ad when video ends
            this.player.video.addEventListener('ended', () => {
                this.showAd();
            });

            // Hide ad when video starts playing
            this.player.video.addEventListener('play', () => {
                this.hideAd();
            });

            // Show ad on load if no autoplay
            this.player.video.addEventListener('loadedmetadata', () => {
                if (this.player.video.paused && this.isAdLoaded) {
                    this.showAd();
                }
            });
        }

        /**
         * Show ad
         */
        showAd() {
            if (this.isAdLoaded && this.adContainer) {
                this.adContainer.style.display = 'block';
                this.player.triggerEvent('adstarted');

                if (this.options.debug) {
                    console.log('🎬 Ad shown');
                }
            }
        }

        /**
         * Hide ad
         */
        hideAd() {
            if (this.adContainer) {
                this.adContainer.style.display = 'none';
                this.player.triggerEvent('adcomplete');

                if (this.options.debug) {
                    console.log('🎬 Ad hidden');
                }
            }
        }

        /**
         * Dispose plugin
         */
        dispose() {
            if (this.adContainer) {
                this.adContainer.remove();
            }

            if (this.options.debug) {
                console.log('🎬 AdSense Video Plugin disposed');
            }
        }
    }

    // Register plugin globally
    if (typeof window.registerMYETVPlugin === 'function') {
        window.registerMYETVPlugin('adsense', AdSenseVideoPlugin);
    }

})();
/* GLOBAL_END */