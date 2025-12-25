'use strict';
const udcd2s = require('../index.js');

console.log('Running hardware test (Connect UD-CO2S)...');

// Max duration for test
const TEST_DURATION_MS = 10000;
// Stop test timer
let timer = null;

const callback = function (res, error) {
    if (res) {
        if (res.state === 'connected') {
            console.log(`[DATA] CO2: ${res.CO2}, HUM: ${res.HUM}, TMP: ${res.TMP}`);
        } else if (res.state === 'OK') {
            console.log(`[INFO] Connection established (OK STA)`);
        } else if (res.state === 'error') {
            console.error(`[ERROR] State: error, Msg: ${error}`);
            process.exit(1);
        } else {
            console.log(`[INFO] State: ${res.state}, Msg: ${error}`);
        }
    } else {
        console.error('[FAIL] No response object');
    }
};

try {
    console.log('Starting sensor connection...');
    udcd2s.start(callback);

    // Stop after duration
    timer = setTimeout(async () => {
        console.log('Stopping sensor connection...');
        await udcd2s.stop();
        console.log('[PASS] Hardware test completed.');
        process.exit(0);
    }, TEST_DURATION_MS);

} catch (e) {
    console.error('[FAIL] Exception occurred');
    console.error(e);
    process.exit(1);
}
