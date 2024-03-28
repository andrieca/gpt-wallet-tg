
const OpenAI = require('openai')
const openai = new OpenAI ({ apiKey: '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' });
const config = require('../config/default.json')

require('dotenv').config();
const { bot, manifestUrl} = require('./bot');
const {getWallets} = require('./ton-connect/wallets');
const {TonConnect} = require('@tonconnect/sdk');
const {TonConnectStorage} = require('./ton-connect/storage');
const QRCode = require('qrcode');
const { getConnector } = require('./ton-connect/connector');
require('./connect-wallet-menu');
const {TelegramBot} = require('node-telegram-bot-api')
const { handleConnectCommand, handleSendTXCommand, handleDisconnectCommand, handleShowMyWalletCommand } = require('./commands-handlers');
const { walletMenuCallbacks } = require('./connect-wallet-menu');

const callbacks = {
    ...walletMenuCallbacks
};

bot.on('callback_query', query => {
    if (!query.data) {
        return;
    }

    let request;

    try {
        request = JSON.parse(query.data);
    } catch {
        return;
    }

    if (!callbacks[request.method]) {
        return;
    }

    callbacks[request.method](query, request.data);
});


bot.onText(/\/start/, (msg) => {
    bot.sendMessage(
        msg.chat.id,
        `        
Commands list: 
/connect - Connect to a wallet
/my_wallet - Show connected wallet
/send_tx - Send transaction
/disconnect - Disconnect from the wallet

`);
});

bot.onText(/\/connect/, handleConnectCommand); 
bot.onText(/\/send_tx/, handleSendTXCommand);
bot.onText(/\/disconnect/, handleDisconnectCommand);
bot.onText(/\/my_wallet/, handleShowMyWalletCommand);

// async function generateResponse(inputText) {
//   try {
//     const response = await openai.chat.completions.create({
//       model: 'gpt-3.5-turbo',
//       messages: [{ role: 'system', content: inputText }],
//       max_tokens: 100,
//       temperature: 0.7,
//     });
//     console.log("response.choices[0]", response.choices[0])
//     return response.choices[0].message.content.trim();
//   } catch (error) {
//     console.error('Помилка під час генерації відповіді:', error);
//     return 'Виникла помилка під час генерації відповіді.';
//   }
// }

// bot.on('message', async (msg) => {
//   const chatId = msg.chat.id;
//   const userMessage = msg.text;

//   const botResponse = await generateResponse(userMessage);

//   bot.sendMessage(chatId, botResponse);
// });

console.log('Telegram bot has been started...');


