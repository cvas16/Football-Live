import { BASE } from "../config.js";
import { state } from "../state.js";
import { errorHTML } from "../ui/helpers.js";
import {updateStats, renderMatches} from './render.js'

export async function fetchMatches() {
    document.getElementById('matches-body').innerHTML = 
    '<div class="loading-state"><div class="spinner"></div>Cargando partidos...</div>';

    const fecha = document.getElementById('date-picker').value || todayStr;
    try {
        const [dayRes, LiveRes] = await Promise.all([
            fetch(`${BASE}/schedules/${fecha}/summaries`),
            fetch(`${BASE}/schedules/live/summaries`),
        ]);

        if(!dayRes.ok) {showMatchesError(dayRes.status); return;}

        const dayData = await dayRes.json();
        const dayList = dayData.summaries ?? dayData.results ?? [];

        const liveMap = new Map();
        if(LiveRes.ok){
            const liveData = await LiveRes.json();
            for(const m of (liveData.summaries ?? [])){
                liveMap.set(m.sport_event?.id,m)
            }
        }

        state.allMatches = dayList.map(m => {
            const id = m.sport_event?.id;
            const liveVer = liveMap.get(id);
            return liveVer ?? m;
        });

        for(const [id,liveMatch] of liveMap){
            const alreadyIn = state.allMatches.some(m => m.sport_event?.id === id);
            if(!alreadyIn) state.allMatches.push(liveMatch);
        }

        updateStats();
        renderMatches();
        document.getElementById('last-updated').textContent = 
        new Date().toLocaleTimeString('es-PE');
    } catch (err) { 
        showMatchesError(err.message); }
}

function showMatchesError(e){
    const msg = 
    e === 401 ? 'API key inválida (401)':
    e === 403 ?'Sin acceso (403). Verifica tu plan trial.':
    e === 429 ? 'Demasiadas peticiones (429). Espera un momento.':
    `Error: ${e}`
    document.getElementById('matches-body').innerHTML = 
    errorHTML(msg);
}