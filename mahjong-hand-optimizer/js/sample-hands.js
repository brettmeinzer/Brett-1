/**
 * Sample hand templates for demonstration and testing.
 *
 * These are EXAMPLE patterns inspired by typical NMJL card categories.
 * They are NOT from any specific year's official card. Users should enter
 * their own card data from the NMJL card they purchased.
 *
 * Each hand totals exactly 14 tiles.
 */

export const SAMPLE_HANDS = [
  // --- Consecutive Run ---
  // Four consecutive kongs in one suit + trailing pair
  {
    id: 'sample-cr-1',
    category: 'Consecutive Run',
    number: 1,
    description: 'NNNN (N+1)(N+1)(N+1)(N+1) (N+2)(N+2)(N+2)(N+2) (N+3)(N+3)  [one suit]',
    groups: [
      { count: 4, type: 'suit', suit: 'A', value: 'N' },
      { count: 4, type: 'suit', suit: 'A', value: 'N+1' },
      { count: 4, type: 'suit', suit: 'A', value: 'N+2' },
      { count: 2, type: 'suit', suit: 'A', value: 'N+3' },
    ],
    nMin: 1,
    nMax: 6,
    concealed: false,
    jokersAllowed: true,
    value: 25,
  },

  // Three consecutive pungs across different suits + pair + pair
  {
    id: 'sample-cr-2',
    category: 'Consecutive Run',
    number: 2,
    description: 'NNN (N+1)(N+1)(N+1) (N+2)(N+2)(N+2) NN DD  [one suit + matching dragon]',
    groups: [
      { count: 3, type: 'suit', suit: 'A', value: 'N' },
      { count: 3, type: 'suit', suit: 'A', value: 'N+1' },
      { count: 3, type: 'suit', suit: 'A', value: 'N+2' },
      { count: 2, type: 'suit', suit: 'A', value: 'N+3' },
      { count: 3, type: 'dragon', dragon: 'matching', matchSuit: 'A' },
    ],
    nMin: 1,
    nMax: 6,
    concealed: false,
    jokersAllowed: true,
    value: 25,
  },

  // --- Like Numbers ---
  // Same number kongs in all three suits + dragon pair
  {
    id: 'sample-aln-1',
    category: 'Like Numbers',
    number: 1,
    description: 'NNNN NNNN NNNN DD  [three suits, same number + dragon pair]',
    groups: [
      { count: 4, type: 'suit', suit: 'A', value: 'N' },
      { count: 4, type: 'suit', suit: 'B', value: 'N' },
      { count: 4, type: 'suit', suit: 'C', value: 'N' },
      { count: 2, type: 'dragon', dragon: 'red' },
    ],
    suitMapping: { A: 'any', B: 'different', C: 'remaining' },
    nMin: 1,
    nMax: 9,
    concealed: false,
    jokersAllowed: true,
    value: 30,
  },

  // --- 2468 (Even Numbers) ---
  // Even kongs in one suit + even pair
  {
    id: 'sample-even-1',
    category: '2468',
    number: 1,
    description: '2222 4444 6666 88  [one suit]',
    groups: [
      { count: 4, type: 'suit', suit: 'A', value: 2 },
      { count: 4, type: 'suit', suit: 'A', value: 4 },
      { count: 4, type: 'suit', suit: 'A', value: 6 },
      { count: 2, type: 'suit', suit: 'A', value: 8 },
    ],
    concealed: false,
    jokersAllowed: true,
    value: 25,
  },

  // Even pungs across three suits
  {
    id: 'sample-even-2',
    category: '2468',
    number: 2,
    description: '22 444 666 8888  [one suit]',
    groups: [
      { count: 2, type: 'suit', suit: 'A', value: 2 },
      { count: 3, type: 'suit', suit: 'A', value: 4 },
      { count: 3, type: 'suit', suit: 'A', value: 6 },
      { count: 4, type: 'suit', suit: 'A', value: 8 },
      { count: 2, type: 'dragon', dragon: 'matching', matchSuit: 'A' },
    ],
    concealed: false,
    jokersAllowed: true,
    value: 25,
  },

  // --- 13579 (Odd Numbers) ---
  {
    id: 'sample-odd-1',
    category: '13579',
    number: 1,
    description: '111 333 5555 7 9  [one suit, concealed]',
    groups: [
      { count: 3, type: 'suit', suit: 'A', value: 1 },
      { count: 3, type: 'suit', suit: 'A', value: 3 },
      { count: 4, type: 'suit', suit: 'A', value: 5 },
      { count: 2, type: 'suit', suit: 'A', value: 7 },
      { count: 2, type: 'suit', suit: 'A', value: 9 },
    ],
    concealed: true,
    jokersAllowed: true,
    value: 30,
  },

  // --- Winds & Dragons ---
  // All four wind kongs + south pair
  {
    id: 'sample-wd-1',
    category: 'Winds & Dragons',
    number: 1,
    description: 'EEEE WWWW NNNN SS  [all winds]',
    groups: [
      { count: 4, type: 'wind', wind: 'E' },
      { count: 4, type: 'wind', wind: 'W' },
      { count: 4, type: 'wind', wind: 'N' },
      { count: 2, type: 'wind', wind: 'S' },
    ],
    concealed: false,
    jokersAllowed: true,
    value: 25,
  },

  // Flowers + winds + dragons
  {
    id: 'sample-wd-2',
    category: 'Winds & Dragons',
    number: 2,
    description: 'FF NNNN SSSS DDDD  [flowers + N/S winds + any dragon]',
    groups: [
      { count: 2, type: 'flower' },
      { count: 4, type: 'wind', wind: 'N' },
      { count: 4, type: 'wind', wind: 'S' },
      { count: 4, type: 'dragon', dragon: 'green' },
    ],
    concealed: false,
    jokersAllowed: true,
    value: 25,
  },

  // --- 369 ---
  {
    id: 'sample-369-1',
    category: '369',
    number: 1,
    description: '333 6666 9999 DD  [one suit + matching dragon]',
    groups: [
      { count: 3, type: 'suit', suit: 'A', value: 3 },
      { count: 4, type: 'suit', suit: 'A', value: 6 },
      { count: 4, type: 'suit', suit: 'A', value: 9 },
      { count: 3, type: 'dragon', dragon: 'matching', matchSuit: 'A' },
    ],
    concealed: false,
    jokersAllowed: true,
    value: 25,
  },

  // --- Singles & Pairs (no jokers) ---
  {
    id: 'sample-sp-1',
    category: 'Singles & Pairs',
    number: 1,
    description: '11 33 55 77 99 DD FF  [odds + matching dragon + flowers, one suit]',
    groups: [
      { count: 2, type: 'suit', suit: 'A', value: 1 },
      { count: 2, type: 'suit', suit: 'A', value: 3 },
      { count: 2, type: 'suit', suit: 'A', value: 5 },
      { count: 2, type: 'suit', suit: 'A', value: 7 },
      { count: 2, type: 'suit', suit: 'A', value: 9 },
      { count: 2, type: 'dragon', dragon: 'matching', matchSuit: 'A' },
      { count: 2, type: 'flower' },
    ],
    concealed: true,
    jokersAllowed: false,
    value: 50,
  },
];
