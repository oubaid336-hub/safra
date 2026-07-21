const API_BASE_URL = window.API_BASE_URL || 'https://safra-claude.onrender.com';

async function loadMessages() {
  const statusEl = document.getElementById('status');
  const listEl = document.getElementById('messages-list');
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/contact-messages`, { credentials: 'include' });
    if (res.status === 401 || res.status === 403) {
      window.location.href = 'login.html';
      return;
    }
    const messages = await res.json();
    if (!messages.length) {
      listEl.innerHTML = '<p>No messages yet.</p>';
      return;
    }
    messages.sort((a, b) => (a.handled === b.handled) ? 0 : a.handled ? 1 : -1);
    listEl.innerHTML = messages.map(renderCard).join('');
    messages.forEach(m => {
      document.getElementById(`toggle-${m._id}`).addEventListener('click', () => toggleHandled(m._id, !m.handled));
      document.getElementById(`delete-${m._id}`).addEventListener('click', () => deleteMessage(m._id));
    });
  } catch (err) {
    statusEl.textContent = 'Failed to load messages.';
  }
}

function renderCard(m) {
  const date = new Date(m.createdAt).toLocaleString();
  return `
    <div class="msg-card ${m.handled ? 'handled' : ''}">
      <div class="msg-header">
        <strong>${escapeHtml(m.name)}</strong>
        <span class="badge ${m.handled ? 'handled' : 'new'}">${m.handled ? 'Handled' : 'New'}</span>
      </div>
      <p>${escapeHtml(m.email)}</p>
      <p>${escapeHtml(m.message)}</p>
      <small>${date}</small>
      <div class="msg-actions">
        <button id="toggle-${m._id}">${m.handled ? 'Mark unhandled' : 'Mark handled'}</button>
        <button id="delete-${m._id}">Delete</button>
      </div>
    </div>`;
}

async function toggleHandled(id, handled) {
  await fetch(`${API_BASE_URL}/api/admin/contact-messages/${id}/handled`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ handled })
  });
  loadMessages();
}

async function deleteMessage(id) {
  if (!confirm('Delete this message?')) return;
  await fetch(`${API_BASE_URL}/api/admin/contact-messages/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  loadMessages();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

loadMessages();

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
