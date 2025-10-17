// Utils Module for MYETV Video Player
// Conservative modularization - original code preserved exactly
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
    // update current time
    if (this.currentTimeEl && this.video) {
        this.currentTimeEl.textContent = this.formatTime(this.video.currentTime || 0);
    }

    // update duration or show badge if encoding
    if (this.durationEl && this.video) {
        const duration = this.video.duration;

        // check if duration is valid
        if (!duration || isNaN(duration) || !isFinite(duration)) {
            // Video in encoding - show badge instead of duration
            this.durationEl.innerHTML = '<span class="encoding-badge">Encoding in progress</span>';
            this.durationEl.classList.add('encoding-state');
        } else {
            // valid duration - show normal
            this.durationEl.textContent = this.formatTime(duration);
            this.durationEl.classList.remove('encoding-state');
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
// All original functionality preserved exactly
