import { solvePartOne as oneOne, solvePartTwo as oneTwo } from './day1/solution';
import { solvePartOne as twoOne, solvePartTwo as twoTwo } from './day2/solution';
import { solvePartOne as threeOne, solvePartTwo as threeTwo } from './day3/solution';
import { solvePartOne as fourOne, solvePartTwo as fourTwo } from './day4/solution';
import {
	solvePartOne as fiveOne,
	solvePartTwo as fiveTwo,
} from './day5/solution';

const solutions = [
	// oneOne,
	// oneTwo,
	// twoOne,
	// twoTwo,
	// threeOne,
	// threeTwo,
	// fourOne,
	// fourTwo,
	// fiveOne,
	fiveTwo,
];

solutions.forEach((solve, index) => {
	console.log(`Day ${Math.ceil((index + 1) / 2)} part ${index % 2 + 1}:`.padEnd(13, ' '), solve());
});
