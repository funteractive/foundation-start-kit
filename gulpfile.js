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
  browserify     = require('browserify'),
  buffer         = require('vinyl-buffer'),
  source         = require('vinyl-source-stream')
  //rimraf         = require('rimraf'),
  //runSequence    = require('run-sequence'),
  //modRewrite     = require('connect-modrewrite'),
  //routes         = require('./bin/gulp-dynamic-routing'),
  //merge          = require('merge-stream'),
  //settingsParser = require('settings-parser')
  ;


// BUILD
// - - - - - - - - - - - - - - -

// Generate Sass settings file
//gulp.task('settings', function() {
//  return settingsParser([
//    'scss/_includes.scss',
//    'scss/_global.scss',
//    'scss/helpers/_breakpoints.scss',
//    'scss/components/_typography.scss',
//    'scss/components/_grid.scss',
//    'scss/components/*.scss'
//  ], {
//    title: 'Foundation for Apps Settings'.toUpperCase(),
//    partialsPath: 'build/partials/scss',
//    settingsPath: 'scss'
//  });
//});


// SERVER
// - - - - - - - - - - - - - - -
gulp.task('webserver', function() {
  gulp.src('./')
    .pipe($.webserver({
      livereload: true,
      directoryListing: true,
      open: true
    }));
});


// JADE
// - - - - - - - - - - - - - - -
gulp.task('jade', function() {
  return gulp.src('./shared/jade/*.jade')
    .pipe($.data(function(file) {
      return require('./shared/jade/setting.json')
    }))
    .pipe($.jade({ pretty: true }))
    .pipe(gulp.dest('./'))
});


// STYLESHEET
// - - - - - - - - - - - - - - -
// Compile stylesheets with Ruby Sass
/*
gulp.task('sass', function() {
  //var filter = $.filter(['*.css']);

  return $.rubySass('shared/scss/', {
    loadPath: ['scss'],
    style: 'nested'
    //bundleExec: true
  })
    .on('error', function(err) {
      console.log(err.message);
    })
    //.pipe(filter)
    //.pipe($.autoprefixer({
    //  browsers: ['last 2 versions', 'ie 10']
    //}))
    //.pipe(filter.restore())
    .pipe(gulp.dest('./'));
});
*/

gulp.task('sass', function() {
  return $.rubySass('./shared/scss/style.scss', {
      loadPath: ['scss'],
      style: 'nested',
      bundleExec: false
    })
    .on('error', function(err) { console.error('Error!', err.message); })
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie 10', 'ie 9']
    }))
    .pipe($.csso())
    .pipe(gulp.dest('./'));
});



// STYLE GUIDE
// - - - - - - - - - - - - - - -


// IMAGE
// - - - - - - - - - - - - - - -
gulp.task('sprite', function() {
  var spriteData = gulp.src('./shared/img/sprite/*.png')
    .pipe(spritesmith({
      imgName: 'sprite.png',
      cssName: '_sprite.scss'
    }));

  // compile image
  spriteData.img
    .pipe(gulp.dest('./shared/img/'));

  // compile scss
  spriteData.css
    .pipe(gulp.dest('./shared/scss/'));
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


// WATCH
// - - - - - - - - - - - - - - -


// PRODUCTION
// - - - - - - - - - - - - - - -


// NOW BRING IT TOGETHER
// - - - - - - - - - - - - - - -
//gulp.task('js', ['browserify'])
