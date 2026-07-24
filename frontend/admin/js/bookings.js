// admin/js/bookings.js â€” D4: Manage bookings (confirm/cancel UI)
//
// UNLIKE D2 (dashboard.js) and D3 (houses.js), Booking.js's exact
// field names were never confirmed against real model/controller
// content in any chat â€” there's no equivalent to the House.js/Car.js
// field lists this project already has. Everything below that touches
// a Booking field is either a REUSED assumption (already made and not
// contradicted by an earlier, already-built C-phase page) or a NEW
// assumption made here â€” both kinds are flagged inline. Nothing is
// silently guessed without a comment saying so.
//
// ROUTES (all assumed by following the exact URL pattern CONFIRMED for
// houses/cars â€” /api/admin/<resource>/:id/<action> â€” not yet confirmed
// directly against bookingRoutes.js/adminController.js content):
//   GET /api/admin/bookings
//   PUT /api/admin/bookings/:id/confirm
//   PUT /api/admin/bookings/:id/cancel
// A13 (Phase A) confirmed admin confirm/cancel WORKS live against some
// route â€” just not necessarily this exact string. Test this page's
// buttons for real before trusting the guess.
//
// FIELDS:
//   status ("pending" | "confirmed" | "cancelled") and totalPrice â€”
//   CONFIRMED, bookingController.js content was already read for these
//   (see Known Issue #11 and the C5 build note in the master plan).
//   listingId + listingType ("house" | "car") â€” REUSED assumption,
//   same one C7 (wishlist.js), C8 (my-bookings.js), and C9 (reviews.js)
//   already made. Used here to fetch the listing's title the same way
//   C8 does: GET /api/houses/:id or /api/cars/:id per booking.
//   Guest identity â€” NEW assumption: tries a populated `user` object
//   (name/email) first, then falls back to a raw id field (userId,
//   customerId, or user-as-string), labeled explicitly as an ID rather
//   than left blank or invented.
//   Stay dates â€” NEW assumption: tries common field-name pairs in
//   order (checkIn/checkOut, startDate/endDate, dateFrom/dateTo). If
//   none of those exist on the record, the card just omits the dates
//   line instead of fabricating one.

(function () {
  const statusBanner = document.getElementById('statusBanner');
  const loadingMsg = document.getElementById('loadingMsg');
  const emptyMsg = document.getElementById('emptyMsg');
  const bookingsList = document.getElementById('bookingsList');
  const logoutBtn = document.getElementById('logoutBtn');

  function showError(text) {
    statusBanner.textContent = text;
    statusBanner.classList.add('show');
  }

  function clearError() {
    statusBanner.classList.remove('show');
  }

  // Pending first (needs action), then confirmed, then cancelled.
  function sortByStatus(items) {
    const order = { pending: 0, confirmed: 1, cancelled: 2 };
    return [...items].sort((a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3));
  }

  function formatDate(value) {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // Guest identity: populated object first, raw id fallback second.
  function getGuestLabel(booking) {
    const candidate = booking.user || booking.guest || booking.customer || booking.userId;
    if (candidate && typeof candidate === 'object') {
      if (candidate.name && candidate.email) return `${candidate.name} (${candidate.email})`;
      if (candidate.name) return candidate.name;
      if (candidate.email) return candidate.email;
    }
    const rawId = booking.customerId ||
      (typeof booking.userId === 'string' ? booking.userId : null) ||
      (typeof booking.user === 'string' ? booking.user : null);
    if (rawId) return `Guest ID: ${rawId}`;
    return 'Guest info unavailable';
  }

  // Tries known date field-name pairs in order; first pair where BOTH
  // sides parse to a valid date wins.
  function getDatesLabel(booking) {
    const pairs = [
      ['checkIn', 'checkOut'],
      ['startDate', 'endDate'],
      ['dateFrom', 'dateTo']
    ];
    for (const [fromKey, toKey] of pairs) {
      const from = formatDate(booking[fromKey]);
      const to = formatDate(booking[toKey]);
      if (from && to) return `${from} â†’ ${to}`;
    }
    return null;
  }

  function getListingType(booking) {
    const type = booking.listingType;
    if (type === 'house' || type === 'car') return type;
    return null;
  }

  function getListingId(booking) {
    return booking.listingId || booking.listing || null;
  }

  // Same lookup C8 (my-bookings.js) already does: fetch the listing's
  // own title separately, since it's assumed NOT pre-populated on the
  // booking response. Fails gracefully rather than breaking the card.
  async function fetchListingTitle(booking) {
    const type = getListingType(booking);
    const id = getListingId(booking);
    if (!type || !id) return 'Listing unavailable';

    const endpoint = type === 'house' ? 'houses' : 'cars';
    try {
      const res = await fetch(`${API_BASE_URL}/api/${endpoint}/${id}`, {
        method: 'GET',
        credentials: 'include'
      });
      if (!res.ok) return 'Listing unavailable';
      const data = await res.json();
      return data.title || 'Listing unavailable';
    } catch (err) {
      console.error(`Failed to fetch ${type} ${id} for booking:`, err);
      return 'Listing unavailable';
    }
  }

  function buildCard(booking, listingTitle) {
    const card = document.createElement('div');
    card.className = 'booking-card';

    const info = document.createElement('div');
    info.className = 'booking-info';

    const type = getListingType(booking);
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = listingTitle;
    if (type) {
      const typeTag = document.createElement('span');
      typeTag.className = 'type-tag';
      typeTag.textContent = type;
      title.appendChild(typeTag);
    }

    const guestMeta = document.createElement('div');
    guestMeta.className = 'meta';
    const price = booking.totalPrice != null ? `$${booking.totalPrice}` : 'price n/a';
    const dates = getDatesLabel(booking);
    guestMeta.textContent = [getGuestLabel(booking), dates, price].filter(Boolean).join(' Â· ');

    info.appendChild(title);
    info.appendChild(guestMeta);

    const bookedOnDate = formatDate(booking.createdAt);
    if (bookedOnDate) {
      const bookedOn = document.createElement('div');
      bookedOn.className = 'booked-on';
      bookedOn.textContent = `Booked on ${bookedOnDate}`;
      info.appendChild(bookedOn);
    }

    const badge = document.createElement('span');
    badge.className = 'status-badge ' + (booking.status || 'pending');
    badge.textContent = booking.status || 'pending';

    const actions = document.createElement('div');
    actions.className = 'booking-actions';

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'confirm-btn';
    confirmBtn.textContent = 'Confirm';
    confirmBtn.disabled = booking.status === 'confirmed' || booking.status === 'cancelled';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.disabled = booking.status === 'cancelled';

    confirmBtn.addEventListener('click', () => setBookingStatus(booking._id, 'confirm', card));
    cancelBtn.addEventListener('click', () => setBookingStatus(booking._id, 'cancel', card));

    actions.appendChild(confirmBtn);
    actions.appendChild(cancelBtn);

    card.appendChild(info);
    card.appendChild(badge);
    card.appendChild(actions);

    return card;
  }

  async function setBookingStatus(id, action, cardEl) {
    const buttons = cardEl.querySelectorAll('button');
    buttons.forEach((b) => (b.disabled = true));
    clearError();

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/bookings/${id}/${action}`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (res.status === 401 || res.status === 403) {
        window.location.href = 'login.html';
        return;
      }

      if (!res.ok) {
        showError('Something went wrong updating that booking. Please try again.');
        buttons.forEach((b) => (b.disabled = false));
        return;
      }

      // Reload fresh rather than patch local state â€” keeps this in
      // sync with whatever the server actually did (same call D3 makes).
      await loadAll();

    } catch (err) {
      console.error(`Failed to ${action} booking ${id}:`, err);
      showError('Something went wrong updating that booking. Please try again.');
      buttons.forEach((b) => (b.disabled = false));
    }
  }

  async function loadAll() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/bookings`, {
        method: 'GET',
        credentials: 'include'
      });

      if (res.status === 401 || res.status === 403) {
        window.location.href = 'login.html';
        return;
      }

      if (!res.ok) {
        loadingMsg.style.display = 'none';
        showError('Something went wrong loading bookings. Please try again.');
        return;
      }

      const bookings = await res.json();
      loadingMsg.style.display = 'none';
      bookingsList.innerHTML = '';

      if (!bookings || bookings.length === 0) {
        emptyMsg.style.display = 'block';
        return;
      }
      emptyMsg.style.display = 'none';

      const sorted = sortByStatus(bookings);

      // Resolve every listing title first so cards render complete,
      // rather than flashing placeholder text in one-by-one.
      const titles = await Promise.all(sorted.map(fetchListingTitle));
      sorted.forEach((booking, i) => {
        bookingsList.appendChild(buildCard(booking, titles[i]));
      });

    } catch (err) {
      console.error('Failed to load bookings:', err);
      loadingMsg.style.display = 'none';
      showError('Something went wrong loading bookings. Please try again.');
    }
  }

  logoutBtn.addEventListener('click', async function () {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      window.location.href = 'login.html';
    }
  });

  loadAll();
})();
