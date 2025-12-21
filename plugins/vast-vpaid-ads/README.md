# VAST / VPAID Ads Plugin for MYETV Player

Lightweight JavaScript plugin to handle **VAST** (and basic VPAID) ads directly in the MYETV video player, without external dependencies or third‑party SDKs. [file:86]

---

## Features

- Load ads from a **VAST URL** (`vastUrl`) or injected VAST XML (`vastXML`). [file:86]  
- Pre‑roll ads that block content until the ad finishes or is skipped. [file:86]  
- Full‑screen overlay with “Ad” label and configurable “Skip ad” button. [file:86]  
- Automatic parsing of:
  - `MediaFile` (MP4 preferred)
  - `Impression`
  - `ClickThrough` / `ClickTracking`
  - `skipoffset` and `Duration` [file:86]  
- Impression and click tracking via image pixels. [file:86]  
- No dependency on Google IMA or other SDKs. [file:86]

---

## Installation

Include the plugin file **after** the MYETV player:

```javascript
// Generic example, adapt to your paths/build
```

<script src="dist/myetv-player.js"></script>

```
```

<script src="plugins/vast-vpaid-ads-plugin.js"></script>

```
```

The plugin registers itself globally as `vast` via `window.registerMYETVPlugin('vast', VASTPlugin)`. [file:86]

---

## Basic usage

### Initialize via player configuration

```javascript
const player = new MYETVPlayer({
  // ... other player options
  plugins: {
    vast: {
      vastUrl: 'https://example.com/path/to/vast.xml',
      debug: true
    }
  }
});
```


### Activate after initialization

```javascript
const player = new MYETVPlayer({ /* ... */ });

player.usePlugin('vast', {
  vastUrl: 'https://example.com/path/to/vast.xml',
  debug: true
});
```

The plugin requests the ad on the **first video play** event, shows the pre‑roll, then resumes the main content. [file:86]

---

## Available options

All options can be passed at initialization (through `plugins.vast`) or via `usePlugin('vast', options)`. [file:86]


| Option | Type | Default | Description |
| :-- | :-- | :-- | :-- |
| `vastUrl` | string | `''` | VAST URL to fetch the XML response from. If not set and `vastXML` is missing, the plugin throws an error. [file:86] |
| `vastXML` | string | `null` | Preloaded VAST XML string, alternative to `vastUrl`. [file:86] |
| `skipDelay` | number | `5` (sec) | Fallback delay (in seconds) before showing the “Skip ad” button, used when `skipoffset` is missing or invalid. [file:86] |
| `maxRedirects` | number | `5` | Maximum number of supported VAST redirects (wrappers are only partially handled in this version). [file:86] |
| `timeout` | number | `8000` (ms) | Timeout for the VAST `fetch` request. [file:86] |
| `debug` | boolean | `false` | Enables more verbose logging in the console. [file:86] |
| `adLabel` | string | `Pubblicità` | Text for the label shown in the top‑left corner of the ad overlay. [file:86] |
| `skipText` | string | `Salta annuncio` | Text for the skip button. [file:86] |


---

## Flow

1. **Hook on `play`**
On the first play:
    - If `vastUrl` or `vastXML` are configured, `loadVAST()` is called and the main content is paused. [file:86]
2. **VAST loading and parsing**
    - If `vastXML` is present, that string is used directly.
    - Otherwise, the plugin performs `fetch(vastUrl)` and reads the response as text. [file:86]
    - The VAST is parsed using `DOMParser` and it extracts:
        - one `MediaFile` (preferring MIME `video/mp4`)
        - impressions, clickthrough, clicktracking
        - skip offset and duration. [file:86]
3. **Ad playback**
    - A full‑screen overlay is created with:
        - “Ad” label
        - dedicated ad `<video>`
        - “Skip ad” button (initially hidden). [file:86]
    - The ad video is played, impression URLs are fired, and the skip button is shown after `skipOffset` seconds (or the `skipDelay` fallback). [file:86]
4. **End or skip**
    - When the ad ends or is skipped:
        - overlay and button are hidden
        - the ad video source is cleared
        - the main video resumes (`this.player.video.play()`). [file:86]
    - The following events are triggered on the player: `adstarted`, `adcomplete`, `adskipped`, `aderror`. [file:86]

---

## Events

The plugin emits several events on the player, useful for UI and analytics: [file:86]

- `adstarted` – when the ad starts
- `adcomplete` – when the ad finishes normally
- `adskipped` – when the user skips the ad
- `aderror` – when there is a VAST loading/parsing error

Example:

```javascript
player.on('adstarted', () => console.log('Ad started'));
player.on('adcomplete', () => console.log('Ad completed'));
player.on('adskipped', () => console.log('Ad skipped'));
player.on('aderror', e => console.error('Ad error', e));
```


---

## Notes and limitations

- Full support for VAST **InLine**; **Wrapper** responses are detected but not deeply followed in this version. [file:86]
- The plugin prefers a `MediaFile` in MP4; other formats depend on browser support. [file:86]
- Make sure your ad server returns a valid VAST (2.0/3.0) with at least one compatible `MediaFile`. [file:86]
