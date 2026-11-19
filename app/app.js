// Vice City Trophy Ledger: tracker, detail view, roadmap, missables, checklist.
// All data lives in data/trophies.json and data/checklist.json; progress lives in
// localStorage on this machine and can be exported to a file and imported back.
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const TROPHY_KEY = 'vct-ledger-v1';
const CHECK_KEY = 'vct-ledger-checklist-v1';
const params = new URLSearchParams(location.search);
const DEMO_EARNED = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 15, 17];

let trophies = [];
let checklist = { items: [] };
let earned = new Set();
let checked = new Set();
let category = 'all';
let gradeFilter = 'all';
let hideSpoilers = true;
let earnedOnly = false;
let detailId = 28;

function loadSaved() {
  try { earned = new Set(JSON.parse(localStorage.getItem(TROPHY_KEY) || '[]')); } catch (e) { earned = new Set(); }
  try { checked = new Set(JSON.parse(localStorage.getItem(CHECK_KEY) || '[]')); } catch (e) { checked = new Set(); }
  if (params.get('demo') === '1') earned = new Set(DEMO_EARNED);
}
function saveTrophies() { localStorage.setItem(TROPHY_KEY, JSON.stringify(Array.from(earned))); }
function saveChecklist() { localStorage.setItem(CHECK_KEY, JSON.stringify(Array.from(checked))); }

function gradeLabel(t) { return t.grade.charAt(0).toUpperCase() + t.grade.slice(1); }
function isHidden(t) { return t.hidden && hideSpoilers && !earned.has(t.id); }

function counts() {
  const total = trophies.length;
  const gs = trophies.filter((t) => earned.has(t.id)).reduce((s, t) => s + t.gamerscore, 0);
  const byGrade = {};
  for (const g of ['platinum', 'gold', 'silver', 'bronze']) {
    byGrade[g] = trophies.filter((t) => t.grade === g && earned.has(t.id)).length + '/' + trophies.filter((t) => t.grade === g).length;
  }
  return { total, gs, byGrade };
}

function renderProgress() {
  const c = counts();
  const n = earned.size;
  $('#earnedCount').textContent = n + ' / ' + c.total;
  $('#gradeCounts').textContent = 'Platinum ' + c.byGrade.platinum + ' · Gold ' + c.byGrade.gold + ' · Silver ' + c.byGrade.silver + ' · Bronze ' + c.byGrade.bronze;
  $('#gsCount').textContent = c.gs.toLocaleString() + ' / 1,000';
  const pct = c.total ? Math.round((n / c.total) * 100) : 0;
  $('#ringNum').textContent = pct + '%';
  $('#ringFg').style.strokeDashoffset = String(326.7 * (1 - n / c.total));
}

function filtered() {
  const q = ($('#search').value || '').trim().toLowerCase();
  return trophies.filter((t) => {
    if (category === 'online') return false;
    if (category === 'story' && t.category !== 'story') return false;
    if (category === 'missable' && !t.missable) return false;
    if (category === 'collectibles' && t.category !== 'collectibles') return false;
    if (category === 'activities' && t.category !== 'activities') return false;
    if (gradeFilter !== 'all' && t.grade !== gradeFilter) return false;
    if (earnedOnly && !earned.has(t.id)) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + (t.chapter || '') + ' ' + t.guide).toLowerCase().includes(q)) return false;
    return true;
  });
}

function cardHtml(t) {
  const hidden = isHidden(t);
  const name = hidden ? 'Hidden story trophy' : t.name;
  const desc = hidden ? 'Earn it to reveal the name and description.' : t.description;
  const pills = '<span class="pill grade-' + t.grade + '">' + gradeLabel(t) + '</span>'
    + '<span class="pill">' + t.gamerscore + 'G</span>'
    + (t.hidden ? '<span class="pill hidden">Hidden</span>' : '')
    + (t.missable ? '<span class="pill miss">Missable</span>' : '')
    + (t.unconfirmed ? '<span class="pill unconf">Unconfirmed</span>' : '');
  const shortGuide = t.guide.split('. ').slice(0, 2).join('. ') + '.';
  return '<article class="card' + (earned.has(t.id) ? ' earned' : '') + '" data-id="' + t.id + '">'
    + '<h3>' + name + '</h3>'
    + '<p class="desc">' + desc + '</p>'
    + '<div class="badges">' + pills + '</div>'
    + '<p class="guide">' + (hidden ? 'Guide hidden until earned.' : shortGuide) + '</p>'
    + '<p class="src">Source: ' + t.source + '</p>'
    + '<div class="row"><button class="earn">' + (earned.has(t.id) ? 'Earned ✓' : 'Mark earned') + '</button>'
    + '<button class="full">Full guide →</button></div>'
    + '</article>';
}

function renderGrid() {
  const list = filtered();
  $('#grid').innerHTML = list.map(cardHtml).join('');
  $('#resultLine').textContent = list.length + ' of ' + trophies.length + ' trophies shown';
  $('#emptyOnline').hidden = category !== 'online';
  $$('#grid .card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = 'rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 8) + 'deg) translateY(-3px)';
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    card.querySelector('.earn').addEventListener('click', (e) => {
      e.stopPropagation();
      const id = Number(card.dataset.id);
      if (earned.has(id)) earned.delete(id); else earned.add(id);
      if (navigator.vibrate) navigator.vibrate(15);
      saveTrophies();
      renderProgress();
      renderGrid();
      renderDetail();
    });
    card.querySelector('.full').addEventListener('click', () => {
      detailId = Number(card.dataset.id);
      renderDetail();
      $('#detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    card.addEventListener('click', () => {
      detailId = Number(card.dataset.id);
      renderDetail();
    });
  });
}

function renderDetail() {
  const t = trophies.find((x) => x.id === detailId) || trophies[0];
  if (!t) return;
  const hidden = isHidden(t);
  $('#detail').innerHTML = '<p class="muted">Full guide — ' + (hidden ? 'Hidden story trophy' : t.name) + '</p>'
    + '<h3>' + (hidden ? 'Hidden story trophy' : t.name) + '</h3>'
    + '<p class="meta">' + gradeLabel(t) + ' · ' + t.gamerscore + 'G · ' + (t.chapter || '') + ' · ' + (t.hint || '')
    + (t.hidden ? ' · Hidden' : '') + (t.missable ? ' · Possibly missable' : '') + (t.unconfirmed ? ' · Unconfirmed' : '')
    + (earned.has(t.id) ? ' · Earned ✓' : '') + '</p>'
    + '<p class="desc">' + (hidden ? 'Earn it to reveal the name and description.' : t.description) + '</p>'
    + '<p class="guide-full">' + (hidden ? 'Guide hidden until earned.' : t.guide) + '</p>'
    + '<p class="src">Source: ' + t.source + ' — guide written in our own words for this entry.</p>'
    + '<button id="detailEarn">' + (earned.has(t.id) ? 'Earned ✓ — tap to unmark' : 'Mark earned') + '</button>';
  $('#detailEarn').addEventListener('click', () => {
    if (earned.has(t.id)) earned.delete(t.id); else earned.add(t.id);
    if (navigator.vibrate) navigator.vibrate(15);
    saveTrophies();
    renderProgress();
    renderGrid();
    renderDetail();
  });
}

function renderMissables() {
  const t = trophies.find((x) => x.missable);
  if (!t) return;
  $('#missCard').innerHTML = '<div class="miss-box">'
    + '<p class="pill miss">Possibly missable · 1 of 55</p>'
    + '<h3>' + t.name + ' <span class="pill grade-bronze">Bronze · 10G</span></h3>'
    + '<p>' + t.description + '</p>'
    + '<p><strong>The real count:</strong> 18 meditation spots across <strong>10 locations</strong> — not 18 spots in one place. Meditating at a spot with Jason <em>and</em> Lucia together counts twice. Track it in Progress &gt; Collections &gt; Exploration &gt; Meditations.</p>'
    + '<p><strong>The Chapter 1 catch:</strong> the morning after the mission Down to Earth, talk to Lucia in the kitchen. She walks out to the balcony at Jason\u2019s house — follow her and choose Accept. It adds +1 to the counter but is NOT marked as a Meditation Spot, and it is unconfirmed whether the trophy needs it. Do it anyway, and keep a Chapter 1 save: it is gone after Chapter 1.</p>'
    + '<p><strong>The last spot</strong> needs Jason and Lucia together, possible after Chapter 2. 100% completion needs only 15 of 18.</p>'
    + '<p class="src">Source: PowerPyx, GTABase</p></div>';
  $('#missEarn').textContent = earned.has(t.id) ? 'Positive Mental Attitude: earned ✓' : 'Positive Mental Attitude: not earned yet — do the balcony meditation in Chapter 1.';
}

function renderChecklist() {
  const groups = {};
  for (const item of checklist.items) {
    if (!groups[item.group]) groups[item.group] = [];
    groups[item.group].push(item);
  }
  const done = checklist.items.filter((item, i) => checked.has(i)).length;
  const total = checklist.items.length;
  $('#checkFill').style.width = total ? Math.round((done / total) * 100) + '%' : '0%';
  $('#checkLine').textContent = done + ' of ' + total + ' requirements done';
  $('#checkGroups').innerHTML = Object.keys(groups).map((g) => {
    const rows = groups[g].map((item) => {
      const i = checklist.items.indexOf(item);
      return '<label class="check-item' + (checked.has(i) ? ' done' : '') + '">'
        + '<input type="checkbox" data-i="' + i + '"' + (checked.has(i) ? ' checked' : '') + '>'
        + '<span><span class="cname">' + item.name + '</span>'
        + '<span class="chint">' + item.hint + '</span></span>'
        + '<span class="cneed">' + item.need + '</span></label>';
    }).join('');
    return '<div class="check-group"><h3>' + g + '</h3>' + rows + '</div>';
  }).join('');
  $$('#checkGroups input[type="checkbox"]').forEach((box) => {
    box.addEventListener('change', () => {
      const i = Number(box.dataset.i);
      if (box.checked) checked.add(i); else checked.delete(i);
      saveChecklist();
      renderChecklist();
    });
  });
}

function switchTab(name) {
  $$('.tabbtn').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
  $$('.panel').forEach((p) => p.classList.toggle('active', p.id === 'tab-' + name));
}

function bindControls() {
  $$('.tabbtn').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  $$('#catChips .chip').forEach((c) => c.addEventListener('click', () => {
    category = c.dataset.cat;
    $$('#catChips .chip').forEach((x) => x.classList.toggle('active', x === c));
    renderGrid();
  }));
  $('#grade').addEventListener('change', (e) => { gradeFilter = e.target.value; renderGrid(); });
  $('#search').addEventListener('input', renderGrid);
  $('#spoilers').addEventListener('change', (e) => { hideSpoilers = e.target.checked; renderGrid(); renderDetail(); });
  $('#earnedOnly').addEventListener('change', (e) => { earnedOnly = e.target.checked; renderGrid(); });
  $('#export').addEventListener('click', () => {
    const data = JSON.stringify({ earned: Array.from(earned), checklist: Array.from(checked) }, null, 2);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    a.download = 'vice-city-trophy-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  $('#import').addEventListener('click', () => $('#importFile').click());
  $('#importFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (Array.isArray(data.earned)) earned = new Set(data.earned.filter((id) => trophies.some((t) => t.id === id)));
      if (Array.isArray(data.checklist)) checked = new Set(data.checklist.filter((i) => i >= 0 && i < checklist.items.length));
      saveTrophies();
      saveChecklist();
      renderProgress();
      renderGrid();
      renderDetail();
      renderChecklist();
    } catch (err) { alert('That file is not valid progress JSON.'); }
  });
  $('#reset').addEventListener('click', () => {
    if (!confirm('Clear all earned trophies and checklist ticks?')) return;
    earned = new Set();
    checked = new Set();
    saveTrophies();
    saveChecklist();
    renderProgress();
    renderGrid();
    renderDetail();
    renderChecklist();
  });
}

async function boot() {
  loadSaved();
  const [tRes, cRes] = await Promise.all([fetch('data/trophies.json'), fetch('data/checklist.json')]);
  const tData = await tRes.json();
  trophies = tData.trophies || tData;
  checklist = await cRes.json();
  bindControls();
  renderProgress();
  renderGrid();
  renderDetail();
  renderMissables();
  renderChecklist();
  const shot = params.get('shot');
  if (shot === 'roadmap' || shot === 'missables' || shot === 'checklist') switchTab(shot);
  if (shot === 'tracker') { detailId = 28; renderDetail(); }
  window.__shotReady = true;
}

boot();
