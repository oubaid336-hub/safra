// admin/js/login.js - D1: Admin login page
//
// Design note: this reuses the SAME POST /api/auth/login endpoint the
// regular customer login.html already calls (per the plan: "reuses Part
// 4 auth"). There is no separate admin-only login route.
//
// We do NOT trust the login response body to tell us whether this user
// is an admin - its exact shape was never confirmed in any chat, so
// guessing at a field name there would be exactly the kind of unverified
// assumption this project tries to avoid. Instead, right after login
// succeeds (cookie is set), we call the CONFIRMED admin-only route
// GET /api/admin/dashboard. If that 200s, they're really an admin and we
// redirect in. If it 403s, they're logged in as themselves but not an
// admin - same as the reminder in the plan: the page is just a friendly
// gate, the real security boundary is requireAdmin on the backend.

(function () {
  const form = document.getElementById('adminLoginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const submitBtn = document.getElementById('submitBtn');
  const banner = document.getElementById('formBanner');

  checkAlreadyAdmin();

  async function checkAlreadyAdmin() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
        method: 'GET',
        credentials: 'include'
      });
      if (res.ok) {
        window.location.href = 'dashboard.html';
      }
    } catch (err) {
      // not logged in / network error - just show the login form as normal
    }
  }

  function showError(text) {
    banner.textContent = text;
    banner.className = 'form-banner show error';
  }

  function clearBanner() {
    banner.className = 'form-banner';
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearBanner();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showError('Please enter your email and password.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Checking...';

    try {
      const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!loginRes.ok) {
        showError('Invalid email or password.');
        return;
      }

      const dashboardRes = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
        method: 'GET',
        credentials: 'include'
      });

      if (dashboardRes.status === 403) {
        showError("This account doesn't have admin access.");
        return;
      }

      if (!dashboardRes.ok) {
        showError('Something went wrong. Please try again.');
        return;
      }

      window.location.href = 'dashboard.html';

    } catch (err) {
      console.error('Admin login failed:', err);
      showError('Something went wrong. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Log In';
    }
  });
})();

