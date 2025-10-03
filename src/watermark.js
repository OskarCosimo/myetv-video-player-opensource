// Watermark Module for MYETV Video Player
// Displays a logo overlay on the video with customizable position and link
// Created by https://www.myetv.tv https://oskarcosimo.com

/**
 * Initialize watermark overlay
 * Creates a watermark element overlaid on the video player
 */
initializeWatermark() {
    if (!this.options.watermarkUrl) {
        if (this.options.debug) console.log('🏷️ Watermark disabled - no URL provided');
        return;
    }

    if (this.options.debug) console.log('🏷️ Initializing watermark overlay');

    // Create watermark container
    const watermark = document.createElement('div');
    watermark.className = 'video-watermark';

    // Set position class - FIX: use template literal correctly
    const position = this.options.watermarkPosition || 'bottomright';
    watermark.classList.add(`watermark-${position}`); // ← FIX QUI

    // Add hide-on-autohide class if option is enabled
    if (this.options.hideWatermark) {
        watermark.classList.add('hide-on-autohide');
    }

    // Create watermark image
    const watermarkImg = document.createElement('img');
    watermarkImg.src = this.options.watermarkUrl;
    watermarkImg.alt = 'Watermark';

    // Add title/tooltip if provided
    if (this.options.watermarkTitle) {
        watermarkImg.title = this.options.watermarkTitle;
    }

    // Handle image loading error
    watermarkImg.onerror = () => {
        if (this.options.debug) console.warn('🏷️ Watermark image failed to load:', this.options.watermarkUrl);
        watermark.style.display = 'none';
    };

    watermarkImg.onload = () => {
        if (this.options.debug) console.log('🏷️ Watermark image loaded successfully');
    };

    // Add click handler if link URL is provided
    if (this.options.watermarkLink) {
        watermark.style.cursor = 'pointer';
        watermark.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent video controls interference
            window.open(this.options.watermarkLink, '_blank', 'noopener,noreferrer');
            if (this.options.debug) console.log('🏷️ Watermark clicked, opening:', this.options.watermarkLink);
        });
    } else {
        watermark.style.cursor = 'default';
    }

    // Append image to watermark container
    watermark.appendChild(watermarkImg);

    // Insert watermark before controls (above video, below controls)
    if (this.controls) {
        this.container.insertBefore(watermark, this.controls);
    } else {
        this.container.appendChild(watermark);
    }

    // Store reference to watermark element
    this.watermarkElement = watermark;

    if (this.options.debug) {
        console.log('🏷️ Watermark created:', {
            url: this.options.watermarkUrl,
            link: this.options.watermarkLink || 'none',
            position: position,
            title: this.options.watermarkTitle || 'none',
            hideWithControls: this.options.hideWatermark
        });
    }
}

/**
 * Set or update watermark configuration
 * @param {string} url - URL of the watermark image
 * @param {string} link - Optional URL to open when watermark is clicked
 * @param {string} position - Position of watermark (topleft, topright, bottomleft, bottomright)
 * @param {string} title - Optional tooltip title for the watermark
 */
setWatermark(url, link = '', position = 'bottomright', title = '') {
    // Update options
    this.options.watermarkUrl = url;
    this.options.watermarkLink = link;
    this.options.watermarkPosition = position;
    this.options.watermarkTitle = title;

    // Remove existing watermark if present
    if (this.watermarkElement) {
        this.watermarkElement.remove();
        this.watermarkElement = null;
    }

    // Recreate watermark if URL is provided
    if (url) {
        this.initializeWatermark();
    }

    return this;
}

/**
 * Remove watermark from player
 */
removeWatermark() {
    if (this.watermarkElement) {
        this.watermarkElement.remove();
        this.watermarkElement = null;
    }

    this.options.watermarkUrl = '';
    this.options.watermarkLink = '';
    this.options.watermarkPosition = 'bottomright';
    this.options.watermarkTitle = '';

    if (this.options.debug) console.log('🏷️ Watermark removed');

    return this;
}

/**
 * Update watermark position
 * @param {string} position - New position (topleft, topright, bottomleft, bottomright)
 */
setWatermarkPosition(position) {
    if (!['topleft', 'topright', 'bottomleft', 'bottomright'].includes(position)) {
        if (this.options.debug) console.warn('🏷️ Invalid watermark position:', position);
        return this;
    }

    this.options.watermarkPosition = position;

    if (this.watermarkElement) {
        // Remove all position classes
        this.watermarkElement.classList.remove(
            'watermark-topleft',
            'watermark-topright',
            'watermark-bottomleft',
            'watermark-bottomright'
        );

        // Add new position class - FIX: use template literal correctly
        this.watermarkElement.classList.add(`watermark-${position}`); // ← FIX QUI
    }

    if (this.options.debug) console.log('🏷️ Watermark position updated to:', position);

    return this;
}

/**
 * Set whether watermark should hide with controls
 * @param {boolean} hide - True to hide watermark with controls, false to keep always visible
 */
setWatermarkAutoHide(hide) {
    this.options.hideWatermark = hide;

    if (this.watermarkElement) {
        if (hide) {
            this.watermarkElement.classList.add('hide-on-autohide');
        } else {
            this.watermarkElement.classList.remove('hide-on-autohide');
        }
    }

    if (this.options.debug) console.log('🏷️ Watermark auto-hide set to:', hide);

    return this;
}

/**
 * Get current watermark settings
 * @returns {object} Current watermark configuration
 */
getWatermarkSettings() {
    return {
        url: this.options.watermarkUrl || '',
        link: this.options.watermarkLink || '',
        position: this.options.watermarkPosition || 'bottomright',
        title: this.options.watermarkTitle || '',
        hideWithControls: this.options.hideWatermark
    };
}