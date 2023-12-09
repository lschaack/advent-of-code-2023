import { add } from '../common';
import input from './input';

const example = `1abc2
pqr3stu8vwx
a1b2c3d4e5f
treb7uchet`;

const getValueFromLinePart1 = (line: string) => {
  const digits = [...line.match(/\d/g)];
  const firstDigit = digits[0];
  const lastDigit = digits[digits.length - 1];

  return Number(`${firstDigit}${lastDigit}`);
}

const matchToDigit = {
	zero: '0',
	one: '1',
	two: '2',
	three: '3',
	four: '4',
	five: '5',
	six: '6',
	seven: '7',
	eight: '8',
	nine: '9',
};

// Convert written digits like 'one' to digits like '1', leaving in string form
// so they can be treated as individual digits of a whole number
const getDigitFromMatch = (match: string) => {
	return /\d/.test(match)
		? match
		: matchToDigit[match as keyof typeof matchToDigit];
}

const getValueFromLinePart2 = (line: string) => {
	const matches = [...line.match(/(\d|zero|one|two|three|four|five|six|seven|eight|nine)/g)];
	const firstDigit = getDigitFromMatch(matches[0]);
	const lastDigit = getDigitFromMatch(matches[matches.length - 1]);

	return Number(`${firstDigit}${lastDigit}`);
}

const getCalibrationValue = (lines: string, getValueFromLine: (line: string) => number) => {
  return lines
    .split('\n')
    .map(getValueFromLine)
    .reduce(add);
}

export const solvePartOne = () => getCalibrationValue(input, getValueFromLinePart1);
export const solvePartTwo = () => getCalibrationValue(input, getValueFromLinePart2);
