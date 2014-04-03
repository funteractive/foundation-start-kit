'use strict';

var js = 'shared/js/script.js',
	minJs = 'shared/js/script.min.js';

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		bower: {
			install: {
				options: {
					targetDir: './lib',
					layout: 'byType',
					install: true,
					verbose: false,
					cleanTargetDir: true,
					cleanBowerDir: true
				}
			}
		},
		compass: {
			dist: {
				options: {
					sassDir: 'shared/scss',
					cssDir: './',
					config: 'config.rb'
				}
			}
		},
		autoprefixer: {
			// prefix the specified file
			single_file: {
				options: {
					map: true
				},
				src: './style.css',
				dest: './style.css'
			}
		},
		cssmin: {
			style: {
				src: './style.css',
				dest: './style.min.css'
			}
		},
		jshint: {
			all: [js, minJs]
		},
		uglify: {
			my_target: {
				files: {
					'shared/js/script.min.js': [js]
				}
			}
		},
		kss: {
			options: {
				includeType: 'css',
				includePath: 'style.css',
				template: 'doc/template'
			},
			dist: {
				files: {
					'doc/': ['shared/scss/']
				}
			}
		},
		watch: {
			css: {
				files: [ 'shared/scss/*.scss', 'shared/scss/*/*.scss' ],
				tasks: [ 'compass', 'autoprefixer' ]
			},
			livereload: {
				options: { livereload: true },
				files: [ './*.css', './*.html', './*.php' ]
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-bower-task');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-kss');

	grunt.registerTask('default', [ 'watch' ]);
	grunt.registerTask('dist', [ 'compass', 'autoprefixer', 'cssmin', 'kss', 'uglify', 'jshint' ]);
	grunt.registerTask('build', [ 'bower:install' ]);

};
