////////////////////////////////////////////////////////////////////////////////
// GULP
////////////////////////////////////////////////////////////////////////////////

import { series, parallel, src, dest, watch } from 'gulp'

import autoprefixer from 'gulp-autoprefixer'
import imagemin from 'gulp-imagemin'
import favicon from 'gulp-favicons'
import concat from 'gulp-concat'
import rename from 'gulp-rename'
import uglify from 'gulp-uglify-es'
import gulpif from 'gulp-if'
import cache from 'gulp-cache'
import debug from 'gulp-debug'
import scss from 'gulp-sass'
import sass from 'node-sass'
import sync from 'browser-sync'
import del from 'del'

import config from './config'

const ENV = process.env.NODE_ENV
const DEBUG = (process.env.NODE_DEBUG) ? true : false

// PATHS
const path = prep(config.path)
const root_src = path.root_src
const root_dist = path.root_dist
const resources = path.resources

// INFO
console.log('ENV:', ENV)
console.log('DEBUG:', DEBUG)

////////////////////////////////////////////////////////////////////////////////
// BROWSERSYNC
////////////////////////////////////////////////////////////////////////////////

const browser = sync.create()

function browsersync (done) {
  browser.init({
    host: config.host.local,
    proxy: config.host.local,
    logLevel: DEBUG ? 'debug' : 'info',
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

const vendor = series(clean__vendor, process__vendor_head, process__vendor)

// CLEAN -------------------------------------------------------------

function clean__vendor () {
  return del([config.vendor.dest + '{vendor.head,vendor}.min.js'])
}

// PROCESS -------------------------------------------------------------

function process__vendor_head () {
  return src(config.vendor.head)
    .pipe(gulpif(DEBUG, debug({ title: '## VENDOR_HEAD:' })))
    .pipe(concat('vendor.head.js'))
    .pipe(gulpif((ENV === 'production' || ENV === 'staging'), uglify()))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(config.vendor.dest))
}

function process__vendor () {
  return src(config.vendor.src)
    .pipe(gulpif(DEBUG, debug({ title: '## VENDOR:' })))
    .pipe(concat('vendor.js'))
    .pipe(gulpif((ENV === 'production' || ENV === 'staging'), uglify()))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(config.vendor.dest))
}

////////////////////////////////////////////////////////////////////////////////
// SEO
////////////////////////////////////////////////////////////////////////////////

const seo__src = (root_src).replace('//', '/')
const seo__dest = (root_dist).replace('//', '/')

// CLEAN -------------------------------------------------------------

function clean__robots () { return del([seo__dest + 'robots.txt']) }

// COPY -------------------------------------------------------------

function copy__robots () {
  return src([seo__src + (!ENV === 'staging' ? 'robots.txt' : 'robots.txt')])
    .pipe(gulpif(DEBUG, debug({ title: '## ROBOTS:' })))
    .pipe(rename('robots.txt'))
    .pipe(dest(seo__dest))
}

// COMPOSITION -------------------------------------------------------------

const robots = series(clean__robots, copy__robots)

////////////////////////////////////////////////////////////////////////////////
// LOGIC
////////////////////////////////////////////////////////////////////////////////

const index__src = (root_src).replace('//', '/')
const index__dest = (root_dist).replace('//', '/')

const snippets__src = (root_src + path.snippets).replace('//', '/')
const snippets__dest = (root_dist + path.snippets).replace('//', '/')

const templates__src = (root_src + path.templates).replace('//', '/')
const templates__dest = (root_dist + path.templates).replace('//', '/')

// CLEAN -------------------------------------------------------------

function clean__index () { return del([index__dest + 'index.php']) }
function clean__htaccess () { return del([index__dest + '.htaccess']) }
function clean__snippets () { return del([snippets__dest]) }
function clean__templates () { return del([templates__dest]) }

// COPY -------------------------------------------------------------

function copy__htaccess () {
  return src([index__src + '.htaccess'])
    .pipe(gulpif(DEBUG, debug({ title: '## HTACCESS:' })))
    .pipe(dest(index__dest))
}

function copy__index () {
  return src([index__src + 'index.php'])
    .pipe(gulpif(DEBUG, debug({ title: '## INDEX:' })))
    .pipe(dest(index__dest))
}

function copy__snippets () {
  return src([snippets__src + '**/*.php'])
    .pipe(gulpif(DEBUG, debug({ title: '## SNIPPETS:' })))
    .pipe(dest(snippets__dest))
}

function copy__templates () {
  return src([templates__src + '**/*.php'])
    .pipe(gulpif(DEBUG, debug({ title: '## TEMPLATES:' })))
    .pipe(dest(templates__dest))
}

// WATCH -------------------------------------------------------------

function watch__logic () {
  watch(index__src + 'index.php', series(index, reload))
  watch(index__src + '.htaccess', series(htaccess, reload))
  watch(snippets__src + '**/*.php', series(snippets, reload))
  watch(templates__src + '**/*.php', series(templates, reload))
}

// COMPOSITION -------------------------------------------------------------

const index = series(clean__index, copy__index)
const htaccess = series(clean__htaccess, copy__htaccess)
const snippets = series(clean__snippets, copy__snippets)
const templates = series(clean__templates, copy__templates)

////////////////////////////////////////////////////////////////////////////////
// ASSETS
////////////////////////////////////////////////////////////////////////////////

const assets__images__src = (root_src + resources + path.assets + path.images).replace('//', '/')
const assets__images__dest = (root_dist + path.assets + path.images).replace('//', '/')

const assets__icons__src = (root_src + resources + path.assets + path.icons).replace('//', '/')
const assets__icons__dest = (root_dist + path.assets + path.icons).replace('//', '/')

const assets__favicons__src = (root_src + resources + path.assets + path.favicons).replace('//', '/')
const assets__favicons__dest = (root_dist + path.assets + path.favicons).replace('//', '/')

const assets__fonts__src = (root_src + resources + path.assets + path.fonts).replace('//', '/')
const assets__fonts__dest = (root_dist + path.assets + path.fonts).replace('//', '/')

// CLEAN -------------------------------------------------------------

function clean__images () { return del([assets__images__dest]) }
function clean__icons () { return del([assets__icons__dest]) }
function clean__favicons () { return del([assets__favicons__dest]) }
function clean__fonts () { return del([assets__fonts__dest]) }

// PROCESS -------------------------------------------------------------

function process__images () {
  return src(assets__images__src + '**/*.{png,jpg,jpeg,gif}')
    .pipe(debug({ title: '## IMAGES:' }))
    .pipe(cache(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 7 })
    ])))
    .pipe(dest(assets__images__dest))
}

function process__icons () {
  return src(assets__icons__src + '**/*.svg')
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
    .pipe(dest(assets__icons__dest))
}

function process__favicons () {
  return src([assets__favicons__src + 'favicon_src.png'])
    .pipe(favicon({
      background: '#FFFFFF',
      path: assets__favicons__dest,
      url: config.host.live,
      display: 'standalone',
      orientation: 'portrait',
      logging: DEBUG ? true : false,
      online: false,
      replace: true,
      icons: {
        android: ENV === 'production' ? true : (!ENV === 'staging' ? false : true),
        appleIcon: ENV === 'production' ? true : (!ENV === 'staging' ? false : true),
        appleStartup: ENV === 'production' ? true : (!ENV === 'staging' ? false : true),
        coast: ENV === 'production' ? true : (!ENV === 'staging' ? false : true),
        favicons: true,
        firefox: ENV === 'production' ? true : (!ENV === 'staging' ? false : true),
        windows: ENV === 'production' ? true : (!ENV === 'staging' ? false : true),
        yandex: ENV === 'production' ? true : (!ENV === 'staging' ? false : true)
      }
    }))
    .pipe(gulpif(DEBUG, debug({ title: '## FAVICON:' })))
    .pipe(dest(assets__favicons__dest))
}

function copy__fonts () {
  return src([assets__fonts__src + '**/*.{woff,woff2}'])
    .pipe(gulpif(DEBUG, debug({ title: '## FONTS:' })))
    .pipe(dest(assets__fonts__dest))
}

// WATCH -------------------------------------------------------------

function watch__assets () {
  watch(assets__images__src + '**/*.{png,jpg,jpeg,gif}', series(images, reload))
  watch(assets__icons__src + '**/*.svg', series(icons, reload))
  watch(assets__favicons__src + '**/favicon_src.png', series(favicons, reload))
  watch(assets__fonts__src + '**/*.{woff,woff2}', series(fonts, reload))
}

// COMPOSITION -------------------------------------------------------------

const images = series(clean__images, process__images)
const icons = series(clean__icons, process__icons)
const favicons = series(clean__favicons, process__favicons)
const fonts = series(clean__fonts, copy__fonts)

////////////////////////////////////////////////////////////////////////////////
// SCRIPT
////////////////////////////////////////////////////////////////////////////////

const scripts__src = (root_src + path.resources).replace('//', '/')
const scripts__dest = (root_dist).replace('//', '/')

// CLEAN -------------------------------------------------------------

function clean__scripts__main () { return del(scripts__dest + 'main.min.{js,js.map}') }

// PROCESS -------------------------------------------------------------

function process__scripts__main () {
  return src([scripts__src + 'main.js', snippets__src + '**/script.js'], { sourcemaps: !ENV === 'production' ? (!ENV === 'staging' ? true : false) : false })
    .pipe(gulpif(DEBUG, debug({ title: '## MAIN:' })))
    .pipe(concat('main.js'))
    .pipe(gulpif((ENV === 'production' || ENV === 'staging'), uglify()))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(scripts__dest, { sourcemaps: !ENV === 'production' ? (!ENV === 'staging' ? '.' : false) : false }))
}

// WATCH -------------------------------------------------------------

function watch__scripts () {
  watch([scripts__src + 'main.js', snippets__src + '**/script.js'], series(scripts__main, reload))
};

// COMPOSITION -------------------------------------------------------------

const scripts__main = series(clean__scripts__main, process__scripts__main)

////////////////////////////////////////////////////////////////////////////////
// STYLE
////////////////////////////////////////////////////////////////////////////////

const styles__src = (root_src + resources).replace('//', '/')
const styles__dest = (root_dist).replace('//', '/')

// CLEAN -------------------------------------------------------------

function clean__styles () { return del(styles__dest + '*.min.{css,css.map}') }

// PROCESS -------------------------------------------------------------

function process__styles () {
  scss.compiler = sass
  return src(styles__src + 'main.scss', { sourcemaps: !ENV === 'production' ? (!ENV === 'staging' ? true : false) : false })
    .pipe(gulpif(DEBUG, debug({ title: '## STYLE:' })))
    .pipe(scss({ outputStyle: ENV === 'production' ? (ENV === 'staging' ? 'compressed' : 'expanded') : 'expanded' }).on('error', scss.logError))
    .pipe(autoprefixer()).pipe(rename({ suffix: '.min' }))
    .pipe(dest(styles__dest, { sourcemaps: !ENV === 'production' ? (!ENV === 'staging' ? '.' : false) : false }))
}

// WATCH -------------------------------------------------------------

function watch__styles () {
  watch(snippets__src + '**/*.scss', series(styles, reload))
  watch(styles__src + '**/*.scss', series(styles, reload))
}

// COMPOSITION -------------------------------------------------------------

const styles = series(clean__styles, process__styles)

////////////////////////////////////////////////////////////////////////////////
// COMPOSITION
////////////////////////////////////////////////////////////////////////////////

const LOGIC = series(parallel(index, htaccess, snippets, templates), vendor)
const STYLE = series(parallel(styles, scripts__main))
const ASSET = series(images, icons, favicons, fonts)
const SEO = series(robots)
const RUN = series(browsersync, parallel(watch__logic, watch__assets, watch__styles, watch__scripts))

if (ENV === 'production' || ENV === 'staging') {
  exports.default = series(LOGIC, STYLE, ASSET, SEO)
} else {
  exports.default = series(LOGIC, STYLE, ASSET, RUN)
}

////////////////////////////////////////////////////////////////////////////////
// HELPER
////////////////////////////////////////////////////////////////////////////////

function prep (paths) {
  for (var p in paths) {
    var value = paths[p]
    paths[p] = value.length ? value.replace(/\/?$/, '/') : value
  }
  return paths
}
