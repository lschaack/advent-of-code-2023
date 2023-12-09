import { add, multiply } from '../common';
import input from './input';

type BagContents = {
  red: number;
  green: number;
  blue: number;
};

const EXAMPLE_BAG_CONTENTS: BagContents = {
  red: 12,
  green: 13,
  blue: 14,
};

const example = `Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green`;

const matchCubeSets = /\d+ (blue|red|green)/g;
const matchGameId = /Game (?<id>\d+):/;

const isGameImpossible = (game: string, bagContents: BagContents) => {
  return game
    .match(matchCubeSets)
    .some(cubeSet => {
      const [nCubes, cubeColor] = cubeSet.split(' ');

      return parseInt(nCubes) > bagContents[cubeColor as keyof BagContents];
    });
}

export const solvePartOne = () => {
  return input
    .split('\n')
    .map(game => {
      return isGameImpossible(game, EXAMPLE_BAG_CONTENTS)
        ? 0
        : parseInt(game.match(matchGameId).groups.id);
    })
    .reduce(add);
}

const getMinimumContents = (game: string) => {
  return game
    .match(matchCubeSets)
    .reduce((minContents, cubeSet) => {
      const [nCubes, cubeColor] = cubeSet.split(' ');

      minContents[cubeColor as keyof BagContents] = Math.max(
        minContents[cubeColor as keyof BagContents],
        parseInt(nCubes)
      );

      return minContents;
    }, { red: 0, green: 0, blue: 0 } as BagContents);
}

export const solvePartTwo = () => {
  return input
    .split('\n')
    .map(game => Object.values(getMinimumContents(game)).reduce(multiply))
    .reduce(add);
}
