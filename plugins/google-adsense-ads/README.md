# Google AdSense Plugin for MYETV Video Player

A plugin that integrates Google AdSense display ads into the MYETV Video Player. This plugin shows responsive AdSense banners as overlay ads when the video is paused.

## Important Notes

- This plugin uses **AdSense Display Ads** (not AdSense for Video)
- Ads appear as **overlay banners** on top of the video player
- **NOT recommended for use inside iframes** - may violate AdSense policies
- For true video ads (pre-roll, mid-roll), use the Google IMA Plugin instead

## Features

- ✅ Responsive AdSense display ads
- ✅ Automatic ad display on video pause
- ✅ Auto-hide when video resumes
- ✅ Customizable ad formats
- ✅ Close button for user control
- ✅ Full-width responsive support
- ✅ Debug mode for troubleshooting

## Installation

### 1. Include AdSense Script

Add the Google AdSense script to your HTML page:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"
     crossorigin="anonymous"></script>
```

Replace `ca-pub-XXXXXXXXXX` with your AdSense Publisher ID.

### 2. Include the Plugin

```html
<script src="path/to/g-adsense-ads-plugin.js"></script>
```

### 3. Initialize the Plugin

```javascript
const player = new VideoPlayer('#video', {
    // ... other player options
});

// Initialize AdSense plugin
const adsensePlugin = new AdSenseVideoPlugin(player, {
    publisherId: 'ca-pub-XXXXXXXXXX',
    adSlot: '1234567890',  // Optional
    adFormat: 'auto',      // Optional
    fullWidth: true,       // Optional
    debug: false           // Optional
});

// Setup the plugin
adsensePlugin.setup();
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `publisherId` | String | `''` | **Required**. Your AdSense Publisher ID (e.g., `ca-pub-XXXXXXXXXX`) |
| `adSlot` | String | `''` | Optional. Specific ad slot ID from AdSense |
| `adFormat` | String | `'auto'` | Ad format: `'auto'`, `'rectangle'`, `'horizontal'`, `'vertical'` |
| `fullWidth` | Boolean | `true` | Enable full-width responsive ads |
| `debug` | Boolean | `false` | Enable debug logging to console |

## How to Get Your Publisher ID

1. Sign in to your [Google AdSense account](https://www.google.com/adsense)
2. Go to **Ads** → **Overview**
3. Click **By ad unit** -> **Display ads**
4. Create a new ad unit or use an existing one
5. Your Publisher ID is in the format: `ca-pub-XXXXXXXXXX`
6. Optional: Copy the Ad Slot ID (the number after `data-ad-slot`)

## Usage Examples

### Basic Usage (Auto Format)

```javascript
const adsensePlugin = new AdSenseVideoPlugin(player, {
    publisherId: 'ca-pub-1234567890'
});

adsensePlugin.setup();
```

### With Specific Ad Slot

```javascript
const adsensePlugin = new AdSenseVideoPlugin(player, {
    publisherId: 'ca-pub-1234567890',
    adSlot: '9876543210',
    debug: true
});

adsensePlugin.setup();
```

### Custom Ad Format

```javascript
const adsensePlugin = new AdSenseVideoPlugin(player, {
    publisherId: 'ca-pub-1234567890',
    adFormat: 'rectangle',  // Force rectangle format
    fullWidth: false
});

adsensePlugin.setup();
```

## Public Methods

### `setup()`
Initializes the plugin and creates the ad container.

```javascript
adsensePlugin.setup();
```

### `showAd()`
Manually show the ad overlay.

```javascript
adsensePlugin.showAd();
```

### `hideAd()`
Manually hide the ad overlay and resume video playback.

```javascript
adsensePlugin.hideAd();
```

### `dispose()`
Clean up and remove the plugin.

```javascript
adsensePlugin.dispose();
```

## Automatic Behavior

The plugin automatically:
- Shows ads when video is **paused**
- Hides ads when video **resumes playing**
- Shows ads when video **ends**
- Provides a **Close Ad** button for users

## Events

The plugin triggers custom events on the player:

| Event | Description |
|-------|-------------|
| `adstarted` | Fired when ad is displayed |
| `adcomplete` | Fired when ad is hidden |

Listen to events:

```javascript
player.on('adstarted', () => {
    console.log('Ad is now showing');
});

player.on('adcomplete', () => {
    console.log('Ad was closed');
});
```

## AdSense Policy Compliance

**Important**: This plugin is designed for use on **main pages only**, not inside iframes. Using AdSense ads inside iframes may violate Google's policies unless you have explicit permission.

### Allowed Usage:
- ✅ Player on main page (same domain)
- ✅ Player embedded directly in page content
- ✅ Single player per page recommended

### Not Allowed:
- ❌ Player inside cross-domain iframe
- ❌ Multiple instances trying to bypass 3-ad limit
- ❌ Ads loaded via iframe on different domain

For iframe-based implementations or true video advertising, consider using **Google IMA SDK** with **AdSense for Video** (requires 2M+ monthly impressions) or **Google Ad Manager**.

## Troubleshooting

### Ads not showing?

1. **Check Publisher ID**: Ensure your `publisherId` is correct and starts with `ca-pub-`
2. **AdSense Script**: Verify the AdSense script is loaded in your HTML
3. **Enable Debug**: Set `debug: true` to see console logs
4. **Ad Blockers**: Disable ad blockers for testing
5. **Policy Compliance**: Ensure your site complies with AdSense policies

### Console Errors?

Enable debug mode:

```javascript
const adsensePlugin = new AdSenseVideoPlugin(player, {
    publisherId: 'ca-pub-XXXXXXXXXX',
    debug: true  // Enable debug logging
});
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Created by [MYETV.tv](https://www.myetv.tv) & [Oskar Cosimo](https://oskarcosimo.com)

## Related Plugins

- **Google IMA Plugin** - For true video ads (pre-roll, mid-roll, post-roll)
- See `g-ima-ads-plugin.js` for video advertising with VAST/VPAID support

## Support

For issues or questions:
- GitHub Issues: https://github.com/OskarCosimo/myetv-video-player-opensource/
