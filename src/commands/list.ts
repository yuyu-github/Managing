import { Permissions } from 'discord.js';

import translateLangs from './lists/translate/langs';

import votes from './lists/votes';
import memberData from './lists/member_data'

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
  ...memberData,
] as any[];
