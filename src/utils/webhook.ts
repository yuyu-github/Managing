import { NewsChannel, StageChannel, TextChannel, VoiceChannel, Webhook } from 'discord.js'

let webhookCache: {[key: string]: Webhook} = {};
export async function getWebhook(channel: TextChannel | VoiceChannel | NewsChannel | StageChannel ) {
  let webhook = webhookCache[channel.id];
  if (webhook == null) {
    let webhooks = await channel.fetchWebhooks();
    webhook = webhooks.find(v => v.token != null) ?? await channel.createWebhook({name:"Managing"});
    if (webhook) webhookCache[channel.id] = webhook;
  }
  return webhook;
}
