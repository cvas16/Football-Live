export const BASE = 'http://localhost:3001/api';

export const LIVE_S = ['started','live','1st_half','2nd_half','halftime','overtime','1st_extra','2nd_extra','extra_time_halftime','awaiting_extra_time','awaiting_penalties','penalties','interrupted','suspended'];

export const ENDED_S = ['ended','closed','aet','ap','abandoned'];

export const STATUS_LABEL = {
  'started':'En vivo',
  'live':'En vivo',
  '1st_half':'1er Tiempo',
  '2nd_half':'2do Tiempo',
  'halftime':'Descanso',
  'extra_time_halftime':'Descanso ET',
  'overtime':'Prórroga',
  '1st_extra':'1ra Extra',
  '2nd_extra':'2da Extra',
  'awaiting_extra_time':'Esp. ET',
  'awaiting_penalties':'Esp. Pen',
  'penalties':'Penales',
  'interrupted':'Interrumpido',
  'suspended':'Suspendido',
  'ended':'Final',
  'closed':'Final',
  'aet':'Final ET',
  'ap':'Final Pen',
  'abandoned':'Abandonado',
  'not_started':'Programado',
  'postponed':'Aplazado',
  'start_delayed':'Retrasado',
  'cancelled':'Cancelado'
};

export const COLORS = ['#00e5a0','#378add','#ef9f27','#d4537e','#7f77dd','#5dcaa5','#e24b4a'];

export const FEATURED_LEAGUES = [
  { id: 'sr:competition:155',  name: 'Liga Profesional Argentina', flag: '🇦🇷', region: 'Sudamérica' },
  { id: 'sr:competition:325',   name: 'Brasileirao Serie A',        flag: '🇧🇷', region: 'Sudamérica' },
  { id: 'sr:competition:693',name: 'Liga Paraguaya',             flag: '🇵🇾', region: 'Sudamérica' },
  { id: 'sr:competition:406',  name: 'Liga 1 Perú',                flag: '🇵🇪', region: 'Sudamérica' },
  { id: 'sr:competition:244',  name: 'Liga Chilena',               flag: '🇨🇱', region: 'Sudamérica' },
  { id: 'sr:competition:27070',  name: 'Liga BetPlay Colombia',      flag: '🇨🇴', region: 'Sudamérica' },
  { id: 'sr:competition:278',  name: 'Liga Uruguaya',              flag: '🇺🇾', region: 'Sudamérica' },
  { id: 'sr:competition:240',  name: 'Liga Ecuador',               flag: '🇪🇨', region: 'Sudamérica' },
  { id: 'sr:competition:384',  name: 'Copa Libertadores',          flag: '🏆', region: 'Sudamérica' },
  { id: 'sr:competition:480',  name: 'Copa Sudamericana',          flag: '🥈', region: 'Sudamérica' },
  { id: 'sr:competition:295',  name: 'Eliminatorias Conmebol',     flag: '🌎', region: 'Sudamérica' },
  { id: 'sr:competition:955',  name: 'Saudi Pro League',     flag: '🇸🇦', region: 'Asia' },
  { id: 'sr:competition:7',    name: 'UEFA Champions League',      flag: '⭐', region: 'Europa' },
  { id: 'sr:competition:679',  name: 'UEFA Europa League',         flag: '🟠', region: 'Europa' },
  { id: 'sr:competition:17',   name: 'Premier League',             flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', region: 'Europa' },
  { id: 'sr:competition:35',   name: 'Bundesliga',                 flag: '🇩🇪', region: 'Europa' },
  { id: 'sr:competition:23',   name: 'Serie A',                    flag: '🇮🇹', region: 'Europa' },
  { id: 'sr:competition:34',   name: 'Ligue 1',                    flag: '🇫🇷', region: 'Europa' },
  { id: 'sr:competition:8',    name: 'LaLiga',                     flag: '🇪🇸', region: 'Europa' },
  { id: 'sr:competition:16',   name: 'Mundial FIFA',               flag: '🌍', region: 'Mundial' },
];