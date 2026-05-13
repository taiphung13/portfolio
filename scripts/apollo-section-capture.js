#!/usr/bin/env node

const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 2) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key || !key.startsWith("--") || value === undefined) {
      throw new Error(
        "Usage: node scripts/apollo-section-capture.js --url URL --selector SELECTOR --width WIDTH --height HEIGHT --out OUT_PNG --metrics METRICS_JSON",
      );
    }
    args[key.slice(2)] = value;
  }
  return args;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${url}`);
  }
  return response.json();
}

async function findWebSocketUrl(port) {
  for (let i = 0; i < 50; i += 1) {
    try {
      const pages = await getJson(`http://127.0.0.1:${port}/json`);
      const page = pages.find((entry) => entry.type === "page");
      if (page && page.webSocketDebuggerUrl) {
        return page.webSocketDebuggerUrl;
      }
    } catch (_) {
      await wait(100);
    }
  }
  throw new Error("Chrome CDP endpoint did not become available");
}

async function createCdpClient(wsUrl) {
  let id = 0;
  const pending = new Map();
  const ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) {
        reject(new Error(JSON.stringify(message.error)));
      } else {
        resolve(message.result);
      }
    }
  };

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  return {
    send(method, params = {}) {
      const messageId = ++id;
      ws.send(JSON.stringify({ id: messageId, method, params }));
      return new Promise((resolve, reject) => {
        pending.set(messageId, { resolve, reject });
      });
    },
    close() {
      ws.close();
    },
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const url = args.url;
  const selector = args.selector;
  const width = Number(args.width);
  const height = Number(args.height || 18000);
  const outPath = args.out;
  const metricsPath = args.metrics;

  if (!url || !selector || !width || !outPath || !metricsPath) {
    throw new Error("Missing required arguments");
  }
  if (!fs.existsSync(chromePath)) {
    throw new Error(`Chrome executable not found: ${chromePath}`);
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.mkdirSync(path.dirname(metricsPath), { recursive: true });

  const port = 9300 + Math.floor(Math.random() * 500);
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "apollo-cdp-"));
  const chrome = spawn(
    chromePath,
    [
      "--headless=new",
      "--no-first-run",
      "--disable-gpu",
      "--hide-scrollbars",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${userDataDir}`,
      url,
    ],
    { stdio: "ignore" },
  );

  let client;
  try {
    client = await createCdpClient(await findWebSocketUrl(port));
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await client.send("Page.navigate", { url });

    for (let i = 0; i < 80; i += 1) {
      const ready = await client.send("Runtime.evaluate", {
        expression: "document.readyState",
        returnByValue: true,
      });
      if (ready.result.value === "complete") {
        break;
      }
      await wait(100);
    }

    await client.send("Runtime.evaluate", {
      awaitPromise: true,
      returnByValue: true,
      expression:
        "Promise.all([...document.images].map((img) => img.complete ? true : new Promise((resolve) => { img.onload = img.onerror = () => resolve(true); })))",
    });

    await client.send("Runtime.evaluate", {
      awaitPromise: true,
      returnByValue: true,
      expression: "document.fonts && document.fonts.ready ? document.fonts.ready.then(() => true) : true",
    });

    const metricsResult = await client.send("Runtime.evaluate", {
      returnByValue: true,
      expression: `(() => {
        const node = document.querySelector(${JSON.stringify(selector)});
        if (!node) return { ok: false, error: "Selector not found", selector: ${JSON.stringify(selector)} };
        const rect = node.getBoundingClientRect();
        const round = (value) => Math.round(value * 100) / 100;
        return {
          ok: true,
          selector: ${JSON.stringify(selector)},
          viewport: { width: ${width}, height: ${height} },
          clip: {
            x: Math.max(0, Math.floor(rect.x)),
            y: Math.max(0, Math.floor(rect.y + window.scrollY)),
            width: Math.ceil(rect.width),
            height: Math.ceil(rect.height),
            scale: 1
          },
          box: {
            x: round(rect.x),
            y: round(rect.y + window.scrollY),
            width: round(rect.width),
            height: round(rect.height)
          }
        };
      })()`,
    });

    const metrics = metricsResult.result.value;
    if (!metrics.ok) {
      throw new Error(metrics.error);
    }

    const screenshot = await client.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      clip: metrics.clip,
    });

    fs.writeFileSync(outPath, Buffer.from(screenshot.data, "base64"));
    fs.writeFileSync(metricsPath, `${JSON.stringify(metrics, null, 2)}\n`);
  } finally {
    if (client) client.close();
    chrome.kill("SIGTERM");
    await wait(500);
    fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
