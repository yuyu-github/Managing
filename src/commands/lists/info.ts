import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, ApplicationCommandType, ChannelType, SlashCommandChannelOption, SlashCommandRoleOption } from "discord.js";

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
      {
        type: ApplicationCommandOptionType.Channel,
        name: 'channel',
        description: 'チャンネル',
        required: true,
        channelTypes: [
          ChannelType.GuildText,
          ChannelType.GuildVoice,
          ChannelType.GuildForum,
          ChannelType.GuildAnnouncement,
          ChannelType.GuildStageVoice,
          ChannelType.GuildCategory,
          ChannelType.PublicThread
        ]
      }
    ]
  },
  {
    name: 'role-info',
    description: 'ロール情報を表示する',
    options: [
      {
        type: ApplicationCommandOptionType.Role,
        name: 'role',
        description: 'ロール',
        required: true,
        
      }
    ]
  },

  {
    type: ApplicationCommandType.User,
    name: '情報'
  }
] as ApplicationCommandDataResolvable[];
