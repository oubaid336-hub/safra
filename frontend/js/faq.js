// faq.js — C10: Public FAQ page logic
//
// ASSUMPTION: GET ${API_BASE_URL}/api/faq is the public list endpoint.
// The route map (SAFRA-PROJECT-REFERENCE.txt Section 4) only confirms
// the ADMIN side of FAQ routes (POST/PUT/DELETE /api/admin/faq) —
// the public GET path was never explicitly confirmed, this is the
// most natural guess given the /api/admin/faq naming. If your real
// public route differs (e.g. /api/faqs, plural), change the URL below.
//
// Sorts client-side by the "order" field (CONFIRMED on Faq.js:
// "Number, default 0 — for custom display sort order rather than
// createdAt/alphabetical") in case the backend doesn't already sort.

(function () {
  const loadingState = document.getElementById('loading-state');
  const emptyState = document.getElementById('empty-state');
  const faqList = document.getElementById('faq-list');

  loadFaqs();

  async function loadFaqs() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/faq`);

      if (!res.ok) {
        loadingState.textContent = 'Could not load FAQs right now. Please try again later.';
        return;
      }

      const data = await res.json();
      let faqs = data.faqs || data || [];

      faqs = [...faqs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      loadingState.style.display = 'none';

      if (!faqs.length) {
        emptyState.style.display = 'block';
        return;
      }

      faqs.forEach(renderFaq);
    } catch (err) {
      console.error('Failed to load FAQs:', err);
      loadingState.textContent = 'Could not reach the server. Please try again later.';
    }
  }

  function renderFaq(faq) {
    const item = document.createElement('div');
    item.className = 'faq-item card-style';
    item.innerHTML = `
      <button type="button" class="faq-question">
        <span>${escapeHtml(faq.question || '')}</span>
        <span class="chevron">▾</span>
      </button>
      <div class="faq-answer">${escapeHtml(faq.answer || '')}</div>
    `;

    item.querySelector('.faq-question').addEventListener('click', () => {
      item.classList.toggle('open');
      const answerEl = item.querySelector('.faq-answer');
      answerEl.style.maxHeight = item.classList.contains('open')
        ? `${answerEl.scrollHeight}px`
        : '0';
    });

    faqList.appendChild(item);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
