// Fullscreen Module for MYETV Video Player
// Conservative modularization - original code preserved exactly
// Created by https://www.myetv.tv https://oskarcosimo.com

    isFullscreenActive() {
        return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
    }

    checkPiPSupport() {
        return 'pictureInPictureEnabled' in document;
    }

    enterFullscreen() {
        const element = this.container.parentElement || this.container;

        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        }
    }

    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
    }

    async enterPictureInPicture() {
        if (!this.isPiPSupported || !this.video) return;

        try {
            await this.video.requestPictureInPicture();
        } catch (error) {
            if (this.options.debug) console.error('Errore avvio Picture-in-Picture:', error);
        }
    }

    async exitPictureInPicture() {
        if (!this.isPiPSupported) return;

        try {
            await document.exitPictureInPicture();
        } catch (error) {
            if (this.options.debug) console.error('Errore uscita Picture-in-Picture:', error);
        }
    }

    onEnterPiP() {
        if (this.pipIcon) this.pipIcon.classList.add('hidden');
        if (this.pipExitIcon) this.pipExitIcon.classList.remove('hidden');

        if (this.controls) {
            this.controls.style.opacity = '0';
        }

        if (this.titleOverlay) {
            this.titleOverlay.style.opacity = '0';
        }
    }

    onLeavePiP() {
        if (this.pipIcon) this.pipIcon.classList.remove('hidden');
        if (this.pipExitIcon) this.pipExitIcon.classList.add('hidden');

        if (this.controls) {
            this.controls.style.opacity = '';
        }

        if (this.titleOverlay) {
            this.titleOverlay.style.opacity = '';
        }
    }

// Fullscreen methods for main class
// All original functionality preserved exactly
