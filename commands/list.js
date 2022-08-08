const { Permissions } = require('discord.js');

module.exports = [
  {
    name: 'vote',
    description: '投票を作成',
    options: [
      {
        type: 'STRING',
        name: 'name',
        description: '投票の名前',
        required: true,
      },
      {
        type: 'BOOLEAN',
        name: 'multiple',
        description: '複数投票可能にする'
      },
      {
        type: 'INTEGER',
        name: 'count',
        description: '投票終了する人数'
      },
      {
        type: 'MENTIONABLE',
        name: 'mention1',
        description: 'メンション'
      },
      {
        type: 'MENTIONABLE',
        name: 'mention2',
        description: 'メンション'
      },
      ...require('./vote/choices_options'),
    ]
  },
  {
    type: 'MESSAGE',
    name: '投票集計',
  },
  {
    type: 'MESSAGE',
    name: '投票終了',
  },
  {
    name: 'rolevote',
    description: 'ロールを付与/削除するか投票をとる',
    options: [
      {
        type: 'USER',
        name: 'user',
        description: '投票をとるユーザー',
        required: true,
      },
      {
        type: 'ROLE',
        name: 'role',
        description: '投票をとるロール',
        required: true,
      },
      {
        type: 'INTEGER',
        name: 'count',
        description: '投票終了する人数',
      },
    ]
  },
  {
    name: 'kickvote',
    description: 'キックするか投票をとる',
    defaultMemberPermissions: Permissions.FLAGS.KICK_MEMBERS,
    options: [
      {
        type: 'USER',
        name: 'user',
        description: '投票をとるユーザー',
        required: true,
      },
      {
        type: 'INTEGER',
        name: 'count',
        description: '投票終了する人数',
      },
    ]
  },
  {
    type: 'USER',
    name: 'キック投票',
    defaultMemberPermissions: Permissions.FLAGS.KICK_MEMBERS,
  },
  {
    name: 'banvote',
    description: 'BANするか投票をとる',
    defaultMemberPermissions: Permissions.FLAGS.BAN_MEMBERS,
    options: [
      {
        type: 'USER',
        name: 'user',
        description: '投票をとるユーザー',
        required: true,
      },
      {
        type: 'INTEGER',
        name: 'count',
        description: '投票終了する人数',
      },
    ]
  },
  {
    type: 'USER',
    name: 'BAN投票',
    defaultMemberPermissions: Permissions.FLAGS.BAN_MEMBERS,
  },
  {
    name: 'unbanvote',
    description: 'BAN解除するか投票をとる',
    defaultMemberPermissions: Permissions.FLAGS.BAN_MEMBERS,
    options: [
      {
        type: 'STRING',
        name: 'user',
        description: '投票をとるユーザーのタグ',
        required: true,
      },
      {
        type: 'INTEGER',
        name: 'count',
        description: '投票終了する人数',
      },
    ]
  },
  {
    type: 'USER',
    name: 'BAN解除投票',
    defaultMemberPermissions: Permissions.FLAGS.BAN_MEMBERS,
  },
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
        choices: require('./translate/langs'),
      },
      {
        type: 'STRING',
        name: 'target',
        description: '翻訳先の言語',
        choices: require('./translate/langs'),
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
];
