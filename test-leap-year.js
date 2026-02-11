/**
 * Comprehensive Leap Year Testing
 */

import { validateDOB, extractAndValidateDOB } from './utils/dobValidator.js';

console.log('🧪 Testing Leap Year Validation\n');
console.log('='.repeat(60));

// Leap year test cases
const leapYearTests = [
  // Valid leap year dates
  { input: '29/02/2000', expected: true, desc: 'Year 2000 (divisible by 400 - leap year)' },
  { input: '29/02/2004', expected: true, desc: 'Year 2004 (divisible by 4 - leap year)' },
  { input: '29/02/2020', expected: true, desc: 'Year 2020 (divisible by 4 - leap year)' },
  { input: '29/02/2024', expected: true, desc: 'Year 2024 (divisible by 4 - leap year)' },
  { input: '29/02/1996', expected: true, desc: 'Year 1996 (divisible by 4 - leap year)' },
  
  // Invalid leap year dates (not leap years)
  { input: '29/02/2001', expected: false, desc: 'Year 2001 (not divisible by 4 - not leap year)' },
  { input: '29/02/2002', expected: false, desc: 'Year 2002 (not divisible by 4 - not leap year)' },
  { input: '29/02/2003', expected: false, desc: 'Year 2003 (not divisible by 4 - not leap year)' },
  { input: '29/02/1900', expected: false, desc: 'Year 1900 (divisible by 100 but not 400 - not leap year)' },
  { input: '29/02/1800', expected: false, desc: 'Year 1800 (divisible by 100 but not 400 - not leap year)' },
  { input: '29/02/2100', expected: false, desc: 'Year 2100 (divisible by 100 but not 400 - not leap year)' },
  
  // Edge cases - century years
  { input: '29/02/1600', expected: false, desc: 'Year 1600 (before 1900 - invalid year range)' },
  { input: '29/02/2400', expected: false, desc: 'Year 2400 (future date - invalid)' },
  
  // Valid non-leap year dates in February
  { input: '28/02/2001', expected: true, desc: 'Feb 28 in non-leap year (valid)' },
  { input: '28/02/1900', expected: true, desc: 'Feb 28 in century year (valid)' },
  
  // Invalid dates in February for non-leap years
  { input: '30/02/2001', expected: false, desc: 'Feb 30 in non-leap year (invalid - Feb only has 28/29 days)' },
  { input: '31/02/2001', expected: false, desc: 'Feb 31 in non-leap year (invalid)' },
];

console.log('\n📅 Leap Year Rule:');
console.log('   A year is a leap year if:');
console.log('   1. It is divisible by 4, AND');
console.log('   2. It is NOT divisible by 100, OR');
console.log('   3. It IS divisible by 400');
console.log('\n   Examples:');
console.log('   - 2000: divisible by 400 → LEAP YEAR ✅');
console.log('   - 1900: divisible by 100 but NOT 400 → NOT leap year ❌');
console.log('   - 2004: divisible by 4 but not 100 → LEAP YEAR ✅');
console.log('   - 2001: not divisible by 4 → NOT leap year ❌');

console.log('\n' + '='.repeat(60));
console.log('Running Tests:\n');

let passed = 0;
let failed = 0;

leapYearTests.forEach((test, index) => {
  const result = extractAndValidateDOB(test.input);
  const isValid = result.valid;
  const matches = isValid === test.expected;
  
  if (matches) {
    passed++;
    console.log(`✅ Test ${index + 1}: ${test.desc}`);
    console.log(`   Input: ${test.input} → ${isValid ? 'VALID' : 'INVALID'} (Expected: ${test.expected ? 'VALID' : 'INVALID'})`);
    if (!isValid && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  } else {
    failed++;
    console.log(`❌ Test ${index + 1}: ${test.desc}`);
    console.log(`   Input: ${test.input} → ${isValid ? 'VALID' : 'INVALID'} (Expected: ${test.expected ? 'VALID' : 'INVALID'})`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }
  console.log('');
});

console.log('='.repeat(60));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(60));

if (failed === 0) {
  console.log('\n✅ All leap year tests passed!');
} else {
  console.log('\n⚠️  Some tests failed. Please review the implementation.');
}
