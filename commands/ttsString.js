import { GatewayDispatchEvents, InteractionType } from "@discordjs/core";

import { SlashCommandBuilder } from "@discordjs/builders";

import { addHyperLaneHS } from "../utils/hyperLanes.js";
import { SPEAKER } from "../constants/speaker.js";
import { client } from "../client.js";
import { getState } from "../functions/getState.js";
import { getFactionHomeSystem } from "../utils/factions.js";

export const ttsStringCommand = new SlashCommandBuilder()
  .setName("tts_string")
  .setDescription("Get TTS string for map");

client.on(
  GatewayDispatchEvents.InteractionCreate,
  async ({ data: interaction, api }) => {
    if (
      interaction.type !== InteractionType.ApplicationCommand ||
      interaction.data.name === "tts_string"
    ) {
      const threadId = interaction.channel.id;

      const { store } = await getState(threadId);

      const sortedSpeaker = store.playerSelections.sort(
        (playerA, playerB) =>
          SPEAKER[playerA.speakerPosition].position -
          SPEAKER[playerB.speakerPosition].position
      );

      const selectedSlices = sortedSpeaker.map((player) => player.slice);

      const selectedMapSlices = selectedSlices.map((slice) => {
        const mapSliceIndex = slice.charCodeAt(0) - "a".charCodeAt(0);
        return store.mapSlices[mapSliceIndex];
      });

      const ring1 = selectedMapSlices.map((slice) => slice[slice.length - 1]);
      const ring2 = selectedMapSlices.reduce((acc, slice) => {
        acc.push(slice[1]);
        acc.push(slice[3]);
        return acc;
      }, []);
      const ring3 = selectedMapSlices.reduce((acc, slice, index) => {
        const nextSlice = (index + 1) % selectedMapSlices.length;
        acc.push(0);
        acc.push(slice[0]);
        acc.push(selectedMapSlices[nextSlice][2]);
        return acc;
      }, []);

      const ttsString = [...ring1, ...ring2, ...ring3];

      const finalMapText = `__**TTS String**__`;
      const ttsMessage = `${finalMapText}\n${ttsString.join(" ")}`;

      await api.channels.createMessage(threadId, {
        content: ttsMessage,
      });

      return;
    }
  }
);
