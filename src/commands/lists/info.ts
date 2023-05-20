import { ApplicationCommandOptionType, ChannelType, SlashCommandChannelOption } from "discord.js";

export default [
  {
    name: 'avatar',
    description: 'アイコン画像を取得する',
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: 'user',
        description: 'ユーザー',
        required: true
      }
    ]
  },
  {
    name: 'user-info',
    description: 'ユーザー情報を表示する',
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: 'user',
        description: 'ユーザー',
        required: true
      }
    ]
  },
  {
    name: 'server-info',
    description: 'サーバー情報を表示する'
  },
  {
    name: 'channel-info',
    description: 'チャンネル情報を表示する',
    options: [
      new SlashCommandChannelOption()
      .setName('channel')
      .setDescription('チャンネル')
      .setRequired(true)
      .addChannelTypes(
        ChannelType.GuildText,
        ChannelType.GuildVoice,
        ChannelType.GuildForum,
        ChannelType.GuildAnnouncement,
        ChannelType.GuildStageVoice,
        ChannelType.GuildCategory,
        ChannelType.PublicThread)
    ]
  }
]
