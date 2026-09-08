/**
 * mathGenerator.js
 * 
 * Instead of generating random problems, we load the fixed problems
 * extracted from the official PDF competition sheets.
 * 
 * Problems are shuffled once per training session (using a seeded index)
 * and then served sequentially so every answer is deterministic and
 * matches the official answer key.
 */

import { pdfProblems } from '../data/pdfProblems';

/**
 * In-memory pool for the current session.
 * categoryId -> shuffled array of problems
 */
const sessionPools = {};

/**
 * Fisher-Yates shuffle (in-place, returns array).
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Get (or create) the shuffled pool for a given category.
 * The pool cycles: when exhausted it refills and reshuffles.
 */
function getPool(categoryId) {
  if (!sessionPools[categoryId]) {
    const source = pdfProblems[categoryId];
    if (!source || source.length === 0) return null;
    sessionPools[categoryId] = {
      problems: shuffle(source),
      index: 0,
    };
  }
  return sessionPools[categoryId];
}

/**
 * Reset the pool for a category (call at session start to reshuffle).
 */
export function resetPool(categoryId) {
  delete sessionPools[categoryId];
}

/**
 * Main entry point — replaces the old random generateProblem().
 * 
 * @param {object} config   - level category config (must include `categoryId`)
 * @returns {object}        - { isMultiplication, numbers, correctAnswer, text? }
 */
export function generateProblem(config = {}) {
  const categoryId = config.categoryId;
  const pool = getPool(categoryId);

  if (!pool) {
    // Fallback: if no PDF data exists for this category, generate a simple addition
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    return {
      isMultiplication: false,
      numbers: [
        { val: a, sign: 1 },
        { val: b, sign: 1 },
      ],
      correctAnswer: a + b,
    };
  }

  // Serve next problem; cycle when exhausted
  if (pool.index >= pool.problems.length) {
    pool.problems = shuffle(pdfProblems[categoryId]);
    pool.index = 0;
  }

  const problem = pool.problems[pool.index++];
  return problem;
}
