import { Client, CommandInteraction, MessageAttachment, User } from 'discord.js';

import { setData, getData, deleteData } from 'discordbot-data';
import * as GoogleChartsNode from 'google-charts-node';

import { updateData } from '../../action';

function createStatsEmbed(getAction: (name: string, unit: string) => string, getTime: (name: string) => string, user: User | null = null) {
  const displayData = {
    'メッセージを送った回数': getAction('sendMessage', '回'),
    '画像を送った回数': getAction('sendImage', '回'),
    'ファイルを送った回数': getAction('sendFile', '回'),
    'メンションした回数': getAction('mention', '回'),
    ...(user != null ? {'メンションされた回数': getAction('mentioned', '回')} : {}),
    'リアクションをした回数': getAction('addReaction', '回'),
    ...(user != null ? {'リアクションされた回数': getAction('getReaction', '回')} : {}),
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

export async function changes(client: Client, interaction: CommandInteraction) {
  switch (interaction.options.getSubcommand()) {
    case 'record': {
      const permissions = interaction.member?.permissions;
      if (typeof permissions != 'string' && !permissions?.has('MANAGE_GUILD')) {
        interaction.reply('設定を変更する権限がありません');
      }

      const value = interaction.options.getBoolean('value', true)
      setData('guild', interaction.guildId, ['changes', 'record'], value);
      interaction.reply(`推移を記録${value ? 'する' : 'しない'}ように設定しました`);
    }
    break;
    case 'output': {
      const stat = interaction.options.getString('stat', true);
      const startTime = new Date(interaction.options.getString('start', true)).getTime();
      const endTime = new Date(interaction.options.getString('end') ?? new Date()).getTime();
      if (isNaN(startTime) || isNaN(endTime)) {
        interaction.reply('有効な日付ではありません')
        return;
      }
      const start = Math.floor(((startTime / 1000 / 60 / 60) + 9) / 24);
      const end = Math.floor(((endTime / 1000 / 60 / 60) + 9) / 24);

      if (end - start < 2 || end - start > 2000) {
        interaction.reply('範囲は2日以上2000日以下である必要があります')
        return;
      }

      let data: [string, number][] = [];
      for (let i = start; i <= end; i++) {
        data.push([new Date((i * 24 - 9) * 60 * 60 * 1000).toLocaleDateString("ja-JP"),
          getData('guild', interaction.guildId, ['changes', 'data', stat, i.toString()]) as number ?? 0])
      }

      switch (interaction.options.getString('type', true)) {
        case 'line-graph': {
          interaction.deferReply()

          let image: Buffer = await GoogleChartsNode.render(`
            let table = new google.visualization.DataTable();
            table.addColumn('string', '');
            table.addColumn('number', '${interaction.guild?.name ?? ''}');
            table.addRows([${data.map(i => `['${i[0]}',${i[1]}]`).join(',')}]);
            let chart = new google.visualization.LineChart(document.getElementById('chart_div'));
            chart.draw(table, {
              legend: 'bottom',
              chartArea: {
                width: '85%',
                height: '80%',
              },
            });
          `, {
            width: '420px',
            height: '260px'
          })

          interaction.followUp({
            files: [
              new MessageAttachment(image)
            ]
          })
        }
        break;
        case 'bar-graph': {
          interaction.deferReply()

          let image: Buffer = await GoogleChartsNode.render(`
            let table = new google.visualization.DataTable();
            table.addColumn('string', '');
            table.addColumn('number', '${interaction.guild?.name ?? ''}');
            table.addRows([${data.map(i => `['${i[0]}',${i[1]}]`).join(',')}]);
            let chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
            chart.draw(table, {
              legend: 'bottom',
              chartArea: {
                width: '85%',
                height: '80%',
              },
            });
          `, {
            width: '420px',
            height: '260px'
          })

          interaction.followUp({
            files: [
              new MessageAttachment(image)
            ]
          })
        }
        break;
        case 'calendar': {
          interaction.deferReply()

          let image: Buffer = await GoogleChartsNode.render(`
            let table = new google.visualization.DataTable();
            table.addColumn('date', '');
            table.addColumn('number', '${interaction.guild?.name ?? ''}');
            table.addRows([${data.map(i => `[new Date('${i[0]}'),${i[1]}]`).join(',')}]);
            let chart = new google.visualization.Calendar(document.getElementById('chart_div'));
            chart.draw(table, {
              legend: 'bottom',
              chartArea: {
                width: '85%',
                height: '80%',
              },
            });
          `, {
            width: '940px',
            height: 35 + 145 * (new Date(data.slice(-1)[0][0]).getFullYear() - new Date(data[0][0]).getFullYear() + 1) + 'px',
            packages: ['calendar'],
          })

          interaction.followUp({
            files: [
              new MessageAttachment(image)
            ]
          })
        }
        break;
      }
    }
    break;
  }
}
