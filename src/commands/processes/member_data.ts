import { Client, CommandInteraction } from 'discord.js';

import { setData, getData, deleteData } from '../../data';

export async function memberData(client: Client, interaction: CommandInteraction) {
  const user = interaction.options.getUser('user') ?? interaction.user;

  const memberData = getData(interaction.guildId, ['memberData']);
  const getAction = name => memberData?.['action']?.[name]?.[user.id] ?? 0;
  const getTime = name => minutesToString(memberData?.['time']?.[name]?.[user.id] ?? 0);
  const minutesToString = minutes => (minutes >= 60 ? Math.floor(minutes / 60) + '時間' : '') + minutes % 60 + '分'
  const displayData = {
    'メッセージを送った回数': getAction('sendMessage') + '回',
    'コマンドを使った回数': getAction('useCommand') + '回',
    'コンテキストメニューを使った回数': getAction('useContextMenu') + '回',
    'リアクションをした回数': getAction('addReaction') + '回',
    'ボイスチャンネルに入った回数': getAction('joinVoiceChannel') + '回',
    'ステージチャンネルに入った回数': getAction('joinStageChannel') + '回',
    'ボイスチャンネルに入っていた時間': getTime('inVoiceChannel'),
    'ステージチャンネルに入っていた時間': getTime('inStageChannel'),
  }
  interaction.reply({
    embeds: [
      {
        author: {
          name: user.tag,
          iconURL: user.displayAvatarURL(),
        },
        fields: Object.keys(displayData).map(i => ({
          name: i,
          value: displayData[i],
        })),
      }
    ]
  })
}
