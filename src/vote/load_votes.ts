import { Client } from "discord.js";

import { setData, getData, deleteData } from '../data';

export default async function (client: Client) {
  for (let guild of client.guilds.cache) {
    let channels = client.channels.cache;
    let votes = getData(guild[1].id, ['votes']);
    for (let id of Object.keys(votes ?? {})) {
      let channel = channels.get(id);
      if (channel == null || !('messages' in channel)) continue;
      for (let vote of Object.keys(votes?.[id] ?? {})) {
        channel.messages.fetch(vote).catch(e => {});
      }
    }
  }
}