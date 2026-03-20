import { state } from "../state.js"; 
import { colorFor } from "./render.js";
import { fetchSeasons } from './fetch.js';
import {  loadDetailMatches ,renderDetailMatches} from './seasons.js';

export function openCompetition(comp) {
    state.currentCompetition = comp;
    state.currentDetailTab = 'live';
    state.currentSeasonId = null;
    state.allDetailMatches = [];
    
    //cambiar la vista de detalles
    document.getElementById('comp-list-view').style.display = 'none';
    document.getElementById('comp-detail-view').style.display = 'block';
    
    const col    = colorFor(comp.category?.name ?? '');
    const ini    = comp.name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() ?? '?';
    const iconEl = document.getElementById('detail-icon');
    iconEl.textContent   = ini;
    iconEl.style.cssText =
        `background:${col}18;border-color:${col}40;color:${col};` +
        `width:52px;height:52px;border-radius:12px;display:flex;` +
        `align-items:center;justify-content:center;font-size:18px;font-weight:700;` +
        `flex-shrink:0;border:1px solid;`;
    
    document.getElementById('detail-title').textContent = comp.name;
    document.getElementById('detail-sub').textContent   =
    (comp.category?.name ?? '') +
    (comp.category?.country_code ? ' · ' + comp.category.country_code : '') +
    (comp.gender ? ' · ' + comp.gender : '');
    
    // Reset tabs
    document.querySelectorAll('.detail-tab').forEach((t,i) => t.classList.toggle('active', i===0));
    
    // carga de temp
    fetchSeasons(comp.id);
}

export function onSeasonChange() {
  state.currentSeasonId = document.getElementById('season-select').value;
  state.allDetailMatches = [];
  loadDetailMatches();
}

export function setDetailTab(tab, btn) {
    state.currentDetailTab = tab;
    state.allDetailMatches= [];
    document.querySelectorAll('.detail-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadDetailMatches();
}


export function backToCompetitions() {
  document.getElementById('comp-detail-view').style.display = 'none';
  document.getElementById('comp-list-view').style.display = 'block';
  state.currentCompetition = null;
  state.currentSeasonId = null;
  state.allDetailMatches = [];
}