import { DynamicFloat64Array } from "../data-structures/DynamicFloat64Array";

export function getTruncatedDataDynamic(array: DynamicFloat64Array, maxDataPoints: number, threshold?: number) {
    if (maxDataPoints <= 0) {
        return [];
    }
    if (maxDataPoints === 1) {
        // TODO
        throw new Error();
    }
    
    let highIndex = array.length - 1;
    if (threshold !== undefined) {
        while (highIndex > 1 && array.get(highIndex - 1) >= threshold) {
            highIndex--;
        }
    }
    
    return array.getTruncatedArray(maxDataPoints, highIndex);
}
