/**
 * MYETV Player - Auto Subtitles Plugin
 * Automatically generates subtitles via Transformers.js + Whisper (client-side, no FFmpeg, no server)
 *
 * Compatible with myetv-player plugin system (registerMYETVPlugin)
 * Author: Oscar Cosimo - MYETV
 *
 * Options:
 *   language        {string}  Transcription language ('italian','english','it','en',...). Default: null (auto-detect)
 *   modelSize       {string}  'tiny' (~39MB), 'base' (~74MB), 'small' (~244MB). Default: 'base'
 *   autoGenerate    {boolean} Auto-generate subtitles on video load. Default: false
 *   autoTranslation {string}  Auto-translate subtitles into this language on load (ISO 2-letter code, e.g. 'en','it'). Default: null
 *   showButton      {boolean} Show button in the control bar. Default: true
 *   position        {string}  'right', 'left', or 'topbar'. Default: 'right'
 *   subtitleStyle   {object}  Custom CSS style object for the subtitle text div
 *   cacheEnabled    {boolean} Cache transcription in localStorage. Default: true
 *   idCache         {string}  Stable unique ID for localStorage cache key
 */

(function () {
    'use strict';

    // ─── CSS ─────────────────────────────────────────────────────────────────────
    const PLUGIN_CSS = `
  /* ── SUBTITLE OVERLAY ── */
  .myetv-autosub-overlay {
    position: absolute;
    bottom: 72px;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 820px;
    text-align: center;
    pointer-events: none;
    z-index: 9999;
    transition: opacity 0.2s ease;
    user-select: none;
  }
  .myetv-autosub-overlay.dragging {
    pointer-events: all;
    cursor: grabbing;
    transition: none;
  }
  .myetv-autosub-overlay.hidden { opacity: 0; }
  .myetv-autosub-text {
    display: inline-block;
    background: rgba(0,0,0,0.72);
    color: #fff;
    font-size: clamp(0.7em, 2.2vw, 1.1em);
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 500;
    line-height: 1.5;
    padding: 5px 14px 6px;
    border-radius: 5px;
    letter-spacing: 0.01em;
    word-break: break-word;
    white-space: pre-wrap;
  }
  .myetv-autosub-drag-handle {
    position: absolute;
    top: -18px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.55);
    border-radius: 4px;
    padding: 2px 8px;
    cursor: grab;
    pointer-events: all;
    opacity: 0;
    transition: opacity 0.2s;
    font-size: 0.7em;
    color: #aaa;
    white-space: nowrap;
  }
  .myetv-autosub-overlay:hover .myetv-autosub-drag-handle,
  .myetv-autosub-overlay.dragging .myetv-autosub-drag-handle { opacity: 1; }

  /* ── PROGRESS PANEL ── */
  .myetv-autosub-panel {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(10,10,10,0.95);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 10px;
    color: #fff;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 0.93em;
    padding: 18px 26px 16px;
    z-index: 10001;
    min-width: 300px;
    max-width: 400px;
    text-align: center;
    pointer-events: all;
    transition: opacity 0.25s ease, transform 0.25s ease;
  }
  .myetv-autosub-panel.hidden {
    opacity: 0;
    pointer-events: none;
    transform: translate(-50%, -48%);
  }
  .myetv-autosub-panel-header {
    display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 12px;
  }
  .myetv-autosub-panel-title { font-size: 1em; font-weight: 700; color: #33ccff; }
  .myetv-autosub-panel-close {
    background: none; border: none; color: #aaa;
    font-size: 1.3em; cursor: pointer; line-height: 1;
    padding: 0 2px; transition: color 0.15s;
  }
  .myetv-autosub-panel-close:hover { color: #fff; }
  .myetv-autosub-panel-status { margin-bottom: 8px; color: #ddd; font-size: 0.9em; min-height: 18px; }
  .myetv-autosub-progress-bar-wrap {
    background: rgba(255,255,255,0.12);
    border-radius: 6px; height: 7px; width: 100%;
    margin: 8px 0 4px; overflow: hidden;
  }
  .myetv-autosub-progress-bar {
    height: 100%; width: 0%;
    background: linear-gradient(90deg, #33ccff, #0088cc);
    border-radius: 6px; transition: width 0.3s ease;
  }
  .myetv-autosub-progress-label { font-size: 0.82em; color: #aaa; margin-top: 3px; }
  .myetv-autosub-panel-note { font-size: 0.78em; color: #666; margin-top: 10px; line-height: 1.4; }

  /* ── BUTTON ── */
  .myetv-autosub-btn-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
  }
  .myetv-autosub-btn svg { width: 20px; height: 20px; fill: currentColor; }
  .myetv-autosub-btn.generating { animation: myetv-autosub-pulse 1.2s infinite alternate; }
  .myetv-autosub-btn.active-sub { color: #33ccff; }
  @keyframes myetv-autosub-pulse { from { opacity: 1; } to { opacity: 0.4; } }

  /* ── TOPBAR: force horizontal row, settings always on the right ── */
  .settings-control.settings-top-bar {
    display: inline-flex !important;
    flex-direction: row !important;
    align-items: center !important;
    gap: 2px;
  }

  /* ── SUBMENU — appended to body, always on top of everything ── */
  .myetv-autosub-menu {
    position: fixed;
    background: rgba(15,15,15,0.97);
    border: 1px solid rgba(255,255,255,0.13);
    border-radius: 8px;
    min-width: 210px;
    max-width: 260px;
    padding: 6px 0;
    z-index: 2147483647;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 0.88em;
    color: #eee;
    box-shadow: 0 4px 24px rgba(0,0,0,0.7);
    display: none;
    pointer-events: all;
    max-height: 70vh;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #33ccff44 transparent;
  }
  .myetv-autosub-menu::-webkit-scrollbar { width: 4px; }
  .myetv-autosub-menu::-webkit-scrollbar-thumb {
    background: #33ccff44; border-radius: 4px;
  }
  .myetv-autosub-menu.open { display: block; }

  .myetv-autosub-menu-section {
    padding: 4px 0;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .myetv-autosub-menu-section:last-child { border-bottom: none; }
  .myetv-autosub-menu-label {
    font-size: 0.75em; color: #666;
    padding: 4px 14px 2px; text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .myetv-autosub-menu-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 7px 14px;
    cursor: pointer;
    transition: background 0.12s;
    border-radius: 4px;
    margin: 0 4px;
  }
  .myetv-autosub-menu-item:hover { background: rgba(255,255,255,0.08); }
  .myetv-autosub-menu-item.active { color: #33ccff; }
  .myetv-autosub-menu-item.disabled { opacity: 0.4; cursor: default; pointer-events: none; }
  .myetv-autosub-menu-check { font-size: 1em; margin-left: 8px; }

  /* ── TRANSLATE LIST ── */
  .myetv-autosub-translate-list {
    max-height: 160px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #33ccff44 transparent;
  }
  .myetv-autosub-translate-list::-webkit-scrollbar { width: 4px; }
  .myetv-autosub-translate-list::-webkit-scrollbar-thumb {
    background: #33ccff44; border-radius: 4px;
  }

  /* Audio player offset */
  .audio-player .myetv-autosub-overlay { bottom: 80px; }

  /* ── RESPONSIVE mobile ── */
  @media (max-width: 600px) {
    .myetv-autosub-overlay { bottom: 60px; width: 96%; }
    .myetv-autosub-text { font-size: clamp(0.6em, 3.5vw, 0.85em); padding: 3px 8px 4px; }
    .myetv-autosub-drag-handle { display: none; } /* drag handle hidden on touch devices */
  }
  @media (max-width: 400px) {
    .myetv-autosub-text { font-size: clamp(0.55em, 4vw, 0.75em); }
  }
`;

    const ICON_CC = `<svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-9 8H9.5v-.5h-2v3h2V14H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V14H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z"/></svg>`;
    const ICON_LOADING = `<svg viewBox="0 0 24 24"><path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></path></svg>`;

    const WHISPER_MODELS = {
        tiny: 'Xenova/whisper-tiny',
        base: 'Xenova/whisper-base',
        small: 'Xenova/whisper-small',
    };

    const LANGUAGE_MAP = {
        'it': 'italian', 'en': 'english', 'de': 'german',
        'fr': 'french', 'es': 'spanish', 'pt': 'portuguese',
        'ru': 'russian', 'ja': 'japanese', 'zh': 'chinese',
        'ar': 'arabic', 'ko': 'korean', 'nl': 'dutch',
        'pl': 'polish', 'sv': 'swedish', 'tr': 'turkish',
        'uk': 'ukrainian', 'cs': 'czech', 'ro': 'romanian',
        'hu': 'hungarian', 'fi': 'finnish', 'da': 'danish',
        'no': 'norwegian', 'el': 'greek', 'he': 'hebrew',
        'hi': 'hindi', 'id': 'indonesian', 'ms': 'malay',
        'th': 'thai', 'vi': 'vietnamese', 'ca': 'catalan',
    };

    // Available languages for translation (MyMemory API — free, no key required)
    const TRANSLATE_LANGS = [
        { code: 'off', label: '— No translation —' },
        { code: 'it', label: '🇮🇹 Italiano' },
        { code: 'en', label: '🇬🇧 English' },
        { code: 'de', label: '🇩🇪 Deutsch' },
        { code: 'fr', label: '🇫🇷 Français' },
        { code: 'es', label: '🇪🇸 Español' },
        { code: 'pt', label: '🇵🇹 Português' },
        { code: 'ru', label: '🇷🇺 Русский' },
        { code: 'ja', label: '🇯🇵 日本語' },
        { code: 'zh', label: '🇨🇳 中文' },
        { code: 'ar', label: '🇸🇦 العربية' },
        { code: 'ko', label: '🇰🇷 한국어' },
        { code: 'nl', label: '🇳🇱 Nederlands' },
        { code: 'pl', label: '🇵🇱 Polski' },
        { code: 'tr', label: '🇹🇷 Türkçe' },
        { code: 'uk', label: '🇺🇦 Українська' },
        { code: 'hi', label: '🇮🇳 हिन्दी' },
    ];

    const TRANSFORMERS_VERSION = '3.3.3';
    const TRANSFORMERS_CDN_ESM = `https://cdn.jsdelivr.net/npm/@huggingface/transformers@${TRANSFORMERS_VERSION}/dist/transformers.min.js`;
    const TRANSFORMERS_WASM_DIR = `https://cdn.jsdelivr.net/npm/@huggingface/transformers@${TRANSFORMERS_VERSION}/dist/`;

    const CACHE_PREFIX = 'myetv_autosub_';
    const CACHE_MAX_ENTRIES = 30;

    let _transformersBundleText = null;

    // ─── Plugin Class ─────────────────────────────────────────────────────────────
    class AutoSubtitlesPlugin {

        constructor(player, options = {}) {
            this.player = player;
            this.video = player.video;
            this.container = player.container;

            this.opts = Object.assign({
                language: null,
                modelSize: 'base',
                autoGenerate: false,
                showButton: true,
                position: 'right',    // 'left' | 'right' | 'topbar'
                subtitleStyle: {},
                cacheEnabled: true,
                idCache: null,
                autoTranslation: null,      // ISO 2-letter code, e.g. 'en', 'it'
            }, options);

            this.isGenerating = false;
            this.subtitles = [];       // { start, end, text }  original segments
            this.subtitlesTrans = [];       // { start, end, text }  translated segments (in-memory cache)
            this.translateLang = 'off';    // currently active translation language
            this._transCache = {};       // { langCode: [{start,end,text}] }
            this.subVisible = false;
            this.updateInterval = null;
            this.btnWrapEl = null;
            this.btnEl = null;
            this.menuEl = null;
            this.overlayEl = null;
            this.panelEl = null;
            this.panelOpen = false;
            this._worker = null;
            // Drag state
            this._drag = { active: false, startX: 0, startY: 0, origLeft: 0, origTop: 0 };
            // Overlay position (absolute px, or null → uses default bottom:72px from CSS)
            this._overlayPos = null;
        }

        setup() {
            this._injectCSS();
            this._createOverlay();
            this._createPanel();
            if (this.opts.showButton) this._createButton();
            if (this.opts.autoTranslation) {
                this._scheduleAutoTranslation();
            }
            if (this.opts.autoGenerate) {
                this.video.addEventListener('loadedmetadata', () => this.generate(), { once: true });
            }
            if (this.player.options.debug) console.log('[AutoSub] Plugin setup complete');
        }

        _scheduleAutoTranslation() {
            // Light polling: waits until this.subtitles is populated (from cache or transcription),
            // then triggers translation automatically
            const lang = this.opts.autoTranslation.toLowerCase().trim().slice(0, 2);
            let tries = 0;

            const check = setInterval(() => {
                tries++;
                if (this.subtitles.length > 0) {
                    clearInterval(check);
                    if (this.player.options.debug)
                        console.log('[AutoSub] autoTranslation → triggering lang:', lang);
                    this._setTranslationLang(lang);
                    this._updateMenu();
                    return;
                }
                // Stop waiting after 5 minutes (enough for any transcription, even large videos with slow models)
                if (tries > 300) clearInterval(check);
            }, 1000);
        }

        async handleButtonClick() {
            // If cache is enabled and no subtitles are loaded yet, try loading from cache first
            if (this.subtitles.length === 0 && !this.isGenerating) {
                const cached = this._loadFromCache();
                if (cached) {
                    this.subtitles = cached;
                    this.subVisible = true;
                    this._startDisplay();
                    this._setBtnActive(true);
                    this._updateMenu();
                    if (this.player.options.debug)
                        console.log('[AutoSub] Loaded from cache:', cached.length, 'segments');
                    // Open menu so the user can see current state and translation options
                    this._toggleMenu();
                    return;
                }
            }
            // No cache found, or subtitles already loaded — just toggle the menu
            this._toggleMenu();
        }

        async generate() {
            if (this.isGenerating) return;

            // Check cache before doing anything
            if (this.subtitles.length === 0) {
                const cached = this._loadFromCache();
                if (cached) {
                    this.subtitles = cached;
                    this.subVisible = true;
                    this._startDisplay();
                    this._setBtnActive(true);
                    this._updateMenu();
                    if (this.player.options.debug)
                        console.log('[AutoSub] generate() — cache hit, skipping transcription');
                    return;
                }
            }

            this.isGenerating = true;
            this._setBtnGenerating(true);
            this._updatePanel('Extracting audio...', 5);

            try {
                const audioData = await this._extractAudio();
                this._updatePanel('Downloading Transformers.js bundle...', 30);
                await this._ensureBundle();
                this._updatePanel('Preparing Whisper worker...', 38);
                await this._transcribeChunksStreaming(audioData);
                this._saveToCache(this.subtitles);
                this._updatePanel('Subtitles ready!', 100);
                setTimeout(() => {
                    this._closePanel();
                    this._setBtnActive(true);
                    this._updateMenu();
                    if (this.player.options.debug)
                        console.log('[AutoSub] Generation complete:', this.subtitles.length, 'segments');
                }, 800);
            } catch (err) {
                if (this.player.options.debug) console.error('[AutoSub] Generation error:', err);
                this._updatePanel('Error: ' + (err.message || String(err)), 0);
            } finally {
                this.isGenerating = false;
                this._setBtnGenerating(false);
            }
        }

        toggleSubtitles() {
            this.subVisible = !this.subVisible;
            if (this.subVisible) { this._startDisplay(); this._setBtnActive(true); }
            else { this._stopDisplay(); this._setBtnActive(false); this._clearOverlay(); }
            this._updateMenu();
        }

        dispose() {
            this._stopDisplay();
            this._destroyDrag();
            if (this._captureTimer) { clearTimeout(this._captureTimer); this._captureTimer = null; }
            if (this._captureProgressInterval) { clearInterval(this._captureProgressInterval); this._captureProgressInterval = null; }
            if (this._worker) { this._worker.terminate(); this._worker = null; }
            if (this.overlayEl) this.overlayEl.remove();
            if (this.panelEl) this.panelEl.remove();
            if (this.btnWrapEl) this.btnWrapEl.remove();
            if (this.menuEl) this.menuEl.remove();
            if (this._menuOutsideHandler) document.removeEventListener('click', this._menuOutsideHandler);
            if (this._menuEscHandler) document.removeEventListener('keydown', this._menuEscHandler);
        }

        // ─────────────────────────────────────────────────────────────────────────
        // PRIVATE — CSS
        // ─────────────────────────────────────────────────────────────────────────

        _injectCSS() {
            if (document.getElementById('myetv-autosub-css')) return;
            const style = document.createElement('style');
            style.id = 'myetv-autosub-css';
            style.textContent = PLUGIN_CSS;
            document.head.appendChild(style);
        }

        // ─────────────────────────────────────────────────────────────────────────
        // PRIVATE — OVERLAY + DRAG
        // ─────────────────────────────────────────────────────────────────────────

        _createOverlay() {
            const overlay = document.createElement('div');
            overlay.className = 'myetv-autosub-overlay hidden';

            const handle = document.createElement('div');
            handle.className = 'myetv-autosub-drag-handle';
            handle.textContent = '⠿ move';
            handle.title = 'Drag to reposition subtitles';

            const text = document.createElement('div');
            text.className = 'myetv-autosub-text';
            Object.assign(text.style, this.opts.subtitleStyle);

            overlay.appendChild(handle);
            overlay.appendChild(text);
            this.container.appendChild(overlay);

            this.overlayEl = overlay;
            this.overlayText = text;

            this._initDrag(handle, overlay);
        }

        _initDrag(handle, overlay) {
            const onStart = (e) => {
                // Prevent conflicts with player controls
                e.stopPropagation();
                const isTouch = e.type === 'touchstart';
                const clientX = isTouch ? e.touches[0].clientX : e.clientX;
                const clientY = isTouch ? e.touches[0].clientY : e.clientY;

                const rect = overlay.getBoundingClientRect();
                const contRect = this.container.getBoundingClientRect();

                // Switch to absolute positioning on first drag
                if (!this._overlayPos) {
                    const currentLeft = rect.left - contRect.left + rect.width / 2;
                    const currentTop = rect.top - contRect.top + rect.height / 2;
                    this._applyAbsolutePos(currentLeft, currentTop, rect.width, rect.height);
                }

                this._drag.active = true;
                this._drag.startX = clientX;
                this._drag.startY = clientY;
                this._drag.origLeft = this._overlayPos.left;
                this._drag.origTop = this._overlayPos.top;

                overlay.classList.add('dragging');
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onEnd);
                document.addEventListener('touchmove', onMove, { passive: false });
                document.addEventListener('touchend', onEnd);
                if (e.cancelable) e.preventDefault();
            };

            const onMove = (e) => {
                if (!this._drag.active) return;
                if (e.cancelable) e.preventDefault();
                const isTouch = e.type === 'touchmove';
                const clientX = isTouch ? e.touches[0].clientX : e.clientX;
                const clientY = isTouch ? e.touches[0].clientY : e.clientY;
                const dx = clientX - this._drag.startX;
                const dy = clientY - this._drag.startY;
                const contRect = this.container.getBoundingClientRect();
                const oRect = overlay.getBoundingClientRect();
                const hw = oRect.width / 2;
                const hh = oRect.height / 2;
                const newLeft = Math.max(hw, Math.min(contRect.width - hw, this._drag.origLeft + dx));
                const newTop = Math.max(hh, Math.min(contRect.height - hh, this._drag.origTop + dy));
                this._overlayPos = { left: newLeft, top: newTop };
                overlay.style.left = newLeft + 'px';
                overlay.style.top = newTop + 'px';
                overlay.style.bottom = 'auto';
                overlay.style.transform = 'translate(-50%, -50%)';
            };

            const onEnd = () => {
                if (!this._drag.active) return;
                this._drag.active = false;
                overlay.classList.remove('dragging');
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onEnd);
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('touchend', onEnd);
            };

            handle.addEventListener('mousedown', onStart);
            handle.addEventListener('touchstart', onStart, { passive: false });
            this._drag._onEnd = onEnd;
        }

        _applyAbsolutePos(cx, cy, w, h) {
            this._overlayPos = { left: cx, top: cy };
            this.overlayEl.style.left = cx + 'px';
            this.overlayEl.style.top = cy + 'px';
            this.overlayEl.style.bottom = 'auto';
            this.overlayEl.style.transform = 'translate(-50%, -50%)';
        }

        _destroyDrag() {
            if (this._drag._onEnd) {
                document.removeEventListener('mouseup', this._drag._onEnd);
                document.removeEventListener('touchend', this._drag._onEnd);
            }
        }

        // ─────────────────────────────────────────────────────────────────────────
        // PRIVATE — PANEL
        // ─────────────────────────────────────────────────────────────────────────

        _createPanel() {
            const panel = document.createElement('div');
            panel.className = 'myetv-autosub-panel hidden';
            panel.innerHTML = `
        <div class="myetv-autosub-panel-header">
          <div class="myetv-autosub-panel-title">🎙️ Auto Subtitles</div>
          <button class="myetv-autosub-panel-close" title="Close">✕</button>
        </div>
        <div class="myetv-autosub-panel-status">Waiting...</div>
        <div class="myetv-autosub-progress-bar-wrap">
          <div class="myetv-autosub-progress-bar"></div>
        </div>
        <div class="myetv-autosub-progress-label">0%</div>
        <div class="myetv-autosub-panel-note">Transcription runs in a background worker — keep watching!</div>
      `;
            panel.querySelector('.myetv-autosub-panel-close').addEventListener('click', () => this._closePanel());
            this.container.appendChild(panel);
            this.panelEl = panel;
            this._panelStatus = panel.querySelector('.myetv-autosub-panel-status');
            this._panelBar = panel.querySelector('.myetv-autosub-progress-bar');
            this._panelLabel = panel.querySelector('.myetv-autosub-progress-label');
        }

        _openPanel() { this.panelOpen = true; this.panelEl.classList.remove('hidden'); }
        _closePanel() { this.panelOpen = false; this.panelEl.classList.add('hidden'); }

        _updatePanel(statusText, pct) {
            const p = Math.min(100, Math.max(0, pct));
            if (this._panelStatus) this._panelStatus.textContent = statusText;
            if (this._panelBar) this._panelBar.style.width = p + '%';
            if (this._panelLabel) this._panelLabel.textContent = Math.round(p) + '%';
        }

        // ─────────────────────────────────────────────────────────────────────────
        // PRIVATE — BUTTON + SUBMENU
        // ─────────────────────────────────────────────────────────────────────────

        _createButton() {
            const position = this.opts.position;

            // Button wrapper only (menu is appended directly to body)
            const wrap = document.createElement('div');
            wrap.style.cssText = 'position:relative;display:inline-flex;align-items:center;';

            const btn = document.createElement('button');
            btn.className = 'control-btn myetv-autosub-btn';
            btn.setAttribute('aria-label', 'Auto subtitles');
            btn.setAttribute('title', 'Auto subtitles (Whisper AI)');
            btn.innerHTML = ICON_CC;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleButtonClick();
            });

            wrap.appendChild(btn);

            // Menu is appended directly to body — escapes any stacking context from the player
            const menu = document.createElement('div');
            menu.className = 'myetv-autosub-menu';
            menu.addEventListener('click', (e) => e.stopPropagation());
            document.body.appendChild(menu);

            // Insert button into the player DOM
            if (position === 'topbar') {
                const settingsControl = this.container.querySelector('.settings-control');
                if (settingsControl) settingsControl.insertBefore(wrap, settingsControl.firstChild);
                else {
                    const topBar = this.container.querySelector('.player-top-bar');
                    if (topBar) topBar.appendChild(wrap);
                    else this.container.appendChild(wrap);
                }
            } else {
                const controls = this.player.controls;
                if (controls) {
                    const target = position === 'left'
                        ? controls.querySelector('.controls-left')
                        : controls.querySelector('.controls-right');
                    if (target) target.appendChild(wrap);
                    else controls.appendChild(wrap);
                }
            }

            this.btnWrapEl = wrap;
            this.btnEl = btn;
            this.menuEl = menu;

            // Close menu when clicking outside
            this._menuOutsideHandler = (e) => {
                if (!menu.contains(e.target) && e.target !== btn) {
                    this._closeMenuNow();
                }
            };
            document.addEventListener('click', this._menuOutsideHandler);

            // Close menu on Escape key
            this._menuEscHandler = (e) => {
                if (e.key === 'Escape') this._closeMenuNow();
            };
            document.addEventListener('keydown', this._menuEscHandler);
        }

        _toggleMenu() {
            if (!this.menuEl) return;
            const isOpen = this.menuEl.classList.contains('open');

            if (this.player.closeAllMenus) this.player.closeAllMenus();

            if (isOpen) {
                this._closeMenuNow();
                return;
            }

            // Rebuild menu content
            this._buildMenu();

            // Position before showing (measure offset first)
            this.menuEl.style.visibility = 'hidden';
            this.menuEl.style.display = 'block';

            const btnRect = this.btnEl.getBoundingClientRect();
            const menuH = this.menuEl.offsetHeight;
            const menuW = this.menuEl.offsetWidth || 220;
            const vpH = window.innerHeight;
            const vpW = window.innerWidth;

            // Open above or below depending on available space
            const spaceAbove = btnRect.top - 8;
            const spaceBelow = vpH - btnRect.bottom - 8;
            let top = (spaceAbove >= menuH || spaceAbove >= spaceBelow)
                ? btnRect.top - menuH - 8
                : btnRect.bottom + 8;

            // Align to the right edge of the button, clamped to viewport
            let left = btnRect.right - menuW;
            left = Math.max(4, Math.min(vpW - menuW - 4, left));
            top = Math.max(4, Math.min(vpH - menuH - 4, top));

            this.menuEl.style.top = top + 'px';
            this.menuEl.style.left = left + 'px';
            this.menuEl.style.display = '';
            this.menuEl.style.visibility = '';

            this.menuEl.classList.add('open');
        }

        _closeMenuNow() {
            if (this.menuEl) {
                this.menuEl.classList.remove('open');
                this.menuEl.style.display = '';
                this.menuEl.style.visibility = '';
            }
        }

        _buildMenu() {
            if (!this.menuEl) return;
            const hasSubs = this.subtitles.length > 0;
            const isGenerating = this.isGenerating;
            const isOn = this.subVisible;
            const translateLang = this.translateLang;

            this.menuEl.innerHTML = '';

            // ── SECTION 1: ON / OFF ───────────────────────────────────────────────
            const sec1 = this._menuSection('Subtitles');

            const itemOn = this._menuItem('▶ Enable', isOn && hasSubs, !hasSubs && !isGenerating, () => {
                if (!this.subVisible) { this.subVisible = true; this._startDisplay(); this._setBtnActive(true); }
                this._closeMenuNow();
            });
            const itemOff = this._menuItem('✕ Disable', !isOn, !hasSubs && !isGenerating, () => {
                if (this.subVisible) { this.subVisible = false; this._stopDisplay(); this._setBtnActive(false); this._clearOverlay(); }
                this._closeMenuNow();
            });
            sec1.appendChild(itemOn);
            sec1.appendChild(itemOff);
            this.menuEl.appendChild(sec1);

            // ── SECTION 2: GENERATE / PANEL ──────────────────────────────────────
            const sec2 = this._menuSection('Management');

            const genLabel = isGenerating ? '⏳ Generating...' : hasSubs ? '🔄 Regenerate transcription' : '🎙️ Generate subtitles';
            const itemGen = this._menuItem(genLabel, false, isGenerating, () => {
                this.subtitles = [];
                this.subtitlesTrans = [];
                this._transCache = {};
                this._closeMenuNow();
                this.generate();
            });

            const itemPanel = this._menuItem('📊 Show progress', false, !isGenerating, () => {
                this._closeMenuNow();
                this._openPanel();
            });

            sec2.appendChild(itemGen);
            if (isGenerating) sec2.appendChild(itemPanel);
            this.menuEl.appendChild(sec2);

            // ── SECTION 3: TRANSLATION ────────────────────────────────────────────
            if (hasSubs) {
                const sec3 = this._menuSection('Translate to');
                const list = document.createElement('div');
                list.className = 'myetv-autosub-translate-list';

                TRANSLATE_LANGS.forEach(lang => {
                    const isCurrent = translateLang === lang.code;
                    const item = this._menuItem(lang.label, isCurrent, false, () => {
                        this._setTranslationLang(lang.code);
                        this._closeMenuNow();
                    });
                    list.appendChild(item);
                });

                sec3.appendChild(list);
                this.menuEl.appendChild(sec3);
            }
        }

        _menuSection(label) {
            const sec = document.createElement('div');
            sec.className = 'myetv-autosub-menu-section';
            if (label) {
                const lbl = document.createElement('div');
                lbl.className = 'myetv-autosub-menu-label';
                lbl.textContent = label;
                sec.appendChild(lbl);
            }
            return sec;
        }

        _menuItem(label, isActive, isDisabled, onClick) {
            const item = document.createElement('div');
            item.className = 'myetv-autosub-menu-item' +
                (isActive ? ' active' : '') +
                (isDisabled ? ' disabled' : '');

            const labelEl = document.createElement('span');
            labelEl.textContent = label;

            const check = document.createElement('span');
            check.className = 'myetv-autosub-menu-check';
            check.textContent = isActive ? '✓' : '';

            item.appendChild(labelEl);
            item.appendChild(check);
            if (!isDisabled) item.addEventListener('click', onClick);
            return item;
        }

        _updateMenu() {
            if (this.menuEl && this.menuEl.classList.contains('open')) this._buildMenu();
        }

        _setBtnGenerating(on) {
            if (!this.btnEl) return;
            this.btnEl.classList.toggle('generating', on);
            this.btnEl.innerHTML = on ? ICON_LOADING : ICON_CC;
        }

        _setBtnActive(on) {
            if (!this.btnEl) return;
            this.btnEl.classList.toggle('active-sub', on);
            this.btnEl.innerHTML = ICON_CC;
        }

        // ─────────────────────────────────────────────────────────────────────────
        // PRIVATE — TRANSLATION (MyMemory API — free, no key required)
        // ─────────────────────────────────────────────────────────────────────────

        async _setTranslationLang(langCode) {
            this.translateLang = langCode;

            if (langCode === 'off') {
                this.subtitlesTrans = [];
                if (this.player.options.debug) console.log('[AutoSub] Translation disabled');
                return;
            }

            // Already cached in memory?
            if (this._transCache[langCode]) {
                this.subtitlesTrans = this._transCache[langCode];
                if (this.player.options.debug) console.log('[AutoSub] Translation cache hit:', langCode);
                return;
            }

            if (this.player.options.debug) console.log('[AutoSub] Translating to', langCode, '...');
            this._setBtnGenerating(true);

            try {
                // Batch segments to minimize API requests (max ~400 chars per request)
                const translated = await this._translateBatch(this.subtitles, langCode);
                this.subtitlesTrans = translated;
                this._transCache[langCode] = translated;
                if (this.player.options.debug) console.log('[AutoSub] Translation done:', translated.length, 'segments');
            } catch (err) {
                if (this.player.options.debug) console.warn('[AutoSub] Translation error:', err.message);
                this.translateLang = 'off';
                this.subtitlesTrans = [];
            } finally {
                this._setBtnGenerating(false);
            }
        }

        async _translateBatch(segments, targetLang) {
            const BATCH_CHARS = 400;
            const SEP = '\n||||\n';

            // ── Detect source language ────────────────────────────────────────────
            // 1. Use the language set in plugin options (if provided)
            // 2. Otherwise try to detect it from the first segment via MyMemory
            // 3. Absolute fallback: 'en'
            let sourceLang = null;

            if (this.opts.language) {
                // Normalize: 'italian' → 'it', 'it' → 'it'
                const lower = this.opts.language.toLowerCase().trim();
                // Reverse lookup in LANGUAGE_MAP (value → key)
                const found = Object.entries(LANGUAGE_MAP).find(([k, v]) => k === lower || v === lower);
                sourceLang = found ? found[0] : lower.slice(0, 2); // fallback: first 2 chars
            }

            if (!sourceLang && segments.length > 0) {
                // Try to detect language from the first segment via MyMemory
                try {
                    const sample = segments[0].text.slice(0, 100);
                    const detectUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sample)}&langpair=en|en`;
                    const resp = await fetch(detectUrl);
                    const json = await resp.json();
                    // MyMemory returns the detected language in responseData
                    const detected = json.responseData?.detectedLanguage;
                    if (detected && /^[a-z]{2}(-[A-Z]{2})?$/.test(detected)) {
                        sourceLang = detected.slice(0, 2);
                    }
                } catch (_) { }
            }

            if (!sourceLang) sourceLang = 'en'; // absolute fallback

            // Skip translation if source and target language are the same
            if (sourceLang === targetLang) {
                if (this.player.options.debug)
                    console.log('[AutoSub] Source === target lang, skipping translation');
                return segments.map(s => ({ ...s }));
            }

            if (this.player.options.debug)
                console.log('[AutoSub] Translating', sourceLang, '→', targetLang);

            // ── Batching ──────────────────────────────────────────────────────────
            const batches = [];
            let current = [];
            let charCount = 0;

            for (const seg of segments) {
                if (charCount + seg.text.length > BATCH_CHARS && current.length > 0) {
                    batches.push(current);
                    current = [];
                    charCount = 0;
                }
                current.push(seg);
                charCount += seg.text.length;
            }
            if (current.length > 0) batches.push(current);

            const result = [];
            for (const batch of batches) {
                const sourceText = batch.map(s => s.text).join(SEP);
                const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${sourceLang}|${targetLang}`;
                try {
                    const resp = await fetch(url);
                    const json = await resp.json();

                    // Handle explicit API errors
                    if (json.responseStatus && json.responseStatus !== 200) {
                        if (this.player.options.debug) console.warn('[AutoSub] MyMemory API error:', json.responseDetails || json.responseStatus);
                        batch.forEach(seg => result.push({ ...seg }));
                        continue;
                    }

                    const translated = json.responseData?.translatedText || sourceText;
                    const parts = translated.split('||||').map(s => s.trim().replace(/^\n+|\n+$/g, ''));
                    batch.forEach((seg, i) => {
                        result.push({ start: seg.start, end: seg.end, text: parts[i] || seg.text });
                    });
                    await new Promise(r => setTimeout(r, 120)); // rate-limit delay between batches
                } catch (_) {
                    batch.forEach(seg => result.push({ ...seg })); // fallback: keep original text
                }
            }
            return result;
        }

        // ─────────────────────────────────────────────────────────────────────────
        // PRIVATE — DISPLAY
        // ─────────────────────────────────────────────────────────────────────────

        _startDisplay() {
            this._stopDisplay();
            this.updateInterval = setInterval(() => this._tick(), 80);
        }

        _stopDisplay() {
            if (this.updateInterval) { clearInterval(this.updateInterval); this.updateInterval = null; }
        }

        _clearOverlay() {
            this.overlayEl.classList.add('hidden');
            this.overlayText.textContent = '';
        }

        _tick() {
            if (!this.subVisible) return;

            // Use translated segments if available, otherwise fall back to originals
            const pool = (this.translateLang !== 'off' && this.subtitlesTrans.length > 0)
                ? this.subtitlesTrans
                : this.subtitles;

            if (pool.length === 0) return;

            const t = this.video.currentTime;
            const cur = pool.find(s => t >= s.start && t < s.end);
            if (cur) {
                this.overlayText.textContent = cur.text;
                this.overlayEl.classList.remove('hidden');
            } else {
                this.overlayText.textContent = '';
                this.overlayEl.classList.add('hidden');
            }
        }

        // ─────────────────────────────────────────────────────────────────────────
        // PRIVATE — BUNDLE FETCH
        // ─────────────────────────────────────────────────────────────────────────

        async _ensureBundle() {
            if (_transformersBundleText) return;
            const resp = await fetch(TRANSFORMERS_CDN_ESM, { mode: 'cors', credentials: 'omit' });
            if (!resp.ok) throw new Error(`Cannot fetch Transformers.js bundle: HTTP ${resp.status}`);
            _transformersBundleText = await resp.text();
            if (this.player.options.debug)
                console.log('[AutoSub] Bundle fetched, size:', (_transformersBundleText.length / 1024).toFixed(0), 'KB');
        }

        // ─────────────────────────────────────────────────────────────────────────
        // PRIVATE — AUDIO EXTRACTION
        // ─────────────────────────────────────────────────────────────────────────

        _resolveMpdUrl() {
            try {
                // Salvato sul container dal player al momento di initialize()
                const url = this.container.dataset.mpdUrl || this.video.dataset.mpdUrl || null;
                if (url && !url.startsWith('blob:')) return url;
            } catch (_) { }

            try {
                const src = this.player.options?.src || '';
                if (src && !src.startsWith('blob:') && src.includes('.mpd')) return src;
            } catch (_) { }

            try {
                const src = this.video.currentSrc || this.video.src || '';
                if (src && !src.startsWith('blob:') && src.includes('.mpd')) return src;
            } catch (_) { }

            return null;
        }

        async _extractAudio() {
            if (this._captureTimer) { clearTimeout(this._captureTimer); this._captureTimer = null; }
            if (this._captureProgressInterval) { clearInterval(this._captureProgressInterval); this._captureProgressInterval = null; }

            if (this.player.options.debug)
                console.log('[AutoSub] _extractAudio — currentSrc:', this.video.currentSrc, '| adaptiveStreamingType:', this.player.adaptiveStreamingType);

            // ── DASH: resolve real MPD URL via dash.js instance ───────────────────
            const mpdUrl = this._resolveMpdUrl();
            if (mpdUrl) {
                if (this.player.options.debug) console.log('[AutoSub] DASH mode — mpdUrl:', mpdUrl);
                try { return await this._extractAudioFromDash(mpdUrl); }
                catch (err) {
                    if (this.player.options.debug) console.warn('[AutoSub] DASH extraction failed:', err.message, '— fallback to captureStream');
                    return await this._extractAudioFromCaptureStream();
                }
            }

            // ── HLS ───────────────────────────────────────────────────────────────
            const src = this.video.currentSrc || this.video.src || '';
            if (src.includes('.m3u8') || this.player.adaptiveStreamingType === 'hls') {
                return await this._extractAudioFromCaptureStream();
            }

            // ── Normal MP4 / WebM — direct fetch ─────────────────────────────────
            try { return await this._extractAudioFromFetch(); }
            catch (err) {
                if (this.player.options.debug) console.warn('[AutoSub] Fetch strategy failed:', err.message, '— fallback to captureStream');
                return await this._extractAudioFromCaptureStream();
            }
        }

        async _extractAudioFromDash(mpdUrl) {
            this._updatePanel('Fetching DASH manifest...', 8);

            const resp = await fetch(mpdUrl, { mode: 'cors', credentials: 'omit' });
            if (!resp.ok) throw new Error(`MPD fetch failed: HTTP ${resp.status}`);
            const mpdText = await resp.text();

            const parser = new DOMParser();
            const mpdDoc = parser.parseFromString(mpdText, 'application/xml');

            // Check for XML parse errors
            const parseErr = mpdDoc.querySelector('parsererror');
            if (parseErr) throw new Error('MPD XML parse error: ' + parseErr.textContent.slice(0, 100));

            const baseUrl = mpdUrl.substring(0, mpdUrl.lastIndexOf('/') + 1);

            const audioSet = this._findAudioAdaptationSet(mpdDoc);
            if (!audioSet) throw new Error('No audio AdaptationSet found in MPD');

            const representation = this._findLowestBitrateRepresentation(audioSet);
            if (!representation) throw new Error('No audio Representation found');

            const segmentUrls = this._buildSegmentUrlList(mpdDoc, audioSet, representation, baseUrl);
            if (segmentUrls.length === 0) throw new Error('No audio segments found in MPD');

            if (this.player.options.debug)
                console.log('[AutoSub] DASH audio segments:', segmentUrls.length, 'first:', segmentUrls[0]);

            this._updatePanel('Downloading audio segments (0/' + segmentUrls.length + ')...', 12);

            // Download segments in parallel batches of 5
            const BATCH = 5;
            const segmentBuffers = new Array(segmentUrls.length);

            for (let i = 0; i < segmentUrls.length; i += BATCH) {
                const batchUrls = segmentUrls.slice(i, i + BATCH);
                const results = await Promise.all(
                    batchUrls.map(url =>
                        fetch(url, { mode: 'cors', credentials: 'omit' })
                            .then(r => r.ok ? r.arrayBuffer() : Promise.reject(new Error(`HTTP ${r.status} for ${url}`)))
                    )
                );
                results.forEach((buf, j) => { segmentBuffers[i + j] = buf; });
                const pct = 12 + Math.round(((i + BATCH) / segmentUrls.length) * 16);
                this._updatePanel(
                    'Downloading audio segments (' + Math.min(i + BATCH, segmentUrls.length) + '/' + segmentUrls.length + ')...',
                    Math.min(28, pct)
                );
            }

            // Concatenate all segment buffers into one
            this._updatePanel('Decoding audio...', 30);
            const totalBytes = segmentBuffers.reduce((s, b) => s + b.byteLength, 0);
            const combined = new Uint8Array(totalBytes);
            let offset = 0;
            for (const buf of segmentBuffers) {
                combined.set(new Uint8Array(buf), offset);
                offset += buf.byteLength;
            }

            const nativeCtx = new (window.AudioContext || window.webkitAudioContext)();
            let nativeBuf;
            try {
                nativeBuf = await nativeCtx.decodeAudioData(combined.buffer);
            } catch (e) {
                nativeCtx.close();
                throw new Error('Audio decode failed: ' + e.message);
            }
            nativeCtx.close();

            if (nativeBuf.sampleRate === 16000)
                return Float32Array.from(nativeBuf.getChannelData(0));

            this._updatePanel('Resampling audio to 16kHz...', 34);
            const totalSamples = Math.ceil(nativeBuf.duration * 16000);
            const offlineCtx = new OfflineAudioContext(1, totalSamples, 16000);
            const source = offlineCtx.createBufferSource();
            source.buffer = nativeBuf;
            source.connect(offlineCtx.destination);
            source.start(0);
            const resampled = await offlineCtx.startRendering();
            return Float32Array.from(resampled.getChannelData(0));
        }

        _findAudioAdaptationSet(mpdDoc) {
            const sets = Array.from(mpdDoc.querySelectorAll('AdaptationSet'));
            // Prefer explicit audio contentType or mimeType
            return sets.find(s =>
                s.getAttribute('contentType') === 'audio' ||
                (s.getAttribute('mimeType') || '').startsWith('audio') ||
                s.querySelector('Representation[mimeType^="audio"]') !== null
            ) || sets.find(s =>
                // Fallback: AdaptationSet that is not video
                !(s.getAttribute('mimeType') || '').startsWith('video') &&
                s.getAttribute('contentType') !== 'video'
            );
        }

        _findLowestBitrateRepresentation(adaptationSet) {
            const reps = Array.from(adaptationSet.querySelectorAll('Representation'));
            if (reps.length === 0) return null;
            return reps.reduce((best, r) => {
                const bw = parseInt(r.getAttribute('bandwidth') || '999999999', 10);
                const bestBw = parseInt(best.getAttribute('bandwidth') || '999999999', 10);
                return bw < bestBw ? r : best;
            }, reps[0]);
        }

        _buildSegmentUrlList(mpdDoc, adaptationSet, representation, baseUrl) {
            const urls = [];

            // ── SegmentList ──────────────────────────────────────────────────────
            const segList = representation.querySelector('SegmentList')
                || adaptationSet.querySelector('SegmentList');
            if (segList) {
                const init = segList.querySelector('Initialization');
                if (init) {
                    const src = init.getAttribute('sourceURL') || init.getAttribute('range');
                    if (src && !src.includes('range=')) urls.push(this._resolveUrl(src, baseUrl));
                }
                segList.querySelectorAll('SegmentURL').forEach(s => {
                    const media = s.getAttribute('media');
                    if (media) urls.push(this._resolveUrl(media, baseUrl));
                });
                return urls;
            }

            // ── SegmentTemplate ──────────────────────────────────────────────────
            const segTpl = representation.querySelector('SegmentTemplate')
                || adaptationSet.querySelector('SegmentTemplate');
            if (segTpl) {
                const media = segTpl.getAttribute('media') || '';
                const init = segTpl.getAttribute('initialization') || '';
                const startNum = parseInt(segTpl.getAttribute('startNumber') || '1', 10);
                const timescale = parseInt(segTpl.getAttribute('timescale') || '1', 10);
                const duration = parseInt(segTpl.getAttribute('duration') || '0', 10);
                const repId = representation.getAttribute('id') || '';
                const bandwidth = representation.getAttribute('bandwidth') || '';

                const mpdRoot = mpdDoc.querySelector('MPD');
                const totalDur = this._parseDuration(mpdRoot?.getAttribute('mediaPresentationDuration') || 'PT0S');
                const segDurSec = duration / timescale;
                const segCount = segDurSec > 0 ? Math.ceil(totalDur / segDurSec) : 0;

                if (init) {
                    const initUrl = init
                        .replace('$RepresentationID$', repId)
                        .replace('$Bandwidth$', bandwidth);
                    urls.push(this._resolveUrl(initUrl, baseUrl));
                }

                for (let i = 0; i < segCount; i++) {
                    const segUrl = media
                        .replace('$RepresentationID$', repId)
                        .replace('$Bandwidth$', bandwidth)
                        .replace('$Number$', String(startNum + i))
                        .replace(/\$Number%(\d+)d\$/, (_, w) => String(startNum + i).padStart(parseInt(w), '0'));
                    urls.push(this._resolveUrl(segUrl, baseUrl));
                }
                return urls;
            }

            // ── BaseURL (single audio file) ───────────────────────────────────────
            const baseURLEl = representation.querySelector('BaseURL')
                || adaptationSet.querySelector('BaseURL');
            if (baseURLEl) {
                urls.push(this._resolveUrl(baseURLEl.textContent.trim(), baseUrl));
            }

            return urls;
        }

        _resolveUrl(url, baseUrl) {
            if (!url) return '';
            if (url.startsWith('http://') || url.startsWith('https://')) return url;
            if (url.startsWith('/')) return new URL(url, baseUrl).href;
            return baseUrl + url;
        }

        _parseDuration(iso) {
            // Parse ISO 8601 duration: PT1H2M3.5S
            const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:([\d.]+)S)?/);
            if (!m) return 0;
            return (parseFloat(m[1] || 0) * 3600) +
                (parseFloat(m[2] || 0) * 60) +
                parseFloat(m[3] || 0);
        }

        async _extractAudioFromFetch() {
            const src = this.video.currentSrc || this.video.src;
            if (!src || src === window.location.href) throw new Error('No valid video src');
            this._updatePanel('Downloading audio...', 8);
            const resp = await fetch(src, { mode: 'cors', credentials: 'omit' });
            if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
            const ct = resp.headers.get('content-type') || '';
            if (!ct.includes('video') && !ct.includes('audio') && !ct.includes('octet-stream'))
                throw new Error(`Unexpected content-type: ${ct}`);
            const arrayBuffer = await resp.arrayBuffer();
            this._updatePanel('Decoding audio...', 18);
            const nativeCtx = new (window.AudioContext || window.webkitAudioContext)();
            const nativeBuffer = await nativeCtx.decodeAudioData(arrayBuffer);
            nativeCtx.close();
            if (nativeBuffer.sampleRate === 16000) return Float32Array.from(nativeBuffer.getChannelData(0));
            this._updatePanel('Resampling audio to 16kHz...', 26);
            const totalSamples = Math.ceil(nativeBuffer.duration * 16000);
            const offlineCtx = new OfflineAudioContext(1, totalSamples, 16000);
            const source = offlineCtx.createBufferSource();
            source.buffer = nativeBuffer;
            source.connect(offlineCtx.destination);
            source.start(0);
            const resampled = await offlineCtx.startRendering();
            return Float32Array.from(resampled.getChannelData(0));
        }

        async _extractAudioFromCaptureStream() {
            return new Promise((resolve, reject) => {
                this._updatePanel('Starting audio capture...', 8);

                let stream;
                try {
                    stream = this.video.captureStream?.() ?? this.video.mozCaptureStream?.() ?? null;
                } catch (err) { reject(new Error('captureStream() failed: ' + err.message)); return; }
                if (!stream) { reject(new Error('captureStream() not supported')); return; }

                const audioTracks = stream.getAudioTracks();
                if (audioTracks.length === 0) { reject(new Error('No audio track found')); return; }

                const CHUNK_SEC = 30;
                const audioOnlyStream = new MediaStream(audioTracks);
                const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                    ? 'audio/webm;codecs=opus' : '';
                const recorder = new MediaRecorder(audioOnlyStream, mimeType ? { mimeType } : {});

                const chunkQueue = [];
                let stopped = false;
                let timeOffset = 0;

                const stop = () => {
                    if (stopped) return;
                    stopped = true;
                    if (this._captureProgressInterval) {
                        clearInterval(this._captureProgressInterval);
                        this._captureProgressInterval = null;
                    }
                    if (recorder.state !== 'inactive') recorder.stop();
                };

                this._onAudioChunkReady = null;
                this._onCaptureStop = null;

                recorder.ondataavailable = async (e) => {
                    if (e.data.size === 0) return;
                    chunkQueue.push(e.data);

                    // Estimate accumulated seconds using rough bitrate of 16 kbps (opus)
                    const totalSize = chunkQueue.reduce((s, b) => s + b.size, 0);
                    const estimatedSec = totalSize / (16000 / 8);

                    if (estimatedSec >= CHUNK_SEC && this._onAudioChunkReady) {
                        const blob = new Blob([...chunkQueue], { type: recorder.mimeType || 'audio/webm' });
                        chunkQueue.length = 0;
                        const offset = timeOffset;
                        timeOffset += CHUNK_SEC;
                        this._onAudioChunkReady(blob, offset, false);
                    }
                };

                recorder.onstop = async () => {
                    // Flush any remaining audio as the last chunk
                    if (chunkQueue.length > 0 && this._onAudioChunkReady) {
                        const blob = new Blob([...chunkQueue], { type: recorder.mimeType || 'audio/webm' });
                        chunkQueue.length = 0;
                        this._onAudioChunkReady(blob, timeOffset, true);
                    } else if (this._onCaptureStop) {
                        this._onCaptureStop();
                    }
                };

                recorder.onerror = e => reject(e.error || new Error('MediaRecorder error'));

                // Update capture progress based on video currentTime
                const duration = isFinite(this.video.duration) && this.video.duration > 0
                    ? this.video.duration : null;

                if (duration) {
                    const captureStart = this.video.currentTime;
                    this._captureProgressInterval = setInterval(() => {
                        const elapsed = this.video.currentTime - captureStart;
                        const pct = Math.min(30, 8 + Math.round((elapsed / duration) * 22));
                        this._updatePanel(
                            `Capturing audio... ${Math.round((elapsed / duration) * 100)}%`, pct
                        );
                        if (elapsed >= duration - 0.5) {
                            clearInterval(this._captureProgressInterval);
                            this._captureProgressInterval = null;
                            stop();
                        }
                    }, 500);

                    this._captureTimer = setTimeout(stop, (duration + 3) * 1000);
                }

                this.video.addEventListener('ended', stop, { once: true });

                // Slice every 2s so ondataavailable fires frequently
                recorder.start(2000);

                // Resolve immediately with sentinel — actual transcription flows via callbacks
                resolve({ _captureMode: true, stop });
            });
        }

        // ─────────────────────────────────────────────────────────────────────────
        // PRIVATE — WORKER (ESM bundle fetched in main thread → blob with correct MIME)
        // ─────────────────────────────────────────────────────────────────────────

        _createTranscriberWorker() {
            const bundleBlob = new Blob([_transformersBundleText], { type: 'application/javascript' });
            const bundleURL = URL.createObjectURL(bundleBlob);

            const workerSrc = `
const BUNDLE_URL = '${bundleURL}';
const WASM_DIR   = '${TRANSFORMERS_WASM_DIR}';

async function init(modelId) {
  const mod      = await import(BUNDLE_URL);
  const pipeline = mod.pipeline;
  const env      = mod.env;
  env.allowLocalModels = false;
  env.useBrowserCache  = true;
  if (!env.backends)           env.backends      = {};
  if (!env.backends.onnx)      env.backends.onnx = {};
  if (!env.backends.onnx.wasm) env.backends.onnx.wasm = {};
  env.backends.onnx.wasm.wasmPaths  = WASM_DIR;
  env.backends.onnx.wasm.numThreads = 1;
  env.backends.onnx.wasm.proxy      = false;
  return await pipeline('automatic-speech-recognition', modelId, {
    dtype: 'q8', device: 'wasm',
    progress_callback: (prog) => {
      if (prog.status === 'downloading') self.postMessage({ type: 'progress', payload: prog });
    }
  });
}

let transcriber = null;
self.onmessage = async function(e) {
  const { type, payload } = e.data;
  if (type === 'init') {
    try {
      transcriber = await init(payload.modelId);
      self.postMessage({ type: 'ready' });
    } catch(err) {
      self.postMessage({ type: 'error', payload: err.message || String(err) });
    }
  }
  if (type === 'transcribe') {
    try {
      const audio  = new Float32Array(payload.audio);
      const opts   = { return_timestamps: true, task: 'transcribe', chunk_length_s: payload.chunkSec };
      if (payload.lang) opts.language = payload.lang;
      const result = await transcriber(audio, opts);
      self.postMessage({ type: 'chunk_done', payload: {
        result, timeOffset: payload.timeOffset,
        chunkIndex: payload.chunkIndex, totalChunks: payload.totalChunks,
        isLast: payload.isLast
      }});
    } catch(err) {
      self.postMessage({ type: 'error', payload: err.message || String(err) });
    }
  }
};
      `;

            const workerBlob = new Blob([workerSrc], { type: 'application/javascript' });
            const workerURL = URL.createObjectURL(workerBlob);
            const worker = new Worker(workerURL, { type: 'module' });
            worker._bundleURL = bundleURL;
            worker._workerURL = workerURL;
            return worker;
        }

        _sendChunk(worker, float32Audio, index, chunkSize, totalChunks, lang, chunkSec) {
            const offset = index * chunkSize;
            const chunk = float32Audio.slice(offset, offset + chunkSize);
            worker.postMessage(
                {
                    type: 'transcribe', payload: {
                        audio: chunk.buffer, timeOffset: index * chunkSec,
                        chunkIndex: index, totalChunks, lang, chunkSec
                    }
                },
                [chunk.buffer]
            );
        }

        async _transcribeChunksStreaming(audioData) {

            // ── CAPTURE STREAM MODE (HLS or DASH fallback) ───────────────────────
            if (audioData?._captureMode) {
                const SAMPLE_RATE = 16000;
                const lang = this._resolveLanguage(this.opts.language);
                const modelId = WHISPER_MODELS[this.opts.modelSize] || WHISPER_MODELS.base;

                if (!this.subVisible) { this.subVisible = true; this._startDisplay(); }

                // Worker starts in parallel while audio is still being captured
                const worker = this._createTranscriberWorker();
                this._worker = worker;

                let workerReady = false;
                let pendingChunks = [];
                let activeJob = false;
                let jobQueue = [];
                let resolveAll, rejectAll;

                const promise = new Promise((res, rej) => { resolveAll = res; rejectAll = rej; });

                const decodeAndTranscribe = async (blob, offset, isLast) => {
                    try {
                        const arrayBuffer = await blob.arrayBuffer();
                        const nativeCtx = new (window.AudioContext || window.webkitAudioContext)();
                        const nativeBuf = await nativeCtx.decodeAudioData(arrayBuffer);
                        nativeCtx.close();

                        let float32;
                        if (nativeBuf.sampleRate === SAMPLE_RATE) {
                            float32 = Float32Array.from(nativeBuf.getChannelData(0));
                        } else {
                            const totalSamples = Math.ceil(nativeBuf.duration * SAMPLE_RATE);
                            const offCtx = new OfflineAudioContext(1, totalSamples, SAMPLE_RATE);
                            const src = offCtx.createBufferSource();
                            src.buffer = nativeBuf;
                            src.connect(offCtx.destination);
                            src.start(0);
                            const resampled = await offCtx.startRendering();
                            float32 = Float32Array.from(resampled.getChannelData(0));
                        }

                        worker.postMessage(
                            {
                                type: 'transcribe', payload: {
                                    audio: float32.buffer, timeOffset: offset,
                                    chunkIndex: 0, totalChunks: 1,
                                    lang, chunkSec: nativeBuf.duration, isLast
                                }
                            },
                            [float32.buffer]
                        );
                    } catch (err) {
                        if (this.player.options.debug) console.warn('[AutoSub] Decode error for capture chunk:', err.message);
                        if (isLast) resolveAll();
                        else { activeJob = false; processNext(); }
                    }
                };

                const processNext = () => {
                    if (activeJob || jobQueue.length === 0) return;
                    activeJob = true;
                    const job = jobQueue.shift();
                    decodeAndTranscribe(job.blob, job.offset, job.isLast);
                };

                worker.onerror = e => {
                    worker.terminate(); this._worker = null;
                    rejectAll(new Error('Worker error: ' + (e.message || String(e))));
                };

                worker.onmessage = ({ data }) => {
                    const { type, payload } = data;

                    if (type === 'progress' && payload.total) {
                        const pct = Math.round((payload.loaded / payload.total) * 15);
                        this._updatePanel('Downloading model: ' + (payload.file || ''), 35 + pct);
                    }

                    if (type === 'ready') {
                        URL.revokeObjectURL(worker._bundleURL);
                        URL.revokeObjectURL(worker._workerURL);
                        workerReady = true;
                        this._updatePanel('Worker ready — waiting for audio chunks...', 55);
                        pendingChunks.forEach(j => jobQueue.push(j));
                        pendingChunks = [];
                        processNext();
                    }

                    if (type === 'chunk_done') {
                        const { result, timeOffset, isLast } = payload;
                        const rawChunks = (result.chunks || []).map(c => {
                            const ts0 = c.timestamp?.[0] ?? 0;
                            const ts1 = c.timestamp?.[1] ?? ts0 + 3;
                            return { text: (c.text || '').trim(), start: ts0 + timeOffset, end: ts1 + timeOffset };
                        });
                        this.subtitles.push(...this._normalizeChunks(rawChunks));
                        if (this.opts.cacheEnabled) this._saveToCache(this.subtitles);

                        activeJob = false;

                        if (isLast) {
                            worker.terminate(); this._worker = null;
                            resolveAll();
                        } else {
                            processNext();
                        }
                    }

                    if (type === 'error') {
                        URL.revokeObjectURL(worker._bundleURL);
                        URL.revokeObjectURL(worker._workerURL);
                        worker.terminate(); this._worker = null;
                        rejectAll(new Error(payload));
                    }
                };

                this._onAudioChunkReady = (blob, offset, isLast) => {
                    const job = { blob, offset, isLast };
                    if (!workerReady) pendingChunks.push(job);
                    else { jobQueue.push(job); processNext(); }
                };

                this._onCaptureStop = () => resolveAll();

                worker.postMessage({ type: 'init', payload: { modelId } });

                return promise;
            }

            // ── NORMAL MODE (Float32Array from fetch or DASH segment download) ────
            const float32Audio = audioData;
            const SAMPLE_RATE = 16000;
            const CHUNK_SEC = 30;
            const chunkSize = SAMPLE_RATE * CHUNK_SEC;
            const totalChunks = Math.ceil(float32Audio.length / chunkSize);
            const lang = this._resolveLanguage(this.opts.language);
            const modelId = WHISPER_MODELS[this.opts.modelSize] || WHISPER_MODELS.base;

            if (!this.subVisible) { this.subVisible = true; this._startDisplay(); }

            const worker = this._createTranscriberWorker();
            this._worker = worker;

            return new Promise((resolve, reject) => {
                worker.onerror = e => {
                    URL.revokeObjectURL(worker._bundleURL);
                    URL.revokeObjectURL(worker._workerURL);
                    worker.terminate(); this._worker = null;
                    reject(new Error('Worker error: ' + (e.message || String(e))));
                };

                worker.onmessage = ({ data }) => {
                    const { type, payload } = data;

                    if (type === 'progress' && payload.total) {
                        const pct = Math.round((payload.loaded / payload.total) * 22);
                        this._updatePanel('Downloading model: ' + (payload.file || ''), 40 + pct);
                    }

                    if (type === 'ready') {
                        URL.revokeObjectURL(worker._bundleURL);
                        URL.revokeObjectURL(worker._workerURL);
                        this._updatePanel('Transcribing chunk 1 of ' + totalChunks + '...', 64);
                        this._sendChunk(worker, float32Audio, 0, chunkSize, totalChunks, lang, CHUNK_SEC);
                    }

                    if (type === 'chunk_done') {
                        const { result, timeOffset, chunkIndex } = payload;
                        const rawChunks = (result.chunks || []).map(c => {
                            const ts0 = c.timestamp?.[0] ?? 0;
                            const ts1 = c.timestamp?.[1] ?? ts0 + 3;
                            return { text: (c.text || '').trim(), start: ts0 + timeOffset, end: ts1 + timeOffset };
                        });
                        this.subtitles.push(...this._normalizeChunks(rawChunks));
                        if (this.opts.cacheEnabled) this._saveToCache(this.subtitles);

                        const next = chunkIndex + 1;
                        if (next < totalChunks) {
                            const pct = 64 + Math.round((next / totalChunks) * 33);
                            this._updatePanel('Transcribing chunk ' + (next + 1) + ' of ' + totalChunks + '...', pct);
                            this._sendChunk(worker, float32Audio, next, chunkSize, totalChunks, lang, CHUNK_SEC);
                        } else {
                            worker.terminate(); this._worker = null; resolve();
                        }
                    }

                    if (type === 'error') {
                        URL.revokeObjectURL(worker._bundleURL);
                        URL.revokeObjectURL(worker._workerURL);
                        worker.terminate(); this._worker = null;
                        reject(new Error(payload));
                    }
                };

                worker.postMessage({ type: 'init', payload: { modelId } });
            });
        }

        // ─────────────────────────────────────────────────────────────────────────
        // PRIVATE — TEXT
        // ─────────────────────────────────────────────────────────────────────────

        _resolveLanguage(lang) {
            if (!lang) return null;
            const lower = lang.toLowerCase().trim();
            return LANGUAGE_MAP[lower] || lower;
        }

        _normalizeChunks(chunks) {
            return chunks
                .filter(c => !this._isGarbage(c.text))
                .map((c, i, arr) => {
                    let end = c.end;
                    if (end <= c.start) end = c.start + Math.max(2, c.text.length * 0.065);
                    if (arr[i + 1] && end > arr[i + 1].start) end = arr[i + 1].start - 0.05;
                    return { start: c.start, end, text: c.text };
                });
        }

        _isGarbage(text) {
            if (!text || text.trim().length < 2) return true;
            const t = text.trim();
            if (/^[\W\d\s]+$/.test(t)) return true;
            if (t.length > 4 && (t.match(/[aeiouàèéìòùáéíóúäëïöü]/gi) || []).length === 0) return true;
            if (t.length > 5 && /^(.)\1+$/.test(t.replace(/\s/g, ''))) return true;
            const junk = ['amara.org', 'www.', 'http', '[ _ ]', '[music]', '[silence]',
                '[applause]', '♪', 'subtitles by', 'captions by', 'transcript', 'transcribed by'];
            return junk.some(j => t.toLowerCase().includes(j));
        }

        // ─────────────────────────────────────────────────────────────────────────
        // PRIVATE — localStorage CACHE
        // ─────────────────────────────────────────────────────────────────────────

        _getCacheKey() {
            if (this.opts.idCache) {
                const safe = String(this.opts.idCache).replace(/[^a-zA-Z0-9_-]/g, '_');
                return CACHE_PREFIX + safe;
            }
            // Use the MPD URL or player.options.src as stable key — currentSrc may be a blob URL
            const src = this._resolveMpdUrl()
                || this.player.options?.src
                || this.video.currentSrc
                || this.video.src
                || '';
            try {
                const pathname = new URL(src).pathname;
                return CACHE_PREFIX + btoa(unescape(encodeURIComponent(pathname))).replace(/[=+/]/g, '');
            } catch (_) {
                let hash = 0;
                for (let i = 0; i < Math.min(src.length, 300); i++)
                    hash = ((hash << 5) - hash + src.charCodeAt(i)) | 0;
                return CACHE_PREFIX + Math.abs(hash).toString(36);
            }
        }

        _loadFromCache() {
            if (!this.opts.cacheEnabled) return null;
            try {
                const raw = localStorage.getItem(this._getCacheKey());
                if (!raw) return null;
                const parsed = JSON.parse(raw);
                if (!Array.isArray(parsed.subtitles) || !parsed.subtitles.length) return null;
                return parsed.subtitles;
            } catch (_) { return null; }
        }

        _saveToCache(subtitles) {
            if (!this.opts.cacheEnabled || !subtitles.length) return;
            try {
                const key = this._getCacheKey();
                const data = JSON.stringify({ subtitles, savedAt: Date.now() });
                try { localStorage.setItem(key, data); }
                catch (_) { this._evictOldestCache(); try { localStorage.setItem(key, data); } catch (_) { } }
            } catch (_) { }
        }

        _evictOldestCache() {
            try {
                const entries = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i);
                    if (k && k.startsWith(CACHE_PREFIX)) {
                        try { entries.push({ key: k, savedAt: JSON.parse(localStorage.getItem(k)).savedAt || 0 }); }
                        catch (_) { }
                    }
                }
                entries.sort((a, b) => a.savedAt - b.savedAt)
                    .slice(0, Math.max(1, entries.length - CACHE_MAX_ENTRIES + 1))
                    .forEach(e => localStorage.removeItem(e.key));
            } catch (_) { }
        }
    }

    // ─── Register ─────────────────────────────────────────────────────────────────
    const register = () => {
        if (typeof window.registerMYETVPlugin === 'function') {
            window.registerMYETVPlugin('autoSubtitles', AutoSubtitlesPlugin);
        } else {
            let attempts = 0;
            const retry = setInterval(() => {
                if (typeof window.registerMYETVPlugin === 'function') {
                    clearInterval(retry);
                    window.registerMYETVPlugin('autoSubtitles', AutoSubtitlesPlugin);
                } else if (++attempts > 100) {
                    clearInterval(retry);
                    if (!window.MYETVPlayerPlugins) window.MYETVPlayerPlugins = {};
                    window.MYETVPlayerPlugins['autoSubtitles'] = AutoSubtitlesPlugin;
                }
            }, 50);
        }
    };

    register();
})();