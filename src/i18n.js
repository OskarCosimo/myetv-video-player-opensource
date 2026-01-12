// i18n Module for MYETV Video Player
// Conservative modularization - original code preserved exactly
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
                'restart_video': 'Torna all\'inizio',
                'more_information': 'Ulteriori informazioni'
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
                'restart_video': 'Restart the video',
                'more_information': 'More information'
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
                'restart_video': 'Reiniciar el vídeo',
                'more_information': 'Más información'
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
                'restart_video': 'Redémarrer la vidéo',
                'more_information': 'Plus d\'informations'
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
                'restart_video': 'Video neu starten',
                'more_information': 'Weitere Informationen'
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
                'restart_video': 'Reiniciar vídeo',
                'more_information': 'Mais informações'
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
                'restart_video': '重新开始视频',
                'more_information': '更多信息'
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
                'restart_video': 'ビデオを再開',
                'more_information': '詳細情報'
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
                'restart_video': 'Перезапустить видео',
                'more_information': 'Дополнительная информация'
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
                'restart_video': 'إعادة تشغيل الفيديو',
                'more_information': 'مزيد من المعلومات'
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
                'restart_video': '동영상 재생 재개',
                'more_information': '추가 정보'
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
                'restart_video': 'Uruchom ponownie wideo',
                'more_information': 'Więcej informacji'
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
                'restart_video': 'Videó újraindítása',
                'more_information': 'További információk'
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
                'restart_video': 'Videoyu yeniden başlat',
                'more_information': 'Daha fazla bilgi'
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
                'restart_video': 'Video opnieuw starten',
                'more_information': 'Meer informatie'
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
                'restart_video': 'वीडियो पुनः आरंभ करें',
                'more_information': 'अधिक जानकारी'
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
                'restart_video': 'Starta om videon',
                'more_information': 'Mer information'
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
                'restart_video': 'Mulai ulang video',
                'more_information': 'Informasi lebih lanjut'
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
                'restart_video': 'Restart video',
                'more_information': 'More information'
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