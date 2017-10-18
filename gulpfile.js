'use strict';

// FUNTERACTIVE start up theme
//
//
// The tasks are grouped into these categories:
//   1. Libraries
//   2. Variables
//   3. Running server
//   4. Jade
//   5. Stylesheet
//   6. Image
//   7. JavaScript
//   8. Linter
//   9. Build
//  10. Tasks

// 1. LIBRARIES
// - - - - - - - - - - - - - - -
var gulp            = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins')({ pattern: ['gulp-*', 'gulp.*'] });
var gulpWebpack     = require('webpack-stream');
var named           = require('vinyl-named');
var browserSync     = require('browser-sync');
var buffer          = require('vinyl-buffer');
var runSequence     = require('run-sequence');
var fs              = require('fs');
var pngquant        = require('imagemin-pngquant');

// 2. VARIABLES
// - - - - - - - - - - - - - - -
var srcPath     = './src/';
var distPath    = './dist/';
var modulesPath = './node_modules/';
var jadePath    = srcPath + 'jade/';
var htmlPath    = distPath + 'html/';
var scssPath    = srcPath + 'scss/';
var imgPath     = distPath + 'img/';
var bsProxy     = false; // When you need proxy, set your own domain.


// 3. SERVER
// - - - - - - - - - - - - - - -
// Run browser-sync
gulp.task('browser-sync', function() {
  browserSync({
    // remove server when you use proxy.
    server: {
      baseDir: './'
    },
    proxy: bsProxy,
    ghostMode: {
      location: true
    }
  });
});


// 4. JADE
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


// 5. STYLESHEET
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

gulp.task('css', function() {
  return runSequence(
    'sass',
    'cssmin'
  );
});


// 6. IMAGE
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


// 7. JAVASCRIPT
// - - - - - - - - - - - - - - -
// run webpack
gulp.task('webpack', function() {
  return gulp.src(srcPath + 'js/app.js')
    .pipe(named())
    .pipe(gulpWebpack({
      watch: true,
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

// 8. LINTER
// - - - - - - - - - - - - - - -
gulp.task('html-hint', function() {
  return gulp.src([htmlPath + '*.html', htmlPath + '**/*.html', '!node_modules/**/*.html'])
    .pipe(gulpLoadPlugins.htmlhint())
    .pipe(gulpLoadPlugins.htmlhint.failReporter())
    .pipe(gulpLoadPlugins.htmlhint.reporter());
});

gulp.task('css-lint', function() {
  return gulp.src([distPath + 'css/*.css'])
    .pipe(gulpLoadPlugins.csslint())
    .pipe(gulpLoadPlugins.csslint.reporter());
});

// 9. BUILD
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


// 10. TASKS
// - - - - - - - - - - - - - - -
// Watch tasks
gulp.task('watch', function() {
  // Watch Jade
  gulpLoadPlugins.watch([jadePath + '*', jadePath + '**/*'], function(){
    gulp.start('jade');
  });

  // Watch Sprite
  gulpLoadPlugins.watch([srcPath + 'img/sprite/*.png'], function(){
    gulp.start('sprite');
  });

  // Watch Sass
  gulpLoadPlugins.watch([scssPath + '*', scssPath + '**/*'], function(){
    gulp.start('sass');
  });
});

// Default tasks
gulp.task('default', ['browser-sync', 'sprite', 'watch', 'webpack'] );

// When before distribute, 'dist' task will be executed.
gulp.task('dist', ['jade', 'css', 'webpack', 'sprite', 'imagemin']);

// Run linters.
gulp.task('lint', ['html-hint', 'css-lint']);


// 11. Functions
// - - - - - - - - - - - - - - -
function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  gulpLoadPlugins.notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args);
  this.emit('end');
}
