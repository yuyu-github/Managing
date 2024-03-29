import { ActionRowBuilder, ButtonInteraction, ChatInputCommandInteraction, Client, CommandInteraction, ContextMenuCommandInteraction, ModalBuilder, ModalSubmitInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputComponent, TextInputStyle } from "discord.js";

import { setData, getData, deleteData } from 'discordbot-data';

import { vote as createVote } from '../../processes/vote/vote.js';
import voteViewResult from '../../processes/vote/view_result.js';
import { client } from "../../main.js";
import { getAllowedMentions } from "../../utils/mention.js";
import { canRoleManage } from "../../utils/role.js";
import { end } from "../../processes/vote/end.js";

export function vote(interaction: ChatInputCommandInteraction) {
  const multiple = interaction.options.getBoolean('multiple')
  const count = interaction.options.getInteger('count') ?? 0;
  const time = interaction.options.getString('time');
  const mentions = [...Array(4).keys()].map(i => interaction.options.getMentionable('mention' + (i + 1))).filter(i => i != null);

  const modal = new ModalBuilder()
    .setCustomId('vote')
    .setTitle('投票')
  modal.addComponents(new ActionRowBuilder<TextInputBuilder>().setComponents(
    new TextInputBuilder()
      .setCustomId('name')
      .setLabel('名前')
      .setStyle(TextInputStyle.Short)
  ));
  modal.addComponents(new ActionRowBuilder<TextInputBuilder>().setComponents(
    new TextInputBuilder()
      .setCustomId('choices')
      .setLabel('選択肢(改行で区切る)')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false)
  ));
  interaction.showModal(modal)

  interaction.awaitModalSubmit({ filter: i => i.customId == 'vote' && i.user.id == interaction.user.id, time: 300000 }).then(interaction => {
    const name = interaction.fields.getTextInputValue('name');
    let choicesName = interaction.fields.getTextInputValue('choices').split('\n').map(i => i.trim()).filter(i => i != '');

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
        multiple: multiple
      },
      interaction.user,
      {count, time},
      async data => {
        await interaction.reply({ content: '投票を作成しました', ephemeral: true })
        return interaction.channel?.send({
          content: mentions.length > 0 ? mentions.reduce((str, i) => str + ' ' + i?.toString(), '') : undefined,
          ...data,
        });
      },
      getAllowedMentions(interaction.member)
    )
  })
}

export async function roleVote(interaction: ChatInputCommandInteraction) {
  const user = interaction.options.getUser('user', true);
  const role = interaction.options.getRole('role', true);
  if (!('createdAt' in role)) return;
  const content = interaction.options.getString('content') ?? 'add';
  const contentText = {'add': '付与', 'remove': '剥奪', 'addremove': '付与/剥奪'}[content];

  const guildRoles = interaction.guild?.roles;
  if (guildRoles == null) return;
  const roles = interaction.member?.roles;
  if (roles == undefined || !('highest' in roles)) return;

  const count = interaction.options.getInteger('count') ?? 0;
  const time = interaction.options.getString('time');

  if (!canRoleManage(interaction.member, role)) {
    interaction.reply('自分より上のロールの投票をとることはできません');
  } else if (!role.editable) {
    interaction.reply(`${role.name}を${contentText}する権限がありません`)
  } else {
    const description = {
      'add': '付与するが6割を超えた場合ロールを付与します',
      'remove': '剥奪するが6割を超えた場合ロールを剥奪します',
      'addremove': '付与するが6割を超えた場合ロールを付与、付与しないが6割を超えた場合ロールを剥奪します',
    }[content] ?? '';

    createVote(
      'role-vote',
      user.username + 'に' + `${role.name}を${contentText}する`,
      description,
      [['⭕', `${content.includes('add') ? '付与' : '削除'}する`], ['❌', `${content.includes('add') ? '付与' : '削除'}しない`]],
      {
        user: user.id,
        role: role.id,
        content: content
      },
      interaction.user,
      {count, time},
      async data => {
        await interaction.reply({ content: '投票を作成しました', ephemeral: true })
        return interaction.channel?.send(data)
      },
    )
  }
}

export async function kickVote(interaction: ChatInputCommandInteraction) {
  const user = interaction.options.getUser('user', true);
  const member = interaction.guild?.members.resolve(user);
  if (member == null) return;

  const guildRoles = interaction.guild?.roles;
  if (guildRoles == null) return;
  const roles = interaction.member?.roles;
  if (roles == null || Array.isArray(roles)) return;

  const count = interaction.options.getInteger('count') ?? 0;
  const time = interaction.options.getString('time');

  if (!member.kickable) {
    interaction.reply(user.toString() + 'をキックする権限がありません')
  } else if (!canRoleManage(interaction.member, member.roles.highest) || interaction.guild?.ownerId == member.id) {
    interaction.reply('自分より上のロールがある人の投票をとることはできません');
  } else {
    createVote(
      'kick-vote',
      user.username + 'をキックする',
      'キックするが7割を超えた場合キックします',
      [['⭕', 'キックする'], ['❌', 'キックしない']],
      {
        user: user.id
      },
      interaction.user,
      {count, time},
      async data => {
        await interaction.reply({ content: '投票を作成しました', ephemeral: true })
        return interaction.channel?.send(data)
      },
    )
  }
}

export async function banVote(interaction: ChatInputCommandInteraction) {
  const user = interaction.options.getUser('user', true);
  const member = interaction.guild?.members.resolve(user);
  if (member == null) return;

  const guildRoles = interaction.guild?.roles;
  if (guildRoles == null) return;
  const roles = interaction.member?.roles;
  if (roles == null || Array.isArray(roles)) return;

  const count = interaction.options.getInteger('count') ?? 0;
  const time = interaction.options.getString('time');

  if (!member.bannable) {
    interaction.reply(user.toString() + 'をBANする権限がありません')
  } else if (!canRoleManage(interaction.member, member.roles.highest) || interaction.guild?.ownerId == member.id) {
    interaction.reply('自分より上のロールがある人の投票をとることはできません');
  } else {
    createVote(
      'ban-vote',
      user.username + 'をBANする',
      'BANするが8割を超えた場合BANします\n投票終了人数 ' + count + '人',
      [['⭕', 'BANする'], ['❌', 'BANしない']],
      {
        user: user.id
      },
      interaction.user,
      {count, time},
      async data => {
        await interaction.reply({ content: '投票を作成しました', ephemeral: true })
        return interaction.channel?.send(data)
      },
    )
  }
}

export async function unbanVote(interaction: ChatInputCommandInteraction) {
  const userNameOrId = interaction.options.getString('user', true);
  interaction.guild?.bans.fetch().then(banUsers => {
    const user = banUsers.find((v) => v.user.username == userNameOrId || v.user.id == userNameOrId)?.user;
    if (user == null) {
      interaction.reply('無効なユーザーです');
      return;
    }

    const count = interaction.options.getInteger('count') ?? 0;
    const time = interaction.options.getString('time');

    
    createVote(
      'unban-vote',
      user.username + 'をBAN解除する',
      'BAN解除するが8割を超えた場合BAN解除します\n投票終了人数 ' + count + '人',
      [['⭕', 'BAN解除する'], ['❌', 'BAN解除しない']],
      {
        user: user.id
      },
      interaction.user,
      {count, time},
      async data => {
        await interaction.reply({ content: '投票を作成しました', ephemeral: true })
        return interaction.channel?.send(data)
      },
    )
  }).catch(e => console.error(e));
}

export async function countVote(interaction: ButtonInteraction) {
  const message = interaction.message;
  const votes = getData('guild', message.guildId!, ['vote', 'list', message.channelId]) ?? {};

  if (!Object.keys(votes ?? {}).includes(message.id)) {
    interaction.reply({content: 'このメッセージは投票ではありません', ephemeral: true})
  } else {
    await interaction.deferReply()
    end(votes[message.id], message, interaction, true);
  }
}

export async function endVote(interaction: ButtonInteraction) {
  const message = interaction.message;
  const votes = getData('guild', message.guildId!, ['vote', 'list', message.channelId]) ?? {};
  if (!Object.keys(votes ?? {}).includes(message.id)) {
    interaction.reply({content: 'このメッセージは投票ではありません', ephemeral: true})
  } else if (votes[message.id].author != interaction.user.id) {
    interaction.reply({content: '作成者以外は終了できません', ephemeral: true});
  } else {
    end(votes[message.id], message, interaction);
  }
}
