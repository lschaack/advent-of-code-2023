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

type Range = {
  sourceStart: number;
  destinationStart: number;
  rangeLength: number;
}

type Almanac = {
  seeds: number[];
  maps: Record<MapType, Array<Range>>;
};

// thank you multi-cursor editing
const matchAlmanac = /^seeds:(?<seeds>[\d\s]+)seed-to-soil map:(?<seedToSoil>[\d\s]+)soil-to-fertilizer map:(?<soilToFertilizer>[\d\s]+)fertilizer-to-water map:(?<fertilizerToWater>[\d\s]+)water-to-light map:(?<waterToLight>[\d\s]+)light-to-temperature map:(?<lightToTemperature>[\d\s]+)temperature-to-humidity map:(?<temperatureToHumidity>[\d\s]+)humidity-to-location map:(?<humidityToLocation>[\d\s]+)$/;

const parseRangeSource = (source: string): Range => {
  const [sourceStart, destinationStart, rangeLength] = source
    .split(' ')
    .map(rangeVal => parseInt(rangeVal));

  // TODO: should probably convert start + range into actual bounds
  return {
    sourceStart,
    destinationStart,
    rangeLength,
  };
}

const parseMapSource = (source: string): Array<Range> => {
  return source
    .trim()
    .split(/\n+/)
    .map(parseRangeSource);
}

const parseAlmanacSource = (source: string): Almanac => {
  const {
    groups: { seeds, ...maps }
  } = source.match(matchAlmanac);

  return {
    seeds: seeds.trim().split(/\s+/).map(seed => parseInt(seed)),
    maps: Object.fromEntries(
      Object
        .entries(maps)
        // For each map type (seedToSoil, soilToFertilizer, etc.)...
        .map(([mapName, rangesSource]) => {
          // ...get every range within that map type...
          return [mapName, parseMapSource(rangesSource)]
        })
    ) as Record<MapType, Array<Range>>, // Object.fromEntries always has key type `string`
  }
}

export const solvePartOne = () => {
  const almanacSource = example;

  const almanac = parseAlmanacSource(almanacSource);

  return JSON.stringify(almanac, null, 2);
};
