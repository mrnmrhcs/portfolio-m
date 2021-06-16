////////////////////////////////////////////////////////////////////////////////
// GULP
////////////////////////////////////////////////////////////////////////////////

import { task, series, parallel, src, dest, watch } from 'gulp'

import autoprefixer from 'gulp-autoprefixer'
import babel from 'gulp-babel'
import cache from 'gulp-cache'
import debug from 'gulp-debug'
import gulpif from 'gulp-if'
import concat from 'gulp-concat'
import uglify from 'gulp-uglify-es'
import imagemin from 'gulp-imagemin'
import scss from 'gulp-sass'
import sync from 'browser-sync'
import favicon from 'favicons'
import sass from 'sass'
import del from 'del'

import config from './config'
import pkg from './package.json'

////////////////////////////////////////////////////////////////////////////////
// INFO
////////////////////////////////////////////////////////////////////////////////

const DEBUG = (process.env.NODE_DEBUG) ? true : false
console.log('ENV:', process.env.NODE_ENV)

////////////////////////////////////////////////////////////////////////////////
// BROWSERSYNC
////////////////////////////////////////////////////////////////////////////////

const browser = sync.create()

function browsersync (done) {
  browser.init({
    host: config.host.local,
    proxy: config.host.local,
    logLevel: DEBUG ? 'info' : 'info',
    logFileChanges: DEBUG ? true : false,
    logPrefix: 'portfolio-m',
    ghostMode: false,
    open: false,
    notify: false,
    ui: false,
    online: false,
    injectChanges: true,
    reloadDelay: 800
  })
  done()
}

function reload (done) {
  browser.reload()
  done()
}

////////////////////////////////////////////////////////////////////////////////
// VENDOR
////////////////////////////////////////////////////////////////////////////////

// CLEAN -------------------------------------------------------------

function clean__vendor () { return del(config.vendor.dest + '{vendor,vendor-legacy}.js') }

// PROCESS -------------------------------------------------------------

function process__vendor__legacy () {
  return src(config.vendor.src)
    .pipe(gulpif(DEBUG, debug({ title: '## VENDOR:' })))
    .pipe(babel({
      presets: [
        ['@babel/preset-env',
          {
            modules: false,
            corejs: {
              version: 2,
              proposals: true
            },
            useBuiltIns: 'entry',
            targets: {
              browsers: [
                '> 1%',
                'last 2 versions',
                'Firefox ESR'
              ]
            }
          }
        ]
      ]
    }))
    .pipe(concat('vendor-legacy.js'))
    .pipe(gulpif((process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'), uglify()))
    .pipe(dest(config.vendor.dest))
}

function process__vendor__modern () {
  return src(config.vendor.src)
    .pipe(gulpif(DEBUG, debug({ title: '## VENDOR:' })))
    .pipe(babel({
      presets: [
        ['@babel/preset-env',
          {
            modules: false,
            corejs: {
              version: 2,
              proposals: true
            },
            useBuiltIns: 'entry',
            targets: {
              browsers: [
                'last 2 Chrome versions',
                'not Chrome < 60',
                'last 2 Safari versions',
                'not Safari < 10.1',
                'last 2 iOS versions',
                'not iOS < 10.3',
                'last 2 Firefox versions',
                'not Firefox < 54',
                'last 2 Edge versions',
                'not Edge < 15'
              ]
            }
          }
        ]
      ]
    }))
    .pipe(concat('vendor.js'))
    .pipe(gulpif((process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'), uglify()))
    .pipe(dest(config.vendor.dest))
}

// COMPOSITION -------------------------------------------------------------

const vendor = series(clean__vendor, process__vendor__modern, process__vendor__legacy)

////////////////////////////////////////////////////////////////////////////////
// SCRIPT
////////////////////////////////////////////////////////////////////////////////

// CLEAN -------------------------------------------------------------

function clean__scripts__main () { return del(config.path.dist + '{main,main-legacy}.js') }

// PROCESS -------------------------------------------------------------

function process__scripts__legacy () {
  return src([config.path.src + config.path.resources + 'main.js', config.path.src + config.path.snippets + '**/script.js'], { sourcemaps: !process.env.NODE_ENV === 'production' ? (!process.env.NODE_ENV === 'staging' ? true : false) : false })
    .pipe(gulpif(DEBUG, debug({ title: '## MAIN:' })))
    .pipe(babel({
      presets: [
        ['@babel/preset-env',
          {
            modules: false,
            corejs: {
              version: 2,
              proposals: true
            },
            useBuiltIns: 'usage',
            targets: {
              browsers: [
                '> 1%',
                'last 2 versions',
                'Firefox ESR'
              ]
            }
          }
        ]
      ]
    }))
    .pipe(concat('main-legacy.js'))
    .pipe(gulpif((process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'), uglify()))
    .pipe(dest(config.path.dist, { sourcemaps: !process.env.NODE_ENV === 'production' ? (!process.env.NODE_ENV === 'staging' ? '.' : false) : false }))
}

function process__scripts__modern () {
  return src([config.path.src + config.path.resources + 'main.js', config.path.src + config.path.snippets + '**/script.js'], { sourcemaps: !process.env.NODE_ENV === 'production' ? (!process.env.NODE_ENV === 'staging' ? true : false) : false })
    .pipe(gulpif(DEBUG, debug({ title: '## MAIN:' })))
    .pipe(babel({
      presets: [
        ['@babel/preset-env',
          {
            modules: false,
            corejs: {
              version: 2,
              proposals: true
            },
            useBuiltIns: 'usage',
            targets: {
              browsers: [
                'last 2 Chrome versions',
                'not Chrome < 60',
                'last 2 Safari versions',
                'not Safari < 10.1',
                'last 2 iOS versions',
                'not iOS < 10.3',
                'last 2 Firefox versions',
                'not Firefox < 54',
                'last 2 Edge versions',
                'not Edge < 15'
              ]
            }
          }
        ]
      ]
    }))
    .pipe(concat('main.js'))
    .pipe(gulpif((process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'), uglify()))
    .pipe(dest(config.path.dist, { sourcemaps: !process.env.NODE_ENV === 'production' ? (!process.env.NODE_ENV === 'staging' ? '.' : false) : false }))
}

// WATCH -------------------------------------------------------------

function watch__scripts () {
  watch([config.path.src + config.path.resources + 'main.js', config.path.src + config.path.snippets + '**/script.js'], series(scripts__main, reload))
};

// COMPOSITION -------------------------------------------------------------

const scripts__main = series(clean__scripts__main, process__scripts__legacy, process__scripts__modern)

////////////////////////////////////////////////////////////////////////////////
// STYLE
////////////////////////////////////////////////////////////////////////////////

// CLEAN -------------------------------------------------------------

function clean__styles () { return del(config.path.dist + '*.{css,css.map}') }

// PROCESS -------------------------------------------------------------

function process__styles () {
  scss.compiler = sass
  return src(config.path.src + config.path.resources + 'main.scss', { sourcemaps: !process.env.NODE_ENV === 'production' ? (!process.env.NODE_ENV === 'staging' ? true : false) : false })
    .pipe(gulpif(DEBUG, debug({ title: '## STYLE:' })))
    .pipe(scss({ outputStyle: process.env.NODE_ENV === 'production' ? (process.env.NODE_ENV === 'staging' ? 'compressed' : 'expanded') : 'expanded' }).on('error', scss.logError))
    .pipe(autoprefixer())
    .pipe(dest(config.path.dist, { sourcemaps: !process.env.NODE_ENV === 'production' ? (!process.env.NODE_ENV === 'staging' ? '.' : false) : false }))
}

// WATCH -------------------------------------------------------------

function watch__styles () {
  watch(config.path.src + config.path.snippets + '**/*.scss', series(styles, reload))
  watch(config.path.src + config.path.resources + '**/*.scss', series(styles, reload))
}

// COMPOSITION -------------------------------------------------------------

const styles = series(clean__styles, process__styles)

////////////////////////////////////////////////////////////////////////////////
// SEO
////////////////////////////////////////////////////////////////////////////////

// CLEAN -------------------------------------------------------------

function clean__robots () { return del(config.path.dist + 'robots.txt') }

// COPY -------------------------------------------------------------

function copy__robots () {
  return src(config.path.src + (!process.env.NODE_ENV === 'staging' ? 'robots.txt' : 'robots.txt'))
    .pipe(gulpif(DEBUG, debug({ title: '## ROBOTS:' })))
    .pipe(dest(config.path.dist))
}

// COMPOSITION -------------------------------------------------------------

const robots = series(clean__robots, copy__robots)

////////////////////////////////////////////////////////////////////////////////
// LOGIC
////////////////////////////////////////////////////////////////////////////////

// CLEAN -------------------------------------------------------------

function clean__index () { return del(config.path.dist + 'index.php') }
function clean__htaccess () { return del(config.path.dist + '.htaccess') }
function clean__snippets () { return del(config.path.dist + config.path.snippets) }
function clean__templates () { return del(config.path.dist + config.path.templates) }

// COPY -------------------------------------------------------------

function copy__htaccess () {
  return src(config.path.src + '.htaccess')
    .pipe(gulpif(DEBUG, debug({ title: '## HTACCESS:' })))
    .pipe(dest(config.path.dist))
}

function copy__index () {
  return src(config.path.src + 'index.php')
    .pipe(gulpif(DEBUG, debug({ title: '## INDEX:' })))
    .pipe(dest(config.path.dist))
}

function copy__snippets () {
  return src(config.path.src + config.path.snippets + '**/*.php')
    .pipe(gulpif(DEBUG, debug({ title: '## SNIPPETS:' })))
    .pipe(dest(config.path.dist + config.path.snippets))
}

function copy__templates () {
  return src(config.path.src + config.path.templates + '**/*.php')
    .pipe(gulpif(DEBUG, debug({ title: '## TEMPLATES:' })))
    .pipe(dest(config.path.dist + config.path.templates))
}

// WATCH -------------------------------------------------------------

function watch__logic () {
  watch(config.path.src + 'index.php', series(index, reload))
  watch(config.path.src + '.htaccess', series(htaccess, reload))
  watch(config.path.src + config.path.snippets + '**/*.php', series(snippets, reload))
  watch(config.path.src + config.path.templates + '**/*.php', series(templates, reload))
}

// COMPOSITION -------------------------------------------------------------

const index = series(clean__index, copy__index)
const htaccess = series(clean__htaccess, copy__htaccess)
const snippets = series(clean__snippets, copy__snippets)
const templates = series(clean__templates, copy__templates)

////////////////////////////////////////////////////////////////////////////////
// ASSETS
////////////////////////////////////////////////////////////////////////////////

// CLEAN -------------------------------------------------------------

function clean__images () { return del(config.path.dist + config.path.assets + config.path.images) }
function clean__icons () { return del(config.path.dist + config.path.assets + config.path.icons) }
function clean__favicons () { return del(config.path.dist + config.path.assets + config.path.favicons) }
function clean__fonts () { return del(config.path.dist + config.path.assets + config.path.fonts) }

// PROCESS -------------------------------------------------------------

function process__images () {
  return src(config.path.src + config.path.resources + config.path.assets + config.path.images + '**/*.{png,jpg,jpeg,gif}')
    .pipe(debug({ title: '## IMAGES:' }))
    .pipe(cache(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 7 })
    ])))
    .pipe(dest(config.path.dist + config.path.assets + config.path.images))
}

function process__icons () {
  return src(config.path.src + config.path.resources + config.path.assets + config.path.icons + '**/*.svg')
    .pipe(debug({ title: '## ICONS:' }))
    .pipe(cache(imagemin([
      imagemin.svgo({
        plugins: [
          { removeTitle: true },
          { removeViewBox: false },
          { cleanupIDs: true },
          { removeXMLNS: false }
        ],
        verbose: DEBUG ? true : false
      })
    ])))
    .pipe(dest(config.path.dist + config.path.assets + config.path.icons))
}

function process__favicons () {
  return src(config.path.src + config.path.resources + config.path.assets + config.path.favicons + 'favicon_src.png')
    .pipe(gulpif(DEBUG, debug({ title: '## FAVICON:' })))
    .pipe(favicon.stream({
      appName: 'Portfolio — Marian Schramm',
      appShortName: pkg.name,
      appDescription: pkg.description,
      developerName: pkg.author,
      developerURL: config.host.live,
      lang: 'en-US',
      background: '#FFFFFF',
      path: '../../../' + config.path.assets + config.path.favicons,
      url: config.host.live,
      display: 'browser',
      orientation: 'any',
      scope: '/',
      start_url: '/index.php',
      version: pkg.version,
      logging: DEBUG ? true : false,
      html: 'HEAD.html',
      pipeHTML: true,
      replace: true,
      icons: {
        android: process.env.NODE_ENV === 'production' ? true : (!process.env.NODE_ENV === 'staging' ? false : true),
        appleIcon: process.env.NODE_ENV === 'production' ? true : (!process.env.NODE_ENV === 'staging' ? false : true),
        appleStartup: process.env.NODE_ENV === 'production' ? true : (!process.env.NODE_ENV === 'staging' ? false : true),
        coast: process.env.NODE_ENV === 'production' ? true : (!process.env.NODE_ENV === 'staging' ? false : true),
        favicons: true,
        firefox: process.env.NODE_ENV === 'production' ? true : (!process.env.NODE_ENV === 'staging' ? false : true),
        windows: process.env.NODE_ENV === 'production' ? true : (!process.env.NODE_ENV === 'staging' ? false : true),
        yandex: process.env.NODE_ENV === 'production' ? true : (!process.env.NODE_ENV === 'staging' ? false : true)
      }
    }))
    .pipe(dest(config.path.dist + config.path.assets + config.path.favicons))
}

function copy__fonts () {
  return src(config.path.src + config.path.resources + config.path.assets + config.path.fonts + '**/*.{woff,woff2}')
    .pipe(gulpif(DEBUG, debug({ title: '## FONTS:' })))
    .pipe(dest(config.path.dist + config.path.assets + config.path.fonts))
}

// WATCH -------------------------------------------------------------

function watch__assets () {
  watch(config.path.src + config.path.resources + config.path.assets + config.path.images + '**/*.{png,jpg,jpeg,gif}', series(images, reload))
  watch(config.path.src + config.path.resources + config.path.assets + config.path.icons + '**/*.svg', series(icons, reload))
  watch(config.path.src + config.path.resources + config.path.assets + config.path.favicons + '**/favicon_src.png', series(favicons, reload))
  watch(config.path.src + config.path.resources + config.path.assets + config.path.fonts + '**/*.{woff,woff2}', series(fonts, reload))
}

// COMPOSITION -------------------------------------------------------------

const images = series(clean__images, process__images)
const icons = series(clean__icons, process__icons)
const favicons = series(clean__favicons, process__favicons)
const fonts = series(clean__fonts, copy__fonts)

////////////////////////////////////////////////////////////////////////////////
// COMPOSITION
////////////////////////////////////////////////////////////////////////////////

const LOGIC = series(parallel(index, htaccess, snippets, templates), vendor)
const STYLE = series(parallel(styles, scripts__main))
const ASSET = series(images, icons, favicons, fonts)
const SEO = series(robots)
const RUN = series(browsersync, parallel(watch__logic, watch__assets, watch__styles, watch__scripts))

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
  exports.default = series(LOGIC, STYLE, ASSET, SEO)
} else {
  exports.default = series(LOGIC, STYLE, ASSET, RUN)
}

////////////////////////////////////////////////////////////////////////////////
// HELPER
////////////////////////////////////////////////////////////////////////////////

task('clear', () => cache.clearAll())
