import { Client, User } from "discord.js";

import { setData, getData, deleteData } from 'discordbot-data';
type actionType = 
| 'sendMessage'
| 'sendImage'
| 'sendFile'
| 'addReaction'
| 'getReaction'
| 'mention'
| 'mentioned'
| 'joinVoiceChannel'
| 'joinStageChannel'
| 'leftVoiceChannel'
| 'leftStageChannel'
| 'useCommand'
| 'useContextMenu'

let startTime = {};
function startMeasuringTime(name, guildId, userId) {
  startTime[name] ??= {};
  startTime[name][guildId] ??= {};
  startTime[name][guildId][userId] = Math.floor(Date.now() / 1000 / 60);
}
function endMeasuringTime(name, guildId, userId) {
  if (startTime[name]?.[guildId]?.[userId] == null) return;

  let time = Math.floor(Date.now() / 1000 / 60) - startTime[name][guildId][userId]
  setData('guild', guildId, ['memberData', 'time', name, userId], time, '+');
  setData('guild', guildId, ['stats', 'time', name], time, '+');

  startTime[name][guildId][userId] = null;
}

export function init(client: Client) {
  client.channels.cache.each(i => {
    if (i.type == 'GUILD_VOICE') i.members.each(member => startMeasuringTime('inVoiceChannel', member.guild.id, member.user.id));
    if (i.type == 'GUILD_STAGE_VOICE') i.members.each(member => startMeasuringTime('inStageChannel', member.guild.id, member.user.id));
  })
}
export function onExit() {
  for (let name in startTime) {
    for (let guildId in startTime[name]) {
      for (let userId in startTime[name][guildId]) {
        endMeasuringTime(name, guildId, userId);
      }
    }
  }
}

export function action(guildId: string | null, userId: string | null, type: actionType) {
  if (userId == null) return;

  setData('guild', guildId, ['memberData', 'action', type, userId], 1, '+');
  setData('guild', guildId, ['stats', 'action', type], 1, '+');
  
  if (type == 'joinVoiceChannel') startMeasuringTime('inVoiceChannel', guildId, userId);
  if (type == 'joinStageChannel') startMeasuringTime('inStageChannel', guildId, userId);

  if (type == 'leftVoiceChannel') endMeasuringTime('inVoiceChannel', guildId, userId);
  if (type == 'leftStageChannel') endMeasuringTime('inStageChannel', guildId, userId);
}

export function updateData(guildId: string | null, userId: string) {
  for (let name in startTime) {
    if (startTime[name]?.[guildId ?? '']?.[userId] != null) {
      endMeasuringTime(name, guildId, userId);
      startMeasuringTime(name, guildId, userId);
    }
  }
}
