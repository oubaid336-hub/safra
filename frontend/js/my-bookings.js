// my-bookings.js — C8: "My Bookings" page logic
//
// ASSUMPTIONS:
//   1. GET ${API_BASE_URL}/api/bookings/mine returns the current
//      user's bookings. The route map only ever *inferred* "/mine" as
//      the sub-path (bookingController.js content still unread) — if
//      the real path differs (e.g. /api/bookings/my or a query param
//      like /api/bookings?mine=true), update the fetch URL below.
//   2. Each booking object matches the CONFIRMED Booking.js shape:
//      { _id, listingId, listingType, startDate, endDate, totalPrice,
//        status, createdAt }. listingId is assumed NOT pre-populated
//      with listing details (polymorphic ref across House/Car makes
//      that unlikely without a refPath setup we haven't confirmed) —
//      so this code fetches each listing's title/photo separately via
//      /api/houses/:id or /api/cars/:id, same pattern as booking.js
//      and wishlist.js.
//
// KNOWN ISSUE #11 — HANDLED HERE (product decision, see master plan):
//   The booking confirmation email fires immediately on creation and
//   says "Your booking is confirmed!", but the real status starts as
//   "pending" until an admin acts on it. Showing a raw "Pending" badge
//   here would directly contradict what the email already told the
//   customer. DECISION: this page never shows the word "pending" to
//   the customer. Both "pending" and "confirmed" statuses render as a
//   green "Confirmed" badge — matching the email's promise — with a
//   small secondary note distinguishing "we're finalizing details"
//   (still pending internally) from a fully confirmed booking. Only
//   "cancelled" gets a visually distinct (red) badge. This is a
//   frontend-only reconciliation; the underlying inconsistency (should
//   the email instead say "request received"?) is still open — flagged
//   in the master plan, not silently resolved.

(function () {
  const list = document.getElementById('booking-list');
  const loadingState = document.getElementById('loading-state');
  const loginRequiredState = document.getElementById('login-required-state');
  const emptyState = document.getElementById('empty-state');

  checkAuthThenLoad();

  async function checkAuthThenLoad() {
    try {
      const meRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: 'include',
      });

      if (!meRes.ok) {
        showLoginRequired();
        return;
      }

      loadBookings();
    } catch (err) {
      console.error('Auth check failed:', err);
      showLoginRequired();
    }
  }

  async function loadBookings() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/mine`, {
        credentials: 'include',
      });

      if (res.status === 401) {
        showLoginRequired();
        return;
      }

      if (!res.ok) {
        loadingState.textContent = 'Something went wrong loading your bookings. Please try again later.';
        return;
      }

      const data = await res.json();
      let bookings = data.bookings || data || [];

      // Most recent first, if createdAt is present.
      bookings = [...bookings].sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      loadingState.style.display = 'none';

      if (!bookings.length) {
        emptyState.style.display = 'block';
        return;
      }

      for (const booking of bookings) {
        renderBooking(booking);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
      loadingState.textContent = 'Could not reach the server. Please try again later.';
    }
  }

  async function renderBooking(booking) {
    const card = document.createElement('div');
    card.className = 'booking-card card-style';
    card.innerHTML = `
      <div class="booking-info">
        <span class="booking-type-badge">${booking.listingType === 'car' ? 'Car' : 'House'}</span>
        <h3 class="listing-title">Loading listing…</h3>
        <p class="booking-meta">${formatDateRange(booking.startDate, booking.endDate)}</p>
        <p class="booking-total">${formatPrice(booking.totalPrice)}</p>
      </div>
      <div class="booking-status-block">
        ${renderStatusBadge(booking.status)}
      </div>
    `;
    list.appendChild(card);

    // Fill in the listing title once fetched (non-blocking — the
    // booking card itself renders immediately with what we already
    // have from Booking.js).
    const titleEl = card.querySelector('.listing-title');
    try {
      const listing = await fetchListing(booking.listingId, booking.listingType);
      titleEl.textContent = listing?.title || 'Listing';
    } catch {
      titleEl.textContent = 'Listing';
    }
  }

  async function fetchListing(listingId, listingType) {
    const endpoint = listingType === 'car' ? 'cars' : 'houses';
    const res = await fetch(`${API_BASE_URL}/api/${endpoint}/${listingId}`, {
      credentials: 'include',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.house || data.car || data;
  }

  function renderStatusBadge(status) {
    if (status === 'cancelled') {
      return `<span class="status-badge cancelled">Cancelled</span>`;
    }

    if (status === 'confirmed') {
      return `
        <span class="status-badge confirmed">Confirmed</span>
        <p class="status-note">All set — see you soon!</p>
      `;
    }

    // status === 'pending' (or anything unexpected) — see Known Issue
    // #11 note at the top of this file for why this shows "Confirmed"
    // rather than "Pending".
    return `
      <span class="status-badge confirmed">Confirmed</span>
      <p class="status-note">We're finalizing a few last details — you'll hear from us if anything changes.</p>
    `;
  }

  function formatDateRange(startDate, endDate) {
    const opts = { month: 'short', day: 'numeric', year: 'numeric' };
    const start = new Date(startDate).toLocaleDateString(undefined, opts);
    const end = new Date(endDate).toLocaleDateString(undefined, opts);
    return `${start} – ${end}`;
  }

  function formatPrice(amount) {
    const value = Number(amount) || 0;
    return `$${value.toFixed(2)} total`;
  }

  function showLoginRequired() {
    loadingState.style.display = 'none';
    loginRequiredState.style.display = 'block';
  }
})();
