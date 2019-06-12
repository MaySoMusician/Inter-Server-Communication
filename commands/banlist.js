exports.run = async (client, message, args) => {
  const formatUserData = userId => client.fetchUser(userId).then(u => `${u.username} (${u.id})`),
        usersBannedIndefinitely = Promise.all(client.userService.usersIndefinitelyBanned.map(id => formatUserData(id))),
        usersBannedTemporarily = Promise.all(client.userService.usersTemporarilyBanned.map(id => formatUserData(id)));
  await Promise.all(usersBannedIndefinitely.concat(usersBannedTemporarily));

  const results = `Users that have been banned indefinitely
${usersBannedIndefinitely.join('\n')}

Users that have been banned temporarily
${usersBannedTemporarily.join('\n')}
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
