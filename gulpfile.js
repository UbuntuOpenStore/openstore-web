var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

var paths = {
    js: ['www/**/*.js', 'src/**/*.js'],
};

gulp.task('lint', function() {
    gulp.src(paths.js)
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'));
});
