module.exports = {
  'rolevote': (client, vote, reaction, user, reactionCount) => reactionCount >= vote.count,
  'kickvote': (client, vote, reaction, user, reactionCount) => reactionCount >= vote.count,
  'banvote': (client, vote, reaction, user, reactionCount) => reactionCount >= vote.count,
  'unbanvote': (client, vote, reaction, user, reactionCount) => reactionCount >= vote.count,
};
