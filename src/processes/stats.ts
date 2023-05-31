import { ChannelType, Client, User } from "discord.js";

import { setData, getData, deleteData } from 'discordbot-data';
import { client } from "../main.js";
import { ActionType, MeasuringTimeType, changesTypes } from "../data/stats.js";

let startTime = {};
function startMeasuringTime(type: MeasuringTimeType, guildId: string, userId: string) {
  startTime[type] ??= {};
  startTime[type][guildId] ??= {};
  startTime[type][guildId][userId] = Math.floor(Date.now() / 1000 / 60);
}
function endMeasuringTime(type: MeasuringTimeType, guildId: string, userId: string) {
  if (startTime[type]?.[guildId]?.[userId] == null) return;

  let time = Math.floor(Date.now() / 1000 / 60) - startTime[type][guildId][userId]
  setData('guild', guildId, ['stats', 'data', 'member', 'time', type, userId], time, '+');
  setData('guild', guildId, ['stats', 'data', 'guild', 'time', type], time, '+');

  if (getData('guild', guildId, ['changes', 'record'])) {
    if (type in changesTypes) {
      const today = Math.floor(((new Date().getTime() / 1000 / 60 / 60) + 9) / 24);
      const todayTime = Math.min(time, (new Date().getTime() / 1000 / 60 + (9 * 60)) % (60 * 24));
      setData('guild', guildId, ['changes', 'data', type, today.toString()], Math.floor(todayTime), '+');
      if (time > todayTime) {
        time = time - todayTime;
        for (let d = 1; time > 0; d++, time -= 60 * 24) {
          setData('guild', guildId, ['changes', 'data', type, (today - d).toString()], Math.floor(Math.min(time, 60 * 24)), '+');
        }
      }
    }
  }

  startTime[type][guildId][userId] = null;
}

export function init() {
  client.channels.cache.each(i => {
    if (i.type == ChannelType.GuildVoice) i.members.each(member => startMeasuringTime('inVoiceChannel', member.guild.id, member.user.id));
    if (i.type == ChannelType.GuildStageVoice) i.members.each(member => startMeasuringTime('inStageChannel', member.guild.id, member.user.id));
  })
}
export function onExit() {
  for (let name in startTime) {
    for (let guildId in startTime[name]) {
      for (let userId in startTime[name][guildId]) {
        endMeasuringTime(name as MeasuringTimeType, guildId, userId);
      }
    }
  }
}

export function action(guildId: string, userId: string | null | undefined, type: ActionType, userAction: boolean = true) {
  setData('guild', guildId, ['stats', 'data', 'guild', 'action', type], 1, '+');

  if (userId == null || !userAction) return;
  setData('guild', guildId, ['stats', 'data', 'member', 'action', type, userId], 1, '+');
  
  if (type == 'joinVoiceChannel') startMeasuringTime('inVoiceChannel', guildId, userId);
  if (type == 'joinStageChannel') startMeasuringTime('inStageChannel', guildId, userId);
  if (type == 'startStreaming') startMeasuringTime('streaming', guildId, userId);

  if (type == 'leftVoiceChannel') endMeasuringTime('inVoiceChannel', guildId, userId);
  if (type == 'leftStageChannel') endMeasuringTime('inStageChannel', guildId, userId);
  if (type == 'endStreaming') endMeasuringTime('streaming', guildId, userId);

  if (getData('guild', guildId, ['changes', 'record'])) {
    if (type in changesTypes) setData('guild', guildId, ['changes', 'data', type, Math.floor(((new Date().getTime() / 1000 / 60 / 60) + 9) / 24).toString()], 1, '+');
  }
}

export function updateData(guildId: string | null, userId: string) {
  if (guildId == null) return;
  for (let name in startTime) {
    if (startTime[name]?.[guildId ?? '']?.[userId] != null) {
      endMeasuringTime(name as MeasuringTimeType, guildId, userId);
      startMeasuringTime(name as MeasuringTimeType, guildId, userId);
    }
  }
}
