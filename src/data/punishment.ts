import { ActionType } from "./stats.js";

export type punishmentActionType =
| 'banned'
| 'kicked'
| 'timedOut'
| 'serverMuted'
| 'serverDeafed'

export const punishmentStatTypes: {
  [key in punishmentActionType]: {name: string}
} = {
  'banned': {name: 'Ban'},
  'kicked': {name: 'キック'},
  'timedOut': {name: 'タイムアウト'},
  'serverMuted': {name: 'サーバーミュート'},
  'serverDeafed': {name: 'サーバースピーカーミュート'},
}
