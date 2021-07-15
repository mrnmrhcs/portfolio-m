class NavigationMain extends window.HTMLElement {
  constructor (...args) {
    const self = super(...args)
    self.init()
    return self
  }

  init () {
    this.$ = $(this)
    this.resolveElements()
  }

  resolveElements () {
    this.$html = $('.app')

    this.$trigger = $('[aria-controls="menu"]', this)
    this.$menu = $('[aria-labelledby="menu"]', this)
  }

  connectedCallback () {
    this.$.on('click', '[aria-controls="menu"]', this.runNavigation.bind(this))
  }

  runNavigation (e) {
    const target = e.currentTarget

    if (target.ariaExpanded === 'true') {
      this.stateHandler('close')
    } else {
      this.stateHandler('open')
    }
  }

  stateHandler (action) {
    if (action === 'open') {
      this.$html.addClass('app_menu')

      this.$trigger.attr('aria-expanded', 'true')
      this.$menu.attr('aria-hidden', 'false')
    }
    if (action === 'close') {
      this.$html.removeClass('app_menu')

      this.$trigger.attr('aria-expanded', 'false')
      this.$menu.attr('aria-hidden', 'true')
    }
  }
}

window.customElements.define('navigation-main', NavigationMain)
