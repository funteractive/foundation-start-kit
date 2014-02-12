'use strict';

var js = 'script.js',
minJs = 'script.min.js';

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
	  cssmin: {
		  style: {
		  	src: './style.css',
	  		dest: './style.min.css'
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
			  src: css,
			  dest: minCss
		  }
	  },
	  jshint: {
		  all: ['Gruntfile.js', js, minJs]
	  },
	  uglify: {
		  my_target: {
			  files: {
				  'script.min.js': [js]
			  }
		  }
	  },
	  watch: {
	  	css: {
			files: 'shared/scss/*.scss',
			tasks: [ 'compass', 'cssmin', 'autoprefixer' ]
		},
		js: {
			files: js,
			tasks: [ 'uglify' ]
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

  grunt.registerTask('default', [ 'watch' ]);
  grunt.registerTask('build', [ 'bower:install' ]);

};
