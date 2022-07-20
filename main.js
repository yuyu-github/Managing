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

const onReactionAddFn = {
  'rolevote': (vote, reaction, user, reactionCount) => reactionCount >= vote.count,
  'kickvote': (vote, reaction, user, reactionCount) => reactionCount >= vote.count,
  'banvote': (vote, reaction, user, reactionCount) => reactionCount >= vote.count,
  'unbanvote': (vote, reaction, user, reactionCount) => reactionCount >= vote.count,
};
const endFn = {
  'rolevote': async (vote, msg, counts, total) => {
    const user = await client.users.fetch(vote.user);
    if (user == null) return;
    const member = msg.guild.members.resolve(user);
    const role = msg.guild.roles.cache.get(vote.role);
    if (role == null) return;

    if (counts['⭕'] > total * 0.6) {
      member.roles.add(role)
        .then(() => msg.channel.send('投票により' + user.toString() + 'に' + role.name + 'を付与しました'))
        .catch(() => msg.channel.send(user.toString() + 'に' + role.name + 'を付与できませんでした'));
    } else if (counts['❌'] > total * 0.6) {
      member.roles.remove(role)
        .then(() => msg.channel.send('投票により' + user.toString() + 'から' + role.name + 'を削除しました'))
        .catch(() => msg.channel.send(user.toString() + 'に' + role.name + 'を削除できませんでした'));
    } else {
      msg.channel.send('投票により' + user.toString() + 'に' + role.name + 'の付与や削除はされませんでした');
    }
  },
  'kickvote': async (vote, msg, counts, total) => {
    const user = await client.users.fetch(vote.user);
    if (user == null) return;
    const member = msg.guild.members.resolve(user);

    if (counts['⭕'] > total * 0.7) {
      member.kick('投票でキックするが7割を超えたため')
        .then(() => msg.channel.send('投票により' + user.toString() + 'をキックしました'))
        .catch(() => msg.channel.send(user.toString() + 'をキックできませんでした'));
    } else {
      msg.channel.send('投票により' + user.toString() + 'はキックされませんでした');
    }
  },
  'banvote': async (vote, msg, counts, total) => {
    const user = await client.users.fetch(vote.user);
    if (user == null) return;

    if (counts['⭕'] > total * 0.8) {
      msg.guild.members.ban(user, { reason: '投票でBANするが8割を超えたため' })
        .then(() => msg.channel.send('投票により' + user.toString() + 'をBANしました'))
        .catch(() => msg.channel.send(user.toString() + 'をBANできませんでした'));
    } else {
      msg.channel.send('投票により' + user.toString() + 'はBANされませんでした');
    }
  },
  'unbanvote': async (vote, msg, counts, total) => {
    const user = await client.users.fetch(vote.user);
    if (user == null) return;

    if (counts['⭕'] > total * 0.7) {
      msg.guild.members.unban(user, '投票でBAN解除するが7割を超えたため')
        .then(() => msg.channel.send('投票により' + user.toString() + 'をBAN解除しました'))
        .catch(() => msg.channel.send(user.toString() + 'をBAN解除できませんでした'));
    } else {
      msg.channel.send('投票により' + user.toString() + 'はBAN解除されませんでした');
    }
  }
};
function vote(type, title, description, choices, data, sendFn) {
  Promise.resolve(sendFn({
    embeds: [
      {
        title: title,
        description: description + '\n\n' + choices.map(v => `${v[0]} ${v[1]}`).join('\n'),
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
    })
  })
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
    {
      name: 'kickvote',
      description: 'キックするか投票をとる',
      options: [
        {
          type: 'USER',
          name: 'user',
          description: '投票をとるユーザー',
          required: true,
        },
        {
          type: 'INTEGER',
          name: 'count',
          description: '投票終了する人数',
        },
      ]
    },
    {
      name: 'banvote',
      description: 'BANするか投票をとる',
      options: [
        {
          type: 'USER',
          name: 'user',
          description: '投票をとるユーザー',
          required: true,
        },
        {
          type: 'INTEGER',
          name: 'count',
          description: '投票終了する人数',
        },
      ]
    },
    {
      name: 'unbanvote',
      description: 'BAN解除するか投票をとる',
      options: [
        {
          type: 'STRING',
          name: 'user',
          description: '投票をとるユーザーのタグ',
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
    let votes = getData(guild[1].id, ['votes']);
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
 
        const roles = interaction.guild.roles
        if (roles.comparePositions(role, interaction.member.roles.highest) > 0) {
          interaction.reply('自分より上のロールの投票をとることはできません');
        } else if (count < 3 && !(dev.isDev && interaction.guildId == dev.serverId)) {
          interaction.reply('投票を終了する人数を3人未満にすることはできません');
        } else if (!role.editable) {
          interaction.reply(role.name + 'を付与/削除する権限がありません')
        } else {
          vote(
            'rolevote',
            user.tag + 'に' + role.name + 'を付与/削除する',
            '付与するが6割を超えた場合ロールを付与、付与しないが6割を超えた場合ロールを削除します',
            [['⭕', '付与する'], ['❌', '付与しない']],
            {
              user: user.id,
              role: role.id,
              count: count,
            },
            data => {
              interaction.reply(data)
              return interaction.fetchReply();
            },
          )
        }
      }
      break;
      case 'kickvote': {
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.resolve(user);
        const count = interaction.options.getInteger('count') ?? 5;

        const roles = interaction.guild.roles
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
          interaction.reply('管理者権限がありません')
        } else if (!member.kickable) {
          interaction.reply(user.toString() + 'をキックする権限がありません')
        } else if (roles.comparePositions(member.roles.highest, interaction.member.roles.highest) > 0) {
          interaction.reply('自分より上のロールがある人の投票をとることはできません'); 
        } else if (count < 4 && !(dev.isDev && interaction.guildId == dev.serverId)) {
          interaction.reply('投票を終了する人数を4人未満にすることはできません');
        } else {
          vote(
            'kickvote',
            user.tag + 'をキックする',
            'キックするが7割を超えた場合キック',
            [['⭕', 'キックする'], ['❌', 'キックしない']],
            {
              user: user.id,
              count: count,
            },
            data => {
              interaction.reply(data)
              return interaction.fetchReply();
            },
          )
        }
      }
      break;
      case 'banvote': {
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.resolve(user);
        const count = interaction.options.getInteger('count') ?? 5;

        const roles = interaction.guild.roles;
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
          interaction.reply('管理者権限がありません')
        } else if (!member.bannable) {
          interaction.reply(user.toString() + 'をBANする権限がありません')
        } else if (roles.comparePositions(member.roles.highest, interaction.member.roles.highest) > 0) {
          interaction.reply('自分より上のロールがある人の投票をとることはできません');
        } else if (count < 5 && !(dev.isDev && interaction.guildId == dev.serverId)) {
          interaction.reply('投票を終了する人数を5人未満にすることはできません');
        } else {
          vote(
            'banvote',
            user.tag + 'をBANする',
            'BANするが8割を超えた場合BAN',
            [['⭕', 'BANする'], ['❌', 'BANしない']],
            {
              user: user.id,
              count: count,
            },
            data => {
              interaction.reply(data)
              return interaction.fetchReply();
            },
          )
        }
      }
      break;
      case 'unbanvote': {
        const userTag = interaction.options.getString('user');
        interaction.guild.bans.fetch().then(banUsers => {
          const user = banUsers.find((v) => v.user.tag == userTag)?.user;
          if (user == null) {
            interaction.reply('無効なユーザーです');
            return;
          }
          const count = interaction.options.getInteger('count') ?? 5;

          if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            interaction.reply('管理者権限がありません')
          } else if (count < 5 && !(dev.isDev && interaction.guildId == dev.serverId)) {
            interaction.reply('投票を終了する人数を5人未満にすることはできません');
          } else {
            vote(
              'unbanvote',
              user.tag + 'をBAN解除する',
              'BAN解除するが7割を超えた場合BAN解除',
              [['⭕', 'BAN解除する'], ['❌', 'BAN解除しない']],
              {
                user: user.id,
                count: count,
              },
              data => {
                interaction.reply(data)
                return interaction.fetchReply();
              },
            )
          }
        })
      }
      break;
    }
  }
})

client.on('messageReactionAdd', (reaction, user) => {
  const votes = getData(reaction.message.guildId, ['votes', reaction.message.channelId]);
  if (Object.keys(votes)?.includes?.(reaction.message.id)) {
    const vote = votes[reaction.message.id];

    if (user.id == client.user.id) return;

    if (user.bot || user.id == vote.user) {
      reaction.users.remove(user); 
      return;
    }
    if (!vote.choices.map(v => v[0]).includes(reaction.emoji.name)) {
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

    if (onReactionAddFn[vote.type]?.(vote, reaction, user, reactionCount)) {
      deleteData(reaction.message.guildId, ['votes', reaction.message.channelId, reaction.message.id])

      let counts = {}
      for (let item of reaction.message.reactions.cache) {
        counts[item[0]] = item[1].count - 1;
      }

      endFn[vote.type]?.(vote, reaction.message, counts, reactionCount);
    }
  }
})

client.login(botToken);
