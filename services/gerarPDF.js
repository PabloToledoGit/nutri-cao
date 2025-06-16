const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const gerarPDF = async (titulo, htmlContentCompleto) => {
  try {
    const fileName = `${titulo.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    const outputPath = path.join(__dirname, '..', 'pdfs', fileName);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setContent(htmlContentCompleto, { waitUntil: 'networkidle0' });

    // Sem fundo aqui!

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '25mm',
        right: '20mm',
        bottom: '25mm',
        left: '20mm'
      }
    });

    await browser.close();

    return `/pdfs/${fileName}`;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Erro na geração do PDF');
  }
};

module.exports = { gerarPDF };
