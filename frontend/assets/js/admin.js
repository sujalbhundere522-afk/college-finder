const API_BASE = "https://college-finder-fx5r.onrender.com";

let editingCollegeId = null;

const token = localStorage.getItem("cf_token");

if (!token) {
    alert("Unauthorized. Please login.");
    window.location.href = "auth.html";
}

// ===============================
// LOAD ALL COLLEGES
// ===============================
async function loadColleges(query = "") {
    try {

        let url = `${API_BASE}/api/admin/colleges`;

        if (query) {
            url += `?q=${query}`;
        }

        const res = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            alert("Failed to load colleges");
            return;
        }

        const data = await res.json();

        const container = document.getElementById("collegeList");
        container.innerHTML = "";

        if (!data.data || data.data.length === 0) {
            container.innerHTML = "<p>No colleges found.</p>";
            return;
        }

        data.data.forEach(college => {
            container.innerHTML += `
                <div class="college-card">
                    <h3>${college.name}</h3>
                    <p>${college.city} | ₹${college.fees} | ${college.stream}</p>
                    <div class="actions">
                        <button onclick="startEdit(${college.id}, '${college.name}', '${college.city}', ${college.fees}, '${college.stream}')">Edit</button>
                        <button onclick="deleteCollege(${college.id})">Delete</button>
                    </div>
                </div>
            `;
        });

    } catch (err) {
        console.error("Error loading colleges:", err);
    }
}

// ===============================
// SEARCH (LIVE)
// ===============================
document.getElementById("searchInput").addEventListener("input", (e) => {
    const query = e.target.value.trim();
    loadColleges(query);
});

// ===============================
// START EDIT (Fill Form)
// ===============================
function startEdit(id, name, city, fees, stream) {

    document.getElementById("name").value = name;
    document.getElementById("city").value = city;
    document.getElementById("fees").value = fees;
    document.getElementById("stream").value = stream;

    editingCollegeId = id;

    document.querySelector("#collegeForm button").textContent = "Update College";
}

// ===============================
// CREATE / UPDATE COLLEGE
// ===============================
document.getElementById("collegeForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const collegeData = {
    name: document.getElementById("name").value.trim(),
    city: document.getElementById("city").value.trim(),
    state: document.getElementById("state").value.trim(),
    fees: parseInt(document.getElementById("fees").value),
    stream: document.getElementById("stream").value.trim(),
    about: document.getElementById("about").value,
    ranking: parseInt(document.getElementById("ranking").value),
    cutoff: parseInt(document.getElementById("cutoff").value),
    rating: parseFloat(document.getElementById("rating").value),

   placement_rate: parseInt(document.getElementById("placement_rate").value),
    avg_package: parseFloat(document.getElementById("avg_package").value),
    highest_package: parseFloat(document.getElementById("highest_package").value),

    recruiters: document.getElementById("recruiters").value
        .split(",")
        .map(r => r.trim())
        .filter(r => r !== ""),

    facilities: document.getElementById("facilities").value
        .split(",")
        .map(f => f.trim())
        .filter(f => f !== ""),

    courses: JSON.parse(document.getElementById("courses").value || "[]"),

    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value,
    website: document.getElementById("website").value,
    address: document.getElementById("address").value,
    image_url: document.getElementById("image_url").value
};





    try {

        if (editingCollegeId) {
            // 🔥 UPDATE
            await fetch(`${API_BASE}/api/admin/colleges/${editingCollegeId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(collegeData)
            });

            editingCollegeId = null;
            document.querySelector("#collegeForm button").textContent = "Add College";

        } else {
            // 🔥 CREATE
            await fetch(`${API_BASE}/api/admin/colleges`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(collegeData)
            });
        }

        document.getElementById("collegeForm").reset();
        loadColleges();

    } catch (err) {
        console.error("Error:", err);
    }
});

// ===============================
// DELETE COLLEGE
// ===============================
async function deleteCollege(id) {

    if (!confirm("Are you sure you want to delete this college?")) {
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/admin/colleges/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            alert("Delete failed");
            return;
        }

        loadColleges();

    } catch (err) {
        console.error("Delete error:", err);
    }
}

// Initial load
loadColleges();
