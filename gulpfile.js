'use strict';

// Funteractive start up theme
//
//
// The tasks are grouped into these categories:
//   1. Libraries
//   2. Variables
//   3. Build tasks
//   4. Running server
//   5. Jade
//   6. Stylesheet
//   7. Style guide
//   8. Image
//   9. JavaScript
//  10. Tasks

// 1. LIBRARIES
// - - - - - - - - - - - - - - -

var gulp            = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins')({ pattern: ['gulp-*', 'gulp.*'] });
var browserSync     = require('browser-sync');
var browserify      = require('browserify');
var buffer          = require('vinyl-buffer');
var source          = require('vinyl-source-stream');
var runSequence     = require('run-sequence');
var fs              = require('fs');


// 2. VARIABLES
// - - - - - - - - - - - - - - -
var jadePath           = './shared/jade/';
var htmlPath           = './';
var scssPath           = './shared/scss/';
var cssPath            = './';
var styleGuidePath     = './styleguide/';
var imgPath            = './shared/img/';
var jsPath             = './shared/js/';
var bowerPath          = './bower_components/';
var foundationScssPath = bowerPath + 'foundation-sites/scss/';
var bsProxy            = false; // When you need proxy; write your own domain.


// 3. BUILD
// - - - - - - - - - - - - - - -

// Install libraries with Bower
gulp.task('bower', function() {
  return gulpLoadPlugins.bower()
    .pipe(gulp.dest(bowerPath));
});

// Copy foundation files
gulp.task('copy:foundation', function() {
  return gulp.src([
    foundationScssPath + 'foundation.scss',
    foundationScssPath + 'settings/_settings.scss'
  ])
    .pipe(gulpLoadPlugins.rename({
      prefix: '_'
    }))
    .pipe(gulp.dest(scssPath + 'core/'));
});


// 4. SERVER
// - - - - - - - - - - - - - - -

// Run browser-sync
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: './'
    },
    proxy: bsProxy,
    ghostMode: {
      location: true
    }
  });
});


// 5. JADE
// - - - - - - - - - - - - - - -

// Compile Jade to HTML
gulp.task('jade', function() {
  return gulp.src(jadePath + '*.jade')
    .pipe(gulpLoadPlugins.data(function(file) {
      return require(jadePath + 'setting.json')
    }))
    .pipe(gulpLoadPlugins.jade({ pretty: true }))
    .pipe(gulp.dest(htmlPath))
    .pipe(browserSync.reload({ stream:true }));
});


// 6. STYLESHEET
// - - - - - - - - - - - - - - -

// Compile stylesheets with Ruby Sass
gulp.task('sass', function() {
  return gulpLoadPlugins.rubySass(scssPath, {
      loadPath: [bowerPath + 'foundation-sites/scss', bowerPath + 'fontawesome/scss'],
      style: 'nested',
      bundleExec: false,
      require: 'sass-globbing',
      sourcemap: false
    })
    .on('error', function(err) { console.error('Error!', err.message); })
    .pipe(gulpLoadPlugins.autoprefixer({
      browsers: ['last 2 versions', 'ie 10', 'ie 9']
    }))
    .pipe(gulpLoadPlugins.csscomb())
    .pipe(gulpLoadPlugins.csso())
    .pipe(gulpLoadPlugins.csslint())
    .pipe(gulp.dest(cssPath));
});

gulp.task('css', function() {
  runSequence('sass');
});


// 7. STYLE GUIDE
// - - - - - - - - - - - - - - -

// Generate style guide with kss
gulp.task('styleguide', function() {
  // Copy css for style guide
  gulp.src(cssPath + 'style.css')
    .pipe(gulp.dest(styleGuidePath));

  // Make style guide
  gulp.src([scssPath + '*.scss', scssPath + '**/*.scss'])
    .pipe(gulpLoadPlugins.kss({
      overview: styleGuidePath + 'styleguide.md',
      templateDirectory: styleGuidePath + 'template/'
    }))
    .pipe(gulp.dest(styleGuidePath));
});


// 8. IMAGE
// - - - - - - - - - - - - - - -

// make sprite image and css for sprite
gulp.task('sprite', function() {
  var spriteData = gulp.src(imgPath + 'sprite/*.png')
    .pipe(gulpLoadPlugins.spritesmith({
      imgName: 'sprite.png',
      cssName: '_sprite.scss'
    }));

  // minify images
  spriteData.img
    .pipe(buffer())
    .pipe(gulpLoadPlugins.imagemin())
    .pipe(gulp.dest(imgPath))
    .pipe(browserSync.reload({ stream:true }));

  // compile scss
  spriteData.css
    .pipe(gulp.dest(scssPath + 'core/'))
    .pipe(browserSync.reload({ stream:true }));
});

// optimize images
gulp.task('imagemin', function() {
  return gulp.src(imgPath + '**/*.+(jpg|jpeg|png|gif|svg)')
    .pipe(gulpLoadPlugins.imagemin())
    .pipe(gulp.dest(imgPath))
});


// 9. JAVASCRIPT
// - - - - - - - - - - - - - - -
gulp.task('js', function() {
  browserify(jsPath + 'src/app.js')
    .bundle()
    .pipe(source('build.js'))
    .pipe(buffer())
    .pipe(gulpLoadPlugins.uglify())
    .pipe(gulp.dest(jsPath));
});


// 10. NOW BRING IT TOGETHER
// - - - - - - - - - - - - - - -

// Build the documentation once
gulp.task('build', ['bower'], function() {
  // If either file exists '_foundation.scss' or '_settings.scss', don't run the build task.
  fs.open(scssPath + 'core/_foundation.scss', 'r', function(err, fd) {
    if (err) {
      fs.open(scssPath + 'core/_settings.scss', 'r', function(err, fd) {
        if (err) {
          runSequence('copy:foundation', function() {
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

// Watch tasks
gulp.task('watch', function() {
  // Watch Jade
  gulp.watch([jadePath + '*', jadePath + '**/*'], ['jade']);

  // Watch PHP. When you make WordPress theme, activate this.
  //gulp.watch(['./*.php'], browserSync.reload);

  // Watch Sprite
  gulp.watch([imgPath + 'sprite/*.png'], ['sprite']);

  // Watch Sass
  gulp.watch([scssPath + '*', scssPath + '**/*'], ['css', browserSync.reload]);

  // Watch JavaScript
  gulp.watch([jsPath + 'src/*'], ['js', browserSync.reload]);
});

// Default tasks
gulp.task('default', ['browser-sync', 'sprite', 'watch'] );

// When before distribute, 'dist' task will be executed.
gulp.task('dist', ['jade', 'css', 'js', 'sprite', 'imagemin']);
