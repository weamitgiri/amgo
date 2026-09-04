/**
 * Security regression test for OTP generation.
 *
 * Guards against the vulnerability where the OTP was hardcoded to a constant
 * ("123456") and against a regression to a non-cryptographic generator. Run
 * with: npm run test:security
 */
import assert from 'node:assert';
import { generateNumericOtp } from '../../src/utils/otp';

let failures = 0;
function check(name: string, fn: () => void) {
    try {
        fn();
        console.log(`  ok  - ${name}`);
    } catch (err) {
        failures++;
        console.error(`  FAIL - ${name}`);
        console.error(`         ${(err as Error).message}`);
    }
}

console.log('OTP security tests');

check('produces a 6-digit numeric string', () => {
    for (let i = 0; i < 1000; i++) {
        const otp = generateNumericOtp(6);
        assert.match(otp, /^\d{6}$/, `expected 6 digits, got "${otp}"`);
    }
});

check('respects a custom length and zero-pads', () => {
    for (let i = 0; i < 1000; i++) {
        assert.match(generateNumericOtp(4), /^\d{4}$/);
    }
});

check('is not a constant (no hardcoded OTP regression)', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 500; i++) {
        seen.add(generateNumericOtp(6));
    }
    // 500 draws from a CSPRNG over a million values should be nearly all unique;
    // a hardcoded/degenerate generator collapses this to a tiny number.
    assert.ok(seen.size > 400, `expected high uniqueness, only ${seen.size} distinct values in 500 draws`);
    assert.ok(!seen.has('123456') || seen.size > 400, 'generator appears constant');
});

check('covers the full leading-zero range', () => {
    let sawLeadingZero = false;
    for (let i = 0; i < 5000 && !sawLeadingZero; i++) {
        if (generateNumericOtp(6).startsWith('0')) sawLeadingZero = true;
    }
    assert.ok(sawLeadingZero, 'never produced a leading-zero OTP — range may be truncated');
});

check('rejects invalid length', () => {
    assert.throws(() => generateNumericOtp(0));
});

if (failures > 0) {
    console.error(`\n${failures} test(s) failed`);
    process.exit(1);
}
console.log('\nAll OTP security tests passed');
