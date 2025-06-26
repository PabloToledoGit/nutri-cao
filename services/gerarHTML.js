export const gerarHTMLReceita = (nomePet, textoReceita) => {
  const dataAtual = new Date().toLocaleDateString("pt-BR");

  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <title>Receita Nutricional - ${nomePet}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: 'Inter', sans-serif;
        color: #2D3748;
        background: #f7fafc;
        padding: 30px;
      }

      .container {
        max-width: 800px;
        margin: auto;
        background: #fff;
        border-radius: 16px;
        padding: 40px;
        box-shadow: 0 0 20px rgba(0,0,0,0.05);
        border-top: 6px solid #FF7D33;
      }

      header {
        text-align: center;
        margin-bottom: 30px;
      }

      header h1 {
        color: #FF7D33;
        font-size: 2.2rem;
        font-weight: 700;
      }

      header .sub {
        font-size: 1rem;
        color: #718096;
        margin-top: 5px;
      }

      .info {
        display: flex;
        justify-content: space-between;
        margin: 20px 0 30px;
        border-bottom: 1px solid #E2E8F0;
        padding-bottom: 10px;
      }

      .info-item {
        font-size: 1rem;
      }

      .info-label {
        font-weight: 600;
        color: #FF7D33;
        text-transform: uppercase;
        font-size: 0.75rem;
        margin-bottom: 5px;
      }

      .info-value {
        color: #2D3748;
      }

      .receita {
        background: #fff;
        padding: 20px;
        border: 2px dashed #FFB84D;
        border-radius: 10px;
      }

      .receita h2 {
        color: #FF7D33;
        font-size: 1.3rem;
        margin: 20px 0 10px;
        border-bottom: 2px solid #FFB84D;
        padding-bottom: 5px;
      }

      .receita h3 {
        color: #FF9F66;
        font-size: 1.1rem;
        margin: 15px 0 5px;
      }

      .receita p,
      .receita li {
        font-size: 1rem;
        color: #4A5568;
        line-height: 1.6;
      }

      .receita ul,
      .receita ol {
        margin: 10px 0 20px 20px;
      }

      .footer {
        text-align: center;
        font-size: 0.8rem;
        color: #A0AEC0;
        margin-top: 40px;
        border-top: 1px solid #EDF2F7;
        padding-top: 15px;
      }

      .footer strong {
        color: #FF7D33;
      }

      @media print {
        body {
          background: white;
          padding: 0;
        }

        .container {
          box-shadow: none;
          border-radius: 0;
          border: none;
        }

        .info, .footer {
          page-break-inside: avoid;
        }

        .receita {
          page-break-inside: avoid;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <header>
        <h1>🐶 NutriCão</h1>
        <div class="sub">Nutrição Inteligente para Pets</div>
      </header>

      <div class="info">
        <div class="info-item">
          <div class="info-label">Nome do Pet</div>
          <div class="info-value">${nomePet}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Data</div>
          <div class="info-value">${dataAtual}</div>
        </div>
      </div>

      <div class="receita">
        ${textoReceita.replace(/\n/g, "<br>")}
      </div>

      <div class="footer">
        Este documento foi gerado automaticamente por <strong>NutriCão</strong><br>
        Para mais informações, consulte um médico veterinário de confiança.
      </div>
    </div>
  </body>
  </html>
  `;
};
