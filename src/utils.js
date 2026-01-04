// Utils Module for MYETV Video Player
// Created by https://www.myetv.tv https://oskarcosimo.com

getBufferedTime() {
    if (!this.video || !this.video.buffered || this.video.buffered.length === 0) return 0;
    try {
        return this.video.buffered.end(this.video.buffered.length - 1);
    } catch (error) {
        return 0;
    }
}

clearTitleTimeout() {
    if (this.titleTimeout) {
        clearTimeout(this.titleTimeout);
        this.titleTimeout = null;
    }
}

skipTime(seconds) {
    if (!this.video || !this.video.duration || this.isChangingQuality) return;

    this.video.currentTime = Math.max(0, Math.min(this.video.duration, this.video.currentTime + seconds));
}

updateTimeDisplay() {
    if (this.currentTimeEl && this.video) {
        this.currentTimeEl.textContent = this.formatTime(this.video.currentTime || 0);
    }

    if (this.durationEl && this.video) {
        const duration = this.video.duration;
        const readyState = this.video.readyState;
        const currentTime = this.video.currentTime;
        const networkState = this.video.networkState;

        // Check for initial buffering state
        const isInitialBuffering = (readyState < 2 && currentTime === 0) || (currentTime === 0 && !duration) || (duration === 0 && networkState === 2);
        // Check if duration is invalid (NaN or Infinity)
        const isDurationInvalid = !duration || isNaN(duration) || !isFinite(duration);

        // Text for translations
        const t = (key) => {
            if (this.isI18nAvailable()) {
                try {
                    return VideoPlayerTranslations.t(key);
                } catch (error) {
                    return key;
                }
            }
            const fallback = {
                'loading': 'Loading...'
            };
            return fallback[key] || key;
        };

        if (isInitialBuffering) {
            // CHANGED: Move text to center overlay, clear control bar text
            this.updateLoadingText(t('loading'));
            this.durationEl.textContent = this.formatTime(0); // Just show 00:00 or empty
            this.durationEl.classList.remove('encoding-state');
            this.durationEl.classList.add('loading-state');
        } else if (isDurationInvalid) {
            // CHANGED: Move text to center overlay
            this.updateLoadingText(t('loading'));
            // Optional: you might want to keep encoding text in bar OR move it too. 
            // If you want it ONLY in center:
            this.durationEl.textContent = "--:--";

            this.durationEl.classList.remove('loading-state');
            this.durationEl.classList.add('encoding-state');
        } else {
            // Valid duration - show normal time
            this.durationEl.textContent = this.formatTime(duration);
            this.durationEl.classList.remove('encoding-state', 'loading-state');
            // Clear loading text when playing normally
            this.updateLoadingText('');
        }
    }
}

formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Utils methods for main class