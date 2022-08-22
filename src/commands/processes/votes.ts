import { Client, CommandInteraction, ContextMenuInteraction, Interaction } from "discord.js";

import { setData, getData, deleteData } from 'discordbot-data';

import * as dev from '../../dev';
import { vote as createVote } from '../../vote/vote';
import voteViewResult from '../../vote/view_result';

export async function vote(client: Client, interaction: CommandInteraction) {
  const name = interaction.options.getString('name');
  const multiple = interaction.options.getBoolean('multiple')
  const count = interaction.options.getInteger('count') ?? 0;
  const mentions = [...Array(2).keys()].map(i => interaction.options.getMentionable('mention' + (i + 1))).filter(i => i != null);
  let choicesName = [...Array(20).keys()].map(i => interaction.options.getString('choice' + (i + 1))).filter(i => i != null);

  let choices: string[][];
  if (choicesName.length == 0) {
    choices = [['⭕', ''], ['❌', '']];
  } else {
    let list = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴', '🇵', '🇶', '🇷', '🇸', '🇹', '🇺', '🇻', '🇼', '🇽', '🇾', '🇿']
    choices = choicesName.map((item, i) => [list[i], item ?? '']);
  }

  createVote(
    'normal',
    name ?? '',
    '',
    choices,
    {
      multiple: multiple,
      count: count,
    },
    interaction.user,
    async data => {
      await interaction.reply({ content: '投票を作成しました', ephemeral: true })
      return interaction.channel?.send({
        content: mentions.reduce((str, i) => str + ' ' + i?.toString(), ''),
        ...data,
      });
    }
  )
}

export async function roleVote(client: Client, interaction: CommandInteraction) {
  const user = interaction.options.getUser('user', true);
  const role = interaction.options.getRole('role', true);
  if (!('createdAt' in role)) return;
  const content = interaction.options.getString('content') ?? 'add';
  const contentText = {'add': '付与', 'remove': '剥奪', 'addremove': '付与/剥奪'}[content];

  const guildRoles = interaction.guild?.roles;
  if (guildRoles == null) return;
  const roles = interaction.member?.roles;
  if (roles == undefined || !('highest' in roles)) return;
  const sameRole = getData('guild', interaction.guildId, ['vote-setting', 'same-role', 'role-vote']) ?? false;

  const minCount = getData('guild', interaction.guildId, ['vote-setting', 'min-count', 'role-vote']) ?? 3;
  const count = interaction.options.getInteger('count') ?? minCount;

  if (guildRoles.comparePositions(role, roles.highest) > 0 && interaction.guild?.ownerId != interaction.user.id) {
    interaction.reply('自分より上のロールの投票をとることはできません');
  } else if (!sameRole && guildRoles.comparePositions(role, roles.highest) == 0 && interaction.guild?.ownerId != interaction.user.id) {
    interaction.reply('自分と同じロールの投票をとることはできません');
  } else if (count < minCount) {
    interaction.reply(`投票を終了する人数を${minCount}人未満にすることはできません`);
  } else if (!role.editable) {
    interaction.reply(`${role.name}を${contentText}する権限がありません`)
  } else {
    const description = {
      'add': '付与するが6割を超えた場合ロールを付与します',
      'remove': '剥奪するが6割を超えた場合ロールを剥奪します',
      'addremove': '付与するが6割を超えた場合ロールを付与、付与しないが6割を超えた場合ロールを剥奪します',
    }[content];

    createVote(
      'rolevote',
      user.tag + 'に' + `${role.name}を${contentText}する`,
      `${description}\n投票終了人数 ${count}人`,
      [['⭕', `${content.includes('add') ? '付与' : '削除'}する`], ['❌', `${content.includes('add') ? '付与' : '削除'}しない`]],
      {
        user: user.id,
        role: role.id,
        content: content,
        count: count,
      },
      interaction.user,
      async data => {
        await interaction.reply({ content: '投票を作成しました', ephemeral: true })
        return interaction.channel?.send(data)
      },
    )
  }
}

export async function kickVote(client: Client, interaction: CommandInteraction | ContextMenuInteraction) {
  const user = interaction.options.getUser('user', true);
  const member = interaction.guild?.members.resolve(user);
  if (member == null) return;

  const guildRoles = interaction.guild?.roles;
  if (guildRoles == null) return;
  const roles = interaction.member?.roles;
  if (roles == null || Array.isArray(roles)) return;
  const sameRole = getData('guild', interaction.guildId, ['vote-setting', 'same-role', 'kick-vote']) ?? false;

  const minCount = getData('guild', interaction.guildId, ['vote-setting', 'min-count', 'kick-vote']) ?? 4;
  const count = interaction.isCommand() ? interaction.options.getInteger('count') ?? minCount : minCount;

  if (!member.kickable) {
    interaction.reply(user.toString() + 'をキックする権限がありません')
  } else if ((guildRoles.comparePositions(member.roles.highest, roles.highest) > 0 && interaction.guild?.ownerId != interaction.user.id) || interaction.guild?.ownerId == member.id) {
    interaction.reply('自分より上のロールがある人の投票をとることはできません');
  } else if (!sameRole && guildRoles.comparePositions(member.roles.highest, roles.highest) == 0 && interaction.guild?.ownerId != interaction.user.id) {
    interaction.reply('自分と同じロールの投票をとることはできません');
  } else if (count < minCount) {
    interaction.reply(`投票を終了する人数を${minCount}人未満にすることはできません`);
  } else {
    createVote(
      'kickvote',
      user.tag + 'をキックする',
      'キックするが7割を超えた場合キックします\n投票終了人数 ' + count + '人',
      [['⭕', 'キックする'], ['❌', 'キックしない']],
      {
        user: user.id,
        count: count,
      },
      interaction.user,
      async data => {
        await interaction.reply({ content: '投票を作成しました', ephemeral: true })
        return interaction.channel?.send(data)
      },
    )
  }
}

export async function banVote(client: Client, interaction: CommandInteraction | ContextMenuInteraction) {
  const user = interaction.options.getUser('user', true);
  const member = interaction.guild?.members.resolve(user);
  if (member == null) return;

  const guildRoles = interaction.guild?.roles;
  if (guildRoles == null) return;
  const roles = interaction.member?.roles;
  if (roles == null || Array.isArray(roles)) return;
  const sameRole = getData('guild', interaction.guildId, ['vote-setting', 'same-role', 'ban-vote']) ?? false;

  const minCount = getData('guild', interaction.guildId, ['vote-setting', 'min-count', 'ban-vote']) ?? 5;
  const count = interaction.isCommand() ? interaction.options.getInteger('count') ?? minCount : minCount;

  if (!member.bannable) {
    interaction.reply(user.toString() + 'をBANする権限がありません')
  } else if ((guildRoles.comparePositions(member.roles.highest, roles.highest) > 0 && interaction.guild?.ownerId != interaction.user.id) || interaction.guild?.ownerId == member.id) {
    interaction.reply('自分より上のロールがある人の投票をとることはできません');
  } else if (!sameRole && guildRoles.comparePositions(member.roles.highest, roles.highest) == 0 && interaction.guild?.ownerId != interaction.user.id) {
    interaction.reply('自分と同じロールの投票をとることはできません');
  } else if (count < minCount) {
    interaction.reply(`投票を終了する人数を${minCount}人未満にすることはできません`);
  } else {
    createVote(
      'banvote',
      user.tag + 'をBANする',
      'BANするが8割を超えた場合BANします\n投票終了人数 ' + count + '人',
      [['⭕', 'BANする'], ['❌', 'BANしない']],
      {
        user: user.id,
        count: count,
      },
      interaction.user,
      async data => {
        await interaction.reply({ content: '投票を作成しました', ephemeral: true })
        return interaction.channel?.send(data)
      },
    )
  }
}

export async function unbanVote(client: Client, interaction: CommandInteraction | ContextMenuInteraction) {
  const userTag = interaction.isCommand() ? interaction.options.getString('user', true) : interaction.options.getUser('user', true).id;
  interaction.guild?.bans.fetch().then(banUsers => {
    const user = banUsers.find((v) => v.user.tag == userTag)?.user;
    if (user == null) {
      interaction.reply('無効なユーザーです');
      return;
    }

    const minCount = getData('guild', interaction.guildId, ['vote-setting', 'min-count', 'unban-vote']) ?? 5;
    const count = interaction.isCommand() ? interaction.options.getInteger('count') ?? minCount : minCount;

    if (count < minCount) {
      interaction.reply(`投票を終了する人数を${minCount}人未満にすることはできません`);
    } else {
      createVote(
        'unbanvote',
        user.tag + 'をBAN解除する',
        'BAN解除するが7割を超えた場合BAN解除します\n投票終了人数 ' + count + '人',
        [['⭕', 'BAN解除する'], ['❌', 'BAN解除しない']],
        {
          user: user.id,
          count: count,
        },
        interaction.user,
        async data => {
          await interaction.reply({ content: '投票を作成しました', ephemeral: true })
          return interaction.channel?.send(data)
        },
      )
    }
  }).catch(e => console.error(e));
}

export async function voteSetting(client: Client, interaction: CommandInteraction) {
  switch (interaction.options.getSubcommand()) {
    case 'min-count': {
      setData('guild', interaction.guildId, ['vote-setting', 'min-count', interaction.options.getString('type', true)], interaction.options.getInteger('value', true));
    }
    break;
    case 'same-role': {
      setData('guild', interaction.guildId, ['vote-setting', 'same-role', interaction.options.getString('type', true)], interaction.options.getBoolean('value', true));
    }
    break;
  }
  interaction.reply('投票の設定を更新しました');
}

export async function voteCount(client: Client, interaction: ContextMenuInteraction) {
  const message = interaction.options.getMessage('message', true);
  if (!('guildId' in message)) return;
  const votes = getData('guild', message.guildId, ['votes', message.channelId]) ?? {};

  if (!Object.keys(votes ?? {}).includes(message.id)) {
    interaction.reply('このメッセージは投票ではありません')
  } else {
    let counts = {}
    for (let item of await message.reactions.cache) {
      counts[item[0]] = item[1].count - ((await item[1].users.fetch()).has(client.user?.id ?? '') ? 1 : 0);
    }
    interaction.reply('投票を集計しました');
    voteViewResult(votes[message.id], message, counts);
  }
}

export async function endVote(client: Client, interaction: ContextMenuInteraction) {
  const message = interaction.options.getMessage('message', true);
  if (message == null || !('guildId' in message)) return;
  const votes = getData('guild', message.guildId, ['votes', message.channelId]) ?? {};

  if (!Object.keys(votes ?? {}).includes(message.id)) {
    interaction.reply('このメッセージは投票ではありません')
  } else if (votes[message.id].type != 'normal') {
    interaction.reply('この投票は終了できません')
  } else if (votes[message.id].author != interaction.user.id) {
    interaction.reply('作成者以外は終了できません');
  } else {
    deleteData('guild', message.guildId, ['votes', message.channelId, message.id])

    let counts = {}
    for (let item of message.reactions.cache) {
      counts[item[0]] = item[1].count - ((await item[1].users.fetch()).has(client.user?.id ?? '') ? 1 : 0);
    }

    interaction.reply('投票を終了しました');
    voteViewResult(votes[message.id], message, counts);
  }
}
