import { createCanvas } from "@napi-rs/canvas";

export const addRotation = (img, rotation) => {
  if (rotation) {
    const rotatedImage = createCanvas(img.width, img.height);
    const rotatedImageContext = rotatedImage.getContext("2d");

    rotatedImageContext.translate(img.width / 2, img.height / 2);
    rotatedImageContext.rotate(rotation);
    rotatedImageContext.translate(-img.width / 2, -img.height / 2);

    rotatedImageContext.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      0,
      0,
      img.width,
      img.height
    );
    return rotatedImage;
  }
  return img;
};
