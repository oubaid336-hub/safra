async function loadFeatured() {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/featured`);
    const data = await res.json();

    const cards = [];

    (data.houses || []).forEach(h => {
      cards.push(`
        <a href="houses.html" class="listing-card">
          <div class="listing-thumb"><img src="${h.photos[0]}" alt="${h.title}"></div>
          <div class="listing-body">
            <div class="listing-title">${h.title}</div>
            <div class="listing-location">${h.location}</div>
            <div class="listing-footer-row">
              <div class="listing-price">$${h.pricePerNight}<span>per night</span></div>
              <span class="listing-cta">View Details</span>
            </div>
          </div>
        </a>
      `);
    });

    if (data.car) {
      const c = data.car;
      cards.push(`
        <a href="cars.html" class="listing-card">
          <div class="listing-thumb"><img src="${c.photos[0]}" alt="${c.title}"></div>
          <div class="listing-body">
            <div class="listing-title">${c.title}</div>
            <div class="listing-location">${c.location}</div>
            <div class="listing-footer-row">
              <div class="listing-price">$${c.pricePerDay}<span>per day</span></div>
              <span class="listing-cta">View Details</span>
            </div>
          </div>
        </a>
      `);
    }

    grid.classList.remove("featured-loading");
    grid.innerHTML = cards.join("") || `<div class="listing-empty">No featured listings yet.</div>`;
  } catch (err) {
    console.error("Failed to load featured listings:", err);
    grid.innerHTML = `<div class="listing-error">Could not load featured listings.</div>`;
  }
}
loadFeatured();
