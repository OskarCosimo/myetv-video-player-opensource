# MYETV SoundCloud Plugin

**SoundCloud Plugin for MyETV Player** - Seamlessly integrates SoundCloud into MyETV Player with native controls.

## Features

- ✅ **Native Controls**: Play/Pause, Volume, Mute/Unmute
- ✅ **Full Progress Bar**: Precise seek + time tooltip on mouseover
- ✅ **Auto Restore**: Hides SoundCloud after 10 seconds
- ✅ **Volume Slider**: Drag & drop with precise decimals (0-1)
- ✅ **YouTube Compatible**: Same style and behavior
- ✅ **Zero Conflicts**: Works only in plugin, doesn't touch main player

## Installation

1. **Add plugin to MyETV Player**:
```
const player = new MyETVPlayer(container, {
plugins: [{
name: 'soundcloud',
src: 'myetv-player-soundcloud-plugin.js'
}]
});
```

## Detailed Features

| Function | Implementation | Status |
|----------|----------------|--------|
| **Play/Pause** | `widget.bind(PLAY/PAUSE)` | ✅ |
| **Volume** | `widget.setVolume(0-100)` | ✅ |
| **Seek** | `widget.seekTo(ms)` | ✅ |
| **Tooltip** | Mouseover progress bar | ✅ |
| **Auto-hide** | 10s timeout | ✅ |


## Configurable Options
```
plugins: [{
        name: 'soundcloud',
        src: 'myetv-player-soundcloud-plugin.js',
        options: {
            soundcloudUrl: 'https://soundcloud.com/artist/track',  // REQUIRED
            debug: true,                     // Detailed logs
            controlsDisplayTime: 10000,      // Auto-hide timeout (ms)
            color: 'ff5500',                 // Player color (hex)
            autoPlay: false,                 // Auto play
            hideRelated: true,               // Hide related tracks
            showComments: false,             // Show comments
            showUser: true,                  // Show user info
            showReposts: false,              // Show reposts
            showTeaser: false,               // Show teaser
            visual: false,                   // Waveform mode
            showArtwork: true,               // Show artwork
            buying: false,                   // Show buy button
            sharing: false,                  // Show share button
            download: false,                 // Show download button
            showPlaycount: false             // Show play count
        }
    }]
```

## Compatibility

- ✅ **Desktop**: Chrome, Firefox, Safari, Edge
- ✅ **Mobile**: iOS Safari, Android Chrome
- ✅ **Smart TV**: Fire TV, Android TV
- ✅ **Picture-in-Picture**: Full support

## Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add some AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

Distributed under the [MIT License](LICENSE).

## Authors & Acknowledgments

- **MYETV Team** - Main player
- **SoundCloud Widget API** - [Documentation](https://developers.soundcloud.com/docs/api/widget)

---

⭐ **Star this repo if useful!** ⭐
