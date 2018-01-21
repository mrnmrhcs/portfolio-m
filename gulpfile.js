"use strict";

const pkg                       = require('./package.json');
const gulp                      = require('gulp');
const $                         = require('gulp-load-plugins')({

        pattern: ['*'],
        scope: ['devDependencies']

});

var gutil                       = require('gulp-util');
var browserSync                 = require('browser-sync').create();
var ftp                         = require('vinyl-ftp');
var gulpftp                     = require('./glp/config.js');

var conn                        = ftp.create( {
    host:                       gulpftp.config.host,
    user:                       gulpftp.config.user,
    password:                   gulpftp.config.pass,
    parallel:                   2,
    maxConnections:             2,
    secure:                     false,
    debug:                      gutil.log,
    log:                        gutil.log
});

//  development

gulp.task('browserSync', function () {
    browserSync.init({
        host:                   'portfolio-m.test',
        proxy:                  'portfolio-m.test',
        port:                   8010,

        logLevel:               'info',
        logPrefix:              'portfolio-m',

        open:                   'external',
        browser:                "google chrome",

        ui:                     false,
        notify:                 false,
        injectChanges:          false,
        ghostMode:              false,
        scrollProportionally:   false,
        reloadOnRestart:        true,

        routes: {
            '/node_modules':    'node_modules',
            '/browser-sync':    'browser-sync'
        }
    });
});

gulp.task('scss', () => {
    return gulp.src(pkg.paths.src.scss + pkg.vars.scssName)
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.autoprefixer())
    .pipe($.cssnano({
        discardComments: {
            removeAll: true
        },
        discardDuplicates: true,
        discardEmpty: true,
        minifyFontValues: true,
        minifySelectors: true
    }))
    .pipe($.rename(pkg.vars.cssName))
    .pipe($.sourcemaps.write('./'))
    .pipe($.size({gzip: true, showFiles: true}))
    .pipe(gulp.dest(pkg.paths.src.css))
    .pipe(browserSync.stream());
});

gulp.task('plugin:js', function () {
    return gulp.src(pkg.globs.pluginJs).pipe(gulp.dest(pkg.paths.src.js))
});

gulp.task('js', () => {
    return gulp.src(pkg.paths.src.js + pkg.vars.jsName)
    .pipe($.uglify())
    .pipe($.rename({suffix: '.min'}))
    .pipe($.size({gzip: true, showFiles: true}))
    .pipe(gulp.dest(pkg.paths.src.js))
    .pipe(browserSync.stream());    
});

gulp.task('favicons:base', () => {
    return gulp.src(pkg.paths.favicon.src).pipe($.favicons({
        appName: pkg.name,
        appDescription: pkg.description,
        developerName: pkg.author,
        developerURL: pkg.urls.live,
        background: '#FFFFFF',
        path: pkg.paths.favicon.basepath,
        url: pkg.urls.live,
        display: 'standalone',
        orientation: 'portrait',
        version: pkg.version,
        logging: true,
        online: false,
        replace: true,
        icons: {
            android: false, 
            appleIcon: false, 
            appleStartup: false, 
            coast: false, 
            favicons: true,
            firefox: false, 
            windows: false, 
            yandex: false 
        }
    }))  
    .pipe(gulp.dest(pkg.paths.favicon.basedest));
});

gulp.task('favicons:platforms', () => {
    return gulp.src(pkg.paths.favicon.src).pipe($.favicons({
        appName: pkg.name,
        appDescription: pkg.description,
        developerName: pkg.author,
        developerURL: pkg.urls.live,
        background: '#FFFFFF',
        path: pkg.paths.favicon.platformspath,
        url: pkg.urls.live,
        display: 'standalone',
        orientation: 'portrait',
        version: pkg.version,
        logging: true,
        online: false,
        html: pkg.paths.src.html + 'favicons.html',
        replace: true,
        icons: {
            android: true, 
            appleIcon: true, 
            appleStartup: true, 
            coast: true, 
            favicons: false,
            firefox: true, 
            windows: true, 
            yandex: true 
        }
    }))  
    .pipe(gulp.dest(pkg.paths.favicon.platformsdest));
});

//  production

gulp.task('dist:base', function() {
    return gulp.src(pkg.globs.src).pipe(gulp.dest(pkg.paths.dist.base));
});

gulp.task('dist:js', function() {
    return gulp.src(pkg.globs.js).pipe(gulp.dest(pkg.paths.dist.js));
});

gulp.task('dist:css', function() {
    return gulp.src(pkg.paths.src.css + '*.css').pipe(gulp.dest(pkg.paths.dist.css));
});

gulp.task('dist:html', function() {
    return gulp.src(pkg.paths.src.html + '*.html').pipe(gulp.dest(pkg.paths.dist.html));
});

gulp.task('dist:favicons', () => {
    return gulp.src(pkg.paths.src.favicons + '*').pipe(gulp.dest(pkg.paths.dist.favicons));
});

gulp.task('dist:icons', () => {
    return gulp.src(pkg.paths.src.icons + '**/*').pipe(gulp.dest(pkg.paths.dist.icons));
});

gulp.task('dist:fonts', () => {
    return gulp.src(pkg.paths.src.fonts + '**/*.{eot,ttf,woff,woff2}').pipe(gulp.dest(pkg.paths.dist.fonts));
});

gulp.task('dist:img', () => {
    return gulp.src(pkg.paths.src.img + '**/*.{png,jpg,jpeg,gif,svg}').pipe($.imagemin({
        progressive: true,
        interlaced: true,
        optimizationLevel: 7,
        svgoPlugins: [{removeViewBox: false}],
        verbose: true,
        use: []
    }))
    .pipe(gulp.dest(pkg.paths.dist.img));
});

gulp.task('dist:dwnld', () => {
    return gulp.src(pkg.paths.src.dwnld + '**/*').pipe(gulp.dest(pkg.paths.dist.dwnld));
});

//  cleanup

gulp.task('clean:local:dist', function() {
    return $.del.sync('dist');
});

gulp.task('clean:server', function (cb) {
    conn.rmdir('.', cb)
});

//  deploy

gulp.task('deploy:server', function () {
    return gulp.src(pkg.globs.serverDeploy, {base: './dist', buffer: false }).pipe(conn.dest('/'))
});

//  watch

gulp.task('watch', ['browserSync'], () => {
    gulp.watch([pkg.paths.src.scss + '**/*.scss'], ['scss']);
    gulp.watch([pkg.paths.src.js + 'main.js'], ['js']);
    gulp.watch([pkg.paths.src.html + '*.{html,htm}'], browserSync.reload);
    gulp.watch([pkg.paths.src.base + '*.{html,htm}'], browserSync.reload);
});

//  sequences

gulp.task('favicons', function (cb) {
    $.runSequence('favicons:base', ['favicons:platforms'], cb);
});

gulp.task('build', function (cb) {
    $.runSequence('clean:local:dist', ['dist:base', 'dist:html', 'dist:css', 'dist:js', 'dist:favicons', 'dist:icons', 'dist:fonts', 'dist:img', 'dist:dwnld'], cb);
});

gulp.task('deploy', function (cb) {
    $.runSequence('clean:server', ['deploy:server'], cb);
});

gulp.task('default', function (cb) {
    $.runSequence('plugin:js', ['scss', 'js', 'watch'], cb);
});