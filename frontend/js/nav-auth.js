(function () {
  var API = (typeof API_BASE_URL !== 'undefined' && API_BASE_URL) ||
    (location.hostname === 'localhost' || location.hostname === '127.0.0.1'
      ? 'http://localhost:5000'
      : 'https://safra-claude.onrender.com');

  function renderLoggedIn() {
    document.querySelectorAll('.nav-auth').forEach(function (el) {
      el.innerHTML =
        '<a href="my-bookings.html" class="nav-auth-login">My Bookings</a>' +
        '<a href="#" class="nav-auth-signup" id="navLogoutBtn">Log out</a>';
    });
    document.querySelectorAll('.mobile-menu').forEach(function (el) {
      var login = el.querySelector('a[href="login.html"]');
      var signup = el.querySelector('a[href="signup.html"]');
      if (login) { login.textContent = 'My Bookings'; login.setAttribute('href', 'my-bookings.html'); }
      if (signup) { signup.textContent = 'Log out'; signup.setAttribute('href', '#'); signup.id = 'navLogoutBtnMobile'; }
    });
    document.querySelectorAll('#navLogoutBtn, #navLogoutBtnMobile').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        fetch(API + '/api/auth/logout', { method: 'POST', credentials: 'include' })
          .finally(function () { window.location.href = 'index.html'; });
      });
    });
  }

  fetch(API + '/api/auth/me', { credentials: 'include' })
    .then(function (res) { if (res.ok) renderLoggedIn(); })
    .catch(function () {});
})();
