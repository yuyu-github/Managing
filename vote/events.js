const { setData, getData, deleteData } = require('../data');

const onReactionAddFn = require('./funcs/onReactionAdd');
const endFn = require('./funcs/end');

exports.onReactionAdd = async (client, reaction, user) => {
  const votes = getData(reaction.message.guildId, ['votes', reaction.message.channelId]) ?? {};
  if (Object.keys(votes)?.includes?.(reaction.message.id)) {
    const vote = votes[reaction.message.id];

    if (user.id == client.user.id) return;

    if (user.bot || user.id == vote.user) {
      reaction.users.remove(user);
      return;
    }
    if (!vote.choices.map(v => v[0]).includes(reaction.emoji.name)) {
      reaction.remove();
      return;
    }

    let reactionCount = 0
    for (let item of reaction.message.reactions.cache) {
      reactionCount += item[1].count - (item[1].users.cache.has(client.user.id) ? 1 : 0);
      if (item[0] != reaction.emoji.name && item[1].users.cache.has(user.id)) {
        item[1].users.remove(user);
        reactionCount--;
      }
    }

    if (onReactionAddFn[vote.type]?.(client, vote, reaction, user, reactionCount)) {
      deleteData(reaction.message.guildId, ['votes', reaction.message.channelId, reaction.message.id])

      let counts = {}
      for (let item of reaction.message.reactions.cache) {
        counts[item[0]] = item[1].count - (item[1].users.cache.has(client.user.id) ? 1 : 0);
      }

      await endFn[vote.type]?.(client, vote, reaction.message, counts, reactionCount);
    }
  }
}

exports.onReactionRemove = async (client, reaction, user) => {
  const votes = getData(reaction.message.guildId, ['votes', reaction.message.channelId]);
  if (Object.keys(votes)?.includes?.(reaction.message.id)) {
    if (user.id == client.user.id) reaction.message.react(reaction.emoji.name)
  }
}
