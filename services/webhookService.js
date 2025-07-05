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
    console.log(`[Webhook] Notificação recebida. Tipo: ${type}, ID: ${notificationId}`);

    if (type !== 'payment') {
      console.log(`[Webhook] Tipo não tratado: ${type}`);
      return;
    }

    const paymentId = data?.id;
    if (!paymentId) {
      console.error('[Webhook] ID do pagamento ausente.');
      return;
    }

    // Tentativas de busca
    let pagamento = null;
    const tentativas = 5;
    for (let i = 0; i < tentativas; i++) {
      try {
        pagamento = await buscarPagamento(paymentId);
        if (pagamento) break;
      } catch (error) {
        console.warn(`[Tentativa ${i + 1}] Erro ao buscar pagamento: ${error.message}`);
        await delay(2000 * (i + 1));
      }
    }

    if (!pagamento) {
      console.warn('[Webhook] Buscando via Merchant Order...');
      pagamento = await buscarViaMerchantOrder(paymentId);
    }

    if (!pagamento) {
      console.error(`[Webhook] Pagamento ${paymentId} não encontrado.`);
      return;
    }

    const { id, status, metadata = {}, transaction_amount, payer = {} } = pagamento;

    if ((status || '').toLowerCase() !== 'approved') {
      console.log(`[Webhook] Pagamento ${id} com status "${status}". Ignorado.`);
      return;
    }

    const tipoReceita = metadata.tipoReceita || metadata.tipo_receita;
    const incluiComandosBasicos = metadata.incluiComandosBasicos === true || metadata.incluiComandosBasicos === 'true';

    const valoresBase = {
      vitalidade: 18.9,
      controlePeso: 9.99,
      emagrecimento: 12.9,
    };

    const valorBase = valoresBase[tipoReceita];
    if (valorBase === undefined) {
      console.error(`[Webhook] Tipo de receita inválido ou ausente: ${tipoReceita}`);
      return;
    }

    const valorEsperado = arredondar(valorBase + (incluiComandosBasicos ? 7.9 : 0));
    const valorPago = arredondar(transaction_amount);

    if (valorPago !== valorEsperado) {
      console.error(`[Webhook] Valor pago (${valorPago}) difere do esperado (${valorEsperado}) para "${tipoReceita}"`);
      return;
    }

    console.log(`[Webhook] Pagamento validado. Valor: R$ ${valorPago} | Plano: ${tipoReceita} | Comandos básicos: ${incluiComandosBasicos}`);

    const petNome = metadata.petNome || metadata.pet_nome;
    const formDataEncoded = metadata.formData || metadata.form_data;
    const email = metadata.email || payer.email;

    const camposFaltando = [];
    if (!petNome) camposFaltando.push('petNome');
    if (!formDataEncoded) camposFaltando.push('formData');
    if (!email) camposFaltando.push('email');

    if (camposFaltando.length) {
      console.error(`[Webhook] Campos faltando: ${camposFaltando.join(', ')}`);
      return;
    }

    let dadosPet = {};
    try {
      dadosPet = JSON.parse(Buffer.from(formDataEncoded, 'base64').toString('utf8'));
    } catch (err) {
      console.error('[Webhook] Erro ao decodificar formData:', err);
      return;
    }

    // Adiciona info do bump ao input da IA
    dadosPet.incluiComandosBasicos = incluiComandosBasicos;

    // Geração da receita com IA
    const receita = await gerarTextoReceita(dadosPet);
    console.log('[Webhook] Receita gerada.');

    const html = gerarHTMLReceita(petNome, receita);
    const pdfBuffer = await gerarPDF(petNome, html);

    await enviarEmailComPDF(email, petNome, pdfBuffer);
    console.log(`[Webhook] E-mail com PDF enviado para ${email}`);

    console.log(`[Webhook] Processo finalizado com sucesso para pagamento ${id}`);
  } catch (err) {
    console.error('[Webhook] Erro fatal no processamento do webhook:', err);
    throw err;
  }
}
