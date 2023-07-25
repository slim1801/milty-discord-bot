import { createCanvas, loadImage } from "@napi-rs/canvas";
import { FACTION_DETAILS_MAP } from "../constants/factions.js";
import * as fs from "fs";
import { generateSliceImages } from "./generateSliceImages.js";
import {
  addHyperLanes,
  addHyperLaneHS,
  addHyperLaneRotation,
} from "../utils/hyperLanes.js";

import { SPEAKER } from "../constants/speaker.js";
import {
  finalMapTranslations,
  homeSystemTranslations,
} from "../utils/translations.js";
import { addRotation } from "../utils/addRotation.js";
import { getFactionHomeSystem } from "../utils/factions.js";

// const state = {
//   players: [1, 2, 3, 4, 5, 6],
//   mapSlices: [
//     [69, 22, 44, 42, 31],
//     [62, 26, 67, 47, 29],
//     [43, 39, 36, 60, 76],
//     [65, 63, 70, 49, 68],
//     [61, 38, 41, 37, 48],
//     [30, 74, 80, 19, 45],
//     [28, 27, 50, 23, 46],
//     [59, 71, 40, 79, 72],
//   ],
//   playerSelections: [
//     {
//       playerId: "slim",
//       speakerPosition: 2,
//       slice: "c",
//       faction: "xxcha",
//     },
//     {
//       playerId: "slim2",
//       speakerPosition: 4,
//       slice: "a",
//       faction: "jolnar",
//     },
//     {
//       playerId: "slim3",
//       speakerPosition: 6,
//       slice: "g",
//       faction: "nekro",
//     },
//     {
//       playerId: "slim4",
//       speakerPosition: 1,
//       slice: "f",
//       faction: "mentak",
//     },
//     {
//       playerId: "slim5",
//       speakerPosition: 5,
//       slice: "b",
//       faction: "mentak",
//     },
//     {
//       playerId: "slim6",
//       speakerPosition: 3,
//       slice: "d",
//       faction: "mentak",
//     },
//   ],
// };

// const state = {
//   _id: { $oid: "64a627ae553dfe74e5494de1" },
//   factions: [
//     "arborec",
//     "argent",
//     "keleres",
//     "l1z1x",
//     "naazrokha",
//     "nekro",
//     "sol",
//     "yin",
//   ],
//   draftPosition: 6,
//   draftRound: 3,
//   players: [
//     "184613218340044800",
//     "245429893041618954",
//     "693714830196080641",
//     "808868032361136129",
//     "522504665561300992",
//     "248782333665083393",
//   ],
//   keleres: null,
//   slices: ["a", "b", "c", "d", "e", "f", "g", "h"],
//   playerSelections: [
//     {
//       playerId: "184613218340044800",
//       speakerPosition: "speaker_second",
//       slice: "b",
//       faction: "arborec",
//     },
//     {
//       playerId: "245429893041618954",
//       speakerPosition: "speaker_third",
//       slice: "f",
//       faction: "keleres",
//     },
//     {
//       playerId: "693714830196080641",
//       speakerPosition: "speaker_first",
//       slice: "g",
//       faction: "sol",
//     },
//     {
//       playerId: "808868032361136129",
//       speakerPosition: "speaker_fourth",
//       slice: "e",
//       faction: "argent",
//     },
//     {
//       playerId: "522504665561300992",
//       speakerPosition: "speaker_fifth",
//       slice: "a",
//       faction: "l1z1x",
//     },
//     {
//       playerId: "248782333665083393",
//       speakerPosition: "speaker_sixth",
//       slice: "h",
//       faction: "naazrokha",
//     },
//   ],
//   threadId: "1126339724328583268",
//   messageId: "1126339797250736258",
//   mapSlices: [
//     [79, 32, 23, 74, 67],
//     [46, 59, 33, 68, 65],
//     [26, 29, 43, 63, 44],
//     [64, 69, 47, 22, 49],
//     [77, 35, 40, 21, 37],
//     [80, 66, 20, 28, 48],
//     [70, 50, 24, 39, 34],
//     [42, 62, 76, 36, 41],
//   ],
// };

const mapPositions = (width, height) => {
  return [
    {
      x: 2 * width,
      y: 0,
      textX: 3.25 * width,
      textY: 0,
      textAlign: "center",
      textOffsetY: -50,
    },
    {
      x: 3.5 * width,
      y: height,
      textX: 5.25 * width,
      textY: height * 1.5,
      textAlign: "start",
      textOffsetY: -50,
    },
    {
      x: 3.5 * width,
      y: 3 * height,
      textX: 5.25 * width,
      textY: height * 5.5,
      textAlign: "start",
      textOffsetY: 200,
    },
    {
      x: 2 * width,
      y: 4 * height,
      textX: 3.25 * width,
      textY: height * 7,
      textAlign: "center",
      textOffsetY: 200,
    },
    {
      x: width * 0.5,
      y: 3 * height,
      textX: 1.25 * width,
      textY: height * 5.5,
      textAlign: "end",
      textOffsetY: 200,
    },
    {
      x: width * 0.5,
      y: height,
      textX: 1.25 * width,
      textY: height * 1.5,
      textAlign: "end",
      textOffsetY: -50,
    },
  ];
};

const addHSRotation = (numPlayers) => {
  if (numPlayers === 3) {
    return [
      undefined,
      (-Math.PI * 2) / 3,
      undefined,
      undefined,
      undefined,
      (Math.PI * 2) / 3,
    ];
  }
  if (numPlayers === 4) {
    return [
      undefined,
      undefined,
      -Math.PI / 3,
      undefined,
      undefined,
      (Math.PI * 2) / 3,
    ];
  }
};

const nameMapping = (index, numPlayers) => {
  if (index === 0) {
    return 0;
  }
  if (numPlayers === 3) {
    return {
      2: 1,
      4: 2,
    }[index];
  }
  if (numPlayers === 4) {
    return {
      1: 1,
      3: 2,
      4: 3,
    }[index];
  }
  if (numPlayers === 5) {
    return {
      1: 1,
      2: 2,
      4: 3,
      5: 4,
    }[index];
  }
  return index;
};

export async function generateMap(state, playerNamesMap) {
  const sortedSpeaker = state.playerSelections.sort(
    (playerA, playerB) =>
      SPEAKER[playerA.speakerPosition].position -
      SPEAKER[playerB.speakerPosition].position
  );

  const selectedFactions = addHyperLaneHS(
    sortedSpeaker.map((player) => player.faction)
  );

  const HSImages = await Promise.allSettled(
    selectedFactions.map((faction) => {
      const hsNumber = getFactionHomeSystem(faction, state.keleres);
      return loadImage(`tiles/sys_${hsNumber}.png`);
    })
  );

  const hsImages = HSImages.map((hs) => hs.value);

  const hsImage = hsImages[0];
  const mapCanvas = createCanvas(hsImage.width * 6.5, hsImage.height * 9);
  const mapCanvasContext = mapCanvas.getContext("2d");

  const mecatol = await loadImage(`tiles/sys_18.png`);
  const speaker = await loadImage(`tiles/speaker_m.png`);

  // Add Speaker
  const speakerWidth = mecatol.width / 2;
  const speakerRatio = speakerWidth / speaker.width;
  const speakerHeight = speakerRatio * speaker.height;

  mapCanvasContext.drawImage(
    speaker,
    0,
    0,
    speaker.width,
    speaker.height,
    3 * mecatol.width,
    100,
    speakerWidth,
    speakerHeight
  );

  const fontHeight = 200;

  const heightOffset = 200 + speakerHeight + fontHeight;

  // Add Mecatol
  mapCanvasContext.drawImage(
    mecatol,
    0,
    0,
    mecatol.width,
    mecatol.height,
    2.75 * mecatol.width,
    3 * mecatol.height + heightOffset,
    mecatol.width,
    mecatol.height
  );

  const selectedSlices = sortedSpeaker.map((player) => player.slice);

  const selectedMapSlices = selectedSlices.map((slice) => {
    const mapSliceIndex = slice.charCodeAt(0) - "a".charCodeAt(0);
    return state.mapSlices[mapSliceIndex];
  });

  const hyperlanedSlices = addHyperLanes(selectedMapSlices);

  const { unslicedCanvases } = await generateSliceImages(
    hyperlanedSlices,
    finalMapTranslations,
    homeSystemTranslations,
    addHyperLaneRotation(sortedSpeaker.length)
  );

  // Add Home System
  const sliceImages = unslicedCanvases.map((sliceImage, sortedIndex) => {
    const hsImage = addRotation(
      hsImages[sortedIndex],
      addHSRotation(sortedSpeaker.length)?.[sortedIndex]
    );

    const hsPosition = homeSystemTranslations[sortedIndex](
      hsImage.width,
      hsImage.height
    );

    const sliceImageContext = sliceImage.getContext("2d");

    sliceImageContext.drawImage(
      hsImage,
      0,
      0,
      hsImage.width,
      hsImage.height,
      hsPosition.x,
      hsPosition.y,
      hsImage.width,
      hsImage.height
    );

    return sliceImage;
  });

  // Position on Map
  sliceImages.forEach((sliceImage, index) => {
    const mapPosition = mapPositions(hsImage.width, hsImage.height);

    mapCanvasContext.drawImage(
      sliceImage,
      0,
      0,
      sliceImage.width,
      sliceImage.height,
      mapPosition[index].x,
      mapPosition[index].y + heightOffset,
      sliceImage.width,
      sliceImage.height
    );

    const nameIndex = nameMapping(index, sortedSpeaker.length);
    if (nameIndex !== undefined) {
      mapCanvasContext.font = "150px Impact";
      mapCanvasContext.fillStyle = "white";
      mapCanvasContext.textAlign = mapPosition[index].textAlign;
      mapCanvasContext.fillText(
        playerNamesMap?.[sortedSpeaker[nameIndex].playerId] ||
          "Name " + nameIndex,
        mapPosition[index].textX,
        mapPosition[index].textY + mapPosition[index].textOffsetY + heightOffset
      );
    }
  });

  return mapCanvas;
}

// (async function (state) {
//   const generatedMap = await generateMap(state);

//   fs.promises.writeFile(`map.png`, await generatedMap.encode("png"));
//   console.log("FINISHED GENERATING MAP");
// })(state);
