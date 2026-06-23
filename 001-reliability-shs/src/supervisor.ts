import { spawn } from "child_process";
import { MessageType } from "./heartbeat.js";
import { WorkerType } from "./worker-types.js";

let RETRY_COUNT = 0;
const MAX_RETRIES = 10;

console.log(`supervisor pid: ${process.pid}`);

function startWorker() {
  const worker = spawn("node", ["dist/worker.js"], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  console.log("worker/subProccess pid: " + worker.pid);

  let lastHeartbeat = Date.now();

  worker.stdout?.on("data", (data) => {
    const msg = JSON.parse(data.toString());

    if (msg.type === MessageType.heartbeat) {
      lastHeartbeat = msg.timestamp;
    }
    process.stdout.write(`[worker ${worker.pid}] ${data}`);
  });

  // killUnhealthyWorker
  const hc = setInterval(() => {
    if (Date.now() - lastHeartbeat > 10000) {
      console.log("worker unhealthy. killing worker");
      worker.kill();
      console.log("worker killed");
    }
  }, 1000);

  worker.stderr?.on("data", (data) => {
    process.stderr.write(`[worker ${worker.pid}] ${data}`);
  });

  worker.on("exit", (code, signal) => {
    clearInterval(hc);
    if (code !== 0) {
      console.log(
        `[worker exited ${worker.pid}]\n[code ${code}]\n[signal ${signal}]`,
      );
      console.log("Restarting worker...\n");

      setTimeout(() => {
        if (RETRY_COUNT < MAX_RETRIES) {
          RETRY_COUNT++;
          startWorker();
        }
      }, 1000);
    }
    if (code === 0) {
      RETRY_COUNT = 0;
      console.log(`[worker ${worker.pid}] completed successfully`);
    }
  });

  worker.on("spawn", () => {
    console.log(`[worker ${worker.pid}] started`);
  });

  worker.on("error", (err) => {
    console.log(`failed to spawn worker: ${err}`);
  });
}

startWorker();
