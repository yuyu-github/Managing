import { APIEmbedField, ChannelType, ChatInputCommandInteraction, Client, Colors, EmbedBuilder } from "discord.js";

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
      .setColor(user.accentColor ?? Colors.Aqua)
      .setFields(fields)
    ]
  })
}

export function serverInfo(client: Client, interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (guild == null) return;

  let channelCount = { all: 0, text: 0, voice: 0, forum: 0, announcement: 0, stage: 0 };
  guild.channels.cache.forEach(c => {
    switch (c.type) {
      case ChannelType.GuildText: channelCount.text++; break;
      case ChannelType.GuildVoice: channelCount.voice++; break;
      case ChannelType.GuildForum: channelCount.forum++; break;
      case ChannelType.GuildAnnouncement: channelCount.announcement++; break;
      case ChannelType.GuildStageVoice: channelCount.stage++; break;
      default: return;
    }
    channelCount.all++;
  });
  let channelText = `**${channelCount.all}個**\n`;
  if (channelCount.text > 0) channelText += `テキストチャンネル: ${channelCount.text}個\n`;
  if (channelCount.voice > 0) channelText += `ボイスチャンネル: ${channelCount.voice}個\n`;
  if (channelCount.forum > 0) channelText += `フォーラムチャンネル: ${channelCount.forum}個\n`;
  if (channelCount.announcement > 0) channelText += `アナウンスチャンネル: ${channelCount.announcement}個\n`;
  if (channelCount.stage > 0) channelText += `ステージチャンネル: ${channelCount.stage}個\n`;

  let fields: (APIEmbedField & {cond?: boolean})[] = [
    {
      name: 'サーバー作成日時',
      value: `<t:${Math.floor(guild?.createdTimestamp / 1000)}>\n<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
      inline: true,
    },
    {
      name: 'メンバー数',
      value: guild.memberCount + '人',
      inline: true
    },
    {
      name: 'サーバーブースト',
      value: 'レベル' + guild.premiumTier,
      inline: true,
    },
    {
      name: 'チャンネル',
      value: channelText,
    },
    {
      name: 'ロール',
      value: (guild.roles.cache.size - 1) + '個',
      inline: true,
    },
    {
      name: 'イベント',
      value: guild.scheduledEvents.cache.size + '個',
      inline: true,
    },
    {
      name: '絵文字',
      value: guild.emojis.cache.size + '個',
      inline: true,
    },
    {
      name: 'スタンプ',
      value: guild.stickers.cache.size + '個',
      inline: true,
    },
    {
      name: 'コンテンツフィルター',
      value: 'レベル' + guild.nsfwLevel,
      inline: true
    },
    {
      name: '二要素認証',
      value: guild.mfaLevel == 1 ? '有効' : '無効',
      inline: true,
    },
    {
      name: 'システムチャンネル',
      value: guild.systemChannel?.toString() ?? 'なし',
      inline: true,
    },
    {
      name: 'ルールチャンネル',
      value: guild.rulesChannel?.toString() ?? '',
      inline: true,
      cond: guild.rulesChannel != null
    },
    {
      name: '安全警告チャンネル',
      value: guild.safetyAlertsChannel?.toString() ?? '',
      inline: true,
      cond: guild.safetyAlertsChannel != null
    },
  ];
  fields = fields.filter(f => f.cond == null || f.cond);

  interaction.reply({
    embeds: [
      new EmbedBuilder()
      .setTitle(guild.name)
      .setDescription(guild.description)
      .setThumbnail(guild.iconURL())
      .setFooter({
        text: guild.id
      })
      .setTimestamp()
      .setColor(Colors.Aqua)
      .setFields(fields)
    ]
  })
}
