import { createCanvas, loadImage } from "@napi-rs/canvas";
import { FACTION_DETAILS_MAP } from "../constants/factions.js";
import * as fs from "fs";
import { generateSliceImages } from "./generateSliceImages.js";
import { hsTranslation } from "../utils/translations.js";

const state = {
  playerSelections: {
    slim: {
      speakerPosition: 2,
      slice: "c",
      faction: "xxcha",
    },
    slim2: {
      speakerPosition: 4,
      slice: "a",
      faction: "jolnar",
    },
    slim3: {
      speakerPosition: 6,
      slice: "g",
      faction: "nekro",
    },
    slim4: {
      speakerPosition: 1,
      slice: "f",
      faction: "mentak",
    },
    slim5: {
      speakerPosition: 5,
      slice: "b",
      faction: "mentak",
    },
    slim6: {
      speakerPosition: 3,
      slice: "d",
      faction: "mentak",
    },
  },
};

const mapPositions = (width, height) => {
  return [
    {
      rotation: Math.PI,
      x: 2 * width,
      y: 0,
    },
    {
      rotation: Math.PI * (1 + 1 / 3),
      x: 3.5 * width,
      y: height,
    },
    {
      rotation: Math.PI * (1 + 2 / 3),
      x: 3.5 * width,
      y: 3 * height,
    },
    {
      rotation: 0,
      x: 2 * width,
      y: 4 * height,
    },
    {
      rotation: Math.PI / 3,
      x: width * 0.5,
      y: 3 * height,
    },
    {
      rotation: Math.PI * (2 / 3),
      x: width * 0.5,
      y: height,
    },
  ];
};

export async function generateMap(state, slices) {
  const sortedSpeaker = Object.keys(state.playerSelections).sort(
    (a, b) =>
      state.playerSelections[a].speakerPosition -
      state.playerSelections[b].speakerPosition
  );

  const selectedFactions = sortedSpeaker.map(
    (player) => state.playerSelections[player].faction
  );

  const HSImages = await Promise.allSettled(
    selectedFactions.map((faction) =>
      loadImage(`tiles/sys_${FACTION_DETAILS_MAP[faction].hs}.png`)
    )
  );

  const hsImages = HSImages.map((hs) => hs.value);

  const hsImage = hsImages[0];
  const mapCanvas = createCanvas(hsImage.width * 6.5, hsImage.width * 7);
  const mapCanvasContext = mapCanvas.getContext("2d");

  const mecatol = await loadImage(`tiles/sys_18.png`);
  const speaker = await loadImage(`tiles/speaker_m.png`);

  // Add Speaker
  const speakerWidth = mecatol.width / 2;
  const speakerRatio = speakerWidth / speaker.width;
  const speakerHeight = speakerRatio * speaker.height;
  const heightOffset = 200 + speakerHeight;

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

  const selectedSlices = sortedSpeaker.map(
    (player) => state.playerSelections[player].slice
  );

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

  sliceImages.forEach(async (sliceImage, index) => {
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
  });

  return mapCanvas;
}

(async function (state, sliceNumbers) {
  const { unslicedCanvases } = await generateSliceImages(sliceNumbers);
  const generatedMap = await generateMap(state, unslicedCanvases);

  fs.promises.writeFile(`map.png`, await generatedMap.encode("png"));
})(state, [
  [69, 22, 44, 42, 31],
  [62, 26, 67, 47, 29],
  [43, 39, 36, 60, 76],
  [65, 63, 70, 49, 68],
  [61, 38, 41, 37, 48],
  [30, 74, 80, 19, 45],
  [28, 27, 50, 23, 46],
  [59, 71, 40, 79, 72],
]);
