
/* Controls Module for MYETV Video Player 
 * Conservative modularization - original code preserved exactly
 * Created by https://www.myetv.tv https://oskarcosimo.com 
 */

/* AUTO-HIDE SYSTEM */
initAutoHide() {
    if (!this.options.autoHide) {
        if (this.options.debug) console.log('Auto-hide disabled in options');
        return;
    }

    if (this.autoHideInitialized) {
        if (this.options.debug) console.log('Auto-hide already initialized');
        return;
    }

    if (this.options.debug) console.log('Initializing auto-hide system');

    // CHECK DOM ELEMENTS EXISTENCE
    if (!this.container) {
        if (this.options.debug) console.error('Container not found! Auto-hide cannot work');
        return;
    }

    if (!this.controls) {
        if (this.options.debug) console.error('Controls not found! Auto-hide cannot work');
        return;
    }

    if (this.options.debug) console.log('DOM elements verified:', {
        container: !!this.container,
        controls: !!this.controls,
        video: !!this.video
    });

    // Show controls initially
    this.showControlsNow();

    // Event listener for mousemove
    this.container.addEventListener('mousemove', (e) => {
        if (this.autoHideDebug) {
            if (this.options.debug) console.log('Mouse movement in container - reset timer');
        }
        this.onMouseMoveInPlayer(e);
    });

    if (this.options.debug) console.log('📡 Event listener mousemove added to container');

    // Event listener for mouseenter/mouseleave
    this.controls.addEventListener('mouseenter', (e) => {
        if (this.autoHideDebug) {
            if (this.options.debug) console.log('Mouse ENTERS controls - cancel timer');
        }
        this.onMouseEnterControls(e);
    });

    this.controls.addEventListener('mouseleave', (e) => {
        if (this.autoHideDebug) {
            if (this.options.debug) console.log('Mouse EXITS controls - restart timer');

            // Touch events for mobile devices
            this.container.addEventListener('touchstart', () => {
                this.showControlsNow();
                this.resetAutoHideTimer();
            });

            this.container.addEventListener('touchend', () => {
                this.resetAutoHideTimer();
            });
        }
        this.onMouseLeaveControls(e);
    });

    if (this.options.debug) console.log('Event listener mouseenter/mouseleave added to controls');

    this.autoHideInitialized = true;
    if (this.options.debug) console.log('Auto-hide system fully initialized');

    // Test
    this.resetAutoHideTimer();
    if (this.options.debug) console.log('Initial timer started');
}

onMouseMoveInPlayer(e) {
    this.showControlsNow();
    this.showCursor();
    this.resetAutoHideTimer();
}

onMouseEnterControls(e) {
    this.mouseOverControls = true;
    this.showControlsNow();

    if (this.autoHideTimer) {
        clearTimeout(this.autoHideTimer);
        this.autoHideTimer = null;
        if (this.autoHideDebug) {
            if (this.options.debug) console.log('Auto-hide timer cancelled');
        }
    }
}

onMouseLeaveControls(e) {
    this.mouseOverControls = false;
    this.resetAutoHideTimer();
}

resetAutoHideTimer() {
    if (this.autoHideTimer) {
        clearTimeout(this.autoHideTimer);
        this.autoHideTimer = null;
    }

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (this.mouseOverControls && !isTouchDevice) {
        if (this.autoHideDebug) {
            if (this.options.debug) console.log('Not starting timer - mouse on controls');
        }
        return;
    }

    if (this.video && this.video.paused) {
        if (this.autoHideDebug) {
            if (this.options.debug) console.log('Not starting timer - video paused');
        }
        return;
    }

    this.autoHideTimer = setTimeout(() => {
        if (this.autoHideDebug) {
            if (this.options.debug) console.log(`Timer expired after ${this.options.autoHideDelay}ms - nascondo controlli`);
        }
        this.hideControlsNow();
    }, this.options.autoHideDelay);

    if (this.autoHideDebug) {
        if (this.options.debug) console.log(`Auto-hide timer started: ${this.options.autoHideDelay}ms`);
    }
}

showControlsNow() {
    if (this.controls) {
        this.controls.classList.add('show');

        // Add has-controls class to container (for watermark visibility)
        if (this.container) {
            this.container.classList.add('has-controls');
        }

        this.updateControlbarHeight();

        // Update watermark position
        if (this.updateWatermarkPosition) {
            this.updateWatermarkPosition();
        }

        // Show title overlay with controls (if not persistent)
        if (this.options.showTitleOverlay && !this.options.persistentTitle && this.options.videoTitle) {
            this.showTitleOverlay();
        }

        // *show cursor when controls are shown*
        this.showCursor();

        if (this.autoHideDebug && this.options.debug) console.log('✅ Controls shown');
    }
}

hideControlsNow() {
    // Dont hide if mouse is still over controls (allow hiding on touch devices)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (this.mouseOverControls && !isTouchDevice) {
        if (this.autoHideDebug && this.options.debug) console.log('❌ Not hiding - mouse still over controls');
        return;
    }

    // Dont hide if video is paused
    if (this.video && this.video.paused) {
        if (this.autoHideDebug && this.options.debug) console.log('❌ Not hiding - video is paused');
        return;
    }

    if (this.controls) {
        this.controls.classList.remove('show');

        // Remove has-controls class from container (for watermark visibility)
        if (this.container) {
            this.container.classList.remove('has-controls');
        }

        this.updateControlbarHeight();

        // Update watermark position
        if (this.updateWatermarkPosition) {
            this.updateWatermarkPosition();
        }

        // Hide title overlay with controls (if not persistent)
        if (this.options.showTitleOverlay && !this.options.persistentTitle) {
            this.hideTitleOverlay();
        }

        // *hide cursor after controls are hidden*
        this.hideCursor();

        if (this.autoHideDebug && this.options.debug) console.log('✅ Controls hidden');
    }
}

showControls() {
    this.showControlsNow();
    this.resetAutoHideTimer();
}

hideControls() {
    this.hideControlsNow();
}

hideControlsWithDelay() {
    this.resetAutoHideTimer();
}

clearControlsTimeout() {
    if (this.autoHideTimer) {
        clearTimeout(this.autoHideTimer);
        this.autoHideTimer = null;
    }
}

// Default controlbar styles injection
injectDefaultControlbarStyles() {
    if (document.getElementById('default-controlbar-styles')) {
        return;
    }

    const controlBarOpacity = Math.max(0, Math.min(1, this.options.controlBarOpacity));
    const titleOverlayOpacity = Math.max(0, Math.min(1, this.options.titleOverlayOpacity));

    const style = document.createElement('style');
    style.id = 'default-controlbar-styles';
    style.textContent = `
        .video-wrapper:not(.youtube-active):not(.vimeo-active):not(.facebook-active) .controls {
            background: linear-gradient(
                to top,
                rgba(0, 0, 0, ${controlBarOpacity}) 0%,
                rgba(0, 0, 0, ${controlBarOpacity * 0.89}) 20%,
                rgba(0, 0, 0, ${controlBarOpacity * 0.74}) 40%,
                rgba(0, 0, 0, ${controlBarOpacity * 0.53}) 60%,
                rgba(0, 0, 0, ${controlBarOpacity * 0.32}) 80%,
                rgba(0, 0, 0, ${controlBarOpacity * 0.21}) 100%
            );
            backdrop-filter: blur(3px);
            min-height: 60px;
            padding-bottom: 10px;
        }
        
        .video-wrapper:not(.youtube-active):not(.vimeo-active):not(.facebook-active) .title-overlay {
            background: linear-gradient(
                to bottom,
                rgba(0, 0, 0, ${titleOverlayOpacity}) 0%,
                rgba(0, 0, 0, ${titleOverlayOpacity * 0.89}) 20%,
                rgba(0, 0, 0, ${titleOverlayOpacity * 0.74}) 40%,
                rgba(0, 0, 0, ${titleOverlayOpacity * 0.53}) 60%,
                rgba(0, 0, 0, ${titleOverlayOpacity * 0.32}) 80%,
                rgba(0, 0, 0, ${titleOverlayOpacity * 0.21}) 100%
            );
            backdrop-filter: blur(3px);
            min-height: 80px;
            padding-top: 20px;
        }
    `;

    document.head.appendChild(style);
}

// Debug methods
enableAutoHideDebug() {
    this.autoHideDebug = true;
    if (this.options.debug) console.log('AUTO-HIDE DEBUG ENABLED');
    if (this.options.debug) console.log('Stato attuale:', {
        initialized: this.autoHideInitialized,
        autoHide: this.options.autoHide,
        delay: this.options.autoHideDelay,
        mouseOverControls: this.mouseOverControls,
        timerActive: !!this.autoHideTimer,
        container: !!this.container,
        controls: !!this.controls,
        video: !!this.video,
        videoPaused: this.video ? this.video.paused : 'N/A'
    });

    if (!this.autoHideInitialized) {
        if (this.options.debug) console.log('Auto-hide NOT yet initialized! Initializing now...');
        this.initAutoHide();
    }
}

disableAutoHideDebug() {
    this.autoHideDebug = false;
    if (this.options.debug) console.log('Auto-hide debug disabled');
}

testAutoHide() {
    if (this.options.debug) console.log('TEST AUTO-HIDE COMPLETED:');
    if (this.options.debug) console.log('System status:', {
        initialized: this.autoHideInitialized,
        autoHide: this.options.autoHide,
        delay: this.options.autoHideDelay,
        mouseOverControls: this.mouseOverControls,
        timerActive: !!this.autoHideTimer
    });

    if (this.options.debug) console.log('Elementi DOM:', {
        container: !!this.container,
        controls: !!this.controls,
        video: !!this.video
    });

    if (this.options.debug) console.log('Stato video:', {
        paused: this.video ? this.video.paused : 'N/A',
        currentTime: this.video ? this.video.currentTime : 'N/A',
        duration: this.video ? this.video.duration : 'N/A'
    });

    if (!this.autoHideInitialized) {
        if (this.options.debug) console.log('PROBLEM: Auto-hide not initialized!');
        if (this.options.debug) console.log('Forcing initialization...');
        this.initAutoHide();
    } else {
        if (this.options.debug) console.log('Auto-hide initialized correctly');
        if (this.options.debug) console.log('Forcing timer reset for test...');
        this.resetAutoHideTimer();
    }
}

/* SUBTITLES UI MANAGEMENT */
updateSubtitlesUI() {
    const subtitlesControl = this.controls?.querySelector('.subtitles-control');

    if (this.textTracks.length > 0 && this.options.showSubtitles) {
        if (subtitlesControl) {
            subtitlesControl.style.display = 'block';
        }
        this.populateSubtitlesMenu();
    } else {
        if (subtitlesControl) {
            subtitlesControl.style.display = 'none';
        }
    }
}

populateSubtitlesMenu() {
    const subtitlesMenu = this.controls?.querySelector('.subtitles-menu');
    if (!subtitlesMenu) return;

    let menuHTML = `<div class="subtitles-option ${!this.subtitlesEnabled ? 'active' : ''}" data-track="off">${this.t('subtitlesoff') || 'Off'}</div>`;

    this.textTracks.forEach((trackData, index) => {
        const isActive = this.currentSubtitleTrack === trackData.track;
        menuHTML += `<div class="subtitles-option ${isActive ? 'active' : ''}" data-track="${index}">${trackData.label}</div>`;
    });

    subtitlesMenu.innerHTML = menuHTML;
}

toggleSubtitles() {
    if (this.textTracks.length === 0) return;

    if (this.subtitlesEnabled) {
        this.disableSubtitles();
    } else {
        this.enableSubtitleTrack(0);
    }
}

updateSubtitlesButton() {
    const subtitlesBtn = this.controls?.querySelector('.subtitles-btn');
    if (!subtitlesBtn) return;

    if (this.subtitlesEnabled) {
        subtitlesBtn.classList.add('active');
        subtitlesBtn.title = this.t('subtitlesdisable') || 'Disable subtitles';
    } else {
        subtitlesBtn.classList.remove('active');
        subtitlesBtn.title = this.t('subtitlesenable') || 'Enable subtitles';
    }
}

handleSubtitlesMenuClick(e) {
    if (!e.target.classList.contains('subtitles-option')) return;

    const trackData = e.target.getAttribute('data-track');

    if (trackData === 'off') {
        this.disableSubtitles();
    } else {
        const trackIndex = parseInt(trackData);
        this.enableSubtitleTrack(trackIndex);
    }
}

/* PLAYER CONTROLS SETUP */
hideNativePlayer() {
    this.video.controls = false;
    this.video.setAttribute('controls', 'false');
    this.video.removeAttribute('controls');
    this.video.style.visibility = 'hidden';
    this.video.style.opacity = '0';
    this.video.style.pointerEvents = 'none';
    this.video.classList.add('video-player');
}

createControls() {
    const controlsId = `videoControls-${this.getUniqueId()}`;

    const controlsHTML = `
        <div class="controls" id="${controlsId}">
            <div class="progress-container">
    <div class="progress-bar">
        <div class="progress-buffer"></div>
        <div class="progress-filled"></div>
    </div>
    <div class="progress-handle progress-handle-${this.options.seekHandleShape}"></div>
    ${this.options.showSeekTooltip ? '<div class="seek-tooltip">0:00</div>' : ''}
</div>

            <div class="controls-main">
                <div class="controls-left">
                    <button class="control-btn play-pause-btn" data-tooltip="play_pause">
                        <span class="icon play-icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>
                        <span class="icon pause-icon hidden"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg></span>
                    </button>

                    <button class="control-btn mute-btn" data-tooltip="mute_unmute">
    <span class="icon volume-icon"><svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303z"/><path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89z"/><path d="M10.025 8a4.486 4.486 0 0 1-1.318 3.182L8 10.475A3.489 3.489 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.486 4.486 0 0 1 10.025 8M7 4a.5.5 0 0 0-.812-.39L3.825 5.5H1.5A.5.5 0 0 0 1 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 7 12z"/></svg></span>
    <span class="icon mute-icon hidden"><svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06m7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0"/></svg></span>
                    </button>

                    <div class="volume-container" data-mobile-slider="${this.options.volumeSlider}">
    <input type="range" class="volume-slider" min="0" max="100" value="100" data-tooltip="volume">
                    </div>

                    <div class="time-display">
                        <span class="current-time">0:00</span>
                        <span>/</span>
                        <span class="duration">0:00</span>
                    </div>
                </div>

                <div class="controls-right">
<button class="control-btn playlist-prev-btn" data-tooltip="prevvideo" style="display: none;">
    <span class="icon"><svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M3.5 12V4l7 4zm8-8v8l-7-4z"/></svg></span>
</button>
<button class="control-btn playlist-next-btn" data-tooltip="nextvideo" style="display: none;">
    <span class="icon"><svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M12.5 4v8l-7-4zm-8 0v8l7-4z"/></svg></span>
</button>

                    <div class="settings-control">
                        <button class="control-btn settings-btn" data-tooltip="settings_menu">
                            <span class="icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg></span>
                        </button>
                        <div class="settings-menu"></div>
                    </div>

                    ${this.options.showQualitySelector && this.originalSources && this.originalSources.length > 1 ? `
                    <div class="quality-control">
                        <button class="control-btn quality-btn" data-tooltip="video_quality">
                            <div class="quality-btn-text">
                                <div class="selected-quality">${this.t('auto')}</div>
                                <div class="current-quality"></div>
                            </div>
                        </button>
                        <div class="quality-menu">
                            <div class="quality-option selected" data-quality="auto">${this.t('auto')}</div>
                            ${this.originalSources.map(s =>
                                `<div class="quality-option" data-quality="${s.quality}">${s.quality}</div>`
                            ).join('')}
                        </div>
                    </div>
                    ` : ''}

                    ${this.options.showPictureInPicture && this.isPiPSupported ? `
                    <button class="control-btn pip-btn" data-tooltip="picture_in_picture">
                        <span class="icon pip-icon"><svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5zM1.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5z"/><path d="M8 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5z"/></svg></span>
                        <span class="icon pip-exit-icon hidden"><svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5zM1.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5z"/></svg></span>
                    </button>
                    ` : ''}

                    ${this.options.showFullscreen ? `
                    <button class="control-btn fullscreen-btn" data-tooltip="fullscreen">
                        <span class="icon fullscreen-icon"><svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5M.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5"/></svg></span>
                        <span class="icon exit-fullscreen-icon hidden"><svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5m5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5M0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5m10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0z"/></svg></span>
                    </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    this.container.insertAdjacentHTML('beforeend', controlsHTML);
    this.controls = document.getElementById(controlsId);

    // NEW: Initialize responsive settings menu
    setTimeout(() => {
        this.initializeResponsiveMenu();
        this.updateControlbarHeight();
    }, 100);
}

/* Initialize responsive menu with dynamic width calculation */
initializeResponsiveMenu() {
    if (!this.controls) return;

    // Track screen size
    this.isSmallScreen = false;

    // Check initial size
    this.checkScreenSize();

    // Bind resize handler with updateControlbarHeight
    const resizeHandler = () => {
        this.checkScreenSize();
        this.updateControlbarHeight();
    };

    // Bind del context
    this.resizeHandler = resizeHandler.bind(this);
    window.addEventListener('resize', this.resizeHandler);

    // Bind events for settings menu
    this.bindSettingsMenuEvents();
}

// Dynamic controlbar height tracking for watermark positioning
updateControlbarHeight() {
    if (!this.controls) return;

    const height = this.controls.offsetHeight;
    if (this.container) {

        this.container.style.setProperty('--player-controls-height', `${height}px`);

        const watermark = this.container.querySelector('.video-watermark.watermark-bottomleft, .video-watermark.watermark-bottomright');
        if (watermark) {
            const hasControls = this.container.classList.contains('has-controls');
            const isHideOnAutoHide = watermark.classList.contains('hide-on-autohide');

            if (hasControls || !isHideOnAutoHide) {
                watermark.style.bottom = `${height + 15}px`;
            } else {
                watermark.style.bottom = '15px';
            }
        }
    }

    if (this.options.debug) {
        console.log(`Controlbar height updated: ${height}px`);
    }
}

/* Dynamic width calculation based on logo presence */
getResponsiveThreshold() {
    // Check if brand logo is enabled and present
    const hasLogo = this.options.brandLogoEnabled && this.options.brandLogoUrl;

    // If logo is present, use higher threshold (650px), otherwise 550px
    return hasLogo ? 650 : 550;
}

/* Check if screen is under dynamic threshold */
checkScreenSize() {
    const threshold = this.getResponsiveThreshold();
    const newIsSmallScreen = window.innerWidth <= threshold;

    if (newIsSmallScreen !== this.isSmallScreen) {
        this.isSmallScreen = newIsSmallScreen;
        this.updateSettingsMenuVisibility();

        if (this.options.debug) {
            console.log(`Screen check: ${window.innerWidth}px vs ${threshold}px (threshold), logo: ${this.options.brandLogoEnabled}, small: ${this.isSmallScreen}`);
        }
    }
}

/* Update settings menu visibility */
updateSettingsMenuVisibility() {
    const settingsControl = this.controls?.querySelector('.settings-control');
    if (!settingsControl) return;

    // always show settings
    settingsControl.style.display = 'block';

    // Populate settings menu
    this.populateSettingsMenu();

    // hide speed and subtitles controls
    const speedControl = this.controls.querySelector('.speed-control');
    const subtitlesControl = this.controls.querySelector('.subtitles-control');
    if (speedControl) speedControl.style.display = 'none';
    if (subtitlesControl) subtitlesControl.style.display = 'none';
}

/**
 * Populate settings menu with controls
 */
populateSettingsMenu() {
    const settingsMenu = this.controls?.querySelector('.settings-menu');
    if (!settingsMenu) return;

    let menuHTML = '';

    // SPEED - always included
    if (this.options.showSpeedControl) {
        const speedLabel = this.t('playback_speed') || 'Playback Speed';
        const currentSpeed = this.video ? this.video.playbackRate : 1;
        menuHTML += `<div class="settings-expandable-wrapper">
            <div class="settings-option expandable-trigger" data-action="speed-expand">
                <span class="settings-option-label">${speedLabel} <strong>${currentSpeed}x</strong></span>
                <span class="expand-arrow">▶</span>
            </div>
            <div class="settings-expandable-content" style="display: none;">`;

        const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
        speeds.forEach(speed => {
            const isActive = Math.abs(speed - currentSpeed) < 0.01;
            menuHTML += `<div class="settings-suboption ${isActive ? 'active' : ''}" data-speed="${speed}">${speed}x</div>`;
        });
        menuHTML += `</div></div>`;
    }

    // SUBTITLES - always included
    if (this.options.showSubtitles && this.textTracks && this.textTracks.length > 0) {
        const subtitlesLabel = this.t('subtitles') || 'Subtitles';
        const currentTrack = this.currentSubtitleTrack;
        const currentLabel = this.subtitlesEnabled ? (currentTrack ? currentTrack.label : 'Unknown') : (this.t('subtitlesoff') || 'Off');

        menuHTML += `<div class="settings-expandable-wrapper">
            <div class="settings-option expandable-trigger" data-action="subtitles-expand">
                <span class="settings-option-label">${subtitlesLabel} <strong>${currentLabel}</strong></span>
                <span class="expand-arrow">▶</span>
            </div>
            <div class="settings-expandable-content" style="display: none;">`;

        menuHTML += `<div class="settings-suboption ${!this.subtitlesEnabled ? 'active' : ''}" data-track="off">${this.t('subtitlesoff') || 'Off'}</div>`;

        this.textTracks.forEach((trackData, index) => {
            const isActive = this.currentSubtitleTrack === trackData.track;
            menuHTML += `<div class="settings-suboption ${isActive ? 'active' : ''}" data-track="${index}">${trackData.label}</div>`;
        });

        menuHTML += `</div></div>`;
    }

    settingsMenu.innerHTML = menuHTML;
}

/**
 * Add scrollbar to settings menu on mobile
 */
addSettingsMenuScrollbar() {
    const settingsMenu = this.controls?.querySelector('.settings-menu');
    if (!settingsMenu) return;

    const settingsBtn = document.querySelector('.settings-btn');
    if (!settingsBtn) return;

    // helper to update menu height
    const updateMenuHeight = () => {
        if (settingsMenu.classList.contains('active')) {
            const containerRect = settingsMenu.parentElement.parentElement.getBoundingClientRect();
            const btnRect = settingsBtn.getBoundingClientRect();
            const spaceBelow = containerRect.bottom - btnRect.bottom;
            const maxMenuHeight = Math.max(100, Math.min(250, spaceBelow - 20));
            settingsMenu.style.maxHeight = `${maxMenuHeight}px`;
            settingsMenu.style.overflowY = 'auto';
            settingsMenu.style.overflowX = 'hidden';
        }
    };

    // run initially
    updateMenuHeight();

    // recalculate on window resize
    window.addEventListener('resize', updateMenuHeight);

    // Add scrollbar styling
    if (!document.getElementById('player-settings-scrollbar-style')) {
        const scrollbarStyle = document.createElement('style');
        scrollbarStyle.id = 'player-settings-scrollbar-style';
        scrollbarStyle.textContent = `
            .settings-menu::-webkit-scrollbar {
                width: 6px;
            }
            .settings-menu::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.05);
                border-radius: 3px;
            }
            .settings-menu::-webkit-scrollbar-thumb {
                background: rgba(255,255,255,0.3);
                border-radius: 3px;
            }
            .settings-menu::-webkit-scrollbar-thumb:hover {
                background: rgba(255,255,255,0.5);
            }
        `;
        document.head.appendChild(scrollbarStyle);
    }

    settingsMenu.style.scrollbarWidth = 'thin';
    settingsMenu.style.scrollbarColor = 'rgba(255,255,255,0.3) transparent';
}

/**
 * Bind settings menu events
 */
bindSettingsMenuEvents() {
    const settingsBtn = this.controls?.querySelector('.settings-btn');
    const settingsMenu = this.controls?.querySelector('.settings-menu');
    if (!settingsMenu || !settingsBtn) return;

    // toggle menu on button click
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsMenu.classList.toggle('active');

        // when menu is opened, set max height and overflow
        if (settingsMenu.classList.contains('active')) {
            const settingsBtn = document.querySelector('.settings-btn');
            const containerRect = settingsMenu.parentElement.parentElement.getBoundingClientRect();
            const btnRect = settingsBtn.getBoundingClientRect();
            const spaceBelow = containerRect.bottom - btnRect.bottom;
            const maxMenuHeight = Math.max(100, Math.min(250, spaceBelow - 20));

            settingsMenu.style.maxHeight = `${maxMenuHeight}px`;
            settingsMenu.style.overflowY = 'auto';
            settingsMenu.style.overflowX = 'hidden';
        } else {
            settingsMenu.style.maxHeight = 'none';
            settingsMenu.style.overflowY = 'visible';
        }

    });

    // close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsBtn?.contains(e.target) && !settingsMenu?.contains(e.target)) {
            settingsMenu?.classList.remove('active');
            settingsMenu.style.maxHeight = 'none';
            settingsMenu.style.overflowY = 'visible';
        }
    });

    // manage clicks inside the menu
    settingsMenu.addEventListener('click', (e) => {
        e.stopPropagation();

        // Handle expandable triggers
        if (e.target.classList.contains('expandable-trigger') || e.target.closest('.expandable-trigger')) {
            const trigger = e.target.classList.contains('expandable-trigger') ? e.target : e.target.closest('.expandable-trigger');
            const wrapper = trigger.closest('.settings-expandable-wrapper');
            const content = wrapper.querySelector('.settings-expandable-content');
            const arrow = trigger.querySelector('.expand-arrow');

            const isExpanded = content.style.display !== 'none';

            if (isExpanded) {
                content.style.display = 'none';
                arrow.style.transform = 'rotate(0deg)';
            } else {
                content.style.display = 'block';
                arrow.style.transform = 'rotate(180deg)';
            }
            return;
        }

        // Handle direct actions (like PiP)
        if (e.target.classList.contains('settings-option') || e.target.closest('.settings-option')) {
            const option = e.target.classList.contains('settings-option') ? e.target : e.target.closest('.settings-option');
            const action = option.getAttribute('data-action');

            if (action === 'pip') {
                this.togglePictureInPicture();
                return;
            }
        }

        // Handle submenu actions
        if (e.target.classList.contains('settings-suboption')) {
            const wrapper = e.target.closest('.settings-expandable-wrapper');
            const trigger = wrapper.querySelector('.expandable-trigger');
            const action = trigger.getAttribute('data-action');

            if (action === 'speed-expand') {
                const speed = parseFloat(e.target.getAttribute('data-speed'));
                if (speed && speed > 0 && this.video && !this.isChangingQuality) {
                    this.video.playbackRate = speed;

                    // Update active states
                    wrapper.querySelectorAll('.settings-suboption').forEach(opt => opt.classList.remove('active'));
                    e.target.classList.add('active');

                    // Update trigger text
                    const label = trigger.querySelector('.settings-option-label');
                    if (label) {
                        const speedLabel = this.t('playback_speed') || 'Playback Speed';
                        label.textContent = `${speedLabel}: ${speed}x`;
                    }

                    // Trigger event
                    this.triggerEvent('speedchange', { speed, previousSpeed: this.video.playbackRate });
                }
            } else if (action === 'subtitles-expand') {
                const trackData = e.target.getAttribute('data-track');
                if (trackData === 'off') {
                    this.disableSubtitles();
                } else {
                    const trackIndex = parseInt(trackData);
                    this.enableSubtitleTrack(trackIndex);
                }

                // Update active states
                wrapper.querySelectorAll('.settings-suboption').forEach(opt => opt.classList.remove('active'));
                e.target.classList.add('active');

                // Update trigger text
                const label = trigger.querySelector('.settings-option-label');
                if (label) {
                    const subtitlesLabel = this.t('subtitles') || 'Subtitles';
                    label.textContent = `${subtitlesLabel}: ${e.target.textContent}`;
                }
            }
        }
    });
}

/* TITLE OVERLAY MANAGEMENT */
showTitleOverlay() {
    if (this.titleOverlay && this.options.videoTitle) {
        this.titleOverlay.classList.add('show');

        if (this.options.persistentTitle) {
            this.titleOverlay.classList.add('persistent');
        } else {
            this.titleOverlay.classList.remove('persistent');
        }
    }
    return this;
}

hideTitleOverlay() {
    if (this.titleOverlay) {
        this.titleOverlay.classList.remove('show');
        this.titleOverlay.classList.remove('persistent');
    }
    return this;
}

toggleTitleOverlay(show = null) {
    if (show === null) {
        return this.titleOverlay && this.titleOverlay.classList.contains('show')
            ? this.hideTitleOverlay()
            : this.showTitleOverlay();
    }

    return show ? this.showTitleOverlay() : this.hideTitleOverlay();
}

/* KEYBOARD CONTROLS */
setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        // Ignore if user is typing in an input field
        if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

        // On keyboard input, treat as mouse movement for auto-hide
        if (this.options.autoHide && this.autoHideInitialized) {
            this.showControlsNow();
            this.resetAutoHideTimer();
        }

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'KeyM':
                this.toggleMute();
                break;
            case 'KeyF':
                if (this.options.showFullscreen) {
                    this.toggleFullscreen();
                }
                break;
            case 'KeyP':
                if (this.options.showPictureInPicture && this.isPiPSupported) {
                    this.togglePictureInPicture();
                }
                break;
            case 'KeyT':
                if (this.options.showTitleOverlay) {
                    this.toggleTitleOverlay();
                }
                break;
            case 'KeyS':
                if (this.options.showSubtitles) {
                    this.toggleSubtitles();
                }
                break;
            case 'KeyD':
                this.debugQuality ? this.disableQualityDebug() : this.enableQualityDebug();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.skipTime(-10);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.skipTime(10);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.changeVolume(0.1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.changeVolume(-0.1);
                break;
        }
    });
}

/* CONTROL ACTIONS */
togglePlayPause() {
    if (!this.video || this.isChangingQuality) return;

    if (this.video.paused) {
        this.play();
    } else {
        this.pause();
    }
}

toggleMute() {
    if (!this.video) return;

    const wasMuted = this.video.muted;
    this.video.muted = !this.video.muted;

    this.updateMuteButton();
    this.updateVolumeSliderVisual();
    this.initVolumeTooltip();

    // Triggers volumechange event
    this.triggerEvent('volumechange', {
        volume: this.getVolume(),
        muted: this.isMuted(),
        previousMuted: wasMuted
    });
}

updateMuteButton() {
    if (!this.video || !this.volumeIcon || !this.muteIcon) return;

    if (this.video.muted || this.video.volume === 0) {
        this.volumeIcon.classList.add('hidden');
        this.muteIcon.classList.remove('hidden');
    } else {
        this.volumeIcon.classList.remove('hidden');
        this.muteIcon.classList.add('hidden');
    }
}

/* LOADING STATES */
showLoading() {
    if (this.loadingOverlay) {
        this.loadingOverlay.classList.add('active');
    }
}

hideLoading() {
    if (this.loadingOverlay) {
        this.loadingOverlay.classList.remove('active');
    }
}

/* FULLSCREEN CONTROLS */
toggleFullscreen() {
    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
        this.exitFullscreen();
    } else {
        this.enterFullscreen();
    }
}

updateFullscreenButton() {
    if (!this.fullscreenIcon || !this.exitFullscreenIcon) return;

    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement;

    if (isFullscreen) {
        this.fullscreenIcon.classList.add('hidden');
        this.exitFullscreenIcon.classList.remove('hidden');
    } else {
        this.fullscreenIcon.classList.remove('hidden');
        this.exitFullscreenIcon.classList.add('hidden');
    }

    // Triggers fullscreenchange event
    this.triggerEvent('fullscreenchange', {
        active: !!isFullscreen,
        mode: isFullscreen ? 'enter' : 'exit'
    });
}

/* PICTURE IN PICTURE CONTROLS */
togglePictureInPicture() {
    if (!this.isPiPSupported || !this.video) return;

    if (document.pictureInPictureElement) {
        this.exitPictureInPicture();
    } else {
        this.enterPictureInPicture();
    }
}

/* SEEK TOOLTIP MANAGEMENT */
toggleSeekTooltip(show = null) {
    if (show === null) {
        this.options.showSeekTooltip = !this.options.showSeekTooltip;
    } else {
        this.options.showSeekTooltip = show;
    }

    if (this.seekTooltip) {
        if (this.options.showSeekTooltip) {
            this.setupSeekTooltip();
        } else {
            this.seekTooltip.classList.remove('visible');
        }
    }
}

/* AUTO-HIDE CONFIGURATION */
setAutoHideDelay(delay) {
    if (typeof delay === 'number' && delay >= 0) {
        this.options.autoHideDelay = delay;
        if (this.options.debug) console.log(`Auto-hide delay set to ${delay}ms`);
    }
    return this;
}

getAutoHideDelay() {
    return this.options.autoHideDelay;
}

enableAutoHide() {
    if (!this.options.autoHide) {
        this.options.autoHide = true;
        if (!this.autoHideInitialized) {
            this.initAutoHide();
        }
        if (this.options.debug) console.log('Auto-hide enabled');
    }
    return this;
}

disableAutoHide() {
    if (this.options.autoHide) {
        this.options.autoHide = false;
        if (this.autoHideTimer) {
            clearTimeout(this.autoHideTimer);
            this.autoHideTimer = null;
        }
        this.showControlsNow();
        if (this.options.debug) console.log('Auto-hide disabled');
    }
    return this;
}

forceShowControls() {
    this.showControlsNow();
    if (this.autoHideInitialized) {
        this.resetAutoHideTimer();
    }
    return this;
}

forceHideControls() {
    if (!this.mouseOverControls && this.video && !this.video.paused) {
        this.hideControlsNow();
    }
    return this;
}

isAutoHideEnabled() {
    return this.options.autoHide;
}

isAutoHideInitialized() {
    return this.autoHideInitialized;
}

/**
 * Hide mouse cursor in player container
 * Only hides cursor in main container, not in plugin iframes
 */
hideCursor() {
    if (!this.options.hideCursor) {
        return; // Do not hide cursor if option is disabled
    }

    if (this.container) {
        this.container.classList.add('hide-cursor');
        if (this.options.debug) console.log('🖱️ Cursor hidden');
    }
}

/**
 * Show mouse cursor in player container
 */
showCursor() {
    if (this.container) {
        this.container.classList.remove('hide-cursor');
        if (this.options.debug) console.log('🖱️ Cursor shown');
    }
}

/**
 * Enable cursor hiding when controlbar is hidden
 * @returns {Object} this
 */
enableCursorHiding() {
    this.options.hideCursor = true;
    if (this.options.debug) console.log('Cursor hiding enabled');
    return this;
}

/**
 * Disable cursor hiding - cursor will always be visible
 * @returns {Object} this
 */
disableCursorHiding() {
    this.options.hideCursor = false;
    this.showCursor(); // Ensure cursor is shown immediately
    if (this.options.debug) console.log('Cursor hiding disabled');
    return this;
}

/**
 * Check if cursor hiding is enabled
 * @returns {Boolean} True if cursor hiding is enabled
 */
isCursorHidingEnabled() {
    return this.options.hideCursor;
}

/* PLAYLIST CONTROLS */
showPlaylistControls() {
    if (!this.playlistPrevBtn || !this.playlistNextBtn) return;

    this.playlistPrevBtn.style.display = 'flex';
    this.playlistNextBtn.style.display = 'flex';
    this.updatePlaylistButtons();

    if (this.options.debug) console.log('Playlist controls shown');
}

hidePlaylistControls() {
    if (!this.playlistPrevBtn || !this.playlistNextBtn) return;

    this.playlistPrevBtn.style.display = 'none';
    this.playlistNextBtn.style.display = 'none';

    if (this.options.debug) console.log('Playlist controls hidden');
}

updatePlaylistButtons() {
    if (!this.playlistPrevBtn || !this.playlistNextBtn || !this.isPlaylistActive) return;

    const canGoPrev = this.currentPlaylistIndex > 0 || this.options.playlistLoop;
    const canGoNext = this.currentPlaylistIndex < this.playlist.length - 1 || this.options.playlistLoop;

    this.playlistPrevBtn.disabled = !canGoPrev;
    this.playlistNextBtn.disabled = !canGoNext;

    // Update visual state
    if (canGoPrev) {
        this.playlistPrevBtn.style.opacity = '1';
        this.playlistPrevBtn.style.cursor = 'pointer';
    } else {
        this.playlistPrevBtn.style.opacity = '0.4';
        this.playlistPrevBtn.style.cursor = 'not-allowed';
    }

    if (canGoNext) {
        this.playlistNextBtn.style.opacity = '1';
        this.playlistNextBtn.style.cursor = 'pointer';
    } else {
        this.playlistNextBtn.style.opacity = '0.4';
        this.playlistNextBtn.style.cursor = 'not-allowed';
    }
}

/* RESPONSIVE OPTIMIZATION */
optimizeButtonsForSmallHeight() {
    const currentHeight = window.innerHeight;
    const controlsRect = this.controls.getBoundingClientRect();

    // If controlbar is taller than 40% of viewport, optimize
    if (controlsRect.height > currentHeight * 0.4) {
        this.controls.classList.add('ultra-compact');
        if (this.options.debug) console.log('Applied ultra-compact mode for height:', currentHeight);
    } else {
        this.controls.classList.remove('ultra-compact');
    }

    // Hide non-essential buttons on very small heights
    const nonEssentialButtons = this.controls.querySelectorAll('.pip-btn, .speed-control');
    if (currentHeight < 180) {
        nonEssentialButtons.forEach(btn => btn.style.display = 'none');
    } else {
        nonEssentialButtons.forEach(btn => btn.style.display = '');
    }
}

/* Controls methods for main class - All original functionality preserved exactly */
