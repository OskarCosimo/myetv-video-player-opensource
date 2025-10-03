/**
 * MYETV Player - Analytics Plugin
 * File: myetv-player-analytics-plugin.js
 * Tracks video player events with Google Analytics 4 and Matomo
 * 
 * Supported Events:
 * - video_start: When video starts playing
 * - video_play: When video is played (after pause)
 * - video_pause: When video is paused
 * - video_progress: At 10%, 25%, 50%, 75%, 90% completion
 * - video_complete: When video finishes (95%+)
 * - video_seek: When user seeks to different position
 * - video_quality_change: When quality is changed
 * - video_volume_change: When volume is changed
 * - video_fullscreen: When fullscreen is toggled
 * - video_error: When video error occurs
 * 
 * Created by https://www.myetv.tv https://oskarcosimo.com
 */

(function () {
    'use strict';

    class AnalyticsPlugin {
        constructor(player, options = {}) {
            this.player = player;
            this.options = {
                // Analytics platform: 'ga4', 'matomo', 'both', or 'custom'
                platform: options.platform || 'ga4',

                // Google Analytics 4 options
                ga4: {
                    enabled: options.ga4?.enabled !== undefined ? options.ga4.enabled : true,
                    trackingId: options.ga4?.trackingId || null,
                    eventPrefix: options.ga4?.eventPrefix || 'video_',
                    customDimensions: options.ga4?.customDimensions || {}
                },

                // Matomo options
                matomo: {
                    enabled: options.matomo?.enabled !== undefined ? options.matomo.enabled : false,
                    siteId: options.matomo?.siteId || null,
                    trackerUrl: options.matomo?.trackerUrl || null
                },

                // Custom tracking function
                customTracker: options.customTracker || null,

                // What to track
                trackEvents: {
                    start: options.trackEvents?.start !== undefined ? options.trackEvents.start : true,
                    play: options.trackEvents?.play !== undefined ? options.trackEvents.play : true,
                    pause: options.trackEvents?.pause !== undefined ? options.trackEvents.pause : true,
                    progress: options.trackEvents?.progress !== undefined ? options.trackEvents.progress : true,
                    complete: options.trackEvents?.complete !== undefined ? options.trackEvents.complete : true,
                    seek: options.trackEvents?.seek !== undefined ? options.trackEvents.seek : true,
                    quality: options.trackEvents?.quality !== undefined ? options.trackEvents.quality : true,
                    volume: options.trackEvents?.volume !== undefined ? options.trackEvents.volume : false,
                    fullscreen: options.trackEvents?.fullscreen !== undefined ? options.trackEvents.fullscreen : true,
                    error: options.trackEvents?.error !== undefined ? options.trackEvents.error : true
                },

                // Progress milestones (percentages)
                progressMilestones: options.progressMilestones || [10, 25, 50, 75, 90],

                // Video metadata
                videoTitle: options.videoTitle || '',
                videoCategory: options.videoCategory || '',
                videoId: options.videoId || '',

                // Debug mode
                debug: options.debug || false
            };

            // Get plugin API
            this.api = player.getPluginAPI();

            // Tracking state
            this.state = {
                hasStarted: false,
                hasCompleted: false,
                progressMilestones: {},
                lastPosition: 0,
                startTime: null,
                totalWatchTime: 0,
                pauseTime: null,
                seekCount: 0,
                qualityChanges: 0,
                volumeChanges: 0,
                fullscreenToggles: 0
            };

            // Initialize progress milestones tracking
            this.options.progressMilestones.forEach(milestone => {
                this.state.progressMilestones[milestone] = false;
            });
        }

        /**
         * Setup plugin
         */
        setup() {
            this.log('Analytics plugin setup started');

            // Detect video metadata if not provided
            this.detectVideoMetadata();

            // Setup event listeners
            this.setupEventListeners();

            // Initialize analytics platforms
            this.initializeAnalytics();

            this.log('Analytics plugin setup completed');
        }

        /**
         * Detect video metadata from player
         */
        detectVideoMetadata() {
            if (!this.options.videoTitle) {
                this.options.videoTitle = this.api.video.title ||
                    this.api.options.videoTitle ||
                    this.api.video.src ||
                    'Untitled Video';
            }

            if (!this.options.videoId) {
                this.options.videoId = this.api.video.id ||
                    this.generateVideoId();
            }

            this.log('Video metadata:', {
                title: this.options.videoTitle,
                id: this.options.videoId,
                category: this.options.videoCategory
            });
        }

        /**
         * Generate video ID from source
         */
        generateVideoId() {
            const src = this.api.video.src || this.api.video.currentSrc;
            if (!src) return 'unknown';

            // Extract filename from URL
            const filename = src.split('/').pop().split('?')[0];
            return filename.replace(/\.[^/.]+$/, ''); // Remove extension
        }

        /**
         * Initialize analytics platforms
         */
        initializeAnalytics() {
            // Check for GA4
            if (this.options.platform === 'ga4' || this.options.platform === 'both') {
                if (typeof gtag !== 'undefined') {
                    this.log('GA4 detected and ready');
                } else if (typeof ga !== 'undefined') {
                    this.log('Universal Analytics detected');
                } else {
                    this.log('Warning: GA4 not found. Make sure gtag.js is loaded.');
                }
            }

            // Check for Matomo
            if (this.options.platform === 'matomo' || this.options.platform === 'both') {
                if (typeof _paq !== 'undefined') {
                    this.log('Matomo detected and ready');
                } else {
                    this.log('Warning: Matomo not found. Make sure Matomo tracking code is loaded.');
                }
            }
        }

        /**
         * Setup event listeners
         */
        setupEventListeners() {
            // Video play
            if (this.options.trackEvents.play) {
                this.api.addEventListener('play', () => this.onPlay());
            }

            // Video pause
            if (this.options.trackEvents.pause) {
                this.api.addEventListener('pause', () => this.onPause());
            }

            // Video ended
            if (this.options.trackEvents.complete) {
                this.api.addEventListener('ended', () => this.onComplete());
            }

            // Time update for progress tracking
            if (this.options.trackEvents.progress) {
                this.api.addEventListener('timeupdate', () => this.onTimeUpdate());
            }

            // Seeking
            if (this.options.trackEvents.seek) {
                this.api.addEventListener('seeking', () => this.onSeeking());
                this.api.addEventListener('seeked', () => this.onSeeked());
            }

            // Quality change
            if (this.options.trackEvents.quality) {
                this.api.addEventListener('qualitychanged', (e) => this.onQualityChange(e));
            }

            // Volume change
            if (this.options.trackEvents.volume) {
                this.api.addEventListener('volumechange', () => this.onVolumeChange());
            }

            // Fullscreen
            if (this.options.trackEvents.fullscreen) {
                this.api.addEventListener('fullscreenchange', () => this.onFullscreenChange());
            }

            // Error
            if (this.options.trackEvents.error) {
                this.api.addEventListener('error', (e) => this.onError(e));
            }

            this.log('Event listeners registered');
        }

        /**
         * Handle play event
         */
        onPlay() {
            const currentTime = this.api.getCurrentTime();

            // Track start only once
            if (!this.state.hasStarted && currentTime < 3) {
                this.state.hasStarted = true;
                this.state.startTime = Date.now();

                if (this.options.trackEvents.start) {
                    this.trackEvent('start', {
                        video_current_time: 0,
                        video_duration: this.api.getDuration()
                    });
                }
            }

            // Track play (resume)
            this.trackEvent('play', {
                video_current_time: currentTime,
                video_duration: this.api.getDuration(),
                video_percent: this.getWatchedPercent()
            });

            // Calculate pause duration
            if (this.state.pauseTime) {
                const pauseDuration = Math.round((Date.now() - this.state.pauseTime) / 1000);
                this.log(`Resumed after ${pauseDuration}s pause`);
                this.state.pauseTime = null;
            }
        }

        /**
         * Handle pause event
         */
        onPause() {
            const currentTime = this.api.getCurrentTime();
            const duration = this.api.getDuration();

            // Don't track pause at the end
            if (currentTime >= duration - 0.5) {
                return;
            }

            this.state.pauseTime = Date.now();

            this.trackEvent('pause', {
                video_current_time: currentTime,
                video_duration: duration,
                video_percent: this.getWatchedPercent()
            });
        }

        /**
         * Handle time update (for progress tracking)
         */
        onTimeUpdate() {
            const percent = this.getWatchedPercent();

            // Check each milestone
            this.options.progressMilestones.forEach(milestone => {
                if (!this.state.progressMilestones[milestone] && percent >= milestone) {
                    this.state.progressMilestones[milestone] = true;

                    this.trackEvent('progress', {
                        video_current_time: this.api.getCurrentTime(),
                        video_duration: this.api.getDuration(),
                        video_percent: milestone,
                        milestone: `${milestone}%`
                    });
                }
            });
        }

        /**
         * Handle seeking start
         */
        onSeeking() {
            this.state.lastSeekFrom = this.api.getCurrentTime();
        }

        /**
         * Handle seeking end
         */
        onSeeked() {
            const seekTo = this.api.getCurrentTime();
            const seekFrom = this.state.lastSeekFrom || 0;
            this.state.seekCount++;

            this.trackEvent('seek', {
                video_current_time: seekTo,
                video_duration: this.api.getDuration(),
                video_percent: this.getWatchedPercent(),
                seek_from: seekFrom,
                seek_to: seekTo,
                seek_distance: Math.abs(seekTo - seekFrom),
                total_seeks: this.state.seekCount
            });
        }

        /**
         * Handle quality change
         */
        onQualityChange(event) {
            this.state.qualityChanges++;

            this.trackEvent('quality_change', {
                video_current_time: this.api.getCurrentTime(),
                video_duration: this.api.getDuration(),
                old_quality: event.detail?.oldQuality || 'unknown',
                new_quality: event.detail?.newQuality || 'unknown',
                total_quality_changes: this.state.qualityChanges
            });
        }

        /**
         * Handle volume change
         */
        onVolumeChange() {
            this.state.volumeChanges++;

            this.trackEvent('volume_change', {
                video_current_time: this.api.getCurrentTime(),
                video_volume: this.api.getVolume(),
                video_muted: this.api.video.muted,
                total_volume_changes: this.state.volumeChanges
            });
        }

        /**
         * Handle fullscreen change
         */
        onFullscreenChange() {
            this.state.fullscreenToggles++;
            const isFullscreen = document.fullscreenElement !== null;

            this.trackEvent('fullscreen', {
                video_current_time: this.api.getCurrentTime(),
                fullscreen_enabled: isFullscreen,
                total_fullscreen_toggles: this.state.fullscreenToggles
            });
        }

        /**
         * Handle complete
         */
        onComplete() {
            if (this.state.hasCompleted) return;

            this.state.hasCompleted = true;

            const watchDuration = this.state.startTime
                ? Math.round((Date.now() - this.state.startTime) / 1000)
                : 0;

            this.trackEvent('complete', {
                video_current_time: this.api.getDuration(),
                video_duration: this.api.getDuration(),
                video_percent: 100,
                watch_duration: watchDuration,
                seek_count: this.state.seekCount,
                quality_changes: this.state.qualityChanges
            });
        }

        /**
         * Handle error
         */
        onError(event) {
            const error = event.detail || this.api.video.error;

            this.trackEvent('error', {
                video_current_time: this.api.getCurrentTime(),
                error_code: error?.code || 'unknown',
                error_message: error?.message || 'Unknown error',
                video_src: this.api.video.currentSrc
            });
        }

        /**
         * Track event to all enabled platforms
         */
        trackEvent(action, data = {}) {
            const eventData = {
                video_title: this.options.videoTitle,
                video_id: this.options.videoId,
                video_category: this.options.videoCategory,
                video_url: this.api.video.currentSrc,
                video_provider: 'myetv-player',
                ...data
            };

            this.log(`Tracking event: ${action}`, eventData);

            // Track to GA4
            if (this.options.platform === 'ga4' || this.options.platform === 'both') {
                this.trackToGA4(action, eventData);
            }

            // Track to Matomo
            if (this.options.platform === 'matomo' || this.options.platform === 'both') {
                this.trackToMatomo(action, eventData);
            }

            // Track to custom tracker
            if (typeof this.options.customTracker === 'function') {
                this.options.customTracker(action, eventData);
            }
        }

        /**
         * Track to Google Analytics 4
         */
        trackToGA4(action, data) {
            if (typeof gtag === 'undefined') {
                this.log('GA4 not available, skipping');
                return;
            }

            const eventName = this.options.ga4.eventPrefix + action;

            gtag('event', eventName, {
                ...data,
                ...this.options.ga4.customDimensions
            });

            this.log(`GA4 event sent: ${eventName}`);
        }

        /**
         * Track to Matomo
         */
        trackToMatomo(action, data) {
            if (typeof _paq === 'undefined') {
                this.log('Matomo not available, skipping');
                return;
            }

            // Matomo custom event format: trackEvent(category, action, name, value)
            _paq.push([
                'trackEvent',
                'Video',
                action,
                this.options.videoTitle,
                data.video_current_time || 0
            ]);

            this.log(`Matomo event sent: ${action}`);
        }

        /**
         * Get watched percent
         */
        getWatchedPercent() {
            const currentTime = this.api.getCurrentTime();
            const duration = this.api.getDuration();

            if (!duration || duration === 0) return 0;

            return Math.round((currentTime / duration) * 100);
        }

        /**
         * Debug log
         */
        log(...args) {
            if (this.options.debug) {
                console.log('📊 Analytics Plugin:', ...args);
            }
        }

        /**
         * Get analytics summary
         */
        getSummary() {
            return {
                videoTitle: this.options.videoTitle,
                videoId: this.options.videoId,
                hasStarted: this.state.hasStarted,
                hasCompleted: this.state.hasCompleted,
                currentProgress: this.getWatchedPercent(),
                milestonesReached: Object.keys(this.state.progressMilestones)
                    .filter(k => this.state.progressMilestones[k]),
                seekCount: this.state.seekCount,
                qualityChanges: this.state.qualityChanges,
                volumeChanges: this.state.volumeChanges,
                fullscreenToggles: this.state.fullscreenToggles,
                watchDuration: this.state.startTime
                    ? Math.round((Date.now() - this.state.startTime) / 1000)
                    : 0
            };
        }

        /**
         * Dispose plugin
         */
        dispose() {
            this.log('Analytics plugin disposed');

            // Track final state if video was started but not completed
            if (this.state.hasStarted && !this.state.hasCompleted) {
                this.trackEvent('abandoned', {
                    video_current_time: this.api.getCurrentTime(),
                    video_duration: this.api.getDuration(),
                    video_percent: this.getWatchedPercent(),
                    watch_duration: this.state.startTime
                        ? Math.round((Date.now() - this.state.startTime) / 1000)
                        : 0
                });
            }
        }
    }

    // Register plugin globally
    window.registerMYETVPlugin('analytics', AnalyticsPlugin);

})();
