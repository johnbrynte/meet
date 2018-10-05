module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            app: {
                files: ["**", "!**/node_modules/**"],
                options: {
                    livereload: true,
                    async: true,
                }
            }
        },
        connect: {
            app: {
                options: {
                    port: 8888,
                    base: './',
                    keepalive: false,
                    livereload: true,
                }
            }
        }
    });

    /*
    Load npmtasks.
     */
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');


    /*
    Register grunt tasks.
     */
    grunt.registerTask('default', ['connect', 'watch']);
};