import { ButtonInteraction, ChatInputCommandInteraction, Colors, EmbedBuilder, SnowflakeUtil } from "discord.js";
import { getData, setData } from "discordbot-data";
import { pageEmbed } from "../../utils/page.js";
import { timeToString } from "../../utils/time.js";

export function violation(interaction: ChatInputCommandInteraction) {
  switch (interaction.options.getSubcommand(true)) {
    case 'add': {
      const user = interaction.options.getUser('user', true);
      const details = interaction.options.getString('details', true);
      const punishment = interaction.options.getString('punishment') ?? '';

      let timestamp = Date.now();
      let id = SnowflakeUtil.generate().toString();
      setData('guild', interaction.guildId!, ['violation', 'data'], {user: user.id, details, punishment, timestamp, id}, 'push');

      let info = '';
      info += `**違反内容: **${details}\n`;
      info += `**ユーザー: **${user.toString()}\n`;
      info += `**処罰内容: **${punishment == '' ? 'なし' : punishment}\n`;
      interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setTitle('違反がありました')
          .setDescription(info)
          .setTimestamp(timestamp)
          .setFooter({text: id})
          .setColor('#FF0000')
        ]
      })
    }
    break;
    case 'remove': {
      const id = interaction.options.getString('id');
      
      let history = getData<{id: string}[]>('guild', interaction.guildId!, ['violation', 'data']) ?? [];
      let removedViolation;
      if (id == null) {
        removedViolation = history.pop();
        if (removedViolation == null) {
          interaction.reply({content: '違反が見つかりませんでした', ephemeral: true});
          return;
        }
      } else {
        let index = history.findIndex(i => i.id == id);
        if (index > -1) {
          removedViolation = history[index];
          history.splice(index, 1);
        } else {
          interaction.reply({content: '違反が見つかりませんでした', ephemeral: true});
          return;
        }
      }
      setData('guild', interaction.guildId!, ['violation', 'data'], history);

      let info = '';
      info += `**違反内容: **${removedViolation.details}\n`;
      info += `**ユーザー: **<@${removedViolation.user}>\n`;
      info += `**処罰内容: **${removedViolation.punishment == '' ? 'なし' : removedViolation.punishment}\n`;
      interaction.reply({
        embeds: [
          new EmbedBuilder()
          .setTitle('違反が取り消されました')
          .setDescription(info)
          .setFooter({text: removedViolation.id})
          .setColor(Colors.Green)
        ]
      })
    }
    break;
  }
}

export function history(interaction: ChatInputCommandInteraction | ButtonInteraction, data: string[] = []) {
  pageEmbed<{user: string}>(
    interaction, data, 5, 'violation-history-page',
    interaction => ({user: interaction.options.getUser('user')?.id ?? ''}),
    data => ({user: data[0]}),
    (args, page, pageSize) => {
      let history = getData<{user: string, details: string, punishment: string, timestamp: number, id: string}[]>('guild', interaction.guildId!, ['violation', 'data']) ?? [];
      let filtered = args.user == '' ? history : history.filter(i => i.user == args.user);
      let displayList = filtered.slice(-(page * pageSize), filtered.length - (page - 1) * pageSize).reverse();
      return {
        itemCount: filtered.length,
        buttonData: [args.user],
        message: {
          embeds: [
            {
              title: '違反履歴',
              description: args.user == '' ? '' : `<@${args.user}>\n**違反回数: **${filtered.length}回`, 
              fields: displayList.map(i => {
                let info = '';
                if (args.user == '') info += `**ユーザー: **<@${i.user}>\n`;
                if (i.punishment != '') info += `**処罰内容**: **${i.punishment}\n`;
                info += `**時間: **${timeToString(i.timestamp)}\n`;
                info += `**違反ID: **${i.id}\n`;
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
