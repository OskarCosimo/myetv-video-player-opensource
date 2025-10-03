
/* Controls Module for MYETV Video Player 
 * Conservative modularization - original code preserved exactly
 * Created by https://www.myetv.tv https://oskarcosimo.com 
 */

/* AUTO-HIDE SYSTEM - IMPROVED AND COMPREHENSIVE */
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

    if (this.mouseOverControls) {
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
    }

    // ADD THIS: Add has-controls class to container for watermark visibility
    if (this.container) {
        this.container.classList.add('has-controls');
    }

    // Fix: Show title overlay with controls if not persistent
    if (this.options.showTitleOverlay && !this.options.persistentTitle && this.options.videoTitle) {
        this.showTitleOverlay();
    }

    if (this.autoHideDebug && this.options.debug) console.log('✅ Controls shown');
}

hideControlsNow() {
    // Don't hide if mouse is still over controls
    if (this.mouseOverControls) {
        if (this.autoHideDebug && this.options.debug) console.log('⏸️ Not hiding - mouse still over controls');
        return;
    }

    // Don't hide if video is paused
    if (this.video && this.video.paused) {
        if (this.autoHideDebug && this.options.debug) console.log('⏸️ Not hiding - video is paused');
        return;
    }

    if (this.controls) {
        this.controls.classList.remove('show');
    }

    // ADD THIS: Remove has-controls class from container for watermark visibility
    if (this.container) {
        this.container.classList.remove('has-controls');
    }

    // Fix: Hide title overlay with controls if not persistent
    if (this.options.showTitleOverlay && !this.options.persistentTitle) {
        this.hideTitleOverlay();
    }

    if (this.autoHideDebug && this.options.debug) console.log('❌ Controls hidden');
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
                    <div class="progress-handle"></div>
                </div>
                ${this.options.showSeekTooltip ? '<div class="seek-tooltip">0:00</div>' : ''}
            </div>

            <div class="controls-main">
                <div class="controls-left">
                    <button class="control-btn play-pause-btn" data-tooltip="play_pause">
                        <span class="icon play-icon">▶</span>
                        <span class="icon pause-icon hidden">⏸</span>
                    </button>

                    <button class="control-btn mute-btn" data-tooltip="mute_unmute">
    <span class="icon volume-icon">🔊</span>
    <span class="icon mute-icon hidden">🔇</span>
                    </button>

                    <div class="volume-container" data-orientation="${this.options.volumeSlider}">
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
                        <span class="icon">⏮</span>
                    </button>

                    <button class="control-btn playlist-next-btn" data-tooltip="nextvideo" style="display: none;">
                        <span class="icon">⏭</span>
                    </button>

                    ${this.options.showSubtitles ? `
                    <div class="subtitles-control" style="display: none;">
                        <button class="control-btn subtitles-btn" data-tooltip="subtitles">
                            <span class="icon">CC</span>
                        </button>
                        <div class="subtitles-menu">
                            <div class="subtitles-option active" data-track="off">Off</div>
                        </div>
                    </div>
                    ` : ''}

                    ${this.options.showSpeedControl ? `
                    <div class="speed-control">
                        <button class="control-btn speed-btn" data-tooltip="playback_speed">1x</button>
                        <div class="speed-menu">
                            <div class="speed-option" data-speed="0.5">0.5x</div>
                            <div class="speed-option" data-speed="0.75">0.75x</div>
                            <div class="speed-option active" data-speed="1">1x</div>
                            <div class="speed-option" data-speed="1.25">1.25x</div>
                            <div class="speed-option" data-speed="1.5">1.5x</div>
                            <div class="speed-option" data-speed="2">2x</div>
                        </div>
                    </div>
                    ` : ''}

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
                        <span class="icon pip-icon">⧉</span>
                        <span class="icon pip-exit-icon hidden">⧉</span>
                    </button>
                    ` : ''}

                    <div class="settings-control">
                        <button class="control-btn settings-btn" data-tooltip="settings_menu">
                            <span class="">⚙</span>
                        </button>
                        <div class="settings-menu"></div>
                    </div>

                    ${this.options.showFullscreen ? `
                    <button class="control-btn fullscreen-btn" data-tooltip="fullscreen">
                        <span class="icon fullscreen-icon">⛶</span>
                        <span class="icon exit-fullscreen-icon hidden">⛉</span>
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
    }, 100);
}

/* NEW: Initialize responsive menu with dynamic width calculation */
initializeResponsiveMenu() {
    if (!this.controls) return;

    // Track screen size
    this.isSmallScreen = false;

    // Check initial size and set up listener
    this.checkScreenSize();

    window.addEventListener('resize', () => {
        this.checkScreenSize();
    });

    // Bind events for settings menu
    this.bindSettingsMenuEvents();
}

/* NEW: Dynamic width calculation based on logo presence */
getResponsiveThreshold() {
    // Check if brand logo is enabled and present
    const hasLogo = this.options.brandLogoEnabled && this.options.brandLogoUrl;

    // If logo is present, use higher threshold (650px), otherwise 550px
    return hasLogo ? 650 : 550;
}

/* NEW: Check if screen is under dynamic threshold */
checkScreenSize() {
    const threshold = this.getResponsiveThreshold();
    const newIsSmallScreen = window.innerWidth <= threshold;

    if (newIsSmallScreen !== this.isSmallScreen) {
        this.isSmallScreen = newIsSmallScreen;
        this.updateSettingsMenuVisibility();

        if (this.options.debug) {
            console.log(`Screen check: ${window.innerWidth}px vs ${threshold}px threshold (logo: ${this.options.brandLogoEnabled}), small: ${this.isSmallScreen}`);
        }
    }
}

/* NEW: Update settings menu visibility based on screen size */
updateSettingsMenuVisibility() {
    const settingsControl = this.controls?.querySelector('.settings-control');
    if (!settingsControl) return;

    if (this.isSmallScreen) {
        // Show settings menu and hide individual controls
        settingsControl.style.display = 'block';

        // Hide controls that will be moved to settings menu
        const pipBtn = this.controls.querySelector('.pip-btn');
        const speedControl = this.controls.querySelector('.speed-control');
        const subtitlesControl = this.controls.querySelector('.subtitles-control');

        if (pipBtn) pipBtn.style.display = 'none';
        if (speedControl) speedControl.style.display = 'none';
        if (subtitlesControl) subtitlesControl.style.display = 'none';

        this.populateSettingsMenu();
    } else {
        // Hide settings menu and show individual controls
        settingsControl.style.display = 'none';

        // Show original controls
        const pipBtn = this.controls.querySelector('.pip-btn');
        const speedControl = this.controls.querySelector('.speed-control');
        const subtitlesControl = this.controls.querySelector('.subtitles-control');

        if (pipBtn && this.options.showPictureInPicture && this.isPiPSupported) {
            pipBtn.style.display = 'flex';
        }
        if (speedControl && this.options.showSpeedControl) {
            speedControl.style.display = 'block';
        }
        if (subtitlesControl && this.options.showSubtitles && this.textTracks.length > 0) {
            subtitlesControl.style.display = 'block';
        }
    }
}

/* NEW: Populate settings menu with controls */
populateSettingsMenu() {
    const settingsMenu = this.controls?.querySelector('.settings-menu');
    if (!settingsMenu) return;

    let menuHTML = '';

    // Picture-in-Picture option
    if (this.options.showPictureInPicture && this.isPiPSupported) {
        const pipLabel = this.t('picture_in_picture') || 'Picture-in-Picture';
        menuHTML += `<div class="settings-option" data-action="pip">
            <span class="settings-option-label">${pipLabel}</span>
        </div>`;
    }

    // Speed Control submenu
    if (this.options.showSpeedControl) {
        const speedLabel = this.t('playback_speed') || 'Playback Speed';
        const currentSpeed = this.video ? this.video.playbackRate : 1;
        menuHTML += `<div class="settings-option" data-action="speed">
            <span class="settings-option-label">${speedLabel}</span>
            <span class="settings-option-value">${currentSpeed}x</span>
            <div class="settings-submenu speed-submenu">
                <div class="settings-suboption ${currentSpeed === 0.5 ? 'active' : ''}" data-speed="0.5">0.5x</div>
                <div class="settings-suboption ${currentSpeed === 0.75 ? 'active' : ''}" data-speed="0.75">0.75x</div>
                <div class="settings-suboption ${currentSpeed === 1 ? 'active' : ''}" data-speed="1">1x</div>
                <div class="settings-suboption ${currentSpeed === 1.25 ? 'active' : ''}" data-speed="1.25">1.25x</div>
                <div class="settings-suboption ${currentSpeed === 1.5 ? 'active' : ''}" data-speed="1.5">1.5x</div>
                <div class="settings-suboption ${currentSpeed === 2 ? 'active' : ''}" data-speed="2">2x</div>
            </div>
        </div>`;
    }

    // Subtitles submenu
    if (this.options.showSubtitles && this.textTracks && this.textTracks.length > 0) {
        const subtitlesLabel = this.t('subtitles') || 'Subtitles';
        const currentTrack = this.currentSubtitleTrack;
        const currentLabel = this.subtitlesEnabled && currentTrack
            ? (currentTrack.label || 'Track')
            : (this.t('subtitlesoff') || 'Off');

        menuHTML += `<div class="settings-option" data-action="subtitles">
            <span class="settings-option-label">${subtitlesLabel}</span>
            <span class="settings-option-value">${currentLabel}</span>
            <div class="settings-submenu subtitles-submenu">
                <div class="settings-suboption ${!this.subtitlesEnabled ? 'active' : ''}" data-track="off">
                    ${this.t('subtitlesoff') || 'Off'}
                </div>`;

        this.textTracks.forEach((trackData, index) => {
            const isActive = this.currentSubtitleTrack === trackData.track;
            menuHTML += `<div class="settings-suboption ${isActive ? 'active' : ''}" data-track="${index}">
                ${trackData.label}
            </div>`;
        });

        menuHTML += '</div></div>';
    }

    settingsMenu.innerHTML = menuHTML;
}

/* NEW: Bind settings menu events */
bindSettingsMenuEvents() {
    const settingsMenu = this.controls?.querySelector('.settings-menu');
    if (!settingsMenu) return;

    settingsMenu.addEventListener('click', (e) => {
        e.stopPropagation();

        // Handle direct actions
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
            const parent = e.target.closest('.settings-option');
            const action = parent?.getAttribute('data-action');

            if (action === 'speed') {
                const speed = parseFloat(e.target.getAttribute('data-speed'));
                if (speed && speed > 0 && this.video && !this.isChangingQuality) {
                    this.video.playbackRate = speed;

                    // Update active states
                    parent.querySelectorAll('.settings-suboption').forEach(opt => {
                        opt.classList.remove('active');
                    });
                    e.target.classList.add('active');

                    // Update value display
                    const valueEl = parent.querySelector('.settings-option-value');
                    if (valueEl) valueEl.textContent = speed + 'x';

                    // Trigger event
                    this.triggerEvent('speedchange', { speed, previousSpeed: this.video.playbackRate });
                }
            }

            else if (action === 'subtitles') {
                const trackData = e.target.getAttribute('data-track');

                if (trackData === 'off') {
                    this.disableSubtitles();
                } else {
                    const trackIndex = parseInt(trackData);
                    this.enableSubtitleTrack(trackIndex);
                }

                // Update active states
                parent.querySelectorAll('.settings-suboption').forEach(opt => {
                    opt.classList.remove('active');
                });
                e.target.classList.add('active');

                // Update value display
                const valueEl = parent.querySelector('.settings-option-value');
                if (valueEl) valueEl.textContent = e.target.textContent;
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
