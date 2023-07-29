import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import { ButtonStyle } from "discord.js";

export const SpeakerButton = new ButtonBuilder()
  .setCustomId("speaker_pick")
  .setLabel("Pick Speaker Position")
  .setStyle(ButtonStyle.Primary);

export const FactionButton = new ButtonBuilder()
  .setCustomId("faction_pick")
  .setLabel("Pick Faction")
  .setStyle(ButtonStyle.Primary);

export const SliceButton = new ButtonBuilder()
  .setCustomId("slice_pick")
  .setLabel("Pick Slice")
  .setStyle(ButtonStyle.Primary);

export const BackSelectionButton = new ButtonBuilder()
  .setCustomId("back_selection")
  .setLabel("Back")
  .setStyle(ButtonStyle.Primary);

export const SelectionRow = new ActionRowBuilder({
  components: [SpeakerButton, FactionButton, SliceButton],
});
