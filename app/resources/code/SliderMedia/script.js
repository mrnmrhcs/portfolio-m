import $ from 'jquery'
import 'file-loader?name=vendor/slick.js!slick-carousel/slick/slick.min'
import 'file-loader?name=vendor/slick.css!csso-loader!slick-carousel/slick/slick.css'
import 'file-loader?name=vendor/lazysizes.js!uglify-loader!lazysizes'
import 'file-loader?name=vendor/rellax.js!uglify-loader!rellax'

import slickConfiguration from './sliderConfiguration.js'

const Rellax = window.Rellax

class SliderMedia extends window.HTMLDivElement {
  constructor (self) {
    self = super(self)
    self.$ = $(self)
    self.sliderInitialised = false
    self.isMobile = false
    self.resolveElements()
    return self
  }

  resolveElements () {
    this.data = JSON.parse(this.$.children('.jsData').eq(0).html())
    this.$sliderMedia = $('.sliderMedia', this)
    this.$slideTitle = $('.slideTitle', this)
    this.$mediaSlides = $('.sliderMedia-slides', this)
    this.$parallaxLayer = $('[data-parallax]', this)
    this.$slides = $('.sliderMedia-slide', this)
    this.$posterImage = $('.posterImage', this)
    this.$playButton = $('.playButton', this)
    this.$videoIframe = $('.video iframe', this)
    this.initSlideProgress()
  }

  connectedCallback () {
    $(window).on('load', this.initComponent.bind(this))
  }

  initComponent () {
    this.setupSlider()
    this.setupRellax()
    this.$videoIframe.on('load', this.onIframeLoad.bind(this))
    this.$.on('click', this.$playButton.selector, this.setIframeSrc.bind(this))
  }

  setupRellax () {
    if (this.$parallaxLayer.length) {
      this.$parallaxLayer.map((i, el) => {
        return new Rellax(el, {
          speed: -3,
          center: false,
          wrapper: '.sliderMedia',
          relativeToWrapper: true,
          round: true,
          vertical: true,
          horizontal: false
        })
      })
    }
  }

  setupSlider () {
    if (this.$slides.length > 1) {
      this.$.on('init', this.$mediaSlides.selector, this.slickInit.bind(this))
      slickConfiguration['prevArrow'] = `<button class="sliderMedia-prevButton" type="button">${this.data.icons.iconLeft}</button>`
      slickConfiguration['nextArrow'] = `<button class="sliderMedia-nextButton" type="button">${this.data.icons.iconRight}</button>`
      this.$mediaSlides.slick(slickConfiguration)
      this.addSlideProgressBarEvents()
      this.startSlideProgressBar()
      this.$.on('beforeChange', this.$mediaSlides.selector, this.unsetIframeSrc.bind(this))
      this.$.on('afterChange', this.$mediaSlides.selector, this.showSlickDots.bind(this))
    } else {
      this.$sliderMedia.removeClass('sliderMedia-isHidden')
    }
  }

  showSlickDots () {
    if (this.$slickDots) {
      this.$slickDots.removeClass('slick-dots-isHidden')
    }
  }

  initSlideProgress () {
    this.$slideProgressBar = $('.slideProgress .bar', this)
    this.slickNavsSelector = '.sliderMedia-prevButton, .sliderMedia-nextButton, .slick-dots'
    this.time = parseInt(this.data.autoplaySpeed) // 5 sec
  }

  addSlideProgressBarEvents () {
    if (this.data.autoplay === '1') {
      this.$.on('click', this.slickNavsSelector, this.startSlideProgressBar.bind(this))

      this.$mediaSlides.on({
        swipe: () => {
          this.isPause = true
        },
        afterChange: () => {
          if (this.isPause === true) {
            this.startSlideProgressBar()
          }
        },
        mouseenter: () => {
          this.isPause = true
        },
        mouseleave: () => {
          this.isPause = false
        }
      })
    }
  }

  startSlideProgressBar () {
    if (this.data.autoplay === '1') {
      this.resetSlideProgressBar()
      this.percentTime = 0
      this.isPause = false
      this.tick = setInterval(this.slideProgressInterval.bind(this), 10)
    }
  }

  slideProgressInterval () {
    if (this.isPause === false) {
      this.percentTime += 1 / (this.time + 0.1)
      this.$slideProgressBar.css({
        width: `${this.percentTime}%`
      })
      if (this.percentTime >= 100) {
        this.$mediaSlides.slick('slickNext')
        this.startSlideProgressBar()
      }
    }
  }

  resetSlideProgressBar () {
    this.$slideProgressBar.css({width: '0%'})
    clearTimeout(this.tick)
  }

  slickInit () {
    this.$sliderMedia.removeClass('sliderMedia-isHidden')
  }

  unsetIframeSrc (e, slick, currentSlide, nextSlide) {
    const $currentSlide = $(slick.$slides[currentSlide])
    $currentSlide.find('iframe').attr('src', '')
  }

  setIframeSrc (e) {
    this.resetSlideProgressBar()
    this.$slickDots = $('.slick-dots', this)
    const $oembedVideo = $(e.target).closest('.oembedVideo')
    const $iframe = $oembedVideo.find('iframe')
    const iframeSrc = $iframe.data('src')
    $iframe.attr('src', iframeSrc)
    this.$playButton.addClass('playButton-showLoader')
  }

  onIframeLoad (e) {
    const $iframe = $(e.target)
    const $oembedVideo = $iframe.closest('.oembedVideo')
    const $video = $oembedVideo.find('.video')
    this.$playButton.removeClass('playButton-showLoader')

    if ($iframe.attr('src')) {
      // show video
      $video.addClass('video-isVisible')
      this.$posterImage.addClass('posterImage-isHidden')
      this.$playButton.addClass('playButton-isHidden')
      this.$slickDots.addClass('slick-dots-isHidden')
      if (this.$slideTitle.hasClass('slideTitle--overlayTitleTop') || this.$slideTitle.hasClass('slideTitle--overlayTitleBottom')) {
        this.$slideTitle.addClass('slideTitle-isHidden')
      }
    } else {
      // hide video
      $video.removeClass('video-isVisible')
      this.$posterImage.removeClass('posterImage-isHidden')
      this.$playButton.removeClass('playButton-isHidden')
      this.$slideTitle.removeClass('slideTitle-isHidden')
    }
  }
}

window.customElements.define('flynt-slider-media', SliderMedia, {extends: 'div'})
