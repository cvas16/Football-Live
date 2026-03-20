import { state } from "../state.js";
import { BASE,LIVE_S,ENDED_S } from "../config.js";
import { loadingHTML,emptyHTML,errorHTML } from "../ui/helpers.js";
import { matchRowHTML } from "../ui/matchRow.js";

export async function loadDetailMatches() {
  if (!state.currentSeasonId && state.currentCompetition) return;

  document.getElementById('detail-body').innerHTML = loadingHTML('Cargando partidos...');

  try {
    if(state.currentDetailTab === 'live'){
        await loadLiveMatches();
    }
    else if(state.currentDetailTab === 'upcoming'){
        await loadUpcomingMatches();
    }
    else if(state.currentDetailTab === 'results'){
        await loadResultMatches();
    }
  } catch (err) {
    document.getElementById('detail-body').innerHTML = errorHTML(err.message);
  }
}

async function loadLiveMatches() {
    const res = await fetch(`${BASE}/schedules/live/summaries`);
    if(!res.ok) throw new Error(`Error ${res.status}`);
    const data = await res.json();
    const all = data.summaries ?? [];

    const compId = state.currentCompetition?.id;
    state.allDetailMatches = compId
    ? all.filter(m=>
        m.sport_event?.sport_event_context?.competition?.id === compId)
    :all;
    
    renderDetailMatches();
}

async function loadUpcomingMatches(){
    if(!state.currentSeasonId){
        document.getElementById('detail-body').innerHTML=
        emptyHTML('📅','No hay temporada seleccionada');
        return;
    }

    const res = await fetch(`${BASE}/seasons/${state.currentSeasonId}/schedules`);
    if(!res.ok) throw new Error(`Error ${res.status}`);
    const data = await res.json();
    const raw = data.sport_events ?? data.schedules ?? [];

    const now = new Date();

    const normalized = raw.map(e =>({
        sport_event:        e.sport_event      ?? e,
        sport_event_status: e.sport_event_status ?? { match_status: 'not_started' },
    }));

    const upcoming= normalized.filter(m =>{
        const ms = m.sport_event_status?.match_status ?? 'not_started';
        const start= new Date(m.sport_event?.start_time ?? 0);
        const notPlayed = !ENDED_S.includes(ms) && !LIVE_S.includes(ms);
        return notPlayed && start >= now
    })

    state.allDetailMatches = upcoming
    .sort((a,b)=> new Date(a.sport_event.start_time) - new Date(b.sport_event.start_time))
    .slice(0,40);

    renderDetailMatches();
}

async function loadResultMatches(){
    if(!state.currentSeasonId){
        document.getElementById('detail-body').innerHTML=
        emptyHTML('✅','No hay temporada seleccionada');
        return;
    }

    let res = await fetch(`${BASE}/seasons/${state.currentSeasonId}/summaries`);

    if(!res.ok){
        res = await fetch(`${BASE}/seasons/${state.currentSeasonId}/schedules`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
    }

    const data = await res.json();
    const raw  = data.summaries ?? data.sport_events ?? data.schedules ?? [];
    
    const normalized = raw.map(e => ({
        sport_event:        e.sport_event      ?? e,
        sport_event_status: e.sport_event_status ?? { match_status: 'ended' },
    }));


    state.allDetailMatches = normalized
    .filter(m =>ENDED_S.includes(m.sport_event_status?.match_status))
    .sort((a,b)=> new Date(b.sport_event.start_time) - new Date(a.sport_event.start_time))
    .slice(0,40);

    renderDetailMatches();
}

// async function loadScheduleFallBack() {
//     const res = await fetch(`${BASE}/seasons/${state.currentSeasonId}/schedules`);
//     if(!res.ok) throw new Error(`Error ${res.status}`);
//     const data = await res.json();
//     const raw = data.sport_events ?? data.schedules ?? [];

//     state.allDetailMatches = raw
//     .filter(e => ENDED_S.includes(e.sport_event_status?.match_status))
//     .sort((a,b)=> new Date(b.start_time) - new Date(a.start_time))
//     .slice(0,40)
//     .map(e =>({
//         sport_event: e,
//         sport_event_status: e.sport_event_status ?? {match_status: 'not_started'},
//     }));
//     renderDetailMatches();
// }

export function renderDetailMatches() {
    let list = state.allDetailMatches;
    
    if (list.length === 0) {
        const icons = {live: '🔴', upcoming: '📅', results: '✅'}
        const msgs = { 
            live: 'No hay partidos en vivo en esta competencia ahora mismo', 
            upcoming: 'No hay próximos partidos disponibles', 
            results: 'No hay resultados disponibles para esta temporada' 
        };
        document.getElementById('detail-body').innerHTML = 
        emptyHTML(icons[state.currentDetailTab], msgs[state.currentDetailTab]);
        return;
    }
    
    document.getElementById('detail-body').innerHTML = 
    list.map(m => matchRowHTML(m, false)).join('');
}