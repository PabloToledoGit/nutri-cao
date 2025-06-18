import { gerarTextoReceita } from '../services/aiService.js';
import { enviarEmailComPDF } from '../services/emailService.js';
import { buscarPagamento } from '../services/mercadoPagoService.js';

// Função para processar webhook de pagamento confirmado
export async function processarWebhookPagamento(paymentData) {
  try {
    const { id, status, metadata } = paymentData;

    if (status === 'approved') {
      console.log(`Pagamento ${id} aprovado. Iniciando geração de receita...`);

      // Extrair dados do pet dos metadados
      const { petNome, formData } = metadata;
      const dadosPet = JSON.parse(formData);

      // Gerar receita com OpenAI
      const receita = await gerarTextoReceita(dadosPet);

      // Simular geração de PDF (aqui você implementaria a geração real)
      const pdfBuffer = Buffer.from(receita, 'utf8'); // Placeholder

      // Enviar por e-mail
      await enviarEmailComPDF(dadosPet.email, petNome, pdfBuffer);

      console.log(`Processo completo para pagamento ${id}`);
    }
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    throw error;
  }
}

