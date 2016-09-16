module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        watch: {
            files: ['src/*.js', 'src/*.scss'],
            tasks: ['babel', 'sass']
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
        },
        sass: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    'css/game-of-life.css': 'src/game-of-life.scss'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-sass');

    grunt.registerTask('default', ['babel', 'sass']);
};