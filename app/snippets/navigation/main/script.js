var $ = window.jQuery
const { disableBodyScroll, enableBodyScroll } = window.bodyScrollLock

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
    this.$.on('click', '.button--menu', this.toggleMenu)
  }

  resolveElements () {
    this.$menu = $('.menu', this)
  }

  connectedCallback () {
    console.log('### NAVIGATION-MAIN - SCRIPT.JS ###')
  }

  toggleMenu (e) {
    this.$.toggleClass('snippet-isOpen')
    if (this.$.hasClass('snippet-isOpen')) {
      disableBodyScroll(this.$menu.get(0))
    } else {
      enableBodyScroll(this.$menu.get(0))
    }
  }
}

window.customElements.define('navigation-main', NavigationMain, { extends: 'div' })
