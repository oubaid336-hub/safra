// Central place for your backend's URL.
// Auto-detects: localhost during local dev, LAN IP during phone testing,
// live Render URL everywhere else. No manual toggling needed before deploys.
const isLocalHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const isLanIp = /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(window.location.hostname);

const API_BASE_URL = (isLocalHost || isLanIp)
  ? `http://${window.location.hostname}:5000`
  : "https://safra-vv3z.onrender.com";
