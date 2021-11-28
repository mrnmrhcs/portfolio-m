////////////////////////////////////////////////////////////////////////////////
// GULP
////////////////////////////////////////////////////////////////////////////////

import gulp from 'gulp'

import autoprefixer from 'gulp-autoprefixer'
import babel from 'gulp-babel'
import cache from 'gulp-cache'
import debug from 'gulp-debug'
import concat from 'gulp-concat'
import terser from 'gulp-terser'
import gulpif from 'gulp-if'
import gs from 'gulp-sass'
import ss from 'sass'
import bs from 'browser-sync'
import del from 'del'
import favicon from 'favicons'
import imagemin, { gifsicle, mozjpeg, optipng, svgo } from 'gulp-imagemin'
import { config } from './config.js'

const { task, series, parallel, src, dest, watch } = gulp

////////////////////////////////////////////////////////////////////////////////
// BROWSERSYNC
////////////////////////////////////////////////////////////////////////////////

const instance = bs.create()

const server = () => instance.init({
  host: config.host.local,
  proxy: config.host.local,
  logPrefix: process.env.npm_package_name,
  logLevel: process.env.DEBUG === 'True' ? 'debug' : 'info',
  logConnections: process.env.DEBUG === 'True' ? true : false,
  logFileChanges: process.env.DEBUG === 'True' ? true : false,
  notify: false,
  ghostMode: false,
  reloadDelay: 320,
  injectChanges: false,
  online: false,
  open: true,
  ui: false
})

const reload = (done) => {
  instance.reload()
  done()
}

////////////////////////////////////////////////////////////////////////////////
// VENDOR
////////////////////////////////////////////////////////////////////////////////

// CLEAN -------------------------------------------------------------

const clean__vendor = () => del(config.vendor.dest + 'vendor.js')

// PROCESS -------------------------------------------------------------

const process__vendor = () => {
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

const clean__scripts__main = () => del(config.path.dist + '{main,main-legacy}.js')

// PROCESS -------------------------------------------------------------

const process__scripts__legacy = () => {
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

const process__scripts__modern = () => {
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

const watch__scripts = () => {
  watch([config.path.src + config.path.resources + 'main.js', config.path.src + config.path.snippets + '**/script.js'], series(scripts__main, reload))
}

// COMPOSITION -------------------------------------------------------------

const scripts__main = series(clean__scripts__main, process__scripts__legacy, process__scripts__modern)

////////////////////////////////////////////////////////////////////////////////
// STYLE
////////////////////////////////////////////////////////////////////////////////

// CLEAN -------------------------------------------------------------

const clean__styles = () => del(config.path.dist + '*.{css,css.map}')

// PROCESS -------------------------------------------------------------

const process__styles = () => {
  const scss = gs(ss)
  return src(config.path.src + config.path.resources + 'main.scss', { sourcemaps: !process.env.NODE_ENV === 'production' ? (!process.env.NODE_ENV === 'staging' ? true : false) : false })
    .pipe(gulpif(process.env.DEBUG === 'True', debug({ title: '## STYLE:' })))
    .pipe(scss({ outputStyle: process.env.NODE_ENV === 'production' ? 'compressed' : 'expanded' }).on('error', scss.logError))
    .pipe(autoprefixer())
    .pipe(dest(config.path.dist, { sourcemaps: !process.env.NODE_ENV === 'production' ? (!process.env.NODE_ENV === 'staging' ? '.' : false) : false }))
    .pipe(instance.reload({ stream: true }))
}

// WATCH -------------------------------------------------------------

const watch__styles = () => {
  watch(config.path.src + config.path.snippets + '**/*.scss', series(styles, reload))
  watch(config.path.src + config.path.resources + '**/*.scss', series(styles, reload))
}

// COMPOSITION -------------------------------------------------------------

const styles = series(clean__styles, process__styles)

////////////////////////////////////////////////////////////////////////////////
// SEO
////////////////////////////////////////////////////////////////////////////////

// CLEAN -------------------------------------------------------------

const clean__robots = () => del(config.path.dist + 'robots.txt')

// COPY -------------------------------------------------------------

const copy__robots = () => {
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

const clean__index = () => del(config.path.dist + 'index.php')
const clean__htaccess = () => del(config.path.dist + '.htaccess')
const clean__snippets = () => del(config.path.dist + config.path.snippets)
const clean__templates = () => del(config.path.dist + config.path.templates)

// COPY -------------------------------------------------------------

const copy__htaccess = () => {
  return src(config.path.src + '.htaccess')
    .pipe(gulpif(process.env.DEBUG === 'True', debug({ title: '## HTACCESS:' })))
    .pipe(dest(config.path.dist))
}

const copy__index = () => {
  return src(config.path.src + 'index.php')
    .pipe(gulpif(process.env.DEBUG === 'True', debug({ title: '## INDEX:' })))
    .pipe(dest(config.path.dist))
}

const copy__snippets = () => {
  return src(config.path.src + config.path.snippets + '**/*.php')
    .pipe(gulpif(process.env.DEBUG === 'True', debug({ title: '## SNIPPETS:' })))
    .pipe(dest(config.path.dist + config.path.snippets))
}

const copy__templates = () => {
  return src(config.path.src + config.path.templates + '**/*.php')
    .pipe(gulpif(process.env.DEBUG === 'True', debug({ title: '## TEMPLATES:' })))
    .pipe(dest(config.path.dist + config.path.templates))
}

// WATCH -------------------------------------------------------------

const watch__logic = () => {
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

const clean__images = () => del(config.path.dist + config.path.assets + config.path.images)
const clean__icons = () => del(config.path.dist + config.path.assets + config.path.icons)
const clean__favicons = () => del(config.path.dist + config.path.assets + config.path.favicons)
const clean__fonts = () => del(config.path.dist + config.path.assets + config.path.fonts)

// PROCESS -------------------------------------------------------------

const process__images = () => {
  return src(config.path.src + config.path.resources + config.path.assets + config.path.images + '**/*.{png,jpg,jpeg,gif}')
    .pipe(gulpif(process.env.DEBUG === 'True', debug({ title: '## IMAGES:' })))
    .pipe(cache(imagemin([
      gifsicle({ interlaced: true }),
      mozjpeg({ quality: 75, progressive: true }),
      optipng({ optimizationLevel: 7 })
    ])))
    .pipe(dest(config.path.dist + config.path.assets + config.path.images))
}

const process__icons = () => {
  return src(config.path.src + config.path.resources + config.path.assets + config.path.icons + '**/*.svg')
    .pipe(gulpif(process.env.DEBUG === 'True', debug({ title: '## ICONS:' })))
    .pipe(cache(imagemin([
      svgo({
        plugins: [
          {
            name: 'removeTitle',
            active: true
          },
          {
            name: 'removeViewBox',
            active: true
          },
          {
            name: 'cleanupIDs',
            active: true
          }
        ],
        verbose: process.env.DEBUG === 'True' ? true : false
      })
    ])))
    .pipe(dest(config.path.dist + config.path.assets + config.path.icons))
}

const process__favicons = () => {
  return src(config.path.src + config.path.resources + config.path.assets + config.path.favicons + 'favicon_src.png')
    .pipe(gulpif(process.env.DEBUG === 'True', debug({ title: '## FAVICON:' })))
    .pipe(favicon.stream({
      path: '.  ./../../' + config.path.assets + config.path.favicons,
      appName: 'Portfolio — Marian Schramm',
      appShortName: 'Portfolio-M',
      appDescription: 'Portfolio Website',
      url: config.host.live,
      version: process.env.npm_package_version,
      developerName: 'Marian Schramm',
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
        android: process.env.NODE_ENV === 'development' ? true : true,
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

const copy__fonts = () => {
  return src(config.path.src + config.path.resources + config.path.assets + config.path.fonts + '**/*.{woff,woff2}')
    .pipe(gulpif(process.env.DEBUG === 'True', debug({ title: '## FONTS:' })))
    .pipe(dest(config.path.dist + config.path.assets + config.path.fonts))
}

// WATCH -------------------------------------------------------------

const watch__assets = () => {
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

const WATCH = parallel(server, parallel(watch__logic, watch__assets, watch__styles, watch__scripts))
const LOGIC = series(parallel(index, htaccess, snippets, templates), vendor)
const STYLE = parallel(styles, scripts__main)
const ASSET = series(images, icons, favicons, fonts)
const SEO = series(robots)
const RUN = series(LOGIC, STYLE, ASSET, process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging' ? SEO : WATCH)

export default RUN

////////////////////////////////////////////////////////////////////////////////
// HELPER
////////////////////////////////////////////////////////////////////////////////

task('clear', () => cache.clearAll())
