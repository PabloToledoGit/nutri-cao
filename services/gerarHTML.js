export const gerarHTMLReceita = (nomePet, textoReceita) => {
  const dataAtual = new Date().toLocaleDateString("pt-BR");

  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receita Nutricional - ${nomePet}</title>
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        line-height: 1.6;
        color: #2d3748;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        padding: 20px;
      }
      
      .container {
        max-width: 800px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 20px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        overflow: hidden;
        position: relative;
      }
      
      .container::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 6px;
        background: linear-gradient(90deg, #FF7D33, #FF9F66, #FFB84D);
      }
      
      header {
        background: linear-gradient(135deg, #FF7D33 0%, #FF9F66 100%);
        color: white;
        padding: 40px 30px;
        text-align: center;
        position: relative;
        overflow: hidden;
      }
      
      header::before {
        content: "";
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: url("data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><circle cx=\"50\" cy=\"50\" r=\"2\" fill=\"rgba(255,255,255,0.1)\"/></svg>") repeat;
        animation: float 20s infinite linear;
      }
      
      @keyframes float {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
      }
      
      .logo {
        position: relative;
        z-index: 2;
      }
      
      .logo h1 {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 8px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .logo .emoji {
        font-size: 3rem;
        display: inline-block;
        animation: bounce 2s infinite;
      }
      
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
      }
      
      .subtitulo {
        font-size: 1.1rem;
        font-weight: 300;
        opacity: 0.95;
        letter-spacing: 0.5px;
      }
      
      .content {
        padding: 40px 30px;
      }
      
      .info-section {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 40px;
      }
      
      .info-card {
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        padding: 25px;
        border-radius: 15px;
        border-left: 5px solid #FF7D33;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .info-card::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255, 125, 51, 0.05) 0%, rgba(255, 159, 102, 0.05) 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .info-card:hover::before {
        opacity: 1;
      }
      
      .info-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 30px rgba(255, 125, 51, 0.15);
      }
      
      .info-label {
        font-weight: 600;
        color: #FF7D33;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .info-value {
        font-size: 1.1rem;
        font-weight: 500;
        color: #2d3748;
      }
      
      .receita-container {
        background: #ffffff;
        border: 2px solid #e2e8f0;
        border-radius: 20px;
        padding: 35px;
        margin: 30px 0;
        position: relative;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
      }
      
      .receita-container::before {
        content: "";
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(45deg, #FF7D33, #FF9F66, #FFB84D, #FF7D33);
        border-radius: 20px;
        z-index: -1;
        background-size: 300% 300%;
        animation: gradientShift 3s ease infinite;
      }
      
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      .receita-header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px dashed #e2e8f0;
      }
      
      .receita-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #FF7D33;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }
      
      .receita-content {
        font-size: 1rem;
        line-height: 1.8;
        color: #4a5568;
        text-align: justify;
      }
      
      .receita-content h2,
      .receita-content h3 {
        color: #FF7D33;
        margin: 25px 0 15px 0;
        font-weight: 600;
      }
      
      .receita-content h2 {
        font-size: 1.3rem;
        border-bottom: 2px solid #FF7D33;
        padding-bottom: 8px;
      }
      
      .receita-content h3 {
        font-size: 1.1rem;
      }
      
      .receita-content ul,
      .receita-content ol {
        margin: 15px 0;
        padding-left: 25px;
      }
      
      .receita-content li {
        margin: 8px 0;
        position: relative;
      }
      
      .receita-content ul li::marker {
        color: #FF7D33;
      }
      
      .receita-content strong {
        color: #2d3748;
        font-weight: 600;
      }
      
      footer {
        background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
        color: white;
        padding: 30px;
        text-align: center;
        margin-top: 40px;
      }
      
      .footer-content {
        max-width: 600px;
        margin: 0 auto;
      }
      
      .footer-logo {
        font-size: 1.3rem;
        font-weight: 600;
        margin-bottom: 10px;
        color: #FF7D33;
      }
      
      .footer-text {
        font-size: 0.9rem;
        opacity: 0.8;
        line-height: 1.5;
      }
      
      .footer-date {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        font-size: 0.8rem;
        opacity: 0.7;
      }
      
      .icon {
        display: inline-block;
        width: 20px;
        height: 20px;
        background: #FF7D33;
        border-radius: 50%;
        position: relative;
      }
      
      .icon::before {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
      }
      
      @media (max-width: 768px) {
        body {
          padding: 10px;
        }
        
        .container {
          border-radius: 15px;
        }
        
        header {
          padding: 30px 20px;
        }
        
        .logo h1 {
          font-size: 2rem;
        }
        
        .content {
          padding: 30px 20px;
        }
        
        .info-section {
          grid-template-columns: 1fr;
          gap: 15px;
        }
        
        .receita-container {
          padding: 25px;
          margin: 20px 0;
        }
        
        footer {
          padding: 25px 20px;
        }
      }
      
      @media print {
        body {
          background: white;
          padding: 0;
        }
        
        .container {
          box-shadow: none;
          border-radius: 0;
        }
        
        header::before,
        .receita-container::before {
          display: none;
        }
        
        .info-card:hover {
          transform: none;
          box-shadow: none;
        }
        
        /* Adicionado para controle de quebra de página */
        .info-card,
        .receita-container,
        .receita-content h2,
        .receita-content h3 {
          page-break-inside: avoid;
        }
        
        .receita-content ul,
        .receita-content ol {
          page-break-inside: avoid;
        }
        
        footer {
          page-break-before: always;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <header>
        <div class="logo">
          <h1><span class="emoji">🐶</span> NutriCão</h1>
          <div class="subtitulo">Nutrição Veterinária Personalizada</div>
        </div>
      </header>

      <div class="content">
        <div class="info-section">
          <div class="info-card">
            <div class="info-label">
              <span class="icon"></span>
              Nome do Pet
            </div>
            <div class="info-value">${nomePet}</div>
          </div>
          
          <div class="info-card">
            <div class="info-label">
              <span class="icon"></span>
              Data de Geração
            </div>
            <div class="info-value">${dataAtual}</div>
          </div>
        </div>

        <div class="receita-container">
          <div class="receita-header">
            <div class="receita-title">
              🍽️ Receita Nutricional Personalizada
            </div>
          </div>
          
          <div class="receita-content">
            ${textoReceita.replace(/\n/g, "<br>")}
          </div>
        </div>
      </div>

      <footer>
        <div class="footer-content">
          <div class="footer-logo">🐶 NutriCão</div>
          <div class="footer-text">
            Nutrição Veterinária Personalizada<br>
            Desenvolvido com tecnologia de ponta para o bem-estar do seu pet
          </div>
          <div class="footer-date">
            Este documento foi gerado automaticamente em ${dataAtual}
          </div>
        </div>
      </footer>
    </div>
  </body>
  </html>
  `;
};

