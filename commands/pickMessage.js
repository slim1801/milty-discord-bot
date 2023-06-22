import { SPEAKER } from "../constants/speaker.js";
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

export const pickMessage = (store, playerId) => {
  const yourPickText = `Your turn to pick <@${
    store.players[store.draftPosition]
  }>`;

  const factionSelections = getRemainingFactions(store);

  const remainingFactionsText =
    "Factions: " +
    factionSelections.map((factionId) => getFactionEmoji(factionId)).join(" ");

  const speakerSelections = getRemainingSpeakerPositions(store);

  const remainingSpeakerText =
    "Speaker: " +
    speakerSelections.map((speakerId) => getSpeakerEmoji(speakerId)).join(" ");

  const sliceSelections = getRemainingSlices(store);
  const remainingSlicesText =
    "Slices: " + sliceSelections.map((slice) => getSliceEmoji(slice)).join(" ");

  const totalText = [yourPickText];
  if (!store.playerSelections[playerId]?.speakerPosition) {
    totalText.push(remainingSpeakerText);
  }
  if (!store.playerSelections[playerId]?.slice) {
    totalText.push(remainingSlicesText);
  }
  if (!store.playerSelections[playerId]?.faction) {
    totalText.push(remainingFactionsText);
  }

  return totalText.join("\n");
};
