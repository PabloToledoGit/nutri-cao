const { gerarReceita } = require('../services/gerarPDF');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const pdfBuffer = await gerarReceita(req.body);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=receita.pdf');
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Erro gerar receita:', error);
    res.status(500).json({ error: 'Erro ao gerar receita' });
  }
}