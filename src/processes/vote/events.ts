import { Client, Collection, Message, MessageReaction, PartialMessage, PartialMessageReaction, PartialUser, ReactionManager, User } from 'discord.js';

import { setData, getData, deleteData } from 'discordbot-data';

import viewResult from './view_result.js';
import { client } from '../../main.js';
import { VoteType } from '../../data/votes.js';
import { end } from './end.js';

export async function onReady() {
  for (let guild of client.guilds.cache) {
    let channels = client.channels.cache;
    let votes = getData('guild',guild[1].id, ['vote', 'list']);
    for (let id of Object.keys(votes ?? {})) {
      let channel = channels.get(id);
      if (channel == null || !('messages' in channel)) continue;
      for (let vote of Object.keys(votes?.[id] ?? {})) {
        channel.messages.fetch(vote).catch(e => {});
      }
    }
  }
}

export function onMessageDelete(message: Message | PartialMessage) {
  if (message.guildId == null) return;
  const votes = getData('guild', message.guildId, ['vote', 'list', message.channelId]) ?? {};
  if (Object.keys(votes)?.includes?.(message.id)) deleteData('guild', message.guildId, ['vote', 'list', message.channelId, message.id]);
}

export async function onReactionAdd(reaction: MessageReaction | PartialMessageReaction, user: User) {
  if (reaction.message.guildId == null) return;
  const votes = getData('guild', reaction.message.guildId, ['vote', 'list', reaction.message.channelId]) ?? {};
  if (Object.keys(votes)?.includes?.(reaction.message.id)) {
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
    let promises: Promise<any>[] = []
    for (let item of reaction.message.reactions.cache) {
      reactionCount += item[1].count - (item[1].users.cache.has(client.user?.id ?? '') ? 1 : 0);

      function duplicateCheck(users: Collection<string, User>) {
        if (!(vote.multiple ?? false) && item[0] != reaction.emoji.name && users.has(user.id)) {
          item[1].users.remove(user);
          reactionCount--;
          return true;
        }
        return false;
      }
      let hadDuplicate = duplicateCheck(item[1].users.cache)

      promises.push(reaction.users.fetch().then(users => {
        if (!hadDuplicate) duplicateCheck(users);
        if (vote.count > 0) {
          for (let id of users.keys()) {
            if (!reactionMembers.includes(id) && id != client.user?.id) {
              reactionMemberCount++;
              reactionMembers.push(id);
            }
          }
        }
      }))
    }
    await Promise.all(promises);

    if (vote.count > 0 && reactionMemberCount >= vote.count) {
      end(vote, reaction.message)
    }
  }
}

export async function onReactionRemove(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
  if (reaction.message.guildId == null) return;
  const votes = getData('guild', reaction.message.guildId, ['vote', 'list', reaction.message.channelId]);
  if (Object.keys(votes ?? {})?.includes?.(reaction.message.id)) {
    if (user.id == client.user?.id) reaction.message.react(reaction.emoji.name ?? '')
  }
}
