// assets/js/compare.js
(function () {

  const API_BASE = "https://college-finder-fx5r.onrender.com";
 
  let SELECTED_COLLEGES = [];

  // ================= AUTH GUARD =================
  function requireLogin(action) {
    if (localStorage.getItem("cf_logged_in") !== "true") {
      alert(`Please login to ${action}.`);
      window.location.href = "auth.html";
      return false;
    }
    return true;
  }

  

  /* =======================
     Backend loader
  ======================= */
  async function loadCollegesFromBackend() {
    const token = localStorage.getItem("cf_token");
    if (!token) return;

    try {
      const res = await safeFetch("https://college-finder-fx5r.onrender.com/api/users/compare");

      if (!res.ok) return;

      SELECTED_COLLEGES = await res.json();
      render();
    } catch (e) {
      console.error("Compare load error:", e);
    }
  }

  async function removeFromCompare(id) {
    await safeFetch(`https://college-finder-fx5r.onrender.com/api/users/compare/${id}`, {
      method: "DELETE"
    });

    window.dispatchEvent(new Event("compare-updated"));
    loadCollegesFromBackend();
  }

  async function clearCompare() {
    for (const c of SELECTED_COLLEGES) {
      await safeFetch(`https://college-finder-fx5r.onrender.com/api/users/compare/${c.id}`, {
  method: "DELETE"
});

    }

    SELECTED_COLLEGES = [];
    window.dispatchEvent(new Event("compare-updated"));
    render();
  }

  /* =======================
     Best / Worst logic
  ======================= */
 function computeBests(list) {
  const bests = {};
  if (!list.length) return bests;

  let minFees = Infinity;
  let maxFees = -Infinity;
  let bestRank = Infinity;
  let bestCutoff = -Infinity;
  let bestPlacement = -Infinity;

  list.forEach(c => {

    // Fees
    if (c.fees != null) {
      if (c.fees < minFees) {
        minFees = c.fees;
        bests.lowFeesId = String(c.id);
      }
      if (c.fees > maxFees) {
        maxFees = c.fees;
        bests.highFeesId = String(c.id);
      }
    }

    // Ranking (lower is better)
    if (c.ranking != null && c.ranking < bestRank) {
      bestRank = c.ranking;
      bests.bestRankId = String(c.id);
    }

    // Cutoff (higher is better)
    if (c.cutoff != null && c.cutoff > bestCutoff) {
      bestCutoff = c.cutoff;
      bests.bestCutoffId = String(c.id);
    }

    // ✅ Placement %
    if (c.placement?.percentage != null &&
        c.placement.percentage > bestPlacement) {
      bestPlacement = c.placement.percentage;
      bests.bestPlacementId = String(c.id);
    }

  });

  return bests;
}


  /* =======================
     Render
  ======================= */
  function render() {
    const table = document.getElementById("compareTable");
    const wrap = document.getElementById("compareTableWrap");
    const empty = document.getElementById("emptyState");

    if (!SELECTED_COLLEGES.length) {
      empty.style.display = "block";
      wrap.style.display = "none";
      return;
    }

    empty.style.display = "none";
    wrap.style.display = "block";
    table.innerHTML = "";

    const bests = computeBests(SELECTED_COLLEGES);

    /* ---------- HEADER ---------- */
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");
    tr.appendChild(document.createElement("th"));

    SELECTED_COLLEGES.forEach(col => {
      const th = document.createElement("th");
      th.innerHTML = `
        <div class="compare-col">
          <div class="compare-name">${col.name}</div>
          <div class="compare-city">${col.city}, ${col.state}</div>
          <button class="remove-col" data-id="${col.id}">Remove</button>
        </div>
      `;
      tr.appendChild(th);
    });

    thead.appendChild(tr);
    table.appendChild(thead);

    /* ---------- BODY ---------- */
    const tbody = document.createElement("tbody");
    function section(title) {
  const tr = document.createElement("tr");
  const th = document.createElement("th");
  th.colSpan = SELECTED_COLLEGES.length + 1;
  th.textContent = title;
  th.className = "compare-section";
  tr.appendChild(th);
  tbody.appendChild(tr);
}


    function row(label, valueFn, decorateFn) {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      th.textContent = label;
      tr.appendChild(th);

      SELECTED_COLLEGES.forEach(c => {
        const td = document.createElement("td");
        td.innerHTML = valueFn(c) ?? "—";
        if (decorateFn) decorateFn(td, c);
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    }
/* ===== Cost ===== */
section("Cost");
row("Fees", c => `₹${c.fees.toLocaleString()}`, (td, c) => {
  if (String(c.id) === bests.lowFeesId)
    td.innerHTML += " <span class='badge good'>Lowest</span>";
  if (String(c.id) === bests.highFeesId)
    td.innerHTML += " <span class='badge bad'>Highest</span>";
});

/* ===== Academics ===== */
section("Academics");
row("Cutoff", c => `${c.cutoff}%`, (td, c) => {
  if (String(c.id) === bests.bestCutoffId)
    td.innerHTML += " <span class='badge good'>Best</span>";
});

row("Ranking", c => c.ranking, (td, c) => {
  if (String(c.id) === bests.bestRankId)
    td.innerHTML += " <span class='badge good'>Top</span>";
});

row("Rating", c => c.rating);

/* ===== Placements ===== */
section("Placements");
row(
  "Placement %",
  c => `${c.placement?.percentage || "—"}%`,
  (td, c) => {
    if (String(c.id) === bests.bestPlacementId)
      td.innerHTML += " <span class='badge good'>Best</span>";
  }
);

row(
  "Avg Package",
  c => c.placement?.avgPackage ? `₹${c.placement.avgPackage} LPA` : "—"
);

row(
  "Highest Package",
  c => c.placement?.highest ? `₹${c.placement.highest} LPA` : "—"
);

/* ===== General ===== */
section("General");
row("Stream", c => c.stream || "—");


    table.appendChild(tbody);

    table.querySelectorAll(".remove-col").forEach(btn => {
      btn.onclick = () => removeFromCompare(btn.dataset.id);
    });
  }

  function exportCSV() {
    if (!SELECTED_COLLEGES.length) {
      alert("No colleges selected");
      return;
    }

    const headers = [
  "Name", "City", "State",
  "Fees", "Cutoff", "Ranking", "Rating",
  "Placement %", "Avg Package", "Highest Package", "Stream"
];

const rows = SELECTED_COLLEGES.map(c => [
  c.name,
  c.city,
  c.state,
  c.fees,
  c.cutoff,
  c.ranking,
  c.rating,
  c.placement?.percentage ?? "",
  c.placement?.avgPackage ?? "",
  c.placement?.highest ?? "",
  c.stream
]);


    const csvContent =
      [headers, ...rows]
        .map(r => r.join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "college-comparison.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /* =======================
     Init
  ======================= */
 document.addEventListener("DOMContentLoaded", () => {

  // 🔐 Run login check here instead
  if (!requireLogin("view compared colleges")) return;

  document.getElementById("btn-clear").onclick = clearCompare;
  document.getElementById("btn-print").onclick = () => window.print();
  document.getElementById("btn-export").onclick = exportCSV;

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();

      localStorage.removeItem("cf_logged_in");
      localStorage.removeItem("cf_user");
      localStorage.removeItem("cf_token");

      window.location.href = "index.html";
    });
  }

  loadCollegesFromBackend();
});

  // ================= LOGOUT =================


})();
