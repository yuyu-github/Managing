import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, Component, ComponentBuilder, Message, MessageMentionOptions, User } from 'discord.js';

import { setData, getData, deleteData } from 'discordbot-data';
import { VoteType } from '../../data/votes.js';
import { parseTimeString, timeToString } from '../../utils/time.js';
import { schedule } from '../../scheduler/scheduler.js';

export function vote(type: VoteType, title: string, description: string, choices: string[][], data: object, author: User, endCondition: {count: number, time: string | null},
  sendFn: (data: object) => Message | undefined | Promise<Message | undefined>, allowedMentions: MessageMentionOptions = {}): void {
  let components = [new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('count-vote')
      .setLabel('集計')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('end-vote')
      .setLabel('終了')
      .setStyle(ButtonStyle.Primary),
  )]

  let time = parseTimeString(endCondition.time);

  let endConditionDescrption = '';
  if (endCondition.count > 0) endConditionDescrption += `**終了人数: **${endCondition.count}人\n`;
  if (time != null) endConditionDescrption += `**終了時間: **${timeToString(time)}(${timeToString(time, 'R')})\n`;
  Promise.resolve(sendFn({
    embeds: [
      {
        title: title,
        description: description + (description == '' ? '' : '\n') + endConditionDescrption + choices.map(v => `${v[0]} ${v[1]}`).join('\n'),
        footer: {
          iconURL: author.displayAvatarURL(),
          text: author.username,
        },
        color: Colors.Orange
      }
    ],
    components: components,
    allowedMentions: allowedMentions,
  })).then(msg => {
    if (msg == null) return;

    for (let choice of choices) {
      msg.react(choice[0]);
    }

    setData('guild', msg.guildId!, ['vote', 'list', msg.channelId, msg.id], {
      ...data,
      type: type,
      choices: choices,
      author: author.id,
      count: endCondition.count,
    });

    if (time != null) schedule('end-vote', {message: [msg.channelId, msg.id]}, time);
  }).catch(e => console.error(e));
}
