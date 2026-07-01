# 🧩 MYETV Video Loader Plugin

The **Video Loader Plugin** is an advanced Splash Screen / Engine Loader for the MYETV Video Player. It is designed to block the initialization queue (Pipeline) of the core player and all third-party plugins (like YouTube, Vimeo, Twitch), showing a timed loading video before revealing the main content.

## ✨ Architectural Features

* **Async Queue (Blocking Pipeline):** Leverages `Promise`s to freeze the boot sequence of the main player. No external iframe is generated in the DOM until the loader explicitly grants the unlock.
* **TOS Compliant:** Includes a customizable text label overlay to differentiate the system video from a commercial ad, ensuring strict legal compliance with any TOS.
* **Android WebView Fix:** Natively injects a 1x1 transparent Base64 pixel as a `poster` to inhibit the intrusive behavior of Android WebView (which would otherwise brutally draw a giant native Play icon during the buffering phase).
* **"Seamless" Transition:** Unlocks the loading queue a fraction of a second before starting the fade-out transition, allowing external players to load their iframes invisibly underneath the black background, completely avoiding visual flashes.
* **Autoplay Fallback:** Automatically handles strict browser policies by catching the promise rejection and restarting the loading video in muted mode if autoplay with audio is blocked.

---

## 🚀 Installation

Make sure to load the plugin file in the HTML page **after** the core player script, but **before** initializing the player instance.

```html
<script src="path/to/myetv-player.js"></script>

<script src="path/to/myetv-video-loading-plugin.js"></script>

```

---

## 🛠️ Configuration and Usage

The plugin must be declared inside the `plugins` object during the initialization of the `MYETVvideoplayer`.
It is **mandatory** to assign the option `order: 1` to guarantee it is the absolute first plugin to be read and executed by the Pipeline.

```javascript
const player1 = new MYETVvideoplayer('myetvHTML5video', {
    autoplay: true,
    // ... other core options ...

    plugins: {
        
        // 1. ENGINE LOADER (Must be order: 1)
        videoloader: {
            order: 1,  
            videoUrl: '[https://www.myetv.tv/CDN/videos/MYETV_Video_Loading_Player.mp4](https://www.myetv.tv/CDN/videos/MYETV_Video_Loading_Player.mp4)',
            timeout: 3000,
            backgroundColor: '#000000',
            muted: true,
            loadingText: 'MYETV Engine Loading...'
        },

        // 2. THIRD-PARTY PLUGINS (No order needed, default to 99)
        youtube: {
            // YouTube initialization will wait until the videoloader resolves
            apiKey: 'YOUR_API_KEY',
            videoId: 'VIDEO_ID', 
            autoplay: true,
            quality: 'auto'
        }
    }
});

```

---

## ⚙️ Plugin Options

The following options can be passed inside the `videoloader` object to customize its behavior:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `order` | `Number` | `99` | **Mandatory to set it to `1**`. Defines the priority in the core player's loading Pipeline. |
| `videoUrl` | `String` | `null` | The direct URL of the video (supported: `.mp4`,`.webm`,`all videos`,`.webp`,`.gif`,`.png`,`.jpg`) to use as the loading screen. If left null, the plugin skips execution, instantly unlocking the queue. |
| `timeout` | `Number` | `3000` | Exact duration (in milliseconds) to display the loader before unlocking the main player. |
| `backgroundColor` | `String` | `'#000'` | Background color of the overlay behind the loading video. It completely covers the underlying DOM. |
| `muted` | `Boolean` | `true` | If `true`, the loading video plays without audio. It is **strongly recommended** to leave it as `true` to prevent modern browsers from blocking the page's autoplay. |
| `loadingText` | `String` | `'Loading engine...'` | Text shown in the bottom right corner. Crucial for third-party TOS compliance to let the user know this is a system screen and not an ad. |

---

## 🧠 Execution Flow (Under the hood)

1. The core `myetv-player.js` initializes the `loadPluginsSequentially()` async function.
2. It finds `videoloader` with `order: 1` and executes `await pluginInstance.waitForCompletion()`. The execution of the entire main player **halts**.
3. The plugin creates the HTML tags, inserts the transparent pixel against the Android WebView flash, and plays the video in a loop for the milliseconds defined in `timeout`.
4. When the timeout expires, the plugin calls `resolvePromise()`: the main player resumes the loop and can now instantiate the next plugins (e.g., YouTube or other).
5. After a `500ms` CSS fade-out transition, the loader completely destroys its own HTML nodes and frees the RAM (`removeChild`, `removeAttribute('src')`).
6. The player is now fully operational.
