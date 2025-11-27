/**
 * SoundCloud Plugin for MYETV Video Player
 * Adds SoundCloud integration with fixed logo in controlbar
 * Created by https://www.myetv.tv - https://oskarcosimo.com
 */

(function () {
    'use strict';

    /**
     * SoundCloud Plugin Class
     */
    class SoundCloudPlugin {
        constructor(player, options = {}) {
            this.player = player;
            this.options = {
                enabled: true,
                soundcloudUrl: '', // SoundCloud track URL
                controlsDisplayTime: 10000, // Time to show SoundCloud controls (10 seconds)

                // SoundCloud embed options
                color: 'ff5500', // Player color (hex without #)
                autoPlay: false, // Auto play track
                hideRelated: true, // Hide related tracks
                showComments: false, // Show comments
                showUser: true, // Show user info
                showReposts: false, // Show reposts
                showTeaser: false, // Show teaser
                visualMode: false, // Visual mode (waveform)
                showArtwork: true, // Show artwork
                buying: false, // Show buy button
                sharing: false, // Show share button
                download: false, // Show download button
                showPlaycount: false, // Show play count

                debug: false,
                ...options
            };

            this.soundcloudLogo = null;
            this.soundcloudContainer = null;
            this.soundcloudIframe = null;
            this.invisibleOverlay = null;
            this.soundcloudControlsTimeout = null;
            this.widget = null;
            this.isInitialized = false;
            this.isPlaying = false;
            this.duration = 0;
            this.currentTime = 0;
            this.lastVolume = 1.0;
            this.wasAutoHideEnabled = false;
            this.mouseBlocker = null;
            this.volumeCheckInterval = null; // Track volume polling interval
            this.tooltipUpdateInterval = null;
            this.api = player.getPluginAPI ? player.getPluginAPI() : null;

            if (this.options.debug) {
                console.log('SoundCloud Plugin initialized with options:', this.options);
            }

            // Load SoundCloud Widget API
            this.loadSoundCloudWidgetAPI(() => {
                setTimeout(() => {
                    this.setup();
                }, 100);
            });
        }

        /**
         * Load SoundCloud Widget API
         */
        loadSoundCloudWidgetAPI(callback) {
            if (window.SC && window.SC.Widget) {
                if (this.options.debug) {
                    console.log('SoundCloud Widget API already loaded');
                }
                callback();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://w.soundcloud.com/player/api.js';
            script.onload = () => {
                if (this.options.debug) {
                    console.log('SoundCloud Widget API loaded');
                }
                callback();
            };
            document.head.appendChild(script);
        }

        /**
         * Setup the plugin
         */
        setup() {
            if (!this.options.enabled) {
                if (this.options.debug) {
                    console.log('SoundCloud Plugin is disabled');
                }
                return;
            }

            try {
                // Create SoundCloud player (always visible)
                if (this.options.soundcloudUrl) {
                    this.createPermanentSoundCloudPlayer();
                    this.addSoundCloudLogo();
                }

                // Intercept play/pause buttons
                this.interceptPlayPauseButtons();

                // Intercept volume controls
                this.interceptVolumeControls();

                // Intercept progress bar
                this.interceptProgressBar();

                this.hideSpeedPiPButtons();

                this.isInitialized = true;

                if (this.options.debug) {
                    console.log('SoundCloud Plugin setup completed');
                }
            } catch (error) {
                console.error('SoundCloud Plugin setup error:', error);
            }
        }

        /**
         * Create permanent SoundCloud player (always visible)
         */
        createPermanentSoundCloudPlayer() {
            const container = this.api ? this.api.container : this.player.container;
            if (!container) return;

            const embedUrl = this.buildEmbedUrl(false);
            if (!embedUrl) return;

            // Create container for SoundCloud
            const soundcloudContainer = document.createElement('div');
            soundcloudContainer.className = 'soundcloud-container';
            soundcloudContainer.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
                background: #000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                box-sizing: border-box;
            `;

            // Create iframe
            const iframe = document.createElement('iframe');
            iframe.width = '100%';
            iframe.height = this.options.visualMode ? '450' : '166';
            iframe.scrolling = 'no';
            iframe.frameBorder = 'no';
            iframe.allow = 'autoplay';
            iframe.src = embedUrl;
            iframe.id = 'soundcloud-iframe-' + Date.now();
            iframe.style.cssText = `
                max-width: ${this.options.visualMode ? '800px' : '600px'};
                border: none;
                border-radius: 8px;
            `;

            soundcloudContainer.appendChild(iframe);

            // Create invisible overlay
            const invisibleOverlay = document.createElement('div');
            invisibleOverlay.className = 'soundcloud-invisible-overlay';
            invisibleOverlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 2;
                background: transparent;
                cursor: pointer;
                pointer-events: auto;
                transition: opacity 0.3s ease;
            `;

            // Click on overlay toggles play/pause
            invisibleOverlay.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.togglePlayPause();
            });

            // Get controls element
            const controls = container.querySelector('.controls');

            // Insert BEFORE controls
            if (controls) {
                container.insertBefore(soundcloudContainer, controls);
                container.insertBefore(invisibleOverlay, controls);
                controls.style.zIndex = '10';
                controls.style.position = 'absolute';
                controls.style.pointerEvents = 'auto';
            } else {
                container.appendChild(soundcloudContainer);
                container.appendChild(invisibleOverlay);
            }

            this.soundcloudContainer = soundcloudContainer;
            this.soundcloudIframe = iframe;
            this.invisibleOverlay = invisibleOverlay;

            // Initialize Widget API
            setTimeout(() => {
                this.initializeWidget();
            }, 1000);

            if (this.options.debug) {
                console.log('SoundCloud Plugin: Permanent player created');
            }
        }

        /**
         * Initialize SoundCloud Widget
         */
        initializeWidget() {
            if (!window.SC || !window.SC.Widget) {
                console.error('SoundCloud Widget API not available');
                return;
            }

            this.widget = window.SC.Widget(this.soundcloudIframe);

            // Bind widget events
            this.widget.bind(window.SC.Widget.Events.READY, () => {
                if (this.options.debug) {
                    console.log('SoundCloud Widget ready');
                }

                // Set initial volume to 100%
                this.widget.setVolume(100);

                if (this.options.debug) {
                    console.log('Widget volume set to 100%');
                }

                // Get duration
                this.widget.getDuration((duration) => {
                    this.duration = duration / 1000;
                    this.updateDurationDisplay();
                });

                if (this.soundcloudIframe) {
                    const logoContainer = this.soundcloudIframe.parentElement;
                    const logoIcon = this.soundcloudIframe.contentDocument?.querySelector('svg, img, .sc-logo');

                    if (logoContainer) {
                        logoContainer.style.marginRight = '4px';
                        logoContainer.style.paddingLeft = '2px';
                    }

                    if (logoIcon) {
                        logoIcon.style.marginLeft = '0';
                        logoIcon.style.paddingLeft = '0';
                        logoIcon.style.display = 'block';
                        logoIcon.style.maxHeight = '32px';
                        logoIcon.style.width = 'auto';
                    }

                    if (this.options.debug) {
                        console.log('🎨 SoundCloud logo container and icon spacing fixed');
                    }
                }

                // Listen to play/pause events
                this.widget.bind(window.SC.Widget.Events.PLAY, () => {
                    this.isPlaying = true;
                    this.updatePlayPauseButton();
                    this.startTimeUpdate();
                });

                this.widget.bind(window.SC.Widget.Events.PAUSE, () => {
                    this.isPlaying = false;
                    this.updatePlayPauseButton();
                    this.stopTimeUpdate();
                });

                this.widget.bind(window.SC.Widget.Events.FINISH, () => {
                    this.isPlaying = false;
                    this.updatePlayPauseButton();
                    this.stopTimeUpdate();
                });
            });
        }

        /**
         * Start time update interval
         */
        startTimeUpdate() {
            this.stopTimeUpdate();

            this.timeUpdateInterval = setInterval(() => {
                if (this.widget) {
                    this.widget.getPosition((position) => {
                        this.currentTime = position / 1000;
                        this.updateTimeDisplay();
                        this.updateProgressBar();
                    });
                }
            }, 100);
        }

        /**
         * Stop time update interval
         */
        stopTimeUpdate() {
            if (this.timeUpdateInterval) {
                clearInterval(this.timeUpdateInterval);
                this.timeUpdateInterval = null;
            }
        }

        /**
         * Update duration display
         */
        updateDurationDisplay() {
            const durationEl = this.player.controls?.querySelector('.duration');
            if (durationEl) {
                durationEl.textContent = this.formatTime(this.duration);
            }
        }

        /**
         * Update time display
         */
        updateTimeDisplay() {
            const currentTimeEl = this.player.controls?.querySelector('.current-time');
            if (currentTimeEl) {
                currentTimeEl.textContent = this.formatTime(this.currentTime);
            }
        }

        /**
         * Update progress bar
         */
        updateProgressBar() {
            if (this.duration === 0) return;

            const percentage = (this.currentTime / this.duration) * 100;

            const progressFilled = this.player.controls?.querySelector('.progress-filled');
            if (progressFilled) {
                progressFilled.style.width = percentage + '%';
            }

            const progressHandle = this.player.controls?.querySelector('.progress-handle');
            if (progressHandle) {
                progressHandle.style.left = percentage + '%';
            }
        }

        hideSpeedPiPButtons() {
            // speed
            const speedElements = this.player.controls?.querySelectorAll(
                '[data-speed], .speed-btn, .playback-speed, .speed-control, .playback-rate, .speed-menu, .speed-container, .speed-select'
            );

            speedElements?.forEach(el => {
                el.style.display = 'none';
                if (this.options.debug) console.log('Speed control HIDDEN');
            });

            // PiP
            const pipElements = this.player.controls?.querySelectorAll(
                '[data-pip], .pip-btn, .picture-in-picture, .pip-icon'
            );

            pipElements?.forEach(el => {
                el.style.display = 'none';
                if (this.options.debug) console.log('PiP control HIDDEN');
            });
        }

        showSpeedPiPButtons() {
            // SPEED - reenable
            const speedElements = this.player.controls?.querySelectorAll(
                '[data-speed], .speed-btn, .playback-speed, .speed-control, .playback-rate, .speed-menu, .speed-container, .speed-select'
            );

            speedElements?.forEach(el => {
                el.style.display = '';
                el.style.opacity = '1';
                el.style.pointerEvents = 'auto';
            });

            // PiP
            const pipElements = this.player.controls?.querySelectorAll(
                '[data-pip], .pip-btn, .picture-in-picture, .pip-icon'
            );

            pipElements?.forEach(el => {
                el.style.display = '';
                el.style.opacity = '1';
                el.style.pointerEvents = 'auto';
            });
        }

        /**
         * Update play/pause button
         */
        updatePlayPauseButton() {
            const playIcon = this.player.controls?.querySelector('.play-icon');
            const pauseIcon = this.player.controls?.querySelector('.pause-icon');

            if (this.isPlaying) {
                if (playIcon) playIcon.classList.add('hidden');
                if (pauseIcon) pauseIcon.classList.remove('hidden');
            } else {
                if (playIcon) playIcon.classList.remove('hidden');
                if (pauseIcon) pauseIcon.classList.add('hidden');
            }
        }

        /**
         * Format time in MM:SS
         */
        formatTime(seconds) {
            if (isNaN(seconds) || seconds === 0) return '0:00';

            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return mins + ':' + (secs < 10 ? '0' : '') + secs;
        }

        /**
         * Toggle play/pause
         */
        togglePlayPause() {
            if (!this.widget) return;

            if (this.isPlaying) {
                this.widget.pause();
            } else {
                this.widget.play();
            }
        }

        /**
         * Intercept play/pause buttons
         */
        interceptPlayPauseButtons() {
            const playPauseBtn = this.player.controls?.querySelector('.play-pause-btn');
            if (!playPauseBtn) return;

            playPauseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.togglePlayPause();
            }, true);
        }

        /**
         * Intercept volume controls
         */
        interceptVolumeControls() {
            const volumeSlider = this.player.controls?.querySelector('.volume-slider');
            if (volumeSlider) {
                const volumeHandler = (e) => {
                    const volume = parseFloat(e.target.value);

                    if (this.widget) {
                        this.widget.setVolume(volume);

                        if (this.options.debug) {
                            console.log('🎚️ Volume set to:', volume, '(0-1 range)');
                        }
                    }
                };

                volumeSlider.addEventListener('input', volumeHandler, false);
                volumeSlider.addEventListener('change', volumeHandler, false);
                volumeSlider.addEventListener('mouseup', volumeHandler, false);
            }

            // MUTE BUTTON
            const muteBtn = this.player.controls?.querySelector('.mute-btn');
            if (muteBtn) {
                muteBtn.addEventListener('click', () => {
                    setTimeout(() => {
                        const volumeSlider = this.player.controls?.querySelector('.volume-slider');
                        if (volumeSlider && this.widget) {
                            const currentVolume = parseFloat(volumeSlider.value); // 0-1
                            this.widget.setVolume(currentVolume); // USA 0-1

                            if (this.options.debug) {
                                console.log('Mute synced, volume:', currentVolume);
                            }
                        }
                    }, 50);
                });
            }
        }

        /**
         * Intercept progress bar
         */
        interceptProgressBar() {
            const progressContainer = this.player.controls?.querySelector('.progress-container');
            if (!progressContainer) return;

            // Click to seek
            progressContainer.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();

                if (!this.widget || this.duration === 0) return;

                const rect = progressContainer.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = clickX / rect.width;
                const seekTime = percentage * this.duration;

                this.widget.seekTo(seekTime * 1000);
            }, true);

            // Find or create tooltip
            let tooltip = progressContainer.querySelector('.seek-tooltip');
            if (!tooltip) {
                tooltip = document.createElement('div');
                tooltip.className = 'seek-tooltip';
                progressContainer.appendChild(tooltip);
            }

            // Update tooltip on mousemove
            progressContainer.addEventListener('mousemove', (e) => {
                if (!this.widget || this.duration === 0) return;

                const rect = progressContainer.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const percentage = Math.max(0, Math.min(1, mouseX / rect.width));
                const time = percentage * this.duration;

                // Update tooltip text and position
                tooltip.textContent = this.formatTime(time);
                tooltip.style.left = mouseX + 'px';
                tooltip.style.visibility = 'visible';
            });

            // Hide tooltip on mouseleave
            progressContainer.addEventListener('mouseleave', () => {
                if (tooltip) {
                    tooltip.style.visibility = 'hidden';
                }
            });
        }

        /**
         * Add SoundCloud logo to controlbar
         */
        addSoundCloudLogo() {
            if (!this.player.controls) {
                console.error('SoundCloud Plugin: Controls not available');
                return;
            }

            if (this.player.controls.querySelector('.soundcloud-logo-link')) {
                return;
            }

            const logoButton = document.createElement('button');
            logoButton.className = 'control-btn soundcloud-logo-link';
            logoButton.title = 'SoundCloud Player';
            logoButton.setAttribute('aria-label', 'SoundCloud Player');
            logoButton.type = 'button';

            logoButton.style.cssText = `
                display: flex !important;
                align-items: center;
                justify-content: center;
                background: none;
                border: none;
                padding: 8px;
                opacity: 0.85;
                transition: all 0.3s ease;
                cursor: pointer;
                flex-shrink: 0;
                margin: 0 2px 0 6px;
                border-radius: 6px;
                visibility: visible !important;
            `;

            logoButton.innerHTML = `
                <svg viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg" style="display: block; width: 50px; height: 24px; color: #ff5500; transition: all 0.3s ease;">
                    <title>SoundCloud</title>
                    <rect x="5" y="20" width="3" height="10" rx="1.5" fill="currentColor" opacity="0.5"/>
                    <rect x="12" y="16" width="3" height="18" rx="1.5" fill="currentColor" opacity="0.6"/>
                    <rect x="19" y="12" width="3" height="26" rx="1.5" fill="currentColor" opacity="0.7"/>
                    <rect x="26" y="8" width="3" height="34" rx="1.5" fill="currentColor" opacity="0.8"/>
                    <rect x="33" y="14" width="3" height="22" rx="1.5" fill="currentColor" opacity="0.7"/>
                    <rect x="40" y="18" width="3" height="14" rx="1.5" fill="currentColor" opacity="0.6"/>
                    <rect x="47" y="22" width="3" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
                    <path d="M 58 25 Q 58 20 62 20 Q 64 20 65 21 Q 67 18 72 18 Q 78 18 80 23 Q 84 22 87 25 Q 90 28 87 32 Q 84 35 80 34 L 62 34 Q 58 34 58 30 Q 58 28 58 25 Z" 
                          fill="currentColor" 
                          opacity="0.9"/>
                </svg>
            `;

            logoButton.addEventListener('mouseenter', () => {
                logoButton.style.opacity = '1';
                logoButton.style.transform = 'scale(1.1)';
                logoButton.style.background = 'rgba(255, 255, 255, 0.1)';
                const svg = logoButton.querySelector('svg');
                if (svg) {
                    svg.style.color = '#ff7700';
                    svg.style.filter = 'drop-shadow(0 0 8px rgba(255, 85, 0, 0.6))';
                }
            });

            logoButton.addEventListener('mouseleave', () => {
                logoButton.style.opacity = '0.85';
                logoButton.style.transform = 'scale(1)';
                logoButton.style.background = 'none';
                const svg = logoButton.querySelector('svg');
                if (svg) {
                    svg.style.color = '#ff5500';
                    svg.style.filter = 'none';
                }
            });

            logoButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showDirectSoundCloudControls();
            });

            const rightControls = this.player.controls.querySelector('.controls-right');

            if (rightControls) {
                const settingsBtn = rightControls.querySelector('.settings-btn');

                if (settingsBtn) {
                    rightControls.insertBefore(logoButton, settingsBtn.parentElement);
                } else {
                    if (rightControls.firstChild) {
                        rightControls.insertBefore(logoButton, rightControls.firstChild);
                    } else {
                        rightControls.appendChild(logoButton);
                    }
                }

                this.soundcloudLogo = logoButton;

                if (this.options.debug) {
                    console.log('SoundCloud Plugin: Logo added');
                }
            }
        }

        /**
         * Show direct SoundCloud controls
         */
        showDirectSoundCloudControls() {
            const container = this.api ? this.api.container : this.player.container;
            if (!container) return;

            // INCREASE z-index of SoundCloud container to bring it to front
            if (this.soundcloudContainer) {
                this.soundcloudContainer.style.zIndex = '9999';
            }

            // Hide the invisible overlay that blocks clicks
            if (this.invisibleOverlay) {
                this.invisibleOverlay.style.display = 'none';
                this.invisibleOverlay.style.pointerEvents = 'none';
            }

            // Hide ALL player overlays with pointer-events
            const loadingOverlay = container.querySelector('.loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
                loadingOverlay.style.pointerEvents = 'none';
            }

            const initialLoading = container.querySelector('.initial-loading');
            if (initialLoading) {
                initialLoading.style.display = 'none';
                initialLoading.style.pointerEvents = 'none';
            }

            const titleOverlay = container.querySelector('.title-overlay');
            if (titleOverlay) {
                titleOverlay.style.display = 'none';
                titleOverlay.style.pointerEvents = 'none';
            }

            const posterOverlay = container.querySelector('.video-poster-overlay');
            if (posterOverlay) {
                posterOverlay.style.display = 'none';
                posterOverlay.style.pointerEvents = 'none';
            }

            const watermark = container.querySelector('.watermark');
            if (watermark) {
                watermark.style.display = 'none';
                watermark.style.pointerEvents = 'none';
            }

            // Hide ANY other overlay
            const allOverlays = container.querySelectorAll('[class*="overlay"]');
            allOverlays.forEach(overlay => {
                if (!overlay.classList.contains('soundcloud-container') &&
                    !overlay.classList.contains('soundcloud-invisible-overlay')) {
                    overlay.style.display = 'none';
                    overlay.style.pointerEvents = 'none';
                    overlay.style.zIndex = '-1';
                }
            });

            // Hide MYETV controlbar completely
            const controls = this.player.controls;
            if (controls) {
                controls.classList.remove('show');
                controls.style.opacity = '0';
                controls.style.visibility = 'hidden';
                controls.style.pointerEvents = 'none';
            }

            // Disable auto-hide
            if (this.player.options.autoHide) {
                this.wasAutoHideEnabled = true;
                this.player.options.autoHide = false;
            }

            // Disable mouse handlers
            this.disableMouseHandlers();

            if (this.options.debug) {
                console.log('SoundCloud Plugin: Direct controls mode - z-index boosted, all overlays disabled');
            }

            // Clear existing timeout
            if (this.soundcloudControlsTimeout) {
                clearTimeout(this.soundcloudControlsTimeout);
            }

            // Restore after X seconds
            this.soundcloudControlsTimeout = setTimeout(() => {
                // RESTORE z-index of SoundCloud container
                if (this.soundcloudContainer) {
                    this.soundcloudContainer.style.zIndex = '1';
                }

                // Restore invisible overlay
                if (this.invisibleOverlay) {
                    this.invisibleOverlay.style.display = 'block';
                    this.invisibleOverlay.style.pointerEvents = 'auto';
                }

                // Restore controlbar
                if (controls) {
                    controls.classList.add('show');
                    controls.style.opacity = '';
                    controls.style.visibility = '';
                    controls.style.pointerEvents = '';
                }

                // Re-enable auto-hide
                if (this.wasAutoHideEnabled) {
                    this.player.options.autoHide = true;
                    this.wasAutoHideEnabled = false;
                }

                // Re-enable mouse handlers
                this.enableMouseHandlers();

                if (this.options.debug) {
                    console.log('SoundCloud Plugin: Normal mode restored');
                }

            }, this.options.controlsDisplayTime);
        }

        /**
         * Disable mouse handlers
         */
        disableMouseHandlers() {
            // Temporarily disable player's mouse handlers
            if (this.player.onMouseMove) {
                this.player._originalOnMouseMove = this.player.onMouseMove;
                this.player.onMouseMove = () => { };
            }

            if (this.player.showControlsNow) {
                this.player._originalShowControlsNow = this.player.showControlsNow;
                this.player.showControlsNow = () => { };
            }

            if (this.player.resetAutoHideTimer) {
                this.player._originalResetAutoHideTimer = this.player.resetAutoHideTimer;
                this.player.resetAutoHideTimer = () => { };
            }

            if (this.options.debug) {
                console.log('Mouse handlers disabled');
            }
        }

        /**
         * Enable mouse handlers
         */
        enableMouseHandlers() {
            // Restore player's mouse handlers
            if (this.player._originalOnMouseMove) {
                this.player.onMouseMove = this.player._originalOnMouseMove;
                delete this.player._originalOnMouseMove;
            }

            if (this.player._originalShowControlsNow) {
                this.player.showControlsNow = this.player._originalShowControlsNow;
                delete this.player._originalShowControlsNow;
            }

            if (this.player._originalResetAutoHideTimer) {
                this.player.resetAutoHideTimer = this.player._originalResetAutoHideTimer;
                delete this.player._originalResetAutoHideTimer;
            }

            if (this.options.debug) {
                console.log('Mouse handlers enabled');
            }
        }

        /**
         * Build SoundCloud embed URL
         */
        buildEmbedUrl(autoplay = false) {
            const trackId = this.extractSoundCloudTrackId(this.options.soundcloudUrl);

            if (!trackId) {
                console.error('SoundCloud Plugin: Invalid SoundCloud URL');
                return null;
            }

            const params = new URLSearchParams({
                url: `https://soundcloud.com/${trackId}`,
                color: this.options.color.replace('#', ''),
                auto_play: autoplay ? 'true' : 'false',
                hide_related: this.options.hideRelated ? 'true' : 'false',
                show_comments: this.options.showComments ? 'true' : 'false',
                show_user: this.options.showUser ? 'true' : 'false',
                show_reposts: this.options.showReposts ? 'true' : 'false',
                show_teaser: this.options.showTeaser ? 'true' : 'false',
                visual: this.options.visualMode ? 'true' : 'false'
            });

            if (!this.options.showArtwork) {
                params.append('show_artwork', 'false');
            }

            return `https://w.soundcloud.com/player/?${params.toString()}`;
        }

        /**
         * Extract track ID
         */
        extractSoundCloudTrackId(url) {
            if (!url) return null;
            try {
                const urlObj = new URL(url);
                return urlObj.pathname.substring(1);
            } catch (error) {
                return null;
            }
        }

        /**
         * Dispose
         */
        dispose() {
            this.stopTimeUpdate();

            if (this.soundcloudLogo && this.soundcloudLogo.parentNode) {
                this.soundcloudLogo.parentNode.removeChild(this.soundcloudLogo);
            }
            if (this.soundcloudContainer && this.soundcloudContainer.parentNode) {
                this.soundcloudContainer.parentNode.removeChild(this.soundcloudContainer);
            }
            if (this.invisibleOverlay && this.invisibleOverlay.parentNode) {
                this.invisibleOverlay.parentNode.removeChild(this.invisibleOverlay);
            }
            if (this.soundcloudControlsTimeout) {
                clearTimeout(this.soundcloudControlsTimeout);
            }

            // Restore mouse handlers if disabled
            this.enableMouseHandlers();

            // Restore auto-hide if it was disabled
            if (this.wasAutoHideEnabled) {
                this.player.options.autoHide = true;
            }
            // Stop volume polling
            if (this.volumeCheckInterval) {
                clearInterval(this.volumeCheckInterval);
                this.volumeCheckInterval = null;
            }
            // Stop tooltip polling
            if (this.tooltipUpdateInterval) {
                clearInterval(this.tooltipUpdateInterval);
                this.tooltipUpdateInterval = null;
            }
            this.showSpeedPiPButtons();
        }
    }

    // Register plugin
    if (typeof window.registerMYETVPlugin === 'function') {
        window.registerMYETVPlugin('soundcloud', SoundCloudPlugin);
        console.log('✓ SoundCloud Plugin registered successfully');
    }

})();
