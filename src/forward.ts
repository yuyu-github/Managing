import { Client, Message, MessageEmbed } from "discord.js";

import { setData, getData, deleteData } from 'discordbot-data';

export default async (client: Client, message: Message) => {
  if (message.channel.type == 'DM') return;
  const webhooks: string[] | null = getData('guild', message.guildId, ['forward', message.channelId]) as string[] | null;
  if (webhooks == null) return;

  const fetch = (await new Function('return import("node-fetch")')()).default;

  const name = `${message.guild?.members.cache.get(message.author.id)?.nickname ?? message.author.username} (${message.guild?.name} #${message.channel.name})`

  const isImageEmbed = (embed: MessageEmbed) =>
    embed.author == null && embed.color == null && embed.description == null && embed.fields.length == 0 &&
    embed.footer == null && embed.image == null && embed.timestamp == null && embed.title == null && embed.video == null &&
    embed.url != null && embed.thumbnail?.url == embed.url

  let images: string[] = [];
  let embeds = message.embeds.filter(i => {
    if (isImageEmbed(i)) {
      images.push(i.url ?? '')
      return false;
    }
    else return true;
  });
  let files = [...message.attachments.values()].map(i => i.url).concat(images).join('\n');

  for (let webhook of webhooks) {
    fetch(webhook, {
      method: 'POST',
      body: JSON.stringify({
        username: name,
        avatar_url: message.author.displayAvatarURL(),
        content: message.content,
        embeds: embeds,
      }),
      headers: { 'Content-Type': 'application/json' },
    }).catch(e => {});

    if (files.length != 0) {
      fetch(webhook, {
        method: 'POST',
        body: JSON.stringify({
          username: name,
          avatar_url: message.author.displayAvatarURL(),
          content: files,
        }),
        headers: { 'Content-Type': 'application/json' },
      }).catch(e => {});
    }
  }
}
