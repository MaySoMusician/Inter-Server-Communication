const Discord = require('discord.js');

exports.run = async (client, message, args) => {
  let channelId,
      messageId;
  try {
    ({first: channelId, second: messageId} = await client.sqlManager.getMessageIds(args[0]));
    if (!channelId) return;
  } catch (ex) {
    await message.channel.send('なし');
    return;
  }
  const channel = client.channels.get(channelId),
        _message = await channel.fetchMessage(messageId),
        embed = new Discord.RichEmbed()
          .setTitle(`id:${args[0]}のデータ`)
          .setDescription(_message.content)
          .setColor(0x00bfff)
          .setTimestamp(_message.createdAt)
          .setAuthor(_message.author.username, _message.author.displayAvatarURL)
          .setFooter(_message.guild.name, _message.guild.iconURL);
  await message.channel.send(embed);
};

exports.conf = {
  name: 's',
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'USR',
};

exports.help = [
  {
    usage: 's [メッセージid]',
    description: 'global chatに送信されたメッセージを取得します。',
  },
];
