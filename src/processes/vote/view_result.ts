import { Colors, Message, MessageComponentInteraction, PartialMessage } from "discord.js";

export default function(vote: {choices: string[][]}, message: Message | PartialMessage, counts: object, interaction?: MessageComponentInteraction) {
  const total = Object.values(counts ?? {}).reduce((sum, i) => sum + i, 0);

  (interaction ?? message).reply({
    embeds: [
      {
        title: message.embeds[0]?.title ?? '',
        fields: vote.choices.map(i => ({
          name: i[0] + ' ' + i[1],
          value: counts[i[0]] + '票 (' + (total == 0 ? 0 : (Math.round(counts[i[0]] / total * 1000) / 10)) + '%)',
        })),
        color: Colors.Gold
      }
    ]
  })
}
