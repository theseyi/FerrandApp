module.exports = function (grunt) {

    //Project  and task config
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            build: {
                files: [
                    {
                        expand: true,
                        cwd   : '<%= src_dir %>',
                        src: ['*.js', '!*.min.js'],
                        dest  : '<%= src_dir %>/<%= dest_dir %>/',
                        ext   : '.js'
                    }
                ]
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build  : {
                src: ['<%= concat.build.files[0].dest %>*.js', '!*.min.js'],
                dest: '<%= src_dir %>/<%= dest_dir %>/<%= pkg.name %>.min.js'
            }
        },

        watch: {
            files: ['<%= src_dir %>/**/*.js', '!<%= src_dir %>/**/*.min.js'],
            tasks: ['concat', 'uglify']
        },

        src_dir: 'js',

        src_files: ['<%= src_dir %>/<%= pkg.name %>.js'],

        dest_dir: 'build'
    });

    //load grunt's concat
    grunt.loadNpmTasks('grunt-contrib-concat');
    //load grunt's uglify
    grunt.loadNpmTasks('grunt-contrib-uglify');
    //load grunt's watch
    grunt.loadNpmTasks('grunt-contrib-watch');

    //Default tasks
    grunt.registerTask('default', ['concat', 'uglify']);
};