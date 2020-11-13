import { wait } from "../../simulator/helpers/WaitHelpers";

export async function runWorkerLoop(next: () => boolean) {
    const targetTime = 10; // Milliseconds
    
    let currLoopIterations = 0;
    let lastWaitTime = performance.now();
    let nextCheck = 1;
    while (next()) {
        if (++currLoopIterations >= nextCheck) {
            const time = performance.now();
            const elapsedTime = time - lastWaitTime;
            if (elapsedTime >= targetTime) {
                // Wait to give some time to the message event handler
                // to process incoming messages to the worker
                await wait();
                lastWaitTime = time;
                
                const iterationsPerTargetTime = Math.max(1, currLoopIterations / elapsedTime * targetTime);
                currLoopIterations = 0;
                nextCheck = iterationsPerTargetTime;
            }
            else {
                if (elapsedTime < targetTime / 2) {
                    nextCheck *= 2;
                }
                else {
                    nextCheck += Math.max(1, (currLoopIterations / elapsedTime) * (targetTime - elapsedTime));
                }
            }
        }
    }
}
