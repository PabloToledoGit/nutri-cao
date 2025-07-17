import fetch from 'node-fetch';

export async function enviarEventoConversao(email, valor) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_PIXEL_TOKEN;

  const url = `https://graph.facebook.com/v19.0/${pixelId}/events`;

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        user_data: {
          em: [hashEmail(email)],
        },
        custom_data: {
          currency: "BRL",
          value: valor
        },
        action_source: "website"
      }
    ]
  };

  const params = new URLSearchParams({ access_token: accessToken });

  try {
    const res = await fetch(`${url}?${params}`, {
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
    console.error('[Meta Pixel] Erro de requisição:', err);
  }
}

// Função de hash SHA256 para e-mails
import crypto from 'crypto';
function hashEmail(email) {
  return crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
}
