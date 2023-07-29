import { GatewayDispatchEvents, Routes } from "@discordjs/core";

import { ttsStringCommand } from "./commands/ttsString.js";
import { miltyCommand } from "./commands/milty.js";
import { miltyPickCommand } from "./commands/miltyPick.js";
import { keleresPickCommand } from "./commands/keleresPick.js";
import { generateFinalMapCommand } from "./commands/generateFinalMap.js";
import { rest, gateway, client } from "./client.js";
import "./buttons/buttonSelections.js";
import "./buttons/keleresSelection.js";
import { run } from "./db.js";

run();

const guildId = process.env.GUILD_ID;
const clientId = process.env.CLIENT_ID;

// Listen for the ready event
client.once(GatewayDispatchEvents.Ready, () => console.log("Ready!"));

async function main() {
  const commands = [
    generateFinalMapCommand,
    keleresPickCommand,
    miltyCommand,
    miltyPickCommand,
    ttsStringCommand,
  ];
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
