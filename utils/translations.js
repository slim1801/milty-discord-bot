export const hsTranslation = (width, height) => {
  return {
    x: width * 0.75,
    y: height * 2,
  };
};

export const hexTranslations = (width, height) => {
  const middleCenter = width * 0.75;
  return [
    // REMAINING HEXES
    {
      x: 0,
      y: height + height * 0.5,
    },
    {
      x: middleCenter,
      y: height,
    },
    {
      x: width * 1.5,
      y: height + height * 0.5,
    },
    {
      x: 0,
      y: height * 0.5,
    },
    {
      x: middleCenter,
      y: 0,
    },
  ];
};

export const HEX_TOP = (width, height) => ({
  x: width * 0.75,
  y: 0,
});
export const HEX_MIDTOP_LEFT = (width, height) => ({ x: 0, y: height * 0.5 });
export const HEX_MIDTOP_RIGHT = (width, height) => ({
  x: width * 1.5,
  y: height * 0.5,
});
export const HEX_CENTER = (width, height) => ({ x: width * 0.75, y: height });
export const HEX_MIDBOTTOM_LEFT = (width, height) => ({
  x: 0,
  y: height + height * 0.5,
});
export const HEX_MIDBOTTOM_RIGHT = (width, height) => ({
  x: width * 1.5,
  y: height + height * 0.5,
});
export const HEX_BOTTOM = (width, height) => ({
  x: width * 0.75,
  y: height * 2,
});

export const homeSystemTranslations = [
  HEX_TOP,
  HEX_MIDTOP_RIGHT,
  HEX_MIDBOTTOM_RIGHT,
  HEX_BOTTOM,
  HEX_MIDBOTTOM_LEFT,
  HEX_MIDTOP_LEFT,
];

export const defaultHexTranslation = [
  HEX_MIDBOTTOM_LEFT,
  HEX_CENTER,
  HEX_MIDBOTTOM_RIGHT,
  HEX_MIDTOP_LEFT,
  HEX_TOP,
];

export const finalMapTranslations = [
  // SPEAKER
  [
    HEX_MIDTOP_RIGHT,
    HEX_CENTER,
    HEX_MIDTOP_LEFT,
    HEX_MIDBOTTOM_RIGHT,
    HEX_BOTTOM,
  ],
  [HEX_MIDBOTTOM_RIGHT, HEX_CENTER, HEX_TOP, HEX_BOTTOM, HEX_MIDBOTTOM_LEFT],
  [
    HEX_BOTTOM,
    HEX_CENTER,
    HEX_MIDTOP_RIGHT,
    HEX_MIDBOTTOM_LEFT,
    HEX_MIDTOP_LEFT,
  ],
  [
    HEX_MIDBOTTOM_LEFT,
    HEX_CENTER,
    HEX_MIDBOTTOM_RIGHT,
    HEX_MIDTOP_LEFT,
    HEX_TOP,
  ],
  [HEX_MIDTOP_LEFT, HEX_CENTER, HEX_BOTTOM, HEX_TOP, HEX_MIDTOP_RIGHT],
  [
    HEX_TOP,
    HEX_CENTER,
    HEX_MIDBOTTOM_LEFT,
    HEX_MIDTOP_RIGHT,
    HEX_MIDBOTTOM_RIGHT,
  ],
];
