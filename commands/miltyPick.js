import {
  ChannelType,
  GatewayDispatchEvents,
  InteractionType,
  MessageFlags,
} from "@discordjs/core";

import { SlashCommandBuilder } from "@discordjs/builders";

import { client } from "../client.js";
import { FACTION_DETAILS_MAP } from "../constants/factions.js";
import { SPEAKER } from "../constants/speaker.js";
import { SLICES } from "../constants/slices.js";
import { STORE } from "./store.js";
import { pickMessage } from "./pickMessage.js";
import { summaryMessage } from "./summaryMessage.js";
import {
  getFactionEmoji,
  getSliceEmoji,
  getSpeakerEmoji,
} from "../utils/emoji.js";
import {
  getRemainingFactions,
  getRemainingSlices,
  getRemainingSpeakerPositions,
} from "../utils/remainingSelections.js";

export const miltyPickCommand = new SlashCommandBuilder()
  .setName("milty_pick")
  .setDescription("Pick Milty Draft");

miltyPickCommand.addStringOption((option) =>
  option
    .setName("faction")
    .setDescription("Select faction")
    .addChoices(
      ...Object.keys(FACTION_DETAILS_MAP).map((key) => {
        const faction = FACTION_DETAILS_MAP[key];
        return {
          value: faction.id,
          name: faction.name,
        };
      })
    )
);

miltyPickCommand.addStringOption((option) =>
  option
    .setName("speaker")
    .setDescription("Select speaker position")
    .addChoices(
      ...Object.keys(SPEAKER).map((key) => {
        const speaker = SPEAKER[key];
        return {
          value: speaker.id,
          name: speaker.name,
        };
      })
    )
);

miltyPickCommand.addStringOption((option) =>
  option
    .setName("slice")
    .setDescription("Select slice")
    .addChoices(
      ...SLICES.map((slice) => ({
        value: slice,
        name: slice.toUpperCase(),
      }))
    )
);

client.on(
  GatewayDispatchEvents.InteractionCreate,
  async ({ data: interaction, api }) => {
    if (
      interaction.type !== InteractionType.ApplicationCommand ||
      interaction.data.name === "milty_pick"
    ) {
      if (interaction.channel?.type !== ChannelType.PublicThread) {
        return;
      }
      const store = STORE[interaction.channel?.id];
      if (!store) {
        return;
      }
      const { draftRound, draftPosition } = store;
      const playerId = interaction.member.user.id;
      if (interaction.member.user.id !== store.players[draftPosition]) {
        return;
      }

      const slice = interaction.data.options?.find(
        (option) => option.name === "slice"
      );
      const faction = interaction.data.options?.find(
        (option) => option.name === "faction"
      );
      const speaker = interaction.data.options?.find(
        (option) => option.name === "speaker"
      );

      const remainingSlices = getRemainingSlices(store);
      const remainingFactions = getRemainingFactions(store);
      const remainingSpeakers = getRemainingSpeakerPositions(store);

      let error;
      if (slice && remainingSlices.indexOf(slice.value) < 0) {
        error = getSliceEmoji(slice.value);
      } else if (faction && remainingFactions.indexOf(faction.value) < 0) {
        error = getFactionEmoji(faction.value);
      } else if (speaker && remainingSpeakers.indexOf(speaker.value) < 0) {
        error = getSpeakerEmoji(faction.value);
      }

      if (error) {
        await api.interactions.reply(interaction.id, interaction.token, {
          content: `${error} is not a valid choice`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      store.playerSelections[playerId] = {
        ...store.playerSelections[playerId],
        ...(slice?.value && { slice: slice.value }),
        ...(faction?.value && { faction: faction.value }),
        ...(speaker?.value && { speakerPosition: speaker.value }),
      };

      // Iterate draft
      if (draftRound === 0 || draftRound === 3) {
        if (draftPosition < store.players.length - 1) {
          store.draftPosition++;
        } else {
          store.draftRound++;
        }
      } else if (draftRound === 1) {
        if (draftPosition > 0) {
          store.draftPosition--;
        } else {
          store.draftRound++;
        }
      }

      const yourPickMessage = pickMessage(store, playerId);

      const editedSummaryMessage = summaryMessage(store);

      await api.channels.editMessage(interaction.channel.id, store.messageId, {
        content: editedSummaryMessage,
      });

      await api.channels.createMessage(interaction.channel.id, {
        content: yourPickMessage,
      });

      return;
    }
  }
);
