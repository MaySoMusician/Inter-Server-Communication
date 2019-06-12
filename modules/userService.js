const fsp = require('fs').promises;

module.exports = class UserService {
  #client;
  #isReady = false;
  #usersIndefinitelyBanned = []; // IDs of users indefinitely-banned
  #usersTemporarilyBanned = []; // IDs of users temporarily-banned
  constructor(client) {
    this.#client = client;
  }

  get usersIndefinitelyBanned() {
    if (!this.#isReady) throw new Error('UserService not ready.');
    return this.#usersIndefinitelyBanned;
  }

  get usersTemporarilyBanned() {
    if (!this.#isReady) throw new Error('UserService not ready.');
    return this.#usersTemporarilyBanned;
  }

  async init() {
    const loaded = await this._load();
    this.#usersIndefinitelyBanned = loaded.indefinite;
    this.#usersTemporarilyBanned = loaded.temporary;
    this.#isReady = true;
  }

  async destroy() {
    await this._save();
    this.#isReady = false;
  }

  _save() {
    const data = {
      indefinitely: this.usersIndefinitelyBanned,
      temporarily: this.usersTemporarilyBanned,
    };
    return fsp.writeFile('../data/usersBanned.json', JSON.stringify(data));
  }

  _load() {
    return fsp.readFile('../data/usersBanned.json', 'utf8')
      .then(data => JSON.parse(data))
      .catch(e => {
        this.#client.logger.error(`Failed to load data/usersBanned.json: ${e}`);
        return {indefinitely: [], temporarily: []};
      });
  }

  banIndefinitely(userId) {
    if (!this.#isReady) throw new Error('UserService not ready.');
    if (this.usersIndefinitelyBanned.includes(userId)) {
      this.#client.logger.error(`User ${userId} is already indefinitely-banned.`);
      return false;
    }

    this.usersIndefinitelyBanned.push(userId);
    this.#client.logger.log(`User ${userId} has been successfully indefinitely-banned.`);
    return true;
  }

  unbanIndefinitely(userId) {
    if (!this.#isReady) throw new Error('UserService not ready.');
    if (!this.usersIndefinitelyBanned.includes(userId)) {
      this.#client.logger.error(`User ${userId} is not indefinitely-banned.`);
      return false;
    }

    this.usersIndefinitelyBanned.remove(userId);
    this.#client.logger.log(`User ${userId} has been successfully unbanned (indefinitely).`);
    return true;
  }

  async banTemporarily(userId, seconds, funcSendBanReason) {
    if (!this.#isReady) throw new Error('UserService not ready.');
    if (this.usersIndefinitelyBanned.includes(userId)) throw new Error(`Can't temporarily-ban user ${userId}, they're already indefinitely-banned.`);

    this.usersTemporarilyBanned.push(userId);
    this.#client.logger.log(`User ${userId} has been temporarily-banned. Will be unbanned ${seconds} later.`);
    process.nextTick(funcSendBanReason);

    await this.#client.wait(seconds * 1000);
    this.usersTemporarilyBanned.remove(userId);
    this.#client.logger.log(`User ${userId} has been successfully unbanned (temporarily). Completed their sentence.`);
  }

  checkUserBanned(userId) {
    if (!this.#isReady) throw new Error('UserService not ready.');
    return this.usersIndefinitelyBanned.includes(userId) || this.usersTemporarilyBanned.includes(userId);
  }
};
