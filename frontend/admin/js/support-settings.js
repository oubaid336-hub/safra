const API_BASE_URL = window.API_BASE_URL || 'https://safra-claude.onrender.com';

async function loadSettings() {
  const statusEl = document.getElementById('status');
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/support-settings`, { credentials: 'include' });
    if (res.status === 401 || res.status === 403) {
      window.location.href = 'login.html';
      return;
    }
    const settings = await res.json();
    document.getElementById('supportEmail').value = settings.supportEmail || '';
    document.getElementById('supportPhone').value = settings.supportPhone || '';
    document.getElementById('supportHours').value = settings.supportHours || '';
    document.getElementById('whatsappNumber').value = settings.whatsappNumber || '';
  } catch (err) {
    statusEl.textContent = 'Failed to load settings.';
  }
}

document.getElementById('settings-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const statusEl = document.getElementById('status');
  const body = {
    supportEmail: document.getElementById('supportEmail').value,
    supportPhone: document.getElementById('supportPhone').value,
    supportHours: document.getElementById('supportHours').value,
    whatsappNumber: document.getElementById('whatsappNumber').value
  };
  try {
    await fetch(`${API_BASE_URL}/api/admin/support-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body)
    });
    statusEl.textContent = 'Saved.';
  } catch (err) {
    statusEl.textContent = 'Failed to save settings.';
  }
});

loadSettings();
