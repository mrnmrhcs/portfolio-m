import $ from 'jquery'

class AccordionTickets extends window.HTMLDivElement {
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
    this.$tabTriggers = $('[aria-controls|="tab"]', this)
    this.$ticketTriggers = $('[aria-controls|="ticket"]', this)
    this.$tabSections = $('[id|="tab"]', this)
    this.$ticketSections = $('[id|="ticket"]', this)

    this.currentActive = {
      ticketTrigger: this.$ticketTriggers.filter(`[aria-expanded!="false"]`),
      ticketSection: this.$ticketSections.filter(`[aria-hidden!="true"]`),
      tabTrigger: this.$tabTriggers.filter(`[aria-expanded!="false"]`)
    }

    this.currentWindow = {
      width: window.innerWidth
    }
  }

  connectedCallback () {
    this.$.on('click', '[aria-controls]', this.runNavigation.bind(this))
    this.$.on('mouseenter', '[aria-controls|="ticket"]', this.runNavigation.bind(this))
    this.$.on('mouseleave', '[aria-controls|="ticket"]', this.runNavigation.bind(this))
    $(window).on('resize', this.resizeHandler.bind(this))
  }

  resizeHandler (e) {
    let w = e.target.innerWidth

    if (this.currentWindow.width <= '1024' && w >= '1024') {
      this.stateHandler(this.$ticketTriggers, this.$ticketSections, 'close')
      this.stateHandler(this.currentActive.ticketTrigger, this.currentActive.ticketSection, 'open')
    }

    this.currentWindow.width = w
    return this.currentWindow.width
  }

  runNavigation (e) {
    const targetCurrent = $(e.currentTarget)
    const targetID = targetCurrent.attr('aria-controls')
    const targetEvent = e.type
    // TYPE
    const isTicket = (targetID.lastIndexOf('ticket') !== -1) ? 'true' : 'false'
    const isTab = (targetID.lastIndexOf('tab') !== -1) ? 'true' : 'false'
    // STATE
    const isOpen = targetCurrent.attr('aria-expanded')
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches

    let targetSection
    let targetTrigger

    // EXIT
    if (isTab === 'true' && isOpen === 'true') {
      return
    } else if (isDesktop === false && targetEvent === 'mouseenter') {
      return
    } else if (isDesktop === false && targetEvent === 'mouseleave') {
      return
    }

    // TARGET IS TAB
    if (isTab === 'true') {
      targetSection = this.$tabSections.filter(`[id="${targetID}"]`)

      this.stateHandler(this.$tabTriggers, this.$tabSections, 'close')
      this.stateHandler(targetCurrent, targetSection, 'open')
    }

    // TARGET IS TICKET
    if (isTicket === 'true') {
      const tabIndex = targetID.slice(0, -1).toLowerCase()
      const triggerSet = $(`[aria-controls*="${tabIndex}"]`, this)
      const sectionSet = this.$ticketSections.filter(`[id*="${tabIndex}"]`)

      if (targetEvent === 'click' && isDesktop === true) {
        this.currentActive.ticketTrigger.removeClass('trigger--current')
        this.currentActive = {
          ticketTrigger: this.$ticketTriggers.filter(`[aria-expanded!="false"]`),
          ticketSection: this.$ticketSections.filter(`[aria-hidden!="true"]`)
        }
        this.currentActive.ticketTrigger.addClass('trigger--current')
      }

      targetSection = this.$ticketSections.filter(`[id="${targetID}"]`)
      targetTrigger = this.$ticketTriggers.filter(`[aria-controls="${targetID}"]`)

      if (isOpen === 'true') {
        if (isDesktop === false) {
          this.stateHandler(targetTrigger, targetSection, 'close')
        } else {
          if (targetEvent === 'mouseleave') {
            this.stateHandler(triggerSet, sectionSet, 'close')
            this.stateHandler(this.currentActive.ticketTrigger.filter(`[aria-controls*="${tabIndex}"]`), this.currentActive.ticketSection.filter(`[id*="${tabIndex}"]`), 'open')
          }
        }
      } else {
        if (isDesktop === true) {
          this.stateHandler(triggerSet, sectionSet, 'close')

          if (targetEvent === 'click' || targetEvent === 'mouseenter') {
            this.stateHandler(targetTrigger, targetSection, 'open')
          }
        } else {
          if (targetEvent === 'click') {
            this.stateHandler(targetTrigger, targetSection, 'open')
          }
        }
      }

      return this.currentActive
    }
  }

  stateHandler (trigger, targetSection, action) {
    if (action === 'open') {
      trigger.attr('aria-expanded', 'true')
      targetSection.attr('aria-hidden', 'false')
    }
    if (action === 'close') {
      trigger.attr('aria-expanded', 'false')
      targetSection.attr('aria-hidden', 'true')
    }
  }
}

window.customElements.define('flynt-accordion-tickets', AccordionTickets, { extends: 'div' })
