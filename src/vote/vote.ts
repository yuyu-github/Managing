import { Message, User } from 'discord.js';

import { setData, getData, deleteData } from '../data';

type VoteType = 'normal' | 'rolevote' | 'kickvote' | 'banvote' | 'unbanvote'

export function vote(type: VoteType, title: string, description: string, choices: string[][], data: object, author: User,
  sendFn: (data: object | string) => Message | undefined | Promise<Message | undefined>): void {
  Promise.resolve(sendFn({
    embeds: [
      {
        title: title,
        description: description + '\n\n' + choices.map(v => `${v[0]} ${v[1]}`).join('\n'),
        footer: {
          iconURL: author.displayAvatarURL(),
          text: author.tag,
        }
      }
    ]
  })).then(msg => {
    if (msg == null) return;

    for (let choice of choices) {
      msg.react(choice[0]);
    }

    setData(msg.guildId, ['votes', msg.channelId, msg.id], {
      ...data,
      type: type,
      choices: choices,
      author: author.id,
    })
  }).catch(e => console.error(e));
}
