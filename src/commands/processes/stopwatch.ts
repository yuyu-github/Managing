import { ChatInputCommandInteraction, Colors } from "discord.js";
import { getData, setData, deleteData } from "discordbot-data";

function getTimeStr(interaction: ChatInputCommandInteraction): string {
  let start = getData<number>('guild', interaction.guildId!, ['stopwatch', 'data', interaction.user.id, 'start'])!;
  let pauseTime = getData<number>('guild', interaction.guildId!, ['stopwatch', 'data', interaction.user.id, 'pauseTime']) ?? 0;
  let time = Date.now() - start - pauseTime;
  
  let timeStr = '';
  if (time / (60 * 60 * 1000) >= 1) timeStr += Math.floor(time / (60 * 60 * 1000)).toString().padStart(2, '0') + ':';
  timeStr += Math.floor((time % (60 * 60 * 1000)) / (60 * 1000)).toString().padStart(2, '0') + ':';
  timeStr += Math.floor((time % (60 * 1000)) / 1000).toString().padStart(2, '0') + '.';
  timeStr += Math.floor((time % 1000) / 10).toString().padStart(2, '0');
  return timeStr;
}

export function stopwatch(interaction: ChatInputCommandInteraction) {
  switch (interaction.options.getSubcommand(true)) {
    case 'start': {
      let pauseStart = getData<number>('guild', interaction.guildId!, ['stopwatch', 'data', interaction.user.id, 'pauseStart']);
      if (pauseStart != null) {
        setData('guild', interaction.guildId!, ['stopwatch', 'data', interaction.user.id, 'pauseTime'], Date.now() - pauseStart, '+');
        deleteData('guild', interaction.guildId!, ['stopwatch', 'data', interaction.user.id, 'pauseStart']);

        interaction.reply({
          embeds: [
            {
              title: getTimeStr(interaction),
              description: ':play_pause: ストップウォッチを再開しました',
              color: Colors.Green
            }
          ]
        })
      } else {
        if (getData('guild', interaction.guildId!, ['stopwatch', 'data', interaction.user.id, 'start']) != null) {
          interaction.reply({content: 'ストップウォッチはすでに開始されています', ephemeral: true});
          return;
        }

        setData('guild', interaction.guildId!, ['stopwatch', 'data', interaction.user.id, 'start'], Date.now());
        interaction.reply({
          embeds: [
            {
              title: '00:00.00',
              description: ':arrow_forward: ストップウォッチを開始しました',
              color: Colors.Green
            }
          ]
        })
      }
    }
    break;
    case 'stop': {
      if (getData('guild', interaction.guildId!, ['stopwatch', 'data', interaction.user.id, 'start']) == null) {
        interaction.reply({content: 'ストップウォッチが開始されていません', ephemeral: true});
        return;
      }
      let pauseStart = getData<number>('guild', interaction.guildId!, ['stopwatch', 'data', interaction.user.id, 'pauseStart']);
      if (pauseStart != null) {
        setData('guild', interaction.guildId!, ['stopwatch', 'data', interaction.user.id, 'pauseTime'], Date.now() - pauseStart, '+');
      }
      
      interaction.reply({
        embeds: [
          {
            title: getTimeStr(interaction),
            description: ':octagonal_sign: ストップウォッチを停止しました',
            color: Colors.Red
          }
        ]
      })
      deleteData('guild', interaction.guildId!, ['stopwatch', 'data', interaction.user.id])
    }
    break;
    case 'pause': {
      if (getData('guild', interaction.guildId!, ['stopwatch', 'data', interaction.user.id, 'pauseStart']) != null) {
        interaction.reply({content: 'ストップウォッチはすでに一時停止されています', ephemeral: true});
        return;
      }
      if (getData('guild', interaction.guildId!, ['stopwatch', 'data', interaction.user.id, 'start']) == null) {
        interaction.reply({content: 'ストップウォッチが開始されていません', ephemeral: true});
        return;
      }

      setData('guild', interaction.guildId!, ['stopwatch', 'data', interaction.user.id, 'pauseStart'], Date.now());
      interaction.reply({
        embeds: [
          {
            title: getTimeStr(interaction),
            description: ':pause_button: ストップウォッチを一時停止しました',
            color: Colors.Orange,
          }
        ]
      })
    }
    break;
    case 'now': {
      if (getData('guild', interaction.guildId!, ['stopwatch', 'data', interaction.user.id, 'start']) == null) {
        interaction.reply({content: 'ストップウォッチが開始されていません', ephemeral: true});
        return;
      }

      interaction.reply({
        embeds: [
          {
            title: getTimeStr(interaction),
            color: Colors.Blue,
          }
        ]
      })
    }
    break;
  }
}
