import { add } from '../common';
import input from './input';

type Card = {
  id: string,
  winningNumbers: Set<number>,
  myNumbers: Set<number>,
}

type CardMap = Record<string, Card>;
type CardCopies = Record<string, number>;

const example = `Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11`;

const matchCard = /Card\s+(?<id>\d+):(?<winningNumbers>[\d ]+)\|(?<myNumbers>[\d ]+)/;

const parseSpaceSeparatedList = (list: string): Set<number> => {
  return new Set(
    list
      .trim()
      .split(/\s+/)
      .map(n => parseInt(n))
  );
}

const parseCard = (card: string): Card => {
  const { id, winningNumbers, myNumbers } = card.match(matchCard)!.groups!;

  return {
    id,
    winningNumbers: parseSpaceSeparatedList(winningNumbers),
    myNumbers: parseSpaceSeparatedList(myNumbers),
  }
}

const getMatches = (card: Card): number => {
  return [...card.winningNumbers]
    .map(winningNumber => Number(card.myNumbers.has(winningNumber)))
    .reduce(add);
}

const getPoints = (nMatches: number): number => {
  return nMatches === 0
    ? 0
    : Math.pow(2, nMatches - 1);
}

export const solvePartOne = () => {
  const scratchcards = input;

  return scratchcards
    .split('\n')
    .map(parseCard)
    .map(getMatches)
    .map(getPoints)
    .reduce(add);
}

const addCopies = (to: CardCopies, from: CardCopies) => {
  return Object.keys(from).reduce((sums, cardId) => {
    sums[cardId] = (from[cardId] ?? 0) + (to[cardId] ?? 0);

    return sums;
  }, to);
}

// IIFE to track memoized state in closure
const getCopies = (() => {
  const idToCopies: Record<string, CardCopies> = {};

  return (card: Card, cards: CardMap): CardCopies => {
    // track the original card as one copy
    let copies = { [card.id]: 1 };

    const matches = getMatches(card);

    // doesn't handle cards past last id, but the description says this won't happen
    // weird loop construction (= 1; <=) b/c copies start from the next card
    for (let i = 1; i <= matches; i++) {
      const nextId = (Number(card.id) + i).toString();

      // cache value if it doesn't exist, then always return from cache
      // base case is implicit - 0 matches, which returns one copy of current card
      if (!idToCopies[nextId]) idToCopies[nextId] = getCopies(cards[nextId], cards);

      copies = addCopies(copies, idToCopies[nextId]);
    }

    return copies;
  }
})();

const getAllCopies = (cards: CardMap) => {
  return Object
    .values(cards)
    .reduce<CardCopies>((copies, card) => {
      return addCopies(copies, getCopies(card, cards));
    }, {});
};

export const solvePartTwo = () => {
  // memoize by creating a mapping of card number to number of copies of each card number
  // ^ could even memoize entire subsections of the resulting tree?
  const scratchcards = input;

  const cardMap = scratchcards
    .split('\n')
    .reduce<CardMap>((cardMap, cardString) => {
      const card = parseCard(cardString);

      cardMap[card.id] = card;

      return cardMap;
    }, {});

  return Object
    .values(getAllCopies(cardMap))
    .reduce(add);
}
