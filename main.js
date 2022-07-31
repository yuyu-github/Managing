try {
  const { Client, Intents } = require('discord.js');
  const botToken = require('./token');
  const client = new Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ]
  });

  const dev = require('./dev');
  const commands = require('./commands/list');
  const commandProcess = require('./commands/process');
  const loadVotes = require('./vote/load_votes');
  const voteEvents = require('./vote/events');
  const quote = require('./quote');

  client.once('ready', async () => {
    if (dev.isDev) await client.application.commands.set(commands, dev.ServerId);
    else client.application.commands.set(commands);

    loadVotes(client);

    console.log('Managing Ready');
  })

  client.on('messageCreate', message => {
    quote(client, message);
  })

  client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
      commandProcess(client, interaction);
    }
  })

  client.on('messageReactionAdd', (reaction, user) => {
    voteEvents.onReactionAdd(client, reaction, user);
  })

  client.on('messageReactionRemove', (reaction, user) => {
    voteEvents.onReactionRemove(client, reaction, user);
  })

  client.login(botToken);
} catch(e) {
  console.error(e);
}
