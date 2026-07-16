// Central place for your backend's URL.
// Auto-detects: localhost during local dev, live Render URL everywhere else.
// No manual toggling needed before deploys.
const API_BASE_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "http://localhost:5000"
  : "https://safra-claude.onrender.com";
