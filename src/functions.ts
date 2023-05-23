import { APIInteractionGuildMember, GuildMember, MessageMentionOptions, PermissionFlagsBits } from "discord.js";

export function getAllowedMentions(member: GuildMember | APIInteractionGuildMember | null): MessageMentionOptions {
  if (member == null || !('guild' in member)) return {parse: []}
  if (member.permissions.has(PermissionFlagsBits.MentionEveryone)) return {parse: ['everyone', 'roles', 'users']}
  return {
    parse: ['users'],
    roles: member.guild.roles.cache.filter(i => i.mentionable).map(i => i.id)
  }
}
