/* Plugins Module for MYETV Video Player
 * Plugin system for extensible player functionality
 * Created by https://www.myetv.tv https://oskarcosimo.com
 */

// ===================================================================
// GLOBAL CODE - Will be placed OUTSIDE the class by build script
// ===================================================================
// NOTE: This section will be extracted by the build script
// and placed outside the class definition

/* GLOBAL_START */
// Global plugin registry
if (!window.MYETVPlayerPlugins) {
    window.MYETVPlayerPlugins = {};
}

/**
 * Register a plugin globally
 * @param {String} name - Plugin name
 * @param {Function|Object} plugin - Plugin constructor or factory function
 */
function registerPlugin(name, plugin) {
    if (window.MYETVPlayerPlugins[name]) {
        console.warn(`Plugin "${name}" is already registered. Overwriting...`);
    }

    window.MYETVPlayerPlugins[name] = plugin;

    if (typeof console !== 'undefined') {
        console.log(`🔌 Plugin "${name}" registered globally`);
    }
}

// Export registerPlugin as a global function
window.registerMYETVPlugin = registerPlugin;
/* GLOBAL_END */

// ===================================================================
// CLASS METHODS - Will be placed INSIDE the class
// ===================================================================

/**
 * Initialize plugin system for player instance
 * This method should be called in the player constructor
 */
initializePluginSystem() {
    // Plugin instances storage
    this.plugins = {};

    // Plugin hooks for lifecycle events
    this.pluginHooks = {
        'beforeInit': [],
        'afterInit': [],
        'beforePlay': [],
        'afterPlay': [],
        'beforePause': [],
        'afterPause': [],
        'beforeQualityChange': [],
        'afterQualityChange': [],
        'beforeDestroy': [],
        'afterDestroy': []
    };

    if (this.options.debug) {
        console.log('🔌 Plugin system initialized');
    }

    // Load plugins specified in options
    if (this.options.plugins && typeof this.options.plugins === 'object') {
        this.loadPlugins(this.options.plugins);
    }
}

/**
 * Load multiple plugins from options
 * @param {Object} pluginsConfig - Object with plugin names as keys and options as values
 */
loadPlugins(pluginsConfig) {
    for (const pluginName in pluginsConfig) {
        if (pluginsConfig.hasOwnProperty(pluginName)) {
            const pluginOptions = pluginsConfig[pluginName];
            this.usePlugin(pluginName, pluginOptions);
        }
    }
}

/**
 * Use (initialize) a plugin on this player instance
 * @param {String} name - Plugin name
 * @param {Object} options - Plugin options
 * @returns {Object|null} Plugin instance or null if failed
 */
usePlugin(name, options = {}) {
    // Check if plugin is registered
    if (!window.MYETVPlayerPlugins[name]) {
        console.error(`🔌 Plugin "${name}" is not registered. Please load the plugin file first.`);
        return null;
    }

    // Check if plugin is already initialized
    if (this.plugins[name]) {
        console.warn(`🔌 Plugin "${name}" is already initialized on this player`);
        return this.plugins[name];
    }

    try {
        const PluginClass = window.MYETVPlayerPlugins[name];

        // Trigger before plugin setup event
        this.triggerPluginEvent('beforepluginsetup', name, options);
        this.triggerPluginEvent(`beforepluginsetup:${name}`, name, options);

        // Initialize plugin
        let pluginInstance;

        if (typeof PluginClass === 'function') {
            // Plugin is a constructor or factory function
            pluginInstance = new PluginClass(this, options);
        } else if (typeof PluginClass === 'object' && typeof PluginClass.create === 'function') {
            // Plugin is an object with create method
            pluginInstance = PluginClass.create(this, options);
        } else {
            throw new Error(`Invalid plugin format for "${name}"`);
        }

        // Store plugin instance
        this.plugins[name] = pluginInstance;

        // Call plugin setup method if exists
        if (typeof pluginInstance.setup === 'function') {
            pluginInstance.setup();
        }

        // Trigger after plugin setup event
        this.triggerPluginEvent('pluginsetup', name, options);
        this.triggerPluginEvent(`pluginsetup:${name}`, name, options);

        if (this.options.debug) {
            console.log(`🔌 Plugin "${name}" initialized successfully`);
        }

        return pluginInstance;

    } catch (error) {
        console.error(`🔌 Failed to initialize plugin "${name}":`, error);
        return null;
    }
}

/**
 * Get a plugin instance
 * @param {String} name - Plugin name
 * @returns {Object|null} Plugin instance or null
 */
getPlugin(name) {
    return this.plugins[name] || null;
}

/**
 * Check if a plugin is loaded
 * @param {String} name - Plugin name
 * @returns {Boolean}
 */
hasPlugin(name) {
    return !!this.plugins[name];
}

/**
 * Remove a plugin from this player instance
 * @param {String} name - Plugin name
 * @returns {Boolean} Success status
 */
removePlugin(name) {
    if (!this.plugins[name]) {
        console.warn(`🔌 Plugin "${name}" is not initialized on this player`);
        return false;
    }

    try {
        const plugin = this.plugins[name];

        // Call plugin dispose method if exists
        if (typeof plugin.dispose === 'function') {
            plugin.dispose();
        }

        // Remove plugin instance
        delete this.plugins[name];

        if (this.options.debug) {
            console.log(`🔌 Plugin "${name}" removed successfully`);
        }

        return true;

    } catch (error) {
        console.error(`🔌 Failed to remove plugin "${name}":`, error);
        return false;
    }
}

/**
 * Trigger plugin-specific event
 * @param {String} eventType - Event type
 * @param {String} pluginName - Plugin name
 * @param {Object} data - Event data
 */
triggerPluginEvent(eventType, pluginName, data = {}) {
    // Use existing event system
    this.triggerEvent(eventType, {
        pluginName: pluginName,
        ...data
    });
}

/**
 * Register a hook for plugin lifecycle
 * @param {String} hookName - Hook name
 * @param {Function} callback - Callback function
 */
registerPluginHook(hookName, callback) {
    if (!this.pluginHooks[hookName]) {
        this.pluginHooks[hookName] = [];
    }

    this.pluginHooks[hookName].push(callback);

    if (this.options.debug) {
        console.log(`🔌 Hook registered: ${hookName}`);
    }
}

/**
 * Execute plugin hooks
 * @param {String} hookName - Hook name
 * @param {Object} data - Data to pass to hook callbacks
 */
executePluginHooks(hookName, data = {}) {
    if (!this.pluginHooks[hookName] || this.pluginHooks[hookName].length === 0) {
        return;
    }

    this.pluginHooks[hookName].forEach(callback => {
        try {
            callback(data);
        } catch (error) {
            console.error(`🔌 Error executing hook "${hookName}":`, error);
        }
    });
}

/**
 * Dispose all plugins
 */
disposeAllPlugins() {
    const pluginNames = Object.keys(this.plugins);

    pluginNames.forEach(name => {
        this.removePlugin(name);
    });

    if (this.options.debug) {
        console.log('🔌 All plugins disposed');
    }
}

/**
 * Get all active plugins
 * @returns {Object}
 */
getActivePlugins() {
    return { ...this.plugins };
}

/**
 * Get plugin API
 * @returns {Object}
 */
getPluginAPI() {
    return {
        player: this,
        video: this.video,
        container: this.container,
        controls: this.controls,
        play: () => this.play(),
        pause: () => this.pause(),
        togglePlayPause: () => this.togglePlayPause(),
        getCurrentTime: () => this.getCurrentTime(),
        setCurrentTime: (time) => this.setCurrentTime(time),
        getDuration: () => this.getDuration(),
        getVolume: () => this.getVolume(),
        setVolume: (volume) => this.setVolume(volume),
        addEventListener: (eventType, callback) => this.addEventListener(eventType, callback),
        removeEventListener: (eventType, callback) => this.removeEventListener(eventType, callback),
        triggerEvent: (eventType, data) => this.triggerEvent(eventType, data),
        registerHook: (hookName, callback) => this.registerPluginHook(hookName, callback),
        addControlButton: (button) => this.addPluginControlButton(button),
        removeControlButton: (buttonId) => this.removePluginControlButton(buttonId),
        getQualities: () => this.getQualities(),
        setQuality: (quality) => this.setQuality(quality),
        options: this.options,
        debug: (message) => {
            if (this.options.debug) {
                console.log('🔌 Plugin debug:', message);
            }
        }
    };
}

/**
 * Add a custom control button for plugins
 * @param {Object} buttonConfig
 * @returns {HTMLElement|null}
 */
addPluginControlButton(buttonConfig) {
    if (!this.controls) {
        console.error('🔌 Controls not available');
        return null;
    }

    const {
        id,
        icon,
        tooltip,
        position = 'right',
        onClick,
        className = ''
    } = buttonConfig;

    const button = document.createElement('button');
    button.id = id || `plugin-btn-${Date.now()}`;
    button.className = `control-btn plugin-control-btn ${className}`;
    button.setAttribute('aria-label', tooltip || 'Plugin button');
    button.setAttribute('title', tooltip || '');

    if (icon) {
        button.innerHTML = icon;
    }

    if (onClick && typeof onClick === 'function') {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            onClick(e, this);
        });
    }

    const targetContainer = position === 'left'
        ? this.controls.querySelector('.controls-left')
        : this.controls.querySelector('.controls-right');

    if (targetContainer) {
        targetContainer.appendChild(button);

        if (this.options.debug) {
            console.log(`🔌 Plugin control button added: ${button.id}`);
        }

        return button;
    }

    return null;
}

/**
 * Remove a plugin control button
 * @param {String} buttonId
 * @returns {Boolean}
 */
removePluginControlButton(buttonId) {
    const button = document.getElementById(buttonId);

    if (button) {
        button.remove();

        if (this.options.debug) {
            console.log(`🔌 Plugin control button removed: ${buttonId}`);
        }

        return true;
    }

    return false;
}