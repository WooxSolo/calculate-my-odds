import { Simulator } from "./simulators/Simulator";
import { SimulationWorkerEvent, SimulationWorkerEventType } from "../shared/interfaces/simulation/SimulationWorkerEvents";
import { ReceivedResultSimulationEvent, SimulationMainEventTypes } from "../shared/interfaces/simulation/SimulationMainEvents";

const ctx: Worker = self as any;

let currentSimulator: Simulator | undefined;

ctx.onmessage = (event: MessageEvent<SimulationWorkerEvent>) => {
    const data = event.data;
    if (data.type === SimulationWorkerEventType.StartSimulation) {
        if (currentSimulator) {
            currentSimulator.destroy();
        }
        
        currentSimulator = new Simulator(data.simulation);
        currentSimulator.start();
    }
    else if (data.type === SimulationWorkerEventType.PauseSimulation) {
        currentSimulator?.pause();
    }
    else if (data.type === SimulationWorkerEventType.ResumeSimulation) {
        currentSimulator?.start();
    }
    else if (data.type === SimulationWorkerEventType.CancelSimulation) {
        currentSimulator?.destroy();
        currentSimulator = undefined;
    }
    else if (data.type === SimulationWorkerEventType.RequestDataResult) {
        if (currentSimulator) {
            const result = currentSimulator.getResult(data.maxDataPoints, data.minimumDistance);
            const message: ReceivedResultSimulationEvent = {
                type: SimulationMainEventTypes.ReceivedResult,
                result: result
            };
            ctx.postMessage(message);
        }
    }
};
