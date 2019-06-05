const // Discord = require('discord.js'),
      sqlite3 = require('sqlite3'),
      zip = (array1, array2) => array1.map((_, i) => [array1[i], array2[i]]);

module.exports = class SQLManager {
  #db = 'chat_data.db'
  #client;
  constructor(client) {
    this.#client = client;
  }

  async _withDatabase(func, permWrite) {
    const flag = permWrite ? sqlite3.OPEN_READWRITE : sqlite3.OPEN_READONLY;
    let db;
    return new Promise((resolve, reject) => {
      db = new sqlite3.Database(this.#db, flag, err => {
        if (err) {
          // Log errors
          return reject(err);
        }
        func(resolve, reject, db);
      });
    }).catch(err => {
      // Catch errors
    }).finally(() => {
      try {
        if (db) db.close();
      } catch (ex) {
        // Log exception
      }
    });
  }

  async save(message, channelIdList, messageIdList, content) {
    let text = '';
    zip(channelIdList, messageIdList).forEach(([channelId, messageId]) => text += `${channelId}:${messageId},`);

    return await this._withDatabase(
      (resolve, reject, db) => {
        db.run(
          'INSERT INTO chat VALUES(?,?,?,?,?)',
          [message.author.id, message.channel.id, message.id, text, content],
          err => {
            if (err) {
              // Log error
              return reject(err);
            }
            // Log result
            return resolve(true);
          }
        );
      },
      /* permWrite= */ true
    );
  }

  async getAllMessages() {
    const list2 = [];

    await this._withDatabase(
      (resolve, reject, db) => {
        db.each(
          'SELECT * FROM chat',
          [],
          (err, row) => {
            if (err) {
              // Log error
              return reject(err);
            }
            // Log result

            for (const y of row['D'].split(',')) {
              if (!y) continue;
              list2.push({first: row, second: y.split(':')});
            }
          },
          (err, num) => {
            if (err) {
              // Log error
              return reject(err);
            }
            return resolve();
          }
        );
      },
      /* permWrite= */ false
    );

    return list2;
  }

  async getMessageIds(messageId) {
    const _list = await this.getAllMessages();
    let channelId = 0,
        resultMessageId = 0,
        resultChannelId = 0;

    for (const a of _list) {
      for (const b of a.second) {
        if (b === messageId) {
          channelId = b[0];
          resultChannelId = a.first['B'];
          resultMessageId = a.first['C'];
        }
      }
    }

    if (!channelId) return {first: false, second: false};
    return {first: resultChannelId, second: resultMessageId};
  }

  async getMessages(authorId) {
    const _list = await this.getAllMessages(),
          channelIdList = [],
          messageIdList = [],
          messages = [];

    for (const x of _list) {
      if (x.first['A'] !== authorId) continue;
      channelIdList.push(x.second[0]);
      messageIdList.push(x.second[1]);
    }

    zip(channelIdList, messageIdList).forEach(async ([channelId, messageId]) => {
      const channel = this.#client.channels.get(channelId);
      let m;
      try {
        m = await channel.fetchMessage(messageId);
      } catch (ex) {
        void 0;
      }
      if (!m) messages.push(m); // Truthy check inserted
    });

    return messages;
  }

  async getMessageFromId(_id) {
    let message = null,
        abortLoop = false; // For pseudo abortion of db.each()

    await this._withDatabase(
      (resolve, reject, db) => {
        db.each(
          'SELECT * FROM chat',
          [],
          async (err, row) => {
            if (err) {
              // Log error
              return reject(err);
            }
            // Log result

            if (abortLoop) return;

            for (const key of row['D'].split(',')) {
              if (!key) continue;
              const [/* channelId */, messageId] = key.split(':');
              if (messageId === _id) {
                try {
                  const channel = this.#client.channels.get(row['B']);
                  message = await channel.fetchMessage(row['C']);
                  break;
                } catch (ex) {
                  return reject(null);
                }
              }
            }
            // if (message) break <-- impossible
            if (message) {
              abortLoop = true;
              return resolve();
            }
          },
          (err, num) => {
            if (err) {
              // Log error
              return reject(err);
            }
            // return resolve();
          }
        );
      },
      /* permWrite= */ false
    );
    return message;
  }
};
