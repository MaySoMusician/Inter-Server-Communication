const Discord = require('discord.js');

// PERMISSION LEVEL DEFINITIONS
module.exports = client => {
  return [
    // This is the bot owner, this should be the highest permission level available.
    // The reason this should be the highest level is because of dangerous commands such as eval or exec (if the owner has that).
    {
      level: 0,
      index: 'ADMIN',
      // Simple check, compares the message author id to the one stored in the config file.
      check: message => client.config.ownerId === message.author.id,
    },

    // This is the guild owner.
    // There's nothing special they can do beyond channel managers (level 2) for now.
    {
      level: 1,
      index: 'OWN',
      // Another simple check, compares the message author id to the one of the guild's owner.
      check: message => message.guild.ownerID === message.author.id,
    },

    // This is the user that has permission to change settings for the channels.
    // They can (dis)connect channels and/or switch all kinds of options.
    {
      level: 2,
      index: 'MAN',
      // Check if they have permission to manage channel through Discord API.
      check: message => message.member.hasPermission(Discord.Permissions.FLAGS.MANAGE_CHANNELS),
    },

    // This is the minimum permisison level, this is for non-roled users.
    {
      level: 3,
      index: 'USR',
      // Don't bother checking, just return true which allows them to execute any command their level allows them to.
      check: () => true,
    },
  ];
};
