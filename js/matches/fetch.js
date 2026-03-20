import { BASE } from "../config.js";
import { state } from "../state.js";
import { errorHTML } from "../ui/helpers.js";
import {updateStats, renderMatches} from './render.js'

export async function fetchMatches() {
    document.getElementById('matches-body').innerHTML = 
    '<div class="loading-state"><div class="spinner"></div>Cargando partidos...</div>';

    const fecha = document.getElementById('date-picker').value || todayStr;
    try {
        const res = await fetch(`${BASE}/schedules/${fecha}/summaries`);
        if (!res.ok) { showMatchesError(res.status); return; }

        const data = await res.json();
        state.allMatches = data.summaries ?? data.results ?? [];

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