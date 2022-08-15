import { Client, CommandInteraction } from 'discord.js';

import { setData, getData, deleteData } from 'discordbot-data';

import { updateData } from '../../action';

export async function memberData(client: Client, interaction: CommandInteraction) {
  const user = interaction.options.getUser('user') ?? interaction.user;

  updateData(interaction.guildId, user.id);

  const memberData = getData('guild', interaction.guildId, ['memberData']);
  const getAction = (name, unit) => `${memberData?.['action']?.[name]?.[user.id] ?? 0}${unit} (#${getRank(memberData?.['action']?.[name])})`;
  const getTime = name => `${minutesToString(memberData?.['time']?.[name]?.[user.id] ?? 0)} (#${getRank(memberData?.['time']?.[name])})`;
  const minutesToString = minutes => (minutes >= 60 ? Math.floor(minutes / 60) + '時間' : '') + minutes % 60 + '分';
  const getRank = list => list == null ? 1 : list[user.id] == null ? Object.keys(list).length + 1 : Object.keys(list).sort((a, b) => list[b] - list[a]).indexOf(user.id) + 1;

  const displayData = {
    'メッセージを送った回数': getAction('sendMessage', '回'),
    'コマンドを使った回数': getAction('useCommand', '回'),
    'コンテキストメニューを使った回数': getAction('useContextMenu', '回'),
    'リアクションをした回数': getAction('addReaction', '回'),
    'ボイスチャンネルに入った回数': getAction('joinVoiceChannel', '回'),
    'ステージチャンネルに入った回数': getAction('joinStageChannel', '回'),
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