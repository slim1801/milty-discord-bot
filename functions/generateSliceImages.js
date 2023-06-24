import { createCanvas, loadImage } from "@napi-rs/canvas";
import * as fs from "fs";
import {
  INFLUENCE_MAP,
  RESOURCE_MAP,
  RESU,
  INFU,
  SLICES,
} from "../constants/slices.js";
import { cloneCanvas } from "../utils/cloneCanvas.js";
import { hsTranslation, hexTranslations } from "../utils/translations.js";

async function generateSlice(hsImage, slice, index) {
  // TODO: Render on load of JS
  const results = await Promise.allSettled(
    slice.map((slice) => loadImage(`tiles/sys_${slice}.png`))
  );

  const images = results.map((result) => result.value);

  const fullWidth = Math.ceil(images[0].width * 2.5);
  const fullHeight = images[0].height * 3;
  const baseCanvas = createCanvas(fullWidth, fullHeight);

  const context = baseCanvas.getContext("2d");

  const baseWidth = images[0].width;
  const baseHeight = images[0].height;

  const hexPositions = hexTranslations(baseWidth, baseHeight);

  hexPositions.forEach((hex, index) => {
    const img = images[index];
    context.drawImage(
      img,
      0,
      0,
      img.width,
      img.height, // source dimensions
      hex.x,
      hex.y,
      img.width,
      img.height // destination dimensions
    );
  });
  const center = baseWidth * 1.25;

  const imageWithHSAndTextCanvas = cloneCanvas(baseCanvas);
  const slicedContext = imageWithHSAndTextCanvas.getContext("2d");

  const hsPosition = hsTranslation(baseWidth, baseHeight);
  slicedContext.drawImage(
    hsImage,
    0,
    0,
    hsImage.width,
    hsImage.height, // source dimensions
    hsPosition.x,
    hsPosition.y,
    hsImage.width,
    hsImage.height // destination dimensions
  );

  slicedContext.font = "150px Impact";
  slicedContext.fillStyle = "white";
  slicedContext.textAlign = "center";
  slicedContext.fillText(SLICES[index].toUpperCase(), center, baseHeight * 2.3);

  const totalResources = slice.reduce(
    (acc, system) => acc + (RESOURCE_MAP[system] || 0),
    0
  );
  const totalInfluence = slice.reduce(
    (acc, system) => acc + (INFLUENCE_MAP[system] || 0),
    0
  );

  const optimalResources = slice.reduce(
    (acc, system) => acc + (RESU[system] || 0),
    0
  );
  const optimalInfluence = slice.reduce(
    (acc, system) => acc + (INFU[system] || 0),
    0
  );

  slicedContext.fillText(
    `${totalResources}/${totalInfluence}`,
    center,
    baseHeight * 2.6
  );

  slicedContext.fillText(
    `${optimalResources}/${optimalInfluence}`,
    center,
    baseHeight * 2.9
  );

  return {
    unsliced: baseCanvas,
    sliced: imageWithHSAndTextCanvas,
  };
}

export async function generateSliceImages(slices) {
  const masterWidth = Math.ceil(slices.length / 2) * 1800;
  const masterCanvas = createCanvas(masterWidth, 4000);

  const HSImage = await loadImage(`tiles/sys_0.png`);

  const imageSlices = await Promise.allSettled(
    slices.map((slice, index) => generateSlice(HSImage, slice, index))
  );

  const canvases = imageSlices.map((imgSlice) => imgSlice.value.sliced);
  const unslicedCanvases = imageSlices.map(
    (imgSlice) => imgSlice.value.unsliced
  );

  const context = masterCanvas.getContext("2d");

  canvases.forEach((canvas, index) => {
    context.drawImage(
      canvas,
      0,
      0,
      canvas.width,
      canvas.height,
      Math.floor(index / 2) * 1800,
      (index % 2) * 2000,
      canvas.width,
      canvas.height
    );
  });

  // fs.promises.writeFile("output.png", await masterCanvas.encode("png"));

  return {
    unslicedCanvases,
    sliceDraft: masterCanvas,
  };
}
