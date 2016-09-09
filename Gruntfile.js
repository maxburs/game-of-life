module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        watch: {
            files: ['src/*.js', 'src/*.scss'],
            tasks: ['babel']
        },
        babel: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    "game-of-life.js": "src/game-of-life.js"
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-babel');

    grunt.registerTask('default', ['babel']);
};