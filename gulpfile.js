var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('build', function () {

    return gulp.src('./build/wxmoment.js')
        .pipe(uglify())
        .pipe(rename('wxmoment.min.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task("default", ["build"]);