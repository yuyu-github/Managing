import { APIEmbedField, AttachmentBuilder, BaseInteraction, ChannelType, Client, Colors, CommandInteraction, EmbedBuilder, Interaction, PermissionFlagsBits } from 'discord.js';
import { setData, getData, deleteData } from 'discordbot-data';
import { schedule } from '../scheduler/scheduler.js';
import { parseTimeString } from '../scheduler/parse_time.js';

import * as votes from './processes/votes.js';
import * as stats from './processes/stats.js';
import * as info from './processes/info.js';
import * as rolePanel from './processes/role_panel.js';
import * as anonymous from './processes/anonymous.js';
import * as lottery from './processes/lottery.js';
import * as stopwatch from './processes/stopwatch.js';

export default async function (interaction: Interaction) {
  if (interaction.channel == null || interaction.channel?.isDMBased()) {
    if ('reply' in interaction) interaction.reply({content: 'DMでは実行できません', ephemeral: true});
    return;
  }

  if (interaction.isChatInputCommand()) {
    switch (interaction.commandName) {
      case 'vote': votes.vote(interaction); break;
      case 'rolevote': await votes.roleVote(interaction); break;
      case 'kickvote': await votes.kickVote(interaction); break;
      case 'banvote': await votes.banVote(interaction); break;
      case 'unbanvote': await votes.unbanVote(interaction); break;
      case 'vote-setting': votes.voteSetting(interaction); break;
      case 'stats': stats.stats(interaction); break;
      case 'member-stats': stats.memberStatsCommand(interaction); break;
      case 'changes': stats.changes(interaction); break;
      case 'avatar': info.avatar(interaction); break;
      case 'user-info': info.userInfo(interaction); break;
      case 'server-info': info.serverInfo(interaction); break;
      case 'channel-info': info.channelInfo(interaction); break;
      case 'role-info': await info.roleInfo(interaction); break;
      case 'role-panel': rolePanel.rolePanelCommand(interaction); break;
      case 'anonymous-panel': await anonymous.panel(interaction); break;
      case 'lottery': await lottery.lottery(interaction); break;
      case 'stopwatch': await stopwatch.stopwatch(interaction); break;

      case 'help': {
        interaction.reply({
          embeds: [
            {
              title: 'ヘルプ',
              description: '**Wiki:** https://github.com/yuyu-github/Managing/wiki',
              color: Colors.Blue
            }
          ]
        })
      }
      break;
      case 'translate': {
        const text = interaction.options.getString('text') ?? '';
        const source = interaction.options.getString('source');
        const target = interaction.options.getString('target');

        interaction.deferReply();
        
        let url = `https://script.google.com/macros/s/AKfycbwSdQYdmkBKmh1FoJ86xuovTcz-Bfx9eAj3fyKskLqWVGp_ZLPK-ycKmnTTsoMxQLjY/exec?text=${encodeURIComponent(text)}${source == null ? '' : '&source=' + source}${target == null ? '' : '&target=' + target}`
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
        } else if (!permissions.has(PermissionFlagsBits.Administrator) && count > 15) {
          interaction.reply('管理者権限がない場合メッセージは15件までしか削除できません');
        } else {
          const messages = await interaction.channel?.messages.fetch({limit: count})
          messages?.forEach(message => message.delete());
          interaction.reply(count + '件のメッセージを削除しました');
        }
      }
      break;
      case 'forward': {
        switch (interaction.options.getSubcommand()) {
          case 'add': {
            const channel = interaction.options.getChannel('channel', true);
            const webhook = interaction.options.getString('webhook', true);

            setData('guild', interaction.guildId!, ['forward', channel.id], webhook, (a, b) => a != null && (a as string[]).includes(b as string) ? a : [...((a ?? []) as string[]), b])
            interaction.reply('メッセージの転送を設定しました');
          }
          break;
          case 'remove': {
            const channel = interaction.options.getChannel('channel', true);
            const webhook = interaction.options.getString('webhook');

            if (webhook == null) deleteData('guild', interaction.guildId!, ['forward', channel.id]);
            else setData('guild', interaction.guildId!, ['forward', channel.id], null, a => {
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
      case 'keep': {
        const typeMap = {
          role: 'ロール',
          nick: 'ニックネーム'
        }

        const type = interaction.options.getString('type', true);
        const value = interaction.options.getBoolean('value', true);
        if (type == 'all') {
          Object.keys(typeMap).forEach(v => setData('guild', interaction.guildId!, ['keep', 'enabled', v], value))
        } else setData('guild', interaction.guildId!, ['keep', 'enabled', type], value);
        interaction.reply(`再参加時に${type == 'all' ? '' : typeMap[type] + 'を'}保持${value ? 'する' : 'しない'}ように設定しました`);
      }
      break;
      case 'timeout': {
        const user = interaction.options.getUser('user', true);
        const member = interaction.guild?.members.resolve(user);
        const timeStr = interaction.options.getString('time', true);
        const time = parseTimeString(timeStr, true);
        if (member == null || time == null) return;
        if (!member.moderatable) {
          interaction.reply('ユーザーをタイムアウトする権限がありません');
          return;
        }

        if (time < 0) {
          interaction.reply('日時が現在よりも昔です'); 
        } else if (time > 28 * 24 * 60 * 60 * 1000) {
          interaction.reply('タイムアウト期間は28日以内にしてください')
        } else {
          member.timeout(time);
          interaction.reply(`<t:${Math.floor((new Date().getTime() + time) / 1000)}>まで${member.toString()}をタイムアウトしました`)
        }
      }
      break;
      case 'timer': {
        const message = interaction.options.getString('message') ?? '';
        const timeStr = interaction.options.getString('time', true);
        const time = parseTimeString(timeStr);
        if (time == null) {
          interaction.reply('無効な日付指定です'); return;
        }

        schedule('end-timer', {message, channel: interaction.channel.id, owner: interaction.user.id}, time);
        interaction.reply(`<t:${Math.floor(time / 1000)}:R>にタイマーを設定しました`);
      }
      break;
      case 'join-message': {
        switch (interaction.options.getSubcommand(true)) {
          case 'set': {
            const message = interaction.options.getString('message', true);
            const channel = interaction.options.getChannel('channel') ?? interaction.guild!.systemChannel;
            if (channel == null) {
              interaction.reply({content: 'チャンネルを指定してください', ephemeral: true});
              return;
            }

            setData('guild', interaction.guildId!, ['join-message'], {message, channel: channel.id});
            interaction.reply('参加メッセージを設定しました');
          }
          break;
          case 'unset': {
            deleteData('guild', interaction.guildId!, ['join-message']);
            interaction.reply('参加メッセージの設定を解除しました');
          }
          break;
        }
      }
      break;
      case 'leave-message': {
        switch (interaction.options.getSubcommand(true)) {
          case 'set': {
            const message = interaction.options.getString('message', true);
            const channel = interaction.options.getChannel('channel') ?? interaction.guild!.systemChannel;
            if (channel == null) {
              interaction.reply({content: 'チャンネルを指定してください', ephemeral: true});
              return;
            }

            setData('guild', interaction.guildId!, ['leave-message'], {message, channel: channel.id});
            interaction.reply('脱退メッセージを設定しました');
          }
          break;
          case 'unset': {
            deleteData('guild', interaction.guildId!, ['leave-message']);
            interaction.reply('脱退メッセージの設定を解除しました');
          }
          break;
        }
      }
      break;
    }
  } else if (interaction.isContextMenuCommand()) {
    switch (interaction.commandName) {
      case 'キック投票': await votes.kickVote(interaction); break;
      case 'BAN投票': await votes.banVote(interaction); break;
      
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
  } else if (interaction.isButton()) {
    let name = interaction.customId.split('_')[0];
    let data = interaction.customId.split('_').slice(1);
    switch (name) {
      case 'count-vote': await votes.countVote(interaction); break;
      case 'end-vote': await votes.endVote(interaction); break;
      case 'stats-page': await stats.stats(interaction, parseInt(data[0])); break;
      case 'member-stats-page': await stats.memberStatsButton(interaction, data); break;
      case 'select-role-panel': rolePanel.selectRolePanel(interaction); break;
      case 'anonymous-send': anonymous.send(interaction); break;
      case 'entry-lottery': lottery.entry(interaction); break;
      case 'leave-lottery': lottery.leave(interaction); break;
      case 'start-lottery': lottery.start(interaction); break;
    }
  } else if (interaction.isStringSelectMenu()) {
    switch (interaction.customId) {
      case 'role-panel': rolePanel.rolePanel(interaction); break;
    }
  } else if (interaction.isRoleSelectMenu()) {
    switch (interaction.customId) {
      case 'add-role-panel': rolePanel.addRolePanel(interaction); break;
      case 'remove-role-panel': rolePanel.removeRolePanel(interaction); break;
    }
  }
}
