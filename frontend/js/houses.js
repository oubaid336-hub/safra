async function loadHouses() {
  const container = document.getElementById('house-list');
  try {
    const res = await fetch(`${API_BASE_URL}/api/houses`);
    if (!res.ok) {
      throw new Error(`Server responded with ${res.status}`);
    }
    const houses = await res.json();

    container.innerHTML = '';

    if (houses.length === 0) {
      container.innerHTML = '<p>No houses available right now.</p>';
      return;
    }

    houses.forEach(house => {
      container.innerHTML += `
        <div class="house-card">
          <h3>${house.title}</h3>
          <p>${house.location} -- $${house.pricePerNight}/night</p>
        </div>
      `;
    });
  } catch (err) {
    console.error('Failed to load houses:', err);
    container.innerHTML = '<p>Could not load houses right now.</p>';
  }
}

loadHouses();
