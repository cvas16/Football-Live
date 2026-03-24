import { COLORS } from "../config.js";
import { state } from "../state.js";
import { emptyHTML } from "../ui/helpers.js";

export function colorFor(name) {
  let h = 0; 
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}
 
export function filterCompetitions() {
  const q = document.getElementById('comp-search').value.toLowerCase();
  const filtered = state.allCompetitions.filter(c =>
    c.name?.toLowerCase().includes(q) ||
    c.category?.name?.toLowerCase().includes(q) ||  
    c.category?.country_code?.toLowerCase().includes(q)
  );
  renderCompetitions(filtered);
}

export function renderCompetitions(list) {
    document.getElementById('comp-count').innerHTML = 
    `Mostrando <span>${list.length}</span> de <span>${state.allCompetitions.length}</span> competencias`;

    if (list.length === 0) {
        document.getElementById('comp-grid').innerHTML = 
        `<div style="grid-column:1/-1">${emptyHTML('🔍','Sin resultados')}</div>`;
        return;
    }

    document.getElementById('comp-grid').innerHTML = list.map(c => {
        const cat    = c.category?.name ?? '—';
        const cc     = c.category?.country_code ?? '';
        const col    = colorFor(cat);
        const ini    = c.name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() ?? '?';
        const gender = { men: '👨', women: '👩', mixed: '👥' }[c.gender] ?? '⚽';
        const encoded = encodeURIComponent(JSON.stringify(c));

        return `
        <div class="comp-card" data-comp="${encoded}">
            <div class="comp-icon" style="background:${col}18;border-color:${col}40;color:${col};">${ini}</div>
                <div class="comp-info">
                    <div class="comp-name">${c.name ?? '—'} ${gender}</div>
                    <div class="comp-meta">${cat}${cc ? ' · ' + cc : ''}</div>
                    <div class="comp-id">${c.id}</div>
                </div>
        </div>`;
    }).join('');
}

