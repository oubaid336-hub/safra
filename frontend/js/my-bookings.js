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
    card.dataset.bookingId = booking._id;
    card.innerHTML = `
      <div class="booking-info">
        <span class="booking-type-badge">${booking.listingType === 'car' ? 'Car' : 'House'}</span>
        <h3 class="listing-title">Loading listing…</h3>
        <p class="booking-meta">${formatDateRange(booking.startDate, booking.endDate)}</p>
        <p class="booking-total">${formatPrice(booking.totalPrice)}</p>
      </div>
      <div class="booking-status-block">
        ${renderStatusBadge(booking.status, booking._id)}
      </div>
    `;
    list.appendChild(card);

    const titleEl = card.querySelector('.listing-title');
    try {
      const listing = await fetchListing(booking.listingId, booking.listingType);
      titleEl.textContent = listing?.title || 'Listing';
    } catch {
      titleEl.textContent = 'Listing';
    }

    const cancelBtn = card.querySelector('.cancel-booking-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => handleCancel(booking._id, card));
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

  function renderStatusBadge(status, bookingId) {
    const cancelBtn = `<button class="cancel-booking-btn" type="button" data-id="${bookingId}">Cancel booking</button>`;

    if (status === 'cancelled') {
      return `<span class="status-badge cancelled">Cancelled</span>`;
    }

    if (status === 'confirmed') {
      return `
        <span class="status-badge confirmed">Confirmed</span>
        <p class="status-note">All set — see you soon!</p>
        ${cancelBtn}
      `;
    }

    // pending (or pending-cash-payment)
    return `
      <span class="status-badge pending">Pending</span>
      <p class="status-note">Awaiting confirmation — we'll notify you once it's approved.</p>
      ${cancelBtn}
    `;
  }

  async function handleCancel(bookingId, cardEl) {
    if (!confirm('Cancel this booking? This cannot be undone.')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!res.ok) {
        alert('Could not cancel booking. Please try again.');
        return;
      }

      const statusBlock = cardEl.querySelector('.booking-status-block');
      statusBlock.innerHTML = renderStatusBadge('cancelled', bookingId);
    } catch (err) {
      console.error('Cancel failed:', err);
      alert('Could not reach the server. Please try again.');
    }
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


