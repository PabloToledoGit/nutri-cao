import { setCors } from '../utils/cors';

export default async function handler(req, res) {
  if (setCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    console.log('Webhook recebido:', req.body);
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro webhook:', error);
    res.status(500).json({ error: 'Erro no webhook' });
  }
}
