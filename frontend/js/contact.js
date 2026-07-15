// contact.js - handles the public Contact form (C11)
//
// ASSUMPTION (flagged per project convention): POSTs to
// `${API_BASE_URL}/api/contact`. contactController.js / contactRoutes.js
// content has never been read in this project, so this path is inferred
// from the same naming pattern used elsewhere (e.g. /api/faq), not
// confirmed. If it turns out to be something else, only the URL string
// below needs to change - nothing else in this file depends on it.
//
// No login is required for this form (ContactMessage.js has no userId
// field), so this does NOT send credentials: 'include'.

(function () {
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const banner = document.getElementById('formBanner');

  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const messageError = document.getElementById('messageError');

  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function showBanner(type, text) {
    banner.textContent = text;
    banner.className = 'form-banner show ' + type;
  }

  function clearFieldErrors() {
    nameError.textContent = '';
    emailError.textContent = '';
    messageError.textContent = '';
  }

  function validate() {
    clearFieldErrors();
    let valid = true;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    if (!name) {
      nameError.textContent = 'Please enter your name.';
      valid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      emailError.textContent = 'Please enter your email.';
      valid = false;
    } else if (!emailPattern.test(email)) {
      emailError.textContent = 'Please enter a valid email address.';
      valid = false;
    }

    if (!message) {
      messageError.textContent = 'Please enter a message.';
      valid = false;
    } else if (message.length < 10) {
      messageError.textContent = 'Message should be at least 10 characters.';
      valid = false;
    }

    return valid ? { name, email, message } : null;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    banner.className = 'form-banner';

    const data = validate();
    if (!data) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        showBanner('success', "Thanks - your message has been sent. We'll get back to you soon.");
        form.reset();
      } else if (res.status === 400) {
        showBanner('error', 'Please check your details and try again.');
      } else {
        showBanner('error', 'Something went wrong sending your message. Please try again in a moment.');
      }
    } catch (err) {
      console.error('Contact form submit failed:', err);
      showBanner('error', 'Something went wrong sending your message. Please try again in a moment.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
})();
