/**
 * MyeTV Iframe Banner Ads Plugin
 * Display iframe banner ads with countdown timer and auto-close functionality
 * Supports both direct iframe URL and external ad script injection
 * 
 * Created by https://www.myetv.tv - https://oskarcosimo.com
 * 
 * @example
 * // Method 1: Direct iframe URL
 * const player = new MYETVvideoplayer('video', {
 *   plugins: {
 *     'iframe-banner-ads': {
 *       url: 'https://your-ads-server.com/banner.html',
 *       duration: 7,
 *       opacity: 0.8,
 *       minTimeBetweenAds: 60, // seconds - minimum time before showing next ad
 *       repeatInterval: 90 // seconds - show ad every 90 seconds during playback
 *     }
 *   }
 * });
 * 
 * // Method 2: External ad script
 * const player = new MYETVvideoplayer('video', {
 *   plugins: {
 *     'iframe-banner-ads': {
 *       adScript: 'https://store.myetv.tv/ads/CDN/publishers/adcode.js',
 *       adParams: {
 *         'data-size': '728x90',
 *         'data-language': '',
 *         'data-country': 'all',
 *         'data-category': 'all',
 *         'data-uidcode': '7b71af83c540d5919a8c47baf3ef2b76d6c0aa4554c716ddce0a26d9cb88fd57'
 *       },
 *       duration: 7,
 *       opacity: 0.8,
 *       minTimeBetweenAds: 60,
 *       repeatInterval: 90
 *     }
 *   }
 * });
 */

(function () {
    'use strict';

    class IframeBannerAds {
        constructor(player, options) {
            this.player = player;
            this.options = {
                url: options.url || '',
                adScript: options.adScript || '',
                adParams: options.adParams || {},
                duration: options.duration || 5, // seconds
                opacity: options.opacity !== undefined ? options.opacity : 0.85,
                showOnPlay: options.showOnPlay !== undefined ? options.showOnPlay : true,
                showOnPause: options.showOnPause !== undefined ? options.showOnPause : false,
                closeable: options.closeable !== undefined ? options.closeable : true,
                minTimeBetweenAds: options.minTimeBetweenAds || 0, // seconds - 0 = disabled
                repeatInterval: options.repeatInterval || 0, // seconds - 0 = disabled
                cookieName: options.cookieName || 'myetv_last_ad_timestamp',
                debug: options.debug || false
            };

            // Plugin state
            this.banner = null;
            this.contentContainer = null;
            this.adContainer = null;
            this.timerElement = null;
            this.closeButton = null;
            this.countdown = this.options.duration;
            this.countdownInterval = null;
            this.autoCloseTimeout = null;
            this.repeatIntervalTimeout = null;
            this.isVisible = false;
            this.mode = null; // 'iframe' or 'script'
            this.adShownCount = 0; // Track how many times ad was shown in this session

            // Determine mode based on options
            if (this.options.adScript) {
                this.mode = 'script';
            } else if (this.options.url) {
                this.mode = 'iframe';
            }

            if (this.options.debug) {
                console.log('[IframeBannerAds] Initialized with options:', this.options);
                console.log('[IframeBannerAds] Mode:', this.mode);
            }
        }

        /**
         * Setup plugin - called by player after initialization
         */
        setup() {
            if (!this.mode) {
                console.error('[IframeBannerAds] No URL or adScript provided');
                return;
            }

            this.createBanner();
            this.bindEvents();
            this.injectStyles();

            if (this.options.debug) {
                console.log('[IframeBannerAds] Setup completed');
            }
        }

        /**
         * Cookie management - Set cookie
         */
        setCookie(name, value, seconds) {
            const date = new Date();
            date.setTime(date.getTime() + (seconds * 1000));
            const expires = "expires=" + date.toUTCString();
            document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";

            if (this.options.debug) {
                console.log('[IframeBannerAds] Cookie set:', name, '=', value, 'for', seconds, 'seconds');
            }
        }

        /**
         * Cookie management - Get cookie
         */
        getCookie(name) {
            const nameEQ = name + "=";
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) {
                    return c.substring(nameEQ.length, c.length);
                }
            }
            return null;
        }

        /**
         * Check if enough time has passed since last ad
         */
        canShowAd() {
            if (this.options.minTimeBetweenAds <= 0) {
                // Feature disabled
                return true;
            }

            const lastAdTimestamp = this.getCookie(this.options.cookieName);

            if (!lastAdTimestamp) {
                // No previous ad shown
                if (this.options.debug) {
                    console.log('[IframeBannerAds] No previous ad found - can show');
                }
                return true;
            }

            const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
            const lastAd = parseInt(lastAdTimestamp, 10);
            const timePassed = now - lastAd;

            if (this.options.debug) {
                console.log('[IframeBannerAds] Time since last ad:', timePassed, 'seconds / Required:', this.options.minTimeBetweenAds);
            }

            return timePassed >= this.options.minTimeBetweenAds;
        }

        /**
         * Update last ad timestamp
         */
        updateLastAdTimestamp() {
            const now = Math.floor(Date.now() / 1000);
            // Set cookie for double the minTimeBetweenAds to ensure it persists
            const cookieDuration = this.options.minTimeBetweenAds > 0 ? this.options.minTimeBetweenAds * 2 : 86400; // 24 hours default
            this.setCookie(this.options.cookieName, now.toString(), cookieDuration);
        }

        /**
         * Start repeat interval timer
         */
        startRepeatInterval() {
            // Clear any existing repeat timer
            this.stopRepeatInterval();

            if (this.options.repeatInterval <= 0) {
                // Feature disabled
                return;
            }

            if (this.options.debug) {
                console.log('[IframeBannerAds] Starting repeat interval:', this.options.repeatInterval, 'seconds');
            }

            this.repeatIntervalTimeout = setTimeout(() => {
                if (this.options.debug) {
                    console.log('[IframeBannerAds] Repeat interval triggered - showing ad again');
                }

                // Show ad again if allowed
                if (this.canShowAd()) {
                    this.show();
                } else {
                    if (this.options.debug) {
                        console.log('[IframeBannerAds] Repeat blocked by minTimeBetweenAds');
                    }
                    // Try again after the remaining time
                    const lastAdTimestamp = this.getCookie(this.options.cookieName);
                    if (lastAdTimestamp) {
                        const now = Math.floor(Date.now() / 1000);
                        const timePassed = now - parseInt(lastAdTimestamp, 10);
                        const timeRemaining = this.options.minTimeBetweenAds - timePassed;

                        if (timeRemaining > 0) {
                            setTimeout(() => this.startRepeatInterval(), timeRemaining * 1000);
                        }
                    }
                }
            }, this.options.repeatInterval * 1000);
        }

        /**
         * Stop repeat interval timer
         */
        stopRepeatInterval() {
            if (this.repeatIntervalTimeout) {
                clearTimeout(this.repeatIntervalTimeout);
                this.repeatIntervalTimeout = null;

                if (this.options.debug) {
                    console.log('[IframeBannerAds] Repeat interval stopped');
                }
            }
        }

        injectStyles() {
            const styleId = 'myetv-iframe-banner-ads-styles';

            // Check if styles already exist
            if (document.getElementById(styleId)) {
                return;
            }

            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
    /* Iframe Banner Ads Plugin Styles */
    .myetv-iframe-banner {
      position: absolute;
      bottom: var(--player-controls-height, 60px);
      left: 50%;
      transform: translateX(-50%);
      width: clamp(300px, 90vw, 728px);
      height: auto;
      background: rgba(0, 0, 0, ${this.options.opacity});
      border-radius: 8px;
      z-index: 998;
      display: none;
      flex-direction: column;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      overflow: visible;
      transition: bottom 0.3s ease, all 0.3s ease;
    }

    .myetv-iframe-banner.visible {
      display: flex;
      animation: slideUp 0.4s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }

    .myetv-iframe-banner.hidden {
      animation: fadeOutSlideDown 0.5s ease-out forwards;
    }

    @keyframes fadeOutSlideDown {
      0% {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      100% {
        opacity: 0;
        transform: translateX(-50%) translateY(15px);
      }
    }

    .myetv-iframe-banner-content {
      flex: 0 0 90px;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px 8px 0 0;
    }

    .myetv-iframe-banner-ad-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .myetv-iframe-banner iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }

    .myetv-iframe-banner-close {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 28px;
      height: 28px;
      background: rgba(0, 0, 0, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      color: #fff;
      font-size: 18px;
      line-height: 26px;
      text-align: center;
      cursor: pointer;
      z-index: 999;
      transition: background 0.2s ease, transform 0.2s ease;
      font-weight: bold;
      user-select: none;
    }

    .myetv-iframe-banner-close:hover {
      background: rgba(255, 0, 0, 0.8);
      transform: scale(1.1);
    }

    .myetv-iframe-banner-timer {
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.85);
      color: #fff;
      font-size: 12px;
      padding: 6px 12px;
      text-align: center;
      font-family: Arial, sans-serif;
      border-radius: 4px;
      white-space: nowrap;
      z-index: 999;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    /* Compact button mode when space is limited */
    @media (max-width: 640px) and (max-height: 500px) {
      .myetv-iframe-banner {
        width: 75%; /* 3/4 of player width */
        min-width: 300px;
        max-width: 600px;
        left: 50%; /* Center */
        transform: translateX(-50%);
        border-radius: 6px;
      }

      .myetv-iframe-banner.visible {
        animation: slideUpLeft 0.4s ease-out;
      }

      @keyframes slideUpLeft {
        from {
          opacity: 0;
          transform: translateX(-20px) translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateX(0) translateY(0);
        }
      }

      .myetv-iframe-banner-content {
        flex: 0 0 50px; /* Smaller height */
        border-radius: 6px 6px 0 0;
      }

      .myetv-iframe-banner-close {
        width: 20px;
        height: 20px;
        font-size: 14px;
        line-height: 18px;
        top: 4px;
        right: 4px;
      }

      .myetv-iframe-banner-timer {
        font-size: 10px;
        padding: 4px 6px;
      }
    }

    /* Extra compact mode for very small screens */
    @media (max-width: 480px) and (max-height: 400px) {
      .myetv-iframe-banner {
        width: 75%; /* 3/4 of player width */
        min-width: 250px;
        max-width: 500px;
      }

      .myetv-iframe-banner-content {
        flex: 0 0 40px;
      }

      .myetv-iframe-banner-timer {
        font-size: 9px;
        padding: 3px 4px;
      }
    }

    /* Tablet adjustments - keep normal size */
    @media (min-width: 641px) and (max-width: 768px) {
      .myetv-iframe-banner-content {
        flex: 0 0 75px;
      }
    }

    /* Mobile portrait - keep full width but smaller */
    @media (max-width: 480px) and (min-height: 501px) {
      .myetv-iframe-banner-content {
        flex: 0 0 60px;
      }

      .myetv-iframe-banner-close {
        width: 24px;
        height: 24px;
        font-size: 16px;
        line-height: 22px;
        top: 6px;
        right: 6px;
      }

      .myetv-iframe-banner-timer {
        font-size: 11px;
        padding: 6px 8px;
      }
    }
  `;

            document.head.appendChild(style);

            if (this.options.debug) {
                console.log('[IframeBannerAds] Styles injected');
            }
        }

        /**
         * Create banner DOM structure
         */
        createBanner() {
            // Create main banner container
            this.banner = document.createElement('div');
            this.banner.className = 'myetv-iframe-banner';
            this.banner.setAttribute('role', 'complementary');
            this.banner.setAttribute('aria-label', 'Advertisement');

            // Create content container
            this.contentContainer = document.createElement('div');
            this.contentContainer.className = 'myetv-iframe-banner-content';

            // Create ad container
            this.adContainer = document.createElement('div');
            this.adContainer.className = 'myetv-iframe-banner-ad-container';

            // Load ad based on mode
            if (this.mode === 'iframe') {
                this.loadDirectIframe();
            } else if (this.mode === 'script') {
                this.loadAdScript();
            }

            this.contentContainer.appendChild(this.adContainer);

            // Create close button (only if closeable option is true)
            if (this.options.closeable) {
                this.closeButton = document.createElement('div');
                this.closeButton.className = 'myetv-iframe-banner-close';
                this.closeButton.innerHTML = '&times;';
                this.closeButton.setAttribute('role', 'button');
                this.closeButton.setAttribute('aria-label', 'Close advertisement');
                this.closeButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.hideBanner();
                });

                this.contentContainer.appendChild(this.closeButton);
            }

            // Create timer element
            this.timerElement = document.createElement('div');
            this.timerElement.className = 'myetv-iframe-banner-timer';
            this.updateTimerText();

            // Assemble banner
            this.banner.appendChild(this.contentContainer);
            this.banner.appendChild(this.timerElement);

            // Append to player container
            if (this.player.container) {
                this.player.container.appendChild(this.banner);
            } else {
                console.error('[IframeBannerAds] Player container not found');
            }

            if (this.options.debug) {
                console.log('[IframeBannerAds] Banner created');
            }
        }

        /**
         * Load direct iframe
         */
        loadDirectIframe() {
            const iframe = document.createElement('iframe');
            iframe.src = this.options.url;
            iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
            iframe.setAttribute('loading', 'lazy');
            iframe.setAttribute('title', 'Advertisement');

            this.adContainer.appendChild(iframe);

            if (this.options.debug) {
                console.log('[IframeBannerAds] Direct iframe loaded:', this.options.url);
            }
        }

        /**
         * Load external ad script with parameters
         */
        loadAdScript() {
            // Create script element
            const script = document.createElement('script');
            script.src = this.options.adScript;

            // Apply data-* attributes from adParams
            if (this.options.adParams && typeof this.options.adParams === 'object') {
                for (const [key, value] of Object.entries(this.options.adParams)) {
                    script.setAttribute(key, value);
                }
            }

            // Append script to ad container
            this.adContainer.appendChild(script);

            if (this.options.debug) {
                console.log('[IframeBannerAds] Ad script loaded:', this.options.adScript);
                console.log('[IframeBannerAds] Ad params:', this.options.adParams);
            }
        }

        /**
         * Bind player events
         */
        bindEvents() {
            if (this.options.showOnPlay) {
                this.player.addEventListener('played', () => {
                    if (this.options.debug) {
                        console.log('[IframeBannerAds] Video played - checking if can show banner');
                    }

                    if (this.canShowAd()) {
                        this.show();
                    } else {
                        if (this.options.debug) {
                            console.log('[IframeBannerAds] Ad blocked by minTimeBetweenAds');
                        }
                    }
                });
            }

            if (this.options.showOnPause) {
                this.player.addEventListener('paused', () => {
                    if (this.options.debug) {
                        console.log('[IframeBannerAds] Video paused - checking if can show banner');
                    }

                    if (this.canShowAd()) {
                        this.show();
                    } else {
                        if (this.options.debug) {
                            console.log('[IframeBannerAds] Ad blocked by minTimeBetweenAds');
                        }
                    }
                });
            }

            // Hide banner when video ends and stop repeat interval
            this.player.addEventListener('ended', () => {
                if (this.options.debug) {
                    console.log('[IframeBannerAds] Video ended - hiding banner and stopping repeat');
                }
                this.hide();
                this.stopRepeatInterval();
            });

            if (this.options.debug) {
                console.log('[IframeBannerAds] Events bound');
            }

            // Setup controlbar tracking
            this.setupControlbarTracking();
        }


        /**
         * Setup controlbar tracking to move banner with controlbar
         */
        setupControlbarTracking() {
            if (!this.player || !this.player.container) {
                if (this.options.debug) {
                    console.log('[IframeBannerAds] Cannot setup controlbar tracking');
                }
                return;
            }

            const updatePosition = () => {
                requestAnimationFrame(() => this.updateBannerPosition());
            };

            this.controlbarObserver = new MutationObserver(() => updatePosition());
            this.controlbarObserver.observe(this.player.container, {
                attributes: true,
                attributeFilter: ['class', 'style'],
                subtree: true,
                childList: false
            });

            let mouseTimer;
            this.player.container.addEventListener('mousemove', () => {
                clearTimeout(mouseTimer);
                mouseTimer = setTimeout(() => updatePosition(), 50);
            });

            this.player.container.addEventListener('mouseleave', () => {
                clearTimeout(mouseTimer);
                mouseTimer = setTimeout(() => updatePosition(), 300);
            });

            if (this.player.addEventListener) {
                this.player.addEventListener('controlsshown', () => updatePosition());
                this.player.addEventListener('controlshidden', () => updatePosition());
            }

            setTimeout(() => updatePosition(), 100);

            if (this.options.debug) {
                console.log('[IframeBannerAds] Controlbar tracking setup completed');
            }
        }

        /**
         * Update banner position based on controlbar visibility
         */
        updateBannerPosition() {
            if (!this.banner || !this.player || !this.player.container || !this.isVisible) {
                return;
            }

            const controlbar = this.player.container.querySelector('.myetv-controls-container') ||
                this.player.container.querySelector('.myetv-controls') ||
                this.player.container.querySelector('[class*="controls"]');

            if (!controlbar) {
                if (this.options.debug) {
                    console.log('[IframeBannerAds] Controlbar not found');
                }
                this.banner.style.bottom = '10px';
                return;
            }

            const computedStyle = window.getComputedStyle(controlbar);
            const rect = controlbar.getBoundingClientRect();

            const isHidden =
                controlbar.classList.contains('hidden') ||
                controlbar.classList.contains('myetv-controls-hidden') ||
                computedStyle.opacity === '0' ||
                computedStyle.visibility === 'hidden' ||
                computedStyle.display === 'none' ||
                rect.height === 0;

            let newBottom;
            if (isHidden) {
                newBottom = '10px';
            } else {
                const controlbarHeight = controlbar.offsetHeight || rect.height || 60;
                newBottom = `${controlbarHeight + 5}px`;
            }

            if (this.banner.style.bottom !== newBottom) {
                this.banner.style.bottom = newBottom;

                if (this.options.debug) {
                    console.log(`[IframeBannerAds] Banner repositioned to: ${newBottom} (controlbar ${isHidden ? 'hidden' : 'visible'})`);
                }
            }
        }
        /**
                 * Update timer text display
                 */
        updateTimerText() {
            if (this.timerElement) {
                if (this.countdown > 0) {
                    this.timerElement.textContent = `This ad will close in ${this.countdown} second${this.countdown !== 1 ? 's' : ''}`;
                } else {
                    this.timerElement.textContent = 'Closing...';
                }
            }
        }

        /**
         * Start countdown timer
         */
        startCountdown() {
            // Clear any existing timers
            this.stopCountdown();

            this.countdown = this.options.duration;
            this.updateTimerText();

            // Countdown interval (updates every second)
            this.countdownInterval = setInterval(() => {
                this.countdown--;
                this.updateTimerText();

                if (this.countdown <= 0) {
                    clearInterval(this.countdownInterval);
                    this.countdownInterval = null;
                }
            }, 1000);

            // Auto-close timeout
            this.autoCloseTimeout = setTimeout(() => {
                if (this.options.debug) {
                    console.log('[IframeBannerAds] Auto-closing banner');
                }

                // Clear interval first
                if (this.countdownInterval) {
                    clearInterval(this.countdownInterval);
                    this.countdownInterval = null;
                }

                // Then hide
                this.hideBanner();

            }, this.options.duration * 1000);

            if (this.options.debug) {
                console.log('[IframeBannerAds] Countdown started:', this.options.duration, 'seconds');
            }
        }

        /**
         * Stop countdown timer
         */
        stopCountdown() {
            if (this.countdownInterval) {
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
            }

            if (this.autoCloseTimeout) {
                clearTimeout(this.autoCloseTimeout);
                this.autoCloseTimeout = null;
            }

            if (this.options.debug) {
                console.log('[IframeBannerAds] Countdown stopped');
            }
        }

        /**
         * Show banner
         */
        show() {
            if (this.isVisible || !this.banner) {
                return;
            }

            // Check again if we can show the ad
            if (!this.canShowAd()) {
                if (this.options.debug) {
                    console.log('[IframeBannerAds] Cannot show ad - time restriction');
                }
                return;
            }

            this.banner.style.display = 'flex';
            this.banner.style.opacity = '1';
            this.banner.classList.remove('hidden');
            this.banner.classList.add('visible');
            this.isVisible = true;
            this.adShownCount++;

            // Update banner position
            setTimeout(() => this.updateBannerPosition(), 150);

            // Update last ad timestamp
            this.updateLastAdTimestamp();

            // Start countdown
            this.startCountdown();

            // Start repeat interval if configured
            if (this.options.repeatInterval > 0) {
                this.startRepeatInterval();
            }

            if (this.options.debug) {
                console.log('[IframeBannerAds] Banner shown (count:', this.adShownCount + ')');
            }
        }

        /**
         * Hide banner - SINGLE METHOD used by both X button and auto-close
         */
        hideBanner() {
            if (!this.banner) {
                return;
            }

            // Stop all timers
            if (this.countdownInterval) {
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
            }

            if (this.autoCloseTimeout) {
                clearTimeout(this.autoCloseTimeout);
                this.autoCloseTimeout = null;
            }

            // Set flag immediately
            this.isVisible = false;

            // Fadeout animation via JavaScript
            let opacity = 1;
            const fadeInterval = setInterval(() => {
                opacity -= 0.05;

                if (opacity <= 0) {
                    clearInterval(fadeInterval);

                    // Hide completely after fadeout
                    if (this.banner) {
                        this.banner.style.display = 'none';
                        this.banner.style.opacity = '1';
                        this.banner.classList.remove('visible');
                        this.banner.classList.remove('hidden');
                    }

                    if (this.options.debug) {
                        console.log('[IframeBannerAds] Banner hidden');
                    }
                } else {
                    if (this.banner) {
                        this.banner.style.opacity = opacity;
                    }
                }
            }, 25);

            // Add hidden class for other animations
            this.banner.classList.add('hidden');
            this.banner.classList.remove('visible');
        }

        /**
         * Hide banner
         */
        hide() {
            this.hideBanner();
            // Don't stop repeat interval here - it continues until video ends
        }

        /**
         * Toggle banner visibility
         */
        toggle() {
            if (this.isVisible) {
                this.hide();
            } else {
                this.show();
            }
        }

        /**
         * Update iframe URL (only for direct iframe mode)
         */
        setUrl(newUrl) {
            if (this.mode !== 'iframe') {
                console.warn('[IframeBannerAds] setUrl() only works in iframe mode');
                return;
            }

            if (newUrl) {
                this.options.url = newUrl;

                // Clear and reload
                this.adContainer.innerHTML = '';
                this.loadDirectIframe();

                if (this.options.debug) {
                    console.log('[IframeBannerAds] URL updated:', newUrl);
                }
            }
        }

        /**
         * Update ad script parameters (only for script mode)
         */
        setAdParams(newParams) {
            if (this.mode !== 'script') {
                console.warn('[IframeBannerAds] setAdParams() only works in script mode');
                return;
            }

            if (newParams && typeof newParams === 'object') {
                this.options.adParams = { ...this.options.adParams, ...newParams };

                // Clear and reload
                this.adContainer.innerHTML = '';
                this.loadAdScript();

                if (this.options.debug) {
                    console.log('[IframeBannerAds] Ad params updated:', this.options.adParams);
                }
            }
        }

        /**
         * Update banner duration
         */
        setDuration(seconds) {
            if (typeof seconds === 'number' && seconds > 0) {
                this.options.duration = seconds;

                if (this.options.debug) {
                    console.log('[IframeBannerAds] Duration updated:', seconds);
                }
            }
        }

        /**
         * Update banner opacity
         */
        setOpacity(opacity) {
            if (typeof opacity === 'number' && opacity >= 0 && opacity <= 1) {
                this.options.opacity = opacity;

                if (this.banner) {
                    this.banner.style.background = `rgba(0, 0, 0, ${opacity})`;
                }

                if (this.options.debug) {
                    console.log('[IframeBannerAds] Opacity updated:', opacity);
                }
            }
        }

        /**
         * Get plugin state
         */
        getState() {
            return {
                mode: this.mode,
                isVisible: this.isVisible,
                countdown: this.countdown,
                url: this.options.url,
                adScript: this.options.adScript,
                adParams: this.options.adParams,
                duration: this.options.duration,
                opacity: this.options.opacity,
                minTimeBetweenAds: this.options.minTimeBetweenAds,
                repeatInterval: this.options.repeatInterval,
                adShownCount: this.adShownCount,
                lastAdTimestamp: this.getCookie(this.options.cookieName)
            };
        }

        /**
         * Dispose plugin - cleanup
         */
        dispose() {
            if (this.options.debug) {
                console.log('[IframeBannerAds] Disposing plugin');
            }

            // Stop timers
            this.stopCountdown();
            this.stopRepeatInterval();

            // Cleanup controlbar tracking
            if (this.controlbarObserver) {
                this.controlbarObserver.disconnect();
                this.controlbarObserver = null;
            }

            // Remove DOM elements
            if (this.banner && this.banner.parentNode) {
                this.banner.parentNode.removeChild(this.banner);
            }

            // Clear references
            this.banner = null;
            this.contentContainer = null;
            this.adContainer = null;
            this.timerElement = null;
            this.closeButton = null;
        }
    }

    // Register plugin globally
    if (typeof window !== 'undefined' && typeof window.registerMYETVPlugin === 'function') {
        window.registerMYETVPlugin('iframe-banner-ads', IframeBannerAds);
        console.log('[MyeTV] Iframe Banner Ads plugin registered');
    } else {
        console.error('[IframeBannerAds] Plugin registration failed - registerMYETVPlugin not available');
    }

})();