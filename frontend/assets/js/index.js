// assets/js/index.js
const API_BASE = "http://https://college-finder-fx5r.onrender.com";

async function loadColleges() {
  try {
    const res = await fetch(`${API_BASE}/api/colleges`);
    if (!res.ok) throw new Error("Failed to load colleges");

    const data = await res.json();

    // expose globally for home.js
    window.COLLEGES = data;

    // notify home.js that data is ready
    window.dispatchEvent(new Event("colleges-loaded"));

  } catch (err) {
    console.error("Backend error:", err);
    window.COLLEGES = [];
    window.dispatchEvent(new Event("colleges-loaded"));
  }
}

loadColleges();
