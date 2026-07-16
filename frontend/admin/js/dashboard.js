// admin/js/dashboard.js - D2: Admin Dashboard
//
// DESIGN NOTE: GET /api/admin/dashboard is a CONFIRMED, already-tested
// route (adminRoutes.js + live Phase A testing), but its exact response
// SHAPE - the actual field names for user count, listing count, pending
// bookings, etc. - has never been read from adminController.js. Rather
// than guess field names and risk this page silently showing blank/
// undefined values if the guess is wrong, this renders whatever keys
// the response actually contains, formatted nicely. This means it
// works correctly today no matter what the real shape turns out to be,
// with zero follow-up patch needed once adminController.js gets pasted
// for confirmation later.
//
// This same fetch call also acts as the page's auth gate: a 401/403
// here means "not a valid admin session," full stop - same principle
// as D1's login flow, the backend requireAdmin check is the real
// security boundary, this page just reacts to it.

(function () {
  const statusBanner = document.getElementById('statusBanner');
  const loadingMsg = document.getElementById('loadingMsg');
  const emptyMsg = document.getElementById('emptyMsg');
  const statsGrid = document.getElementById('statsGrid');
  const logoutBtn = document.getElementById('logoutBtn');

  function showError(text) {
    statusBanner.textContent = text;
    statusBanner.classList.add('show');
  }

  // Turns "pendingBookingsCount" into "Pending Bookings Count"
  function formatLabel(key) {
    const withSpaces = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
    return withSpaces
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function renderStats(data) {
    statsGrid.innerHTML = '';
    const keys = Object.keys(data || {});

    if (keys.length === 0) {
      emptyMsg.style.display = 'block';
      return;
    }

    keys.forEach((key) => {
      const value = data[key];

      if (isPlainObject(value)) {
        const groupCard = document.createElement('div');
        groupCard.className = 'stat-card nested';

        const groupLabel = document.createElement('div');
        groupLabel.className = 'stat-label group-label';
        groupLabel.textContent = formatLabel(key);
        groupCard.appendChild(groupLabel);

        Object.keys(value).forEach((subKey) => {
          const subWrap = document.createElement('div');
          const subValue = document.createElement('div');
          subValue.className = 'stat-value';
          subValue.style.fontSize = '22px';
          subValue.textContent = value[subKey];
          const subLabel = document.createElement('div');
          subLabel.className = 'stat-label';
          subLabel.textContent = formatLabel(subKey);
          subWrap.appendChild(subValue);
          subWrap.appendChild(subLabel);
          groupCard.appendChild(subWrap);
        });

        statsGrid.appendChild(groupCard);
        return;
      }

      if (Array.isArray(value)) {
        const card = document.createElement('div');
        card.className = 'stat-card';
        const valEl = document.createElement('div');
        valEl.className = 'stat-value';
        valEl.textContent = value.length;
        const labelEl = document.createElement('div');
        labelEl.className = 'stat-label';
        labelEl.textContent = formatLabel(key) + ' (list)';
        card.appendChild(valEl);
        card.appendChild(labelEl);
        statsGrid.appendChild(card);
        return;
      }

      const card = document.createElement('div');
      card.className = 'stat-card';
      const valEl = document.createElement('div');
      valEl.className = 'stat-value';
      valEl.textContent = value;
      const labelEl = document.createElement('div');
      labelEl.className = 'stat-label';
      labelEl.textContent = formatLabel(key);
      card.appendChild(valEl);
      card.appendChild(labelEl);
      statsGrid.appendChild(card);
    });
  }

  async function loadDashboard() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
        method: 'GET',
        credentials: 'include'
      });

      if (res.status === 401 || res.status === 403) {
        window.location.href = 'login.html';
        return;
      }

      if (!res.ok) {
        loadingMsg.style.display = 'none';
        showError('Something went wrong loading the dashboard. Please try again.');
        return;
      }

      const data = await res.json();
      loadingMsg.style.display = 'none';
      renderStats(data);

    } catch (err) {
      console.error('Dashboard load failed:', err);
      loadingMsg.style.display = 'none';
      showError('Something went wrong loading the dashboard. Please try again.');
    }
  }

  logoutBtn.addEventListener('click', async function () {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      window.location.href = 'login.html';
    }
  });

  loadDashboard();
})();
