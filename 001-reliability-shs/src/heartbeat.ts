export enum MessageType {
  heartbeat = "heartbeat",
  heartbeatStopped = "heartbeat stopped",
  doingTask = "doing task"
}

export function sendHearbeat(intervalTime: number) {
  return setInterval(() => {
    console.log(
      JSON.stringify({
        type: MessageType.heartbeat,
        timestamp: Date.now(),
      }),
    );
  }, intervalTime);
}
