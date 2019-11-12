module.exports = {
  host: {
    local: 'http://portfolio-m.local.run:8080',
    live: 'https://m.kaimberg.com'
  },
  path: {
    root_src: 'app',
    root_dist: 'dist',
    root_public: 'dist',
    assets: 'assets',
    configs: 'config',
    resources: 'resources',
    fonts: 'fonts',
    icons: 'icons',
    images: 'images',
    favicons: 'favicons',
    templates: 'templates',
    snippets: 'snippets',
    scripts: 'dist',
    styles: 'dist'
  },
  vendor: {
    dest: 'dist',
    head: [
      'node_modules/document-register-element/build/document-register-element.js'
    ],
    src: [
      'node_modules/jquery/dist/jquery.js'
    ]
  }
}
