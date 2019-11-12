var $ = window.jQuery

class NavigationMain extends window.HTMLDivElement {
  constructor (...args) {
    const self = super(...args)
    self.init()
    return self
  }

  init () {
    this.$ = $(this)
    this.bindFunctions()
    this.bindEvents()
    this.resolveElements()
  }

  bindFunctions () {
    this.toggleMenu = this.toggleMenu.bind(this)
  }

  bindEvents () {
    this.$.on('click', '.navigation-main__button', this.toggleMenu)
  }

  resolveElements () {
    this.$html = $('.app')
  }

  connectedCallback () {
    console.log('### NAVIGATION-MAIN - SCRIPT.JS ###')
  }

  toggleMenu (e) {
    this.$html.toggleClass('app_menu')
  }
}

window.customElements.define('navigation-main', NavigationMain, { extends: 'div' })
