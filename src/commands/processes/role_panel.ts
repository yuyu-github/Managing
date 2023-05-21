import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Channel, ChatInputCommandInteraction, Client, Colors, GuildMemberRoleManager, Message, PermissionFlagsBits, RoleSelectMenuBuilder, RoleSelectMenuInteraction, StringSelectMenuBuilder, StringSelectMenuComponent, StringSelectMenuInteraction, StringSelectMenuOptionBuilder } from "discord.js";
import { getData, setData } from "discordbot-data";

export async function rolePanel(client: Client, interaction: StringSelectMenuInteraction) {
  interaction.message.edit({components: interaction.message.components})
  
  if (interaction.values[0] == '_') {
    createAddOrRemoveRolePanel(interaction, 'add');
    return;
  }

  let selectedRole = interaction.values[0];
  let roles = interaction.member?.roles;
  if (!(roles instanceof GuildMemberRoleManager)) return;
  
  try {
    if (roles.cache.has(selectedRole)) {
      await roles.remove(selectedRole);
      interaction.reply({content: 'ロールを剥奪しました', ephemeral: true});
    } else {
      await roles.add(selectedRole);
      interaction.reply({content: 'ロールを付与しました', ephemeral: true});
    }
  }
  catch {
    interaction.reply({content: 'ロールを変更できませんでした', ephemeral: true});
  }
}

export function rolePanelCommand(client: Client, interaction: ChatInputCommandInteraction) {
  switch (interaction.options.getSubcommand(true)) {
    case 'create': {
      interaction.reply({content: 'パネルを作成しました', ephemeral: true})
      interaction.channel?.send({
        embeds: [
          {
            title: 'ロールパネル',
            color: Colors.Purple,
          }
        ],
        components: [
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('role-panel')
              .setPlaceholder('ロールを選択')
              .addOptions(new StringSelectMenuOptionBuilder().setLabel('ロールを追加してください').setValue('_'))
          ),
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId('select-role-panel')
              .setLabel('パネルを選択')
              .setStyle(ButtonStyle.Secondary)
          ),
        ]
      }).then((msg: Message) => setData('guild', interaction.guildId, ['role-panel', 'selected-panel'], [msg.channelId, msg.id]))
    }
    break;
    case 'add': 
    case 'remove': {
      createAddOrRemoveRolePanel(interaction, interaction.options.getSubcommand(true));
    }
    break;
  }
}
function createAddOrRemoveRolePanel(interaction: ChatInputCommandInteraction | StringSelectMenuInteraction, type: string) {
  if (getData('guild', interaction.guildId, ['role-panel', 'selected-panel']) == null) {
    interaction.reply({content: 'パネルが選択されていません', ephemeral: true});
    return;
  }
  interaction.reply({
    components: [new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
      new RoleSelectMenuBuilder()
        .setCustomId(type + '-role-panel')
        .setMaxValues(10)
        .setPlaceholder('ロールを選択')
      )],
    ephemeral: true
  })
}

export function selectRolePanel(client: Client, interaction: ButtonInteraction) {
  const permissions = interaction.member?.permissions;
  if (permissions == null || typeof permissions == 'string') return;
  if (permissions.has(PermissionFlagsBits.ManageRoles)) {
    setData('guild', interaction.guildId, ['role-panel', 'selected-panel'], [interaction.message.channelId, interaction.message.id])
    interaction.reply({content: 'パネルを選択しました', ephemeral: true});
  } else {
    interaction.reply({content: 'パネルを操作する権限がありません', ephemeral: true})
  }
}
async function getSelectedRolePanel(client: Client, guildId: string) {
  let rolePanelId = getData('guild', guildId, ['role-panel', 'selected-panel']) as [string, string] | null;
  let channel: Channel | undefined, message: Message | undefined;
  if (rolePanelId != null) {
    channel = client.channels.cache.get(rolePanelId[0]);
    if (channel != null && 'messages' in channel) message = await channel.messages.fetch(rolePanelId[1]);
  }
  return message;
}

export async function addRolePanel(client: Client, interaction: RoleSelectMenuInteraction) {
  let message = await getSelectedRolePanel(client, interaction.guildId ?? '')
  if (message == null) {
    interaction.reply({content: 'パネルが選択されていません', ephemeral: true});
    return;
  }

  let roles = interaction.roles;
  let options = (message.components[0].components[0] as StringSelectMenuComponent).options;
  if (options[0].value == '_' && roles.size > 0) options = [];
  for (let role of roles) {
    if (options.find(i => i.value == role[0]) == null) options.push({label: role[1].name, value: role[0]});
  }
  
  message.edit({
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
        .setCustomId('role-panel')
        .setPlaceholder('ロールを選択')
        .setOptions(options)
        ),
        message.components[1]
    ]
  })
  await interaction.reply({content: 'ロールをパネルに追加しました', ephemeral: true});
}

export async function removeRolePanel(client: Client, interaction: RoleSelectMenuInteraction) {
  let message = await getSelectedRolePanel(client, interaction.guildId ?? '')
  if (message == null) {
    interaction.reply({content: 'パネルが選択されていません', ephemeral: true});
    return;
  }

  let roleIds = interaction.roles.map(i => i[0]);
  let options = (message.components[0].components[0] as StringSelectMenuComponent).options;
  options = options.filter(i => !roleIds.includes(i.value));
  if (options.length == 0) options = [];
  
  message.edit({
    components: [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
        .setCustomId('role-panel')
        .setPlaceholder('ロールを選択')
        .setOptions(options)
        ),
        message.components[1]
    ]
  })
  await interaction.reply({content: 'ロールをパネルから削除しました', ephemeral: true});
}
