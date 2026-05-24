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

// Universal time parser for both SRT (00:00:00,000) and VTT (00:00.000)
parseTimeToSecondsUniversal(timeString) {
    if (!timeString) return 0;

    // Normalize comma to dot for consistency
    let normalized = timeString.replace(',', '.');
    let parts = normalized.split('.');

    let timeParts = parts[0].split(':');
    let ms = parts[1] ? parseInt(parts[1], 10) / 1000 : 0;

    let hours = 0, minutes = 0, seconds = 0;

    if (timeParts.length === 3) {
        // SRT Format: HH:MM:SS
        hours = parseInt(timeParts[0], 10);
        minutes = parseInt(timeParts[1], 10);
        seconds = parseInt(timeParts[2], 10);
    } else if (timeParts.length === 2) {
        // VTT Short Format: MM:SS
        minutes = parseInt(timeParts[0], 10);
        seconds = parseInt(timeParts[1], 10);
    }

    return (hours * 3600) + (minutes * 60) + seconds + ms;
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

// Universal time parser for both SRT (00:00:00,000) and VTT (00:00.000)
parseTimeToSecondsUniversal(timeString) {
    if (!timeString) return 0;

    // Normalize comma to dot for consistency
    const normalized = timeString.replace(',', '.');
    const parts = normalized.split('.');

    const timeParts = parts[0].split(':');
    const ms = parts[1] ? parseInt(parts[1], 10) / 1000 : 0;

    let hours = 0, minutes = 0, seconds = 0;

    if (timeParts.length === 3) {
        // Full format: HH:MM:SS
        hours = parseInt(timeParts[0], 10);
        minutes = parseInt(timeParts[1], 10);
        seconds = parseInt(timeParts[2], 10);
    } else if (timeParts.length === 2) {
        // Short format (common in VTT): MM:SS
        minutes = parseInt(timeParts[0], 10);
        seconds = parseInt(timeParts[1], 10);
    }

    return (hours * 3600) + (minutes * 60) + seconds + ms;
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

// Method to inject multiple external subtitle tracks
injectExternalSubtitleTracks(tracksArray) {
    // Check if video exists and if tracksArray is actually an array
    if (!this.video || !Array.isArray(tracksArray) || tracksArray.length === 0) return;

    this.video.crossOrigin = "anonymous";
    let loadedCount = 0;

    // Loop through each track object in the array
    tracksArray.forEach(trackData => {
        const trackEl = document.createElement('track');
        trackEl.kind = 'subtitles';
        trackEl.label = trackData.label;
        trackEl.srclang = trackData.lang;
        trackEl.src = trackData.src;

        // Set default if specified in the JSON
        if (trackData.default) {
            trackEl.default = true;
        }

        // Listen for the load event on EACH track
        trackEl.addEventListener('load', () => {
            if (trackEl.track) {
                // Only show the default one, keep others hidden but ready
                trackEl.track.mode = trackData.default ? 'showing' : 'hidden';
            }

            loadedCount++;

            // Re-initialize UI ONLY when ALL tracks have finished loading
            if (loadedCount === tracksArray.length) {
                console.log(`MYETV Player: ${loadedCount} external subtitle tracks loaded.`);

                if (typeof this.initializeSubtitles === 'function') {
                    this.initializeSubtitles();
                } else if (typeof this.initializeCustomSubtitles === 'function') {
                    this.initializeCustomSubtitles();
                } else if (typeof this.loadCustomSubtitleTracks === 'function') {
                    this.loadCustomSubtitleTracks();
                }
            }
        });

        trackEl.addEventListener('error', () => {
            console.warn(`MYETV Player: Failed to load track ${trackData.lang}`);
            // Increment anyway so we don't block the UI initialization
            loadedCount++;
        });

        // Append to DOM
        this.video.appendChild(trackEl);
    });
}

loadCustomSubtitleTracks() {
    var self = this;
    var tracks = this.video.querySelectorAll('track[kind="subtitles"]');
    if (tracks.length === 0) return;

    tracks.forEach(function (track, index) {
        var src = track.getAttribute('src');
        var label = track.getAttribute('label') || 'Unknown';
        var srclang = track.getAttribute('srclang') || '';

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
                // Normalize newlines
                var normalizedText = srtText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

                // Split into blocks by double newline
                var blocks = normalizedText.trim().split('\n\n');

                for (var i = 0; i < blocks.length; i++) {
                    var block = blocks[i].trim();
                    if (!block || block.toUpperCase().startsWith('WEBVTT')) continue;

                    var lines = block.split('\n');
                    var timeMatch = null;
                    var textLines = [];

                    for (var j = 0; j < lines.length; j++) {
                        var line = lines[j].trim();

                        // Regex matches both SRT and VTT formats (with or without hours, dot or comma)
                        if (!timeMatch) {
                            var match = line.match(/(\d{2,}:\d{2}:\d{2}[.,]\d{3}|\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{2,}:\d{2}:\d{2}[.,]\d{3}|\d{2}:\d{2}[.,]\d{3})/);
                            if (match) {
                                timeMatch = match;
                                continue;
                            }
                        }

                        // Skip numeric IDs common in SRT files
                        if (!timeMatch && /^\d+$/.test(line)) {
                            continue;
                        }

                        // Everything after the timestamp is the actual subtitle text
                        if (timeMatch) {
                            textLines.push(line);
                        }
                    }

                    // Store the parsed subtitle block
                    if (timeMatch && textLines.length > 0) {
                        var startTime = self.parseTimeToSecondsUniversal(timeMatch[1]);
                        var endTime = self.parseTimeToSecondsUniversal(timeMatch[2]);
                        var text = textLines.join('\n').trim().replace(/<[^>]*>/g, '');

                        if (text && !isNaN(startTime) && !isNaN(endTime) && startTime < endTime) {
                            trackObj.subtitles.push({
                                start: startTime,
                                end: endTime,
                                text: text
                            });
                        }
                    }
                }

                if (self.options.debug) {
                    console.log('✅ Custom parser loaded ' + trackObj.subtitles.length + ' subtitles for ' + label);
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

    // 1. Disable all tracks first to prevent overlapping
    this.disableAllTracks();

    // 2. Enable ONLY the custom WebView-safe subtitle system
    var success = this.enableCustomSubtitleTrack(trackIndex);

    if (success) {
        this.currentSubtitleTrack = this.textTracks[trackIndex].track;
        this.subtitlesEnabled = true;

        // 3. Kill the native browser track to avoid double rendering or crashes
        if (this.video.textTracks && this.video.textTracks[trackIndex]) {
            this.video.textTracks[trackIndex].mode = 'disabled';
        }

        this.updateSubtitlesButton();
        this.populateSubtitlesMenu();

        if (this.options.debug) {
            console.log('✅ Custom UI subtitles strictly enforced for track', trackIndex);
        }

        this.triggerEvent('subtitlechange', {
            enabled: true,
            trackIndex: trackIndex,
            trackLabel: this.textTracks[trackIndex].label,
            trackLanguage: this.textTracks[trackIndex].language
        });
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