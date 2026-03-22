/*!
 * MYETV Radio Plugin v1.0
 * Themeable Radio Tuner for the MYETV Video Player Open Source
 * https://www.myetv.tv | https://oskarcosimo.com
 */
(function (global) {
    'use strict';

    // ============================================================
    // CSS STYLES
    // ============================================================
    var RADIO_CSS = [
        /* BASE STRUCTURE - Z-INDEX BOOSTED TO 9999 TO PREVENT PLAYER LOADER OVERLAP */
        '.myetv-radio-overlay{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;justify-content:center;align-items:center;z-index:2;font-family:"Courier New",monospace;padding:50px 16px;box-sizing:border-box;overflow:hidden;transition:background 0.5s, color 0.5s;}',
        '.myetv-radio-overlay::before{content:"";position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(to right,transparent,#b8860b 30%,#f0c040 50%,#b8860b 70%,transparent);}',

        /* THEME: VINTAGE (Analog Dial) */
        '.theme-vintage{background:linear-gradient(160deg,#0d0600 0%,#1f0e00 40%,#0d0600 100%);color:#f0c040;}',
        '.theme-vintage .radio-analog-dial{background:#050200;border:1px solid #3a2000;box-shadow:inset 0 3px 10px rgba(0,0,0,0.9);}',
        '.theme-vintage .radio-needle{background:linear-gradient(to bottom,#ff6600,#cc2200);box-shadow:0 0 8px rgba(255,80,0,0.7);}',
        '.theme-vintage .radio-tick{color:#5c3a00;}',
        '.theme-vintage .radio-tick.active{color:#f0c040;}',
        '.theme-vintage .radio-station-name{text-shadow:0 0 10px rgba(240,192,64,0.4);}',

        /* THEME: DIGITAL (Car Stereo LCD) */
        '.theme-digital{background:#050505 !important; color:#00d8ff !important;}',
        '.theme-digital::before{background:linear-gradient(to right,transparent,#005577 30%,#00d8ff 50%,#005577 70%,transparent) !important;}',
        '.theme-digital .radio-info-bar{display:none !important;}',
        '.theme-digital .radio-dial-label{display:none !important;}',
        '.theme-digital .radio-analog-dial{display:none !important;}',
        '.theme-digital .radio-digital-display{display:flex !important;}',
        '.theme-digital .radio-search-input, .theme-digital .radio-ch-input, .theme-digital .radio-search-btn{border-color:#005577 !important; color:#00d8ff !important; background:#00111a !important;}',
        '.theme-digital .radio-search-btn:hover{background:#003344 !important;}',
        '.theme-digital .radio-cb-btn{color:#00d8ff !important;}',
        '.theme-digital .radio-modal-box{background:#050505 !important; border: 1px solid #005577 !important; color:#00d8ff !important;}',
        '.theme-digital .radio-modal-header{border-bottom: 1px solid #003344 !important;}',
        '.theme-digital .radio-modal-search{border-bottom: 1px solid #003344 !important;}',
        '.theme-digital .radio-modal-item{border-bottom:1px solid #00111a !important;}',
        '.theme-digital .radio-modal-item:hover{background:#00111a !important;}',
        '.theme-digital .radio-modal-item.active{border-left-color:#00d8ff !important; background:rgba(0,216,255,0.1) !important; color:#ffffff !important;}',

        /* DIGITAL LCD DISPLAY STYLES */
        '.radio-digital-display{display:none; flex-direction:column; justify-content:space-between; background:#000000; border:2px solid #222222; border-radius:6px; padding:12px 16px; flex:1; box-shadow:inset 0 0 20px rgba(0,216,255,0.05), 0 5px 15px rgba(0,0,0,0.8); width:100%; box-sizing:border-box;}',
        '.digital-top{display:flex; justify-content:space-between; align-items:center; font-size:12px; font-weight:bold; color:#00d8ff; opacity:0.8;}',
        '.digital-status-wrap{display:flex; align-items:center; gap:8px;}',
        '.digital-status-dot{width:8px; height:8px; border-radius:50%; background:#333; transition:all 0.3s;}',
        '.digital-status-dot.playing{background:#00ff44; box-shadow:0 0 8px #00ff44;}',
        '.digital-status-dot.buffering{background:#ffaa00; box-shadow:0 0 8px #ffaa00; animation:radio-blink 0.5s infinite;}',
        '.digital-status-dot.error{background:#ff0000; box-shadow:0 0 8px #ff0000;}',
        '.digital-badge{background:#00d8ff; color:#000000; padding:2px 6px; border-radius:2px; font-size:10px; letter-spacing:1px;}',
        '.digital-main{font-size:28px; font-weight:bold; color:#00d8ff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-shadow:0 0 8px rgba(0,216,255,0.6); margin:0; padding:10px 0; text-align:center; font-family:"Courier New", monospace, sans-serif; letter-spacing:2px; text-transform:uppercase; flex:1; display:flex; align-items:center; justify-content:center; line-height:normal;}',
        '.digital-sub{display:flex; justify-content:space-between; align-items:center; font-size:11px; color:#00d8ff;}',
        '.digital-meta{opacity:0.7; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; max-width:60%;}',
        '.digital-controls-row{display:flex; gap:6px;}',
        '.digi-btn{background:transparent; border:1px solid #005577; color:#00d8ff; font-family:inherit; font-weight:bold; font-size:10px; padding:3px 8px; cursor:pointer; border-radius:3px; transition:all 0.2s;}',
        '.digi-btn:hover{background:rgba(0,216,255,0.15); border-color:#00d8ff;}',

        /* COMMON UI COMPONENTS */
        '.radio-info-bar{text-align:center;margin-bottom:12px;width:100%;max-width:520px;}',
        '.radio-channel-num{font-size:12px;color:#ff4400;letter-spacing:3px;margin-bottom:3px;text-transform:uppercase;}',
        '.radio-station-name{font-size:18px;font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
        '.radio-station-meta{font-size:11px;color:#7a5200;margin-top:3px;letter-spacing:1px;}',
        '.radio-favicon{width:18px;height:18px;border-radius:3px;vertical-align:middle;margin-right:6px;object-fit:contain;display:none;}',

        /* DIAL WRAPPER & CONTAINER */
        '.radio-dial-wrapper{width:100%;max-width:520px;position:relative;margin-bottom:10px; display:flex; flex-direction:column; flex:1; min-height:60px; max-height:100px;}',
        '.radio-analog-dial{position:relative;overflow:hidden;flex:1;min-height:50px;cursor:grab;border-radius:6px;transition:border-color 0.3s;}',
        '.radio-dial-label{display:flex;justify-content:space-between;font-size:10px;color:inherit;opacity:0.6;margin-bottom:4px;padding:0 2px;}',
        '.radio-analog-dial:active{cursor:grabbing;}',
        '.radio-analog-dial.loading-state{cursor:wait;}',
        '.radio-analog-dial.error-state{border-color:#ff0000 !important;}',

        /* HIGH DEFINITION SCALE */
        '.radio-scale{position:absolute;top:0;left:0;display:flex;align-items:flex-end;height:100%;will-change:transform;user-select:none;-webkit-user-select:none;}',
        '.radio-tick{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;width:20px;height:100%;flex-shrink:0;position:relative;}',
        '.radio-tick::after{content:"";position:absolute;bottom:0;width:1px;height:15%;background:currentColor;opacity:0.3;}',
        '.radio-tick.mid::after{height:25%;opacity:0.6;}',
        '.radio-tick.major::after{height:40%;opacity:1;width:2px;}',
        '.radio-tick-num{position:absolute;bottom:45%;font-size:9px;opacity:0.8;}',

        /* NEEDLE */
        '.radio-needle{position:absolute;left:50%;top:0;bottom:0;width:2px;transform:translateX(-50%);pointer-events:none;z-index:10;}',
        '.radio-needle::before{content:"▼";position:absolute;top:-1px;left:50%;transform:translateX(-50%);font-size:11px;}',

        /* SEARCH BAR */
        '.radio-search-bar{display:flex;gap:6px;width:100%;max-width:520px;margin-top:8px;}',
        '.radio-country-select{background:rgba(0,0,0,0.5);border:1px solid currentColor;border-radius:4px;color:inherit;font-family:inherit;font-size:12px;padding:5px;outline:none;opacity:0.8;transition:border-color 0.3s;cursor:pointer;text-transform:uppercase;max-width:70px;}',
        '.radio-country-select option{background:#000;color:#fff;}',
        '.theme-digital .radio-country-select{border-color:#005577 !important; color:#00d8ff !important; background:#00111a !important;}',
        '.radio-search-input{flex:1;background:rgba(0,0,0,0.5);border:1px solid currentColor;border-radius:4px;color:inherit;font-family:inherit;font-size:12px;padding:5px 9px;outline:none;opacity:0.8; transition:border-color 0.3s;}',
        '.radio-search-btn{background:rgba(255,255,255,0.1);border:1px solid currentColor;color:inherit;font-size:11px;padding:5px 10px;border-radius:4px;cursor:pointer;transition:background 0.2s;}',
        '.radio-search-btn:hover{background:rgba(255,255,255,0.2);}',

        /* FILTER PILLS */
        '.radio-filter-row{display:flex;gap:5px;flex-wrap:wrap;margin-top:6px;max-width:520px;width:100%;}',
        '.radio-filter-pill{background:rgba(0,0,0,0.5);border:1px solid currentColor;color:inherit;font-size:10px;padding:3px 8px;border-radius:12px;cursor:pointer;opacity:0.7;}',

        /* MODAL WINDOW */
        '.radio-modal-overlay{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.88);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:50px 0;box-sizing:border-box;backdrop-filter:blur(4px);}',
        '.radio-modal-box{width:100%;max-height:100%;background:#0d0600;display:flex;flex-direction:column;overflow:hidden;}',
        '.radio-modal-header{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.1);}',
        '.radio-modal-title{color:inherit;text-transform:uppercase;letter-spacing:2px;font-size:13px;}',
        '.radio-modal-close{background:none;border:1px solid currentColor;color:inherit;font-size:16px;width:28px;height:28px;border-radius:4px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;opacity:0.8;}',
        '.radio-modal-close:hover{opacity:1;}',
        '.radio-modal-search{padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.05);flex-shrink:0;}',
        '.radio-modal-search input{width:100%;background:rgba(0,0,0,0.5);border:1px solid currentColor;border-radius:4px;color:inherit;font-family:inherit;font-size:12px;padding:6px 10px;outline:none;box-sizing:border-box;opacity:0.8;}',
        '.radio-modal-list{flex:1;overflow-y:auto;padding:4px 0;scrollbar-width:thin;}',
        '.radio-modal-item{display:flex;align-items:center;gap:10px;padding:10px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.05); transition:background 0.2s;}',
        '.radio-modal-item:hover{background:rgba(255,255,255,0.05);}',
        '.radio-modal-item.active{border-left:3px solid currentColor;background:rgba(255,255,255,0.1);}',
        '.radio-modal-ch{font-size:11px;min-width:38px;opacity:0.6;}',
        '.radio-modal-fav{width:16px;height:16px;border-radius:2px;object-fit:contain;flex-shrink:0;display:none;}',
        '.radio-modal-name{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;}',
        '.radio-modal-cc{font-size:10px;opacity:0.6;flex-shrink:0;}',
        '.radio-modal-count{font-size:10px;padding:6px 14px;opacity:0.6;flex-shrink:0;}',

        /* STATUS DOT */
        '.radio-status{display:inline-block;width:8px;height:8px;border-radius:50%;background:#333;margin-right:8px;vertical-align:middle; transition:all 0.3s;}',
        '.radio-status.playing{background:#00ff44;box-shadow:0 0 8px #00ff44;animation:radio-blink 2s infinite;}',
        '.radio-status.buffering{background:#ffaa00;box-shadow:0 0 8px #ffaa00;animation:radio-blink 0.5s infinite;}',
        '.radio-status.error{background:#ff0000;box-shadow:0 0 8px #ff0000;}',
        '@keyframes radio-blink{0%,100%{opacity:1;}50%{opacity:0.4;}}',

        /* CONTROL BAR EXTENSION - ZERO HEIGHT HACK */
        '.radio-controls-center{display:flex !important; align-items:center !important; justify-content:center !important; gap:16px !important; flex:1 !important; height:0px !important; overflow:visible !important; margin:0 !important; padding:0 !important;}',
        '.radio-cb-btn{appearance:none; background:transparent !important; border:none !important; color:#ffffff !important; cursor:pointer !important; display:flex !important; align-items:center !important; justify-content:center !important; gap:5px !important; font-size:11px !important; font-family:"Courier New",monospace !important; font-weight:bold !important; opacity:0.8 !important; padding:0 !important; margin:0 !important; outline:none !important; height:20px !important;}',
        '.radio-cb-btn:hover{opacity:1 !important; color:#00d8ff !important;}',
        '.radio-cb-btn svg{width:14px !important; height:14px !important; display:block !important; fill:currentColor !important; margin:0 !important; padding:0 !important;}',
        '.radio-cb-label{display:block !important; line-height:1 !important; margin:0 !important; padding:0 !important;}',

        /* CONTROL BAR EXTENSION & PROGRESS BAR HIDER */
        '.radio-controls-center{position:absolute !important; left:50% !important; top:50% !important; transform:translate(-50%, -50%) !important; display:flex !important; align-items:center !important; justify-content:center !important; gap:16px !important; margin:0 !important; padding:0 !important; z-index:10;}',
        '.radio-cb-btn{appearance:none; background:transparent !important; border:none !important; color:#ffffff !important; cursor:pointer !important; display:flex !important; align-items:center !important; justify-content:center !important; gap:5px !important; font-size:11px !important; font-family:"Courier New",monospace !important; font-weight:bold !important; opacity:0.8 !important; padding:0 !important; margin:0 !important; outline:none !important;}',
        '.radio-cb-btn:hover{opacity:1 !important; color:#00d8ff !important;}',
        '.radio-cb-btn svg{width:14px !important; height:14px !important; display:block !important; fill:currentColor !important; margin:0 !important; padding:0 !important;}',
        '.radio-cb-label{display:block !important; line-height:1 !important; margin:0 !important; padding:0 !important;}',
        '.progress-container, .myetv-progress, .player-progress, .controls-progress, [class*="progress"] { display: none !important; opacity: 0 !important; pointer-events: none !important; }',

        /* HIDE BUTTONS */
        '.pip-btn { display: none !important; }',
        '.settings-expandable-wrapper:has([data-action="speed_expand"]) { display: none !important; }',
        '.settings-option[data-action="speed_expand"] { display: none !important; }',

        /* vintage theme responsive */
        '@media(max-height: 480px) {',
        '.radio-info-bar { margin-bottom: 5px !important; }',
        '.radio-dial-wrapper { min-height: 60px !important; max-height: 100px !important; margin-bottom: 5px !important; }',
        '.radio-analog-dial { min-height: 50px !important; }',
        '.radio-search-bar { margin-top: 5px !important; }',
        '.radio-tick-num { bottom: 25px !important; font-size: 8px !important; }',
        '.radio-tick.major::after { height: 25px !important; }',
        '.radio-tick.mid::after { height: 15px !important; }',
        '.radio-tick::after { height: 8px !important; }',
        '}',

        /* RESPONSIVE */
        '@media(max-width:480px){',
        '.radio-ch-label{display:none;}',
        '.radio-ch-input{width:42px;font-size:11px;}',
        '.radio-cb-btn span.radio-cb-label{display:none;}',
        '.radio-analog-dial{min-height:60px;}',
        '.radio-digital-display{min-height:75px; padding:6px 12px;}',
        '.radio-digital-display{height:75px; padding:6px 12px;}',
        '.digital-main{font-size:18px;}',
        '.radio-filter-row{display:none;}',
        '}'
    ].join('');

    // ============================================================
    // CONSTRUCTOR
    // ============================================================
    function RadioPlugin(player, options) {
        this.player = player;

        this.options = {
            apiUrl: 'https://www.myetv.tv/api/radio/api.php?channel=all_light',
            proxyUrl: '',
            filter: { search: '', country: '', language: '' },
            theme: (options && options.theme) ? options.theme : 'digital',
            startChannel: 1
        };

        if (options) {
            for (var k in options) {
                if (!options.hasOwnProperty(k)) continue;
                if (k === 'filter' && typeof options.filter === 'object' && options.filter) {
                    for (var fk in options.filter) {
                        if (options.filter.hasOwnProperty(fk)) this.options.filter[fk] = options.filter[fk];
                    }
                } else {
                    this.options[k] = options[k];
                }
            }
        }

        /* Internal State */
        this.stations = [];
        this.filteredList = [];

        this.rememberChannel = localStorage.getItem('myetv_radio_remember') === 'true';
        var savedCh = parseInt(localStorage.getItem('myetv_radio_last_ch'), 10);
        var savedCountry = localStorage.getItem('myetv_radio_last_country');

        if (this.rememberChannel) {
            // restore last channel if valid, otherwise default to startChannel option or 1
            this.currentChannel = !isNaN(savedCh) ? savedCh : Math.max(1, parseInt(this.options.startChannel) || 1);
            // restore country filter if available
            if (savedCountry !== null) {
                this.options.filter.country = savedCountry;
            }
        } else {
            this.currentChannel = Math.max(1, parseInt(this.options.startChannel) || 1);
        }

        // check if the player is already set to autoplay (e.g. radio mode) to maintain play state across channel changes
        this._isRadioPlaying = (player.options && player.options.autoplay) || (player.video && player.video.autoplay) || false;
        this._tuneId = 0;

        this.TICK_W = 20;
        this.isDragging = false;
        this.startX = 0;
        this.offsetX = 0;
        this.lastOffset = 0;

        /* Timeouts */
        this._searchTimeout = null;
        this._bufferTimeout = null;
        this._tuneTimeout = null;

        /* DOM Elements */
        this.overlay = null;
        this.dialContainer = null;
        this.scaleEl = null;
        this.channelNumEl = null;
        this.stationNameEl = null;
        this.stationMetaEl = null;
        this.statusDot = null;
        this.digiChEl = null;
        this.digiMainEl = null;
        this.digiMetaEl = null;
        this.digiStatusDot = null;
        this.searchInput = null;
        this.errMsgEl = null;
        this.faviconEl = null;
    }

    // ============================================================
    // INITIALIZATION
    // ============================================================
    RadioPlugin.prototype.setup = function () {
        this._injectCSS();
        this._buildOverlay();
        this._hookPlayerEvents();
        this._bindKeyboard();

        var self = this;
        setTimeout(function () {
            self._buildControlBar();
            self._buildModal();

            if (typeof self.player.populateSettingsMenu === 'function') {
                self.player.populateSettingsMenu();
            }
            self._injectSettingsMenu();

        }, 100);

        this._loadStations();
    };

    RadioPlugin.prototype._injectCSS = function () {
        var existingStyle = document.getElementById('myetv-radio-plugin-css');
        if (existingStyle) { existingStyle.textContent = RADIO_CSS; return; }
        var s = document.createElement('style');
        s.id = 'myetv-radio-plugin-css';
        s.textContent = RADIO_CSS;
        document.head.appendChild(s);
    };

    // ============================================================
    // BUILD OVERLAY UI
    // ============================================================
    RadioPlugin.prototype._buildOverlay = function () {
        var container = this.player.container;
        if (!container) return;

        var ov = document.createElement('div');
        ov.className = 'myetv-radio-overlay theme-' + this.options.theme;

        /* --- Header Info (Vintage Theme) --- */
        var infoBar = document.createElement('div');
        infoBar.className = 'radio-info-bar';

        var chNum = document.createElement('div');
        chNum.className = 'radio-channel-num';
        chNum.innerHTML = '<span class="radio-status"></span>CH ' + this.currentChannel;
        this.channelNumEl = chNum;

        var stName = document.createElement('div');
        stName.className = 'radio-station-name';
        stName.textContent = 'Loading stations...';
        this.stationNameEl = stName;

        var stMeta = document.createElement('div');
        stMeta.className = 'radio-station-meta';
        stMeta.innerHTML = '<img class="radio-favicon" src=""/><span class="radio-meta-text"></span>';
        this.stationMetaEl = stMeta;
        this.faviconEl = stMeta.querySelector('.radio-favicon');
        this.statusDot = chNum.querySelector('.radio-status');

        infoBar.appendChild(chNum);
        infoBar.appendChild(stName);
        infoBar.appendChild(stMeta);
        ov.appendChild(infoBar);

        /* --- Tuning Dial Wrapper --- */
        var dialWrapper = document.createElement('div');
        dialWrapper.className = 'radio-dial-wrapper';
        var dialLabel = document.createElement('div');
        dialLabel.className = 'radio-dial-label';
        dialLabel.innerHTML = '<span>&#9668; PREV</span><span>DRAG TO TUNE</span><span>NEXT &#9658;</span>';
        dialWrapper.appendChild(dialLabel);

        /* 1. ANALOG DIAL (Vintage) */
        var dialContainer = document.createElement('div');
        dialContainer.className = 'radio-analog-dial loading-state';

        var scale = document.createElement('div');
        scale.className = 'radio-scale';
        this.scaleEl = scale;

        var needle = document.createElement('div');
        needle.className = 'radio-needle';

        var errMsg = document.createElement('div');
        errMsg.className = 'radio-error-msg';
        errMsg.style.cssText = 'display:none; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:11px; font-weight:bold; letter-spacing:2px; pointer-events:none; text-shadow:0 0 5px black; color:red;';
        this.errMsgEl = errMsg;

        dialContainer.appendChild(scale);
        dialContainer.appendChild(needle);
        dialContainer.appendChild(errMsg);
        dialWrapper.appendChild(dialContainer);

        /* 2. DIGITAL CAR STEREO DISPLAY (Digital) */
        var digitalDisplay = document.createElement('div');
        digitalDisplay.className = 'radio-digital-display';
        digitalDisplay.innerHTML = `
            <div class="digital-top">
                <div class="digital-status-wrap">
                    <div class="digital-status-dot"></div>
                    <span class="digital-ch">CH --</span>
                </div>
                <span class="digital-badge">DAB+ / NET</span>
            </div>
            <div class="digital-main">LOADING...</div>
            <div class="digital-sub">
                <span class="digital-meta">PLEASE WAIT</span>
                <div class="digital-controls-row">
                    <button class="digi-btn prev">◁ TUNE</button>
                    <button class="digi-btn next">TUNE ▷</button>
                    <button class="digi-btn list">RADIO LIST ≣</button>
                </div>
            </div>
        `;

        this.digiChEl = digitalDisplay.querySelector('.digital-ch');
        this.digiMainEl = digitalDisplay.querySelector('.digital-main');
        this.digiMetaEl = digitalDisplay.querySelector('.digital-meta');
        this.digiStatusDot = digitalDisplay.querySelector('.digital-status-dot');

        var dPrev = digitalDisplay.querySelector('.digi-btn.prev');
        var dNext = digitalDisplay.querySelector('.digi-btn.next');
        var dList = digitalDisplay.querySelector('.digi-btn.list');

        var self = this;
        dPrev.addEventListener('click', function (e) {
            e.stopPropagation();
            self._positionTo(Math.max(1, self.currentChannel - 1), self._isRadioPlaying);
        });
        dNext.addEventListener('click', function (e) {
            e.stopPropagation();
            var max = self.filteredList.length || 1;
            self._positionTo(Math.min(max, self.currentChannel + 1), self._isRadioPlaying);
        });
        dList.addEventListener('click', function (e) {
            e.stopPropagation();
            self._openModal();
        });

        dialWrapper.appendChild(digitalDisplay);
        ov.appendChild(dialWrapper);

        /* --- Search Bar & Country Select --- */
        var searchBar = document.createElement('div');
        searchBar.className = 'radio-search-bar';

        var countrySelect = document.createElement('select');
        countrySelect.className = 'radio-country-select';

        var countries = ['', 'IT', 'US', 'GB', 'FR', 'DE', 'ES', 'RU', 'JP', 'BR', 'CH'];
        var cNames = { '': 'ALL', 'IT': 'IT', 'US': 'US', 'GB': 'GB', 'FR': 'FR', 'DE': 'DE', 'ES': 'ES', 'RU': 'RU', 'JP': 'JP', 'BR': 'BR', 'CH': 'CH' };

        countries.forEach(function (c) {
            var opt = document.createElement('option');
            opt.value = c;
            opt.textContent = cNames[c];
            countrySelect.appendChild(opt);
        });

        var initC = (this.options.filter.country || '').toUpperCase();
        if (countries.indexOf(initC) !== -1) {
            countrySelect.value = initC;
        } else if (initC) {

            var opt = document.createElement('option');
            opt.value = initC;
            opt.textContent = initC;
            countrySelect.appendChild(opt);
            countrySelect.value = initC;
        }
        this.countrySelectEl = countrySelect;

        var searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'radio-search-input';
        searchInput.placeholder = 'Search station name...';
        this.searchInput = searchInput;

        var searchBtn = document.createElement('button');
        searchBtn.className = 'radio-search-btn';
        searchBtn.textContent = 'SEARCH';

        searchBar.appendChild(countrySelect);
        searchBar.appendChild(searchInput);
        searchBar.appendChild(searchBtn);
        ov.appendChild(searchBar);

        /* Insert overlay */
        var controls = this.player.controls;
        if (controls && controls.parentNode === container) {
            container.insertBefore(ov, controls);
        } else {
            container.appendChild(ov);
        }

        this.overlay = ov;
        this.dialContainer = dialContainer;

        this._bindDialEvents(dialContainer);
        this._bindSearchEvents(searchInput, searchBtn);
    };

    // ============================================================
    // SCALE GENERATION
    // ============================================================
    RadioPlugin.prototype._buildScale = function (total) {
        if (!this.scaleEl) return;
        this.scaleEl.innerHTML = '';
        for (var i = 1; i <= total; i++) {
            var tick = document.createElement('div');
            var type = (i % 10 === 0) ? ' major' : (i % 5 === 0 ? ' mid' : '');
            tick.className = 'radio-tick' + type;
            tick.dataset.ch = i;
            if (i % 10 === 0) {
                var label = document.createElement('span');
                label.className = 'radio-tick-num';
                label.textContent = i;
                tick.appendChild(label);
            }
            this.scaleEl.appendChild(tick);
        }
        var padding = this.dialContainer.offsetWidth / 2;
        this.scaleEl.style.paddingLeft = padding + 'px';
        this.scaleEl.style.paddingRight = padding + 'px';
    };

    // ============================================================
    // NAVIGATION & SAFE DEBOUNCE LOGIC
    // ============================================================
    RadioPlugin.prototype._positionTo = function (ch, autoPlay, skipDelay) {
        var list = this.filteredList;
        ch = Math.max(1, Math.min(ch, list.length || 1));
        this.currentChannel = ch;
        if (this.rememberChannel) {
            localStorage.setItem('myetv_radio_last_ch', ch);
        }
        this._tuneId++;

        var playIntent = autoPlay || this._isRadioPlaying || (this.player.video && !this.player.video.paused);
        this._isRadioPlaying = playIntent;

        var targetX = -((ch - 1) * this.TICK_W);
        if (this.scaleEl) {
            this.scaleEl.style.transition = this.isDragging ? 'none' : 'transform 0.2s ease-out';
            this.scaleEl.style.transform = 'translateX(' + targetX + 'px)';

            var prev = this.scaleEl.querySelector('.radio-tick.active');
            if (prev) prev.classList.remove('active');
            var cur = this.scaleEl.querySelector('[data-ch="' + ch + '"]');
            if (cur) cur.classList.add('active');
        }
        this.offsetX = targetX;

        var s = list[ch - 1];
        if (s) {
            var stationName = s.name || 'UNKNOWN';

            if (this.stationNameEl) this.stationNameEl.textContent = stationName;
            if (this.channelNumEl) {
                this.channelNumEl.innerHTML = '<span class="radio-status"></span>CH ' + ch;
                this.statusDot = this.channelNumEl.querySelector('.radio-status');
            }

            if (this.digiChEl) this.digiChEl.textContent = 'CH ' + ch;
            if (this.digiMainEl) this.digiMainEl.textContent = stationName;

            var metaParts = [];
            if (s.countrycode) metaParts.push(s.countrycode.toUpperCase());
            if (s.tags) metaParts.push(s.tags.split(',')[0].trim());
            var metaString = metaParts.join(' · ');

            if (this.stationMetaEl) {
                this.stationMetaEl.querySelector('.radio-meta-text').textContent = metaString;

                // FAVICON SAFE-LOAD
                if (this.faviconEl) {
                    if (s.favicon) {
                        this.faviconEl.style.display = 'none';
                        this.faviconEl.onload = function () { this.style.display = 'inline-block'; };
                        this.faviconEl.onerror = function () { this.style.display = 'none'; };
                        this.faviconEl.src = s.favicon;
                    } else {
                        this.faviconEl.style.display = 'none';
                        this.faviconEl.src = '';
                    }
                }
            }
            if (this.digiMetaEl) this.digiMetaEl.textContent = metaString || 'FM RADIO';
            if (typeof this.player.setVideoTitle === 'function') this.player.setVideoTitle(stationName);

            /* 3. DEBOUNCE LOGIC & SAFE KILL-SWITCH */
            if (this._tuneTimeout && typeof this._tuneTimeout !== 'string') {
                clearTimeout(this._tuneTimeout);
            }
            this._clearBufferTimeout();
            this._clearError();

            this._tuneTimeout = "zapping";

            var video = this.player.video;
            if (video) {
                try {
                    video.pause();
                } catch (e) { }
            }

            if (skipDelay) {
                this._tuneTimeout = null;
                this._prepareStream(s, playIntent);
            } else {
                this._setStatus('buffering');
                var self = this;
                this._tuneTimeout = setTimeout(function () {
                    self._tuneTimeout = null;
                    self._prepareStream(s, playIntent);
                }, 1200);
            }
        }
    };

    RadioPlugin.prototype._bindDialEvents = function (container) {
        var self = this;

        container.addEventListener('pointerdown', function (e) {
            self.isDragging = true;
            self.startX = e.clientX;
            self.lastOffset = self.offsetX;
            if (self.scaleEl) self.scaleEl.style.transition = 'none';
            container.setPointerCapture(e.pointerId);
        });

        container.addEventListener('pointermove', function (e) {
            if (!self.isDragging) return;
            self.offsetX = self.lastOffset + (e.clientX - self.startX);
            if (self.scaleEl) self.scaleEl.style.transform = 'translateX(' + self.offsetX + 'px)';

            var ch = Math.max(1, Math.round(-self.offsetX / self.TICK_W) + 1);
            ch = Math.min(ch, self.filteredList.length || 1);
            var s = self.filteredList[ch - 1];

            if (s) {
                var sName = s.name || 'UNKNOWN';
                if (self.stationNameEl) self.stationNameEl.textContent = sName;
                if (self.digiMainEl) self.digiMainEl.textContent = sName;
                if (self.channelNumEl) self.channelNumEl.innerHTML = '<span class="radio-status"></span>CH ' + ch;
                if (self.digiChEl) self.digiChEl.textContent = 'CH ' + ch;
            }
        });

        container.addEventListener('pointerup', function () {
            if (!self.isDragging) return;
            self.isDragging = false;
            var ch = Math.max(1, Math.round(-self.offsetX / self.TICK_W) + 1);
            self._positionTo(ch, self._isRadioPlaying);
        });

        container.addEventListener('pointercancel', function () {
            self.isDragging = false;
        });
    };

    // ============================================================
    // DATA & STREAM
    // ============================================================
    RadioPlugin.prototype._buildApiUrl = function () {
        var url = this.options.apiUrl;
        var params = [];
        if (this.options.filter.country) params.push('country=' + encodeURIComponent(this.options.filter.country));
        if (this.options.filter.language) params.push('language=' + encodeURIComponent(this.options.filter.language));
        if (params.length) url += (url.indexOf('?') !== -1 ? '&' : '?') + params.join('&');
        return url;
    };

    RadioPlugin.prototype._loadStations = function () {
        var self = this;
        fetch(this._buildApiUrl())
            .then(function (r) { return r.json(); })
            .then(function (data) {
                self.stations = data || [];
                self.filteredList = self._applyFilter(self.options.filter.search || '');
                if (self.dialContainer) self.dialContainer.classList.remove('loading-state');

                setTimeout(function () {
                    self._buildScale(self.filteredList.length);

                    self._positionTo(self.currentChannel, false, true);
                }, 100);
            })
            .catch(function (err) {
                if (self.stationNameEl) self.stationNameEl.textContent = 'API Unavailable';
                if (self.digiMainEl) self.digiMainEl.textContent = 'NO SIGNAL';
            });
    };

    RadioPlugin.prototype._applyFilter = function (q) {
        var low = q.toLowerCase();
        var cf = (this.options.filter.country || '').toLowerCase();
        var lf = (this.options.filter.language || '').toLowerCase();
        return this.stations.filter(function (s) {
            var ok = !q || (s.name || '').toLowerCase().indexOf(low) !== -1;
            if (cf) ok = ok && (s.countrycode || '').toLowerCase() === cf;
            if (lf) ok = ok && (s.language || '').toLowerCase().indexOf(lf) !== -1;
            return ok;
        });
    };

    RadioPlugin.prototype._resolveUrl = function (url) {
        if (!url) return '';
        if (this.options.proxyUrl && url.indexOf('http://') === 0) return this.options.proxyUrl + encodeURIComponent(url);
        return url;
    };

    RadioPlugin.prototype._prepareStream = function (station, play) {
        var video = this.player.video;
        if (!video || !station) return;

        var src = this._resolveUrl(station.url_resolved || station.url || '');
        if (!src) {
            this._setError('INVALID URL');
            return;
        }

        video.pause();
        video.removeAttribute('src');
        video.load();

        this._clearError();

        video.src = src;
        video.load();

        if (play) {
            var self = this;
            var currentTuneId = this._tuneId;
            this._setStatus('buffering');

            this._bufferTimeout = setTimeout(function () {
                if (video.readyState < 3) self._setError('STREAM UNAVAILABLE');
            }, 10000);

            var playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.then(function () {
                    if (self._tuneId !== currentTuneId) return;
                    self._clearBufferTimeout();
                    self._clearError();
                    self._setStatus('playing');
                    self._isRadioPlaying = true;
                }).catch(function (err) {
                    if (self._tuneId !== currentTuneId) return;
                    if (err.name !== 'AbortError') {
                        self._setError('PLAYBACK ERROR');
                    }
                });
            }
        }
    };

    RadioPlugin.prototype._setStatus = function (state) {
        if (this.statusDot) this.statusDot.className = 'radio-status' + (state ? ' ' + state : '');
        if (this.digiStatusDot) this.digiStatusDot.className = 'digital-status-dot' + (state ? ' ' + state : '');
    };

    RadioPlugin.prototype._setError = function (msg) {
        this._setStatus('error');
        if (this.dialContainer) {
            this.dialContainer.classList.remove('loading-state');
            this.dialContainer.classList.add('error-state');
        }
        if (this.errMsgEl) {
            this.errMsgEl.textContent = msg || 'ERROR';
            this.errMsgEl.style.display = 'block';
        }
        if (this.digiMainEl) {
            this.digiMainEl.textContent = msg || 'CONNECTION ERROR';
        }
    };

    RadioPlugin.prototype._clearError = function () {
        if (this.dialContainer) this.dialContainer.classList.remove('error-state');
        if (this.errMsgEl) this.errMsgEl.style.display = 'none';

        var s = this.filteredList[this.currentChannel - 1];
        if (s && this.digiMainEl) {
            this.digiMainEl.textContent = s.name || 'UNKNOWN';
        }
    };

    RadioPlugin.prototype._clearBufferTimeout = function () {
        if (this._bufferTimeout) {
            clearTimeout(this._bufferTimeout);
            this._bufferTimeout = null;
        }
    };

    // ============================================================
    // SEARCH EVENTS
    // ============================================================
    RadioPlugin.prototype._bindSearchEvents = function (input, btn) {
        var self = this;

        var doLocalSearch = function () {
            var q = input.value.trim();
            self.filteredList = self._applyFilter(q);
            self._buildScale(self.filteredList.length);
            self._positionTo(1, false, true);
        };

        btn.addEventListener('click', doLocalSearch);
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') doLocalSearch(); });
        input.addEventListener('input', function () {
            if (self._searchTimeout) clearTimeout(self._searchTimeout);
            self._searchTimeout = setTimeout(doLocalSearch, 450);
        });


        if (this.countrySelectEl) {
            this.countrySelectEl.addEventListener('change', function () {
                self.options.filter.country = this.value;
                self.currentChannel = 1;

                // Se la memoria è attiva, salviamo subito la nuova nazione e il reset al canale 1
                if (self.rememberChannel) {
                    localStorage.setItem('myetv_radio_last_country', self.options.filter.country);
                    localStorage.setItem('myetv_radio_last_ch', 1);
                }

                if (self.dialContainer) self.dialContainer.classList.add('loading-state');
                if (self.digiMainEl) self.digiMainEl.textContent = 'LOADING...';

                if (self.player.video) {
                    try { self.player.video.pause(); } catch (e) { }
                }

                self._loadStations();
            });
        }
    };

    // ============================================================
    // KEYBOARD EVENTS (OVERRIDE NATIVE SEEKING)
    // ============================================================
    RadioPlugin.prototype._bindKeyboard = function () {
        var self = this;
        this._keydownHandler = function (e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                e.stopPropagation();
                self._positionTo(Math.min(self.filteredList.length, self.currentChannel + 1), self._isRadioPlaying);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                e.stopPropagation();
                self._positionTo(Math.max(1, self.currentChannel - 1), self._isRadioPlaying);
            }
        };
        document.addEventListener('keydown', this._keydownHandler, true);
    };

    // ============================================================
    // CONTROL BAR & MODAL
    // ============================================================
    RadioPlugin.prototype._buildControlBar = function () {
        var self = this;
        var controls = this.player.controls;
        if (!controls) return;
        var main = controls.querySelector('.controls-main');
        if (!main) return;

        main.style.position = 'relative';

        var progressBar = controls.querySelector('[class*="progress"]');
        if (progressBar) progressBar.style.display = 'none';

        var center = document.createElement('div');
        center.className = 'radio-controls-center';

        var btnList = document.createElement('button');
        btnList.className = 'radio-cb-btn';
        btnList.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/></svg><span class="radio-cb-label">RADIO LIST</span>';

        center.appendChild(btnList);

        var right = main.querySelector('.controls-right');
        if (right) main.insertBefore(center, right);
        else main.appendChild(center);

        btnList.addEventListener('click', function (e) { e.stopPropagation(); self._openModal(); });
    };

    // ============================================================
    // CUSTOM SETTINGS MENU INJECTION
    // ============================================================
    RadioPlugin.prototype._injectSettingsMenu = function () {
        var self = this;
        var settingsMenu = this.player.container.querySelector('.settings-menu');
        if (!settingsMenu) return;

        if (settingsMenu.querySelector('.radio-custom-settings')) return;

        var wrap = document.createElement('div');
        wrap.className = 'radio-custom-settings';
        wrap.style.cssText = 'padding:0; margin:0; border-top:1px solid rgba(255,255,255,0.05); margin-top:4px; display:flex; flex-direction:column;';

        var title = document.createElement('div');
        title.style.cssText = 'padding:10px 16px 4px 16px; font-size:11px; color:#00d8ff; font-weight:bold; letter-spacing:1px; text-transform:uppercase;';
        title.textContent = 'Radio Options';
        wrap.appendChild(title);

        var memRow = document.createElement('div');
        memRow.className = 'settings-option';
        memRow.style.cssText = 'cursor:pointer; display:flex; justify-content:space-between; align-items:center;';

        var memLabel = document.createElement('span');
        memLabel.className = 'settings-option-label';
        memLabel.textContent = 'Remember Channel';

        var memCb = document.createElement('input');
        memCb.type = 'checkbox';
        memCb.checked = this.rememberChannel;
        memCb.style.cursor = 'pointer';

        memCb.addEventListener('change', function (e) {
            self.rememberChannel = e.target.checked;
            localStorage.setItem('myetv_radio_remember', self.rememberChannel ? 'true' : 'false');

            if (self.rememberChannel) {
                localStorage.setItem('myetv_radio_last_ch', self.currentChannel);
                localStorage.setItem('myetv_radio_last_country', self.options.filter.country);
            } else {
                localStorage.removeItem('myetv_radio_last_ch');
                localStorage.removeItem('myetv_radio_last_country');
            }
        });

        memRow.addEventListener('click', function (e) {
            if (e.target !== memCb) {
                memCb.checked = !memCb.checked;
                var event = new Event('change');
                memCb.dispatchEvent(event);
            }
        });

        memRow.appendChild(memLabel);
        memRow.appendChild(memCb);
        wrap.appendChild(memRow);

        settingsMenu.appendChild(wrap);
    };

    RadioPlugin.prototype._buildModal = function () {
        var self = this;
        var container = this.player.container;
        if (!container) return;

        var overlay = document.createElement('div');
        overlay.className = 'radio-modal-overlay';
        overlay.style.display = 'none';

        var box = document.createElement('div');
        box.className = 'radio-modal-box';
        box.style.color = '#f0c040';

        var header = document.createElement('div');
        header.className = 'radio-modal-header';
        var title = document.createElement('span');
        title.className = 'radio-modal-title';
        title.textContent = 'Station List';
        var closeBtn = document.createElement('button');
        closeBtn.className = 'radio-modal-close';
        closeBtn.innerHTML = '&times;';
        header.appendChild(title);
        header.appendChild(closeBtn);

        var searchWrap = document.createElement('div');
        searchWrap.className = 'radio-modal-search';
        var searchIn = document.createElement('input');
        searchIn.type = 'text';
        searchIn.placeholder = 'Filter station name...';
        searchWrap.appendChild(searchIn);

        var countEl = document.createElement('div');
        countEl.className = 'radio-modal-count';
        this._modalCountEl = countEl;

        var list = document.createElement('div');
        list.className = 'radio-modal-list';
        this._modalListEl = list;

        box.appendChild(header);
        box.appendChild(searchWrap);
        box.appendChild(countEl);
        box.appendChild(list);
        overlay.appendChild(box);

        if (this.overlay) {
            this.overlay.appendChild(overlay);
        } else {
            container.appendChild(overlay);
        }

        this._modalOverlay = overlay;

        closeBtn.addEventListener('click', function () { self._closeModal(); });
        overlay.addEventListener('click', function (e) { if (e.target === overlay) self._closeModal(); });

        var t = null;
        searchIn.addEventListener('input', function () {
            if (t) clearTimeout(t);
            t = setTimeout(function () { self._renderModalList(searchIn.value.trim()); }, 300);
        });
    };

    RadioPlugin.prototype._renderModalList = function (filter) {
        var list = this._modalListEl;
        if (!list) return;
        list.innerHTML = '';

        var q = (filter || '').toLowerCase();
        var rows = q ? this.filteredList.filter(function (s) {
            return (s.name || '').toLowerCase().indexOf(q) !== -1 || String(s.channel_id).indexOf(q) !== -1;
        }) : this.filteredList;

        if (this._modalCountEl) this._modalCountEl.textContent = rows.length + ' stations';

        var self = this;
        var frag = document.createDocumentFragment();
        var max = Math.min(rows.length, 2000);

        for (var i = 0; i < max; i++) {
            (function (s) {
                var actualIndex = self.filteredList.indexOf(s) + 1;
                var item = document.createElement('div');
                item.className = 'radio-modal-item' + (actualIndex === self.currentChannel ? ' active' : '');

                var ch = document.createElement('span');
                ch.className = 'radio-modal-ch';
                ch.textContent = 'CH ' + actualIndex;

                var fav = document.createElement('img');
                fav.className = 'radio-modal-fav';

                if (s.favicon) {
                    fav.style.display = 'none';
                    fav.onload = function () { this.style.display = 'block'; };
                    fav.onerror = function () { this.style.display = 'none'; };
                    fav.src = s.favicon;
                }

                var name = document.createElement('span');
                name.className = 'radio-modal-name';
                name.textContent = s.name || 'Unknown';

                var cc = document.createElement('span');
                cc.className = 'radio-modal-cc';
                cc.textContent = s.countrycode ? s.countrycode.toUpperCase() : '';

                item.appendChild(ch);
                item.appendChild(fav);
                item.appendChild(name);
                item.appendChild(cc);

                item.addEventListener('click', function () {
                    self._positionTo(actualIndex, true, true);
                    self._closeModal();
                });
                frag.appendChild(item);
            })(rows[i]);
        }
        list.appendChild(frag);

        setTimeout(function () {
            var active = list.querySelector('.radio-modal-item.active');
            if (active) active.scrollIntoView({ block: 'center' });
        }, 50);
    };

    RadioPlugin.prototype._openModal = function () {
        if (!this._modalOverlay) return;
        this._renderModalList('');
        this._modalOverlay.style.display = 'flex';
    };

    RadioPlugin.prototype._closeModal = function () {
        if (this._modalOverlay) this._modalOverlay.style.display = 'none';
    };

    // ============================================================
    // PLAYER HOOKS
    // ============================================================
    RadioPlugin.prototype._hookPlayerEvents = function () {
        var self = this;
        this.player.addEventListener('played', function () {
            self._isRadioPlaying = true;
            self._clearBufferTimeout();
            self._clearError();
            self._setStatus('playing');
        });

        this.player.addEventListener('paused', function () {
            if (self._tuneTimeout) return;
            self._isRadioPlaying = false;
            self._clearBufferTimeout();
            self._setStatus('');
        });

        this.player.addEventListener('ended', function () {
            if (self._tuneTimeout) return;
            self._isRadioPlaying = false;
            self._clearBufferTimeout();
            self._setStatus('');
        });

        var video = this.player.video;
        if (video) {
            video.addEventListener('waiting', function () {
                if (self._tuneTimeout) return;
                self._setStatus('buffering');
                self._bufferTimeout = setTimeout(function () {
                    if (!video.paused && video.readyState < 3) self._setError('STREAM UNAVAILABLE');
                }, 8000);
            });

            video.addEventListener('error', function () {
                if (self._tuneTimeout) return;
                if (!video.hasAttribute('src')) return;
                self._clearBufferTimeout();
                self._setError('STREAM UNAVAILABLE');
            });

            video.addEventListener('stalled', function () {
                if (self._tuneTimeout) return;
                if (!self._bufferTimeout && video.hasAttribute('src')) {
                    self._bufferTimeout = setTimeout(function () { self._setError('STREAM UNAVAILABLE'); }, 8000);
                }
            });
        }
    };

    // ============================================================
    // PUBLIC API
    // ============================================================
    RadioPlugin.prototype.tune = function (ch) { this._positionTo(parseInt(ch) || 1, false, true); return this; };
    RadioPlugin.prototype.play = function () { this._isRadioPlaying = true; var s = this.filteredList[this.currentChannel - 1]; if (s) this._prepareStream(s, true); return this; };
    RadioPlugin.prototype.stop = function () { this._isRadioPlaying = false; var v = this.player.video; if (v) { v.pause(); v.removeAttribute('src'); v.load(); } this._setStatus(''); return this; };
    RadioPlugin.prototype.setTheme = function (theme) {
        this.options.theme = theme;
        if (this.overlay) {
            this.overlay.classList.remove('theme-vintage', 'theme-digital');
            this.overlay.classList.add('theme-' + theme);
        }
        return this;
    };
    RadioPlugin.prototype.dispose = function () {
        this.stop();
        if (this._keydownHandler) document.removeEventListener('keydown', this._keydownHandler, true);
        if (this._searchTimeout) clearTimeout(this._searchTimeout);
        if (this._tuneTimeout) clearTimeout(this._tuneTimeout);
        if (this.overlay && this.overlay.parentNode) this.overlay.parentNode.removeChild(this.overlay);
    };

    // ============================================================
    // REGISTER
    // ============================================================
    if (typeof global.registerMYETVPlugin === 'function') {
        global.registerMYETVPlugin('radio', RadioPlugin);
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            if (typeof global.registerMYETVPlugin === 'function') global.registerMYETVPlugin('radio', RadioPlugin);
        });
    }

})(window);
