const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const petRoutes = require('./routes/petRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Log básico
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/pets', petRoutes);
app.use('/ebooks', express.static(path.join(__dirname, 'ebooks')));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ erro: 'Endpoint não encontrado' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Erro global:', err);
  res.status(500).json({ erro: 'Erro interno no servidor' });
});

module.exports = app;
