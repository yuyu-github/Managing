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
  try {
    if (dev.isDev) await client.application.commands.set(commands, dev.ServerId);
    else await client.application.commands.set(commands);

    await loadVotes(client);

    console.log('Managing Ready');
  } catch(e) {
    console.error(e);
  }
})

client.on('messageCreate', async message => {
  try {
    await quote(client, message);
  } catch (e) {
    console.error(e);
  }
})

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isCommand()) {
      await commandProcess(client, interaction);
    }
  } catch (e) {
    console.error(e);
  }
})

client.on('messageReactionAdd', async (reaction, user) => {
  try {
    await voteEvents.onReactionAdd(client, reaction, user);
  } catch (e) {
    console.error(e);
  }
})

client.on('messageReactionRemove', async (reaction, user) => {
  try {
    await voteEvents.onReactionRemove(client, reaction, user);
  } catch (e) {
    console.error(e);
  }
})

client.login(botToken);
