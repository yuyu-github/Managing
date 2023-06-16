import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, Client, Colors, GuildMemberManager, Message, PartialMessage } from "discord.js";
import { deleteData, getData, setData } from "discordbot-data";
import { parseTimeString, timeToString } from "../../utils/time.js";
import { schedule } from "../../scheduler/scheduler.js";

export async function lottery(interaction: ChatInputCommandInteraction) {
  const name = interaction.options.getString('name') ?? '抽選';
  const winners = interaction.options.getInteger('winners') ?? 1;
  const qualification = interaction.options.getRole('qualification');
  const maximum = interaction.options.getInteger('maximum');
  const count = interaction.options.getInteger('count') ?? 0;
  const timeStr = interaction.options.getString('time');
  const time = parseTimeString(timeStr);
  if (interaction.channel == null || interaction.guild == null) return;

  let description = '';
  description += `**当選人数:** ${winners}人\n`;
  if (qualification != null) description += `**参加資格:** ${qualification.toString()}\n`;
  if (maximum != null) description += `**参加可能人数:** ${maximum}人\n`;
  if (count > 0) description += `**開始人数:** ${count}人\n`;
  if (time != null) description += `**開始時間:** ${timeToString(time)}(${timeToString(time, 'R')})\n`;

  let message = await interaction.channel.send({
    embeds: [
      {
        title: name,
        description: description,
        color: Colors.Fuchsia,
        fields: [
          {
            name: '参加者',
            value: '**0人**'
          }
        ]
      }
    ],
    components: [
      new ActionRowBuilder<ButtonBuilder>().setComponents(
        new ButtonBuilder()
          .setCustomId('entry-lottery')
          .setLabel('参加')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('start-lottery')
          .setLabel('開始')
          .setStyle(ButtonStyle.Secondary)
      )
    ]
  })
  interaction.reply({content: '抽選を作成しました', ephemeral: true})

  setData('guild', interaction.guild.id, ['lottery', 'list', message.id], {name, winners, qualification: qualification?.id, maximum: maximum, count: count, entries: [], owner: interaction.user.id})
  if (time != null) schedule('start-lottery', {message: [message.channelId, message.id]}, time);
}

export function entry(interaction: ButtonInteraction) {
  if (interaction.guild == null) return;

  let lotteryData = getData('guild', interaction.guild.id, ['lottery', 'list', interaction.message.id]) as {qualification: string | null, maximum: number | null, entries: string[], count: number};
  let entries = lotteryData.entries;

  if (entries.includes(interaction.user.id)) {
    interaction.reply({
      content: 'すでに投票に参加しています',
      components: [
        new ActionRowBuilder<ButtonBuilder>().setComponents(
          new ButtonBuilder()
            .setCustomId('leave-lottery')
            .setLabel('参加をやめる')
            .setStyle(ButtonStyle.Danger),
        )
      ],
      ephemeral: true
    });
    return;
  }

  if (lotteryData.maximum != null && lotteryData.maximum == entries.length) {
    interaction.reply({content: '参加人数上限です', ephemeral: true});
    return;
  }
  if (lotteryData.qualification != null && !(interaction.member?.roles instanceof GuildMemberManager && interaction.member.roles.cache.has(lotteryData.qualification))) {
    interaction.reply({content: '参加資格がありません', ephemeral: true});
    return;
  }

  entries.push(interaction.user.id);
  interaction.update({
    embeds: [
      {
        title: interaction.message.embeds[0].title!,
        description: interaction.message.embeds[0].description!,
        color: interaction.message.embeds[0].color!,
        fields: [
          {
            name: '参加者',
            value: `**${entries.length}人**` + ['', ...entries.slice(0, 10).map(i => `<@${i}>`)].join('\n') + (entries.length > 10 ? '...' : '')
          }
        ]
      }
    ]
  });
  setData('guild', interaction.guild.id, ['lottery', 'list', interaction.message.id, 'entries'], entries);

  if (lotteryData.count > 0 && entries.length >= lotteryData.count) start(interaction.message);
}

export function leave(interaction: ButtonInteraction) {
  if (interaction.channel == null || interaction.guild == null || interaction.message.reference?.messageId == null) return;
  let message = interaction.channel.messages.cache.get(interaction.message.reference.messageId);
  if (message == null) return;

  let lotteryData = getData('guild', interaction.guild.id, ['lottery', 'list', message.id]) as {entries: string[]};
  let entries = lotteryData.entries;

  entries.splice(entries.indexOf(interaction.user.id), 1);
  message.edit({
    embeds: [
      {
        title: message.embeds[0].title!,
        description: message.embeds[0].description!,
        color: message.embeds[0].color!,
        fields: [
          {
            name: '参加者',
            value: `**${entries.length}人**` + ['', ...entries.slice(0, 10).map(i => `<@${i}>`)].join('\n') + (entries.length > 10 ? '...' : '')
          }
        ]
      }
    ],
  });
  setData('guild', interaction.guild.id, ['lottery', 'list', message.id, 'entries'], entries);

  interaction.reply({content: '参加をやめました', ephemeral: true})
}

export function startCommand(interaction: ButtonInteraction) {
  if (interaction.guild == null) return;

  let lotteryData = getData('guild', interaction.guild.id, ['lottery', 'list', interaction.message.id]) as {winners: number, entries: string[], owner: string};
  if (lotteryData.owner != interaction.user.id) {
    interaction.reply({content: '作成者以外は開始できません', ephemeral: true});
    return;
  }

  start(interaction.message, interaction)
}

export function start(message: Message, interaction: ButtonInteraction | null = null) {
  if (message.guild == null) return;

  let lotteryData = getData('guild', message.guild.id, ['lottery', 'list', message.id]) as {winners: number, entries: string[], owner: string};
  let entries = [...lotteryData.entries];

  let winners: string[] = [];
  for (let i = 0; i < lotteryData.winners && entries.length > 0; i++) {
    let index = Math.floor(Math.random() * entries.length);
    winners.push(entries[index]);
    entries.splice(index, 1);
  }

  let resultMsg = winners.length == 0 ? '当選者はいませんでした' : winners.map(i => `<@${i}>`).join(', ') + 'が当選しました';
  if (interaction == null) message.reply(resultMsg);
  else interaction.reply(resultMsg);
  message.edit({
    embeds: [
      {
        title: message.embeds[0].title!,
        color: message.embeds[0].color!,
        fields: [
          {
            name: '当選者',
            value: winners.length == 0 ? 'なし' : winners.map(i => `<@${i}>`).join('\n')
          }
        ]
      }
    ],
    components: []
  })

  deleteData('guild', message.guild.id, ['lottery', 'list', message.id]);
}

export function LotteryDeleteCheck(message: Message | PartialMessage) {
  if (message.guildId == null) return;
  const votes = getData('guild', message.guildId, ['lottery', 'list']) ?? {};
  if (Object.keys(votes)?.includes?.(message.id)) deleteData('guild', message.guildId, ['lottery', 'list', message.id]);
}
