'use strict';

var js = 'shared/js/script.js',
	minJs = 'shared/js/script.min.js';

var licenseRegexp = /^\!|^@preserve|^@cc_on|\bMIT\b|\bMPL\b|\bGPL\b|\(c\)|License|Copyright/mi;
var isLicenseComment = (function() {
	var _prevCommentLine = 0;

	return function(node, comment) {
		if (licenseRegexp.test(comment.value) ||
				comment.line === 1 ||
				comment.line === _prevCommentLine + 1) {
			_prevCommentLine = comment.line;
			return true;
		}

		_prevCommentLine = 0;
		return false;
	};
})();


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
			dist:{
				options:{
					preserveComments: isLicenseComment
				},
				files: [
					{
						expand : true,
						flatten: true,
						src: ['shared/js/lib/*.js'],
						dest: 'shared/js/tmp_lib/'
					},
					{
						expand : true,
						flatten: true,
						src: ['shared/js/dev/*.js'],
						dest: 'shared/js/tmp_dev/'
					}

				]
			}
		},
		concat: {
			lib: {
				src: ['shared/js/tmp_lib/*.js'],
				dest: 'shared/js/lib.min.js'
			},
			dev: {
				src: ['shared/js/tmp_dev/*.js'],
				dest: 'shared/js/script.min.js'
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
		},
		clean:{
			tmpfiles: ['shared/js/tmp_lib/','shared/js/tmp_dev/']
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-bower-task');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-kss');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask('default', [ 'compass', 'autoprefixer' ]);
	grunt.registerTask('dist', [ 'compass', 'autoprefixer', 'cssmin', 'kss', 'uglify', 'concat' , 'clean' ]);
	grunt.registerTask('build', [ 'bower:install' ]);

};
