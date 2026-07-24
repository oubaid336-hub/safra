let allHouses = [];

function renderHouses(list) {
  const grid = document.getElementById('houseGrid');

  if (!list.length) {
    grid.innerHTML = '<p class="listing-empty">No houses match your search.</p>';
    return;
  }

  grid.innerHTML = list.map(house => `
    <a class="listing-card" href="house-detail.html?id=${house._id}">
      <div class="listing-thumb">
        ${house.photos && house.photos[0]
          ? `<img src="${house.photos[0]}" alt="${escapeHtml(house.title)}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">`
          : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>`}
      </div>
      <div class="listing-body">
        <div class="listing-title">${escapeHtml(house.title)}</div>
        <div class="listing-location">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>${escapeHtml(house.location)}</span>
        </div>
        <div class="listing-footer-row">
          <div class="listing-price">$${house.pricePerNight}<span> / night</span></div>
          <span class="listing-cta">View details -&gt;</span>
        </div>
      </div>
    </a>
  `).join('');
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

async function loadHouses() {
  const grid = document.getElementById('houseGrid');
  try {
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
