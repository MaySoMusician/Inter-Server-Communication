exports.run = async (client, message, args) => {
  const desc = args.shift();
  await client.sendGlobalNotice({
    text: desc,
    mode: 'update',
    name: '更新情報',
    _list: args,
  });
};

exports.conf = {
  name: 'notice',
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'ADMIN',
};

exports.help = [
  {
    usage: 'notice [description] <args>',
    description: 'おしらせします。',
  },
];
