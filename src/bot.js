const TelegramBot = require('node-telegram-bot-api');
const config = require('../config/default.json');

const token = config.TELEGRAM_TOKEN;
const manifestUrl = config.MANIFEST_URL;
const cacheTTL = config.WALLETS_LIST_CAHCE_TTL_MS;

const bot = new TelegramBot(token, { polling: true });

module.exports = { bot, manifestUrl };
