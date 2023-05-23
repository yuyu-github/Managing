import { ChannelType, Client, IntentsBitField } from 'discord.js';
import * as token from './token.js';
export const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.MessageContent,
  ]
});

import path from 'path';
import { fileURLToPath } from 'url';
import { setDebug } from 'discordbot-data';

import commands from './commands/list.js';
import commandProcess from './commands/process.js';
import { execute, execute as scheduleExecute } from './scheduler/scheduler.js';
import loadVotes from './processes/vote/load_votes.js';
import { action, init as actionInit, onExit as actionOnExit } from './processes/stats.js';
import * as voteEvents from './processes/vote/events.js';
import quote from './processes/quote.js';
import forward from './processes/forward.js';
import * as keep from './processes/keep.js';
import * as joinLeaveMessage from './processes/join_leave_message.js';

process.chdir(path.dirname(path.dirname(fileURLToPath(import.meta.url))));

process.on('exit', () => {
  actionOnExit();
})
process.on('SIGHUP', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
process.on('SIGBREAK', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

if (process.env.DEBUG == 'true') setDebug(true);

client.once('ready', async () => {
  try {
    if (process.env.DEBUG == 'true') {
      for (let id of token.debugServers) await client.application?.commands.set(commands, id);
    } else await client.application?.commands.set(commands);
    
    actionInit();
    await loadVotes();

    execute();
    setInterval(execute, 1000);

    console.log('Managing Ready');
  } catch(e) {
    console.error(e);
  }
})

client.on('messageCreate', async message => {
  try {
    action(message.guildId!, message.author.id, 'sendMessage');

    let mentionedMembers: string[] = [];
    message.mentions.members?.each(member => { if (!mentionedMembers.includes(member.id)) mentionedMembers.push(member.id) });
    message.mentions.roles.each(role => role.members.each(member => { if (!mentionedMembers.includes(member.id)) mentionedMembers.push(member.id) }));
    if (message.mentions.everyone) (await message.guild?.members.fetch())?.each(member => {if (!mentionedMembers.includes(member.id)) mentionedMembers.push(member.id) });
    mentionedMembers.forEach(id => action(message.guildId!, id, 'mentioned'));
    if (mentionedMembers.length > 0) action(message.guildId!, message.author.id, 'mention');

    message.attachments.each(i => {
      action(message.guildId!, message.author.id, 'sendFile');
      if (i.contentType?.startsWith('image/')) action(message.guildId!, message.author.id, 'sendImage');
    })

    await forward(message);
    await quote(message);
  } catch (e) {
    console.error(e);
  }
})

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isCommand()) action(interaction.guildId!, interaction.user.id, 'useCommand')
    if (interaction.isContextMenuCommand()) action(interaction.guildId!, interaction.user.id, 'useContextMenu')

    await commandProcess(interaction);
  } catch (e) {
    console.error(e);
  }
})

client.on('messageReactionAdd', async (reaction, user) => {
  try {
    action(reaction.message.guildId!, user.id, 'addReaction');
    action(reaction.message.guildId!, reaction.message.author?.id ?? null, 'getReaction');

    if ('_equals' in user) await voteEvents.onReactionAdd(reaction, user);
  } catch (e) {
    console.error(e);
  }
})

client.on('messageReactionRemove', async (reaction, user) => {
  try {
    await voteEvents.onReactionRemove(reaction, user);
  } catch (e) {
    console.error(e);
  }
})

client.on('voiceStateUpdate', async (oldState, newState) => {
  try {
    if (oldState.channelId != newState.channelId && oldState.channel?.type != newState.channel?.type && newState.member != null) {
      if (newState.channel?.type == ChannelType.GuildVoice) action(newState.guild.id, newState.member.user.id, 'joinVoiceChannel');
      if (oldState.channel?.type == ChannelType.GuildVoice) action(newState.guild.id, newState.member.user.id, 'leftVoiceChannel');
      if (newState.channel?.type == ChannelType.GuildStageVoice) action(newState.guild.id, newState.member.user.id, 'joinStageChannel');
      if (oldState.channel?.type == ChannelType.GuildStageVoice) action(newState.guild.id, newState.member.user.id, 'leftStageChannel');
    }
  } catch (e) {
    console.error(e);
  }
})

client.on('guildMemberAdd', async member => {
  try {
    keep.onMemberAdd(member);
    await joinLeaveMessage.join(member);
  } catch (e) {
    console.error(e);
  }
})

client.on('guildMemberRemove', async member => {
  try {
    keep.onMemberRemove(member);
    await joinLeaveMessage.leave(member);
  } catch (e) {
    console.error(e);
  }
})

client.login(process.env.DEBUG == 'true' ? token.debug : token.default);
