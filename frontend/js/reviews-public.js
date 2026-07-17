// reviews.js — C9: Review submission form
//
// USAGE: reviews.html?listingId=<id>&listingType=house|car
// (needs a "Reviews" / "Write a review" link added to house-detail.html
// and car-detail.html pointing here with the right params — not added
// automatically since I don't have those files' actual markup).
//
// CONFIRMED (unlike most other pages built so far, this one rests on
// solid ground — reviewRoutes.js and reviewController.js were both
// fully read and confirmed in Phase A):
//   GET  ${API_BASE_URL}/api/reviews/:listingType/:listingId
//     -> public, returns only approved:true reviews, userId populated
//        to the reviewer's name.
//   POST ${API_BASE_URL}/api/reviews
//     -> requireAuth only (any logged-in user, not admin-only).
//        Body: { listingId, listingType, rating, comment }.
//
// UPDATE (auto-approve decision): reviews are meant to go live
// immediately now instead of waiting for admin approval, so the
// success message below no longer tells the user to wait for
// approval. IMPORTANT — this message change is COSMETIC ONLY. The
// actual behavior still depends on reviewController.js's
// createReview(), which currently hard-codes `approved: false` in the
// Review.create() call regardless of Review.js's schema default. Until
// that backend line is changed too, a submitted review will say
// "live" here but still not actually show up under approved-only
// filtering until an admin approves it from the D6 admin panel. Don't
// ship this message change without the backend change alongside it,
// or the UI will be lying to users.

(function () {
  const params = new URLSearchParams(window.location.search);
  const listingId = params.get('listingId');
  const listingType = params.get('listingType') === 'car' ? 'car' : 'house';

  const listingContext = document.getElementById('listing-context');
  const loadingState = document.getElementById('loading-state');
  const noReviewsState = document.getElementById('no-reviews-state');
  const reviewList = document.getElementById('review-list');

  const reviewFormSection = document.getElementById('review-form-section');
  const loginToReview = document.getElementById('login-to-review');
  const form = document.getElementById('review-form');
  const ratingSelect = document.getElementById('rating-select');
  const commentInput = document.getElementById('review-comment');
  const submitBtn = document.getElementById('submit-review-btn');
  const formMessage = document.getElementById('form-message');

  if (!listingId) {
    listingContext.textContent = 'No listing specified.';
    loadingState.style.display = 'none';
    return;
  }

  loadListingContext();
  loadReviews();
  checkAuthForForm();
  setupRatingButtons();

  form.addEventListener('submit', handleSubmit);

  async function loadListingContext() {
    try {
      const endpoint = listingType === 'car' ? 'cars' : 'houses';
      const res = await fetch(`${API_BASE_URL}/api/${endpoint}/${listingId}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        listingContext.textContent = `Reviews for this ${listingType}`;
        return;
      }
      const data = await res.json();
      const listing = data.house || data.car || data;
      listingContext.textContent = `Reviews for ${listing.title || `this ${listingType}`}`;
    } catch {
      listingContext.textContent = `Reviews for this ${listingType}`;
    }
  }

  async function loadReviews() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/${listingType}/${listingId}`);

      if (!res.ok) {
        loadingState.textContent = 'Could not load reviews right now.';
        return;
      }

      const data = await res.json();
      const reviews = data.reviews || data || [];

      loadingState.style.display = 'none';

      if (!reviews.length) {
        noReviewsState.style.display = 'block';
        return;
      }

      reviews.forEach(renderReview);
    } catch (err) {
      console.error('Failed to load reviews:', err);
      loadingState.textContent = 'Could not reach the server.';
    }
  }

  function renderReview(review) {
    const card = document.createElement('div');
    card.className = 'review-card card-style';
    const reviewerName = review.userId?.name || review.reviewerName || 'Anonymous';
    const date = review.createdAt
      ? new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
      : '';

    card.innerHTML = `
      <div class="review-header">
        <span class="reviewer-name">${escapeHtml(reviewerName)}</span>
        <span class="review-date">${date}</span>
      </div>
      <div class="stars">${'★'.repeat(review.rating || 0)}${'☆'.repeat(5 - (review.rating || 0))}</div>
      <p class="review-comment">${escapeHtml(review.comment || '')}</p>
    `;
    reviewList.appendChild(card);
  }

  async function checkAuthForForm() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: 'include',
      });

      if (res.ok) {
        reviewFormSection.style.display = 'block';
      } else {
        loginToReview.style.display = 'block';
      }
    } catch {
      loginToReview.style.display = 'block';
    }
  }

  function setupRatingButtons() {
    const buttons = ratingSelect.querySelectorAll('button');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const value = Number(btn.dataset.value);
        ratingSelect.dataset.rating = value;
        buttons.forEach((b) => {
          b.classList.toggle('selected', Number(b.dataset.value) <= value);
        });
      });
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    clearMessage();

    const rating = Number(ratingSelect.dataset.rating) || 0;
    const comment = commentInput.value.trim();

    if (rating < 1 || rating > 5) {
      showMessage('Please select a star rating.', 'error');
      return;
    }

    if (!comment) {
      showMessage('Please write a short review before submitting.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, listingType, rating, comment }),
      });

      if (res.status === 401) {
        reviewFormSection.style.display = 'none';
        loginToReview.style.display = 'block';
        return;
      }

      if (!res.ok) {
        const data = await safeJson(res);
        showMessage(data.message || 'Something went wrong. Please try again.', 'error');
        return;
      }

      showMessage(
        'Thanks! Your review is now live.',
        'success'
      );
      form.reset();
      ratingSelect.dataset.rating = 0;
      ratingSelect.querySelectorAll('button').forEach((b) => b.classList.remove('selected'));
    } catch (err) {
      console.error('Review submission failed:', err);
      showMessage('Could not reach the server. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Review';
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

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
