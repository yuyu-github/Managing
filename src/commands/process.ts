import { Client, Interaction } from 'discord.js';

import { setData, getData, deleteData } from '../data';

import * as dev from '../dev';
import { vote } from '../vote/vote';
import kickvote from './kickvote/kickvote';
import banvote from './banvote/banvote';
import unbanvote from './unbanvote/unbanvote';
import voteViewResult from '../vote/view_result';

export default async function (client: Client, interaction: Interaction) {
  if (interaction.isCommand()) {
    switch (interaction.commandName) {
      case 'vote': {
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

        vote(
          'normal',
          name ?? '',
          mentions.reduce((str, i) => str + ' ' + i?.toString(), ''),
          choices,
          {
            multiple: multiple,
            count: count,
          },
          interaction.user,
          async data => {
            await interaction.reply({ content: '投票を作成しました', ephemeral: true })
            return interaction.channel?.send(data);
          }
        )
      }
      break;
      case 'rolevote': {
        const user = interaction.options.getUser('user');
        if (user == null) return;
        const role = interaction.options.getRole('role');
        if (role == null || !('createdAt' in role)) return;
        const count = interaction.options.getInteger('count') ?? 5;

        const guildRoles = interaction.guild?.roles;
        if (guildRoles == null) return;
        const roles = interaction.member?.roles;
        if (roles == undefined || !('highest' in roles)) return;
        if (guildRoles.comparePositions(role, roles.highest) > 0) {
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
            async data => {
              await interaction.reply({ content: '投票を作成しました', ephemeral: true })
              return interaction.channel?.send(data)
            },
          )
        }
      }
      break;
      case 'kickvote': {
        const user = interaction.options.getUser('user');
        if (user == null) return;
        const count = interaction.options.getInteger('count') ?? 5;
        kickvote(interaction, user, count);
      }
      break;
      case 'banvote': {
        const user = interaction.options.getUser('user');
        if (user == null) return;
        const count = interaction.options.getInteger('count') ?? 5;
        banvote(interaction, user, count);
      }
      break;
      case 'unbanvote': {
        const userTag = interaction.options.getString('user');
        if (userTag == null) return;
        const count = interaction.options.getInteger('count') ?? 5;
        unbanvote(interaction, userTag, count);
      }
      break;
      case 'translate': {
        const text = interaction.options.getString('text') ?? '';
        const source = interaction.options.getString('source');
        const target = interaction.options.getString('target');
        
        let url = `https://script.google.com/macros/s/AKfycbwSdQYdmkBKmh1FoJ86xuovTcz-Bfx9eAj3fyKskLqWVGp_ZLPK-ycKmnTTsoMxQLjY/exec?text=${text}${source == null ? '' : '&source=' + source}${target == null ? '' : '&target=' + target}`
        new Function('return import("node-fetch")')().then(({default: fetch}) => {
          fetch(url).then(res => res.text()).then(body => interaction.reply(body)).catch(e => {
            interaction.reply('翻訳に失敗しました');
            console.error(e);
          });
        }).catch(e => console.error(e));
      }
      break;
      case 'delete-message': {
        const count = interaction.options.getInteger('count') ?? 1;

        const permissions = interaction.member?.permissions;
        if (permissions == null || typeof permissions == 'string') return;
        if (count > 100) {
          interaction.reply('メッセージは100件までしか削除できません');
        } else if (!permissions.has('ADMINISTRATOR') && count > 15) {
          interaction.reply('管理者権限がない場合メッセージは15件までしか削除できません');
        } else {
          const messages = await interaction.channel?.messages.fetch({limit: count})
          messages?.each(message => message.delete());
          interaction.reply(count + '件のメッセージを削除しました');
        }
      }
      break;
    }
  } else if (interaction.isContextMenu()) {
    switch (interaction.commandName) {
      case '投票集計': {
        const message = interaction.options.getMessage('message');
        if (message == null || !('guildId' in message)) return;
        const votes = getData(message.guildId, ['votes', message.channelId]) ?? {};

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
      break;
      case '投票終了': {
        const message = interaction.options.getMessage('message');
        if (message == null || !('guildId' in message)) return;
        const votes = getData(message.guildId, ['votes', message.channelId]) ?? {};

        if (!Object.keys(votes ?? {}).includes(message.id)) {
          interaction.reply('このメッセージは投票ではありません')
        } else if (votes[message.id].type != 'normal') {
          interaction.reply('この投票は終了できません')
        } else if (votes[message.id].author != interaction.user.id) {
          interaction.reply('作成者以外は終了できません');
        } else {
          deleteData(message.guildId, ['votes', message.channelId, message.id])

          let counts = {}
          for (let item of message.reactions.cache) {
            counts[item[0]] = item[1].count - ((await item[1].users.fetch()).has(client.user?.id ?? '') ? 1 : 0);
          }

          interaction.reply('投票を終了しました');
          voteViewResult(votes[message.id], message, counts);
        }
      }
      break;
      case 'キック投票': {
        const user = interaction.options.getUser('user');
        if (user == null) return;
        kickvote(interaction, user)
      }
      break;
      case 'BAN投票': {
        const user = interaction.options.getUser('user');
        if (user == null) return;
        banvote(interaction, user)
      }
      break;
      case 'BAN解除投票': {
        const user = interaction.options.getUser('user');
        if (user == null) return;
        unbanvote(interaction, user.tag)
      }
      break;
      case 'ピン留め': {
        const message = interaction.options.getMessage('message');
        if (message == null || !('pin' in message)) return;
        await message.pin();
        interaction.reply('メッセージをピン留めしました')
      }
      break;
      case 'ピン留め解除': {
        const message = interaction.options.getMessage('message');
        if (message == null || !('unpin' in message)) return;
        await message.unpin();
        interaction.reply('メッセージをピン留め解除しました')
      }
      break;
    }
  }
}
