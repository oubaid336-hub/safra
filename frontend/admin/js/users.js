// admin/js/users.js — D5: Manage users (block/unblock/delete UI)
//
// FIELDS: "role" ("customer"/"admin") and "verified" are CONFIRMED
// real User fields — role is discussed directly in Known Issue #10,
// and verified is the exact field D1/booking's 403 flow already
// depends on. "name" and blocked-status are NOT confirmed the same
// way — no User.js field list like House.js/Car.js ever got pasted
// into a chat. Handled the same defensive way as D4:
//   - Display name tries user.name first, falls back to user.email
//     alone (guaranteed to exist — every login/signup flow in this
//     project is email-based).
//   - Blocked-status badge tries common candidate fields (isBlocked,
//     blocked, or status === 'blocked') and falls back to treating
//     the user as active if none of those are present, rather than
//     guessing wrong in the alarming direction.
// This guessing only affects the BADGE — the Block/Unblock buttons
// call the same routes either way and don't depend on knowing which
// field the backend actually uses.
//
// ROUTES (assumed by the same /api/admin/<resource>/:id/<action>
// pattern used for D3/D4, not confirmed directly against
// adminController.js/userRoutes.js content — A7-A9 confirmed
// block/unblock/delete WORK live, just not necessarily these exact
// strings):
//   GET /api/admin/users
//   PUT /api/admin/users/:id/block
//   PUT /api/admin/users/:id/unblock
//   DELETE /api/admin/users/:id
// NOTE: unlike D3's delete (confirmed on the public /api/houses/:id
// path), there's no evidence users have an equivalent public route —
// so DELETE here is assumed under /api/admin/, not following D3's
// exception.
//
// SELF-PROTECTION: fetches the logged-in admin's own id via the
// CONFIRMED GET /api/auth/me and disables Block/Delete on their own
// row, so an admin can't accidentally lock themselves out or delete
// their own account from this page.
//
// KNOWN ISSUE #16 REMINDER: blocking/deleting here has no effect on
// an already-active session until it expires or the user logs out
// (requireAuth never re-checks the DB). Surfaced in the page's
// scope-note, not repeated per-row to avoid clutter.

(function () {
  const statusBanner = document.getElementById('statusBanner');
  const loadingMsg = document.getElementById('loadingMsg');
  const emptyMsg = document.getElementById('emptyMsg');
  const usersList = document.getElementById('usersList');
  const logoutBtn = document.getElementById('logoutBtn');

  let currentAdminId = null;

  function showError(text) {
    statusBanner.textContent = text;
    statusBanner.classList.add('show');
  }

  function clearError() {
    statusBanner.classList.remove('show');
  }

  function isUserBlocked(user) {
    if (typeof user.isBlocked === 'boolean') return user.isBlocked;
    if (typeof user.blocked === 'boolean') return user.blocked;
    if (typeof user.status === 'string') return user.status === 'blocked';
    return false; // unknown shape — default to "active" rather than alarm
  }

  function getDisplayName(user) {
    return user.name || user.email || 'Unknown user';
  }

  // Admins first, then customers, alphabetically within each group —
  // easier to scan than server order when the list grows.
  function sortUsers(users) {
    const roleOrder = { admin: 0, customer: 1 };
    return [...users].sort((a, b) => {
      const roleDiff = (roleOrder[a.role] ?? 2) - (roleOrder[b.role] ?? 2);
      if (roleDiff !== 0) return roleDiff;
      return getDisplayName(a).localeCompare(getDisplayName(b));
    });
  }

  function buildCard(user) {
    const card = document.createElement('div');
    card.className = 'user-card';

    const info = document.createElement('div');
    info.className = 'user-info';

    const nameLine = document.createElement('div');
    nameLine.className = 'name-line';
    nameLine.textContent = getDisplayName(user);

    const meta = document.createElement('div');
    meta.className = 'meta';
    // Only show email separately if a real name was available above —
    // otherwise the name line already IS the email.
    meta.textContent = user.name && user.email ? user.email : '';

    info.appendChild(nameLine);
    if (meta.textContent) info.appendChild(meta);

    const tagRow = document.createElement('div');
    tagRow.className = 'tag-row';

    const isSelf = currentAdminId && user._id === currentAdminId;
    const blocked = isUserBlocked(user);

    const roleTag = document.createElement('span');
    roleTag.className = 'tag ' + (user.role === 'admin' ? 'role-admin' : 'role-customer');
    roleTag.textContent = user.role || 'customer';
    tagRow.appendChild(roleTag);

    const statusTag = document.createElement('span');
    statusTag.className = 'tag ' + (blocked ? 'status-blocked' : 'status-active');
    statusTag.textContent = blocked ? 'blocked' : 'active';
    tagRow.appendChild(statusTag);

    if (user.verified === false) {
      const unverifiedTag = document.createElement('span');
      unverifiedTag.className = 'tag unverified';
      unverifiedTag.textContent = 'unverified';
      tagRow.appendChild(unverifiedTag);
    }

    if (isSelf) {
      const selfTag = document.createElement('span');
      selfTag.className = 'tag self-tag';
      selfTag.textContent = 'you';
      tagRow.appendChild(selfTag);
    }

    const actions = document.createElement('div');
    actions.className = 'user-actions';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = blocked ? 'unblock-btn' : 'block-btn';
    toggleBtn.textContent = blocked ? 'Unblock' : 'Block';
    toggleBtn.disabled = isSelf;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.disabled = isSelf;

    toggleBtn.addEventListener('click', () =>
      setBlockedState(user._id, blocked ? 'unblock' : 'block', card)
    );
    deleteBtn.addEventListener('click', () =>
      deleteUser(user._id, getDisplayName(user), card)
    );

    actions.appendChild(toggleBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(info);
    card.appendChild(tagRow);
    card.appendChild(actions);

    return card;
  }

  async function setBlockedState(id, action, cardEl) {
    const buttons = cardEl.querySelectorAll('button');
    buttons.forEach((b) => (b.disabled = true));
    clearError();

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}/${action}`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (res.status === 401 || res.status === 403) {
        window.location.href = 'login.html';
        return;
      }

      if (!res.ok) {
        showError('Something went wrong updating that user. Please try again.');
        buttons.forEach((b) => (b.disabled = false));
        return;
      }

      await loadAll();

    } catch (err) {
      console.error(`Failed to ${action} user ${id}:`, err);
      showError('Something went wrong updating that user. Please try again.');
      buttons.forEach((b) => (b.disabled = false));
    }
  }

  async function deleteUser(id, name, cardEl) {
    const confirmed = window.confirm(
      `Delete "${name}" permanently? This can't be undone.`
    );
    if (!confirmed) return;

    const buttons = cardEl.querySelectorAll('button');
    buttons.forEach((b) => (b.disabled = true));
    clearError();

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.status === 401 || res.status === 403) {
        window.location.href = 'login.html';
        return;
      }

      if (!res.ok) {
        showError('Something went wrong deleting that user. Please try again.');
        buttons.forEach((b) => (b.disabled = false));
        return;
      }

      await loadAll();

    } catch (err) {
      console.error(`Failed to delete user ${id}:`, err);
      showError('Something went wrong deleting that user. Please try again.');
      buttons.forEach((b) => (b.disabled = false));
    }
  }

  // Confirmed route (added to authController.js/authRoutes.js during
  // Phase D prep) — used only to identify "this is me" for the
  // self-protection guard, not as an auth gate (loadAll's own fetch
  // already handles 401/403).
  async function loadCurrentAdminId() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include'
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data._id || data.id || null;
    } catch (err) {
      console.error('Failed to load current admin identity:', err);
      return null;
    }
  }

  async function loadAll() {
    try {
      const [me, res] = await Promise.all([
        currentAdminId ? Promise.resolve(currentAdminId) : loadCurrentAdminId(),
        fetch(`${API_BASE_URL}/api/admin/users`, { method: 'GET', credentials: 'include' })
      ]);
      currentAdminId = me;

      if (res.status === 401 || res.status === 403) {
        window.location.href = 'login.html';
        return;
      }

      if (!res.ok) {
        loadingMsg.style.display = 'none';
        showError('Something went wrong loading users. Please try again.');
        return;
      }

      const users = await res.json();
      loadingMsg.style.display = 'none';
      usersList.innerHTML = '';

      if (!users || users.length === 0) {
        emptyMsg.style.display = 'block';
        return;
      }
      emptyMsg.style.display = 'none';

      sortUsers(users).forEach((user) => {
        usersList.appendChild(buildCard(user));
      });

    } catch (err) {
      console.error('Failed to load users:', err);
      loadingMsg.style.display = 'none';
      showError('Something went wrong loading users. Please try again.');
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
