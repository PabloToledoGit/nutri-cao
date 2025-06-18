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
    planoNome
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
html
Copiar
Editar
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Guia Nutricional para ${raca}</title>
</head>
<body>
...CONTEÚDO COMPLETO COM ESTILOS INLINE...
</body>
</html>
🔖 Seções Obrigatórias no Documento:
<h1> Título Principal: "Plano Nutricional Personalizado para ${raca}" </h1>
<h2> Perfil do Pet e Avaliação Física </h2> - Informações completas do pet (peso, altura, idade, porte, raça, nível de atividade, objetivo e restrições). - Avaliação física incluindo cálculo de IMC canino, condição corporal (magro, ideal, sobrepeso ou obesidade) e recomendação calórica diária detalhada.
<h2> Rotina de Alimentação Personalizada </h2> - Divisão em refeições (café da manhã, almoço, jantar, snacks). - Quantidades específicas (em gramas) e horários sugeridos. - Cálculo de macros: proteínas, gorduras, carboidratos e fibras por refeição.
<h2> Receitas Personalizadas (até 2 por refeição) </h2> - Ingredientes balanceados, com quantidades exatas em gramas. - Descrição do modo de preparo. - Tabela nutricional por porção (calorias, proteínas, gorduras, carboidratos, fibras, cálcio, fósforo).
<h2> Lista de Compras </h2> - Lista completa de ingredientes necessários para 7 dias de plano, com quantidades totais.
<h2> Vitaminas e Suplementação </h2> - Indicação de suplementos vitamínicos, minerais, ômega 3, probióticos ou condroprotetores, se necessário. - Dosagens específicas baseadas no peso, porte e raça. - Nome do suplemento, quantidade diária (em mg ou ml) e motivo da recomendação (ex.: articulação, imunidade, pele, etc.).
<h2> Alimentos Proibidos </h2> - Lista clara e objetiva de alimentos tóxicos ou prejudiciais para cães, incluindo breve descrição dos riscos.
<h2> Plano de Atividades Físicas </h2> - Sugestão de rotina de exercícios físicos adaptada ao porte, idade e objetivo. - Inclua: caminhadas, circuitos, exercícios de enriquecimento ambiental, exercícios mentais e brincadeiras ativas. - Frequência semanal, tempo recomendado e nível de intensidade (leve, moderado ou intenso).
<h2> Cuidados, Dicas e Bem-Estar </h2> - Recomendações gerais de cuidados com o pet, bem-estar emocional, manejo alimentar, hidratação, higiene, descanso e saúde mental.
🎨 Estilo Inline Obrigatório:
<h1> →
color:#1a237e; font-family:serif; font-size:28px; margin-bottom:20px;
🔵 (Azul escuro — Título Principal)

<h2> →
color:#1a237e; font-family:serif; font-size:22px; margin-top:30px; margin-bottom:15px;
🔵 (Azul escuro — Subtítulos)

<p> →
color:#000000; font-family:serif; font-size:18px; line-height:1.6; margin-bottom:15px;
⚫ (Preto — Texto padrão)

<ul> <li> →
color:#000000; font-family:serif; font-size:18px; margin-bottom:10px;
⚫ (Preto — Listas e itens)

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

