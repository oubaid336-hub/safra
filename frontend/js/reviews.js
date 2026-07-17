// admin/js/reviews.js — D6: Manage reviews (approve/delete UI)
//
// UPDATE: Review.js and reviewController.js content is now confirmed
// (pasted into chat) — the field-name guesses this file used to make
// are resolved: userId (ref, populate with "name"), listingId,
// listingType (enum house/car), rating (Number 1-5, no "stars"
// alternate), comment (String, no "text"/"body" alternate), approved
// (Boolean). The ONE thing still unconfirmed is the ADMIN-specific
// list/approve/delete endpoints this page actually calls — the
// content read so far only covers the PUBLIC create/list functions
// (createReview, getReviewsForListing), not an admin equivalent. So
// getReviewerLabel() still has a fallback for the case where the
// admin list endpoint doesn't populate userId the same way the public
// one does.
//
// UPDATE (auto-approve decision): reviews now auto-approve on
// submission — this page shifted from a pre-publish moderation queue
// to a spot-check tool. No code change was needed here for that
// (Approve/Delete still call the same routes and still work correctly
// regardless of current approved state).
//
// IMPORTANT — reviewController.js's createReview() HARD-CODES
// `approved: false` in the Review.create() call itself, overriding
// whatever the schema default says. Flipping ONLY Review.js's schema
// default to true will NOT turn on auto-approve by itself — the
// explicit `approved: false` inside createReview() has to change too.
// See the master plan for the exact fix.
//
// CONFIRMED (via A10-A11, live-tested end to end): the full submit ->
// pending -> approve -> public flow works, a review is correctly
// hidden while approved:false and shown with the reviewer's name
// populated after approval, and delete removes it for good. (This was
// the behavior BEFORE the auto-approve decision above — the mechanism
// itself, approve flips a boolean, is unchanged either way.)
//
// FIELD NAMES: all confirmed now (see the UPDATE block above) except
// whether the admin-only list endpoint populates `userId` the same
// way the public one does.
//
// ROUTES (still assumed by the same /api/admin/<resource>/:id/<action>
// pattern as D3-D5, not re-confirmed as exact strings — A10/A11
// confirmed the ACTIONS work live, and the content pasted in covers
// only the PUBLIC create/list functions, not an admin-side one):
//   GET /api/admin/reviews
//   PUT /api/admin/reviews/:id/approve
//   DELETE /api/admin/reviews/:id
// Delete assumed under /api/admin/ (no evidence of a public-path
// exception the way D3's house/car delete had).

(function () {
  const statusBanner = document.getElementById('statusBanner');
  const loadingMsg = document.getElementById('loadingMsg');
  const emptyMsg = document.getElementById('emptyMsg');
  const reviewsList = document.getElementById('reviewsList');
  const logoutBtn = document.getElementById('logoutBtn');

  function showError(text) {
    statusBanner.textContent = text;
    statusBanner.classList.add('show');
  }

  function clearError() {
    statusBanner.classList.remove('show');
  }

  // Post-auto-approve model: pending should be rare now (only leftover
  // reviews from before the flip, or if moderation ever gets turned
  // back on) — those still bubble to the top since they need real
  // action. Everything else sorts newest-first, since this page's job
  // shifted from "clear the queue" to "spot-check what just went
  // live."
  function sortForSpotCheck(items) {
    return [...items].sort((a, b) => {
      const approvedDiff = Number(a.approved) - Number(b.approved);
      if (approvedDiff !== 0) return approvedDiff;
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }

  // Review.js confirms `rating` is the only field (Number, 1-5, no
  // "stars" alternate) — no fallback needed anymore.
  function getRating(review) {
    const num = Number(review.rating);
    if (!num || num < 1) return null;
    return Math.min(5, Math.round(num));
  }

  // Review.js confirms `comment` is the only field (String) — no
  // fallback needed anymore.
  function getComment(review) {
    return review.comment || null;
  }

  // Review.js confirms the ref field is named `userId`, and the
  // CONFIRMED public route (reviewController.js's getReviewsForListing)
  // populates it with just `name`. The ADMIN list endpoint this page
  // calls is a different, still-unconfirmed function — if it doesn't
  // populate the same way, `userId` arrives as a raw ObjectId string
  // instead of an object, which the fallback below still handles.
  function getReviewerLabel(review) {
    const candidate = review.userId;
    if (candidate && typeof candidate === 'object') {
      if (candidate.name) return candidate.name;
      if (candidate.email) return candidate.email;
    }
    if (typeof candidate === 'string') return `Reviewer ID: ${candidate}`;
    return 'Anonymous';
  }

  function getListingType(review) {
    const type = review.listingType;
    return (type === 'house' || type === 'car') ? type : null;
  }

  function getListingId(review) {
    return review.listingId || null;
  }

  function formatDate(value) {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // Same per-item title lookup pattern D4 (bookings.js) already uses.
  async function fetchListingTitle(review) {
    const type = getListingType(review);
    const id = getListingId(review);
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
      console.error(`Failed to fetch ${type} ${id} for review:`, err);
      return 'Listing unavailable';
    }
  }

  function buildCard(review, listingTitle) {
    const card = document.createElement('div');
    card.className = 'review-card';

    const info = document.createElement('div');
    info.className = 'review-info';

    const type = getListingType(review);
    const titleLine = document.createElement('div');
    titleLine.className = 'title-line';
    titleLine.textContent = listingTitle;
    if (type) {
      const typeTag = document.createElement('span');
      typeTag.className = 'type-tag';
      typeTag.textContent = type;
      titleLine.appendChild(typeTag);
    }
    info.appendChild(titleLine);

    const rating = getRating(review);
    if (rating) {
      const stars = document.createElement('div');
      stars.className = 'stars';
      stars.textContent = '★'.repeat(rating) + '☆'.repeat(5 - rating);
      info.appendChild(stars);
    }

    const comment = getComment(review);
    if (comment) {
      const commentEl = document.createElement('div');
      commentEl.className = 'comment';
      commentEl.textContent = comment;
      info.appendChild(commentEl);
    }

    const meta = document.createElement('div');
    meta.className = 'meta';
    const datePart = formatDate(review.createdAt);
    meta.textContent = [getReviewerLabel(review), datePart].filter(Boolean).join(' · ');
    info.appendChild(meta);

    const badge = document.createElement('span');
    badge.className = 'status-badge ' + (review.approved ? 'approved' : 'pending');
    badge.textContent = review.approved ? 'approved' : 'pending';

    const actions = document.createElement('div');
    actions.className = 'review-actions';

    const approveBtn = document.createElement('button');
    approveBtn.className = 'approve-btn';
    approveBtn.textContent = 'Approve';
    approveBtn.disabled = !!review.approved;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';

    approveBtn.addEventListener('click', () => approveReview(review._id, card));
    deleteBtn.addEventListener('click', () => deleteReview(review._id, card));

    actions.appendChild(approveBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(info);
    card.appendChild(badge);
    card.appendChild(actions);

    return card;
  }

  async function approveReview(id, cardEl) {
    const buttons = cardEl.querySelectorAll('button');
    buttons.forEach((b) => (b.disabled = true));
    clearError();

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/reviews/${id}/approve`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (res.status === 401 || res.status === 403) {
        window.location.href = 'login.html';
        return;
      }

      if (!res.ok) {
        showError('Something went wrong approving that review. Please try again.');
        buttons.forEach((b) => (b.disabled = false));
        return;
      }

      await loadAll();

    } catch (err) {
      console.error(`Failed to approve review ${id}:`, err);
      showError('Something went wrong approving that review. Please try again.');
      buttons.forEach((b) => (b.disabled = false));
    }
  }

  async function deleteReview(id, cardEl) {
    const confirmed = window.confirm('Delete this review permanently? This can\'t be undone.');
    if (!confirmed) return;

    const buttons = cardEl.querySelectorAll('button');
    buttons.forEach((b) => (b.disabled = true));
    clearError();

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/reviews/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.status === 401 || res.status === 403) {
        window.location.href = 'login.html';
        return;
      }

      if (!res.ok) {
        showError('Something went wrong deleting that review. Please try again.');
        buttons.forEach((b) => (b.disabled = false));
        return;
      }

      await loadAll();

    } catch (err) {
      console.error(`Failed to delete review ${id}:`, err);
      showError('Something went wrong deleting that review. Please try again.');
      buttons.forEach((b) => (b.disabled = false));
    }
  }

  async function loadAll() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/reviews`, {
        method: 'GET',
        credentials: 'include'
      });

      if (res.status === 401 || res.status === 403) {
        window.location.href = 'login.html';
        return;
      }

      if (!res.ok) {
        loadingMsg.style.display = 'none';
        showError('Something went wrong loading reviews. Please try again.');
        return;
      }

      const reviews = await res.json();
      loadingMsg.style.display = 'none';
      reviewsList.innerHTML = '';

      if (!reviews || reviews.length === 0) {
        emptyMsg.style.display = 'block';
        return;
      }
      emptyMsg.style.display = 'none';

      const sorted = sortForSpotCheck(reviews);
      const titles = await Promise.all(sorted.map(fetchListingTitle));
      sorted.forEach((review, i) => {
        reviewsList.appendChild(buildCard(review, titles[i]));
      });

    } catch (err) {
      console.error('Failed to load reviews:', err);
      loadingMsg.style.display = 'none';
      showError('Something went wrong loading reviews. Please try again.');
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
