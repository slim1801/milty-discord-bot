import { createCanvas, loadImage } from "@napi-rs/canvas";
import { FACTION_DETAILS_MAP } from "../constants/factions.js";
import * as fs from "fs";
import { generateSliceImages } from "./generateSliceImages.js";
import {
  finalMapTranslations,
  homeSystemTranslations,
} from "../utils/translations.js";
import { addRotation } from "../utils/addRotation.js";

const state = {
  players: [1, 2, 3, 4, 5, 6],
  mapSlices: [
    [69, 22, 44, 42, 31],
    [62, 26, 67, 47, 29],
    [43, 39, 36, 60, 76],
    [65, 63, 70, 49, 68],
    [61, 38, 41, 37, 48],
    [30, 74, 80, 19, 45],
    [28, 27, 50, 23, 46],
    [59, 71, 40, 79, 72],
  ],
  playerSelections: [
    {
      playerId: "slim",
      speakerPosition: 2,
      slice: "c",
      faction: "xxcha",
    },
    {
      playerId: "slim2",
      speakerPosition: 4,
      slice: "a",
      faction: "jolnar",
    },
    {
      playerId: "slim3",
      speakerPosition: 6,
      slice: "g",
      faction: "nekro",
    },
    {
      playerId: "slim4",
      speakerPosition: 1,
      slice: "f",
      faction: "mentak",
    },
    {
      playerId: "slim5",
      speakerPosition: 5,
      slice: "b",
      faction: "mentak",
    },
    {
      playerId: "slim6",
      speakerPosition: 3,
      slice: "d",
      faction: "mentak",
    },
  ],
};

const mapPositions = (width, height) => {
  return [
    {
      // rotation: Math.PI,
      x: 2 * width,
      y: 0,
      textX: 3.25 * width,
      textY: 0,
      textAlign: "center",
      textOffsetY: -50,
    },
    {
      // rotation: Math.PI * (1 + 1 / 3),
      x: 3.5 * width,
      y: height,
      textX: 5.25 * width,
      textY: height * 1.5,
      textAlign: "start",
      textOffsetY: -50,
    },
    {
      // rotation: Math.PI * (1 + 2 / 3),
      x: 3.5 * width,
      y: 3 * height,
      textX: 5.25 * width,
      textY: height * 5.5,
      textAlign: "start",
      textOffsetY: 200,
    },
    {
      // rotation: 0,
      x: 2 * width,
      y: 4 * height,
      textX: 3.25 * width,
      textY: height * 7,
      textAlign: "center",
      textOffsetY: 200,
    },
    {
      // rotation: Math.PI / 3,
      x: width * 0.5,
      y: 3 * height,
      textX: 1.25 * width,
      textY: height * 5.5,
      textAlign: "end",
      textOffsetY: 200,
    },
    {
      // rotation: Math.PI * (2 / 3),
      x: width * 0.5,
      y: height,
      textX: 1.25 * width,
      textY: height * 1.5,
      textAlign: "end",
      textOffsetY: -50,
    },
  ];
};

const addHyperLanes = (slices) => {
  if (slices.length === 3) {
    return [
      [slices[0][0], slices[0][1], slices[0][2], "88A", slices[0][4]],
      ["84A", slices[0][4], "83A", "87A", "85A"],
      [slices[1][0], slices[1][1], slices[1][2], "88A", slices[1][4]],
      ["84A", slices[1][3], "83A", "87A", "85A"],
      [slices[1][0], slices[1][1], slices[1][2], "88A", slices[1][4]],
      ["84A", slices[1][3], "83A", "87A", "85A"],
    ];
  }
  if (slices.length === 4) {
    return [
      slices[0],
      [slices[1][0], slices[1][1], slices[1][2], "88A", slices[1][4]],
      ["84A", slices[1][3], "83A", "87A", "85A"],
      slices[2],
      [slices[3][0], slices[3][1], slices[3][2], "88A", slices[3][4]],
      ["84A", slices[3][3], "83A", "87A", "85A"],
    ];
  }
  if (slices.length === 5) {
    return [
      slices[0],
      slices[1],
      [slices[2][0], slices[2][1], slices[2][2], "88A", slices[2][4]],
      ["84A", slices[2][3], "83A", "87A", "85A"],
      slices[3],
      slices[4],
    ];
  }
  return slices;
};

const addHyperLaneHS = (factions) => {
  if (factions.length === 3) {
    return [factions[0], "86A", factions[1], "86A", factions[2], "86A"];
  }
  if (factions.length === 4) {
    return [factions[0], factions[1], "86A", factions[2], factions[3], "86A"];
  }
  if (factions.length === 5) {
    return [
      factions[0],
      factions[1],
      factions[2],
      "86A",
      factions[3],
      factions[4],
    ];
  }
  return factions;
};

const addHyperLaneRotation = (numPlayers) => {
  if (numPlayers === 3) {
    return [
      [undefined, undefined, undefined, (-Math.PI * 2) / 3, undefined],
      [
        (-Math.PI * 2) / 3,
        undefined,
        (-Math.PI * 2) / 3,
        (-Math.PI * 2) / 3,
        (-Math.PI * 2) / 3,
      ],
      undefined,
      undefined,
      [undefined, undefined, undefined, (Math.PI * 2) / 3, undefined],
      [
        (Math.PI * 2) / 3,
        undefined,
        (Math.PI * 2) / 3,
        (Math.PI * 2) / 3,
        (Math.PI * 2) / 3,
      ],
    ];
  }
  if (numPlayers === 4) {
    return [
      undefined,
      [undefined, undefined, undefined, -Math.PI / 3, undefined],
      [-Math.PI / 3, undefined, -Math.PI / 3, -Math.PI / 3, -Math.PI / 3],
      undefined,
      [undefined, undefined, undefined, (Math.PI * 2) / 3, undefined],
      [
        (Math.PI * 2) / 3,
        undefined,
        (Math.PI * 2) / 3,
        (Math.PI * 2) / 3,
        (Math.PI * 2) / 3,
      ],
    ];
  }
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

export async function generateMap(state, playerNames) {
  const sortedSpeaker = state.playerSelections.sort(
    (playerA, playerB) => playerA.speakerPosition - playerB.speakerPosition
  );

  const selectedFactions = addHyperLaneHS(
    sortedSpeaker.map((player) => player.faction)
  );

  const HSImages = await Promise.allSettled(
    selectedFactions.map((faction) => {
      let hsNumber = FACTION_DETAILS_MAP[faction]?.hs || faction;

      // Keleres exception
      if (faction === "keleres") {
        if (state.keleres === "argent") {
          hsNumber = "58k";
        } else if (state.keleres === "xxcha") {
          hsNumber = "14k";
        } else {
          hsNumber = "2k";
        }
      }
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
        playerNames?.[nameIndex] || "Name " + nameIndex,
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
