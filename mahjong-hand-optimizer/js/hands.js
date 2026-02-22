/**
 * Hand template system for American Mahjong.
 *
 * A hand template defines a winning hand pattern using:
 *   - Groups: each with a tile count and specification
 *   - Suit slots (A, B, C): same letter = same suit
 *   - Value expressions: fixed numbers, or N, N+1, N+2, etc.
 *   - Constraints: concealed, jokers allowed, point value
 *
 * Templates are expanded into all concrete hand variants by iterating
 * over valid suit assignments and N values.
 *
 * Template format:
 * {
 *   id: string,
 *   category: string,
 *   number: number,
 *   description: string,
 *   groups: [
 *     { count: number, type: "suit"|"wind"|"dragon"|"flower"|"joker",
 *       suit: "A"|"B"|"C", value: number|"N"|"N+1"|...,
 *       wind: "E"|"W"|"N"|"S",
 *       dragon: "red"|"green"|"soap"|"matching",
 *       matchSuit: "A"|"B"|"C" }
 *   ],
 *   suitMapping: { A: "any", B: "different", C: "remaining" },
 *   nMin: number, nMax: number,
 *   concealed: boolean,
 *   jokersAllowed: boolean,
 *   value: number
 * }
 */

import { SUITS, SUIT_DRAGON, tile } from './tiles.js';

/**
 * Expand a hand template into all concrete hand variants.
 * Each variant is a specific set of tile IDs.
 */
export function expandTemplate(template) {
  const variants = [];

  // Find all unique suit slots
  const suitSlots = new Set();
  for (const g of template.groups) {
    if (g.type === 'suit' && g.suit) suitSlots.add(g.suit);
    if (g.type === 'dragon' && g.dragon === 'matching' && g.matchSuit) {
      suitSlots.add(g.matchSuit);
    }
  }
  const slots = [...suitSlots].sort();

  // Generate all valid suit assignments
  const suitAssignments = generateSuitAssignments(slots, template.suitMapping || {});

  // Generate all valid N values
  const hasN = template.groups.some(
    g => typeof g.value === 'string' && g.value.includes('N')
  );
  const nMin = template.nMin ?? 1;
  const nMax = template.nMax ?? 9;
  const nValues = hasN ? range(nMin, nMax) : [0];

  // Expand each combination
  for (const suits of suitAssignments) {
    for (const n of nValues) {
      const concrete = resolveHand(template, suits, n);
      if (concrete) variants.push(concrete);
    }
  }

  return variants;
}

function generateSuitAssignments(slots, mapping) {
  if (slots.length === 0) return [{}];

  const results = [];

  function recurse(idx, assigned) {
    if (idx === slots.length) {
      results.push({ ...assigned });
      return;
    }

    const slot = slots[idx];
    const constraint = mapping[slot] || 'any';

    for (const suit of SUITS) {
      let valid = true;

      if (constraint === 'different') {
        // Must differ from all previously assigned
        for (const s of Object.values(assigned)) {
          if (s === suit) { valid = false; break; }
        }
      } else if (constraint === 'remaining') {
        // Must be the suit not yet used (requires exactly 2 already assigned)
        const used = new Set(Object.values(assigned));
        valid = !used.has(suit) && used.size === 2;
      } else if (constraint.startsWith('same_as_')) {
        const ref = constraint.slice(8); // e.g., "same_as_A" -> "A"
        valid = suit === assigned[ref];
      }

      if (valid) {
        assigned[slot] = suit;
        recurse(idx + 1, assigned);
        delete assigned[slot];
      }
    }
  }

  recurse(0, {});
  return results;
}

function resolveHand(template, suitAssignment, n) {
  const groups = [];
  const allTiles = [];

  for (const g of template.groups) {
    const resolved = resolveGroup(g, suitAssignment, n);
    if (!resolved) return null;

    groups.push({ tileId: resolved.tileId, count: g.count });
    for (let i = 0; i < g.count; i++) {
      allTiles.push(resolved.tileId);
    }
  }

  return {
    tiles: allTiles,
    groups,
    jokersAllowed: template.jokersAllowed !== false,
    concealed: template.concealed || false,
    value: template.value || 25,
    templateId: template.id,
    category: template.category,
    handNumber: template.number,
    description: template.description,
  };
}

function resolveGroup(group, suits, n) {
  switch (group.type) {
    case 'suit': {
      const suit = suits[group.suit];
      if (!suit) return null;
      const value = resolveValue(group.value, n);
      if (value < 1 || value > 9) return null;
      return { tileId: tile('suit', suit, value) };
    }
    case 'wind':
      return { tileId: tile('wind', group.wind) };
    case 'dragon': {
      if (group.dragon === 'matching') {
        const suit = suits[group.matchSuit];
        if (!suit) return null;
        return { tileId: tile('dragon', SUIT_DRAGON[suit]) };
      }
      return { tileId: tile('dragon', group.dragon) };
    }
    case 'flower':
      return { tileId: tile('flower') };
    case 'joker':
      return { tileId: tile('joker') };
    default:
      return null;
  }
}

function resolveValue(expr, n) {
  if (typeof expr === 'number') return expr;
  if (expr === 'N') return n;
  const match = expr.match(/^N([+-])(\d+)$/);
  if (match) {
    const k = parseInt(match[2]);
    return match[1] === '+' ? n + k : n - k;
  }
  return parseInt(expr) || 0;
}

function range(min, max) {
  const arr = [];
  for (let i = min; i <= max; i++) arr.push(i);
  return arr;
}

/**
 * Total tiles in a hand template.
 */
export function handSize(template) {
  return template.groups.reduce((sum, g) => sum + g.count, 0);
}

/**
 * Validate a hand template. Returns array of error strings (empty = valid).
 */
export function validateTemplate(template) {
  const errors = [];
  const size = handSize(template);
  if (size !== 14) errors.push(`Hand must total 14 tiles, got ${size}`);
  if (!template.id) errors.push('Missing hand ID');
  if (!template.category) errors.push('Missing category');
  if (!template.groups || template.groups.length === 0) {
    errors.push('Hand must have at least one group');
  }
  for (const g of (template.groups || [])) {
    if (!g.count || g.count < 1 || g.count > 8) {
      errors.push(`Invalid group count: ${g.count}`);
    }
    if (!g.type) errors.push('Group missing type');
  }
  return errors;
}
