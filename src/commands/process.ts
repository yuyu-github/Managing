import { Client, Interaction } from 'discord.js';

import { setData, getData, deleteData } from 'discordbot-data';

import * as votes from './processes/votes';
import * as stats from './processes/stats';

export default async function (client: Client, interaction: Interaction) {
  const fetch = (await new Function('return import("node-fetch")')()).default;

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
      case 'vote-setting': {
        votes.voteSetting(client, interaction);
      }
      break;
      case 'stats': {
        stats.stats(client, interaction);
      }
      break;
      case 'member-stats': {
        stats.memberStats(client, interaction);
      }
      break;

      case 'translate': {
        const text = interaction.options.getString('text') ?? '';
        const source = interaction.options.getString('source');
        const target = interaction.options.getString('target');

        interaction.deferReply();
        
        let url = `https://script.google.com/macros/s/AKfycbwSdQYdmkBKmh1FoJ86xuovTcz-Bfx9eAj3fyKskLqWVGp_ZLPK-ycKmnTTsoMxQLjY/exec?text=${text}${source == null ? '' : '&source=' + source}${target == null ? '' : '&target=' + target}`
        fetch(url).then(res => res.text()).then(body => interaction.followUp(body)).catch(e => {
          interaction.followUp('翻訳に失敗しました');
          console.error(e);
        });
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
      case 'forward': {
        switch (interaction.options.getSubcommand()) {
          case 'add': {
            const channel = interaction.options.getChannel('channel', true);
            const webhook = interaction.options.getString('webhook', true);

            setData('guild', interaction.guildId, ['forward', channel.id], webhook, (a, b) => ((a ?? []) as (Object | null)[]).includes(b) ? a : [...((a ?? []) as string[]), b])
            interaction.reply('メッセージの転送を設定しました');
          }
          break;
          case 'remove': {
            const channel = interaction.options.getChannel('channel', true);
            const webhook = interaction.options.getString('webhook');

            if (webhook == null) deleteData('guild', interaction.guildId, ['forward', channel.id]);
            else setData('guild', interaction.guildId, ['forward', channel.id], null, a => {
              let array: string[] | null = a as string[] | null;
              if (array != null && array.indexOf(webhook) >= 0) array.splice(array.indexOf(webhook), 1);
              if (array?.length == 0) array = null;
              return array;
            });
            interaction.reply('メッセージの転送を解除しました');
          }
          break;
        }
      }
      break;
      case 'changes': {
        stats.changes(client, interaction);
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
