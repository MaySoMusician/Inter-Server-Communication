const Discord = require('discord.js'),
      SQLManager = require('./modules/manager.js'),
      fs = require('fs'),
      sleep = require('util').promisify(setTimeout),
      v = '3.0.3',
      inviteCompile = /(?:https?:\/\/)?discord(?:app\.com\/invite|\.gg)\/?[a-zA-Z0-9]+\/?/,
      replyCompile = /^:>([0-9]{18}).+/,
      quoteComplie = /^::>([0-9]{18}).+/,
      contractE =
        new Discord.RichEmbed()
          .setTitle('すみどらちゃん|Sigma 利用規約')
          .setDescription(
            'すみどらちゃんは、Discordのさらなる発展を目指して作られたシステムです。\n' +
            'このシステムでは、サーバーの規定は反映されず、\n下記の利用規約が適応されます。'
          ).addField(
            '本規約について',
            'この利用規約（以下，「本規約」といいます。）は，すみどらちゃんコミュニティチーム（以下，「当チーム」といいます。）\n' +
            'が提供するサービス"すみどらちゃん"(以下，「本サービス」といいます。）の利用条件を定めるものです。\n' +
            '利用ユーザーの皆さま（以下，「ユーザー」といいます。）には，本規約に従い本サービスをご利用いただきます。'
          ).addField(
            '第1条（適用）',
            '本規約は，ユーザーと当チームとの間の本サービスの利用に関わる一切の関係に適用されるものとします。'
          ).addField(
            '第2条（権限について）',
            'すみどらちゃん 開発者のすみどら#8923 (id:212513828641046529)は、\n' +
            '本サービスの全ての権限を保有します。'
          ).addField(
            '第3条（禁止事項）',
            'ユーザーは，本サービスの利用にあたり，以下の行為をしてはなりません。\n' +
            '（1）法令または公序良俗に違反する行為\n' +
            '（2）犯罪行為に関連する行為\n' +
            '（3）当チームのサーバーまたはネットワークの機能を破壊したり，妨害したりする行為\n' +
            '（4）当チームのサービスの運営を妨害するおそれのある行為\n' +
            '（5）他のユーザーに関する個人情報等を収集または蓄積する行為\n' +
            '（6）他のユーザーに成りすます行為\n' +
            '（7）当チームのサービスに関連して，反社会的勢力に対して直接または間接に利益を供与する行為\n' +
            '（8）当チーム，本サービスの他の利用者または第三者の知的財産権，肖像権，プライバシー，名誉その他の権利または利益を侵害する行為\n' +
            '（9）過度に暴力的な表現，露骨な性的表現，人種，国籍，信条，性別，社会的身分，門地等による差別につながる表現，自殺，自傷行為，薬物乱用を誘引または助長する表現，その他反社会的な内容を含み他人に不快感を与える表現を，投稿または送信する行為\n' +
            '（10）他のお客様に対する嫌がらせや誹謗中傷を目的とする行為，その他本サービスが予定している利用目的と異なる目的で本サービスを利用する行為\n' +
            '（11）宗教活動または宗教団体への勧誘行為\n' +
            '（12）その他，当チームが不適切と判断する行為\n' +
            '（13) Discord利用規約に違反する行為\n' +
            ' (14) discordのinviteを投稿する行為'
          ).addField(
            '第4条（global chatについて）',
            'Global Chatでは、次のことをしてはいけません。\n' +
            '(1)r18発言をする行為(ただしnsfw指定が必要なカテゴリーは除きます。)\n' +
            '(2)r18,r18g画像を投稿する行為\n' +
            '(3)他人を煽る行為\n' +
            '(4)運営に対して反逆的な態度をとる行為\n' +
            '(5)その他、運営が不適切と判断した行為'
          ).addField(
            '第5条（利用制限および登録抹消）',
            '当チームは以下の場合等には，事前の通知なく投稿データを削除し，ユーザーに対して本サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができるものとします。\n' +
            '（1）本規約のいずれかの条項に違反した場合\n' +
            '（2）当チームからの問い合わせその他の回答を求める連絡に対して7日間以上応答がない場合\n' +
            '（3）その他，当チームが本サービスの利用を適当でないと判断した場合\n' +
            '当チームは，当チームの運営行為によりユーザーに生じたいかなる損害についても、一切の責任を免責されるものとします。\n' +
            'また、ユーザー様同士のトラブルにつきましては、自己責任による当事者同士の解決を基本とし、当チームは一切の責任を免責されるものとします。'
          ).addField(
            '利用規約への同意について',
            '本サービスを使用している時点で、利用規約に同意したこととなります。'
          ).addField('公式サーバー', 'https://discord.gg/fVsAjm9')
          .addField('BOT招待', 'https://discordapp.com/api/oauth2/authorize?client_id=437917527289364500&permissions=671410193&scope=bot');

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

  userCheck(message) {
    if (message.author.id === '212513828641046529') return 0;
    if (message.guild.ownerID === message.author.id) return 1;
    if (message.member.hasPermission(Discord.Permissions.FLAGS.MANAGE_CHANNELS)) return 2;
    return 3;
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

    if (message.content.startsWith('>')) {
      await this.command(message);
      return;
    }

    if (message.channel.id in this.channels) {
      await this.sendGlobalMessage(message, this.channels[message.channel.id]);
    }
  }

  async command(message) {
    let command,
        args;
    try {
      args = message.content.split(' ');
      command = args.shift();
    } catch (ex) {
      command = message.content;
      args = [];
    }

    if (command === '>connect') {
      if (!(this.userCheck(message) <= 2)) return;
      if (message.channel.id in this.channels) return;
      if (!args || args.length === 0) {
        process.nextTick(this.addChannelGlobal.bind(this), message.channel, message.guild, 'global-chat');
      } else {
        if (args[0] === 'global-r18') {
          if (!message.channel.nsfw) {
            await message.channel.send('NSFW指定をしてください。');
            return;
          }
          process.nextTick(this.addChannelGlobal.bind(this), message.channel, message.guild, 'global-r18');
        } else if (args[0] in this.webhooks) {
          process.nextTick(this.addChannelGlobal.bind(this), message.channel, message.guild, args[0]);
        }
      }
    } else if (command === '>disconnect') {
      if (!(this.userCheck(message) <= 2)) return;
      let category = false;
      for (const [key, value] of Object.entries(this.webhooks)) {
        if (message.channel.id in value) {
          category = key;
          break;
        }
      }
      if (!category) return;
      delete this.webhooks[category][message.channel.id];
      delete this.channels[message.channel.id];
      this.connecting -=1;
      await message.channel.send('接続解除しました。');
    } else if (command === '>s') {
      let channelId,
          messageId;
      try {
        ({first: channelId, second: messageId} = await this.sqlManager.getMessageIds(args[0]));
        if (!channelId) return;
      } catch (ex) {
        await message.channel.send('なし');
        return;
      }
      const channel = this.channels.get(channelId),
            _message = await channel.fetchMessage(messageId),
            embed = new Discord.RichEmbed()
              .setTitle(`id:${args[0]}のデータ`)
              .setDescription(_message.content)
              .setColor(0x00bfff)
              .setTimestamp(_message.createdAt)
              .setAuthor(_message.author.username, _message.author.displayAvatarURL)
              .setFooter(_message.guild.name, _message.guild.iconURL);
      await message.channel.send(embed);
    } else if (command === '>del') {
      if (this.userCheck(message) !== 0) return;
      if (!args || args.length === 0) return;
      const _id = this.getMemberIdFromName(args[0]),
            messages = await this.sqlManager.getMessages(_id);
      for (const m of messages) {
        try {
          await m.delete();
        } catch (ex) {
          void 0;
        }
      }
    } else if (command === '>get') {
      if (!args || args.length === 0) return;
      const _id = this.getMemberIdFromName(args[0]);
      if (!_id) {
        await message.channel.send('なし');
        return;
      }
      await message.channel.send(_id);
    } else if (command === '>ban') {
      if (this.userCheck(message) !== 0) return;
      if (!args || args.length === 0) return;

      let _id;
      if (Number.isNaN(Number.parseInt(args[0]))) {
        _id = this.getMemberIdFromName(args[0]);
      } else {
        _id = args[0];
      }
      this.bans.push(_id);
      await message.channel.send('追加しました');
    } else if (command === '>unban') {
      console.log(this.bans);
      if (this.userCheck(message) !== 0) return;
      if (!args || args.length === 0) return;

      let _id;
      if (Number.isNaN(Number.parseInt(args[0]))) {
        _id = this.getMemberIdFromName(args[0]);
      } else {
        _id = args[0];
      }

      if (!this.bans.includes(_id)) {
        await message.channel.send('いません');
        return;
      }
      this.bans = this.bans.filter(uid => uid !== _id);
      await message.channel.send('削除しました');
    } else if (command === '>banlist') {
      if (this.userCheck(message) !== 0) return;
      let text = '```\n';
      for (const _id of this.bans) {
        if (!_id) continue;
        const u = await this.fetchUser(_id);
        text += `${u.username}(${u.id})\n`;
      }
      text += '```';
      await message.channel.send(text);
    } else if (command === '>notice') {
      const desc = args.shift();
      await this.sendGlobalNotice({
        text: desc,
        mode: 'update',
        name: '更新情報',
        _list: args,
      });
    } else if (command === '>debug') {
      if (!(this.userCheck(message) <= 2)) return;
      if (this.debug.includes(message.guild.id)) {
        this.debug = this.debug.filter(gid => gid !== message.guild.id);
        await message.channel.send('デバッグ機能をオフにしました。');
        return;
      }
      this.debug.push(message.guild.id);
      await message.channel.send('デバッグ機能をオンにしました。');
    } else if (command === '>checking') {
      if (!(this.userCheck(message) <= 2)) return;
      if (this.checking.includes(message.guild.id)) {
        this.checking = this.checking.filter(gid => gid !== message.guild.id);
        await message.channel.send('送信チェック機能をオフにしました。');
        return;
      }
      this.checking.push(message.guild.id);
      await message.channel.send('送信チェック機能をオンにしました。');
    } else if (command === '>help') {
      const embed =
        new Discord.RichEmbed()
          .setTitle(`Global Chat ${v} for Discord`)
          .setDescription('製作者: すみどら#8923')
          .setColor(0x00ff00)
          .addField('>tos', 'Terms of service(利用規約)をDMに送信します。', false)
          .addField('>get [ユーザー名]', '名前からユーザーidを取得します。', false)
          .addField('>s [メッセージid]', 'global chatに送信されたメッセージを取得します。', false)
          .addField('>connect', 'コネクトします。チャンネル管理の権限が必要です。', false)
          .addField('>connect [カテゴリーネーム]', '指定したカテゴリーのチャンネルにコネクトします。チャンネル管理の権限が必要です。\nカテゴリーは追加次第お知らせします。', false)
          .addField('>disconnect', 'コネクト解除します。チャンネル管理の権限が必要です。', false)
          .addField('>debug', 'デバッグ機能をオンにします。もう一度実行するとオフになります。チャンネル管理の権限が必要です。', false)
          .addField('>checking', '送信チェック機能をオンにします。もう一度実行するとオフになります。チャンネル管理の権限が必要です。', false)
          .addField('>adminhelp', 'for すみどら', false);
      await message.channel.send(embed);
    } else if (command === '>adminhelp') {
      const embed =
        new Discord.RichEmbed()
          .setTitle(`Global Chat ${v} for Discord`)
          .setDescription('製作者: すみどら#8923')
          .setColor(0xff0000)
          .addField('>ban [ユーザーネーム or id]', '無期限banします。', false)
          .addField('>unban [ユーザーネーム or id]', 'banを解除します。', false)
          .addField('>banlist', 'banされているユーザーを表示します。', false)
          .addField('>notice [description] <args>', 'おしらせします。', false);
      await message.channel.send(embed);
    } else if (command === '>tos') {
      try {
        await message.author.send(contractE);
      } catch (ex) {
        void 0;
      }
    } else if (command === '>die') {
      this.destroy();
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
