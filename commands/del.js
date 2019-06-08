exports.run = async (client, message, args) => {
  if (!args || args.length === 0) return;
  const _id = client.getMemberIdFromName(args[0]),
        messages = await client.sqlManager.getMessages(_id);
  for (const m of messages) {
    try {
      await m.delete();
    } catch (ex) {
      void 0;
    }
  }
};

exports.conf = {
  name: 'del',
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'ADMIN',
};

exports.help = [
  {
    usage: 'del [ユーザーネーム]',
    description: '指定したユーザーをメッセージを全削除します。',
  },
];
