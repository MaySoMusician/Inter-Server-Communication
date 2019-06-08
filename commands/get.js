exports.run = async (client, message, args) => {
  if (!args || args.length === 0) return;
  const _id = client.getMemberIdFromName(args[0]);
  if (!_id) {
    await message.channel.send('なし');
    return;
  }
  await message.channel.send(_id);
};

exports.conf = {
  name: 'get',
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'USR',
};

exports.help = [
  {
    usage: 'get [ユーザー名]',
    description: '名前からユーザーidを取得します。',
  },
];
