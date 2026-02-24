// assets/js/api.js
async function safeFetch(url, options = {}) {
  const token = localStorage.getItem("cf_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, { ...options, headers });

    // If unauthorized, clear session BUT do not auto redirect
    if (res.status === 401) {
      localStorage.removeItem("cf_token");
      localStorage.removeItem("cf_user");
      localStorage.removeItem("cf_logged_in");

      // Let the calling page decide what to do
      console.warn("Unauthorized request:", url);
    }

    return res;

  } catch (error) {
    console.error("Network error:", error);
    throw error;
  }
}