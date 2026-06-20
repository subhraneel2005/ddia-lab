import { spawn } from "child_process";
import { openSync } from "fs";

console.log(`supervisor pid: ${process.pid}`);

function startWorker() {
  const worker = spawn("node", ["dist/worker.js"], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  console.log("worker/subProccess pid: " + worker.pid);

  worker.stdout?.on("data", (data) => {
    process.stdout.write(`[worker ${worker.pid}] ${data}`);
  });

  worker.stderr?.on("data", (data) => {
    process.stderr.write(`[worker ${worker.pid}] ${data}`);
  });

  worker.on("exit", (code, signal) => {
    if(code !== 0){
      console.log(
        `[worker exited ${worker.pid}]\n[code ${code}]\n[signal ${signal}]`,
      );
      console.log("Restarting worker...\n");
  
      setTimeout(() => {
        startWorker();
      }, 1000);
    }
    else{
      console.log(
        `[worker ${worker.pid}] completed successfully`,
      );
    }
  });

  worker.on("spawn", () => {
    console.log(`[worker ${worker.pid}] started`);
  });

  worker.on("error", (err) => {
    console.log(`failed to spawn worker: ${err}`)
  })
}

startWorker()
