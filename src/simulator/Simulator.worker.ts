import { ProbabilityGoal } from "../shared/interfaces/Goals";
import { ProbabilityItem } from "../shared/interfaces/Probability";
import { Simulation, SimulationType } from "../shared/interfaces/simulation/Simulation";
import { groupBy } from "lodash";
import { DataSimulator, Simulator } from "./simulators/Simulator";
import { AverageSimulator } from "./simulators/AverageSimulator";
import { CumulativeCompletionSimulator } from "./simulators/CumulativeCompletionSimulator";
import { SimulationWorkerEvent, SimulationWorkerEventType, StartSimulationEvent } from "../shared/interfaces/simulation/SimulationWorkerEvents";
import { ReceivedResultSimulationEvent, SimulationMainEventTypes } from "../shared/interfaces/simulation/SimulationMainEvents";

const ctx: Worker = self as any;

let currentSimulator: Simulator | undefined;

ctx.onmessage = (event: MessageEvent<SimulationWorkerEvent>) => {
    const data = event.data;
    if (data.type === SimulationWorkerEventType.StartSimulation) {
        switch (data.simulationType) {
            case SimulationType.AverageSimulation: {
                currentSimulator = new AverageSimulator(data.simulation);
                break;
            }
            case SimulationType.CumulativeCompletionSimulation: {
                currentSimulator = new CumulativeCompletionSimulator(data.simulation);
                break;
            }
            default: {
                throw new Error("Unknown simulation type");
            }
        }
        
        currentSimulator.start();
    }
    else if (data.type === SimulationWorkerEventType.StopSimulation) {
        if (currentSimulator) {
            currentSimulator.pause();
            currentSimulator = undefined;
        }
    }
    else if (data.type === SimulationWorkerEventType.RequestSimpleResult) {
        if (currentSimulator) {
            const message: ReceivedResultSimulationEvent = {
                type: SimulationMainEventTypes.ReceivedResult,
                result: currentSimulator.getResult()
            };
            ctx.postMessage(message);
        }
    }
    else if (data.type === SimulationWorkerEventType.RequestDataResult) {
        if (currentSimulator) {
            // TODO: Change type cast or something maybe
            const result = (currentSimulator as DataSimulator).getTruncatedResult(data.maxDataPoints, data.minimumDistance);
            const message: ReceivedResultSimulationEvent = {
                type: SimulationMainEventTypes.ReceivedResult,
                result: result
            };
            ctx.postMessage(message);
        }
    }
};
