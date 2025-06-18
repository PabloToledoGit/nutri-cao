import express from 'express';
import serverless from 'serverless-http';
import { criarPagamento } from '../services/mercadoPagoService.js';
import { processarWebhookPagamento } from '../services/webhookService.js';
import { setCors } from '../utils/cors.js';

const app = express();
app.use(express.json());

// Middleware CORS
app.use((req, res, next) => {
  if (setCors(req, res)) return;
  next();
});

app.post('/criar-pagamento', async (req, res) => {
  try {
    const result = await criarPagamento(req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/webhook', async (req, res) => {
  try {
    await processarWebhookPagamento(req.body);
    res.status(200).send('OK');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default serverless(app);
