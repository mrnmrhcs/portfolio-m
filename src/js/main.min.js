console.log('### M ###');

// Menu

var site = document.querySelector('html');
var button = document.querySelector('#btn-menu');

button.addEventListener('click', function(){
    site.classList.toggle('open');
});
