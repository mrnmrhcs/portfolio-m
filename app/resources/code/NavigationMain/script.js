import $ from 'jquery'
import Headroom from 'headroom.js'

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
    this.$button = $('[aria-controls]', this)
    this.$content = $('[aria-labelledby]', this)

    this.$menu = $('[data-level="1"]', this)
    this.$items = this.$menu.next()
  }

  connectedCallback () {
    this.$.on('click', '[data-level="1"]', this.runNavigation.bind(this))
    this.$.on('mouseenter', '[data-level="1"]', this.runNavigation.bind(this))
    this.$.on('mouseleave', this.$.get(0), this.runNavigation.bind(this))

    const headroom = new Headroom(this.$.get(0), {
      offset: 100,
      tolerance: 0, // or { down: 0, up: 0 }
      classes: {
        initial: 'headroom',
        pinned: 'headroom-isPinned',
        unpinned: 'headroom-isUnpinned',
        top: 'headroom-isTop',
        notTop: 'headroom-isNotTop',
        bottom: 'headroom-isBottom',
        notBottom: 'headroom-isNotBottom'
      }
    })
    headroom.init()
  }

  runNavigation (e) {
    const target = $(e.currentTarget)
    const targetID = target.attr('aria-controls')
    const targetEvent = e.type

    let selection

    if (targetEvent === 'mouseleave') {
      this.stateHandler(this.$menu, this.$items, 'close')

      return
    }

    if (targetEvent === 'mouseenter') {
      selection = this.$content.filter(`[aria-labelledby="${targetID}"]`)

      this.stateHandler(this.$menu, this.$items, 'close')
      this.stateHandler(target, selection, 'open')

      return
    }

    if (targetEvent === 'click') {
      e.preventDefault()

      selection = this.$content.filter(`[aria-labelledby="${targetID}"]`)

      this.stateHandler(this.$menu, this.$items, 'close')
      this.stateHandler(target, selection, 'open')
    }
  }

  stateHandler (trig, targ, act) {
    if (act === 'open') {
      trig.attr('aria-expanded', 'true')
      targ.attr('aria-hidden', 'false')
    }
    if (act === 'close') {
      trig.attr('aria-expanded', 'false')
      targ.attr('aria-hidden', 'true')
    }
  }
}

window.customElements.define('flynt-navigation-main', NavigationMain, {
  extends: 'nav'
})
