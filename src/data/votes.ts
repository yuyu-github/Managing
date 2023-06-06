export type VoteType = 'normal' | 'role-vote' | 'kick-vote' | 'ban-vote' | 'unban-vote';

export const voteTypeData: {[key in VoteType]: {name: string}} = {
  'normal': {name: '投票'},
  'role-vote': {name: 'ロール投票'},
  'kick-vote': {name: 'キック投票'},
  'ban-vote': {name: 'BAN投票'},
  'unban-vote': {name: 'BAN解除投票'},
}
