const Discord = require('discord.js'),
      ISCVersion = require('../package.json');

exports.run = async (client, message, args) => {
  const cmdsAdmin = client.commandManager.getAdminCommands(),
        helpEmbed =
          new Discord.RichEmbed()
            .setTitle(`[Help for admin] Inter-Server Communication ${ISCVersion}`)
            .setDescription('based on Global Chat 3.0.3 for Discord')
            .setColor(0xff0000);

  cmdsAdmin.forEach(c => c.help.forEach(
    h => helpEmbed.addField(client.config.prefix + h.usage, h.description)
  ));

  await message.channel.send(helpEmbed);
};

exports.conf = {
  name: 'adminhelp',
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'ADMIN',
};

exports.help = [
  {
    usage: 'adminhelp',
    description: '管理者用コマンドヘルプを表示します。',
  },
];
