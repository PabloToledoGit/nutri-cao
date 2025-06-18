// Arquivo: /api/services/gerarPDF.js
const puppeteer = require('puppeteer-core');
const nodemailer = require('nodemailer');

// Nota: Removemos o await import aqui e movemos para dentro da função gerarPDF
// pois top-level await não é suportado em CommonJS

const gerarPDF = async (titulo, htmlContentCompleto) => {
  let browser = null;
  console.log("Iniciando a geração do PDF...");

  try {
    // Importação do chromium movida para dentro da função
    const chromium = await import('@sparticuz/chromium');
    
    const executablePath = await chromium.default.executablePath();
    browser = await puppeteer.launch({
      args: chromium.default.args,
      defaultViewport: chromium.default.defaultViewport,
      executablePath: executablePath,
      headless: chromium.default.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContentCompleto, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '25mm', right: '20mm', bottom: '25mm', left: '20mm' }
    });

    console.log("Buffer do PDF gerado com sucesso.");
    return pdfBuffer;

  } catch (error) {
    console.error('Erro detalhado ao gerar PDF:', error);
    throw new Error(`Erro na geração do PDF: ${error.message}`);
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};

/**
 * Envia um e-mail com o PDF gerado como anexo.
 * @param {string} emailDestinatario - O e-mail do destinatário.
 * @param {string} tituloReceita - O título da receita para o assunto e nome do ficheiro.
 * @param {Buffer} pdfBuffer - O PDF em formato buffer.
 * @returns {Promise<boolean>} Verdadeiro se o e-mail foi enviado com sucesso.
 */
const enviarEmailComPDF = async (emailDestinatario, tituloReceita, pdfBuffer) => {
  if (!emailDestinatario || !pdfBuffer) {
    throw new Error("Email e buffer do PDF são obrigatórios.");
  }

  // Validação básica de e-mail
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailDestinatario)) {
    throw new Error("Endereço de e-mail do destinatário inválido.");
  }

  try {
    console.log('Configurando transporter SMTP...');
    console.log('Usuário do e-mail:', process.env.EMAIL_USER ? '***' : 'NÃO DEFINIDO');

    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false // Pode ajudar em ambientes de desenvolvimento
      },
      logger: true, // Habilita logging interno do nodemailer
      debug: true   // Habilita saída de debug
    });

    // Verifica a conexão SMTP antes de enviar
    try {
      await transporter.verify();
      console.log('Conexão SMTP verificada com sucesso');
    } catch (verifyError) {
      console.error('Erro ao verificar conexão SMTP:', verifyError);
      throw new Error(`Falha na conexão SMTP: ${verifyError.message}`);
    }

const mailOptions = {
  from: '"NutriCão - Nutrição Veterinária Personalizada" <nutrify@nutrifyservice.com>',
  to: emailDestinatario,
  subject: `🐶 NutriCão | Receita Nutricional de ${tituloReceita}`,
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #FF7D33; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
        <h1 style="color: white; margin: 0;">NutriCão</h1>
        <p style="color: white; margin: 5px 0 0; font-size: 18px;">Saúde canina através da nutrição</p>
      </div>
      
      <div style="padding: 20px; background-color: #f9f9f9; border-radius: 0 0 5px 5px;">
        <p>Olá, tutor(a) do ${tituloReceita.split(' - ')[0]}!</p>
        
        <p>Sua receita nutricional personalizada, elaborada por <strong>nossa tecnologia de ponta</strong>, está pronta e em anexo neste e-mail.</p>
        
        <p style="background-color: #FFF3E0; padding: 15px; border-left: 4px solid #FF7D33; font-size: 14px;">
          <strong>🐾 Dica NutriCão:</strong> Para melhores resultados, siga as porções recomendadas e observe atentamente a resposta do seu pet à nova dieta.
        </p>
        
        <p>Esta receita foi criada considerando:</p>
        <ul>
          <li>Idade, peso e condição corporal</li>
          <li>Necessidades nutricionais específicas</li>
          <li>Possíveis alergias ou restrições</li>
          <li>Objetivos de saúde estabelecidos</li>
        </ul>
        
        <p style="margin-top: 20px;">Atenciosamente,</p>
        <p style="font-weight: bold; color: #FF7D33;">Equipe NutriCão</p>
        <p style="font-size: 12px; color: #777;">Nutrição Veterinária de Precisão</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
          <p>Este é um e-mail automático. Em caso de dúvidas sobre a dieta, responda este e-mail ou entre em contato pelo (XX) XXXX-XXXX.</p>
          <p>© ${new Date().getFullYear()} NutriCão - Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  `,
  attachments: [
    {
      filename: `Receita_Nutricional_${tituloReceita.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    }
  ]
};

    console.log('Enviando e-mail...');
    const info = await transporter.sendMail(mailOptions);
    console.log(`E-mail enviado com sucesso para ${emailDestinatario}. ID: ${info.messageId}`);
    
    return true;

  } catch (error) {
    console.error(`Erro detalhado ao enviar e-mail para ${emailDestinatario}:`, error);
    
    // Mensagens de erro mais específicas
    let errorMessage = 'Erro ao enviar o e-mail da receita.';
    if (error.code === 'EAUTH') {
      errorMessage = 'Falha na autenticação do e-mail. Verifique as credenciais SMTP.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Não foi possível conectar ao servidor SMTP. Verifique sua conexão de internet.';
    }
    
    throw new Error(`${errorMessage} Detalhes: ${error.message}`);
  }
};

module.exports = { gerarPDF, enviarEmailComPDF };