exports.run = async (client, message, args) => {
  const formatUserData = userId => client.fetchUser(userId).then(u => `${u.username} (${u.id})`),
        [bannedIndef, bannedTemp] = await Promise.all([
          Promise.all(client.userService.usersIndefinitelyBanned.map(id => formatUserData(id))),
          Promise.all(client.userService.usersTemporarilyBanned.map(id => formatUserData(id))),
        ]),
        results = `Users that have been banned indefinitely
${bannedIndef.join('\n')}

Users that have been banned temporarily
${bannedTemp.join('\n')}
`;

  await message.channel.send('```\n' + results + '```');
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
