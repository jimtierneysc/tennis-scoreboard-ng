var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');


gulp.task('ngdocs', [], function () {
  var gulpDocs = require('gulp-ngdocs');
  var options = {
    title: "Tennis-scoreboard-ng",
  };

  return gulpDocs.sections({
    api: {
      glob: path.join(conf.paths.src, '/app/**/*.js'),
      api: true,
      title: 'ngdoc'
    }
  }).pipe(gulpDocs.process(options)).pipe(gulp.dest('././docs'));
  // return gulp.src(path.join(conf.paths.src, '/app/**/*.js'))
  //   .pipe(gulpDocs.process(options))
  //   .pipe(gulp.dest('././docs'));
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
