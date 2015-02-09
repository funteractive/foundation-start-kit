'use strict';

// Funteractive start up theme
//
// We use this Gulpfile to assemble the documentation, run unit tests,
// and deploy changes to the live documentation and CDN.
//
// The tasks are grouped into these categories:
//   1. Libraries
//   2. Variables
//   3. Cleaning files
//   4. Copying files
//   5. Stylesheets
//   6. JavaScript
//   7. Testing
//   8. Server
//   9. Deployment
//  10. Default tasks

// 1. LIBRARIES
// - - - - - - - - - - - - - - -

var gulp         = require('gulp'),
  spritesmith    = require('gulp.spritesmith'),
  $              = require('gulp-load-plugins')(),
  browserSync    = require('browser-sync'),
  browserify     = require('browserify'),
  buffer         = require('vinyl-buffer'),
  source         = require('vinyl-source-stream'),
  runSequence    = require('run-sequence'),
  rimraf         = require('rimraf')
  //modRewrite     = require('connect-modrewrite'),
  //routes         = require('./bin/gulp-dynamic-routing'),
  //merge          = require('merge-stream'),
  //settingsParser = require('settings-parser')
  ;


// BUILD
// - - - - - - - - - - - - - - -

// Install libraries with Bower
gulp.task('bower', function() {
  return $.bower()
    .pipe(gulp.dest('bower_components/'));
});

// copy foundation files
gulp.task('copy:foundation', function() {
  var foundationPath = 'bower_components/foundation/scss/';
  return gulp.src([
    foundationPath + 'foundation.scss',
    foundationPath + 'foundation/_settings.scss'
  ])
    .pipe(gulp.dest('./shared/scss/core/'));
});

// rename foundation.scss
gulp.task('rename:foundation', ['copy:foundation'], function() {
  return gulp.src('./shared/scss/core/foundation.scss')
    .pipe($.rename({
      prefix: '_'
    }))
    .pipe(gulp.dest('./shared/scss/core/'));
});

// clean original foundation.scss
gulp.task('clean:foundation', ['rename:foundation'], function(cb) {
  rimraf('./shared/scss/core/foundation.scss', cb);
});


// SERVER
// - - - - - - - - - - - - - - -

// run browser-sync
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: './'
    },
    ghostMode: {
      location: true
    }
  });
});


// JADE
// - - - - - - - - - - - - - - -

// Compile Jade to HTML
gulp.task('jade', function() {
  return gulp.src('./shared/jade/*.jade')
    .pipe($.data(function(file) {
      return require('./shared/jade/setting.json')
    }))
    .pipe($.jade({ pretty: true }))
    .pipe(gulp.dest('./'))
    .pipe(browserSync.reload({ stream:true }));
});


// STYLESHEET
// - - - - - - - - - - - - - - -

// Compile stylesheets with Ruby Sass
gulp.task('sass', function() {
  return $.rubySass('./shared/scss/', {
      loadPath: ['bower_components/foundation/scss', 'bower_components/fontawesome/scss'],
      style: 'nested',
      bundleExec: false,
      require: 'sass-globbing',
      sourcemap: true
    })
    .on('error', function(err) { console.error('Error!', err.message); })
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie 10', 'ie 9']
    }))
    .pipe($.csso())
    .pipe(gulp.dest('./'))
    .pipe(browserSync.reload({ stream:true }));
});



// STYLE GUIDE
// - - - - - - - - - - - - - - -

// generate style guide with kss

// IMAGE
// - - - - - - - - - - - - - - -

// make sprite image and css for sprite
gulp.task('sprite', function() {
  var spriteData = gulp.src('./shared/img/sprite/*.png')
    .pipe(spritesmith({
      imgName: 'sprite.png',
      cssName: '_sprite.scss'
    }));

  // compile image
  spriteData.img
    .pipe($.imagemin())
    .pipe(gulp.dest('./shared/img/'))
    .pipe(browserSync.reload({ stream:true }));

  // compile scss
  spriteData.css
    .pipe(gulp.dest('./shared/scss/layout/'))
    .pipe(browserSync.reload({ stream:true }));
});

// optimize images
gulp.task('imagemin', function() {
  return gulp.src('./shared/img/**/*.+(jpg|jpeg|png|gif|svg)')
    .pipe($.imagemin())
    .pipe(gulp.dest('./shared/img/'))
});


// JAVASCRIPT
// - - - - - - - - - - - - - - -
gulp.task('js', function() {
  browserify('./shared/js/src/app.js')
    .bundle()
    .pipe(source('build.js'))
    .pipe(buffer())
    .pipe($.uglify())
    .pipe(gulp.dest('./shared/js/'));
});


// PRODUCTION
// - - - - - - - - - - - - - - -


// NOW BRING IT TOGETHER
// - - - - - - - - - - - - - - -

// Build the documentation once
gulp.task('build', function() {
  runSequence('bower', 'copy:foundation', 'rename:foundation', 'clean:foundation', function() {
    console.log('Successfully built.');
  })
});

// default tasks
gulp.task('default', ['browser-sync', 'sprite'], function() {
  // Watch Jade
  gulp.watch(['./shared/jade/*', './shared/jade/**/*'], ['jade']);

  // Watch Sprite
  gulp.watch(['./shared/img/sprite/*.png'], ['sprite']);

  // Watch Sass
  gulp.watch(['./shared/scss/*', './shared/scss/**/*'], ['sass']);

  // Watch JavaScript
  gulp.watch(['./shared/js/src/*'], ['js', browserSync.reload]);
});

// when before distribute, 'dist' task will be pursued.
gulp.task('dist', ['jade', 'sass', 'js', 'sprite', 'imagemin']);
