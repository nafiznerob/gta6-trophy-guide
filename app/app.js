// Vice City Trophy Ledger, round 2: tracker, trophy detail view, roadmap,
// missables, the 100% checklist, and sources. Progress is saved in
// localStorage; export/import/reset are local only. The app is plain static
// files, works with the network off, and loads nothing from outside app/.
const KEY = 'vice-city-trophy-ledger-v2';
const CHECK_KEY = 'vice-city-trophy-ledger-checklist-v2';
const DEMO = [2, 3, 8, 15, 16, 17, 18, 19, 20, 21, 32, 35, 42];
const params = new URLSearchParams(location.search);
const demo = params.get('demo') === '1';
const shot = params.get('shot');

const doc = await (await fetch('data/trophies.json')).json();
const checkDoc = await (await fetch('data/checklist.json')).json();
const trophies = doc.trophies;

let earned = new Set(demo ? DEMO.map(id => trophies.find(t => t.id === id).name) : JSON.parse(localStorage.getItem(KEY) ?? '[]'));
let checked = new Set(demo ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : JSON.parse(localStorage.getItem(CHECK_KEY) ?? '[]'));
function save() { if (!demo) localStorage.setItem(KEY, JSON.stringify([...earned])); }
function saveCheck() { if (!demo) localStorage.setItem(CHECK_KEY, JSON.stringify([...checked])); }

const $ = s => document.querySelector(s);
const grid = $('#grid'), detail = $('#detail');
let cat = 'all', grade = 'all', q = '', hideSpoilers = true, earnedOnly = false;

function counts() {
  const by = g => trophies.filter(t => t.grade === g && earned.has(t.name)).length;
  $('#earnedCount').textContent = `${earned.size} / ${trophies.length}`;
  $('#gradeCounts').textContent = `Platinum ${by('platinum')}/1 · Gold ${by('gold')}/2 · Silver ${by('silver')}/6 · Bronze ${by('bronze')}/46`;
  const gs = trophies.filter(t => earned.has(t.name)).reduce((a, t) => a + t.gamerscore, 0);
  $('#gsCount').textContent = `${gs.toLocaleString()} / 1,000 Gamerscore on Xbox`;
  const pct = Math.round(earned.size / trophies.length * 100);
  $('#ringNum').textContent = pct + '%';
  $('#ringFg').style.strokeDashoffset = 326.7 * (1 - earned.size / trophies.length);
}
function mask(t) { return t.hidden && hideSpoilers && !earned.has(t.name); }
function visible(t) {
  if (cat === 'missable' && !t.missable) return false;
  if (cat === 'online') return false;
  if (cat !== 'all' && cat !== 'missable' && t.category !== cat) return false;
  if (grade !== 'all' && t.grade !== grade) return false;
  if (earnedOnly && !earned.has(t.name)) return false;
  if (q && !(t.name + ' ' + t.description + ' ' + t.guide + ' ' + (t.chapter ?? '') + ' ' + (t.hint ?? '')).toLowerCase().includes(q)) return false;
  return true;
}
function tilt(card) {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translateY(-4px)`;
  });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; });
}
function render() {
  counts();
  const list = trophies.filter(visible);
  $('#emptyOnline').hidden = cat !== 'online';
  $('#resultLine').textContent = cat === 'online' ? '' : `${list.length} of 55 trophies shown · every guide is 60–120 words — tap a card for the full guide`;
  grid.replaceChildren();
  for (const t of list) {
    const card = document.createElement('article');
    card.className = 'card' + (earned.has(t.name) ? ' earned' : '') + (t.grade === 'platinum' ? ' platinum-card' : '');
    const isMasked = mask(t);
    const icon = { platinum: '👑', gold: '🥇', silver: '🥈', bronze: '🥉' }[t.grade];
    card.innerHTML = `<div class="card-head"><span class="trophy-ico" aria-hidden="true">${icon}</span><div><h3>${isMasked ? 'Hidden on PSN — earn it to reveal its name' : t.name}</h3><p class="desc">${isMasked ? 'Hidden trophy. Its name and description stay masked until you earn it.' : t.description}</p></div></div><div class="badges"><span class="grade ${t.grade}">${t.grade}</span><span class="gs">${t.gamerscore}G</span>${t.hidden ? '<span class="tag hidden">Hidden</span>' : ''}${t.missable ? '<span class="tag miss">Possibly missable</span>' : ''}${t.unconfirmed ? '<span class="tag unconf">Unconfirmed</span>' : ''}</div><p class="guide">${isMasked ? 'Story trophy — it unlocks as you play. Open it after earning to read the full guide.' : t.guide}</p><p class="meta-line">${isMasked ? '' : `When: ${t.chapter} · ${t.hint}`}</p><p class="src">Source: ${t.source}</p>`;
    const row = document.createElement('div');
    row.className = 'card-actions';
    const detailBtn = document.createElement('button');
    detailBtn.type = 'button'; detailBtn.className = 'detail-btn';
    detailBtn.textContent = 'Full guide →';
    detailBtn.addEventListener('click', e => { e.stopPropagation(); showDetail(t); });
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'earn';
    btn.textContent = earned.has(t.name) ? '✓ Earned — tap to unmark' : 'Mark as earned';
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (earned.has(t.name)) earned.delete(t.name);
      else { earned.add(t.name); btn.classList.add('pop'); setTimeout(() => btn.classList.remove('pop'), 500); }
      save(); render(); syncMissBtn();
    });
    row.append(detailBtn, btn);
    card.append(row);
    card.addEventListener('click', () => showDetail(t));
    tilt(card);
    grid.append(card);
  }
}
function showDetail(t) {
  const isMasked = mask(t);
  detail.hidden = false;
  detail.innerHTML = `<button class="detail-close" id="detailClose" type="button" aria-label="Close full guide">✕ Close</button><p class="detail-kicker">Full guide · ${t.grade} trophy · ${t.gamerscore}G on Xbox</p><h3>${isMasked ? 'Hidden trophy' : t.name}</h3><p class="detail-desc"><strong>Official description:</strong> ${isMasked ? 'Hidden on PSN — earn it to reveal.' : t.description}</p><div class="detail-facts"><span><strong>When</strong> ${isMasked ? 'Story — it unlocks as you play' : t.chapter}</span><span><strong>How hard</strong> ${isMasked ? 'Story — unmissable' : t.hint}</span><span><strong>Hidden</strong> ${t.hidden ? 'Yes — masked until earned' : 'No'}</span><span><strong>Missable</strong> ${t.missable ? 'Possibly — see the Missables tab' : 'No'}</span><span><strong>Status</strong> ${earned.has(t.name) ? '✓ Earned' : 'Not earned yet'}</span></div><p class="detail-guide">${isMasked ? 'This is a story trophy. It unlocks as you play, and cannot be missed.' : t.guide}</p><p class="src">Source: ${t.source}${t.unconfirmed ? ' — labelled unconfirmed: the exact steps are not confirmed by both sources yet, so this guide says so instead of guessing.' : ''}${t.missable ? ' — the only possibly-missable trophy. See the Missables tab.' : ''}</p>`;
  $('#detailClose').addEventListener('click', () => { detail.hidden = true; });
  detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
// tabs
const tabs = [...document.querySelectorAll('.tab')];
function activate(name) {
  tabs.forEach(b => { const on = b.dataset.tab === name; b.classList.toggle('active', on); b.setAttribute('aria-selected', on); });
  document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + name));
}
tabs.forEach(b => b.addEventListener('click', () => activate(b.dataset.tab)));
// controls
$('#search').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); render(); });
$('#grade').addEventListener('change', e => { grade = e.target.value; render(); });
$('#spoilers').addEventListener('change', e => { hideSpoilers = e.target.checked; render(); });
$('#earnedOnly').addEventListener('change', e => { earnedOnly = e.target.checked; render(); });
document.querySelectorAll('#catChips .chip').forEach(c => c.addEventListener('click', () => {
  document.querySelectorAll('#catChips .chip').forEach(x => x.classList.remove('active'));
  c.classList.add('active'); cat = c.dataset.cat; render();
}));
$('#export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ earned: [...earned], checklist: [...checked] }, null, 2)], { type: 'application/json' }));
  a.download = 'vice-city-trophy-progress.json'; a.click();
});
$('#import').addEventListener('change', async e => {
  const f = e.target.files[0]; if (!f) return;
  try { const d = JSON.parse(await f.text()); earned = new Set(d.earned ?? d); save(); render(); syncMissBtn(); } catch { alert('That file is not a valid progress export.'); }
});
$('#reset').addEventListener('click', () => { if (confirm('Clear all earned trophies and checklist progress?')) { earned = new Set(); checked = new Set(); save(); saveCheck(); render(); renderChecklist(); syncMissBtn(); } });
// missables tab button
const missBtn = $('#missEarn');
function syncMissBtn() {
  const on = earned.has('Positive Mental Attitude');
  missBtn.textContent = on ? '✓ Positive Mental Attitude earned' : 'Mark Positive Mental Attitude earned';
  missBtn.classList.toggle('done', on);
}
missBtn.addEventListener('click', () => {
  if (earned.has('Positive Mental Attitude')) earned.delete('Positive Mental Attitude');
  else earned.add('Positive Mental Attitude');
  save(); render(); syncMissBtn();
});
// 100% checklist
function renderChecklist() {
  const host = $('#checkGroups'); host.replaceChildren();
  for (const g of ['Story & Tasks', 'Exploration & Activities', 'Discovery']) {
    const items = checkDoc.items.map((it, i) => ({ ...it, i })).filter(it => it.group === g);
    const sec = document.createElement('div'); sec.className = 'check-group';
    sec.innerHTML = `<h3>${g} — ${items.filter(it => checked.has(it.i)).length}/${items.length}</h3>`;
    for (const it of items) {
      const lab = document.createElement('label'); lab.className = 'check-item' + (checked.has(it.i) ? ' done' : '');
      lab.innerHTML = `<input type="checkbox" ${checked.has(it.i) ? 'checked' : ''}><span><span class="nm">${it.name}</span> <span class="need">${it.need}</span><span class="hint">${it.hint}</span></span>`;
      lab.querySelector('input').addEventListener('change', e => { if (e.target.checked) checked.add(it.i); else checked.delete(it.i); saveCheck(); renderChecklist(); });
      sec.append(lab);
    }
    host.append(sec);
  }
  $('#checkFill').style.width = (checked.size / checkDoc.items.length * 100) + '%';
  $('#checkLine').textContent = `${checked.size} of ${checkDoc.items.length} done — ${Math.round(checked.size / checkDoc.items.length * 100)}% of the way to A Long Road`;
}
render(); renderChecklist(); syncMissBtn();
if (shot && ['tracker', 'roadmap', 'missables', 'checklist', 'sources'].includes(shot)) activate(shot);
if (shot === 'tracker') showDetail(trophies.find(t => t.id === 28));
window.__shotReady = true;
