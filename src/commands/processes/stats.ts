import { ChatInputCommandInteraction, Client, CommandInteraction, AttachmentBuilder, PermissionFlagsBits, User, Colors, ButtonInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, BaseMessageOptions } from 'discord.js';

import { setData, getData, deleteData } from 'discordbot-data';
import * as GoogleChartsNode from 'google-charts-node';

import { updateData } from '../../processes/stats.js';
import { client } from '../../main.js';
import { ActionType, MeasuringTimeType, changesTypes, statTypes } from '../../data/stats.js';
import { parseTimeStringToDate } from '../../utils/parse_time.js';
import { pageEmbed } from '../../utils/page.js';

function getDisplayData(getAction: (name: ActionType, unit: string) => string, getTime: (name: MeasuringTimeType) => string, user: User | null = null) {
  return Object.entries(user != null ? statTypes.member : statTypes.server).map(([k, v]) => [v.name, v.type == 'action' ? getAction(k as ActionType, '回') : getTime(k as MeasuringTimeType)]);
}
function createStatsEmbed(displayData: string[][], page: number, pageSize: number, user: User | null = null) {
  return {
    embeds: [
      {
        author: {
          name: user?.tag,
          icon_url: user?.displayAvatarURL(),
        },
        title: '統計',
        fields: displayData.slice((page - 1) * pageSize, page * pageSize).map(i => ({
          name: i[0],
          value: i[1],
        })),
        color: Colors.Green
      }
    ]
  } as BaseMessageOptions
}


export async function stats(interaction: CommandInteraction | ButtonInteraction, data: string[] = []) {
  pageEmbed(
    interaction, data, 10, 'stats-page',
    () => {}, () => {},
    (args, page, pageSize) => {
      const stats = getData('guild', interaction.guildId!, ['stats', 'data', 'guild']);
      const getAction = (name: ActionType, unit: string): string => `${stats?.['action']?.[name] ?? 0}${unit}`;
      const getTime = (name: string): string => `${minutesToString(stats?.['time']?.[name] ?? 0)}`;
      const minutesToString = (minutes: number): string => (minutes >= 60 ? Math.floor(minutes / 60) + '時間' : '') + minutes % 60 + '分';

      const displayData = getDisplayData(getAction, getTime);
      return {
        itemCount: displayData.length,
        message: createStatsEmbed(displayData, page, pageSize),
      }
    }
  )
}

export async function memberStats(interaction: CommandInteraction | ButtonInteraction, data: string[] = []) {
  pageEmbed<{user: User | undefined}, CommandInteraction>(
    interaction, data, 10, 'member-stats-page',
    interaction => ({user: interaction.options.getUser('member') ?? interaction.user}),
    data => ({user: client.users.cache.get(data[0])}),
    (args, page, pageSize) => {
      if (args.user == null) return;
      updateData(interaction.guildId, args.user.id);

      const memberStats = getData('guild', interaction.guildId!, ['stats', 'data', 'member']);
      const getAction = (name: ActionType, unit: string): string => `${memberStats?.['action']?.[name]?.[args.user!.id] ?? 0}${unit} (#${getRank(memberStats?.['action']?.[name])})`;
      const getTime = (name: string): string => `${minutesToString(memberStats?.['time']?.[name]?.[args.user!.id] ?? 0)} (#${getRank(memberStats?.['time']?.[name])})`;
      const minutesToString = (minutes: number): string => (minutes >= 60 ? Math.floor(minutes / 60) + '時間' : '') + minutes % 60 + '分';
      const getRank = list => list == null ? 1 : list[args.user!.id] == null ? Object.keys(list).length + 1 : Object.keys(list).sort((a, b) => list[b] - list[a]).indexOf(args.user!.id) + 1;

      const displayData = getDisplayData(getAction, getTime, args.user);
      return {
        itemCount: displayData.length,
        buttonData: [args.user.id],
        message: createStatsEmbed(displayData, page, pageSize, args.user),
      }
    }
  )
}

export function ranking(interaction: ChatInputCommandInteraction | ButtonInteraction, data: string[] = []) {
  pageEmbed<{stat: string}>(
    interaction, data, 15, 'ranking-page',
    interaction => ({stat: interaction.options.getString('stat', true)}),
    data => ({stat: data[0]}),
    (args, page, pageSize) => {
      const memberStats = getData('guild', interaction.guildId!, ['stats', 'data', 'member']);
      const statType = statTypes.member[args.stat]!.type;

      let list = memberStats?.[statType]?.[args.stat] ?? {};
      let sorted = Object.keys(list).sort((a, b) => list[b] - list[a]);
      let displayList = sorted.slice((page - 1) * pageSize, page * pageSize);

      const minutesToString = (minutes: number): string => (minutes >= 60 ? Math.floor(minutes / 60) + '時間' : '') + minutes % 60 + '分';
      return {
        itemCount: sorted.length,
        buttonData: [args.stat],
        message: {
          embeds: [
            {
              title: statTypes.member[args.stat]!.name,
              description: displayList.map((user, i) => `**#${(page - 1) * pageSize + i + 1}** <@${user}>: ${statType == 'action' ? list[user] + '回' : minutesToString(list[user])}`).join('\n'),
              color: Colors.DarkGold
            }
          ]
        }
      }
    }
  )
}

export async function changes(interaction: ChatInputCommandInteraction) {
  switch (interaction.options.getSubcommand()) {
    case 'record': {
      const permissions = interaction.member?.permissions;
      if (typeof permissions != 'string' && !permissions?.has(PermissionFlagsBits.ManageGuild)) {
        interaction.reply('設定を変更する権限がありません');
      }

      const value = interaction.options.getBoolean('value', true)
      setData('guild', interaction.guildId!, ['changes', 'record'], value);
      interaction.reply(`推移を記録${value ? 'する' : 'しない'}ように設定しました`);
    }
    break;
    case 'output': {
      const stat = interaction.options.getString('stat', true);
      const start = parseTimeStringToDate(interaction.options.getString('start', true));
      const end = parseTimeStringToDate(interaction.options.getString('end'));
      if (start == null || end == null) {
        interaction.reply('有効な日付ではありません')
        return;
      }
      if (end - start < 1 || end - start >= 2000) {
        interaction.reply('範囲は2日以上2000日以下である必要があります')
        return;
      }

      let data: [string, number][] = [];
      for (let i = start; i <= end; i++) {
        data.push([new Date((i * 24 - 9) * 60 * 60 * 1000).toLocaleDateString("ja-JP"),
          getData('guild', interaction.guildId!, ['changes', 'data', stat, i.toString()]) as number ?? 0])
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
              title: '${changesTypes[stat]?.name ?? stat}',
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
              title: '${changesTypes[stat]?.name ?? stat}',
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
                title: '${changesTypes[stat]?.name ?? stat}(${name})',
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
