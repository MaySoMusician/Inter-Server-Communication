const Discord = require('discord.js'),
      tosData = require('../constants/tos.js');
exports.run = async (client, message, args) => {
  try {
    const tosEmbed =
      new Discord.RichEmbed()
        .setTitle(tosData.title)
        .setDescription(tosData.description);
    for (const f of tosData.fields) {
      tosEmbed.addField(f.header, f.contents);
    }
    await message.author.send(tosEmbed);
  } catch (ex) {
    void 0;
  }
};

exports.conf = {
  name: 'tos',
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 'USR',
};

exports.help = [
  {
    usage: 'tos',
    description: 'Terms of service(利用規約)をDMに送信します。',
  },
];
