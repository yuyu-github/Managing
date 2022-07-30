const dev = require('../dev');
const { vote } = require('../vote/vote');

module.exports = (client, interaction) => {
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
          '付与するが6割を超えた場合ロールを付与、付与しないが6割を超えた場合ロールを削除します\n投票終了人数 ' + count + '人',
          [['⭕', '付与する'], ['❌', '付与しない']],
          {
            user: user.id,
            role: role.id,
            count: count,
          },
          interaction.user,
          data => {
            interaction.reply('投票を作成しました')
            return interaction.channel.send(data)
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
          'キックするが7割を超えた場合キックします\n投票終了人数 ' + count + '人',
          [['⭕', 'キックする'], ['❌', 'キックしない']],
          {
            user: user.id,
            count: count,
          },
          interaction.user,
          data => {
            interaction.reply('投票を作成しました')
            return interaction.channel.send(data)
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
          'BANするが8割を超えた場合BANします\n投票終了人数 ' + count + '人',
          [['⭕', 'BANする'], ['❌', 'BANしない']],
          {
            user: user.id,
            count: count,
          },
          interaction.user,
          data => {
            interaction.reply('投票を作成しました')
            return interaction.channel.send(data)
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
            'BAN解除するが7割を超えた場合BAN解除します\n投票終了人数 ' + count + '人',
            [['⭕', 'BAN解除する'], ['❌', 'BAN解除しない']],
            {
              user: user.id,
              count: count,
            },
            interaction.user,
            data => {
              interaction.reply('投票を作成しました')
              return interaction.channel.send(data)
            },
          )
        }
      })
    }
    break;
  }
}
