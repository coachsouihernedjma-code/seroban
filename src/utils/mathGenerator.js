/**
 * mathGenerator.js
 * 
 * Loads official PDF competition sheet operations and delivers them
 * in strict progression order:
 * 1. وحدات (Units - Table A)
 * 2. عشرات (Tens - Table B)
 * 3. مئات (Hundreds - Table C)
 * in levels that contain units, tens, and hundreds.
 */

import { pdfProblems } from '../data/pdfProblems.js';

/**
 * Mapping of international levels to corresponding official competition problem sets
 */
const CATEGORY_ALIASES = {
  'int-beg-1': 'prep',
  'int-int-1': 'l1-2',
  'int-int-2': 'l1-3',
  'int-adv-1': 'l2-1',
  'int-adv-2': 'l2-2',
  'int-cha-1': 'l4-1',
  'int-cha-2': 'l4-2',
  'prep-1': 'prep',
};

/**
 * In-memory pool for the current session.
 * categoryId -> array of problems sorted by stage (units, tens, hundreds)
 */
const sessionPools = {};

/**
 * Order problems strictly by place value:
 * 1. Units (آحاد / وحدات - Table A)
 * 2. Tens (عشرات - Table B)
 * 3. Hundreds (مئات - Table C)
 * 4. Multiplication & Mixed (Table Ope/etc.)
 */
function sortProblemsByStage(problems) {
  if (!problems || problems.length === 0) return [];

  const units = [];
  const tens = [];
  const hundreds = [];
  const others = [];

  for (const p of problems) {
    if (p.isMultiplication) {
      others.push({ ...p, stage: 'mul', stageLabel: 'ضرب' });
    } else if (p.stage === 'hundreds' || p.id?.startsWith('C') || p.numbers?.some(n => n.val >= 100)) {
      hundreds.push({ ...p, stage: 'hundreds', stageLabel: 'مئات' });
    } else if (p.stage === 'tens' || p.id?.startsWith('B') || p.numbers?.some(n => n.val >= 10)) {
      tens.push({ ...p, stage: 'tens', stageLabel: 'عشرات' });
    } else {
      units.push({ ...p, stage: 'units', stageLabel: 'آحاد (وحدات)' });
    }
  }

  return [...units, ...tens, ...hundreds, ...others];
}

/**
 * Generate synthetic problem for fallback cases
 */
function generateFallbackProblem({ stage, stageLabel, minVal, maxVal, floors = 4, id }) {
  const numbers = [];
  let currentTotal = 0;

  for (let i = 0; i < floors; i++) {
    const num = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
    let sign = (i === 0) ? 1 : (Math.random() > 0.45 ? 1 : -1);
    
    // Prevent negative cumulative totals in Soroban calculations
    if (currentTotal + (sign * num) < 0) {
      sign = 1;
    }

    currentTotal += (sign * num);
    numbers.push({ val: num, sign });
  }

  return {
    id: id || `${stage[0].toUpperCase()}1`,
    stage,
    stageLabel,
    numbers,
    correctAnswer: currentTotal,
    isMultiplication: false,
  };
}

/**
 * Generate fallback pool ordered strictly: units -> tens -> hundreds
 */
function generateFallbackPool(config = {}) {
  const total = config.count || 90;
  const floors = config.ops || 4;
  const tables = config.tables || {};

  let unitsCount = typeof tables.units === 'number' ? tables.units * 10 : 0;
  let tensCount = typeof tables.tens === 'number' ? tables.tens * 10 : 0;
  let hundredsCount = typeof tables.hundreds === 'number' ? tables.hundreds * 10 : 0;

  if (unitsCount === 0 && tensCount === 0 && hundredsCount === 0) {
    if (config.type === 'units_only') {
      unitsCount = total;
    } else if (config.type?.includes('tens') || config.type?.includes('medium')) {
      unitsCount = Math.floor(total * 0.5);
      tensCount = total - unitsCount;
    } else {
      unitsCount = Math.floor(total * 0.4);
      tensCount = Math.floor(total * 0.4);
      hundredsCount = total - unitsCount - tensCount;
    }
  }

  const pool = [];

  // 1. All Units First
  for (let i = 0; i < unitsCount; i++) {
    pool.push(generateFallbackProblem({
      stage: 'units',
      stageLabel: 'آحاد (وحدات)',
      minVal: 1,
      maxVal: 9,
      floors,
      id: `A${i + 1}`,
    }));
  }

  // 2. All Tens Second
  for (let i = 0; i < tensCount; i++) {
    pool.push(generateFallbackProblem({
      stage: 'tens',
      stageLabel: 'عشرات',
      minVal: 10,
      maxVal: 99,
      floors,
      id: `B${i + 1}`,
    }));
  }

  // 3. All Hundreds Third
  for (let i = 0; i < hundredsCount; i++) {
    pool.push(generateFallbackProblem({
      stage: 'hundreds',
      stageLabel: 'مئات',
      minVal: 100,
      maxVal: 999,
      floors,
      id: `C${i + 1}`,
    }));
  }

  return pool.length > 0 ? pool : [
    generateFallbackProblem({ stage: 'units', stageLabel: 'آحاد (وحدات)', minVal: 1, maxVal: 9, floors, id: 'A1' })
  ];
}

/**
 * Get (or create) the pool for a given category.
 * Ordered strictly: Units -> Tens -> Hundreds.
 */
function getPool(categoryId, config = {}) {
  const targetId = CATEGORY_ALIASES[categoryId] || categoryId;
  const poolKey = targetId || 'default';

  if (!sessionPools[poolKey]) {
    const source = pdfProblems[targetId];
    if (source && source.length > 0) {
      sessionPools[poolKey] = {
        problems: sortProblemsByStage(source),
        index: 0,
      };
    } else {
      sessionPools[poolKey] = {
        problems: generateFallbackPool(config),
        index: 0,
      };
    }
  }
  return sessionPools[poolKey];
}

/**
 * Reset the pool for a category (called at session start).
 */
export function resetPool(categoryId) {
  const targetId = CATEGORY_ALIASES[categoryId] || categoryId;
  delete sessionPools[targetId];
  delete sessionPools[categoryId];
}

/**
 * Main problem generator.
 * Guaranteed to return problems in strict sequence:
 * 1. وحدات (Units)
 * 2. عشرات (Tens)
 * 3. مئات (Hundreds)
 * in levels that contain units, tens, and hundreds.
 * 
 * @param {object} config - level category config
 * @returns {object} - { id, stage, stageLabel, isMultiplication, numbers, correctAnswer, text? }
 */
export function generateProblem(config = {}) {
  const categoryId = config.categoryId || config.id;
  const pool = getPool(categoryId, config);

  if (!pool || !pool.problems || pool.problems.length === 0) {
    return generateFallbackProblem({
      stage: 'units',
      stageLabel: 'آحاد (وحدات)',
      minVal: 1,
      maxVal: 9,
      floors: config.ops || 4,
      id: 'A1',
    });
  }

  // Loop back if all problems are completed
  if (pool.index >= pool.problems.length) {
    pool.index = 0;
  }

  const problem = pool.problems[pool.index++];
  return problem;
}
