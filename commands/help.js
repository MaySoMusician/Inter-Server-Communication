const Discord = require('discord.js'),
      ISCVersion = require('../package.json');

exports.run = async (client, message, args) => {
  const cmdsAvailable = client.commandManager.getNonAdminCommands(),
        helpEmbed =
          new Discord.RichEmbed()
            .setTitle(`Inter-Server Communication ${ISCVersion}`)
            .setDescription('based on Global Chat 3.0.3 for Discord')
            .setColor(0x00ff00);

  cmdsAvailable.forEach(c => c.help.forEach(
    h => helpEmbed.addField(client.config.prefix + h.usage, h.description)
  ));

  await message.channel.send(helpEmbed);
};

exports.conf = {
  name: 'help',
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'USR',
};

exports.help = [
  {
    usage: 'help',
    description: 'コマンドヘルプを表示します。',
  },
];
