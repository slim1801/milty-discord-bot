import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import {
  ButtonStyle,
  ChannelType,
  GatewayDispatchEvents,
  InteractionType,
  MessageFlags,
} from "@discordjs/core";

import {
  getRemainingFactions,
  getRemainingSlices,
  getRemainingSpeakerPositions,
} from "../utils/remainingSelections.js";
import { generateFinalMap } from "../functions/generateFinalMap.js";

import {
  getFactionEmoji,
  getSliceEmoji,
  getSpeakerEmoji,
} from "../utils/emoji.js";
import { pickMessage } from "../functions/pickMessage.js";
import { summaryMessage } from "../functions/summaryMessage.js";
import { SPEAKER } from "../constants/speaker.js";
import { BackSelectionButton, SelectionRow } from "../buttons/selection.js";
import { getState } from "../functions/getState.js";

import { client } from "../client.js";
import { FACTION_DETAILS_MAP } from "../constants/factions.js";
import { getRemainingButtonsActionRow } from "../functions/getRemainingButtonsActionRow.js";

client.on(
  GatewayDispatchEvents.InteractionCreate,
  async ({ data: interaction, api }) => {
    if (
      interaction.type === InteractionType.MessageComponent &&
      interaction.data.custom_id === "speaker_pick"
    ) {
      const threadId = interaction.channel.id;

      const { store } = await getState(threadId);

      if (!store) {
        return;
      }

      const remainingSpeakers = getRemainingSpeakerPositions(store).map(
        (speakerId) => SPEAKER[speakerId]
      );

      const buttons = remainingSpeakers.map((speaker) =>
        new ButtonBuilder()
          .setCustomId(`speaker_selection_${speaker.id}`)
          .setEmoji({
            id: SPEAKER[speaker.id].emojiId,
            name: speaker.id,
          })
          .setStyle(ButtonStyle.Secondary)
      );

      buttons.push(BackSelectionButton);

      let index = 0;
      const BUTTONS_PER_ROW = 4;
      const actionRows = [];
      while (index < buttons.length) {
        actionRows.push(
          new ActionRowBuilder().addComponents(
            buttons.slice(index, index + BUTTONS_PER_ROW)
          )
        );
        index += BUTTONS_PER_ROW;
      }

      await api.channels.deleteMessage(threadId, interaction.message.id);

      await api.channels.createMessage(threadId, {
        components: [...actionRows],
      });

      return;
    }
  }
);

client.on(
  GatewayDispatchEvents.InteractionCreate,
  async ({ data: interaction, api }) => {
    if (
      interaction.type === InteractionType.MessageComponent &&
      interaction.data.custom_id === "faction_pick"
    ) {
      const threadId = interaction.channel.id;

      const { store } = await getState(threadId);

      if (!store) {
        return;
      }

      const remainingFactions = getRemainingFactions(store).map(
        (factionId) => FACTION_DETAILS_MAP[factionId]
      );

      const buttons = remainingFactions.map((faction) =>
        new ButtonBuilder()
          .setCustomId(`faction_selection_${faction.id}`)
          .setLabel(faction.shortName)
          .setEmoji({
            id: faction.emojiId,
            name: faction.id,
          })
          .setStyle(ButtonStyle.Secondary)
      );

      buttons.push(BackSelectionButton);

      let index = 0;
      const BUTTONS_PER_ROW = 4;
      const actionRows = [];
      while (index < buttons.length) {
        actionRows.push(
          new ActionRowBuilder().addComponents(
            buttons.slice(index, index + BUTTONS_PER_ROW)
          )
        );
        index += BUTTONS_PER_ROW;
      }

      await api.channels.deleteMessage(threadId, interaction.message.id);

      await api.channels.createMessage(threadId, {
        components: [...actionRows],
      });

      return;
    }
  }
);

client.on(
  GatewayDispatchEvents.InteractionCreate,
  async ({ data: interaction, api }) => {
    if (
      interaction.type === InteractionType.MessageComponent &&
      interaction.data.custom_id === "slice_pick"
    ) {
      const threadId = interaction.channel.id;

      const { store } = await getState(threadId);

      if (!store) {
        return;
      }

      const remainingSlices = getRemainingSlices(store);

      const buttons = remainingSlices.map((slice) =>
        new ButtonBuilder()
          .setCustomId(`slice_selection_${slice}`)
          .setLabel(slice.toUpperCase())
          .setStyle(ButtonStyle.Secondary)
      );

      buttons.push(BackSelectionButton);

      let index = 0;
      const BUTTONS_PER_ROW = 4;
      const actionRows = [];
      while (index < buttons.length) {
        actionRows.push(
          new ActionRowBuilder().addComponents(
            buttons.slice(index, index + BUTTONS_PER_ROW)
          )
        );
        index += BUTTONS_PER_ROW;
      }

      await api.channels.deleteMessage(threadId, interaction.message.id);

      await api.channels.createMessage(threadId, {
        components: [...actionRows],
      });

      return;
    }
  }
);

client.on(
  GatewayDispatchEvents.InteractionCreate,
  async ({ data: interaction, api }) => {
    if (
      interaction.type === InteractionType.MessageComponent &&
      interaction.data.custom_id === "back_selection"
    ) {
      const threadId = interaction.channel.id;

      const { store } = await getState(threadId);

      const buttonActionRow = getRemainingButtonsActionRow(store);

      await api.channels.deleteMessage(threadId, interaction.message.id);

      await api.channels.createMessage(threadId, {
        components: [buttonActionRow],
      });
    }
  }
);

client.on(
  GatewayDispatchEvents.InteractionCreate,
  async ({ data: interaction, api }) => {
    if (
      interaction.type === InteractionType.MessageComponent &&
      (interaction.data.custom_id.includes("speaker_selection_") ||
        interaction.data.custom_id.includes("faction_selection_") ||
        interaction.data.custom_id.includes("slice_selection_"))
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

      const slice = interaction.data.custom_id.split("slice_selection_")?.[1];
      const faction =
        interaction.data.custom_id.split("faction_selection_")?.[1];
      const speaker =
        interaction.data.custom_id.split("speaker_selection_")?.[1];

      let selection = undefined;
      if (slice) {
        selection = { slice };
      } else if (faction) {
        selection = { faction };
      } else if (speaker) {
        selection = { speakerPosition: speaker };
      }

      store.playerSelections[draftPosition] = {
        ...store.playerSelections[draftPosition],
        ...selection,
      };

      let emoji;
      if (slice) {
        emoji = getSliceEmoji(slice);
      } else if (faction) {
        emoji = getFactionEmoji(faction);
      } else if (speaker) {
        emoji = getSpeakerEmoji(speaker);
      }

      const pickedText = `<@${
        store.players[store.draftPosition]
      }> picked ${emoji}`;

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

      await api.channels.deleteMessage(threadId, interaction.message.id);

      // Final Map
      if (store.draftRound > 2) {
        // Keleres exception
        const keleres = store.playerSelections.find(
          (playerSelection) => playerSelection.faction === "keleres"
        );
        if (keleres) {
          const keleresFactions = [
            FACTION_DETAILS_MAP.argent,
            FACTION_DETAILS_MAP.mentak,
            FACTION_DETAILS_MAP.xxcha,
          ];

          const keleresButtons = [];
          keleresFactions.forEach((faction) => {
            const picked = store.playerSelections.find(
              (selection) => selection.faction === faction.id
            );

            if (!picked) {
              keleresButtons.push(
                new ButtonBuilder()
                  .setCustomId(`keleres_pick_${faction.id}`)
                  .setLabel(faction.shortName)
                  .setEmoji({
                    id: faction.emojiId,
                    name: faction.id,
                  })
                  .setStyle(ButtonStyle.Secondary)
              );
            }
          });

          const keleresButtonActionRow = new ActionRowBuilder({
            components: keleresButtons,
          });

          await api.channels.createMessage(threadId, {
            content: "Please pick a keleres home system",
          });

          await api.channels.createMessage(threadId, {
            components: [keleresButtonActionRow],
          });

          return;
        }
        return await generateFinalMap({ data: interaction, api }, store);
      }

      const yourPickMessage = pickMessage(store);

      await api.channels.editMessage(threadId, store.messageId, {
        content: editedSummaryMessage,
      });

      await api.interactions.reply(interaction.id, interaction.token, {
        content: pickedText,
        flags: MessageFlags.Ephemeral,
      });

      await api.channels.createMessage(threadId, {
        content: yourPickMessage,
      });

      const buttonActionRow = getRemainingButtonsActionRow(store);

      await api.channels.createMessage(threadId, {
        components: [buttonActionRow],
      });

      return;
    }
  }
);
