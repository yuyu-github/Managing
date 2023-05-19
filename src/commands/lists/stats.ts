import { ApplicationCommandOptionType } from "discord.js";

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
        type: ApplicationCommandOptionType.User,
        name: 'member',
        description: '表示するメンバー',
      }
    ]
  },
  {
    name: 'changes',
    description: '-',
    options: [
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'record',
        description: '推移を記録するか設定する',
        options: [
          {
            type: ApplicationCommandOptionType.Boolean,
            name: 'value',
            description: '推移を記録する',
            required: true,
          }
        ]
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'output',
        description: '推移を出力する',
        options: [
          {
            type: ApplicationCommandOptionType.String,
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
            type: ApplicationCommandOptionType.String,
            name: 'stat',
            description: '出力する統計',
            required: true,
            choices: [
              { name: 'メッセージを送った回数', value: 'sendMessage' },
              { name: 'リアクションをした回数', value: 'addReaction' },
              { name: 'VCに入った回数', value: 'joinVoiceChannel' },
              { name: 'VCに入っていた時間', value: 'inVoiceChannel' },
            ]
          }, 
          {
            type: ApplicationCommandOptionType.String,
            name: 'start',
            description: '開始日',
            required: true,
          },
          {
            type: ApplicationCommandOptionType.String,
            name: 'end',
            description: '終了日',
          },
          {
            type: ApplicationCommandOptionType.String,
            name: 'comp-id-1',
            description: '比較ID',
          },
          {
            type: ApplicationCommandOptionType.String,
            name: 'comp-id-2',
            description: '比較ID',
          },
          {
            type: ApplicationCommandOptionType.String,
            name: 'comp-id-3',
            description: '比較ID',
          },
        ]
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: 'generate-comp-id',
        description: '比較IDを生成',
      }
    ]
  }
]
