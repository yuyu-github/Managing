import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, ApplicationCommandType, ChannelType, PermissionFlagsBits, SlashCommandChannelOption } from 'discord.js';

import { langs } from '../data/translate.js';

import votes from './lists/votes.js';
import stats from './lists/stats.js'
import info from './lists/info.js'

export default [
  ...votes,
  ...stats,
  ...info,
  {
    name: 'help',
    description: 'ヘルプを表示する'
  },
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
        choices: langs,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'target',
        description: '翻訳先の言語',
        choices: langs,
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
          {
            type: ApplicationCommandOptionType.Channel,
            name: 'channel',
            description: 'メッセージの転送元チャンネル',
            required: true,
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
            required: true,
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
    defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: 'user',
        description: 'タイムアウトするユーザー',
        required: true
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'time',
        description: '時間',
        required: true
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'reason',
        description: '理由',
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
    name: 'lottery',
    description: '抽選を作成する',
    options: [
      {
        name: 'name',
        description: '抽選の名前',
        type: ApplicationCommandOptionType.String,
      },
      {
        name: 'winners',
        description: '当選人数',
        type: ApplicationCommandOptionType.Integer,
        minValue: 1
      },
      {
        name: 'qualification',
        description: '抽選に参加する資格',
        type: ApplicationCommandOptionType.Role
      },
      {
        name: 'maximum',
        description: '最大参加人数',
        type: ApplicationCommandOptionType.Integer,
        minValue: 1
      },
      {
        name: 'count',
        description: '抽選開始する人数',
        type: ApplicationCommandOptionType.Integer
      },
      {
        name: 'time',
        description: '抽選開始する時間',
        type: ApplicationCommandOptionType.String
      }
    ]
  },
  {
    name: 'timer',
    description: 'タイマーを設定する',
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: 'time',
        description: '時間',
        required: true
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'message',
        description: 'メッセージ'
      },
    ]
  },
  {
    name: 'stopwatch',
    description: 'ストップウォッチで時間を計る',
    options: [
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'start',
        description: 'ストップウォッチを開始/再開する'
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'stop',
        description: 'ストップウォッチを開始する'
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'pause',
        description: 'ストップウォッチを一時停止する'
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'now',
        description: '現在のストップウォッチの時間を表示する'
      }
    ]
  },
  {
    name: 'join-message',
    description: '参加メッセージを設定する',
    defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
    options: [
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'set',
        description: '参加メッセージを設定する',
        options: [
          {
            type: ApplicationCommandOptionType.String,
            name: 'message',
            description: '送信するメッセージ',
            required: true
          },
          {
            type: ApplicationCommandOptionType.Channel,
            name: 'channel',
            description: 'メッセージを送信するチャンネル',
            channelTypes: [
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement
            ]
          }
        ]
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'unset',
        description: '参加メッセージの設定を解除する'
      }
    ]
  },
  {
    name: 'leave-message',
    description: '退出メッセージを設定する',
    defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
    options: [
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'set',
        description: '退出メッセージを設定する',
        options: [
          {
            type: ApplicationCommandOptionType.String,
            name: 'message',
            description: '送信するメッセージ',
            required: true
          },
          {
            type: ApplicationCommandOptionType.Channel,
            name: 'channel',
            description: 'メッセージを送信するチャンネル',
            channelTypes: [
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement
            ]
          }
        ]
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'unset',
        description: '脱退メッセージの設定を解除する'
      }
    ]
  },
  {
    name: 'violation',
    description: '違反を記録する',
    defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
    options: [
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'add',
        description: '違反を記録する',
        options: [
          {
            type: ApplicationCommandOptionType.User,
            name: 'user',
            description: '違反したユーザー',
            required: true,
          },
          {
            type: ApplicationCommandOptionType.String,
            name: 'details',
            description: '違反内容',
            required: true,
          },
          {
            type: ApplicationCommandOptionType.String,
            name: 'punishment',
            description: '処罰内容'
          }
        ]
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'remove',
        description: '違反を取り消す',
        options: [
          {
            type: ApplicationCommandOptionType.String,
            name: 'id',
            description: '違反ID'
          }
        ]
      }
    ]
  },
  {
    name: 'violation-history',
    description: '違反履歴を表示',
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: 'user',
        description: '表示するユーザー'
      }
    ]
  },
  {
    name: 'punishment-info',
    description: '処罰情報を表示',
    options: [
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'history',
        description: '処罰履歴を表示',
        options: [
          {
            type: ApplicationCommandOptionType.User,
            name: 'user',
            description: '表示するユーザー'
          }
        ]
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'count',
        description: '処罰回数を表示',
        options: [
          {
            type: ApplicationCommandOptionType.User,
            name: 'user',
            description: '表示するユーザー',
            required: true,
          }
        ]
      }
    ]
  },

  {
    type: ApplicationCommandType.Message,
    name: 'ピン留め',
    defaultMemberPermissions: PermissionFlagsBits.ManageMessages
  },
  {
    type: ApplicationCommandType.Message,
    name: 'ピン留め解除',
    defaultMemberPermissions: PermissionFlagsBits.ManageMessages
  },
] as ApplicationCommandDataResolvable[];
