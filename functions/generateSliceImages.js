import { createCanvas, loadImage } from "@napi-rs/canvas";
import * as fs from "fs";
import {
  INFLUENCE_MAP,
  RESOURCE_MAP,
  RESU,
  INFU,
  SLICES,
  SYSTEM_FEATURES,
} from "../constants/slices.js";
import { FEATURE_MAP } from "../constants/systemFeatures.js";
import { cloneCanvas } from "../utils/cloneCanvas.js";
import { defaultHexTranslation, HEX_BOTTOM } from "../utils/translations.js";
import { addRotation } from "../utils/addRotation.js";

const featureOffset = (featureLength) => {
  return (featureLength / 2) * -100;
};

async function generateSlice(
  hsImage,
  slice,
  hexPositionsFunctions,
  hsTranslation,
  rotations,
  index
) {
  // TODO: Render on load of JS
  const results = await Promise.allSettled(
    slice.map((slice) => loadImage(`tiles/sys_${slice}.png`))
  );

  const images = results.map((result) => result.value);

  const baseWidth = images[0].width;
  const baseHeight = images[0].height;

  const fullWidth = Math.ceil(baseWidth * 2.5);
  const fullHeight = baseHeight * 3;
  const baseCanvas = createCanvas(fullWidth, fullHeight);

  const context = baseCanvas.getContext("2d");

  hexPositionsFunctions.forEach((hexPositionsFunc, index) => {
    const img = images[index];
    const hex = hexPositionsFunc(baseWidth, baseHeight);

    const rotatedImage = addRotation(img, rotations?.[index]);

    context.drawImage(
      rotatedImage,
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

  slicedContext.font = "120px Impact";
  slicedContext.fillStyle = "white";
  slicedContext.textAlign = "center";
  slicedContext.fillText(SLICES[index].toUpperCase(), center, baseHeight * 2.2);

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
    baseHeight * 2.45
  );

  slicedContext.fillText(
    `(${optimalResources}/${optimalInfluence})`,
    center,
    baseHeight * 2.7
  );
  const features = [];
  slice.forEach((sliceNum) => {
    const feature = SYSTEM_FEATURES[sliceNum];
    if (feature) {
      features.push(feature);
    }
  });
  // Draw Features
  const offset = featureOffset(features.length);

  features.forEach((feature, index) => {
    const featureImage = FEATURE_MAP[feature];
    const y = baseHeight * 2.8;
    const x = center + offset + index * 100;
    if (featureImage) {
      slicedContext.drawImage(
        featureImage,
        0,
        0,
        featureImage.width,
        featureImage.height,
        x,
        y,
        100,
        100
      );
    } else {
      slicedContext.font = "120px Impact";
      slicedContext.fillStyle = feature === "a" ? "#FF8A55" : "#6FC059";
      slicedContext.textAlign = "start";
      slicedContext.fillText(feature, x + 25, y + 100);
    }
  });

  return {
    unsliced: baseCanvas,
    sliced: imageWithHSAndTextCanvas,
  };
}

export async function generateSliceImages(
  slices,
  hexTransforms,
  hsTranslation,
  rotations
) {
  const masterWidth = Math.ceil(slices.length / 2) * 1800;
  const masterCanvas = createCanvas(masterWidth, 4000);

  const HSImage = await loadImage(`tiles/sys_0.png`);

  const imageSlices = await Promise.allSettled(
    slices.map((slice, index) =>
      generateSlice(
        HSImage,
        slice,
        hexTransforms?.[index] || defaultHexTranslation,
        hsTranslation?.[index] || HEX_BOTTOM,
        rotations?.[index],
        index
      )
    )
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
