import { Permissions } from 'discord.js';

import voteChoicesOptions from './vote/choices_options';
import voteType from './vote-setting/vote_type';

export default [
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
      ...voteChoicesOptions,
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
    description: 'ロールを付与/剥奪するか投票をとる',
    defaultMemberPermission: Permissions.FLAGS.MANAGE_ROLES,
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
        type: 'STRING',
        name: 'content',
        description: '投票内容',
        choices: [
          { name: '付与', value: 'add' },
          { name: '剥奪', value: 'remove' },
          { name: '付与/剥奪', value: 'addremove' },
        ]
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
    name: 'vote-setting',
    description: '-',
    defaultMemberPermissions: Permissions.FLAGS.MANAGE_GUILD,
    options: [
      {
        type: 'SUB_COMMAND',
        name: 'min-count',
        description: '最低投票終了人数を設定する',
        options: [
          {
            type: 'STRING',
            name: 'type',
            description: '設定する投票の種類',
            required: true,
            choices: voteType,
          },
          {
            type: 'INTEGER',
            name: 'value',
            description: '設定する人数',
            required: true,
          }
        ]
      },
      {
        type: 'SUB_COMMAND',
        name: 'same-role',
        description: '同じロールの投票を可能にするか設定する',
        options: [
          {
            type: 'STRING',
            name: 'type',
            description: '設定する投票の種類',
            required: true,
            choices: voteType.filter(i => i.value != 'unban-vote'),
          },
          {
            type: 'BOOLEAN',
            name: 'value',
            description: '可能にする',
            required: true,
          }
        ]
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
  }
]
