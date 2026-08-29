document.getElementById('year').textContent = new Date().getFullYear();

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
});

const form = document.getElementById('consultation-form');
const message = document.getElementById('form-message');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  message.textContent = 'Formulario preparado. En el siguiente paso lo conectaremos a tu correo o WhatsApp para recibir solicitudes reales.';
});
