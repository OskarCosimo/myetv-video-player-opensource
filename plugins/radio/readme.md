# 📻 MYETV Radio Plugin

![License](https://img.shields.io/badge/license-MIT-green.svg)

A powerful and fully responsive Radio Tuner extension for the **MYETV Video Player Open Source**. 
This plugin transforms your standard video player into a fully-fledged internet radio receiver, complete with interactive UI, real-time filtering, and native player integration.

---

## ✨ Features

- **🎨 Dual Themes**: Choose between two stunning interfaces:
  - **Vintage**: A classic, draggable analog dial with a glowing needle.
  - **Digital**: A modern, car-stereo style LCD display.

- **⚡ Real-time Zapping & Filtering**: Instantly search stations by name, or filter them via the built-in country dropdown without reloading the page.

- **💾 Channel Memory**: Automatically remembers the user's last played channel using `localStorage`.

- **⌨️ Keyboard Override**: Seamlessly hijacks the native left/right arrow keys to zap through radio channels instead of seeking the timeline.

- **⚙️ Native Settings Integration**: Safely injects a custom "Radio Options" panel directly into the player's native settings menu.

- **📱 100% Responsive**: Pixel-perfect UI that adapts to mobile screens and protects the player's control bars with calculated safe-margins.

- **🧹 Clean UI**: Automatically hides irrelevant video controls (like Picture-in-Picture, playback speed, and the progress bar) for a pure audio experience.

---

## 📸 Screenshots

<p align="center">
  <img src="https://github.com/user-attachments/assets/1f5ffcc3-b5b2-4c90-8207-c4a8293d9b7e" alt="Vintage Theme" width="48%">
  &nbsp; &nbsp;
  <img src="https://github.com/user-attachments/assets/95574ef2-b285-444f-af9a-1c05101d4182" alt="Digital Theme" width="48%">
</p>

<p align="center">
  <em>Left: Vintage Theme | Right: Digital Theme</em>
</p>

---

## 🚀 Installation & Usage

1. Include the MYETV Video Player files in your HTML.
2. Include the `myetv-radio-plugin.js` script **after** the main player script.
3. Initialize the plugin via the player's configuration object.

### Basic Example

```html
<link rel="stylesheet" href="path/to/myetv-player.css">
<script src="path/to/myetv-player.js"></script>

<script src="path/to/myetv-radio-plugin.js"></script>

<script>
  var myPlayer = new MYETVvideoplayer('videoElementId', {
      autoplay: true,
      plugins: {
          radio: {
              apiUrl: '',                // required: the url of the JSON with all the radio station to load
              theme: 'digital',          // 'vintage' or 'digital'
              startChannel: 1,           // Default starting channel
              filter: {
                  country: 'IT'          // Filter the country selectbox (optional)
              }
          }
      }
  });
</script>
```

---

## ⚙️ Configuration Options

When defining the `radio` object inside the player's plugins configuration, you can pass the following options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiUrl` | `String` | `'api.php'` | The endpoint to fetch the JSON list of radio stations. |
| `theme` | `String` | `'vintage'` | Sets the UI style. Accepted values: `'vintage'`, `'digital'`. |
| `startChannel` | `Number` | `1` | The channel to tune into on first load (overridden if the user has a saved channel in memory). |
| `showAllCountryOption` | `Boolean` | `true` | Show or hide the ALL option in the contry selectbox. |
| `startCountry` | `String` | `''` | The initial selction in the country selectbox (e.g., `'US'` or `'IT'`) |
| `filter.country` | `String` | `''` | 2-letter ISO code to filter the API stations (e.g., `'US'` or `'IT'`). |
| `filter.language` | `String` | `''` | String to filter the API stations by language (e.g, `'English'` or `'Italian'`. |
| `defaultIcon` | `String` | `''` | The default icon to show for the station and in the stations list. |
| `tagIcons` | `Array` | `'[]'` | An array of icons related to the station tag; see below for examples |
| `proxyUrl` | `String` | `''` | Optional proxy URL to bypass CORS issues for HTTP streams. |

The API url is the `api.php` file, linked to the JSON file with all the stream url of the radio stations in the repository this is the file `station_example.json` that you can use for your tests.

The proxy option, for example proxy.php (already inside the repository), can be like this: `https://mywebsite.com/proxy.html?url=` and it can be used to stream an http file inside an https network.

Icons option example:
```
defaultIcon: 'https://www.mywebsite.com/plugins/radio/icons/radio-solid.png',
tagIcons: {
                'news': 'https://www.mywebsite.com/plugins/radio/icons/newspaper-solid.png',
                'pop': 'https://www.mywebsite.com/plugins/radio/icons/headphones-solid.png',
                'rock': 'https://www.mywebsite.com/plugins/radio/icons/bolt-lightning-solid.png',
                'classical': 'https://www.mywebsite.com/plugins/radio/icons/music-solid.png',
                'dance': 'https://www.mywebsite.com/plugins/radio/icons/compact-disc-solid.png',
                'jazz': 'https://www.mywebsite.com/plugins/radio/icons/guitar-solid.png',
                'sports': 'https://www.mywebsite.com/plugins/radio/icons/medal-solid.png',
                'religious': 'https://www.mywebsite.com/plugins/radio/icons/radio-solid.png',
                'various': 'https://www.mywebsite.com/plugins/radio/icons/radio-solid.png'
          }
```
---

## 🔌 Public API Methods

Once initialized, you can control the Radio plugin programmatically by accessing its instance.

| Method | Description |
|--------|-------------|
| `tune(channelNumber)` | Jumps directly to the specified channel number. |
| `play()` | Starts playback of the currently tuned station. |
| `stop()` | Stops playback and clears the video source. |
| `setTheme('themeName')` | Changes the visual theme on the fly (e.g., `setTheme('digital')`). |
| `dispose()` | Safely removes the radio UI, unbinds all events, and destroys the plugin instance. |

**Example:**
```javascript
// Access the plugin instance (assuming the player exposes active plugins)
var radioPlugin = myPlayer.getPlugin('radio'); // Use your player's specific method to get the plugin

// Change channel to 5
radioPlugin.tune(5);

// Switch to vintage theme
radioPlugin.setTheme('vintage');
```

---

## 🎮 Controls

- **Mouse / Touch**: 
  - Drag the analog dial to tune (Vintage theme).
  - Click the `< TUNE >` buttons (Digital theme).
- **Keyboard**: Use the `Left Arrow` and `Right Arrow` keys to zap between channels seamlessly.
- **Control Bar**: Click the `RADIO LIST` button injected in the player's bottom bar to open the full station directory modal.
- **Settings Gear**: Click the native player settings icon to toggle the "Remember Channel" feature.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check [issues page](https://github.com/OskarCosimo/myetv-video-player-opensource).

## 📝 License

This project is open-source and available under the MIT License.

Created by [MYETV.tv](https://www.myetv.tv) | [Oskar Cosimo](https://oskarcosimo.com)
