exports.run = async (client, message, args) => {
  if (message.channel.id in client.channels) return;
  if (!args || args.length === 0) {
    process.nextTick(client.addChannelGlobal.bind(client), message.channel, message.guild, 'global-chat');
  } else {
    if (args[0] === 'global-r18') {
      if (!message.channel.nsfw) {
        await message.channel.send('NSFW指定をしてください。');
        return;
      }
      process.nextTick(client.addChannelGlobal.bind(client), message.channel, message.guild, 'global-r18');
    } else if (args[0] in client.webhooks) {
      process.nextTick(client.addChannelGlobal.bind(client), message.channel, message.guild, args[0]);
    }
  }
};

exports.conf = {
  name: 'connect',
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 'MAN',
};

exports.help = [
  {
    usage: 'connect',
    description: 'コネクトします。チャンネル管理の権限が必要です。',
  },
  {
    usage: 'connect [カテゴリーネーム]',
    description: '指定したカテゴリーのチャンネルにコネクトします。チャンネル管理の権限が必要です。\nカテゴリーは追加次第お知らせします。',
  },
];
