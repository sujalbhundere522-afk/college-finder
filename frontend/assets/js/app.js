// assets/js/app.js
// Enhanced UI logic: autosuggest, skeleton loader, modal, compare bar

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

document.addEventListener('DOMContentLoaded', () => {
  // elements
  const resultsEl = $('#results');
  const marksEl = $('#marks');
  const streamEl = $('#stream');
  const cityEl = $('#city');
  const maxFeesEl = $('#max_fees');
  const sortEl = $('#sort');
  const quickEl = $('#quick-search');
  const globalSearch = $('#global-search');
  const autosuggest = $('#autosuggest');

  const btnSearch = $('#btn-search');
  const btnReset = $('#btn-reset');
  const btnQuick = $('#btn-quick');
  const btnRecommend = $('#btn-recommend');
  const btnFavs = $('#btn-favs');
  const btnCompare = $('#btn-compare');
  const btnOpenCompare = $('#btn-open-compare');
  const btnClearCompare = $('#btn-clear-compare');

  const compareBar = $('#compare-bar');
  const compareCount = $('#compare-count');
  const modal = $('#modal');
  const modalClose = $('#modal-close');
  const modalTitle = $('#modalTitle');
  const modalBody = $('#modalBody');
  const countEl = $('#count');
  const noResults = $('#no-results');

  $('#year').textContent = new Date().getFullYear();

  // state
  let visible = [];
  let selectedForCompare = new Set();
  let favorites = new Set(JSON.parse(localStorage.getItem('favs')||"[]"));

  // initial render
  showSkeleton();
  setTimeout(()=> renderResults(COLLEGES.slice(0,8)), 500);

  // autosuggest data (names + cities)
  const suggestions = [...new Set(COLLEGES.flatMap(c=>[c.name,c.city]))];

  // handlers
  btnSearch.onclick = () => {
    const filters = {
      marks: parseFloat(marksEl.value) || null,
      stream: streamEl.value || null,
      city: (cityEl.value||"").trim() || null,
      max_fees: parseInt(maxFeesEl.value) || null,
      sort: sortEl.value || "relevance"
    };
    const res = applyFilters(COLLEGES, filters);
    visible = applySort(res, filters.sort);
    showSkeleton();
    setTimeout(()=> renderResults(visible), 350);
  };

  btnReset.onclick = () => {
    marksEl.value=''; streamEl.value=''; cityEl.value=''; maxFeesEl.value=''; sortEl.value='relevance';
    visible = COLLEGES.slice(0,8);
    renderResults(visible);
  };

  btnQuick.onclick = () => {
    const q = quickEl.value.trim().toLowerCase();
    if(!q) return renderResults(COLLEGES.slice(0,8));
    const res = COLLEGES.filter(c => (c.name + ' ' + c.city).toLowerCase().includes(q));
    visible = res;
    renderResults(res);
  };

  btnRecommend.onclick = () => {
    const marks = parseFloat(marksEl.value) || null;
    const city = (cityEl.value||"").trim() || null;
    const maxfees = parseInt(maxFeesEl.value) || null;
    const candidates = COLLEGES.filter(c => !maxfees || c.fees <= maxfees);
    const recs = weightedRecommend(candidates, marks, city);
    visible = recs;
    showSkeleton();
    setTimeout(()=> renderResults(recs), 450);
    window.scrollTo({top:0,behavior:'smooth'});
  };

  btnFavs.onclick = () => {
    const favArr = Array.from(favorites);
    const favItems = COLLEGES.filter(c => favArr.includes(c.id));
    if(favItems.length===0) { alert("No favorites saved yet."); return; }
    visible = favItems;
    renderResults(favItems);
  };

  btnCompare.onclick = () => {
    if(selectedForCompare.size === 0) { alert("Select colleges (up to 3) to compare."); return; }
    openCompareView();
  };

  btnOpenCompare && (btnOpenCompare.onclick = () => openCompareView());
  btnClearCompare && (btnClearCompare.onclick = () => {
    selectedForCompare.clear();
    updateCompareBar();
    // uncheck checkboxes
    $$('input.compare-checkbox').forEach(c => c.checked = false);
  });

  modalClose.onclick = closeModal;

  // global search autosuggest
  globalSearch.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if(!q){ autosuggest.classList.add('hidden'); return; }
    const matches = suggestions.filter(s => s.toLowerCase().includes(q)).slice(0,6);
    autosuggest.innerHTML = matches.map(m => `<div role="option" tabindex="0">${escapeHTML(m)}</div>`).join('');
    autosuggest.classList.toggle('hidden', matches.length===0);
    // click handler
    autosuggest.querySelectorAll('div').forEach(div=>{
      div.onclick = ()=> {
        globalSearch.value = div.textContent;
        autosuggest.classList.add('hidden');
        // try a quick search by city/name
        quickEl.value = div.textContent;
        btnQuick.click();
      };
      div.onkeydown = (ev) => { if(ev.key === 'Enter') div.click(); };
    });
  });

  // click outside autosuggest closes it
  document.addEventListener('click', (ev) => {
    if(!ev.target.closest('.search-inline')) autosuggest.classList.add('hidden');
  });

  // render functions
  function showSkeleton(){
    resultsEl.innerHTML = '';
    for(let i=0;i<4;i++){
      const sk = document.createElement('div');
      sk.className = 'card skeleton';
      sk.style.height = '100px';
      resultsEl.appendChild(sk);
    }
    noResults.classList.add('hidden');
  }

  function renderResults(list){
    resultsEl.innerHTML = '';
    if(!list || list.length === 0){
      noResults.classList.remove('hidden');
      countEl.textContent = 0;
      return;
    }
    noResults.classList.add('hidden');
    list.forEach(c => resultsEl.appendChild(createCard(c)));
    countEl.textContent = list.length;
    attachCardHandlers();
    updateCompareBar();
  }

  function createCard(c){
    const div = document.createElement('div');
    div.className = 'college-card';
    div.innerHTML = `
      <div class="college-thumb">${escapeInitials(c.name)}</div>
      <div class="college-body">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div class="college-title">${escapeHTML(c.name)}</div>
            <div class="college-meta">${escapeHTML(c.city)}, ${escapeHTML(c.state)}</div>
          </div>
          <div style="text-align:right">
            <div style="font-weight:800">₹${numberWithCommas(c.fees)}</div>
            <div class="college-meta">Cutoff: ${c.cutoff}</div>
          </div>
        </div>
        <div class="college-tags">
          <div class="tag">Rank: ${c.ranking}</div>
          <div class="tag">Rating: ${c.rating}</div>
          <div class="tag">${c.stream}</div>
        </div>
        <div style="margin-top:10px">${escapeHTML(c.short_desc)}</div>
        <div class="card-actions">
          <label style="display:flex;align-items:center"><input type="checkbox" class="compare-checkbox" data-id="${c.id}"> Compare</label>
          <div style="margin-left:auto;display:flex;gap:8px">
            <button class="btn small btn-view" data-id="${c.id}">View</button>
            <button class="btn small outline btn-save" data-id="${c.id}">${favorites.has(c.id)?'Saved':'Save'}</button>
          </div>
        </div>
      </div>
    `;
    return div;
  }

  function attachCardHandlers(){
    // checkboxes
    $$('input.compare-checkbox').forEach(chk=>{
      chk.onchange = () => {
        const id = parseInt(chk.dataset.id);
        if(chk.checked){
          if(selectedForCompare.size >= 3){ chk.checked=false; alert("Maximum 3 colleges for compare"); return; }
          selectedForCompare.add(id);
        } else selectedForCompare.delete(id);
        updateCompareBar();
      };
      // pre-check if present
      chk.checked = selectedForCompare.has(parseInt(chk.dataset.id));
    });

    // view buttons
    $$('.btn-view').forEach(b => {
      b.onclick = () => {
        const id = parseInt(b.dataset.id);
        const col = COLLEGES.find(x => x.id === id);
        openModalWith(col);
      };
    });

    // save buttons
    $$('.btn-save').forEach(b => {
      b.onclick = () => {
        const id = parseInt(b.dataset.id);
        if(favorites.has(id)){ favorites.delete(id); b.textContent='Save'; }
        else { favorites.add(id); b.textContent='Saved'; }
        localStorage.setItem('favs', JSON.stringify(Array.from(favorites)));
      };
      // set label initially
      const id = parseInt(b.dataset.id);
      b.textContent = favorites.has(id) ? 'Saved' : 'Save';
    });
  }

  // compare bar ui
  function updateCompareBar(){
    const n = selectedForCompare.size;
    compareBar.classList.toggle('hidden', n === 0);
    $('#compare-count') && ($('#compare-count').textContent = `${n} selected`);
    compareCount && (compareCount.textContent = `${n} selected`);
  }

  function openCompareView(){
    const ids = Array.from(selectedForCompare);
    if(ids.length === 0) return alert("No colleges selected");
    // build comparison HTML (simple side by side)
    let html = '<div style="display:flex;gap:12px;flex-wrap:wrap">';
    ids.forEach(id=>{
      const c = COLLEGES.find(x=>x.id===id);
      html += `<div style="min-width:220px;background:#fff;padding:12px;border-radius:8px;color:#111">
        <h4>${escapeHTML(c.name)}</h4>
        <div>City: ${escapeHTML(c.city)}</div>
        <div>Fees: ₹${numberWithCommas(c.fees)}</div>
        <div>Cutoff: ${c.cutoff}</div>
        <div>Rank: ${c.ranking}</div>
        <div style="margin-top:8px">Facilities: ${c.facilities.join(', ')}</div>
      </div>`;
    });
    html += '</div>';
    openModal('Compare Colleges', html);
  }

  // modal helpers
  function openModalWith(c){
    const body = `<div style="display:flex;gap:12px;flex-wrap:wrap">
      <div style="flex:1">
        <strong>Stream:</strong> ${c.stream}<br/>
        <strong>Courses:</strong> ${c.courses.join(', ')}<br/>
        <strong>Placements:</strong> ${c.placements || 'N/A'}<br/>
        <strong>Facilities:</strong> ${c.facilities.join(', ')}<br/>
      </div>
      <div style="flex:0 0 200px;text-align:right">
        <strong>Fees:</strong><div>₹${numberWithCommas(c.fees)}</div>
        <strong>Cutoff:</strong><div>${c.cutoff}</div>
        <strong>Rating:</strong><div>${c.rating}</div>
      </div>
    </div><div style="margin-top:12px">${escapeHTML(c.short_desc)}</div>`;
    openModal(c.name, body);
  }

  function openModal(title, html){
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    modal.classList.remove('hidden');
    modal.focus();
  }

  function closeModal(){ modal.classList.add('hidden'); }

  // filtering & sort logic (same as before, improved)
  function applyFilters(list, filters){
    return list.filter(c=>{
      if(filters.stream && c.stream !== filters.stream) return false;
      if(filters.city && c.city.toLowerCase() !== filters.city.toLowerCase()) return false;
      if(filters.max_fees && c.fees > filters.max_fees) return false;
      // soft check for marks: allow some tolerance
      if(filters.marks && filters.marks + 5 < c.cutoff) return false;
      return true;
    });
  }

  function applySort(list, sortKey){
    const arr = [...list];
    switch(sortKey){
      case 'fees_asc': return arr.sort((a,b)=>a.fees-b.fees);
      case 'fees_desc': return arr.sort((a,b)=>b.fees-a.fees);
      case 'cutoff_desc': return arr.sort((a,b)=>b.cutoff-a.cutoff);
      case 'ranking_asc': return arr.sort((a,b)=>a.ranking-b.ranking);
      default: return arr;
    }
  }

  // weighted recommend (same principle, tuned)
  function weightedRecommend(list, marks, preferredCity){
    let arr = list.map(x=>({...x}));
    // compute normalized components
    const minFees = Math.min(...arr.map(x=>x.fees));
    const maxFees = Math.max(...arr.map(x=>x.fees));
    const minRank = Math.min(...arr.map(x=>x.ranking));
    const maxRank = Math.max(...arr.map(x=>x.ranking));

    arr.forEach(c => {
      // marks score: how above cutoff
      c.marks_score = marks ? Math.max(0, (marks - c.cutoff)/100) : 0.5;
      c.fees_score = 1 - ((c.fees - minFees) / (maxFees - minFees + 1));
      c.rank_score = 1 - ((c.ranking - minRank) / (maxRank - minRank + 1));
      c.city_bonus = preferredCity && c.city.toLowerCase() === preferredCity.toLowerCase() ? 0.12 : 0;
      // final weighted score
      c.score = (0.5 * c.marks_score) + (0.2 * c.fees_score) + (0.18 * c.rank_score) + (0.12 * c.city_bonus);
    });

    arr.sort((a,b)=>b.score - a.score);
    return arr.slice(0,10);
  }

  // helpers
  function numberWithCommas(x){ if(!x && x!==0) return x; return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function escapeHTML(str){ if(!str) return ''; return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }
  function escapeInitials(name){ return (name.split(' ').slice(0,2).map(w=>w[0]).join('')).toUpperCase(); }

  // keyboard: Esc closes modal
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeModal(); });

});
