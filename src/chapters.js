/* Chapters Module for MYETV Video Player
 * Chapter markers with tooltips and thumbnails on timeline
 * Created by https://www.myetv.tv https://oskarcosimo.com
 */

/**
 * Initialize chapter markers system
 * Chapters can be defined in initialization options as:
 * - JSON array: chapters: [{time: 0, title: "Intro", image: "url"}, ...]
 * - String format: chapters: "0:00:00|Intro|image.jpg,0:02:30|Chapter 2|image2.jpg"
 */
initializeChapters() {
    if (!this.options.chapters || !Array.isArray(this.options.chapters) && typeof this.options.chapters !== 'string') {
        if (this.options.debug) console.log('📚 No chapters defined');
        return;
    }

    // Parse chapters from different formats
    this.chapters = this.parseChapters(this.options.chapters);

    if (this.chapters.length === 0) {
        if (this.options.debug) console.warn('📚 Chapters defined but empty after parsing');
        return;
    }

    // Sort chapters by time
    this.chapters.sort((a, b) => a.time - b.time);

    if (this.options.debug) console.log('📚 Chapters initialized:', this.chapters);

    // Create chapter markers on the progress bar
    this.createChapterMarkers();

    // Create chapter tooltip
    this.createChapterTooltip();

    // Bind chapter events
    this.bindChapterEvents();
}

/**
 * Parse chapters from various input formats
 * @param {Array|String} chaptersInput - Chapters data
 * @returns {Array} Normalized chapters array
 */
parseChapters(chaptersInput) {
    // If already array of objects, validate and return
    if (Array.isArray(chaptersInput)) {
        return chaptersInput.map(chapter => this.normalizeChapter(chapter)).filter(c => c !== null);
    }

    // If string format, parse it
    // Format: "time|title|image,time|title|image,..."
    // Example: "0:00:00|Introduction|intro.jpg,0:02:30|Chapter 2|chapter2.jpg"
    if (typeof chaptersInput === 'string') {
        const chapterStrings = chaptersInput.split(',').map(s => s.trim());
        const parsedChapters = [];

        for (const chapterStr of chapterStrings) {
            const parts = chapterStr.split('|').map(p => p.trim());
            if (parts.length < 2) {
                if (this.options.debug) console.warn('📚 Invalid chapter format:', chapterStr);
                continue;
            }

            const chapter = {
                time: this.parseTimeToSeconds(parts[0]),
                title: parts[1],
                image: parts[2] || null
            };

            const normalized = this.normalizeChapter(chapter);
            if (normalized) {
                parsedChapters.push(normalized);
            }
        }

        return parsedChapters;
    }

    if (this.options.debug) console.warn('📚 Invalid chapters format');
    return [];
}

/**
 * Normalize and validate a single chapter object
 * @param {Object} chapter - Chapter object
 * @returns {Object|null} Normalized chapter or null if invalid
 */
normalizeChapter(chapter) {
    if (!chapter || typeof chapter !== 'object') {
        return null;
    }

    // Ensure required fields
    if (!chapter.hasOwnProperty('time') || !chapter.hasOwnProperty('title')) {
        if (this.options.debug) console.warn('📚 Chapter missing required fields:', chapter);
        return null;
    }

    // Convert time to seconds if string
    let timeInSeconds = chapter.time;
    if (typeof timeInSeconds === 'string') {
        timeInSeconds = this.parseTimeToSeconds(timeInSeconds);
    }

    if (typeof timeInSeconds !== 'number' || timeInSeconds < 0) {
        if (this.options.debug) console.warn('📚 Invalid chapter time:', chapter.time);
        return null;
    }

    return {
        time: timeInSeconds,
        title: String(chapter.title),
        image: chapter.image || null,
        color: chapter.color || null // Optional custom color
    };
}

/**
 * Parse time string to seconds
 * Supports formats: "HH:MM:SS", "MM:SS", "SS"
 * @param {String} timeStr - Time string
 * @returns {Number} Time in seconds
 */
parseTimeToSeconds(timeStr) {
    if (typeof timeStr === 'number') {
        return timeStr;
    }

    const parts = String(timeStr).split(':').map(p => parseInt(p.trim(), 10));

    if (parts.length === 3) {
        // HH:MM:SS
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        // MM:SS
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
        // SS
        return parts[0];
    }

    return 0;
}

/**
 * Create visual chapter markers on the progress bar
 */
createChapterMarkers() {
    if (!this.progressContainer || !this.video || !this.chapters) return;

    const duration = this.video.duration;
    if (!duration || isNaN(duration)) {
        // Wait for metadata
        const loadedMetadataHandler = () => {
            this.createChapterMarkers();
            this.video.removeEventListener('loadedmetadata', loadedMetadataHandler);
        };
        this.video.addEventListener('loadedmetadata', loadedMetadataHandler);
        return;
    }

    // Remove existing markers
    const existingMarkers = this.progressContainer.querySelector('.chapter-markers-container');
    if (existingMarkers) {
        existingMarkers.remove();
    }

    // Create container for chapter segments
    const markersContainer = document.createElement('div');
    markersContainer.className = 'chapter-markers-container';

    // Create segments for each chapter
    this.chapters.forEach((chapter, index) => {
        const nextChapter = this.chapters[index + 1];
        const startPercent = (chapter.time / duration) * 100;
        const endPercent = nextChapter ? (nextChapter.time / duration) * 100 : 100;

        // Calculate segment width minus the gap
        const gapSize = nextChapter ? 6 : 0; // 6px gap between segments
        const widthPercent = endPercent - startPercent;

        // Create segment container
        const segment = document.createElement('div');
        segment.className = 'chapter-segment';
        segment.style.cssText = `
            position: absolute;
            left: ${startPercent}%;
            top: 0;
            width: calc(${widthPercent}% - ${gapSize}px);
            height: 100%;
            background: rgba(255, 255, 255, 0.3);
            cursor: pointer;
            z-index: 3;
            transition: background 0.2s;
            pointer-events: none;
        `;

        segment.setAttribute('data-chapter-index', index);
        segment.setAttribute('data-chapter-time', chapter.time);
        segment.setAttribute('data-chapter-title', chapter.title);

        markersContainer.appendChild(segment);

        // Add marker at the START of next segment (transparent divider)
        if (nextChapter) {
            const marker = document.createElement('div');
            marker.className = 'chapter-marker';
            marker.style.cssText = `
                position: absolute !important;
                left: ${endPercent}% !important;
                top: 0 !important;
                width: 6px !important;
                height: 100% !important;
                background: transparent !important;
                border: none !important;
                box-shadow: none !important;
                margin-left: -3px !important;
                cursor: pointer !important;
                z-index: 10 !important;
            `;

            marker.setAttribute('data-chapter-time', nextChapter.time);
            marker.setAttribute('data-chapter-title', nextChapter.title);

            // Click on marker to jump to chapter start
            marker.addEventListener('click', (e) => {
                e.stopPropagation();
                this.jumpToChapter(index + 1);
            });

            markersContainer.appendChild(marker);
        }
    });

    // Insert markers container into progress container
    this.progressContainer.appendChild(markersContainer);
    this.chapterMarkersContainer = markersContainer;

    if (this.options.debug) {
        console.log(`Chapter markers created: ${this.chapters.length} segments`);
    }
}

/**
 * Update chapter marker positions based on video duration
 */
updateChapterMarkerPositions() {
    if (!this.video || !this.video.duration || !this.chapterMarkersContainer) {
        return;
    }

    const markers = this.chapterMarkersContainer.querySelectorAll('.chapter-marker');
    const duration = this.video.duration;

    markers.forEach((marker, index) => {
        if (this.chapters[index]) {
            const percentage = (this.chapters[index].time / duration) * 100;
            marker.style.left = percentage + '%';
        }
    });

    if (this.options.debug) console.log('📚 Chapter marker positions updated');
}

/**
 * Create chapter tooltip with title and image
 */
createChapterTooltip() {
    if (!this.progressContainer) return;

    // Remove existing chapter tooltip
    let chapterTooltip = this.progressContainer.querySelector('.chapter-tooltip');
    if (chapterTooltip) {
        chapterTooltip.remove();
    }

    // Create chapter tooltip container (positioned ABOVE the time tooltip)
    chapterTooltip = document.createElement('div');
    chapterTooltip.className = 'chapter-tooltip';
    chapterTooltip.style.cssText = `
        position: absolute;
        bottom: calc(100% + 35px);
        left: 0;
        background: rgba(28, 28, 28, 0.95);
        color: #fff;
        border-radius: 4px;
        pointer-events: none;
        visibility: hidden;
        opacity: 0;
        z-index: 100001;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        max-width: 300px;
        overflow: hidden;
        transform: translateX(-50%);
        transition: opacity 0.15s, visibility 0.15s;
        display: flex;
        flex-direction: column;
    `;

    // Create inner content structure
    chapterTooltip.innerHTML = `
        <div class="chapter-tooltip-content" style="display: flex; flex-direction: column; gap: 8px; padding: 8px;">
            <div class="chapter-tooltip-image" style="
                width: 100%;
                height: 120px;
                background-size: cover;
                background-position: center;
                border-radius: 3px;
                display: none;
            "></div>
            <div class="chapter-tooltip-info" style="display: flex; flex-direction: column; gap: 4px;">
                <div class="chapter-tooltip-title" style="
                    font-size: 13px;
                    font-weight: 600;
                    color: #fff;
                    max-width: 280px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                "></div>
                <div class="chapter-tooltip-time" style="
                    font-size: 12px;
                    font-weight: 400;
                    color: rgba(255, 255, 255, 0.8);
                "></div>
            </div>
        </div>
    `;

    this.progressContainer.appendChild(chapterTooltip);
    this.chapterTooltip = chapterTooltip;

    if (this.options.debug) {
        console.log('Chapter tooltip created');
    }
}

/**
 * Bind chapter-related events - tooltip on progressbar mousemove
 */
bindChapterEvents() {
    if (!this.progressContainer) return;

    // Remove existing chapter tooltip if present
    let chapterTooltip = this.progressContainer.querySelector('.chapter-tooltip-hover');
    if (chapterTooltip) {
        chapterTooltip.remove();
    }

    // Create chapter tooltip
    chapterTooltip = document.createElement('div');
    chapterTooltip.className = 'chapter-tooltip-hover';
    chapterTooltip.style.cssText = `
        position: absolute;
        bottom: calc(100% + 35px);
        left: 0;
        background: rgba(28, 28, 28, 0.95);
        color: #fff;
        border-radius: 4px;
        padding: 8px;
        pointer-events: none;
        visibility: hidden;
        opacity: 0;
        z-index: 100001;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        max-width: 300px;
        transform: translateX(-50%);
        transition: opacity 0.15s, visibility 0.15s;
    `;

    this.progressContainer.appendChild(chapterTooltip);
    this.chapterTooltip = chapterTooltip;

    // Get player container for edge detection
    const getPlayerBounds = () => {
        return this.container ? this.container.getBoundingClientRect() : null;
    };

    // Mousemove handler to show tooltip with title and image
    this.progressContainer.addEventListener('mousemove', (e) => {
        if (!this.video || !this.video.duration || !this.chapters || this.chapters.length === 0) {
            return;
        }

        const rect = this.progressContainer.getBoundingClientRect();
        const playerRect = getPlayerBounds();
        const mouseX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, mouseX / rect.width));
        const time = percentage * this.video.duration;

        // Find chapter at current time
        let currentChapter = null;
        for (let i = this.chapters.length - 1; i >= 0; i--) {
            if (time >= this.chapters[i].time) {
                currentChapter = this.chapters[i];
                break;
            }
        }

        if (currentChapter) {
            // Build tooltip HTML
            let tooltipHTML = '<div style="display: flex; flex-direction: column; gap: 6px;">';

            // Add image if available
            if (currentChapter.image) {
                tooltipHTML += `
                    <div style="
                        width: 100%;
                        height: 120px;
                        background-image: url('${currentChapter.image}');
                        background-size: cover;
                        background-position: center;
                        border-radius: 3px;
                    "></div>
                `;
            }

            // Add title
            tooltipHTML += `
                <div style="
                    font-size: 13px;
                    font-weight: 600;
                    max-width: 280px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                ">
                    ${currentChapter.title}
                </div>
            `;

            // Add time
            tooltipHTML += `
                <div style="
                    font-size: 12px;
                    font-weight: 400;
                    color: rgba(255, 255, 255, 0.8);
                ">
                    ${this.formatTime(currentChapter.time)}
                </div>
            `;

            tooltipHTML += '</div>';

            chapterTooltip.innerHTML = tooltipHTML;
            chapterTooltip.style.visibility = 'visible';
            chapterTooltip.style.opacity = '1';

            // Position tooltip with edge detection
            setTimeout(() => {
                const tooltipWidth = chapterTooltip.offsetWidth;
                const tooltipHalfWidth = tooltipWidth / 2;
                const absoluteX = e.clientX;

                if (playerRect) {
                    // Left edge
                    if (absoluteX - tooltipHalfWidth < playerRect.left) {
                        chapterTooltip.style.left = `${playerRect.left - rect.left + tooltipHalfWidth}px`;
                    }
                    // Right edge
                    else if (absoluteX + tooltipHalfWidth > playerRect.right) {
                        chapterTooltip.style.left = `${playerRect.right - rect.left - tooltipHalfWidth}px`;
                    }
                    // Normal center
                    else {
                        chapterTooltip.style.left = `${mouseX}px`;
                    }
                } else {
                    chapterTooltip.style.left = `${mouseX}px`;
                }
            }, 0);
        } else {
            chapterTooltip.style.visibility = 'hidden';
            chapterTooltip.style.opacity = '0';
        }
    });

    // Mouseleave handler
    this.progressContainer.addEventListener('mouseleave', () => {
        chapterTooltip.style.visibility = 'hidden';
        chapterTooltip.style.opacity = '0';
    });

    // Update active chapter during playback
    if (this.video) {
        this.video.addEventListener('timeupdate', () => this.updateActiveChapter());
    }

    if (this.options.debug) {
        console.log('Chapter events bound with tooltip');
    }
}

/**
 * Update chapter name in title overlay dynamically
 */
updateChapterInTitleOverlay() {
    if (!this.video || !this.chapters || this.chapters.length === 0) return;

    const titleOverlay = this.container ? this.container.querySelector('.title-overlay') : null;
    if (!titleOverlay) return;

    // Find or create chapter name element
    let chapterElement = titleOverlay.querySelector('.chapter-name');
    if (!chapterElement) {
        chapterElement = document.createElement('div');
        chapterElement.className = 'chapter-name';
        chapterElement.style.cssText = `
            font-size: 13px;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.9);
            margin-top: 6px;
            max-width: 400px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        `;
        titleOverlay.appendChild(chapterElement);
    }

    // Find current chapter
    const currentTime = this.video.currentTime;
    let currentChapter = null;
    for (let i = this.chapters.length - 1; i >= 0; i--) {
        if (currentTime >= this.chapters[i].time) {
            currentChapter = this.chapters[i];
            break;
        }
    }

    // Update or hide chapter name
    if (currentChapter) {
        chapterElement.textContent = currentChapter.title;
        chapterElement.style.display = 'block';
    } else {
        chapterElement.style.display = 'none';
    }
}

/**
 * Show chapter tooltip
 * @param {Number} chapterIndex - Index of the chapter
 * @param {MouseEvent} e - Mouse event
 */
showChapterTooltip(chapterIndex, e) {
    if (!this.chapterTooltip || !this.chapters[chapterIndex]) {
        return;
    }

    const chapter = this.chapters[chapterIndex];

    // Update tooltip content
    const imageEl = this.chapterTooltip.querySelector('.chapter-tooltip-image');
    const titleEl = this.chapterTooltip.querySelector('.chapter-tooltip-title');
    const timeEl = this.chapterTooltip.querySelector('.chapter-tooltip-time');

    // Set image
    if (chapter.image) {
        imageEl.style.display = 'block';
        imageEl.style.backgroundImage = `url(${chapter.image})`;
    } else {
        imageEl.style.display = 'none';
    }

    // Set title
    titleEl.textContent = chapter.title;

    // Set time
    timeEl.textContent = this.formatTime(chapter.time);

    // Show tooltip
    this.chapterTooltip.style.opacity = '1';
    this.chapterTooltip.style.visibility = 'visible';

    // Position tooltip
    this.updateChapterTooltipPosition(e);
}

/**
 * Update chapter tooltip position
 * @param {MouseEvent} e - Mouse event
 */
updateChapterTooltipPosition(e) {
    if (!this.chapterTooltip || !this.progressContainer) {
        return;
    }

    const rect = this.progressContainer.getBoundingClientRect();
    const tooltipRect = this.chapterTooltip.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Calculate position
    let leftPosition = mouseX;
    const tooltipWidth = tooltipRect.width || 200;
    const containerWidth = rect.width;

    // Keep tooltip within bounds
    leftPosition = Math.max(tooltipWidth / 2, Math.min(containerWidth - tooltipWidth / 2, mouseX));

    this.chapterTooltip.style.left = leftPosition + 'px';
}

/**
 * Hide chapter tooltip
 */
hideChapterTooltip() {
    if (!this.chapterTooltip) {
        return;
    }

    this.chapterTooltip.style.opacity = '0';
    this.chapterTooltip.style.visibility = 'hidden';
}

/**
 * Jump to specific chapter
 * @param {Number} chapterIndex - Index of the chapter
 */
jumpToChapter(chapterIndex) {
    if (!this.video || !this.chapters[chapterIndex]) {
        return;
    }

    const chapter = this.chapters[chapterIndex];
    this.video.currentTime = chapter.time;

    if (this.options.debug) console.log(`📚 Jumped to chapter: ${chapter.title} at ${chapter.time}s`);

    // Trigger custom event
    this.triggerEvent('chapterchange', {
        chapterIndex: chapterIndex,
        chapter: chapter,
        currentTime: this.video.currentTime
    });
}

/**
 * Update active chapter marker during playback
 */
updateActiveChapter() {
    if (!this.video || !this.chapterMarkersContainer || !this.chapters) return;

    const currentTime = this.video.currentTime;
    const markers = this.chapterMarkersContainer.querySelectorAll('.chapter-marker');

    // Find current chapter
    let currentChapterIndex = -1;
    for (let i = this.chapters.length - 1; i >= 0; i--) {
        if (currentTime >= this.chapters[i].time) {
            currentChapterIndex = i;
            break;
        }
    }

    // Update active state
    markers.forEach((marker, index) => {
        if (index === currentChapterIndex) {
            marker.classList.add('active');
        } else {
            marker.classList.remove('active');
        }
    });

    // Update chapter name in title overlay
    this.updateChapterInTitleOverlay();
}

/**
 * Get current chapter info
 * @returns {Object|null} Current chapter object or null
 */
getCurrentChapter() {
    if (!this.video || !this.chapters || this.chapters.length === 0) {
        return null;
    }

    const currentTime = this.video.currentTime;

    for (let i = this.chapters.length - 1; i >= 0; i--) {
        if (currentTime >= this.chapters[i].time) {
            return {
                index: i,
                chapter: this.chapters[i]
            };
        }
    }

    return null;
}

/**
 * Get all chapters
 * @returns {Array} Array of chapter objects
 */
getChapters() {
    return this.chapters || [];
}

/**
 * Get chapter by index
 * @param {Number} index - Chapter index
 * @returns {Object|null} Chapter object or null
 */
getChapterByIndex(index) {
    if (!this.chapters || index < 0 || index >= this.chapters.length) {
        return null;
    }
    return this.chapters[index];
}

/**
 * Navigate to next chapter
 * @returns {Boolean} True if navigated successfully
 */
nextChapter() {
    const current = this.getCurrentChapter();
    if (!current || current.index >= this.chapters.length - 1) {
        return false;
    }

    this.jumpToChapter(current.index + 1);
    return true;
}

/**
 * Navigate to previous chapter
 * @returns {Boolean} True if navigated successfully
 */
previousChapter() {
    const current = this.getCurrentChapter();
    if (!current) {
        return false;
    }

    // If we're more than 3 seconds into current chapter, go to its start
    if (this.video && this.video.currentTime - current.chapter.time > 3) {
        this.jumpToChapter(current.index);
        return true;
    }

    // Otherwise go to previous chapter
    if (current.index > 0) {
        this.jumpToChapter(current.index - 1);
        return true;
    }

    return false;
}

/**
 * Set chapters dynamically
 * @param {Array|String} chapters - Chapters data
 */
setChapters(chapters) {
    // Remove existing chapter markers
    if (this.chapterMarkersContainer) {
        this.chapterMarkersContainer.remove();
        this.chapterMarkersContainer = null;
    }

    if (this.chapterTooltip) {
        this.chapterTooltip.remove();
        this.chapterTooltip = null;
    }

    // Set new chapters
    this.options.chapters = chapters;
    this.chapters = [];

    // Re-initialize chapters
    this.initializeChapters();

    if (this.options.debug) console.log('📚 Chapters updated dynamically');
}

/**
 * Clear all chapters
 */
clearChapters() {
    this.setChapters(null);
}
