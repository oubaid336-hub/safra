let allHouses = [];
let myWishlist = [];
let ratingSummary = {};
let bookingCounts = {};

function isWishlisted(id) {
  return myWishlist.includes(String(id));
}

function renderHouses(list) {
  const grid = document.getElementById('houseGrid');

  if (!list.length) {
    grid.innerHTML = '<p class="listing-empty">No houses match your search.</p>';
    return;
  }

  grid.innerHTML = list.map(house => {
    const rating = ratingSummary[String(house._id)];
    const count = bookingCounts[String(house._id)] ?? 0;
    const isNew = count <= 2;
    const discountedPrice = Math.round(house.pricePerNight * 0.9);
    return `
    <div class="listing-card-wrap" style="position:relative;">
      <button type="button" class="card-wishlist${isWishlisted(house._id) ? ' is-active' : ''}" data-id="${house._id}" aria-label="Toggle wishlist">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
      </button>
      <a class="listing-card" href="house-detail.html?id=${house._id}">
        <div class="listing-thumb">
          ${house.photos && house.photos[0]
            ? `<img src="${house.photos[0]}" alt="${escapeHtml(house.title)}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>`}
          ${isNew ? `<span class="listing-badge-new">NEW &middot; 10% OFF</span>` : ''}
          ${rating ? `<div class="listing-rating-circle"><span class="rc-num">${rating.avgRating}</span><span class="rc-star">&#9733;${rating.count}</span></div>` : ''}
        </div>
        <div class="listing-body">
          <div class="listing-title">${escapeHtml(house.title)}</div>
          <div class="listing-location">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${escapeHtml(house.location)}</span>
          </div>
          <div class="listing-meta">
            ${house.capacity ? `<span class="listing-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>${house.capacity} guests</span>` : ''}
            ${house.rooms ? `<span class="listing-meta-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>${house.rooms} rooms</span>` : ''}
          </div>
          <div class="listing-footer-row">
            <div class="listing-price">
              ${isNew ? `<span class="listing-price-old">$${house.pricePerNight}</span>$${discountedPrice}` : `$${house.pricePerNight}`}
              <span>per night</span>
            </div>
            <span class="listing-cta">View Details</span>
          </div>
        </div>
      </a>
    </div>
  `;
  }).join('');

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
          window.location.href = 'login.html?redirect=houses.html';
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
  const minGuests = parseFloat(document.getElementById('filterMinGuests').value);
  const maxPrice = parseFloat(document.getElementById('filterMaxPrice').value);

  const filtered = allHouses.filter(h => {
    const matchesLocation = !loc || (h.location || '').toLowerCase().includes(loc);
    const matchesMinGuests = isNaN(minGuests) || (h.capacity || 0) >= minGuests;
    const matchesMaxPrice = isNaN(maxPrice) || h.pricePerNight <= maxPrice;
    return matchesLocation && matchesMinGuests && matchesMaxPrice;
  });

  renderHouses(filtered);
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

async function loadRatings() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/reviews/summary/house`);
    if (!res.ok) return;
    const data = await res.json();
    ratingSummary = {};
    (data || []).forEach(r => { ratingSummary[r.listingId] = r; });
  } catch (err) {
    ratingSummary = {};
  }
}

async function loadBookingCounts() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/bookings/counts/house`);
    if (!res.ok) return;
    bookingCounts = await res.json();
  } catch (err) {
    bookingCounts = {};
  }
}

async function loadHouses() {
  const grid = document.getElementById('houseGrid');
  try {
    await Promise.all([loadMyWishlist(), loadRatings(), loadBookingCounts()]);
    const res = await fetch(`${API_BASE_URL}/api/houses`);
    if (!res.ok) throw new Error(`Server responded with ${res.status}`);
    allHouses = await res.json();

    if (!allHouses.length) {
      grid.innerHTML = '<p class="listing-empty">No houses available right now.</p>';
      return;
    }

    renderHouses(allHouses);

    document.getElementById('filterLocation').addEventListener('input', applyFilters);
    document.getElementById('filterMinGuests').addEventListener('input', applyFilters);
    document.getElementById('filterMaxPrice').addEventListener('input', applyFilters);
  } catch (err) {
    console.error('Failed to load houses:', err);
    grid.innerHTML = '<p class="listing-error">Could not load houses right now.</p>';
  }
}

loadHouses();
