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

const tabs = document.querySelectorAll('.legal-tab');
const panels = document.querySelectorAll('.legal-panel');

function openLegalPanel(id, allowClose = true) {
  const targetPanel = document.getElementById(id);
  const isOpen = targetPanel && targetPanel.classList.contains('active');

  tabs.forEach(t => t.classList.remove('active'));
  panels.forEach(p => p.classList.remove('active'));

  if (!(allowClose && isOpen)) {
    const targetTab = [...tabs].find(t => t.dataset.target === id);
    if (targetTab) targetTab.classList.add('active');
    if (targetPanel) targetPanel.classList.add('active');
  }
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => openLegalPanel(tab.dataset.target, true));
});

document.querySelectorAll('[data-open-legal]').forEach(link => {
  link.addEventListener('click', () => {
    openLegalPanel(link.dataset.openLegal, false);
    setTimeout(() => {
      document.getElementById('cumplimiento').scrollIntoView({
        behavior: 'smooth'
      });
    }, 20);
  });
});

const form = document.getElementById('consultation-form');
const message = document.getElementById('form-message');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const submitButton = form.querySelector('button[type="submit"]');

  const nombre = form.elements.nombre.value.trim();
  const email = form.elements.email.value.trim();
  const tema = form.elements.tema.value.trim();
  const mensaje = form.elements.mensaje.value.trim();

  message.textContent = 'Enviando consulta...';
  submitButton.disabled = true;

  try {
    const response = await fetch('/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre,
        email,
        tema,
        mensaje
      })
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(
        result.error || 'No se ha podido enviar la consulta.'
      );
    }

    message.textContent =
      'Consulta enviada correctamente. Nos pondremos en contacto contigo lo antes posible.';

    form.reset();

  } catch (error) {
    console.error('Error al enviar la consulta:', error);

    message.textContent =
      'No se ha podido enviar la consulta. Por favor, inténtalo de nuevo o escríbenos directamente a info@laboralclave.com.';
  } finally {
    submitButton.disabled = false;
  }
});

const banner = document.getElementById('cookie-banner');
const consent = localStorage.getItem('laboralclave_cookie_choice');

if (!consent) {
  banner.classList.add('show');
}

document.getElementById('accept-cookies').addEventListener('click', () => {
  localStorage.setItem('laboralclave_cookie_choice', 'accepted');
  banner.classList.remove('show');
});

document.getElementById('reject-cookies').addEventListener('click', () => {
  localStorage.setItem('laboralclave_cookie_choice', 'rejected');
  banner.classList.remove('show');
});
