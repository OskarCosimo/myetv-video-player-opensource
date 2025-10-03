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
    if (!this.progressContainer || !this.video || !this.chapters) {
        return;
    }

    // Create container for chapter markers
    const markersContainer = document.createElement('div');
    markersContainer.className = 'chapter-markers-container';

    this.chapters.forEach((chapter, index) => {
        const marker = document.createElement('div');
        marker.className = 'chapter-marker';
        marker.setAttribute('data-chapter-index', index);
        marker.setAttribute('data-chapter-time', chapter.time);
        marker.setAttribute('data-chapter-title', chapter.title);

        // Set custom color if provided
        if (chapter.color) {
            marker.style.backgroundColor = chapter.color;
        }

        markersContainer.appendChild(marker);
    });

    // Insert markers container into progress container
    this.progressContainer.appendChild(markersContainer);
    this.chapterMarkersContainer = markersContainer;

    // Update marker positions when video duration is known
    if (this.video.duration && !isNaN(this.video.duration)) {
        this.updateChapterMarkerPositions();
    } else {
        // Wait for metadata to be loaded
        const loadedMetadataHandler = () => {
            this.updateChapterMarkerPositions();
            this.video.removeEventListener('loadedmetadata', loadedMetadataHandler);
        };
        this.video.addEventListener('loadedmetadata', loadedMetadataHandler);
    }

    if (this.options.debug) console.log('📚 Chapter markers created on timeline');
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
 * Create chapter tooltip
 */
createChapterTooltip() {
    if (!this.progressContainer) {
        return;
    }

    const tooltip = document.createElement('div');
    tooltip.className = 'chapter-tooltip';
    tooltip.style.opacity = '0';
    tooltip.style.visibility = 'hidden';

    // Tooltip content structure
    tooltip.innerHTML = `
        <div class="chapter-tooltip-image"></div>
        <div class="chapter-tooltip-title"></div>
        <div class="chapter-tooltip-time"></div>
    `;

    this.progressContainer.appendChild(tooltip);
    this.chapterTooltip = tooltip;

    if (this.options.debug) console.log('📚 Chapter tooltip created');
}

/**
 * Bind chapter-related events
 */
bindChapterEvents() {
    if (!this.chapterMarkersContainer || !this.chapterTooltip) {
        return;
    }

    // Hover on chapter markers
    const markers = this.chapterMarkersContainer.querySelectorAll('.chapter-marker');

    markers.forEach((marker, index) => {
        marker.addEventListener('mouseenter', (e) => {
            this.showChapterTooltip(index, e);
        });

        marker.addEventListener('mousemove', (e) => {
            this.updateChapterTooltipPosition(e);
        });

        marker.addEventListener('mouseleave', () => {
            this.hideChapterTooltip();
        });

        // Click to jump to chapter
        marker.addEventListener('click', (e) => {
            e.stopPropagation();
            this.jumpToChapter(index);
        });
    });

    // Update active chapter during playback
    if (this.video) {
        this.video.addEventListener('timeupdate', () => {
            this.updateActiveChapter();
        });
    }

    if (this.options.debug) console.log('📚 Chapter events bound');
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
    if (!this.video || !this.chapterMarkersContainer || !this.chapters) {
        return;
    }

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
