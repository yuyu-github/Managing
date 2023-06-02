import { APIInteractionGuildMember, GuildMember, PermissionFlagsBits, RoleResolvable, User } from "discord.js";

export function canRoleManage(member: GuildMember | APIInteractionGuildMember | null, role: RoleResolvable, sameRole: boolean = false) {
  if (member == null || !('highest' in member.roles) || typeof member.permissions == 'string') return false;

  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  if (member.roles.highest.comparePositionTo(role) < 0) return false;
  if (sameRole && member.roles.highest.comparePositionTo(role) == 0) return false;
  return true;
}
