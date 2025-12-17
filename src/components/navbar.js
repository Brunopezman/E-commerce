document.addEventListener('DOMContentLoaded', () => {
  const bar = document.getElementById('bar');
  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarCollapse = document.getElementById('navbarSupportedContent');

  if (navbarToggler && bar) {
    navbarToggler.addEventListener('click', () => {
      bar.classList.toggle('bx-menu');
      bar.classList.toggle('bx-x');
    });
  }

  if (navbarCollapse && bar) {
    navbarCollapse.addEventListener('shown.bs.collapse', () => {
      bar.classList.remove('bx-menu');
      bar.classList.add('bx-x');
    });
    navbarCollapse.addEventListener('hidden.bs.collapse', () => {
      bar.classList.remove('bx-x');
      bar.classList.add('bx-menu');
    });
  }

  const currentFile = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const name = href.split('/').pop();
    if (name === currentFile) link.classList.add('active');
    else link.classList.remove('active');
  });
});
