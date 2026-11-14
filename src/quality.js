// Quality Module for MYETV Video Player
// Conservative modularization - original code preserved exactly
// Created by https://www.myetv.tv https://oskarcosimo.com

initializeQualityMonitoring() {
    this.qualityMonitorInterval = setInterval(() => {
        if (!this.isChangingQuality) {
            this.updateCurrentPlayingQuality();
        }
    }, 3000);

    if (this.video) {
        this.video.addEventListener('loadedmetadata', () => {
            setTimeout(() => {
                if (!this.isChangingQuality) {
                    this.updateCurrentPlayingQuality();
                }
            }, 100);
        });

        this.video.addEventListener('resize', () => {
            if (!this.isChangingQuality) {
                this.updateCurrentPlayingQuality();
            }
        });

        this.video.addEventListener('loadeddata', () => {
            setTimeout(() => {
                if (!this.isChangingQuality) {
                    this.updateCurrentPlayingQuality();
                }
            }, 1000);
        });
    }
}

getCurrentPlayingQuality() {
    if (!this.video) return null;

    if (this.video.currentSrc && this.qualities && this.qualities.length > 0) {
        const currentSource = this.qualities.find(q => {
            const currentUrl = this.video.currentSrc.toLowerCase();
            const qualityUrl = q.src.toLowerCase();

            if (this.debugQuality) {
                if (this.options.debug) console.log('Quality comparison:', {
                    current: currentUrl,
                    quality: qualityUrl,
                    qualityName: q.quality,
                    match: currentUrl === qualityUrl || currentUrl.includes(qualityUrl) || qualityUrl.includes(currentUrl)
                });
            }

            return currentUrl === qualityUrl ||
                currentUrl.includes(qualityUrl) ||
                qualityUrl.includes(currentUrl);
        });

        if (currentSource) {
            if (this.debugQuality) {
                if (this.options.debug) console.log('Quality found from source:', currentSource.quality);
            }
            return currentSource.quality;
        }
    }

    if (this.video.videoHeight && this.video.videoWidth) {
        const height = this.video.videoHeight;
        const width = this.video.videoWidth;

        if (this.debugQuality) {
            if (this.options.debug) console.log('Risoluzione video:', { height, width });
        }

        if (height >= 2160) return '4K';
        if (height >= 1440) return '1440p';
        if (height >= 1080) return '1080p';
        if (height >= 720) return '720p';
        if (height >= 480) return '480p';
        if (height >= 360) return '360p';
        if (height >= 240) return '240p';

        return `${height}p`;
    }

    if (this.debugQuality) {
        if (this.options.debug) console.log('No quality detected:', {
            currentSrc: this.video.currentSrc,
            videoHeight: this.video.videoHeight,
            videoWidth: this.video.videoWidth,
            qualities: this.qualities
        });
    }

    return null;
}

updateCurrentPlayingQuality() {
    const newPlayingQuality = this.getCurrentPlayingQuality();

    if (newPlayingQuality && newPlayingQuality !== this.currentPlayingQuality) {
        if (this.options.debug) console.log(`Quality changed: ${this.currentPlayingQuality} → ${newPlayingQuality}`);
        this.currentPlayingQuality = newPlayingQuality;
        this.updateQualityDisplay();
    }
}

updateQualityDisplay() {
    this.updateQualityButton();
    this.updateQualityMenu();
}

updateQualityButton() {
    if (this.isAdaptiveStream) {
        if (this.options.debug) console.log('🔒 Adaptive streaming active - quality button managed by streaming.js');
        return;
    }

    const qualityBtn = this.controls?.querySelector('.quality-btn');
    if (!qualityBtn) return;

    let btnText = qualityBtn.querySelector('.quality-btn-text');
    if (!btnText) {
        // SECURITY: Use DOM methods instead of innerHTML to prevent XSS
        qualityBtn.textContent = ''; // Clear existing content

        // Create icon element
        const iconSpan = document.createElement('span');
        iconSpan.className = 'icon';
        iconSpan.textContent = '⚙';
        qualityBtn.appendChild(iconSpan);

        // Create text container
        btnText = document.createElement('div');
        btnText.className = 'quality-btn-text';

        // Create selected quality element
        const selectedQualityDiv = document.createElement('div');
        selectedQualityDiv.className = 'selected-quality';
        selectedQualityDiv.textContent = this.selectedQuality === 'auto' ? this.t('auto') : this.selectedQuality;
        btnText.appendChild(selectedQualityDiv);

        // Create current quality element
        const currentQualityDiv = document.createElement('div');
        currentQualityDiv.className = 'current-quality';
        currentQualityDiv.textContent = this.currentPlayingQuality || '';
        btnText.appendChild(currentQualityDiv);

        // Append to button
        qualityBtn.appendChild(btnText);
    } else {
        // SECURITY: Update existing elements using textContent (not innerHTML)
        const selectedEl = btnText.querySelector('.selected-quality');
        const currentEl = btnText.querySelector('.current-quality');

        if (selectedEl) {
            selectedEl.textContent = this.selectedQuality === 'auto' ? this.t('auto') : this.selectedQuality;
        }

        if (currentEl) {
            currentEl.textContent = this.currentPlayingQuality || '';
        }
    }
}

updateQualityMenu() {
    const qualityMenu = this.controls?.querySelector('.quality-menu');
    if (!qualityMenu) return;

    if (this.isAdaptiveStream) {
        if (this.options.debug) console.log('Adaptive streaming active - quality menu managed by streaming module');
        return;
    }

    qualityMenu.textContent = '';

    const createOption = (label, attrs, className) => {
        const opt = document.createElement('div');
        opt.className = className;
        opt.textContent = label;
        Object.entries(attrs).forEach(([k, v]) => opt.setAttribute(k, String(v)));
        return opt;
    };

    if (this.isAdaptiveStream && this.adaptiveQualities && this.adaptiveQualities.length > 0) {
        const currentIndex = this.getCurrentAdaptiveQuality();
        const autoSelected = currentIndex === -1 || currentIndex === null || this.selectedQuality === 'auto';
        qualityMenu.appendChild(
            createOption(this.t('auto'), { 'data-adaptive-quality': 'auto' }, `quality-option ${autoSelected ? 'selected' : ''}`)
        );

        this.adaptiveQualities.forEach(quality => {
            const isSelected = currentIndex === quality.index && !autoSelected;
            const label = quality.label || (quality.height ? `${quality.height}p` : 'Unknown');
            qualityMenu.appendChild(
                createOption(label, { 'data-adaptive-quality': quality.index }, `quality-option ${isSelected ? 'selected' : ''}`)
            );
        });
    } else {
        const autoSelected = this.selectedQuality === 'auto';
        const autoPlaying = this.selectedQuality === 'auto' && this.currentPlayingQuality;
        let autoClass = 'quality-option';
        if (autoSelected && autoPlaying) autoClass += ' selected playing';
        else if (autoSelected) autoClass += ' selected';

        qualityMenu.appendChild(createOption(this.t('auto'), { 'data-quality': 'auto' }, autoClass));

        this.qualities.forEach(quality => {
            const isSelected = this.selectedQuality === quality.quality;
            const isPlaying = this.currentPlayingQuality === quality.quality;
            let className = 'quality-option';
            if (isSelected && isPlaying) className += ' selected playing';
            else if (isSelected) className += ' selected';
            else if (isPlaying) className += ' playing';

            qualityMenu.appendChild(createOption(quality.quality, { 'data-quality': quality.quality }, className));
        });
    }
}

getQualityStatus() {
    return {
        selected: this.selectedQuality,
        playing: this.currentPlayingQuality,
        isAuto: this.selectedQuality === 'auto',
        isChanging: this.isChangingQuality
    };
}

getSelectedQuality() {
    return this.selectedQuality;
}

isAutoQualityActive() {
    return this.selectedQuality === 'auto';
}

enableQualityDebug() {
    this.debugQuality = true;
    this.enableAutoHideDebug(); // Abilita anche debug auto-hide
    if (this.options.debug) console.log('Quality AND auto-hide debug enabled');
    this.updateCurrentPlayingQuality();
}

disableQualityDebug() {
    this.debugQuality = false;
    this.disableAutoHideDebug();
    if (this.options.debug) console.log('Quality AND auto-hide debug disabled');
}

changeQuality(e) {
    if (!e.target.classList.contains('quality-option')) return;
    if (this.isChangingQuality) return;

    // Handle adaptive streaming quality change
    const adaptiveQuality = e.target.getAttribute('data-adaptive-quality');
    if (adaptiveQuality !== null && this.isAdaptiveStream) {
        const qualityIndex = adaptiveQuality === 'auto' ? -1 : parseInt(adaptiveQuality);
        this.setAdaptiveQuality(qualityIndex);
        this.updateAdaptiveQualityMenu();
        return;
    }

    const quality = e.target.getAttribute('data-quality');
    if (!quality || quality === this.selectedQuality) return;

    if (this.options.debug) console.log(`Quality change requested: ${this.selectedQuality} → ${quality}`);

    this.selectedQuality = quality;

    if (quality === 'auto') {
        this.enableAutoQuality();
    } else {
        this.setQuality(quality);
    }

    this.updateQualityDisplay();
}

setQuality(targetQuality) {
    if (this.options.debug) console.log(`setQuality("${targetQuality}") called`);

    if (!targetQuality) {
        if (this.options.debug) console.error('targetQuality is empty!');
        return;
    }

    if (!this.video || !this.qualities || this.qualities.length === 0) return;
    if (this.isChangingQuality) return;

    const newSource = this.qualities.find(q => q.quality === targetQuality);
    if (!newSource || !newSource.src) {
        if (this.options.debug) console.error(`Quality "${targetQuality}" not found`);
        return;
    }

    const currentTime = this.video.currentTime || 0;
    const wasPlaying = !this.video.paused;

    this.isChangingQuality = true;
    this.selectedQuality = targetQuality;
    this.video.pause();

    // Show loading state during quality change
    this.showLoading();
    if (this.video.classList) {
        this.video.classList.add('quality-changing');
    }

    const onLoadedData = () => {
        if (this.options.debug) console.log(`Quality ${targetQuality} applied!`);
        this.video.currentTime = currentTime;

        if (wasPlaying) {
            this.video.play().catch(e => {
                if (this.options.debug) console.log('Play error:', e);
            });
        }

        this.currentPlayingQuality = targetQuality;
        this.updateQualityDisplay();
        this.isChangingQuality = false;

        // Restore resolution settings after quality change
        this.restoreResolutionAfterQualityChange();
        cleanup();
    };

    const onError = (error) => {
        if (this.options.debug) console.error(`Loading error ${targetQuality}:`, error);
        this.isChangingQuality = false;

        // Trigger ended event for error handling
        this.onVideoError(error);

        cleanup();
    };

    const cleanup = () => {
        this.video.removeEventListener('loadeddata', onLoadedData);
        this.video.removeEventListener('error', onError);
    };

    this.video.addEventListener('loadeddata', onLoadedData, { once: true });
    this.video.addEventListener('error', onError, { once: true });

    this.video.src = newSource.src;
    this.video.load();
}

finishQualityChange(success, wasPlaying, currentTime, currentVolume, wasMuted, targetQuality) {
    if (this.options.debug) console.log(`Quality change completion: success=${success}, target=${targetQuality}`);

    if (this.qualityChangeTimeout) {
        clearTimeout(this.qualityChangeTimeout);
        this.qualityChangeTimeout = null;
    }

    if (this.video) {
        try {
            if (success && currentTime > 0 && this.video.duration) {
                this.video.currentTime = Math.min(currentTime, this.video.duration);
            }

            this.video.volume = currentVolume;
            this.video.muted = wasMuted;

            if (success && wasPlaying) {
                this.video.play().catch(err => {
                    if (this.options.debug) console.warn('Play after quality change failed:', err);
                });
            }
        } catch (error) {
            if (this.options.debug) console.error('Errore ripristino stato:', error);
        }

        if (this.video.classList) {
            this.video.classList.remove('quality-changing');
        }
    }

    this.hideLoading();
    this.isChangingQuality = false;

    if (success) {
        if (this.options.debug) console.log('Quality change completed successfully');
        setTimeout(() => {
            this.currentPlayingQuality = targetQuality;
            this.updateQualityDisplay();
            if (this.options.debug) console.log(`🎯 Quality confirmed active: ${targetQuality}`);
        }, 100);
    } else {
        if (this.options.debug) console.warn('Quality change failed or timeout');
    }

    setTimeout(() => {
        this.updateCurrentPlayingQuality();
    }, 2000);
}

cleanupQualityChange() {
    if (this.qualityChangeTimeout) {
        clearTimeout(this.qualityChangeTimeout);
        this.qualityChangeTimeout = null;
    }
}

enableAutoQuality() {
    if (this.options.debug) console.log('🔄 enableAutoQuality - keeping selectedQuality as "auto"');

    // IMPORTANT: Keep selectedQuality as 'auto' for proper UI display
    this.selectedQuality = 'auto';

    if (!this.qualities || this.qualities.length === 0) {
        if (this.options.debug) console.warn('⚠️ No qualities available for auto selection');
        this.updateQualityDisplay();
        return;
    }

    // Smart connection-based quality selection
    let autoSelectedQuality = this.getAutoQualityBasedOnConnection();

    if (this.options.debug) {
        console.log('🎯 Auto quality selected:', autoSelectedQuality);
        console.log('📊 selectedQuality remains: "auto" (for UI)');
    }

    // Apply the auto-selected quality but keep UI showing "auto"
    this.applyAutoQuality(autoSelectedQuality);
}

// ENHANCED CONNECTION DETECTION - Uses RTT + downlink heuristics
// Handles both Ethernet and real mobile 4G intelligently

getAutoQualityBasedOnConnection() {
    // Get available qualities
    const maxQualityIndex = this.qualities.length - 1;
    const maxQuality = this.qualities[maxQualityIndex];
    let selectedQuality = maxQuality.quality;

    // =====================================================
    // MOBILE DETECTION
    // =====================================================
    const isDefinitelyMobile = () => {
        const ua = navigator.userAgent.toLowerCase();
        const checks = [
            ua.includes('android'),
            ua.includes('mobile'),
            ua.includes('iphone'),
            ua.includes('ipad'),
            window.innerWidth < 1024,
            window.innerHeight < 768,
            'ontouchstart' in window,
            navigator.maxTouchPoints > 0,
            'orientation' in window,
            window.devicePixelRatio > 1.5
        ];

        // Count positive checks - mobile if 4+ indicators (more aggressive)
        const mobileScore = checks.filter(Boolean).length;

        if (this.options.debug) {
            console.log('🔍 Mobile Detection Score:', {
                score: mobileScore + '/10',
                android: ua.includes('android'),
                mobile: ua.includes('mobile'),
                width: window.innerWidth,
                touch: 'ontouchstart' in window,
                maxTouch: navigator.maxTouchPoints
            });
        }

        return mobileScore >= 4; // Threshold: 4 out of 10 checks
    };

    // FORCE MOBILE BEHAVIOR FIRST - Override everything else
    if (isDefinitelyMobile()) {
        // Helper function for mobile
        const findMobileQuality = (maxHeight) => {
            const mobileQualities = this.qualities
                .filter(q => q.height && q.height <= maxHeight)
                .sort((a, b) => b.height - a.height);
            return mobileQualities[0] || maxQuality;
        };

        // Conservative quality for mobile devices - MAX 1080p
        const mobileQuality = findMobileQuality(1080);

        if (this.options.debug) console.log('🚨 MOBILE FORCE OVERRIDE: ' + mobileQuality.quality + ' (max 1080p)');
        return mobileQuality.quality;
    }

    // =====================================================
    // DESKTOP CONNECTION ANALYSIS
    // =====================================================
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection) {
        const physicalType = connection.type; // Usually undefined
        const downlinkSpeed = connection.downlink || 0;
        const rtt = connection.rtt; // Round Trip Time in milliseconds

        if (this.options.debug) {
            console.log('🌐 Enhanced Connection Detection:', {
                physicalType: physicalType || 'undefined',
                downlink: downlinkSpeed + ' Mbps',
                rtt: rtt + ' ms',
                userAgent: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
            });
        }

        // Helper function to detect mobile device via User-Agent (backup)
        const isMobileDevice = () => {
            return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        };

        // Helper function to find quality by minimum height
        const findQualityByMinHeight = (minHeight) => {
            // Sort qualities by height (descending) and find first match >= minHeight
            const sortedQualities = this.qualities
                .filter(q => q.height && q.height >= minHeight)
                .sort((a, b) => b.height - a.height);

            return sortedQualities[0] || maxQuality;
        };

        // Helper function to find highest available quality
        const findHighestQuality = () => {
            const sortedQualities = this.qualities
                .filter(q => q.height)
                .sort((a, b) => b.height - a.height);

            return sortedQualities[0] || maxQuality;
        };

        // PRIORITY 1: Physical type detection (when available - rare)
        if (physicalType === 'ethernet') {
            const quality = findHighestQuality(); // Maximum available quality
            if (this.options.debug) console.log('🔥 Ethernet Detected: ' + quality.quality);
            return quality.quality;
        }

        if (physicalType === 'wifi') {
            const quality = findQualityByMinHeight(1440) || findHighestQuality(); // 2K preferred
            if (this.options.debug) console.log('📶 WiFi Detected: ' + quality.quality);
            return quality.quality;
        }

        if (physicalType === 'cellular') {
            // Conservative approach for confirmed mobile connection
            if (downlinkSpeed >= 20 && rtt < 40) {
                const quality = findQualityByMinHeight(1080); // Max 1080p for excellent mobile
                if (this.options.debug) console.log('📱 Excellent Cellular: ' + quality.quality);
                return quality.quality;
            } else if (downlinkSpeed >= 10) {
                const quality = findQualityByMinHeight(720); // 720p for good mobile
                if (this.options.debug) console.log('📱 Good Cellular: ' + quality.quality);
                return quality.quality;
            } else {
                const quality = findQualityByMinHeight(480); // 480p for standard mobile
                if (this.options.debug) console.log('📱 Standard Cellular: ' + quality.quality);
                return quality.quality;
            }
        }

        // PRIORITY 2: RTT + Downlink + User-Agent heuristics (most common case)
        if (this.options.debug) {
            console.log('🌐 Physical type undefined - using enhanced RTT + UA heuristics');
        }

        // SPECIAL CASE: RTT = 0 (Ultra-fast connection with mobile detection)
        if (rtt === 0) {
            if (isMobileDevice()) {
                // Mobile device with RTT=0 = excellent 4G/5G, but be conservative for data usage
                const quality = findQualityByMinHeight(1080); // Max 1080p for mobile
                if (this.options.debug) console.log('📱 Mobile Device (UA) with RTT=0: ' + quality.quality);
                return quality.quality;
            } else {
                // Desktop with RTT=0 = true ultra-fast fixed connection (Ethernet/Fiber)
                const quality = findHighestQuality();
                if (this.options.debug) console.log('🚀 Desktop Ultra-Fast (RTT=0): ' + quality.quality);
                return quality.quality;
            }
        }

        // Very low RTT + high speed with mobile detection
        if (rtt < 20 && downlinkSpeed >= 10) {
            if (isMobileDevice()) {
                if (rtt < 10 && downlinkSpeed >= 15) {
                    // Excellent 5G with very low RTT - allow higher quality but still conservative
                    const quality = findQualityByMinHeight(1080); // Max 1080p for excellent mobile
                    if (this.options.debug) console.log('📱 Mobile 5G Ultra-Fast (RTT<10): ' + quality.quality);
                    return quality.quality;
                } else {
                    // Good mobile connection but conservative
                    const quality = findQualityByMinHeight(720); // 720p for mobile with good RTT
                    if (this.options.debug) console.log('📱 Mobile Good Connection (RTT<20): ' + quality.quality);
                    return quality.quality;
                }
            } else {
                // Desktop with low RTT = fast fixed connection
                const quality = findQualityByMinHeight(1440) || findHighestQuality(); // 2K or best available
                if (this.options.debug) console.log('🔥 Desktop High-Speed Fixed (RTT<20): ' + quality.quality);
                return quality.quality;
            }
        }

        // Low-medium RTT with speed analysis
        if (rtt < 40 && downlinkSpeed >= 8) {
            if (isMobileDevice()) {
                // Mobile with decent connection
                const quality = findQualityByMinHeight(720); // 720p for mobile
                if (this.options.debug) console.log('📱 Mobile Decent Connection (RTT<40): ' + quality.quality);
                return quality.quality;
            } else {
                // Desktop with medium RTT = good fixed connection (WiFi/ADSL)
                const quality = findQualityByMinHeight(1080); // 1080p for desktop
                if (this.options.debug) console.log('⚡ Desktop Good Connection (RTT<40): ' + quality.quality);
                return quality.quality;
            }
        }

        // Higher RTT = likely mobile or congested connection
        if (rtt >= 40) {
            if (downlinkSpeed >= 15 && !isMobileDevice()) {
                // High speed but high RTT on desktop = congested but fast connection
                const quality = findQualityByMinHeight(1080); // 1080p
                if (this.options.debug) console.log('🌐 Desktop Congested Fast Connection: ' + quality.quality);
                return quality.quality;
            } else if (downlinkSpeed >= 10) {
                // High RTT with good speed = mobile or congested WiFi
                const quality = findQualityByMinHeight(720); // 720p
                if (this.options.debug) console.log('📱 Mobile/Congested Connection (RTT≥40): ' + quality.quality);
                return quality.quality;
            } else {
                // High RTT with lower speed = definitely mobile or slow connection
                const quality = findQualityByMinHeight(480); // 480p
                if (this.options.debug) console.log('📱 Slow Mobile Connection: ' + quality.quality);
                return quality.quality;
            }
        }

        // Medium speed cases without clear RTT data
        if (downlinkSpeed >= 8) {
            if (isMobileDevice()) {
                const quality = findQualityByMinHeight(720); // Conservative for mobile
                if (this.options.debug) console.log('📱 Mobile Standard Speed: ' + quality.quality);
                return quality.quality;
            } else {
                const quality = findQualityByMinHeight(1080); // Good for desktop
                if (this.options.debug) console.log('🌐 Desktop Standard Speed: ' + quality.quality);
                return quality.quality;
            }
        } else if (downlinkSpeed >= 5) {
            // Lower speed - conservative approach
            const quality = findQualityByMinHeight(720);
            if (this.options.debug) console.log('🌐 Lower Speed Connection: ' + quality.quality);
            return quality.quality;
        } else {
            // Very low speed
            const quality = findQualityByMinHeight(480);
            if (this.options.debug) console.log('🌐 Very Low Speed Connection: ' + quality.quality);
            return quality.quality;
        }

    } else {
        // No connection information available
        const isMobileDevice = () => {
            return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        };

        // Helper function for fallback
        const findQualityByMinHeight = (minHeight) => {
            const sortedQualities = this.qualities
                .filter(q => q.height && q.height >= minHeight)
                .sort((a, b) => b.height - a.height);
            return sortedQualities[0] || maxQuality;
        };

        if (isMobileDevice()) {
            // Mobile device without connection info - be conservative
            const quality = findQualityByMinHeight(720);
            if (this.options.debug) console.log('📱 Mobile - No Connection Info: ' + quality.quality);
            return quality.quality;
        } else {
            // Desktop without connection info - assume good connection
            const quality = findQualityByMinHeight(1080) || maxQuality;
            if (this.options.debug) console.log('🌐 Desktop - No Connection Info: ' + quality.quality);
            return quality.quality;
        }
    }

    // Final fallback (should rarely reach here)
    if (this.options.debug) console.log('🌐 Fallback to max quality: ' + maxQuality.quality);
    return maxQuality.quality;
}

applyAutoQuality(targetQuality) {
    if (!targetQuality || !this.video || !this.qualities || this.qualities.length === 0) {
        return;
    }

    if (this.isChangingQuality) return;

    const newSource = this.qualities.find(q => q.quality === targetQuality);
    if (!newSource || !newSource.src) {
        if (this.options.debug) console.error('Auto quality', targetQuality, 'not found');
        return;
    }

    // Store current resolution to restore after quality change
    const currentResolution = this.getCurrentResolution();

    const currentTime = this.video.currentTime || 0;
    const wasPlaying = !this.video.paused;

    this.isChangingQuality = true;
    this.video.pause();

    // Show loading overlay
    this.showLoading();
    if (this.video.classList) {
        this.video.classList.add('quality-changing');
    }


    const onLoadedData = () => {
        if (this.options.debug) console.log('Auto quality', targetQuality, 'applied');
        this.video.currentTime = currentTime;
        if (wasPlaying) {
            this.video.play().catch(e => {
                if (this.options.debug) console.log('Autoplay prevented:', e);
            });
        }
        this.currentPlayingQuality = targetQuality;
        // Keep selectedQuality as 'auto' for UI display
        this.updateQualityDisplay();

        // Hide loading overlay
        this.hideLoading();
        if (this.video.classList) {
            this.video.classList.remove('quality-changing');
        }

        this.isChangingQuality = false;
        cleanup();
    };

    const onError = (error) => {
        if (this.options.debug) console.error('Auto quality loading error:', error);
        this.isChangingQuality = false;

        // Trigger ended event for error handling
        this.onVideoError(error);

        cleanup();
    };

    const cleanup = () => {
        this.video.removeEventListener('loadeddata', onLoadedData);
        this.video.removeEventListener('error', onError);
    };

    this.video.addEventListener('loadeddata', onLoadedData, { once: true });
    this.video.addEventListener('error', onError, { once: true });
    this.video.src = newSource.src;
    this.video.load();
}

setDefaultQuality(quality) {
    if (this.options.debug) console.log(`🔧 Setting defaultQuality: "${quality}"`);
    this.options.defaultQuality = quality;
    this.selectedQuality = quality;

    if (quality === 'auto') {
        this.enableAutoQuality();
    } else {
        this.setQuality(quality);
    }

    return this;
}

getDefaultQuality() {
    return this.options.defaultQuality;
}

getQualityLabel(height, width) {
    if (height >= 2160) return '4K';
    if (height >= 1440) return '1440p';
    if (height >= 1080) return '1080p';
    if (height >= 720) return '720p';
    if (height >= 480) return '480p';
    if (height >= 360) return '360p';
    if (height >= 240) return '240p';
    return `${height}p`;
}

setAdaptiveQuality(qualityIndex) {
    if (!this.isAdaptiveStream) return;

    try {
        if (qualityIndex === 'auto' || qualityIndex === -1) {
            // Enable auto quality
            if (this.adaptiveStreamingType === 'dash' && this.dashPlayer) {
                this.dashPlayer.updateSettings({
                    streaming: {
                        abr: { autoSwitchBitrate: { video: true } }
                    }
                });
            } else if (this.adaptiveStreamingType === 'hls' && this.hlsPlayer) {
                this.hlsPlayer.currentLevel = -1; // Auto level selection
            }
            this.selectedQuality = 'auto';
        } else {
            // Set specific quality
            if (this.adaptiveStreamingType === 'dash' && this.dashPlayer) {
                this.dashPlayer.updateSettings({
                    streaming: {
                        abr: { autoSwitchBitrate: { video: false } }
                    }
                });
                this.dashPlayer.setQualityFor('video', qualityIndex);
            } else if (this.adaptiveStreamingType === 'hls' && this.hlsPlayer) {
                this.hlsPlayer.currentLevel = qualityIndex;
            }
            this.selectedQuality = this.adaptiveQualities[qualityIndex]?.label || 'Unknown';
        }

        this.updateAdaptiveQualityDisplay();
        if (this.options.debug) console.log('📡 Adaptive quality set to:', qualityIndex);

    } catch (error) {
        if (this.options.debug) console.error('📡 Error setting adaptive quality:', error);
    }
}

getCurrentAdaptiveQuality() {
    if (!this.isAdaptiveStream) return null;

    try {
        if (this.adaptiveStreamingType === 'dash' && this.dashPlayer) {
            return this.dashPlayer.getQualityFor('video');
        } else if (this.adaptiveStreamingType === 'hls' && this.hlsPlayer) {
            return this.hlsPlayer.currentLevel;
        }
    } catch (error) {
        if (this.options.debug) console.error('📡 Error getting current quality:', error);
    }

    return null;
}

getCurrentAdaptiveQualityLabel() {
    const currentIndex = this.getCurrentAdaptiveQuality();
    if (currentIndex === null || currentIndex === -1) {
        return this.tauto;  // Return "Auto" instead of "Unknown"
    }
    return this.adaptiveQualities[currentIndex]?.label || this.tauto;
}

isAutoQuality() {
    if (this.isAdaptiveStream) {
        const currentQuality = this.getCurrentAdaptiveQuality();
        return currentQuality === null || currentQuality === -1 || this.selectedQuality === 'auto';
    }
    return this.selectedQuality === 'auto';
}

setResolution(resolution) {
    if (!this.video || !this.container) {
        if (this.options.debug) console.warn("Video or container not available for setResolution");
        return;
    }

    // Supported values including new scale-to-fit mode
    const supportedResolutions = ["normal", "4:3", "16:9", "stretched", "fit-to-screen", "scale-to-fit"];

    if (!supportedResolutions.includes(resolution)) {
        if (this.options.debug) console.warn(`Resolution "${resolution}" not supported. Supported values: ${supportedResolutions.join(", ")}`);
        return;
    }

    // Remove all previous resolution classes
    const allResolutionClasses = [
        "resolution-normal", "resolution-4-3", "resolution-16-9",
        "resolution-stretched", "resolution-fit-to-screen", "resolution-scale-to-fit"
    ];

    this.video.classList.remove(...allResolutionClasses);
    if (this.container) {
        this.container.classList.remove(...allResolutionClasses);
    }

    // Apply new resolution class
    const cssClass = `resolution-${resolution.replace(":", "-")}`;
    this.video.classList.add(cssClass);
    if (this.container) {
        this.container.classList.add(cssClass);
    }

    // Update option
    this.options.resolution = resolution;

    if (this.options.debug) {
        console.log(`Resolution applied: ${resolution} (CSS class: ${cssClass})`);
    }
}

getCurrentResolution() {
    return this.options.resolution || "normal";
}

initializeResolution() {
    if (this.options.resolution && this.options.resolution !== "normal") {
        this.setResolution(this.options.resolution);
    }
}

restoreResolutionAfterQualityChange() {
    if (this.options.resolution && this.options.resolution !== "normal") {
        if (this.options.debug) {
            console.log(`Restoring resolution "${this.options.resolution}" after quality change`);
        }
        // Small delay to ensure video element is ready
        setTimeout(() => {
            this.setResolution(this.options.resolution);
        }, 150);
    }
}

// Quality methods for main class
// All original functionality preserved exactly
