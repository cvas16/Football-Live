import { BASE } from "../config.js";
import { state } from "../state.js";
import { loadingHTML,errorHTML } from "../ui/helpers.js";
import { renderCompetitions }    from './render.js';
import { loadDetailMatches,renderDetailMatches } from "./seasons.js";

export async function fetchCompetitions() {
  document.getElementById('comp-count').textContent = 'Cargando...';
  document.getElementById('comp-grid').innerHTML = 
  `<div style="grid-column:1/-1">${loadingHTML('Cargando competencias... ')}</div>`;
  try {
    const res = await fetch(`${BASE}/competitions`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const data = await res.json();
    state.allCompetitions = data.competitions ?? [];
    renderCompetitions(state.allCompetitions);
  } catch (err) {
    document.getElementById('comp-grid').innerHTML = 
    `<div style="grid-column:1/-1">${errorHTML(err.message)}</div>`;
  }
}

export async function fetchSeasons(compId) {
  const sel = document.getElementById('season-select');
  sel.innerHTML = '<option>Cargando temporadas...</option>';
  document.getElementById('detail-body').innerHTML = loadingHTML("Cargando temporadas...");

  try {
    const res = await fetch(`${BASE}/competitions/${compId}/seasons`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const data = await res.json();
    const seasons = (data.seasons ?? []).sort((a,b)=>
    (b.start_date ?? '').localeCompare(a.start_date ?? ''));

    if (seasons.length === 0) { 
      sel.innerHTML = '<option>Sin temporadas disponibles</option>';
      document.getElementById('detail-body').innerHTML = 
      `<div class="empty-state"><div class="empty-icon">📅</div>Sin temporadas disponibles</div>`
      return; 
    }

    sel.innerHTML = seasons.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    state.currentSeasonId = seasons[0].id;
    loadDetailMatches();
  } catch (err) {
    document.getElementById('detail-body').innerHTML = errorHTML(err.message);
  }
}

