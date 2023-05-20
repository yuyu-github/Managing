import { ApplicationCommandOptionType } from "discord.js";

export default [
  {
    name: 'avatar',
    description: 'アイコン画像を取得する',
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: 'user',
        description: 'ユーザー',
        required: true
      }
    ]
  },
  {
    name: 'user-info',
    description: 'ユーザー情報を表示する',
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: 'user',
        description: 'ユーザー',
        required: true
      }
    ]
  },
  {
    name: 'server-info',
    description: 'サーバー情報を表示する'
  }
]
