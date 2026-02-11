/**
 * Test DOB Validation
 */

import { extractAndValidateDOB, validateDOB } from './utils/dobValidator.js';

console.log('🧪 Testing DOB Validation\n');
console.log('='.repeat(60));

// Test cases
const testCases = [
  { input: '55/85/7894', expected: 'invalid', description: 'Invalid month and year' },
  { input: '15/06/1990', expected: 'valid', description: 'Valid date' },
  { input: '31/02/1990', expected: 'invalid', description: 'Invalid date (Feb 31)' },
  { input: '29/02/2000', expected: 'valid', description: 'Valid leap year date' },
  { input: '29/02/2001', expected: 'invalid', description: 'Invalid (not leap year)' },
  { input: '15/13/1990', expected: 'invalid', description: 'Invalid month (13)' },
  { input: '32/06/1990', expected: 'invalid', description: 'Invalid day (32)' },
  { input: '15/06/2025', expected: 'invalid', description: 'Future date' },
  { input: '15/06/1800', expected: 'invalid', description: 'Too old (before 1900)' },
  { input: '15/06/2010', expected: 'invalid', description: 'Too young (under 18)' },
  { input: '1/6/1990', expected: 'valid', description: 'Valid date without leading zeros' },
  { input: '15-06-1990', expected: 'valid', description: 'Valid date with dashes' },
];

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. Testing: "${testCase.input}"`);
  console.log(`   Description: ${testCase.description}`);
  
  const result = extractAndValidateDOB(testCase.input);
  
  if (testCase.expected === 'valid' && result.valid) {
    console.log(`   ✅ PASS - Valid DOB: ${result.dob}`);
  } else if (testCase.expected === 'invalid' && !result.valid) {
    console.log(`   ✅ PASS - Correctly rejected: ${result.error}`);
  } else {
    console.log(`   ❌ FAIL - Expected ${testCase.expected}, got ${result.valid ? 'valid' : 'invalid'}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }
});

console.log('\n' + '='.repeat(60));
console.log('✅ DOB Validation Tests Completed');
