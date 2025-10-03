// Playlist Module for MYETV Video Player
// Conservative modularization - original code preserved exactly
// Created by https://www.myetv.tv https://oskarcosimo.com

    detectPlaylist() {
        if (!this.options.playlistEnabled) {
            this.isPlaylistActive = false;
            this.hidePlaylistControls();
            return;
        }

        const playlistId = this.video.getAttribute('data-playlist-id');
        const playlistIndex = parseInt(this.video.getAttribute('data-playlist-index'));

        if (playlistId && !isNaN(playlistIndex)) {
            this.playlistId = playlistId;
            this.currentPlaylistIndex = playlistIndex;
            this.loadPlaylistData();
            this.isPlaylistActive = true;
            this.showPlaylistControls();

            if (this.options.debug) {
                console.log(`🎵 Playlist detected: ${playlistId}, video ${playlistIndex}/${this.playlist.length - 1}`);
            }
        } else {
            this.isPlaylistActive = false;
            this.hidePlaylistControls();

            if (this.options.debug) {
                console.log('🎵 No playlist detected');
            }
        }
    }

    loadPlaylistData() {
        // Find all videos with the same playlist-id
        const playlistVideos = document.querySelectorAll(`[data-playlist-id="${this.playlistId}"]`);

        this.playlist = Array.from(playlistVideos).map(video => ({
            element: video,
            index: parseInt(video.getAttribute('data-playlist-index')),
            title: video.getAttribute('data-video-title') || `Video ${video.getAttribute('data-playlist-index') || 'Unknown'}`
        })).sort((a, b) => a.index - b.index);

        if (this.options.debug) {
            console.log(`🎵 Loaded playlist with ${this.playlist.length} videos:`,
                this.playlist.map(v => `${v.index}: ${v.title}`));
        }
    }

    nextVideo() {
        if (!this.isPlaylistActive) {
            if (this.options.debug) console.warn('🎵 No playlist active');
            return false;
        }

        let nextIndex = this.currentPlaylistIndex + 1;

        if (nextIndex >= this.playlist.length) {
            if (this.options.playlistLoop) {
                nextIndex = 0;
            } else {
                if (this.options.debug) console.log('🎵 End of playlist reached');
                return false;
            }
        }

        return this.goToPlaylistIndex(nextIndex);
    }

    prevVideo() {
        if (!this.isPlaylistActive) {
            if (this.options.debug) console.warn('🎵 No playlist active');
            return false;
        }

        let prevIndex = this.currentPlaylistIndex - 1;

        if (prevIndex < 0) {
            if (this.options.playlistLoop) {
                prevIndex = this.playlist.length - 1;
            } else {
                if (this.options.debug) console.log('🎵 Beginning of playlist reached');
                return false;
            }
        }

        return this.goToPlaylistIndex(prevIndex);
    }

    goToPlaylistIndex(index) {
        if (!this.isPlaylistActive || index < 0 || index >= this.playlist.length) {
            if (this.options.debug) console.warn(`🎵 Invalid playlist index: ${index}`);
            return false;
        }

        const fromIndex = this.currentPlaylistIndex;
        const targetVideo = this.playlist[index];
        const currentTime = this.video.currentTime || 0;
        const wasPlaying = !this.video.paused;

        // Trigger playlist change event
        this.triggerEvent('playlistchange', {
            fromIndex: fromIndex,
            toIndex: index,
            fromTitle: this.playlist[fromIndex]?.title,
            toTitle: targetVideo.title,
            playlistId: this.playlistId
        });

        if (this.options.debug) {
            console.log(`🎵 Switching from video ${fromIndex} to ${index}: "${targetVideo.title}"`);
        }

        // Switch to new video
        this.switchToVideo(targetVideo.element, wasPlaying);
        this.currentPlaylistIndex = index;
        this.updatePlaylistButtons();

        return true;
    }

    getPlaylistInfo() {
        return {
            isActive: this.isPlaylistActive,
            currentIndex: this.currentPlaylistIndex,
            totalVideos: this.playlist.length,
            playlistId: this.playlistId,
            currentTitle: this.playlist[this.currentPlaylistIndex]?.title || '',
            canGoPrev: this.currentPlaylistIndex > 0 || this.options.playlistLoop,
            canGoNext: this.currentPlaylistIndex < this.playlist.length - 1 || this.options.playlistLoop
        };
    }

    setPlaylistOptions(options = {}) {
        if (options.autoPlay !== undefined) {
            this.options.playlistAutoPlay = options.autoPlay;
        }
        if (options.loop !== undefined) {
            this.options.playlistLoop = options.loop;
        }
        if (options.enabled !== undefined) {
            this.options.playlistEnabled = options.enabled;
            if (!options.enabled) {
                this.hidePlaylistControls();
                this.isPlaylistActive = false;
            } else {
                this.detectPlaylist();
            }
        }

        if (this.isPlaylistActive) {
            this.updatePlaylistButtons();
        }

        if (this.options.debug) {
            console.log('🎵 Playlist options updated:', {
                autoPlay: this.options.playlistAutoPlay,
                loop: this.options.playlistLoop,
                enabled: this.options.playlistEnabled
            });
        }

        return this;
    }

    getPlaylistVideos() {
        return this.playlist.map(video => ({
            index: video.index,
            title: video.title,
            element: video.element,
            isCurrent: video.index === this.currentPlaylistIndex
        }));
    }

// Playlist methods for main class
// All original functionality preserved exactly
