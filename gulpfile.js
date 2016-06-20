'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var cssnano = require('gulp-cssnano');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

var browserSync = require('browser-sync').create();

gulp.task('browserSync', function() {
    browserSync.init({
        server: "./src",
    })
})
gulp.task('sass', function () {
  gulp.src('./src/sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(cssnano())
    .pipe(sourcemaps.write('./'))

  .pipe(gulp.dest('./src/css/'))
  .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('watch', ['browserSync', 'sass'], function () {
  gulp.watch('./src/sass/**/*.scss', ['sass']);
  gulp.watch('./src/*.html', browserSync.reload);
  gulp.watch('./src/pages/*.html', browserSync.reload);
  gulp.watch('./src/js/**/*.js', browserSync.reload);
});
