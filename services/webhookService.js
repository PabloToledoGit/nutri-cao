import { gerarTextoReceita } from '../services/aiService.js';
import { enviarEmailComPDF } from '../services/emailService.js';
import { buscarPagamento, buscarViaMerchantOrder } from '../services/mercadoPagoService.js';
import { gerarPDF } from './geraPDF.js'; 
import { gerarHTMLReceita } from './gerarHTML.js'; 

const delay = (ms) => new Promise(res => setTimeout(res, ms));

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

    console.log(`[Webhook] Buscando dados do pagamento. ID do pagamento: ${paymentId}`);

    let pagamento = null;
    const tentativas = 5;

    for (let i = 0; i < tentativas; i++) {
      try {
        pagamento = await buscarPagamento(paymentId);
        if (pagamento) break;
      } catch (error) {
        console.warn(`[Webhook] Tentativa ${i + 1} falhou ao buscar pagamento. Erro: ${error.message}`);
        await delay(2000 * (i + 1));
      }
    }

    if (!pagamento) {
      console.warn(`[Webhook] Tentativas diretas falharam. Buscando via Merchant Order...`);
      pagamento = await buscarViaMerchantOrder(paymentId);
    }

    if (!pagamento) {
      console.error(`[Webhook] Pagamento com ID ${paymentId} não encontrado após todas as tentativas.`);
      return;
    }

    const { id, status, metadata } = pagamento;

    if (status === 'approved') {
      if (!metadata) {
        console.error(`[Webhook] Metadata ausente no pagamento ${id}.`);
        return;
      }

      const valoresEsperados = {
        vitalidade: 14.90,
        controlePeso: 9.99,
        emagrecimento: 12.90,
      };

      const tipoReceita = metadata.tipoReceita || metadata.tipo_receita;
      const valorEsperado = valoresEsperados[tipoReceita];

      if (!valorEsperado) {
        console.error(`[Webhook] Tipo de receita inválido ou não definido: ${tipoReceita}`);
        return;
      }

      const arredondar = (num) => Math.round(num * 100) / 100;
      const valorPago = Number(pagamento.transaction_amount);

      if (arredondar(valorPago) !== arredondar(valorEsperado)) {
        console.error(`[Webhook] Valor pago (${valorPago}) não corresponde ao valor esperado (${valorEsperado}) para a receita "${tipoReceita}".`);
        return;
      }

      console.log(`[Webhook] Valor validado com sucesso: R$ ${valorPago} corresponde ao tipo "${tipoReceita}"`);
      console.log(`[Webhook] Pagamento ${id} aprovado. Iniciando geração de receita...`);

      const petNome = metadata.petNome || metadata.pet_nome;
      const formData = metadata.formData || metadata.form_data;
      const rawEmailMeta = metadata.email;
      const rawEmailPayer = pagamento.payer?.email;
      const email = rawEmailMeta || rawEmailPayer;

      const camposFaltando = [];
      if (!petNome) camposFaltando.push('petNome');
      if (!formData) camposFaltando.push('formData');
      if (!email) camposFaltando.push('email');

      if (camposFaltando.length > 0) {
        console.error(`[Webhook] Metadata incompleta no pagamento ${id}. Campos ausentes: ${camposFaltando.join(', ')}`);
        return;
      }

      let dadosPet = {};
      try {
        dadosPet = JSON.parse(Buffer.from(formData, 'base64').toString('utf8'));
      } catch (error) {
        console.error('[Webhook] Erro ao parsear formData:', error);
        return;
      }

      console.log('[Webhook] Dados do Pet recebidos:', dadosPet);

      // 🔥 Gerar receita com IA
      console.log('[Webhook] Gerando receita...');
      const receita = await gerarTextoReceita(dadosPet);
      console.log('[Webhook] Receita gerada com sucesso.');

      // 🔥 Gerar HTML bonitão
      const htmlReceita = gerarHTMLReceita(petNome, receita);

      // 🔥 Gerar PDF real
      let pdfBuffer;
      try {
        console.log('[Webhook] Gerando PDF real...');
        pdfBuffer = await gerarPDF(petNome, htmlReceita);
        console.log('[Webhook] PDF gerado com sucesso.');
      } catch (pdfError) {
        console.error('[Webhook] Erro ao gerar PDF:', pdfError);
        return;
      }

      // 🔥 Enviar PDF por e-mail
      try {
        console.log('[Webhook] Enviando e-mail com PDF...');
        await enviarEmailComPDF(email, petNome, pdfBuffer);
        console.log(`[Webhook] E-mail enviado com sucesso para ${email}`);
      } catch (emailError) {
        console.error(`[Webhook] Erro ao enviar e-mail para ${email}:`, emailError);
        return;
      }

      console.log(`[Webhook] Processo concluído com sucesso para pagamento ${id}`);
    } else {
      console.log(`[Webhook] Pagamento ${id} com status ${status}. Ignorado.`);
    }

  } catch (error) {
    console.error('[Webhook] Erro fatal ao processar webhook:', error);
    throw error;
  }
}
