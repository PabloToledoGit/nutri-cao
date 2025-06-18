import { MercadoPagoConfig, Payment } from 'mercadopago';

// Inicializa o MercadoPago SDK (v2)
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 5000 }
});
const payment = new Payment(client);

// Função para criar pagamento MercadoPago
export async function criarPagamento({ email, nome, petNome, formData, valor }) {
  if (!email || !nome || !petNome || !formData || !valor) {
    throw new Error('Dados insuficientes');
  }

  const body = {
    transaction_amount: Number(valor),
    payment_method_id: 'pix',
    description: `Nutrição para ${petNome}`,
    payer: { email, first_name: nome },
    metadata: { petNome, formData }
  };

  try {
    const response = await payment.create({ body });

    if (!response || !response.body || !response.body.point_of_interaction) {
      console.error('Resposta inválida da API do MercadoPago:', response);
      throw new Error('Falha ao criar pagamento no Mercado Pago');
    }

    const { id, point_of_interaction } = response.body;

    return {
      paymentId: id,
      qrCode: point_of_interaction.transaction_data.qr_code,
      qrCodeBase64: point_of_interaction.transaction_data.qr_code_base64
    };

  } catch (error) {
    console.error('Erro ao criar pagamento no Mercado Pago:', error);
    throw new Error(error.message || 'Erro ao criar pagamento');
  }
}


// Função para buscar dados do pagamento
export async function buscarPagamento(paymentId) {
  try {
    const response = await payment.get({ id: paymentId });
    return response.body;
  } catch (error) {
    console.error('Erro ao buscar pagamento:', error);
    throw new Error('Falha ao buscar dados do pagamento');
  }
}

