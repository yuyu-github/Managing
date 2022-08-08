export default {
  'normal': (client, vote: { count: number }, reaction, user, rCount, rMemberCount: number) => vote.count != 0 && rMemberCount >= vote.count,
  'rolevote': (client, vote: { count: number }, reaction, user, rCount, rMemberCount: number) => rMemberCount >= vote.count,
  'kickvote': (client, vote: { count: number }, reaction, user, rCount, rMemberCount: number) => rMemberCount >= vote.count,
  'banvote': (client, vote: { count: number }, reaction, user, rCount, rMemberCount: number) => rMemberCount >= vote.count,
  'unbanvote': (client, vote: { count: number }, reaction, user, rCount, rMemberCount: number) => rMemberCount >= vote.count,
};
