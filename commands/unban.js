exports.run = async (client, message, args) => {
  if (!args || args.length === 0) return;

  let _id;
  if (Number.isNaN(Number.parseInt(args[0]))) {
    _id = client.getMemberIdFromName(args[0]);
  } else {
    _id = args[0];
  }

  if (client.userService.unbanIndefinitely(_id)) {
    await message.channel.send('削除しました');
  } else {
    await message.channel.send('いません');
  }
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
