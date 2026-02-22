/**
 * Card storage using localStorage.
 * Persists user-defined hand templates so they only need to enter
 * their NMJL card data once per year.
 */

const STORAGE_KEY = 'mahj-optimizer-card';

/**
 * Load all saved hand templates.
 */
export function loadCard() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Save all hand templates.
 */
export function saveCard(templates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

/**
 * Add a hand template (appends to existing list).
 */
export function addHand(template) {
  const card = loadCard();
  card.push(template);
  saveCard(card);
  return card;
}

/**
 * Remove a hand template by ID.
 */
export function removeHand(id) {
  const card = loadCard().filter(h => h.id !== id);
  saveCard(card);
  return card;
}

/**
 * Clear all saved card data.
 */
export function clearCard() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Export card data as JSON string (for sharing/backup).
 */
export function exportCard() {
  return JSON.stringify(loadCard(), null, 2);
}

/**
 * Import card data from JSON string.
 * Replaces existing card data.
 */
export function importCard(json) {
  const templates = JSON.parse(json);
  if (!Array.isArray(templates)) throw new Error('Invalid card data: expected array');
  saveCard(templates);
  return templates;
}
