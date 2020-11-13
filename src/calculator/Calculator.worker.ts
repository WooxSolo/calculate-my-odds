import { CalculationMainEventTypes, FinishedCalculationEvent, ReceivedResultCalculationEvent, ReceivedIterationsAtProbabilityCalculationEvent, ReceivedProbabilityAtIterationsCalculationEvent } from "../shared/interfaces/calculator/CalculationMainEvents";
import { CalculationWorkerEvent, CalculationWorkerEventType } from "../shared/interfaces/calculator/CalculationWorkerEvents";
import { Calculator } from "./calculators/Calculator";

const ctx: Worker = self as any;

let currentCalculator: Calculator | undefined;

ctx.onmessage = (event: MessageEvent<CalculationWorkerEvent>) => {
    const data = event.data;
    if (data.type === CalculationWorkerEventType.StartCalculation) {
        if (currentCalculator) {
            currentCalculator.destroy();
        }
        
        currentCalculator = new Calculator(data.calculation,
            data.initialIterationsAtProbability,
            data.initialProbabilityAtIterations,
            () => {
                const message: FinishedCalculationEvent = {
                    type: CalculationMainEventTypes.FinishedCalculation
                };
                ctx.postMessage(message);
            });
        currentCalculator.start();
    }
    else if (data.type === CalculationWorkerEventType.PauseCalculation) {
        currentCalculator?.pause();
    }
    else if (data.type === CalculationWorkerEventType.ResumeCalculation) {
        currentCalculator?.start();
    }
    else if (data.type === CalculationWorkerEventType.CancelCalculation) {
        currentCalculator?.destroy();
        currentCalculator = undefined;
    }
    else if (data.type === CalculationWorkerEventType.RequestDataResult) {
        if (currentCalculator) {
            const result = currentCalculator.getResult(data.maxDataPoints, data.minimumDistance);
            const message: ReceivedResultCalculationEvent = {
                type: CalculationMainEventTypes.ReceivedResult,
                requestId: data.requestId,
                result: result
            };
            ctx.postMessage(message);
        }
    }
    else if (data.type === CalculationWorkerEventType.RequestProbabilityAtIterations) {
        if (currentCalculator) {
            currentCalculator.updateProbabilityAtIterationsTarget(data.iterations);
            const result = currentCalculator.getProbabilityAtIterations();
            const message: ReceivedProbabilityAtIterationsCalculationEvent = {
                type: CalculationMainEventTypes.ReceivedProbabilityAtIterations,
                probability: result
            };
            ctx.postMessage(message);
        }
    }
    else if (data.type === CalculationWorkerEventType.RequestIterationsAtProbability) {
        if (currentCalculator) {
            currentCalculator.updateIterationsAtProbabilityTarget(data.probability);
            const result = currentCalculator.getIterationsAtProbability();
            const message: ReceivedIterationsAtProbabilityCalculationEvent = {
                type: CalculationMainEventTypes.ReceivedIterationsAtProbability,
                iterations: result
            };
            ctx.postMessage(message);
        }
    }
};
