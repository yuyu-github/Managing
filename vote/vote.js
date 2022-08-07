const { setData, getData, deleteData } = require('../data');

exports.vote = (type, title, description, choices, data, author, sendFn) => {
  Promise.resolve(sendFn({
    embeds: [
      {
        title: title,
        description: description + '\n\n' + choices.map(v => `${v[0]} ${v[1]}`).join('\n'),
        footer: {
          iconURL: author.displayAvatarURL(),
          text: author.tag,
        }
      }
    ]
  })).then(msg => {
    for (let choice of choices) {
      msg.react(choice[0]);
    }

    setData(msg.guildId, ['votes', msg.channelId, msg.id], {
      ...data,
      type: type,
      choices: choices,
      author: author.id,
    })
  }).catch(e => console.error(e));
}
