import express from 'express';
import serverless from 'serverless-http';
import { criarPagamento, buscarPagamento } from '../services/mercadoPagoService.js';
import { processarWebhookPagamento } from '../services/webhookService.js';
import { setCors } from '../utils/cors.js';

const app = express();
app.use(express.json());

// Aplicar CORS middleware
app.use((req, res, next) => {
  if (setCors(req, res)) return;
  next();
});

// Rota POST /api/criar-pagamento
app.post('/criar-pagamento', async (req, res) => {
  try {
    const result = await criarPagamento(req.body);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Erro no criarPagamento:', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
});

// Rota POST /api/webhook
app.post('/webhook', async (req, res) => {
  try {
    console.log('Webhook recebido:', req.body);

    const { type, data } = req.body;

    if (type === 'payment') {
      // Buscar dados completos do pagamento
      const paymentData = await buscarPagamento(data.id);
      await processarWebhookPagamento(paymentData);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro webhook:', error);
    res.status(500).json({ error: 'Erro no webhook' });
  }
});

export default serverless(app);

