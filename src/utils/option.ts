import { ApplicationCommandOptionData, ChatInputCommandInteraction } from "discord.js";

export function createDividedOption<T>(list: T[], data: (value: T[], index: number) => ApplicationCommandOptionData) {
  return list.flatMap((v, i, arr) => i % 25 == 0 ? [arr.slice(i, i + 25)] : []).map((v, i) => data(v, i + 1))
}

export function getDividedOption(interaction: ChatInputCommandInteraction, length: number, name: string): string | null {
  for (let i = 1; i <= Math.ceil(length / 25); i++) {
    let value = interaction.options.getString(name + i);
    if (value != null) return value;
  }
  return null;
}
