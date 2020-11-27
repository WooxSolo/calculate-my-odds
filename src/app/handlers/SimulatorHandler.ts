import SimulatorWorker from "worker-loader!../../simulator/Simulator.worker";
import { Simulation } from "../../shared/interfaces/simulation/Simulation";
import { SimulationMainEvent, SimulationMainEventTypes } from "../../shared/interfaces/simulation/SimulationMainEvents";
import { DataSimulationResult } from "../../shared/interfaces/simulation/SimulationResult";
import { CancelSimulationEvent, PauseSimulationEvent, RequestDataResultSimulationEvent, RequestIterationsAtProbability, RequestProbabilityAtIterations, ResumeSimulationEvent, SimulationWorkerEventType, StartSimulationEvent } from "../../shared/interfaces/simulation/SimulationWorkerEvents";
import { nextUniqueId } from "../helper/IdHelpers";

export interface SimulatorEvents {
    onReceivedResult: (result: DataSimulationResult) => void,
    onReceivedIterationsAtProbability: (successIterations?: number, failureIterations?: number, drawIterations?: number) => void,
    onReceivedProbabilityAtIterations: (successProbability: number, failureProbability: number, drawProbability: number) => void
}

export class SimulatorHandler {
    private simulationWorker: SimulatorWorker;
    private awaitingResultId?: number;
    private events: SimulatorEvents;
    
    constructor(events: SimulatorEvents) {
        this.simulationWorker = new SimulatorWorker();
        this.events = events;
        this.setupSimulationWorkerMessageEvent();
    }
    
    private setupSimulationWorkerMessageEvent() {
        this.simulationWorker.onmessage = (e: MessageEvent<SimulationMainEvent>) => {
            const data = e.data;
            if (data.type === SimulationMainEventTypes.ReceivedResult) {
                if (data.requestId === this.awaitingResultId && data.result) {
                    this.events.onReceivedResult(data.result);
                    this.awaitingResultId = undefined;
                }
            }
            else if (data.type === SimulationMainEventTypes.ReceivedIterationsAtProbability) {
                this.events.onReceivedIterationsAtProbability(data.successIterations, data.failureIterations, data.drawIterations);
            }
            else if (data.type === SimulationMainEventTypes.ReceivedProbabilityAtIterations) {
                this.events.onReceivedProbabilityAtIterations(data.successProbability, data.failureProbability, data.drawProbability);
            }
        };
    }
    
    public startSimulation(simulation: Simulation, initialIterationsAtProbability: number,
            initialProbabilityAtIterations: number) {
        const worker = this.simulationWorker;
        
        const startMessage: StartSimulationEvent = {
            type: SimulationWorkerEventType.StartSimulation,
            simulation: simulation,
            initialIterationsAtProbability: initialIterationsAtProbability,
            initialProbabilityAtIterations: initialProbabilityAtIterations
        };
        worker.postMessage(startMessage);
    }
    
    public cancelSimulation() {
        const message: CancelSimulationEvent = {
            type: SimulationWorkerEventType.CancelSimulation
        };
        this.simulationWorker.postMessage(message);
    }
    
    public pauseSimulation() {
        this.awaitingResultId = undefined;
        
        const message: PauseSimulationEvent = {
            type: SimulationWorkerEventType.PauseSimulation
        };
        this.simulationWorker.postMessage(message);
    }
    
    public resumeSimulation() {
        const message: ResumeSimulationEvent = {
            type: SimulationWorkerEventType.ResumeSimulation
        };
        this.simulationWorker.postMessage(message);
    }
    
    public isAwaitingResult() {
        return this.awaitingResultId !== undefined;
    }
    
    public requestResult() {
        this.awaitingResultId = nextUniqueId();
        const message: RequestDataResultSimulationEvent = {
            type: SimulationWorkerEventType.RequestDataResult,
            requestId: this.awaitingResultId,
            maxDataPoints: 50,
            threshold: 0.99
        };
        this.simulationWorker.postMessage(message);
    }
    
    public requestIterationsAtProbability(probability: number) {
        const message: RequestIterationsAtProbability = {
            type: SimulationWorkerEventType.RequestIterationsAtProbability,
            probability: probability
        };
        this.simulationWorker.postMessage(message);
    }
    
    public requestProbabilityAtIterations(iterations: number)  {
        const message: RequestProbabilityAtIterations = {
            type: SimulationWorkerEventType.RequestProbabilityAtIterations,
            iterations: iterations
        };
        this.simulationWorker.postMessage(message);
    }
    
    public destroy() {
        this.simulationWorker.terminate();
    }
}
