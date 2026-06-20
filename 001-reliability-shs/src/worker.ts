import type { ChildProcessByStdio } from "child_process";
import { MessageType, sendHearbeat } from "./heartbeat.js";
import { Stream } from "stream";

function runWorker() {
  console.log(
    JSON.stringify({
      type: MessageType.doingTask,
      timestamp: Date.now(),
    }),
  );

  if (Math.random() < 0.1) {
    throw Error("boom 💥");
  }

  sendHearbeat(4500);

  setTimeout(() => {
    process.exit(0)
  },4500*4)
}

runWorker();
