import { CalculationType } from "../shared/interfaces/calculator/Calculation";
import { CalculationMainEventTypes, ReceivedResultCalculationEvent } from "../shared/interfaces/calculator/CalculationMainEvents";
import { CalculationWorkerEvent, CalculationWorkerEventType, StartCalculationEvent } from "../shared/interfaces/calculator/CalculationWorkerEvents";
import { AverageCalculator } from "./calculators/AverageCalculator";
import { Calculator, DataCalculator } from "./calculators/Calculator";
import { CumulativeCompletionCalculator } from "./calculators/CumulativeCompletionCalculator";

const ctx: Worker = self as any;

let currentCalculator: Calculator | undefined;

ctx.onmessage = (event: MessageEvent<CalculationWorkerEvent>) => {
    const data = event.data;
    if (data.type === CalculationWorkerEventType.StartCalculation) {
        if (currentCalculator) {
            currentCalculator.destroy();
        }
        
        switch (data.calculationType) {
            case CalculationType.Average: {
                currentCalculator = new AverageCalculator(data.calculation);
                break;
            }
            case CalculationType.CumulativeCompletion: {
                currentCalculator = new CumulativeCompletionCalculator(data.calculation);
                break;
            }
            default: {
                throw new Error("Unknown calculation type");
            }
        }
        
        currentCalculator.start();
    }
    else if (data.type === CalculationWorkerEventType.StopCalculation) {
        if (currentCalculator) {
            currentCalculator.pause();
            currentCalculator = undefined;
        }
    }
    else if (data.type === CalculationWorkerEventType.RequestSimpleResult) {
        if (currentCalculator) {
            const message: ReceivedResultCalculationEvent = {
                type: CalculationMainEventTypes.ReceivedResult,
                result: currentCalculator.getResult()
            };
            ctx.postMessage(message);
        }
    }
    else if (data.type === CalculationWorkerEventType.RequestDataResult) {
        if (currentCalculator) {
            // TODO: Change type cast or something maybe
            const result = (currentCalculator as DataCalculator).getTruncatedResult(data.maxDataPoints, data.minimumDistance);
            const message: ReceivedResultCalculationEvent = {
                type: CalculationMainEventTypes.ReceivedResult,
                result: result
            };
            if (Math.random() < 0.01) {
                console.log("curr calculator", currentCalculator);
                console.log("send result", result);
            }
            ctx.postMessage(message);
        }
    }
};
