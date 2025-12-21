// Events Module for MYETV Video Player
// Conservative modularization - original code preserved exactly
// Created by https://www.myetv.tv https://oskarcosimo.com

    addEventListener(eventType, callback) {
        if (typeof callback !== 'function') {
            if (this.options.debug) console.warn(`Callback for event '${eventType}' is not a function`);
            return this;
        }

        if (!this.eventCallbacks[eventType]) {
            this.eventCallbacks[eventType] = [];
        }

        this.eventCallbacks[eventType].push(callback);
        if (this.options.debug) console.log(`Event '${eventType}' registered`);
        return this;
    }

    removeEventListener(eventType, callback) {
        if (!this.eventCallbacks[eventType]) return this;

        const index = this.eventCallbacks[eventType].indexOf(callback);
        if (index > -1) {
            this.eventCallbacks[eventType].splice(index, 1);
            if (this.options.debug) console.log(`Event '${eventType}' removed`);
        }
        return this;
    }

    triggerEvent(eventType, data = {}) {
        if (!this.eventCallbacks[eventType]) return;

        this.eventCallbacks[eventType].forEach(callback => {
            try {
                callback({
                    type: eventType,
                    timestamp: Date.now(),
                    player: this,
                    ...data
                });
            } catch (error) {
                if (this.options.debug) console.error(`Error in event '${eventType}':`, error);
            }
        });
    }

    getEventData() {
        const state = this.getPlayerState();
        return {
            played: state.isPlaying,
            paused: state.isPaused,
            subtitleEnabled: state.subtitlesEnabled,
            pipMode: state.isPictureInPicture,
            fullscreenMode: state.isFullscreen,
            speed: state.playbackRate,
            controlBarLength: state.currentTime,
            volumeIsMuted: state.isMuted,
            // Additional useful data
            duration: state.duration,
            volume: state.volume,
            quality: state.currentQuality,
            buffered: this.getBufferedTime()
        };
    }

    bindSubtitleEvents() {
        if (this.video.textTracks) {
            for (let i = 0; i < this.video.textTracks.length; i++) {
                const track = this.video.textTracks[i];

                track.addEventListener('cuechange', () => {
                    if (this.options.debug) console.log('Cue change detected:', track.activeCues);
                });
            }
        }
    }

    setupVolumeTooltipEvents() {
        const volumeSlider = this.controls?.querySelector('.volume-slider');
        if (!volumeSlider) return;

        let isMouseOverVolume = false;
        let isDragging = false;

        volumeSlider.addEventListener('mouseenter', () => {
            isMouseOverVolume = true;
            // IMPORTANT: Set position FIRST, then show tooltip
            this.updateVolumeTooltipPosition(this.video.volume);
            this.updateVolumeTooltip();
            if (this.volumeTooltip) {
                this.volumeTooltip.classList.add('visible');
            }
        });

        volumeSlider.addEventListener('mouseleave', () => {
            isMouseOverVolume = false;
            if (!isDragging) {
                setTimeout(() => {
                    if (!isMouseOverVolume && !isDragging && this.volumeTooltip) {
                        this.volumeTooltip.classList.remove('visible');
                    }
                }, 150);
            }
        });

        volumeSlider.addEventListener('mousemove', (e) => {
            if (isMouseOverVolume && this.volumeTooltip && !isDragging) {
                const rect = volumeSlider.getBoundingClientRect();
                const offsetX = e.clientX - rect.left;
                const sliderWidth = rect.width;

                const thumbSize = 14;
                const availableWidth = sliderWidth - thumbSize;
                let volumeAtPosition = (offsetX - thumbSize / 2) / availableWidth;
                volumeAtPosition = Math.max(0, Math.min(1, volumeAtPosition));

                const hoverVolume = Math.round(volumeAtPosition * 100);

                // Set position first, then update text to avoid flicker
                this.updateVolumeTooltipPosition(volumeAtPosition);
                this.volumeTooltip.textContent = hoverVolume + '%';
            }
        });

        // During dragging - set position immediately
        volumeSlider.addEventListener('mousedown', () => {
            isDragging = true;
            if (this.volumeTooltip) {
                // Ensure position is set before showing
                this.updateVolumeTooltipPosition(this.video.volume);
                this.volumeTooltip.classList.add('visible');
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                setTimeout(() => {
                    if (!isMouseOverVolume && this.volumeTooltip) {
                        this.volumeTooltip.classList.remove('visible');
                    }
                }, 500);
            }
        });

        volumeSlider.addEventListener('input', (e) => {
            const volumeValue = parseFloat(e.target.value);
            const volume = Math.round(volumeValue * 100);
            if (this.volumeTooltip) {
                // Update position first, then text
                this.updateVolumeTooltipPosition(volumeValue);
                this.volumeTooltip.textContent = volume + '%';
            }
            isDragging = true;
        });

        volumeSlider.addEventListener('change', () => {
            // Ensure final position is correct
            this.updateVolumeTooltip();
            setTimeout(() => {
                isDragging = false;
            }, 100);
        });
    }

    bindEvents() {
    if (this.video) {

        // Play from start button
        if (this.playFromStartBtn) {
            this.playFromStartBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.restartVideo();
            });
        }

        // Playback events
        this.video.addEventListener('playing', () => {
            this.hideLoading();
            this.closeAllMenus();

            // Update play/pause button when video actually starts playing
            if (this.playIcon && this.pauseIcon) {
                this.playIcon.classList.add('hidden');
                this.pauseIcon.classList.remove('hidden');
            }

            // Trigger playing event - video is now actually playing
            this.triggerEvent('playing', {
                currentTime: this.getCurrentTime(),
                duration: this.getDuration()
            });
        });

        this.video.addEventListener('waiting', () => {
            if (!this.isChangingQuality) {
                this.showLoading();
                // Trigger waiting event - video is buffering
                this.triggerEvent('waiting', {
                    currentTime: this.getCurrentTime()
                });
            }
        });

        this.video.addEventListener('seeking', () => {
            // Trigger seeking event - seek operation started
            this.triggerEvent('seeking', {
                currentTime: this.getCurrentTime(),
                targetTime: this.video.currentTime
            });
        });

        this.video.addEventListener('seeked', () => {
            // Trigger seeked event - seek operation completed
            this.triggerEvent('seeked', {
                currentTime: this.getCurrentTime()
            });
        });

        // Loading events
        this.video.addEventListener('loadstart', () => {
            if (!this.isChangingQuality) {
                this.showLoading();
            }

            // Update time display to show "Loading..." during initial buffering
            this.updateTimeDisplay();

            // Trigger loadstart event - browser started loading media
            this.triggerEvent('loadstart');
        });

        this.video.addEventListener('loadedmetadata', () => {
            this.updateDuration();

            // Update time display when metadata is loaded
            this.updateTimeDisplay();

            // Trigger loadedmetadata event - video metadata loaded
            this.triggerEvent('loadedmetadata', {
                duration: this.getDuration(),
                videoWidth: this.video.videoWidth,
                videoHeight: this.video.videoHeight
            });

            // Initialize subtitles after metadata is loaded
            setTimeout(() => {
                this.initializeSubtitles();
            }, 100);
        });

        this.video.addEventListener('loadeddata', () => {
            if (!this.isChangingQuality) {
                this.hideLoading();
            }

            // Update time display when data is loaded
            this.updateTimeDisplay();

            // Trigger loadeddata event - current frame data loaded
            this.triggerEvent('loadeddata', {
                currentTime: this.getCurrentTime()
            });
        });

        this.video.addEventListener('canplay', () => {
            if (!this.isChangingQuality) {
                this.hideLoading();
            }

            // Update time display when video can play
            this.updateTimeDisplay();

            // Trigger canplay event - video can start playing
            this.triggerEvent('canplay', {
                currentTime: this.getCurrentTime(),
                duration: this.getDuration()
            });
        });

        // Also add to waiting event
        this.video.addEventListener('waiting', () => {
            if (!this.isChangingQuality) {
                this.showLoading();

                // Update time display during buffering
                this.updateTimeDisplay();

                // Trigger waiting event - video is buffering
                this.triggerEvent('waiting', {
                    currentTime: this.getCurrentTime()
                });
            }
        });

        this.video.addEventListener('progress', () => {
            this.updateBuffer();
            // Trigger progress event - browser is downloading media
            this.triggerEvent('progress', {
                buffered: this.getBufferedTime(),
                duration: this.getDuration()
            });
        });

        this.video.addEventListener('durationchange', () => {
            this.updateDuration();
            // Trigger durationchange event - video duration changed
            this.triggerEvent('durationchange', {
                duration: this.getDuration()
            });
        });

        // Error events
        this.video.addEventListener('error', (e) => {
            this.onVideoError(e);
            // Trigger error event - media loading/playback error occurred
            this.triggerEvent('error', {
                code: this.video.error?.code,
                message: this.video.error?.message,
                src: this.video.currentSrc || this.video.src
            });
        });

        this.video.addEventListener('stalled', () => {
            // Trigger stalled event - browser is trying to fetch data but it's not available
            this.triggerEvent('stalled', {
                currentTime: this.getCurrentTime()
            });
        });


            this.video.addEventListener('timeupdate', () => this.updateProgress());

            this.video.addEventListener('ended', () => this.onVideoEnded());

            // Complete video click logic with doubleTapPause support (DESKTOP)
            this.video.addEventListener('click', () => {
                if (!this.options.pauseClick) return;

                if (this.options.doubleTapPause) {
                    // DOUBLE TAP MODE: primo click mostra controlli, secondo pausa
                    const controlsVisible = this.controls && this.controls.classList.contains('show');

                    if (controlsVisible) {
                        // Controlbar VISIBILE - pausa video
                        this.togglePlayPause();
                    } else {
                        // Controlbar NASCOSTA - solo mostra controlli
                        this.showControlsNow();
                        this.resetAutoHideTimer();
                    }
                } else {
                    // NORMAL MODE: sempre pausa (comportamento originale)
                    this.togglePlayPause();
                }
            });
            this.video.addEventListener('volumechange', () => this.updateVolumeSliderVisual());

            // Complete touch logic with doubleTapPause support (MOBILE)
            this.video.addEventListener('touchend', (e) => {
                // Prevent click event from firing after touchend
                e.preventDefault();

                if (!this.options.pauseClick) return;

                if (this.options.doubleTapPause) {
                    // DOUBLE TAP MODE: primo tap mostra controlli, secondo pausa (SAME as desktop)
                    const controlsVisible = this.controls && this.controls.classList.contains('show');

                    if (controlsVisible) {
                        // Controlbar VISIBILE - pausa video
                        this.togglePlayPause();
                    } else {
                        // Controlbar NASCOSTA - solo mostra controlli
                        this.showControlsNow();
                        this.resetAutoHideTimer();
                    }
                } else {
                    // NORMAL MODE: sempre pausa (comportamento originale, SAME as desktop)
                    this.togglePlayPause();
                }
            });

            // CRITICAL: Start auto-hide when video starts playing
            this.video.addEventListener('play', () => {
                if (this.options.autoHide && this.autoHideInitialized) {
                    this.showControlsNow();
                    this.resetAutoHideTimer();
                }
            });

            // Picture-in-Picture Events
            this.video.addEventListener('enterpictureinpicture', () => {
                this.onEnterPiP();
                this.triggerEvent('pipchange', {
                    active: true,
                    mode: 'enter'
                });
            });

            this.video.addEventListener('leavepictureinpicture', () => {
                this.onLeavePiP();
                this.triggerEvent('pipchange', {
                    active: false,
                    mode: 'exit'
                });
            });
        }

        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        }

        if (this.muteBtn) {
            this.muteBtn.addEventListener('click', () => this.toggleMute());
        }

        if (this.fullscreenBtn) {
            this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }

        if (this.pipBtn) {
            this.pipBtn.addEventListener('click', () => this.togglePictureInPicture());
        }

    if (this.volumeSlider) {
        let isDraggingVolume = false;

        // Input event
        this.volumeSlider.addEventListener('input', (e) => {
            this.updateVolume(e.target.value);
            this.updateVolumeSliderVisual();
            this.initVolumeTooltip();
        });

        // MOUSE DRAG - Start
        this.volumeSlider.addEventListener('mousedown', (e) => {
            isDraggingVolume = true;
            if (this.volumeTooltip) {
                this.volumeTooltip.classList.add('visible');
            }
        });

        // MOUSE DRAG - Move
        document.addEventListener('mousemove', (e) => {
            if (isDraggingVolume && this.volumeSlider) {
                const rect = this.volumeSlider.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = Math.max(0, Math.min(1, clickX / rect.width));
                const value = Math.round(percentage * 100);

                this.volumeSlider.value = value;
                this.updateVolume(value);
                this.updateVolumeSliderVisual();
                if (this.volumeTooltip) {
                    this.updateVolumeTooltipPosition(value / 100);
                }
            }
        });

        // MOUSE DRAG - End
        document.addEventListener('mouseup', () => {
            if (isDraggingVolume) {
                isDraggingVolume = false;
                if (this.volumeTooltip) {
                    setTimeout(() => {
                        this.volumeTooltip.classList.remove('visible');
                    }, 300);
                }
            }
        });

        // TOUCH DRAG - Start
        this.volumeSlider.addEventListener('touchstart', (e) => {
            isDraggingVolume = true;
            if (this.volumeTooltip) {
                this.volumeTooltip.classList.add('visible');
            }
        }, { passive: true });

        // TOUCH DRAG - Move
        this.volumeSlider.addEventListener('touchmove', (e) => {
            if (isDraggingVolume) {
                const touch = e.touches[0];
                const rect = this.volumeSlider.getBoundingClientRect();
                const touchX = touch.clientX - rect.left;
                const percentage = Math.max(0, Math.min(1, touchX / rect.width));
                const value = Math.round(percentage * 100);

                this.volumeSlider.value = value;
                this.updateVolume(value);
                this.updateVolumeSliderVisual();
                if (this.volumeTooltip) {
                    this.updateVolumeTooltipPosition(value / 100);
                }
            }
        }, { passive: true });

        // TOUCH DRAG - End
        this.volumeSlider.addEventListener('touchend', () => {
            if (isDraggingVolume) {
                isDraggingVolume = false;
                if (this.volumeTooltip) {
                    setTimeout(() => {
                        this.volumeTooltip.classList.remove('visible');
                    }, 300);
                }
            }
        }, { passive: true });
    }

    if (this.progressContainer) {
        // Mouse events (desktop)
        this.progressContainer.addEventListener('click', (e) => this.seek(e));
        this.progressContainer.addEventListener('mousedown', (e) => this.startSeeking(e));
        if (this.progressHandle) {
            this.progressHandle.addEventListener('mousedown', this.startSeeking.bind(this));
            this.progressHandle.addEventListener('touchstart', this.startSeeking.bind(this), { passive: false });
        }

        // Touch events (mobile)
        this.progressContainer.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent scrolling when touching the seek bar
            this.startSeeking(e);
        }, { passive: false });

        this.setupSeekTooltip();
    }

    // Add touch events directly on the handle for better mobile dragging
    if (this.progressHandle) {
        this.progressHandle.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent default touch behavior
            e.stopPropagation(); // Stop event from bubbling to progressContainer
            this.startSeeking(e);
        }, { passive: false });
    }

        // NOTE: Auto-hide events are handled in initAutoHide() after everything is ready

        if (this.speedMenu) {
            this.speedMenu.addEventListener('click', (e) => this.changeSpeed(e));
        }

        if (this.qualityMenu) {
            this.qualityMenu.addEventListener('click', (e) => this.changeQuality(e));
        }

        if (this.subtitlesMenu) {
            this.subtitlesMenu.addEventListener('click', (e) => this.handleSubtitlesMenuClick(e));
        }

        document.addEventListener('fullscreenchange', () => this.updateFullscreenButton());
        document.addEventListener('webkitfullscreenchange', () => this.updateFullscreenButton());
        document.addEventListener('mozfullscreenchange', () => this.updateFullscreenButton());

        document.addEventListener('mousemove', (e) => this.continueSeeking(e));
    document.addEventListener('mouseup', () => this.endSeeking());

    // Touch events for seeking (mobile)
    document.addEventListener('touchmove', (e) => {
        if (this.isUserSeeking) {
            e.preventDefault(); // Prevent scrolling while seeking
            this.continueSeeking(e);
        }
    }, { passive: false });

    document.addEventListener('touchend', () => this.endSeeking());
    document.addEventListener('touchcancel', () => this.endSeeking());

    }

// Events methods for main class
// All original functionality preserved exactly
