const RUSSIAN_ALPHABET = "абвгдежзийклмнопрстуфхцчшщъыьэюя";

const originalGrid = [
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 0, 1, 0, 0, 1, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
  [1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 0, 1, 1, 0, 0, 1, 1, 0]
];

function deepcopy(matrix: number[][]) {
  return matrix.map(row => [...row]);
}

function rotate_1(grid: number[][]) {
  return grid.map(row => [...row].reverse());
}

function rotate_2(grid: number[][]) {
  const rows = grid.length;
  return Array.from({ length: rows }, (_, i) => [...grid[rows - 1 - i]]);
}

export function shifrKordano(text: string) {
	let trafar = deepcopy(originalGrid);
  let message = text.split("");

  while (message.length % 60 !== 0) {
    message.push(RUSSIAN_ALPHABET[Math.floor(Math.random() * RUSSIAN_ALPHABET.length)]);
  }

  let result = "";

  while (message.length > 0) {
    let tmp_trafar = deepcopy(trafar);
    let tmp_matrix = Array.from({ length: 6 }, () => Array(10).fill(""));

    const writeFromGrid = (t: number[][]) => {
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 10; j++) {
          if (t[i][j] === 0 && tmp_matrix[i][j] === "") {
            tmp_matrix[i][j] = message.shift();
          }
        }
      }
    };

    writeFromGrid(trafar);
    trafar = rotate_2(trafar);
    writeFromGrid(trafar);
    trafar = rotate_1(trafar);
    writeFromGrid(trafar);
    trafar = rotate_2(trafar);
    writeFromGrid(trafar);

    for (let row of tmp_matrix) {
      result += row.join("");
    }

    trafar = tmp_trafar;
  }

  return result;
}

export function unShifrKordano(text: string) {
	let trafar = deepcopy(originalGrid);
  let result = "";
  let chars = text.split("");

  while (chars.length > 0) {
    const tmp_matrix = Array.from({ length: 6 }, () => Array(10).fill(""));
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 10; j++) {
        tmp_matrix[i][j] = chars.shift();
      }
    }

    let tmp_trafar = deepcopy(trafar);

    const readFromGrid = (t: number[][]) => {
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 10; j++) {
          if (t[i][j] === 0) {
            result += tmp_matrix[i][j];
          }
        }
      }
    };

    readFromGrid(trafar);
    trafar = rotate_2(trafar);
    readFromGrid(trafar);
    trafar = rotate_1(trafar);
    readFromGrid(trafar);
    trafar = rotate_2(trafar);
    readFromGrid(trafar);

    trafar = tmp_trafar;
  }

  return result;
}