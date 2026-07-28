function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function renderGallery(photos, title) {
  const gallery = document.getElementById('galleryMain');
  const thumbs = document.getElementById('galleryThumbs');

  gallery.innerHTML = `<img src="${photos[0]}" alt="${escapeHtml(title || 'Photo')}" style="width:100%;height:100%;object-fit:cover;display:block;">`;

  if (photos.length > 1) {
    thumbs.innerHTML = photos.map((p, i) => `
      <button type="button" class="gallery-thumb${i === 0 ? ' is-active' : ''}" data-src="${p}">
        <img src="${p}" alt="" loading="lazy">
      </button>
    `).join('');

    thumbs.querySelectorAll('.gallery-thumb').forEach(btn => {
      btn.addEventListener('click', () => {
        gallery.querySelector('img').src = btn.dataset.src;
        thumbs.querySelectorAll('.gallery-thumb').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
      });
    });
  } else {
    thumbs.innerHTML = '';
  }
}

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
      renderGallery(house.photos, house.title);
    }

    let isNew = false;
    try {
      const countsRes = await fetch(`${API_BASE_URL}/api/bookings/counts/house`);
      if (countsRes.ok) {
        const counts = await countsRes.json();
        const bookingCount = counts[String(house._id)] ?? 0;
        isNew = bookingCount <= 2;
      }
    } catch (err) {
      isNew = false;
    }

    const discountedPrice = Math.round(house.pricePerNight * 0.9);
    document.querySelector('.booking-price').innerHTML = isNew
      ? `<span class="listing-price-old" style="font-size:15px;">$${house.pricePerNight}</span>$${discountedPrice}<span> / night</span>`
      : `$${house.pricePerNight}<span> / night</span>`;
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

    const sortedByRating = [...reviews].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    const best = sortedByRating.slice(0, 2);
    const remaining = sortedByRating.slice(2);
    const normalPick = remaining.length ? remaining[Math.floor(remaining.length / 2)] : null;
    const toShow = normalPick ? [...best, normalPick] : best;

    list.innerHTML = toShow.map(r => `
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

async function setupWishlistButton(houseId) {
  const btn = document.getElementById('wishlistBtn');
  if (!btn) return;

  let isWishlisted = false;

  try {
    const wlRes = await fetch(`${API_BASE_URL}/api/wishlist/`, { credentials: 'include' });
    if (!wlRes.ok) {
      btn.style.display = 'none';
      return;
    }
    const wl = await wlRes.json();
    const allIds = [...(wl.houses || []), ...(wl.cars || [])].map(item => String(item._id));
    isWishlisted = allIds.includes(String(houseId));
    btn.textContent = isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist';
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
      isWishlisted = !isWishlisted;
      btn.textContent = isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist';
    } catch (err) {
      console.error('Wishlist toggle failed:', err);
      alert('Could not update wishlist. Please try again.');
    } finally {
      btn.disabled = false;
    }
  });
}

loadHouseDetail();
