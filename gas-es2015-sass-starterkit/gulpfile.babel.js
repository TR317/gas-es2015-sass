import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';

const $ = gulpLoadPlugins();

gulp.task('run', () => {
  return gulp.watch([
      './dev/**/*.js',
      './dev/**/*.scss',
      './dev/**/*.html',
    ],
    [
      'compile:gs',
      'compile:js',
      'compile:sass',
      'move:html',
      'gapps-upload',
      'notify:complite',
    ]);
});

gulp.task('compile:gs', () => {
  return browserify({
    entries: ['./dev/gs/index.js']
  }).transform('babelify')
    .plugin('gasify')
    .bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest('./src/'));
});

gulp.task('compile:js', ['compile:gs'], () => {
  return browserify({
    entries: ['./dev/js/index.js']
  }).transform('babelify')
    .bundle()
    .pipe(source('index.js.html'))
    .pipe(buffer())
    .pipe($.tap( (file) => {
      file.contents = Buffer.concat([
        new Buffer("<script>\n"),
        file.contents,
        new Buffer("</script>")
      ]);
    }))
    .pipe(gulp.dest('./src/'));
});

gulp.task('compile:sass', ['compile:js'], () => {
  return gulp.src('./dev/scss/**/*.scss')
    .pipe($.sass({ 'outputStyle': 'expanded' }))
    .pipe($.concat('index.css.html'))
    .pipe($.tap( (file) => {
      file.contents = Buffer.concat([
        new Buffer("<style>\n"),
        file.contents,
        new Buffer("</style>")
      ]);
    }))
    .pipe(gulp.dest('./src/'));
});

gulp.task('move:html', ['compile:sass'], () => {
  return gulp.src('./dev/view/*.html')
    .pipe(gulp.dest('./src/'));
});

gulp.task('gapps-upload', ['move:html'], () => {
  return gulp.src('.')
    .pipe($.exec('gapps upload'));
});

gulp.task('notify:complite', ['gapps-upload'], () => {
  return gulp.src('.')
    .pipe($.notify('Upload complited!'));
});