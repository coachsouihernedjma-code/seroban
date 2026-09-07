// Utility to generate random numbers based on level config
export const generateProblem = (config = {}) => {
  const type = config.type || 'units_only';

  // Check if this problem is multiplication for mixed level (e.g. level 4)
  if (type.includes('mixed') && Math.random() > 0.4) {
    const isMultiplication = true;
    const subType = Math.random();
    let num1, num2;
    if (subType < 0.4) {
      // 1 digit x 2 digits
      num1 = Math.floor(Math.random() * 8) + 2; // 2..9
      num2 = Math.floor(Math.random() * 90) + 10; // 10..99
    } else if (subType < 0.75) {
      // 1 digit x 3 digits
      num1 = Math.floor(Math.random() * 8) + 2; // 2..9
      num2 = Math.floor(Math.random() * 900) + 100; // 100..999
    } else {
      // 2 digits x 2 digits
      num1 = Math.floor(Math.random() * 90) + 10; // 10..99
      num2 = Math.floor(Math.random() * 90) + 10; // 10..99
    }

    return {
      isMultiplication: true,
      text: `${num1} × ${num2}`,
      numbers: [
        { val: num1, sign: 1 },
        { val: num2, sign: 1, opText: '×' }
      ],
      correctAnswer: num1 * num2
    };
  }

  // Standard Soroban Addition / Subtraction with Floors (الطوابق)
  const minFloors = config.floorsMin || (type === 'units_only' ? 3 : 3);
  const maxFloors = config.floorsMax || (type === 'units_only' ? 5 : 6);
  const floorsCount = Math.floor(Math.random() * (maxFloors - minFloors + 1)) + minFloors;

  let maxNum = 9;
  if (type === 'units_only') {
    maxNum = 9;
  } else if (type === 'tens_easy') {
    maxNum = 50;
  } else if (type === 'tens_medium') {
    maxNum = 99;
  } else if (type.includes('hard') || type.includes('expert')) {
    maxNum = 500;
  } else if (type.includes('rule_5') || type.includes('rule_10')) {
    maxNum = 99;
  } else {
    maxNum = 99;
  }

  const numbers = [];
  let currentTotal = 0;

  for (let i = 0; i < floorsCount; i++) {
    let num;
    if (type === 'units_only') {
      num = Math.floor(Math.random() * 9) + 1; // 1 to 9
    } else {
      // Mix of units and tens based on config
      const useUnits = Math.random() < 0.6;
      num = useUnits
        ? (Math.floor(Math.random() * 9) + 1)
        : (Math.floor(Math.random() * maxNum) + 1);
    }

    // First number is always positive
    let sign = (i === 0) ? 1 : (Math.random() > 0.45 ? 1 : -1);

    // Prevent negative running sum for young learners
    if (currentTotal + (sign * num) < 0) {
      sign = 1;
    }

    currentTotal += (sign * num);
    numbers.push({ val: num, sign: sign });
  }

  return {
    isMultiplication: false,
    numbers,
    correctAnswer: currentTotal
  };
};
