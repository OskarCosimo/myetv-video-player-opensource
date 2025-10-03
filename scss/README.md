# MYETV Video Player - SCSS Files

## 📁 File Structure

```
myetv-player/
├── scss/
│   ├── myetv-player.scss         # Main file
│   ├── _variables.scss            # Variables (colors, sizes, etc.)
│   ├── _mixins.scss               # Reusable mixins
│   ├── _base.scss                 # Base styles
│   ├── _video.scss                # Video element
│   ├── _loading.scss              # Loading overlay
│   ├── _title-overlay.scss        # Title overlay
│   ├── _controls.scss             # Player controls
│   ├── _progress-bar.scss         # Progress bar
│   ├── _volume.scss               # Volume controls
│   ├── _menus.scss                # Dropdown menus
│   ├── _poster.scss               # Video poster
│   ├── _watermark.scss            # Watermark
│   ├── _tooltips.scss             # Tooltip system
│   ├── _audio-player.scss         # Player for only audio files
│   ├── _themes.scss               # Alternative themes
│   ├── _resolution.scss           # Display modes
│   └── _responsive.scss           # Media queries
├── package.json
└── README.md
```

## Installation

### 1. Install Node.js
Download and install Node.js from [nodejs.org](https://nodejs.org)

### 2. Install Sass
```bash
npm install
```

Or install Sass globally:
```bash
npm install -g sass
```

## Compilation

### Development (with watch mode)
```bash
npm run scss:watch
```
This command watches SCSS files and recompiles automatically when changed.

### Production (minified)
```bash
npm run scss:prod
```
Generates a minified CSS file for production.

### Single compilation
```bash
npm run scss
```

### Manual compilation
```bash
sass myetv-player.scss myetv-player.css
```

## How to Add Features

### 1. Modify Variables
Open `_variables.scss` and modify the values:
```scss
$player-primary-color: #4a90e2 !default;  // Change primary color
$player-icon-size: 24px !default;          // Change icon size
```

### 2. Add New Components
Create a new file `_component-name.scss` and import it into `myetv-player.scss`:
```scss
@import 'component-name';
```

### 3. Create New Themes
Open `_themes.scss` and add:
```scss
.video-wrapper.theme-custom {
  --player-primary-color: #your-color;
  --player-primary-hover: #your-hover-color;
}
```

### 4. Modify Responsive Breakpoints
Open `_mixins.scss` and customize the breakpoints:
```scss
@mixin tablet {
  @media (max-width: 768px) {
    @content;
  }
}
```

## Best Practices

1. **Do not modify compiled CSS** - Always work on SCSS files
2. **Use variables** - For reusable values, create variables in `_variables.scss`
3. **Create mixins** - For repeated patterns, add mixins in `_mixins.scss`
4. **Keep files small** - Each file should handle a single component
5. **Test on multiple browsers** - Verify cross-browser compatibility

## Quick Customization

### Change Primary Color
```scss
// In _variables.scss
$player-primary-color: #e74c3c !default;  // Red
```

### Add New Button
```scss
// In _controls.scss
.custom-button {
  @include button-hover;
  // Your styles
}
```

### Create Custom Menu
```scss
// In _menus.scss
.custom-menu {
  @include menu-base;
  // Your additional styles
}
```

## Output

After compilation you will get:
- `myetv-player.css` - Complete CSS file
- `myetv-player.min.css` - Minified CSS file for production
- `myetv-player.css.map` - Source map for debugging (with --source-map)

## Debug

If you use watch mode with source map:
```bash
npm run scss:dev
```

You can see the original SCSS styles in the browser during debug.

## Support

For questions or issues:
- Website: [https://www.myetv.tv](https://www.myetv.tv)
- Developer: [https://oskarcosimo.com](https://oskarcosimo.com)

---

**Happy Coding!**
