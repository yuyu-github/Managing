import { Client, Intents, Interaction, Message } from 'discord.js';
import botToken from './token';
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ]
});

import * as dev from './dev';
import commands from './commands/list';
import commandProcess from './commands/process';
import loadVotes from './vote/load_votes';
import * as voteEvents from './vote/events';
import quote from './quote';
import { action } from './action';

process.chdir(__dirname + '\\..\\');

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
    action(message.guildId, message.author.id, 'sendMessage');
    await quote(client, message);
  } catch (e) {
    console.error(e);
  }
})

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isCommand()) action(interaction.guildId, interaction.user.id, 'useCommand')
    if (interaction.isContextMenu()) action(interaction.guildId, interaction.user.id, 'useContextMenu')

    await commandProcess(client, interaction);
  } catch (e) {
    console.error(e);
  }
})

client.on('messageReactionAdd', async (reaction, user) => {
  try {
    action(reaction.message.guildId, user.id, 'addReaction');
    if ('_equals' in user) await voteEvents.onReactionAdd(client, reaction, user);
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

client.on('voiceStateUpdate', (oldState, newState) => {
  if (oldState.channelId != newState.channelId && oldState.channel?.type != newState.channel?.type && newState.member != null) {
    if (newState.channel?.type == 'GUILD_VOICE') action(newState.guild.id, newState.member.user.id, 'joinVoiceChannel');
    if (oldState.channel?.type == 'GUILD_VOICE') action(newState.guild.id, newState.member.user.id, 'leftVoiceChannel');
    if (newState.channel?.type == 'GUILD_STAGE_VOICE') action(newState.guild.id, newState.member.user.id, 'joinStageChannel');
    if (oldState.channel?.type == 'GUILD_STAGE_VOICE') action(newState.guild.id, newState.member.user.id, 'leftStageChannel');
  }
})

client.login(botToken);
