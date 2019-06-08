exports.run = async (client, message, args) => {
  let text = '```\n';
  for (const _id of client.bans) {
    if (!_id) continue;
    const u = await client.fetchUser(_id);
    text += `${u.username}(${u.id})\n`;
  }
  text += '```';
  await message.channel.send(text);
};

exports.conf = {
  name: 'banlist',
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'ADMIN',
};

exports.help = [
  {
    usage: 'banlist',
    description: 'banされているユーザーを表示します。',
  },
];
