import { Permissions } from 'discord.js';

import translateLangs from './lists/translate/langs';

import votes from './lists/votes';
import stats from './lists/stats'

export default [
  ...votes,
  {
    name: 'translate',
    description: '文章を翻訳する',
    options: [
      {
        type: 'STRING',
        name: 'text',
        description: '翻訳する文章',
        required: true,
      },
      {
        type: 'STRING',
        name: 'source',
        description: '翻訳元の言語',
        choices: translateLangs,
      },
      {
        type: 'STRING',
        name: 'target',
        description: '翻訳先の言語',
        choices: translateLangs,
      },
    ]
  },
  {
    type: 'MESSAGE',
    name: 'ピン留め',
  },
  {
    type: 'MESSAGE',
    name: 'ピン留め解除',
  },
  {
    name: 'delete-message',
    description: 'メッセージを削除する',
    defaultMemberPermissions: Permissions.FLAGS.MANAGE_MESSAGES,
    options: [
      {
        type: 'INTEGER',
        name: 'count',
        description: '削除するメッセージ数'
      }
    ]
  },
  ...stats,
  {
    name: 'forward',
    description: '-',
    defaultMemberPermissions: Permissions.FLAGS.MANAGE_MESSAGES,
    options: [
      {
        type: 'SUB_COMMAND',
        name: 'add',
        description: 'メッセージの転送を設定する',
        options: [
          {
            type: 'CHANNEL',
            name: 'channel',
            description: 'メッセージの転送元チャンネル',
            required: true,
          },
          {
            type: 'STRING',
            name: 'webhook',
            description: 'ウェブフックURL',
            required: true,
          },
        ]
      },
      {
        type: 'SUB_COMMAND',
        name: 'remove',
        description: 'メッセージの転送を解除する',
        options: [
          {
            type: 'CHANNEL',
            name: 'channel',
            description: 'メッセージの転送元チャンネル',
            required: true,
          },
          {
            type: 'STRING',
            name: 'webhook',
            description: 'ウェブフックURL',
          },
        ]
      }
    ]
  }
] as any[];
