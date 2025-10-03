/* Google IMA Plugin for MYETV Video Player
 * Integrates Google Interactive Media Ads SDK
 * Supports VAST, VMAP, VPAID
 * Created by https://www.myetv.tv https://oskarcosimo.com
 */

// ===================================================================
// GLOBAL CODE - Will be placed OUTSIDE the class by build script
// ===================================================================

/* GLOBAL_START */
(function () {
    'use strict';

    /**
     * Google IMA Ads Plugin
     * Manages video advertising through Google IMA SDK
     */
    class GoogleIMAPlugin {
        constructor(player, options = {}) {
            this.player = player;
            this.options = {
                adTagUrl: options.adTagUrl || '',
                adsResponse: options.adsResponse || null,
                locale: options.locale || 'it',
                showCountdown: options.showCountdown !== false,
                showControls: options.showControls !== false,
                autoPlayAdBreaks: options.autoPlayAdBreaks !== false,
                disableCustomPlaybackForIOS10Plus: options.disableCustomPlaybackForIOS10Plus || false,
                vastLoadTimeout: options.vastLoadTimeout || 5000,
                debug: options.debug || false,
                vpaidMode: options.vpaidMode || 'ENABLED', // ENABLED, INSECURE, DISABLED
                adLabel: options.adLabel || 'Pubblicità',
                adLabelNofN: options.adLabelNofN || 'di',
                nonLinearWidth: options.nonLinearWidth || null,
                nonLinearHeight: options.nonLinearHeight || null,
                numRedirects: options.numRedirects || 4,
                adsRenderingSettings: options.adsRenderingSettings || {},
                ...options
            };

            this.adDisplayContainer = null;
            this.adsLoader = null;
            this.adsManager = null;
            this.adContainer = null;
            this.contentComplete = false;
            this.isAdPlaying = false;

            // Check if IMA SDK is loaded
            if (typeof google === 'undefined' || typeof google.ima === 'undefined') {
                console.error('🎬 Google IMA SDK not loaded. Please include: //imasdk.googleapis.com/js/sdkloader/ima3.js');
                return;
            }

            this.ima = google.ima;
        }

        /**
         * Setup plugin
         */
        setup() {
            this.createAdContainer();
            this.initializeIMA();
            this.attachPlayerEvents();

            if (this.options.debug) {
                console.log('🎬 Google IMA Plugin initialized');
            }
        }

        /**
         * Create ad container element
         */
        createAdContainer() {
            this.adContainer = document.createElement('div');
            this.adContainer.id = `ima-ad-container-${Date.now()}`;
            this.adContainer.className = 'ima-ad-container';
            this.adContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1000;
                display: none;
            `;
            this.player.container.appendChild(this.adContainer);
        }

        /**
         * Initialize IMA SDK
         */
        initializeIMA() {
            // Set locale
            this.ima.settings.setLocale(this.options.locale);

            // Set VPAID mode
            if (this.options.vpaidMode === 'DISABLED') {
                this.ima.settings.setVpaidMode(this.ima.ImaSdkSettings.VpaidMode.DISABLED);
            } else if (this.options.vpaidMode === 'INSECURE') {
                this.ima.settings.setVpaidMode(this.ima.ImaSdkSettings.VpaidMode.INSECURE);
            } else {
                this.ima.settings.setVpaidMode(this.ima.ImaSdkSettings.VpaidMode.ENABLED);
            }

            // Create ad display container
            this.adDisplayContainer = new this.ima.AdDisplayContainer(
                this.adContainer,
                this.player.video
            );

            // Create ads loader
            this.adsLoader = new this.ima.AdsLoader(this.adDisplayContainer);

            // Add event listeners
            this.adsLoader.addEventListener(
                this.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
                this.onAdsManagerLoaded.bind(this),
                false
            );

            this.adsLoader.addEventListener(
                this.ima.AdErrorEvent.Type.AD_ERROR,
                this.onAdError.bind(this),
                false
            );
        }

        /**
         * Request ads
         */
        requestAds() {
            if (!this.options.adTagUrl && !this.options.adsResponse) {
                console.warn('🎬 No ad tag URL or ads response provided');
                return;
            }

            // Initialize ad display container on user interaction
            if (!this.adDisplayContainer.initialized) {
                this.adDisplayContainer.initialize();
            }

            // Create ads request
            const adsRequest = new this.ima.AdsRequest();

            if (this.options.adsResponse) {
                adsRequest.adsResponse = this.options.adsResponse;
            } else {
                adsRequest.adTagUrl = this.options.adTagUrl;
            }

            adsRequest.linearAdSlotWidth = this.player.video.clientWidth;
            adsRequest.linearAdSlotHeight = this.player.video.clientHeight;
            adsRequest.nonLinearAdSlotWidth = this.options.nonLinearWidth || this.player.video.clientWidth;
            adsRequest.nonLinearAdSlotHeight = this.options.nonLinearHeight || Math.floor(this.player.video.clientHeight / 3);
            adsRequest.vastLoadTimeout = this.options.vastLoadTimeout;

            if (this.options.numRedirects) {
                adsRequest.numRedirects = this.options.numRedirects;
            }

            // Request ads
            this.adsLoader.requestAds(adsRequest);

            if (this.options.debug) {
                console.log('🎬 Ads requested');
            }
        }

        /**
         * Ads manager loaded event handler
         */
        onAdsManagerLoaded(adsManagerLoadedEvent) {
            // Get ads manager
            const adsRenderingSettings = new this.ima.AdsRenderingSettings();
            adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

            // Apply custom rendering settings
            Object.assign(adsRenderingSettings, this.options.adsRenderingSettings);

            this.adsManager = adsManagerLoadedEvent.getAdsManager(
                this.player.video,
                adsRenderingSettings
            );

            // Attach ads manager event listeners
            this.attachAdsManagerEvents();

            try {
                // Initialize ads manager
                this.adsManager.init(
                    this.player.video.clientWidth,
                    this.player.video.clientHeight,
                    this.ima.ViewMode.NORMAL
                );

                // Start ads
                this.adsManager.start();

                if (this.options.debug) {
                    console.log('🎬 Ads manager loaded and started');
                }
            } catch (adError) {
                console.error('🎬 Ads manager error:', adError);
                this.player.video.play();
            }
        }

        /**
         * Attach ads manager event listeners
         */
        attachAdsManagerEvents() {
            // Ad started
            this.adsManager.addEventListener(
                this.ima.AdEvent.Type.STARTED,
                () => {
                    this.isAdPlaying = true;
                    this.adContainer.style.display = 'block';
                    this.player.triggerEvent('adstarted');
                    if (this.options.debug) console.log('🎬 Ad started');
                }
            );

            // Ad complete
            this.adsManager.addEventListener(
                this.ima.AdEvent.Type.COMPLETE,
                () => {
                    this.player.triggerEvent('adcomplete');
                    if (this.options.debug) console.log('🎬 Ad complete');
                }
            );

            // All ads completed
            this.adsManager.addEventListener(
                this.ima.AdEvent.Type.ALL_ADS_COMPLETED,
                () => {
                    this.isAdPlaying = false;
                    this.adContainer.style.display = 'none';
                    this.player.triggerEvent('allAdscomplete');
                    if (this.options.debug) console.log('🎬 All ads completed');
                }
            );

            // Ad paused
            this.adsManager.addEventListener(
                this.ima.AdEvent.Type.PAUSED,
                () => {
                    this.player.triggerEvent('adpaused');
                }
            );

            // Ad resumed
            this.adsManager.addEventListener(
                this.ima.AdEvent.Type.RESUMED,
                () => {
                    this.player.triggerEvent('adresumed');
                }
            );

            // Ad skipped
            this.adsManager.addEventListener(
                this.ima.AdEvent.Type.SKIPPED,
                () => {
                    this.player.triggerEvent('adskipped');
                    if (this.options.debug) console.log('🎬 Ad skipped');
                }
            );

            // Ad error
            this.adsManager.addEventListener(
                this.ima.AdErrorEvent.Type.AD_ERROR,
                this.onAdError.bind(this)
            );
        }

        /**
         * Ad error event handler
         */
        onAdError(adErrorEvent) {
            console.error('🎬 Ad error:', adErrorEvent.getError());

            if (this.adsManager) {
                this.adsManager.destroy();
            }

            this.isAdPlaying = false;
            this.adContainer.style.display = 'none';

            // Resume content playback
            this.player.video.play();

            this.player.triggerEvent('aderror', { error: adErrorEvent.getError() });
        }

        /**
         * Attach player event listeners
         */
        attachPlayerEvents() {
            // Play event - request ads if not already done
            this.player.video.addEventListener('play', () => {
                if (!this.contentComplete && !this.isAdPlaying && this.options.adTagUrl) {
                    // Request ads on first play
                    this.requestAds();
                }
            });

            // Content ended
            this.player.video.addEventListener('ended', () => {
                this.contentComplete = true;
                if (this.adsLoader) {
                    this.adsLoader.contentComplete();
                }
            });

            // Window resize
            window.addEventListener('resize', () => {
                if (this.adsManager && this.isAdPlaying) {
                    this.adsManager.resize(
                        this.player.video.clientWidth,
                        this.player.video.clientHeight,
                        this.ima.ViewMode.NORMAL
                    );
                }
            });
        }

        /**
         * Dispose plugin
         */
        dispose() {
            if (this.adsManager) {
                this.adsManager.destroy();
            }

            if (this.adsLoader) {
                this.adsLoader.destroy();
            }

            if (this.adContainer) {
                this.adContainer.remove();
            }

            if (this.options.debug) {
                console.log('🎬 Google IMA Plugin disposed');
            }
        }
    }

    // Register plugin globally
    if (typeof window.registerMYETVPlugin === 'function') {
        window.registerMYETVPlugin('googleIMA', GoogleIMAPlugin);
    }

})();
/* GLOBAL_END */
