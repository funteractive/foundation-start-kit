'use strict';

// license
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
  var pkg, taskName;
  pkg = grunt.file.readJSON('package.json');
  grunt.initConfig({
    pkg: pkg,
    banner:'/*!\n'+
    ' Theme Name: <%= pkg.name %>\n'+
    ' Theme URI: <%= pkg.uri %>\n'+
    ' Description: <%= pkg.description %>\n'+
    ' Author: <%= pkg.author %>\n'+
    ' Version: <%= pkg.version %>\n'+
    '*/',
    // bower install
    bower: {
      install: {
        options: {
          targetDir: './shared/lib',
          layout: 'byComponent',
          install: true,
          verbose: false,
          cleanTargetDir: false,
          cleanBowerDir: true
        }
      }
    },
    // Brower Sync
    browserSync: {
      dev: {
        bsFiles: {
          src : [
            './style.css',
            './*.html',
            './shared/img/**/**',
            './shared/js/*.js',
            './*.php'
          ]
        },
        options: {
          proxy: "square.localdev",
          watchTask: true
        }
      }
    },
    // jade
    jade: {
      compile: {
        options: {
          pretty: true,
          data: grunt.file.readJSON('setting.json')
        },
        files: [{
          expand: true,
          cwd: './shared/jade',
          src: ['**/*.jade','!**/_*.jade'],
          dest: './',
          ext: '.html'
        }]
      }
    },
    // compass
    compass: {
      dist: {
        options: {
          sassDir: 'shared/scss',
          cssDir: './',
          //specify: 'shared/scss/style.scss',
          //banner:'<%= banner %>',
          config: 'config.rb'
        }
      }
    },
    // autoprefixer
    autoprefixer: {
      style: {
        options: {
          map: true,
          browsers: ['last 3 version', 'ie 8']
        },
        src: './style.css',
        dest: './style.css'
      }
    },
    // csso
    csso: {
      style: {
        files:[{
          expand: true,
          src: ['./style.css'],
          dest: './',
          ext: '.min.css'
        }]
      }
    },
    // jshint
    jshint: {
      all: [
        'shared/js/script.js'
      ]
    },
    // uglify
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
            src: ['shared/js/app/*.js'],
            dest: 'shared/js/tmp_app/'
          }
        ]
      }
    },
    // concat
    concat: {
      lib: {
        src: ['shared/js/tmp_lib/*.js'],
        dest: 'shared/js/lib.min.js'
      },
      dev: {
        src: ['shared/js/tmp_app/*.js'],
        dest: 'shared/js/script.min.js'
      }
    },
    // kss
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
    // watch
    watch: {
      options: {
        spawn: false
      },
      jade:{
        files: [ 'shared/jade/*.jade', 'shared/jade/**/*.jade' ],
        tasks: [ 'jade' ]
      },
      css: {
        files: [ 'shared/scss/*.scss', 'shared/scss/**/*.scss' ],
        tasks: [ 'compass','autoprefixer' ]
      },
      js: {
        files: [ 'shared/js/app/*.js'],
        tasks: [ 'uglify','concat','clean']
      },
      livereload: {
        options: { livereload: true },
        files: [ './*.css', './*.html', './*.php' ]
      }
    },
    // clean
    clean:{
      tmpfiles: ['shared/js/tmp_lib/','shared/js/tmp_app/']
    }
  });

  // These plugins provide necessary tasks.
  for(taskName in pkg.devDependencies) {
    if(taskName.substring(0, 6) == 'grunt-') {
        grunt.loadNpmTasks(taskName);
    }
  }

  // default
  grunt.registerTask('default', [ 'browserSync', 'watch','csso','uglify', 'concat','clean' ]);

  // release
  grunt.registerTask('dist', ['jade', 'compass', 'autoprefixer', 'csso', 'kss', 'uglify', 'concat' , 'clean' ]);

  // build
  grunt.registerTask('build', [ 'bower:install' ]);

};
