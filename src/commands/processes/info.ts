import { APIEmbedField, CategoryChannel, ChannelType, ChatInputCommandInteraction, Client, Colors, EmbedBuilder, ForumChannel, NewsChannel, PublicThreadChannel, StageChannel, TextChannel, VoiceChannel } from "discord.js";

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

export async function channelInfo(client: Client, interaction: ChatInputCommandInteraction) {
  const channel = interaction.options.getChannel('channel', true) as TextChannel | VoiceChannel | ForumChannel | NewsChannel | StageChannel | CategoryChannel | PublicThreadChannel;

  let type = '';
  switch (channel.type) {
    case ChannelType.GuildText: type = 'テキストチャンネル'; break;
    case ChannelType.GuildVoice: type = 'ボイスチャンネル'; break;
    case ChannelType.GuildForum: type = 'フォーラムチャンネル'; break;
    case ChannelType.GuildAnnouncement: type = 'アナウンスチャンネル'; break;
    case ChannelType.GuildStageVoice: type = 'ステージチャンネル'; break;
    case ChannelType.GuildCategory: type = 'カテゴリ'; break;
    case ChannelType.PublicThread: type = 'スレッド'; break;
  }

  let fields: (APIEmbedField & {cond?: boolean})[] = [
    {
      name: '種類',
      value: type,
      inline: true,
    },
    {
      name: 'チャンネル作成日時',
      value: `<t:${Math.floor((channel.createdTimestamp ?? 0) / 1000)}>\n<t:${Math.floor((channel.createdTimestamp ?? 0) / 1000)}:R>`,
      inline: true,
    }
  ];
  if (channel.type == ChannelType.GuildText || channel.type == ChannelType.GuildVoice || channel.type == ChannelType.GuildForum || channel.type == ChannelType.GuildAnnouncement || channel.type == ChannelType.GuildStageVoice) {
    fields.push(...[
      {
        name: 'カテゴリ',
        value: channel.parent?.name ?? '',
        inline: true,
        cond: channel.parent != null
      },
      {
        name: '年齢制限',
        value: channel.nsfw ? '有効' : '無効',
        inline: true, 
      },
      {
        name: '低速モード',
        value: channel.rateLimitPerUser + '秒',
        inline: true, 
      }
    ])
  }
  if (channel.type == ChannelType.GuildText || channel.type == ChannelType.GuildAnnouncement) {
    fields.push(...[
      {
        name: 'スレッド',
        value: channel.threads.cache.size + '件',
        inline: true,
      }
    ]);
  }
  if (channel.type == ChannelType.GuildForum) {
    fields.push(...[
      {
        name: '投稿',
        value: channel.threads.cache.size + '件',
        inline: true,
      }
    ]);
  }
  if (channel.type == ChannelType.GuildVoice || channel.type == ChannelType.GuildStageVoice) {
    fields.push(...[
      {
        name: '人数制限',
        value: channel.userLimit == 0 ? 'なし' : channel.userLimit + '人',
        inline: true, 
      },
      {
        name: 'ビットレート',
        value: channel.bitrate + 'kbps',
        inline: true, 
      },
      {
        name: 'ビデオ画質',
        value: channel.videoQualityMode == 1 ? '自動' : '720p',
        inline: true, 
      }
    ]);
  }
  if (channel.type == ChannelType.GuildCategory) {
    fields.push(...[
      {
        name: 'チャンネル',
        value: channel.children.cache.map(i => i.toString()).join('\n')
      }
    ])
  }
  if (channel.type == ChannelType.PublicThread) {
    fields.push(...[
      {
        name: 'チャンネル',
        value: channel.parent?.toString() ?? '',
        inline: true,
        cond: channel.parent != null
      },
      {
        name: '作成者',
        value: (await channel.fetchOwner())?.user?.toString() ?? '',
        inline: true
      },
      {
        name: 'メンバー',
        value: channel.members.cache.size + '人',
        inline: true,
      },
      {
        name: 'メッセージ数',
        value: channel.totalMessageSent + '件',
        inline: true
      },
      {
        name: '低速モード',
        value: channel.rateLimitPerUser + '秒',
        inline: true, 
      },
      {
        name: 'アーカイブ',
        value: channel.archived ? 'はい' : 'いいえ',
        inline: true, 
      },
      {
        name: 'ロック',
        value: channel.locked ? 'はい' : 'いいえ',
        inline: true, 
      }
    ])
  }
  fields = fields.filter(f => f.cond == null || f.cond);

  interaction.reply({
    embeds: [
      new EmbedBuilder()
      .setURL(channel.url)
      .setTitle('#' + channel.name)
      .setDescription('topic' in channel ? channel.topic : null)
      .setFooter({
        text: channel.id
      })
      .setTimestamp()
      .setColor(Colors.Aqua)
      .setFields(fields)
    ]
  })
}
