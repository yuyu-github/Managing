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
]
