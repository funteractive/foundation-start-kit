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
  $              = require('gulp-load-plugins')()
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



// JADE
// - - - - - - - - - - - - - - -


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
  return $.rubySass('shared/scss/style.scss', {
    loadPath: ['scss'],
    style: 'nested',
    bundleExec: false
  })
    .on('error', function(err) { console.error('Error!', err.message); })
    .pipe(gulp.dest('./'));
});



// STYLE GUIDE
// - - - - - - - - - - - - - - -


// IMAGE
// - - - - - - - - - - - - - - -


// JAVASCRIPT
// - - - - - - - - - - - - - - -


// WATCH
// - - - - - - - - - - - - - - -


// PRODUCTION
// - - - - - - - - - - - - - - -
