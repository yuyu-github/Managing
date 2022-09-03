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
      },
      {
        type: 'SUB_COMMAND',
        name: 'output',
        description: '推移を出力する',
        options: [
          {
            type: 'STRING',
            name: 'type',
            description: '出力タイプ',
            required: true,
            choices: [
              { name: '折れ線グラフ', value: 'line-graph' },
              { name: '棒グラフ', value: 'bar-graph' },
              { name: 'カレンダー', value: 'calendar' },
              { name: 'CSV', value: 'csv' },
              { name: 'JSON', value: 'json' },
            ],
          }, 
          {
            type: 'STRING',
            name: 'stat',
            description: '出力する統計',
            required: true,
            choices: [
              { name: 'メッセージを送った回数', value: 'sendMessage' },
              { name: 'リアクションをした回数', value: 'addReaction' },
              { name: 'ボイスチャンネルに入った回数', value: 'joinVoiceChannel' },
              { name: 'ボイスチャンネルに入っていた時間', value: 'inVoiceChannel' },
            ]
          }, 
          {
            type: 'STRING',
            name: 'start',
            description: '開始日',
            required: true,
          },
          {
            type: 'STRING',
            name: 'end',
            description: '終了日',
          },
        ]
      }
    ]
  }
]
