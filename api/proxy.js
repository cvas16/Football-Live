//rate limiting
const rateLimitMap = new Map();

function rateLimit(ip, limit= 30 ,windowMs = 60_000){
  const now = Date.now();
  const data = rateLimitMap.get(ip) ?? {count : 0 , resetAt : now + windowMs};

  if(now > data.resetAt){
    data.count = 0;
    data.resetAt = now + windowMs;
  }

  data.count++;
  rateLimitMap.set(ip,data);

  return{
    allowed: data.count <= limit,
    remaining: Math.max(0, limit -data.count),
    resetAt: data.resetAt,
  };
}

//rutas permitidas
const ALLOWED_PATTERNS = [
  /^\/competitions$/,
  /^\/competitions\/sr:competition:[a-z0-9]+\/seasons$/,
  /^\/schedules\/live\/summaries$/,
  /^\/schedules\/\d{4}-\d{2}-\d{2}\/summaries$/,
  /^\/seasons\/sr:season:[a-z0-9]+\/schedules$/,
  /^\/seasons\/sr:season:[a-z0-9]+\/summaries$/,
];

function isAllowedEndpoint(endpoint){
  return ALLOWED_PATTERNS.some(pattern => pattern.test(endpoint));
}

function setSecurityHeaders(res){
  //clickjacking
  res.setHeader('X-Frame-Options' , 'DENY');
  //MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  //XXs proteccion
  res.setHeader('X-XSS-Protection', '1; mode=block');
  //referrer policy
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  //deshabilita features no usadas
  res.setHeader('Permissions-Policy', 'camera=() , microphone=() , geolocation=()');
  //content security policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src https://fonts.gstatic.com; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none';"
  );
  //Cors 
  const origin = process.env.ALLOWED_ORIGIN ?? '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}


export default async function handler(req,res) {
  setSecurityHeaders(res);

  //preflight CORS
  if(req.method === 'OPTIONS'){
    res.status(204).end();
    return;
  }

  //Solo get permitido
  if(req.method !== 'GET'){
    res.status(405).json({error: 'Method not allowed'});
    return;
  }

  //rate limiting mediante ip
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ?? 'unknown';
  const rl = rateLimit(ip,30,60_000);

  res.setHeader('X-RateLimit-Limit',     '30');
  res.setHeader('X-RateLimit-Remaining', String(rl.remaining));
  res.setHeader('X-RateLimit-Reset',     String(Math.ceil(rl.resetAt / 1000)));

  if(!rl.allowed){
    res.status(429).json({
      error: 'Too Many Request',
      message: 'Maximo 30 peticiones por minuto. Intenta de nuevo pronto',
      resetAt: new Date(rl.resetAt).toISOString(),
    });
    return;
  }

  //extraer el endpoint deesde query param /api/proxy?path=/competitions
  const endpoint= req.query.path;

  if(!endpoint || typeof endpoint !== 'string'){
    res.status(400).json({error: 'Missing path parameter'});
    return;
  }


  //sanitizar: solo letras, numeros,gruiones,dos puntos, barras .fechgas
  const sanitized = endpoint.replace(/[^a-zA-Z0-9\/\-:_.]/g, '');

  //validar contra whitelist
  if(!isAllowedEndpoint(endpoint)){
    console.warn(`[proxy] Endpoint bloqueado: ${sanitized} (IP : ${ip})`);
    res.status(403).json({error : 'Endpoint not allowed'});
    return;
  }

  //api key desde variable de entorno
  const API_KEY = process.env.SPORTRADAR_API_KEY;
  if(!API_KEY){
    res.status(500).json({error : 'API KEY not configured'});
    return;
  }


  const url = `https://api.sportradar.com/soccer/trial/v4/en${sanitized}.json`;
  console.log(`[proxy] ${ip} → GET ${sanitized}`);

  try {
    const upstream = await fetch(url, {
      headers: {
        'Accept':     'application/json',
        'x-api-key':  API_KEY,
        'User-Agent': 'FootballDashboard/1.0',
      },
      signal: AbortSignal.timeout(10_000), // timeout 10s
    });

    const text = await upstream.text();

    // Cache según el tipo de endpoint
    const cacheTime = sanitized.includes('/live/') ? 30
      : sanitized.includes('/schedules/') && sanitized.match(/\d{4}-\d{2}-\d{2}/) ? 60
      : 300; // competencias y temporadas: 5 min

    res.setHeader('Cache-Control', `public, s-maxage=${cacheTime}, stale-while-revalidate=10`);
    res.status(upstream.status);

    try {
      res.json(JSON.parse(text));
    } catch {
      res.send(text);
    }
  } catch (err) {
    if (err.name === 'TimeoutError') {
      res.status(504).json({ error: 'SportRadar API timeout' });
    } else {
      console.error(`[proxy] Error: ${err.message}`);
      res.status(502).json({ error: 'Upstream error', message: err.message });
    }
  }
}