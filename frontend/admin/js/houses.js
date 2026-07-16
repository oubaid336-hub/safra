// admin/js/houses.js - D3: Manage houses/cars (approve/reject only)
//
// SCOPE NOTE: only approve/reject are wired up. Edit and delete are NOT
// built - no admin route for either has ever been confirmed to exist.
// The confirmed admin routes for listings are exactly:
//   GET /api/admin/houses
//   PUT /api/admin/houses/:id/approve
//   PUT /api/admin/houses/:id/reject
//   GET /api/admin/cars
//   PUT /api/admin/cars/:id/approve
//   PUT /api/admin/cars/:id/reject
// all tested live in Phase A12 (houses only - cars not separately
// re-tested the same way, worth keeping in mind).
//
// House.js fields (confirmed): title, location, pricePerNight, photos,
// rooms, bathrooms, capacity, status.
// Car.js fields (confirmed): title, location, pricePerDay, photos,
// seats, transmission, fuelType, status.

(function () {
  const statusBanner = document.getElementById('statusBanner');
  const loadingMsg = document.getElementById('loadingMsg');
  const logoutBtn = document.getElementById('logoutBtn');

  const housesSection = document.getElementById('housesSection');
  const housesList = document.getElementById('housesList');
  const housesEmpty = document.getElementById('housesEmpty');

  const carsSection = document.getElementById('carsSection');
  const carsList = document.getElementById('carsList');
  const carsEmpty = document.getElementById('carsEmpty');

  function showError(text) {
    statusBanner.textContent = text;
    statusBanner.classList.add('show');
  }

  function clearError() {
    statusBanner.classList.remove('show');
  }

  function sortByStatus(items) {
    const order = { pending: 0, approved: 1, rejected: 2 };
    return [...items].sort((a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3));
  }

  function buildCard(item, type) {
    const card = document.createElement('div');
    card.className = 'listing-card';

    const thumb = document.createElement('div');
    thumb.className = 'listing-thumb';
    if (item.photos && item.photos.length > 0) {
      const img = document.createElement('img');
      img.src = item.photos[0];
      img.alt = item.title || 'Listing photo';
      thumb.appendChild(img);
    } else {
      thumb.textContent = 'No Photo';
    }

    const info = document.createElement('div');
    info.className = 'listing-info';

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = item.title || '(untitled)';

    const meta = document.createElement('div');
    meta.className = 'meta';
    if (type === 'house') {
      const price = item.pricePerNight != null ? `$${item.pricePerNight}/night` : 'price n/a';
      const rooms = item.rooms != null ? `${item.rooms} rooms` : null;
      const capacity = item.capacity != null ? `sleeps ${item.capacity}` : null;
      meta.textContent = [item.location, price, rooms, capacity].filter(Boolean).join(' - ');
    } else {
      const price = item.pricePerDay != null ? `$${item.pricePerDay}/day` : 'price n/a';
      const seats = item.seats != null ? `${item.seats} seats` : null;
      const extras = [item.transmission, item.fuelType].filter(Boolean).join('/');
      meta.textContent = [item.location, price, seats, extras || null].filter(Boolean).join(' - ');
    }

    info.appendChild(title);
    info.appendChild(meta);

    const badge = document.createElement('span');
    badge.className = 'status-badge ' + (item.status || 'pending');
    badge.textContent = item.status || 'pending';

    const actions = document.createElement('div');
    actions.className = 'listing-actions';

    const approveBtn = document.createElement('button');
    approveBtn.className = 'approve-btn';
    approveBtn.textContent = 'Approve';
    approveBtn.disabled = item.status === 'approved';

    const rejectBtn = document.createElement('button');
    rejectBtn.className = 'reject-btn';
    rejectBtn.textContent = 'Reject';
    rejectBtn.disabled = item.status === 'rejected';

    approveBtn.addEventListener('click', () => setStatus(type, item._id, 'approve', card));
    rejectBtn.addEventListener('click', () => setStatus(type, item._id, 'reject', card));

    actions.appendChild(approveBtn);
    actions.appendChild(rejectBtn);

    card.appendChild(thumb);
    card.appendChild(info);
    card.appendChild(badge);
    card.appendChild(actions);

    return card;
  }

  async function setStatus(type, id, action, cardEl) {
    const buttons = cardEl.querySelectorAll('button');
    buttons.forEach((b) => (b.disabled = true));
    clearError();

    const endpointType = type === 'house' ? 'houses' : 'cars';

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/${endpointType}/${id}/${action}`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (res.status === 401 || res.status === 403) {
        window.location.href = 'login.html';
        return;
      }

      if (!res.ok) {
        showError('Something went wrong updating that listing. Please try again.');
        buttons.forEach((b) => (b.disabled = false));
        return;
      }

      await loadAll();

    } catch (err) {
      console.error(`Failed to ${action} ${type} ${id}:`, err);
      showError('Something went wrong updating that listing. Please try again.');
      buttons.forEach((b) => (b.disabled = false));
    }
  }

  function renderList(items, listEl, emptyEl, sectionEl, type) {
    listEl.innerHTML = '';
    sectionEl.style.display = 'block';

    if (!items || items.length === 0) {
      emptyEl.style.display = 'block';
      return;
    }
    emptyEl.style.display = 'none';

    sortByStatus(items).forEach((item) => {
      listEl.appendChild(buildCard(item, type));
    });
  }

  async function fetchJson(url) {
    const res = await fetch(url, { method: 'GET', credentials: 'include' });
    if (res.status === 401 || res.status === 403) {
      window.location.href = 'login.html';
      return null;
    }
    if (!res.ok) {
      throw new Error(`Request to ${url} failed with status ${res.status}`);
    }
    return res.json();
  }

  async function loadAll() {
    try {
      const [houses, cars] = await Promise.all([
        fetchJson(`${API_BASE_URL}/api/admin/houses`),
        fetchJson(`${API_BASE_URL}/api/admin/cars`)
      ]);

      if (houses === null || cars === null) return;

      loadingMsg.style.display = 'none';
      renderList(houses, housesList, housesEmpty, housesSection, 'house');
      renderList(cars, carsList, carsEmpty, carsSection, 'car');

    } catch (err) {
      console.error('Failed to load listings:', err);
      loadingMsg.style.display = 'none';
      showError('Something went wrong loading listings. Please try again.');
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

  loadAll();
})();
