import { APIEmbedField, AttachmentBuilder, BaseInteraction, ChannelType, Client, CommandInteraction, EmbedBuilder, Interaction, PermissionFlagsBits } from 'discord.js';

import { setData, getData, deleteData } from 'discordbot-data';

import * as votes from './processes/votes';
import * as stats from './processes/stats';
import * as info from './processes/info';
import * as rolePanel from './processes/role_panel';
import * as anonymous from './processes/anonymous';
import * as lottery from './processes/lottery';
import { parseTimeString } from '../scheduler/parse_time';
import { schedule } from '../scheduler/scheduler';

export default async function (client: Client, interaction: Interaction) {
  if (interaction.channel == null || interaction.channel?.isDMBased()) {
    if ('reply' in interaction) interaction.reply({content: 'DMでは実行できません', ephemeral: true});
    return;
  }

  if (interaction.isChatInputCommand()) {
    switch (interaction.commandName) {
      case 'vote': votes.vote(client, interaction); break;
      case 'rolevote': await votes.roleVote(client, interaction); break;
      case 'kickvote': await votes.kickVote(client, interaction); break;
      case 'banvote': await votes.banVote(client, interaction); break;
      case 'unbanvote': await votes.unbanVote(client, interaction); break;
      case 'vote-setting': votes.voteSetting(client, interaction); break;
      case 'stats': stats.stats(client, interaction); break;
      case 'member-stats': stats.memberStats(client, interaction); break;
      case 'changes': stats.changes(client, interaction); break;
      case 'avatar': info.avatar(client, interaction); break;
      case 'user-info': info.userInfo(client, interaction); break;
      case 'server-info': info.serverInfo(client, interaction); break;
      case 'channel-info': info.channelInfo(client, interaction); break;
      case 'role-info': await info.roleInfo(client, interaction); break;
      case 'role-panel': rolePanel.rolePanelCommand(client, interaction); break;
      case 'anonymous-panel': await anonymous.panel(client, interaction); break;
      case 'lottery': await lottery.lottery(client, interaction); break;

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
      case 'keep': {
        const permissions = interaction.member?.permissions;
        if (typeof permissions != 'string' && !permissions?.has(PermissionFlagsBits.ManageGuild)) {
          interaction.reply('設定を変更する権限がありません');
        }

        const typeMap = {
          role: 'ロール',
          nick: 'ニックネーム'
        }

        const type = interaction.options.getString('type', true);
        const value = interaction.options.getBoolean('value', true);
        if (type == 'all') {
          Object.keys(typeMap).forEach(v => setData('guild', interaction.guildId, ['keep', 'enabled', v], value))
        } else setData('guild', interaction.guildId, ['keep', 'enabled', type], value);
        interaction.reply(`再参加時に${type == 'all' ? '' : typeMap[type] + 'を'}保持${value ? 'する' : 'しない'}ように設定しました`);
      }
      break;
      case 'timeout': {
        const permissions = interaction.member?.permissions;
        if (typeof permissions != 'string' && !permissions?.has(PermissionFlagsBits.ModerateMembers)) {
          interaction.reply('タイムアウトする権限がありません');
        }

        const user = interaction.options.getUser('user', true);
        const member = interaction.guild?.members.resolve(user);
        if (member == null) return;

        const second = interaction.options.getInteger('second') ?? 0;
        const minute = interaction.options.getInteger('minute') ?? 0;
        const hour = interaction.options.getInteger('hour') ?? 0;
        const day = interaction.options.getInteger('day') ?? 0;
        const specifiedDate = interaction.options.getString('specified-date') ?? '';
        const specifiedTime = interaction.options.getString('specified-time') ?? '';

        let timeout: number = 0;
        if (specifiedDate != '' || specifiedTime != '') {
          let date = new Date();
          date.setHours(0, 0, 0, 0)
          if (specifiedDate != '') {
            let match = specifiedDate.match(/^((?<year>([0-9]{2})?[0-9]{2})\/)?(?<month>[01]?[0-9])\/(?<day>[0-3]?[0-9])$/);
            if (match == null || parseInt(match.groups!.month) > 12 || parseInt(match.groups!.day) > 31) {
              interaction.reply('無効な日付指定です'); return;
            }
            let year = match.groups!.year == null ? new Date().getFullYear() :
              match.groups!.year.length == 2 ? Math.floor(new Date().getFullYear() / 100) + parseInt(match.groups!.year) : parseInt(match.groups!.year);
            date.setFullYear(year, parseInt(match.groups!.month) - 1, parseInt(match.groups!.day));
            if (isNaN(date.getTime())) {
              interaction.reply('無効な日付指定です'); return;
            }
          }
          if (specifiedTime != '') {
            let match = specifiedTime.match(/^(?<hour>[0-2]?[0-9]):(?<minute>[0-5]?[0-9])$/);
            if (match == null || parseInt(match.groups!.hour) >= 24 || parseInt(match.groups!.minute) >= 60) {
              interaction.reply('無効な時刻指定です'); return;
            }
            date.setHours(parseInt(match.groups!.hour), parseInt(match.groups!.minute));
          }
          timeout = date.getTime() - new Date().getTime();
        } else {
          timeout += second * 1 * 1000;
          timeout += minute * 60 * 1000;
          timeout += hour * 60 * 60 * 1000;
          timeout += day * 24 * 60 * 60 * 1000;
        }

        if (timeout < 0) {
          interaction.reply('日時が現在よりも昔です'); 
        } else if (timeout > 28 * 24 * 60 * 60 * 1000) {
          interaction.reply('タイムアウト期間は28日以内にしてください')
        } else {
          member.timeout(timeout);
          interaction.reply(`<t:${Math.floor((new Date().getTime() + timeout) / 1000)}>まで${member.toString()}をタイムアウトしました`)
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

        schedule('end-timer', {message, channel: interaction.channel.id}, time);
        interaction.reply(`<t:${Math.floor(time / 1000)}:R>にタイマーを設定しました`);
      }
    }
  } else if (interaction.isContextMenuCommand()) {
    switch (interaction.commandName) {
      case 'キック投票': await votes.kickVote(client, interaction); break;
      case 'BAN投票': await votes.banVote(client, interaction); break;
      
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
    switch (interaction.customId) {
      case 'count-vote': await votes.countVote(client, interaction); break;
      case 'end-vote': await votes.endVote(client, interaction); break;
      case 'select-role-panel': rolePanel.selectRolePanel(client, interaction); break;
      case 'anonymous-send': anonymous.send(client, interaction); break;
      case 'entry-lottery': lottery.entry(client, interaction); break;
      case 'leave-lottery': lottery.leave(client, interaction); break;
      case 'start-lottery': lottery.start(client, interaction); break;
    }
  } else if (interaction.isStringSelectMenu()) {
    switch (interaction.customId) {
      case 'role-panel': rolePanel.rolePanel(client, interaction); break;
    }
  } else if (interaction.isRoleSelectMenu()) {
    switch (interaction.customId) {
      case 'add-role-panel': rolePanel.addRolePanel(client, interaction); break;
      case 'remove-role-panel': rolePanel.removeRolePanel(client, interaction); break;
    }
  }
}
