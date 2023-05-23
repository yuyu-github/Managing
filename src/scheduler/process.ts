import { getAllowedMentions } from "../functions";
import { client } from "../main";

export default function (type: string, data: any) {
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
  }
}
