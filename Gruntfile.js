//Gruntfile
module.exports = function(grunt) {
    'use strict';
    grunt.initConfig({
        requirejs: {
            game: {
                options: {
                    baseUrl: "src",
                    mainConfigFile: 'src/requireConfig/config.js',
                    name: "rescuer/js/main",
                    out: "dist/game.js"
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.registerTask('default', ['build']);
    grunt.registerTask('build', ['requirejs']);
};
