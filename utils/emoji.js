import { FACTION_DETAILS_MAP } from "../constants/factions.js";
import { SPEAKER } from "../constants/speaker.js";

export const getFactionEmoji = (factionId) => {
  return `<:${FACTION_DETAILS_MAP[factionId].id}:${FACTION_DETAILS_MAP[factionId].emojiId}>`;
};

export const getSpeakerEmoji = (speakerId) => {
  return `<:${SPEAKER[speakerId].id}:${SPEAKER[speakerId].emojiId}>`;
};

export const getSliceEmoji = (slice) => {
  return `:regional_indicator_${slice}:`;
};
