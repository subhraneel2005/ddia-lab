# Experiment 1: Self-Healing Supervisor

A small experiment inspired by **Chapter 1's Reliability portion** of **Designing Data-Intensive Applications (DDIA)** by Martin Kleppmann.

## Goal

Build a simple self-healing system where a supervisor process monitors a worker process and automatically restarts it if it crashes.

The main idea is that faults are expected, so systems should be designed to recover automatically.

## Architecture

```
Supervisor Process
        |
        +---- Worker Process
                |
                +---- Perform task
                +---- Randomly crash
```

The supervisor is intentionally kept simple:

* Spawn a worker.
* Monitor the worker.
* If the worker exits with an error, restart it.
* If the worker completes successfully, do nothing.

The worker simulates a real service:

* Performs a task.
* Has a small probability of crashing.
* Exits normally otherwise.

## What I Learned

### OS Processes

* `node supervisor.js` is an operating system process.
* `spawn("node", ["worker.js"])` creates another OS process.
* Every process has its own PID.
* The worker is a child process of the supervisor.

### Process Supervision

The supervisor listens for:

* `spawn`
* `exit`
* `error`
* `stdout`
* `stderr`

A non-zero exit code is treated as a failure and triggers a restart.

### Reliability Principle

Instead of trying to prevent every failure, a system can be designed to detect failures and recover automatically.

A simple supervisor with very little logic is often more reliable than a complicated one.

## Example Output

```
supervisor pid: 29747

worker/subProcess pid: 29770
[worker 29770] started
[worker 29770] doing task...

Error: boom 💥

[worker exited 29770]
[code 1]
Restarting worker...

worker/subProcess pid: 29793
[worker 29793] started
[worker 29793] doing task...
[worker 29793] completed successfully
```

## Recent Additions

### Worker Types

The worker now randomly picks one of three behaviors at startup:

| Type | Behavior |
|---|---|
| `normal` | Sends heartbeats every 3s, exits cleanly after 9s. |
| `hung` | Sends heartbeats for 5s, then stops and enters an infinite loop. The supervisor detects the missing heartbeats and kills it. |
| `crashed` | Sends a few heartbeats, then throws an error and exits with code 1. |

Worker types are defined in `src/worker-types.ts`.

### Heartbeats

Workers send periodic JSON heartbeat messages on stdout. The supervisor parses these to track liveness:

```
{"type":"heartbeat","timestamp":...}
```

If the supervisor sees no heartbeat for **10 seconds**, it kills the worker (triggering a restart). The hung worker type demonstrates this — it stops heartbeats after 5s and enters an infinite loop, and the supervisor detects the silence and terminates it.

Heartbeat logic lives in `src/heartbeat.ts` (`MessageType` enum, `sendHeartbeat()` helper).

### Retry & Backoff

The supervisor limits restarts to **10 consecutive failures** (`MAX_RETRIES`):

* Waits **1 second** before restarting a crashed worker.
* Resets the retry counter to 0 if the worker ever exits successfully (code 0).
* Stops restarting entirely if the limit is reached.

This prevents infinite restart loops while still recovering from transient failures.

## Now Working On

* Restart backoff strategy (exponential).
* Multiple workers.
* Worker health checks.
* Supervisor metrics and logging.
