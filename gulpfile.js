var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var connect = require('gulp-connect');
var gopen = require('gulp-open');
var history = require('connect-history-api-fallback');

var paths = {
    js: 'src/static/**/*.js',
    index: 'src/static/index.html'
};

gulp.task('lint', function() {
    gulp.src(paths.js)
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'));
});

gulp.task('connect', function() {
    connect.server({
        root: 'src/static',
        port: 5000,
        livereload: true,
        middleware: function(connect, opt) {
            return [
                history()
            ]
        }
    });

    gulp.src(paths.index)
        .pipe(gopen('', {
            url: 'http://local.open.uappexplorer.com:5000/'
        }));
});
