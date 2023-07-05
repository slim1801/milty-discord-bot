import { loadImage } from "@napi-rs/canvas";

export const FEATURE_MAP = {
  G: await loadImage(`tiles/Ti_icons_biotic.png`),
  Y: await loadImage(`tiles/Ti_icons_cybernetic.png`),
  B: await loadImage(`tiles/Ti_icons_propulsion.png`),
  R: await loadImage(`tiles/Ti_icons_warfare.png`),
  L: await loadImage(`tiles/legendary.png`),
};
