import { Client, CommandInteraction, User } from 'discord.js';

import { setData, getData, deleteData } from 'discordbot-data';

import { updateData } from '../../action';

function createStatsEmbed(getAction: (name: string, unit: string) => string, getTime: (name: string) => string, user: User | null = null) {
  const displayData = {
    'メッセージを送った回数': getAction('sendMessage', '回'),
    '画像を送った回数': getAction('sendImage', '回'),
    'ファイルを送った回数': getAction('sendFile', '回'),
    'メンションした回数': getAction('mention', '回'),
    'メンションされた回数': getAction('mentioned', '回'),
    'リアクションをした回数': getAction('addReaction', '回'),
    'リアクションされた回数': getAction('getReaction', '回'),
    'ボイスチャンネルに入った回数': getAction('joinVoiceChannel', '回'),
    'ステージチャンネルに入った回数': getAction('joinStageChannel', '回'),
    'ボイスチャンネルに入っていた時間': getTime('inVoiceChannel'),
    'ステージチャンネルに入っていた時間': getTime('inStageChannel'),
    'コマンドを使った回数': getAction('useCommand', '回'),
    'コンテキストメニューを使った回数': getAction('useContextMenu', '回'),
  }
  return {
    embeds: [
      {
        author: {
          name: user?.tag,
          iconURL: user?.displayAvatarURL(),
        },
        fields: Object.keys(displayData).map(i => ({
          name: i,
          value: displayData[i],
        })),
      }
    ]
  }
}

export async function stats(client: Client, interaction: CommandInteraction) {
  const user = interaction.options.getUser('user') ?? interaction.user;

  updateData(interaction.guildId, user.id);

  const stats = getData('guild', interaction.guildId, ['stats']);
  const getAction = (name: string, unit: string): string => `${stats?.['action']?.[name] ?? 0}${unit}`;
  const getTime = (name: string): string => `${minutesToString(stats?.['time']?.[name] ?? 0)}`;
  const minutesToString = (minutes: number): string => (minutes >= 60 ? Math.floor(minutes / 60) + '時間' : '') + minutes % 60 + '分';

  interaction.reply(createStatsEmbed(getAction, getTime))
}

export async function memberStats(client: Client, interaction: CommandInteraction) {
  const user = interaction.options.getUser('user') ?? interaction.user;

  updateData(interaction.guildId, user.id);

  const memberStats = getData('guild', interaction.guildId, ['memberData']);
  const getAction = (name: string, unit: string): string => `${memberStats?.['action']?.[name]?.[user.id] ?? 0}${unit} (#${getRank(memberStats?.['action']?.[name])})`;
  const getTime = (name: string): string => `${minutesToString(memberStats?.['time']?.[name]?.[user.id] ?? 0)} (#${getRank(memberStats?.['time']?.[name])})`;
  const minutesToString = (minutes: number): string => (minutes >= 60 ? Math.floor(minutes / 60) + '時間' : '') + minutes % 60 + '分';
  const getRank = list => list == null ? 1 : list[user.id] == null ? Object.keys(list).length + 1 : Object.keys(list).sort((a, b) => list[b] - list[a]).indexOf(user.id) + 1;

  interaction.reply(createStatsEmbed(getAction, getTime, user))
}
