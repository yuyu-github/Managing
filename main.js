const fs = require('fs');

const { Client, Intents } = require('discord.js');
const botToken = require('./token.js');
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ]
});

const dev = require('./dev.js');

function setData(serverId, path, value) {
  let fileName = 'data/' + serverId + '.json'
  let data = fs.existsSync(fileName) ? JSON.parse(fs.readFileSync(fileName)) : {}
  let parent = data;
  path.forEach((key, i) => {
    if (i == path.length - 1) parent[key] = value;
    else {
      if (parent[key] == null) parent[key] = {};
      parent = parent[key];
    }
  });
  fs.writeFileSync(fileName, JSON.stringify(data));
}
function getData(serverId, path) {
  let fileName = 'data/' + serverId + '.json'
  let data = fs.existsSync(fileName) ? JSON.parse(fs.readFileSync(fileName)) : {}
  let parent = data;
  let value;
  path.forEach((key, i) => {
    if (i == path.length - 1) {
      value = parent[key];
      return;
    }
    else {
      if (parent[key] == null) {
        value = null;
        return;
      }
      parent = parent[key];
    }
  });
  return value;
} 
function deleteData(serverId, path) {
  let fileName = 'data/' + serverId + '.json'
  let data = fs.existsSync(fileName) ? JSON.parse(fs.readFileSync(fileName)) : {}
  let parent = data;
  path.forEach((key, i) => {
    if (i == path.length - 1) delete parent[key];
    else {
      if (parent[key] == null) return;
      parent = parent[key];
    }
  });
  fs.writeFileSync(fileName, JSON.stringify(data));
} 

client.once('ready', async () => {
  const commands = [
    {
      name: 'rolevote',
      description: 'ロールを付与/削除するか投票をとる',
      options: [
        {
          type: 'USER',
          name: 'user',
          description: '投票をとるユーザー',
          required: true,
        },
        {
          type: 'ROLE',
          name: 'role',
          description: '投票をとるロール',
          required: true,
        },
        {
          type: 'INTEGER',
          name: 'count',
          description: '投票終了する人数',
        },
      ]
    },
  ];

  if (dev.isDev) await client.application.commands.set(commands, dev.ServerId);
  else client.application.commands.set(commands);

  for (let guild of client.guilds.cache) {
    let channels = client.channels.cache;
    let votes = getData(guild[1].id, ['rolevotes']);
    for (let id of Object.keys(votes ?? {})) {
      for (let vote of Object.keys(votes[id])) {
        channels.get(id).messages.fetch(vote);
      }
    }
  }
  
  console.log('Managing Ready');
})

client.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
    switch (interaction.commandName) {
      case 'rolevote': {
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.resolve(user);
        const role = interaction.options.getRole('role');
        const count = interaction.options.getInteger('count') ?? 5;
 
        const roles = [...interaction.guild.roles.cache.keys()]
        if (interaction.member.roles.cache.size == 0 || roles.indexOf(role.id) < roles.indexOf(interaction.member.roles.cache.keyAt(0))) {
          interaction.reply('自分より上のロールの投票をとることはできません');
        } else if (count < 3) {
          interaction.reply('投票を終了する人数を3人未満にすることはできません');
        } else if (!role.editable) {
          interaction.reply(role.name + 'を付与/削除する権限がありません')
        } else if (!member.manageable) {
          interaction.reply(user.toString() + 'に' + role.name + 'を付与/削除する権限がありません')
        } else {
          interaction.channel.send({
            embeds: [
              {
                title: user.tag + 'に' + role.name + 'を付与/削除する',
                description: `付与するが6割を超えた場合ロールを付与、付与しないが6割を超えた場合ロールを削除します
  
                :o: 付与する
                :x: 付与しない`,
              }
            ]
          }).then(msg => {
            msg.react('⭕');
            msg.react('❌');
  
            setData(interaction.guildId, ['rolevotes', msg.channelId, msg.id], {
              user: user.id,
              role: role.id,
              count: count,
            })
          })
          interaction.reply({content: user.toString() + 'に' + role.name + 'を付与するか投票を作成しました', ephemeral: true});
        }
      }
      break;
    }
  }
})

client.on('messageReactionAdd', (reaction, user) => {
  let votes = getData(reaction.message.guildId, ['rolevotes', reaction.message.channelId]);
  if (Object.keys(votes)?.includes?.(reaction.message.id)) {
    if (user.id == client.user.id) return;

    if (user.bot || user.id == votes[reaction.message.id].user) {
      reaction.users.remove(user); 
      return;
    }
    if (reaction.emoji.name != '⭕' && reaction.emoji.name != '❌') {
      reaction.remove();
      return;
    }

    let reactionCount = 0
    for (let item of reaction.message.reactions.cache) {
      reactionCount += item[1].count - 1;
      if (item[0] != reaction.emoji.name && item[1].users.cache.has(user.id)) {
        item[1].users.remove(user);
        reactionCount--;
      }
    }

    if (reactionCount >= votes[reaction.message.id].count) {
      deleteData(reaction.message.guildId, ['rolevotes', reaction.message.channelId, reaction.message.id])

      let oCount = 0;
      let xCount = 0;
      for (let item of reaction.message.reactions.cache) {
        if (item[0] == '⭕') oCount += item[1].count - 1;
        if (item[0] == '❌') xCount += item[1].count - 1;
      }
      let total = oCount + xCount;
      
      const user = client.users.cache.get(votes[reaction.message.id].user);
      if (user == null) return;
      const member = reaction.message.guild.members.resolve(user);
      const role = reaction.message.guild.roles.cache.get(votes[reaction.message.id].role);
      if (role == null) return;

      if (oCount > total * 0.6) {
        member.roles.add(role)
          .then(() => reaction.message.channel.send('投票により' + user.toString() + 'に' + role.name + 'を付与しました'))
          .catch(() => reaction.message.channel.send(role.name + 'を付与できませんでした'));
      } else if (xCount > total * 0.6) {
        member.roles.remove(role)
          .then(() => reaction.message.channel.send('投票により' + user.toString() + 'から' + role.name + 'を削除しました'))
          .catch(() => reaction.message.channel.send(role.name + 'を削除できませんでした'));
      } else {
        reaction.message.channel.send('投票により' + user.toString() + 'に' + role.name + 'の付与や削除はされませんでした');
      }
    }
  }
})

client.login(botToken);