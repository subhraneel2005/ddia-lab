export enum MessageType {
  heartbeat = "heartbeat",
  doingTask = "doing task"
}

export function sendHearbeat(intervalTime: number) {
  setInterval(() => {
    console.log(
      JSON.stringify({
        type: MessageType.heartbeat,
        timestamp: Date.now(),
      }),
    );
  }, intervalTime);
}
