import { minimize } from '../common';
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

type Almanac = {
  seeds: number[];
  transforms: Transform[][];
  precomputedTransform: Transform;
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

const filterSeed = (seed: number, maps: Almanac['transforms']) => {
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
  const almanacSource = input;
  const almanac = parseAlmanacSource(almanacSource);
  const locations = almanac.seeds.map(seed => filterSeed(seed, almanac.transforms))

  return locations.reduce(minimize);
};

const compare: BinaryRangeOperator<RangeRelationship> = ([lowerA, upperA], [lowerB, upperB]) => {
  if (upperA < lowerB) return 'no-overlap';
  else if (upperA <= upperB)
    if (lowerA <= lowerB) return 'partly-contained-lower';
    else return 'contained';
  else if (lowerA <= upperB)
    if (lowerA > lowerB) return 'partly-contained-upper';
    else return 'contains';
  else return null;
}

const intersect: BinaryRangeOperator<Range | null> = (a, b, relationship = compare(a, b)) => {
  const [lowerA, upperA] = a;
  const [lowerB, upperB] = b;

  switch(relationship) {
    case 'no-overlap': return null;
    case 'partly-contained-lower': return [lowerB, upperA];
    case 'contained': return [lowerA, upperA];
    case 'partly-contained-upper': return [lowerA, upperB];
    case 'contains': return [lowerB, upperB];
  }
}

const union: BinaryRangeOperator<Range | null> = (a, b, relationship = compare(a, b)) => {
  const [lowerA, upperA] = a;
  const [lowerB, upperB] = b;

  switch(relationship) {
    case 'no-overlap': return null;
    case 'partly-contained-lower': return [lowerA, upperB];
    case 'contained': return [lowerB, upperB];
    case 'partly-contained-upper': return [lowerB, upperA];
    case 'contains': return [lowerA, upperA];
  }
}

const except: BinaryRangeOperator<Range[] | null> = (a, b, relationship = compare(a, b)) => {
  const [lowerA, upperA] = a;
  const [lowerB, upperB] = b;

  switch(relationship) {
    case 'no-overlap': return [b];
    case 'partly-contained-lower': return [[lowerA, lowerB - 1]];
    case 'contained': return null;
    case 'partly-contained-upper': return [[upperB + 1, upperA]];
    case 'contains': return [[lowerA, lowerB - 1], [upperB + 1, upperB]];
  }
}

type Overlaps = {
  a: Range[] | null;
  b: Range[] | null;
  both: Range | null;
}
const getOverlaps: BinaryRangeOperator<Overlaps> = (a, b) => {
  return {
    a: except(a, b),
    b: except(b, a),
    both: intersect(a, b),
  }
}

const doTransformsOverlap = (a: Transform, b: Transform): boolean => {
  return compare(a.destinationRange, b.sourceRange) !== 'no-overlap';
}

const injectAtIndex = <T>(toInject: T[], sourceArray: T[], index: number) => {
  return [
    ...sourceArray.slice(0, index),
    ...toInject,
    ...sourceArray.slice(index  + 1),
  ]
}

// run a set of ranges through another
// seed is always one range, but as [a]
// "filter" a set of input ranges through another, expanding each if 
const breakUpTransformRanges = (input: Transform[], filterTransforms: Transform[]): Transform[] => {
  for (let i = 0; i < input.length; i++) {
    for (let j = 0; j < filterTransforms.length; j++ ) {
      const a = input[i];
      const b = filterTransforms[j];

      if (doTransformsOverlap(a, b)) {
        return breakUpTransformRanges(
          ,
          filterTransforms
        )
      }
    }
  }
    const a of input) {
    for (const b of filterTransforms) {
      if (doTransformsOverlap(a, b)) {
        // splice a to include all of input before and after the overlap, and then spread the overlap in the place of a

        return breakUpTransformRanges([
          ...a.splice()
          ...breakUpTransformRanges(),
          ...,
          
        ]);
      }
    }
  }
}

const collapseTransforms = (transformMaps: Transform[][]): Transform[] => {
  return transformMaps.reduce<Transform[]>((collapsedTransform, transformMap) => {
    // compare each range in `collapsedTransform` compare to each in `transform`,
    // combining overlapping transforms by breaking up their ranges into separate
    // transforms which apply one transform, the other, or both
    return breakUpTransformRanges(collapsedTransform, transformMap);

    // TODO: what about transforms that have no overlap? i.e. new ranges in B
    collapsedTransform.flatMap(a => {
      // here, this should be a reduce
      // run the whole of [a] through a reduce so that it can "expand" in response to each newly transform range
      // or make it recursive?
      // start w/both of these sorted
      return breakUpTransformRanges(a, transformMap)

      return transformMap.reduce((expandedTransforms, b) => {
        if (doTransformsOverlap(a, b)) {
          const {
            a: applyA,
            b: applyB,
            both: applyBoth
          } = getOverlaps(a.destinationRange, b.sourceRange);

          const createTransform = (sourceRange: Range, shift: number): Transform => ({
            sourceRange,
            destinationRange: [sourceRange[0] + shift, sourceRange[1] + shift],
            shift,
          })

          const splitTransforms: Transform[] = [
            ...applyA.map(range => createTransform(range, a.shift)),
            ...applyB.map(range => createTransform(range, b.shift)),
            createTransform(applyBoth, a.shift + b.shift),
          ].filter(Boolean);

          return splitTransforms;
        } else {
          return a;
        }
      }, [a])
    })
  }, []);
}

const parseAlmanacSource = (source: string): Almanac => {
  const {
    groups: { seeds, ...rawMaps }
  } = source.match(matchAlmanac);

  const maps = Object
    .values(rawMaps)
    .map(parseMapSource);

  const seedFilter = collapseTransforms(maps);

  return {
    seeds: seeds.trim().split(/\s+/).map(seed => parseInt(seed)),
    transforms: maps,
  }
}

export const solvePartTwo = () => {
  const almanacSource = input;

  const almanac = parseAlmanacSource(almanacSource);

  let seedPairs = [];
  for (let i = 0; i < almanac.seeds.length; i += 2) {
    seedPairs.push([almanac.seeds[i], almanac.seeds[i + 1]]);
  }

  let locations = [];
  for (const [seedStart, rangeLength] of seedPairs) {
    for (let seed = seedStart; seed < seedStart + rangeLength; seed++) {
      locations.push(filterSeed(seed, almanac.transforms));
    }
  }

  return locations.reduce(minimize);
}
