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

let lastJoinVoiceChannel = {};
let lastJoinStageChannel = {};

export function action(guildId: string | null, userId: string, type: actionType) {
  setData(guildId, ['memberData', 'action', type, userId], 1, '+');
  
  if (type == 'joinVoiceChannel') lastJoinVoiceChannel[userId] = Math.floor(Date.now() / 1000 / 60);
  if (type == 'joinStageChannel') lastJoinStageChannel[userId] = Math.floor(Date.now() / 1000 / 60);

  if (type == 'leftVoiceChannel' && lastJoinVoiceChannel[userId] != null)
    setData(guildId, ['memberData', 'time', 'inVoiceChannel', userId],
      Math.floor(Date.now() / 1000 / 60) - lastJoinVoiceChannel[userId], '+');
  if (type == 'leftStageChannel' && lastJoinStageChannel[userId] != null)
    setData(guildId, ['memberData', 'time', 'inStageChannel', userId],
      Math.floor(Date.now() / 1000 / 60) - lastJoinStageChannel[userId], '+');
}
