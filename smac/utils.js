const getTable = size => Array(size).fill(0).map(()=>Array(size).fill(0));
const getRandomCoord = size => [getRandomInt(0, size), getRandomInt(0, size)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const arraysEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

const getNeib8 = (coord, size) => {
  const neibs = [[-1, -1], [-1, 0], [-1, 1], [0,-1], [0, 1], [1,-1], [1, 0], [1, 1]];

  const final_neibs = [];
  for(let neib_idx = 0; neib_idx < 8; neib_idx++) {
    
    const c0 = coord[0] + neibs[neib_idx][0];
    const c1 = coord[1] + neibs[neib_idx][1];

    if (c0 >= 0 && c0 < size && c1 >= 0 && c1 < size) {
      final_neibs.push([c0, c1, coord[2]]);
    }
  }

  return final_neibs;
};

const choice = list => {
  return list[Math.floor(Math.random() * list.length)];
};

module.exports = {
  getTable, getRandomCoord, getRandomInt, arraysEqual, getNeib8, choice
};