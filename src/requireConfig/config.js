require.config({
    baseUrl: "../",
    paths: {
        text: '../vendor/text/text',
        easeljs: '../vendor/easeljs/lib/easeljs-0.8.0.min',
        soundjs: '../vendor/SoundJS/lib/soundjs-0.6.0.min',
        preloadjs: '../vendor/PreloadJS/lib/preloadjs-0.6.0.min',
        easytimerjs: '../vendor/easytimer.js/dist/easytimer.min',
        underscore: '../vendor/underscore/underscore',
        jquery: '../vendor/jquery/dist/jquery',
        sharebutton: '../vendor/share-button/build/share.min'
    },

    shim: {
        easeljs: {
            exports: 'createjs.EaselJS'
        },

        soundjs: {
            exports: 'createjs.SoundJS'
        },

        preloadjs: {
            exports: 'createjs.PreloadJS'
        }
    }
});
