import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, Client, Colors, GuildMemberManager } from "discord.js";
import { deleteData, getData, setData } from "discordbot-data";

export async function lottery(client: Client, interaction: ChatInputCommandInteraction) {
  const name = interaction.options.getString('name', true);
  const winners = interaction.options.getInteger('winners') ?? 1;
  const qualification = interaction.options.getRole('qualification');
  const maximum = interaction.options.getInteger('maximum');
  if (interaction.channel == null || interaction.guild == null) return;

  let description = '';
  description += `**当選人数:** ${winners}人\n`;
  if (qualification != null) description += `**参加資格:** ${qualification.toString()}\n`;
  if (maximum != null) description += `**参加可能人数:** ${maximum}人\n`;

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

  setData('guild', interaction.guild.id, ['lottery', 'list', message.id], {name, winners, qualification: qualification?.id, maximum, entries: [], owner: interaction.user.id})
}

export function entry(client: Client, interaction: ButtonInteraction) {
  if (interaction.guild == null) return;

  let lotteryData = getData('guild', interaction.guild.id, ['lottery', 'list', interaction.message.id]) as {qualification: string | null, maximum: number | null, entries: string[]};
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
}

export function leave(client: Client, interaction: ButtonInteraction) {
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

export function start(client: Client, interaction: ButtonInteraction) {
  if (interaction.guild == null) return;

  let lotteryData = getData('guild', interaction.guild.id, ['lottery', 'list', interaction.message.id]) as {winners: number, entries: string[], owner: string};
  let entries = [...lotteryData.entries];
  if (lotteryData.owner != interaction.user.id) {
    interaction.reply({content: '作成者以外は開始できません', ephemeral: true});
    return;
  }

  let winners: string[] = [];
  for (let i = 0; i < lotteryData.winners && entries.length > 0; i++) {
    let index = Math.floor(Math.random() * entries.length);
    winners.push(entries[index]);
    entries.splice(index, 1);
  }

  interaction.reply(winners.length == 0 ? '当選者はいませんでした' : winners.map(i => `<@${i}>`).join(', ') + 'が当選しました')
  interaction.message.edit({
    embeds: [
      {
        title: interaction.message.embeds[0].title!,
        color: interaction.message.embeds[0].color!,
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

  deleteData('guild', interaction.guild.id, ['lottery', 'list', interaction.message.id]);
}
