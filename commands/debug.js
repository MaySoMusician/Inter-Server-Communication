exports.run = async (client, message, args) => {
  if (client.debug.includes(message.guild.id)) {
    client.debug.remove(message.guild.id);
    await message.channel.send('デバッグ機能をオフにしました。');
    return;
  }
  client.debug.push(message.guild.id);
  await message.channel.send('デバッグ機能をオンにしました。');
};

exports.conf = {
  name: 'debug',
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 'MAN',
};

exports.help = [
  {
    usage: 'checking',
    description: 'デバッグ機能をオンにします。もう一度実行するとオフになります。チャンネル管理の権限が必要です。',
  },
];
