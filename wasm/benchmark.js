import puppeteer from 'puppeteer-core';
import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const FIBONACCI_N = parseInt(process.env.FIBONACCI_N ?? '40');
const WARMUP_RUNS = parseInt(process.env.WARMUP_RUNS ?? '10');
const BENCH_RUNS = parseInt(process.env.BENCH_RUNS ?? '50');
const RESULTS_DIR = process.env.RESULTS_DIR ?? '/results';
const PORT = 8080;

const MIME = {
    '.html': 'text/html',
    '.js':   'application/javascript',
    '.wasm': 'application/wasm',
    '.json': 'application/json',
};

function startServer() {
    return new Promise((resolve) => {
        const server = createServer((req, res) => {
            const urlPath = req.url.split('?')[0];

            let filePath;
            if (urlPath.startsWith('/pkg/')) {
                filePath = join(__dirname, 'pkg', urlPath.slice(5));
            } else if (urlPath === '/' || urlPath === '/index.html') {
                filePath = join(__dirname, 'web', 'index.html');
            } else {
                filePath = join(__dirname, 'web', urlPath);
            }

            try {
                const data = readFileSync(filePath);
                const ext = extname(filePath);
                res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' });
                res.end(data);
            } catch {
                res.writeHead(404);
                res.end('Not found: ' + urlPath);
            }
        });

        server.listen(PORT, () => {
            console.log(`Static server running on http://localhost:${PORT}`);
            resolve(server);
        });
    });
}

async function main() {
    const server = await startServer();

    const browser = await puppeteer.launch({
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH ?? '/usr/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: 'new',
    });

    try {
        const page = await browser.newPage();

        page.on('console', (msg) => console.log('[browser]', msg.text()));
        page.on('pageerror', (err) => console.error('[browser error]', err));

        await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });

        console.log(`Running benchmark: fibonacci(${FIBONACCI_N}), warmup=${WARMUP_RUNS}, runs=${BENCH_RUNS}`);

        const result = await page.evaluate(
            (n, warmup, runs) => window.runBenchmark(n, warmup, runs),
            FIBONACCI_N,
            WARMUP_RUNS,
            BENCH_RUNS
        );

        const times = result.times;
        const mean = times.reduce((a, b) => a + b, 0) / times.length;
        const sorted = [...times].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const min = sorted[0];
        const max = sorted[sorted.length - 1];

        const output = {
            algorithm: 'fibonacci',
            input: FIBONACCI_N,
            warmupRuns: WARMUP_RUNS,
            measuredRuns: BENCH_RUNS,
            unit: 'milliseconds',
            summary: { mean, median, min, max },
            times,
        };

        mkdirSync(RESULTS_DIR, { recursive: true });
        const outPath = join(RESULTS_DIR, 'wasm.json');
        writeFileSync(outPath, JSON.stringify(output, null, 2));
        console.log(`Results saved to ${outPath}`);
        console.log('Summary:', output.summary);

    } finally {
        await browser.close();
        server.close();
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
