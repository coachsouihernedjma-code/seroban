/**
 * mathGenerator.js
 *
 * Serves the official competition problems for a category — and nothing else.
 *
 * Every problem comes from the federation PDFs in pdf/, extracted into
 * src/data/pdfProblems.js by scripts/extract_all_problems.py. There is no
 * synthetic/random generation: a student must only ever see operations that
 * appear on the real exam sheet.
 *
 * Order is the PDF's own order, which the extraction script already encodes:
 *   - addition sheets : آحاد (A) -> عشرات (B) -> مئات (C)
 *   - level 4 sheets  : ضرب (1×2 -> 1×3 -> 2×2) -> مركب آحاد (A) -> مركب عشرات (B)
 * so this module deliberately does NOT re-sort the pool.
 *
 * Three categories have sheets shorter than their official operation count
 * (prep 70/90, l1-1 90/110, l1-2 110/120). When their pool runs out it is
 * reshuffled and replayed so the session still reaches the official total —
 * the problems repeat, but every one of them is still a real PDF problem.
 * Categories whose sheet already covers their count never reach this path.
 */

import { pdfProblems } from '../data/pdfProblems.js';

/**
 * International categories reuse the Algerian competition sheets.
 * Maps a category ID to the pdfProblems key holding its problems.
 */
const CATEGORY_ALIASES = {
  'prep-1': 'prep',
  'int-beg-1': 'prep',
  'int-int-1': 'l1-2',
  'int-int-2': 'l1-3',
  'int-adv-1': 'l2-1',
  'int-adv-2': 'l2-2',
  'int-cha-1': 'l4-1',
  'int-cha-2': 'l4-2',
};

/** categoryId -> { problems, index, cycle } for the current session. */
const sessionPools = {};

function resolveKey(categoryId) {
  return CATEGORY_ALIASES[categoryId] || categoryId;
}

/** Fisher-Yates, on a copy. */
function shuffled(list) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function getPool(categoryId) {
  const key = resolveKey(categoryId);
  if (!key) return null;

  if (!sessionPools[key]) {
    const source = pdfProblems[key];
    if (!source || source.length === 0) return null;
    // First pass keeps the exam sheet's order.
    sessionPools[key] = { problems: source.slice(), index: 0, cycle: 0 };
  }
  return sessionPools[key];
}

/**
 * Number of official problems available for a category (0 if none).
 * Lets the UI cap a session at what the sheet actually contains.
 */
export function getProblemCount(categoryId) {
  const source = pdfProblems[resolveKey(categoryId)];
  return source ? source.length : 0;
}

/** True when the category has an official problem set. */
export function hasProblemSet(categoryId) {
  return getProblemCount(categoryId) > 0;
}

/** Reset a category's pool (called at session start). */
export function resetPool(categoryId) {
  delete sessionPools[resolveKey(categoryId)];
  delete sessionPools[categoryId];
}

/**
 * Next official problem for the category.
 *
 * @param {object} config - the category's `config` object from levels.js
 * @returns {object|null} problem, or null when the category has no official
 *                        problem set (the caller must surface this, not guess).
 */
export function generateProblem(config = {}) {
  const pool = getPool(config.categoryId || config.id);
  if (!pool) return null;

  if (pool.index >= pool.problems.length) {
    // Sheet exhausted — replay it in a new order rather than inventing problems.
    const lastServed = pool.problems[pool.problems.length - 1];
    let next = shuffled(pool.problems);
    // Avoid showing the same problem twice in a row across the seam.
    if (next.length > 1 && next[0].id === lastServed?.id) {
      [next[0], next[next.length - 1]] = [next[next.length - 1], next[0]];
    }
    pool.problems = next;
    pool.index = 0;
    pool.cycle += 1;
  }

  return pool.problems[pool.index++];
}
