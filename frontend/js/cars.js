let allCars = [];

function renderCars(list) {
  const grid = document.getElementById('carGrid');

  if (!list.length) {
    grid.innerHTML = '<p class="listing-empty">No cars match your search.</p>';
    return;
  }

  grid.innerHTML = list.map(car => `
    <a class="listing-card" href="car-detail.html?carId=${car._id}">
      <div class="listing-thumb">
        ${car.photos && car.photos[0]
          ? `<img src="${car.photos[0]}" alt="${escapeHtml(car.title)}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">`
          : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 17h14M5 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm14 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM3 17V9l2-5h14l2 5v8"/></svg>`}
      </div>
      <div class="listing-body">
        <div class="listing-title">${escapeHtml(car.title)}</div>
        <div class="listing-location">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>${escapeHtml(car.location)}</span>
        </div>
        <div class="listing-footer-row">
          <div class="listing-price">$${car.pricePerDay}<span> / day</span></div>
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

async function loadCars() {
  const grid = document.getElementById('carGrid');
  try {
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
