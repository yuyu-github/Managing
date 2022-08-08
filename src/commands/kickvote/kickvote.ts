import { CommandInteraction, ContextMenuInteraction, User } from 'discord.js';

import * as dev from '../../dev';
import { vote } from '../../vote/vote';

export default function(interaction: CommandInteraction | ContextMenuInteraction, user: User, count = 5): void {
  const member = interaction.guild?.members.resolve(user);
  if (member == null) return;
  const guildRoles = interaction.guild?.roles;
  if (guildRoles == null) return;

  const roles = interaction.member?.roles;
  if (roles == null || Array.isArray(roles)) return;
  if (!member.kickable) {
    interaction.reply(user.toString() + 'をキックする権限がありません')
  } else if (guildRoles.comparePositions(member.roles.highest, roles.highest) > 0) {
    interaction.reply('自分より上のロールがある人の投票をとることはできません');
  } else if (count < 4 && !(dev.isDev && interaction.guildId == dev.serverId)) {
    interaction.reply('投票を終了する人数を4人未満にすることはできません');
  } else {
    vote(
      'kickvote',
      user.tag + 'をキックする',
      'キックするが7割を超えた場合キックします\n投票終了人数 ' + count + '人',
      [['⭕', 'キックする'], ['❌', 'キックしない']],
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
