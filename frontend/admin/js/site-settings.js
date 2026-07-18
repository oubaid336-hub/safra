const API_BASE_URL = window.API_BASE_URL || 'https://safra-claude.onrender.com';

async function loadSettings() {
  const statusEl = document.getElementById('status');
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/site-settings`, { credentials: 'include' });
    if (res.status === 401 || res.status === 403) {
      window.location.href = 'login.html';
      return;
    }
    const settings = await res.json();
    document.getElementById('siteName').value = settings.siteName || 'Safra';
    document.getElementById('logoText').value = settings.logoText || 'S';
    document.getElementById('badge-letter').textContent = settings.logoText || 'S';
    document.getElementById('currency').value = settings.currency || 'TND';
    document.getElementById('maintenanceMode').checked = !!settings.maintenanceMode;
  } catch (err) {
    statusEl.textContent = 'Failed to load settings.';
  }
}

document.getElementById('logoText').addEventListener('input', (e) => {
  document.getElementById('badge-letter').textContent = e.target.value || 'S';
});

document.getElementById('settings-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const statusEl = document.getElementById('status');
  const body = {
    siteName: document.getElementById('siteName').value,
    logoText: document.getElementById('logoText').value,
    currency: document.getElementById('currency').value,
    maintenanceMode: document.getElementById('maintenanceMode').checked
  };
  try {
    await fetch(`${API_BASE_URL}/api/admin/site-settings`, {
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
