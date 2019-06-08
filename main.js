const Discord = require('discord.js'),
      CommandManager = require('./modules/commandManager.js'),
      SQLManager = require('./modules/sqlManager.js'),
      fs = require('fs'),
      sleep = require('util').promisify(setTimeout);

function saveBanMembers(_list) {
  fs.writeFileSync('ban.txt', _list.join(','));
}

function loadBanMembers() {
  try {
    return fs.readFileSync('ban.txt', 'utf8').split(',');
  } catch (ex) {
    // Log exception
    return [];
  }
}

function saveChannelWebhook(_dict) {
  fs.writeFileSync('channels.json', JSON.stringify(_dict));
}

function loadChannelWebhook() {
  try {
    return JSON.parse(fs.readFileSync('channels.json', 'utf8'));
  } catch (ex) {
    // Log exception
    return {'global-chat': {}, 'global-r18': {}};
  }
}

class MyClient extends Discord.Client {
  constructor(options) {
    super(options);
    this.webhooks = loadChannelWebhook();
    this.bans = loadBanMembers();
    this.sqlManager = new SQLManager(this);
    this.channelsConnected = {};
    this.connecting = 0;
    this.debug = [];
    this.checking = [];

    this.commandManager = new CommandManager(this);
    this.commandManager.init();

    for (const [key, value] of Object.entries(this.webhooks)) {
      const values = Object.keys(value);
      this.connecting += values.length;
      for (const k of values) {
        this.channels[k] = key;
      }
    }

    this.on('ready', this.onReady);
    this.on('message', this.onMessage);
  }

  async limitBan(message, times, reason) {
    this.bans.push(message.author.id);
    await message.channel.send(`<@${message.author.id}>, あなたは${reason}ため、制限時間付きbanを受けました。制限時間は${times}分です。`);
    const user = await this.fetchUser('212513828641046529');
    await user.send(`<@${message.author.id}>(${message.author.username},${message.author.id})は${reason}ため、制限時間付きbanを受けました。制限時間は${times}分です。`);
    await sleep(times * 60 * 1000);
    this.bans.pop(message.author.id);
  }

  async setPref() {
    await this.user.setPresence({game: {name: `>help | ${this.connecting} channels`}});
  }

  async onReady() {
    await this.setPref();
    await this.sendGlobalNotice({text: 'すみどらちゃんが起動しました。', title: '起動告知'});
  }

  end() {
    saveChannelWebhook(this.webhooks);
    saveBanMembers(this.bans);
  }

  async convertMessage(message, embed, content = '') {
    // returns: return {content: content, embed: embed, settings: settings};
    const settings = {};
    if (replyCompile.test(content)) {
      const _id = replyCompile.exec(content)[1],
            m = await this.sqlManager.getMessageFromId(_id);
      if (!m) return {content: content, embed: embed, settings: settings};

      if (!embed) embed = new Discord.RichEmbed();
      settings['reply'] = m;
      content = content.replace(`:>${_id}`, '`Reply`');
      embed.addField('reply from', m.content)
        .setAuthor(m.author.username, m.author.displayAvatarURL)
        .setTimestamp(m.createdAt);
    }
    if (quoteComplie.test(content)) {
      const _id = quoteComplie.exec(content)[1],
            m = await this.sqlManager.getMessageFromId(_id);
      if (!m) return {content: content, embed: embed, settings: settings};

      if (!embed) embed = new Discord.RichEmbed();
      content = content.replace(`::>${_id}`, '`Quote`');
      embed.addField('quote from', m.content)
        .setAuthor(m.author.username, m.author.displayAvatarURL)
        .setTimestamp(m.createdAt);
    }
    return {content: content, embed: embed, settings: settings};
  }

  async sendGlobalMessage(message, name) {
    const channel = message.channel,
          author = message.author,
          messageIdList = [message.id],
          channelIdList = [message.channel.id];
    let content = message.cleanContent,
        settings = {};

    if (inviteCompile.test(message.content)) {
      process.nextTick(this.limitBan.bind(this), message, 60, '招待を送信しようとした');
      return;
    }
    if (message.mentions.everyone) {
      process.nextTick(this.limitBan.bind(this), message, 60, 'everyoneメンションを送信しようとした');
      return;
    }
    if (message.content.length > 1000) {
      process.nextTick(this.limitBan.bind(this), message, 60, '1000文字以上の文字を送信しようとした');
      return;
    }

    let cat = '',
        embed;
    if (message.attachments && message.attachments.size > 0) {
      embed = new Discord.RichEmbed().setImage(message.attachments.first().url);
    } else {
      embed = null;
    }
    for (const [key_, value] of Object.entries(this.webhooks)) {
      for (const [k, v] of Object.entries(value)) {
        if (k == channel.id) {
          cat = key_;
          break;
        }
      }
    }

    // Extensions
    if (!content.startsWith('*')) {
      ({content, embed, settings} = await this.convertMessage(message, embed, content));
    } else {
      content = content.substring(1);
    }

    for (const [_key, value] of Object.entries(this.webhooks[cat])) {
      if (message.channel.id == _key) continue;

      const send = async (webhookUrl, _content, key) => {
        try {
          const webhook = await this._webhookFromUrl(webhookUrl);

          if ('reply' in settings) {
            if (key == settings['reply'].channel.id) {
              _content = `<@${settings['reply'].author.id}>\n` + _content;
            } else {
              _content = `@${settings['reply'].author.username}\n` + _content;
            }
          }

          const result = await webhook.send(
            _content,
            {
              username: author.username,
              avatarURL: author.displayAvatarURL,
              embeds: embed !== null ? [embed] : null,
            }
          );

          messageIdList.push(result.id);
          channelIdList.push(key);
        } catch (ex) {
          return;
        }
      };
      process.nextTick(send.bind(this), value, content, _key);
    }
    await sleep(2 * 1000);
    await this.sqlManager.save(message, channelIdList, messageIdList, content);

    if (this.checking.includes(message.guild.id)) {
      process.nextTick(this.sendingCheck.bind(this), message);
    }

    for (const [_key, value] of Object.entries(this.webhooks[cat])) {
      const ch = this.channels.get(_key);
      if (!ch) continue;

      if (this.debug.includes(ch.guild.id)) {
        const embed =
          new Discord.RichEmbed()
            .setTitle('DEBUG')
            .setDescription(content)
            .setTimestamp(message.createdAt)
            .setAuthor(message.author.username, message.author.displayAvatarURL)
            .setFooter(message.guild.name, message.guild.iconURL);
        await ch.send(embed);
      }
    }
  }

  async sendGlobalNotice(options) {
    const {name = 'global-chat', text = '```\n```', title = 'お知らせ', mode = 'normal'} = options;

    let embed;
    if (mode === 'normal') {
      embed =
        new Discord.RichEmbed()
          .setTitle(title)
          .setDescription(text)
          .setColor(0x00bfff);
    } else if (mode === 'error') {
      embed =
        new Discord.RichEmbed()
          .setTitle(title || 'エラー')
          .setDescription(text)
          .setColor(0xff0000);
    } else if (mode === 'update') {
      embed =
        new Discord.RichEmbed()
          .setTitle(title || 'アップデート')
          .setDescription(text)
          .setColor(0x00ff00);
      for (const value of options['_list']) {
        for (let x = 1; x < options['_list'].length; x++) {
          embed.addField(x, value);
        }
      }
    }

    for (const [channel, webhooks] of Object.entries(this.webhooks)) {
      if (channel !== name) continue;

      for (const [_id, webhook] of Object.entries(webhooks)) {
        const send = async webhookUrl => {
          try {
            const webhook = await this._webhookFromUrl(webhookUrl);

            await webhook.send(
              {
                username: this.user.username,
                avatarURL: this.user.displayAvatarURL,
                embeds: [embed],
              }
            );
          } catch (ex) {
            console.error(ex);
            return;
          }
        };
        process.nextTick(send.bind(this), webhook);
      }
    }
    return;
  }

  async sendingCheck(message) {
    await message.react(String.fromCodePoint(0x0001f44c))
      .then(async r => {
        await sleep(2 * 1000);
        r.remove();
      });
  }

  async addChannelGlobal(channel, guild, name = 'global-chat') {
    let webhook;
    try {
      const webhooks = await channel.fetchWebhooks();
      if (webhooks && webhooks.size > 0) webhook = webhooks.first();
      else webhook = await channel.createWebhook('global-chat');
    } catch (ex) {
      console.error(ex);
      try {
        await channel.send('webhookの権限がありません！');
      } catch (ex) {
        void 0;
      }
      return;
    }
    this.webhooks[name][channel.id] = `https://discordapp.com/api/webhooks/${webhook.id}/${webhook.token}`;
    this.channels[channel.id] = name;
    process.nextTick(this.sendGlobalNotice.bind(this), {name: name, text: `${guild.name}がコネクトしました`});
    this.connecting += 1;
    await this.setPref();
  }

  getMemberIdFromName(name) {
    return this.users.findKey('username', name);
  }

  async onMessage(message) {
    if (message.author.id === '212513828641046529') void 0;
    if (this.bans.includes(message.author.id)) return;
    if (message.author.bot) return;

    if (message.content.startsWith(this.config.prefix)) {
      // Here we separate a command name and arguments for the command.
      // e.g. if we have the message ">hoge you are an idiot", we'll get the following:
      // command = hoge
      // args = ['you', 'are', 'an', 'idiot]
      const args = message.content.slice(this.config.prefix.length).trim().split(/ +/g),
            command = args.shift().toLowerCase();

      // Check whether the command, or alias, exist in the collections defined.
      const cmd = this.commandManager.getCommand(command); // eslint-disable-line one-var
      if (!cmd) return; // Quit if the command not found.

      // Some commands may not be useable in PMs. This check prevents those commands from running and return a friendly error message.
      if (!message.guild && cmd.conf.guildOnly) {
        return message.channel.send('指定されたコマンドはDMでは使用できません。サーバー内でお試しください。');
      }

      if (!this.commandManager.checkPermission(cmd, message)) {
        return message.channel.send(`:no_entry_sign: このコマンドを実行するのに必要な権限がありません。`);
      }

      return this.commandManager.run(cmd, message, args);
    }

    if (message.channel.id in this.channels) {
      await this.sendGlobalMessage(message, this.channels[message.channel.id]);
    }
  }

  destroy() {
    saveChannelWebhook(this.webhooks);
    saveBanMembers(this.bans);
    return super.destroy();
  }

  _webhookFromUrl(url) {
    const idReExp = /discordapp.com\/api\/webhooks\/(\d+)/.exec(url);
    if (!idReExp || !idReExp[1]) return;
    return this.fetchWebhook(idReExp[1]);
  }
}

const client = new MyClient();
require('./modules/basic.js')(client);
client.logger = require('./modules/logger.js');
client.config = require('./config.js');

client.login(client.config.token);
