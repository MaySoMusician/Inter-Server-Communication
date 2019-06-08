exports.run = async (client, message, args) => {
  if (!args || args.length === 0) return;

  let _id;
  if (Number.isNaN(Number.parseInt(args[0]))) {
    _id = client.getMemberIdFromName(args[0]);
  } else {
    _id = args[0];
  }
  client.bans.push(_id);
  await message.channel.send('追加しました');
};

exports.conf = {
  name: 'ban',
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'ADMIN',
};

exports.help = [
  {
    usage: 'ban [ユーザーネーム or id]',
    description: '無期限banします。',
  },
];
