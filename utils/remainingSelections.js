import { SPEAKER } from "../constants/speaker.js";

export const remainingSelections = (playerSelections, totalSelections, key) => {
  const remaining = [...totalSelections];
  Object.keys(playerSelections).forEach((player) => {
    const selection = playerSelections[player][key];
    if (selection) {
      const index = remaining.findIndex((val) => val === selection);
      if (index > 0) {
        remaining.splice(index, 1);
      }
    }
  });
  return remaining;
};

export const getRemainingSpeakerPositions = (store) => {
  const speakerIds = Object.keys(SPEAKER).map((speaker) => speaker);
  return remainingSelections(
    store.playerSelections,
    speakerIds,
    "speakerPosition"
  );
};

export const getRemainingSlices = (store) => {
  return remainingSelections(store.playerSelections, store.slices, "slice");
};

export const getRemainingFactions = (store) => {
  return remainingSelections(store.playerSelections, store.factions, "faction");
};
