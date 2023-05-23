import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, Component, ComponentBuilder, Message, User } from 'discord.js';

import { setData, getData, deleteData } from 'discordbot-data';

type VoteType = 'normal' | 'rolevote' | 'kickvote' | 'banvote' | 'unbanvote'

export function vote(type: VoteType, title: string, description: string, choices: string[][], data: object, author: User,
  sendFn: (data: object) => Message | undefined | Promise<Message | undefined>): void {
  let components: ComponentBuilder[] = [];
  if (type == 'normal') {
    components = [new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('count-vote')
        .setLabel('集計')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('end-vote')
        .setLabel('終了')
        .setStyle(ButtonStyle.Primary),
    )]
  }

  Promise.resolve(sendFn({
    embeds: [
      {
        title: title,
        description: description + '\n\n' + choices.map(v => `${v[0]} ${v[1]}`).join('\n'),
        footer: {
          iconURL: author.displayAvatarURL(),
          text: author.tag,
        },
        color: Colors.Orange
      }
    ],
    components: components
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
    })
  }).catch(e => console.error(e));
}