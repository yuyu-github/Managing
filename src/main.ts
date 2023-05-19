import { ChannelType, Client, IntentsBitField } from 'discord.js';
import * as token from './token';
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildVoiceStates
  ]
});

import commands from './commands/list';
import commandProcess from './commands/process';
import loadVotes from './vote/load_votes';
import * as voteEvents from './vote/events';
import { action, init as actionInit, onExit as actionOnExit } from './action';
import quote from './quote';
import forward from './forward';

process.chdir(__dirname + '\\..\\');

process.on('exit', () => {
  actionOnExit();
})
process.on('SIGHUP', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
process.on('SIGBREAK', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

client.once('ready', async () => {
  try {
    actionInit(client);

    if (process.env.DEBUG == 'true' && process.env.DEVSERVERS != null) {
      for (let id of process.env.DEVSERVERS.split(',')) await client.application?.commands.set(commands, id);
    } else await client.application?.commands.set(commands);

    await loadVotes(client);

    console.log('Managing Ready');
  } catch(e) {
    console.error(e);
  }
})

client.on('messageCreate', async message => {
  try {
    action(message.guildId, message.author.id, 'sendMessage');

    let mentionedMembers: string[] = [];
    message.mentions.members?.each(member => { if (!mentionedMembers.includes(member.id)) mentionedMembers.push(member.id) });
    message.mentions.roles.each(role => role.members.each(member => { if (!mentionedMembers.includes(member.id)) mentionedMembers.push(member.id) }));
    if (message.mentions.everyone) (await message.guild?.members.fetch())?.each(member => {if (!mentionedMembers.includes(member.id)) mentionedMembers.push(member.id) });
    mentionedMembers.forEach(id => action(message.guildId, id, 'mentioned'));
    if (mentionedMembers.length > 0) action(message.guildId, message.author.id, 'mention');

    message.attachments.each(i => {
      action(message.guildId, message.author.id, 'sendFile');
      if (i.contentType?.startsWith('image/')) action(message.guildId, message.author.id, 'sendImage');
    })

    await forward(client, message);
    await quote(client, message);
  } catch (e) {
    console.error(e);
  }
})

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isCommand()) action(interaction.guildId, interaction.user.id, 'useCommand')
    if (interaction.isContextMenuCommand()) action(interaction.guildId, interaction.user.id, 'useContextMenu')

    await commandProcess(client, interaction);
  } catch (e) {
    console.error(e);
  }
})

client.on('messageReactionAdd', async (reaction, user) => {
  try {
    action(reaction.message.guildId, user.id, 'addReaction');
    action(reaction.message.guildId, reaction.message.author?.id ?? null, 'getReaction');

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
    if (newState.channel?.type == ChannelType.GuildVoice) action(newState.guild.id, newState.member.user.id, 'joinVoiceChannel');
    if (oldState.channel?.type == ChannelType.GuildVoice) action(newState.guild.id, newState.member.user.id, 'leftVoiceChannel');
    if (newState.channel?.type == ChannelType.GuildStageVoice) action(newState.guild.id, newState.member.user.id, 'joinStageChannel');
    if (oldState.channel?.type == ChannelType.GuildStageVoice) action(newState.guild.id, newState.member.user.id, 'leftStageChannel');
  }
})

client.login(process.env.DEBUG == 'true' ? token.debug : token.default);
