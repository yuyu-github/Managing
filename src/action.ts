import { User } from "discord.js";

import { setData, getData, deleteData } from './data';
type actionType = 
| 'sendMessage'
| 'useCommand'
| 'useContextMenu'
| 'addReaction'
| 'joinVoiceChannel'
| 'joinStageChannel'
| 'leftVoiceChannel'
| 'leftStageChannel'

let startTime = {};
function startMeasuringTime(name, guildId, userId) {
  startTime[name] ??= {};
  startTime[name][guildId] ??= {};
  startTime[name][guildId][userId] = Math.floor(Date.now() / 1000 / 60);
}

function endMeasuringTime(name, guildId, userId) {
  if (startTime[name]?.[guildId]?.[userId] == null) return;
  setData(guildId, ['memberData', 'time', name, userId],
    Math.floor(Date.now() / 1000 / 60) - startTime[name][guildId][userId], '+');
}

export function action(guildId: string | null, userId: string, type: actionType) {
  setData(guildId, ['memberData', 'action', type, userId], 1, '+');
  
  if (type == 'joinVoiceChannel') startMeasuringTime('inVoiceChannel', guildId, userId);
  if (type == 'joinStageChannel') startMeasuringTime('inStageChannel', guildId, userId);

  if (type == 'leftVoiceChannel') endMeasuringTime('inVoiceChannel', guildId, userId);
  if (type == 'leftStageChannel') endMeasuringTime('inStageChannel', guildId, userId);
}
