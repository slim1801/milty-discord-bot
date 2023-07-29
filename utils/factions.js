import { FACTION_DETAILS_MAP } from "../constants/factions.js";

export const getFactionHomeSystem = (faction, keleres) => {
  let hsNumber = FACTION_DETAILS_MAP[faction]?.hs || faction;

  // Keleres exception
  if (faction === "keleres") {
    if (keleres === "argent") {
      hsNumber = "58k";
    } else if (keleres === "xxcha") {
      hsNumber = "14k";
    } else {
      hsNumber = "2k";
    }
  }

  return hsNumber;
};
