// Middleware CORS robusto para Vercel
export const setCors = (req, res) => {
  // Permitir credenciais
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Permitir qualquer origem (em produção, especifique o domínio do frontend)
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  // Métodos permitidos
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  
  // Headers permitidos
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Forwarded-For, User-Agent'
  );

  // Tempo de cache para preflight requests
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 horas

  // Tratar requisições OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  
  return false;
};

