import { MessageType, sendHearbeat } from "./heartbeat.js";
import { WorkerType } from "./worker-types.js";

const workerTypes = Object.values(WorkerType)
const workerType = workerTypes[Math.floor(Math.random() * workerTypes.length)]


function normalWorker() {
  console.log(
    JSON.stringify({
      type: MessageType.doingTask,
      timestamp: Date.now(),
      workerType: WorkerType.normal
    }),
  );

  sendHearbeat(3000);

  setTimeout(() => {
    process.exit(0);
  }, 3000 * 3);
}

function hungWorker() {
  console.log(
    JSON.stringify({
      type: MessageType.doingTask,
      timestamp: Date.now(),
      workerType: WorkerType.hung
    }),
  );

  const hb = sendHearbeat(3000);

  setTimeout(() => {
    clearInterval(hb);
    console.log(JSON.stringify({
      type: MessageType.heartbeatStopped,
      timestamp: Date.now(),
    }));
    while (true) {}
  }, 5000);
}

function crashWorker() {
  console.log(
    JSON.stringify({
      type: MessageType.doingTask,
      timestamp: Date.now(),
      workerType: WorkerType.crashed
    }),
  );

  sendHearbeat(3000);

  throw Error("boom 💥");
}

function runWorker(){
  switch (workerType) {
    case WorkerType.normal:
      normalWorker()
      break;

    case WorkerType.hung:
      hungWorker()
      break;

    case WorkerType.crashed:
      crashWorker()
      break;
  
    default:
     throw new Error("Invalid Worker Type")
  }
}

runWorker()

export { normalWorker, hungWorker, crashWorker };
