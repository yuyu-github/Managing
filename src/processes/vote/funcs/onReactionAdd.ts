import { MessageReaction, PartialMessageReaction, User } from "discord.js";
import { VoteType } from "../../../data/votes.js";

export default {
  'normal': (vote: { count: number }, reaction, user, rCount, rMemberCount: number) => vote.count != 0 && rMemberCount >= vote.count,
  'role-vote': (vote: { count: number }, reaction, user, rCount, rMemberCount: number) => rMemberCount >= vote.count,
  'kick-vote': (vote: { count: number }, reaction, user, rCount, rMemberCount: number) => rMemberCount >= vote.count,
  'ban-vote': (vote: { count: number }, reaction, user, rCount, rMemberCount: number) => rMemberCount >= vote.count,
  'unban-vote': (vote: { count: number }, reaction, user, rCount, rMemberCount: number) => rMemberCount >= vote.count,
} as {[key in VoteType]: (vote: object, reaction: MessageReaction | PartialMessageReaction, user: User, reactionCount: number, reactionMemberCount: number) => boolean};
