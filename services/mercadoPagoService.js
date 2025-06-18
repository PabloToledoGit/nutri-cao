import { MercadoPagoConfig, Payment } from 'mercadopago';

// Inicializa o client com token (SDK V2)
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 5000 }
});

const payment = new Payment(client);

export async function criarPagamento({ email, nome, petNome, formData, valor }) {
  if (!email || !nome || !petNome || !formData || !valor) {
    throw new Error('Dados insuficientes');
  }

  const body = {
    transaction_amount: Number(valor),
    payment_method_id: 'pix',
    description: `Nutrição para ${petNome}`,
    payer: { email, first_name: nome },
    metadata: { petNome, ...formData }
  };

  const response = await payment.create({ body });
  const { id, point_of_interaction } = response.body;

  return {
    paymentId: id,
    qrCode: point_of_interaction.transaction_data.qr_code,
    qrCodeBase64: point_of_interaction.transaction_data.qr_code_base64
  };
}
