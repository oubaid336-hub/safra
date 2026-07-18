const API_BASE_URL = window.API_BASE_URL || 'https://safra-claude.onrender.com';

async function loadFaqs() {
  const statusEl = document.getElementById('status');
  const listEl = document.getElementById('faq-list');
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/faq`, { credentials: 'include' });
    if (res.status === 401 || res.status === 403) {
      window.location.href = 'login.html';
      return;
    }
    const faqs = await res.json();
    if (!faqs.length) {
      listEl.innerHTML = '<p>No FAQs yet.</p>';
      return;
    }
    listEl.innerHTML = faqs.map(renderCard).join('');
    faqs.forEach(f => {
      document.getElementById(`save-${f._id}`).addEventListener('click', () => saveFaq(f._id));
      document.getElementById(`delete-${f._id}`).addEventListener('click', () => deleteFaq(f._id));
    });
  } catch (err) {
    statusEl.textContent = 'Failed to load FAQs.';
  }
}

function renderCard(f) {
  return `
    <div class="faq-card" id="card-${f._id}">
      <input type="text" id="q-${f._id}" value="${escapeAttr(f.question)}">
      <textarea id="a-${f._id}" rows="3">${escapeHtml(f.answer)}</textarea>
      <input type="number" id="o-${f._id}" value="${f.order ?? 0}" style="width:100px;">
      <div class="faq-actions">
        <button id="save-${f._id}">Save</button>
        <button id="delete-${f._id}">Delete</button>
      </div>
    </div>`;
}

async function saveFaq(id) {
  const question = document.getElementById(`q-${id}`).value;
  const answer = document.getElementById(`a-${id}`).value;
  const order = Number(document.getElementById(`o-${id}`).value) || 0;
  await fetch(`${API_BASE_URL}/api/admin/faq/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ question, answer, order })
  });
  loadFaqs();
}

async function deleteFaq(id) {
  if (!confirm('Delete this FAQ?')) return;
  await fetch(`${API_BASE_URL}/api/admin/faq/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  loadFaqs();
}

document.getElementById('add-btn').addEventListener('click', async () => {
  const question = document.getElementById('new-question').value.trim();
  const answer = document.getElementById('new-answer').value.trim();
  const order = Number(document.getElementById('new-order').value) || 0;
  if (!question || !answer) {
    alert('Question and answer are required.');
    return;
  }
  await fetch(`${API_BASE_URL}/api/admin/faq`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ question, answer, order })
  });
  document.getElementById('new-question').value = '';
  document.getElementById('new-answer').value = '';
  document.getElementById('new-order').value = '0';
  loadFaqs();
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, '&quot;');
}

loadFaqs();
