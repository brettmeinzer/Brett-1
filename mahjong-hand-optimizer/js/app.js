/**
 * Main application controller for Mahj Optimizer.
 * Wires up the tile picker, matching engine, results display,
 * card management, and tab navigation.
 */

import { tileLabel, tileName, tileColor, parseTile, maxCount, allTileIds,
         SUITS, SUIT_SHORT, SUIT_DISPLAY } from './tiles.js';
import { expandTemplate, validateTemplate, handSize } from './hands.js';
import { scoreHand, rankHands } from './matching.js';
import { SAMPLE_HANDS } from './sample-hands.js';
import { loadCard, saveCard, addHand, removeHand, clearCard,
         exportCard, importCard } from './card-store.js';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const state = {
  playerTiles: [],          // array of tile IDs in player's hand
  concreteHands: [],        // all expanded concrete hand variants
  cardTemplates: [],        // hand templates loaded from storage
};

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initTilePicker();
  initHandDisplay();
  initCardTab();
  loadCardData();
  updateAll();
});

// ---------------------------------------------------------------------------
// Tab Navigation
// ---------------------------------------------------------------------------
function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    });
  });
}

// ---------------------------------------------------------------------------
// Tile Picker
// ---------------------------------------------------------------------------
function initTilePicker() {
  document.querySelectorAll('.tile-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tileId = btn.dataset.tile;
      addTile(tileId);
    });
  });
}

function addTile(tileId) {
  if (state.playerTiles.length >= 14) return;

  // Check max count
  const current = state.playerTiles.filter(t => t === tileId).length;
  if (current >= maxCount(tileId)) return;

  state.playerTiles.push(tileId);
  updateAll();
}

function removeTile(index) {
  state.playerTiles.splice(index, 1);
  updateAll();
}

function clearHand() {
  state.playerTiles = [];
  updateAll();
}

// ---------------------------------------------------------------------------
// Hand Display
// ---------------------------------------------------------------------------
function initHandDisplay() {
  document.getElementById('clear-hand').addEventListener('click', clearHand);
}

function renderHand() {
  const container = document.getElementById('player-hand');
  const count = document.getElementById('hand-count');
  count.textContent = state.playerTiles.length;

  container.innerHTML = '';

  if (state.playerTiles.length === 0) {
    return;
  }

  state.playerTiles.forEach((tileId, idx) => {
    const el = document.createElement('button');
    el.className = `hand-tile ${tileClass(tileId)}`;
    el.textContent = tileLabel(tileId);
    el.title = `${tileName(tileId)} (tap to remove)`;
    el.addEventListener('click', () => removeTile(idx));
    container.appendChild(el);
  });
}

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------
function renderResults() {
  const container = document.getElementById('results-list');

  if (state.playerTiles.length === 0 || state.concreteHands.length === 0) {
    const msg = state.concreteHands.length === 0
      ? 'No card hands loaded. Go to the Card tab and load sample hands or add your own.'
      : 'Tap tiles below to add them to your hand. Matching hands will appear here.';
    container.innerHTML = `<p class="results-placeholder">${msg}</p>`;
    return;
  }

  const ranked = rankHands(state.playerTiles, state.concreteHands, { topN: 10 });

  if (ranked.length === 0) {
    container.innerHTML = '<p class="results-placeholder">No matching hands found.</p>';
    return;
  }

  container.innerHTML = '';

  ranked.forEach((result, i) => {
    const pct = Math.round(result.score * 100);
    const card = document.createElement('div');
    card.className = `result-card${i === 0 ? ' top-match' : ''}`;

    // Build tiles-needed display
    const neededCounts = {};
    for (const t of result.tilesNeeded) {
      neededCounts[t] = (neededCounts[t] || 0) + 1;
    }

    // Build matched tiles display (de-duplicated with counts)
    const matchedCounts = {};
    for (const t of result.tilesMatched) {
      matchedCounts[t] = (matchedCounts[t] || 0) + 1;
    }

    let matchedHtml = Object.entries(matchedCounts)
      .map(([t, c]) => `<span class="result-tile">${tileLabel(t)}${c > 1 ? ' x' + c : ''}</span>`)
      .join('');

    let neededHtml = Object.entries(neededCounts)
      .map(([t, c]) => `<span class="result-tile needed">${tileLabel(t)}${c > 1 ? ' x' + c : ''}</span>`)
      .join('');

    const meta = [];
    meta.push(`${result.hand.value || 25} pts`);
    if (result.hand.concealed) meta.push('<span class="concealed">Concealed</span>');
    if (result.jokersUsed > 0) meta.push(`${result.jokersUsed} joker${result.jokersUsed > 1 ? 's' : ''} used`);
    if (!result.hand.jokersAllowed) meta.push('No jokers');

    card.innerHTML = `
      <div class="result-header">
        <span class="result-category">${result.hand.category} #${result.hand.handNumber}</span>
        <span class="result-score">${pct}%</span>
      </div>
      <div class="result-description">${result.hand.description}</div>
      <div class="result-bar"><div class="result-bar-fill" style="width:${pct}%"></div></div>
      <div class="result-tiles">
        ${matchedHtml}${neededHtml ? (matchedHtml ? ' ' : '') + neededHtml : ''}
      </div>
      <div class="result-meta">${meta.join(' &middot; ')}</div>
    `;

    container.appendChild(card);
  });
}

// ---------------------------------------------------------------------------
// Card Tab
// ---------------------------------------------------------------------------
function initCardTab() {
  document.getElementById('load-samples').addEventListener('click', () => {
    for (const h of SAMPLE_HANDS) {
      // Avoid duplicates
      if (!state.cardTemplates.find(t => t.id === h.id)) {
        state.cardTemplates.push(h);
      }
    }
    saveCard(state.cardTemplates);
    rebuildConcreteHands();
    renderCardList();
    updateAll();
  });

  document.getElementById('clear-card').addEventListener('click', () => {
    if (confirm('Remove all hands from your card?')) {
      clearCard();
      state.cardTemplates = [];
      state.concreteHands = [];
      renderCardList();
      updateAll();
    }
  });

  document.getElementById('export-card').addEventListener('click', () => {
    document.getElementById('import-export-area').value = exportCard();
  });

  document.getElementById('import-card-btn').addEventListener('click', () => {
    const json = document.getElementById('import-export-area').value.trim();
    if (!json) return;
    try {
      const templates = importCard(json);
      state.cardTemplates = templates;
      rebuildConcreteHands();
      renderCardList();
      updateAll();
    } catch (e) {
      alert('Invalid JSON: ' + e.message);
    }
  });
}

function loadCardData() {
  state.cardTemplates = loadCard();
  rebuildConcreteHands();
  renderCardList();
}

function rebuildConcreteHands() {
  state.concreteHands = [];
  for (const template of state.cardTemplates) {
    try {
      const variants = expandTemplate(template);
      state.concreteHands.push(...variants);
    } catch (e) {
      console.warn(`Failed to expand template ${template.id}:`, e);
    }
  }
}

function renderCardList() {
  const container = document.getElementById('card-list');

  if (state.cardTemplates.length === 0) {
    container.innerHTML = `
      <div class="card-empty">
        <p>No hands loaded yet.</p>
        <p>Tap "Load Samples" to try example hands, or import your own card data.</p>
      </div>`;
    return;
  }

  container.innerHTML = '';

  // Group by category
  const byCategory = {};
  for (const t of state.cardTemplates) {
    if (!byCategory[t.category]) byCategory[t.category] = [];
    byCategory[t.category].push(t);
  }

  for (const [cat, hands] of Object.entries(byCategory)) {
    for (const h of hands) {
      const size = handSize(h);
      const variants = expandTemplate(h).length;
      const item = document.createElement('div');
      item.className = 'card-item';
      item.innerHTML = `
        <div class="card-item-info">
          <div class="card-item-category">${cat} #${h.number}</div>
          <div class="card-item-desc">${h.description}</div>
          <div class="card-item-meta">
            ${h.value} pts &middot; ${size} tiles &middot; ${variants} variant${variants !== 1 ? 's' : ''}
            ${h.concealed ? ' &middot; Concealed' : ''}
            ${!h.jokersAllowed ? ' &middot; No Jokers' : ''}
          </div>
        </div>
        <button class="btn-remove" data-id="${h.id}" title="Remove">&times;</button>
      `;
      container.appendChild(item);
    }
  }

  // Wire up remove buttons
  container.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      state.cardTemplates = state.cardTemplates.filter(t => t.id !== id);
      saveCard(state.cardTemplates);
      rebuildConcreteHands();
      renderCardList();
      updateAll();
    });
  });
}

// ---------------------------------------------------------------------------
// Picker state (gray out maxed tiles)
// ---------------------------------------------------------------------------
function updatePickerState() {
  document.querySelectorAll('.tile-btn').forEach(btn => {
    const tileId = btn.dataset.tile;
    const current = state.playerTiles.filter(t => t === tileId).length;
    const atMax = current >= maxCount(tileId) || state.playerTiles.length >= 14;
    btn.classList.toggle('maxed', atMax);
  });
}

// ---------------------------------------------------------------------------
// Update everything
// ---------------------------------------------------------------------------
function updateAll() {
  renderHand();
  renderResults();
  updatePickerState();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function tileClass(id) {
  const t = parseTile(id);
  switch (t.type) {
    case 'suit': return `tile-${t.suit}`;
    case 'wind': return 'tile-wind';
    case 'dragon': return `tile-dragon-${t.dragon}`;
    case 'flower': return 'tile-flower';
    case 'joker': return 'tile-joker';
    default: return '';
  }
}
