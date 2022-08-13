import { Client, MessageReaction, PartialMessageReaction, PartialUser, ReactionManager, User } from 'discord.js';

import { setData, getData, deleteData } from 'discordbot-data';

import onReactionAddFn from './funcs/onReactionAdd';
import endFn from './funcs/end';
import viewResult from './view_result';

export async function onReactionAdd(client: Client, reaction: MessageReaction | PartialMessageReaction, user: User) {
  const votes = getData('guild', reaction.message.guildId, ['votes', reaction.message.channelId]) ?? {};
  if (Object.keys(votes ?? {})?.includes?.(reaction.message.id)) {
    const vote = votes[reaction.message.id];

    if (user.id == client.user?.id) return;

    if (user.bot || user.id == vote.user) {
      reaction.users.remove(user);
      return;
    }
    if (!vote.choices.map(v => v[0]).includes(reaction.emoji.name)) {
      reaction.remove();
      return;
    }

    let reactionCount = 0;
    let reactionMemberCount = 0;
    let reactionMembers: string[] = []
    for (let item of reaction.message.reactions.cache) {
      reactionCount += item[1].count - (item[1].users.cache.has(client.user?.id ?? '') ? 1 : 0);

      for (let id of (await item[1].users.fetch()).keys()) {
        if (!reactionMembers.includes(id) && id != client.user?.id) {
          reactionMemberCount++;
          reactionMembers.push(id);
        }
      }

      if (!(vote.multiple ?? false) && item[0] != reaction.emoji.name && item[1].users.cache.has(user.id)) {
        item[1].users.remove(user);
        reactionCount--;
      }
    }

    if (onReactionAddFn[vote.type]?.(client, vote, reaction, user, reactionCount, reactionMemberCount)) {
      deleteData('guild', reaction.message.guildId, ['votes', reaction.message.channelId, reaction.message.id])

      let counts = {}
      for (let item of reaction.message.reactions.cache) {
        counts[item[0]] = item[1].count - (item[1].users.cache.has(client.user?.id ?? '') ? 1 : 0);
      }

      viewResult(vote, reaction.message, counts);
      await endFn[vote.type]?.(client, vote, reaction.message, counts, reactionCount);
    }
  }
}

export async function onReactionRemove(client: Client, reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
  const votes = getData('guild', reaction.message.guildId, ['votes', reaction.message.channelId]);
  if (Object.keys(votes ?? {})?.includes?.(reaction.message.id)) {
    if (user.id == client.user?.id) reaction.message.react(reaction.emoji.name ?? '')
  }
}
