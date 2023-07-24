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
import { pickMessage } from "../functions/pickMessage.js";
import { summaryMessage } from "../functions/summaryMessage.js";
import { getState } from "../functions/getState.js";
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
import { generateFinalMap } from "../functions/generateFinalMap.js";

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
      const threadId = interaction.channel.id;

      const { collection, store } = await getState(threadId);

      if (!store) {
        return;
      }
      const { draftRound, draftPosition } = store;

      if (interaction.member.user.id !== store.players[draftPosition]) {
        api.interactions.reply(interaction.id, interaction.token, {
          content: "Not your turn to pick",
          flags: MessageFlags.Ephemeral,
        });
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

      if (!slice && !faction && !speaker) {
        await api.interactions.reply(interaction.id, interaction.token, {
          content: `Please select a speaker/slice/faction`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      if (
        (store.playerSelections[draftPosition].slice && slice) ||
        (store.playerSelections[draftPosition].faction && faction) ||
        (store.playerSelections[draftPosition].speaker && speaker)
      ) {
        await api.interactions.reply(interaction.id, interaction.token, {
          content: `Already picked`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const remainingSlices = getRemainingSlices(store);
      const remainingFactions = getRemainingFactions(store);
      const remainingSpeakers = getRemainingSpeakerPositions(store);

      let error;
      if (slice && remainingSlices.indexOf(slice.value) < 0) {
        error = getSliceEmoji(slice.value);
      } else if (faction && remainingFactions.indexOf(faction.value) < 0) {
        error = getFactionEmoji(faction.value);
      } else if (speaker && remainingSpeakers.indexOf(speaker.value) < 0) {
        error = getSpeakerEmoji(speaker.value);
      }

      if (error) {
        await api.interactions.reply(interaction.id, interaction.token, {
          content: `${error} is not a valid choice`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      store.playerSelections[draftPosition] = {
        ...store.playerSelections[draftPosition],
        ...(slice?.value && { slice: slice.value }),
        ...(faction?.value && { faction: faction.value }),
        ...(speaker?.value && { speakerPosition: speaker.value }),
      };

      // Iterate draft
      if (draftRound === 0 || draftRound === 2) {
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

      const editedSummaryMessage = summaryMessage(store);

      collection.updateOne({ _id: store._id }, { $set: store });

      // Final Map
      if (store.draftRound > 2) {
        // Keleres exception
        const keleres = store.playerSelections.find(
          (playerSelection) => playerSelection.faction === "keleres"
        );
        if (keleres) {
          await api.channels.createMessage(threadId, {
            content:
              "Please pick a keleres home systaem\nUse command `keleres_pick`",
          });
          return;
        }
        return await generateFinalMap({ data: interaction, api }, store);
      }

      const yourPickMessage = pickMessage(store);

      await api.channels.editMessage(threadId, store.messageId, {
        content: editedSummaryMessage,
      });

      let emoji;
      if (slice?.value) {
        emoji = getSliceEmoji(slice.value);
      } else if (faction?.value) {
        emoji = getFactionEmoji(faction.value);
      } else if (speaker?.value) {
        emoji = getSpeakerEmoji(speaker.value);
      }

      const pickedText = `<@${
        store.players[store.draftPosition]
      }> picked ${emoji}`;

      await api.interactions.reply(interaction.id, interaction.token, {
        content: pickedText,
        flags: MessageFlags.Ephemeral,
      });

      await api.channels.createMessage(threadId, {
        content: yourPickMessage,
      });

      return;
    }
  }
);
