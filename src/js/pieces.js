export const EMPTY_CELL = 0;

export const PIECE_TYPES = Object.freeze(["I", "O", "T", "S", "Z", "J", "L"]);

export const PIECES = Object.freeze({
  I: Object.freeze([
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]),
  O: Object.freeze([
    [2, 2],
    [2, 2],
  ]),
  T: Object.freeze([
    [0, 3, 0],
    [3, 3, 3],
    [0, 0, 0],
  ]),
  S: Object.freeze([
    [0, 4, 4],
    [4, 4, 0],
    [0, 0, 0],
  ]),
  Z: Object.freeze([
    [5, 5, 0],
    [0, 5, 5],
    [0, 0, 0],
  ]),
  J: Object.freeze([
    [6, 0, 0],
    [6, 6, 6],
    [0, 0, 0],
  ]),
  L: Object.freeze([
    [0, 0, 7],
    [7, 7, 7],
    [0, 0, 0],
  ]),
});

export const PIECE_COLORS = Object.freeze({
  1: { fill: "#23c9d6", stroke: "#136f7f" },
  2: { fill: "#f3c842", stroke: "#a87d16" },
  3: { fill: "#9b5df6", stroke: "#5b2ead" },
  4: { fill: "#70d33f", stroke: "#347d1e" },
  5: { fill: "#f15d68", stroke: "#a52c39" },
  6: { fill: "#3478f6", stroke: "#1d4196" },
  7: { fill: "#ff8a1d", stroke: "#a84c0c" },
});

export function cloneMatrix(matrix) {
  return matrix.map((row) => [...row]);
}

export function clonePiece(piece) {
  return {
    type: piece.type,
    matrix: cloneMatrix(piece.matrix),
  };
}

export function createPiece(type) {
  if (!PIECES[type]) {
    throw new Error(`Tipo de peça inválido: ${type}`);
  }

  return {
    type,
    matrix: cloneMatrix(PIECES[type]),
  };
}

export function getMatrixBounds(matrix) {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (let y = 0; y < matrix.length; y += 1) {
    for (let x = 0; x < matrix[y].length; x += 1) {
      if (matrix[y][x] !== EMPTY_CELL) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (!Number.isFinite(minX)) {
    return null;
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

export function rotateMatrixClockwise(matrix) {
  const sizeY = matrix.length;
  const sizeX = matrix[0].length;
  const rotated = Array.from({ length: sizeX }, () => Array(sizeY).fill(EMPTY_CELL));

  for (let y = 0; y < sizeY; y += 1) {
    for (let x = 0; x < sizeX; x += 1) {
      rotated[x][sizeY - 1 - y] = matrix[y][x];
    }
  }

  return rotated;
}

export function createSevenBag() {
  let queue = [];

  function refill() {
    queue = [...PIECE_TYPES];

    for (let i = queue.length - 1; i > 0; i -= 1) {
      const swapIndex = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[swapIndex]] = [queue[swapIndex], queue[i]];
    }
  }

  return {
    next() {
      if (queue.length === 0) {
        refill();
      }

      return queue.pop();
    },
    remaining() {
      return [...queue];
    },
  };
}

function countActiveCells(matrix) {
  return matrix.flat().filter((cell) => cell !== EMPTY_CELL).length;
}

for (const type of PIECE_TYPES) {
  if (countActiveCells(PIECES[type]) !== 4) {
    throw new Error(`A peça ${type} deve ter exatamente 4 blocos ativos.`);
  }
}
