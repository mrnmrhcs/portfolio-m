class NavigationMain extends window.HTMLDivElement {
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
    this.$menu = $('[aria-labelledby="menu"]', this)
    this.$trigger = $('[aria-controls="menu"]', this)
  }

  connectedCallback () {
    this.$.on('click', '[aria-controls="menu"]', this.runTrigger.bind(this))
  }

  runTrigger (e) {
    const target = e.currentTarget

    if (target.ariaExpanded === 'true') {
      this.$trigger.attr('aria-expanded', 'false')
      this.$menu.attr('aria-hidden', 'true')
    } else {
      this.$trigger.attr('aria-expanded', 'true')
      this.$menu.attr('aria-hidden', 'false')
    }

    this.$html.toggleClass('app_menu')
  }
}

window.customElements.define('navigation-main', NavigationMain, { extends: 'div' })
