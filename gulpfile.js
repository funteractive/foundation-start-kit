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
  fs             = require('fs'),
  rimraf         = require('rimraf')
  //modRewrite     = require('connect-modrewrite'),
  //routes         = require('./bin/gulp-dynamic-routing'),
  //merge          = require('merge-stream'),
  //settingsParser = require('settings-parser')
  ;


// 2. VARIABLES
// - - - - - - - - - - - - - - -
var jadePath         = './shared/jade/',
  scssPath           = './shared/scss/',
  cssPath            = './',
  imgPath            = './shared/img/',
  jsPath             = './shared/js/',
  bowerPath          = './bower_components/',
  foundationScssPath = bowerPath + 'foundation/scss/'
  ;


// BUILD
// - - - - - - - - - - - - - - -

// Install libraries with Bower
gulp.task('bower', function() {
  return $.bower()
    .pipe(gulp.dest(bowerPath));
});

// copy foundation files
gulp.task('copy:foundation', function() {
  return gulp.src([
    foundationScssPath + 'foundation.scss',
    foundationScssPath + 'foundation/_settings.scss'
  ])
    .pipe(gulp.dest(scssPath + 'core/'));
});

// rename foundation.scss
gulp.task('rename:foundation', function() {
  return gulp.src(scssPath + 'core/foundation.scss')
    .pipe($.rename({
      prefix: '_'
    }))
    .pipe(gulp.dest(scssPath + 'core/'));
});

// clean original foundation.scss
gulp.task('clean:foundation', function(cb) {
  return rimraf(scssPath + 'core/foundation.scss', cb);
});


// SERVER
// - - - - - - - - - - - - - - -

// Run browser-sync
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
  return gulp.src(jadePath + '*.jade')
    .pipe($.data(function(file) {
      return require(jadePath + 'setting.json')
    }))
    .pipe($.jade({ pretty: true }))
    .pipe(gulp.dest('./'))
    .pipe(browserSync.reload({ stream:true }));
});


// STYLESHEET
// - - - - - - - - - - - - - - -

// Compile stylesheets with Ruby Sass
gulp.task('sass', function() {
  return $.rubySass(scssPath, {
      loadPath: [bowerPath + 'foundation/scss', bowerPath + 'fontawesome/scss'],
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
    .pipe(gulp.dest(cssPath))
    .pipe(browserSync.reload({ stream:true }));
});



// STYLE GUIDE
// - - - - - - - - - - - - - - -

// generate style guide with kss


// IMAGE
// - - - - - - - - - - - - - - -

// make sprite image and css for sprite
gulp.task('sprite', function() {
  var spriteData = gulp.src(imgPath + 'sprite/*.png')
    .pipe(spritesmith({
      imgName: 'sprite.png',
      cssName: '_sprite.scss'
    }));

  // compile image
  spriteData.img
    .pipe($.imagemin())
    .pipe(gulp.dest(imgPath))
    .pipe(browserSync.reload({ stream:true }));

  // compile scss
  spriteData.css
    .pipe(gulp.dest(scssPath + 'layout/'))
    .pipe(browserSync.reload({ stream:true }));
});

// optimize images
gulp.task('imagemin', function() {
  return gulp.src(imgPath + '**/*.+(jpg|jpeg|png|gif|svg)')
    .pipe($.imagemin())
    .pipe(gulp.dest(imgPath))
});


// JAVASCRIPT
// - - - - - - - - - - - - - - -
gulp.task('js', function() {
  browserify(jsPath + 'src/app.js')
    .bundle()
    .pipe(source('build.js'))
    .pipe(buffer())
    .pipe($.uglify())
    .pipe(gulp.dest(jsPath));
});


// PRODUCTION
// - - - - - - - - - - - - - - -


// NOW BRING IT TOGETHER
// - - - - - - - - - - - - - - -

// Build the documentation once
gulp.task('build', function() {
  // If either file exists '_foundation.scss' or '_settings.scss', don't run the build task.
  fs.open(scssPath + 'core/_foundation.scss', 'r', function(err, fd) {
    if (err) {
      fs.open(scssPath + 'core/_settings.scss', 'r', function(err, fd) {
        if (err) {
          runSequence('bower', 'copy:foundation', 'rename:foundation', 'clean:foundation', function() {
            console.log('Successfully built.');
          });
        } else {
          console.log('"_settings.scss" is always exist!');
        }
        fd && fs.close(fd, function(err) { });
      });
    } else {
      console.log('"_foundation.scss" is always exist!');
    }
    fd && fs.close(fd, function(err) { });
  });
});

// default tasks
gulp.task('default', ['browser-sync', 'sprite'], function() {
  // Watch Jade
  gulp.watch([jadePath + '*', jadePath + '**/*'], ['jade']);

  // Watch Sprite
  gulp.watch([imgPath + 'sprite/*.png'], ['sprite']);

  // Watch Sass
  gulp.watch([scssPath + '*', scssPath + '**/*'], ['sass']);

  // Watch JavaScript
  gulp.watch([jsPath + 'src/*'], ['js', browserSync.reload]);
});

// when before distribute, 'dist' task will be pursued.
gulp.task('dist', ['jade', 'sass', 'js', 'sprite', 'imagemin']);
