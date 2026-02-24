/* assets/js/home.js
   Backend search/filter + compare + sticky bar + hero slideshow + pagination
*/

// SAFETY GUARD
window.COLLEGES = window.COLLEGES || [];

document.addEventListener("DOMContentLoaded", () => {
  // ================= HEADER POSITION LOCK =================
const header = document.getElementById("mainHeader");
if (header) {
  header.style.position = "fixed";
  header.style.top = "0";
  header.style.left = "0";
  header.style.right = "0";
  header.style.zIndex = "9999";
}


  // ================= AUTH HELPERS =================
  function isAuthenticated() {
    return !!localStorage.getItem("cf_token");
  }

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
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  const UNIVERSITY_IMAGES = [
  "assets/images/universities/uni1.jpg",
  "assets/images/universities/uni2.jpg",
  "assets/images/universities/uni3.jpg"
];


  // ================= LOGIN STATE UI =================
  const isLoggedIn = isAuthenticated();

  document.querySelectorAll(".logged-in").forEach(e =>
    e.style.display = isLoggedIn ? "block" : "none"
  );
  document.querySelectorAll(".logged-out").forEach(e =>
    e.style.display = isLoggedIn ? "none" : "block"
  );

  // ================= GLOBALS =================
  window.COMPARED_IDS = [];

const API = "http://https://college-finder-fx5r.onrender.com/api/colleges";


  const PAGE_SIZE = 6;

  let currentPage = 1;
  let totalPages = 1;
  let lastQuery = "";

  /*************************
   * Sticky compare bar UI *
   *************************/
  let stickyEl;

  function createStickyBar() {
    if (document.querySelector('.compare-sticky')) {
      stickyEl = document.querySelector('.compare-sticky');
      return;
    }

    stickyEl = document.createElement('div');
    stickyEl.className = 'compare-sticky';

    const itemsWrap = document.createElement('div');
    itemsWrap.className = 'compare-items';
    itemsWrap.id = 'compareItems';

    const actions = document.createElement('div');
    actions.className = 'compare-actions';

    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.onclick = async () => {
      if (!requireLogin("clear compare list")) return;

      for (const id of window.COMPARED_IDS) {
        await safeFetch(`http://https://college-finder-fx5r.onrender.com/api/users/compare/${id}`, {
          method: "DELETE",
          headers: authHeaders()
        });
      }

      window.COMPARED_IDS = [];
      updateStickyBar();
      renderPage(applySorting(COLLEGES));
    };

    const compareBtn = document.createElement('button');
    compareBtn.className = 'compare-primary';
    compareBtn.onclick = () => {
      if ((window.COMPARED_IDS || []).length) {
        window.location.href = "compare.html";
      }
    };

    actions.append(clearBtn, compareBtn);
    stickyEl.append(itemsWrap, actions);
    document.body.appendChild(stickyEl);
  }

  function updateStickyBar() {
    if (!stickyEl) createStickyBar();
    const itemsWrap = document.getElementById('compareItems');
    const ids = window.COMPARED_IDS || [];
    itemsWrap.innerHTML = '';

    if (!ids.length) {
      stickyEl.style.display = 'none';
      return;
    }

    stickyEl.style.display = 'flex';

    ids.forEach(id => {
      const col = COLLEGES.find(c => String(c.id) === id);
      const div = document.createElement('div');
      div.className = 'compare-item';
      div.style.backgroundImage =
        `url(${col?.image || 'assets/images/college-placeholder.png'})`;
      itemsWrap.appendChild(div);
    });

    stickyEl.querySelector('.compare-primary').textContent =
      `Compare (${ids.length})`;
  }

  createStickyBar();
  updateStickyBar();

  /***************************
   * Search / filter section *
   ***************************/
  const heroQuery = document.getElementById('hero-query');
  const suggestionsBox = document.getElementById("searchSuggestions");

  const heroStream = document.getElementById('hero-stream');
  const heroSearchBtn = document.getElementById('hero-search');

  const filterStream = document.getElementById('filter-stream');
  const filterCity = document.getElementById('filter-city');
  const filterFees = document.getElementById('filter-fees');
  const filterCutoff = document.getElementById('filter-cutoff');
  const filterApply = document.getElementById('filter-search');
  const filterReset = document.getElementById('filter-reset');

  const resultsEl = document.getElementById('results');
  const paginationEl = document.getElementById('pagination');
  const sortSelect = document.getElementById("sort-results");

  /********************
   * Backend fetch *
   ********************/

  async function loadAllStreams() {
  try {
    const res = await fetch(`${API}?limit=1000`);
    const json = await res.json();

    const allColleges = json.data || json;

    const streams = [
      ...new Set(allColleges.map(c => c.stream).filter(Boolean))
    ];

    heroStream.innerHTML = `<option value="">All Streams</option>`;
    filterStream.innerHTML = `<option value="">All Streams</option>`;

    streams.forEach(stream => {
      heroStream.appendChild(new Option(stream, stream));
      filterStream.appendChild(new Option(stream, stream));
    });

  } catch (err) {
    console.error("Failed to load streams", err);
  }
}


  function populateStreamDropdowns(list) {
    const streams = [...new Set(list.map(c => c.stream).filter(Boolean))];

    heroStream.innerHTML = `<option value="">All Streams</option>`;
    streams.forEach(s => heroStream.appendChild(new Option(s, s)));

    filterStream.innerHTML = `<option value="">All Streams</option>`;
    streams.forEach(s => filterStream.appendChild(new Option(s, s)));
  }




  async function fetchColleges(page = 1, query = "") {


    // Show loading skeleton
resultsEl.innerHTML = "";
for (let i = 0; i < 4; i++) {
  const skeleton = document.createElement("div");
  skeleton.className = "skeleton-card";
  resultsEl.appendChild(skeleton);
}

    try {
      const res = await fetch(
        `${API}?page=${page}&limit=${PAGE_SIZE}&${query}`
      );
      const json = await res.json();

      COLLEGES = json.data;

//       // Enable autocomplete after first fetch
// if (heroQuery.value.length >= 2) {
//   showSuggestions(heroQuery.value);
// }

      currentPage = json.page;
      totalPages = json.totalPages;

      
      renderPage(applySorting(COLLEGES));
      
      renderPagination();
      updateStickyBar();
    } catch {
      resultsEl.innerHTML =
        `<div class="card">Failed to load colleges</div>`;
    }
  }

  function buildQuery() {
    const params = new URLSearchParams();

    if (heroQuery.value) params.append("q", heroQuery.value.trim());
    if (heroStream.value) params.append("stream", heroStream.value);
    if (filterStream.value) params.append("stream", filterStream.value);
    if (filterCity.value) params.append("city", filterCity.value.trim());
    if (filterFees.value) params.append("maxFees", filterFees.value);
    if (filterCutoff.value) params.append("minCutoff", filterCutoff.value);
    if (sortSelect && sortSelect.value) params.append("sort", sortSelect.value);

    return params.toString();
  }

  function showSuggestions(value) {
  if (!value || value.length < 2) {
    suggestionsBox.classList.add("hidden");
    return;
  }

  const matches = (COLLEGES || [])

    .filter(c =>
      c.name?.toLowerCase().includes(value.toLowerCase())
    )
    .slice(0, 6);

  suggestionsBox.innerHTML = "";

  if (!matches.length) {
    suggestionsBox.classList.add("hidden");
    return;
  }

  matches.forEach(college => {
    const item = document.createElement("div");
    item.innerText = college.name;

    item.onclick = () => {
      heroQuery.value = college.name;
      suggestionsBox.classList.add("hidden");
      doSearch();
    };

    suggestionsBox.appendChild(item);
  });

  suggestionsBox.classList.remove("hidden");
}


  function updateActiveFilters() {
  const container = document.getElementById("activeFilters");
  const chipsWrap = document.getElementById("filterChips");

  chipsWrap.innerHTML = "";

  const filters = [];

  if (heroStream.value) filters.push({ label: heroStream.value, type: "stream" });
  if (filterCity.value) filters.push({ label: filterCity.value, type: "city" });
  if (filterFees.value) filters.push({ label: `Max ₹${filterFees.value}`, type: "fees" });
  if (filterCutoff.value) filters.push({ label: `Min ${filterCutoff.value}%`, type: "cutoff" });

  if (!filters.length) {
    container.classList.add("hidden");
    return;
  }

  container.classList.remove("hidden");

  filters.forEach(filter => {
    const chip = document.createElement("div");
    chip.className = "filter-chip";
    chip.innerHTML = `${filter.label} <span>✕</span>`;

    chip.onclick = () => {
      if (filter.type === "stream") heroStream.value = "";
      if (filter.type === "city") filterCity.value = "";
      if (filter.type === "fees") filterFees.value = "";
      if (filter.type === "cutoff") filterCutoff.value = "";

      doSearch();
    };

    chipsWrap.appendChild(chip);
  });
}


  function doSearch() {
  if (suggestionsBox) {
    suggestionsBox.classList.add("hidden");
  }

  lastQuery = buildQuery();
  updateActiveFilters();
  fetchColleges(1, lastQuery);
}


  async function fetchCompareIds() {
    const token = localStorage.getItem("cf_token");
    if (!token) return [];

    const res = await safeFetch("http://https://college-finder-fx5r.onrender.com/api/users/compare")
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(c => String(c.id));
  }

  // ===== HERO CHIPS CLICK =====
document.querySelectorAll(".hero-chips .chip").forEach(chip => {
  chip.addEventListener("click", () => {
    const stream = chip.dataset.stream;

    heroStream.value = stream;   // set dropdown
    heroQuery.value = "";        // clear search box

    if (suggestionsBox) {
      suggestionsBox.classList.add("hidden");
    }

    doSearch();

    // Scroll to results
    setTimeout(() => {
      document.querySelector(".results-area")

        ?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  });
});


// ===== POPULAR STREAM CARDS CLICK =====
document.querySelectorAll(".stream-card").forEach(card => {
  card.addEventListener("click", () => {
    const stream = card.dataset.stream;

    heroStream.value = stream;
    heroQuery.value = "";

    if (suggestionsBox) {
      suggestionsBox.classList.add("hidden");
    }

    doSearch();

    // Scroll smoothly to results
    setTimeout(() => {
      document.querySelector(".results-area")

        ?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  });
});


  /* rest of file unchanged */




    // ================= SORTING =================
function applySorting(list) {
  const sort = sortSelect?.value;
  if (!sort) return list;

  const sorted = [...list];

  if (sort === "fees_asc") {
    sorted.sort((a, b) => (a.fees ?? 0) - (b.fees ?? 0));
  }

  if (sort === "fees_desc") {
    sorted.sort((a, b) => (b.fees ?? 0) - (a.fees ?? 0));
  }

  if (sort === "rating_desc") {
    sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }

  if (sort === "cutoff_desc") {
    sorted.sort((a, b) => (b.cutoff ?? 0) - (a.cutoff ?? 0));
  }

  if (sort === "ranking_asc") {
    sorted.sort((a, b) => (a.ranking ?? 9999) - (b.ranking ?? 9999));
  }

  if (sort === "ranking_desc") {
    sorted.sort((a, b) => (b.ranking ?? 0) - (a.ranking ?? 0));
  }

  return sorted;
}


/*********************************
 * University image transformation
 *********************************/

/*********************************
 * Hero background transformation
 *********************************/
const heroSection = document.querySelector(".hero");
let heroIndex = 0;

function rotateHeroBackground() {
  if (!heroSection) return;

  heroIndex = (heroIndex + 1) % UNIVERSITY_IMAGES.length;

  heroSection.classList.remove("hero-animate");
  void heroSection.offsetWidth; // force reflow

  heroSection.style.backgroundImage =
    `url('${UNIVERSITY_IMAGES[heroIndex]}')`;

  heroSection.classList.add("hero-animate");
}




  /********************
   * Render cards *
   ********************/
  function renderPage(list) {
    resultsEl.innerHTML = '';

    if (!list.length) {
  resultsEl.innerHTML = `
    <div class="no-results">
      <div class="no-icon">📭</div>
      <h3>No Colleges Found</h3>
      <p>Try adjusting your filters or search term.</p>
      <button class="btn primary" onclick="window.location.href='index.html'">
        Reset Filters
      </button>
    </div>
  `;
  paginationEl.innerHTML = "";
  return;
}


    const comparedIds = window.COMPARED_IDS || [];

    list.forEach(c => {
      const isAdded = comparedIds.includes(String(c.id));

      const card = document.createElement("div");
card.className = "college-card";
card.innerHTML = `
  <div class="college-thumb">
    <img src="assets/images/college-placeholder.png" alt="College">
  </div>

  <div class="college-info">
    <div class="college-header">
      <h3>
        <a href="college.html?id=${c.id}">${c.name}</a>
      </h3>
      <div class="rating">⭐ ${c.rating ?? "-"}</div>
    </div>

    <div class="college-location">${c.city}, ${c.state}</div>

    <div class="college-meta">
      <span><strong>Rank:</strong> ${c.ranking ?? "-"}</span>
      <span><strong>${c.stream ?? "-"}</strong></span>
      <span><strong>Cutoff:</strong> ${c.cutoff ?? "-"}%</span>
    </div>

    <div class="college-fees">₹${Number(c.fees).toLocaleString()}</div>

    <div class="college-actions">
      <a href="college.html?id=${c.id}" class="btn primary">View Details</a>
      <button type="button" class="compare-btn ${isAdded ? "added" : ""}" data-id="${c.id}">
        ${isAdded ? "✓ Added" : "+ Compare"}
      </button>
    </div>
  </div>
`;

      resultsEl.appendChild(card);
    });
   
 



    document.querySelectorAll('.compare-btn').forEach(btn => {
  btn.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!requireLogin("compare colleges")) return;

    const id = btn.dataset.id;
    const isAdded = window.COMPARED_IDS.includes(String(id));

    if (isAdded) {
      await safeFetch(`http://https://college-finder-fx5r.onrender.com/api/users/compare/${id}`, {
        method: "DELETE"
      });

      // Update local state immediately
      window.COMPARED_IDS = window.COMPARED_IDS.filter(cid => cid !== id);

      btn.classList.remove("added");
      btn.textContent = "+ Compare";

    } else {
      await safeFetch("http://https://college-finder-fx5r.onrender.com/api/users/compare", {
        method: "POST",
        body: JSON.stringify({ college_id: Number(id) })
      });

      // Update local state immediately
      window.COMPARED_IDS.push(String(id));

      btn.classList.add("added");
      btn.textContent = "✓ Added";
    }

    updateStickyBar();
  };
});
  }

  if (sortSelect) {
  sortSelect.addEventListener("change", () => {
  doSearch(); // backend will handle sorting
});

}


  /********************
   * Pagination UI *
   ********************/
  function renderPagination() {
    paginationEl.innerHTML = "";
    if (totalPages <= 1) return;

    if (currentPage > 1)
      paginationEl.appendChild(createPageBtn("Prev", currentPage - 1));

    for (let i = 1; i <= totalPages; i++) {
  const btn = createPageBtn(i, i);

  if (i === currentPage) {
    btn.classList.add("active");   // ✅ THIS IS CORRECT PLACE
  }

  paginationEl.appendChild(btn);
}


    if (currentPage < totalPages)
      paginationEl.appendChild(createPageBtn("Next", currentPage + 1));
  }

  function createPageBtn(label, page) {
  const btn = document.createElement("button");
  btn.textContent = label;
  btn.className = "page-btn";   // add this
  btn.onclick = () => fetchColleges(page, lastQuery);
  return btn;
}


 heroSearchBtn.addEventListener('click', () => {
  if (suggestionsBox) {
    suggestionsBox.classList.add("hidden");
  }
  doSearch();
});


  heroQuery.addEventListener("input", (e) => {
  showSuggestions(e.target.value);
});

heroQuery.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    if (suggestionsBox) {
      suggestionsBox.classList.add("hidden");
    }
    doSearch();
  }
});


  filterApply.addEventListener('click', doSearch);


  filterReset.addEventListener('click', async () => {
    heroQuery.value = "";
    heroStream.value = "";
    filterStream.value = "";
    filterCity.value = "";
    filterFees.value = "";
    filterCutoff.value = "";
    lastQuery = "";

    window.COMPARED_IDS = await fetchCompareIds();
    fetchColleges(1, "");
  });

  document.getElementById("clearAllFilters").onclick = () => {
  heroStream.value = "";
  filterStream.value = "";
  filterCity.value = "";
  filterFees.value = "";
  filterCutoff.value = "";

  updateActiveFilters();
  fetchColleges(1, "");
};


  

  


   /********************
 * Top 10 Section *
 ********************/

function renderTop10(colleges, selectedStream = "All") {
  const container = document.getElementById("top10Body");
  if (!container) return;

  container.innerHTML = "";

  let filtered = [...colleges];

  if (selectedStream !== "All") {
    filtered = filtered.filter(
      c => c.stream?.toLowerCase() === selectedStream.toLowerCase()
    );
  }

  const sorted = filtered
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 10);

  sorted.forEach((c, index) => {
    const card = document.createElement("div");
    card.className = "leaderboard-card";

    card.onclick = () => {
      window.location.href = `college.html?id=${c.id}`;
    };

    const medal =
      index === 0 ? "🥇" :
      index === 1 ? "🥈" :
      index === 2 ? "🥉" :
      `#${index + 1}`;

    card.innerHTML = `
      <div class="leaderboard-rank">${medal}</div>

      <div class="leaderboard-info">
        <div class="leaderboard-name">${c.name}</div>
        <div class="leaderboard-meta">
          ${c.city ?? "-"} • ${c.stream ?? "-"}
        </div>
      </div>

      <div class="leaderboard-stats">
        <div class="stat">
          ⭐ ${c.rating ?? "-"}
        </div>
        <div class="stat">
          🎯 ${c.cutoff ?? "-"}%
        </div>
        <div class="stat fees">
          ₹${Number(c.fees ?? 0).toLocaleString()}
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}



async function loadTop10() {
  try {
    const res = await fetch(`${API}?limit=1000`);
    const json = await res.json();

    const allColleges = json.data || json;

    renderTop10(allColleges);

  } catch (err) {
    console.error("Top 10 load failed", err);
  }
}

/* ===== Top 10 Stream Chip Click ===== */

document.querySelectorAll(".top10-chip").forEach(chip => {
  chip.addEventListener("click", async () => {

    // remove active from all
    document.querySelectorAll(".top10-chip")
      .forEach(c => c.classList.remove("active"));

    // add active to clicked
    chip.classList.add("active");

    const stream = chip.dataset.stream;

    const res = await fetch(`${API}?limit=1000`);
    const json = await res.json();
    const allColleges = json.data || json;

    renderTop10(allColleges, stream);
  });
});


/********************
 * COURSES PAGINATION
 ********************/

let ALL_COURSES = [];
let COURSES_PAGE = 1;
const COURSES_PER_PAGE = 6;

async function loadCourses() {
  try {
    const res = await fetch("http://https://college-finder-fx5r.onrender.com/api/courses/");
    ALL_COURSES = await res.json();

    renderCoursesPage();
    renderCoursesPagination();

  } catch (err) {
    console.error("Failed to load courses", err);
  }
}

function renderCoursesPage() {
  const grid = document.getElementById("coursesGrid");
  if (!grid) return;

  grid.innerHTML = "";

  const start = (COURSES_PAGE - 1) * COURSES_PER_PAGE;
  const end = start + COURSES_PER_PAGE;
  const pageCourses = ALL_COURSES.slice(start, end);

  pageCourses.forEach(course => {
    const card = document.createElement("div");
    card.className = "course-card";

    card.innerHTML = `
      <div class="course-top">
        <div class="course-icon">🎓</div>
        <div class="course-name">${course.name}</div>
      </div>

      <div class="course-badges">
        <div class="badge-blue">⏱ ${course.duration}</div>
        <div class="badge-light">${course.level} Program</div>
      </div>

      ${course.popular ? '<div class="badge-popular">Popular</div>' : ''}
    `;

    card.onclick = () => openCourseModal(course);
    grid.appendChild(card);
  });
}

function renderCoursesPagination() {
  const container = document.getElementById("coursesPagination");
  if (!container) return;

  container.innerHTML = "";

  const totalPages = Math.ceil(ALL_COURSES.length / COURSES_PER_PAGE);

  if (totalPages <= 1) return;

  // ===== PREV BUTTON =====
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Prev";
  prevBtn.className = "page-btn";

  if (COURSES_PAGE === 1) {
    prevBtn.disabled = true;
  }

  prevBtn.onclick = () => {
    if (COURSES_PAGE > 1) {
      COURSES_PAGE--;
      renderCoursesPage();
      renderCoursesPagination();
      scrollToCourses();
    }
  };

  container.appendChild(prevBtn);

  // ===== PAGE NUMBERS =====
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
      renderCoursesPagination();
      scrollToCourses();
    };

    container.appendChild(btn);
  }

  // ===== NEXT BUTTON =====
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.className = "page-btn";

  if (COURSES_PAGE === totalPages) {
    nextBtn.disabled = true;
  }

  nextBtn.onclick = () => {
    if (COURSES_PAGE < totalPages) {
      COURSES_PAGE++;
      renderCoursesPage();
      renderCoursesPagination();
      scrollToCourses();
    }
  };

  container.appendChild(nextBtn);
}

function scrollToCourses() {
  document.querySelector(".courses-section")
    ?.scrollIntoView({ behavior: "smooth" });
}



function openCourseModal(course) {
  document.getElementById("modalCourseName").innerText = course.name;
  document.getElementById("modalCourseDuration").innerText = course.duration;
  document.getElementById("modalCourseFees").innerText =
    Number(course.avg_fees).toLocaleString();
  document.getElementById("modalCourseScope").innerText = course.scope;

  const viewBtn = document.getElementById("viewCollegesBtn");

  viewBtn.onclick = () => {
    window.location.href =
      `index.html?stream=${encodeURIComponent(course.stream || course.name)}`;
  };

  document.getElementById("courseModal").classList.remove("hidden");
}

document.getElementById("courseModal").addEventListener("click", (e) => {
  if (e.target.id === "courseModal") {
    e.currentTarget.classList.add("hidden");
  }
});


  // ================= PROFILE MENU FIX =================
const profileToggle = document.getElementById("profileToggle");
const profileDropdown = document.getElementById("profileDropdown");


if (profileToggle && profileDropdown) {
  profileToggle.onclick = (e) => {
    e.stopPropagation();
    profileDropdown.style.display =
      profileDropdown.style.display === "flex" ? "none" : "flex";
  };

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".profile-menu")) {
      profileDropdown.style.display = "none";
    }
  });
}


// ================= LOGOUT =================
const logoutBtn = document.getElementById("logoutBtn");

function logout() {
  localStorage.removeItem("cf_logged_in");
  localStorage.removeItem("cf_user");
  localStorage.removeItem("cf_token");

  window.location.href = "index.html";
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    logout();
  });
}


// Initial hero background
if (heroSection) {
  heroSection.style.backgroundImage =
    `url('${UNIVERSITY_IMAGES[0]}')`;

  clearInterval(window._heroBgTimer);
  window._heroBgTimer = setInterval(rotateHeroBackground, 3000);
}

/* ================= INITIAL LOAD ================= */

/* ================= INITIAL LOAD ================= */

(async () => {
  window.COMPARED_IDS = await fetchCompareIds();
   await loadAllStreams(); 

  const params = new URLSearchParams(window.location.search);
  const streamFromURL = params.get("stream");

  if (streamFromURL) {
    heroStream.value = streamFromURL;
    lastQuery = `stream=${encodeURIComponent(streamFromURL)}`;
    await fetchColleges(1, lastQuery);

    // 👇 Auto scroll to results
    setTimeout(() => {
      document.querySelector(".results-area")

        ?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  } else {
    fetchColleges(1, "");
  }

  loadTop10();
  loadCourses();
})();

document.addEventListener("click", (e) => {
  if (
    suggestionsBox &&
    !heroQuery.contains(e.target) &&
    !suggestionsBox.contains(e.target)
  ) {
    suggestionsBox.classList.add("hidden");
  }
});





});
