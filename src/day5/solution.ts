import { add, minimize } from '../common';
import input from './input';

const example = `seeds: 79 14 55 13

seed-to-soil map:
50 98 2
52 50 48

soil-to-fertilizer map:
0 15 37
37 52 2
39 0 15

fertilizer-to-water map:
49 53 8
0 11 42
42 0 7
57 7 4

water-to-light map:
88 18 7
18 25 70

light-to-temperature map:
45 77 23
81 45 19
68 64 13

temperature-to-humidity map:
0 69 1
1 0 69

humidity-to-location map:
60 56 37
56 93 4`;

type MapType =
  | 'seedToSoil'
  | 'soilToFertilizer'
  | 'fertilizerToWater'
  | 'waterToLight'
  | 'lightToTemperature'
  | 'temperatureToHumidity'
  | 'humidityToLocation';

type Range = [number, number];
type BinaryRangeOperator<ReturnType> = (left: Range, right: Range) => ReturnType;
type RangeRelationship = 'no-overlap' | 'partly-contained-lower' | 'contained' | 'partly-contained-upper' | 'contains';

type Transform = {
  sourceRange: Range;
  destinationRange: Range;
  shift: number;
}

type Bound = {
  bound: number;
  type: 'lower' | 'upper';
  which: 'a' | 'b';
  transform: Transform;
}

type Almanac = {
  seeds: number[];
  transforms: Transform[][];
  precomputedTransform: Transform[];
};

// thank you multi-cursor editing
const matchAlmanac = /^seeds:(?<seeds>[\d\s]+)seed-to-soil map:(?<seedToSoil>[\d\s]+)soil-to-fertilizer map:(?<soilToFertilizer>[\d\s]+)fertilizer-to-water map:(?<fertilizerToWater>[\d\s]+)water-to-light map:(?<waterToLight>[\d\s]+)light-to-temperature map:(?<lightToTemperature>[\d\s]+)temperature-to-humidity map:(?<temperatureToHumidity>[\d\s]+)humidity-to-location map:(?<humidityToLocation>[\d\s]+)$/;

const parseRangeSource = (source: string): Transform => {
  const [destinationStart, sourceStart, rangeLength] = source
    .split(' ')
    .map(rangeVal => parseInt(rangeVal));

  // TODO: should probably convert start + range into actual bounds
  return {
    sourceRange: [sourceStart, sourceStart + rangeLength],
    destinationRange: [destinationStart, destinationStart + rangeLength],
    shift: destinationStart - sourceStart,
  };
}

const parseMapSource = (source: string): Array<Transform> => {
  return source
    .trim()
    .split(/\n+/)
    .map(parseRangeSource);
}

const isInRange = (x: number, [lowerBound, upperBound]: Range) => {
  return x >= lowerBound && x <= upperBound;
}

const findSeedPosition = (seed: number, maps: Almanac['transforms']) => {
  return maps.reduce((position, map) => {
    for (const filter of map) {
      if (isInRange(position, filter.sourceRange)) {
        return position + filter.shift;
      }
    }
    // doesn't match the range of any filter, leave as-is
    return position;
  }, seed);
}

export const solvePartOne = () => {
  const almanacSource = example;
  const almanac = parseAlmanacSource(almanacSource);
  const locations = almanac.seeds.map(seed => findSeedPosition(seed, almanac.transforms))

  return locations.reduce(minimize);
};

const createTransform = (sourceRange: Range, shift: number): Transform => ({
  sourceRange,
  destinationRange: [sourceRange[0] + shift, sourceRange[1] + shift],
  shift,
})

const createBound = (
  transform: Transform,
  which: Bound['which'],
  type: Bound['type']
): Bound => {
  const [lower, upper] = which === 'b' ? transform.sourceRange : transform.destinationRange;
  const bound = type === 'lower' ? lower : upper;

  return {
    bound,
    type,
    which,
    transform,
  };
}

/**
 * This is the algorithm below in visual form - essentially, combine the shifts
 * from all active transforms at every part of the covered range
 *
 * In the diagram below, ":" is used to indicate dropping a line down to the
 * corresponding index of the bound as it's encountered, 'R' is 'Result'
 *
 * A |    1111111
 *   |    :     :
 * B | 22222   555555
 * --+-:--::---::---:-
 * R | 22233111665555
 */
const joinTransforms = (a: Transform[], b: Transform[]): Transform[] => {
  // Start by grabbing every bound (upper and lower) of every transform
  const ascendingRangeBounds = [
    ...a.flatMap<Bound>(transform => [
      createBound(transform, 'a', 'lower'),
      createBound(transform, 'a', 'upper'),
    ]),
    ...b.flatMap<Bound>(transform => [
      createBound(transform, 'b', 'lower'),
      createBound(transform, 'b', 'upper'),
    ])
  ].sort(({ bound: a }, { bound: b }) => a - b);

  const joined: Transform[] = [];
  const activeTransforms: Set<Transform> = new Set();
  let prevBound: Bound;

  // Join transform maps by combining transforms with overlapping ranges.
  // Do this by visiting each bound in ascending order, creating a transform
  // with all combined shifts when a new bound is encountered with at least
  // one transform already active.
  console.log('a', a);
  console.log('b', b);
  console.log('ascendingRangeBounds', ascendingRangeBounds)
  for (const currBound of ascendingRangeBounds) {
    const { bound, type, transform } = currBound;
    
    // close off a new bound with a combined transform accounting for all active shifts
    if (activeTransforms.size) {
      // FIXME: we need to reason w/destination range, but then generated map should use source range
      // ^^^^^: to do this, we need to know if both current and previous bound are source or destination
      // ^ what if we do know?
      // -> prev = source, curr = source  | []
      // -> prev = source, curr = dest    | 
      // -> prev = dest, curr = dest      | 
      // -> prev = dest, curr = source    | 

      // how do I combine a single pair from the almanac?
      const boundRange: Range = [
        prevBound.bound - prevBound.transform.shift,
        bound - prevBound.transform.shift
      ];

      const totalShift = Array
        .from(activeTransforms)
        .map(({ shift }) => shift)
        .reduce(add);

      // console.log('prevBound', prevBound);
      // console.log('currBound', currBound);
      // console.log('boundRange', boundRange);
      // console.log('totalShift', totalShift);

      joined.push(createTransform(boundRange, totalShift));
    }

    // Now we also need to account for one additional or one fewer shift
    if (type === 'lower') activeTransforms.add(transform);
    else activeTransforms.delete(transform);

    prevBound = currBound;
  }

  return joined;
}

const parseAlmanacSource = (source: string): Almanac => {
  const {
    groups: { seeds, ...rawMaps }
  } = source.match(matchAlmanac);

  const maps = Object
    .values(rawMaps)
    .map(parseMapSource);

  return {
    seeds: seeds.trim().split(/\s+/).map(seed => parseInt(seed)),
    transforms: maps,
    precomputedTransform: maps.reduce(joinTransforms),
  }
}

export const solvePartTwo = () => {
  const almanacSource = example;

  const almanac = parseAlmanacSource(almanacSource);

  let seedPairs = [];
  for (let i = 0; i < almanac.seeds.length; i += 2) {
    seedPairs.push([almanac.seeds[i], almanac.seeds[i + 1]]);
  }

  const transformSingleton = [almanac.precomputedTransform];
  const _findSeedPosition = (seed: number) => findSeedPosition(seed, transformSingleton);

  let locations = [];
  for (const [seedStart, rangeLength] of seedPairs) {
    for (let seed = seedStart; seed < seedStart + rangeLength; seed++) {
      console.log('seed', seed, 'of', rangeLength);
      locations.push(_findSeedPosition(seed));
    }
  }

  return locations.reduce(minimize);
}
