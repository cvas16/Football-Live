import { LIVE_S,ENDED_S } from "../config.js";
import { state } from "../state.js";
import { emptyHTML } from "../ui/helpers.js";
import { matchRowHTML } from "../ui/matchRow.js";

export function updateStats() {
    const live = state.allMatches.filter(m => LIVE_S.includes(m.sport_event_status?.match_status)).length;
    const ended = state.allMatches.filter(m => ENDED_S.includes(m.sport_event_status?.match_status)).length;
    const sched = state.allMatches.filter(m => m.sport_event_status?.match_status === 'not_started').length;
    
    document.getElementById('stat-total').textContent = state.allMatches.length;
    document.getElementById('stat-live').textContent = live;
    document.getElementById('stat-ended').textContent = ended;
    document.getElementById('stat-scheduled').textContent = sched;
}

export function renderMatches() {
    let list = state.allMatches;
    if (state.currentFilter === 'live') 
        list = state.allMatches.filter(m => LIVE_S.includes(m.sport_event_status?.match_status));
    else if (state.currentFilter === 'ended') 
        list = state.allMatches.filter(m => ENDED_S.includes(m.sport_event_status?.match_status));
    else if (state.currentFilter === 'scheduled') 
        list = state.allMatches.filter(m => 
    ['not_started','postponed','cancelled','start_delayed']
    .includes(m.sport_event_status?.match_status));
    
    document.getElementById('matches-body').innerHTML = list.length === 0
        ? emptyHTML('🔍','Sin partidos para este filtro')
        : list.map(m => matchRowHTML(m, true)).join('');
}