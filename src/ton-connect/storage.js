
const config = require('../../config/default.json');

const storage = new Map();

class TonConnectStorage {
  constructor(chatId) {
    this.chatId = chatId;
  }

  getKey(key) {
    return this.chatId.toString() + key;
  }

  async removeItem(key) {
    storage.delete(this.getKey(key));
  }

  async setItem(key, value) {
    storage.set(this.getKey(key), value);
  }

  async getItem(key) {
    return storage.get(this.getKey(key)) || null;
  }
}

module.exports = { TonConnectStorage };
