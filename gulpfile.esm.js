////////////////////////////////////////////////////////////////////////////////
// GULP
////////////////////////////////////////////////////////////////////////////////

import { series, parallel, src, dest, watch } from 'gulp'

import autoprefixer from 'gulp-autoprefixer'
import stylelint from 'gulp-stylelint'
import imagemin from 'gulp-imagemin'
import favicon from 'gulp-favicons'
import concat from 'gulp-concat'
import rename from 'gulp-rename'
import uglify from 'gulp-uglify-es'
import eslint from 'gulp-eslint'
import gulpif from 'gulp-if'
import phpcs from 'gulp-phpcs'
import debug from 'gulp-debug'
import scss from 'gulp-sass'
import sass from 'node-sass'
import sync from 'browser-sync'
import del from 'del'
import config from './config'
import minimist from 'minimist'

// ARGS
const ARGS = minimist(process.argv.slice(2))
const PROD = (ARGS['prod']) ? true : false
const DEBUG = (ARGS['debug']) ? true : false

// PATHS
const path = prep(config.path)
const root_src = path.root_src
const root_dist = path.root_dist
const resources = path.resources

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
    reloadDelay: 1000
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
    .pipe(gulpif(PROD, uglify()))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(config.vendor.dest))
}

function process__vendor () {
  return src(config.vendor.src)
    .pipe(gulpif(DEBUG, debug({ title: '## VENDOR:' })))
    .pipe(concat('vendor.js'))
    .pipe(gulpif(PROD, uglify()))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(config.vendor.dest))
}

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

// LINT -------------------------------------------------------------

function lint__logic () {
  return src(['./app/{templates,snippets}/**/*.php', '!index.php'])
    .pipe(gulpif(DEBUG, debug({ title: '## LOGIC:' })))
    .pipe(phpcs({ bin: 'dist/vendor/bin/phpcs', standard: './phpcs.ruleset.xml' }))
    .pipe(phpcs.reporter('log'))
}

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
    .pipe(gulpif(DEBUG, debug({ title: '## IMAGES:' })))
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.jpegtran({ progressive: true }),
      imagemin.optipng({ optimizationLevel: 7 })
    ]))
    .pipe(dest(assets__images__dest))
}

function process__icons () {
  return src(assets__icons__src + '**/*.svg')
    .pipe(gulpif(DEBUG, debug({ title: '## ICONS:' })))
    .pipe(imagemin([
      imagemin.svgo({
        plugins: [
          { removeTitle: true },
          { removeViewBox: false },
          { cleanupIDs: true },
          { removeXMLNS: false }
        ],
        verbose: DEBUG ? true : false
      })
    ]))
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
        android: PROD ? true : false,
        appleIcon: PROD ? true : false,
        appleStartup: PROD ? true : false,
        coast: PROD ? true : false,
        favicons: true,
        firefox: PROD ? true : false,
        windows: PROD ? true : false,
        yandex: PROD ? true : false
      }
    }))
    .pipe(dest(assets__favicons__dest))
}

function copy__fonts () {
  return src([assets__fonts__src + '**/*.{woff,woff2}'])
    .pipe(gulpif(DEBUG, debug({ title: '## FONTS:' })))
    .pipe(dest(assets__fonts__dest))
}

// WATCH -------------------------------------------------------------

function watch__assets () {
  // watch(assets__images__src + '**/*.{png,jpg,jpeg,gif}', series(images, reload))
  watch(assets__icons__src + '**/*.svg', series(icons, reload))
  watch(assets__favicons__src + '**/favicon_src.png', series(favicons, reload))
  watch(assets__fonts__src + '**/*.{woff,woff2}', series(fonts, reload))
}

// COMPOSITION -------------------------------------------------------------

// const images = series(clean__images, process__images)
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

// LINT -------------------------------------------------------------

function lint__scripts () {
  return src([scripts__src + 'main.js', snippets__src + '**/script.js'])
    .pipe(gulpif(DEBUG, debug({ title: '## MAIN:' })))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(gulpif(PROD, eslint.failAfterError()))
}

// PROCESS -------------------------------------------------------------

function process__scripts__main () {
  return src([scripts__src + 'main.js', snippets__src + '**/script.js'], { sourcemaps: !PROD ? true : false })
    .pipe(gulpif(DEBUG, debug({ title: '## MAIN:' })))
    .pipe(concat('main.js'))
    .pipe(gulpif(PROD, uglify()))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(scripts__dest, { sourcemaps: !PROD ? '.' : false }))
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

// LINT -------------------------------------------------------------

function lint__styles () {
  return src([styles__src + '**/*.scss', snippets__src + '**/*.scss'])
    .pipe(gulpif(DEBUG, debug({ title: '## STYLE:' })))
    .pipe(stylelint({ syntax: 'scss', reporters: [{ formatter: 'string', console: true }], failAfterError: PROD ? true : false }))
}

// PROCESS -------------------------------------------------------------

function process__styles () {
  scss.compiler = sass
  return src(styles__src + 'main.scss', { sourcemaps: !PROD ? true : false })
    .pipe(gulpif(DEBUG, debug({ title: '## STYLE:' })))
    .pipe(scss({ outputStyle: PROD ? 'compressed' : 'expanded' }).on('error', scss.logError))
    .pipe(autoprefixer()).pipe(rename({ suffix: '.min' }))
    .pipe(dest(styles__dest, { sourcemaps: !PROD ? '.' : false }))
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
// const ASSET = series(images, icons, favicons, fonts)
const ASSET = series(icons, favicons, fonts)
const LINT = series(lint__logic, lint__styles, lint__scripts)
const RUN = series(browsersync, parallel(watch__logic, watch__assets, watch__styles, watch__scripts))

if (PROD) {
  exports.default = series(LINT, LOGIC, STYLE, ASSET)
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
