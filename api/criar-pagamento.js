import { criarPagamento } from '../services/mercadoPagoService.js';
import { setCors } from '../utils/cors.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const {
    email,
    nome,
    petNome,
    formData,
    valor,
    tipoReceita,
    incluiComandosBasicos = false // ← adicionando aqui com valor padrão
  } = req.body;

  console.log('[DEBUG] Dados recebidos na API:', {
    email,
    nome,
    petNome,
    formData,
    valor,
    tipoReceita,
    incluiComandosBasicos
  });

  if (!email || !nome || !petNome || !formData || !valor || !tipoReceita) {
    return res.status(400).json({ error: 'Dados insuficientes para criar pagamento' });
  }

  try {
    const result = await criarPagamento({
      email,
      nome,
      petNome,
      formData,
      valor,
      tipoReceita,
      incluiComandosBasicos // ← passa para o serviço
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('[API] Erro na criação de pagamento:', err);
    return res.status(500).json({ error: err.message });
  }
}
