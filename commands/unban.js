exports.run = async (client, message, args) => {
  console.log(client.bans);
  if (!args || args.length === 0) return;

  let _id;
  if (Number.isNaN(Number.parseInt(args[0]))) {
    _id = client.getMemberIdFromName(args[0]);
  } else {
    _id = args[0];
  }

  if (!client.bans.includes(_id)) {
    await message.channel.send('いません');
    return;
  }
  client.bans = client.bans.filter(uid => uid !== _id);
  await message.channel.send('削除しました');
};

exports.conf = {
  name: 'unban',
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'ADMIN',
};

exports.help = [
  {
    usage: 'ban [ユーザーネーム or id]',
    description: 'banを解除します。',
  },
];
