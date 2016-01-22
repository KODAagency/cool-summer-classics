/*
 *
 * _ C O N F I G
 */
var gulp = require('gulp');

var plugins = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var exec = require('child_process').exec;

var runSequence = require('run-sequence');    // Temporary solution until gulp 4
                                              // https://github.com/gulpjs/gulp/issues/355
// var critical = require('critical');

var pkg = require('./package.json');
var dirs = pkg['site-configs'].directories;


/*
 *
 * _ T A S K S
 */


/*
 *
 * _ j e k y l l
 *
     The jekyll task split into dev and non-dev

     todo: add :dist task that uses _config.buid.yml
 */
gulp.task('jekyll', function (cb) {
  exec('jekyll build -s' + dirs.src + ' -d ' + dirs.dist + ' --config _config.yml', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    if (err) return cb(err); // return error
    cb();
  });
});

/*
 *
 * _ s a s s

     Both sass tasks use the same sass options, the :build version just
     doesn't produce maps.
 */
var sassOpts = {
  indentedSyntax: true,
  includePaths: ['bower_components/'],
  errLogToConsole: true
}

gulp.task('sass', function () {
  return gulp.src(dirs.src + '/assets/sass/*.{sass,scss}')
             .pipe(plugins.sourcemaps.init())
               .pipe(plugins.sass(sassOpts))
               .pipe(plugins.autoprefixer())
             .pipe(plugins.sourcemaps.write('./maps'))
             .pipe(gulp.dest(dirs.dist + '/assets/styles'));
});

gulp.task('sass:dist', function () {
  return gulp.src(dirs.src + '/assets/sass/*.{sass,scss}')
             .pipe(plugins.sass(sassOpts))
             .pipe(plugins.autoprefixer())
             .pipe(gulp.dest(dirs.dist + '/assets/styles'));
});

/*
 *
 * _ u s e r e f
 *
     Combine assets in build blocks and minify
 */
gulp.task('useref', function () {
  var assets = plugins.useref.assets({searchPath: ['.']});

  return gulp.src(dirs.dist + '/**/*.html')
             .pipe(assets)
             // .pipe(plugins.if('*.js', plugins.uglify()))
             // .pipe(plugins.if('*.css', plugins.csso()))
             .pipe(assets.restore())
             .pipe(plugins.useref())
             .pipe(plugins.debug({minimal:false}))
             // .pipe(plugins.if('*.html', plugins.minifyHtml({conditionals: true, loose: true})))
             .pipe(gulp.dest(dirs.dist));
});

/*
 *
 * _ critical
 */
// gulp.task('critical', function (cb) {
//   critical.generate({
//     base: dirs.dist,
//     src: 'index.html',
//     dest: '/assets/styles/styles.css',
//     width: 320,
//     height: 480,
//     minify: true
//   }, function(err, output){
//     critical.inline({
//       base: dirs.dist,
//       src: 'index.html',
//       dest: 'index-critical.html',
//       minify: true
//     });
//   });
// });

/*
 *
 * _ m i n i f y
 *
     Minify assets that weren't min'd during the useref task
 */
// gulp.task('minify', function () {
//   return gulp.src(dirs.dist + '/**/*.{html,js,css}')
//              .pipe(plugins.if('*.css', plugins.csso()))
//              .pipe(plugins.if('*.js', plugins.uglify()))
//              .pipe(plugins.if('*.html', plugins.minifyHtml({conditionals: true, loose: true})))
//              .pipe(gulp.dest(dirs.dist));
// });

// gulp.task('svgmin', function () {
//   return gulp.src(dirs.src + '/assets/svg/*.svg')
//              .pipe(plugins.svgmin())
//              .pipe(gulp.dest(dirs.dist + '/assets/svg/'));
// });

/*
 *
 * _ s v g
 *
     Svgstore combines svgs into a single file and then it
     gets injected into each _complied_ html file post jekyll.

     todo: figure out how to inline only the needed svgs on
           each page, rather than all of them on every page
 */
gulp.task('svgstore', function () {
  gulp.src(dirs.src + '/assets/svg/*.svg')
      // .pipe(plugins.svgmin())
      .pipe(plugins.svgstore())
      .pipe(gulp.dest(dirs.src + '/_includes/'));

  // var svgs = gulp.src(dirs.src + '/assets/svg/*.svg')
  //                .pipe(plugins.debug())
  //                .pipe(plugins.svgstore({inlineSvg: true}));

  // function fileContents (filePath, file) {
  //   return file.contents.toString();
  // }

  // return gulp.src(dirs.dist + '/**/*.html')
  //            .pipe(plugins.inject(svgs, { transform: fileContents}))
  //            .pipe(gulp.dest(dirs.dist));
});


/*
 *
 * _ i m a g e  m i n
 */
// gulp.task('imagemin', function () {
//   return gulp.src(dirs.src + '/assets/images/**/*.{gif,jpg,png,svg}')
//              .pipe(plugins.imagemin({
//                progressive: true,
//                optimizationLevel: 5
//              }))
//              // .pipe(plugins.if('*.svg', plugins.gzip({append:false})))
//              .pipe(gulp.dest(dirs.dist + '/assets/images'));
// });

/*
 *
 * _ b r o w s e r  s y n c
 *
     Serve complied html and css form dist/ and all other
     assets from either bower_components/ or src/.
 */
gulp.task('browser-sync', function () {
   browserSync({
     notify: false,
     port: 9000,
     server: {
       baseDir: [dirs.dist, dirs.src],
       routes: {
         '/bower_components': 'bower_components',
       }
     }
   });
});

// gulp.task('serve-dist', function () {
//    browserSync({
//      notify: false,
//      port: 9000,
//      server: {
//        baseDir: dirs.dist
//      }
//    });
// });

/*
 *
 * _ c l e a n
 *
     Removes dist/ directory,
     https://github.com/gulpjs/gulp/blob/master/docs/recipes/delete-files-folder.md
 */
gulp.task('clean', function (cb) {
  require('del')([dirs.dist], cb);
});

/*
 *
 * _ c o p y
 *
     Copy all files to dist/ that aren't handled by other tasks.
 */
gulp.task('copy:root', function () {
  return gulp.src(dirs.src + '/*.{txt,ico}')
             .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:fonts', function () {
  return gulp.src(dirs.src + '/assets/fonts/*')
             .pipe(gulp.dest(dirs.dist + '/assets/fonts/'));
});

gulp.task('copy:js', function () {
  return gulp.src(dirs.src + '/assets/scripts/*.js')
             .pipe(gulp.dest(dirs.dist + '/assets/scripts'));
});

gulp.task('copy:img', function () {
  return gulp.src(dirs.src + '/assets/images/**/*.{gif,jpg,png,svg}')
             .pipe(gulp.dest(dirs.dist + '/assets/images'));
});

gulp.task('copy', [
  'copy:root',
  'copy:fonts',
  'copy:js',
  'copy:img'
]);

/*
 *
 * _ w a t c h
 */
gulp.task('watch:jekyll', function () {
  gulp.watch(dirs.src + '/**/*.{html,yml,md,mkd,markdown}', ['jekyll', reload]);
});

gulp.task('watch:sass', function () {
  gulp.watch(dirs.src + '/assets/sass/**/*.{sass,scss}', ['sass', reload]);
});

gulp.task('watch:image', function () {
  gulp.watch(dirs.src + '/assets/images/**/*.{jpg,png,gif,svg}', [reload]);
});

// gulp.task('watch:svg', function () {
//   gulp.watch(dirs.src + '/assets/svg/*.svg', ['svgstore', reload]);
// });

// gulp.task('watch:js', function () {
//   gulp.watch(dirs.src + '/assets/scripts/*.js', ['jekyll', reload]);
// });

gulp.task('watch', [
  'watch:jekyll',
  // 'watch:svg',
  'watch:image',
  'watch:sass',
  // 'watch:js'
]);



//  M A I N  T A S K S

gulp.task('serve', function (done) {
  runSequence(
    'clean',
    'svgstore',
    'jekyll',
    'sass',
    'browser-sync',
    'watch',
  done);
});

gulp.task('build', function (done) {
  runSequence(
    'clean',
    'jekyll',
    'sass:dist',
    'svgstore',
    // 'svgstore',
    // 'imagemin',
    'copy',
    'useref',
    // 'minify',
    // 'critical',
  done);
});
