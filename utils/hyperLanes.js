export const addHyperLanes = (slices) => {
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

export const addHyperLaneHS = (factions) => {
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

export const addHyperLaneRotation = (numPlayers) => {
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
