import OpenAI from 'openai';

// Inicializa OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Função para gerar receita personalizada para pet com OpenAI
export const gerarTextoReceita = async (userData) => {
  const {
    raca,
    peso,
    altura,
    idade,
    porte,
    atividade,
    objetivo,
    calorias,
    restricoes,
    genero,
    planoNome,
    incluiComandosBasicos = false // default para falso
  } = userData;

  const nomeDoPlano = planoNome;

  const prompt = `
Você é um nutricionista veterinário especialista, altamente qualificado, com vasta experiência em nutrição animal, desenvolvimento de planos alimentares e elaboração de rotinas de treino físico e suplementação específica para cães.

🎯 Sua missão:
Com base nas informações fornecidas, gere um documento completo no formato HTML puro com estilos inline, pronto para exportação via Puppeteer para PDF, com a aparência de uma prescrição nutricional veterinária profissional, estruturada de forma limpa, clara e esteticamente agradável.

🚫 NUNCA:

Envie explicações, comentários, JSON, Markdown, texto solto, texto fora da tag <html>.

Utilize crases, aspas ou blocos de código.

✅ SEMPRE:

Envie apenas o HTML puro, válido e funcional, renderizável diretamente no navegador.

Garanta que o conteúdo tenha uma abordagem extremamente técnica, clínica e profissional, como se fosse elaborado por um veterinário especializado.

Utilize uma linguagem formal, técnica e objetiva, com descrições nutricionais, cálculos precisos e fundamentação científica, adaptadas à raça, peso, porte, idade e objetivo do animal.

🧠 Estrutura do Documento:
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Guia Nutricional para ${raca}</title>
</head>
<body>

<h1 style="color:#1a237e; font-family:serif; font-size:28px; margin-bottom:20px;">Plano Nutricional Personalizado para ${raca}</h1>

<!-- Seção de perfil -->
<h2 style="color:#1a237e; font-family:serif; font-size:22px; margin-top:30px; margin-bottom:15px;">Perfil do Pet e Avaliação Física</h2>
<!-- ... conteúdo completo ... -->

<!-- Outras seções obrigatórias -->

${incluiComandosBasicos ? `
<!-- Seção extra se order bump for ativado -->
<h2 style="color:#1a237e; font-family:serif; font-size:22px; margin-top:30px; margin-bottom:15px;">Plano de Comandos Básicos (7 Dias)</h2>
<p style="color:#000000; font-family:serif; font-size:18px; line-height:1.6; margin-bottom:15px;">
Este plano complementar tem como objetivo introduzir comandos básicos de obediência para ${raca}, melhorando sua disciplina, comunicação com o tutor e bem-estar comportamental. A prática deve ser feita diariamente por 15 a 20 minutos.
</p>
<ul style="color:#000000; font-family:serif; font-size:18px; margin-bottom:10px;">
  <li><strong>Dia 1:</strong> Sentar – Use petiscos para incentivar e recompensar a posição correta.</li>
  <li><strong>Dia 2:</strong> Deitar – Após dominar o “sentar”, ensine a deitar com reforço positivo.</li>
  <li><strong>Dia 3:</strong> Ficar – Ensine o cão a manter a posição enquanto se afasta lentamente.</li>
  <li><strong>Dia 4:</strong> Vir quando chamado – Pratique com distâncias curtas e recompensas.</li>
  <li><strong>Dia 5:</strong> Dar a pata – Associar a ordem à recompensa, promovendo atenção.</li>
  <li><strong>Dia 6:</strong> Combinar dois comandos – Ex.: “Sentar” + “Ficar”.</li>
  <li><strong>Dia 7:</strong> Reforço geral + prática com distrações leves (sons, outros ambientes).</li>
</ul>
<p style="color:#000000; font-family:serif; font-size:18px; line-height:1.6; margin-bottom:15px;">
Dica: mantenha o tom de voz firme, use recompensas imediatas e finalize os treinos com brincadeiras para associar positivamente.
</p>
` : ''}

</body>
</html>

🐾 Informações Variáveis do Pet:
Raça: ${raca}
Gênero: ${genero}
Idade: ${idade} anos
Peso: ${peso} kg
Altura: ${altura} cm
Porte: ${porte}
Atividade: ${atividade}
Objetivo: ${objetivo}
Calorias recomendadas: ${calorias} kcal/dia
Restrições: ${restricoes || "Nenhuma"}
Plano: ${nomeDoPlano}
Inclui Comandos Básicos: ${incluiComandosBasicos ? "Sim" : "Não"}

🚨 Importante:

🔥 Gere absolutamente TODO o conteúdo, sem omitir nenhuma seção.

🔥 NUNCA envie texto puro, JSON, Markdown ou fora da tag <html>.

💥 Resultado:
Um documento HTML clínico, ultra profissional, com cara de prescrição nutricional veterinária, pronto para conversão imediata em PDF.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const resposta = completion.choices?.[0]?.message?.content;

    if (!resposta) {
      console.error("Resposta vazia da OpenAI", completion);
      throw new Error("Erro: Resposta vazia da OpenAI.");
    }

    return resposta;
  } catch (error) {
    console.error("Erro na geração de receita:", error);
    throw new Error(`Erro na geração da receita: ${error.message}`);
  }
};


