import { ActionRowBuilder, BaseMessageOptions, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, CommandInteraction } from "discord.js";

export function pageEmbed<ArgsType, CommandType extends CommandInteraction = ChatInputCommandInteraction>(interaction: CommandType | ButtonInteraction, data: string[],
  pageSize: number, buttonId: string, onCommand: (interaction: CommandType) => ArgsType, onButton: (data: string[], interaction: ButtonInteraction) => ArgsType,
  mainProcess: (args: ArgsType, page: number, pageSize: number) => {message: BaseMessageOptions, buttonData?: string[], itemCount: number} | void) {
  let page = 1;
  if (interaction.isButton()) page = parseInt(data[0]);

  let args: ArgsType;
  if (interaction.isCommand()) args = onCommand(interaction);
  else args = onButton(data.slice(1), interaction);
  let result = mainProcess(args, page, pageSize);
  if (result == null) return;
  let {message, buttonData, itemCount} = result;
  buttonData ??= [];

  let newMessage: BaseMessageOptions = {
    ...message,
    embeds: [
      ...(message.embeds?.slice(0, -1) ?? []),
      {
        ...(message.embeds?.at(-1) ?? {}),
        footer: {
          text: `ページ ${page}/${itemCount == 0 ? 1 : Math.ceil(itemCount / pageSize)}`
        }
      }
    ],
    components: [
      new ActionRowBuilder<ButtonBuilder>().setComponents(
        new ButtonBuilder()
          .setCustomId(`${buttonId}_${page - 1}` + ['', ...buttonData].join('_'))
          .setLabel('◀')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page <= 1),
        new ButtonBuilder()
          .setCustomId(`${buttonId}_${page + 1}` + ['', ...buttonData].join('_'))
          .setLabel('▶')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page >= itemCount / pageSize)
      ),
      ...(message.components ?? [])
    ]
  }

  if (interaction.isCommand()) interaction.reply(newMessage);
  else interaction.update(newMessage);
}
