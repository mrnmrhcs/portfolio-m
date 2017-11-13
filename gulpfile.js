'use strict';

var gulp                = require('gulp');
var gutil               = require('gulp-util');
var sass                = require('gulp-sass');
var cssnano             = require('gulp-cssnano');
var sourcemaps          = require('gulp-sourcemaps');
var autoprefixer        = require('gulp-autoprefixer');
var rename              = require('gulp-rename');
var concat              = require('gulp-concat');
var gulpIf              = require('gulp-if');
var imagemin            = require('gulp-imagemin');
var cache               = require('gulp-cache');
var plugins             = require('gulp-load-plugins')();
var browserSync         = require('browser-sync').create();
var runSequence         = require('run-sequence');
var ftp                 = require('vinyl-ftp');
var del                 = require('del');

var gulpftp             = require('./glp/config.js');

//  development

gulp.task('browserSync', function() {
    browserSync.init({
        host: 'portfolio-m.dev',
        proxy: 'portfolio-m.dev',
        port: 8010,

        open: 'external',
        browser: 'google chrome',
        logLevel: 'warn',

        ui: false,
        notify: false,
        injectChanges: false,
        ghostMode: false,
        scrollProportionally: false,

        routes: {
            '/node_modules': 'node_modules',
            '/browser-sync': 'browser-sync'
        }
    });
});
gulp.task('sass', function () {
    gulp.src('./src/sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(cssnano())
    .pipe(rename("main.min.css"))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./src/css/'))
    .pipe(browserSync.reload({
        stream: true
    }));
});
gulp.task('js', function () {
    gulp.src([
        'node_modules/jquery/dist/jquery.js',
        'node_modules/popper.js/dist/umd/popper.js',
        'node_modules/popper.js/dist/umd/popper.js.map',
        'node_modules/bootstrap/dist/js/bootstrap.js'
        // './src/assets/js/**/*.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(gulp.dest('./src/assets/js'));
});
gulp.task('watch', ['browserSync', 'sass'], function () {
    gulp.watch('./src/sass/**/*.scss', ['sass'])
    gulp.watch('./src/*.html', browserSync.reload)
    gulp.watch('./src/pages/*.html', browserSync.reload)
    gulp.watch('./src/js/**/*.js', browserSync.reload)
});

//  production

gulp.task('clear:cache', function (callback) {
    return cache.clearAll(callback);
});
gulp.task('base', function() {
    return gulp.src([
        './src/.htaccess',
        './src/index.html',
    ])
    .pipe(gulp.dest('dist'));
});
gulp.task('pages', function() {
    return gulp.src('./src/pages/**/*')
    .pipe(gulp.dest('dist/pages'));
});
gulp.task('css', function() {
    return gulp.src('./src/css/**/*')
    .pipe(gulp.dest('dist/css'));
});
gulp.task('js', function() {
    return gulp.src('./src/js/**/*')
    .pipe(gulp.dest('dist/js'));
});
gulp.task('images', function(){
    return gulp.src('./src/assets/img/*.+(png|jpg|gif)')
    .pipe(cache(imagemin({
        optimizationLevel: 5,
        verbose: true,
        progressive: true,
        verbose: true
    })))
    .pipe(gulp.dest('dist/assets/img'));
});
gulp.task('icons', function() {
    return gulp.src('./src/assets/icons/*')
    .pipe(gulp.dest('dist/assets/icons'));
});
gulp.task('favicon', function() {
    return gulp.src('./src/favicon.ico')
    .pipe(gulp.dest('dist'));
});
gulp.task('fonts', function() {
    return gulp.src('./src/assets/fonts/**/*')
    .pipe(gulp.dest('dist/assets/fonts'));
});
gulp.task('dwnld', function() {
    return gulp.src('./src/assets/dwnld/*')
    .pipe(gulp.dest('dist/assets/dwnld'));
});
gulp.task('clean:dist', function() {
    return del.sync('dist');
});

//  deploy

gulp.task( 'clean:ftp', function ( cb ) {
    var conn                = ftp.create( {
        host:               gulpftp.config.host,
        user:               gulpftp.config.user,
        password:           gulpftp.config.pass,
        parallel:           3,
        maxConnections:     3,
        secure:             false,
        //debug:              gutil.log,
        log:                gutil.log
    } );
    conn.rmdir( './dist', cb );
});
gulp.task( 'upload:ftp', [ 'clean:ftp' ], function () {
    var conn                = ftp.create( {
        host:               gulpftp.config.host,
        user:               gulpftp.config.user,
        password:           gulpftp.config.pass,
        parallel:           3,
        maxConnections:     3,
        secure:             false,
        //debug:              gutil.log,
        log:                gutil.log
    } );
    var globs = [
        'dist/**/*',
        'dist/**'
    ];
    return gulp.src( globs, { base: '.', buffer: false } )
        .pipe( conn.dest( '/' ) );
} );

//  sequences

gulp.task('default', function (callback) {
    runSequence('clear:cache',['sass','browserSync','watch'],callback);
});
gulp.task('build', function (callback) {
    runSequence('clean:dist',['base','pages','css','js','images','icons','favicon','fonts','dwnld'],callback);
});
gulp.task('deploy', function (callback) {
    runSequence('clean:ftp',['upload:ftp'],callback);
});
