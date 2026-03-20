import { BASE } from "../config.js";
import { state } from "../state.js";
import { LIVE_S,ENDED_S } from "../config.js";
import { loadingHTML,emptyHTML,errorHTML } from "../ui/helpers.js";
import { matchRowHTML } from "../ui/matchRow.js";

export async function loadDetailMatches() {
  if (!state.currentSeasonId) return;
  document.getElementById('detail-body').innerHTML = loadingHTML('Cargando partidos...');
  try {
    const res = await fetch(`${BASE}/seasons/${state.currentSeasonId}/schedules`);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const data = await res.json();
    // el endpoint calendarios no s retorna sport_event como array
    const raw = data.sport_events ?? data.schedules ?? [];
    // Wrap into summaries-like format
    state.allDetailMatches = raw.map(e => ({
      sport_event: e,
      sport_event_status: e.sport_event_status ?? { match_status: 'not_started' }
    }));
    renderDetailMatches();
  } catch (err) {
    document.getElementById('detail-body').innerHTML = errorHTML(err.message);
  }
}

export function renderDetailMatches() {
    const now = new Date();
    let list = state.allDetailMatches;
    
    if (state.currentDetailTab === 'live') {
        list = state.allDetailMatches.filter(m => LIVE_S.includes(m.sport_event_status?.match_status));
    } else if (state.currentDetailTab === 'upcoming') {
        list = state.allDetailMatches
        .filter(m => 
            m.sport_event_status?.match_status === 'not_started' && 
            new Date(m.sport_event.start_time) >= now)
        .sort((a,b) => new Date(a.sport_event.start_time) - new Date(b.sport_event.start_time))
        .slice(0, 20);
    } else if (state.currentDetailTab === 'results') {
        list = state.allDetailMatches
        .filter(m => ENDED_S.includes(m.sport_event_status?.match_status))
        .sort((a,b) => new Date(b.sport_event.start_time) - new Date(a.sport_event.start_time))
        .slice(0, 30);
    }
    
    if (list.length === 0) {
        const icons = {live: '🔴', upcoming: '📅', results: '✅'}
        const msgs = { 
            live: 'No hay partidos en vivo ahora mismo', 
            upcoming: 'No hay próximos partidos disponibles', 
            results: 'No hay resultados disponibles' 
        };
        document.getElementById('detail-body').innerHTML = 
        emptyHTML(icons[state.currentDetailTab], msgs[state.currentDetailTab]);
        return;
    }
    
    document.getElementById('detail-body').innerHTML = 
    list.map(m => matchRowHTML(m, false)).join('');
}