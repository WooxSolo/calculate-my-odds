import { wait } from "./WaitHelpers";

export async function simulationLoop(next: () => boolean) {
    let iterations = 0;
    let lastWaitTime = Date.now();
    let nextCheck = 0;
    while (next()) {
        if (++iterations >= nextCheck) {
            const time = Date.now();
            const elapsedTime = time - lastWaitTime;
            if (elapsedTime >= 10) {
                // Wait to give some time to the message event handler
                // to process incoming messages to the worker
                await wait();
                lastWaitTime = time;
            }
            
            // TODO: Estimate how many iterations until the next check
            // based on how long this check took.
            nextCheck += 1000;
        }
    }
}
