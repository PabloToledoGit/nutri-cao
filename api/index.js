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

// Rota de teste para verificar se a API está funcionando
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Nutrify Backend API está funcionando!',
    timestamp: new Date().toISOString(),
    routes: [
      'GET / - Esta rota de teste',
      'POST /api/criar-pagamento - Criar pagamento MercadoPago',
      'POST /api/webhook - Webhook MercadoPago'
    ]
  });
});

// Rota de teste específica para /api
app.get('/api', (req, res) => {
  res.status(200).json({ 
    message: 'Nutrify Backend API está funcionando!',
    endpoint: '/api',
    timestamp: new Date().toISOString()
  });
});

// Rota POST /api/criar-pagamento
app.post('/api/criar-pagamento', async (req, res) => {
  try {
    console.log('Dados recebidos para criar pagamento:', req.body);
    const result = await criarPagamento(req.body);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Erro no criarPagamento:', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
});

// Rota POST /criar-pagamento (sem prefixo /api para compatibilidade)
app.post('/criar-pagamento', async (req, res) => {
  try {
    console.log('Dados recebidos para criar pagamento:', req.body);
    const result = await criarPagamento(req.body);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Erro no criarPagamento:', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
});

// Rota POST /api/webhook
app.post('/api/webhook', async (req, res) => {
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

// Rota POST /webhook (sem prefixo /api para compatibilidade)
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

// Middleware para capturar rotas não encontradas
app.use('*', (req, res) => {
  console.log(`Rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Rota não encontrada',
    method: req.method,
    path: req.originalUrl,
    availableRoutes: [
      'GET / - Rota de teste',
      'GET /api - Rota de teste da API',
      'POST /api/criar-pagamento - Criar pagamento',
      'POST /criar-pagamento - Criar pagamento (compatibilidade)',
      'POST /api/webhook - Webhook',
      'POST /webhook - Webhook (compatibilidade)'
    ]
  });
});

export default serverless(app);

