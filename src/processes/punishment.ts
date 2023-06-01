import { setData } from "discordbot-data";
import { punishmentActionType, punishmentStatTypes } from "../data/punishment.js";
import { action } from "./stats.js";
import { SECOND } from "../utils/parse_time.js";

export function punishment(guildId: string, userId: string | null | undefined, type: punishmentActionType, reason: string = '', duration: number = 0) {
  if (userId == null) return;
  action(guildId, userId, type);
  setData('guild', guildId!, ['punishment', 'data'], {user: userId, details: punishmentStatTypes[type].name, timestamp: Date.now(), reason, duration: duration + SECOND / 2}, 'push')
}
