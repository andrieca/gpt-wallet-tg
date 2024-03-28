
const { TonConnect } = require('@tonconnect/sdk');
const { TonConnectStorage } = require('./storage');
const config = require('config');
const fs = require('fs');

const path = require('path');

const connectors = new Map();

const configFilePath = path.join(__dirname, '../../config/', 'default.json');

const configData = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
const MANIFEST_URL = configData.MANIFEST_URL;
const CONNECTOR_TTL_MS = configData.CONNECTOR_TTL_MS;

function getConnector(
    chatId,
    onConnectorExpired
) {
    let storedItem;
    if (connectors.has(chatId)) {
        storedItem = connectors.get(chatId);
        clearTimeout(storedItem.timeout);
    } else {
        storedItem = {
            connector: new TonConnect({
                manifestUrl: MANIFEST_URL,
                storage: new TonConnectStorage(chatId)
            }),
            onConnectorExpired: []
        };
    }

    if (onConnectorExpired) {
        storedItem.onConnectorExpired.push(onConnectorExpired);
    }

    storedItem.timeout = setTimeout(() => {
        if (connectors.has(chatId)) {
            const storedItem = connectors.get(chatId);
            storedItem.connector.pauseConnection();
            storedItem.onConnectorExpired.forEach(callback => callback(storedItem.connector));
            connectors.delete(chatId);
        }
    }, Number(CONNECTOR_TTL_MS));

    connectors.set(chatId, storedItem);
    return storedItem.connector;
}

module.exports = { getConnector };