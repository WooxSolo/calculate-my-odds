import CalculationWorker from "worker-loader!../../calculator/Calculator.worker";
import { Calculation } from "../../shared/interfaces/calculator/Calculation";
import { CalculationMainEvent, CalculationMainEventTypes } from "../../shared/interfaces/calculator/CalculationMainEvents";
import { DataCalculationResult } from "../../shared/interfaces/calculator/CalculationResult";
import { CalculationWorkerEventType, CancelCalculationEvent, PauseCalculationEvent, RequestCalculatorIterationsAtProbability, RequestCalculatorProbabilityAtIterations, RequestDataResultCalculationEvent, ResumeCalculationEvent, StartCalculationEvent } from "../../shared/interfaces/calculator/CalculationWorkerEvents";
import { nextUniqueId } from "../helper/IdHelpers";

export interface CalculatorEvents {
    onReceivedResult: (result: DataCalculationResult) => void,
    onReceivedIterationsAtProbability: (successIterations?: number, failureIterations?: number, drawIterations?: number) => void,
    onReceivedProbabilityAtIterations: (successProbability: number, failureProbability: number, drawProbability: number) => void,
    onFinishedCalculation: () => void
}

export class CalculatorHandler {
    private calculationWorker: CalculationWorker;
    private events: CalculatorEvents;
    private awaitingResultId?: number;
    
    constructor(events: CalculatorEvents) {
        this.calculationWorker = new CalculationWorker();
        this.events = events;
        this.setupCalculationWorkerMessageEvent();
    }
    
    private setupCalculationWorkerMessageEvent() {
        this.calculationWorker.onmessage = (e: MessageEvent<CalculationMainEvent>) => {
            const data = e.data;
            if (data.type === CalculationMainEventTypes.ReceivedResult) {
                if (data.requestId === this.awaitingResultId && data.result) {
                    this.events.onReceivedResult(data.result);
                    this.awaitingResultId = undefined;
                }
            }
            else if (data.type === CalculationMainEventTypes.ReceivedIterationsAtProbability) {
                this.events.onReceivedIterationsAtProbability(data.successIterations, data.failureIterations, data.drawIterations);
            }
            else if (data.type === CalculationMainEventTypes.ReceivedProbabilityAtIterations) {
                this.events.onReceivedProbabilityAtIterations(data.successProbability, data.failureProbability, data.drawProbability);
            }
            else if (data.type === CalculationMainEventTypes.FinishedCalculation) {
                this.events.onFinishedCalculation();
            }
        };
    }
    
    public startCalculation(calculation: Calculation, initialIterationsAtProbability: number,
            initialProbabilityAtIterations: number) {
        const worker = this.calculationWorker;
        
        const startMessage: StartCalculationEvent = {
            type: CalculationWorkerEventType.StartCalculation,
            calculation: calculation,
            initialIterationsAtProbability: initialIterationsAtProbability,
            initialProbabilityAtIterations: initialProbabilityAtIterations
        };
        worker.postMessage(startMessage);
    }
    
    public pauseCalculation() {
        this.awaitingResultId = undefined;
        
        const message: PauseCalculationEvent = {
            type: CalculationWorkerEventType.PauseCalculation
        };
        this.calculationWorker.postMessage(message);
    }
    
    public resumeCalculation() {
        const message: ResumeCalculationEvent = {
            type: CalculationWorkerEventType.ResumeCalculation
        };
        this.calculationWorker.postMessage(message);
    }
    
    public isAwaitingResult() {
        return this.awaitingResultId !== undefined;
    }
    
    public requestResult() {
        this.awaitingResultId = nextUniqueId();
        const message: RequestDataResultCalculationEvent = {
            type: CalculationWorkerEventType.RequestDataResult,
            requestId: this.awaitingResultId,
            maxDataPoints: 50,
            threshold: 0.99
        };
        this.calculationWorker.postMessage(message);
    }
    
    public requestIterationsAtProbability(probability: number) {
        const message: RequestCalculatorIterationsAtProbability = {
            type: CalculationWorkerEventType.RequestIterationsAtProbability,
            probability: probability
        };
        this.calculationWorker.postMessage(message);
    }
    
    public requestProbabilityAtIterations(iterations: number) {
        const message: RequestCalculatorProbabilityAtIterations = {
            type: CalculationWorkerEventType.RequestProbabilityAtIterations,
            iterations: iterations
        };
        this.calculationWorker.postMessage(message);
    }
    
    public cancelCalculation() {
        const message: CancelCalculationEvent = {
            type: CalculationWorkerEventType.CancelCalculation
        };
        this.calculationWorker.postMessage(message);
    }
    
    public destroy() {
        this.calculationWorker.terminate();
    }
}
