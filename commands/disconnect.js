exports.run = async (client, message, args) => {
  let category = false;
  for (const [key, value] of Object.entries(client.webhooks)) {
    if (message.channel.id in value) {
      category = key;
      break;
    }
  }
  if (!category) return;
  delete client.webhooks[category][message.channel.id];
  delete client.channels[message.channel.id];
  client.connecting -=1;
  await message.channel.send('接続解除しました。');
};

exports.conf = {
  name: 'disconnect',
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 'MAN',
};

exports.help = [
  {
    usage: 'disconnect',
    description: 'コネクト解除します。チャンネル管理の権限が必要です。',
  },
];
