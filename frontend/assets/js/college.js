


const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const API_BASE = "http://127.0.0.1:5000";


// ================= AUTH GUARD =================
function requireLogin(action) {
  if (!localStorage.getItem("cf_token")) {
    alert(`Please login to ${action}.`);
    window.location.href = "auth.html";
    return false;
  }
  return true;
}

function authHeaders() {
  const token = localStorage.getItem("cf_token");
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}


/* USER */
const currentUser = JSON.parse(localStorage.getItem("cf_user") || "null");
const USER_ID = currentUser?.id;

let isEditing = false;
let userHasReviewed = false;

/* LOGIN STATE */
const isLoggedIn = localStorage.getItem("cf_logged_in") === "true";
const saveBtn = document.getElementById("saveCollegeBtn");

/* ================= LOAD COLLEGE ================= */
async function loadCollegeFromBackend() {
  if (!id) {
    document.body.innerHTML = "<h2 style='padding:40px'>Invalid college ID</h2>";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/colleges/${id}`);
    if (!res.ok) {
      document.body.innerHTML = "<h2 style='padding:40px'>College not found</h2>";
      return;
    }
    const college = await res.json();
    renderCollege(college);
  } catch {
    document.body.innerHTML = "<h2 style='padding:40px'>Error loading college</h2>";
  }
}

loadCollegeFromBackend();

/* ================= RENDER COLLEGE ================= */
function renderCollege(college) {

  collegeName.textContent = college.name;
  collegeCity.textContent = college.city;
  collegeStream.textContent = college.stream || "Not specified";
  collegeRating.textContent = college.rating ?? "-";
  collegeFees.textContent = `₹${college.fees?.toLocaleString() || "-"}`;
  collegeCutoff.textContent = college.cutoff ? `${college.cutoff}%` : "-";
  collegeRank.textContent = college.ranking ?? "-";
  const collegePlacement = document.getElementById("collegePlacement");

collegePlacement.textContent = college.placement?.percentage
  ? `${college.placement.percentage}%`
  : "-";

  collegeAbout.textContent = college.short_desc || "Details will be available soon.";
  collegeImage.src = college.image || "assets/images/college-placeholder.png";

  /* ================= FACILITIES ================= */

const facilityList = document.getElementById("collegeFacilities");
facilityList.innerHTML = "";



if (college.facilities && Array.isArray(college.facilities)) {

  college.facilities.forEach(f => {
    const span = document.createElement("span");
    span.textContent = f;
    facilityList.appendChild(span);
  });

}


 /* ================= COURSES ================= */
/* ================= COURSES ================= */

const courseContainer = document.getElementById("courseContainer");
const noCoursesMsg = document.getElementById("noCoursesMsg");
const coursePagination = document.getElementById("coursePagination");

let COURSES_PAGE = 1;
const COURSES_PER_PAGE = 6;
let ALL_COURSES = college.courses || [];

function renderCoursesPage() {
  courseContainer.innerHTML = "";

  const start = (COURSES_PAGE - 1) * COURSES_PER_PAGE;
  const end = start + COURSES_PER_PAGE;
  const pageCourses = ALL_COURSES.slice(start, end);

  pageCourses.forEach(course => {
    const div = document.createElement("div");
    div.className = "course-card";

    div.innerHTML = `
      <div class="course-header">
        <div class="course-icon">🎓</div>
        <div class="course-info">
          <h4 class="course-title">${course.name}</h4>
          <div class="course-meta">
            <span class="course-duration">⏱ ${course.duration}</span>
            <span class="course-level">${course.level || "UG Program"}</span>
          </div>
          <div class="course-fees">
            💰 ₹${course.fees ? Number(course.fees).toLocaleString() : "Not Available"} per year
          </div>
        </div>
      </div>
      <div class="course-footer">
        <span class="course-tag popular">Popular</span>
      </div>
    `;

    courseContainer.appendChild(div);
  });
}

function renderCoursePagination() {
  coursePagination.innerHTML = "";

  const totalPages = Math.ceil(ALL_COURSES.length / COURSES_PER_PAGE);
  if (totalPages <= 1) return;

  if (COURSES_PAGE > 1) {
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Prev";
    prevBtn.className = "page-btn";
    prevBtn.onclick = () => {
      COURSES_PAGE--;
      renderCoursesPage();
      renderCoursePagination();
    };
    coursePagination.appendChild(prevBtn);
  }

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = "page-btn";

    if (i === COURSES_PAGE) {
      btn.classList.add("active");
    }

    btn.onclick = () => {
      COURSES_PAGE = i;
      renderCoursesPage();
      renderCoursePagination();
    };

    coursePagination.appendChild(btn);
  }

  if (COURSES_PAGE < totalPages) {
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.className = "page-btn";
    nextBtn.onclick = () => {
      COURSES_PAGE++;
      renderCoursesPage();
      renderCoursePagination();
    };
    coursePagination.appendChild(nextBtn);
  }
}

if (!ALL_COURSES.length) {
  noCoursesMsg.style.display = "block";
} else {
  noCoursesMsg.style.display = "none";
  renderCoursesPage();
  renderCoursePagination();
}

/* ================= PLACEMENTS ================= */

const placePercent = document.getElementById("placePercent");
const placeAvg = document.getElementById("placeAvg");
const placeHigh = document.getElementById("placeHigh");

if (college.placement) {
  placePercent.textContent = college.placement.percentage
    ? `${college.placement.percentage}%`
    : "-";

  placeAvg.textContent = college.placement.avgPackage
    ? `₹${college.placement.avgPackage} LPA`
    : "-";

  placeHigh.textContent = college.placement.highest
    ? `₹${college.placement.highest} LPA`
    : "-";
}

const recruiterList = document.getElementById("recruiterList");
recruiterList.innerHTML = "";

if (college.placement?.recruiters?.length) {
  college.placement.recruiters.forEach(r => {
    const span = document.createElement("span");
    span.textContent = r;
    recruiterList.appendChild(span);
  });
}

/* ================= REVIEWS ================= */

function renderReview(review, isOwner) {
  const div = document.createElement("div");
  div.className = "review-card";

  div.innerHTML = `
    <div class="review-header">
      <strong>${review.name}</strong>
      <span class="review-rating">⭐ ${review.rating}</span>
    </div>
    <p>${review.comment}</p>
    ${
      isOwner
        ? `
        <div class="review-actions">
         <button type="button" class="btn sm outline edit-review">Edit</button>
          <button type="button" class="btn sm danger delete-review">Delete</button>
        </div>`
        : ""
    }
  `;

  if (isOwner) {
    div.querySelector(".delete-review").onclick = async () => {
      const res = await safeFetch(`${API_BASE}/api/colleges/${id}/reviews`, {
        method: "DELETE"
      });

      if (!res.ok) {
        alert("Delete failed");
        return;
      }

      isEditing = false;
      userHasReviewed = false;
      reviewName.disabled = false;
      reviewForm.reset();
await loadReviews();
await loadCollegeFromBackend();
      window.dispatchEvent(new Event("reviews-updated"));
    };

    div.querySelector(".edit-review").onclick = () => {
      reviewComment.value = review.comment;
      reviewRating.value = review.rating;
      isEditing = true;
    };
  }

  reviewList.appendChild(div);
}

async function loadReviews() {
  reviewList.innerHTML = "";

  const res = await fetch(`${API_BASE}/api/colleges/${id}/reviews`);
  const reviews = await res.json();

  userHasReviewed = false;

  if (!reviews.length) {
    noReviewMsg.style.display = "block";
    reviewAvg.textContent = "-";
    return;
  }

  noReviewMsg.style.display = "none";

  let sum = 0;
  reviewName.disabled = false;

  reviews.forEach(review => {
    const isOwner = review.user_id === USER_ID;

    if (isOwner) {
      userHasReviewed = true;
      reviewName.disabled = true;
    }

    renderReview(review, isOwner);
    sum += review.rating;
  });

  reviewAvg.textContent = (sum / reviews.length).toFixed(1);
}

loadReviews();

reviewForm.onsubmit = async (e) => {
  e.preventDefault();

  if (!requireLogin("submit a review")) return;

  const payload = {
    name: currentUser?.name || "Anonymous",
    rating: Number(reviewRating.value),
    comment: reviewComment.value
  };

  if (!payload.rating || payload.rating < 1 || payload.rating > 5) {
    alert("Please select a valid rating");
    return;
  }

  if (!payload.comment.trim()) {
    alert("Please write a review comment");
    return;
  }

  const res = await safeFetch(
    `${API_BASE}/api/colleges/${id}/reviews`,
    {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      },
      body: JSON.stringify(payload)
    }
  );

  if (res.status === 409) {
    alert("You already reviewed this college");
    return;
  }

  if (!res.ok) {
    const msg = await res.text();
    alert(msg || "Failed to submit review");
    return;
  }

  isEditing = false;
userHasReviewed = true;
reviewForm.reset();

// 🔥 Reload everything
await loadReviews();
await loadCollegeFromBackend();  // ← THIS IS THE FIX

window.dispatchEvent(new Event("reviews-updated"));
};



  /* ================= SAVE / COMPARE / CONTACT ================= */
  /* 🔒 NOTHING BELOW THIS WAS CHANGED */



  /* ================= CONTACT ================= */
  collegePhone.textContent = college.contact?.phone || "Not available";
  collegeEmail.textContent = college.contact?.email || "Not available";
  collegeAddress.textContent =
    college.contact?.address || "Address will be updated soon";

  if (college.contact?.website) {
    collegeWebsite.textContent = college.contact.website;
    collegeWebsite.href = college.contact.website;
    officialWebsiteBtn.href = college.contact.website;
    officialWebsiteBtn.style.display = "inline-block";
  }

  /* ================= COMPARE ================= */
  async function updateCompareBtn() {
  const res = await fetch(`${API_BASE}/api/users/compare`, {
    headers: { ...authHeaders() }
  });

  if (!res.ok) return;

  const data = await res.json();
  const ids = data.map(c => String(c.id));

  if (ids.includes(String(college.id))) {
    addCompareBtn.textContent = "✓ Added to Compare";
    addCompareBtn.classList.add("added");
  } else {
    addCompareBtn.textContent = "+ Add to Compare";
    addCompareBtn.classList.remove("added");
  }
}


  updateCompareBtn();

addCompareBtn.onclick = async () => {
  if (!requireLogin("compare colleges")) return;

  const res = await fetch(`${API_BASE}/api/users/compare`, {
    headers: { ...authHeaders() }
  });

  if (!res.ok) return;

  const current = await res.json();
  const ids = current.map(c => c.id);

  if (ids.includes(college.id)) {
    await fetch(`${API_BASE}/api/users/compare/${college.id}`, {
      method: "DELETE",
      headers: { ...authHeaders() }
    });
  } else {
    await safeFetch(`${API_BASE}/api/users/compare`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      },
      body: JSON.stringify({ college_id: college.id })
    });
  }

  updateCompareBtn();
  window.dispatchEvent(new Event("compare-updated"));
};


   




  /* ================= SAVE COLLEGE (BACKEND) ================= */
  async function isCollegeSaved(collegeId) {
  const res = await fetch(`${API_BASE}/api/users/saved`, {
  headers: {
    ...authHeaders()
  }
});

    const data = await res.json();
    return data.some(c => c.id === collegeId);
  }

  async function toggleSaveCollege(collegeId) {
    const saved = await isCollegeSaved(collegeId);

    if (saved) {
     await fetch(`${API_BASE}/api/users/saved/${collegeId}`, {
  method: "DELETE",
  headers: {
    ...authHeaders()
  }
});

    } else {
     await fetch(`${API_BASE}/api/users/saved`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ...authHeaders()
  },
  body: JSON.stringify({ college_id: collegeId })
});

    }

    window.dispatchEvent(new Event("saved-updated"));
  }

  async function updateSaveBtn() {
    const saved = await isCollegeSaved(college.id);

    if (saved) {
      saveBtn.textContent = "✓ Saved";
      saveBtn.classList.add("primary");
    } else {
      saveBtn.textContent = "♡ Save College";
      saveBtn.classList.remove("primary");
    }
  }

  if (saveBtn) {
    updateSaveBtn();

    saveBtn.onclick = async () => {
      if (!requireLogin("save colleges")) return;

      await toggleSaveCollege(college.id);
      updateSaveBtn();
    };
  }
}

/* ================= PROFILE / LOGOUT ================= */
const profileToggle = document.getElementById("profileToggle");
const profileDropdown = document.getElementById("profileDropdown");
const logoutBtn = document.getElementById("logoutBtn");

if (profileToggle) {
  profileToggle.onclick = () => {
    profileDropdown.style.display =
      profileDropdown.style.display === "flex" ? "none" : "flex";
  };
}

document.addEventListener("click", e => {
  if (!e.target.closest(".profile-menu") && profileDropdown) {
    profileDropdown.style.display = "none";
  }
});

document.querySelectorAll(".logged-in").forEach(el => {
  el.style.display = isLoggedIn ? "block" : "none";
});

document.querySelectorAll(".logged-out").forEach(el => {
  el.style.display = isLoggedIn ? "none" : "block";
});

if (logoutBtn) {
logoutBtn.onclick = () => {
  localStorage.removeItem("cf_logged_in");
  localStorage.removeItem("cf_user");
  localStorage.removeItem("cf_token");
 
  window.location.href = "index.html";
};
}
