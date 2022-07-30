module.exports = [
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
    name: 'banvote',
    description: 'BANするか投票をとる',
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
    name: 'unbanvote',
    description: 'BAN解除するか投票をとる',
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
];
