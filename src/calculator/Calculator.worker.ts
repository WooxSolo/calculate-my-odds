import { CalculationMainEventTypes, ReceivedResultCalculationEvent } from "../shared/interfaces/calculator/CalculationMainEvents";
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
        
        currentCalculator = new Calculator(data.calculation);
        currentCalculator.start();
    }
    else if (data.type === CalculationWorkerEventType.StopCalculation) {
        if (currentCalculator) {
            currentCalculator.pause();
            currentCalculator = undefined;
        }
    }
    else if (data.type === CalculationWorkerEventType.RequestDataResult) {
        if (currentCalculator) {
            const result = currentCalculator.getResult(data.maxDataPoints, data.minimumDistance);
            const message: ReceivedResultCalculationEvent = {
                type: CalculationMainEventTypes.ReceivedResult,
                result: result
            };
            ctx.postMessage(message);
        }
    }
};
