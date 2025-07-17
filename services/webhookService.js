import { gerarTextoReceita } from '../services/aiService.js';
import { enviarEmailComPDF } from '../services/emailService.js';
import { buscarPagamento, buscarViaMerchantOrder } from '../services/mercadoPagoService.js';
import { gerarPDF } from './geraPDF.js';
import { gerarHTMLReceita } from './gerarHTML.js';
import crypto from 'crypto';
import fetch from 'node-fetch';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const arredondar = (num) => Math.round(Number(num) * 100) / 100;

function hashEmail(email) {
  return crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
}

async function enviarEventoConversaoMeta(email, valor) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_PIXEL_TOKEN;

  if (!pixelId || !accessToken) {
    console.error('[Meta Pixel] Pixel ID ou Token ausente.');
    return;
  }

  const url = `https://graph.facebook.com/v19.0/${pixelId}/events`;

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        user_data: {
          em: [hashEmail(email)]
        },
        custom_data: {
          currency: "BRL",
          value: valor
        },
        action_source: "website"
      }
    ]
  };

  try {
    const res = await fetch(`${url}?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.error) {
      console.error('[Meta Pixel] Erro ao enviar evento:', data.error);
    } else {
      console.log('[Meta Pixel] Evento de conversão enviado com sucesso.');
    }
  } catch (err) {
    console.error('[Meta Pixel] Erro de rede:', err);
  }
}

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

    const { id, status, metadata = {}, transaction_amount, payer = {}, additional_info = {} } = pagamento;

    if ((status || '').toLowerCase() !== 'approved') {
      console.log(`[Webhook] Pagamento ${id} com status "${status}". Ignorado.`);
      return;
    }

    const tipoReceita = metadata.tipoReceita || metadata.tipo_receita;
    const incluiComandosBasicos = metadata.incluiComandosBasicos === true || metadata.incluiComandosBasicos === 'true';

    const itens = additional_info?.items || [];
    const valorPago = arredondar(transaction_amount);
    const somaDosItens = arredondar(itens.reduce((acc, item) => acc + Number(item.unit_price || 0), 0));

    if (valorPago !== somaDosItens) {
      console.error(`[Webhook] Valor pago (${valorPago}) difere da soma dos itens (${somaDosItens})`);
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

    dadosPet.incluiComandosBasicos = incluiComandosBasicos;

    const receita = await gerarTextoReceita(dadosPet);
    console.log('[Webhook] Receita gerada.');

    const html = gerarHTMLReceita(petNome, receita);
    const pdfBuffer = await gerarPDF(petNome, html);

    await enviarEmailComPDF(email, petNome, pdfBuffer);
    console.log(`[Webhook] E-mail com PDF enviado para ${email}`);

    // 🎯 Envio do evento de conversão para o Meta Pixel
    await enviarEventoConversaoMeta(email, valorPago);

    console.log(`[Webhook] Processo finalizado com sucesso para pagamento ${id}`);
  } catch (err) {
    console.error('[Webhook] Erro fatal no processamento do webhook:', err);
    throw err;
  }
}
