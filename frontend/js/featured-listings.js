(function () {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;

  Promise.all([
    fetch(`${API_BASE_URL}/api/houses`).then(r => r.ok ? r.json() : []).catch(() => []),
    fetch(`${API_BASE_URL}/api/cars`).then(r => r.ok ? r.json() : []).catch(() => []),
  ]).then(([houses, cars]) => {
    grid.classList.remove('featured-loading');

    const cards = [
      ...(houses || []).slice(0, 4).map(renderHouseCard),
      ...(cars || []).slice(0, 2).map(renderCarCard),
    ];

    if (!cards.length) {
      grid.innerHTML = '<p class="listing-empty">No listings available right now.</p>';
      return;
    }

    grid.innerHTML = cards.join('');
  });

  function renderHouseCard(house) {
    return `
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
            <div class="listing-price">$${house.pricePerNight}<span>per night</span></div>
            <span class="listing-cta">View Details</span>
          </div>
        </div>
      </a>
    `;
  }

  function renderCarCard(car) {
    return `
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
            <div class="listing-price">$${car.pricePerDay}<span>per day</span></div>
            <span class="listing-cta">View Details</span>
          </div>
        </div>
      </a>
    `;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
})();
