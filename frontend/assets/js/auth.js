document.addEventListener("DOMContentLoaded", () => {

  const API_BASE = "http://127.0.0.1:5000";

  // Tabs
  const tabLogin = document.getElementById("tabLogin");
  const tabSignup = document.getElementById("tabSignup");

  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  const loginMessage = document.getElementById("loginMessage");
  const signupMessage = document.getElementById("signupMessage");

  const backToLogin = document.getElementById("backToLogin");
  const forgotBtn = document.getElementById("forgotBtn");

  // ---------------------
  // TAB SWITCHING
  // ---------------------
  function showLogin() {
    tabLogin.classList.add("active");
    tabSignup.classList.remove("active");

    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");

    loginMessage.className = "message";
signupMessage.className = "message";

loginMessage.textContent = "";
signupMessage.textContent = "";
  }

  function showSignup() {
    tabSignup.classList.add("active");
    tabLogin.classList.remove("active");

    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");

    loginMessage.className = "message";
signupMessage.className = "message";

loginMessage.textContent = "";
signupMessage.textContent = "";
  }

  tabLogin.addEventListener("click", showLogin);
  tabSignup.addEventListener("click", showSignup);
  backToLogin.addEventListener("click", showLogin);

  // =====================
  // REGISTER (BACKEND)
  // =====================
  signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = signupName.value.trim();
  const email = signupEmail.value.trim().toLowerCase();
  const password = signupPass.value;
  const password2 = signupPass2.value;

  signupMessage.className = "message error";

  if (!name || !email || !password) {
    signupMessage.textContent = "Please fill all fields.";
    return;
  }

  if (password.length < 6) {
    signupMessage.textContent = "Password must be at least 6 characters.";
    return;
  }

  if (password !== password2) {
    signupMessage.textContent = "Passwords do not match.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
  signupMessage.className = "message error";
  signupMessage.textContent = data.error || data.message || "Registration failed.";
  return;
}

    signupMessage.className = "message success";
    signupMessage.textContent = "Registration successful! Please login.";

    signupForm.reset();
    setTimeout(() => {
  showLogin();
  signupMessage.className = "message";
  signupMessage.textContent = "";
}, 1200);

  } catch (err) {
    signupMessage.className = "message error";
    signupMessage.textContent = "Server error. Try again.";
  }
});

  // =====================
  // LOGIN (BACKEND) ✅ JWT FIX
  // =====================
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginEmail.value.trim().toLowerCase();
    const password = loginPass.value;

   loginMessage.className = "message error";

    if (!email || !password) {
      loginMessage.textContent = "Enter email and password.";
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        loginMessage.textContent = data.error || "Invalid login.";
        return;
      }

      // ✅ STORE REAL AUTH DATA
      localStorage.setItem("cf_logged_in", "true");
      localStorage.setItem("cf_token", data.token);


      localStorage.setItem("cf_user", JSON.stringify(data.user));

      loginMessage.className = "message success";
      loginMessage.textContent = "Login successful! Redirecting...";

     setTimeout(() => {
  const user = data.user;

  if (user.role === "admin") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "index.html";
  }
}, 800);


    } catch (err) {
      console.error("Login error:", err);
      loginMessage.textContent = "Server error. Try again.";
    }
  });

  // =====================
  // FORGOT PASSWORD (DEMO)
  // =====================
  forgotBtn.addEventListener("click", () => {
    loginMessage.style.color = "#0b7a1f";
    loginMessage.textContent = "Password reset feature coming soon.";
  });

  // =====================
  // SOCIAL LOGIN (DEMO)
  // =====================
  document.getElementById("googleLogin").addEventListener("click", () => {
    localStorage.setItem("cf_logged_in", "true");
    localStorage.setItem("cf_user", JSON.stringify({
      name: "Google User",
      email: "googleuser@email.com"
    }));
    window.location.href = "index.html";
  });

  document.getElementById("facebookLogin").addEventListener("click", () => {
    localStorage.setItem("cf_logged_in", "true");
    localStorage.setItem("cf_user", JSON.stringify({
      name: "Facebook User",
      email: "facebookuser@email.com"
    }));
    window.location.href = "index.html";
  });

});
