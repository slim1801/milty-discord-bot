import { createCanvas, loadImage } from "@napi-rs/canvas";

export const cloneCanvas = (oldCanvas) => {
  const newCanvas = createCanvas(oldCanvas.width, oldCanvas.height);
  const context = newCanvas.getContext("2d");
  context.drawImage(oldCanvas, 0, 0);
  return newCanvas;
};
