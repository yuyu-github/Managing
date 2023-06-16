import { getAllowedMentions } from "../utils/mention.js";
import { client } from "../main.js";
import { getData } from "discordbot-data";
import { end as endVote } from "../processes/vote/end.js";
import { start as startLottery } from "../commands/processes/lottery.js";

export default async function (type: string, data: any) {
  switch (type) {
    case 'end-timer': {
      const channel = client.channels.cache.get(data.channel);
      if (channel == null || !('send' in channel && 'guild' in channel)) return;
      channel.send({
        content: data.message == '' ? ':alarm_clock:タイマーが鳴りました' : data.message,
        allowedMentions: getAllowedMentions(channel.guild.members.cache.get(data.owner))
      });
    }
    break;
    case 'end-vote': {
      const channel = client.channels.cache.get(data.message[0]);
      if (channel == null || !('guild' in channel && 'messages' in channel)) return;
      const votes = getData('guild', channel.guildId!, ['vote', 'list', data.message[0]]) ?? {};
      if (!Object.keys(votes ?? {}).includes(data.message[1])) return;
      try {
        let message = await channel.messages.fetch(data.message[1])
        endVote(votes[data.message[1]], message);
      } catch {}
    }
    break;
    case 'start-lottery': {
      const channel = client.channels.cache.get(data.message[0]);
      if (channel == null || !('guild' in channel && 'messages' in channel)) return;
      const lotteries = getData('guild', channel.guildId!, ['lottery', 'list']) ?? {};
      if (!Object.keys(lotteries ?? {}).includes(data.message[1])) return;
      try {
        let message = await channel.messages.fetch(data.message[1])
        startLottery(message);
      } catch {}
    }
    break;
  }
}
