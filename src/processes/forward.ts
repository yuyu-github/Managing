import { ChannelType, Client, Message, Embed, WebhookClient } from "discord.js";

import { setData, getData, deleteData } from 'discordbot-data';

export default async (message: Message) => {
  if (message.channel.type == ChannelType.DM) return;
  const webhooks: string[] | null = getData('guild', message.guildId!, ['forward', message.channelId]) as string[] | null;
  if (webhooks == null) return;

  const name = `${message.guild?.members.cache.get(message.author.id)?.nickname ?? message.author.username} (${message.guild?.name} #${message.channel.name})`
  // const name = `${message.guild?.members.cache.get(message.author.id)?.nickname ?? message.author.globalName} (${message.guild?.name} #${message.channel.name})`

  const isImageEmbed = (embed: Embed) =>
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
    let wc = new WebhookClient({url: webhook});
    wc.send({
      username: name,
      avatarURL: message.author.displayAvatarURL(),
      content: message.content,
      embeds: embeds,
    }).catch();

    if (files.length != 0) {
      wc.send({
        username: name,
        avatarURL: message.author.displayAvatarURL(),
        content: files,
      }).catch();
    }
  }
}
