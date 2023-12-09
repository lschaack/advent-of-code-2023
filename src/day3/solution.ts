import { add, multiply } from '../common';
import input from './input';

const example = `467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..`;

const example2 = `12.......*..
+.........34
.......-12..
..78........
..*....60...
78.........9
.5.....23..$
8...90*12...
............
2.2......12.
.*.........*
1.1..503+.56`;

type Coord = [number, number];
type Schematic = {
  data: string;
  width: number;
  height: number;
}

// TODO: make this a command line arg
const DEBUG = false;
const DIRECTIONS: Record<string, Coord> = {
  NW: [-1, -1],
  N:  [ 0, -1],
  NE: [ 1, -1],
  E:  [ 1,  0],
  SE: [ 1,  1],
  S:  [ 0,  1],
  SW: [-1,  1],
  W:  [-1,  0],
};

const VISITED_INDICES = new Set<number>();

const matchSymbols = new RegExp(/[^\w\d.]/g);
const matchNumber = new RegExp(/\d/);

const indicesOf = (string: string, regex: RegExp) => {
  const indices = [];

  for (let i = 0; i < string.length; i++) {
    if (regex.test(string[i])) indices.push(i);
  }

  return indices;
}

const getWidth = (input: string) => input.indexOf('\n');
const getHeight = (input: string) => input.split('\n').length;
const coordToIndex = ([x, y]: Coord, width: number) => y * width + x;
const indexToCoord = (index: number, width: number): Coord => [index % width, Math.floor(index / width)];
const addCoords = ([x1, y1]: Coord, [x2, y2]: Coord): Coord => [x1 + x2, y1 + y2];

// visiting an index returns a part number if an unvisited number exists at that index,
// otherwise it returns an empty string
const visit = (index: number, schematic: Schematic): string => {
  if (VISITED_INDICES.has(index)) return '';

  VISITED_INDICES.add(index);

  const char = schematic.data[index];

  if (matchNumber.test(char)) {
    // avoid wrapping numbers around the walls, a lot easier to do in coords
    const startCoord = indexToCoord(index, schematic.width);
    const leftCoord = addCoords(startCoord, DIRECTIONS.W);
    const rightCoord = addCoords(startCoord, DIRECTIONS.E);
    const left = isValidCoord(leftCoord, schematic.width, schematic.height) ? visit(index - 1, schematic) : '';
    const right = isValidCoord(rightCoord, schematic.width, schematic.height) ? visit(index + 1, schematic) : '';

    return `${left}${char}${right}`;
  } else {
    return '';
  }
}

const isValidCoord = ([startX, startY]: Coord, width: number, height: number): boolean => {
  return (
    startY >= 0
    && startX < width
    && startY < height
    && startX >= 0
  );
}

export const solvePartOne = () => {
  const schematicInput = input;

  const schematic: Schematic = {
    data: schematicInput.replaceAll('\n', ''),
    width: getWidth(schematicInput),
    height: getHeight(schematicInput),
  }

  const symbolIndices = indicesOf(schematic.data, matchSymbols);

  if (DEBUG) console.log('symbolIndices', symbolIndices);

  let partNumberSum = 0;

  for (const index of symbolIndices) {
    const symbolCoord = indexToCoord(index, schematic.width);

    for (const direction of Object.values(DIRECTIONS)) {
      const coordToVisit = addCoords(symbolCoord, direction);
      const indexToVisit = coordToIndex(coordToVisit, schematic.width);

      if (isValidCoord(coordToVisit, schematic.width, schematic.height) && !VISITED_INDICES.has(indexToVisit)) {
        const partNumber = visit(indexToVisit, schematic);

        if (DEBUG && matchNumber.test(partNumber)) {
          console.log(''.padEnd(80, '-'));
          console.log('found partNumber', partNumber);
          console.log('index', index);
          console.log(`symbol "${schematic.data[index]}"`);
          console.log('symbolCoord', symbolCoord);
          console.log('direction', direction);
          console.log('toVisit', indexToVisit);
        }

        partNumberSum += Number(partNumber);
      }
    }
  }

  return partNumberSum;
}

export const solvePartTwo = () => {
  const schematicInput = input;

  const schematic: Schematic = {
    data: schematicInput.replaceAll('\n', ''),
    width: getWidth(schematicInput),
    height: getHeight(schematicInput),
  }

  const symbolIndices = indicesOf(schematic.data, matchSymbols);

  if (DEBUG) console.log('symbolIndices', symbolIndices);

  let gearRatioSum = 0;

  for (const index of symbolIndices) {
    const symbolCoord = indexToCoord(index, schematic.width);

    const partNumbers: number[] = [];

    for (const direction of Object.values(DIRECTIONS)) {
      const coordToVisit = addCoords(symbolCoord, direction);
      const indexToVisit = coordToIndex(coordToVisit, schematic.width);

      if (isValidCoord(coordToVisit, schematic.width, schematic.height) && !VISITED_INDICES.has(indexToVisit)) {
        const partNumber = Number(visit(indexToVisit, schematic));

        if (partNumber) partNumbers.push(partNumber);
      }
    }

    if (partNumbers.length === 2) {
      const ratio = partNumbers.reduce(multiply);

      if (DEBUG) console.log(`found  gear ${partNumbers} with ratio ${ratio}`);

      gearRatioSum += ratio;
    }
  }

  return gearRatioSum;
}

