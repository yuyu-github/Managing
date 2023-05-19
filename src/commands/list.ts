import { ApplicationCommandOptionType, ApplicationCommandType, PermissionFlagsBits } from 'discord.js';

import translateLangs from './lists/translate/langs';

import votes from './lists/votes';
import stats from './lists/stats'

export default [
  ...votes,
  ...stats,
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
    type: ApplicationCommandType.Message,
    name: 'ピン留め',
  },
  {
    type: ApplicationCommandType.Message,
    name: 'ピン留め解除',
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
          },
          {
            type: ApplicationCommandOptionType.String,
            name: 'webhook',
            description: 'ウェブフックURL',
          },
        ]
      }
    ]
  }
] as any[];
