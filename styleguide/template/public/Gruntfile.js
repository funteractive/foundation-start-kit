'use strict';

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
    sass: {
      dist: {
        options: {                       // Target options
          style: 'expanded'
        },
        files: {                         // Dictionary of files
          'kss.css': './scss/kss.scss'       // 'destination': 'source'
        }
      }
    },
    autoprefixer: {
      multiple_files: {
        expand: true,
        flatten: true,
        src: './*.css',
        dest: './'
      }
    },
    csslint: {
      strict: {
        options: {
          import: 2
        },
        src: ['./*.css']
      }
    },
    jshint: {
      all: ['./main.js']
    },
    watch: {
      css: {
        files: [ './scss/*.scss', '../.html' ],
        tasks: [ 'sass', 'autoprefixer' ]
      },
      livereload: {
        options: { livereload: true },
        files: [ './scss/*.scss', '../.html', './*.js' ]
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', [ 'sass', 'autoprefixer', 'csslint', 'jshint' ]);
  grunt.registerTask('dist', [ 'sass', 'autoprefixer', 'csslint', 'jshint' ]);
  grunt.registerTask('build', [ 'bower:install' ]);

};
