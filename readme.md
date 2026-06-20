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

## Now Working On

* Heartbeats between worker and supervisor. (Done)
* Detect hung workers, not just crashed workers.
* Restart backoff strategy.
* Multiple workers.
* Worker health checks.
* Supervisor metrics and logging.
