// car-booking.js — C6: Car booking form logic
// Mirrors booking.js (houses, C5) — same structure, same assumptions
// about auth (cookie-based, credentials: 'include') and about the
// server calculating the real totalPrice on submit.
//
// ADDITIONAL ASSUMPTIONS ON TOP OF booking.js'S:
//   1. Opened as car-booking.html?carId=<id> — car-detail.html (C6
//      part 1) already builds this link correctly.
//   2. GET  ${API_BASE_URL}/api/cars/:id returns a single car object
//      with a "pricePerDay" field (Car.js fields are UNCONFIRMED —
//      see car-detail.js's header comment. If the real field is
//      "pricePerNight" instead, this code already falls back to that,
//      same as car-detail.js does).
//   3. POST ${API_BASE_URL}/api/bookings body uses
//      listingType: "car" (vs "house" in booking.js) — matches
//      Booking.js's confirmed listingType: "house" | "car" enum.

(function () {
  const params = new URLSearchParams(window.location.search);
  const carId = params.get('carId');

  const loadingState = document.getElementById('loading-state');
  const notFoundState = document.getElementById('not-found-state');
  const layout = document.getElementById('booking-layout');

  const photoEl = document.getElementById('car-photo');
  const titleEl = document.getElementById('car-title');
  const locationEl = document.getElementById('car-location');
  const descriptionEl = document.getElementById('car-description');

  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');
  const priceBreakdown = document.getElementById('price-breakdown');
  const pricePerDayValue = document.getElementById('price-per-day-value');
  const daysValue = document.getElementById('days-value');
  const totalValue = document.getElementById('total-value');

  const form = document.getElementById('booking-form');
  const submitBtn = document.getElementById('submit-btn');
  const formMessage = document.getElementById('form-message');

  let currentCar = null;

  if (!carId) {
    showNotFound();
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  startDateInput.min = today;
  endDateInput.min = today;

  loadCar(carId);

  startDateInput.addEventListener('change', handleDatesChanged);
  endDateInput.addEventListener('change', handleDatesChanged);
  form.addEventListener('submit', handleSubmit);

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
      currentCar = data.car || data;

      renderCar(currentCar);
      loadingState.style.display = 'none';
      layout.style.display = 'grid';
    } catch (err) {
      console.error('Failed to load car:', err);
      showNotFound();
    }
  }

  function renderCar(car) {
    titleEl.textContent = car.title || 'Untitled listing';
    locationEl.textContent = car.location || '';
    descriptionEl.textContent = car.description || '';

    if (car.photos && car.photos.length > 0) {
      photoEl.src = car.photos[0];
      photoEl.alt = car.title || 'Car photo';
    } else {
      photoEl.removeAttribute('src');
      photoEl.alt = 'No photo available yet';
    }
  }

  function handleDatesChanged() {
    const start = startDateInput.value;
    const end = endDateInput.value;

    if (!start || !end || !currentCar) {
      priceBreakdown.style.display = 'none';
      return;
    }

    const days = daysBetween(start, end);

    if (days <= 0) {
      priceBreakdown.style.display = 'none';
      showMessage('Return date must be after pickup date.', 'warning');
      return;
    }

    clearMessage();

    const pricePerDay = Number(currentCar.pricePerDay ?? currentCar.pricePerNight) || 0;
    const total = days * pricePerDay;

    pricePerDayValue.textContent = formatPrice(pricePerDay);
    daysValue.textContent = days;
    totalValue.textContent = formatPrice(total);
    priceBreakdown.style.display = 'block';
  }

  function daysBetween(startStr, endStr) {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((end - start) / msPerDay);
  }

  function formatPrice(amount) {
    return `$${amount.toFixed(2)}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    clearMessage();

    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    if (!startDate || !endDate || daysBetween(startDate, endDate) <= 0) {
      showMessage('Please choose a valid pickup and return date.', 'error');
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
          listingId: carId,
          listingType: 'car',
          startDate,
          endDate,
        }),
      });

      if (res.status === 401) {
        const redirectTarget = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `login.html?redirect=${redirectTarget}`;
        return;
      }

      if (res.status === 403) {
        // Same Known Issue #13 caveat as booking.js: this branch is
        // ready but bookingController.js doesn't send this check yet.
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

      await safeJson(res);
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
