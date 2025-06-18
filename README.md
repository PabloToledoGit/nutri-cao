# Nutrify Backend - Refatorado

Backend refatorado para o sistema de nutrição personalizada para pets, organizado em módulos separados para melhor manutenibilidade e deploy na Vercel.

## 🏗️ Estrutura do Projeto

```
nutrify-backend/
├── api/
│   └── index.js              # Arquivo principal da API (serverless function)
├── services/
│   ├── mercadoPagoService.js # Serviços do MercadoPago
│   ├── aiService.js          # Serviços de IA (OpenAI)
│   ├── emailService.js       # Serviços de e-mail
│   └── webhookService.js     # Processamento de webhooks
├── utils/
│   └── cors.js               # Utilitários CORS
├── config/
├── package.json              # Dependências e scripts
├── vercel.json               # Configuração da Vercel
├── .env.example              # Exemplo de variáveis de ambiente
└── README.md                 # Esta documentação
```

## 🔄 Fluxo Implementado

1. **Criar Pagamento** (`POST /criar-pagamento`)
   - Recebe dados do pet e cliente
   - Cria pagamento PIX no MercadoPago
   - Retorna QR Code para pagamento

2. **Webhook de Confirmação** (`POST /webhook`)
   - Recebe notificação do MercadoPago
   - Quando pagamento é aprovado, inicia o processo automático:
     - Gera receita personalizada com OpenAI
     - Cria PDF profissional
     - Envia por e-mail para o cliente

## ⚙️ Configuração

1. **Variáveis de Ambiente**
   ```bash
   cp .env.example .env
   ```
   
2. **Configure as variáveis no arquivo `.env`:**
   - `MP_ACCESS_TOKEN`: Token do MercadoPago
   - `OPENAI_API_KEY`: Chave da API OpenAI
   - `EMAIL_USER`: E-mail para envio
   - `EMAIL_PASS`: Senha do e-mail

3. **Para deploy na Vercel:**
   - Configure as mesmas variáveis no painel da Vercel
   - O projeto já está configurado para serverless functions

## 📦 Dependências

- `express`: Framework web
- `serverless-http`: Adaptador para serverless functions
- `mercadopago`: SDK do MercadoPago
- `openai`: SDK da OpenAI
- `nodemailer`: Envio de e-mail
- `pdfkit`: Geração de PDF

## 🚀 Deploy na Vercel

1. **Conecte o repositório à Vercel**
2. **Configure as variáveis de ambiente no painel da Vercel**
3. **Deploy automático será feito**
4. **Configure o webhook URL no MercadoPago apontando para sua URL da Vercel**

## 📡 Endpoints

- `POST /criar-pagamento`: Cria novo pagamento
- `POST /webhook`: Recebe confirmações do MercadoPago

## 🔧 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

## 📝 Exemplo de Uso

```javascript
// Criar pagamento
const response = await fetch('/api/criar-pagamento', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'cliente@email.com',
    nome: 'João',
    petNome: 'Rex',
    formData: JSON.stringify({
      raca: 'Golden Retriever',
      idade: '3',
      peso: '25',
      altura: '60',
      porte: 'Grande',
      atividade: 'Moderada',
      objetivo: 'Manutenção',
      calorias: '1200',
      restricoes: 'Nenhuma',
      genero: 'Macho',
      planoNome: 'Plano Premium'
    }),
    valor: 29.90
  })
});
```

## 🔒 Segurança

- CORS configurado para permitir requisições do frontend
- Validação de dados de entrada
- Tratamento de erros adequado
- Logs detalhados para debugging

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação dos serviços utilizados:
- [MercadoPago Developers](https://www.mercadopago.com.br/developers)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

