# MyeTV Iframe Banner Ads Plugin

Display customizable iframe banner advertisements with countdown timer and auto-close functionality for MyeTV Video Player.

## Features

- **Dual Mode Support**: Direct iframe URL or external ad script injection
- **Auto-close Timer**: Countdown with customizable duration
- **Repeat Intervals**: Show ads periodically during playback
- **Frequency Control**: Set minimum time between ad displays (with cookie tracking)
- **Responsive Design**: Adapts to different screen sizes (desktop/tablet/mobile)
- **Customizable**: Opacity, duration, position, and behavior options
- **User Control**: Optional close button for manual dismissal
- **Smart Positioning**: Auto-adjusts to compact button mode on small screens

## Installation

Include the plugin after the MyeTV Player script:

```
<script src="dist/myetv-player.js"></script>
```

```
<script src="plugins/myetv-iframe-banner-ads.js"></script>
```

## Quick Start

### Method 1: Direct Iframe URL

```
const player = new MYETVvideoplayer('videoElement', {
plugins: {
'iframe-banner-ads': {
url: 'https://your-ads-server.com/banner.html',
duration: 10,
opacity: 0.8
}
}
});
```

### Method 2: External Ad Script

```
const player = new MYETVvideoplayer('videoElement', {
plugins: {
'iframe-banner-ads': {
adScript: 'https://store.myetv.tv/ads/CDN/publishers/adcode.js',
adParams: {
'data-size': '728x90',
'data-language': 'en',
'data-country': 'all',
'data-category': 'all',
'data-uidcode': 'your-unique-code-here'
},
duration: 10,
opacity: 0.85
}
}
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | String | `''` | Direct iframe URL (Method 1) |
| `adScript` | String | `''` | External ad script URL (Method 2) |
| `adParams` | Object | `{}` | Data attributes for ad script (e.g., `data-size`, `data-uidcode`) |
| `duration` | Number | `5` | Auto-close timer duration in seconds |
| `opacity` | Number | `0.85` | Background opacity (0.0 - 1.0) |
| `showOnPlay` | Boolean | `true` | Show banner when video starts playing |
| `showOnPause` | Boolean | `false` | Show banner when video is paused |
| `closeable` | Boolean | `true` | Display close button (X) |
| `minTimeBetweenAds` | Number | `0` | Minimum seconds between ad displays (uses cookie) |
| `repeatInterval` | Number | `0` | Show ad every X seconds during playback |
| `cookieName` | String | `'myetv_last_ad_timestamp'` | Cookie name for tracking ad frequency |
| `debug` | Boolean | `false` | Enable console logging |

## Advanced Examples

### Frequency Control with Repeat Interval

```
const player = new MYETVvideoplayer('videoElement', {
plugins: {
'iframe-banner-ads': {
url: 'https://your-ads.com/banner.html',
duration: 10,
minTimeBetweenAds: 60,  // Don't show ads more than once per minute
repeatInterval: 90,      // Show ad every 90 seconds during video
debug: false
}
}
});
```

**Behavior:**
- Video starts → Ad shown
- Ad closes after 7 seconds
- After 90 seconds → Ad shown again (if `minTimeBetweenAds` allows)
- Continues until video ends

### Custom Ad Script with All Options

```
const player = new MYETVvideoplayer('videoElement', {
plugins: {
'iframe-banner-ads': {
adScript: 'https://store.myetv.tv/ads/CDN/publishers/adcode.js',
adParams: {
'data-size': '728x90',
'data-uidcode': 'yourusercode'
},
duration: 10,
opacity: 0.9,
showOnPlay: true,
showOnPause: false,
closeable: true,
minTimeBetweenAds: 120,
repeatInterval: 0,  // Disabled
debug: false
}
}
});
```

## API Methods

Access plugin instance:

```
const adsPlugin = player.getPlugin('iframe-banner-ads');
```

### Available Methods

```
// Show/hide banner manually
adsPlugin.show();
adsPlugin.hide();
adsPlugin.toggle();

// Update configuration
adsPlugin.setUrl('https://new-url.com/banner.html');  // Iframe mode only
adsPlugin.setAdParams({ 'data-size': '320x50' });     // Script mode only
adsPlugin.setDuration(10);
adsPlugin.setOpacity(0.75);

// Get current state
const state = adsPlugin.getState();
console.log(state.isVisible, state.adShownCount);
```

## Responsive Behavior

The plugin automatically adapts to screen size:

- **Desktop/Tablet** (> 640px): Full-width banner centered above controls
- **Small Screens** (≤ 640px × ≤ 500px): Compact button mode (25% width, left-aligned)
- **Mobile Portrait** (< 480px, tall): Full-width with reduced height

## Cookie Management

When `minTimeBetweenAds` is set, the plugin uses a cookie to track the last ad timestamp:

- **Cookie Name**: `myetv_last_ad_timestamp` (customizable via `cookieName` option)
- **Duration**: 2× `minTimeBetweenAds` value
- **SameSite**: `Lax`
- **Path**: `/` (site-wide)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License - Created by [MyeTV](https://www.myetv.tv) & [Oskar Cosimo](https://oskarcosimo.com)

## Contributing

Issues and pull requests are welcome! Please visit [GitHub Repository](#) for more information.

## Support

For questions or support, please [open an issue](https://github.com/myetv-video-player-opensource/issues) or contact us at [https://support.myetv.tv](https://support.myetv.tv)
