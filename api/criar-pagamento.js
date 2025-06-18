import { criarPagamento } from '../services/mercadoPagoService';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 🚩 Responde a requisição OPTIONS aqui
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const result = await criarPagamento(req.body);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Erro no criarPagamento:', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
}
