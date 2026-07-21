const API_BASE_URL = window.API_BASE_URL || 'https://safra-claude.onrender.com';

async function loadReviews() {
  const statusEl = document.getElementById('status');
  const listEl = document.getElementById('reviews-list');
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/reviews`, { credentials: 'include' });
    if (res.status === 401 || res.status === 403) {
      window.location.href = 'login.html';
      return;
    }
    const reviews = await res.json();
    if (!reviews.length) {
      listEl.innerHTML = '<p>No reviews yet.</p>';
      return;
    }
    reviews.sort((a, b) => (a.approved === b.approved) ? 0 : a.approved ? 1 : -1);
    listEl.innerHTML = reviews.map(renderCard).join('');
    reviews.forEach(r => {
      const approveBtn = document.getElementById(`approve-${r._id}`);
      if (approveBtn) approveBtn.addEventListener('click', () => approveReview(r._id));
      document.getElementById(`delete-${r._id}`).addEventListener('click', () => deleteReview(r._id));
    });
  } catch (err) {
    statusEl.textContent = 'Failed to load reviews.';
  }
}

function renderCard(r) {
  const date = new Date(r.createdAt).toLocaleString();
  const reviewer = r.userId ? `${escapeHtml(r.userId.name)} (${escapeHtml(r.userId.email)})` : 'Unknown user';
  const stars = '★'.repeat(r.rating || 0) + '☆'.repeat(5 - (r.rating || 0));
  const approveBtn = r.approved ? '' : `<button id="approve-${r._id}">Approve</button>`;
  return `
    <div class="review-card ${r.approved ? '' : 'unapproved'}">
      <div class="review-header">
        <strong>${reviewer}</strong>
        <span class="badge ${r.approved ? 'approved' : 'unapproved'}">${r.approved ? 'Approved' : 'Unapproved'}</span>
      </div>
      <p class="stars">${stars}</p>
      <p><em>${escapeHtml(r.listingType || 'listing')}</em></p>
      <p>${escapeHtml(r.comment || '')}</p>
      <small>${date}</small>
      <div class="review-actions">
        ${approveBtn}
        <button id="delete-${r._id}">Delete</button>
      </div>
    </div>`;
}

async function approveReview(id) {
  await fetch(`${API_BASE_URL}/api/admin/reviews/${id}/approve`, {
    method: 'PUT',
    credentials: 'include'
  });
  loadReviews();
}

async function deleteReview(id) {
  if (!confirm('Delete this review?')) return;
  await fetch(`${API_BASE_URL}/api/admin/reviews/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  loadReviews();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

loadReviews();

document.getElementById('logoutBtn').addEventListener('click', async function () {
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
