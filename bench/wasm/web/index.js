import init, { fibonacci } from '/pkg/fibonacci.js';

let wasmReady = false;

async function setup() {
    await init();
    wasmReady = true;
}

window.runBenchmark = async function(n = 40, warmupRuns = 10, measuredRuns = 50) {
    if (!wasmReady) await setup();

    // Warmup
    for (let i = 0; i < warmupRuns; i++) {
        fibonacci(n);
    }

    // Measured runs
    const times = [];
    for (let i = 0; i < measuredRuns; i++) {
        const start = performance.now();
        fibonacci(n);
        const end = performance.now();
        times.push(end - start);
    }

    const result = { times, n, warmupRuns, measuredRuns };
    document.getElementById('n-value').textContent = n;
    document.getElementById('output').textContent = JSON.stringify(result, null, 2);
    return result;
};

// Auto-setup on load
setup().catch(console.error);
