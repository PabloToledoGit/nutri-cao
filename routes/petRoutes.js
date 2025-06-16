const express = require('express');
const router = express.Router();

const { gerarReceitaPet } = require('../controllers/petController');

// POST /api/pets/gerar-receita
router.post('/gerar-receita', gerarReceitaPet);

module.exports = router;

