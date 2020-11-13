import { getTruncatedArrayItems } from "../../simulator/helpers/ArrayHelpers";
import { DynamicFloat64Array } from "../data-structures/DynamicFloat64Array";

export function getTruncatedDataDynamic(array: DynamicFloat64Array, maxDataPoints: number, minimumDistance?: number) {
    if (maxDataPoints <= 0) {
        return [];
    }
    if (maxDataPoints === 1) {
        // TODO
        throw new Error();
    }
    
    let highIndex = array.length - 1;
    if (minimumDistance !== undefined) {
        while (highIndex > 1 && array.get(highIndex - 1) >= 1 - minimumDistance) {
            highIndex--;
        }
    }
    
    return array.getTruncatedArray(maxDataPoints, highIndex);
}

export function getTruncatedData(array: Float64Array, maxDataPoints: number, minimumDistance?: number) {
    let highIndex = array.length - 1;
    if (minimumDistance !== undefined) {
        while (highIndex > 1 && array[highIndex - 1] >= 1 - minimumDistance) {
            highIndex--;
        }
    }
    
    return getTruncatedArrayItems(array, maxDataPoints, highIndex);
}
