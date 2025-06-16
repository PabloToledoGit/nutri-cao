const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const gerarTextoReceita = async (userData) => {
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
Você é um especialista em nutrição veterinária.

Com base nas informações abaixo, **gere um documento COMPLETO no formato HTML, com estilos inline, pronto para exportação em PDF via Puppeteer.**

❌ NÃO envie explicações, comentários ou qualquer texto fora da tag <html>.  
❌ NÃO envie texto puro, JSON ou Markdown.  
✅ Envie apenas HTML válido e funcional, seguindo essa estrutura:
🚫 Nunca use crases, markdown ou blocos de código. 
✅ Apenas envie o conteúdo HTML puro, renderizável diretamente no navegador.


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

---

📑 O conteúdo deve conter as seguintes seções, sempre organizadas por:

1. <h1> Título Principal </h1>
2. <h2> Perfil do Pet e Avaliação Física </h2>
3. <h2> Rotina de Alimentação Personalizada </h2>
4. <h2> Receitas Personalizadas (até 2 por refeição) </h2>
5. <h2> Lista de Compras </h2>
6. <h2> Vitaminas e Suplementação </h2>
7. <h2> Alimentos Proibidos </h2>
8. <h2> Plano de Atividades Físicas </h2>
9. <h2> Cuidados, Dicas e Bem-Estar </h2>

---

🎨 Formatação obrigatória (somente inline):

- <h1>: color:#1a237e; font-family:serif; font-size:28px; margin-bottom:20px;
- <h2>: color:#1a237e; font-family:serif; font-size:22px; margin-top:30px; margin-bottom:15px;
- <p>: color:#64b5f6; font-family:serif; font-size:18px; line-height:1.6; margin-bottom:15px;
- <ul> <li>: color:#64b5f6; font-family:serif; font-size:18px; margin-bottom:10px;

---

**INFORMAÇÕES DO PET:**  

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

🚨 GERE TODO O CONTEÚDO COMPLETO, SEM OMITIR NADA.  
🚫 NUNCA ENVIE APENAS O TEXTO, ENVIE O DOCUMENTO HTML INTEIRO.

---  

💡 Envie agora SOMENTE o HTML, começando com <!DOCTYPE html>.
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

module.exports = { gerarTextoReceita };
