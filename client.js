import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";
import { GatewayIntentBits, Client } from "@discordjs/core";

import * as env from "dotenv";
env.config();

const token = process.env.TOKEN;

// Create REST and WebSocket managers directly
export const rest = new REST({ version: "10" }).setToken(token);

export const gateway = new WebSocketManager({
  token,
  intents: GatewayIntentBits.MessageContent,
  rest,
});

// Create a client to emit relevant events.
export const client = new Client({ rest, gateway });
