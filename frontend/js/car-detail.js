// car-detail.js â€” C6: Car detail page logic
//
// ASSUMPTIONS (Car.js fields were never confirmed â€” see
// SAFRA-PROJECT-REFERENCE.txt Section 5: "UNCONFIRMED exact fields â€”
// known only that it has the same status: pending/approved/rejected
// pattern as House.js, by symmetry"). This code guesses a schema that
// mirrors House.js as closely as makes sense for a car:
//
//   { _id, title, description, location, pricePerDay, photos: [],
//     seats, transmission, year }
//
// If the real Car.js has different field names (e.g. "make"/"model"
// instead of a combined "title", or "pricePerNight" instead of
// "pricePerDay"), update renderCar() below to match â€” everything else
// (fetch, routing, error handling) should still work unchanged.
//
// Also assumes GET ${API_BASE_URL}/api/cars/:id exists, matching the
// GET /api/houses/:id assumption made in booking.js/booking.html for
// C5 â€” neither has been confirmed against carController.js/
// carRoutes.js content (still unread).

(function () {
  const params = new URLSearchParams(window.location.search);
  const carId = params.get('carId');

  const loadingState = document.getElementById('loading-state');
  const notFoundState = document.getElementById('not-found-state');
  const content = document.getElementById('car-content');

  const photoEl = document.getElementById('car-photo');
  const titleEl = document.getElementById('car-title');
  const priceEl = document.getElementById('car-price');
  const locationEl = document.getElementById('car-location');
  const seatsEl = document.getElementById('car-seats');
  const transmissionEl = document.getElementById('car-transmission');
  const yearEl = document.getElementById('car-year');
  const descriptionEl = document.getElementById('car-description');
  const bookBtn = document.getElementById('book-car-btn');

  if (!carId) {
    showNotFound();
    return;
  }

  loadCar(carId);

  async function loadCar(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cars/${id}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        showNotFound();
        return;
      }

      const data = await res.json();
      const car = data.car || data;

      renderCar(car);
      loadingState.style.display = 'none';
      content.style.display = 'block';
    } catch (err) {
      console.error('Failed to load car:', err);
      showNotFound();
    }
  }

  function renderCar(car) {
    titleEl.textContent = car.title || 'Untitled listing';
    locationEl.textContent = car.location || '';
    descriptionEl.textContent = car.description || '';

    const pricePerDay = Number(car.pricePerDay ?? car.pricePerNight) || 0;
    priceEl.textContent = `$${pricePerDay.toFixed(2)} / day`;

    seatsEl.textContent = car.seats ?? 'â€”';
    transmissionEl.textContent = car.transmission ?? 'â€”';
    yearEl.textContent = car.year ?? 'â€”';

    if (car.photos && car.photos.length > 0) {
      photoEl.src = car.photos[0];
      photoEl.alt = car.title || 'Car photo';
    } else {
      photoEl.removeAttribute('src');
      photoEl.alt = 'No photo available yet';
    }

    bookBtn.href = `car-booking.html?carId=${encodeURIComponent(car._id || carId)}`;

    setupWishlistButton(car._id || carId);
  }

  async function setupWishlistButton(id) {
    const btn = document.getElementById('wishlistBtn');
    if (!btn) return;

    try {
      const meRes = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
      if (!meRes.ok) {
        btn.style.display = 'none';
        return;
      }
    } catch (err) {
      btn.style.display = 'none';
      return;
    }

    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try {
        const res = await fetch(`${API_BASE_URL}/api/wishlist/${encodeURIComponent(id)}`, {
          method: 'POST',
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        btn.textContent = btn.textContent === 'Add to Wishlist' ? 'Remove from Wishlist' : 'Add to Wishlist';
      } catch (err) {
        console.error('Wishlist toggle failed:', err);
        alert('Could not update wishlist. Please try again.');
      } finally {
        btn.disabled = false;
      }
    });
  }

  function showNotFound() {
    loadingState.style.display = 'none';
    content.style.display = 'none';
    notFoundState.style.display = 'block';
  }
})();
