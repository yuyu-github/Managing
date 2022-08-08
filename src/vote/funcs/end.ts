import { Client, Message } from "discord.js";

export default {
  'rolevote': async (client: Client, vote: { user: string, role: string }, msg: Message, counts: object, total: number) => {
    const user = await client.users.fetch(vote.user);
    if (user == null) return;
    const member = msg.guild?.members.resolve(user);
    if (member == null) return;
    const role = msg.guild?.roles.cache.get(vote.role);
    if (role == null) return;

    if (counts['⭕'] > total * 0.6) {
      member.roles.add(role)
        .then(() => msg.channel.send('投票により' + user.toString() + 'に' + role.name + 'を付与しました'))
        .catch(e => {
          msg.channel.send(user.toString() + 'に' + role.name + 'を付与できませんでした');
          console.error(e);
        });
    } else if (counts['❌'] > total * 0.6) {
      member.roles.remove(role)
        .then(() => msg.channel.send('投票により' + user.toString() + 'から' + role.name + 'を削除しました'))
        .catch(e => {
          msg.channel.send(user.toString() + 'に' + role.name + 'を削除できませんでした')
          console.error(e);
        });
    } else {
      msg.channel.send('投票により' + user.toString() + 'に' + role.name + 'の付与や削除はされませんでした');
    }
  },
  'kickvote': async (client: Client, vote: { user: string }, msg: Message, counts: object, total: number) => {
    const user = await client.users.fetch(vote.user);
    if (user == null) return;
    const member = msg.guild?.members.resolve(user);
    if (member == null) return;

    if (counts['⭕'] > total * 0.7) {
      member.kick('投票でキックするが7割を超えたため')
        .then(() => msg.channel.send('投票により' + user.toString() + 'をキックしました'))
        .catch(e => {
          msg.channel.send(user.toString() + 'をキックできませんでした')
          console.error(e);
        });
    } else {
      msg.channel.send('投票により' + user.toString() + 'はキックされませんでした');
    }
  },
  'banvote': async (client: Client, vote: { user: string }, msg: Message, counts: object, total: number) => {
    const user = await client.users.fetch(vote.user);
    if (user == null) return;

    if (counts['⭕'] > total * 0.8) {
      msg.guild?.members.ban(user, { reason: '投票でBANするが8割を超えたため' })
        .then(() => msg.channel.send('投票により' + user.toString() + 'をBANしました'))
        .catch(e => {
          msg.channel.send(user.toString() + 'をBANできませんでした')
          console.error(e);
        });
    } else {
      msg.channel.send('投票により' + user.toString() + 'はBANされませんでした');
    }
  },
  'unbanvote': async (client: Client, vote: { user: string }, msg: Message, counts: object, total: number) => {
    const user = await client.users.fetch(vote.user);
    if (user == null) return;

    if (counts['⭕'] > total * 0.7) {
      msg.guild?.members.unban(user, '投票でBAN解除するが7割を超えたため')
        .then(() => msg.channel.send('投票により' + user.toString() + 'をBAN解除しました'))
        .catch(e => {
          msg.channel.send(user.toString() + 'をBAN解除できませんでした')
        });
    } else {
      msg.channel.send('投票により' + user.toString() + 'はBAN解除されませんでした');
    }
  }
};
