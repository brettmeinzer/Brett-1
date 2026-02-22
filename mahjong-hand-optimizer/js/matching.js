/**
 * Matching engine for American Mahjong.
 *
 * Scores a player's current tiles against all possible concrete hand variants
 * and returns ranked results showing the best hands to pursue.
 *
 * Scoring accounts for:
 *   - Exact tile matches
 *   - Joker substitution (only in groups of 3+, when allowed)
 *   - Tiles still needed to complete the hand
 */

/**
 * Score a player's tiles against a single concrete hand variant.
 */
export function scoreHand(playerTiles, concreteHand) {
  // Frequency map of player tiles
  const available = {};
  for (const t of playerTiles) {
    available[t] = (available[t] || 0) + 1;
  }

  // Track jokers separately
  let jokersLeft = available['joker'] || 0;

  const groupResults = [];
  let totalMatched = 0;
  let jokersUsed = 0;
  const tilesNeeded = [];
  const tilesMatched = [];

  for (const group of concreteHand.groups) {
    const { tileId, count } = group;
    let matched = 0;
    let remaining = count;

    if (tileId === 'joker') {
      // Group requires actual jokers
      const use = Math.min(jokersLeft, remaining);
      jokersLeft -= use;
      matched += use;
      remaining -= use;
      for (let i = 0; i < use; i++) tilesMatched.push('joker');
    } else {
      // Use matching tiles first
      const have = available[tileId] || 0;
      const use = Math.min(have, remaining);
      available[tileId] = (available[tileId] || 0) - use;
      matched += use;
      remaining -= use;
      for (let i = 0; i < use; i++) tilesMatched.push(tileId);

      // Use jokers for the rest (only in groups of 3+ and when allowed)
      if (remaining > 0 && count >= 3 && concreteHand.jokersAllowed) {
        const jokerUse = Math.min(jokersLeft, remaining);
        jokersLeft -= jokerUse;
        jokersUsed += jokerUse;
        matched += jokerUse;
        remaining -= jokerUse;
        for (let i = 0; i < jokerUse; i++) tilesMatched.push('joker');
      }
    }

    totalMatched += matched;
    for (let i = 0; i < remaining; i++) tilesNeeded.push(tileId);
    groupResults.push({ tileId, count, matched, needed: remaining });
  }

  const totalTiles = concreteHand.tiles.length;

  return {
    hand: concreteHand,
    score: totalTiles > 0 ? totalMatched / totalTiles : 0,
    matched: totalMatched,
    total: totalTiles,
    needed: tilesNeeded.length,
    tilesNeeded,
    tilesMatched,
    jokersUsed,
    groupResults,
  };
}

/**
 * Rank all concrete hands against a player's tiles.
 *
 * Options:
 *   topN: number of results to return (default 10)
 *   bestPerTemplate: keep only the best variant per template (default true)
 */
export function rankHands(playerTiles, allConcreteHands, options = {}) {
  const { topN = 10, bestPerTemplate = true } = options;

  let results = allConcreteHands.map(hand => scoreHand(playerTiles, hand));

  if (bestPerTemplate) {
    const best = new Map();
    for (const r of results) {
      const key = r.hand.templateId;
      const existing = best.get(key);
      if (!existing || r.score > existing.score ||
          (r.score === existing.score && r.jokersUsed < existing.jokersUsed)) {
        best.set(key, r);
      }
    }
    results = [...best.values()];
  }

  // Sort: highest score first, then fewer tiles needed, then higher hand value
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.needed !== b.needed) return a.needed - b.needed;
    return (b.hand.value || 0) - (a.hand.value || 0);
  });

  return results.slice(0, topN);
}
