import { MercadoPagoConfig, Payment, MerchantOrder } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 5000 }
});

const payment = new Payment(client);
const merchantOrder = new MerchantOrder(client);

// 🔥 Função para criar pagamento PIX
export async function criarPagamento({ email, nome, petNome, formData, valor }) {
  if (!email || !nome || !petNome || !formData || !valor) {
    throw new Error('Dados insuficientes para criar pagamento');
  }

  const metadata = {
    petNome,
    formData: Buffer.from(JSON.stringify(formData)).toString('base64'),
    email, // ✅ Adicionado aqui para o webhook poder usar
    valor
  };

  const body = {
    transaction_amount: Number(valor),
    payment_method_id: 'pix',
    description: `Nutrição para ${petNome}`,
    payer: {
      email,
      first_name: nome // 👈 permanece o nome completo no first_name
    },
    metadata
  };

  try {
    const response = await payment.create({ body });

    const { id, point_of_interaction } = response;

    if (
      !point_of_interaction?.transaction_data?.qr_code ||
      !point_of_interaction?.transaction_data?.qr_code_base64
    ) {
      console.error('[Pagamento] Dados de QR Code ausentes na resposta:', response);
      throw new Error('Falha ao obter QR Code do pagamento');
    }

    return {
      paymentId: id,
      qrCode: point_of_interaction.transaction_data.qr_code,
      qrCodeBase64: point_of_interaction.transaction_data.qr_code_base64,
      ticketUrl: point_of_interaction.transaction_data.ticket_url
    };
  } catch (error) {
    console.error('[Pagamento] Erro ao criar pagamento no Mercado Pago:', error);
    throw new Error(error.message || 'Erro ao criar pagamento no Mercado Pago');
  }
}


// 🔍 Buscar pagamento pelo Payment ID
export async function buscarPagamento(paymentId) {
  try {
    const response = await payment.get({ id: paymentId });
    return response;
  } catch (error) {
    console.error('[Pagamento] Erro ao buscar pagamento:', error);
    throw new Error('Falha ao buscar dados do pagamento');
  }
}

// 🛑 Buscar pagamento via Merchant Order (fallback)
export async function buscarViaMerchantOrder(paymentId) {
  try {
    console.log(`[MerchantOrder] Buscando Merchant Order para Payment ID: ${paymentId}`);
    const { results } = await merchantOrder.search({
      qs: { 'payments.id': paymentId },
    });

    if (!results || results.length === 0) {
      console.warn(`[MerchantOrder] Nenhuma Merchant Order encontrada para Payment ID: ${paymentId}`);
      return null;
    }

    const order = results[0];

    const pagamentoEncontrado = order.payments.find(
      (p) => String(p.id) === String(paymentId)
    );

    if (!pagamentoEncontrado) {
      console.warn(`[MerchantOrder] Pagamento ID ${paymentId} não encontrado dentro da Merchant Order.`);
      return null;
    }

    return pagamentoEncontrado;
  } catch (error) {
    console.error('[MerchantOrder] Erro ao buscar via Merchant Order:', error);
    return null;
  }
}
