let ratingSummary = {};
let bookingCounts = {};

async function loadFeatured() {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;
  try {
    const [featuredRes, ratingRes, countsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/featured`),
      fetch(`${API_BASE_URL}/api/reviews/summary/house`),
      fetch(`${API_BASE_URL}/api/bookings/counts/house`)
    ]);
    const data = await featuredRes.json();

    ratingSummary = {};
    if (ratingRes.ok) {
      const r = await ratingRes.json();
      (r || []).forEach(x => { ratingSummary[x.listingId] = x; });
    }
    bookingCounts = countsRes.ok ? await countsRes.json() : {};

    const cards = [];
    (data.houses || []).forEach(h => {
      const rating = ratingSummary[String(h._id)];
      const count = bookingCounts[String(h._id)] ?? 0;
      const isNew = count <= 2;
      const discountedPrice = Math.round(h.pricePerNight * 0.9);

      let badgesRow = '';
      if (isNew || rating) {
        badgesRow = `
          <div class="listing-badges-row">
            ${isNew ? `<span class="listing-badge-new">NEW &middot; 10% OFF</span>` : ''}
            ${rating ? `<div class="listing-rating-circle"><span class="rc-num">${rating.avgRating}</span><span class="rc-star">&#9733;</span></div>` : ''}
          </div>
        `;
      }

      cards.push(`
        <a href="houses.html" class="listing-card">
          <div class="listing-thumb" style="position:relative;">
            <img src="${h.photos[0]}" alt="${h.title}">
            ${badgesRow}
          </div>
          <div class="listing-body">
            <div class="listing-title">${h.title}</div>
            <div class="listing-location">${h.location}</div>
            <div class="listing-footer-row">
              <div class="listing-price">
                ${isNew ? `<span class="listing-price-old">$${h.pricePerNight}</span>$${discountedPrice}` : `$${h.pricePerNight}`}
                <span>per night</span>
              </div>
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
