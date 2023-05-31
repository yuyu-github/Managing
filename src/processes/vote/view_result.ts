import { BaseMessageOptions, Colors, Message, MessageComponentInteraction, PartialMessage } from "discord.js";

export default async function(vote: {choices: string[][]}, message: Message | PartialMessage, counts: object, interaction: MessageComponentInteraction | null = null) {
  const total = Object.values(counts ?? {}).reduce((sum, i) => sum + i, 0);

  let sendMessage = {
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
  };
  if (interaction != null) await interaction.editReply(sendMessage);
  else await message.reply(sendMessage)
}
