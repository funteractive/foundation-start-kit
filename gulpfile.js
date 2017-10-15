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
//  10. Linter
//  10. Tasks

// 1. LIBRARIES
// - - - - - - - - - - - - - - -
var gulp            = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins')({ pattern: ['gulp-*', 'gulp.*'] });
var gulpWebpack     = require('webpack-stream');
var named           = require('vinyl-named');
var browserSync     = require('browser-sync');
var buffer          = require('vinyl-buffer');
// var source          = require('vinyl-source-stream');
var runSequence     = require('run-sequence');
var fs              = require('fs');
var pngquant        = require('imagemin-pngquant');
// var watchify        = require('watchify');

// 2. VARIABLES
// - - - - - - - - - - - - - - -
var srcPath     = './src/';
var distPath    = './dist/';
var modulesPath = './node_modules/';
var jadePath    = srcPath + 'jade/';
var htmlPath    = distPath + 'html/';
var scssPath    = srcPath + 'scss/';
var imgPath     = distPath + 'img/';
// var styleGuidePath     = './styleguide/';
// var bsProxy            = false; // When you need proxy; write your own domain.


// 3. BUILD
// - - - - - - - - - - - - - - -
// Copy foundation files
gulp.task('copy:foundation', function() {
  return gulp.src([
    modulesPath + 'foundation-sites/scss/foundation.scss',
    modulesPath + 'foundation-sites/scss/settings/_settings.scss'
  ])
    .pipe(gulpLoadPlugins.rename({
      prefix: '_'
    }))
    .pipe(gulp.dest(scssPath + 'core/'));
});


// 4. SERVER
// - - - - - - - - - - - - - - -
// Run browser-sync
/*
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
*/


// 5. JADE
// - - - - - - - - - - - - - - -
// Compile Jade to HTML
gulp.task('jade', function() {
  return gulp.src([jadePath + '**/!(_)*.jade'])
    .pipe(gulpLoadPlugins.data(function() {
      return require(jadePath + 'setting.json')
    }))
    .pipe(gulpLoadPlugins.plumber({
      errorHandler: handleErrors
    }))
    .pipe(gulpLoadPlugins.changed(htmlPath, {
      extension: '.html',
      hashChanged: gulpLoadPlugins.changed.compareSha1Digest
    }))
    .pipe(gulpLoadPlugins.jade({ pretty: true }))
    .pipe(gulp.dest(htmlPath))
    .pipe(browserSync.reload({ stream: true }));
});


// 6. STYLESHEET
// - - - - - - - - - - - - - - -
// Compile stylesheets with Ruby Sass
gulp.task('sass', function() {
  return gulpLoadPlugins.rubySass(scssPath + '**/*.scss', {
      loadPath: [
        modulesPath + 'foundation-sites/scss',
        modulesPath + 'font-awesome/scss'
      ],
      style: 'nested',
      bundleExec: false,
      require: 'sass-globbing',
      sourcemap: false
    })
    .pipe(gulpLoadPlugins.plumber({
      errorHandler: handleErrors
    }))
    .pipe(gulpLoadPlugins.pleeease({
      'autoprefixer': { 'browsers': ['last 2 versions', 'ie 10', 'ie 9'] },
      'minifier': false
    }))
    .pipe(gulpLoadPlugins.csscomb())
    .pipe(gulpLoadPlugins.csslint())
    .pipe(gulp.dest(distPath + 'css/'))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('cssmin', function() {
  gulp.src(distPath + 'css/*.css')
    .pipe(gulpLoadPlugins.rename({
      suffix: '.min'
    }))
    .pipe(gulpLoadPlugins.csso())
    .pipe(gulp.dest(distPath + 'css/'));
});

gulp.task('css', function(callback) {
  return runSequence(
    'sass',
    'cssmin',
    callback
  );
});


// 7. STYLE GUIDE
// - - - - - - - - - - - - - - -
// Generate style guide with kss
// gulp.task('styleguide', function() {
//   // Copy css for style guide
//   gulp.src(cssPath + 'style.css')
//     .pipe(gulp.dest(styleGuidePath));
//
//   // Make style guide
//   gulp.src([scssPath + '*.scss', scssPath + '**/*.scss'])
//     .pipe(gulpLoadPlugins.kss({
//       overview: styleGuidePath + 'styleguide.md',
//       templateDirectory: styleGuidePath + 'template/'
//     }))
//     .pipe(gulp.dest(styleGuidePath));
// });


// 8. IMAGE
// - - - - - - - - - - - - - - -
// make sprite image and css for sprite
gulp.task('sprite', function() {
  var spriteData = gulp.src(srcPath + 'img/sprite/*.png')
    .pipe(gulpLoadPlugins.spritesmith({
      imgName: 'sprite.png',
      imgPath: srcPath + 'img/sprite.png',
      cssName: '_sprite.scss',
      cssTemplate: '.sprite-template',
      algorithm:'top-down',
      padding: 20,
      algorithmOpts : {
        sort: false
      }
    }));

  // minify images
  spriteData.img
    .pipe(buffer())
    .pipe(gulpLoadPlugins.imagemin({
      progressive: true,
      use: [pngquant({ quality: '70-80', speed: 1 })]
    }))
    .pipe(gulp.dest(imgPath))
    .pipe(browserSync.reload({ stream: true }));

  // compile scss
  spriteData.css
    .pipe(gulp.dest(scssPath + 'core/'))
    .pipe(browserSync.reload({ stream: true }));
});

// optimize images
gulp.task('imagemin', function() {
  return gulp.src(imgPath + '**/*.+(jpg|jpeg|png|gif|svg)')
    .pipe(gulpLoadPlugins.imagemin({
      progressive: true,
      use: [pngquant({ quality: '70-80', speed: 1 })]
    }))
    .pipe(gulp.dest(imgPath))
});


// 9. JAVASCRIPT
// - - - - - - - - - - - - - - -
// run webpack
gulp.task('webpack', function() {
  return gulp.src(srcPath + 'js/app.js')
    .pipe(named())
    .pipe(gulpWebpack({
      watch: false,
      module: {
        loaders: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loaders: [
              'babel-loader',
              'eslint-loader'
            ]
          }
        ]
      },
      devtool: 'source-map'
    }))
    .pipe(gulp.dest(distPath + 'js/'));
});

// 10. LINTER
// - - - - - - - - - - - - - - -
// gulp.task('html-hint', function() {
//   return gulp.src([htmlPath + '*.html', htmlPath + '**/*.html', '!node_modules/**/*.html'])
//     .pipe(gulpLoadPlugins.htmlhint())
//     .pipe(gulpLoadPlugins.htmlhint.failReporter())
//     .pipe(gulpLoadPlugins.htmlhint.reporter());
// });
//
// gulp.task('css-lint', function() {
//   return gulp.src([cssPath + 'app.css'])
//     .pipe(gulpLoadPlugins.csslint())
//     .pipe(gulpLoadPlugins.csslint.reporter());
// });
//
// gulp.task('js-hint', function() {
//   return gulp.src([jsPath + 'src/*.js'])
//     .pipe(gulpLoadPlugins.jshint())
//     .pipe(gulpLoadPlugins.jshint.reporter('jshint-stylish'));
// });

// 11. NOW BRING IT TOGETHER
// - - - - - - - - - - - - - - -
// Build the documentation once
gulp.task('build', function() {
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
  gulpLoadPlugins.watch([jadePath + '*', jadePath + '**/*'], function(){
    gulp.start('jade');
  });

  // Watch Sprite
  // gulpLoadPlugins.watch([imgPath + 'sprite/*.png'], function(e){
  //   gulp.start('sprite');
  // });

  // Watch Sass
  gulpLoadPlugins.watch([scssPath + '*', scssPath + '**/*'], function(){
    gulp.start('sass');
  });
});

// Default tasks
gulp.task('default', ['browser-sync', 'sprite', 'watch', 'watchify'] );

// When before distribute, 'dist' task will be executed.
gulp.task('dist', ['jade', 'css', 'browserify', 'sprite', 'imagemin']);

gulp.task('lint', ['html-hint', 'css-lint', 'js-hint']);

// 12. Functions
// - - - - - - - - - - - - - - -
// Error Handle
function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  gulpLoadPlugins.notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args);
  this.emit('end');
}
