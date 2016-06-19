console.log('######## MS ########');

var menuTrigger = document.getElementById('menu');
var header = document.querySelector('header');

var navs = document.querySelectorAll('[data-route]');

menuTrigger.addEventListener('click', function(){

  if(header.classList.contains('is-active')) {

    header.classList.remove('is-active');
  } else {

    header.classList.add('is-active');
  }

});
