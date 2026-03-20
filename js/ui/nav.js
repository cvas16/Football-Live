import { state } from "../state.js";
import {fetchCompetitions} from "../competitions/fetch.js";

export function showPage(page,btn){
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  btn.classList.add('active');

  if (page === 'competitions' && state.allCompetitions.length === 0) {
    fetchCompetitions();
  }
}