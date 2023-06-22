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
