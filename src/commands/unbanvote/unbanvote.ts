import { CommandInteraction, ContextMenuInteraction } from 'discord.js';

import * as dev from '../../dev';
import { vote } from '../../vote/vote';

export default function(interaction: CommandInteraction | ContextMenuInteraction, userTag: string, count = 5): void {
  interaction.guild?.bans.fetch().then(banUsers => {
    const user = banUsers.find((v) => v.user.tag == userTag)?.user;
    if (user == null) {
      interaction.reply('無効なユーザーです');
      return;
    }

    if (count < 5 && !(interaction.guildId == dev.serverId)) {
      interaction.reply('投票を終了する人数を5人未満にすることはできません');
    } else {
      vote(
        'unbanvote',
        user.tag + 'をBAN解除する',
        'BAN解除するが7割を超えた場合BAN解除します\n投票終了人数 ' + count + '人',
        [['⭕', 'BAN解除する'], ['❌', 'BAN解除しない']],
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
  }).catch(e => console.error(e));
}
