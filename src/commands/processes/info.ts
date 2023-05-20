import { APIEmbedField, ChatInputCommandInteraction, Client, EmbedBuilder } from "discord.js";

export function avatar(client: Client, interaction: ChatInputCommandInteraction) {
  const user = interaction.options.getUser('user', true);
  interaction.reply({
    files: [
      user.displayAvatarURL()
    ]
  });
}

export function userInfo(client: Client, interaction: ChatInputCommandInteraction) {
  const user = interaction.options.getUser('user', true);
  const member = interaction.guild?.members.resolve(user);

  let fields: (APIEmbedField & {cond?: boolean})[] = [
    {
      name: 'アカウント作成日時',
      value: `<t:${Math.floor(user.createdTimestamp / 1000)}>\n<t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
      inline: true,
    },
    {
      name: 'サーバー参加日時',
      value: `<t:${Math.floor((member?.joinedTimestamp ?? 0) / 1000)}>\n<t:${Math.floor((member?.joinedTimestamp ?? 0) / 1000)}:R>`,
      inline: true,
      cond: member != null
    },
    {
      name: 'Bot',
      value: user.bot ? 'はい' : 'いいえ',
      cond: user.bot
    }
  ];
  fields = fields.filter(f => f.cond == null || f.cond);

  interaction.reply({
    embeds: [
      new EmbedBuilder()
      .setAuthor({
        name: member?.nickname == null ? user.username: `${member.nickname} (${user.username})`,
        iconURL: user.displayAvatarURL(),
      })
      .setTitle(user.tag)
      .setThumbnail(user.displayAvatarURL())
      .setFooter({
        text: user.id
      })
      .setTimestamp()
      .setColor(user.accentColor ?? null)
      .setFields(fields)
    ]
  })
}
