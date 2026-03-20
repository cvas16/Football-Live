
const BASE = 'http://localhost:3001/api';
let allMatches = [], allCompetitions = [], currentFilter = 'all', liveInterval = null, isLive = false;
let currentCompetition = null, currentSeasonId = null, currentDetailTab = 'live', allDetailMatches = [];
 
const LIVE_S = ['started','live','1st_half','2nd_half','halftime','overtime','1st_extra','2nd_extra','extra_time_halftime','awaiting_extra_time','awaiting_penalties','penalties','interrupted','suspended'];
const ENDED_S = ['ended','closed','aet','ap','abandoned'];
const STATUS_LABEL = {
  'started':'En vivo','live':'En vivo','1st_half':'1er Tiempo','2nd_half':'2do Tiempo',
  'halftime':'Descanso','extra_time_halftime':'Descanso ET','overtime':'Prórroga',
  '1st_extra':'1ra Extra','2nd_extra':'2da Extra','awaiting_extra_time':'Esp. ET',
  'awaiting_penalties':'Esp. Pen','penalties':'Penales','interrupted':'Interrumpido',
  'suspended':'Suspendido','ended':'Final','closed':'Final','aet':'Final ET',
  'ap':'Final Pen','abandoned':'Abandonado','not_started':'Programado',
  'postponed':'Aplazado','start_delayed':'Retrasado','cancelled':'Cancelado'
};
const COLORS = ['#00e5a0','#378add','#ef9f27','#d4537e','#7f77dd','#5dcaa5','#e24b4a'];
function colorFor(name) {
  let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}
 
// Init
const today = new Date(), todayStr = today.toISOString().slice(0,10);
document.getElementById('current-date').textContent = today.toLocaleDateString('es-PE', {weekday:'long',year:'numeric',month:'long',day:'numeric'});
document.getElementById('date-picker').value = todayStr;
 
// ── MATCHES PAGE ──────────────────────────────────────────
function showPage(page, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  btn.classList.add('active');
  if (page === 'competitions' && allCompetitions.length === 0) fetchCompetitions();
}
 
async function fetchMatches() {
  showMatchesLoading();
  const fecha = document.getElementById('date-picker').value || todayStr;
  try {
    const res = await fetch(`${BASE}/schedules/${fecha}/summaries`);
    if (!res.ok) { showMatchesError(res.status); return; }
    const data = await res.json();
    allMatches = data.summaries ?? data.results ?? [];
    updateStats(); renderMatches();
    document.getElementById('last-updated').textContent = new Date().toLocaleTimeString('es-PE');
  } catch (err) { showMatchesError(err.message); }
}
 
function updateStats() {
  const live = allMatches.filter(m => LIVE_S.includes(m.sport_event_status?.match_status)).length;
  const ended = allMatches.filter(m => ENDED_S.includes(m.sport_event_status?.match_status)).length;
  const sched = allMatches.filter(m => m.sport_event_status?.match_status === 'not_started').length;
  document.getElementById('stat-total').textContent = allMatches.length;
  document.getElementById('stat-live').textContent = live;
  document.getElementById('stat-ended').textContent = ended;
  document.getElementById('stat-scheduled').textContent = sched;
}
 
function setFilter(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMatches();
}
 
function renderMatches() {
  let list = allMatches;
  if (currentFilter === 'live') list = allMatches.filter(m => LIVE_S.includes(m.sport_event_status?.match_status));
  else if (currentFilter === 'ended') list = allMatches.filter(m => ENDED_S.includes(m.sport_event_status?.match_status));
  else if (currentFilter === 'scheduled') list = allMatches.filter(m => ['not_started','postponed','cancelled','start_delayed'].includes(m.sport_event_status?.match_status));
  document.getElementById('matches-body').innerHTML = list.length === 0
    ? '<div class="empty-state"><div class="empty-icon">🔍</div>Sin partidos para este filtro</div>'
    : list.map(m => matchRowHTML(m, true)).join('');
}
 
function matchRowHTML(m, showComp) {
  const ev = m.sport_event, st = m.sport_event_status;
  const home = ev.competitors?.find(c => c.qualifier === 'home') ?? {};
  const away = ev.competitors?.find(c => c.qualifier === 'away') ?? {};
  const hs = st?.home_score ?? '-', as_ = st?.away_score ?? '-';
  const ms = st?.match_status ?? 'unknown';
  const isLive = LIVE_S.includes(ms), isEnded = ENDED_S.includes(ms);
  const hw = isEnded && Number(hs) > Number(as_), aw = isEnded && Number(as_) > Number(hs);
  const lbl = STATUS_LABEL[ms] ?? ms;
  const badge = isLive
    ? `<span class="status-badge status-live"><span class="pulse"></span> ${lbl}</span>`
    : isEnded ? `<span class="status-badge status-ended">${lbl}</span>`
    : `<span class="status-badge status-scheduled">${lbl}</span>`;
  const min = st?.clock?.played ?? null;
  const minDisplay = min ? `${min}'` : (isEnded ? 'FT' : '—');
  const extra = showComp
    ? (ev.sport_event_context?.competition?.name ?? '—')
    : new Date(ev.start_time).toLocaleDateString('es-PE', {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
  return `<div class="match-row">
    <div class="match-teams">
      <div class="team-row ${hw ? 'winner' : isEnded ? 'loser' : ''}">${home.name ?? '—'}</div>
      <div class="team-row ${aw ? 'winner' : isEnded ? 'loser' : ''}">${away.name ?? '—'}</div>
    </div>
    <div class="score-cell hide-mobile"><div class="score-display"><span class="score-num">${hs}</span><span class="score-sep">—</span><span class="score-num">${as_}</span></div></div>
    <div class="status-cell">${badge}</div>
    <div class="minute-cell hide-mobile">${minDisplay}</div>
    <div class="competition-cell hide-mobile" style="font-size:11px;color:var(--muted);">${extra}</div>
  </div>`;
}
 
function showMatchesLoading() {
  document.getElementById('matches-body').innerHTML = '<div class="loading-state"><div class="spinner"></div>Cargando partidos...</div>';
}
function showMatchesError(e) {
  let msg = `Error ${e}`;
  if (e === 401) msg = 'API key inválida (401)';
  else if (e === 403) msg = 'Sin acceso (403). Verifica tu plan trial.';
  else if (e === 429) msg = 'Demasiadas peticiones (429). Espera un momento.';
  document.getElementById('matches-body').innerHTML = `<div class="empty-state error-state"><div class="empty-icon">⚠️</div>${msg}</div>`;
}
 
function toggleLive() {
  isLive = !isLive;
  if (isLive) {
    fetchMatches();
    liveInterval = setInterval(fetchMatches, 30000);
    document.querySelector('.btn-outline').textContent = '⏹ Detener';
    document.querySelector('.btn-outline').style.color = 'var(--accent)';
  } else {
    clearInterval(liveInterval);
    document.querySelector('.btn-outline').textContent = '⟳ Auto';
    document.querySelector('.btn-outline').style.color = '';
  }
}
 
// ── COMPETITIONS PAGE ─────────────────────────────────────
async function fetchCompetitions() {
  document.getElementById('comp-count').textContent = 'Cargando...';
  document.getElementById('comp-grid').innerHTML = '<div class="loading-state" style="grid-column:1/-1"><div class="spinner"></div>Cargando competencias...</div>';
  try {
    const res = await fetch(`${BASE}/competitions`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const data = await res.json();
    allCompetitions = data.competitions ?? [];
    renderCompetitions(allCompetitions);
  } catch (err) {
    document.getElementById('comp-grid').innerHTML = `<div class="empty-state error-state" style="grid-column:1/-1"><div class="empty-icon">⚠️</div>${err.message}</div>`;
  }
}
 
function filterCompetitions() {
  const q = document.getElementById('comp-search').value.toLowerCase();
  renderCompetitions(allCompetitions.filter(c =>
    c.name?.toLowerCase().includes(q) ||
    c.category?.name?.toLowerCase().includes(q) ||
    c.category?.country_code?.toLowerCase().includes(q)
  ));
}
 
function renderCompetitions(list) {
  document.getElementById('comp-count').innerHTML = `Mostrando <span>${list.length}</span> de <span>${allCompetitions.length}</span> competencias`;
  if (list.length === 0) {
    document.getElementById('comp-grid').innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🔍</div>Sin resultados</div>';
    return;
  }
  document.getElementById('comp-grid').innerHTML = list.map(c => {
    const cat = c.category?.name ?? '—', cc = c.category?.country_code ?? '';
    const col = colorFor(cat);
    const ini = c.name?.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase() ?? '?';
    const gender = {men:'👨',women:'👩',mixed:'👥'}[c.gender] ?? '⚽';
    return `<div class="comp-card" onclick="openCompetition(${JSON.stringify(c).replace(/"/g,'&quot;')})">
      <div class="comp-icon" style="background:${col}18;border-color:${col}40;color:${col};">${ini}</div>
      <div class="comp-info">
        <div class="comp-name">${c.name ?? '—'} ${gender}</div>
        <div class="comp-meta">${cat}${cc ? ' · ' + cc : ''}</div>
        <div class="comp-id">${c.id}</div>
      </div>
    </div>`;
  }).join('');
}
 
// ── COMPETITION DETAIL ────────────────────────────────────
async function openCompetition(comp) {
  currentCompetition = comp;
  currentDetailTab = 'live';
 
  // Switch to detail view
  document.getElementById('comp-list-view').style.display = 'none';
  document.getElementById('comp-detail-view').style.display = 'block';
 
  // Header
  const col = colorFor(comp.category?.name ?? '');
  const ini = comp.name?.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase() ?? '?';
  document.getElementById('detail-icon').textContent = ini;
  document.getElementById('detail-icon').style.cssText = `background:${col}18;border-color:${col}40;color:${col};width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;flex-shrink:0;border:1px solid;`;
  document.getElementById('detail-title').textContent = comp.name;
  document.getElementById('detail-sub').textContent = (comp.category?.name ?? '') + (comp.category?.country_code ? ' · ' + comp.category.country_code : '') + (comp.gender ? ' · ' + comp.gender : '');
 
  // Reset tabs
  document.querySelectorAll('.detail-tab').forEach((t,i) => t.classList.toggle('active', i===0));
 
  // Load seasons
  await fetchSeasons(comp.id);
}
 
async function fetchSeasons(compId) {
  const sel = document.getElementById('season-select');
  sel.innerHTML = '<option>Cargando temporadas...</option>';
  document.getElementById('detail-body').innerHTML = '<div class="loading-state"><div class="spinner"></div>Cargando temporadas...</div>';
  try {
    const res = await fetch(`${BASE}/competitions/${compId}/seasons`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const data = await res.json();
    const seasons = data.seasons ?? [];
    if (seasons.length === 0) { sel.innerHTML = '<option>Sin temporadas disponibles</option>'; return; }
    // Sort: most recent first
    seasons.sort((a,b) => (b.start_date ?? '').localeCompare(a.start_date ?? ''));
    sel.innerHTML = seasons.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    currentSeasonId = seasons[0].id;
    loadDetailMatches();
  } catch (err) {
    document.getElementById('detail-body').innerHTML = `<div class="empty-state error-state"><div class="empty-icon">⚠️</div>${err.message}</div>`;
  }
}
 
function onSeasonChange() {
  currentSeasonId = document.getElementById('season-select').value;
  loadDetailMatches();
}
 
function setDetailTab(tab, btn) {
  currentDetailTab = tab;
  document.querySelectorAll('.detail-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderDetailMatches();
}
 
async function loadDetailMatches() {
  if (!currentSeasonId) return;
  document.getElementById('detail-body').innerHTML = '<div class="loading-state"><div class="spinner"></div>Cargando partidos...</div>';
  try {
    const res = await fetch(`${BASE}/seasons/${currentSeasonId}/schedules`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const data = await res.json();
    // schedules endpoint returns sport_events array
    const raw = data.sport_events ?? data.schedules ?? [];
    // Wrap into summaries-like format
    allDetailMatches = raw.map(e => ({
      sport_event: e,
      sport_event_status: e.sport_event_status ?? { match_status: 'not_started' }
    }));
    renderDetailMatches();
  } catch (err) {
    document.getElementById('detail-body').innerHTML = `<div class="empty-state error-state"><div class="empty-icon">⚠️</div>${err.message}</div>`;
  }
}
 
function renderDetailMatches() {
  let list = allDetailMatches;
  const now = new Date();
 
  if (currentDetailTab === 'live') {
    list = allDetailMatches.filter(m => LIVE_S.includes(m.sport_event_status?.match_status));
  } else if (currentDetailTab === 'upcoming') {
    list = allDetailMatches
      .filter(m => m.sport_event_status?.match_status === 'not_started' && new Date(m.sport_event.start_time) >= now)
      .sort((a,b) => new Date(a.sport_event.start_time) - new Date(b.sport_event.start_time))
      .slice(0, 20);
  } else if (currentDetailTab === 'results') {
    list = allDetailMatches
      .filter(m => ENDED_S.includes(m.sport_event_status?.match_status))
      .sort((a,b) => new Date(b.sport_event.start_time) - new Date(a.sport_event.start_time))
      .slice(0, 30);
  }
 
  if (list.length === 0) {
    const msgs = { live: 'No hay partidos en vivo ahora mismo', upcoming: 'No hay próximos partidos disponibles', results: 'No hay resultados disponibles' };
    document.getElementById('detail-body').innerHTML = `<div class="empty-state"><div class="empty-icon">${currentDetailTab === 'live' ? '🔴' : currentDetailTab === 'upcoming' ? '📅' : '✅'}</div>${msgs[currentDetailTab]}</div>`;
    return;
  }
 
  document.getElementById('detail-body').innerHTML = list.map(m => matchRowHTML(m, false)).join('');
}
 
function backToCompetitions() {
  document.getElementById('comp-detail-view').style.display = 'none';
  document.getElementById('comp-list-view').style.display = 'block';
  currentCompetition = null;
  currentSeasonId = null;
  allDetailMatches = [];
}