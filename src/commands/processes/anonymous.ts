import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, Client, Colors, Interaction, ModalBuilder, NewsChannel, StageChannel, TextChannel, TextInputBuilder, TextInputStyle, VoiceChannel, WebhookClient } from "discord.js";
import { setData, getData, deleteData } from 'discordbot-data';
import { getWebhook } from "../../webhook";
import { client } from "../../main";

export async function panel(interaction: ChatInputCommandInteraction) {
  const channel = interaction.options.getChannel('channel', true);
  const defaultName = interaction.options.getChannel('default-name') ?? '匿名';
  if (interaction.guild == null || interaction.channel == null) return;

  let message = await interaction.channel.send({
    embeds: [
      {
        title: '匿名送信パネル',
        description: channel.toString() + 'に送信',
        color: Colors.DarkerGrey,
      }
    ],
    components: [
      new ActionRowBuilder<ButtonBuilder>().setComponents(
        new ButtonBuilder()
          .setCustomId('anonymous-send')
          .setLabel('送信')
          .setStyle(ButtonStyle.Secondary)
      )
    ]
  })
  interaction.reply({content: '匿名送信パネルを作成しました', ephemeral: true});

  setData('guild', interaction.guild.id, ['anonymous', 'panels', message.id, 'channel'], channel.id)
  setData('guild', interaction.guild.id, ['anonymous', 'panels', message.id, 'default-name'], defaultName)
}

export function send(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId('anonymous-send')
    .setTitle('送信内容')
  modal.setComponents(
    new ActionRowBuilder<TextInputBuilder>().setComponents(
      new TextInputBuilder()
        .setCustomId('content')
        .setLabel('内容')
        .setStyle(TextInputStyle.Paragraph)
    ),
    new ActionRowBuilder<TextInputBuilder>().setComponents(
      new TextInputBuilder()
        .setCustomId('name')
        .setLabel('名前(空白で匿名)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
    )
  );
  interaction.showModal(modal)

  interaction.awaitModalSubmit({ filter: i => i.customId == 'anonymous-send' && i.user.id == interaction.user.id, time: 150000 }).then(async modalInteraction => {
    let name = modalInteraction.fields.getTextInputValue('name');
    const content = modalInteraction.fields.getTextInputValue('content');
    if (interaction.guild == null) return;
    if (name == '') name = getData('guild', interaction.guild.id, ['anonymous', 'panels', interaction.message.id, 'default-name']) as string;
    const channelId = getData('guild', interaction.guild.id, ['anonymous', 'panels', interaction.message.id, 'channel']) as string;
    const channel = await client.channels.fetch(channelId) as TextChannel | VoiceChannel | NewsChannel | StageChannel | null;
    if (channel == null) return;
    
    let webhook = await getWebhook(channel);
    webhook.send({
      username: name,
      content: content,
      allowedMentions: {parse: []}
    })

    modalInteraction.deferUpdate()
  })
}
