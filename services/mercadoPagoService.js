import { MercadoPagoConfig, Payment, MerchantOrder } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 5000 }
});

const payment = new Payment(client);
const merchantOrder = new MerchantOrder(client);

// 👇 AGORA com tipoReceita incluído!
export async function criarPagamento({ email, nome, sobrenome = '', petNome, formData, valor, tipoReceita }) {
  if (!email || !nome || !petNome || !formData || !valor || !tipoReceita) {
    throw new Error('Dados insuficientes para criar pagamento');
  }

  const metadata = {
    petNome,
    formData: Buffer.from(JSON.stringify(formData)).toString('base64'),
    email,
    valor,
    tipoReceita
  };

  const body = {
    transaction_amount: Number(valor),
    payment_method_id: 'pix',
    description: `Nutrição personalizada para ${petNome}`,
    payer: {
      email,
      first_name: nome,
      last_name: sobrenome
    },
    metadata,
    additional_info: {
      items: [
        {
          id: 'nutricapet001',
          title: `Nutrição Inteligente - ${petNome}`,
          description: `Plano alimentar desenvolvido para ${petNome}`,
          category_id: 'services',
          quantity: 1,
          unit_price: Number(valor)
        }
      ],
      payer: {
        first_name: nome,
        last_name: sobrenome
      }
    }
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
