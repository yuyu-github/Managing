module.exports = {
  'normal': (client, vote, reaction, user, rCount, rMemberCount) => vote.count != 0 && rMemberCount >= vote.count,
  'rolevote': (client, vote, reaction, user, rCount, rMemberCount) => rMemberCount >= vote.count,
  'kickvote': (client, vote, reaction, user, rCount, rMemberCount) => rMemberCount >= vote.count,
  'banvote': (client, vote, reaction, user, rCount, rMemberCount) => rMemberCount >= vote.count,
  'unbanvote': (client, vote, reaction, user, rCount, rMemberCount) => rMemberCount >= vote.count,
};
