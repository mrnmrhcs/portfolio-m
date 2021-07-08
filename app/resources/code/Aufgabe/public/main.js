class NavigationCategory extends window.HTMLElement {
  constructor () {
    super()

    const triggers = Array.from(this.querySelectorAll('[aria-controls|="menu"]'))
    const menu = this.querySelector('[aria-labelledby="menu"]')
    const tabs = Array.from(this.querySelectorAll('[aria-controls|="tab"]'))
    const sections = Array.from(this.querySelectorAll('[aria-labelledby|="tab"]'))

    triggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        runTriggers(e)
      })
    })

    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        runTabs(e)
      })
    })

    function runTriggers (e) {
      const targetCurrent = e.currentTarget

      if (targetCurrent.ariaExpanded === 'true') {
        triggers.forEach( trigger => trigger.setAttribute('aria-expanded', 'false') )
        menu.setAttribute('aria-hidden', 'true')
      } else {
        triggers.forEach( trigger => trigger.setAttribute('aria-expanded', 'true') )
        menu.setAttribute('aria-hidden', 'false')
      }
    }

    function runTabs (e) {
      const targetCurrent = e.currentTarget
      const targetID = targetCurrent.attributes['aria-controls'].value
      const targetSection = sections.find( item => item.attributes['aria-labelledby'].value === targetID )

      if (targetCurrent.ariaExpanded === 'true') {
        return
      }

      tabs.forEach( tab => tab.setAttribute('aria-expanded', 'false') )
      sections.forEach( section => section.setAttribute('aria-hidden', 'true') )
      targetCurrent.setAttribute('aria-expanded', 'true')
      targetSection.setAttribute('aria-hidden', 'false')
    }
  }
}

window.customElements.define('navigation-category', NavigationCategory)
