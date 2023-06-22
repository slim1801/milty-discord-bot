import { SlashCommandBuilder } from "@discordjs/builders";
import { AttachmentBuilder } from "discord.js";
import {
  GatewayDispatchEvents,
  Routes,
  InteractionType,
} from "@discordjs/core";

import { miltyCommand } from "./commands/milty.js";
import { miltyPickCommand } from "./commands/miltyPick.js";
import { rest, gateway, client } from "./client.js";

const guildId = process.env.GUILD_ID;
const clientId = process.env.CLIENT_ID;

// Listen for the ready event
client.once(GatewayDispatchEvents.Ready, () => console.log("Ready!"));

async function main() {
  const commands = [miltyCommand, miltyPickCommand];
  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
  } catch (err) {
    console.log(err);
  }
}

main();

// Start the WebSocket connection.
gateway.connect();
