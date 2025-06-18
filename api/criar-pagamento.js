import { criarPagamento } from '../services/mercadoPagoService';
import { setCors } from '../utils/cors';

export default async function handler(req, res) {
  if (setCors(req, res)) return; // Tratamento CORS

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
