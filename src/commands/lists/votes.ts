import { ApplicationCommandDataResolvable, ApplicationCommandOptionType, ApplicationCommandType, PermissionFlagsBits } from 'discord.js';

import { voteTypeData } from '../../data/votes.js';

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
        type: ApplicationCommandOptionType.String,
        name: 'time',
        description: '投票終了する時間'
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
        description: '投票終了する人数'
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'time',
        description: '投票終了する時間'
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
        description: '投票終了する人数'
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'time',
        description: '投票終了する時間'
      },
    ]
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
        description: '投票終了する人数'
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'time',
        description: '投票終了する時間'
      },
    ]
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
        description: '投票終了する人数'
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'time',
        description: '投票終了する時間'
      },
    ]
  },
] as ApplicationCommandDataResolvable[];
