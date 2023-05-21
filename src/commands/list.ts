import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, ApplicationCommandType, ChannelType, PermissionFlagsBits, SlashCommandChannelOption } from 'discord.js';

import translateLangs from './lists/translate/langs';

import votes from './lists/votes';
import stats from './lists/stats'
import info from './lists/info'

export default [
  ...votes,
  ...stats,
  ...info,
  {
    name: 'translate',
    description: '文章を翻訳する',
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: 'text',
        description: '翻訳する文章',
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'source',
        description: '翻訳元の言語',
        choices: translateLangs,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'target',
        description: '翻訳先の言語',
        choices: translateLangs,
      },
    ]
  },
  {
    name: 'delete-message',
    description: 'メッセージを削除する',
    defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
    options: [
      {
        type: ApplicationCommandOptionType.Integer,
        name: 'count',
        description: '削除するメッセージ数'
      }
    ]
  },
  {
    name: 'forward',
    description: '-',
    defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
    options: [
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'add',
        description: 'メッセージの転送を設定する',
        options: [
          new SlashCommandChannelOption()
          .setName('channel')
          .setDescription('メッセージの転送元チャンネル')
          .setRequired(true)
          .addChannelTypes(
            ChannelType.GuildText,
            ChannelType.GuildVoice,
            ChannelType.GuildAnnouncement,
            ChannelType.GuildStageVoice,
            ChannelType.PublicThread),
          {
            type: ApplicationCommandOptionType.String,
            name: 'webhook',
            description: 'ウェブフックURL',
            required: true,
          },
        ]
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'remove',
        description: 'メッセージの転送を解除する',
        options: [
          {
            type: ApplicationCommandOptionType.Channel,
            name: 'channel',
            description: 'メッセージの転送元チャンネル',
            require: true,
            channelTypes: [
              ChannelType.GuildText,
              ChannelType.GuildVoice,
              ChannelType.GuildAnnouncement,
              ChannelType.GuildStageVoice,
              ChannelType.PublicThread
            ]
          },
          {
            type: ApplicationCommandOptionType.String,
            name: 'webhook',
            description: 'ウェブフックURL',
          },
        ]
      }
    ]
  },
  {
    name: 'keep',
    description: 'サーバーに再参加したときユーザーの情報を保持する',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: 'type',
        description: '保持する種類',
        choices: [
          { name: 'すべて', value: 'all' },
          { name: 'ロール', value: 'role' },
          { name: 'ニックネーム', value: 'nick' },
        ],
        required: true,
      },
      {
        type: ApplicationCommandOptionType.Boolean,
        name: 'value',
        description: '保持する',
        required: true,
      }
    ]
  },
  {
    name: 'timeout',
    description: '時間を指定してタイムアウトする',
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: 'user',
        description: 'タイムアウトするユーザー',
        required: true
      },
      {
        type: ApplicationCommandOptionType.Integer,
        name: 'second',
        description: '秒数'
      },
      {
        type: ApplicationCommandOptionType.Integer,
        name: 'minute',
        description: '分数'
      },
      {
        type: ApplicationCommandOptionType.Integer,
        name: 'hour',
        description: '時間'
      },
      {
        type: ApplicationCommandOptionType.Integer,
        name: 'day',
        description: '日数'
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'specified-date',
        description: '指定日まで(yyyy/MM/dd形式 年は2桁・省略可)'
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'specified-time',
        description: '指定時間まで(HH:mm形式)'
      }
    ]
  },
  {
    name: 'role-panel',
    description: 'ロールパネルを作成する',
    defaultMemberPermissions: PermissionFlagsBits.ManageRoles,
    options: [
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'create',
        description: 'パネルを作成する'
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'add',
        description: 'ロールを追加する'
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'remove',
        description: 'ロールを削除する'
      },
    ]
  },
  {
    name: 'anonymous-panel',
    description: '匿名でメッセージを送信するパネルを作成する',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: [
      {
        name: 'channel',
        description: 'メッセージを送信するチャンネル',
        type: ApplicationCommandOptionType.Channel,
        channelTypes: [
          ChannelType.GuildText,
          ChannelType.GuildVoice,
          ChannelType.GuildAnnouncement,
          ChannelType.GuildStageVoice
        ],
        required: true,
      },
      {
        name: 'default-name',
        description: '匿名で送ったときのデフォルトの名前',
        type: ApplicationCommandOptionType.String
      }
    ]
  },

  {
    type: ApplicationCommandType.Message,
    name: 'ピン留め',
  },
  {
    type: ApplicationCommandType.Message,
    name: 'ピン留め解除',
  },
] as ApplicationCommandDataResolvable[];
