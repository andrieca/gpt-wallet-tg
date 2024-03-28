// src/ton-connect/wallets.js

const config = require('../../config/default.json');
const { isWalletInfoRemote, WalletsListManager } = require('@tonconnect/sdk');

const cacheTTLMs = Number(config.WALLETS_LIST_CAHCE_TTL_MS);

const walletsListManager = new WalletsListManager({
    cacheTTLMs: cacheTTLMs
});

async function getWallets() {
    const wallets = await walletsListManager.getWallets();
    return wallets.filter(isWalletInfoRemote);
}

async function getWalletInfo(walletAppName) {
    const wallets = await getWallets();
    return wallets.find(wallet => wallet.appName.toLowerCase() === walletAppName.toLowerCase());
}

module.exports = { getWallets, getWalletInfo };
