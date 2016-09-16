module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        watch: {
            files: ['src/*.js'],
            tasks: ['babel']
        },
        babel: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    "js/game-of-life.js": "src/game-of-life.js"
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-babel');

    grunt.registerTask('default', ['babel']);
};