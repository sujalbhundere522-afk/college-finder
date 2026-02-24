const API_BASE = "http://127.0.0.1:5000";
const token = localStorage.getItem("cf_token");
let streamChart, cityChart, reviewChart;



function createCollegeCard(college) {
  return `
    <div class="dashboard-card">
      <div class="dashboard-card-left">
        <img 
          src="${college.image_url || 'assets/images/college-placeholder.png'}" 
          class="dashboard-img"
        >

        <div>
          <h3>
            <a href="../frontend/college.html?id=${college.id}" target="_blank">
              ${college.name}
            </a>
          </h3>

          <p>${college.city || ''}</p>

          ${college.ranking ? `<p>Rank: ${college.ranking}</p>` : ""}
          ${college.stream ? `<p>${college.stream}</p>` : ""}
          ${college.cutoff ? `<p>Cutoff: ${college.cutoff}%</p>` : ""}

          ${college.fees ? `<p>₹${college.fees.toLocaleString()}</p>` : ""}

        </div>
      </div>

      ${
        college.rating
          ? `<div class="dashboard-rating">⭐ ${college.rating}</div>`
          : ""
      }
    </div>
  `;
}


if (!token) {
    alert("Unauthorized");
    window.location.href = "auth.html";
}

async function loadDashboard() {
    const res = await fetch(`${API_BASE}/api/admin/dashboard`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

if (!res.ok) {
    alert("Session expired. Login again.");
    localStorage.removeItem("cf_token");
    window.location.href = "auth.html";
    return;
}

const data = await res.json();


    // TOTALS
    document.getElementById("totalColleges").textContent = data.totals.colleges;
    document.getElementById("totalUsers").textContent = data.totals.users;
    document.getElementById("totalReviews").textContent = data.totals.reviews;
    document.getElementById("totalSaved").textContent = data.totals.saved;
    document.getElementById("totalCompared").textContent = data.totals.compared;


    // ===== CHARTS =====

const streamLabels = data.charts.stream.map(s => s.stream);
const streamCounts = data.charts.stream.map(s => s.count);

if (streamChart) streamChart.destroy();

streamChart = new Chart(document.getElementById("streamChart"), {
  type: "bar",
  data: {
    labels: streamLabels,
    datasets: [{
      label: "Colleges",
      data: streamCounts
    }]
  }
});


const cityLabels = data.charts.city.map(c => c.city);
const cityCounts = data.charts.city.map(c => c.count);

if (cityChart) cityChart.destroy();

cityChart = new Chart(document.getElementById("cityChart"), {
  type: "doughnut",
  data: {
    labels: cityLabels,
    datasets: [{
      data: cityCounts
    }]
  }
});


const reviewLabels = data.charts.reviews.map(r => r.college);
const reviewCounts = data.charts.reviews.map(r => r.reviews);

if (reviewChart) reviewChart.destroy();

reviewChart = new Chart(document.getElementById("reviewChart"), {
  type: "bar",
  data: {
    labels: reviewLabels,
    datasets: [{
      label: "Reviews",
      data: reviewCounts
    }]
  }
});


const userLabels = data.charts.users.map(u => u.role);
const userCounts = data.charts.users.map(u => u.count);

new Chart(document.getElementById("userChart"), {
  type: "pie",
  data: {
    labels: userLabels,
    datasets: [{
      data: userCounts
    }]
  }
});



    // MOST SAVED
    const mostSavedDiv = document.getElementById("mostSaved");

if (data.most_saved) {
  mostSavedDiv.innerHTML = createCollegeCard(data.most_saved);
} else {
  mostSavedDiv.innerHTML = "<p>No data yet</p>";
}


    // HIGHEST PLACEMENT
const highestPlacementDiv = document.getElementById("highestPlacement");

if (data.highest_placement) {
  highestPlacementDiv.innerHTML =
    createCollegeCard(data.highest_placement);
} else {
  highestPlacementDiv.innerHTML =
    "<p>No placement data available</p>";
}



    // TOP RATED
    const topRatedDiv = document.getElementById("topRated");
    topRatedDiv.innerHTML = "";

    if (data.top_rated.length === 0) {
        topRatedDiv.innerHTML = "<p>No ratings yet</p>";
        return;
    }

    data.top_rated.forEach(college => {
  topRatedDiv.innerHTML += createCollegeCard(college);
});




}

loadDashboard();
