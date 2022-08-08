const dev = require('../../dev');
const { vote } = require('../../vote/vote');

module.exports = (interaction, user, count = 5) => {
  const member = interaction.guild.members.resolve(user);
  const roles = interaction.guild.roles;
  const permissions = interaction.member.permissions;
  if (!(permissions.has('ADMINISTRATOR') || permissions.has('BAN_MEMBERS'))) {
    interaction.reply(interaction.user.toString() + 'にBANする権限がありません')
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
        await interaction.reply({ content: '投票を作成しました', ephemeral: true })
        return interaction.channel.send(data)
      },
    )
  }
}
