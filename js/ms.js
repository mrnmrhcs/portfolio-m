console.log('MS');

var menuTrigger = document.getElementById('menu');
var menu = document.querySelector('nav');

menuTrigger.addEventListener('click', function(){

  if(menu.classList.contains('is-active')) {

    menu.classList.remove('is-active');
  } else {

    menu.classList.add('is-active');
  }

});
