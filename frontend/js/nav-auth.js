(function () {
  var API = (typeof API_BASE_URL !== 'undefined' && API_BASE_URL) ||
    (location.hostname === 'localhost' || location.hostname === '127.0.0.1'
      ? 'http://localhost:5000'
      : 'https://safra-vv3z.onrender.com');

  function renderLoggedInDesktop(user) {
    document.querySelectorAll('.nav-auth').forEach(function (el) {
      el.innerHTML =
        '<div class="nav-user">' +
          '<button type="button" class="nav-user-trigger" id="navUserTrigger">' +
            '<span class="nav-user-name">' + user.name + '</span>' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>' +
          '</button>' +
          '<div class="nav-user-menu" id="navUserMenu">' +
            '<a href="wishlist.html">Wishlist</a>' +
            '<a href="my-bookings.html">My Bookings</a>' +
            '<a href="#" id="navLogoutBtn">Log out</a>' +
          '</div>' +
        '</div>';
    });

    var trigger = document.getElementById('navUserTrigger');
    var menu = document.getElementById('navUserMenu');
    if (trigger && menu) {
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        menu.classList.toggle('open');
      });
      document.addEventListener('click', function () {
        menu.classList.remove('open');
      });
    }
  }

  function renderLoggedInMobile() {
    document.querySelectorAll('.mobile-menu').forEach(function (el) {
      var login = el.querySelector('a[href="login.html"]');
      var signup = el.querySelector('a[href="signup.html"]');
      if (login && !el.querySelector('a[href="wishlist.html"]')) {
        var wishlistLink = document.createElement('a');
        wishlistLink.setAttribute('href', 'wishlist.html');
        wishlistLink.textContent = 'Wishlist';
        login.parentNode.insertBefore(wishlistLink, login);
      }
      if (login) { login.textContent = 'My Bookings'; login.setAttribute('href', 'my-bookings.html'); }
      if (signup) { signup.textContent = 'Log out'; signup.setAttribute('href', '#'); signup.id = 'navLogoutBtnMobile'; }
    });
  }

  function wireLogout() {
    document.querySelectorAll('#navLogoutBtn, #navLogoutBtnMobile').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        fetch(API + '/api/auth/logout', { method: 'POST', credentials: 'include' })
          .finally(function () { window.location.href = 'index.html'; });
      });
    });
  }

  fetch(API + '/api/auth/me', { credentials: 'include' })
    .then(function (res) { return res.ok ? res.json() : null; })
    .then(function (data) {
      if (data && data.user && data.user.name) {
        renderLoggedInDesktop(data.user);
        renderLoggedInMobile();
        wireLogout();
      }
    })
    .catch(function () {});
})();
