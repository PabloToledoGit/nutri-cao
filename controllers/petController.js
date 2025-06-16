const { gerarTextoReceita } = require('../services/aiService');
const { gerarPDF } = require('../services/gerarPDF'); // Importa o novo serviço de PDF

const gerarReceitaPet = async (req, res) => {
  try {
    const {
      raca,
      peso,
      altura,
      idade,
      porte,
      atividade,
      objetivo,
      calorias,
      restricoes,
      genero,
      planoNome,
    } = req.body;

    console.log('req.body recebido:', req.body);

    if (
      !raca || !peso || !altura || !idade || !porte ||
      !atividade || !objetivo || !calorias || !genero || !planoNome ||
      (restricoes && restricoes.trim() === '')
    ) {
      return res.status(400).json({ erro: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    const petData = {
      raca,
      peso: Number(peso),
      altura: Number(altura),
      idade: Number(idade),
      porte,
      atividade,
      objetivo,
      calorias: Number(calorias),
      restricoes: restricoes || 'Nenhuma',
      genero,
    };

    // Gera o texto/HTML da receita
    const texto = await gerarTextoReceita(petData);
    if (!texto) {
      return res.status(500).json({ erro: 'Erro ao gerar texto da receita.' });
    }

    const titulo = `Guia Nutricional - ${raca}`;

    // Aqui você já tem o texto HTML gerado. Use ele para gerar o PDF
    const pdfURL = await gerarPDF(titulo, texto);

    // Retorna o link do PDF
    return res.status(200).json({ sucesso: true, textoReceita: texto, pdfURL, dados: petData });
  } catch (err) {
    console.error('Erro ao gerar receita do pet:', err);
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
};

module.exports = { gerarReceitaPet };
