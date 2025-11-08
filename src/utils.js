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
    // Update current time
    if (this.currentTimeEl && this.video) {
        this.currentTimeEl.textContent = this.formatTime(this.video.currentTime || 0);
    }

    // Update duration or show appropriate message
    if (this.durationEl && this.video) {
        const duration = this.video.duration;
        const readyState = this.video.readyState;
        const currentTime = this.video.currentTime;
        const networkState = this.video.networkState;

        // Check for initial buffering state
        // readyState < 2 means not enough data to play (HAVE_NOTHING or HAVE_METADATA)
        // currentTime === 0 and duration === 0 indicates initial loading
        const isInitialBuffering = (readyState < 2 && currentTime === 0) ||
            (currentTime === 0 && (!duration || duration === 0) && networkState === 2);

        // Check if duration is invalid (NaN or Infinity)
        const isDurationInvalid = !duration || isNaN(duration) || !isFinite(duration);

        if (isInitialBuffering) {
            // Initial buffering - show loading message
            this.durationEl.textContent = t('loading');
            this.durationEl.classList.remove('encoding-state');
            this.durationEl.classList.add('loading-state');
        } else if (isDurationInvalid) {
            // Video is encoding (FFmpeg still processing) - show encoding badge
            this.durationEl.textContent = t('encoding_in_progress');
            this.durationEl.classList.remove('loading-state');
            this.durationEl.classList.add('encoding-state');
        } else {
            // Valid duration - show normal time
            this.durationEl.textContent = this.formatTime(duration);
            this.durationEl.classList.remove('encoding-state', 'loading-state');
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