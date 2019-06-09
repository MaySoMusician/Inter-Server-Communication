exports.run = async (client, message, args) => {
  if (client.checking.includes(message.guild.id)) {
    client.checking.remove(message.guild.id);
    await message.channel.send('送信チェック機能をオフにしました。');
    return;
  }
  client.checking.push(message.guild.id);
  await message.channel.send('送信チェック機能をオンにしました。');
};

exports.conf = {
  name: 'checking',
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 'MAN',
};

exports.help = [
  {
    usage: 'checking',
    description: '送信チェック機能をオンにします。もう一度実行するとオフになります。チャンネル管理の権限が必要です。',
  },
];
