// Utility to generate random numbers based on config
export const generateProblem = (config) => {
  // Simple implementation for MVP - this would be expanded with actual Soroban logic (rules of 5, 10, etc)
  let count = config.ops || 5;
  let max = 9;
  
  if (config.type.includes('tens')) max = 99;
  if (config.type.includes('mixed')) max = 999;
  
  let numbers = [];
  let currentTotal = 0;
  
  for (let i = 0; i < count; i++) {
    // Determine sign: first number is always positive, others can be + or -
    // Ensure we don't go below 0 for simpler levels
    let num = Math.floor(Math.random() * max) + 1;
    let sign = (i === 0) ? 1 : (Math.random() > 0.5 ? 1 : -1);
    
    // Prevent negative totals if needed for kids
    if (currentTotal + (sign * num) < 0) {
      sign = 1;
    }
    
    currentTotal += (sign * num);
    numbers.push({ val: num, sign: sign });
  }
  
  return {
    numbers,
    correctAnswer: currentTotal
  };
};
