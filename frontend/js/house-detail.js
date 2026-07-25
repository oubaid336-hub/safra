async function loadHouseDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const loadingState = document.getElementById('loadingState');
  const detailLayout = document.getElementById('detailLayout');
  const errorState = document.getElementById('errorState');

  if (!id) {
    loadingState.style.display = 'none';
    errorState.style.display = 'block';
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/houses/${id}`);
    if (!res.ok) throw new Error(`Server responded with ${res.status}`);
    const house = await res.json();

    document.getElementById('detailTitle').textContent = house.title;
    document.getElementById('detailLocation').textContent = house.location;
    document.getElementById('detailRooms').textContent = house.rooms ?? '-';
    document.getElementById('detailBaths').textContent = house.bathrooms ?? '-';
    document.getElementById('detailCapacity').textContent = house.capacity ?? '-';
    document.getElementById('detailDesc').textContent = house.description || '';

    const amenitiesGrid = document.getElementById('amenitiesGrid');
    if (house.amenities && house.amenities.length) {
      amenitiesGrid.innerHTML = house.amenities.map(a => `
        <div class="amenity">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
          <span>${a}</span>
        </div>
      `).join('');
    } else {
      document.getElementById('amenitiesSection').style.display = 'none';
    }

    if (house.photos && house.photos.length) {
      const gallery = document.getElementById('galleryMain');
      gallery.style.backgroundImage = `url('${house.photos[0]}')`;
      gallery.style.backgroundSize = 'cover';
      gallery.style.backgroundPosition = 'center';
      gallery.innerHTML = '';
    }

    document.querySelector('.booking-price').innerHTML =
      `$${house.pricePerNight}<span> / night</span>`;
    document.getElementById('bookNowBtn').href = `booking.html?houseId=${house._id}`;

    const reviewLink = document.getElementById('writeReviewLink');
    if (reviewLink) {
      reviewLink.href = `reviews.html?listingId=${encodeURIComponent(house._id || id)}&listingType=house`;
    }

    loadReviews(id);
    setupWishlistButton(id);

    loadingState.style.display = 'none';
    detailLayout.style.display = 'grid';
  } catch (err) {
    console.error('Failed to load house:', err);
    loadingState.style.display = 'none';
    errorState.style.display = 'block';
  }
}

async function loadReviews(houseId) {
  const list = document.getElementById('reviewsList');
  try {
    const res = await fetch(`${API_BASE_URL}/api/reviews/house/${houseId}`);
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
  div.textContent = str;
  return div.innerHTML;
}

async function setupWishlistButton(houseId) {
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
      const res = await fetch(`${API_BASE_URL}/api/wishlist/${encodeURIComponent(houseId)}`, {
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

loadHouseDetail();
