exports.run = async (client, message, args) => {
  await client.user.setStatus('invisible');
  await client.destroy();
  if (args[0] === 'r') process.exit(1);
};

exports.conf = {
  name: 'die',
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'ADMIN',
};

exports.help = [
  {
    usage: 'die',
    description: '終了します',
  },
];
