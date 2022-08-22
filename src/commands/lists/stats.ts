export default [
  {
    name: 'stats',
    description: '統計を表示します',
  },
  {
    name: 'member-stats',
    description: 'メンバーの統計を表示します',
    options: [
      {
        type: 'USER',
        name: 'user',
        description: '表示するユーザー',
      }
    ]
  },
  {
    name: 'changes',
    description: '-',
    options: [
      {
        type: 'SUB_COMMAND',
        name: 'record',
        description: '推移を記録するか設定する',
        options: [
          {
            type: 'BOOLEAN',
            name: 'value',
            description: '推移を記録する',
            required: true,
          }
        ]
      }
    ]
  }
]
