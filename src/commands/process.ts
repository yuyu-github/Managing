import { Client, Interaction } from 'discord.js';

import { setData, getData, deleteData } from '../data';

import * as votes from './processes/votes';
import * as memberData from './processes/member_data';

export default async function (client: Client, interaction: Interaction) {
  if (interaction.isCommand()) {
    switch (interaction.commandName) {
      case 'vote': {
        await votes.vote(client, interaction);
      }
      break;
      case 'rolevote': {
        await votes.roleVote(client, interaction);
      }
      break;
      case 'kickvote': {
        await votes.kickVote(client, interaction);
      }
      break;
      case 'banvote': {
        await votes.banVote(client, interaction);
      }
      break;
      case 'unbanvote': {
        await votes.unbanVote(client, interaction);
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
      case 'member-data': {
        memberData.memberData(client, interaction);
      }
    }
  } else if (interaction.isContextMenu()) {
    switch (interaction.commandName) {
      case '投票集計': {
        await votes.voteCount(client, interaction);
      }
      break;
      case '投票終了': {
        await votes.endVote(client, interaction);
      }
      break;
      case 'キック投票': {
        await votes.kickVote(client, interaction);
      }
      break;
      case 'BAN投票': {
        await votes.banVote(client, interaction);
      }
      break;
      case 'BAN解除投票': {
        await votes.unbanVote(client, interaction);
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
