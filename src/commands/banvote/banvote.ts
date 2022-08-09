import { CommandInteraction, ContextMenuInteraction, Interaction, User } from 'discord.js';

import * as dev from '../../dev';
import { vote } from '../../vote/vote';

export default function(interaction: CommandInteraction | ContextMenuInteraction, user: User, count = 5): void {
  const member = interaction.guild?.members.resolve(user);
  if (member == null) return;
  const guildRoles = interaction.guild?.roles;
  if (guildRoles == null) return;

  const roles = interaction.member?.roles;
  if (roles == null || Array.isArray(roles)) return;
  if (!member.bannable) {
    interaction.reply(user.toString() + 'をBANする権限がありません')
  } else if (guildRoles.comparePositions(member.roles.highest, roles.highest) > 0) {
    interaction.reply('自分より上のロールがある人の投票をとることはできません');
  } else if (count < 5 && !(interaction.guildId == dev.serverId)) {
    interaction.reply('投票を終了する人数を5人未満にすることはできません');
  } else {
    vote(
      'banvote',
      user.tag + 'をBANする',
      'BANするが8割を超えた場合BANします\n投票終了人数 ' + count + '人',
      [['⭕', 'BANする'], ['❌', 'BANしない']],
      {
        user: user.id,
        count: count,
      },
      interaction.user,
      async data => {
        await interaction.reply({ content: '投票を作成しました', ephemeral: true })
        return interaction.channel?.send(data)
      },
    )
  }
}
