import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, ApplicationCommandType, PermissionFlagsBits } from 'discord.js';

import voteType from './vote-setting/vote_type.js';

export default [
  {
    name: 'vote',
    description: '投票を作成',
    options: [
      {
        type: ApplicationCommandOptionType.Boolean,
        name: 'multiple',
        description: '複数投票可能にする'
      },
      {
        type: ApplicationCommandOptionType.Integer,
        name: 'count',
        description: '投票終了する人数'
      },
      {
        type: ApplicationCommandOptionType.Mentionable,
        name: 'mention1',
        description: 'メンション'
      },
      {
        type: ApplicationCommandOptionType.Mentionable,
        name: 'mention2',
        description: 'メンション'
      },
      {
        type: ApplicationCommandOptionType.Mentionable,
        name: 'mention3',
        description: 'メンション'
      },
      {
        type: ApplicationCommandOptionType.Mentionable,
        name: 'mention4',
        description: 'メンション'
      }
    ]
  },
  {
    name: 'rolevote',
    description: 'ロールを付与/剥奪するか投票をとる',
    defaultMemberPermission: PermissionFlagsBits.ManageRoles,
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: 'user',
        description: '投票をとるユーザー',
        required: true,
      },
      {
        type: ApplicationCommandOptionType.Role,
        name: 'role',
        description: '投票をとるロール',
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'content',
        description: '投票内容',
        choices: [
          { name: '付与', value: 'add' },
          { name: '剥奪', value: 'remove' },
          { name: '付与/剥奪', value: 'addremove' },
        ]
      },
      {
        type: ApplicationCommandOptionType.Integer,
        name: 'count',
        description: '投票終了する人数',
        required: true
      },
    ]
  },
  {
    name: 'kickvote',
    description: 'キックするか投票をとる',
    defaultMemberPermissions: PermissionFlagsBits.KickMembers,
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: 'user',
        description: '投票をとるユーザー',
        required: true,
      },
      {
        type: ApplicationCommandOptionType.Integer,
        name: 'count',
        description: '投票終了する人数',
        required: true
      },
    ]
  },
  {
    type: ApplicationCommandType.User,
    name: 'キック投票',
    defaultMemberPermissions: PermissionFlagsBits.KickMembers,
  },
  {
    name: 'banvote',
    description: 'BANするか投票をとる',
    defaultMemberPermissions: PermissionFlagsBits.BanMembers,
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: 'user',
        description: '投票をとるユーザー',
        required: true,
      },
      {
        type: ApplicationCommandOptionType.Integer,
        name: 'count',
        description: '投票終了する人数',
        required: true
      },
    ]
  },
  {
    type: ApplicationCommandType.User,
    name: 'BAN投票',
    defaultMemberPermissions: PermissionFlagsBits.BanMembers,
  },
  {
    name: 'unbanvote',
    description: 'BAN解除するか投票をとる',
    defaultMemberPermissions: PermissionFlagsBits.BanMembers,
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: 'user',
        description: '投票をとるユーザーのタグまたはID',
        required: true,
      },
      {
        type: ApplicationCommandOptionType.Integer,
        name: 'count',
        description: '投票終了する人数',
        required: true
      },
    ]
  },
  {
    name: 'vote-setting',
    description: '-',
    defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
    options: [
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'min-count',
        description: '最低投票終了人数を設定する',
        options: [
          {
            type: ApplicationCommandOptionType.String,
            name: 'type',
            description: '設定する投票の種類',
            required: true,
            choices: voteType,
          },
          {
            type: ApplicationCommandOptionType.Integer,
            name: 'value',
            description: '設定する人数',
            required: true,
          }
        ]
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'same-role',
        description: '同じロールの投票を可能にするか設定する',
        options: [
          {
            type: ApplicationCommandOptionType.String,
            name: 'type',
            description: '設定する投票の種類',
            required: true,
            choices: voteType.filter(i => i.value != 'unban-vote'),
          },
          {
            type: ApplicationCommandOptionType.Boolean,
            name: 'value',
            description: '可能にする',
            required: true,
          }
        ]
      },
    ]
  },
] as ApplicationCommandDataResolvable[];
