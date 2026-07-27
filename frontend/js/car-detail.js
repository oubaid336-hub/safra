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

    seatsEl.textContent = car.seats ?? '—';
    transmissionEl.textContent = car.transmission ?? '—';
    yearEl.textContent = car.year ?? '—';

    if (car.photos && car.photos.length > 0) {
      renderGallery(car.photos, car.title);
    } else {
      photoEl.removeAttribute('src');
      photoEl.alt = 'No photo available yet';
    }

    bookBtn.href = `car-booking.html?carId=${encodeURIComponent(car._id || carId)}`;

    const reviewLink = document.getElementById('writeReviewLink');
    if (reviewLink) {
      reviewLink.href = `reviews.html?listingId=${encodeURIComponent(car._id || carId)}&listingType=car`;
    }

    setupWishlistButton(car._id || carId);
    loadReviews(car._id || carId);
  }

  function renderGallery(photos, title) {
    photoEl.src = photos[0];
    photoEl.alt = title || 'Car photo';

    const thumbs = document.getElementById('galleryThumbs');
    if (!thumbs) return;

    if (photos.length > 1) {
      thumbs.innerHTML = photos.map((p, i) => `
        <button type="button" class="gallery-thumb${i === 0 ? ' is-active' : ''}" data-src="${p}">
          <img src="${p}" alt="" loading="lazy">
        </button>
      `).join('');

      thumbs.querySelectorAll('.gallery-thumb').forEach(btn => {
        btn.addEventListener('click', () => {
          photoEl.src = btn.dataset.src;
          thumbs.querySelectorAll('.gallery-thumb').forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
        });
      });
    } else {
      thumbs.innerHTML = '';
    }
  }

  async function loadReviews(carId) {
    const list = document.getElementById('reviewsList');
    if (!list) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/car/${carId}`);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const reviews = await res.json();

      if (!reviews.length) {
        list.innerHTML = '<p class="no-reviews">No reviews yet.</p>';
        return;
      }

      list.innerHTML = reviews.map(r => `
        <div class="review-card">
          <div class="review-head">
            <span class="review-name">${escapeHtml(r.userId && r.userId.name ? r.userId.name : 'Guest')}</span>
            <span class="review-stars">Rating: ${r.rating || 0}/5</span>
          </div>
          <p class="review-comment">${escapeHtml(r.comment || '')}</p>
        </div>
      `).join('');
    } catch (err) {
      console.error('Failed to load reviews:', err);
      list.innerHTML = '<p class="no-reviews">Could not load reviews.</p>';
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
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
