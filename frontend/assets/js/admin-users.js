const API_BASE = "https://college-finder-fx5r.onrender.com";
const token = localStorage.getItem("cf_token");
const currentUser = JSON.parse(localStorage.getItem("cf_user"));

if (!token) {
  window.location.href = "auth.html";
}

/* ================= LOAD USERS ================= */

async function loadUsers() {
  const res = await fetch(`${API_BASE}/api/admin/users`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    localStorage.removeItem("cf_token");
    window.location.href = "auth.html";
    return;
  }

  const result = await res.json();
  const users = result.data;

  const tbody = document.getElementById("usersTableBody");
  tbody.innerHTML = "";

  users.forEach(user => {
    const tr = document.createElement("tr");

    const isSelf = currentUser?.id === user.id;

    const roleClass =
      user.role === "admin" ? "role-admin" : "role-user";

    tr.innerHTML = `
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>

      <td>
        <div class="role-wrapper">
          <span class="role-badge ${roleClass}">
            ${user.role}
          </span>
          <select data-id="${user.id}" class="role-select">
              <option value="user" ${user.role === "user" ? "selected" : ""}>User</option>
              <option value="admin" ${user.role === "admin" ? "selected" : ""}>Admin</option>
          </select>
        </div>
      </td>

      <td>
        ${
          isSelf
            ? `<span class="self-label">You</span>`
            : `<button class="delete-btn" data-id="${user.id}">Delete</button>`
        }
      </td>
    `;

    tbody.appendChild(tr);
  });

  attachEvents();
}

/* ================= EVENTS ================= */

function attachEvents() {
  // ROLE CHANGE
  document.querySelectorAll(".role-select").forEach(select => {
    select.onchange = async () => {
      const userId = select.dataset.id;
      const newRole = select.value;

      const res = await fetch(
        `${API_BASE}/api/admin/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ role: newRole })
        }
      );

      if (!res.ok) {
        alert("Failed to update role");
        return;
      }

      loadUsers();
    };
  });

  // DELETE USER
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = async () => {
      const userId = btn.dataset.id;

      if (!confirm("Are you sure you want to delete this user?"))
        return;

      const res = await fetch(
        `${API_BASE}/api/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        alert("Delete failed");
        return;
      }

      loadUsers();
    };
  });
}

loadUsers();