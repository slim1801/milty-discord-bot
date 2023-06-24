import { RESU, INFU } from "../constants/slices.js";

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const generateSlices = ({
  numSlices,
  hasLegendaries,
  mininf,
  minres,
  mintot,
  maxtot,
}) => {
  let minalpha = 0;
  let minbeta = 0;
  let minlegend = 0;
  if (hasLegendaries) {
    minalpha = Math.random() < 0.5 ? 2 : 3;
    minbeta = Math.random() < 0.5 ? 2 : 3;
    minlegend = Math.random() < 0.5 ? 1 : 2;
  }

  let slices;
  let loops = 0;
  while (loops < 1000000) {
    slices = [];
    loops += 1;

    const high = shuffle([
      28, 29, 30, 32, 33, 35, 36, 38, 69, 70, 71, 75,
    ]).slice(-numSlices);
    const meds = shuffle([
      26, 27, 31, 34, 37, 64, 65, 66, 72, 73, 74, 76,
    ]).slice(-numSlices);
    const lows = shuffle([
      19, 20, 21, 22, 23, 24, 25, 59, 60, 61, 62, 63,
    ]).slice(-numSlices);
    const reds = shuffle([
      39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 67, 68, 77, 78, 79, 80,
    ]).slice(-2 * numSlices);

    if (meds.includes(26) + reds.includes(39) + reds.includes(79) < minalpha) {
      continue;
    }
    if (lows.includes(25) + reds.includes(40) + meds.includes(64) < minbeta) {
      continue;
    }
    if (meds.includes(65) + meds.includes(66) < minlegend) {
      continue;
    }
    let good = true;
    for (let i = 0; i < numSlices; i++) {
      let s = [high[i], meds[i], lows[i], reds[2 * i], reds[2 * i + 1]];
      let sres = 0;
      let sinf = 0;
      for (let j = 0; j < s.length; j++) {
        let n = s[j];
        sres += RESU[n] ?? 0;
        sinf += INFU[n] ?? 0;
      }
      if (
        sres < minres ||
        sinf < mininf ||
        sres + sinf < mintot ||
        sres + sinf > maxtot
      ) {
        good = false;
        break;
      }
      if (s.includes(26) + s.includes(39) + s.includes(79) > 1) {
        good = false;
        break;
      }
      if (s.includes(25) + s.includes(40) + s.includes(64) > 1) {
        good = false;
        break;
      }
      if (s.includes(65) + s.includes(66) > 1) {
        good = false;
        break;
      }

      for (var k = 0; k < 12; k++) {
        s = shuffle(s);
        good = true;
        const neigh = [
          [0, 1],
          [0, 3],
          [1, 2],
          [1, 3],
          [1, 4],
          [3, 4],
        ];
        let anom = [41, 42, 43, 44, 45, 67, 68, 79, 80];
        for (let j = 0; j < neigh.length; j++) {
          if (anom.includes(s[neigh[j][0]]) && anom.includes(s[neigh[j][1]])) {
            good = false;
            break;
          }
        }
        if (good) {
          break;
        }
      }
      if (!good) {
        break;
      }

      slices.push(s);
    }
    if (good) {
      break;
    }
  }

  if (loops == 1000000) {
    throw new Error(
      "Could not generate slices after one million attempts.\nPlease try again or modify options."
    );
  }
  return slices;
};
