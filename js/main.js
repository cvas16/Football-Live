import { showPage } from "./ui/nav.js";
import { fetchMatches } from "./matches/fetch.js";
import { setFilter,toggleLive } from "./matches/filters.js";
import { fetchCompetitions } from "./competitions/fetch.js";
import { filterCompetitions } from "./competitions/render.js";
import { openCompetition,
    onSeasonChange,
    setDetailTab,
    backToCompetitions
    } from "./competitions/detail.js";

const today    = new Date();
const todayStr = today.toISOString().slice(0, 10);

document.getElementById('current-date').textContent =
  today.toLocaleDateString('es-PE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
document.getElementById('date-picker').value = todayStr;
 
//Config bar 
document.getElementById('btn-load').addEventListener('click', fetchMatches);
document.getElementById('date-picker').addEventListener('change', fetchMatches);
document.getElementById('btn-auto').addEventListener('click', toggleLive);
 
// Nav tabs 
document.querySelectorAll('.nav-tab').forEach(btn => {
  btn.addEventListener('click', () => showPage(btn.dataset.page, btn));
});
 
//  Match filter buttons 
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => setFilter(btn.dataset.filter, btn));
});
 
//Competition search 
document.getElementById('comp-search').addEventListener('input', filterCompetitions);
 
//  Competition card clicks 
document.getElementById('comp-grid').addEventListener('click', e => {
  const card = e.target.closest('.comp-card');
  if (!card) return;
  const comp = JSON.parse(decodeURIComponent(card.dataset.comp));
  openCompetition(comp);
});
 
//Detail: back button 
document.getElementById('btn-back').addEventListener('click', backToCompetitions);
 
// Detail: season selector
document.getElementById('season-select').addEventListener('change', onSeasonChange);
 
//  Detail: tab buttons 
document.querySelectorAll('.detail-tab').forEach(btn => {
  btn.addEventListener('click', () => setDetailTab(btn.dataset.tab, btn));
});