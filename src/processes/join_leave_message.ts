import { GuildMember, PartialGuildMember } from "discord.js";
import { getData } from "discordbot-data";

function replaceVar(message: string, member: GuildMember | PartialGuildMember): string {
  message = message.replace('$name', member.displayName);
  message = message.replace('$mention', member.toString());
  message = message.replace('$username', member.user.username);
  message = message.replace('$nickname', member.nickname ?? '');
  message = message.replace('$tag', member.user.tag ?? '');
  message = message.replace('$time', `<t:${Math.floor(Date.now() / 1000)}>`);
  message = message.replace('$joinedtime', `<t:${Math.floor((member.joinedTimestamp ?? 0) / 1000)}>`);

  message = message.replace('$ ', '$');
  return message;
}

export async function join(member: GuildMember) {
  const data = getData<{message: string, channel: string}>('guild', member.guild.id!, ['join-message']);
  if (data == null) return;
  const channel = await member.guild.channels.fetch(data.channel);
  if (channel == null || !('send' in channel)) return;
  channel.send({
    content: replaceVar(data.message, member),
    allowedMentions: {users: [member.id]}
  })
}

export async function leave(member: GuildMember | PartialGuildMember) {
  const data = getData<{message: string, channel: string}>('guild', member.guild.id!, ['leave-message']);
  if (data == null) return;
  const channel = await member.guild.channels.fetch(data.channel);
  if (channel == null || !('send' in channel)) return;
  channel.send({
    content: replaceVar(data.message, member),
    allowedMentions: {users: [member.id]}
  })
}
