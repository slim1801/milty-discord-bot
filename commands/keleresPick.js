import {
  GatewayDispatchEvents,
  MessageFlags,
  InteractionType,
} from "@discordjs/core";

import { SlashCommandBuilder } from "@discordjs/builders";

import { client } from "../client.js";
import { FACTION_DETAILS_MAP } from "../constants/factions.js";
import { getState } from "../functions/getState.js";
import { generateFinalMap } from "../functions/generateFinalMap.js";

export const keleresPickCommand = new SlashCommandBuilder()
  .setName("keleres_pick")
  .setDescription("Select Keleres Home System");

keleresPickCommand.addStringOption((option) =>
  option
    .setName("home_system")
    .setDescription("Select Home System")
    .addChoices(
      ...[
        {
          value: FACTION_DETAILS_MAP.argent.id,
          name: FACTION_DETAILS_MAP.argent.name,
        },
        {
          value: FACTION_DETAILS_MAP.mentak.id,
          name: FACTION_DETAILS_MAP.mentak.name,
        },
        {
          value: FACTION_DETAILS_MAP.xxcha.id,
          name: FACTION_DETAILS_MAP.xxcha.name,
        },
      ]
    )
);

client.on(
  GatewayDispatchEvents.InteractionCreate,
  async ({ data: interaction, api }) => {
    if (
      interaction.type !== InteractionType.ApplicationCommand ||
      interaction.data.name === "keleres_pick"
    ) {
      const home_system = interaction.data.options?.find(
        (option) => option.name === "home_system"
      );

      const threadId = interaction.channel.id;

      const { store } = await getState(threadId);

      if (!store) {
        api.interactions.reply(interaction.id, interaction.token, {
          content: "Not a valid game",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const keleresPlayer = store.playerSelections.find(
        (player) => player.faction === "keleres"
      );

      if (!keleresPlayer) {
        api.interactions.reply(interaction.id, interaction.token, {
          content: "There is no keleres in the game",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      if (keleresPlayer.playerId !== interaction.member.user.id) {
        api.interactions.reply(interaction.id, interaction.token, {
          content: "You are not the keleres player",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      if (store.draftRound <= 2) {
        api.interactions.reply(interaction.id, interaction.token, {
          content: "Not ready to draft Keleres home system",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      if (
        store.playerSelections.find(
          (selection) => selection.faction === home_system.value
        )
      ) {
        api.interactions.reply(interaction.id, interaction.token, {
          content: `${
            FACTION_DETAILS_MAP[home_system.value].name
          } is already in the draft`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      store.keleres = home_system.value;

      return await generateFinalMap({ data: interaction, api }, store);
    }
  }
);
