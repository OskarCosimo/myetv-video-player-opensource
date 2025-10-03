/* VAST/VPAID Custom Plugin for MYETV Video Player
 * Custom implementation for VAST and VPAID ads
 * No external dependencies
 * Created by https://www.myetv.tv https://oskarcosimo.com
 */

/* GLOBAL_START */
(function () {
    'use strict';

    /**
     * VAST/VPAID Custom Plugin
     * Handles VAST and VPAID ads without external SDK
     */
    class VASTPlugin {
        constructor(player, options = {}) {
            this.player = player;
            this.options = {
                vastUrl: options.vastUrl || '',
                vastXML: options.vastXML || null,
                skipDelay: options.skipDelay || 5, // seconds
                maxRedirects: options.maxRedirects || 5,
                timeout: options.timeout || 8000,
                debug: options.debug || false,
                adLabel: options.adLabel || 'Pubblicità',
                skipText: options.skipText || 'Salta annuncio',
                ...options
            };

            this.adOverlay = null;
            this.isAdPlaying = false;
            this.currentAd = null;
            this.skipButton = null;
        }

        /**
         * Setup plugin
         */
        setup() {
            this.createAdOverlay();
            this.attachPlayerEvents();

            if (this.options.debug) {
                console.log('🎬 VAST Plugin initialized');
            }
        }

        /**
         * Create ad overlay element
         */
        createAdOverlay() {
            this.adOverlay = document.createElement('div');
            this.adOverlay.className = 'vast-ad-overlay';
            this.adOverlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #000;
                z-index: 1000;
                display: none;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            `;

            // Ad label
            const adLabel = document.createElement('div');
            adLabel.className = 'vast-ad-label';
            adLabel.textContent = this.options.adLabel;
            adLabel.style.cssText = `
                position: absolute;
                top: 10px;
                left: 10px;
                background: rgba(0, 0, 0, 0.7);
                color: #fff;
                padding: 5px 10px;
                border-radius: 3px;
                font-size: 12px;
                z-index: 1001;
            `;
            this.adOverlay.appendChild(adLabel);

            // Ad video element
            this.adVideo = document.createElement('video');
            this.adVideo.className = 'vast-ad-video';
            this.adVideo.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: contain;
            `;
            this.adOverlay.appendChild(this.adVideo);

            // Skip button
            this.skipButton = document.createElement('button');
            this.skipButton.className = 'vast-skip-button';
            this.skipButton.style.cssText = `
                position: absolute;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: #fff;
                border: none;
                padding: 10px 20px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 14px;
                z-index: 1002;
                display: none;
            `;
            this.skipButton.addEventListener('click', () => this.skipAd());
            this.adOverlay.appendChild(this.skipButton);

            this.player.container.appendChild(this.adOverlay);
        }

        /**
         * Load and parse VAST
         */
        async loadVAST() {
            try {
                let vastXML;

                if (this.options.vastXML) {
                    vastXML = this.options.vastXML;
                } else if (this.options.vastUrl) {
                    const response = await fetch(this.options.vastUrl, {
                        method: 'GET',
                        timeout: this.options.timeout
                    });
                    vastXML = await response.text();
                } else {
                    throw new Error('No VAST URL or XML provided');
                }

                const parser = new DOMParser();
                const vastDoc = parser.parseFromString(vastXML, 'text/xml');

                // Parse VAST document
                this.currentAd = this.parseVAST(vastDoc);

                if (this.currentAd) {
                    this.playAd();
                } else {
                    throw new Error('No valid ad found in VAST response');
                }

            } catch (error) {
                console.error('🎬 VAST loading error:', error);
                this.player.triggerEvent('aderror', { error });
                this.resumeContent();
            }
        }

        /**
         * Parse VAST XML
         */
        parseVAST(vastDoc) {
            const ad = vastDoc.querySelector('Ad');
            if (!ad) return null;

            const inline = ad.querySelector('InLine');
            if (!inline) {
                // Handle VAST wrapper
                const wrapper = ad.querySelector('Wrapper');
                if (wrapper) {
                    console.warn('🎬 VAST Wrapper not fully supported in this version');
                }
                return null;
            }

            // Get media file
            const mediaFiles = inline.querySelectorAll('MediaFile');
            let selectedMedia = null;

            // Prefer MP4 format
            for (const media of mediaFiles) {
                const type = media.getAttribute('type');
                if (type && type.includes('mp4')) {
                    selectedMedia = media;
                    break;
                }
            }

            if (!selectedMedia && mediaFiles.length > 0) {
                selectedMedia = mediaFiles[0];
            }

            if (!selectedMedia) return null;

            // Get tracking URLs
            const impressions = Array.from(inline.querySelectorAll('Impression'))
                .map(imp => imp.textContent.trim());

            const clickThrough = inline.querySelector('ClickThrough')?.textContent.trim();
            const clickTracking = Array.from(inline.querySelectorAll('ClickTracking'))
                .map(click => click.textContent.trim());

            // Get skip offset
            const skipOffset = inline.querySelector('Linear')?.getAttribute('skipoffset');

            return {
                mediaFileUrl: selectedMedia.textContent.trim(),
                impressions,
                clickThrough,
                clickTracking,
                skipOffset: this.parseSkipOffset(skipOffset),
                duration: parseInt(inline.querySelector('Duration')?.textContent) || 0
            };
        }

        /**
         * Parse skip offset
         */
        parseSkipOffset(offset) {
            if (!offset) return this.options.skipDelay;

            // Parse formats like "00:00:05" or "5s" or "25%"
            if (offset.includes(':')) {
                const parts = offset.split(':');
                return parseInt(parts[parts.length - 1]);
            } else if (offset.endsWith('s')) {
                return parseInt(offset);
            }

            return this.options.skipDelay;
        }

        /**
         * Play ad
         */
        playAd() {
            if (!this.currentAd) return;

            this.isAdPlaying = true;
            this.adOverlay.style.display = 'flex';
            this.player.video.pause();

            // Set ad source
            this.adVideo.src = this.currentAd.mediaFileUrl;
            this.adVideo.play();

            // Fire impression tracking
            this.fireTrackingURLs(this.currentAd.impressions);

            // Setup skip button
            if (this.currentAd.skipOffset > 0) {
                setTimeout(() => {
                    this.skipButton.textContent = this.options.skipText;
                    this.skipButton.style.display = 'block';
                }, this.currentAd.skipOffset * 1000);
            }

            // Ad ended
            this.adVideo.addEventListener('ended', () => {
                this.adEnded();
            });

            // Ad click
            this.adVideo.addEventListener('click', () => {
                if (this.currentAd.clickThrough) {
                    window.open(this.currentAd.clickThrough, '_blank');
                    this.fireTrackingURLs(this.currentAd.clickTracking);
                }
            });

            this.player.triggerEvent('adstarted');
        }

        /**
         * Skip ad
         */
        skipAd() {
            this.adVideo.pause();
            this.adVideo.src = '';
            this.adEnded();
            this.player.triggerEvent('adskipped');
        }

        /**
         * Ad ended
         */
        adEnded() {
            this.isAdPlaying = false;
            this.adOverlay.style.display = 'none';
            this.skipButton.style.display = 'none';
            this.currentAd = null;
            this.resumeContent();
            this.player.triggerEvent('adcomplete');
        }

        /**
         * Resume content playback
         */
        resumeContent() {
            this.player.video.play();
        }

        /**
         * Fire tracking URLs
         */
        fireTrackingURLs(urls) {
            if (!urls || urls.length === 0) return;

            urls.forEach(url => {
                if (url) {
                    // Use Image object for tracking pixels
                    const img = new Image();
                    img.src = url;
                }
            });
        }

        /**
         * Attach player events
         */
        attachPlayerEvents() {
            this.player.video.addEventListener('play', () => {
                if (!this.isAdPlaying && this.options.vastUrl) {
                    this.loadVAST();
                }
            }, { once: true });
        }

        /**
         * Dispose plugin
         */
        dispose() {
            if (this.adOverlay) {
                this.adOverlay.remove();
            }

            if (this.options.debug) {
                console.log('🎬 VAST Plugin disposed');
            }
        }
    }

    // Register plugin globally
    if (typeof window.registerMYETVPlugin === 'function') {
        window.registerMYETVPlugin('vast', VASTPlugin);
    }

})();
/* GLOBAL_END */
