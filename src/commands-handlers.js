const { getWallets } = require('./ton-connect/wallets');
const { bot } = require('./bot');
const { getConnector } = require('./ton-connect/connector');
const { getWalletInfo, toUserFriendlyAddress } = require('./ton-connect/wallets')
const QRCode = require('qrcode');
const TelegramBot = require('node-telegram-bot-api');
const { pTimeout, pTimeoutException } = require('./utils');
const CHAIN = require('@tonconnect/sdk')



async function handleConnectCommand(msg) {
    const chatId = msg.chat.id;
    const wallets = await getWallets();

    const connector = getConnector(chatId);

    connector.onStatusChange(wallet => {
        if (wallet) {
            bot.sendMessage(chatId, `${wallet.device.appName} wallet connected!`);
        }
    });

    const link = connector.connect(wallets);
    const image = await QRCode.toBuffer(link);

    await bot.sendPhoto(chatId, image, {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Choose a Wallet',
                        callback_data: JSON.stringify({ method: 'chose_wallet' })
                    },
                    {
                        text: 'Open Link',
                        url: `https://ton-connect.github.io/open-tc?connect=${encodeURIComponent(
                            link
                        )}`
                    }
                ]
            ]
        }
    });
}


async function handleSendTXCommand(msg) {
    const chatId = msg.chat.id;

    const connector = getConnector(chatId);

    await connector.restoreConnection();
    if (!connector.connected) {
        await bot.sendMessage(chatId, 'Connect wallet to send transaction');
        return;
    }

    pTimeout(
        connector.sendTransaction({
            validUntil: Math.round(
                (Date.now() + Number(process.env.DELETE_SEND_TX_MESSAGE_TIMEOUT_MS)) / 1000
            ),
            messages: [
                {
                    amount: '1000000',
                    address: '0:0000000000000000000000000000000000000000000000000000000000000000'
                }
            ]
        }),
        Number(process.env.DELETE_SEND_TX_MESSAGE_TIMEOUT_MS)
    )
        .then(() => {
            bot.sendMessage(chatId, `Transaction sent successfully`);
        })
        .catch(e => {
            if (e === pTimeoutException) {
                bot.sendMessage(chatId, `Transaction was not confirmed`);
                return;
            }

            if (e instanceof UserRejectsError) {
                bot.sendMessage(chatId, `You rejected the transaction`);
                return;
            }

            bot.sendMessage(chatId, `Unknown error happened`);
        })
        .finally(() => connector.pauseConnection());



    let deeplink = '';
    const walletInfo = await getWalletInfo(connector.wallet.device.appName);
    if (walletInfo) {
        deeplink = walletInfo.universalLink;
    }

    await bot.sendMessage(
        chatId,
        `Open ${walletInfo?.name || connector.wallet.device.appName} and confirm transaction`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Open Wallet',
                            url: deeplink
                        }
                    ]
                ]
            }
        }
    );
}

async function handleDisconnectCommand(msg) {
    const chatId = msg.chat.id;

    const connector = getConnector(chatId);

    await connector.restoreConnection();
    if (!connector.connected) {
        await bot.sendMessage(chatId, "Sie haben keine Brieftasche verbunden");
        return;
    }

    await connector.disconnect();

    await bot.sendMessage(chatId, 'Brieftasche wurde getrennt');
}

async function handleShowMyWalletCommand(msg) {
    const chatId = msg.chat.id;

    const connector = getConnector(chatId);

    await connector.restoreConnection();
    if (!connector.connected) {
        await bot.sendMessage(chatId, "Sie haben keine Brieftasche verbunden");
        return;
    }

    const walletName =
        (await getWalletInfo(connector.wallet.device.appName))?.name ||
        connector.wallet.device.appName;


    await bot.sendMessage(
        chatId,
        `Verbundene Brieftasche: ${walletName}\nIhre Adresse: ${toUserFriendlyAddress(
            connector.wallet.account.address,
            connector.wallet.account.chain === CHAIN.TESTNET
        )}`
    );
}

module.exports = { handleSendTXCommand, handleConnectCommand, handleDisconnectCommand, handleShowMyWalletCommand };

