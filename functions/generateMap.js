import { createCanvas, loadImage } from "@napi-rs/canvas";
import { FACTION_DETAILS_MAP } from "../constants/factions.js";
import * as fs from "fs";
import { generateSliceImages } from "./generateSliceImages.js";
import { hsTranslation } from "../utils/translations.js";

const state = {
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
      rotation: Math.PI,
      x: 2 * width,
      y: 0,
      textX: 3.25 * width,
      textY: 0,
      textAlign: "center",
      textOffsetY: -50,
    },
    {
      rotation: Math.PI * (1 + 1 / 3),
      x: 3.5 * width,
      y: height,
      textX: 5.25 * width,
      textY: height * 1.5,
      textAlign: "start",
      textOffsetY: -50,
    },
    {
      rotation: Math.PI * (1 + 2 / 3),
      x: 3.5 * width,
      y: 3 * height,
      textX: 5.25 * width,
      textY: height * 5.5,
      textAlign: "start",
      textOffsetY: 200,
    },
    {
      rotation: 0,
      x: 2 * width,
      y: 4 * height,
      textX: 3.25 * width,
      textY: height * 7,
      textAlign: "center",
      textOffsetY: 200,
    },
    {
      rotation: Math.PI / 3,
      x: width * 0.5,
      y: 3 * height,
      textX: 1.25 * width,
      textY: height * 5.5,
      textAlign: "end",
      textOffsetY: 200,
    },
    {
      rotation: Math.PI * (2 / 3),
      x: width * 0.5,
      y: height,
      textX: 1.25 * width,
      textY: height * 1.5,
      textAlign: "end",
      textOffsetY: -50,
    },
  ];
};

export async function generateMap(state, slices, playerNames) {
  const sortedSpeaker = state.playerSelections.sort(
    (playerA, playerB) => playerA.speakerPosition - playerB.speakerPosition
  );

  const selectedFactions = sortedSpeaker.map((player) => player.faction);

  const HSImages = await Promise.allSettled(
    selectedFactions.map((faction) => {
      let hsNumber = FACTION_DETAILS_MAP[faction].hs;

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

  const sliceImages = selectedSlices.map((slice, sortedIndex) => {
    const index = slice.charCodeAt(0) - "a".charCodeAt(0);

    const hsImage = hsImages[sortedIndex];

    const hsPosition = hsTranslation(hsImage.width, hsImage.height);

    const sliceImage = slices[index];
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

  sliceImages.forEach((sliceImage, index) => {
    const sliceCanvas = createCanvas(sliceImage.width, sliceImage.height);
    const sliceCanvasContext = sliceCanvas.getContext("2d");

    const mapPosition = mapPositions(hsImage.width, hsImage.height);

    sliceCanvasContext.translate(sliceImage.width / 2, sliceImage.height / 2);
    sliceCanvasContext.rotate(mapPosition[index].rotation);
    sliceCanvasContext.translate(-sliceImage.width / 2, -sliceImage.height / 2);

    sliceCanvasContext.drawImage(
      sliceImage,
      0,
      0,
      sliceImage.width,
      sliceImage.height,
      0,
      0,
      sliceImage.width,
      sliceImage.height
    );

    mapCanvasContext.drawImage(
      sliceCanvas,
      0,
      0,
      sliceCanvas.width,
      sliceCanvas.height,
      mapPosition[index].x,
      mapPosition[index].y + heightOffset,
      sliceCanvas.width,
      sliceCanvas.height
    );

    mapCanvasContext.font = "150px Impact";
    mapCanvasContext.fillStyle = "white";
    mapCanvasContext.textAlign = mapPosition[index].textAlign;
    mapCanvasContext.fillText(
      playerNames?.[index] || "Name " + index,
      mapPosition[index].textX,
      mapPosition[index].textY + mapPosition[index].textOffsetY + heightOffset
    );
  });

  return mapCanvas;
}

(async function (state) {
  const { unslicedCanvases } = await generateSliceImages(state.mapSlices);
  const generatedMap = await generateMap(state, unslicedCanvases);

  fs.promises.writeFile(`map.png`, await generatedMap.encode("png"));
})(state);
