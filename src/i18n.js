// i18n Module for MYETV Video Player
// Conservative modularization - original code preserved exactly
// Created by https://www.myetv.tv https://oskarcosimo.com

﻿// i18n System for Video Player - Javascript locales -  - Created by [https://www.myetv.tv](https://www.myetv.tv) [https://oskarcosimo.com](https://oskarcosimo.com)
class VideoPlayerI18n {
    constructor() {
        // First define the translations
        this.translations = {
            // Italiano
            'it': {
                'subtitles': 'Sottotitoli (C)',
                'subtitlesdisable': 'Disabilita Sottotitoli',
                'subtitlesenable': 'Abilita Sottotitoli',
                'play_pause': 'Play/Pausa (Spazio)',
                'mute_unmute': 'Muta/Smuta (M)',
                'volume': 'Volume',
                'playback_speed': 'Velocità riproduzione',
                'video_quality': 'Qualità video',
                'picture_in_picture': 'Picture-in-Picture (P)',
                'fullscreen': 'Schermo intero (F)',
                'auto': 'Auto',
                'brand_logo': 'Logo',
                'next_video': 'Video successivo (N)',
                'prev_video': 'Video precedente (P)',
                'playlist_next': 'Avanti',
                'playlist_prev': 'Indietro',
                'settings_menu': 'Impostazioni'
            },

            // English
            'en': {
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
                'next_video': 'Next video (N)',
                'prev_video': 'Previous video (P)',
                'playlist_next': 'Next',
                'playlist_prev': 'Previous',
                'next_video': 'Next video (N)',
                'prev_video': 'Previous video (P)',
                'playlist_next': 'Next',
                'playlist_prev': 'Previous',
                'settings_menu': 'Settings'
            },

            // Español
            'es': {
                'subtitles': 'Subtítulos (C)',
                'subtitlesdisable': 'Disable Subtitles',
                'subtitlesenable': 'Enable Subtitles',
                'play_pause': 'Reproducir/Pausar (Espacio)',
                'mute_unmute': 'Silenciar (M)',
                'volume': 'Volumen',
                'playback_speed': 'Velocidad de reproducción',
                'video_quality': 'Calidad de vídeo',
                'picture_in_picture': 'Picture-in-Picture (P)',
                'fullscreen': 'Pantalla completa (F)',
                'auto': 'Auto',
                'brand_logo': 'Logo de marca',
                'next_video': 'Siguiente vídeo (N)',
                'prev_video': 'Vídeo anterior (P)',
                'playlist_next': 'Siguiente',
                'playlist_prev': 'Anterior',
                'settings_menu': 'Settings'
            },

            // Français
            'fr': {
                'subtitles': 'Sous-titres (C)',
                'subtitlesdisable': 'Disable Subtitles',
                'subtitlesenable': 'Enable Subtitles',
                'play_pause': 'Lecture/Pause (Espace)',
                'mute_unmute': 'Muet (M)',
                'volume': 'Volume',
                'playback_speed': 'Vitesse de lecture',
                'video_quality': 'Qualité vidéo',
                'picture_in_picture': 'Picture-in-Picture (P)',
                'fullscreen': 'Plein écran (F)',
                'auto': 'Auto',
                'brand_logo': 'Logo de marque',
                'next_video': 'Vidéo suivante (N)',
                'prev_video': 'Vidéo précédente (P)',
                'playlist_next': 'Suivant',
                'playlist_prev': 'Précédent',
                'settings_menu': 'Settings'
            },

            // Deutsch
            'de': {
                'subtitles': 'Untertitel (C)',
                'subtitlesdisable': 'Disable Subtitles',
                'subtitlesenable': 'Enable Subtitles',
                'play_pause': 'Abspielen/Pausieren (Leertaste)',
                'mute_unmute': 'Stumm (M)',
                'volume': 'Lautstärke',
                'playback_speed': 'Wiedergabegeschwindigkeit',
                'video_quality': 'Videoqualität',
                'picture_in_picture': 'Picture-in-Picture (P)',
                'fullscreen': 'Vollbild (F)',
                'auto': 'Auto',
                'brand_logo': 'Markenlogo',
                'next_video': 'Nächstes Video (N)',
                'prev_video': 'Vorheriges Video (P)',
                'playlist_next': 'Weiter',
                'playlist_prev': 'Zurück',
                'settings_menu': 'Settings'
            },

            // Português
            'pt': {
                'subtitles': 'Legendas (C)',
                'subtitlesdisable': 'Disable Subtitles',
                'subtitlesenable': 'Enable Subtitles',
                'play_pause': 'Reproduzir/Pausar (Espaço)',
                'mute_unmute': 'Silenciar (M)',
                'volume': 'Volume',
                'playback_speed': 'Velocidade de reprodução',
                'video_quality': 'Qualidade do vídeo',
                'picture_in_picture': 'Picture-in-Picture (P)',
                'fullscreen': 'Tela cheia (F)',
                'auto': 'Auto',
                'brand_logo': 'Logo da marca',
                'next_video': 'Próximo vídeo (N)',
                'prev_video': 'Vídeo anterior (P)',
                'playlist_next': 'Próximo',
                'playlist_prev': 'Anterior',
                'settings_menu': 'Settings'
            },

            // 中文
            'zh': {
                'subtitles': '字幕 (C)',
                'subtitlesdisable': 'Disable Subtitles',
                'subtitlesenable': 'Enable Subtitles',
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
                'settings_menu': 'Settings'
            },

            // 日本語
            'ja': {
                'subtitles': '字幕 (C)',
                'subtitlesdisable': 'Disable Subtitles',
                'subtitlesenable': 'Enable Subtitles',
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
                'settings_menu': 'Settings'
            },

            // Русский
            'ru': {
                'subtitles': 'Субтитры (C)',
                'subtitlesdisable': 'Disable Subtitles',
                'subtitlesenable': 'Enable Subtitles',
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
                'settings_menu': 'Settings'
            },

            // العربية
            'ar': {
                'subtitles': 'الترجمة (C)',
                'subtitlesdisable': 'Disable Subtitles',
                'subtitlesenable': 'Enable Subtitles',
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
                'settings_menu': 'Settings'
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
                'settings_menu': 'Settings'
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

export default VideoPlayerI18n;
