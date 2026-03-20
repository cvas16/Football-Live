import { LIVE_S, ENDED_S, STATUS_LABEL } from '../config.js';

/**
 * @param {object} m
 * @param {boolean} showComp
 */

export function matchRowHTML(m, showComp) {
  const ev = m.sport_event, st = m.sport_event_status;
  const home = ev.competitors?.find(c => c.qualifier === 'home') ?? {};
  const away = ev.competitors?.find(c => c.qualifier === 'away') ?? {};
  const hs = st?.home_score ?? '-';
  const as_ = st?.away_score ?? '-';
  const ms = st?.match_status ?? 'unknown';

  const isLive = LIVE_S.includes(ms);
  const isEnded = ENDED_S.includes(ms);
  const homeWin = isEnded && Number(hs) > Number(as_);
  const awayWin = isEnded && Number(as_) > Number(hs);

  const lbl = STATUS_LABEL[ms] ?? ms;
  const badge = isLive
    ? `<span class="status-badge status-live"><span class="pulse"></span> ${lbl}</span>`
    : isEnded ? `<span class="status-badge status-ended">${lbl}</span>`
      : `<span class="status-badge status-scheduled">${lbl}</span>`;

  const min = st?.clock?.played ?? null;
  const minDisplay = min ? `${min}'` : (isEnded ? 'FT' : '—');

  const extra = showComp
    ? (ev.sport_event_context?.competition?.name ?? '—')
    : new Date(ev.start_time).toLocaleDateString('es-PE', { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      });

  return `
  <div class="match-row">
    <div class="match-teams">
      <div class="team-row ${homeWin ? 'winner' : isEnded ? 'loser' : ''}">${home.name ?? '—'}</div>
      <div class="team-row ${awayWin ? 'winner' : isEnded ? 'loser' : ''}">${away.name ?? '—'}</div>
    </div>
    <div class="score-cell hide-mobile">
      <div class="score-display">
        <span class="score-num">${hs}</span>
        <span class="score-sep">—</span>
        <span class="score-num">${as_}</span>
      </div>
    </div>
    <div class="status-cell">${badge}</div>
    <div class="minute-cell hide-mobile">${minDisplay}</div>
    <div class="competition-cell hide-mobile" style="font-size:11px;color:var(--muted);">${extra}</div>
  </div>`;
}