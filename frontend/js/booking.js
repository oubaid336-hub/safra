// booking.js — C5: Booking form logic
//
// ASSUMPTIONS (flag these against the real backend once confirmed):
//   1. This page is opened as booking.html?houseId=<id>
//      -> the "Book Now" link/button on the house detail page (C4)
//         needs to point here with that exact param name.
//   2. GET  ${API_BASE_URL}/api/houses/:id   returns a single house
//      object: { _id, title, description, location, pricePerNight,
//      photos: [] }. This route was never explicitly confirmed against
//      houseController.js/houseRoutes.js (still unread) — only the
//      public LIST endpoint (GET /api/houses) was confirmed live in
//      Phase A. If the real route/shape differs, adjust loadHouse()
//      below.
//   3. POST ${API_BASE_URL}/api/bookings expects JSON body:
//      { listingId, listingType: "house", startDate, endDate }
//      and relies on the httpOnly JWT cookie for auth (credentials:
//      'include'), matching the auth pattern already confirmed in
//      Phase A. totalPrice is NOT sent — the server calculates it
//      (confirmed pattern: $80/night x 4 nights = $320 in Phase A4).

(function () {
  const params = new URLSearchParams(window.location.search);
  const houseId = params.get('houseId');

  const loadingState = document.getElementById('loading-state');
  const notFoundState = document.getElementById('not-found-state');
  const layout = document.getElementById('booking-layout');

  const photoEl = document.getElementById('house-photo');
  const titleEl = document.getElementById('house-title');
  const locationEl = document.getElementById('house-location');
  const descriptionEl = document.getElementById('house-description');

  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');
  const priceBreakdown = document.getElementById('price-breakdown');
  const pricePerNightValue = document.getElementById('price-per-night-value');
  const nightsValue = document.getElementById('nights-value');
  const totalValue = document.getElementById('total-value');

  const form = document.getElementById('booking-form');
  const submitBtn = document.getElementById('submit-btn');
  const formMessage = document.getElementById('form-message');

  let currentHouse = null;

  // No houseId in the URL at all -> nothing to book, bail early.
  if (!houseId) {
    showNotFound();
    return;
  }

  // Prevent picking a check-in date in the past.
  const today = new Date().toISOString().split('T')[0];
  startDateInput.min = today;
  endDateInput.min = today;

  loadHouse(houseId);

  startDateInput.addEventListener('change', handleDatesChanged);
  endDateInput.addEventListener('change', handleDatesChanged);
  form.addEventListener('submit', handleSubmit);

  async function loadHouse(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/houses/${id}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        showNotFound();
        return;
      }

      const data = await res.json();
      // Some APIs wrap the object as { house: {...} } — handle both shapes.
      currentHouse = data.house || data;

      renderHouse(currentHouse);
      loadingState.style.display = 'none';
      layout.style.display = 'grid';
    } catch (err) {
      console.error('Failed to load house:', err);
      showNotFound();
    }
  }

  function renderHouse(house) {
    titleEl.textContent = house.title || 'Untitled listing';
    locationEl.textContent = house.location || '';
    descriptionEl.textContent = house.description || '';

    // House.photos is currently an empty array for every listing
    // (Cloudinary upload not wired up yet) — fall back to a plain
    // placeholder rather than a broken <img>.
    if (house.photos && house.photos.length > 0) {
      photoEl.src = house.photos[0];
      photoEl.alt = house.title || 'House photo';
    } else {
      photoEl.removeAttribute('src');
      photoEl.alt = 'No photo available yet';
    }
  }

  function handleDatesChanged() {
    const start = startDateInput.value;
    const end = endDateInput.value;

    if (!start || !end || !currentHouse) {
      priceBreakdown.style.display = 'none';
      return;
    }

    const nights = nightsBetween(start, end);

    if (nights <= 0) {
      priceBreakdown.style.display = 'none';
      showMessage('Check-out must be after check-in.', 'warning');
      return;
    }

    clearMessage();

    const pricePerNight = Number(currentHouse.pricePerNight) || 0;
    const total = nights * pricePerNight;

    pricePerNightValue.textContent = formatPrice(pricePerNight);
    nightsValue.textContent = nights;
    totalValue.textContent = formatPrice(total);
    priceBreakdown.style.display = 'block';
  }

  function nightsBetween(startStr, endStr) {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const msPerNight = 1000 * 60 * 60 * 24;
    return Math.round((end - start) / msPerNight);
  }

  function formatPrice(amount) {
    return `$${amount.toFixed(2)}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    clearMessage();

    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    if (!startDate || !endDate || nightsBetween(startDate, endDate) <= 0) {
      showMessage('Please choose a valid check-in and check-out date.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: houseId,
          listingType: 'house',
          startDate,
          endDate,
        }),
      });

      if (res.status === 401) {
        // Not logged in — send to login, then back here afterwards.
        const redirectTarget = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `login.html?redirect=${redirectTarget}`;
        return;
      }

      if (res.status === 403) {
        // Known Issue #13: this is the path reserved for
        // "please verify your email before booking". As of this
        // writing, bookingController.js does NOT actually send this
        // check yet (still unread/unwritten) — so this branch is
        // ready on the frontend but nothing on the backend triggers
        // it yet. Once that patch lands, this message will surface
        // correctly without any frontend change needed.
        const data = await safeJson(res);
        showMessage(
          data.message || 'Please verify your email before booking. Check your inbox for the verification link.',
          'warning'
        );
        return;
      }

      if (!res.ok) {
        const data = await safeJson(res);
        showMessage(data.message || 'Something went wrong. Please try again.', 'error');
        return;
      }

      const booking = await safeJson(res);
      showMessage(
        'Booking requested! A confirmation email is on its way — check your inbox.',
        'success'
      );
      form.reset();
      priceBreakdown.style.display = 'none';
    } catch (err) {
      console.error('Booking submission failed:', err);
      showMessage('Could not reach the server. Please check your connection and try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Request Booking';
    }
  }

  async function safeJson(res) {
    try {
      return await res.json();
    } catch {
      return {};
    }
  }

  function showMessage(text, type) {
    formMessage.textContent = text;
    formMessage.className = `form-message ${type}`;
  }

  function clearMessage() {
    formMessage.textContent = '';
    formMessage.className = 'form-message';
  }

  function showNotFound() {
    loadingState.style.display = 'none';
    layout.style.display = 'none';
    notFoundState.style.display = 'block';
  }
})();
