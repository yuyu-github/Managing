import { getData } from "discordbot-data";
import { pageEmbed } from "../../utils/page.js";
import { SECOND, timeSpanToString, timeToString } from "../../utils/time.js";
import { ButtonInteraction, ChatInputCommandInteraction } from "discord.js";
import { punishmentStatTypes } from "../../data/punishment.js";

export function info(interaction: ChatInputCommandInteraction) {
  switch (interaction.options.getSubcommand()) {
    case 'history': history(interaction); break;
    case 'count': {
      const user = interaction.options.getUser('user') ?? interaction.user;

      const memberStats = getData('guild', interaction.guildId!, ['stats', 'data', 'member']);
      const displayData: [string, number][] = Object.entries(punishmentStatTypes).flatMap(([k, v]) => {
        let count = memberStats?.['action']?.[k]?.[user.id] ?? 0;
        return count != 0 ? [[v.name, count]] : [];
      })

      interaction.reply({
        embeds: [
          {
            author: {
              name: user.username,
              icon_url: user.displayAvatarURL(),
            },
            title: '処罰回数',
            description: `**合計回数: **${displayData.reduce((sum, i) => sum + i[1], 0)}回`,
            fields: displayData.map(i => ({
              name: i[0],
              value: i[1] + '回',
            })),
            color: parseInt('FF0000', 16)
          }
        ]
      })
    }
    break;
  }
}

export function history(interaction: ChatInputCommandInteraction | ButtonInteraction, data: string[] = []) {
  pageEmbed<{user: string}>(
    interaction, data, 5, 'punishment-history-page',
    interaction => ({user: interaction.options.getUser('user')?.id ?? ''}),
    data => ({user: data[0]}),
    (args, page, pageSize) => {
      let history = getData<{user: string, details: string, timestamp: number, reason: string, duration: number}[]>('guild', interaction.guildId!, ['punishment', 'data']) ?? [];
      let filtered = args.user == '' ? history : history.filter(i => i.user == args.user);
      let displayList = filtered.slice(-(page * pageSize), filtered.length - (page - 1) * pageSize).reverse();
      return {
        itemCount: filtered.length,
        buttonData: [args.user],
        message: {
          embeds: [
            {
              title: '処罰履歴',
              description: args.user == '' ? '' : `<@${args.user}>\n**処罰回数: **${filtered.length}回`, 
              fields: displayList.map(i => {
                let info = '';
                if (args.user == '') info += `**ユーザー: **<@${i.user}>\n`;
                info += `**時間: **${timeToString(i.timestamp)}\n`;
                if (i.reason != '') info += `**理由: **${i.reason}\n`;
                if (i.duration >= SECOND) info += `**期間: **${timeSpanToString(i.duration)}\n`;
                return {
                  name: i.details,
                  value: info,
                }
              }),
              color: parseInt('FF0000', 16)
            }
          ]
        }
      }
    }
  )
}
