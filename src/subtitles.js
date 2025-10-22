/* Subtitles Module for MYETV Video Player 
 * Conservative modularization - original code preserved exactly
 * Created by https://www.myetv.tv https://oskarcosimo.com 
 */

initializeSubtitles() {
    this.detectTextTracks();
    this.updateSubtitlesUI();
    this.bindSubtitleEvents();
    this.initializeCustomSubtitles();

    if (this.options.debug) console.log('📝 Detected ' + this.textTracks.length + ' subtitles traces');
}

initializeCustomSubtitles() {
    // Initialize player variables
    this.customSubtitles = [];
    this.currentCustomSubtitles = [];
    this.customSubtitlesEnabled = false;
    this.customOverlayElement = null;
    this.customUpdateInterval = null;
    this.currentCustomTrackIndex = -1;

    this.createCustomSubtitleOverlay();
    this.loadCustomSubtitleTracks();

}

createCustomSubtitleOverlay() {
    var existing = document.querySelector('.custom-subtitle-overlay');
    if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
    }

    this.customOverlayElement = document.createElement('div');
    this.customOverlayElement.className = 'custom-subtitle-overlay';

    // ENHANCED styles with responsive defaults
    this.customOverlayElement.style.cssText =
        'position: absolute;' +
        'bottom: 80px;' +
        'left: 50%;' +
        'transform: translateX(-50%);' +
        'z-index: 999;' +
        'color: white;' +
        'font-family: Arial, sans-serif;' +
        'font-size: clamp(12px, 4vw, 18px);' +
        'font-weight: bold;' +
        'text-align: center;' +
        'text-shadow: 2px 2px 4px rgba(0, 0, 0, 1);' +
        'background-color: rgba(0, 0, 0, 0.6);' +
        'padding: 8px 16px;' +
        'border-radius: 6px;' +
        'max-width: 80%;' +
        'line-height: 1.3;' +
        'white-space: pre-line;' +
        'display: none;' +
        'pointer-events: none;' +
        'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);';

    var playerContainer = this.video.parentElement;
    if (playerContainer) {
        playerContainer.style.position = 'relative';
        // ENSURE proper layer stacking
        if (!playerContainer.style.zIndex) {
            playerContainer.style.zIndex = '1';
        }
        playerContainer.appendChild(this.customOverlayElement);
    }

    if (this.options.debug) console.log('✅ Custom subtitle overlay created with responsive settings');
}

customTimeToSeconds(timeString) {
    if (!timeString) return 0;

    var parts = timeString.split(',');
    if (parts.length !== 2) return 0;

    var time = parts[0];
    var millis = parts[1];

    var timeParts = time.split(':');
    if (timeParts.length !== 3) return 0;

    var hours = parseInt(timeParts[0], 10);
    var minutes = parseInt(timeParts[1], 10);
    var seconds = parseInt(timeParts[2], 10);
    var milliseconds = parseInt(millis, 10);

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) || isNaN(milliseconds)) {
        console.error('❌ customTimeToSeconds failed for:', timeString);
        return 0;
    }

    return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

parseCustomSRT(srtText) {
    var subtitles = [];
    var normalizedText = srtText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    var blocks = normalizedText.trim().split('\n\n');

    for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        var lines = block.trim().split('\n');

        if (lines.length >= 3) {
            var timeLine = lines[1].trim();
            var timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);

            if (timeMatch) {
                var startTime = this.customTimeToSeconds(timeMatch[1]);
                var endTime = this.customTimeToSeconds(timeMatch[2]);
                var text = lines.slice(2).join('\n').trim().replace(/<[^>]*>/g, '');

                if (text && text.length > 0 && startTime < endTime) {
                    subtitles.push({
                        start: startTime,
                        end: endTime,
                        text: text
                    });
                }
            }
        }
    }

    if (this.options.debug) console.log('✅ Parsed ' + subtitles.length + ' subtitles');
    return subtitles;
}

loadCustomSubtitleTracks() {
    var self = this;
    var tracks = this.video.querySelectorAll('track[kind="subtitles"]');
    if (tracks.length === 0) return;

    tracks.forEach(function (track, index) {
        var src = track.getAttribute('src');
        var label = track.getAttribute('label') || 'Unknown';
        var srclang = track.getAttribute('srclang') || '';

        // CREA L'OGGETTO PRIMA E AGGIUNGILO SUBITO
        var trackObj = {
            label: label,
            language: srclang,
            subtitles: [],
            trackIndex: index
        };
        self.customSubtitles.push(trackObj);

        fetch(src)
            .then(function (response) {
                return response.text();
            })
            .then(function (srtText) {
                var normalizedText = srtText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                var blocks = normalizedText.trim().split('\n\n');

                for (var i = 0; i < blocks.length; i++) {
                    var block = blocks[i].trim();
                    if (!block) continue;
                    var lines = block.split('\n');

                    if (lines.length >= 3) {
                        var timeLine = lines[1].trim();
                        var timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);

                        if (timeMatch) {
                            var startParts = timeMatch[1].split(',');
                            var startTimeParts = startParts[0].split(':');
                            var startTime = parseInt(startTimeParts[0], 10) * 3600 + parseInt(startTimeParts[1], 10) * 60 + parseInt(startTimeParts[2], 10) + parseInt(startParts[1], 10) / 1000;

                            var endParts = timeMatch[2].split(',');
                            var endTimeParts = endParts[0].split(':');
                            var endTime = parseInt(endTimeParts[0], 10) * 3600 + parseInt(endTimeParts[1], 10) * 60 + parseInt(endTimeParts[2], 10) + parseInt(endParts[1], 10) / 1000;

                            var text = lines.slice(2).join('\n').trim().replace(/<[^>]*>/g, '');

                            if (text && text.length > 0 && !isNaN(startTime) && !isNaN(endTime) && startTime < endTime) {
                                trackObj.subtitles.push({
                                    start: startTime,
                                    end: endTime,
                                    text: text
                                });
                            }
                        }
                    }
                }

                if (self.options.debug) {
                    console.log('✅ Loaded ' + trackObj.subtitles.length + ' subtitles for ' + label);
                }
            })
            .catch(function (error) {
                console.error('❌ Error loading ' + label + ':', error);
            });
    });
}

sanitizeSubtitleText(text) {
    if (!text) return '';

    // Remove HTML tags
    var sanitized = text.replace(/<[^>]*>/g, '');

    // Remove styling tags common in SRT files
    sanitized = sanitized.replace(/{\\.*?}/g, '');
    sanitized = sanitized.replace(/\\N/g, '\n');

    // Clean up multiple spaces
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    // Decode HTML entities if present
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitized;
    sanitized = tempDiv.textContent || tempDiv.innerText || sanitized;

    return sanitized;
}

enableCustomSubtitleTrack(trackIndex) {
    if (trackIndex < 0 || trackIndex >= this.customSubtitles.length) return false;

    this.disableCustomSubtitles();

    this.customSubtitlesEnabled = true;
    this.currentCustomTrackIndex = trackIndex;
    this.currentCustomSubtitles = this.customSubtitles[trackIndex].subtitles;

    var self = this;
    this.customUpdateInterval = setInterval(function () {
        if (self.customSubtitlesEnabled && self.currentCustomSubtitles.length > 0) {
            self.updateCustomSubtitleDisplay();
        }
    }, 100);

    if (this.options.debug) {
        console.log('✅ Custom subtitles enabled: ' + this.customSubtitles[trackIndex].label);
    }

    return true;
}

updateCustomSubtitleDisplay() {
    if (!this.customSubtitlesEnabled || this.currentCustomSubtitles.length === 0) return;

    var currentTime = this.video.currentTime;
    var currentSubtitle = null;

    for (var i = 0; i < this.currentCustomSubtitles.length; i++) {
        var sub = this.currentCustomSubtitles[i];
        if (currentTime >= sub.start && currentTime <= sub.end) {
            currentSubtitle = sub;
            break;
        }
    }

    if (currentSubtitle) {
        this.customOverlayElement.textContent = currentSubtitle.text;
        this.customOverlayElement.style.display = 'block';
    } else {
        this.customOverlayElement.style.display = 'none';
        this.customOverlayElement.textContent = '';
    }
}

disableCustomSubtitles() {
    this.customSubtitlesEnabled = false;
    this.currentCustomTrackIndex = -1;

    if (this.customOverlayElement) {
        this.customOverlayElement.style.display = 'none';
        this.customOverlayElement.textContent = '';
    }

    if (this.customUpdateInterval) {
        clearInterval(this.customUpdateInterval);
        this.customUpdateInterval = null;
    }

    if (this.options.debug) console.log('❌ Custom subtitles disabled');
}

detectTextTracks() {
    this.textTracks = [];

    if (this.video.textTracks) {
        if (this.options.debug) console.log('🔍 Detecting text tracks... Found: ' + this.video.textTracks.length);

        for (var i = 0; i < this.video.textTracks.length; i++) {
            var track = this.video.textTracks[i];

            if (track.kind === 'subtitles' || track.kind === 'captions') {
                this.textTracks.push({
                    track: track,
                    label: track.label || 'Track ' + (i + 1),
                    language: track.language || 'unknown',
                    kind: track.kind,
                    index: i
                });
            }
        }

        if (this.options.debug) console.log('📊 Total subtitle tracks detected: ' + this.textTracks.length);
    }
}

enableSubtitleTrack(trackIndex) {
    if (trackIndex < 0 || trackIndex >= this.textTracks.length) return;

    // Disable all tracks first
    this.disableAllTracks();

    // Enable ONLY the custom subtitle system (not native browser)
    var success = this.enableCustomSubtitleTrack(trackIndex);

    if (success) {
        this.currentSubtitleTrack = this.textTracks[trackIndex].track;
        this.subtitlesEnabled = true;

        // Make sure native tracks stay DISABLED
        if (this.video.textTracks && this.video.textTracks[trackIndex]) {
            this.video.textTracks[trackIndex].mode = 'disabled'; // Keep native disabled
        }

        this.updateSubtitlesButton();
        this.populateSubtitlesMenu();

        if (this.options.debug) {
            console.log('✅ Custom subtitles enabled:', this.textTracks[trackIndex].label);
        }

        // Trigger subtitle change event
        this.triggerEvent('subtitlechange', {
            enabled: true,
            trackIndex: trackIndex,
            trackLabel: this.textTracks[trackIndex].label,
            trackLanguage: this.textTracks[trackIndex].language
        });
    } else {
        if (this.options.debug) {
            console.error('❌ Failed to enable custom subtitles for track', trackIndex);
        }
    }
}

disableSubtitles() {
    this.disableCustomSubtitles();
    this.disableAllTracks();

    this.currentSubtitleTrack = null;
    this.subtitlesEnabled = false;

    this.updateSubtitlesButton();
    this.populateSubtitlesMenu();

    if (this.options.debug) console.log('📝 Subtitles disabled');

    this.triggerEvent('subtitlechange', {
        enabled: false,
        trackIndex: -1
    });
}

disableAllTracks() {
    if (!this.video || !this.video.textTracks) return;

    // Disable all native tracks
    for (var i = 0; i < this.video.textTracks.length; i++) {
        this.video.textTracks[i].mode = 'hidden';
    }

    // Also disable custom subtitles
    this.disableCustomSubtitles();
}

getAvailableSubtitles() {
    return this.textTracks.map(function (t) {
        return {
            label: t.label,
            language: t.language,
            kind: t.kind
        };
    });
}

setSubtitleTrack(trackIndex) {
    if (trackIndex === -1) {
        this.disableSubtitles();
    } else {
        this.enableSubtitleTrack(trackIndex);
    }
    return this;
}

getCurrentSubtitleTrack() {
    if (!this.subtitlesEnabled || !this.currentSubtitleTrack) return -1;

    for (var i = 0; i < this.textTracks.length; i++) {
        if (this.textTracks[i].track === this.currentSubtitleTrack) {
            return i;
        }
    }
    return -1;
}

isSubtitlesEnabled() {
    return this.subtitlesEnabled;
}

updateSubtitlesButton() {
    var subtitlesBtn = this.controls && this.controls.querySelector('.subtitles-btn');
    if (!subtitlesBtn) return;

    subtitlesBtn.classList.remove('active');

    if (this.subtitlesEnabled) {
        subtitlesBtn.title = this.t('subtitlesdisable');
    } else {
        subtitlesBtn.title = this.t('subtitlesenable');
    }
}

populateSubtitlesMenu() {
    var subtitlesMenu = this.controls && this.controls.querySelector('.subtitles-menu');
    if (!subtitlesMenu) return;

    var menuHTML = '<div class="subtitles-option ' + (!this.subtitlesEnabled ? 'active' : '') + '" data-track="off">Off</div>';

    for (var i = 0; i < this.textTracks.length; i++) {
        var trackData = this.textTracks[i];
        var isActive = this.currentSubtitleTrack === trackData.track;
        menuHTML += '<div class="subtitles-option ' + (isActive ? 'active' : '') + '" data-track="' + i + '">' + trackData.label + '</div>';
    }

    subtitlesMenu.innerHTML = menuHTML;
}

updateSubtitlesUI() {
    var subtitlesControl = this.controls && this.controls.querySelector('.subtitles-control');

    if (this.textTracks.length > 0 && this.options.showSubtitles) {
        if (subtitlesControl) subtitlesControl.style.display = 'block';
        this.populateSubtitlesMenu();
    } else {
        if (subtitlesControl) subtitlesControl.style.display = 'none';
    }

    this.updateSubtitlesButton();
}

bindSubtitleEvents() {
    var self = this;

    if (this.video.textTracks) {
        this.isChangingSubtitles = false; // flag to prevent loops

        this.video.textTracks.addEventListener('change', function () {
            // ignore changes initiated by the player itself
            if (self.isChangingSubtitles) {
                return;
            }

            // only update ui
            self.updateSubtitlesUI();
        });
    }

    // Add timeupdate listener for custom subtitle display
    this.video.addEventListener('timeupdate', () => {
        if (this.customSubtitlesEnabled) {
            this.updateCustomSubtitleDisplay();
        }
    });

    // Menu click events
    var subtitlesMenu = this.controls && this.controls.querySelector('.subtitles-menu');
    if (subtitlesMenu) {
        subtitlesMenu.addEventListener('click', function (e) {
            var option = e.target.closest('.subtitles-option');
            if (!option) return;

            self.isChangingSubtitles = true; // active flag

            var trackIndex = option.getAttribute('data-track');
            if (trackIndex === 'off') {
                self.disableSubtitles();
            } else {
                self.enableSubtitleTrack(parseInt(trackIndex));
            }

            setTimeout(function () {
                self.isChangingSubtitles = false; // disable flag
            }, 100);
        });
    }
}

handleSubtitlesMenuClick(e) {
    var option = e.target.closest('.subtitles-option');
    if (!option) return; // This prevents button clicks from toggling

    var trackIndex = option.getAttribute('data-track');

    if (trackIndex === 'off') {
        this.disableSubtitles();
    } else {
        // Don't check for 'toggle' - just enable the track
        this.enableSubtitleTrack(parseInt(trackIndex));
    }

    this.updateSubtitlesButton();
    this.populateSubtitlesMenu();
}

toggleSubtitles() {
    if (this.textTracks.length === 0) return;

    if (this.subtitlesEnabled) {
        this.disableSubtitles();
    } else {
        this.enableSubtitleTrack(0);
    }
}