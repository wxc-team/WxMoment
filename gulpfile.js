var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('build', function () {

    return gulp.src('./build/qmui_h5.js')
        .pipe(uglify())
        .pipe(rename('qmui_h5.min.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task("default", ["build"]);