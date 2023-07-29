import { GatewayDispatchEvents, InteractionType } from "@discordjs/core";

import { client } from "../client.js";
import { getState } from "../functions/getState.js";
import { generateFinalMap } from "../functions/generateFinalMap.js";

client.on(
  GatewayDispatchEvents.InteractionCreate,
  async ({ data: interaction, api }) => {
    if (
      interaction.type === InteractionType.MessageComponent &&
      interaction.data.custom_id.includes("keleres_pick_")
    ) {
      const keleresPick =
        interaction.data.custom_id.split("keleres_pick_")?.[1];

      const { store } = await getState(interaction.channel.id);

      store.keleres = keleresPick;

      return await generateFinalMap({ data: interaction, api }, store);
    }
  }
);
