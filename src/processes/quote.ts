import { Client, Message, Embed, ChannelType } from "discord.js";
import { client } from "../main";

export default async function(message: Message) {
  let matches = message.content.matchAll(/https?:\/\/discord.com\/channels\/[0-9]+\/([0-9]+)(?:\/([0-9]+))?/g);
  for (let match of matches) {
    let channel = client.channels.cache.get(match[1]);
    if (channel == null || !('messages' in channel)) continue;

    if (match[2] != null) {
      channel.messages.fetch(match[2]).then(urlMessage => {
        if (urlMessage == null) return;

        const isImageEmbed = (embed: Embed) =>
          embed.author == null && embed.color == null && embed.description == null && embed.fields.length == 0 && 
            embed.footer == null && embed.image == null && embed.timestamp == null && embed.title == null && embed.video == null &&
            embed.url != null && embed.thumbnail?.url == embed.url

        let images: string[] = [];
        let embeds = urlMessage.embeds.filter(i => {
          if (isImageEmbed(i)) {
            images.push(i.url ?? '')
            return false;
          }
          else return true;
        });

        message.reply({
          embeds: [
            {
              author: {
                name: urlMessage.author.tag,
                iconURL: urlMessage.author.displayAvatarURL()
              },
              description: urlMessage.content,
              footer: {
                iconURL: urlMessage.guild?.iconURL() ?? undefined,
                text: urlMessage.guild?.name + ('name' in urlMessage.channel ? ' #' + urlMessage.channel.name : ''),
              }
            },
            ...embeds,
          ],
          allowedMentions: {
            repliedUser: false
          }
        })

        let files = [...urlMessage.attachments.values()].map(i => i.url).concat(images).join('\n');
        if (files.length != 0) {
          message.reply({
            content: files,
            allowedMentions: {
              repliedUser: false
            }
          })
        }
      }).catch(e => console.error(e));
    } else {
      if (!('name' in channel)) return;
      if (channel.type == ChannelType.GuildVoice) return;
      message.reply({
        embeds: [
          {
            title: '#' + channel.name,
            footer: {
              icon_url: channel.guild.iconURL() ?? undefined,
              text: channel.guild.name,
            }
          }
        ],
        allowedMentions: {
          repliedUser: false
        }
      })
    }
  }
}
