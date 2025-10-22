// Build script for MYETV Video Player
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const srcDir = './src';
const outputFile = './dist/myetv-player.js';
const scssDir = './scss';
const cssOutputFile = './css/myetv-player.css';
const cssMinOutputFile = './css/myetv-player.min.css';
const scssMainFile = './scss/myetv-player.scss';

// Module order for correct concatenation
const moduleOrder = [
    'core.js',
    'events.js',
    'controls.js',
    'quality.js',
    'subtitles.js',
    'chapters.js',
    'fullscreen.js',
    'playlist.js',
    'watermark.js',
    'streaming.js',
    'plugins.js',
    'utils.js'
];

// ===================================
// SCSS BUILD FUNCTION
// ===================================
async function buildSCSS() {
    console.log('\n📦 Building SCSS files...');
    if (!fs.existsSync(scssDir)) {
        console.log('⚠️  SCSS directory not found, skipping CSS build');
        return;
    }
    if (!fs.existsSync(scssMainFile)) {
        console.log('⚠️  Main SCSS file not found, skipping CSS build');
        return;
    }
    const cssDir = path.dirname(cssOutputFile);
    if (!fs.existsSync(cssDir)) {
        fs.mkdirSync(cssDir, { recursive: true });
        console.log(`✓ Created directory: ${cssDir}`);
    }
    try {
        console.log('Compiling SCSS to CSS (expanded)...');
        await execPromise(`npx sass --style=expanded --no-source-map ${scssMainFile} ${cssOutputFile}`);
        const stats1 = fs.statSync(cssOutputFile);
        const fileSize1KB = (stats1.size / 1024).toFixed(2);
        console.log(`✓ CSS (expanded) created: ${cssOutputFile}`);
        console.log(`  File size: ${fileSize1KB} KB`);
        console.log('Compiling SCSS to CSS (minified)...');
        await execPromise(`npx sass --style=compressed --no-source-map ${scssMainFile} ${cssMinOutputFile}`);
        const stats2 = fs.statSync(cssMinOutputFile);
        const fileSize2KB = (stats2.size / 1024).toFixed(2);
        const savings = ((1 - stats2.size / stats1.size) * 100).toFixed(1);
        console.log(`✓ CSS (minified) created: ${cssMinOutputFile}`);
        console.log(`  File size: ${fileSize2KB} KB (${savings}% smaller)`);
        console.log('\n✓ SCSS build completed successfully!');
    } catch (error) {
        if (error.message.includes('sass: not found') || error.message.includes('command not found')) {
            console.log('\n⚠️  Sass compiler not found!');
            console.log('Install with: npm install -g sass');
            console.log('Or add to package.json: npm install --save-dev sass');
            console.log('\nSkipping CSS build for now...\n');
        } else {
            console.error('✗ SCSS build failed:', error.message);
            throw error;
        }
    }
}

// ===================================
// JAVASCRIPT BUILD FUNCTION
// ===================================
function buildJavaScript() {
    console.log('\n📦 Building MYETV Video Player from modular source...');
    let output = '// MYETV Video Player - Javascript\n';
    output += '// Created by https://www.myetv.tv https://oskarcosimo.com\n\n';
    const i18nPath = path.join(srcDir, 'i18n.js');
    if (fs.existsSync(i18nPath)) {
        console.log('Processing i18n.js...');
        let i18nContent = fs.readFileSync(i18nPath, 'utf8');
        i18nContent = i18nContent.replace(/^\/\/ i18n Module for MYETV Video Player[\s\S]*?Created by.*?\n\n/m, '')
            .replace(/export default VideoPlayerI18n;\s*$/m, '').trim();
        output += i18nContent + '\n\n';
    }
    let pluginsGlobalCode = '';
    const pluginsPath = path.join(srcDir, 'plugins.js');
    if (fs.existsSync(pluginsPath)) {
        console.log('Extracting global plugin code...');
        const pluginsContent = fs.readFileSync(pluginsPath, 'utf8');
        const globalMatch = pluginsContent.match(/\/\* GLOBAL_START \*\/([\s\S]*?)\/\* GLOBAL_END \*\//);
        if (globalMatch) {
            pluginsGlobalCode = globalMatch[1].trim() + '\n\n';
            console.log('✓ Global plugin code extracted');
        }
    }
    if (pluginsGlobalCode) {
        output += '// Plugin System - Global Code\n';
        output += pluginsGlobalCode;
    }
    output += 'class MYETVvideoplayer {\n';
    moduleOrder.forEach((moduleFile, index) => {
        const filePath = path.join(srcDir, moduleFile);
        if (fs.existsSync(filePath)) {
            console.log(`Processing ${moduleFile}... (${index + 1}/${moduleOrder.length})`);
            let content = fs.readFileSync(filePath, 'utf8');
            content = content.replace(/^\/\/.*Module for MYETV Video Player[\s\S]*?Created by.*?\n\n/m, '')
                .replace(/\/\/ .*methods for main class[\s\S]*$/m, '').trim();
            if (moduleFile === 'plugins.js') {
                content = content.replace(/\/\* GLOBAL_START \*\/[\s\S]*?\/\* GLOBAL_END \*\//m, '').trim();
            }
            if (content.length > 0) {
                output += '\n' + content + '\n';
            }
        } else {
            console.warn(`Warning: ${moduleFile} not found, skipping...`);
        }
    });
    output += '\n}\n\n';
    output += '// Export for module systems\n';
    output += 'if (typeof module !== \"undefined\" && module.exports) {\n';
    output += '  module.exports = MYETVvideoplayer;\n';
    output += '}\n';
    output += 'if (typeof define === \"function\" && define.amd) {\n';
    output += '  define([], function() { return MYETVvideoplayer; });\n';
    output += '}\n';
    const distDir = path.dirname(outputFile);
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }
    fs.writeFileSync(outputFile, output);
    console.log('✓ JavaScript build completed successfully!');
    console.log(`✓ Output file: ${outputFile}`);
    console.log(`✓ File size: ${(output.length / 1024).toFixed(2)} KB`);
    console.log(`✓ Total lines: ${output.split('\\n').length.toLocaleString()}`);
}

// ===================================
// NATIVE JS MINIFICATION FUNCTION
// ===================================
function minifyJSNative() {
    const jsFile = './dist/myetv-player.js';
    const minFile = './dist/myetv-player.min.js';
    
    try {
        let code = fs.readFileSync(jsFile, 'utf8');
        
        code = code.replace(/\/\*[\s\S]*?\*\//g, '');
        code = code.replace(/^\s*\/\/.*$/gm, '');
        
        code = code.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        code = code.replace(/  +/g, ' ');
        
        fs.writeFileSync(minFile, code);
        console.log(`✓ JS (minified native) created: ${minFile}`);
        console.log(` File size: ${(code.length / 1024).toFixed(2)} KB`);
    } catch (err) {
        console.log('✗ Native JS minification failed:', err.message);
    }
}

// ===================================
// MAIN BUILD PROCESS
// ===================================
async function build() {
    console.log('\\n========================================');
    console.log('  MYETV Video Player - Build Script');
    console.log('========================================\\n');
    try {
        buildJavaScript();
        minifyJSNative();
        await buildSCSS();
        console.log('\\n========================================');
        console.log('  ✨ Build completed successfully!');
        console.log('========================================');
        console.log('\\n📄 Generated files:');
        console.log('   JavaScript: dist/myetv-player.js');
        console.log('   JavaScript: dist/myetv-player.min.js');
        console.log('   CSS (dev):  css/myetv-player.css');
        console.log('   CSS (prod): css/myetv-player.min.css\\n');
    } catch (error) {
        console.error('\\n✗ Build failed:', error.message);
        process.exit(1);
    }
}

// Run the build
build();