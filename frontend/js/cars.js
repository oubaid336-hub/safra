let allCars = [];
let myWishlist = [];

function isWishlisted(id) {
  return myWishlist.includes(String(id));
}

function renderCars(list) {
  const grid = document.getElementById('carGrid');

  if (!list.length) {
    grid.innerHTML = '<p class="listing-empty">No cars match your search.</p>';
    return;
  }

  grid.innerHTML = list.map(car => `
    <div class="listing-card-wrap" style="position:relative;">
      <button type="button" class="card-wishlist${isWishlisted(car._id) ? ' is-active' : ''}" data-id="${car._id}" aria-label="Toggle wishlist">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
      </button>
      <a class="listing-card" href="car-detail.html?carId=${car._id}">
        <div class="listing-thumb">
          ${car.photos && car.photos[0]
            ? `<img src="${car.photos[0]}" alt="${escapeHtml(car.title)}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 17h14M5 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm14 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM3 17V9l2-5h14l2 5v8"/></svg>`}
          ${car.year ? `<span class="listing-badge-corner">${car.year}</span>` : ''}
        </div>
        <div class="listing-body">
          <div class="listing-title">${escapeHtml(car.title)}</div>
          <div class="listing-location">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${escapeHtml(car.location)}</span>
          </div>
          <div class="listing-meta">
            ${car.seats ? `<span class="listing-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>${car.seats} seats</span>` : ''}
            ${car.transmission ? `<span class="listing-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 10v6m11-11h-6M7 12H1m17.36-6.36-4.24 4.24m-6.24 6.24-4.24 4.24m14.72 0-4.24-4.24M7.05 7.05 2.81 2.81"/></svg>${escapeHtml(car.transmission)}</span>` : ''}
          </div>
          <div class="listing-footer-row">
            <div class="listing-price">$${car.pricePerDay}<span>per day</span></div>
            <span class="listing-cta">View Details</span>
          </div>
        </div>
      </a>
    </div>
  `).join('');

  grid.querySelectorAll('.card-wishlist').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.dataset.id;
      try {
        const res = await fetch(`${API_BASE_URL}/api/wishlist/${encodeURIComponent(id)}`, {
          method: 'POST',
          credentials: 'include',
        });
        if (res.status === 401) {
          window.location.href = 'login.html?redirect=cars.html';
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        myWishlist = (data.wishlist || []).map(String);
        btn.classList.toggle('is-active', isWishlisted(id));
      } catch (err) {
        console.error('Wishlist toggle failed:', err);
      }
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function applyFilters() {
  const loc = document.getElementById('filterLocation').value.trim().toLowerCase();
  const transmission = document.getElementById('filterTransmission').value;
  const maxPrice = parseFloat(document.getElementById('filterMaxPrice').value);

  const filtered = allCars.filter(c => {
    const matchesLocation = !loc || (c.location || '').toLowerCase().includes(loc);
    const matchesTransmission = !transmission || c.transmission === transmission;
    const matchesMaxPrice = isNaN(maxPrice) || c.pricePerDay <= maxPrice;
    return matchesLocation && matchesTransmission && matchesMaxPrice;
  });

  renderCars(filtered);
}

async function loadMyWishlist() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
    if (!res.ok) return;
    const wishRes = await fetch(`${API_BASE_URL}/api/wishlist`, { credentials: 'include' });
    if (!wishRes.ok) return;
    const data = await wishRes.json();
    const houseIds = (data.houses || []).map(h => String(h._id));
    const carIds = (data.cars || []).map(c => String(c._id));
    myWishlist = [...houseIds, ...carIds];
  } catch (err) {
    myWishlist = [];
  }
}

async function loadCars() {
  const grid = document.getElementById('carGrid');
  try {
    await loadMyWishlist();
    const res = await fetch(`${API_BASE_URL}/api/cars`);
    if (!res.ok) throw new Error(`Server responded with ${res.status}`);
    allCars = await res.json();

    if (!allCars.length) {
      grid.innerHTML = '<p class="listing-empty">No cars available right now.</p>';
      return;
    }

    renderCars(allCars);

    document.getElementById('filterLocation').addEventListener('input', applyFilters);
    document.getElementById('filterTransmission').addEventListener('change', applyFilters);
    document.getElementById('filterMaxPrice').addEventListener('input', applyFilters);
  } catch (err) {
    console.error('Failed to load cars:', err);
    grid.innerHTML = '<p class="listing-error">Could not load cars right now.</p>';
  }
}

loadCars();
