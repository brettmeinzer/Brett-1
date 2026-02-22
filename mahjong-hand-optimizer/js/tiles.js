/**
 * American Mahjong tile model
 *
 * 152 tiles total:
 *   108 suited (3 suits x 9 values x 4 each)
 *   16 winds (4 types x 4 each)
 *   12 dragons (3 types x 4 each)
 *   8 flowers
 *   8 jokers
 */

export const SUITS = ['crack', 'bam', 'dot'];
export const SUIT_DISPLAY = { crack: 'Crak', bam: 'Bam', dot: 'Dot' };
export const SUIT_SHORT = { crack: 'C', bam: 'B', dot: 'D' };
export const SUIT_COLORS = { crack: '#d32f2f', bam: '#2e7d32', dot: '#1565c0' };

export const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const WINDS = ['E', 'W', 'N', 'S'];
export const WIND_NAMES = { E: 'East', W: 'West', N: 'North', S: 'South' };

export const DRAGONS = ['red', 'green', 'soap'];
export const DRAGON_DISPLAY = { red: 'Red', green: 'Green', soap: 'Soap' };
export const DRAGON_SHORT = { red: 'R', green: 'G', soap: '0' };

// Traditional suit-dragon correspondence
export const SUIT_DRAGON = { crack: 'red', bam: 'green', dot: 'soap' };
export const DRAGON_SUIT = { red: 'crack', green: 'bam', soap: 'dot' };

/**
 * Create a tile identifier string.
 * Format: "crack-1", "bam-9", "wind-E", "dragon-red", "flower", "joker"
 */
export function tile(type, ...args) {
  switch (type) {
    case 'suit': return `${args[0]}-${args[1]}`;
    case 'wind': return `wind-${args[0]}`;
    case 'dragon': return `dragon-${args[0]}`;
    case 'flower': return 'flower';
    case 'joker': return 'joker';
    default: return type; // pass through if already a tile ID
  }
}

/**
 * Parse a tile ID into its components.
 */
export function parseTile(id) {
  if (id === 'flower') return { type: 'flower' };
  if (id === 'joker') return { type: 'joker' };
  if (id.startsWith('wind-')) return { type: 'wind', wind: id.slice(5) };
  if (id.startsWith('dragon-')) return { type: 'dragon', dragon: id.slice(7) };
  const dash = id.indexOf('-');
  return { type: 'suit', suit: id.slice(0, dash), value: parseInt(id.slice(dash + 1)) };
}

/**
 * Short display label for tile buttons.
 */
export function tileLabel(id) {
  const t = parseTile(id);
  switch (t.type) {
    case 'suit': return `${t.value}${SUIT_SHORT[t.suit]}`;
    case 'wind': return t.wind;
    case 'dragon': return DRAGON_SHORT[t.dragon];
    case 'flower': return 'F';
    case 'joker': return 'J';
  }
}

/**
 * Full display name for a tile.
 */
export function tileName(id) {
  const t = parseTile(id);
  switch (t.type) {
    case 'suit': return `${t.value} ${SUIT_DISPLAY[t.suit]}`;
    case 'wind': return WIND_NAMES[t.wind];
    case 'dragon': return DRAGON_DISPLAY[t.dragon];
    case 'flower': return 'Flower';
    case 'joker': return 'Joker';
  }
}

/**
 * CSS color for a tile.
 */
export function tileColor(id) {
  const t = parseTile(id);
  switch (t.type) {
    case 'suit': return SUIT_COLORS[t.suit];
    case 'wind': return '#555';
    case 'dragon':
      return t.dragon === 'red' ? '#d32f2f' :
             t.dragon === 'green' ? '#2e7d32' : '#757575';
    case 'flower': return '#7b1fa2';
    case 'joker': return '#e65100';
  }
}

/**
 * All unique tile IDs (36 types: 27 suited + 4 winds + 3 dragons + flower + joker).
 */
export function allTileIds() {
  const ids = [];
  for (const suit of SUITS) {
    for (const v of VALUES) {
      ids.push(`${suit}-${v}`);
    }
  }
  for (const w of WINDS) ids.push(`wind-${w}`);
  for (const d of DRAGONS) ids.push(`dragon-${d}`);
  ids.push('flower', 'joker');
  return ids;
}

/**
 * Maximum copies of a specific tile in the full 152-tile set.
 */
export function maxCount(id) {
  const t = parseTile(id);
  if (t.type === 'flower') return 8;
  if (t.type === 'joker') return 8;
  return 4;
}
