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
  }
];
