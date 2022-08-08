import { Client, Intents, Interaction, Message } from 'discord.js';
import botToken from './token';
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ]
});

import * as dev from './dev';
import commands from './commands/list';
import commandProcess from './commands/process';
import loadVotes from './vote/load_votes';
import * as voteEvents from './vote/events';
import quote from './quote';

client.once('ready', async () => {
  try {
    if (dev.isDev) await client.application?.commands.set(commands, dev.serverId);
    else await client.application?.commands.set(commands);

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
    await commandProcess(client, interaction);
  } catch (e) {
    console.error(e);
  }
})

client.on('messageReactionAdd', async (reaction, user) => {
  try {
    if (!('_equals' in user)) return;
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
