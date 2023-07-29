import {
  getRemainingFactions,
  getRemainingSlices,
  getRemainingSpeakerPositions,
} from "../utils/remainingSelections.js";

import {
  SpeakerButton,
  FactionButton,
  SliceButton,
} from "../buttons/selection.js";
import { ActionRowBuilder } from "@discordjs/builders";

export const getRemainingButtonsActionRow = (store) => {
  const remainingSlices = getRemainingSlices(store);
  const remainingFactions = getRemainingFactions(store);
  const remainingSpeakers = getRemainingSpeakerPositions(store);

  const pickedSlice = store.playerSelections[store.draftPosition].slice;
  const pickedFaction = store.playerSelections[store.draftPosition].faction;
  const pickedSpeaker =
    store.playerSelections[store.draftPosition].speakerPosition;

  const buttons = [];
  if (!pickedSpeaker && remainingSpeakers.length > 0) {
    buttons.push(SpeakerButton);
  }
  if (!pickedFaction && remainingFactions.length > 0) {
    buttons.push(FactionButton);
  }
  if (!pickedSlice && remainingSlices.length > 0) {
    buttons.push(SliceButton);
  }

  return new ActionRowBuilder({ components: buttons });
};
