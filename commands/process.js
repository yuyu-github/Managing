const dev = require('../dev');
const { vote } = require('../vote/vote');

module.exports = async (client, interaction) => {
  if (interaction.isCommand()) {
    switch (interaction.commandName) {
      case 'vote': {
        const name = interaction.options.getString('name');
        const multiple = interaction.options.getBoolean('multiple')
        const count = interaction.options.getInteger('count') ?? 0;
        const mentions = [...Array(2).keys()].map(i => interaction.options.getMentionable('mention' + (i + 1))).filter(i => i != null);
        let choices = [...Array(20).keys()].map(i => interaction.options.getString('choice' + (i + 1))).filter(i => i != null);

        if (choices.length == 0) {
          choices = [['⭕', ''], ['❌', '']];
        } else {
          let list = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴', '🇵', '🇶', '🇷', '🇸', '🇹', '🇺', '🇻', '🇼', '🇽', '🇾', '🇿']
          choices = choices.map((item, i) => [list[i], item]);
        }

        vote(
          'normal',
          name,
          mentions.reduce((str, i) => str + ' ' + i.toString(), ''),
          choices,
          {
            multiple: multiple,
            count: count,
          },
          interaction.user,
          data => {
            interaction.reply({ content: '投票を作成しました', ephemeral: true })
            return interaction.channel.send(data);
          }
        )
      }
      break;
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
              interaction.reply({ content: '投票を作成しました', ephemeral: true })
              return interaction.channel.send(data)
            },
          )
        }
      }
      break;
      case 'kickvote': {
        const user = interaction.options.getUser('user');
        const count = interaction.options.getInteger('count') ?? 5;
        require('./kickvote/kickvote')(interaction, user, count);
      }
      break;
      case 'banvote': {
        const user = interaction.options.getUser('user');
        const count = interaction.options.getInteger('count') ?? 5;
        require('./banvote/banvote')(interaction, user, count);
      }
      break;
      case 'unbanvote': {
        const userTag = interaction.options.getString('user');
        const count = interaction.options.getInteger('count') ?? 5;
        require('./unbanvote/unbanvote')(interaction, userTag, count);
      }
      break;
      case 'translate': {
        const text = interaction.options.getString('text');
        const source = interaction.options.getString('source');
        const target = interaction.options.getString('target');
        
        let url = `https://script.google.com/macros/s/AKfycbwSdQYdmkBKmh1FoJ86xuovTcz-Bfx9eAj3fyKskLqWVGp_ZLPK-ycKmnTTsoMxQLjY/exec?text=${text}${source == null ? '' : '&source=' + source}${target == null ? '' : '&target=' + target}`
        import('node-fetch').then(({default: fetch}) => {
          fetch(url).then(res => res.text()).then(body => interaction.reply(body)).catch(e => {
            interaction.reply('翻訳に失敗しました');
            console.error(e);
          });
        }).catch(e => console.error(e));
      }
      break;
      case 'delete-message': {
        const count = interaction.options.getInteger('count') ?? 1;

        const permissions = interaction.member.permissions;
        if (!(permissions.has('ADMINISTRATOR') || permissions.has('MANAGE_MESSAGES'))) {
          interaction.reply('メッセージの管理権限がありません');
        } else if (count > 100) {
          interaction.reply('メッセージは100件までしか削除できません');
        } else if (!permissions.has('ADMINISTRATOR') && count > 15) {
          interaction.reply('管理者権限がない場合メッセージは15件までしか削除できません');
        } else {
          const messages = await interaction.channel.messages.fetch({limit: count})
          messages.each(message => message.delete());
          interaction.reply(count + '件のメッセージを削除しました');
        }
      }
      break;
    }
  } else if (interaction.isContextMenu()) {
    switch (interaction.commandName) {
      case 'キック投票': {
        const user = interaction.options.getUser('user');
        require('./kickvote/kickvote')(interaction, user)
      }
      break;
      case 'BAN投票': {
        const user = interaction.options.getUser('user');
        require('./banvote/banvote')(interaction, user)
      }
      break;
      case 'BAN解除投票': {
        const user = interaction.options.getUser('user');
        require('./unbanvote/unbanvote')(interaction, user.tag)
      }
      break;
      case 'ピン留め': {
        const message = interaction.options.getMessage('message');
        await message.pin();
        interaction.reply('メッセージをピン留めしました')
      }
      break;
      case 'ピン留め解除': {
        const message = interaction.options.getMessage('message');
        await message.unpin();
        interaction.reply('メッセージをピン留め解除しました')
      }
      break;
    }
  }
}
