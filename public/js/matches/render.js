import { LIVE_S,ENDED_S,STATUS_LABEL,FEATURED_LEAGUES } from "../config.js";
import { state } from "../state.js";
import { emptyHTML } from "../ui/helpers.js";

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
    const body = document.getElementById('matches-body');

    let list = state.allMatches;
    if (state.currentFilter === 'live') 
        list = list.filter(m => LIVE_S.includes(m.sport_event_status?.match_status));
    else if (state.currentFilter === 'ended') 
        list = list.filter(m => ENDED_S.includes(m.sport_event_status?.match_status));
    else if (state.currentFilter === 'scheduled') 
        list = list.filter(m => 
    ['not_started','postponed','cancelled','start_delayed']
    .includes(m.sport_event_status?.match_status));
            
    if(list.length === 0){
        body.innerHTML = emptyHTML('🔍','Sin partidos para este filtro');
        return;
    }

    const groups = new Map();
    for(const m of list){
        const cid = m.sport_event?.sport_event_context?.competition?.id ?? 'other';
        const name = m.sport_event?.sport_event_context?.competition?.name ?? 'Otras ligas';
        if(!groups.has(cid)) groups.set(cid,{name, matches: []});
        groups.get(cid).matches.push(m);
    }

    const featuredIds = FEATURED_LEAGUES.map( l => l.id);
    const orderedKeys = [
        ...featuredIds.filter(id => groups.has(id)),
        ...[...groups.keys()].filter(id => !featuredIds.includes(id)),
    ];

    body.innerHTML = orderedKeys.map(cid => {
        const group = groups.get(cid);
        const league = FEATURED_LEAGUES.find(l => l.id === cid);
        const flag = league?.flag ?? '⚽';
        const lname = league?.name ?? group.name;
        const liveCount = group.matches.filter(m =>
            LIVE_S.includes(m.sport_event_status?.match_status)).length;
        
        return leagueGroupHTML(cid,flag,lname,liveCount,group.matches);
    }).join('');
}

function leagueGroupHTML(cid,flag,name,liveCount,matches){
    const liveBadge = liveCount > 0
    ? `<span class = "live-count-bage"> <span class = "pulse"></span>${liveCount} en vivo </span>`
    : '';
    
    const rows = matches
    .sort((a,b) =>{
        const order = m => LIVE_S.includes(m.sport_event_status?.match_status) ? 0  
            : ENDED_S.includes(m.sport_event_status?.match_status) ? 2 : 1;
        return order(a) - order(b);
    })
    .map(m => matchRowHTML(m))
    .join('');

    return `
    <div class="league-group" id="lg-${cid.replace(/:/g,'-')}">
      <div class="league-header" onclick="toggleLeague('lg-${cid.replace(/:/g,'-')}')">
        <span class="league-flag">${flag}</span>
        <span class="league-name">${name}</span>
        ${liveBadge}
        <span class="league-chevron">▼</span>
      </div>
      <div class="league-body">
        ${rows}
      </div>
    </div>`;
}

function matchRowHTML(m) {
    const ev   = m.sport_event;
    const st   = m.sport_event_status;
    const home = ev.competitors?.find(c => c.qualifier === 'home') ?? {};
    const away = ev.competitors?.find(c => c.qualifier === 'away') ?? {};
    const hs   = st?.home_score ?? null;
    const as_  = st?.away_score ?? null;
    const ms   = st?.match_status ?? 'not_started';

    const isLive = LIVE_S.includes(ms);
    const isEnded = ENDED_S.includes(ms);
    const homeWin = isEnded && Number(hs) > Number(as_);
    const awayWin = isEnded && Number(as_) > Number(hs);

    const lbl = STATUS_LABEL[ms] ?? ms;

    const statusCol = isLive
        ? `<div class="mr-status live"><span class="pulse"></span>${lbl}</div>`
        : isEnded
        ? `<div class="mr-status ended">${lbl}</div>`
        : `<div class="mr-status scheduled">${formatTime(ev.start_time)}</div>`;

    const scoreCol = (isLive || isEnded) && hs !== null
        ? `<div class="mr-score">
            <span class="${homeWin ? 'score-win' : ''}">${hs}</span>
            <span class="score-sep">-</span>
            <span class="${awayWin ? 'score-win' : ''}">${as_}</span>
        </div>`
        : `<div class="mr-score score-vs">vs</div>`;
    
    const min = st?.clock?.played;
    const minCol = isLive && min
        ? `<div class="mr-min">${min}'</div>`
        : isEnded
        ? `<div class="mr-min muted">FT</div>`
        : `<div class="mr-min"></div>`;
    
    return `
        <div class="match-row-v2">
        ${statusCol}
        <div class="mr-teams">
            <div class="mr-team ${homeWin ? 'winner' : isEnded && !homeWin ? 'loser' : ''}">${home.name ?? '—'}</div>
            <div class="mr-team ${awayWin ? 'winner' : isEnded && !awayWin ? 'loser' : ''}">${away.name ?? '—'}</div>
        </div>
        ${scoreCol}
        ${minCol}
        </div>`;
}

function formatTime(isoString){
    if(!isoString) return '—' ;
    return new Date(isoString).toLocaleString('es-PE', {hour: '2-digit' , minute: '2-digit' });
}