module.exports = async (client, message) => {
  let matches = message.content.matchAll(/https?:\/\/discord.com\/channels\/[0-9]+\/([0-9]+)(?:\/([0-9]+))?/g);
  for (let match of matches) {
    let channel = client.channels.cache.get(match[1]);
    if (channel == null) continue;

    if (match[2] != null) {
      channel.messages.fetch(match[2]).then(urlMessage => {
        if (urlMessage == null) return;
        message.reply({
          embeds: [
            {
              author: {
                name: urlMessage.author.tag,
                iconURL: urlMessage.author.displayAvatarURL()
              },
              description: urlMessage.content,
              footer: {
                iconURL: urlMessage.guild.iconURL(),
                text: urlMessage.guild.name + ' #' + urlMessage.channel.name,
              }
            },
            ...urlMessage.embeds,
          ],
        })

        let files = [...urlMessage.attachments.values()];
        if (files.length != 0) {
          message.reply({
            files: files,
          })
        }
      }).catch(e => console.error(e));
    } else {
      message.reply({
        embeds: [
          {
            title: '#' + channel.name,
            footer: {
              iconURL: channel.guild.iconURL(),
              text: channel.guild.name,
            }
          }
        ]
      })
    }
  }
}
