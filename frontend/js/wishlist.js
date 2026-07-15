// wishlist.js — C7: Wishlist page logic
//
// ASSUMPTIONS (wishlistRoutes.js / wishlistController.js content has
// never been read — see SAFRA-PROJECT-REFERENCE.txt Section 4, which
// only confirms "/api/wishlist/... - toggle + fetch wishlist" exists
// as a general description, not exact verbs/paths):
//
//   1. GET  ${API_BASE_URL}/api/wishlist
//      -> returns the current user's wishlist, already populated with
//         listing details, as an array of objects shaped like:
//         { listingId, listingType: "house" | "car", title,
//           location, pricePerNight / pricePerDay, photos: [] }
//      If the real response is instead just an array of bare IDs
//      (unpopulated), this code will need an extra fetch-per-item step
//      added in loadWishlist() below.
//
//   2. POST ${API_BASE_URL}/api/wishlist/toggle
//      body: { listingId, listingType }
//      -> adds if not present, removes if present (matches the
//         "toggle" naming in the route map). Used here for the
//         Remove button — calling toggle on an item already in the
//         wishlist should remove it.
//
//   3. Detail page links assume house-detail.html?houseId=<id> for
//      houses (this filename was never confirmed — C4 was built
//      without sharing the actual filename in chat — adjust below if
//      yours is named differently, e.g. house.html or listing.html)
//      and car-detail.html?carId=<id> for cars (confirmed, built as
//      C6 in this same chat).
//
//   4. Auth check uses GET ${API_BASE_URL}/api/auth/me (confirmed to
//      exist, added since Phase A) to detect whether the visitor is
//      logged in before attempting to load the wishlist.

(function () {
  const grid = document.getElementById('wishlist-grid');
  const loadingState = document.getElementById('loading-state');
  const loginRequiredState = document.getElementById('login-required-state');
  const emptyState = document.getElementById('empty-state');

  checkAuthThenLoad();

  async function checkAuthThenLoad() {
    try {
      const meRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: 'include',
      });

      if (meRes.status === 401) {
        showLoginRequired();
        return;
      }

      if (!meRes.ok) {
        showLoginRequired();
        return;
      }

      loadWishlist();
    } catch (err) {
      console.error('Auth check failed:', err);
      showLoginRequired();
    }
  }

  async function loadWishlist() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/wishlist`, {
        credentials: 'include',
      });

      if (res.status === 401) {
        showLoginRequired();
        return;
      }

      if (!res.ok) {
        loadingState.textContent = 'Something went wrong loading your wishlist. Please try again later.';
        return;
      }

      const data = await res.json();
      const items = data.wishlist || data.items || data || [];

      loadingState.style.display = 'none';

      if (!items.length) {
        emptyState.style.display = 'block';
        return;
      }

      items.forEach(renderItem);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
      loadingState.textContent = 'Could not reach the server. Please try again later.';
    }
  }

  function renderItem(item) {
    const listingType = item.listingType; // "house" | "car"
    const listingId = item.listingId || item._id;

    const detailUrl =
      listingType === 'car'
        ? `car-detail.html?carId=${encodeURIComponent(listingId)}`
        : `house-detail.html?houseId=${encodeURIComponent(listingId)}`;

    const price = Number(item.pricePerNight ?? item.pricePerDay) || 0;
    const priceLabel = listingType === 'car' ? `$${price.toFixed(2)} / day` : `$${price.toFixed(2)} / night`;

    const card = document.createElement('div');
    card.className = 'wishlist-item card-style';
    card.innerHTML = `
      <img src="${item.photos && item.photos[0] ? item.photos[0] : ''}" alt="${item.title || 'Listing photo'}" />
      <span class="item-type-badge">${listingType === 'car' ? 'Car' : 'House'}</span>
      <h3>${escapeHtml(item.title || 'Untitled listing')}</h3>
      <p class="location">${escapeHtml(item.location || '')}</p>
      <p class="price">${priceLabel}</p>
      <div class="item-actions">
        <a href="${detailUrl}" class="btn">View</a>
        <button type="button" class="btn-remove">Remove</button>
      </div>
    `;

    card.querySelector('.btn-remove').addEventListener('click', () => {
      removeFromWishlist(listingId, listingType, card);
    });

    grid.appendChild(card);
  }

  async function removeFromWishlist(listingId, listingType, cardEl) {
    const removeBtn = cardEl.querySelector('.btn-remove');
    removeBtn.disabled = true;
    removeBtn.textContent = 'Removing…';

    try {
      const res = await fetch(`${API_BASE_URL}/api/wishlist/toggle`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, listingType }),
      });

      if (!res.ok) {
        removeBtn.disabled = false;
        removeBtn.textContent = 'Remove';
        alert('Could not remove this item. Please try again.');
        return;
      }

      cardEl.remove();

      if (!grid.children.length) {
        emptyState.style.display = 'block';
      }
    } catch (err) {
      console.error('Failed to remove wishlist item:', err);
      removeBtn.disabled = false;
      removeBtn.textContent = 'Remove';
      alert('Could not reach the server. Please try again.');
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function showLoginRequired() {
    loadingState.style.display = 'none';
    loginRequiredState.style.display = 'block';
  }
})();
