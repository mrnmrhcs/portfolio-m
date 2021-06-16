module.exports = {
  host: {
    local: 'http://portfolio-m.local.run:8080',
    live: 'http://m.kaimberg.com'
  },
  path: {
    src: 'app/',
    dist: 'dist/',
    assets: 'assets/',
    configs: 'config/',
    resources: 'resources/',
    fonts: 'fonts/',
    icons: 'icons/',
    images: 'images/',
    favicons: 'favicons/',
    templates: 'templates/',
    snippets: 'snippets/'
  },
  vendor: {
    dest: 'dist/',
    head: [
      'node_modules/document-register-element/build/document-register-element.js'
    ],
    src: [
      'node_modules/jquery/dist/jquery.js'
    ]
  }
}
