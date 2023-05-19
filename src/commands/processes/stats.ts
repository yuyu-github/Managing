import { ChatInputCommandInteraction, Client, CommandInteraction, AttachmentBuilder, PermissionFlagsBits, User } from 'discord.js';

import { setData, getData, deleteData } from 'discordbot-data';
import * as GoogleChartsNode from 'google-charts-node';
import * as fs from 'fs';

import { updateData } from '../../action';
import { createTempFile } from '../../temp_file'

function createStatsEmbed(getAction: (name: string, unit: string) => string, getTime: (name: string) => string, user: User | null = null) {
  const displayData = {
    'メッセージを送った回数': getAction('sendMessage', '回'),
    '画像を送った回数': getAction('sendImage', '回'),
    'ファイルを送った回数': getAction('sendFile', '回'),
    'メンションした回数': getAction('mention', '回'),
    ...(user != null ? {'メンションされた回数': getAction('mentioned', '回')} : {}),
    'リアクションをした回数': getAction('addReaction', '回'),
    ...(user != null ? {'リアクションされた回数': getAction('getReaction', '回')} : {}),
    'VCに入った回数': getAction('joinVoiceChannel', '回'),
    'ステージチャンネルに入った回数': getAction('joinStageChannel', '回'),
    'VCに入っていた時間': getTime('inVoiceChannel'),
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
  } as any
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

export async function changes(client: Client, interaction: ChatInputCommandInteraction) {
  switch (interaction.options.getSubcommand()) {
    case 'record': {
      const permissions = interaction.member?.permissions;
      if (typeof permissions != 'string' && !permissions?.has(PermissionFlagsBits.ManageGuild)) {
        interaction.reply('設定を変更する権限がありません');
      }

      const value = interaction.options.getBoolean('value', true)
      setData('guild', interaction.guildId, ['changes', 'record'], value);
      interaction.reply(`推移を記録${value ? 'する' : 'しない'}ように設定しました`);
    }
    break;
    case 'output': {
      const statString = {
        'sendMessage': 'メッセージを送った回数',
        'addReaction': 'リアクションをした回数',
        'joinVoiceChannel': 'VCに入った回数',
        'inVoiceChannel': 'VCに入っていた時間'
      }

      const stat = interaction.options.getString('stat', true);
      let startString = interaction.options.getString('start', true);
      let endString = interaction.options.getString('end');
      if (startString.match(/^[0-9]{1,2}\/[0-9]{1,2}$/)) startString = new Date().getFullYear() + '/' + startString;
      if (endString?.match(/^[0-9]{1,2}\/[0-9]{1,2}$/)) endString = new Date().getFullYear() + '/' + endString;
      const startTime = new Date(startString).getTime();
      const endTime = new Date(endString ?? new Date()).getTime();
      if (isNaN(startTime) || isNaN(endTime)) {
        interaction.reply('有効な日付ではありません')
        return;
      }
      const start = Math.floor(((startTime / 1000 / 60 / 60) + 9) / 24);
      const end = Math.floor(((endTime / 1000 / 60 / 60) + 9) / 24);

      if (end - start < 1 || end - start >= 2000) {
        interaction.reply('範囲は2日以上2000日以下である必要があります')
        return;
      }

      let data: [string, number][] = [];
      for (let i = start; i <= end; i++) {
        data.push([new Date((i * 24 - 9) * 60 * 60 * 1000).toLocaleDateString("ja-JP"),
          getData('guild', interaction.guildId, ['changes', 'data', stat, i.toString()]) as number ?? 0])
      }

      let compData: {[k: string]: [string, number][]} = {};
      for (let compId of [interaction.options.getString('comp-id-1'), interaction.options.getString('comp-id-2'), interaction.options.getString('comp-id-3')]) {
        if (compId == null) continue;
        
        const compIdData = compId.split('s');
        const guildId = BigInt('0x' + compIdData[0]).toString();
        const userId = BigInt('0x' + compIdData[1]).toString();

        const guild = client.guilds.cache.get(guildId);
        if (guild == null) {
          interaction.reply('無効な比較IDです')
          return;
        }
        if (userId != interaction.user.id) {
          interaction.reply('自分以外が作成した比較IDを使用できません')
          return;
        }
        if (!(await guild.members.fetch()).has(interaction.user.id)) {
          interaction.reply('自分が入っていないサーバーの比較IDを使用できません')
          return;
        }

        for (let i = start; i <= end; i++) {
          compData[guild.name] ??= []
          compData[guild.name].push([new Date((i * 24 - 9) * 60 * 60 * 1000).toLocaleDateString("ja-JP"),
            getData('guild', guild.id, ['changes', 'data', stat, i.toString()]) as number ?? 0])
        }
      }

      switch (interaction.options.getString('type', true)) {
        case 'line-graph': {
          interaction.deferReply();
          
          let image: Buffer = await GoogleChartsNode.render(`
            let table = new google.visualization.DataTable();
            table.addColumn('string', '');
            table.addColumn('number', '${interaction.guild?.name ?? ''}');
            ${Object.keys(compData).map(j => `table.addColumn('number', '${j}');`).join('')}
            table.addRows([${data.map(i => `['${i[0]}',${i[1]},${Object.values(compData).map(j => `${(j.find(k => k[0] == i[0]) ?? [null, 0])[1]}`).join(',')}]`).join(',')}]);
            let chart = new google.visualization.LineChart(document.getElementById('chart_div'));
            chart.draw(table, {
              title: '${statString[stat] ?? stat}',
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
              new AttachmentBuilder(image).setName('output.jpg')
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
            ${Object.keys(compData).map(j => `table.addColumn('number', '${j}');`).join('')}
            table.addRows([${data.map(i => `['${i[0]}',${i[1]},${Object.values(compData).map(j => `${(j.find(k => k[0] == i[0]) ?? [null, 0])[1]}`).join(',')}]`).join(',')}]);
            let chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
            chart.draw(table, {
              title: '${statString[stat] ?? stat}',
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
              new AttachmentBuilder(image).setName('output.jpg')
            ]
          })
        }
        break;
        case 'calendar': {
          interaction.deferReply()

          let images: Buffer[] = [];
          let list = {[interaction.guild?.name ?? '']: data, ...compData};
          for (let name in list) {
            let item = list[name];
            images.push(await GoogleChartsNode.render(`
              let table = new google.visualization.DataTable();
              table.addColumn('date', '');
              table.addColumn('number', '');
              table.addRows([${item.map(i => `[new Date('${i[0]}'),${i[1]}]`).join(',')}]);
              let chart = new google.visualization.Calendar(document.getElementById('chart_div'));
              chart.draw(table, {
                title: '${statString[stat] ?? stat}(${name})',
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
            }));
          }

          interaction.followUp({
            files: images.map(image => new AttachmentBuilder(image).setName('output.jpg'))
          })
        }
        break;
        case 'csv': {
          console.log(Object.keys(compData).map(j => `,${j}`));
          let str = `,${interaction.guild?.name}${Object.keys(compData).map(j => `,${j}`).join('')}\n` +
            data.map(i => `${i[0]},${i[1]}${Object.values(compData).map(j => `,${(j.find(k => k[0] == i[0]) ?? [null, 0])[1]}`).join('')}`).join('\n');
          await interaction.reply({
            files: [
              new AttachmentBuilder(Buffer.from(str)).setName('output.csv')
            ]
          });
        }
        break;
        case 'json': {
          let obj = {};
          for (let i of data) {
            obj[i[0]] ??= {};
            obj[i[0]][interaction.guild?.name] = i[1];
            for (let name in compData) {
              obj[i[0]][name] = (compData[name].find(k => k[0] == i[0]) ?? [null, 0])[1]
            }
          }

          await interaction.reply({
            files: [
              new AttachmentBuilder(Buffer.from(JSON.stringify(obj))).setName('output.json')
            ]
          });
        }
        break;
      }
    }
    break;
    case 'generate-comp-id': {
      await interaction.reply({content: '比較IDを生成しました', ephemeral: true});
      interaction.followUp({content: BigInt(interaction.guildId ?? 0).toString(16) + 's' + BigInt(interaction.user.id).toString(16), ephemeral: true});
    }
    break;
  }
}
