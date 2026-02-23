# myetv-autosub-plugin

> 🎙️ Auto-subtitles plugin for **myetv-player** — client-side speech recognition via [Whisper AI](https://huggingface.co/Xenova/whisper-tiny) + [Transformers.js](https://github.com/huggingface/transformers.js), no server, no FFmpeg, no API key required.

---

## ✨ Features

- 🧠 **100% client-side** — transcription runs in a Web Worker, never leaves the browser
- ⚡ **Streaming transcription** — subtitles appear chunk by chunk while the model processes audio
- 🌍 **Auto-translation** — translate subtitles into 17+ languages via [MyMemory API](https://mymemory.translated.net/) (free, no key)
- 🖱️ **Draggable subtitles** — reposition subtitles anywhere on the video (mouse & touch)
- 📱 **Responsive text** — font size adapts automatically to screen size via `clamp()`
- 💾 **localStorage cache** — transcriptions are cached and reloaded instantly on next visit
- 🔌 **Zero dependencies** — works with the standard myetv-player plugin system
- 🔒 **CSP-safe** — compatible with strict Content Security Policies (`worker-src blob:`)

---

## 📦 Installation

### Option A — Script tag
```html
```

<script src="myetv-autosub-plugin.js"></script>

```
```


### Option B — Via npm (if bundled with myetv-player)

```bash
npm install myetv-autosub-plugin
```

> ⚠️ The plugin must be loaded **after** `myetv-player`.

---

## 🚀 Quick Start

```html
<!-- 1. Load the player -->
```

<script src="myetv-player.min.js"></script>

```

<!-- 2. Load the plugin -->
```

<script src="myetv-autosub-plugin.js"></script>

```

<!-- 3. Initialize -->
<script>
  const player = new MYETVvideoplayer('my-video', { /* player options */ });

  player.on('playerready', () => {
    player.usePlugin('autoSubtitles', {
      language:  'en',   // source language of the video
      modelSize: 'tiny',      // whisper model size
      position:  'topbar',    // button position
      idCache:   'video-123', // stable cache key (recommended)
    });
  });
</script>
```


---

## ⚙️ Options

| Option | Type | Default | Description |
| :-- | :-- | :-- | :-- |
| `language` | `string` | `null` | Source language of the video audio. Accepts ISO codes (`'it'`, `'en'`) or full names (`'italian'`, `'english'`). If `null`, Whisper auto-detects. |
| `modelSize` | `string` | `'base'` | Whisper model size: `'tiny'` (~39 MB), `'base'` (~74 MB), `'small'` (~244 MB). Larger = more accurate but slower. |
| `autoGenerate` | `boolean` | `false` | Automatically start transcription and show subtitles when the video player is loaded. |
| `autoTranslation` | `string` | `null` | Automatically translate subtitles into this language on load (ISO 2-letter code, e.g. `'en'`, `'it'`, `'fr'`). Requires subtitles to be ready first. |
| `showButton` | `boolean` | `true` | Show the CC button in the player interface. |
| `position` | `string` | `'topbar'` | Button position: `'right'` or `'left'` (control bar) or `'topbar'` (next to the ⚙️ settings icon). |
| `subtitleStyle` | `object` | `{}` | Custom inline CSS style object applied to the subtitle text element. |
| `cacheEnabled` | `boolean` | `true` | Cache transcription in `localStorage` for instant reload. |
| `idCache` | `string` | `null` | Stable unique key used for the localStorage cache entry (recommended: your video's database ID). Falls back to a hash of the video URL if not set. |


---

## 🎛️ Subtitle Menu

Clicking the **CC button** opens a context menu with three sections:

### Subtitles

- **▶ Enable** — show subtitles
- **✕ Disable** — hide subtitles


### Gestione

- **🎙️ Generate subtitles** — start transcription (first time)
- **🔄 Regenerate trnascription** — force re-transcription (discards cache)
- **📊 Show progress** — open the transcription progress panel (visible while generating)


### Translate to

Scrollable list of 17+ languages. Translations are cached in memory for the session — switching back to a previously selected language is instant.

---

## 🌍 Supported Translation Languages

| Code | Language |
| :-- | :-- |
| `off` | No translation (original) |
| `it` | 🇮🇹 Italiano |
| `en` | 🇬🇧 English |
| `de` | 🇩🇪 Deutsch |
| `fr` | 🇫🇷 Français |
| `es` | 🇪🇸 Español |
| `pt` | 🇵🇹 Português |
| `ru` | 🇷🇺 Русский |
| `ja` | 🇯🇵 日本語 |
| `zh` | 🇨🇳 中文 |
| `ar` | 🇸🇦 العربية |
| `ko` | 🇰🇷 한국어 |
| `nl` | 🇳🇱 Nederlands |
| `pl` | 🇵🇱 Polski |
| `tr` | 🇹🇷 Türkçe |
| `uk` | 🇺🇦 Українська |
| `hi` | 🇮🇳 हिन्दी |


---

## 🧠 Whisper Models

| Size | ID | Download | Speed | Accuracy |
| :-- | :-- | :-- | :-- | :-- |
| `tiny` | `Xenova/whisper-tiny` | ~39 MB | ⚡⚡⚡ Fast | ★☆☆ Good |
| `base` | `Xenova/whisper-base` | ~74 MB | ⚡⚡ Medium | ★★☆ Better |
| `small` | `Xenova/whisper-small` | ~244 MB | ⚡ Slow | ★★★ Best |

Models are downloaded from Hugging Face on first use and cached by the browser automatically (`env.useBrowserCache = true`).

---

## 🔒 CSP Requirements

If your site uses a Content Security Policy, add the following:

```http
Content-Security-Policy:
  worker-src blob:;
  script-src blob: https://cdn.jsdelivr.net;
  connect-src https://cdn.jsdelivr.net https://huggingface.co https://api.mymemory.translated.net;
```
Use crossorigin="anonymous" on the <video> element.

---

## 💾 Cache

Transcriptions are stored in `localStorage` under the key `myetv_autosub_<id>`.

- Up to **30 entries** are kept — oldest are evicted automatically
- Set `idCache: 'your-video-id'` for a stable, human-readable key
- Set `cacheEnabled: false` to disable caching entirely
- Use **"🔄 Regenerate transcription"** from the menu to force a fresh transcription

---

## 🖱️ Draggable Subtitles

Hover over the subtitle text to reveal the **⠿ sposta** drag handle. Click and drag to reposition subtitles anywhere inside the video frame.

- Works with mouse and touch (touch drag handle is hidden on mobile — drag directly on the subtitle text)
- Position resets on page reload (not persisted)

---

## 🔧 Advanced Example

```javascript
player.on('playerready', () => {
  player.usePlugin('autoSubtitles', {
    language:        'english', // language of the audio: "english" or "en" (if empty auto-detect)
    modelSize:       'base',     // ai model to use: 'tiny', 'base', 'small'
    autoGenerate:    true,       // start transcription and view subtitles automatically without user interacton
    autoTranslation: 'en',       // auto-translate to English when ready
    position:        'topbar',   // CC button next to ⚙️ settings icon; options are: 'left', 'right', 'topbar'
    cacheEnabled:    true,       // cache client-side with localstorage
    idCache:         `video-${videoId}`, // id of the key for the cache (if empty hased url will be used)
    subtitleStyle: {
      fontSize: '1.2em',
      color:    '#ffe066',
    },
  });
});
```


---

## 🏗️ How It Works

```
User clicks CC
      │
      ▼
Check localStorage cache
      │
   Hit ──────────────────────► Load subtitles instantly
      │
   Miss
      │
      ▼
Extract audio (fetch or captureStream)
      │
      ▼
Fetch Transformers.js bundle (main thread)
      │
      ▼
Spawn Web Worker (blob, type:module)
      │
      ▼
Worker: dynamic import(bundleBlob)
      │
      ▼
Whisper ASR — chunks of 30s each
      │  (subtitles stream in live)
      ▼
Save to localStorage cache
```


---

## 📄 License

MIT © [Oscar Cosimo - MYETV](https://oskarcosimo.com)

---

## 🤝 Contributing

Pull requests welcome. For major changes, please open an issue first.

---

> Built with ❤️ from the [MYETV](https://www.myetv.tv) team.

```
```
