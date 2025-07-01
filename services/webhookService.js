import { gerarTextoReceita } from '../services/aiService.js';
import { enviarEmailComPDF } from '../services/emailService.js';
import { buscarPagamento, buscarViaMerchantOrder } from '../services/mercadoPagoService.js';
import { gerarPDF } from './geraPDF.js';
import { gerarHTMLReceita } from './gerarHTML.js';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const arredondar = (num) => Math.round(Number(num) * 100) / 100;

export async function processarWebhookPagamento(paymentData) {
  try {
    const { id: notificationId, type, data } = paymentData;

    console.log(`[Webhook] Notificação recebida. Tipo: ${type}, ID da notificação: ${notificationId}`);

    if (type !== 'payment') {
      console.log(`[Webhook] Tipo de evento não tratado: ${type}`);
      return;
    }

    const paymentId = data?.id;
    if (!paymentId) {
      console.error('[Webhook] ID do pagamento ausente na notificação.');
      return;
    }

    let pagamento = null;
    const tentativas = 5;

    for (let i = 0; i < tentativas; i++) {
      try {
        pagamento = await buscarPagamento(paymentId);
        if (pagamento) break;
      } catch (error) {
        console.warn(`[Webhook] Tentativa ${i + 1} falhou ao buscar pagamento: ${error.message}`);
        await delay(2000 * (i + 1));
      }
    }

    if (!pagamento) {
      console.warn('[Webhook] Tentativas diretas falharam. Buscando via Merchant Order...');
      pagamento = await buscarViaMerchantOrder(paymentId);
    }

    if (!pagamento) {
      console.error(`[Webhook] Pagamento com ID ${paymentId} não encontrado após todas as tentativas.`);
      return;
    }

    const { id, status, metadata = {}, transaction_amount, payer = {} } = pagamento;

    if ((status || '').toLowerCase() !== 'approved') {
      console.log(`[Webhook] Pagamento ${id} com status "${status}". Ignorado.`);
      return;
    }

    const valoresEsperados = {
      vitalidade: 18.9,
      controlePeso: 9.99,
      emagrecimento: 14.9,
    };

    const tipoReceita = metadata.tipoReceita || metadata.tipo_receita;
    const valorEsperado = valoresEsperados[tipoReceita];

    if (!valorEsperado) {
      console.error(`[Webhook] Tipo de receita inválido ou ausente: ${tipoReceita}`);
      return;
    }

    const valorPago = arredondar(transaction_amount);
    if (valorPago !== arredondar(valorEsperado)) {
      console.error(`[Webhook] Valor pago (${valorPago}) difere do esperado (${valorEsperado}) para "${tipoReceita}"`);
      return;
    }

    console.log(`[Webhook] Valor validado com sucesso: R$ ${valorPago} (${tipoReceita})`);

    const petNome = metadata.petNome || metadata.pet_nome;
    const formDataEncoded = metadata.formData || metadata.form_data;
    const email = metadata.email || payer.email;

    const camposFaltando = [];
    if (!petNome) camposFaltando.push('petNome');
    if (!formDataEncoded) camposFaltando.push('formData');
    if (!email) camposFaltando.push('email');

    if (camposFaltando.length) {
      console.error(`[Webhook] Campos ausentes no metadata: ${camposFaltando.join(', ')}`);
      return;
    }

    let dadosPet = {};
    try {
      dadosPet = JSON.parse(Buffer.from(formDataEncoded, 'base64').toString('utf8'));
    } catch (err) {
      console.error('[Webhook] Erro ao decodificar formData:', err);
      return;
    }

    console.log('[Webhook] Dados do pet recebidos com sucesso:', dadosPet);

    // 🔥 Gerar receita com IA
    const receita = await gerarTextoReceita(dadosPet);
    console.log('[Webhook] Receita gerada com IA.');

    const html = gerarHTMLReceita(petNome, receita);

    let pdfBuffer;
    try {
      pdfBuffer = await gerarPDF(petNome, html);
      console.log('[Webhook] PDF gerado com sucesso.');
    } catch (err) {
      console.error('[Webhook] Erro ao gerar PDF:', err);
      return;
    }

    try {
      await enviarEmailComPDF(email, petNome, pdfBuffer);
      console.log(`[Webhook] E-mail enviado com sucesso para ${email}`);
    } catch (err) {
      console.error(`[Webhook] Falha ao enviar e-mail para ${email}:`, err);
    }

    console.log(`[Webhook] Processo finalizado com sucesso para pagamento ${id}`);
  } catch (err) {
    console.error('[Webhook] Erro fatal no processamento do webhook:', err);
    throw err;
  }
}
