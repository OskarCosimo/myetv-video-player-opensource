# VAST / VPAID Ads Plugin for MYETV Player

Lightweight JavaScript plugin to handle **VAST** (and basic VPAID) ads directly in the MYETV video player, without external dependencies or third‑party SDKs.

---

## Features

- Load ads from a **VAST URL** (`vastUrl`) or injected VAST XML (`vastXML`).
- Pre‑roll ads that block content until the ad finishes or is skipped.
- Full‑screen overlay with “Ad” label and configurable “Skip ad” button.
- Automatic parsing of:
  - `MediaFile` (MP4 preferred)
  - `Impression`
  - `ClickThrough` / `ClickTracking`
  - `skipoffset` and `Duration`
- Impression and click tracking via image pixels.
- No dependency on Google IMA or other SDKs.

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

The plugin registers itself globally as `vast` via `window.registerMYETVPlugin('vast', VASTPlugin)`.

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

The plugin requests the ad on the **first video play** event, shows the pre‑roll, then resumes the main content.

---

## Available options

All options can be passed at initialization (through `plugins.vast`) or via `usePlugin('vast', options)`.


| Option | Type | Default | Description |
| :-- | :-- | :-- | :-- |
| `vastUrl` | string | `''` | VAST URL to fetch the XML response from. If not set and `vastXML` is missing, the plugin throws an error. |
| `vastXML` | string | `null` | Preloaded VAST XML string, alternative to `vastUrl`. |
| `skipDelay` | number | `5` (sec) | Fallback delay (in seconds) before showing the “Skip ad” button, used when `skipoffset` is missing or invalid. |
| `maxRedirects` | number | `5` | Maximum number of supported VAST redirects (wrappers are only partially handled in this version). |
| `timeout` | number | `8000` (ms) | Timeout for the VAST `fetch` request. |
| `debug` | boolean | `false` | Enables more verbose logging in the console. |
| `adLabel` | string | `Pubblicità` | Text for the label shown in the top‑left corner of the ad overlay. |
| `skipText` | string | `Salta annuncio` | Text for the skip button. |


---

## Flow

1. **Hook on `play`**
On the first play:
    - If `vastUrl` or `vastXML` are configured, `loadVAST()` is called and the main content is paused.
2. **VAST loading and parsing**
    - If `vastXML` is present, that string is used directly.
    - Otherwise, the plugin performs `fetch(vastUrl)` and reads the response as text.
    - The VAST is parsed using `DOMParser` and it extracts:
        - one `MediaFile` (preferring MIME `video/mp4`)
        - impressions, clickthrough, clicktracking
        - skip offset and duration.
3. **Ad playback**
    - A full‑screen overlay is created with:
        - “Ad” label
        - dedicated ad `<video>`
        - “Skip ad” button (initially hidden).
    - The ad video is played, impression URLs are fired, and the skip button is shown after `skipOffset` seconds (or the `skipDelay` fallback).
4. **End or skip**
    - When the ad ends or is skipped:
        - overlay and button are hidden
        - the ad video source is cleared
        - the main video resumes (`this.player.video.play()`).
    - The following events are triggered on the player: `adstarted`, `adcomplete`, `adskipped`, `aderror`.

---

## Events

The plugin emits several events on the player, useful for UI and analytics:

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

- Full support for VAST **InLine**; **Wrapper** responses are detected but not deeply followed in this version.
- The plugin prefers a `MediaFile` in MP4; other formats depend on browser support.
- Make sure your ad server returns a valid VAST (2.0/3.0) with at least one compatible `MediaFile`.
