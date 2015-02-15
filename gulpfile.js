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
//  10. WordPress
//  11. Tasks

// 1. LIBRARIES
// - - - - - - - - - - - - - - -

var gulp         = require('gulp'),
  $              = require('gulp-load-plugins')({ pattern: ['gulp-*', 'gulp.*'] }),
  browserSync    = require('browser-sync'),
  browserify     = require('browserify'),
  buffer         = require('vinyl-buffer'),
  source         = require('vinyl-source-stream'),
  runSequence    = require('run-sequence'),
  fs             = require('fs')
  ;


// 2. VARIABLES
// - - - - - - - - - - - - - - -
var jadePath         = './shared/jade/',
  htmlPath           = './',
  scssPath           = './shared/scss/',
  cssPath            = './',
  styleGuidePath     = './styleguide/',
  imgPath            = './shared/img/',
  jsPath             = './shared/js/',
  bowerPath          = './bower_components/',
  foundationScssPath = bowerPath + 'foundation/scss/',
  bsProxy = false
  ;

// For WordPress theme style.css comment : This is optional function.
var wpThemeName      = 'Your Theme Name',
  wpThemeUri         = 'Your Theme URI',
  wpThemeAuthor      = 'Your Theme Author',
  wpThemeAuthorUri   = 'Your Theme Author URI',
  wpThemeDescription = 'Your Theme Description',
  wpThemeVersion     = 'Your Theme Version',
  wpThemeLicense     = 'Your Theme License',
  wpThemeLicenseUri  = 'Your Theme License URI',
  wpThemeTag         = 'Your Theme Tags',
  wpThemeTextDomain  = 'Your Theme Text Domain',
  wpThemeOption      = '',
  wpThemeInfo
  ;
// When you make WordPress theme, activate this comment.
//wpThemeInfo = '@charset "UTF-8";\n'
//  + '/*\n'
//  + ' Theme Name: ' + wpThemeName + '\n'
//  + ' Theme URI: ' + wpThemeUri + '\n'
//  + ' Author: ' + wpThemeAuthor + '\n'
//  + ' Author URI: ' + wpThemeAuthorUri + '\n'
//  + ' Description: ' + wpThemeDescription + '\n'
//  + ' Version: ' + wpThemeVersion + '\n'
//  + ' Theme License: ' + wpThemeLicense + '\n'
//  + ' License URI: ' + wpThemeLicenseUri + '\n'
//  + ' Tags: ' + wpThemeTag + '\n'
//  + ' Text Domain: ' + wpThemeTextDomain + '\n'
//  + wpThemeOption
//  + '*/\n';


// 3. BUILD
// - - - - - - - - - - - - - - -

// Install libraries with Bower
gulp.task('bower', function() {
  return $.bower()
    .pipe(gulp.dest(bowerPath));
});

// Copy foundation files
gulp.task('copy:foundation', function() {
  return gulp.src([
    foundationScssPath + 'foundation.scss',
    foundationScssPath + 'foundation/_settings.scss'
  ])
    .pipe($.rename({
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
    .pipe($.data(function(file) {
      return require(jadePath + 'setting.json')
    }))
    .pipe($.jade({ pretty: true }))
    .pipe(gulp.dest(htmlPath))
    .pipe(browserSync.reload({ stream:true }));
});


// 6. STYLESHEET
// - - - - - - - - - - - - - - -

// Compile stylesheets with Ruby Sass
gulp.task('sass', function() {
  return $.rubySass(scssPath, {
      loadPath: [bowerPath + 'foundation/scss', bowerPath + 'fontawesome/scss'],
      style: 'nested',
      bundleExec: false,
      require: 'sass-globbing',
      sourcemap: false
    })
    .on('error', function(err) { console.error('Error!', err.message); })
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie 10', 'ie 9']
    }))
    .pipe($.csscomb())
    .pipe($.csso())
    .pipe($.csslint())
    .pipe(gulp.dest(cssPath));
});

// Add comment for initialize WordPress theme at the beginning of style.css.
gulp.task('wp:comment', function() {
  fs.open(cssPath + 'style.css', 'r', function(err, fd) {
    if(!err) {
      gulp.src([cssPath + 'wp-theme-info.css', cssPath + 'style.css'])
        .pipe($.concat('style.css'))
        .pipe(gulp.dest(cssPath));
    }
    fd && fs.close(fd, function(err) { });
  });
});

gulp.task('css', function() {
  runSequence('sass', 'wp:comment');
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
    .pipe($.kss({
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
    .pipe($.spritesmith({
      imgName: 'sprite.png',
      cssName: '_sprite.scss'
    }));

  // minify images
  spriteData.img
    .pipe($.imagemin())
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
    .pipe($.imagemin())
    .pipe(gulp.dest(imgPath))
});


// 9. JAVASCRIPT
// - - - - - - - - - - - - - - -
gulp.task('js', function() {
  browserify(jsPath + 'src/app.js')
    .bundle()
    .pipe(source('build.js'))
    .pipe(buffer())
    .pipe($.uglify())
    .pipe(gulp.dest(jsPath));
});


// 10. WORDPRESS
// - - - - - - - - - - - - - - -

// Make a file for WordPress comment to be initialized by theme.
function makeWpThemeInfoFile() {
  if(wpThemeInfo) {
    fs.writeFile(cssPath + 'wp-theme-info.css', wpThemeInfo);
  }
}

gulp.task('wp:css', function() {
  makeWpThemeInfoFile();
});


// 11. NOW BRING IT TOGETHER
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

  makeWpThemeInfoFile();
});

// Default tasks
gulp.task('default', ['browser-sync', 'sprite'], function() {
  // Watch Jade
  gulp.watch([jadePath + '*', jadePath + '**/*'], ['jade']);

  // Watch Sprite
  gulp.watch([imgPath + 'sprite/*.png'], ['sprite']);

  // Watch Sass
  gulp.watch([scssPath + '*', scssPath + '**/*'], ['css', browserSync.reload]);

  // Watch JavaScript
  gulp.watch([jsPath + 'src/*'], ['js', browserSync.reload]);
});

// When before distribute, 'dist' task will be executed.
gulp.task('dist', ['jade', 'css', 'js', 'sprite', 'imagemin']);
