import { state } from "../state.js";
import { renderMatches } from "./render.js";
import { fetchMatches } from "./fetch.js";

export function setFilter(f, btn) {
    state.currentFilter = f;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderMatches();
}

export function toggleLive() {
    state.isLive = !state.isLive;
    const btn = document.querySelector('.btn-outline'); 

    if (state.isLive) {
        fetchMatches();
        state.liveInterval = setInterval(fetchMatches, 30000);
        btn.textContent = '⏹ Detener';
        btn.style.color = 'var(--accent)';
    } else {
        clearInterval(state.liveInterval);
        state.liveInterval = null;
        btn.textContent = '⟳ Auto';
        btn.style.color = '';
    }
}