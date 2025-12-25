'use strict';
const udcd2s = require('../index.js');
const assert = require('assert');

console.log('Running tests for usb-ud-co2s...');

let passed = 0;
let failed = 0;

function runTest(name, testFn) {
    try {
        testFn();
        console.log(`[PASS] ${name}`);
        passed++;
    } catch (e) {
        console.error(`[FAIL] ${name}`);
        console.error(e);
        failed++;
    }
}

// Test startRequestData
runTest('startRequestData should return correct buffer', () => {
    const expected = new Uint8Array([0x53, 0x54, 0x41, 0x0d, 0x0a]);
    const actual = udcd2s.startRequestData();
    assert.deepStrictEqual(actual, expected);
});

// Test stopRequestData
runTest('stopRequestData should return correct buffer', () => {
    const expected = new Uint8Array([0x53, 0x54, 0x50, 0x0d, 0x0a]);
    const actual = udcd2s.stopRequestData();
    assert.deepStrictEqual(actual, expected);
});

// Test parseResponse OK
runTest('parseResponse should handle OK response', () => {
    const input = Buffer.from('OK STA\r\n');
    const expected = { state: 'OK' };
    const actual = udcd2s.parseResponse(input);
    assert.deepStrictEqual(actual, expected);
});

// Test parseResponse Data
runTest('parseResponse should handle measurement data', () => {
    // recvData= <Buffer 43 4f 32 3d 36 30 36 2c 48 55 4d 3d 34 36 2e 35 2c 54 4d 50 3d 32 39 2e 38 0d 0a>
    // CO2=606,HUM=46.5,TMP=29.8
    const inputStr = 'CO2=606,HUM=46.5,TMP=29.8\r\n';
    const input = Buffer.from(inputStr);
    const expected = {
        state: 'connected',
        CO2: '606',
        HUM: '46.5',
        TMP: '29.8'
    };
    const actual = udcd2s.parseResponse(input);
    assert.deepStrictEqual(actual, expected);
});

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
