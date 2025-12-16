# Google IMA Plugin for MYETV Video Player

A plugin that integrates the **Google Interactive Media Ads (IMA) SDK** with the MYETV Video Player.  
It enables true video advertising (pre-roll, mid-roll, post-roll, VMAP, VAST, VPAID) using a standard HTML5 player.

## Important Notes

- This plugin uses **Google IMA SDK**, not standard AdSense display units.
- You must provide a valid **VAST/VMAP ad tag URL** or an `adsResponse`.
- For AdSense for Video, Google Ad Manager, or other ad networks, you still need a compatible ad tag.
- The plugin overlays ads on top of the video element using an IMA-managed ad container.

## Features

- ✅ Full integration with **Google IMA HTML5 SDK**
- ✅ Supports **VAST**, **VMAP**, and **VPAID**
- ✅ Uses `AdDisplayContainer`, `AdsLoader`, and `AdsManager`
- ✅ Automatic ad request on first play
- ✅ Handles ad lifecycle events (start, complete, error, skipped, etc.)
- ✅ Responsive ad resizing on window resize
- ✅ Customizable locale, labels, and rendering settings
- ✅ Debug logging

## Installation

### 1. Include the IMA SDK

Add the Google IMA SDK script to your HTML page:

```html
<script src="https://imasdk.googleapis.com/js/sdkloader/ima3.js"></script>
```

### 2. Include the Plugin

```html
<script src="path/to/g-ima-ads-plugin.js"></script>
```

### 3. Initialize the MYETV Video Player

```html
<video id="my-video" controls>
    <source src="video.mp4" type="video/mp4">
</video>

<script>
const player = new VideoPlayer('#my-video', {
    // ... other player options
});
</script>
```

### 4. Initialize the Google IMA Plugin

```javascript
const imaPlugin = new GoogleIMAPlugin(player, {
    adTagUrl: 'https://your-ad-server.example.com/vast-tag',
    locale: 'en',
    showCountdown: true,
    showControls: true,
    autoPlayAdBreaks: true,
    vpaidMode: 'ENABLED',
    vastLoadTimeout: 5000,
    numRedirects: 4,
    debug: false
});

// Setup the plugin
imaPlugin.setup();
```

## Configuration Options

All options are passed as the second argument to `new GoogleIMAPlugin(player, options)`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `adTagUrl` | String | `''` | VAST / VMAP ad tag URL (required unless `adsResponse` is provided) |
| `adsResponse` | String / Object | `null` | Pre-fetched VAST XML / JSON response instead of `adTagUrl` |
| `locale` | String | `'it'` | IMA UI locale (e.g. `en`, `it`, `fr`) |
| `showCountdown` | Boolean | `true` | Whether to show IMA countdown / UI elements |
| `showControls` | Boolean | `true` | Whether to allow ad controls (play/pause, etc.) |
| `autoPlayAdBreaks` | Boolean | `true` | Automatically play ad breaks when they are ready |
| `disableCustomPlaybackForIOS10Plus` | Boolean | `false` | IMA custom playback compatibility flag for iOS 10+ |
| `vastLoadTimeout` | Number | `5000` | VAST load timeout in milliseconds |
| `debug` | Boolean | `false` | Enable console debug logging |
| `vpaidMode` | String | `'ENABLED'` | `'ENABLED'`, `'INSECURE'`, or `'DISABLED'` for VPAID support |
| `adLabel` | String | `'ADS'` | Ad label text (e.g. "Ad", "Advertisement") |
| `adLabelNofN` | String | `'di'` | Separator for "Ad X of Y" text (e.g. "of") |
| `nonLinearWidth` | Number / `null` | `null` | Custom non-linear ad width (fallback: video width) |
| `nonLinearHeight` | Number / `null` | `null` | Custom non-linear ad height (fallback: video height / 3) |
| `numRedirects` | Number | `4` | Maximum number of allowed VAST redirects |
| `adsRenderingSettings` | Object | `{}` | Custom `AdsRenderingSettings` options merged into defaults |

## How It Works

Internally, the plugin:

1. Creates an **ad container** overlay (`div`) on top of the player container.
2. Creates an `AdDisplayContainer` with the video element and the ad container.
3. Creates an `AdsLoader` and listens for:
   - `ADS_MANAGER_LOADED`
   - `AD_ERROR`
4. On `ADS_MANAGER_LOADED`, it creates an `AdsManager` with `AdsRenderingSettings`.
5. Starts the ads by calling:
   - `adsManager.init(width, height, ViewMode.NORMAL)`
   - `adsManager.start()`
6. Listens to ad events (STARTED, COMPLETE, ALL_ADS_COMPLETED, SKIPPED, PAUSED, RESUMED, etc.) and forwards custom events to the player.

## Automatic Behavior

By default, the plugin:

- Requests ads on **first video play** if `adTagUrl` or `adsResponse` is provided.
- Shows the ad container when ads start.
- Hides the ad container when all ads complete or on ad error.
- Resumes content playback on ad error.
- Resizes ads on **window resize** to match the video size.

## Public Methods

### `setup()`

Initializes the plugin, creates the ad container, and prepares IMA.

```javascript
imaPlugin.setup();
```

### `requestAds()`

Explicitly request ads (already called automatically on first play, if configured).

```javascript
imaPlugin.requestAds();
```

### `dispose()`

Destroy ads manager, ads loader, and remove the ad container.

```javascript
imaPlugin.dispose();
```

## Events

The plugin fires custom events on the MYETV player to help you react to ad lifecycle:

| Event | Description |
|-------|-------------|
| `adstarted` | Fired when an ad starts playing |
| `adcomplete` | Fired when a single ad completes |
| `allAdscomplete` | Fired when all ads in the pod / VMAP are finished |
| `adpaused` | Fired when an ad is paused |
| `adresumed` | Fired when an ad resumes |
| `adskipped` | Fired when an ad is skipped |
| `aderror` | Fired when an ad error occurs (also resumes content) |

Example:

```javascript
player.on('adstarted', () => {
    console.log('IMA ad started');
});

player.on('allAdscomplete', () => {
    console.log('All IMA ads completed');
});

player.on('aderror', (e) => {
    console.error('Ad error:', e);
});
```

## Ad Tag Requirements

You can use:

- **Google Ad Manager** VAST / VMAP tags
- **AdSense for Video** tags (if your account is approved)
- Third-party ad networks that provide **VAST/VMAP** URLs compatible with IMA

Example VAST tag URL (Google Ad Manager style):

```
https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/123456789/video_ad_unit&env=vp&gdfp_req=1&output=vast&unviewed_position_start=1
```

Set it in the plugin:

```javascript
const imaPlugin = new GoogleIMAPlugin(player, {
    adTagUrl: 'https://pubads.g.doubleclick.net/gampad/ads?...',
    locale: 'en'
});

imaPlugin.setup();
```

## Iframe & Policy Considerations

- Google IMA is **designed** to work with iframes and manages its own internal ad iframes.
- However, general Google ads policy still applies:
  - Use **friendly iframes** (same domain) whenever possible.
  - Avoid using external iframes to circumvent ad limits or policies.
- For strict policy details, always refer to the latest Google IMA and AdSense/Ad Manager documentation.

## Troubleshooting

### No ads are playing

Check:

1. `adTagUrl` is a valid VAST/VMAP URL and returns a proper response.
2. IMA SDK script is loaded:
   ```html
   <script src="https://imasdk.googleapis.com/js/sdkloader/ima3.js"></script>
   ```
3. Autoplay policies: some browsers block autoplay without user interaction.
4. If `debug: true` is enabled, watch the browser console for:
   - Initialization logs
   - Ad errors / warnings

### AdError events

Listen for `aderror`:

```javascript
player.on('aderror', (event) => {
    console.error('IMA ad error:', event.error);
});
```

The plugin will automatically destroy the `AdsManager` and resume content playback on error.

## Browser Support

- Chrome / Edge (latest)
- Firefox (latest)
- Safari (desktop & iOS)
- Android Chrome
- Other modern browsers supporting HTML5 video and JavaScript

## License

Created by [MYETV.tv](https://www.myetv.tv) & [Oskar Cosimo](https://oskarcosimo.com)

## Related Plugins

- **Google AdSense Plugin** - Overlay display ads using standard AdSense units.
- See `g-adsense-ads-plugin.js` for banner-style overlays.

## Support

For issues or questions:

- GitHub Issues: https://github.com/OskarCosimo/myetv-video-player-opensource
