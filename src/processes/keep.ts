import { GuildMember, PartialGuildMember } from "discord.js";

import { setData, getData, deleteData } from 'discordbot-data';
type KeepData = {
  roles?: string[],
  nick?: string
}

export function onMemberAdd(member: GuildMember) {
  let keepData = getData('guild', member.guild.id, ['keep', 'data', member.id]) as KeepData;
  if ((getData('guild', member.guild.id, ['keep', 'enabled', 'role']) ?? false)) {
    if (keepData.roles != null) member.roles.set(keepData.roles);
  }
  if ((getData('guild', member.guild.id, ['keep', 'enabled', 'nick']) ?? false)) {
    if (keepData.nick != null) member.setNickname(keepData.nick);
  }
}

export function onMemberRemove(member: GuildMember | PartialGuildMember) {
  let keepData: KeepData = {};
  if (getData('guild', member.guild.id, ['keep', 'enabled', 'role']) ?? false) {
    keepData.roles = member.roles.cache.map((v, key) => key);
  }
  if ((getData('guild', member.guild.id, ['keep', 'enabled', 'nick']) ?? false) && member.nickname != null) {
    keepData.nick = member.nickname;
  }
  setData('guild', member.guild.id, ['keep', 'data', member.id], keepData);
}
