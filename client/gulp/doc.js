var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

gulp.task('ngdocs', [], function () {
  var gulpDocs = require('gulp-ngdocs');
  return gulp.src(path.join(conf.paths.src, '/app/**/*.js'))
    .pipe(gulpDocs.process())
    .pipe(gulp.dest('././docs'));
});

gulp.task('connect_ngdocs', function() {
  var connect = require('gulp-connect');
  connect.server({
    root: 'docs',
    livereload: false,
    fallback: 'docs/index.html',
    port: 8083
  });
});
