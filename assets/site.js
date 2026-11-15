// Phone menu toggle for the site navigation.
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    menu.classList.toggle('open', !open);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
      toggle.focus();
    }
  });
});
