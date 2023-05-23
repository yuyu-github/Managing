import { Client, Message } from "discord.js";
import { client } from "../../../main.js";

export default {
  'rolevote': async (vote: { user: string, role: string, content: string }, msg: Message, counts: object, total: number) => {
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
  'kickvote': async (vote: { user: string }, msg: Message, counts: object, total: number) => {
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
  'banvote': async (vote: { user: string }, msg: Message, counts: object, total: number) => {
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
  'unbanvote': async (vote: { user: string }, msg: Message, counts: object, total: number) => {
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
};
