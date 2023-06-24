import { FACTION_DETAILS_MAP } from "../constants/factions.js";
import {
  getFactionEmoji,
  getSliceEmoji,
  getSpeakerEmoji,
} from "../utils/emoji.js";

const COMMODITY_EMOJI = "<:commodity:1118538765795868813>";

const NUM_EMOJIS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
];

export const summaryMessage = (store) => {
  const { players, factions, playerSelections } = store;
  const draftOrder = players
    .map((playerId, index) => {
      const playerSelection = playerSelections[index];
      const speakerSelection = playerSelection.speakerPosition
        ? getSpeakerEmoji(playerSelection.speakerPosition)
        : COMMODITY_EMOJI;
      const sliceSelection = playerSelection.slice
        ? getSliceEmoji(playerSelection.slice)
        : COMMODITY_EMOJI;
      const factionSelection = playerSelection.faction
        ? getFactionEmoji(playerSelection.faction)
        : COMMODITY_EMOJI;
      const playerSelectionText = `${speakerSelection}${sliceSelection}${factionSelection}`;
      return `:${
        NUM_EMOJIS[index + 1]
      }:. ${playerSelectionText}<@${playerId}>\n`;
    })
    .join("");

  const factionList = factions
    .map(
      (factionId) =>
        `${getFactionEmoji(factionId)} ${FACTION_DETAILS_MAP[factionId].name}\n`
    )
    .join("");

  const factionText = `__**Factions**__\n${factionList}`;

  const draftText = `__**Draft Order**__\n${draftOrder}`;

  return `${factionText}\n${draftText}\n__**Slices**__`;
};
