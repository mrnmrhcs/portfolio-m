module.exports = {
  // accessibility: true,
  // adaptiveHeight: false,
  // autoplay: true,
  // autoplaySpeed: 5000,
  // arrows: true,
  // asNavFor: null,
  // appendArrows: $(element),
  // appendDots: $(element),
  // prevArrow: '',
  // nextArrow: '',
  // centerMode: false,
  // centerPadding: '50px',
  // cssEase: 'ease',
  // customPaging: null,
  dots: true,
  // dotsClass: 'slick-dots',
  // draggable: true,
  // fade: false,
  // focusOnSelect: false,
  // easing: 'linear',
  edgeFriction: 0.5,
  infinite: true,
  // initialSlide: 0,
  // lazyLoad: 'ondemand',
  // mobileFirst: false,
  pauseOnFocus: false,
  pauseOnHover: false,
  // pauseOnDotsHover: false,
  // respondTo: 'window',
  // rows: 1,
  // slide: '',
  // slidesPerRow: 1,
  // slidesToShow: 1,
  // slidesToScroll: 1,
  speed: 400,
  // swipe: false,
  // swipeToSlide: false,
  // touchMove: true,
  touchThreshold: 8,
  // useCSS: true,
  // useTransform: true,
  // variableWidth: false,
  // vertical: false,
  // verticalSwiping: false,
  // rtl: false,
  // waitForAnimate: true,
  // zIndex: 1000
  responsive: [
    {
      breakpoint: 1025,
      settings: {
        touchThreshold: 16,
        speed: 350,
        swipe: true
      }
    },
    {
      breakpoint: 576,
      settings: {
        touchThreshold: 24,
        speed: 275,
        swipe: true
      }
    }
  ]
}
