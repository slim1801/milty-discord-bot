import { GatewayDispatchEvents, InteractionType } from "@discordjs/core";

import { SlashCommandBuilder } from "@discordjs/builders";

import { client } from "../client.js";
import { getState } from "../functions/getState.js";
import { generateFinalMap } from "../functions/generateFinalMap.js";

export const generateFinalMapCommand = new SlashCommandBuilder()
  .setName("generate_final_map")
  .setDescription("Generate Final Map");

client.on(
  GatewayDispatchEvents.InteractionCreate,
  async ({ data: interaction, api }) => {
    if (
      interaction.type !== InteractionType.ApplicationCommand ||
      interaction.data.name === "generate_final_map"
    ) {
      const threadId = interaction.channel.id;

      const { store } = await getState(threadId);

      return await generateFinalMap({ data: interaction, api }, store);
    }
  }
);
