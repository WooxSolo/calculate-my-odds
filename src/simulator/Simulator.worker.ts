import { Simulator } from "./simulators/Simulator";
import { SimulationWorkerEvent, SimulationWorkerEventType } from "../shared/interfaces/simulation/SimulationWorkerEvents";
import { ReceivedIterationsAtProbabilityEvent, ReceivedProbabilityAtIterationsEvent, ReceivedResultSimulationEvent, ReceivedSimulationFinishedEvent, SimulationMainEventTypes } from "../shared/interfaces/simulation/SimulationMainEvents";
import { ProbabilityType } from "../shared/interfaces/Probability";

const ctx: Worker = self as any;

let currentSimulator: Simulator | undefined;

ctx.onmessage = (event: MessageEvent<SimulationWorkerEvent>) => {
    const data = event.data;
    if (data.type === SimulationWorkerEventType.StartSimulation) {
        if (currentSimulator) {
            currentSimulator.destroy();
        }
        
        currentSimulator = new Simulator(data.simulation,
            data.initialIterationsAtProbability,
            data.initialProbabilityAtIterations,
            data.simulationRounds,
            () => {
                const message: ReceivedSimulationFinishedEvent = {
                    type: SimulationMainEventTypes.FinishedSimulation
                };
                ctx.postMessage(message);
            });
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
            const result = currentSimulator.getResult(data.maxDataPoints, data.threshold);
            const message: ReceivedResultSimulationEvent = {
                type: SimulationMainEventTypes.ReceivedResult,
                requestId: data.requestId,
                result: result
            };
            ctx.postMessage(message);
        }
    }
    else if (data.type === SimulationWorkerEventType.RequestProbabilityAtIterations) {
        if (currentSimulator) {
            currentSimulator.updateProbabilityAtIterationsTarget(data.iterations);
            const message: ReceivedProbabilityAtIterationsEvent = {
                type: SimulationMainEventTypes.ReceivedProbabilityAtIterations,
                successProbability: currentSimulator.getProbabilityAtIterations(ProbabilityType.Success),
                failureProbability: currentSimulator.getProbabilityAtIterations(ProbabilityType.Failure),
                drawProbability: currentSimulator.getProbabilityAtIterations(ProbabilityType.Draw),
            };
            ctx.postMessage(message);
        }
    }
    else if (data.type === SimulationWorkerEventType.RequestIterationsAtProbability) {
        if (currentSimulator) {
            currentSimulator.updateIterationsAtProbabilityTarget(data.probability);
            const message: ReceivedIterationsAtProbabilityEvent = {
                type: SimulationMainEventTypes.ReceivedIterationsAtProbability,
                successIterations: currentSimulator.getIterationsAtProbability(ProbabilityType.Success),
                failureIterations: currentSimulator.getIterationsAtProbability(ProbabilityType.Failure),
                drawIterations: currentSimulator.getIterationsAtProbability(ProbabilityType.Draw),
            };
            ctx.postMessage(message);
        }
    }
};
