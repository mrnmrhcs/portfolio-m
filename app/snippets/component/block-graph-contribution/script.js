class BlockGraphContribution extends window.HTMLElement {
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
    this.$squares = $('.graph__squares')
  }

  connectedCallback () {
    for (let i = 1; i < 365; i++) {
      const level = Math.floor(Math.random() * 3)
      this.$squares.append(`<li data-level="${level}"></li>`)
    }
  }
}

window.customElements.define('block-graph-contribution', BlockGraphContribution)
