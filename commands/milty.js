import {
  ChannelType,
  GatewayDispatchEvents,
  MessageFlags,
  InteractionType,
} from "@discordjs/core";

import { SlashCommandBuilder } from "@discordjs/builders";

import { client } from "../client.js";
import { FACTION_DETAILS_MAP } from "../constants/factions.js";
import { shuffleArray } from "../utils/shuffleArray.js";
import { STORE } from "./store.js";
import { SLICES } from "../constants/slices.js";
import { pickMessage } from "./pickMessage.js";
import { summaryMessage } from "./summaryMessage.js";
import { generateSlices } from "./generateSlices.js";
import { generateSliceImages } from "./generateSliceImages.js";
import { AttachmentBuilder } from "discord.js";

export const miltyCommand = new SlashCommandBuilder()
  .setName("milty")
  .setDescription("Run Milty Draft");

// Add player options
[
  { name: "player1", description: "Add Player 1" },
  { name: "player2", description: "Add Player 2" },
  { name: "player3", description: "Add Player 3" },
  { name: "player4", description: "Add Player 4" },
  { name: "player5", description: "Add Player 5" },
  { name: "player6", description: "Add Player 6" },
].forEach((playerOption) => {
  miltyCommand.addUserOption((option) =>
    option.setName(playerOption.name).setDescription(playerOption.description)
  );
});

// Add number of slices
miltyCommand.addNumberOption((option) =>
  option
    .setName("slices")
    .setDescription("Set number of slices")
    .setMinValue(0)
    .setMaxValue(10)
);

// Add number of factions
miltyCommand.addNumberOption((option) =>
  option
    .setName("factions")
    .setDescription("Set number of factions")
    .setMinValue(0)
    .setMaxValue(25)
);

// Other options
miltyCommand.addBooleanOption((option) =>
  option
    .setName("more_wormholes_legend")
    .setDescription("Add more Wormholes and Legendaries")
);
miltyCommand.addNumberOption((option) =>
  option
    .setName("min_optimal_influence")
    .setDescription("Set Minimum Optimal Influence")
    .setMinValue(0)
);
miltyCommand.addNumberOption((option) =>
  option
    .setName("min_optimal_resource")
    .setDescription("Set Minimum Optimal Resource")
    .setMinValue(0)
);
miltyCommand.addNumberOption((option) =>
  option
    .setName("min_optimal_total")
    .setDescription("Set Minimum Optimal Total")
    .setMinValue(0)
);
miltyCommand.addNumberOption((option) =>
  option
    .setName("max_optimal_total")
    .setDescription("Set Maximum Optimal Total")
    .setMinValue(0)
);

client.on(
  GatewayDispatchEvents.InteractionCreate,
  async ({ data: interaction, api }) => {
    if (
      interaction.type !== InteractionType.ApplicationCommand ||
      interaction.data.name === "milty"
    ) {
      const optionMap = interaction.data.options?.reduce((acc, option) => {
        acc[option.name] = option;
        return acc;
      }, {});

      const playerIds = interaction.data.options
        ?.filter((option) => option.name.indexOf("player") >= 0)
        ?.map((player) => player.value);

      const shuffledPlayers = shuffleArray(playerIds);

      const factionOption = optionMap.factions;
      const numFactions = factionOption?.value || 8;
      const shuffledFactions = shuffleArray(Object.keys(FACTION_DETAILS_MAP));

      const factions = shuffledFactions.slice(0, numFactions).sort();

      const slices = optionMap.slices;
      const numSlices = slices?.value || 8;

      const state = {
        factions,
        draftPosition: 0,
        draftRound: 0,
        players: shuffledPlayers,
        slices: [...SLICES].slice(0, numSlices),
        playerSelections: shuffledPlayers.reduce((acc, val) => {
          acc[val] = {
            speakerPosition: null,
            slice: null,
            faction: null,
          };
          return acc;
        }, {}),
      };

      let mapSlices;

      api.interactions.reply(interaction.id, interaction.token, {
        content: "Generating Slices!",
        flags: MessageFlags.Ephemeral,
      });

      try {
        mapSlices = generateSlices({
          numSlices,
          hasLegendaries: optionMap.more_wormholes_legend?.value,
          mininf: optionMap.min_optimal_influence?.value || 4,
          minres: optionMap.min_optimal_resource?.value || 2.5,
          mintot: optionMap.min_optimal_total?.value || 9,
          maxtot: optionMap.max_optimal_total?.value || 13,
        });
      } catch (e) {
        console.log(e);
        // Something went wrong
      }

      const summary = summaryMessage(state);

      const { sliceDraft } = await generateSliceImages(mapSlices);

      const thread = await api.threads.create(interaction.channel.id, {
        type: ChannelType.PublicThread,
        name: "Milty draft",
      });

      const buffer = await sliceDraft.encode("png");

      const message = await api.channels.createMessage(thread.id, {
        content: summary,
        files: [{ data: buffer, name: "slices.png" }],
      });

      const yourPickMessage = pickMessage(state);

      await api.channels.createMessage(thread.id, {
        content: yourPickMessage,
      });

      state.messageId = message.id;
      STORE[thread.id] = state;
      return;
    }
  }
);
