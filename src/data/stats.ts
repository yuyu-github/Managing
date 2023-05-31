export type ActionType = 
| 'sendMessage'
| 'reply'
| 'replied'
| 'sendImage'
| 'sendFile'
| 'sendEmoji'
| 'sendSticker'
| 'deleteMessage'
| 'editMessage'
| 'addReaction'
| 'getReaction'
| 'mention'
| 'mentioned'
| 'joinVoiceChannel'
| 'joinStageChannel'
| 'leftVoiceChannel'
| 'leftStageChannel'
| 'startStreaming'
| 'endStreaming'
| 'changeNickname'
| 'useCommand'
| 'useContextMenu'
| 'holdEvent'
| 'participateEvent'
export type MeasuringTimeType = 
| 'inVoiceChannel'
| 'inStageChannel'
| 'streaming'

export const statTypes: {
  [key in 'member' | 'server']: {
    [key in ActionType | MeasuringTimeType]?: {type: 'action' | 'time', name: string}
  }
} = {
  member: {
    sendMessage: {type: 'action', name: 'メッセージを送った回数'},
    reply: {type: 'action', name: '返信した回数'},
    replied: {type: 'action', name: '返信された回数'},
    sendImage: {type: 'action', name: '画像を送った回数'},
    sendFile: {type: 'action', name: 'ファイルを送った回数'},
    sendEmoji: {type: 'action', name: '絵文字を送った回数'},
    sendSticker: {type: 'action', name: 'スタンプを送った回数'},
    deleteMessage: {type: 'action', name: 'メッセージを削除した回数'},
    editMessage: {type: 'action', name: 'メッセージを編集した回数'},
    mention: {type: 'action', name: 'メンションした回数'},
    mentioned: {type: 'action', name: 'メンションされた回数'},
    addReaction: {type: 'action', name: 'リアクションをした回数'},
    getReaction: {type: 'action', name: 'リアクションされた回数'},
    joinVoiceChannel: {type: 'action', name: 'VCに入った回数'},
    inVoiceChannel: {type: 'time', name: 'VCに入っていた時間'},
    joinStageChannel: {type: 'action', name: 'ステージチャンネルに入った回数'},
    inStageChannel: {type: 'time', name: 'ステージチャンネルに入っていた時間'},
    startStreaming: {type: 'action', name: '配信をした回数'},
    streaming: {type: 'time', name: '配信をしていた時間'},
    changeNickname: {type: 'action', name: 'ニックネームを変更した回数'},
    useCommand: {type: 'action', name: 'コマンドを使った回数'},
    useContextMenu: {type: 'action', name: 'コンテキストメニューを使った回数'},
    participateEvent: {type: 'action', name: 'イベントに参加した回数'},
  },
  server: {
    sendMessage: {type: 'action', name: 'メッセージが送られた回数'},
    sendImage: {type: 'action', name: '画像が送られた回数'},
    sendFile: {type: 'action', name: 'ファイルが送られた回数'},
    sendEmoji: {type: 'action', name: '絵文字が送られた回数'},
    sendSticker: {type: 'action', name: 'スタンプが送られた回数'},
    mention: {type: 'action', name: 'メンションが行われた回数'},
    addReaction: {type: 'action', name: 'リアクションが行われた回数'},
    joinVoiceChannel: {type: 'action', name: 'VCに入ってきた回数'},
    inVoiceChannel: {type: 'time', name: 'VCに入っていた時間'},
    joinStageChannel: {type: 'action', name: 'ステージチャンネルに入ってきた回数'},
    inStageChannel: {type: 'time', name: 'ステージチャンネルに入っていた時間'},
    startStreaming: {type: 'action', name: '配信が行われた回数'},
    streaming: {type: 'time', name: '配信をしていた時間'},
    useCommand: {type: 'action', name: 'コマンドが使われた回数'},
    useContextMenu: {type: 'action', name: 'コンテキストメニューが使われた回数'},
    holdEvent: {type: 'action', name: 'イベントを開催した回数'},
  }
}

export const changesTypes: {
  [key in ActionType | MeasuringTimeType]?: {name: string}
} =  {
  'sendMessage': {name: 'メッセージを送った回数'},
  'addReaction': {name: 'リアクションをした回数'},
  'joinVoiceChannel': {name: 'VCに入った回数'},
  'inVoiceChannel': {name: 'VCに入っていた時間'},
}
