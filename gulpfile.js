////////////////////////////////////////////////////////////////////////////////
// GULP
////////////////////////////////////////////////////////////////////////////////

const { task, series, parallel, src, dest, watch } = require('gulp')

const autoprefixer = require('gulp-autoprefixer')
const babel = require('gulp-babel')
const debug = require('gulp-debug')
const gulpif = require('gulp-if')
const concat = require('gulp-concat')
const terser = require('gulp-terser')
const imagemin = require('gulp-imagemin')
const favicon = require('favicons').stream
const cache = require('gulp-cache')
const scss = require('gulp-sass')
const sync = require('browser-sync')
const sass = require('sass')
const del = require('del')

const config = require('./config')

////////////////////////////////////////////////////////////////////////////////
// BROWSERSYNC
////////////////////////////////////////////////////////////////////////////////

const browser = sync.create()

function browsersync (done) {
  browser.init({
    host: config.host.local,
    proxy: config.host.local,
    logLevel: process.env.DEBUG === 'True' ? 'debug' : 'info',
    logFileChanges: process.env.DEBUG === 'True' ? true : false,
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

function clean__vendor () { return del(config.vendor.dest + 'vendor.js') }

// PROCESS -------------------------------------------------------------

function process__vendor () {
  return src(config.vendor.src)
    .pipe(gulpif(process.env.DEBUG === 'True', debug({ title: '## VENDOR:' })))
    .pipe(concat('vendor.js'))
    .pipe(gulpif((process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'), terser()))
    .pipe(dest(config.vendor.dest))
}

// COMPOSITION -------------------------------------------------------------

const vendor = series(clean__vendor, process__vendor)

////////////////////////////////////////////////////////////////////////////////
// SCRIPT
////////////////////////////////////////////////////////////////////////////////

// CLEAN -------------------------------------------------------------

function clean__scripts__main () { return del(config.path.dist + '{main,main-legacy}.js') }

// PROCESS -------------------------------------------------------------

function process__scripts__legacy () {
  return src([config.path.src + config.path.resources + 'main.js', config.path.src + config.path.snippets + '**/script.js'], { sourcemaps: !process.env.NODE_ENV === 'production' ? (!process.env.NODE_ENV === 'staging' ? true : false) : false })
    .pipe(gulpif(process.env.DEBUG === 'True', debug({ title: '## MAIN:' })))
    .pipe(babel({
      presets: [
        ['@babel/preset-env',
          {
            modules: 'auto',
            corejs: {
              version: 3.8,
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
    .pipe(gulpif((process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'), terser()))
    .pipe(dest(config.path.dist, { sourcemaps: !process.env.NODE_ENV === 'production' ? (!process.env.NODE_ENV === 'staging' ? '.' : false) : false }))
}

function process__scripts__modern () {
  return src([config.path.src + config.path.resources + 'main.js', config.path.src + config.path.snippets + '**/script.js'], { sourcemaps: !process.env.NODE_ENV === 'production' ? (!process.env.NODE_ENV === 'staging' ? true : false) : false })
    .pipe(gulpif(process.env.DEBUG === 'True', debug({ title: '## MAIN:' })))
    .pipe(babel({
      presets: [
        ['@babel/preset-env',
          {
            modules: 'auto',
            corejs: {
              version: 3.8,
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
    .pipe(gulpif((process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'), terser()))
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
    .pipe(gulpif(process.env.DEBUG === 'True', debug({ title: '## STYLE:' })))
    .pipe(scss({ outputStyle: process.env.NODE_ENV === 'production' ? 'compressed' : 'expanded' }).on('error', scss.logError))
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
  return src(config.path.src + 'robots.txt')
    .pipe(gulpif(process.env.DEBUG === 'True', debug({ title: '## ROBOTS:' })))
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
    .pipe(gulpif(process.env.DEBUG === 'True', debug({ title: '## HTACCESS:' })))
    .pipe(dest(config.path.dist))
}

function copy__index () {
  return src(config.path.src + 'index.php')
    .pipe(gulpif(process.env.DEBUG === 'True', debug({ title: '## INDEX:' })))
    .pipe(dest(config.path.dist))
}

function copy__snippets () {
  return src(config.path.src + config.path.snippets + '**/*.php')
    .pipe(gulpif(process.env.DEBUG === 'True', debug({ title: '## SNIPPETS:' })))
    .pipe(dest(config.path.dist + config.path.snippets))
}

function copy__templates () {
  return src(config.path.src + config.path.templates + '**/*.php')
    .pipe(gulpif(process.env.DEBUG === 'True', debug({ title: '## TEMPLATES:' })))
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
    .pipe(gulpif(process.env.DEBUG === 'True', debug({ title: '## IMAGES:' })))
    .pipe(cache(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 7 })
    ])))
    .pipe(dest(config.path.dist + config.path.assets + config.path.images))
}

function process__icons () {
  return src(config.path.src + config.path.resources + config.path.assets + config.path.icons + '**/*.svg')
    .pipe(gulpif(process.env.DEBUG === 'True', debug({ title: '## ICONS:' })))
    .pipe(cache(imagemin([
      imagemin.svgo({
        plugins: [
          { removeTitle: true },
          { removeViewBox: false },
          { cleanupIDs: true },
          { removeXMLNS: false }
        ],
        verbose: process.env.DEBUG === 'True' ? true : false
      })
    ])))
    .pipe(dest(config.path.dist + config.path.assets + config.path.icons))
}

function process__favicons () {
  return src(config.path.src + config.path.resources + config.path.assets + config.path.favicons + 'favicon_src.png')
    .pipe(gulpif(process.env.DEBUG === 'True', debug({ title: '## FAVICON:' })))
    .pipe(favicon({
      path: '../../../' + config.path.assets + config.path.favicons,
      appName: 'Portfolio — Marian Schramm',
      appShortName: 'Portfolio-M',
      appDescription: process.env.npm_package_description,
      url: config.host.live,
      version: process.env.npm_package_version,
      developerName: process.env.npm_package_author,
      developerURL: config.host.live,
      lang: 'en-US',
      display: 'browser',
      orientation: 'any',
      appleStatusBarStyle: 'black-translucent',
      background: 'rgba(164,170,204,0)',
      theme_color: 'rgba(164,170,204,0)',
      pixel_art: false,
      scope: '/',
      html: 'all.html',
      start_url: '/index.php',
      logging: true,
      pipeHTML: true,
      replace: true,
      icons: {
        android: process.env.NODE_ENV === 'development' ? false : true,
        appleIcon: process.env.NODE_ENV === 'development' ? false : true,
        appleStartup: process.env.NODE_ENV === 'development' ? false : true,
        coast: process.env.NODE_ENV === 'development' ? false : true,
        favicons: true,
        firefox: process.env.NODE_ENV === 'development' ? false : true,
        windows: process.env.NODE_ENV === 'development' ? false : true,
        yandex: process.env.NODE_ENV === 'development' ? false : true
      }
    }))
    .pipe(dest(config.path.dist + config.path.assets + config.path.favicons))
}

function copy__fonts () {
  return src(config.path.src + config.path.resources + config.path.assets + config.path.fonts + '**/*.{woff,woff2}')
    .pipe(gulpif(process.env.DEBUG === 'True', debug({ title: '## FONTS:' })))
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
