// MYETV Video Player - Javascript
// Created by https://www.myetv.tv https://oskarcosimo.com

// i18n System for Video Player - Javascript locales -  - Created by [https://www.myetv.tv](https://www.myetv.tv) [https://oskarcosimo.com](https://oskarcosimo.com)
class VideoPlayerI18n {
    constructor() {
        // First define the translations
        this.translations = {
            // Italiano
            'it': {
                'subtitles': 'Sottotitoli (C)',
                'subtitlesoff': 'Disattivati',
                'subtitlesdisable': 'Disabilita sottotitoli',
                'subtitlesenable': 'Abilita sottotitoli',
                'play_pause': 'Play/Pausa (Spazio)',
                'mute_unmute': 'Muta/Smuta (M)',
                'volume': 'Volume',
                'playback_speed': 'Velocità riproduzione',
                'video_quality': 'Qualità video',
                'picture_in_picture': 'Finestra sovrapposta (P)',
                'fullscreen': 'Schermo intero (F)',
                'auto': 'Auto',
                'brand_logo': 'Logo',
                'next_video': 'Video successivo (N)',
                'prev_video': 'Video precedente (P)',
                'playlist_next': 'Avanti',
                'playlist_prev': 'Indietro',
                'settings_menu': 'Impostazioni',
                'loading': 'Caricamento...',
                'encoding_in_progress': 'Encoding in corso',
                'restart_video': 'Torna all\'inizio'
            },

            // English
            'en': {
                'subtitles': 'Subtitles (C)',
                'subtitlesoff': 'Off',
                'subtitlesdisable': 'Disable Subtitles',
                'subtitlesenable': 'Enable Subtitles',
                'play_pause': 'Play/Pause (Space)',
                'mute_unmute': 'Mute/Unmute (M)',
                'volume': 'Volume',
                'playback_speed': 'Playback speed',
                'video_quality': 'Video quality',
                'picture_in_picture': 'Picture-in-Picture (P)',
                'fullscreen': 'Fullscreen (F)',
                'auto': 'Auto',
                'brand_logo': 'Brand logo',
                'next_video': 'Next video (N)',
                'prev_video': 'Previous video (P)',
                'playlist_next': 'Next',
                'playlist_prev': 'Previous',
                'settings_menu': 'Settings',
                'loading': 'Loading...',
                'encoding_in_progress': 'Encoding in progress',
                'restart_video': 'Restart the video'
            },

            // Español
            'es': {
                'subtitles': 'Subtítulos (C)',
                'subtitlesoff': 'Desactivados',
                'subtitlesdisable': 'Desactivar subtítulos',
                'subtitlesenable': 'Activar subtítulos',
                'play_pause': 'Reproducir/Pausar (Espacio)',
                'mute_unmute': 'Silenciar (M)',
                'volume': 'Volumen',
                'playback_speed': 'Velocidad de reproducción',
                'video_quality': 'Calidad de vídeo',
                'picture_in_picture': 'Imagen en imagen (P)',
                'fullscreen': 'Pantalla completa (F)',
                'auto': 'Auto',
                'brand_logo': 'Logo de marca',
                'next_video': 'Siguiente vídeo (N)',
                'prev_video': 'Vídeo anterior (P)',
                'playlist_next': 'Siguiente',
                'playlist_prev': 'Anterior',
                'settings_menu': 'Configuración',
                'loading': 'Cargando...',
                'encoding_in_progress': 'Codificación en curso',
                'restart_video': 'Reiniciar el vídeo'
            },

            // Français
            'fr': {
                'subtitles': 'Sous-titres (C)',
                'subtitlesoff': 'Désactivés',
                'subtitlesdisable': 'Désactiver les sous-titres',
                'subtitlesenable': 'Activer les sous-titres',
                'play_pause': 'Lecture/Pause (Espace)',
                'mute_unmute': 'Muet (M)',
                'volume': 'Volume',
                'playback_speed': 'Vitesse de lecture',
                'video_quality': 'Qualité vidéo',
                'picture_in_picture': 'Image dans l\'image(P)',
                'fullscreen': 'Plein écran (F)',
                'auto': 'Auto',
                'brand_logo': 'Logo de marque',
                'next_video': 'Vidéo suivante (N)',
                'prev_video': 'Vidéo précédente (P)',
                'playlist_next': 'Suivant',
                'playlist_prev': 'Précédent',
                'settings_menu': 'Paramètres',
                'loading': 'Chargement...',
                'encoding_in_progress': 'Encodage en cours',
                'restart_video': 'Redémarrer la vidéo'
            },

            // Deutsch
            'de': {
                'subtitles': 'Untertitel (C)',
                'subtitlesoff': 'Aus',
                'subtitlesdisable': 'Untertitel deaktivieren',
                'subtitlesenable': 'Untertitel aktivieren',
                'play_pause': 'Abspielen/Pausieren (Leertaste)',
                'mute_unmute': 'Stumm (M)',
                'volume': 'Lautstärke',
                'playback_speed': 'Wiedergabegeschwindigkeit',
                'video_quality': 'Videoqualität',
                'picture_in_picture': 'Bild-in-Bild (P)',
                'fullscreen': 'Vollbild (F)',
                'auto': 'Auto',
                'brand_logo': 'Markenlogo',
                'next_video': 'Nächstes Video (N)',
                'prev_video': 'Vorheriges Video (P)',
                'playlist_next': 'Weiter',
                'playlist_prev': 'Zurück',
                'settings_menu': 'Einstellungen',
                'loading': 'Laden...',
                'encoding_in_progress': 'Kodierung läuft',
                'restart_video': 'Video neu starten'
            },

            // Português
            'pt': {
                'subtitles': 'Legendas (C)',
                'subtitlesoff': 'Desativadas',
                'subtitlesdisable': 'Desativar legendas',
                'subtitlesenable': 'Ativar legendas',
                'play_pause': 'Reproduzir/Pausar (Espaço)',
                'mute_unmute': 'Silenciar (M)',
                'volume': 'Volume',
                'playback_speed': 'Velocidade de reprodução',
                'video_quality': 'Qualidade do vídeo',
                'picture_in_picture': 'Imagem em imagem (P)',
                'fullscreen': 'Tela cheia (F)',
                'auto': 'Auto',
                'brand_logo': 'Logo da marca',
                'next_video': 'Próximo vídeo (N)',
                'prev_video': 'Vídeo anterior (P)',
                'playlist_next': 'Próximo',
                'playlist_prev': 'Anterior',
                'settings_menu': 'Configurações',
                'loading': 'Carregando...',
                'encoding_in_progress': 'Codificação em andamento',
                'restart_video': 'Restart video'
            },

            // 中文
            'zh': {
                'subtitles': '字幕 (C)',
                'subtitlesoff': '关闭',
                'subtitlesdisable': '禁用字幕',
                'subtitlesenable': '启用字幕',
                'play_pause': '播放/暂停 (空格)',
                'mute_unmute': '静音 (M)',
                'volume': '音量',
                'playback_speed': '播放速度',
                'video_quality': '视频质量',
                'picture_in_picture': '画中画 (P)',
                'fullscreen': '全屏 (F)',
                'auto': '自动',
                'brand_logo': '品牌标志',
                'next_video': '下一个视频 (N)',
                'prev_video': '上一个视频 (P)',
                'playlist_next': '下一个',
                'playlist_prev': '上一个',
                'settings_menu': '设置',
                'loading': '加载中...',
                'encoding_in_progress': '编码中',
                'restart_video': '重新开始视频'
            },

            // 日本語
            'ja': {
                'subtitles': '字幕 (C)',
                'subtitlesoff': 'オフ',
                'subtitlesdisable': '字幕を無効にする',
                'subtitlesenable': '字幕を有効にする',
                'play_pause': '再生/一時停止 (スペース)',
                'mute_unmute': 'ミュート (M)',
                'volume': '音量',
                'playback_speed': '再生速度',
                'video_quality': '動画品質',
                'picture_in_picture': 'ピクチャーインピクチャー (P)',
                'fullscreen': 'フルスクリーン (F)',
                'auto': '自動',
                'brand_logo': 'ブランドロゴ',
                'next_video': '次の動画 (N)',
                'prev_video': '前の動画 (P)',
                'playlist_next': '次へ',
                'playlist_prev': '前へ',
                'settings_menu': '設定',
                'loading': '読み込み中...',
                'encoding_in_progress': 'エンコード中',
                'restart_video': 'ビデオを再開'
            },

            // Русский
            'ru': {
                'subtitles': 'Субтитры (C)',
                'subtitlesoff': 'Выкл',
                'subtitlesdisable': 'Отключить субтитры',
                'subtitlesenable': 'Включить субтитры',
                'play_pause': 'Воспроизведение/Пауза (Пробел)',
                'mute_unmute': 'Звук (M)',
                'volume': 'Громкость',
                'playback_speed': 'Скорость воспроизведения',
                'video_quality': 'Качество видео',
                'picture_in_picture': 'Картинка в картинке (P)',
                'fullscreen': 'Полный экран (F)',
                'auto': 'Авто',
                'brand_logo': 'Логотип бренда',
                'next_video': 'Следующее видео (N)',
                'prev_video': 'Предыдущее видео (P)',
                'playlist_next': 'Далее',
                'playlist_prev': 'Назад',
                'settings_menu': 'Настройки',
                'loading': 'Загрузка...',
                'encoding_in_progress': 'Кодирование',
                'restart_video': 'Перезапустить видео'
            },

            // العربية
            'ar': {
                'subtitles': 'الترجمة (C)',
                'subtitlesoff': 'إيقاف',
                'subtitlesdisable': 'تعطيل الترجمة',
                'subtitlesenable': 'تفعيل الترجمة',
                'play_pause': 'تشغيل/إيقاف مؤقت (مسافة)',
                'mute_unmute': 'كتم الصوت (M)',
                'volume': 'مستوى الصوت',
                'playback_speed': 'سرعة التشغيل',
                'video_quality': 'جودة الفيديو',
                'picture_in_picture': 'صورة في صورة (P)',
                'fullscreen': 'ملء الشاشة (F)',
                'auto': 'تلقائي',
                'brand_logo': 'شعار العلامة التجارية',
                'next_video': 'الفيديو التالي (N)',
                'prev_video': 'الفيديو السابق (P)',
                'playlist_next': 'التالي',
                'playlist_prev': 'السابق',
                'settings_menu': 'الإعدادات',
                'loading': 'جاري التحميل...',
                'encoding_in_progress': 'الترميز جارٍ',
                'restart_video': 'إعادة تشغيل الفيديو'
            },

            // 한국어 (Korean)
            'ko': {
                'subtitles': '자막 (C)',
                'subtitlesoff': '끄기',
                'subtitlesdisable': '자막 비활성화',
                'subtitlesenable': '자막 활성화',
                'play_pause': '재생/일시정지 (스페이스)',
                'mute_unmute': '음소거 (M)',
                'volume': '음량',
                'playback_speed': '재생 속도',
                'video_quality': '비디오 품질',
                'picture_in_picture': '화면 속 화면 (P)',
                'fullscreen': '전체 화면 (F)',
                'auto': '자동',
                'brand_logo': '브랜드 로고',
                'next_video': '다음 비디오 (N)',
                'prev_video': '이전 비디오 (P)',
                'playlist_next': '다음',
                'playlist_prev': '이전',
                'settings_menu': '설정',
                'loading': '로딩 중...',
                'encoding_in_progress': '인코딩 진행 중',
                'restart_video': 'Restart video'
            },

            // Polski
            'pl': {
                'subtitles': 'Napisy (C)',
                'subtitlesoff': 'Wyłączone',
                'subtitlesdisable': 'Wyłącz napisy',
                'subtitlesenable': 'Włącz napisy',
                'play_pause': 'Odtwarzaj/Pauza (Spacja)',
                'mute_unmute': 'Wycisz (M)',
                'volume': 'Głośność',
                'playback_speed': 'Prędkość odtwarzania',
                'video_quality': 'Jakość wideo',
                'picture_in_picture': 'Obraz w obrazie (P)',
                'fullscreen': 'Pełny ekran (F)',
                'auto': 'Auto',
                'brand_logo': 'Logo marki',
                'next_video': 'Następne wideo (N)',
                'prev_video': 'Poprzednie wideo (P)',
                'playlist_next': 'Dalej',
                'playlist_prev': 'Wstecz',
                'settings_menu': 'Ustawienia',
                'loading': 'Ładowanie...',
                'encoding_in_progress': 'Kodowanie w toku',
                'restart_video': 'Restart video'
            },

            // Magyar
            'hu': {
                'subtitles': 'Feliratok (C)',
                'subtitlesoff': 'Kikapcsolva',
                'subtitlesdisable': 'Feliratok kikapcsolása',
                'subtitlesenable': 'Feliratok bekapcsolása',
                'play_pause': 'Lejátszás/Szünet (Szóköz)',
                'mute_unmute': 'Némítás (M)',
                'volume': 'Hangerő',
                'playback_speed': 'Lejátszási sebesség',
                'video_quality': 'Videó minősége',
                'picture_in_picture': 'Kép a képben (P)',
                'fullscreen': 'Teljes képernyő (F)',
                'auto': 'Auto',
                'brand_logo': 'Márka logó',
                'next_video': 'Következő videó (N)',
                'prev_video': 'Előző videó (P)',
                'playlist_next': 'Következő',
                'playlist_prev': 'Előző',
                'settings_menu': 'Beállítások',
                'loading': 'Betöltés...',
                'encoding_in_progress': 'Kódolás folyamatban',
                'restart_video': 'Restart video'
            },

            // Türkçe
            'tr': {
                'subtitles': 'Altyazılar (C)',
                'subtitlesoff': 'Kapalı',
                'subtitlesdisable': 'Altyazıları kapat',
                'subtitlesenable': 'Altyazıları aç',
                'play_pause': 'Oynat/Duraklat (Boşluk)',
                'mute_unmute': 'Sessize al (M)',
                'volume': 'Ses düzeyi',
                'playback_speed': 'Oynatma hızı',
                'video_quality': 'Video kalitesi',
                'picture_in_picture': 'Resim içinde resim (P)',
                'fullscreen': 'Tam ekran (F)',
                'auto': 'Otomatik',
                'brand_logo': 'Marka logosu',
                'next_video': 'Sonraki video (N)',
                'prev_video': 'Önceki video (P)',
                'playlist_next': 'Sonraki',
                'playlist_prev': 'Önceki',
                'settings_menu': 'Ayarlar',
                'loading': 'Yükleniyor...',
                'encoding_in_progress': 'Kodlama devam ediyor',
                'restart_video': 'Restart video'
            },

            // Nederlands
            'nl': {
                'subtitles': 'Ondertitels (C)',
                'subtitlesoff': 'Uit',
                'subtitlesdisable': 'Ondertitels uitschakelen',
                'subtitlesenable': 'Ondertitels inschakelen',
                'play_pause': 'Afspelen/Pauzeren (Spatie)',
                'mute_unmute': 'Dempen (M)',
                'volume': 'Volume',
                'playback_speed': 'Afspeelsnelheid',
                'video_quality': 'Videokwaliteit',
                'picture_in_picture': 'Beeld-in-beeld (P)',
                'fullscreen': 'Volledig scherm (F)',
                'auto': 'Auto',
                'brand_logo': 'Merklogo',
                'next_video': 'Volgende video (N)',
                'prev_video': 'Vorige video (P)',
                'playlist_next': 'Volgende',
                'playlist_prev': 'Vorige',
                'settings_menu': 'Instellingen',
                'loading': 'Laden...',
                'encoding_in_progress': 'Codering bezig',
                'restart_video': 'Restart video'
            },

            // हिन्दी (Hindi)
            'hi': {
                'subtitles': 'उपशीर्षक (C)',
                'subtitlesoff': 'बंद',
                'subtitlesdisable': 'उपशीर्षक अक्षम करें',
                'subtitlesenable': 'उपशीर्षक सक्षम करें',
                'play_pause': 'चलाएं/रोकें (स्पेस)',
                'mute_unmute': 'म्यूट (M)',
                'volume': 'वॉल्यूम',
                'playback_speed': 'प्लेबैक गति',
                'video_quality': 'वीडियो गुणवत्ता',
                'picture_in_picture': 'चित्र-में-चित्र (P)',
                'fullscreen': 'पूर्ण स्क्रीन (F)',
                'auto': 'स्वतः',
                'brand_logo': 'ब्रांड लोगो',
                'next_video': 'अगला वीडियो (N)',
                'prev_video': 'पिछला वीडियो (P)',
                'playlist_next': 'अगला',
                'playlist_prev': 'पिछला',
                'settings_menu': 'सेटिंग्स',
                'loading': 'लोड हो रहा है...',
                'encoding_in_progress': 'एन्कोडिंग प्रगति में',
                'restart_video': 'Restart video'
            },

            // Svenska
            'sv': {
                'subtitles': 'Undertexter (C)',
                'subtitlesoff': 'Av',
                'subtitlesdisable': 'Inaktivera undertexter',
                'subtitlesenable': 'Aktivera undertexter',
                'play_pause': 'Spela/Pausa (Blanksteg)',
                'mute_unmute': 'Stäng av ljud (M)',
                'volume': 'Volym',
                'playback_speed': 'Uppspelningshastighet',
                'video_quality': 'Videokvalitet',
                'picture_in_picture': 'Bild i bild (P)',
                'fullscreen': 'Fullskärm (F)',
                'auto': 'Auto',
                'brand_logo': 'Varumärkeslogotyp',
                'next_video': 'Nästa video (N)',
                'prev_video': 'Föregående video (P)',
                'playlist_next': 'Nästa',
                'playlist_prev': 'Föregående',
                'settings_menu': 'Inställningar',
                'loading': 'Laddar...',
                'encoding_in_progress': 'Kodning pågår',
                'restart_video': 'Restart video'
            },

            // Bahasa Indonesia
            'id': {
                'subtitles': 'Teks (C)',
                'subtitlesoff': 'Mati',
                'subtitlesdisable': 'Nonaktifkan teks',
                'subtitlesenable': 'Aktifkan teks',
                'play_pause': 'Putar/Jeda (Spasi)',
                'mute_unmute': 'Bisu (M)',
                'volume': 'Volume',
                'playback_speed': 'Kecepatan pemutaran',
                'video_quality': 'Kualitas video',
                'picture_in_picture': 'Gambar-dalam-gambar (P)',
                'fullscreen': 'Layar penuh (F)',
                'auto': 'Otomatis',
                'brand_logo': 'Logo merek',
                'next_video': 'Video berikutnya (N)',
                'prev_video': 'Video sebelumnya (P)',
                'playlist_next': 'Berikutnya',
                'playlist_prev': 'Sebelumnya',
                'settings_menu': 'Pengaturan',
                'loading': 'Memuat...',
                'encoding_in_progress': 'Encoding sedang berlangsung',
                'restart_video': 'Restart video'
            }
        };


        // THEN detect language (after defining translations)
        this.currentLanguage = this.detectLanguage();
    }

    // Detect browser language
    detectLanguage() {
        try {
            const lang = navigator.language || navigator.userLanguage || 'en';
            const shortLang = lang.split('-')[0].toLowerCase();

            // If we have the translation, use it, otherwise fallback to English
            return this.translations[shortLang] ? shortLang : 'en';
        } catch (error) {
            console.warn('Language detection error:', error);
            return 'en';
        }
    }

    // Get translation for key
    t(key) {
        try {
            return this.translations[this.currentLanguage]?.[key] ||
                this.translations['en']?.[key] ||
                key;
        } catch (error) {
            console.warn('Translation error for key:', key, error);
            return key;
        }
    }

    // Change language
    setLanguage(lang) {
        try {
            if (this.translations[lang]) {
                this.currentLanguage = lang;
                return true;
            }
            return false;
        } catch (error) {
            console.warn('Language change error:', error);
            return false;
        }
    }

    // Get supported languages
    getSupportedLanguages() {
        try {
            return Object.keys(this.translations);
        } catch (error) {
            console.warn('Error getting languages:', error);
            return ['en'];
        }
    }

    // Get current language
    getCurrentLanguage() {
        return this.currentLanguage || 'en';
    }

    // Add new translations
    addTranslations(lang, translations) {
        try {
            // SECURITY: Prevent prototype pollution by validating lang parameter
            if (!this.isValidLanguageKey(lang)) {
                console.warn('Invalid language key rejected:', lang);
                return;
            }

            if (!this.translations[lang]) {
                this.translations[lang] = {};
            }

            // SECURITY: Only copy safe properties from translations object
            for (const key in translations) {
                if (translations.hasOwnProperty(key) && this.isValidLanguageKey(key)) {
                    this.translations[lang][key] = translations[key];
                }
            }
        } catch (error) {
            console.warn('Error adding translations:', error);
        }
    }

    // SECURITY: Validate that a key is safe (not a prototype polluting key)
    isValidLanguageKey(key) {
        if (typeof key !== 'string') return false;

        // Reject dangerous prototype-polluting keys
        const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
        if (dangerousKeys.includes(key.toLowerCase())) {
            return false;
        }

        // Accept only alphanumeric keys with underscore/dash (e.g., 'en', 'it', 'play_pause')
        return /^[a-zA-Z0-9_-]+$/.test(key);
    }
}

// Safe initialization with error handling
let VideoPlayerTranslations;

try {
    VideoPlayerTranslations = new VideoPlayerI18n();
} catch (error) {
    console.warn('i18n initialization error, using fallback:', error);

    // Fallback if initialization fails
    VideoPlayerTranslations = {
        currentLanguage: 'en',
        t: function (key) {
            const fallback = {
                'subtitles': 'Subtitles (C)',
                'subtitlesdisable': 'Disable Subtitles',
                'subtitlesenable': 'Enable Subtitles',
                'play_pause': 'Play/Pause (Space)',
                'mute_unmute': 'Mute/Unmute (M)',
                'volume': 'Volume',
                'playback_speed': 'Playback speed',
                'video_quality': 'Video quality',
                'picture_in_picture': 'Picture-in-Picture (P)',
                'fullscreen': 'Fullscreen (F)',
                'auto': 'Auto',
                'brand_logo': 'Brand logo',
                'settings_menu': 'Settings',
                'loading': 'Loading...',
                'encoding_in_progress': 'Encoding in progress',
                'restart_video': 'Restart video'
            };
            return fallback[key] || key;
        },
        setLanguage: function () { return false; },
        getCurrentLanguage: function () { return 'en'; },
        getSupportedLanguages: function () { return ['en']; }
    };
}

// Helper function for ease of use
function t(key) {
    try {
        return VideoPlayerTranslations.t(key);
    } catch (error) {
        console.warn('Helper t() error:', error);
        return key;
    }
}

// Ensure it's globally available
if (typeof window !== 'undefined') {
    window.VideoPlayerTranslations = VideoPlayerTranslations;
    window.t = t;
}

// Plugin System - Global Code
// Global plugin registry
if (!window.MYETVPlayerPlugins) {
    window.MYETVPlayerPlugins = {};
}

/**
 * Register a plugin globally
 * @param {String} name - Plugin name
 * @param {Function|Object} plugin - Plugin constructor or factory function
 */
function registerPlugin(name, plugin) {
    if (window.MYETVPlayerPlugins[name]) {
        console.warn(`Plugin "${name}" is already registered. Overwriting...`);
    }

    window.MYETVPlayerPlugins[name] = plugin;

    if (typeof console !== 'undefined') {
        console.log(`🔌 Plugin "${name}" registered globally`);
    }
}

// Export registerPlugin as a global function
window.registerMYETVPlugin = registerPlugin;

class MYETVvideoplayer {

constructor(videoElement, options = {}) {
    this.video = typeof videoElement === 'string'
        ? document.getElementById(videoElement)
        : videoElement;

    if (!this.video) {
        throw new Error('Video element not found: ' + videoElement);
    }

    this.options = {
        playFromStartButton: false, // Enable play from start button (restart video)
        showQualitySelector: true,   // Enable quality selector button
        showSpeedControl: true,      // Enable speed control button
        showFullscreen: true,        // Enable fullscreen button
        showPictureInPicture: true,  // Enable PiP button
        showSubtitles: true,         // Enable subtitles button
        subtitlesEnabled: false,     // Enable subtitles by default if available
        autoHide: true,              // auto-hide controls when idle
        autoHideDelay: 3000,         // hide controls after ... seconds of inactivity (specificed in milliseconds)
        hideCursor: true,            // hide mouse cursor when idle
        poster: null,                // URL of poster image
        showPosterOnEnd: false,      // Show poster again when video ends
        keyboardControls: true,      // Enable keyboard controls
        showSeekTooltip: true,       // Show tooltip on seek bar at mouse hover
        showTitleOverlay: false,     // Show video title overlay
        videoTitle: '',              // Title text to show in overlay
        videoSubtitle: '',           // Subtitle text to show in overlay
        persistentTitle: false,   // If true, title overlay stays visible
        controlBarOpacity: options.controlBarOpacity !== undefined ? options.controlBarOpacity : 0.95, // Opacity of control bar (0.0 to 1.0)
        titleOverlayOpacity: options.titleOverlayOpacity !== undefined ? options.titleOverlayOpacity : 0.95, // Opacity of title overlay (0.0 to 1.0)
        debug: false,             // Enable/disable debug logging
        autoplay: false,          // if video should autoplay at start
        defaultQuality: 'auto',   // 'auto', '1080p', '720p', '480p', etc.
        language: null,           // language of the player (default english)
        pauseClick: true,         // the player should be paused when click over the video area
        doubleTapPause: true,     // first tap (or click) show the controlbar, second tap (or click) pause
        brandLogoEnabled: false,  // Enable/disable brand logo
        brandLogoUrl: '',         // URL for brand logo image
        brandLogoLinkUrl: '',     // Optional URL to open when clicking the logo
        brandLogoTooltipText: '', // Tooltip text for brand logo
        playlistEnabled: true,    // Enable/disable playlist detection
        playlistAutoPlay: true,   // Auto-play next video when current ends
        playlistLoop: false,      // Loop playlist when reaching the end
        loop: false,              // Loop video when it ends (restart from beginning)
        volumeSlider: 'show',     // Mobile volume slider: 'show' (horizontal popup) or 'hide' (no slider on mobile)
        // WATERMARK OVERLAY
        watermarkUrl: '',           // URL of watermark image
        watermarkLink: '',          // Optional URL to open when clicking watermark
        watermarkPosition: 'bottomright', // Position: topleft, topright, bottomleft, bottomright
        watermarkTitle: '',         // Optional tooltip title
        hideWatermark: true,        // Hide watermark with controls (default: true)
        // ADAPTIVE STREAMING SUPPORT
        adaptiveStreaming: false, // Enable DASH/HLS adaptive streaming
        dashLibUrl: 'https://cdn.dashjs.org/latest/dash.all.min.js', // Dash.js library URL
        hlsLibUrl: 'https://cdn.jsdelivr.net/npm/hls.js@latest', // HLS.js library URL
        adaptiveQualityControl: true, // Show quality control for adaptive streams
        //seek shape
        seekHandleShape: 'circle', // Available shape: none, circle, square, diamond, arrow, triangle, heart, star
        // AUDIO PLAYER
        audiofile: false,       // if true, adapt player to audio file (hide video element)
        audiowave: false,       // if true, show audio wave visualization (Web Audio API)
        // RESOLUTION CONTROL
        resolution: "normal", // "normal", "4:3", "16:9", "stretched", "fit-to-screen", "scale-to-fit"
        ...options
    };

    this.isUserSeeking = false;
    this.controlsTimeout = null;
    this.titleTimeout = null;
    this.currentQualityIndex = 0;
    this.qualities = [];
    this.originalSources = [];
    this.isPiPSupported = this.checkPiPSupport();
    this.seekTooltip = null;
    this.titleOverlay = null;
    this.isPlayerReady = false;

    // Subtitle management
    this.textTracks = [];
    this.currentSubtitleTrack = null;
    this.subtitlesEnabled = false;
    this.customSubtitleRenderer = null;

    // Chapter management
    this.chapters = [];
    this.chapterMarkersContainer = null;
    this.chapterTooltip = null;

    // Dual quality indicator management
    this.selectedQuality = this.options.defaultQuality || 'auto';
    this.currentPlayingQuality = null;
    this.qualityMonitorInterval = null;

    // Quality change management
    this.qualityChangeTimeout = null;
    this.isChangingQuality = false;

    // Quality debug
    this.debugQuality = false;

    // Auto-hide system
    this.autoHideTimer = null;
    this.mouseOverControls = false;
    this.autoHideDebug = false;
    this.autoHideInitialized = false;

    // Poster management
    this.posterOverlay = null;

    // Watermark overlay
    this.watermarkElement = null;

    // Custom event system
    this.eventCallbacks = {
        // Core lifecycle events
        'playerready': [],     // Fired when player is fully initialized and ready
        'played': [],          // Fired when video starts playing
        'paused': [],          // Fired when video is paused
        'ended': [],           // Fired when video playback ends
        'restarted': [],       // Fired when video is restarted from beginning

        // Playback state events
        'playing': [],         // Fired when video is actually playing (after buffering)
        'waiting': [],         // Fired when video is waiting for data (buffering)
        'seeking': [],         // Fired when seek operation starts
        'seeked': [],          // Fired when seek operation completes

        // Loading events
        'loadstart': [],       // Fired when browser starts looking for media
        'loadedmetadata': [],  // Fired when metadata (duration, dimensions) is loaded
        'loadeddata': [],      // Fired when data for current frame is loaded
        'canplay': [],         // Fired when browser can start playing video
        'progress': [],        // Fired periodically while downloading media
        'durationchange': [],  // Fired when duration attribute changes

        // Error events
        'error': [],           // Fired when media loading or playback error occurs
        'stalled': [],         // Fired when browser is trying to get data but it's not available

        // Control events
        'timeupdate': [],      // Fired when current playback position changes
        'volumechange': [],    // Fired when volume or muted state changes
        'speedchange': [],     // Fired when playback speed changes
        'qualitychange': [],   // Fired when video quality changes

        // Feature events
        'subtitlechange': [],  // Fired when subtitle track changes
        'chapterchange': [],   // Fired when video chapter changes
        'pipchange': [],       // Fired when picture-in-picture mode changes
        'fullscreenchange': [], // Fired when fullscreen mode changes
        'playlistchange': []   // Fired when playlist item changes
    };

    // Playlist management
    this.playlist = [];
    this.currentPlaylistIndex = -1;
    this.playlistId = null;
    this.isPlaylistActive = false;

    // Adaptive streaming management
    this.dashPlayer = null;
    this.hlsPlayer = null;
    this.adaptiveStreamingType = null; // 'dash', 'hls', or null
    this.isAdaptiveStream = false;
    this.adaptiveQualities = [];
    this.librariesLoaded = {
        dash: false,
        hls: false
    };

    this.lastTimeUpdate = 0; // For throttling timeupdate events
    // Inject default styles
    this.injectDefaultControlbarStyles();
    // Set language if specified
    if (this.options.language && this.isI18nAvailable()) {
        VideoPlayerTranslations.setLanguage(this.options.language);
    }
    // Apply autoplay if enabled
    if (options.autoplay) {
        this.video.autoplay = true;
    }

    try {
        this.interceptAutoLoading();
        this.createPlayerStructure();
        this.initializeElements();
        this.setupMenuToggles(); // Initialize menu toggle system
        // audio player adaptation
        this.adaptToAudioFile = function () {
            if (this.options.audiofile) {
                // Nascondere video
                if (this.video) {
                    this.video.style.display = 'none';
                }
                if (this.container) {
                    this.container.classList.add('audio-player');
                }
                if (this.options.audiowave) {
                    this.initAudioWave();
                }
            }
        };
        // Audio wave with Web Audio API
        this.initAudioWave = function () {
            if (!this.video) return;

            this.audioWaveCanvas = document.createElement('canvas');
            this.audioWaveCanvas.className = 'audio-wave-canvas';
            this.container.appendChild(this.audioWaveCanvas);

            const canvasCtx = this.audioWaveCanvas.getContext('2d');
            const WIDTH = this.audioWaveCanvas.width = this.container.clientWidth;
            const HEIGHT = this.audioWaveCanvas.height = 60; // altezza onda audio

            // Setup Web Audio API
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
            this.analyser = this.audioCtx.createAnalyser();
            this.source = this.audioCtx.createMediaElementSource(this.video);
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioCtx.destination);

            this.analyser.fftSize = 2048;
            const bufferLength = this.analyser.fftSize;
            const dataArray = new Uint8Array(bufferLength);

            // canvas
            const draw = () => {
                requestAnimationFrame(draw);
                this.analyser.getByteTimeDomainData(dataArray);

                canvasCtx.fillStyle = '#222';
                canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

                canvasCtx.lineWidth = 2;
                canvasCtx.strokeStyle = '#33ccff';
                canvasCtx.beginPath();

                const sliceWidth = WIDTH / bufferLength;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    const v = dataArray[i] / 128.0;
                    const y = v * HEIGHT / 2;

                    if (i === 0) {
                        canvasCtx.moveTo(x, y);
                    } else {
                        canvasCtx.lineTo(x, y);
                    }

                    x += sliceWidth;
                }
                canvasCtx.lineTo(WIDTH, HEIGHT / 2);
                canvasCtx.stroke();
            };

            draw();
        };
        this.adaptToAudioFile();
        this.bindEvents();

        if (this.options.keyboardControls) {
            this.setupKeyboardControls();
        }

        this.updateVolumeSliderVisual();
        this.initVolumeTooltip();
        this.updateTooltips();
        this.markPlayerReady();
        this.initializePluginSystem();
        this.restoreSourcesAsync();

        this.initializeSubtitles();
        this.initializeQualityMonitoring();

        this.initializeResolution();
        this.initializeChapters();
        this.initializePoster();
        this.initializeWatermark();

    } catch (error) {
        if (this.options.debug) console.error('Video player initialization error:', error);
    }
}

/**
 * Decode HTML entities to normal characters
 * @param {string} text - Text with HTML entities
 * @returns {string} Decoded text
 */
decodeHTMLEntities(text) {
    if (!text) return '';
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

// check if the device is Fire TV
isFireTV() {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('aftm') ||
        ua.includes('aftb') ||
        ua.includes('afts') ||
        ua.includes('aftmm') ||
        ua.includes('aftt');
}

// apply Fire TV specific optimizations
optimizeVideoForFireTV() {
    if (!this.isFireTV() || !this.video) return;

    if (this.options.debug) {
        console.log('Fire TV detected - applying optimizations');
    }

    // set playsinline attributes
    this.video.setAttribute('playsinline', '');
    this.video.setAttribute('webkit-playsinline', '');

    // CSS optimizations
    this.video.style.transform = 'translateZ(0)';
    this.video.style.webkitTransform = 'translateZ(0)';
    this.video.style.backfaceVisibility = 'hidden';
    this.video.style.webkitBackfaceVisibility = 'hidden';
    this.video.style.willChange = 'transform';

    // force repaint on loadeddata
    this.video.addEventListener('loadeddata', () => {
        if (this.options.debug) {
            console.log('Fire TV: Video loaded, forcing repaint');
        }
        this.video.style.display = 'none';
        setTimeout(() => {
            this.video.style.display = 'block';
        }, 10);
    }, { once: true });
}

getPlayerState() {
    return {
        isPlaying: !this.isPaused(),
        isPaused: this.isPaused(),
        currentTime: this.getCurrentTime(),
        duration: this.getDuration(),
        volume: this.getVolume(),
        isMuted: this.isMuted(),
        playbackRate: this.getPlaybackRate(),
        isFullscreen: this.isFullscreenActive(),
        isPictureInPicture: this.isPictureInPictureActive(),
        subtitlesEnabled: this.isSubtitlesEnabled(),
        currentSubtitle: this.getCurrentSubtitleTrack(),
        selectedQuality: this.getSelectedQuality(),
        currentQuality: this.getCurrentPlayingQuality(),
        isAutoQuality: this.isAutoQualityActive()
    };
}

isI18nAvailable() {
    return typeof VideoPlayerTranslations !== 'undefined' &&
        VideoPlayerTranslations !== null &&
        typeof VideoPlayerTranslations.t === 'function';
}

t(key) {
    if (this.isI18nAvailable()) {
        try {
            return VideoPlayerTranslations.t(key);
        } catch (error) {
            if (this.options.debug) console.warn('Translation error:', error);
        }
    }

    const fallback = {
        'play_pause': 'Play/Pause (Space)',
        'mute_unmute': 'Mute/Unmute (M)',
        'volume': 'Volume',
        'playback_speed': 'Playback speed',
        'video_quality': 'Video quality',
        'picture_in_picture': 'Picture-in-Picture (P)',
        'fullscreen': 'Fullscreen (F)',
        'subtitles': 'Subtitles (S)',
        'subtitles_enable': 'Enable subtitles',
        'subtitles_disable': 'Disable subtitles',
        'subtitles_off': 'Off',
        'auto': 'Auto',
        'brand_logo': 'Brand logo',
        'next_video': 'Next video (N)',
        'prev_video': 'Previous video (P)',
        'playlist_next': 'Next',
        'playlist_prev': 'Previous'
    };

    return fallback[key] || key;
}

interceptAutoLoading() {
    this.saveOriginalSources();
    this.disableSources();

    this.video.preload = 'none';
    this.video.controls = false;
    this.video.autoplay = false;

    if (this.video.src && this.video.src !== window.location.href) {
        this.originalSrc = this.video.src;
        this.video.removeAttribute('src');
        this.video.src = '';
    }

    this.hideNativePlayer();

    if (this.options.debug) console.log('📁 Sources temporarily disabled to prevent blocking');
}

saveOriginalSources() {
    const sources = this.video.querySelectorAll('source');
    this.originalSources = [];

    sources.forEach((source, index) => {
        if (source.src) {
            this.originalSources.push({
                element: source,
                src: source.src,
                type: source.type || 'video/mp4',
                quality: source.getAttribute('data-quality') || `quality-${index}`,
                index: index
            });
        }
    });

    if (this.options.debug) console.log(`📁 Saved ${this.originalSources.length} sources originali:`, this.originalSources);
}

disableSources() {
    const sources = this.video.querySelectorAll('source');
    sources.forEach(source => {
        if (source.src) {
            source.removeAttribute('src');
        }
    });
}

restoreSourcesAsync() {
    setTimeout(() => {
        this.restoreSources();
    }, 200);
}

    async restoreSources() {
    try {
        // Check for adaptive streaming first
        let adaptiveSource = null;

        if (this.originalSrc) {
            adaptiveSource = this.originalSrc;
        } else if (this.originalSources.length > 0) {
            // Check if any source is adaptive
            const firstSource = this.originalSources[0];
            if (firstSource.src && this.detectStreamType(firstSource.src)) {
                adaptiveSource = firstSource.src;
            }
        }

        // Initialize adaptive streaming if detected
        if (adaptiveSource && this.options.adaptiveStreaming) {
            const adaptiveInitialized = await this.initializeAdaptiveStreaming(adaptiveSource);
            if (adaptiveInitialized) {
                if (this.options.debug) console.log('📡 Adaptive streaming initialized');
                return;
            }
        }

        // Fallback to traditional sources
        if (this.originalSrc) {
            this.video.src = this.originalSrc;
        }

        this.originalSources.forEach(sourceData => {
            if (sourceData.element && sourceData.src) {
                sourceData.element.src = sourceData.src;
            }
        });

        this.qualities = this.originalSources.map(s => ({
            src: s.src,
            quality: s.quality,
            type: s.type
        }));

        if (this.originalSrc && this.qualities.length === 0) {
            this.qualities.push({
                src: this.originalSrc,
                quality: 'default',
                type: 'video/mp4'
            });
        }

        if (this.qualities.length > 0) {
            this.video.load();

            // CRITICAL: Re-initialize subtitles AFTER video.load() completes
            this.video.addEventListener('loadedmetadata', () => {
                setTimeout(() => {
                    this.reinitializeSubtitles();
                    if (this.options.debug) console.log('🔄 Subtitles re-initialized after video load');
                }, 300);
            }, { once: true });
        }

        if (this.options.debug) console.log('✅ Sources ripristinate:', this.qualities);

    } catch (error) {
        if (this.options.debug) console.error('❌ Errore ripristino sources:', error);
    }
}

reinitializeSubtitles() {
    if (this.options.debug) console.log('🔄 Re-initializing subtitles...');

    // Clear existing subtitle data
    this.textTracks = [];
    this.currentSubtitleTrack = null;
    this.subtitlesEnabled = false;

    // Re-detect and initialize subtitles
    this.detectTextTracks();
    this.updateSubtitlesUI();
    this.bindSubtitleEvents();

    if (this.options.debug) console.log(`📝 Re-detected ${this.textTracks.length} subtitle tracks`);

    // Auto-enable first subtitle track if available and default is set
    const defaultTrack = this.getDefaultSubtitleTrack();
    if (defaultTrack !== -1 && this.options.subtitlesEnabled === true) {  // <-- AGGIUNTO!
        setTimeout(() => {
            this.enableSubtitleTrack(defaultTrack);
            if (this.options.debug) console.log(`🎯 Auto-enabled default subtitle track: ${defaultTrack}`);
        }, 100);
    } else {
        if (this.options.debug) {
            console.log(`📝 Default subtitle track NOT auto-enabled:`, {
                defaultTrack: defaultTrack,
                subtitlesEnabled: this.options.subtitlesEnabled
            });
        }
    }
}

getDefaultSubtitleTrack() {
    if (!this.video.textTracks) return -1;

    for (let i = 0; i < this.video.textTracks.length; i++) {
        const track = this.video.textTracks[i];
        if (track.mode === 'showing' || track.default) {
            return i;
        }
    }
    return -1;
}

markPlayerReady() {
    setTimeout(() => {
        this.isPlayerReady = true;
        if (this.container) {
            this.container.classList.add('player-initialized');
        }

        this.triggerEvent('playerready', {
            playerState: this.getPlayerState(),
            qualities: this.qualities,
            subtitles: this.textTracks,
            chapters: this.chapters,
            playlist: this.getPlaylistInfo()
        });

        if (this.video) {
            this.video.style.visibility = '';
            this.video.style.opacity = '';
            this.video.style.pointerEvents = '';
        }

        // UPDATE SETTINGS MENU VISIBILITY IF APPLICABLE
        if (typeof this.updateSettingsMenuVisibility === 'function') {
            this.updateSettingsMenuVisibility();
        }

        // INITIALIZE AUTO-HIDE AFTER EVERYTHING IS READY
        setTimeout(() => {
            if (this.options.autoHide && !this.autoHideInitialized) {
                this.initAutoHide();
            }

            // Fix: Apply default quality (auto or specific)
            if (this.selectedQuality && this.qualities && this.qualities.length > 0) {
                if (this.options.debug) console.log(`🎯 Applying defaultQuality: "${this.selectedQuality}"`);

                if (this.selectedQuality === 'auto') {
                    this.enableAutoQuality();
                } else {
                    // Check if requested quality is available
                    const requestedQuality = this.qualities.find(q => q.quality === this.selectedQuality);
                    if (requestedQuality) {
                        if (this.options.debug) console.log(`✅ Quality "${this.selectedQuality}" available`);
                        this.setQuality(this.selectedQuality);
                    } else {
                        if (this.options.debug) console.warn(`⚠️ Quality "${this.selectedQuality}" not available - fallback to auto`);
                        if (this.options.debug) console.log('📋 Available qualities:', this.qualities.map(q => q.quality));
                        this.enableAutoQuality();
                    }
                }
            }

            // Autoplay
            if (this.options.autoplay) {
                if (this.options.debug) console.log('Autoplay enabled');
                setTimeout(() => {
                    this.video.play()
                        .then(() => {
                            // Autoplay succeeded
                            if (this.options.debug) console.log('Autoplay started successfully');
                        })
                        .catch(error => {
                            // Autoplay blocked by browser
                            if (this.options.debug) console.warn('Autoplay blocked', error);

                            // Start auto-hide timer even if autoplay is blocked
                            // This ensures controls hide after delay when video is paused
                            if (this.options.autoHide && this.autoHideInitialized) {
                                // Show controls initially (user needs to see play button)
                                this.showControlsNow();

                                // Start timer to hide controls
                                this.resetAutoHideTimer();

                                if (this.options.debug) {
                                    console.log('Auto-hide timer started (autoplay blocked - video paused)');
                                }
                            }
                        });
                }, 100);
            }

        }, 200);

    }, 100);
}

createPlayerStructure() {
    let wrapper = this.video.closest('.video-wrapper');
    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'video-wrapper';
        this.video.parentNode.insertBefore(wrapper, this.video);
        wrapper.appendChild(this.video);
    }

    this.container = wrapper;

    this.optimizeVideoForFireTV();
    this.createInitialLoading();
    this.createLoadingOverlay();
    this.collectVideoQualities();
    this.createControls();
    this.createBrandLogo();
    this.detectPlaylist();
    this.createTopBar();
}

createInitialLoading() {
    const initialLoader = document.createElement('div');
    initialLoader.className = 'initial-loading';
    initialLoader.innerHTML = '<div class="loading-spinner"></div><div class="loading-text"></div>';
    this.container.appendChild(initialLoader);
    this.initialLoading = initialLoader;
}

collectVideoQualities() {
    if (this.options.debug) console.log('📁 Video qualities will be loaded with restored sources');
}

createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loadingOverlay-' + this.getUniqueId();
    overlay.innerHTML = '<div class="loading-spinner"></div><div class="loading-text"></div>';
    this.container.appendChild(overlay);
    this.loadingOverlay = overlay;
}

updateTooltips() {
    if (!this.controls) return;

    try {
        // Update tooltips in controls
        this.controls.querySelectorAll('[data-tooltip]').forEach(element => {
            const key = element.getAttribute('data-tooltip');
            element.title = this.t(key);
        });

        // Update tooltips in top bar
        if (this.topBar) {
            this.topBar.querySelectorAll('[data-tooltip]').forEach(element => {
                const key = element.getAttribute('data-tooltip');
                element.title = this.t(key);
            });
        }

        // Update "Auto" option in quality menu
        const autoOption = this.controls.querySelector('.quality-option[data-quality="auto"]');
        if (autoOption) {
            autoOption.textContent = this.t('auto');
        }
    } catch (error) {
        if (this.options.debug) console.warn('Tooltip update error', error);
    }
}

setLanguage(lang) {
    if (this.isI18nAvailable()) {
        try {
            if (VideoPlayerTranslations.setLanguage(lang)) {
                this.updateTooltips();
                return true;
            }
        } catch (error) {
            if (this.options.debug) console.warn('Errore cambio lingua:', error);
        }
    }
    return false;
}

/**
 * Set video title
 * @param {string} title - Video title
 * @returns {Object} this
 */
setVideoTitle(title) {
    this.options.videoTitle = title;

    if (this.topBarTitle) {
        this.topBarTitle.textContent = this.decodeHTMLEntities(title);

        // show top bar if title overlay is enabled
        if (title && this.options.showTitleOverlay) {
            const titleSection = this.topBar.querySelector('.top-bar-title');
            if (titleSection) {
                titleSection.style.display = '';
            }
        }
    } else if (this.topBar && title) {
        // create title section
        const titleSection = this.topBar.querySelector('.top-bar-title');
        if (!titleSection) {
            const newTitleSection = document.createElement('div');
            newTitleSection.className = 'top-bar-title';

            const titleElement = document.createElement('h3');
            titleElement.className = 'video-title';
            titleElement.textContent = this.decodeHTMLEntities(title);
            newTitleSection.appendChild(titleElement);

            const settingsControl = this.topBar.querySelector('.settings-control');
            this.topBar.insertBefore(newTitleSection, settingsControl);

            this.topBarTitle = titleElement;
        }
    }

    if (this.options.debug) console.log('Video title set:', title);
    return this;
}

getVideoTitle() {
    return this.options.videoTitle;
}

setVideoSubtitle(subtitle) {
    this.options.videoSubtitle = subtitle;

    if (this.topBarSubtitle) {
        this.topBarSubtitle.textContent = subtitle;
    } else if (subtitle && this.topBar) {
        // Create subtitle element
        const titleSection = this.topBar.querySelector('.top-bar-title');
        if (titleSection) {
            const subtitleEl = document.createElement('span');
            subtitleEl.className = 'video-subtitle';
            subtitleEl.textContent = subtitle;
            titleSection.appendChild(subtitleEl);
            this.topBarSubtitle = subtitleEl;
        }
    }

    if (this.options.debug) console.log('Video subtitle set:', subtitle);
    return this;
}

getVideoSubtitle() {
    return this.options.videoSubtitle;
}

/**
 * Set persistent title (always visible)
 * @param {boolean} persistent - If true, title stays visible
 * @returns {Object} this
 */
setPersistentTitle(persistent) {
    this.options.persistentTitle = persistent;

    if (this.topBar) {
        if (persistent) {
            this.topBar.classList.add('persistent');
        } else {
            this.topBar.classList.remove('persistent');
        }
    }

    return this;
}

/**
 * Enable title overlay (shows top bar with title)
 * @returns {Object} this
 */
enableTitleOverlay() {
    if (!this.topBar) {
        if (this.options.debug) console.warn('Top bar not available');
        return this;
    }

    this.options.showTitleOverlay = true;

    // show top bar
    if (this.options.videoTitle) {
        const titleSection = this.topBar.querySelector('.top-bar-title');
        if (titleSection) {
            titleSection.style.display = '';
        }
    }

    if (this.options.debug) console.log('Title overlay enabled');
    return this;
}

/**
 * Disable title overlay (hides top bar)
 * @returns {Object} this
 */
disableTitleOverlay() {
    if (!this.topBar) return this;

    this.options.showTitleOverlay = false;

    // hide top bar
    const titleSection = this.topBar.querySelector('.top-bar-title');
    if (titleSection) {
        titleSection.style.display = 'none';
    }

    if (this.options.debug) console.log('Title overlay disabled');
    return this;
}

getUniqueId() {
    return Math.random().toString(36).substr(2, 9);
}

initializeElements() {
    this.progressContainer = this.controls?.querySelector('.progress-container');
    this.progressFilled = this.controls?.querySelector('.progress-filled');
    this.progressBuffer = this.controls?.querySelector('.progress-buffer');
    this.progressHandle = this.controls?.querySelector('.progress-handle');
    this.seekTooltip = this.controls?.querySelector('.seek-tooltip');

    this.playFromStartBtn = this.controls?.querySelector('.play-from-start-btn');
    this.playPauseBtn = this.controls?.querySelector('.play-pause-btn');
    this.muteBtn = this.controls?.querySelector('.mute-btn');
    this.fullscreenBtn = this.controls?.querySelector('.fullscreen-btn');
    this.speedBtn = this.controls?.querySelector('.speed-btn');
    this.qualityBtn = this.controls?.querySelector('.quality-btn');
    this.pipBtn = this.controls?.querySelector('.pip-btn');
    this.subtitlesBtn = this.controls?.querySelector('.subtitles-btn');
    this.playlistPrevBtn = this.controls?.querySelector('.playlist-prev-btn');
    this.playlistNextBtn = this.controls?.querySelector('.playlist-next-btn');

    this.playIcon = this.controls?.querySelector('.play-icon');
    this.pauseIcon = this.controls?.querySelector('.pause-icon');
    this.volumeIcon = this.controls?.querySelector('.volume-icon');
    this.muteIcon = this.controls?.querySelector('.mute-icon');
    this.fullscreenIcon = this.controls?.querySelector('.fullscreen-icon');
    this.exitFullscreenIcon = this.controls?.querySelector('.exit-fullscreen-icon');
    this.pipIcon = this.controls?.querySelector('.pip-icon');
    this.pipExitIcon = this.controls?.querySelector('.pip-exit-icon');

    this.volumeSlider = this.controls?.querySelector('.volume-slider');
    this.currentTimeEl = this.controls?.querySelector('.current-time');
    this.durationEl = this.controls?.querySelector('.duration');
    this.speedMenu = this.controls?.querySelector('.speed-menu');
    this.qualityMenu = this.controls?.querySelector('.quality-menu');
    this.subtitlesMenu = this.controls?.querySelector('.subtitles-menu');

    this.settingsBtn = this.container?.querySelector('.settings-btn');
    this.settingsMenu = this.container?.querySelector('.settings-menu');

    // Apply seek handle shape from options
    if (this.progressHandle && this.options.seekHandleShape) {
        this.setSeekHandleShape(this.options.seekHandleShape);
    }
}

// Generic method to close all active menus (works with plugins too)
closeAllMenus() {
    if (!this.controls) return;

    const menus = this.controls.querySelectorAll('.speed-menu, .quality-menu, .subtitles-menu, .settings-menu');
    const buttons = this.controls.querySelectorAll('.control-btn');

    menus.forEach(menu => menu.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));

    this.currentOpenMenu = null;

    if (this.options.debug) {
        console.log('All menus closed');
    }
}

// Generic menu toggle setup (works with core menus and plugin menus)
setupMenuToggles() {
    if (!this.controls) return;

    this.currentOpenMenu = null;

    this.controls.addEventListener('click', (e) => {
        const button = e.target.closest('.control-btn');
        if (!button) return;

        const buttonClasses = Array.from(button.classList);
        let menuElement = null;

        for (const cls of buttonClasses) {
            if (cls.endsWith('-btn')) {
                const menuClass = cls.replace('-btn', '-menu');
                menuElement = this.controls.querySelector(`.${menuClass}`);
                if (menuElement) break;
            }
        }

        if (!menuElement) return;

        e.stopPropagation();
        e.preventDefault();

        const isOpen = menuElement.classList.contains('active');

        this.closeAllMenus();

        if (!isOpen) {
            menuElement.classList.add('active');
            button.classList.add('active');
            this.currentOpenMenu = menuElement;
            if (this.options.debug) {
                console.log('Menu opened:', menuElement.className);
            }
        } else {
            this.currentOpenMenu = null;
            if (this.options.debug) {
                console.log('Menu closed:', menuElement.className);
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (!this.controls) return;
        if (!this.controls.contains(e.target)) {
            this.closeAllMenus();
        }
    });

    if (this.options.debug) {
        console.log('✅ Menu toggle system initialized (click-based, auto-close)');
    }
}

/**
 * Create integrated top bar with settings menu
 * Respects showTitleOverlay, videoTitle, videoSubtitle, persistentTitle options
 * @returns {void}
 */
createTopBar() {
    if (!this.container) return;

    // Create top bar element
    const topBar = document.createElement('div');
    topBar.className = 'player-top-bar';
    topBar.id = `topBar${this.getUniqueId()}`;

    // Left section - Title (ALWAYS create structure)
    const titleSection = document.createElement('div');
    titleSection.className = 'top-bar-title';

    // Main title
    const titleElement = document.createElement('h3');
    titleElement.className = 'video-title';
    titleElement.textContent = this.options.videoTitle ? this.decodeHTMLEntities(this.options.videoTitle) : '';
    titleSection.appendChild(titleElement);

    // Optional subtitle (if present)
    if (this.options.videoSubtitle) {
        const subtitleElement = document.createElement('span');
        subtitleElement.className = 'video-subtitle';
        subtitleElement.textContent = this.decodeHTMLEntities(this.options.videoSubtitle);
        titleSection.appendChild(subtitleElement);
    }

    // Hide title section if showTitleOverlay is false
    if (!this.options.showTitleOverlay || !this.options.videoTitle) {
        titleSection.style.display = 'none';
    }

    topBar.appendChild(titleSection);

    // Right section - Settings control
    const settingsControl = document.createElement('div');
    settingsControl.className = 'settings-control settings-top-bar';

    // Settings button
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'control-btn settings-btn';
    settingsBtn.setAttribute('data-tooltip', 'settingsmenu');

    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>`;
    settingsBtn.appendChild(icon);

    // Settings menu
    const settingsMenu = document.createElement('div');
    settingsMenu.className = 'settings-menu';

    settingsControl.appendChild(settingsBtn);
    settingsControl.appendChild(settingsMenu);
    topBar.appendChild(settingsControl);

    // Add persistent class if persistentTitle is enabled
    if (this.options.persistentTitle) {
        topBar.classList.add('persistent');
    }

    // Insert top bar as first child in container
    this.container.insertBefore(topBar, this.container.firstChild);

    // Save references
    this.topBar = topBar;
    this.topBarTitle = topBar.querySelector('.video-title');
    this.topBarSubtitle = topBar.querySelector('.video-subtitle');

    if (this.options.debug) {
        console.log('Top bar created with integrated settings', {
            showTitle: this.options.showTitleOverlay,
            persistent: this.options.persistentTitle,
            opacity: this.options.titleOverlayOpacity
        });
    }
}

/**
 * Restart video from beginning - Works with HTML5 video and ALL plugins
 * @returns {this} Returns this for method chaining
 */
restartVideo() {
    if (!this.video) return this;

    const previousTime = this.getCurrentTime();
    const wasPaused = this.isPaused();

    // Set video to beginning (0 seconds)
    // This works for both HTML5 video and plugins
    this.video.currentTime = 0;

    // Alternative: use seek method if available (for plugins)
    if (typeof this.seek === 'function') {
        this.seek(0);
    }

    // Auto-play after restart if video was playing
    if (!wasPaused) {
        // Use player's play method (works for HTML5 and plugins)
        if (typeof this.play === 'function') {
            this.play();
        } else {
            this.video.play().catch(error => {
                if (this.options.debug) console.warn('⚠️ Restart play failed:', error);
            });
        }
    }

    if (this.options.debug) {
        console.log(`🔄 Video restarted from ${this.formatTime(previousTime)} to 0:00`);
    }

    // Trigger custom event
    this.triggerEvent('restarted', {
        previousTime: previousTime,
        duration: this.getDuration(),
        autoPlayed: !wasPaused
    });

    return this;
}

updateVolumeSliderVisual() {
    if (!this.video || !this.container) return;

    const volume = this.video.muted ? 0 : this.video.volume;
    const percentage = Math.round(volume * 100);

    this.container.style.setProperty('--player-volume-fill', percentage + '%');

    if (this.volumeSlider) {
        this.volumeSlider.value = percentage;
    }
}

createVolumeTooltip() {
    const volumeContainer = this.controls?.querySelector('.volume-container');
    if (!volumeContainer || volumeContainer.querySelector('.volume-tooltip')) {
        return; // Tooltip already present
    }

    const tooltip = document.createElement('div');
    tooltip.className = 'volume-tooltip';
    tooltip.textContent = '50%';
    volumeContainer.appendChild(tooltip);

    this.volumeTooltip = tooltip;

    if (this.options.debug) {
        console.log('Dynamic volume tooltip created');
    }
}

updateVolumeTooltip() {
    if (!this.volumeTooltip || !this.video) return;

    const volume = Math.round(this.video.volume * 100);
    this.volumeTooltip.textContent = volume + '%';

    // Aggiorna la posizione del tooltip
    this.updateVolumeTooltipPosition(this.video.volume);

    if (this.options.debug) {
        console.log('Volume tooltip updated:', volume + '%');
    }
}

updateVolumeTooltipPosition(volumeValue = null) {
    if (!this.volumeTooltip || !this.video) return;

    const volumeSlider = this.controls?.querySelector('.volume-slider');
    if (!volumeSlider) return;

    // If no volume provided, use current volume
    if (volumeValue === null) {
        volumeValue = this.video.volume;
    }

    // Calcola la posizione esatta del thumb
    const sliderRect = volumeSlider.getBoundingClientRect();
    const sliderWidth = sliderRect.width;

    // Thumb size is typically 14px (as defined in CSS)
    const thumbSize = 14; // var(--player-volume-handle-size)

    // Calcola la posizione del centro del thumb
    // Il thumb si muove da thumbSize/2 a (sliderWidth - thumbSize/2)
    const availableWidth = sliderWidth - thumbSize;
    const thumbCenterPosition = (thumbSize / 2) + (availableWidth * volumeValue);

    // Converti in percentuale relativa al container dello slider
    const percentage = (thumbCenterPosition / sliderWidth) * 100;

    // Posiziona il tooltip
    this.volumeTooltip.style.left = percentage + '%';

    if (this.options.debug) {
        console.log('Volume tooltip position updated:', {
            volumeValue: volumeValue,
            percentage: percentage + '%',
            thumbCenter: thumbCenterPosition,
            sliderWidth: sliderWidth
        });
    }
}

initVolumeTooltip() {
    this.createVolumeTooltip();

    // Set initial position immediately
    setTimeout(() => {
        if (this.volumeTooltip && this.video) {
            this.updateVolumeTooltipPosition(this.video.volume);
            this.updateVolumeTooltip();
        }
    }, 50); // Shorter delay for faster initialization
}

updateVolumeSliderVisualWithTooltip() {
    const volumeSlider = this.controls?.querySelector('.volume-slider');
    if (!volumeSlider || !this.video) return;

    const volume = this.video.volume || 0;
    const percentage = Math.round(volume * 100);

    volumeSlider.value = volume;

    // Update CSS custom property per il riempimento visuale
    const volumeFillPercentage = percentage + '%';
    volumeSlider.style.setProperty('--player-volume-fill', volumeFillPercentage);

    // Aggiorna anche il tooltip se presente (testo e posizione)
    this.updateVolumeTooltip();

    if (this.options.debug) {
        console.log('Volume slider aggiornato:', {
            volume: volume,
            percentage: percentage,
            fillPercentage: volumeFillPercentage
        });
    }
}

/**
 * Set mobile volume slider visibility
 * @param {String} mode - 'show' (horizontal popup) or 'hide' (no slider on mobile)
 * @returns {Object} this
 */
setMobileVolumeSlider(mode) {
    if (!['show', 'hide'].includes(mode)) {
        if (this.options.debug) console.warn('Invalid mobile volume slider mode:', mode);
        return this;
    }

    this.options.mobileVolumeSlider = mode;
    const volumeContainer = this.controls?.querySelector('.volume-container');
    if (volumeContainer) {
        // Set data attribute for CSS to use
        volumeContainer.setAttribute('data-mobile-slider', mode);
        if (this.options.debug) console.log('Mobile volume slider set to:', mode);
    }
    return this;
}

/**
 * Get mobile volume slider mode
 * @returns {String} Current mobile volume slider mode
 */
getMobileVolumeSlider() {
    return this.options.mobileVolumeSlider;
}

initVolumeTooltip() {

    this.createVolumeTooltip();

    setTimeout(() => {
        this.updateVolumeTooltip();
    }, 200);

    if (this.options.debug) {
        console.log('Dynamic volume tooltip inizializzation');
    }
}

setupSeekTooltip() {
    if (!this.options.showSeekTooltip || !this.progressContainer || !this.seekTooltip) return;

    this.progressContainer.addEventListener('mouseenter', () => {
        if (this.seekTooltip) {
            this.seekTooltip.classList.add('visible');
        }
    });

    this.progressContainer.addEventListener('mouseleave', () => {
        if (this.seekTooltip) {
            this.seekTooltip.classList.remove('visible');
        }
    });

    this.progressContainer.addEventListener('mousemove', (e) => {
        this.updateSeekTooltip(e);
    });
}

updateSeekTooltip(e) {
    if (!this.seekTooltip || !this.progressContainer || !this.video || !this.video.duration) return;

    const rect = this.progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = percentage * this.video.duration;

    this.seekTooltip.textContent = this.formatTime(targetTime);

    const tooltipRect = this.seekTooltip.getBoundingClientRect();
    let leftPosition = clickX;

    const tooltipWidth = tooltipRect.width || 50;
    const containerWidth = rect.width;

    leftPosition = Math.max(tooltipWidth / 2, Math.min(containerWidth - tooltipWidth / 2, clickX));

    this.seekTooltip.style.left = leftPosition + 'px';
}

play() {
    if (!this.video || this.isChangingQuality) return;

    this.video.play().catch(err => {
        if (this.options.debug) console.log('Play failed:', err);
    });

    if (this.playIcon) this.playIcon.classList.add('hidden');
    if (this.pauseIcon) this.pauseIcon.classList.remove('hidden');

    // Trigger event played
    this.triggerEvent('played', {
        currentTime: this.getCurrentTime(),
        duration: this.getDuration()
    });
}

pause() {
    if (!this.video) return;

    this.video.pause();
    if (this.playIcon) this.playIcon.classList.remove('hidden');
    if (this.pauseIcon) this.pauseIcon.classList.add('hidden');

    // Trigger paused event
    this.triggerEvent('paused', {
        currentTime: this.getCurrentTime(),
        duration: this.getDuration()
    });
}

updateVolume(value) {
    if (!this.video) return;

    const previousVolume = this.video.volume;
    const previousMuted = this.video.muted;

    this.video.volume = Math.max(0, Math.min(1, value / 100));

    if (this.video.volume > 0 && this.video.muted) {
        this.video.muted = false;
    }

    if (this.volumeSlider) this.volumeSlider.value = value;
    this.updateMuteButton();
    this.updateVolumeSliderVisual();
    this.initVolumeTooltip();

    // Triggers volumechange event if there is a significant change
    if (Math.abs(previousVolume - this.video.volume) > 0.01 || previousMuted !== this.video.muted) {
        this.triggerEvent('volumechange', {
            volume: this.getVolume(),
            muted: this.isMuted(),
            previousVolume: previousVolume,
            previousMuted: previousMuted
        });
    }
}

changeVolume(delta) {
    if (!this.video) return;

    const newVolume = Math.max(0, Math.min(1, this.video.volume + delta));
    this.updateVolume(newVolume * 100);
    this.updateVolumeSliderVisual();
    this.initVolumeTooltip();
}

updateProgress() {
    if (!this.video || !this.progressFilled || !this.progressHandle || this.isUserSeeking) return;

    if (this.video.duration && !isNaN(this.video.duration)) {
        const progress = (this.video.currentTime / this.video.duration) * 100;
        this.progressFilled.style.width = progress + '%';
        this.progressHandle.style.left = progress + '%';
    }

    // Always call updateTimeDisplay, regardless of duration validity
    this.updateTimeDisplay();

    // Trigger timeupdate event with throttling
    if (!this.lastTimeUpdate || Date.now() - this.lastTimeUpdate > 250) {
        this.triggerEvent('timeupdate', {
            currentTime: this.getCurrentTime(),
            duration: this.getDuration(),
            progress: (this.getCurrentTime() / this.getDuration()) * 100 || 0
        });
        this.lastTimeUpdate = Date.now();
    }
}

// Helper to update loading text in center overlays
updateLoadingText(text) {
    if (this.initialLoading) {
        const textEl = this.initialLoading.querySelector('.loading-text');
        if (textEl) textEl.textContent = text;
    }
    if (this.loadingOverlay) {
        const textEl = this.loadingOverlay.querySelector('.loading-text');
        if (textEl) textEl.textContent = text;
    }
}

updateBuffer() {
    if (!this.video || !this.progressBuffer) return;

    try {
        if (this.video.buffered && this.video.buffered.length > 0 && this.video.duration) {
            const buffered = (this.video.buffered.end(0) / this.video.duration) * 100;
            this.progressBuffer.style.width = buffered + '%';
        }
    } catch (error) {
        if (this.options.debug) console.log('Buffer update error (non-critical):', error);
    }
}

startSeeking(e) {
    if (e.cancelable) e.preventDefault();
    if (this.isChangingQuality) return;

    this.isUserSeeking = true;
    this.progressContainer.classList.add('seeking');
    this.seek(e);
    e.preventDefault();

    // Show controls during seeking
    if (this.options.autoHide && this.autoHideInitialized) {
        this.showControlsNow();
        this.resetAutoHideTimer();
    }
}

continueSeeking(e) {
    if (e.cancelable) e.preventDefault();
    if (this.isUserSeeking && !this.isChangingQuality) {
        this.seek(e);
    }
}

endSeeking() {
    this.isUserSeeking = false;
    this.progressContainer.classList.remove('seeking');
}

seek(e) {
    if (e.cancelable) {
        e.preventDefault();
    }
    if (!this.video || !this.progressContainer || !this.progressFilled || !this.progressHandle || this.isChangingQuality) return;

    const rect = this.progressContainer.getBoundingClientRect();

    // Support both mouse and touch events
    const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : 0));

    const clickX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));

    if (this.video.duration && !isNaN(this.video.duration)) {
        this.video.currentTime = percentage * this.video.duration;

        const progress = `${percentage * 100}%`;
        this.progressFilled.style.width = progress;
        this.progressHandle.style.left = progress;
    }
}

updateDuration() {
    if (this.durationEl && this.video && this.video.duration && !isNaN(this.video.duration)) {
        this.durationEl.textContent = this.formatTime(this.video.duration);
    }
    // Call updateTimeDisplay to handle all states (loading, encoding, normal)
    this.updateTimeDisplay();
}

changeSpeed(e) {
    if (!this.video || !e.target.classList.contains('speed-option') || this.isChangingQuality) return;

    const speed = parseFloat(e.target.getAttribute('data-speed'));
    if (speed && speed > 0) {
        this.video.playbackRate = speed;
        if (this.speedBtn) this.speedBtn.textContent = speed + 'x';

        if (this.speedMenu) {
            this.speedMenu.querySelectorAll('.speed-option').forEach(option => {
                option.classList.remove('active');
            });
            e.target.classList.add('active');
        }

        // Trigger speedchange event
        const previousSpeed = this.video.playbackRate;
        this.triggerEvent('speedchange', {
            speed: speed,
            previousSpeed: previousSpeed
        });
    }
}

onVideoEnded() {
    if (this.playIcon) this.playIcon.classList.remove('hidden');
    if (this.pauseIcon) this.pauseIcon.classList.add('hidden');

    // Handle loop option
    if (this.options.loop) {
        if (this.options.debug) console.log('🔄 Video loop enabled - restarting from beginning');
        this.video.currentTime = 0;
        this.video.play().catch(error => {
            if (this.options.debug) console.warn('Loop play failed:', error);
        });
        return; // Don't show controls or trigger ended event when looping
    }

    this.showControlsNow();

    // Trigger ended event
    this.triggerEvent('ended', {
        currentTime: this.getCurrentTime(),
        duration: this.getDuration(),
        playlistInfo: this.getPlaylistInfo()
    });
}

/**
 * Handle video loading errors (404, 503, network errors, etc.)
 * Triggers 'ended' event to allow proper cleanup and playlist continuation
 */
onVideoError(error) {
    if (this.options.debug) {
        console.error('Video loading error detected:', {
            error: error,
            code: this.video?.error?.code,
            message: this.video?.error?.message,
            src: this.video?.currentSrc || this.video?.src
        });
    }

    // Hide loading overlay
    this.hideLoading();
    if (this.initialLoading) {
        this.initialLoading.style.display = 'none';
    }

    // Remove quality-changing class if present
    if (this.video?.classList) {
        this.video.classList.remove('quality-changing');
    }

    // Reset changing quality flag
    this.isChangingQuality = false;

    // Show controls to allow user interaction
    this.showControlsNow();

    // Optional: Show poster if available
    if (this.options.showPosterOnEnd && this.posterOverlay) {
        this.showPoster();
    }

    // Trigger 'ended' event to allow proper cleanup
    // This allows playlist to continue or other error handling
    this.triggerEvent('ended', {
        currentTime: this.getCurrentTime(),
        duration: this.getDuration(),
        error: true,
        errorCode: this.video?.error?.code,
        errorMessage: this.video?.error?.message,
        playlistInfo: this.getPlaylistInfo()
    });

    if (this.options.debug) {
        console.log('Video error handled - triggered ended event');
    }
}


getCurrentTime() { return this.video ? this.video.currentTime || 0 : 0; }

setCurrentTime(time) { if (this.video && typeof time === 'number' && time >= 0 && !this.isChangingQuality) { this.video.currentTime = time; } }

getDuration() { return this.video && this.video.duration ? this.video.duration : 0; }

getVolume() { return this.video ? this.video.volume || 0 : 0; }

setVolume(volume) {
    if (typeof volume === 'number' && volume >= 0 && volume <= 1) {
        this.updateVolume(volume * 100);
    }
}

isPaused() { return this.video ? this.video.paused : true; }

isMuted() { return this.video ? this.video.muted : false; }

setMuted(muted) {
    if (this.video && typeof muted === 'boolean') {
        this.video.muted = muted;
        this.updateMuteButton();
        this.updateVolumeSliderVisual();
        this.initVolumeTooltip();
    }
}

getPlaybackRate() { return this.video ? this.video.playbackRate || 1 : 1; }

setPlaybackRate(rate) { if (this.video && typeof rate === 'number' && rate > 0 && !this.isChangingQuality) { this.video.playbackRate = rate; if (this.speedBtn) this.speedBtn.textContent = rate + 'x'; } }

isPictureInPictureActive() { return document.pictureInPictureElement === this.video; }

getCurrentLanguage() {
    return this.isI18nAvailable() ?
        VideoPlayerTranslations.getCurrentLanguage() : 'en';
}

getSupportedLanguages() {
    return this.isI18nAvailable() ?
        VideoPlayerTranslations.getSupportedLanguages() : ['en'];
}

createBrandLogo() {
    if (!this.options.brandLogoEnabled || !this.options.brandLogoUrl) return;

    const controlsRight = this.controls?.querySelector('.controls-right');
    if (!controlsRight) return;

    // Create brand logo image
    const logo = document.createElement('img');
    logo.className = 'brand-logo';
    logo.src = this.options.brandLogoUrl;
    logo.alt = 'Brand logo';

    // Add tooltip ONLY if link URL is present
    if (this.options.brandLogoLinkUrl) {
        // Use custom tooltip text if provided, otherwise fallback to URL
        logo.title = this.options.brandLogoTooltipText || this.options.brandLogoLinkUrl;
        // do not use data-tooltip to not be overwritten
    }

    // Handle loading error
    logo.onerror = () => {
        if (this.options.debug) console.warn('Brand logo failed to load:', this.options.brandLogoUrl);
        logo.style.display = 'none';
    };

    logo.onload = () => {
        if (this.options.debug) console.log('Brand logo loaded successfully');
    };

    // Add click functionality if link URL is provided
    if (this.options.brandLogoLinkUrl) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', (e) => {
            e.stopPropagation();
            window.open(this.options.brandLogoLinkUrl, '_blank', 'noopener,noreferrer');
            if (this.options.debug) console.log('Brand logo clicked, opening:', this.options.brandLogoLinkUrl);
        });
    } else {
        logo.style.cursor = 'default';
    }

    controlsRight.insertBefore(logo, controlsRight.firstChild);

    if (this.options.debug) {
        console.log('Brand logo created with tooltip:', logo.title || 'no tooltip');
    }
}

setBrandLogo(enabled, url = '', linkUrl = '') {
    this.options.brandLogoEnabled = enabled;
    if (url) {
        this.options.brandLogoUrl = url;
    }
    if (linkUrl !== '') {
        this.options.brandLogoLinkUrl = linkUrl;
    }

    // Remove existing brand logo
    const existingLogo = this.controls?.querySelector('.brand-logo');
    if (existingLogo) {
        existingLogo.remove();
    }

    // Recreate the logo if enabled
    if (enabled && this.options.brandLogoUrl) {
        this.createBrandLogo();
    }

    return this;
}

getBrandLogoSettings() {
    return {
        enabled: this.options.brandLogoEnabled,
        url: this.options.brandLogoUrl,
        linkUrl: this.options.brandLogoLinkUrl
    };
}

switchToVideo(newVideoElement, shouldPlay = false) {
    if (!newVideoElement) {
        if (this.options.debug) console.error('🎵 New video element not found');
        return false;
    }

    // Pause current video
    this.video.pause();

    // Get new video sources and qualities
    const newSources = Array.from(newVideoElement.querySelectorAll('source')).map(source => ({
        src: source.src,
        quality: source.getAttribute('data-quality') || 'auto',
        type: source.type || 'video/mp4'
    }));

    if (newSources.length === 0) {
        if (this.options.debug) console.error('🎵 New video has no sources');
        return false;
    }

    // Check if new video is adaptive stream
    if (this.options.adaptiveStreaming && newSources.length > 0) {
        const firstSource = newSources[0];
        if (this.detectStreamType(firstSource.src)) {
            // Initialize adaptive streaming for new video
            this.initializeAdaptiveStreaming(firstSource.src).then((initialized) => {
                if (initialized && shouldPlay) {
                    const playPromise = this.video.play();
                    if (playPromise) {
                        playPromise.catch(error => {
                            if (this.options.debug) console.log('Autoplay prevented:', error);
                        });
                    }
                }
            });
            return true;
        }
    }

    // Update traditional video sources
    this.video.innerHTML = '';
    newSources.forEach(source => {
        const sourceEl = document.createElement('source');
        sourceEl.src = source.src;
        sourceEl.type = source.type;
        sourceEl.setAttribute('data-quality', source.quality);
        this.video.appendChild(sourceEl);
    });

    // Update subtitles if present
    const newTracks = Array.from(newVideoElement.querySelectorAll('track'));
    newTracks.forEach(track => {
        const trackEl = document.createElement('track');
        trackEl.kind = track.kind;
        trackEl.src = track.src;
        trackEl.srclang = track.srclang;
        trackEl.label = track.label;
        if (track.default) trackEl.default = true;
        this.video.appendChild(trackEl);
    });

    // Update video title
    const newTitle = newVideoElement.getAttribute('data-video-title');
    if (newTitle && this.options.showTitleOverlay) {
        this.options.videoTitle = newTitle;
        if (this.titleText) {
            this.titleText.textContent = this.decodeHTMLEntities(newTitle);
        }
    }

    // Reload video
    this.video.load();

    // Update qualities and quality selector
    this.collectVideoQualities();
    this.updateQualityMenu();

    // Play if needed
    if (shouldPlay) {
        const playPromise = this.video.play();
        if (playPromise) {
            playPromise.catch(error => {
                if (this.options.debug) console.log('🎵 Autoplay prevented:', error);
            });
        }
    }

    return true;
}

/**
* POSTER IMAGE MANAGEMENT
* Initialize and manage video poster image
*/
initializePoster() {
    if (!this.video) {
        return;
    }

    // Set poster from options if provided
    if (this.options.poster) {
        this.video.setAttribute('poster', this.options.poster);
        if (this.options.debug) console.log('🖼️ Poster set from options:', this.options.poster);
    }

    // Create custom poster overlay to prevent disappearing
    this.createPosterOverlay();

    // Bind poster events
    this.bindPosterEvents();

    if (this.options.debug) console.log('🖼️ Poster management initialized');
}

/**
 * Create custom poster overlay element
 * This prevents the poster from disappearing after video loads
 */
createPosterOverlay() {
    if (!this.container || !this.video) {
        return;
    }

    // Check if poster exists (either from attribute or options)
    const posterUrl = this.video.getAttribute('poster') || this.options.poster;

    if (!posterUrl) {
        if (this.options.debug) console.log('🖼️ No poster URL found');
        return;
    }

    // Create poster overlay element
    const posterOverlay = document.createElement('div');
    posterOverlay.className = 'video-poster-overlay';
    posterOverlay.style.backgroundImage = `url(${posterUrl})`;

    // Insert poster overlay before controls
    if (this.controls) {
        this.container.insertBefore(posterOverlay, this.controls);
    } else {
        this.container.appendChild(posterOverlay);
    }

    this.posterOverlay = posterOverlay;

    if (this.options.debug) console.log('🖼️ Custom poster overlay created');
}

/**
 * Bind poster-related events
 */
bindPosterEvents() {
    if (!this.video || !this.posterOverlay) {
        return;
    }

    // Hide poster when video starts playing
    this.video.addEventListener('play', () => {
        this.hidePoster();
    });

    // Show poster when video ends (optional)
    this.video.addEventListener('ended', () => {
        if (this.options.showPosterOnEnd) {
            this.showPoster();
        }
    });

    // Hide poster when video is loading/playing
    this.video.addEventListener('playing', () => {
        this.hidePoster();
        });

    // Show poster on load if not autoplay
    if (!this.options.autoplay) {
        this.showPoster();
    }

    // Click on poster to play video
    if (this.posterOverlay) {
        this.posterOverlay.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.video.paused) {
                this.play();
            }
        });
    }

    if (this.options.debug) console.log('🖼️ Poster events bound');
}

/**
 * Show poster overlay
 */
showPoster() {
    if (this.posterOverlay) {
        this.posterOverlay.classList.add('visible');
        this.posterOverlay.classList.remove('hidden');
        if (this.options.debug) console.log('🖼️ Poster shown');
    }
}

/**
 * Hide poster overlay
 */
hidePoster() {
    if (this.posterOverlay) {
        this.posterOverlay.classList.remove('visible');
        this.posterOverlay.classList.add('hidden');
        if (this.options.debug) console.log('🖼️ Poster hidden');
    }
}

/**
 * Set poster image dynamically
 * @param {String} posterUrl - URL of the poster image
 */
setPoster(posterUrl) {
    if (!posterUrl) {
        if (this.options.debug) console.warn('🖼️ Invalid poster URL');
        return this;
    }

    this.options.poster = posterUrl;

    // Update video poster attribute
    if (this.video) {
        this.video.setAttribute('poster', posterUrl);
    }

    // Update or create poster overlay
    if (this.posterOverlay) {
        this.posterOverlay.style.backgroundImage = `url(${posterUrl})`;
    } else {
        this.createPosterOverlay();
        this.bindPosterEvents();
    }

    if (this.options.debug) console.log('🖼️ Poster updated:', posterUrl);

    return this;
}

/**
 * Get current poster URL
 * @returns {String|null} Poster URL or null
 */
getPoster() {
    return this.options.poster || this.video?.getAttribute('poster') || null;
}

/**
 * Remove poster
 */
removePoster() {
    if (this.posterOverlay) {
        this.posterOverlay.remove();
        this.posterOverlay = null;
    }

    if (this.video) {
        this.video.removeAttribute('poster');
    }

    this.options.poster = null;

    if (this.options.debug) console.log('🖼️ Poster removed');

    return this;
}

/**
 * Toggle poster visibility
 * @param {Boolean|null} show - True to show, false to hide, null to toggle
 * @returns {Object} this
 */
togglePoster(show = null) {
    if (!this.posterOverlay) {
        return this;
    }

    if (show === null) {
        // Toggle
        if (this.posterOverlay.classList.contains('visible')) {
            this.hidePoster();
        } else {
            this.showPoster();
        }
    } else if (show) {
        this.showPoster();
    } else {
        this.hidePoster();
    }

    return this;
}

/**
 * Check if poster is visible
 * @returns {Boolean} True if poster is visible
 */
isPosterVisible() {
    return this.posterOverlay ? this.posterOverlay.classList.contains('visible') : false;
}


loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Set seek handle shape dynamically
 * @param {string} shape - Shape type: none, circle, square, diamond, arrow, triangle, heart, star
 * @returns {Object} this
 */
setSeekHandleShape(shape) {
    const validShapes = ['none', 'circle', 'square', 'diamond', 'arrow', 'triangle', 'heart', 'star'];

    if (!validShapes.includes(shape)) {
        if (this.options.debug) console.warn('Invalid seek handle shape:', shape);
        return this;
    }

    this.options.seekHandleShape = shape;

    // Update handle class
    if (this.progressHandle) {
        // Remove all shape classes
        validShapes.forEach(s => {
            this.progressHandle.classList.remove(`progress-handle-${s}`);
        });
        // Add new shape class
        this.progressHandle.classList.add(`progress-handle-${shape}`);
    }

    if (this.options.debug) console.log('Seek handle shape changed to:', shape);
    return this;
}

/**
 * Get current seek handle shape
 * @returns {string} Current shape
 */
getSeekHandleShape() {
    return this.options.seekHandleShape;
}

/**
 * Get available seek handle shapes
 * @returns {Array} Array of available shapes
 */
getAvailableSeekHandleShapes() {
    return ['none', 'circle', 'square', 'diamond', 'arrow', 'triangle', 'heart', 'star'];
}

dispose() {
    if (this.qualityMonitorInterval) {
        clearInterval(this.qualityMonitorInterval);
        this.qualityMonitorInterval = null;
    }

    if (this.autoHideTimer) {
        clearTimeout(this.autoHideTimer);
        this.autoHideTimer = null;
    }

    this.cleanupQualityChange();
    this.clearControlsTimeout();
    this.clearTitleTimeout();

    // Destroy adaptive streaming players
    this.destroyAdaptivePlayer();

    if (this.controls) {
        this.controls.remove();
    }
    if (this.loadingOverlay) {
        this.loadingOverlay.remove();
    }
    if (this.titleOverlay) {
        this.titleOverlay.remove();
    }
    if (this.initialLoading) {
        this.initialLoading.remove();
    }

    if (this.video) {
        this.video.classList.remove('video-player');
        this.video.controls = true;
        this.video.style.visibility = '';
        this.video.style.opacity = '';
        this.video.style.pointerEvents = '';
    }
    if (this.chapterMarkersContainer) {
        this.chapterMarkersContainer.remove();
    }
    if (this.chapterTooltip) {
        this.chapterTooltip.remove();
    }
    if (this.posterOverlay) {
        this.posterOverlay.remove();
    }
    this.disposeAllPlugins();

}

/**

 * Apply specified resolution mode to video

 * @param {string} resolution - The resolution mode to apply

 */

/**

 * Get currently set resolution

 * @returns {string} Current resolution

 */

/**

 * Initialize resolution from options value

 */

/**

 * Restore resolution after quality change - internal method

 * @private

 */

addEventListener(eventType, callback) {
        if (typeof callback !== 'function') {
            if (this.options.debug) console.warn(`Callback for event '${eventType}' is not a function`);
            return this;
        }

        if (!this.eventCallbacks[eventType]) {
            this.eventCallbacks[eventType] = [];
        }

        this.eventCallbacks[eventType].push(callback);
        if (this.options.debug) console.log(`Event '${eventType}' registered`);
        return this;
    }

    removeEventListener(eventType, callback) {
        if (!this.eventCallbacks[eventType]) return this;

        const index = this.eventCallbacks[eventType].indexOf(callback);
        if (index > -1) {
            this.eventCallbacks[eventType].splice(index, 1);
            if (this.options.debug) console.log(`Event '${eventType}' removed`);
        }
        return this;
    }

    triggerEvent(eventType, data = {}) {
        if (!this.eventCallbacks[eventType]) return;

        this.eventCallbacks[eventType].forEach(callback => {
            try {
                callback({
                    type: eventType,
                    timestamp: Date.now(),
                    player: this,
                    ...data
                });
            } catch (error) {
                if (this.options.debug) console.error(`Error in event '${eventType}':`, error);
            }
        });
    }

    getEventData() {
        const state = this.getPlayerState();
        return {
            played: state.isPlaying,
            paused: state.isPaused,
            subtitleEnabled: state.subtitlesEnabled,
            pipMode: state.isPictureInPicture,
            fullscreenMode: state.isFullscreen,
            speed: state.playbackRate,
            controlBarLength: state.currentTime,
            volumeIsMuted: state.isMuted,
            // Additional useful data
            duration: state.duration,
            volume: state.volume,
            quality: state.currentQuality,
            buffered: this.getBufferedTime()
        };
    }

    bindSubtitleEvents() {
        if (this.video.textTracks) {
            for (let i = 0; i < this.video.textTracks.length; i++) {
                const track = this.video.textTracks[i];

                track.addEventListener('cuechange', () => {
                    if (this.options.debug) console.log('Cue change detected:', track.activeCues);
                });
            }
        }
    }

    setupVolumeTooltipEvents() {
        const volumeSlider = this.controls?.querySelector('.volume-slider');
        if (!volumeSlider) return;

        let isMouseOverVolume = false;
        let isDragging = false;

        volumeSlider.addEventListener('mouseenter', () => {
            isMouseOverVolume = true;
            // IMPORTANT: Set position FIRST, then show tooltip
            this.updateVolumeTooltipPosition(this.video.volume);
            this.updateVolumeTooltip();
            if (this.volumeTooltip) {
                this.volumeTooltip.classList.add('visible');
            }
        });

        volumeSlider.addEventListener('mouseleave', () => {
            isMouseOverVolume = false;
            if (!isDragging) {
                setTimeout(() => {
                    if (!isMouseOverVolume && !isDragging && this.volumeTooltip) {
                        this.volumeTooltip.classList.remove('visible');
                    }
                }, 150);
            }
        });

        volumeSlider.addEventListener('mousemove', (e) => {
            if (isMouseOverVolume && this.volumeTooltip && !isDragging) {
                const rect = volumeSlider.getBoundingClientRect();
                const offsetX = e.clientX - rect.left;
                const sliderWidth = rect.width;

                const thumbSize = 14;
                const availableWidth = sliderWidth - thumbSize;
                let volumeAtPosition = (offsetX - thumbSize / 2) / availableWidth;
                volumeAtPosition = Math.max(0, Math.min(1, volumeAtPosition));

                const hoverVolume = Math.round(volumeAtPosition * 100);

                // Set position first, then update text to avoid flicker
                this.updateVolumeTooltipPosition(volumeAtPosition);
                this.volumeTooltip.textContent = hoverVolume + '%';
            }
        });

        // During dragging - set position immediately
        volumeSlider.addEventListener('mousedown', () => {
            isDragging = true;
            if (this.volumeTooltip) {
                // Ensure position is set before showing
                this.updateVolumeTooltipPosition(this.video.volume);
                this.volumeTooltip.classList.add('visible');
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                setTimeout(() => {
                    if (!isMouseOverVolume && this.volumeTooltip) {
                        this.volumeTooltip.classList.remove('visible');
                    }
                }, 500);
            }
        });

        volumeSlider.addEventListener('input', (e) => {
            const volumeValue = parseFloat(e.target.value);
            const volume = Math.round(volumeValue * 100);
            if (this.volumeTooltip) {
                // Update position first, then text
                this.updateVolumeTooltipPosition(volumeValue);
                this.volumeTooltip.textContent = volume + '%';
            }
            isDragging = true;
        });

        volumeSlider.addEventListener('change', () => {
            // Ensure final position is correct
            this.updateVolumeTooltip();
            setTimeout(() => {
                isDragging = false;
            }, 100);
        });
    }

    bindEvents() {
    if (this.video) {

        // Play from start button
        if (this.playFromStartBtn) {
            this.playFromStartBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.restartVideo();
            });
        }

        // Playback events
        this.video.addEventListener('playing', () => {
            this.hideLoading();
            this.closeAllMenus();

            // Update play/pause button when video actually starts playing
            if (this.playIcon && this.pauseIcon) {
                this.playIcon.classList.add('hidden');
                this.pauseIcon.classList.remove('hidden');
            }

            // Reset auto-hide timer when video starts playing
            if (this.options.autoHide && this.autoHideInitialized) {
                if (this.options.debug) console.log('Video playing - reset auto-hide timer');
                this.showControlsNow();
                this.resetAutoHideTimer();
            }

            // Trigger playing event - video is now actually playing
            this.triggerEvent('playing', {
                currentTime: this.getCurrentTime(),
                duration: this.getDuration()
            });
        });

        // Show controls and cancel timer when video is paused
        this.video.addEventListener('pause', () => {
            if (this.options.autoHide && this.autoHideInitialized) {
                if (this.options.debug) console.log('Video paused - show controls and cancel timer');
                this.showControlsNow();

                // Cancel timer so controls stay visible while paused
                if (this.autoHideTimer) {
                    clearTimeout(this.autoHideTimer);
                    this.autoHideTimer = null;
                }
            }
        });

        this.video.addEventListener('waiting', () => {
            if (!this.isChangingQuality) {
                this.showLoading();
                // Trigger waiting event - video is buffering
                this.triggerEvent('waiting', {
                    currentTime: this.getCurrentTime()
                });
            }
        });

        this.video.addEventListener('seeking', () => {
            // Trigger seeking event - seek operation started
            this.triggerEvent('seeking', {
                currentTime: this.getCurrentTime(),
                targetTime: this.video.currentTime
            });
        });

        this.video.addEventListener('seeked', () => {
            // Trigger seeked event - seek operation completed
            this.triggerEvent('seeked', {
                currentTime: this.getCurrentTime()
            });
        });

        // Loading events
        this.video.addEventListener('loadstart', () => {
            if (!this.isChangingQuality) {
                this.showLoading();
            }

            // Update time display to show "Loading..." during initial buffering
            this.updateTimeDisplay();

            // Trigger loadstart event - browser started loading media
            this.triggerEvent('loadstart');
        });

        this.video.addEventListener('loadedmetadata', () => {
            this.updateDuration();

            // Update time display when metadata is loaded
            this.updateTimeDisplay();

            // Trigger loadedmetadata event - video metadata loaded
            this.triggerEvent('loadedmetadata', {
                duration: this.getDuration(),
                videoWidth: this.video.videoWidth,
                videoHeight: this.video.videoHeight
            });

            // Initialize subtitles after metadata is loaded
            setTimeout(() => {
                this.initializeSubtitles();
            }, 100);
        });

        this.video.addEventListener('loadeddata', () => {
            if (!this.isChangingQuality) {
                this.hideLoading();
            }

            // Update time display when data is loaded
            this.updateTimeDisplay();

            // Trigger loadeddata event - current frame data loaded
            this.triggerEvent('loadeddata', {
                currentTime: this.getCurrentTime()
            });
        });

        this.video.addEventListener('canplay', () => {
            if (!this.isChangingQuality) {
                this.hideLoading();
            }

            // Update time display when video can play
            this.updateTimeDisplay();

            // Trigger canplay event - video can start playing
            this.triggerEvent('canplay', {
                currentTime: this.getCurrentTime(),
                duration: this.getDuration()
            });
        });

        // Also add to waiting event
        this.video.addEventListener('waiting', () => {
            if (!this.isChangingQuality) {
                this.showLoading();

                // Update time display during buffering
                this.updateTimeDisplay();

                // Trigger waiting event - video is buffering
                this.triggerEvent('waiting', {
                    currentTime: this.getCurrentTime()
                });
            }
        });

        this.video.addEventListener('progress', () => {
            this.updateBuffer();
            // Trigger progress event - browser is downloading media
            this.triggerEvent('progress', {
                buffered: this.getBufferedTime(),
                duration: this.getDuration()
            });
        });

        this.video.addEventListener('durationchange', () => {
            this.updateDuration();
            // Trigger durationchange event - video duration changed
            this.triggerEvent('durationchange', {
                duration: this.getDuration()
            });
        });

        // Error events
        this.video.addEventListener('error', (e) => {
            this.onVideoError(e);
            // Trigger error event - media loading/playback error occurred
            this.triggerEvent('error', {
                code: this.video.error?.code,
                message: this.video.error?.message,
                src: this.video.currentSrc || this.video.src
            });
        });

        this.video.addEventListener('stalled', () => {
            // Trigger stalled event - browser is trying to fetch data but it's not available
            this.triggerEvent('stalled', {
                currentTime: this.getCurrentTime()
            });
        });


            this.video.addEventListener('timeupdate', () => this.updateProgress());

            this.video.addEventListener('ended', () => this.onVideoEnded());

            // Complete video click logic with doubleTapPause support (DESKTOP)
            this.video.addEventListener('click', () => {
                if (!this.options.pauseClick) return;

                if (this.options.doubleTapPause) {
                    // DOUBLE TAP MODE: primo click mostra controlli, secondo pausa
                    const controlsVisible = this.controls && this.controls.classList.contains('show');

                    if (controlsVisible) {
                        // Controlbar VISIBILE - pausa video
                        this.togglePlayPause();
                    } else {
                        // Controlbar NASCOSTA - solo mostra controlli
                        this.showControlsNow();
                        this.resetAutoHideTimer();
                    }
                } else {
                    // NORMAL MODE: sempre pausa (comportamento originale)
                    this.togglePlayPause();
                }
            });
            this.video.addEventListener('volumechange', () => this.updateVolumeSliderVisual());

            // Complete touch logic with doubleTapPause support (MOBILE)
            this.video.addEventListener('touchend', (e) => {
                // Prevent click event from firing after touchend
                e.preventDefault();

                if (!this.options.pauseClick) return;

                if (this.options.doubleTapPause) {
                    // DOUBLE TAP MODE: primo tap mostra controlli, secondo pausa (SAME as desktop)
                    const controlsVisible = this.controls && this.controls.classList.contains('show');

                    if (controlsVisible) {
                        // Controlbar VISIBILE - pausa video
                        this.togglePlayPause();
                    } else {
                        // Controlbar NASCOSTA - solo mostra controlli
                        this.showControlsNow();
                        this.resetAutoHideTimer();
                    }
                } else {
                    // NORMAL MODE: sempre pausa (comportamento originale, SAME as desktop)
                    this.togglePlayPause();
                }
            });

            // CRITICAL: Start auto-hide when video starts playing
            this.video.addEventListener('play', () => {
                if (this.options.autoHide && this.autoHideInitialized) {
                    this.showControlsNow();
                    this.resetAutoHideTimer();
                }
            });

            // Picture-in-Picture Events
            this.video.addEventListener('enterpictureinpicture', () => {
                this.onEnterPiP();
                this.triggerEvent('pipchange', {
                    active: true,
                    mode: 'enter'
                });
            });

            this.video.addEventListener('leavepictureinpicture', () => {
                this.onLeavePiP();
                this.triggerEvent('pipchange', {
                    active: false,
                    mode: 'exit'
                });
            });
        }

        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        }

        if (this.muteBtn) {
            this.muteBtn.addEventListener('click', () => this.toggleMute());
        }

        if (this.fullscreenBtn) {
            this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }

        if (this.pipBtn) {
            this.pipBtn.addEventListener('click', () => this.togglePictureInPicture());
        }

    if (this.volumeSlider) {
        let isDraggingVolume = false;

        // Input event
        this.volumeSlider.addEventListener('input', (e) => {
            this.updateVolume(e.target.value);
            this.updateVolumeSliderVisual();
            this.initVolumeTooltip();
        });

        // MOUSE DRAG - Start
        this.volumeSlider.addEventListener('mousedown', (e) => {
            isDraggingVolume = true;
            if (this.volumeTooltip) {
                this.volumeTooltip.classList.add('visible');
            }
        });

        // MOUSE DRAG - Move
        document.addEventListener('mousemove', (e) => {
            if (isDraggingVolume && this.volumeSlider) {
                const rect = this.volumeSlider.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = Math.max(0, Math.min(1, clickX / rect.width));
                const value = Math.round(percentage * 100);

                this.volumeSlider.value = value;
                this.updateVolume(value);
                this.updateVolumeSliderVisual();
                if (this.volumeTooltip) {
                    this.updateVolumeTooltipPosition(value / 100);
                }
            }
        });

        // MOUSE DRAG - End
        document.addEventListener('mouseup', () => {
            if (isDraggingVolume) {
                isDraggingVolume = false;
                if (this.volumeTooltip) {
                    setTimeout(() => {
                        this.volumeTooltip.classList.remove('visible');
                    }, 300);
                }
            }
        });

        // TOUCH DRAG - Start
        this.volumeSlider.addEventListener('touchstart', (e) => {
            isDraggingVolume = true;
            if (this.volumeTooltip) {
                this.volumeTooltip.classList.add('visible');
            }
        }, { passive: true });

        // TOUCH DRAG - Move
        this.volumeSlider.addEventListener('touchmove', (e) => {
            if (isDraggingVolume) {
                const touch = e.touches[0];
                const rect = this.volumeSlider.getBoundingClientRect();
                const touchX = touch.clientX - rect.left;
                const percentage = Math.max(0, Math.min(1, touchX / rect.width));
                const value = Math.round(percentage * 100);

                this.volumeSlider.value = value;
                this.updateVolume(value);
                this.updateVolumeSliderVisual();
                if (this.volumeTooltip) {
                    this.updateVolumeTooltipPosition(value / 100);
                }
            }
        }, { passive: true });

        // TOUCH DRAG - End
        this.volumeSlider.addEventListener('touchend', () => {
            if (isDraggingVolume) {
                isDraggingVolume = false;
                if (this.volumeTooltip) {
                    setTimeout(() => {
                        this.volumeTooltip.classList.remove('visible');
                    }, 300);
                }
            }
        }, { passive: true });
    }

    if (this.progressContainer) {
        // Mouse events (desktop)
        this.progressContainer.addEventListener('click', (e) => this.seek(e));
        this.progressContainer.addEventListener('mousedown', (e) => this.startSeeking(e));
        if (this.progressHandle) {
            this.progressHandle.addEventListener('mousedown', this.startSeeking.bind(this));
            this.progressHandle.addEventListener('touchstart', this.startSeeking.bind(this), { passive: false });
        }

        // Touch events (mobile)
        this.progressContainer.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent scrolling when touching the seek bar
            this.startSeeking(e);
        }, { passive: false });

        this.setupSeekTooltip();
    }

    // Add touch events directly on the handle for better mobile dragging
    if (this.progressHandle) {
        this.progressHandle.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent default touch behavior
            e.stopPropagation(); // Stop event from bubbling to progressContainer
            this.startSeeking(e);
        }, { passive: false });
    }

        // NOTE: Auto-hide events are handled in initAutoHide() after everything is ready

        if (this.speedMenu) {
            this.speedMenu.addEventListener('click', (e) => this.changeSpeed(e));
        }

        if (this.qualityMenu) {
            this.qualityMenu.addEventListener('click', (e) => this.changeQuality(e));
        }

        if (this.subtitlesMenu) {
            this.subtitlesMenu.addEventListener('click', (e) => this.handleSubtitlesMenuClick(e));
        }

        document.addEventListener('fullscreenchange', () => this.updateFullscreenButton());
        document.addEventListener('webkitfullscreenchange', () => this.updateFullscreenButton());
        document.addEventListener('mozfullscreenchange', () => this.updateFullscreenButton());

        document.addEventListener('mousemove', (e) => this.continueSeeking(e));
    document.addEventListener('mouseup', () => this.endSeeking());

    // Touch events for seeking (mobile)
    document.addEventListener('touchmove', (e) => {
        if (this.isUserSeeking) {
            e.preventDefault(); // Prevent scrolling while seeking
            this.continueSeeking(e);
        }
    }, { passive: false });

    document.addEventListener('touchend', () => this.endSeeking());
    document.addEventListener('touchcancel', () => this.endSeeking());

    }

/* Controls Module for MYETV Video Player 
 * Conservative modularization - original code preserved exactly
 * Created by https://www.myetv.tv https://oskarcosimo.com 
 */

/* AUTO-HIDE SYSTEM */
initAutoHide() {
    if (!this.options.autoHide) {
        if (this.options.debug) console.log('Auto-hide disabled in options');
        return;
    }

    if (this.autoHideInitialized) {
        if (this.options.debug) console.log('Auto-hide already initialized');
        return;
    }

    if (this.options.debug) console.log('Initializing auto-hide system');

    // CHECK DOM ELEMENTS EXISTENCE
    if (!this.container) {
        if (this.options.debug) console.error('Container not found! Auto-hide cannot work');
        return;
    }

    if (!this.controls) {
        if (this.options.debug) console.error('Controls not found! Auto-hide cannot work');
        return;
    }

    if (this.options.debug) console.log('DOM elements verified:', {
        container: !!this.container,
        controls: !!this.controls,
        video: !!this.video
    });

    // Show controls initially
    this.showControlsNow();

    // Event listener for mousemove
    this.container.addEventListener('mousemove', (e) => {
        if (this.autoHideDebug) {
            if (this.options.debug) console.log('Mouse movement in container - reset timer');
        }
        this.onMouseMoveInPlayer(e);
    });

    if (this.options.debug) console.log('📡 Event listener mousemove added to container');

    // Event listener for mouseenter/mouseleave
    this.controls.addEventListener('mouseenter', (e) => {
        if (this.autoHideDebug) {
            if (this.options.debug) console.log('Mouse ENTERS controls - cancel timer');
        }
        this.onMouseEnterControls(e);
    });

    this.controls.addEventListener('mouseleave', (e) => {
        if (this.autoHideDebug) {
            if (this.options.debug) console.log('Mouse EXITS controls - restart timer');

            // Touch events for mobile devices
            this.container.addEventListener('touchstart', () => {
                this.showControlsNow();
                this.resetAutoHideTimer();
            });

            this.container.addEventListener('touchend', () => {
                this.resetAutoHideTimer();
            });
        }
        this.onMouseLeaveControls(e);
    });

    if (this.options.debug) console.log('Event listener mouseenter/mouseleave added to controls');

    this.autoHideInitialized = true;
    if (this.options.debug) console.log('Auto-hide system fully initialized');

    // Test
    this.resetAutoHideTimer();
    if (this.options.debug) console.log('Initial timer started');
}

onMouseMoveInPlayer(e) {
    this.showControlsNow();
    this.showCursor();
    this.resetAutoHideTimer();
}

onMouseEnterControls(e) {
    this.mouseOverControls = true;
    this.showControlsNow();

    if (this.autoHideTimer) {
        clearTimeout(this.autoHideTimer);
        this.autoHideTimer = null;
        if (this.autoHideDebug) {
            if (this.options.debug) console.log('Auto-hide timer cancelled');
        }
    }
}

onMouseLeaveControls(e) {
    this.mouseOverControls = false;
    this.resetAutoHideTimer();
}

resetAutoHideTimer() {
    if (this.autoHideTimer) {
        clearTimeout(this.autoHideTimer);
        this.autoHideTimer = null;
    }

    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (this.mouseOverControls && !isTouchDevice) {
        if (this.autoHideDebug && this.options.debug) console.log('Not starting timer - mouse on controls');
        return;
    }

    // Allow timer if video is paused at start (autoplay blocked)
    if (this.video && this.video.paused) {
        const isInitialPause = this.video.currentTime === 0 && !this.video.ended;

        if (!isInitialPause) {
            if (this.autoHideDebug && this.options.debug) console.log('Not starting timer - video paused by user');
            return;
        }

        if (this.autoHideDebug && this.options.debug) {
            console.log('Video paused but at start - allowing timer (autoplay blocked)');
        }
    }

    // Start timer
    this.autoHideTimer = setTimeout(() => {
        if (this.autoHideDebug && this.options.debug) {
            console.log(`Timer expired after ${this.options.autoHideDelay}ms - hiding controls`);
        }
        this.hideControlsNow();
    }, this.options.autoHideDelay);

    if (this.autoHideDebug && this.options.debug) {
        console.log(`Auto-hide timer started (${this.options.autoHideDelay}ms)`);
    }
}

showControlsNow() {
    if (this.controls) {
        this.controls.classList.add('show');

        // Add has-controls class to container (for watermark visibility)
        if (this.container) {
            this.container.classList.add('has-controls');
        }

        this.updateControlbarHeight();

        // Update watermark position
        if (this.updateWatermarkPosition) {
            this.updateWatermarkPosition();
        }

        // Show title overlay with controls (if not persistent)
        if (this.options.showTitleOverlay && !this.options.persistentTitle && this.options.videoTitle) {
            this.showTitleOverlay();
        }

        // *show cursor when controls are shown*
        this.showCursor();

        if (this.autoHideDebug && this.options.debug) console.log('Controls shown');
    }
}

hideControlsNow() {
    // Dont hide if mouse is still over controls (allow hiding on touch devices)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (this.mouseOverControls && !isTouchDevice) {
        if (this.autoHideDebug && this.options.debug) console.log('❌ Not hiding - mouse still over controls');
        return;
    }

    // Dont hide if video is paused
    if (this.video && this.video.paused) {
        if (this.autoHideDebug && this.options.debug) console.log('❌ Not hiding - video is paused');
        return;
    }

    if (this.controls) {
        this.controls.classList.remove('show');

        // Remove has-controls class from container (for watermark visibility)
        if (this.container) {
            this.container.classList.remove('has-controls');
        }

        this.updateControlbarHeight();

        // Update watermark position
        if (this.updateWatermarkPosition) {
            this.updateWatermarkPosition();
        }

        // Hide title overlay with controls (if not persistent)
        if (this.options.showTitleOverlay && !this.options.persistentTitle) {
            this.hideTitleOverlay();
        }

        // *hide cursor after controls are hidden*
        this.hideCursor();

        if (this.autoHideDebug && this.options.debug) console.log('Controls hidden');
    }
}

showControls() {
    this.showControlsNow();
    this.resetAutoHideTimer();
}

hideControls() {
    this.hideControlsNow();
}

hideControlsWithDelay() {
    this.resetAutoHideTimer();
}

clearControlsTimeout() {
    if (this.autoHideTimer) {
        clearTimeout(this.autoHideTimer);
        this.autoHideTimer = null;
    }
}

// Default controlbar styles injection
injectDefaultControlbarStyles() {
    if (document.getElementById('default-controlbar-styles')) return;

    const controlBarOpacity = Math.max(0, Math.min(1, this.options.controlBarOpacity));
    const titleOverlayOpacity = Math.max(0, Math.min(1, this.options.titleOverlayOpacity));

    const style = document.createElement('style');
    style.id = 'default-controlbar-styles';
    style.textContent = `
        .video-wrapper:not(.youtube-active):not(.vimeo-active):not(.facebook-active) .controls {
            background: linear-gradient(
                to top,
                rgba(0, 0, 0, ${controlBarOpacity}) 0%,
                rgba(0, 0, 0, ${controlBarOpacity * 0.89}) 20%,
                rgba(0, 0, 0, ${controlBarOpacity * 0.74}) 40%,
                rgba(0, 0, 0, ${controlBarOpacity * 0.53}) 60%,
                rgba(0, 0, 0, ${controlBarOpacity * 0.32}) 80%,
                rgba(0, 0, 0, ${controlBarOpacity * 0.21}) 100%
            );
            backdrop-filter: blur(3px);
            min-height: 60px;
            padding-bottom: 10px;
        }

        .video-wrapper:not(.youtube-active):not(.vimeo-active):not(.facebook-active) .title-overlay {
            background: linear-gradient(
                to bottom,
                rgba(0, 0, 0, ${titleOverlayOpacity}) 0%,
                rgba(0, 0, 0, ${titleOverlayOpacity * 0.89}) 20%,
                rgba(0, 0, 0, ${titleOverlayOpacity * 0.74}) 40%,
                rgba(0, 0, 0, ${titleOverlayOpacity * 0.53}) 60%,
                rgba(0, 0, 0, ${titleOverlayOpacity * 0.32}) 80%,
                rgba(0, 0, 0, ${titleOverlayOpacity * 0.21}) 100%
            );
            backdrop-filter: blur(3px);
            min-height: 80px;
            padding-top: 20px;
        }
        
        /* ✅ NEW: Set CSS custom property for top bar opacity */
        .video-wrapper {
            --player-topbar-opacity: ${titleOverlayOpacity};
        }
    `;
    document.head.appendChild(style);
}

// Debug methods
enableAutoHideDebug() {
    this.autoHideDebug = true;
    if (this.options.debug) console.log('AUTO-HIDE DEBUG ENABLED');
    if (this.options.debug) console.log('Stato attuale:', {
        initialized: this.autoHideInitialized,
        autoHide: this.options.autoHide,
        delay: this.options.autoHideDelay,
        mouseOverControls: this.mouseOverControls,
        timerActive: !!this.autoHideTimer,
        container: !!this.container,
        controls: !!this.controls,
        video: !!this.video,
        videoPaused: this.video ? this.video.paused : 'N/A'
    });

    if (!this.autoHideInitialized) {
        if (this.options.debug) console.log('Auto-hide NOT yet initialized! Initializing now...');
        this.initAutoHide();
    }
}

disableAutoHideDebug() {
    this.autoHideDebug = false;
    if (this.options.debug) console.log('Auto-hide debug disabled');
}

testAutoHide() {
    if (this.options.debug) console.log('TEST AUTO-HIDE COMPLETED:');
    if (this.options.debug) console.log('System status:', {
        initialized: this.autoHideInitialized,
        autoHide: this.options.autoHide,
        delay: this.options.autoHideDelay,
        mouseOverControls: this.mouseOverControls,
        timerActive: !!this.autoHideTimer
    });

    if (this.options.debug) console.log('Elementi DOM:', {
        container: !!this.container,
        controls: !!this.controls,
        video: !!this.video
    });

    if (this.options.debug) console.log('Stato video:', {
        paused: this.video ? this.video.paused : 'N/A',
        currentTime: this.video ? this.video.currentTime : 'N/A',
        duration: this.video ? this.video.duration : 'N/A'
    });

    if (!this.autoHideInitialized) {
        if (this.options.debug) console.log('PROBLEM: Auto-hide not initialized!');
        if (this.options.debug) console.log('Forcing initialization...');
        this.initAutoHide();
    } else {
        if (this.options.debug) console.log('Auto-hide initialized correctly');
        if (this.options.debug) console.log('Forcing timer reset for test...');
        this.resetAutoHideTimer();
    }
}

/* SUBTITLES UI MANAGEMENT */
updateSubtitlesUI() {
    const subtitlesControl = this.controls?.querySelector('.subtitles-control');

    if (this.textTracks.length > 0 && this.options.showSubtitles) {
        if (subtitlesControl) {
            subtitlesControl.style.display = 'block';
        }
        this.populateSubtitlesMenu();
    } else {
        if (subtitlesControl) {
            subtitlesControl.style.display = 'none';
        }
    }
}

populateSubtitlesMenu() {
    const subtitlesMenu = this.controls?.querySelector('.subtitles-menu');
    if (!subtitlesMenu) return;

    let menuHTML = `<div class="subtitles-option ${!this.subtitlesEnabled ? 'active' : ''}" data-track="off">${this.t('subtitlesoff') || 'Off'}</div>`;

    this.textTracks.forEach((trackData, index) => {
        const isActive = this.currentSubtitleTrack === trackData.track;
        menuHTML += `<div class="subtitles-option ${isActive ? 'active' : ''}" data-track="${index}">${trackData.label}</div>`;
    });

    subtitlesMenu.innerHTML = menuHTML;
}

toggleSubtitles() {
    if (this.textTracks.length === 0) return;

    if (this.subtitlesEnabled) {
        this.disableSubtitles();
    } else {
        this.enableSubtitleTrack(0);
    }
}

updateSubtitlesButton() {
    const subtitlesBtn = this.controls?.querySelector('.subtitles-btn');
    if (!subtitlesBtn) return;

    if (this.subtitlesEnabled) {
        subtitlesBtn.classList.add('active');
        subtitlesBtn.title = this.t('subtitlesdisable') || 'Disable subtitles';
    } else {
        subtitlesBtn.classList.remove('active');
        subtitlesBtn.title = this.t('subtitlesenable') || 'Enable subtitles';
    }
}

handleSubtitlesMenuClick(e) {
    if (!e.target.classList.contains('subtitles-option')) return;

    const trackData = e.target.getAttribute('data-track');

    if (trackData === 'off') {
        this.disableSubtitles();
    } else {
        const trackIndex = parseInt(trackData);
        this.enableSubtitleTrack(trackIndex);
    }
}

/* PLAYER CONTROLS SETUP */
hideNativePlayer() {
    this.video.controls = false;
    this.video.setAttribute('controls', 'false');
    this.video.removeAttribute('controls');
    this.video.style.visibility = 'hidden';
    this.video.style.opacity = '0';
    this.video.style.pointerEvents = 'none';
    this.video.classList.add('video-player');
}

createControls() {
    const controlsId = `videoControls-${this.getUniqueId()}`;

    const controlsHTML = `
        <div class="controls" id="${controlsId}">
            <div class="progress-container">
    <div class="progress-bar">
        <div class="progress-buffer"></div>
        <div class="progress-filled"></div>
    </div>
    <div class="progress-handle progress-handle-${this.options.seekHandleShape}"></div>
    ${this.options.showSeekTooltip ? '<div class="seek-tooltip">0:00</div>' : ''}
</div>

            <div class="controls-main">
                <div class="controls-left">
    ${this.options.playFromStartButton ? `
<button class="control-btn play-from-start-btn" data-tooltip="restart_video">
    <span class="icon restart-icon">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
        </svg>
    </span>
</button>
` : ''}

<button class="control-btn play-pause-btn" data-tooltip="play_pause">
    <span class="icon play-icon"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>
    <span class="icon pause-icon hidden"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg></span>
</button>

    <button class="control-btn mute-btn" data-tooltip="mute_unmute">
        <span class="icon volume-icon"><svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303z"/><path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89z"/><path d="M10.025 8a4.486 4.486 0 0 1-1.318 3.182L8 10.475A3.489 3.489 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.486 4.486 0 0 1 10.025 8M7 4a.5.5 0 0 0-.812-.39L3.825 5.5H1.5A.5.5 0 0 0 1 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 7 12z"/></svg></span>
        <span class="icon mute-icon hidden"><svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06m7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0"/></svg></span>
    </button>

    <div class="volume-container" data-mobile-slider="${this.options.volumeSlider}">
        <input type="range" class="volume-slider" min="0" max="100" value="100" data-tooltip="volume">
    </div>

    <div class="time-display">
    <span class="current-time">00:00</span>
    <span class="duration">00:00</span>
</div>
</div>

                <div class="controls-right">
<button class="control-btn playlist-prev-btn" data-tooltip="prevvideo" style="display: none;">
    <span class="icon"><svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M3.5 12V4l7 4zm8-8v8l-7-4z"/></svg></span>
</button>
<button class="control-btn playlist-next-btn" data-tooltip="nextvideo" style="display: none;">
    <span class="icon"><svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M12.5 4v8l-7-4zm-8 0v8l7-4z"/></svg></span>
</button>

${(this.options.showQualitySelector && this.originalSources && this.originalSources.length > 1) || this.options.adaptiveQualityControl ? `
                    <div class="quality-control">
                        <button class="control-btn quality-btn" data-tooltip="video_quality">
                            <div class="quality-btn-text">
                                <div class="selected-quality">${this.t('auto')}</div>
                                <div class="current-quality"></div>
                            </div>
                        </button>
                        <div class="quality-menu">
                            <div class="quality-option selected" data-quality="auto">${this.t('auto')}</div>
                            ${this.originalSources.map(s =>
                                `<div class="quality-option" data-quality="${s.quality}">${s.quality}</div>`
                            ).join('')}
                        </div>
                    </div>
                    ` : ''}

                    ${this.options.showPictureInPicture && this.isPiPSupported ? `
                    <button class="control-btn pip-btn" data-tooltip="picture_in_picture">
                        <span class="icon pip-icon"><svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5zM1.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5z"/><path d="M8 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5z"/></svg></span>
                        <span class="icon pip-exit-icon hidden"><svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5zM1.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5z"/></svg></span>
                    </button>
                    ` : ''}

                    ${this.options.showFullscreen ? `
                    <button class="control-btn fullscreen-btn" data-tooltip="fullscreen">
                        <span class="icon fullscreen-icon"><svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5M.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5"/></svg></span>
                        <span class="icon exit-fullscreen-icon hidden"><svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5m5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5M0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5m10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0z"/></svg></span>
                    </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    this.container.insertAdjacentHTML('beforeend', controlsHTML);
    this.controls = document.getElementById(controlsId);

    // NEW: Initialize responsive settings menu
    setTimeout(() => {
        this.initializeResponsiveMenu();
        this.updateControlbarHeight();
    }, 100);
}

/* Initialize responsive menu with dynamic width calculation */
initializeResponsiveMenu() {
    if (!this.controls) return;

    // Track screen size
    this.isSmallScreen = false;

    // Check initial size
    this.checkScreenSize();

    // Bind resize handler with updateControlbarHeight
    const resizeHandler = () => {
        this.checkScreenSize();
        this.updateControlbarHeight();
    };

    // Bind del context
    this.resizeHandler = resizeHandler.bind(this);
    window.addEventListener('resize', this.resizeHandler);

    // Bind events for settings menu
    this.bindSettingsMenuEvents();
}

// Dynamic controlbar height tracking for watermark positioning
updateControlbarHeight() {
    if (!this.controls) return;

    const height = this.controls.offsetHeight;
    if (this.container) {

        this.container.style.setProperty('--player-controls-height', `${height}px`);

        const watermark = this.container.querySelector('.video-watermark.watermark-bottomleft, .video-watermark.watermark-bottomright');
        if (watermark) {
            const hasControls = this.container.classList.contains('has-controls');
            const isHideOnAutoHide = watermark.classList.contains('hide-on-autohide');

            if (hasControls || !isHideOnAutoHide) {
                watermark.style.bottom = `${height + 15}px`;
            } else {
                watermark.style.bottom = '15px';
            }
        }
    }

    if (this.options.debug) {
        console.log(`Controlbar height updated: ${height}px`);
    }
}

/* Dynamic width calculation based on logo presence */
getResponsiveThreshold() {
    // Check if brand logo is enabled and present
    const hasLogo = this.options.brandLogoEnabled && this.options.brandLogoUrl;

    // If logo is present, use higher threshold (650px), otherwise 550px
    return hasLogo ? 650 : 550;
}

/* Check if screen is under dynamic threshold */
checkScreenSize() {
    const threshold = this.getResponsiveThreshold();
    const newIsSmallScreen = window.innerWidth <= threshold;

    if (newIsSmallScreen !== this.isSmallScreen) {
        this.isSmallScreen = newIsSmallScreen;
        this.updateSettingsMenuVisibility();

        if (this.options.debug) {
            console.log(`Screen check: ${window.innerWidth}px vs ${threshold}px (threshold), logo: ${this.options.brandLogoEnabled}, small: ${this.isSmallScreen}`);
        }
    }
}

/* Update settings menu visibility */
updateSettingsMenuVisibility() {
    // SEARCH IN CONTAINER
    const settingsControl = this.container?.querySelector('.settings-control');

    if (!settingsControl) return;

    // Always show settings
    settingsControl.style.display = 'block';

    // Populate settings menu
    this.populateSettingsMenu();

    // Hide speed and subtitles controls in bottom bar
    const speedControl = this.controls.querySelector('.speed-control');
    const subtitlesControl = this.controls.querySelector('.subtitles-control');

    if (speedControl) speedControl.style.display = 'none';
    if (subtitlesControl) subtitlesControl.style.display = 'none';
}

/**
 * Populate settings menu with controls
 */
populateSettingsMenu() {
    // SEARCH IN CONTAINER
    const settingsMenu = this.container?.querySelector('.settings-menu');

    if (!settingsMenu) return;

    let menuHTML = '';

    // SPEED - always included
    if (this.options.showSpeedControl) {
        const speedLabel = this.t('playback_speed');
        const currentSpeed = this.video ? this.video.playbackRate : 1;

        menuHTML += `
            <div class="settings-expandable-wrapper">
                <div class="settings-option expandable-trigger" data-action="speed_expand">
                    <span class="settings-option-label">${speedLabel} <strong>${currentSpeed}x</strong></span>
                    <span class="expand-arrow">▼</span>
                </div>
                <div class="settings-expandable-content" style="display: none;">`;

        const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
        speeds.forEach(speed => {
            const isActive = Math.abs(speed - currentSpeed) < 0.01;
            menuHTML += `<div class="settings-suboption ${isActive ? 'active' : ''}" data-speed="${speed}">${speed}x</div>`;
        });

        menuHTML += `</div></div>`;
    }

    // SUBTITLES - always included
    if (this.options.showSubtitles && this.textTracks && this.textTracks.length > 0) {
        const subtitlesLabel = this.t('subtitles');
        const currentTrack = this.currentSubtitleTrack;
        const currentLabel = this.subtitlesEnabled ?
            (currentTrack ? currentTrack.label : 'Unknown') :
            this.t('subtitles_off'); //

        menuHTML += `
            <div class="settings-expandable-wrapper">
                <div class="settings-option expandable-trigger" data-action="subtitles_expand">
                    <span class="settings-option-label">${subtitlesLabel} <strong>${currentLabel}</strong></span>
                    <span class="expand-arrow">▼</span>
                </div>
                <div class="settings-expandable-content" style="display: none;">`;

        menuHTML += `<div class="settings-suboption ${!this.subtitlesEnabled ? 'active' : ''}" data-track="off">${this.t('subtitles_off')}</div>`;

        this.textTracks.forEach((trackData, index) => {
            const isActive = this.currentSubtitleTrack === trackData.track;
            menuHTML += `<div class="settings-suboption ${isActive ? 'active' : ''}" data-track="${index}">${trackData.label}</div>`;
        });

        menuHTML += `</div></div>`;
    }

    settingsMenu.innerHTML = menuHTML;
}

/**
 * Add scrollbar to settings menu on mobile
 */
addSettingsMenuScrollbar() {
    const settingsMenu = this.controls?.querySelector('.settings-menu');
    if (!settingsMenu) return;

    const settingsBtn = document.querySelector('.settings-btn');
    if (!settingsBtn) return;

    // helper to update menu height
    const updateMenuHeight = () => {
        if (settingsMenu.classList.contains('active')) {
            const containerRect = settingsMenu.parentElement.parentElement.getBoundingClientRect();
            const btnRect = settingsBtn.getBoundingClientRect();
            const spaceBelow = containerRect.bottom - btnRect.bottom;
            const maxMenuHeight = Math.max(100, Math.min(250, spaceBelow - 20));
            settingsMenu.style.maxHeight = `${maxMenuHeight}px`;
            settingsMenu.style.overflowY = 'auto';
            settingsMenu.style.overflowX = 'hidden';
        }
    };

    // run initially
    updateMenuHeight();

    // recalculate on window resize
    window.addEventListener('resize', updateMenuHeight);

    // Add scrollbar styling
    if (!document.getElementById('player-settings-scrollbar-style')) {
        const scrollbarStyle = document.createElement('style');
        scrollbarStyle.id = 'player-settings-scrollbar-style';
        scrollbarStyle.textContent = `
            .settings-menu::-webkit-scrollbar {
                width: 6px;
            }
            .settings-menu::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.05);
                border-radius: 3px;
            }
            .settings-menu::-webkit-scrollbar-thumb {
                background: rgba(255,255,255,0.3);
                border-radius: 3px;
            }
            .settings-menu::-webkit-scrollbar-thumb:hover {
                background: rgba(255,255,255,0.5);
            }
        `;
        document.head.appendChild(scrollbarStyle);
    }

    settingsMenu.style.scrollbarWidth = 'thin';
    settingsMenu.style.scrollbarColor = 'rgba(255,255,255,0.3) transparent';
}

/**
 * Bind settings menu events
 */
bindSettingsMenuEvents() {
    // Search in container instead of controls (for top bar)
    const settingsBtn = this.container?.querySelector('.settings-btn');
    const settingsMenu = this.container?.querySelector('.settings-menu');

    if (!settingsMenu || !settingsBtn) return;

    // Toggle menu on button click
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsMenu.classList.toggle('active');

        // When menu is opened, set max height and overflow
        if (settingsMenu.classList.contains('active')) {
            const containerRect = this.container.getBoundingClientRect();
            const btnRect = settingsBtn.getBoundingClientRect();

            // Calculate available space below the button
            const spaceBelow = containerRect.bottom - btnRect.bottom - 30; // 30px margin

            // Minimum 300px, maximum 600px or available space
            const maxMenuHeight = Math.max(300, Math.min(600, spaceBelow));

            settingsMenu.style.maxHeight = `${maxMenuHeight}px`;
            settingsMenu.style.overflowY = 'auto';
            settingsMenu.style.overflowX = 'hidden';

            if (this.options.debug) {
                console.log(`Settings menu opened: height=${maxMenuHeight}px (available=${spaceBelow}px)`);
            }
        } else {
            // Reset when closing
            settingsMenu.style.maxHeight = '600px'; // Default max height
            settingsMenu.style.overflowY = 'auto';
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsBtn?.contains(e.target) && !settingsMenu?.contains(e.target)) {
            settingsMenu?.classList.remove('active');
        }
    });

    // Manage clicks inside the menu
    settingsMenu.addEventListener('click', (e) => {
        e.stopPropagation();

        // Handle expandable triggers
        if (e.target.classList.contains('expandable-trigger') || e.target.closest('.expandable-trigger')) {
            const trigger = e.target.classList.contains('expandable-trigger') ? e.target : e.target.closest('.expandable-trigger');
            const wrapper = trigger.closest('.settings-expandable-wrapper');
            const content = wrapper.querySelector('.settings-expandable-content');
            const arrow = trigger.querySelector('.expand-arrow');

            const isExpanded = content.style.display !== 'none';

            if (isExpanded) {
                content.style.display = 'none';
                arrow.style.transform = 'rotate(0deg)';
            } else {
                content.style.display = 'block';
                arrow.style.transform = 'rotate(180deg)';
            }
            return;
        }

        // Handle direct actions (like PiP)
        if (e.target.classList.contains('settings-option') || e.target.closest('.settings-option')) {
            const option = e.target.classList.contains('settings-option') ? e.target : e.target.closest('.settings-option');
            const action = option.getAttribute('data-action');

            if (action === 'pip') {
                this.togglePictureInPicture();
                return;
            }
        }

        // Handle submenu actions
        if (e.target.classList.contains('settings-suboption')) {
            const wrapper = e.target.closest('.settings-expandable-wrapper');
            const trigger = wrapper.querySelector('.expandable-trigger');
            const action = trigger.getAttribute('data-action');

            if (action === 'speed_expand') {
                const speed = parseFloat(e.target.getAttribute('data-speed'));
                if (speed && speed > 0 && this.video && !this.isChangingQuality) {
                    this.video.playbackRate = speed;

                    // Update active states
                    wrapper.querySelectorAll('.settings-suboption').forEach(opt => opt.classList.remove('active'));
                    e.target.classList.add('active');

                    // Update trigger text
                    const label = trigger.querySelector('.settings-option-label');
                    if (label) {
                        const speedLabel = this.t('playback_speed') || 'Playback Speed';
                        label.innerHTML = `${speedLabel} <strong>${speed}x</strong>`;
                    }

                    // Trigger event
                    this.triggerEvent('speedchange', { speed, previousSpeed: this.video.playbackRate });
                }
            } else if (action === 'subtitles_expand') {
                const trackData = e.target.getAttribute('data-track');
                if (trackData === 'off') {
                    this.disableSubtitles();
                } else {
                    const trackIndex = parseInt(trackData);
                    this.enableSubtitleTrack(trackIndex);
                }

                // Update active states
                wrapper.querySelectorAll('.settings-suboption').forEach(opt => opt.classList.remove('active'));
                e.target.classList.add('active');

                // Update trigger text
                const label = trigger.querySelector('.settings-option-label');
                if (label) {
                    const subtitlesLabel = this.t('subtitles') || 'Subtitles';
                    label.innerHTML = `${subtitlesLabel} <strong>${e.target.textContent}</strong>`;
                }
            }
        }
    });
}

/* TITLE OVERLAY MANAGEMENT */
showTitleOverlay() {
    if (this.titleOverlay && this.options.videoTitle) {
        this.titleOverlay.classList.add('show');

        if (this.options.persistentTitle) {
            this.titleOverlay.classList.add('persistent');
        } else {
            this.titleOverlay.classList.remove('persistent');
        }
    }
    return this;
}

hideTitleOverlay() {
    if (this.titleOverlay) {
        this.titleOverlay.classList.remove('show');
        this.titleOverlay.classList.remove('persistent');
    }
    return this;
}

toggleTitleOverlay(show = null) {
    if (show === null) {
        return this.titleOverlay && this.titleOverlay.classList.contains('show')
            ? this.hideTitleOverlay()
            : this.showTitleOverlay();
    }

    return show ? this.showTitleOverlay() : this.hideTitleOverlay();
}

/* KEYBOARD CONTROLS */
setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        // Ignore if user is typing in an input field
        if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

        // On keyboard input, treat as mouse movement for auto-hide
        if (this.options.autoHide && this.autoHideInitialized) {
            this.showControlsNow();
            this.resetAutoHideTimer();
        }

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'KeyM':
                this.toggleMute();
                break;
            case 'KeyF':
                if (this.options.showFullscreen) {
                    this.toggleFullscreen();
                }
                break;
            case 'KeyP':
                if (this.options.showPictureInPicture && this.isPiPSupported) {
                    this.togglePictureInPicture();
                }
                break;
            case 'KeyT':
                if (this.options.showTitleOverlay) {
                    this.toggleTitleOverlay();
                }
                break;
            case 'KeyS':
                if (this.options.showSubtitles) {
                    this.toggleSubtitles();
                }
                break;
            case 'KeyD':
                this.debugQuality ? this.disableQualityDebug() : this.enableQualityDebug();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.skipTime(-10);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.skipTime(10);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.changeVolume(0.1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.changeVolume(-0.1);
                break;
        }
    });
}

/* CONTROL ACTIONS */
togglePlayPause() {
    if (!this.video || this.isChangingQuality) return;

    if (this.video.paused) {
        this.play();
    } else {
        this.pause();
    }
}

toggleMute() {
    if (!this.video) return;

    const wasMuted = this.video.muted;
    this.video.muted = !this.video.muted;

    this.updateMuteButton();
    this.updateVolumeSliderVisual();
    this.initVolumeTooltip();

    // Triggers volumechange event
    this.triggerEvent('volumechange', {
        volume: this.getVolume(),
        muted: this.isMuted(),
        previousMuted: wasMuted
    });
}

updateMuteButton() {
    if (!this.video || !this.volumeIcon || !this.muteIcon) return;

    if (this.video.muted || this.video.volume === 0) {
        this.volumeIcon.classList.add('hidden');
        this.muteIcon.classList.remove('hidden');
    } else {
        this.volumeIcon.classList.remove('hidden');
        this.muteIcon.classList.add('hidden');
    }
}

/* LOADING STATES */
showLoading() {
    if (this.loadingOverlay) {
        this.loadingOverlay.classList.add('active');
    }
}

hideLoading() {
    if (this.loadingOverlay) {
        this.loadingOverlay.classList.remove('active');
    }
}

/* FULLSCREEN CONTROLS */
toggleFullscreen() {
    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
        this.exitFullscreen();
    } else {
        this.enterFullscreen();
    }
}

updateFullscreenButton() {
    if (!this.fullscreenIcon || !this.exitFullscreenIcon) return;

    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement;

    if (isFullscreen) {
        this.fullscreenIcon.classList.add('hidden');
        this.exitFullscreenIcon.classList.remove('hidden');
    } else {
        this.fullscreenIcon.classList.remove('hidden');
        this.exitFullscreenIcon.classList.add('hidden');
    }

    // Triggers fullscreenchange event
    this.triggerEvent('fullscreenchange', {
        active: !!isFullscreen,
        mode: isFullscreen ? 'enter' : 'exit'
    });
}

/* PICTURE IN PICTURE CONTROLS */
togglePictureInPicture() {
    if (!this.isPiPSupported || !this.video) return;

    if (document.pictureInPictureElement) {
        this.exitPictureInPicture();
    } else {
        this.enterPictureInPicture();
    }
}

/* SEEK TOOLTIP MANAGEMENT */
toggleSeekTooltip(show = null) {
    if (show === null) {
        this.options.showSeekTooltip = !this.options.showSeekTooltip;
    } else {
        this.options.showSeekTooltip = show;
    }

    if (this.seekTooltip) {
        if (this.options.showSeekTooltip) {
            this.setupSeekTooltip();
        } else {
            this.seekTooltip.classList.remove('visible');
        }
    }
}

/* AUTO-HIDE CONFIGURATION */
setAutoHideDelay(delay) {
    if (typeof delay === 'number' && delay >= 0) {
        this.options.autoHideDelay = delay;
        if (this.options.debug) console.log(`Auto-hide delay set to ${delay}ms`);
    }
    return this;
}

getAutoHideDelay() {
    return this.options.autoHideDelay;
}

enableAutoHide() {
    if (!this.options.autoHide) {
        this.options.autoHide = true;
        if (!this.autoHideInitialized) {
            this.initAutoHide();
        }
        if (this.options.debug) console.log('Auto-hide enabled');
    }
    return this;
}

disableAutoHide() {
    if (this.options.autoHide) {
        this.options.autoHide = false;
        if (this.autoHideTimer) {
            clearTimeout(this.autoHideTimer);
            this.autoHideTimer = null;
        }
        this.showControlsNow();
        if (this.options.debug) console.log('Auto-hide disabled');
    }
    return this;
}

forceShowControls() {
    this.showControlsNow();
    if (this.autoHideInitialized) {
        this.resetAutoHideTimer();
    }
    return this;
}

forceHideControls() {
    if (!this.mouseOverControls && this.video && !this.video.paused) {
        this.hideControlsNow();
    }
    return this;
}

isAutoHideEnabled() {
    return this.options.autoHide;
}

isAutoHideInitialized() {
    return this.autoHideInitialized;
}

/**
 * Hide mouse cursor in player container
 * Only hides cursor in main container, not in plugin iframes
 */
hideCursor() {
    if (!this.options.hideCursor) {
        return; // Do not hide cursor if option is disabled
    }

    if (this.container) {
        this.container.classList.add('hide-cursor');
        if (this.options.debug) console.log('🖱️ Cursor hidden');
    }
}

/**
 * Show mouse cursor in player container
 */
showCursor() {
    if (this.container) {
        this.container.classList.remove('hide-cursor');
        if (this.options.debug) console.log('🖱️ Cursor shown');
    }
}

/**
 * Enable cursor hiding when controlbar is hidden
 * @returns {Object} this
 */
enableCursorHiding() {
    this.options.hideCursor = true;
    if (this.options.debug) console.log('Cursor hiding enabled');
    return this;
}

/**
 * Disable cursor hiding - cursor will always be visible
 * @returns {Object} this
 */
disableCursorHiding() {
    this.options.hideCursor = false;
    this.showCursor(); // Ensure cursor is shown immediately
    if (this.options.debug) console.log('Cursor hiding disabled');
    return this;
}

/**
 * Check if cursor hiding is enabled
 * @returns {Boolean} True if cursor hiding is enabled
 */
isCursorHidingEnabled() {
    return this.options.hideCursor;
}

/* PLAYLIST CONTROLS */
showPlaylistControls() {
    if (!this.playlistPrevBtn || !this.playlistNextBtn) return;

    this.playlistPrevBtn.style.display = 'flex';
    this.playlistNextBtn.style.display = 'flex';
    this.updatePlaylistButtons();

    if (this.options.debug) console.log('Playlist controls shown');
}

hidePlaylistControls() {
    if (!this.playlistPrevBtn || !this.playlistNextBtn) return;

    this.playlistPrevBtn.style.display = 'none';
    this.playlistNextBtn.style.display = 'none';

    if (this.options.debug) console.log('Playlist controls hidden');
}

updatePlaylistButtons() {
    if (!this.playlistPrevBtn || !this.playlistNextBtn || !this.isPlaylistActive) return;

    const canGoPrev = this.currentPlaylistIndex > 0 || this.options.playlistLoop;
    const canGoNext = this.currentPlaylistIndex < this.playlist.length - 1 || this.options.playlistLoop;

    this.playlistPrevBtn.disabled = !canGoPrev;
    this.playlistNextBtn.disabled = !canGoNext;

    // Update visual state
    if (canGoPrev) {
        this.playlistPrevBtn.style.opacity = '1';
        this.playlistPrevBtn.style.cursor = 'pointer';
    } else {
        this.playlistPrevBtn.style.opacity = '0.4';
        this.playlistPrevBtn.style.cursor = 'not-allowed';
    }

    if (canGoNext) {
        this.playlistNextBtn.style.opacity = '1';
        this.playlistNextBtn.style.cursor = 'pointer';
    } else {
        this.playlistNextBtn.style.opacity = '0.4';
        this.playlistNextBtn.style.cursor = 'not-allowed';
    }
}

/* RESPONSIVE OPTIMIZATION */
optimizeButtonsForSmallHeight() {
    const currentHeight = window.innerHeight;
    const controlsRect = this.controls.getBoundingClientRect();

    // If controlbar is taller than 40% of viewport, optimize
    if (controlsRect.height > currentHeight * 0.4) {
        this.controls.classList.add('ultra-compact');
        if (this.options.debug) console.log('Applied ultra-compact mode for height:', currentHeight);
    } else {
        this.controls.classList.remove('ultra-compact');
    }

    // Hide non-essential buttons on very small heights
    const nonEssentialButtons = this.controls.querySelectorAll('.pip-btn, .speed-control');
    if (currentHeight < 180) {
        nonEssentialButtons.forEach(btn => btn.style.display = 'none');
    } else {
        nonEssentialButtons.forEach(btn => btn.style.display = '');
    }
}

/* Controls methods for main class - All original functionality preserved exactly */

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
        if (this.options.debug) console.log('🔒 Adaptive streaming active - quality menu managed by streaming.js');
        return;
    }

    let menuHTML = '';

    // Check if adaptive streaming is active (HLS/DASH)
    if (this.isAdaptiveStream && this.adaptiveQualities && this.adaptiveQualities.length > 0) {
        // Show adaptive streaming qualities
        const currentIndex = this.getCurrentAdaptiveQuality();
        const autoSelected = currentIndex === -1 || currentIndex === null || this.selectedQuality === 'auto';
        const autoClass = autoSelected ? 'selected' : '';

        menuHTML += `<div class="quality-option ${autoClass}" data-adaptive-quality="auto">${this.t('auto')}</div>`;

        this.adaptiveQualities.forEach(quality => {
            const isSelected = currentIndex === quality.index && !autoSelected;
            const className = isSelected ? 'selected' : '';
            const label = quality.label || `${quality.height}p` || 'Unknown';
            menuHTML += `<div class="quality-option ${className}" data-adaptive-quality="${quality.index}">${label}</div>`;
        });
    } else {
        // Show standard qualities for regular videos
        const autoSelected = this.selectedQuality === 'auto';
        const autoPlaying = this.selectedQuality === 'auto' && this.currentPlayingQuality;
        let autoClass = '';
        if (autoSelected && autoPlaying) {
            autoClass = 'selected playing';
        } else if (autoSelected) {
            autoClass = 'selected';
        }

        menuHTML += `<div class="quality-option ${autoClass}" data-quality="auto">${this.t('auto')}</div>`;

        this.qualities.forEach(quality => {
            const isSelected = this.selectedQuality === quality.quality;
            const isPlaying = this.currentPlayingQuality === quality.quality;
            let className = 'quality-option';
            if (isSelected && isPlaying) {
                className += ' selected playing';
            } else if (isSelected) {
                className += ' selected';
            } else if (isPlaying) {
                className += ' playing';
            }
            menuHTML += `<div class="${className}" data-quality="${quality.quality}">${quality.quality}</div>`;
        });
    }

    qualityMenu.innerHTML = menuHTML;
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

updateAdaptiveQualityMenu() {
    const qualityMenu = this.controls?.querySelector('.quality-menu');
    if (!qualityMenu || !this.isAdaptiveStream) return;

    let menuHTML = `<div class="quality-option ${this.isAutoQuality() ? 'active' : ''}" data-adaptive-quality="auto">Auto</div>`;

    this.adaptiveQualities.forEach(quality => {
        const isActive = this.getCurrentAdaptiveQuality() === quality.index;
        menuHTML += `<div class="quality-option ${isActive ? 'active' : ''}" data-adaptive-quality="${quality.index}">${quality.label}</div>`;
    });

    qualityMenu.innerHTML = menuHTML;
}

updateAdaptiveQualityDisplay() {
    if (!this.isAdaptiveStream) return;

    const qualityBtn = this.controls?.querySelector('.quality-btn');
    if (!qualityBtn) return;

    // Determine if auto quality is active
    const isAuto = this.selectedQuality === 'auto' || this.getCurrentAdaptiveQuality() === -1;
    const currentQuality = isAuto ? this.tauto : this.getCurrentAdaptiveQualityLabel();

    const btnText = qualityBtn.querySelector('.quality-btn-text');
    if (btnText) {
        const selectedEl = btnText.querySelector('.selected-quality');
        const currentEl = btnText.querySelector('.current-quality');

        if (selectedEl) {
            selectedEl.textContent = isAuto ? this.tauto : currentQuality;
        }
        if (currentEl) {
            currentEl.textContent = currentQuality;
        }
    }
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

/* Subtitles Module for MYETV Video Player 
 * Conservative modularization - original code preserved exactly
 * Created by https://www.myetv.tv https://oskarcosimo.com 
 */

initializeSubtitles() {
    this.detectTextTracks();
    this.updateSubtitlesUI();
    this.bindSubtitleEvents();
    this.initializeCustomSubtitles();

    if (this.options.debug) console.log('📝 Detected ' + this.textTracks.length + ' subtitles traces');
}

initializeCustomSubtitles() {
    // Initialize player variables
    this.customSubtitles = [];
    this.currentCustomSubtitles = [];
    this.customSubtitlesEnabled = false;
    this.customOverlayElement = null;
    this.customUpdateInterval = null;
    this.currentCustomTrackIndex = -1;

    this.createCustomSubtitleOverlay();
    this.loadCustomSubtitleTracks();

}

createCustomSubtitleOverlay() {
    var existing = document.querySelector('.custom-subtitle-overlay');
    if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
    }

    this.customOverlayElement = document.createElement('div');
    this.customOverlayElement.className = 'custom-subtitle-overlay';

    // ENHANCED styles with responsive defaults
    this.customOverlayElement.style.cssText =
        'position: absolute;' +
        'bottom: 80px;' +
        'left: 50%;' +
        'transform: translateX(-50%);' +
        'z-index: 999;' +
        'color: white;' +
        'font-family: Arial, sans-serif;' +
        'font-size: clamp(12px, 4vw, 18px);' +
        'font-weight: bold;' +
        'text-align: center;' +
        'text-shadow: 2px 2px 4px rgba(0, 0, 0, 1);' +
        'background-color: rgba(0, 0, 0, 0.6);' +
        'padding: 8px 16px;' +
        'border-radius: 6px;' +
        'max-width: 80%;' +
        'line-height: 1.3;' +
        'white-space: pre-line;' +
        'display: none;' +
        'pointer-events: none;' +
        'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);';

    var playerContainer = this.video.parentElement;
    if (playerContainer) {
        playerContainer.style.position = 'relative';
        // ENSURE proper layer stacking
        if (!playerContainer.style.zIndex) {
            playerContainer.style.zIndex = '1';
        }
        playerContainer.appendChild(this.customOverlayElement);
    }

    if (this.options.debug) console.log('✅ Custom subtitle overlay created with responsive settings');
}

customTimeToSeconds(timeString) {
    if (!timeString) return 0;

    var parts = timeString.split(',');
    if (parts.length !== 2) return 0;

    var time = parts[0];
    var millis = parts[1];

    var timeParts = time.split(':');
    if (timeParts.length !== 3) return 0;

    var hours = parseInt(timeParts[0], 10);
    var minutes = parseInt(timeParts[1], 10);
    var seconds = parseInt(timeParts[2], 10);
    var milliseconds = parseInt(millis, 10);

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) || isNaN(milliseconds)) {
        console.error('❌ customTimeToSeconds failed for:', timeString);
        return 0;
    }

    return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

parseCustomSRT(srtText) {
    var subtitles = [];
    var normalizedText = srtText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    var blocks = normalizedText.trim().split('\n\n');

    for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        var lines = block.trim().split('\n');

        if (lines.length >= 3) {
            var timeLine = lines[1].trim();
            var timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);

            if (timeMatch) {
                var startTime = this.customTimeToSeconds(timeMatch[1]);
                var endTime = this.customTimeToSeconds(timeMatch[2]);
                var text = lines.slice(2).join('\n').trim().replace(/<[^>]*>/g, '');

                if (text && text.length > 0 && startTime < endTime) {
                    subtitles.push({
                        start: startTime,
                        end: endTime,
                        text: text
                    });
                }
            }
        }
    }

    if (this.options.debug) console.log('✅ Parsed ' + subtitles.length + ' subtitles');
    return subtitles;
}

loadCustomSubtitleTracks() {
    var self = this;
    var tracks = this.video.querySelectorAll('track[kind="subtitles"]');
    if (tracks.length === 0) return;

    tracks.forEach(function (track, index) {
        var src = track.getAttribute('src');
        var label = track.getAttribute('label') || 'Unknown';
        var srclang = track.getAttribute('srclang') || '';

        // CREA L'OGGETTO PRIMA E AGGIUNGILO SUBITO
        var trackObj = {
            label: label,
            language: srclang,
            subtitles: [],
            trackIndex: index
        };
        self.customSubtitles.push(trackObj);

        fetch(src)
            .then(function (response) {
                return response.text();
            })
            .then(function (srtText) {
                var normalizedText = srtText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                var blocks = normalizedText.trim().split('\n\n');

                for (var i = 0; i < blocks.length; i++) {
                    var block = blocks[i].trim();
                    if (!block) continue;
                    var lines = block.split('\n');

                    if (lines.length >= 3) {
                        var timeLine = lines[1].trim();
                        var timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);

                        if (timeMatch) {
                            var startParts = timeMatch[1].split(',');
                            var startTimeParts = startParts[0].split(':');
                            var startTime = parseInt(startTimeParts[0], 10) * 3600 + parseInt(startTimeParts[1], 10) * 60 + parseInt(startTimeParts[2], 10) + parseInt(startParts[1], 10) / 1000;

                            var endParts = timeMatch[2].split(',');
                            var endTimeParts = endParts[0].split(':');
                            var endTime = parseInt(endTimeParts[0], 10) * 3600 + parseInt(endTimeParts[1], 10) * 60 + parseInt(endTimeParts[2], 10) + parseInt(endParts[1], 10) / 1000;

                            var text = lines.slice(2).join('\n').trim().replace(/<[^>]*>/g, '');

                            if (text && text.length > 0 && !isNaN(startTime) && !isNaN(endTime) && startTime < endTime) {
                                trackObj.subtitles.push({
                                    start: startTime,
                                    end: endTime,
                                    text: text
                                });
                            }
                        }
                    }
                }

                if (self.options.debug) {
                    console.log('✅ Loaded ' + trackObj.subtitles.length + ' subtitles for ' + label);
                }
            })
            .catch(function (error) {
                console.error('❌ Error loading ' + label + ':', error);
            });
    });
}

sanitizeSubtitleText(text) {
    if (!text) return '';

    // Remove HTML tags
    var sanitized = text.replace(/<[^>]*>/g, '');

    // Remove styling tags common in SRT files
    sanitized = sanitized.replace(/{\\.*?}/g, '');
    sanitized = sanitized.replace(/\\N/g, '\n');

    // Clean up multiple spaces
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    // Decode HTML entities if present
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitized;
    sanitized = tempDiv.textContent || tempDiv.innerText || sanitized;

    return sanitized;
}

enableCustomSubtitleTrack(trackIndex) {
    if (trackIndex < 0 || trackIndex >= this.customSubtitles.length) return false;

    this.disableCustomSubtitles();

    this.customSubtitlesEnabled = true;
    this.currentCustomTrackIndex = trackIndex;
    this.currentCustomSubtitles = this.customSubtitles[trackIndex].subtitles;

    var self = this;
    this.customUpdateInterval = setInterval(function () {
        if (self.customSubtitlesEnabled && self.currentCustomSubtitles.length > 0) {
            self.updateCustomSubtitleDisplay();
        }
    }, 100);

    if (this.options.debug) {
        console.log('✅ Custom subtitles enabled: ' + this.customSubtitles[trackIndex].label);
    }

    return true;
}

updateCustomSubtitleDisplay() {
    if (!this.customSubtitlesEnabled || this.currentCustomSubtitles.length === 0) return;

    var currentTime = this.video.currentTime;
    var currentSubtitle = null;

    for (var i = 0; i < this.currentCustomSubtitles.length; i++) {
        var sub = this.currentCustomSubtitles[i];
        if (currentTime >= sub.start && currentTime <= sub.end) {
            currentSubtitle = sub;
            break;
        }
    }

    if (currentSubtitle) {
        this.customOverlayElement.textContent = currentSubtitle.text;
        this.customOverlayElement.style.display = 'block';
    } else {
        this.customOverlayElement.style.display = 'none';
        this.customOverlayElement.textContent = '';
    }
}

disableCustomSubtitles() {
    this.customSubtitlesEnabled = false;
    this.currentCustomTrackIndex = -1;

    if (this.customOverlayElement) {
        this.customOverlayElement.style.display = 'none';
        this.customOverlayElement.textContent = '';
    }

    if (this.customUpdateInterval) {
        clearInterval(this.customUpdateInterval);
        this.customUpdateInterval = null;
    }

    if (this.options.debug) console.log('❌ Custom subtitles disabled');
}

detectTextTracks() {
    this.textTracks = [];

    if (this.video.textTracks) {
        if (this.options.debug) console.log('🔍 Detecting text tracks... Found: ' + this.video.textTracks.length);

        for (var i = 0; i < this.video.textTracks.length; i++) {
            var track = this.video.textTracks[i];

            if (track.kind === 'subtitles' || track.kind === 'captions') {
                this.textTracks.push({
                    track: track,
                    label: track.label || 'Track ' + (i + 1),
                    language: track.language || 'unknown',
                    kind: track.kind,
                    index: i
                });
            }
        }

        if (this.options.debug) console.log('📊 Total subtitle tracks detected: ' + this.textTracks.length);
    }
}

enableSubtitleTrack(trackIndex) {
    if (trackIndex < 0 || trackIndex >= this.textTracks.length) return;

    // Disable all tracks first
    this.disableAllTracks();

    // Enable ONLY the custom subtitle system (not native browser)
    var success = this.enableCustomSubtitleTrack(trackIndex);

    if (success) {
        this.currentSubtitleTrack = this.textTracks[trackIndex].track;
        this.subtitlesEnabled = true;

        // Make sure native tracks stay DISABLED
        if (this.video.textTracks && this.video.textTracks[trackIndex]) {
            this.video.textTracks[trackIndex].mode = 'disabled'; // Keep native disabled
        }

        this.updateSubtitlesButton();
        this.populateSubtitlesMenu();

        if (this.options.debug) {
            console.log('✅ Custom subtitles enabled:', this.textTracks[trackIndex].label);
        }

        // Trigger subtitle change event
        this.triggerEvent('subtitlechange', {
            enabled: true,
            trackIndex: trackIndex,
            trackLabel: this.textTracks[trackIndex].label,
            trackLanguage: this.textTracks[trackIndex].language
        });
    } else {
        if (this.options.debug) {
            console.error('❌ Failed to enable custom subtitles for track', trackIndex);
        }
    }
}

disableSubtitles() {
    this.disableCustomSubtitles();
    this.disableAllTracks();

    this.currentSubtitleTrack = null;
    this.subtitlesEnabled = false;

    this.updateSubtitlesButton();
    this.populateSubtitlesMenu();

    if (this.options.debug) console.log('📝 Subtitles disabled');

    this.triggerEvent('subtitlechange', {
        enabled: false,
        trackIndex: -1
    });
}

disableAllTracks() {
    if (!this.video || !this.video.textTracks) return;

    // Disable all native tracks
    for (var i = 0; i < this.video.textTracks.length; i++) {
        this.video.textTracks[i].mode = 'hidden';
    }

    // Also disable custom subtitles
    this.disableCustomSubtitles();
}

getAvailableSubtitles() {
    return this.textTracks.map(function (t) {
        return {
            label: t.label,
            language: t.language,
            kind: t.kind
        };
    });
}

setSubtitleTrack(trackIndex) {
    if (trackIndex === -1) {
        this.disableSubtitles();
    } else {
        this.enableSubtitleTrack(trackIndex);
    }
    return this;
}

getCurrentSubtitleTrack() {
    if (!this.subtitlesEnabled || !this.currentSubtitleTrack) return -1;

    for (var i = 0; i < this.textTracks.length; i++) {
        if (this.textTracks[i].track === this.currentSubtitleTrack) {
            return i;
        }
    }
    return -1;
}

isSubtitlesEnabled() {
    return this.subtitlesEnabled;
}

updateSubtitlesButton() {
    var subtitlesBtn = this.controls && this.controls.querySelector('.subtitles-btn');
    if (!subtitlesBtn) return;

    subtitlesBtn.classList.remove('active');

    if (this.subtitlesEnabled) {
        subtitlesBtn.title = this.t('subtitlesdisable');
    } else {
        subtitlesBtn.title = this.t('subtitlesenable');
    }
}

populateSubtitlesMenu() {
    var subtitlesMenu = this.controls && this.controls.querySelector('.subtitles-menu');
    if (!subtitlesMenu) return;

    var menuHTML = '<div class="subtitles-option ' + (!this.subtitlesEnabled ? 'active' : '') + '" data-track="off">Off</div>';

    for (var i = 0; i < this.textTracks.length; i++) {
        var trackData = this.textTracks[i];
        var isActive = this.currentSubtitleTrack === trackData.track;
        menuHTML += '<div class="subtitles-option ' + (isActive ? 'active' : '') + '" data-track="' + i + '">' + trackData.label + '</div>';
    }

    subtitlesMenu.innerHTML = menuHTML;
}

updateSubtitlesUI() {
    var subtitlesControl = this.controls && this.controls.querySelector('.subtitles-control');

    if (this.textTracks.length > 0 && this.options.showSubtitles) {
        if (subtitlesControl) subtitlesControl.style.display = 'block';
        this.populateSubtitlesMenu();
    } else {
        if (subtitlesControl) subtitlesControl.style.display = 'none';
    }

    this.updateSubtitlesButton();
}

bindSubtitleEvents() {
    var self = this;

    if (this.video.textTracks) {
        this.isChangingSubtitles = false; // flag to prevent loops

        this.video.textTracks.addEventListener('change', function () {
            // ignore changes initiated by the player itself
            if (self.isChangingSubtitles) {
                return;
            }

            // only update ui
            self.updateSubtitlesUI();
        });
    }

    // Add timeupdate listener for custom subtitle display
    this.video.addEventListener('timeupdate', () => {
        if (this.customSubtitlesEnabled) {
            this.updateCustomSubtitleDisplay();
        }
    });

    // Menu click events
    var subtitlesMenu = this.controls && this.controls.querySelector('.subtitles-menu');
    if (subtitlesMenu) {
        subtitlesMenu.addEventListener('click', function (e) {
            var option = e.target.closest('.subtitles-option');
            if (!option) return;

            self.isChangingSubtitles = true; // active flag

            var trackIndex = option.getAttribute('data-track');
            if (trackIndex === 'off') {
                self.disableSubtitles();
            } else {
                self.enableSubtitleTrack(parseInt(trackIndex));
            }

            setTimeout(function () {
                self.isChangingSubtitles = false; // disable flag
            }, 100);
        });
    }
}

handleSubtitlesMenuClick(e) {
    var option = e.target.closest('.subtitles-option');
    if (!option) return; // This prevents button clicks from toggling

    var trackIndex = option.getAttribute('data-track');

    if (trackIndex === 'off') {
        this.disableSubtitles();
    } else {
        // Don't check for 'toggle' - just enable the track
        this.enableSubtitleTrack(parseInt(trackIndex));
    }

    this.updateSubtitlesButton();
    this.populateSubtitlesMenu();
}

toggleSubtitles() {
    if (this.textTracks.length === 0) return;

    if (this.subtitlesEnabled) {
        this.disableSubtitles();
    } else {
        this.enableSubtitleTrack(0);
    }
}

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
    if (!this.progressContainer || !this.video || !this.chapters) return;

    const duration = this.video.duration;
    if (!duration || isNaN(duration)) {
        // Wait for metadata
        const loadedMetadataHandler = () => {
            this.createChapterMarkers();
            this.video.removeEventListener('loadedmetadata', loadedMetadataHandler);
        };
        this.video.addEventListener('loadedmetadata', loadedMetadataHandler);
        return;
    }

    // Remove existing markers
    const existingMarkers = this.progressContainer.querySelector('.chapter-markers-container');
    if (existingMarkers) {
        existingMarkers.remove();
    }

    // Create container for chapter segments
    const markersContainer = document.createElement('div');
    markersContainer.className = 'chapter-markers-container';

    // Create segments for each chapter
    this.chapters.forEach((chapter, index) => {
        const nextChapter = this.chapters[index + 1];
        const startPercent = (chapter.time / duration) * 100;
        const endPercent = nextChapter ? (nextChapter.time / duration) * 100 : 100;

        // Calculate segment width minus the gap
        const gapSize = nextChapter ? 6 : 0; // 6px gap between segments
        const widthPercent = endPercent - startPercent;

        // Create segment container
        const segment = document.createElement('div');
        segment.className = 'chapter-segment';
        segment.style.cssText = `
            position: absolute;
            left: ${startPercent}%;
            top: 0;
            width: calc(${widthPercent}% - ${gapSize}px);
            height: 100%;
            background: rgba(255, 255, 255, 0.3);
            cursor: pointer;
            z-index: 3;
            transition: background 0.2s;
            pointer-events: none;
        `;

        segment.setAttribute('data-chapter-index', index);
        segment.setAttribute('data-chapter-time', chapter.time);
        segment.setAttribute('data-chapter-title', chapter.title);

        markersContainer.appendChild(segment);

        // Add marker at the START of next segment (transparent divider)
        if (nextChapter) {
            const marker = document.createElement('div');
            marker.className = 'chapter-marker';
            marker.style.cssText = `
                position: absolute !important;
                left: ${endPercent}% !important;
                top: 0 !important;
                width: 6px !important;
                height: 100% !important;
                background: transparent !important;
                border: none !important;
                box-shadow: none !important;
                margin-left: -3px !important;
                cursor: pointer !important;
                z-index: 10 !important;
            `;

            marker.setAttribute('data-chapter-time', nextChapter.time);
            marker.setAttribute('data-chapter-title', nextChapter.title);

            // Click on marker to jump to chapter start
            marker.addEventListener('click', (e) => {
                e.stopPropagation();
                this.jumpToChapter(index + 1);
            });

            markersContainer.appendChild(marker);
        }
    });

    // Insert markers container into progress container
    this.progressContainer.appendChild(markersContainer);
    this.chapterMarkersContainer = markersContainer;

    if (this.options.debug) {
        console.log(`Chapter markers created: ${this.chapters.length} segments`);
    }
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
 * Create chapter tooltip with title and image
 */
createChapterTooltip() {
    if (!this.progressContainer) return;

    // Remove existing chapter tooltip
    let chapterTooltip = this.progressContainer.querySelector('.chapter-tooltip');
    if (chapterTooltip) {
        chapterTooltip.remove();
    }

    // Create chapter tooltip container (positioned ABOVE the time tooltip)
    chapterTooltip = document.createElement('div');
    chapterTooltip.className = 'chapter-tooltip';
    chapterTooltip.style.cssText = `
        position: absolute;
        bottom: calc(100% + 35px);
        left: 0;
        background: rgba(28, 28, 28, 0.95);
        color: #fff;
        border-radius: 4px;
        pointer-events: none;
        visibility: hidden;
        opacity: 0;
        z-index: 100001;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        max-width: 300px;
        overflow: hidden;
        transform: translateX(-50%);
        transition: opacity 0.15s, visibility 0.15s;
        display: flex;
        flex-direction: column;
    `;

    // Create inner content structure
    chapterTooltip.innerHTML = `
        <div class="chapter-tooltip-content" style="display: flex; flex-direction: column; gap: 8px; padding: 8px;">
            <div class="chapter-tooltip-image" style="
                width: 100%;
                height: 120px;
                background-size: cover;
                background-position: center;
                border-radius: 3px;
                display: none;
            "></div>
            <div class="chapter-tooltip-info" style="display: flex; flex-direction: column; gap: 4px;">
                <div class="chapter-tooltip-title" style="
                    font-size: 13px;
                    font-weight: 600;
                    color: #fff;
                    max-width: 280px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                "></div>
                <div class="chapter-tooltip-time" style="
                    font-size: 12px;
                    font-weight: 400;
                    color: rgba(255, 255, 255, 0.8);
                "></div>
            </div>
        </div>
    `;

    this.progressContainer.appendChild(chapterTooltip);
    this.chapterTooltip = chapterTooltip;

    if (this.options.debug) {
        console.log('Chapter tooltip created');
    }
}

/**
 * Bind chapter-related events - tooltip on progressbar mousemove
 */
bindChapterEvents() {
    if (!this.progressContainer) return;

    // Remove existing chapter tooltip if present
    let chapterTooltip = this.progressContainer.querySelector('.chapter-tooltip-hover');
    if (chapterTooltip) {
        chapterTooltip.remove();
    }

    // Create chapter tooltip
    chapterTooltip = document.createElement('div');
    chapterTooltip.className = 'chapter-tooltip-hover';
    chapterTooltip.style.cssText = `
        position: absolute;
        bottom: calc(100% + 35px);
        left: 0;
        background: rgba(28, 28, 28, 0.95);
        color: #fff;
        border-radius: 4px;
        padding: 8px;
        pointer-events: none;
        visibility: hidden;
        opacity: 0;
        z-index: 100001;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        max-width: 300px;
        transform: translateX(-50%);
        transition: opacity 0.15s, visibility 0.15s;
    `;

    this.progressContainer.appendChild(chapterTooltip);
    this.chapterTooltip = chapterTooltip;

    // Get player container for edge detection
    const getPlayerBounds = () => {
        return this.container ? this.container.getBoundingClientRect() : null;
    };

    // Mousemove handler to show tooltip with title and image
    this.progressContainer.addEventListener('mousemove', (e) => {
        if (!this.video || !this.video.duration || !this.chapters || this.chapters.length === 0) {
            return;
        }

        const rect = this.progressContainer.getBoundingClientRect();
        const playerRect = getPlayerBounds();
        const mouseX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, mouseX / rect.width));
        const time = percentage * this.video.duration;

        // Find chapter at current time
        let currentChapter = null;
        for (let i = this.chapters.length - 1; i >= 0; i--) {
            if (time >= this.chapters[i].time) {
                currentChapter = this.chapters[i];
                break;
            }
        }

        if (currentChapter) {
            // Build tooltip HTML
            let tooltipHTML = '<div style="display: flex; flex-direction: column; gap: 6px;">';

            // Add image if available
            if (currentChapter.image) {
                tooltipHTML += `
                    <div style="
                        width: 100%;
                        height: 120px;
                        background-image: url('${currentChapter.image}');
                        background-size: cover;
                        background-position: center;
                        border-radius: 3px;
                    "></div>
                `;
            }

            // Add title
            tooltipHTML += `
                <div style="
                    font-size: 13px;
                    font-weight: 600;
                    max-width: 280px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                ">
                    ${currentChapter.title}
                </div>
            `;

            // Add time
            tooltipHTML += `
                <div style="
                    font-size: 12px;
                    font-weight: 400;
                    color: rgba(255, 255, 255, 0.8);
                ">
                    ${this.formatTime(currentChapter.time)}
                </div>
            `;

            tooltipHTML += '</div>';

            chapterTooltip.innerHTML = tooltipHTML;
            chapterTooltip.style.visibility = 'visible';
            chapterTooltip.style.opacity = '1';

            // Position tooltip with edge detection
            setTimeout(() => {
                const tooltipWidth = chapterTooltip.offsetWidth;
                const tooltipHalfWidth = tooltipWidth / 2;
                const absoluteX = e.clientX;

                if (playerRect) {
                    // Left edge
                    if (absoluteX - tooltipHalfWidth < playerRect.left) {
                        chapterTooltip.style.left = `${playerRect.left - rect.left + tooltipHalfWidth}px`;
                    }
                    // Right edge
                    else if (absoluteX + tooltipHalfWidth > playerRect.right) {
                        chapterTooltip.style.left = `${playerRect.right - rect.left - tooltipHalfWidth}px`;
                    }
                    // Normal center
                    else {
                        chapterTooltip.style.left = `${mouseX}px`;
                    }
                } else {
                    chapterTooltip.style.left = `${mouseX}px`;
                }
            }, 0);
        } else {
            chapterTooltip.style.visibility = 'hidden';
            chapterTooltip.style.opacity = '0';
        }
    });

    // Mouseleave handler
    this.progressContainer.addEventListener('mouseleave', () => {
        chapterTooltip.style.visibility = 'hidden';
        chapterTooltip.style.opacity = '0';
    });

    // Update active chapter during playback
    if (this.video) {
        this.video.addEventListener('timeupdate', () => this.updateActiveChapter());
    }

    if (this.options.debug) {
        console.log('Chapter events bound with tooltip');
    }
}

/**
 * Update chapter name in top bar subtitle dynamically
 * Shows current chapter title as subtitle in the top bar
 */
updateChapterInTitleOverlay() {
    if (!this.video || !this.chapters || this.chapters.length === 0) return;

    // Use topBar instead of old titleOverlay
    if (!this.topBar) return;

    // Find or create subtitle element in top bar
    let subtitleElement = this.topBar.querySelector('.video-subtitle');

    if (!subtitleElement) {
        // Create subtitle element if it doesn't exist
        const titleSection = this.topBar.querySelector('.top-bar-title');
        if (!titleSection) return;

        subtitleElement = document.createElement('span');
        subtitleElement.className = 'video-subtitle';
        titleSection.appendChild(subtitleElement);

        // Save reference
        this.topBarSubtitle = subtitleElement;
    }

    // Find current chapter
    const currentTime = this.video.currentTime;
    let currentChapter = null;

    for (let i = this.chapters.length - 1; i >= 0; i--) {
        if (currentTime >= this.chapters[i].time) {
            currentChapter = this.chapters[i];
            break;
        }
    }

    // Update subtitle with chapter title or hide if no chapter
    if (currentChapter) {
        subtitleElement.textContent = currentChapter.title;
        subtitleElement.style.display = 'block';
    } else {
        // Se non c'è un capitolo attivo, mostra il sottotitolo originale o nascondi
        if (this.options.videoSubtitle) {
            subtitleElement.textContent = this.options.videoSubtitle;
            subtitleElement.style.display = 'block';
        } else {
            subtitleElement.style.display = 'none';
        }
    }

    if (this.options.debug) {
        console.log('Chapter overlay updated:', currentChapter ? currentChapter.title : 'No chapter');
    }
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
    if (!this.video || !this.chapterMarkersContainer || !this.chapters) return;

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

    // Update chapter name in title overlay
    this.updateChapterInTitleOverlay();
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
    // Store reference to watermark element
    this.watermarkElement = watermark;

    // Set initial position
    this.updateWatermarkPosition();

    // Update position on window resize
    this.watermarkResizeHandler = () => {
        this.updateWatermarkPosition();
    };
    window.addEventListener('resize', this.watermarkResizeHandler);

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

    // Remove resize listener
    if (this.watermarkResizeHandler) {
        window.removeEventListener('resize', this.watermarkResizeHandler);
        this.watermarkResizeHandler = null;
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
 * Update watermark position based on current controlbar height
 * Called during window resize to keep watermark above controlbar
 */
updateWatermarkPosition() {
    if (!this.watermarkElement) return;
    if (!this.controls) return;

    const position = this.options.watermarkPosition || 'bottomright';

    // Only update bottom positions (top positions don't need adjustment)
    if (position === 'bottomleft' || position === 'bottomright') {
        const controlsHeight = this.controls.offsetHeight;
        const spacing = 15; // Same spacing used in CSS
        const bottomValue = controlsHeight + spacing;

        // Check if controls are visible
        const hasControls = this.container.classList.contains('has-controls');

        if (hasControls || !this.options.hideWatermark) {
            // Position above controlbar
            this.watermarkElement.style.bottom = `${bottomValue}px`;
        } else {
            // Position at bottom corner when controls hidden
            this.watermarkElement.style.bottom = '15px';
        }

        if (this.options.debug) {
            console.log(`🏷️ Watermark position updated: bottom ${this.watermarkElement.style.bottom}`);
        }
    }
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

async loadAdaptiveLibraries() {
        if (!this.options.adaptiveStreaming) return false;

        try {
            // Load DASH library if not already loaded
            if (!this.librariesLoaded.dash && !window.dashjs) {
                await this.loadScript(this.options.dashLibUrl);
                this.librariesLoaded.dash = true;
                if (this.options.debug) console.log('📡 Dash.js library loaded');
            }

            // Load HLS library if not already loaded
            if (!this.librariesLoaded.hls && !window.Hls) {
                await this.loadScript(this.options.hlsLibUrl);
                this.librariesLoaded.hls = true;
                if (this.options.debug) console.log('📡 HLS.js library loaded');
            }

            return true;
        } catch (error) {
            if (this.options.debug) console.error('Failed to load adaptive streaming libraries:', error);
            return false;
        }
    }

    detectStreamType(src) {
        if (!src) return null;

        const url = src.toLowerCase();
        if (url.includes('.mpd') || url.includes('dash')) {
            return 'dash';
        } else if (url.includes('.m3u8') || url.includes('hls')) {
            return 'hls';
        }
        return null;
    }

    async initializeAdaptiveStreaming(src) {
        if (!this.options.adaptiveStreaming) return false;

        this.adaptiveStreamingType = this.detectStreamType(src);

        if (!this.adaptiveStreamingType) {
            if (this.options.debug) console.log('📡 No adaptive streaming detected');
            return false;
        }

        // Load libraries first
        const librariesLoaded = await this.loadAdaptiveLibraries();
        if (!librariesLoaded) {
            if (this.options.debug) console.error('📡 Failed to load adaptive libraries');
            return false;
        }

        try {
            if (this.adaptiveStreamingType === 'dash') {
                return await this.initializeDash(src);
            } else if (this.adaptiveStreamingType === 'hls') {
                return await this.initializeHls(src);
            }
        } catch (error) {
            if (this.options.debug) console.error('📡 Adaptive streaming initialization failed:', error);
            return false;
        }

        return false;
    }

    async initializeDash(src) {
    if (!window.dashjs) {
        if (this.options.debug) console.error('📡 Dash.js not available');
        return false;
    }

    try {
        // Initialize quality selection to Auto BEFORE creating player

        // FORCE Auto mode - always reset at initialization
        this.selectedQuality = 'auto';
        this.qualityEventsInitialized = false;

        if (this.options.debug) {
            console.log('🔍 initializeDash - FORCED selectedQuality to:', this.selectedQuality);
        }

        // Destroy existing DASH player
        if (this.dashPlayer) {
            this.dashPlayer.destroy();
        }

        // Create new DASH player
        this.dashPlayer = window.dashjs.MediaPlayer().create();

        // Configure DASH settings
        this.dashPlayer.updateSettings({
            streaming: {
                abr: {
                    autoSwitchBitrate: {
                        video: this.selectedQuality === 'auto'
                    }
                },
                text: {
                    defaultEnabled: false  // Always disable by default
                }
            },
            debug: {
                logLevel: this.options.debug ? window.dashjs.Debug.LOG_LEVEL_DEBUG : window.dashjs.Debug.LOG_LEVEL_ERROR
            }
        });

        // Set up event listeners
        this.dashPlayer.on(window.dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
            if (this.options.debug) console.log('📡 DASH stream initialized');

            // Disable text tracks unconditionally unless debug is enabled
            this.disableDashTextTracks();

            this.updateAdaptiveQualities();
            this.isAdaptiveStream = true;
            this.hideLoading();
        });

        this.dashPlayer.on(window.dashjs.MediaPlayer.events.TEXT_TRACKS_ADDED, (e) => {
            if (this.options.debug) {
                console.log('📡 DASH text tracks added:', e);
                // Enable text tracks only in debug mode
                if (e.tracks && e.tracks.length > 0) {
                    this.dashPlayer.setTextTrack(0);
                }
            } else {
                // Disable all text tracks if not in debug mode
                this.disableDashTextTracks();
            }
        });

        this.dashPlayer.on(window.dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED, (e) => {
            if (this.options.debug) console.log('📡 DASH quality changed:', e.newQuality);
            this.updateAdaptiveQualityDisplay();
        });

        // Initialize player
        this.dashPlayer.initialize(this.video, src, this.options.autoplay);

        // Ensure text tracks remain disabled after initialization
        setTimeout(() => {
            this.disableDashTextTracks();
        }, 500);

        if (this.options.debug) console.log('📡 DASH player initialized with:', src);
        return true;

    } catch (error) {
        if (this.options.debug) console.error('📡 DASH initialization error:', error);
        return false;
    }
}

// Helper method to disable DASH text tracks
disableDashTextTracks() {
    if (!this.dashPlayer) return;

    try {
        // Disable text rendering completely unless debug is enabled
        if (!this.options.debug) {
            this.dashPlayer.enableText(false);
            this.dashPlayer.setTextTrack(-1);

            // Also disable native video text tracks
            if (this.video && this.video.textTracks) {
                for (let i = 0; i < this.video.textTracks.length; i++) {
                    this.video.textTracks[i].mode = 'disabled';
                }
            }
        } else {
            // Enable text tracks only in debug mode
            this.dashPlayer.enableText(true);
        }
    } catch (error) {
        if (this.options.debug) console.error('📡 Error disabling text tracks:', error);
    }
}

    async initializeHls(src) {
        if (!window.Hls) {
            if (this.options.debug) console.error('📡 HLS.js not available');
            return false;
        }

        // Check if HLS is supported
        if (!window.Hls.isSupported()) {
            // Fallback to native HLS (Safari)
            if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
                this.video.src = src;
                this.isAdaptiveStream = true;
                if (this.options.debug) console.log('📡 Using native HLS support');
                return true;
            } else {
                if (this.options.debug) console.error('📡 HLS not supported');
                return false;
            }
        }

        try {
            // Destroy existing HLS player
            if (this.hlsPlayer) {
                this.hlsPlayer.destroy();
            }

            // Create new HLS player
            this.hlsPlayer = new window.Hls({
                debug: this.options.debug,
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            // Set up event listeners
            this.hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, () => {
                if (this.options.debug) console.log('📡 HLS manifest parsed');
                this.updateAdaptiveQualities();
                this.isAdaptiveStream = true;
                this.hideLoading();
            });

            this.hlsPlayer.on(window.Hls.Events.LEVEL_SWITCHED, (event, data) => {
                if (this.options.debug) console.log('📡 HLS level switched:', data.level);
                this.updateAdaptiveQualityDisplay();
            });

            this.hlsPlayer.on(window.Hls.Events.ERROR, (event, data) => {
                if (this.options.debug) console.error('📡 HLS error:', data);
                if (data.fatal) {
                    this.handleAdaptiveError(data);
                }
            });

            // Load source
            this.hlsPlayer.loadSource(src);
            this.hlsPlayer.attachMedia(this.video);

            if (this.options.debug) console.log('📡 HLS player initialized with:', src);
            return true;

        } catch (error) {
            if (this.options.debug) console.error('📡 HLS initialization error:', error);
            return false;
        }
    }

updateAdaptiveQualities() {
    this.adaptiveQualities = [];

    if (this.adaptiveStreamingType === 'dash' && this.dashPlayer) {
        try {
            // dash.js 5.x - Get ALL video tracks
            const videoTracks = this.dashPlayer.getTracksFor('video');

            if (this.options.debug) {
                console.log('✅ DASH getTracksFor result:', videoTracks);
            }

            if (videoTracks && videoTracks.length > 0) {
                // Collect qualities from ALL video tracks
                const allQualities = [];

                videoTracks.forEach((track, trackIndex) => {
                    const bitrateList = track.bitrateList || [];

                    if (this.options.debug) {
                        console.log(`✅ Track ${trackIndex} (${track.codec}):`, bitrateList);
                    }

                    bitrateList.forEach((bitrate, index) => {
                        allQualities.push({
                            trackIndex: trackIndex,
                            bitrateIndex: index,
                            label: `${bitrate.height}p`,
                            height: bitrate.height,
                            width: bitrate.width,
                            bandwidth: bitrate.bandwidth,
                            codec: track.codec
                        });
                    });
                });

                // Sort by height (descending) and remove duplicates
                const uniqueHeights = [...new Set(allQualities.map(q => q.height))];
                uniqueHeights.sort((a, b) => b - a);

                this.adaptiveQualities = uniqueHeights.map((height, index) => {
                    const quality = allQualities.find(q => q.height === height);
                    return {
                        index: index,
                        label: `${height}p`,
                        height: height,
                        trackIndex: quality.trackIndex,
                        bitrateIndex: quality.bitrateIndex,
                        bandwidth: quality.bandwidth,
                        codec: quality.codec
                    };
                });

                if (this.options.debug) {
                    console.log('✅ All DASH qualities merged:', this.adaptiveQualities);
                }
            }
        } catch (error) {
            if (this.options.debug) {
                console.error('❌ Error getting DASH qualities:', error);
            }
        }
    } else if (this.adaptiveStreamingType === 'hls' && this.hlsPlayer) {
        const levels = this.hlsPlayer.levels;
        this.adaptiveQualities = levels.map((level, index) => ({
            index: index,
            label: this.getQualityLabel(level.height, level.width),
            height: level.height,
            bandwidth: level.bitrate
        }));
    }

    if (this.options.adaptiveQualityControl) {
        this.updateAdaptiveQualityMenu();
    }

    if (this.options.debug) {
        console.log('📡 Adaptive qualities available:', this.adaptiveQualities);
        console.log('📡 Selected quality mode:', this.selectedQuality);
    }
}

updateAdaptiveQualityMenu() {
    const qualityMenu = this.controls?.querySelector('.quality-menu');
    if (!qualityMenu) {
        if (this.options.debug) console.log('❌ Quality menu not found in DOM');
        return;
    }

    if (this.adaptiveQualities.length === 0) {
        if (this.options.debug) console.log('❌ No adaptive qualities to display');
        return;
    }

    // Generate menu HTML with "Auto" option
    const isAutoActive = this.selectedQuality === 'auto';
    let menuHTML = `<div class="quality-option ${isAutoActive ? 'active' : ''}" data-quality="auto">Auto</div>`;

    // Add all quality options
    this.adaptiveQualities.forEach((quality) => {
        const isActive = this.selectedQuality === quality.height;

        if (this.options.debug) {
            console.log('🔍 Quality item:', quality.label, 'height:', quality.height, 'active:', isActive);
        }

        menuHTML += `<div class="quality-option ${isActive ? 'active' : ''}" data-quality="${quality.height}">
            ${quality.label}
            <span class="quality-playing" style="display: none; color: #4CAF50; margin-left: 8px; font-size: 0.85em;">● Playing</span>
        </div>`;
    });

    qualityMenu.innerHTML = menuHTML;

    if (this.options.debug) {
        console.log('✅ Quality menu populated with', this.adaptiveQualities.length, 'options');
    }

    // Bind events ONCE
    if (!this.qualityEventsInitialized) {
        this.bindAdaptiveQualityEvents();
        this.qualityEventsInitialized = true;
    }

    // Update display
    this.updateAdaptiveQualityDisplay();
}

updateAdaptiveQualityDisplay() {
    if (!this.dashPlayer && !this.hlsPlayer) return;

    let currentHeight = null;

    try {
        if (this.adaptiveStreamingType === 'dash' && this.dashPlayer) {
            // Get video element to check actual resolution
            if (this.video && this.video.videoHeight) {
                currentHeight = this.video.videoHeight;
            }

            if (this.options.debug) {
                console.log('📊 Current video height:', currentHeight, 'Selected mode:', this.selectedQuality);
            }
        } else if (this.adaptiveStreamingType === 'hls' && this.hlsPlayer) {
            const currentLevel = this.hlsPlayer.currentLevel;
            if (currentLevel >= 0 && this.hlsPlayer.levels[currentLevel]) {
                currentHeight = this.hlsPlayer.levels[currentLevel].height;
            }
        }

        // Update button text (top text)
        const qualityBtnText = this.controls?.querySelector('.quality-btn .selected-quality');
        if (qualityBtnText) {
            if (this.selectedQuality === 'auto') {
                qualityBtnText.textContent = 'Auto';
            } else {
                qualityBtnText.textContent = `${this.selectedQuality}p`;
            }
        }

        // Update current quality display (bottom text) - ONLY in Auto mode
        const currentQualityText = this.controls?.querySelector('.quality-btn .current-quality');
        if (currentQualityText) {
            if (this.selectedQuality === 'auto' && currentHeight) {
                currentQualityText.textContent = `${currentHeight}p`;
                currentQualityText.style.display = 'block';
            } else {
                currentQualityText.textContent = '';
                currentQualityText.style.display = 'none';
            }
        }

        // Update menu active states
        const qualityMenu = this.controls?.querySelector('.quality-menu');
        if (qualityMenu) {
            // Remove all active states
            qualityMenu.querySelectorAll('.quality-option').forEach(opt => {
                opt.classList.remove('active');
            });

            // Set active based on selection
            if (this.selectedQuality === 'auto') {
                const autoOption = qualityMenu.querySelector('[data-quality="auto"]');
                if (autoOption) autoOption.classList.add('active');
            } else {
                const selectedOption = qualityMenu.querySelector(`[data-quality="${this.selectedQuality}"]`);
                if (selectedOption) selectedOption.classList.add('active');
            }

            // Hide all playing indicators
            qualityMenu.querySelectorAll('.quality-playing').forEach(el => {
                el.style.display = 'none';
            });

            // Show playing indicator only in Auto mode
            if (this.selectedQuality === 'auto' && currentHeight) {
                const playingOption = qualityMenu.querySelector(`[data-quality="${currentHeight}"] .quality-playing`);
                if (playingOption) {
                    playingOption.style.display = 'inline';
                }
            }
        }

    } catch (error) {
        if (this.options.debug) console.error('❌ Error updating quality display:', error);
    }
}

updateQualityButtonText() {
    const qualityBtn = this.controls?.querySelector('.quality-btn .selected-quality');
    if (!qualityBtn) return;

    if (this.selectedQuality === 'auto' || !this.selectedQuality) {
        qualityBtn.textContent = this.t('auto');
    } else {
        const quality = this.adaptiveQualities.find(q => q.index === parseInt(this.selectedQuality));
        qualityBtn.textContent = quality ? quality.label : 'Auto';
    }
}

bindAdaptiveQualityEvents() {
    const qualityMenu = this.controls?.querySelector('.quality-menu');
    const qualityBtn = this.controls?.querySelector('.quality-btn');

    if (!qualityMenu || !qualityBtn) return;

    // Toggle menu
    qualityBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        qualityMenu.classList.toggle('active');

        // Update display when opening
        if (qualityMenu.classList.contains('active')) {
            this.updateAdaptiveQualityDisplay();
        }
    });

    // Close menu on outside click
    const closeMenuHandler = (e) => {
        if (!qualityBtn.contains(e.target) && !qualityMenu.contains(e.target)) {
            qualityMenu.classList.remove('active');
        }
    };
    document.addEventListener('click', closeMenuHandler);

    // Handle quality selection
    qualityMenu.addEventListener('click', (e) => {
        const option = e.target.closest('.quality-option');
        if (!option) return;

        e.stopPropagation();

        const qualityData = option.getAttribute('data-quality');

        if (this.options.debug) {
            console.log('🎬 Quality clicked - raw data:', qualityData, 'type:', typeof qualityData);
        }

        if (qualityData === 'auto') {
            // Enable auto mode
            this.selectedQuality = 'auto';

            if (this.adaptiveStreamingType === 'dash' && this.dashPlayer) {
                this.dashPlayer.updateSettings({
                    streaming: {
                        abr: {
                            autoSwitchBitrate: { video: true }
                        }
                    }
                });
                if (this.options.debug) console.log('✅ Auto quality enabled');
            } else if (this.adaptiveStreamingType === 'hls' && this.hlsPlayer) {
                this.hlsPlayer.currentLevel = -1;
            }

        } else {
            // Manual quality selection
            const selectedHeight = parseInt(qualityData, 10);

            if (isNaN(selectedHeight)) {
                if (this.options.debug) console.error('❌ Invalid quality data:', qualityData);
                return;
            }

            if (this.options.debug) {
                console.log('🎬 Setting manual quality to height:', selectedHeight);
            }

            this.selectedQuality = selectedHeight;

            if (this.adaptiveStreamingType === 'dash') {
                this.setDashQualityByHeight(selectedHeight);
            } else if (this.adaptiveStreamingType === 'hls') {
                const levelIndex = this.hlsPlayer.levels.findIndex(l => l.height === selectedHeight);
                if (levelIndex >= 0) {
                    this.hlsPlayer.currentLevel = levelIndex;
                }
            }
        }

        // Update display immediately
        this.updateAdaptiveQualityDisplay();

        // Close menu
        qualityMenu.classList.remove('active');
    });

    if (this.options.debug) {
        console.log('✅ Quality events bound');
    }
}

setDashQualityByHeight(targetHeight) {
    if (!this.dashPlayer) return;

    try {
        const targetQuality = this.adaptiveQualities.find(q => q.height === targetHeight);
        if (!targetQuality) {
            if (this.options.debug) console.error('❌ Quality not found for height:', targetHeight);
            return;
        }

        if (this.options.debug) {
            console.log('🎬 Setting quality:', targetQuality);
        }

        // Disable auto quality
        this.dashPlayer.updateSettings({
            streaming: {
                abr: {
                    autoSwitchBitrate: { video: false }
                }
            }
        });

        // Get current video track
        const currentTrack = this.dashPlayer.getCurrentTrackFor('video');

        if (!currentTrack) {
            if (this.options.debug) console.error('❌ No current video track');
            return;
        }

        // Find the correct track for this quality
        const allTracks = this.dashPlayer.getTracksFor('video');
        let targetTrack = null;

        for (const track of allTracks) {
            if (track.bitrateList && track.bitrateList[targetQuality.bitrateIndex]) {
                const bitrate = track.bitrateList[targetQuality.bitrateIndex];
                if (bitrate.height === targetHeight) {
                    targetTrack = track;
                    break;
                }
            }
        }

        if (!targetTrack) {
            if (this.options.debug) console.error('❌ Target track not found');
            return;
        }

        // Switch track if different
        if (currentTrack.index !== targetTrack.index) {
            this.dashPlayer.setCurrentTrack(targetTrack);
            if (this.options.debug) {
                console.log('✅ Switched to track:', targetTrack.index);
            }
        }

        // Force quality on current track
        setTimeout(() => {
            try {
                // Use the MediaPlayer API to set quality
                this.dashPlayer.updateSettings({
                    streaming: {
                        abr: {
                            initialBitrate: { video: targetQuality.bandwidth / 1000 },
                            maxBitrate: { video: targetQuality.bandwidth / 1000 },
                            minBitrate: { video: targetQuality.bandwidth / 1000 }
                        }
                    }
                });

                if (this.options.debug) {
                    console.log('✅ Quality locked to:', targetHeight + 'p', 'bandwidth:', targetQuality.bandwidth);
                }

                // Update button text immediately
                const qualityBtnText = this.controls?.querySelector('.quality-btn .selected-quality');
                if (qualityBtnText) {
                    qualityBtnText.textContent = `${targetHeight}p`;
                }

                // Force reload of segments at new quality
                const currentTime = this.video.currentTime;
                this.dashPlayer.seek(currentTime + 0.1);
                setTimeout(() => {
                    this.dashPlayer.seek(currentTime);
                }, 100);

            } catch (innerError) {
                if (this.options.debug) console.error('❌ Error setting quality:', innerError);
            }
        }, 100);

    } catch (error) {
        if (this.options.debug) console.error('❌ Error in setDashQualityByHeight:', error);
    }
}

setDashQuality(qualityIndex) {
    if (!this.dashPlayer) return;

    try {
        const selectedQuality = this.adaptiveQualities[qualityIndex];
        if (!selectedQuality) {
            if (this.options.debug) console.error('❌ Quality not found at index:', qualityIndex);
            return;
        }

        if (this.options.debug) {
            console.log('🎬 Setting DASH quality:', selectedQuality);
        }

        // Disable auto quality
        this.dashPlayer.updateSettings({
            streaming: {
                abr: {
                    autoSwitchBitrate: { video: false }
                }
            }
        });

        // Set the specific quality using bitrateIndex
        setTimeout(() => {
            try {
                this.dashPlayer.setQualityFor('video', selectedQuality.bitrateIndex);

                if (this.options.debug) {
                    console.log('✅ DASH quality set to bitrateIndex:', selectedQuality.bitrateIndex, 'height:', selectedQuality.height);
                }

                // Update button text immediately
                const qualityBtnText = this.controls?.querySelector('.quality-btn .selected-quality');
                if (qualityBtnText) {
                    qualityBtnText.textContent = selectedQuality.label;
                }

            } catch (innerError) {
                if (this.options.debug) console.error('❌ Error setting quality:', innerError);
            }
        }, 100);

    } catch (error) {
        if (this.options.debug) console.error('❌ Error in setDashQuality:', error);
    }
}

    handleAdaptiveError(data) {
        if (this.options.debug) console.error('📡 Fatal adaptive streaming error:', data);

        // Try to recover
        if (this.adaptiveStreamingType === 'hls' && this.hlsPlayer) {
            try {
                this.hlsPlayer.startLoad();
            } catch (error) {
                if (this.options.debug) console.error('📡 Failed to recover from HLS error:', error);
            }
        }
    }

    destroyAdaptivePlayer() {
        try {
            if (this.dashPlayer) {
                this.dashPlayer.destroy();
                this.dashPlayer = null;
            }

            if (this.hlsPlayer) {
                this.hlsPlayer.destroy();
                this.hlsPlayer = null;
            }

            this.isAdaptiveStream = false;
            this.adaptiveStreamingType = null;
            this.adaptiveQualities = [];

            if (this.options.debug) console.log('📡 Adaptive player destroyed');

        } catch (error) {
            if (this.options.debug) console.error('📡 Error destroying adaptive player:', error);
        }
    }

    getAdaptiveStreamingInfo() {
        return {
            isActive: this.isAdaptiveStream,
            type: this.adaptiveStreamingType,
            currentQuality: this.getCurrentAdaptiveQuality(),
            currentQualityLabel: this.getCurrentAdaptiveQualityLabel(),
            availableQualities: this.adaptiveQualities,
            isAuto: this.isAutoQuality()
        };
    }

    setAdaptiveStreamingOptions(options = {}) {
        if (options.enabled !== undefined) {
            this.options.adaptiveStreaming = options.enabled;
        }
        if (options.qualityControl !== undefined) {
            this.options.adaptiveQualityControl = options.qualityControl;
        }
        if (options.dashLibUrl) {
            this.options.dashLibUrl = options.dashLibUrl;
        }
        if (options.hlsLibUrl) {
            this.options.hlsLibUrl = options.hlsLibUrl;
        }

        if (this.options.debug) {
            console.log('📡 Adaptive streaming options updated:', {
                enabled: this.options.adaptiveStreaming,
                qualityControl: this.options.adaptiveQualityControl
            });
        }

        return this;
    }

/* Plugins Module for MYETV Video Player
 * Plugin system for extensible player functionality
 * Created by https://www.myetv.tv https://oskarcosimo.com
 */

// ===================================================================
// GLOBAL CODE - Will be placed OUTSIDE the class by build script
// ===================================================================
// NOTE: This section will be extracted by the build script
// and placed outside the class definition



// ===================================================================
// CLASS METHODS - Will be placed INSIDE the class
// ===================================================================

/**
 * Initialize plugin system for player instance
 * This method should be called in the player constructor
 */
initializePluginSystem() {
    // Plugin instances storage
    this.plugins = {};

    // Plugin hooks for lifecycle events
    this.pluginHooks = {
        'beforeInit': [],
        'afterInit': [],
        'beforePlay': [],
        'afterPlay': [],
        'beforePause': [],
        'afterPause': [],
        'beforeQualityChange': [],
        'afterQualityChange': [],
        'beforeDestroy': [],
        'afterDestroy': []
    };

    if (this.options.debug) {
        console.log('🔌 Plugin system initialized');
    }

    // Load plugins specified in options
    if (this.options.plugins && typeof this.options.plugins === 'object') {
        this.loadPlugins(this.options.plugins);
    }
}

/**
 * Load multiple plugins from options
 * @param {Object} pluginsConfig - Object with plugin names as keys and options as values
 */
loadPlugins(pluginsConfig) {
    for (const pluginName in pluginsConfig) {
        if (pluginsConfig.hasOwnProperty(pluginName)) {
            const pluginOptions = pluginsConfig[pluginName];
            this.usePlugin(pluginName, pluginOptions);
        }
    }
}

/**
 * Use (initialize) a plugin on this player instance
 * @param {String} name - Plugin name
 * @param {Object} options - Plugin options
 * @returns {Object|null} Plugin instance or null if failed
 */
usePlugin(name, options = {}) {
    // Check if plugin is registered
    if (!window.MYETVPlayerPlugins[name]) {
        console.error(`🔌 Plugin "${name}" is not registered. Please load the plugin file first.`);
        return null;
    }

    // Check if plugin is already initialized
    if (this.plugins[name]) {
        console.warn(`🔌 Plugin "${name}" is already initialized on this player`);
        return this.plugins[name];
    }

    try {
        const PluginClass = window.MYETVPlayerPlugins[name];

        // Trigger before plugin setup event
        this.triggerPluginEvent('beforepluginsetup', name, options);
        this.triggerPluginEvent(`beforepluginsetup:${name}`, name, options);

        // Initialize plugin
        let pluginInstance;

        if (typeof PluginClass === 'function') {
            // Plugin is a constructor or factory function
            pluginInstance = new PluginClass(this, options);
        } else if (typeof PluginClass === 'object' && typeof PluginClass.create === 'function') {
            // Plugin is an object with create method
            pluginInstance = PluginClass.create(this, options);
        } else {
            throw new Error(`Invalid plugin format for "${name}"`);
        }

        // Store plugin instance
        this.plugins[name] = pluginInstance;

        // Call plugin setup method if exists
        if (typeof pluginInstance.setup === 'function') {
            pluginInstance.setup();
        }

        // Trigger after plugin setup event
        this.triggerPluginEvent('pluginsetup', name, options);
        this.triggerPluginEvent(`pluginsetup:${name}`, name, options);

        if (this.options.debug) {
            console.log(`🔌 Plugin "${name}" initialized successfully`);
        }

        return pluginInstance;

    } catch (error) {
        console.error(`🔌 Failed to initialize plugin "${name}":`, error);
        return null;
    }
}

/**
 * Get a plugin instance
 * @param {String} name - Plugin name
 * @returns {Object|null} Plugin instance or null
 */
getPlugin(name) {
    return this.plugins[name] || null;
}

/**
 * Check if a plugin is loaded
 * @param {String} name - Plugin name
 * @returns {Boolean}
 */
hasPlugin(name) {
    return !!this.plugins[name];
}

/**
 * Remove a plugin from this player instance
 * @param {String} name - Plugin name
 * @returns {Boolean} Success status
 */
removePlugin(name) {
    if (!this.plugins[name]) {
        console.warn(`🔌 Plugin "${name}" is not initialized on this player`);
        return false;
    }

    try {
        const plugin = this.plugins[name];

        // Call plugin dispose method if exists
        if (typeof plugin.dispose === 'function') {
            plugin.dispose();
        }

        // Remove plugin instance
        delete this.plugins[name];

        if (this.options.debug) {
            console.log(`🔌 Plugin "${name}" removed successfully`);
        }

        return true;

    } catch (error) {
        console.error(`🔌 Failed to remove plugin "${name}":`, error);
        return false;
    }
}

/**
 * Trigger plugin-specific event
 * @param {String} eventType - Event type
 * @param {String} pluginName - Plugin name
 * @param {Object} data - Event data
 */
triggerPluginEvent(eventType, pluginName, data = {}) {
    // Use existing event system
    this.triggerEvent(eventType, {
        pluginName: pluginName,
        ...data
    });
}

/**
 * Register a hook for plugin lifecycle
 * @param {String} hookName - Hook name
 * @param {Function} callback - Callback function
 */
registerPluginHook(hookName, callback) {
    if (!this.pluginHooks[hookName]) {
        this.pluginHooks[hookName] = [];
    }

    this.pluginHooks[hookName].push(callback);

    if (this.options.debug) {
        console.log(`🔌 Hook registered: ${hookName}`);
    }
}

/**
 * Execute plugin hooks
 * @param {String} hookName - Hook name
 * @param {Object} data - Data to pass to hook callbacks
 */
executePluginHooks(hookName, data = {}) {
    if (!this.pluginHooks[hookName] || this.pluginHooks[hookName].length === 0) {
        return;
    }

    this.pluginHooks[hookName].forEach(callback => {
        try {
            callback(data);
        } catch (error) {
            console.error(`🔌 Error executing hook "${hookName}":`, error);
        }
    });
}

/**
 * Dispose all plugins
 */
disposeAllPlugins() {
    const pluginNames = Object.keys(this.plugins);

    pluginNames.forEach(name => {
        this.removePlugin(name);
    });

    if (this.options.debug) {
        console.log('🔌 All plugins disposed');
    }
}

/**
 * Get all active plugins
 * @returns {Object}
 */
getActivePlugins() {
    return { ...this.plugins };
}

/**
 * Get plugin API
 * @returns {Object}
 */
getPluginAPI() {
    return {
        player: this,
        video: this.video,
        container: this.container,
        controls: this.controls,
        play: () => this.play(),
        pause: () => this.pause(),
        togglePlayPause: () => this.togglePlayPause(),
        getCurrentTime: () => this.getCurrentTime(),
        setCurrentTime: (time) => this.setCurrentTime(time),
        getDuration: () => this.getDuration(),
        getVolume: () => this.getVolume(),
        setVolume: (volume) => this.setVolume(volume),
        addEventListener: (eventType, callback) => this.addEventListener(eventType, callback),
        removeEventListener: (eventType, callback) => this.removeEventListener(eventType, callback),
        triggerEvent: (eventType, data) => this.triggerEvent(eventType, data),
        registerHook: (hookName, callback) => this.registerPluginHook(hookName, callback),
        addControlButton: (button) => this.addPluginControlButton(button),
        removeControlButton: (buttonId) => this.removePluginControlButton(buttonId),
        getQualities: () => this.getQualities(),
        setQuality: (quality) => this.setQuality(quality),
        options: this.options,
        debug: (message) => {
            if (this.options.debug) {
                console.log('🔌 Plugin debug:', message);
            }
        }
    };
}

/**
 * Add a custom control button for plugins
 * @param {Object} buttonConfig
 * @returns {HTMLElement|null}
 */
addPluginControlButton(buttonConfig) {
    if (!this.controls) {
        console.error('🔌 Controls not available');
        return null;
    }

    const {
        id,
        icon,
        tooltip,
        position = 'right',
        onClick,
        className = ''
    } = buttonConfig;

    const button = document.createElement('button');
    button.id = id || `plugin-btn-${Date.now()}`;
    button.className = `control-btn plugin-control-btn ${className}`;
    button.setAttribute('aria-label', tooltip || 'Plugin button');
    button.setAttribute('title', tooltip || '');

    if (icon) {
        button.innerHTML = icon;
    }

    if (onClick && typeof onClick === 'function') {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            onClick(e, this);
        });
    }

    const targetContainer = position === 'left'
        ? this.controls.querySelector('.controls-left')
        : this.controls.querySelector('.controls-right');

    if (targetContainer) {
        targetContainer.appendChild(button);

        if (this.options.debug) {
            console.log(`🔌 Plugin control button added: ${button.id}`);
        }

        return button;
    }

    return null;
}

/**
 * Remove a plugin control button
 * @param {String} buttonId
 * @returns {Boolean}
 */
removePluginControlButton(buttonId) {
    const button = document.getElementById(buttonId);

    if (button) {
        button.remove();

        if (this.options.debug) {
            console.log(`🔌 Plugin control button removed: ${buttonId}`);
        }

        return true;
    }

    return false;
}

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

}

// Export for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = MYETVvideoplayer;
}
if (typeof define === "function" && define.amd) {
  define([], function() { return MYETVvideoplayer; });
}
