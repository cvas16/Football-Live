/** Spinner + message while data loads */
export function loadingHTML(msg = 'Cargando...') {
  return `<div class="loading-state"><div class="spinner"></div>${msg}</div>`;
}
 
/** Empty state with icon and message */
export function emptyHTML(icon, msg) {
  return `<div class="empty-state"><div class="empty-icon">${icon}</div>${msg}</div>`;
}
 
/** Error state */
export function errorHTML(msg) {
  return `<div class="empty-state error-state"><div class="empty-icon">⚠️</div>${msg}</div>`;
}
 