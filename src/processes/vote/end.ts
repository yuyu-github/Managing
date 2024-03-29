import { Client, Interaction, Message, MessageComponentInteraction, PartialMessage } from "discord.js";
import { client } from "../../main.js";
import { VoteType } from "../../data/votes.js";
import { deleteData } from "discordbot-data";
import viewResult from "./view_result.js";

export async function end(vote, message: Message | PartialMessage, interaction?: MessageComponentInteraction | null, countOnly: boolean = false) {
  let counts = {}
  let total = 0;
  for (let item of message.reactions.cache) {
    let count = item[1].count - (item[1].users.cache.has(client.user?.id ?? '') ? 1 : 0);
    counts[item[0]] = count;
    total += count;
  }
  
  if (!countOnly) {
    deleteData('guild', message.guildId!, ['vote', 'list', message.channelId, message.id])
    await interaction?.reply('投票を終了しました');
    message.edit({components: []});
  }

  await viewResult(vote, message, counts, countOnly ? interaction : null);
  if (!countOnly) await endFn[vote.type as VoteType]?.(vote, message, counts, total);
}

const endFn = {
  'role-vote': async (vote: { user: string, role: string, content: string }, msg: Message, counts: object, total: number) => {
    const user = await client.users.fetch(vote.user);
    if (user == null) return;
    const member = msg.guild?.members.resolve(user);
    if (member == null) return;
    const role = msg.guild?.roles.cache.get(vote.role);
    if (role == null) return;

    if (counts['⭕'] > total * 0.6 && vote.content.includes('add')) {
      member.roles.add(role)
        .then(async () => await msg.channel.send('投票により' + user.toString() + 'に' + role.name + 'を付与しました'))
        .catch(e => {
          msg.channel.send(user.toString() + 'に' + role.name + 'を付与できませんでした');
          console.error(e);
        });
    } else if ((counts['⭕'] > total * 0.6 && vote.content.includes('remove')) || (counts['❌'] > total * 0.6 && vote.content == 'addremove')) {
      member.roles.remove(role)
        .then(async () => await msg.channel.send('投票により' + user.toString() + 'から' + role.name + 'を剥奪しました'))
        .catch(e => {
          msg.channel.send(user.toString() + 'に' + role.name + 'を剥奪できませんでした')
          console.error(e);
        });
    } else {
      msg.channel.send(`投票により${user.toString()}に${role.name}の${{'add': '付与', 'remove': '剥奪', 'addremove': '付与/剥奪'}[vote.content]}はされませんでした`);
    }
  },
  'kick-vote': async (vote: { user: string }, msg: Message, counts: object, total: number) => {
    const user = await client.users.fetch(vote.user);
    if (user == null) return;
    const member = msg.guild?.members.resolve(user);
    if (member == null) return;

    if (counts['⭕'] > total * 0.7) {
      member.kick('投票でキックするが7割を超えたため')
        .then(async () => await msg.channel.send('投票により' + user.toString() + 'をキックしました'))
        .catch(e => {
          msg.channel.send(user.toString() + 'をキックできませんでした')
          console.error(e);
        });
    } else {
      msg.channel.send('投票により' + user.toString() + 'はキックされませんでした');
    }
  },
  'ban-vote': async (vote: { user: string }, msg: Message, counts: object, total: number) => {
    const user = await client.users.fetch(vote.user);
    if (user == null) return;

    if (counts['⭕'] > total * 0.8) {
      msg.guild?.members.ban(user, { reason: '投票でBANするが8割を超えたため' })
        .then(async () => await msg.channel.send('投票により' + user.toString() + 'をBANしました'))
        .catch(e => {
          msg.channel.send(user.toString() + 'をBANできませんでした')
          console.error(e);
        });
    } else {
      msg.channel.send('投票により' + user.toString() + 'はBANされませんでした');
    }
  },
  'unban-vote': async (vote: { user: string }, msg: Message, counts: object, total: number) => {
    const user = await client.users.fetch(vote.user);
    if (user == null) return;

    if (counts['⭕'] > total * 0.8) {
      msg.guild?.members.unban(user, '投票でBAN解除するが8割を超えたため')
        .then(async () => await msg.channel.send('投票により' + user.toString() + 'をBAN解除しました'))
        .catch(e => {
          msg.channel.send(user.toString() + 'をBAN解除できませんでした')
        });
    } else {
      msg.channel.send('投票により' + user.toString() + 'はBAN解除されませんでした');
    }
  }
} as {[key in VoteType]?: (vote: object, message: Message | PartialMessage, counts: object, total: number) => Promise<void>};
