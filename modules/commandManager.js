const Enmap = require('enmap'),
      {promisify} = require('util'),
      readdir = promisify(require('fs').readdir);

module.exports = class CommandManager {
  #client;
  #permLevels;
  #permLevelCache;
  constructor(client) {
    this.#client = client;

    // All commands and aliases are put in collections where they can be read from, catalogued, listed, etc.
    this.commands = new Enmap();
    this.aliases = new Enmap();

    // Load user permissions
    this.#permLevels = require('../constants/permissions.js')(this.#client);

    // Generate a cache of client permissions
    this.#permLevelCache = {};
    for (const current of this.#permLevels) {
      this.#permLevelCache[current.index] = current.level;
    }
  }

  async init() {
    // Here we load commands into memory, as a collection, so they're accessible anywhere.
    const cmdFiles = await readdir('./commands');
    this.#client.logger.log(`Loading a total of ${cmdFiles.length} commands...`);
    for (const f of cmdFiles) {
      if (!f.endsWith('.js')) return; // Ignore files that's not js
      const result = this.loadCommand(f);
      if (result) this.#client.logger.log(result);
    }
  }

  loadCommand(commandName) {
    try {
      this.#client.logger.log(`Loading Command: ${commandName}.`);
      const props = require(`../commands/${commandName}`);
      if (props.init) {
        props.init(this.#client);
      }

      this.commands.set(props.conf.name, props);
      for (const a of props.conf.aliases) {
        this.aliases.set(a, props.conf.name);
      }
      return false;
    } catch (e) {
      this.#client.logger.error(e.stack);
      return `Unable to load command ${commandName}: ${e}`;
    }
  }

  async unloadCommand(commandName) {
    let command;
    if (this.commands.has(commandName)) {
      command = this.commands.get(commandName);
    } else if (this.aliases.has(commandName)) {
      command = this.commands.get(this.aliases.get(commandName));
      return `\`${commandName}\` is one of the aliases of the command \`${command.help.name}\`. Try to unload \`${command.help.name}\`.`;
    }
    if (!command) return `The command \`${commandName}\` doesn't seem to exist Try again!`;

    if (command.shutdown) {
      await command.shutdown(this.#client);
    }
    const mod = require.cache[require.resolve(`../commands/${commandName}.js`)];
    delete require.cache[require.resolve(`../commands/${commandName}.js`)];
    for (let i = 0; i < mod.parent.children.length; i++) {
      if (mod.parent.children[i] === mod) {
        mod.parent.children.splice(i, 1);
        break;
      }
    }
    return false;
  }

  _getPermLevel(message) {
    const permOrder = this.#permLevels.slice(0).sort((p, c) => p.level > c.level ? 1 : -1);
    let permlvl = permOrder[permOrder.length - 1].level;

    while (permOrder.length) {
      const currentLevel = permOrder.shift();
      if (message.guild && currentLevel.guildOnly) continue;
      if (currentLevel.check(message)) {
        permlvl = currentLevel.level;
        break;
      }
    }
    return permlvl;
  }

  getCommand(commandName) {
    return this.commands.get(commandName) || this.commands.get(this.aliases.get(commandName));
  }

  checkPermission(command, message) {
    const level = this._getPermLevel(message);
    return level <= this.#permLevelCache[command.conf.permLevel];
  }

  getAdminCommands() {
    return this.commands.filter(cmd => this.#permLevelCache[cmd.conf.permLevel] === this.#permLevelCache['ADMIN']);
  }

  getNonAdminCommands() {
    return this.commands.filter(cmd => this.#permLevelCache[cmd.conf.permLevel] >= this.#permLevelCache['MAN']);
  }

  run(command, message, args) {
    const permLevel = this._getPermLevel(message),
          strRequestedCmd = args.length === 0 ? command.conf.name : `${command.conf.name} ${args.join(' ').trim()}`;
    this.#client.logger.cmd(`${message.author.username}(${message.author.id}, level ${permLevel}) just ran '${strRequestedCmd}'`);
    command.run(this.#client, message, args);
  }
};
